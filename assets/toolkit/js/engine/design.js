/**
 * design.js — diseño de pares de primers sobre un molde por enumeración y puntuación.
 * Módulo puro.
 *
 * Método (transparente y sustituible):
 *  1. Se enumeran todas las ventanas 5'→3' del molde con longitud en [minLen, maxLen]
 *     como candidatos forward, y las ventanas equivalentes de la hebra complementaria
 *     (complemento inverso) como candidatos reverse.
 *  2. Cada candidato se evalúa con analyzePrimer (Tm NN, GC, homopolímeros, autocomplementariedad,
 *     complementariedad 3', horquilla, GC clamp) y recibe una penalización aditiva.
 *  3. Se combinan los mejores forward × reverse cuyo producto cae en [minProduct, maxProduct];
 *     al par se añaden la diferencia de Tm y la complementariedad cruzada.
 *  4. Se devuelven los N mejores pares con puntuación, estado textual y razones.
 *
 * La puntuación es una heurística de cribado (penalizaciones sumadas) — no una energía libre.
 * Es deliberadamente simple para que Macrogen pueda sustituirla por Primer3 u otro motor
 * sin tocar la UI: la interfaz consume únicamente la estructura devuelta por designPrimers().
 */
import { reverseComplement, validate } from './sequence.js';
import { analyzePrimer, statusFromPenalty, STATUS, analyzeSpecificity, SPEC_DEFAULTS } from './checker.js';
import { crossComplementarity, THRESHOLDS, grade } from './structure.js';

/** Valores por defecto alineados con Primer-BLAST/Primer3 (salvo GC, acotado a 30–70). */
export const DEFAULT_PARAMS = Object.freeze({
  optLen: 20, minLen: 15, maxLen: 25,          // PRIMER_MIN/OPT/MAX_SIZE
  optTm: 60, minTm: 57, maxTm: 63,             // PRIMER_MIN/OPT/MAX_TM
  minGc: 30, maxGc: 70,                        // Primer-BLAST usa 20–80; aquí 30–70 por calidad
  maxHomopolymer: 4,
  maxSelfAny: 8, maxSelfEnd3: 3,               // PRIMER_MAX_SELF_ANY / PRIMER_MAX_SELF_END
  maxPairDiffTm: 3,                            // Max Tm difference
  minProduct: 70, maxProduct: 1000,            // PCR product size
  method: 'nn',
  cond: { primerConc_nM: 50, Na_mM: 50, Mg_mM: 1.5, dNTP_mM: 0.6 },  // preajuste Primer-BLAST
  maxCandidates: 10,                           // # of primers to return
  targetFrom: null, targetTo: null,            // región objetivo (1-based): el amplicón debe flanquearla
  fixedFwd: '', fixedRev: '',                  // «usar mis propios primers»
  spec: { ...SPEC_DEFAULTS }                   // especificidad sobre el molde
});

export const MAX_TEMPLATE_LENGTH = 5000;   // límite de rendimiento en navegador
export const MIN_TEMPLATE_LENGTH = 60;

/**
 * @param {string} template  molde normalizado (A/C/G/T)
 * @param {object} userParams
 * @returns {{ ok: boolean, error?: string, candidates: Array, stats: object, params: object }}
 */
export function designPrimers(template, userParams = {}) {
  const P = {
    ...DEFAULT_PARAMS, ...userParams,
    cond: { ...DEFAULT_PARAMS.cond, ...(userParams.cond || {}) },
    spec: { ...SPEC_DEFAULTS, ...(userParams.spec || {}) }
  };
  const L = template.length;
  if (!/^[ACGT]+$/.test(template)) return fail('El molde contiene bases no canónicas o ambiguas. El diseñador requiere solo A, C, G, T.');
  if (L < MIN_TEMPLATE_LENGTH) return fail(`El molde tiene ${L} pb; se necesitan al menos ${MIN_TEMPLATE_LENGTH} pb para un diseño fiable.`);
  if (L > MAX_TEMPLATE_LENGTH) return fail(`El molde tiene ${L} pb; esta herramienta procesa hasta ${MAX_TEMPLATE_LENGTH} pb. Recorta la región de interés.`);
  if (P.minLen > P.maxLen || P.minTm > P.maxTm || P.minGc > P.maxGc || P.minProduct > P.maxProduct) return fail('Revisa los rangos: cada mínimo debe ser menor o igual que su máximo.');
  const minProduct = Math.max(P.minProduct, P.minLen * 2 + 10);
  const maxProduct = Math.min(P.maxProduct, L);
  if (minProduct > maxProduct) return fail(`El rango de producto (${P.minProduct}–${P.maxProduct} pb) no cabe en un molde de ${L} pb.`);

  // región objetivo: el amplicón debe contenerla y los primers no pueden solaparla
  const hasTarget = P.targetFrom != null && P.targetTo != null && P.targetFrom !== '' && P.targetTo !== '';
  let tFrom = null, tTo = null;
  if (hasTarget) {
    tFrom = Number(P.targetFrom); tTo = Number(P.targetTo);
    if (!Number.isInteger(tFrom) || !Number.isInteger(tTo) || tFrom < 1 || tTo > L || tFrom > tTo) {
      return fail(`Región objetivo no válida: debe ser un rango 1–${L} con inicio ≤ fin.`);
    }
    if (tFrom - 1 < P.minLen || L - tTo < P.minLen) return fail('La región objetivo no deja espacio suficiente a ninguno de los lados para colocar un primer.');
  }

  const analyzeOpts = { method: P.method, cond: P.cond, tmRange: [P.minTm, P.maxTm], gcRange: [P.minGc, P.maxGc], lenRange: [P.minLen, P.maxLen] };
  const rc = reverseComplement(template);
  const anyFixed = !!(P.fixedFwd || P.fixedRev);

  // ---- primers fijos («usar mis propios primers») ----
  let fixedForwards = null, fixedReverses = null;
  if (P.fixedFwd) {
    const chk = prepFixed(P.fixedFwd, 'forward');
    if (chk.error) return fail(chk.error);
    const sites = allIdx(template, chk.seq);
    if (!sites.length) return fail('El primer forward indicado no coincide exactamente con el molde (hebra +). Revisa orientación 5′→3′ o usa el Verificador para localizarlo con mismatches.');
    fixedForwards = sites.slice(0, 3).map(s => ({ seq: chk.seq, len: chk.seq.length, analysis: analyzePrimer(chk.seq, analyzeOpts), soft: 0, start: s, end: s + chk.seq.length, fixed: true }));
  }
  if (P.fixedRev) {
    const chk = prepFixed(P.fixedRev, 'reverse');
    if (chk.error) return fail(chk.error);
    const sites = allIdx(template, reverseComplement(chk.seq));
    if (!sites.length) return fail('El complemento inverso del primer reverse indicado no coincide exactamente con el molde. Revisa orientación 5′→3′.');
    fixedReverses = sites.slice(0, 3).map(s => ({ seq: chk.seq, len: chk.seq.length, analysis: analyzePrimer(chk.seq, analyzeOpts), soft: 0, start: s, end: s + chk.seq.length, fixed: true }));
  }

  // ---- enumeración de candidatos ----
  const forwards = fixedForwards || enumerate(template, P, analyzeOpts, false)
    .filter(f => !hasTarget || f.end <= tFrom - 1);
  const reverses = fixedReverses || enumerate(rc, P, analyzeOpts, true).map(r => ({
    ...r,
    // posición en coordenadas del molde: la ventana [s, s+len) de rc cubre [L−s−len, L−s) del molde
    start: L - r.rcStart - r.len, end: L - r.rcStart
  })).filter(r => !hasTarget || r.start >= tTo);

  // ---- emparejamiento ----
  const topF = forwards.slice(0, 40);
  const topR = reverses.slice(0, 40);
  const siteCache = new Map();
  const pairs = [];
  for (const f of topF) {
    for (const r of topR) {
      const size = r.end - f.start;
      if (size < minProduct || size > maxProduct) { if (!anyFixed) continue; }
      if (r.start < f.end) continue;
      // penalización «dura»: solo criterios que generan una observación visible → decide el estado
      let penalty = f.analysis.penalty + r.analysis.penalty;
      const issues = [];
      if (size < minProduct || size > maxProduct) { penalty += 2; issues.push(`Producto de ${size} pb fuera del rango solicitado (${minProduct}–${maxProduct} pb).`); }
      const tmDiff = Math.abs(f.analysis.tm - r.analysis.tm);
      if (tmDiff > P.maxPairDiffTm && !anyFixed) continue;
      const gT = grade(tmDiff, THRESHOLDS.tmDiff);
      if (gT !== 'good') { penalty += gT === 'review' ? 1.5 : 3; issues.push(`ΔTm entre primers ${tmDiff.toFixed(1)} °C (recomendado ≤ ${THRESHOLDS.tmDiff.good} °C).`); }
      const cross = crossComplementarity(f.seq, r.seq);
      const gA = grade(cross.any, THRESHOLDS.crossAny);
      const gE = grade(cross.end3, THRESHOLDS.crossEnd3);
      if (gE === 'bad' && !anyFixed) continue;
      if (gA !== 'good') { penalty += gA === 'review' ? 1.5 : 3; issues.push(`Complementariedad cruzada ${cross.any} pb (se revisa por encima de ${THRESHOLDS.crossAny.good}).`); }
      if (gE === 'review') { penalty += 2; issues.push(`Complementariedad 3′ cruzada ${cross.end3} pb.`); }
      else if (gE === 'bad') { penalty += 4; issues.push(`Complementariedad 3′ cruzada alta (${cross.end3} pb): riesgo claro de dímero.`); }
      // especificidad sobre el molde (criterio Primer-BLAST, restringido al molde)
      const spec = analyzeSpecificity(f.seq, r.seq, template, P.spec, siteCache);
      if (spec.unintendedTotal > 0) {
        penalty += 3 * Math.min(2, spec.unintendedTotal);
        issues.push(`${spec.unintendedTotal} producto(s) no deseado(s) posibles en el molde (sitios con < ${P.spec.minMM} mismatches o < ${P.spec.minMM3} en el 3′).`);
      }
      // puntuación de ordenación = penalización dura + preferencias blandas (cercanía a Tm/longitud óptimas)
      const score = penalty + f.soft + r.soft + Math.abs(f.analysis.tm - P.optTm) * 0.15 + Math.abs(r.analysis.tm - P.optTm) * 0.15;
      pairs.push({ fwd: f, rev: r, size, tmDiff, cross, spec, penalty, score, issues });
    }
  }
  pairs.sort((a, b) => a.score - b.score);

  // diversidad: evita devolver pares casi idénticos (mismo forward o mismo reverse)
  const chosen = [];
  const usedF = new Set(), usedR = new Set();
  for (const p of pairs) {
    const kf = p.fwd.start, kr = p.rev.end;
    if ((!p.fwd.fixed && usedF.has(kf)) || (!p.rev.fixed && usedR.has(kr))) continue;
    if (!p.fwd.fixed) usedF.add(kf);
    if (!p.rev.fixed) usedR.add(kr);
    chosen.push(p);
    if (chosen.length >= P.maxCandidates) break;
  }

  const candidates = chosen.map((p, i) => ({
    rank: i + 1,
    status: statusFromPenalty(p.penalty),
    penalty: Math.round(p.penalty * 10) / 10,
    score: Math.round(p.score * 100) / 100,
    productSize: p.size,
    tmDiff: Math.round(p.tmDiff * 10) / 10,
    cross: p.cross,
    spec: {
      unintendedTotal: p.spec.unintendedTotal,
      unintended: p.spec.unintended.slice(0, 5),
      fwdSites: p.spec.sites.fwd.length + p.spec.sites.fwdOnMinus.length,
      revSites: p.spec.sites.rev.length + p.spec.sites.revOnPlus.length
    },
    issues: [...p.issues, ...p.fwd.analysis.issues.map(s => 'Fwd: ' + s), ...p.rev.analysis.issues.map(s => 'Rev: ' + s)],
    fwd: describe(p.fwd, 'F'),
    rev: describe(p.rev, 'R')
  }));

  return {
    ok: true,
    candidates,
    params: { ...P, minProduct, maxProduct, targetFrom: hasTarget ? tFrom : null, targetTo: hasTarget ? tTo : null },
    stats: { templateLength: L, forwardWindows: forwards.length, reverseWindows: reverses.length, pairsEvaluated: pairs.length, fixed: anyFixed },
    error: candidates.length ? null : (anyFixed
      ? 'No se encontró pareja válida para el primer fijado. Amplía los rangos de producto o Tm.'
      : 'Ningún par cumple todos los criterios. Amplía los rangos de Tm, GC o tamaño de producto, o desactiva restricciones avanzadas.')
  };

  function fail(msg) { return { ok: false, error: msg, candidates: [], stats: {}, params: P }; }
}

function prepFixed(raw, which) {
  const seq = String(raw).toUpperCase().replace(/[^A-Z]/g, '');
  const v = validate(seq);
  if (!seq.length) return { error: `El primer ${which} indicado está vacío.` };
  if (!v.ok) return { error: `El primer ${which} contiene caracteres no admitidos: ${v.invalid.join(', ')}.` };
  if (v.ambiguousCount) return { error: `El primer ${which} contiene bases ambiguas (${v.ambiguous.join(', ')}); el diseñador necesita A/C/G/T.` };
  if (seq.length < 10) return { error: `El primer ${which} es demasiado corto (${seq.length} nt).` };
  return { seq };
}

function allIdx(hay, needle) {
  const out = []; let i = hay.indexOf(needle);
  while (i !== -1) { out.push(i); i = hay.indexOf(needle, i + 1); }
  return out;
}

function enumerate(strand, P, analyzeOpts, isRc) {
  const out = [];
  const L = strand.length;
  for (let len = P.minLen; len <= P.maxLen; len++) {
    for (let s = 0; s + len <= L; s++) {
      const seq = strand.slice(s, s + len);
      const a = analyzePrimer(seq, analyzeOpts);
      if (a.tm === null) continue;
      if (a.gc < P.minGc || a.gc > P.maxGc) continue;
      if (a.tm < P.minTm || a.tm > P.maxTm) continue;
      if (a.homopolymer > P.maxHomopolymer) continue;
      if (a.self && (a.self.any > P.maxSelfAny || a.self.end3 > P.maxSelfEnd3)) continue;
      const soft = Math.abs(len - P.optLen) * 0.2 + Math.abs(a.tm - P.optTm) * 0.3;
      out.push({ seq, len, analysis: a, soft, start: isRc ? null : s, end: isRc ? null : s + len, rcStart: s });
    }
  }
  out.sort((a, b) => (a.analysis.penalty + a.soft) - (b.analysis.penalty + b.soft));
  return out;
}

function describe(c, tag) {
  const a = c.analysis;
  return {
    seq: c.seq, length: c.len, start: c.start + 1, end: c.end,   // 1-based inclusive en coordenadas del molde
    gc: Math.round(a.gc * 10) / 10, tm: a.tm, mw: a.mw ? Math.round(a.mw * 10) / 10 : null,
    selfAny: a.self ? a.self.any : null, selfEnd3: a.self ? a.self.end3 : null,
    hairpin: a.hairpin, homopolymer: a.homopolymer, diRepeat: a.diRepeat, gcClamp: a.gcClamp,
    fixed: !!c.fixed,
    status: a.status, issues: a.issues, notes: a.notes, tmDetails: a.tmDetails, thermo: a.thermo
  };
}

export { STATUS };
