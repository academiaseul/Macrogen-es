/**
 * checker.js — evaluación de un primer individual y de un par de primers.
 * Módulo puro. Produce datos + razones textuales; la UI solo los presenta.
 */
import { validate, gcContent, molecularWeight, longestHomopolymer, longestDinucleotideRepeat, gcClamp3, reverseComplement } from './sequence.js';
import { meltingTemperature, roundTm } from './thermo.js';
import { selfComplementarity, hairpin, crossComplementarity, THRESHOLDS, grade } from './structure.js';

export const STATUS = Object.freeze({
  OPTIMAL: 'OPTIMAL',
  ACCEPTABLE: 'ACCEPTABLE',
  REVIEW: 'REVIEW',
  NOT_RECOMMENDED: 'NOT_RECOMMENDED'
});

/**
 * Analiza un único primer.
 * @param {string} seq  normalizada y en mayúsculas
 * @param {object} opts { method, cond, tmRange:[min,max], gcRange:[min,max], lenRange:[min,max] }
 */
export function analyzePrimer(seq, opts = {}) {
  const o = {
    method: 'nn', cond: {},
    tmRange: [55, 65], gcRange: [40, 60], lenRange: [18, 30],
    ...opts
  };
  const v = validate(seq);
  const result = {
    seq, length: seq.length, valid: v.ok, invalid: v.invalid, ambiguous: v.ambiguous,
    gc: null, tm: null, tmError: null, mw: null,
    homopolymer: longestHomopolymer(seq),
    diRepeat: longestDinucleotideRepeat(seq),
    gcClamp: gcClamp3(seq),
    self: null, hairpin: null,
    issues: [], notes: [], penalty: 0, status: STATUS.NOT_RECOMMENDED
  };
  if (!v.ok || seq.length === 0) {
    result.issues.push(seq.length === 0 ? 'Secuencia vacía.' : `Caracteres no admitidos: ${v.invalid.join(', ')}.`);
    return result;
  }
  result.gc = gcContent(seq);
  result.mw = molecularWeight(seq);
  const t = meltingTemperature(seq, o.method, o.cond);
  result.tm = roundTm(t.tm);
  result.tmError = t.error || null;
  result.tmDetails = t.details || null;
  result.thermo = t;

  if (v.ambiguous.length === 0) {
    result.self = selfComplementarity(seq);
    result.hairpin = hairpin(seq);
  }

  // ---- penalizaciones y razones (todas visibles en la UI) ----
  let p = 0;
  const [lmin, lmax] = o.lenRange;
  if (seq.length < lmin) { p += 2 + (lmin - seq.length) * 0.5; result.issues.push(`Longitud ${seq.length} nt, por debajo del mínimo (${lmin}).`); }
  else if (seq.length > lmax) { p += 1 + (seq.length - lmax) * 0.25; result.issues.push(`Longitud ${seq.length} nt, por encima del máximo (${lmax}).`); }

  if (result.gc !== null) {
    const [gmin, gmax] = o.gcRange;
    if (result.gc < gmin) { p += 1 + (gmin - result.gc) * 0.1; result.issues.push(`GC ${result.gc.toFixed(0)} %, por debajo del rango (${gmin}–${gmax} %).`); }
    else if (result.gc > gmax) { p += 1 + (result.gc - gmax) * 0.1; result.issues.push(`GC ${result.gc.toFixed(0)} %, por encima del rango (${gmin}–${gmax} %).`); }
  }

  if (result.tm !== null) {
    const [tmin, tmax] = o.tmRange;
    if (result.tm < tmin) { p += 1 + (tmin - result.tm) * 0.4; result.issues.push(`Tm ${result.tm.toFixed(1)} °C, por debajo del rango (${tmin}–${tmax} °C).`); }
    else if (result.tm > tmax) { p += 1 + (result.tm - tmax) * 0.4; result.issues.push(`Tm ${result.tm.toFixed(1)} °C, por encima del rango (${tmin}–${tmax} °C).`); }
  } else if (result.tmError) {
    result.notes.push(result.tmError);
  }

  const hp = result.homopolymer;
  if (hp > THRESHOLDS.homopolymer.review) { p += 2 + (hp - 4); result.issues.push(`Homopolímero de ${hp} bases iguales seguidas (máx. recomendado 4).`); }

  const dr = result.diRepeat;
  const gDr = grade(dr, THRESHOLDS.diRepeat);
  if (gDr === 'review') { p += 1; result.issues.push(`Repetición dinucleotídica de ${dr} unidades (p. ej. AT×${dr}): riesgo de deslizamiento y cebado fuera de registro.`); }
  else if (gDr === 'bad') { p += 2; result.issues.push(`Repetición dinucleotídica larga (${dr} unidades, > ${THRESHOLDS.diRepeat.review}).`); }

  const clamp = result.gcClamp;
  if (clamp < THRESHOLDS.gcClamp.min) { p += 1; result.notes.push('Sin G/C en las últimas 5 bases del 3′ (sin "GC clamp"); la unión del extremo 3′ puede ser débil.'); }
  else if (clamp > THRESHOLDS.gcClamp.max) { p += 1.5; result.issues.push(`${clamp} G/C en las últimas 5 bases del 3′ (máx. recomendado 3): favorece cebado inespecífico.`); }

  if (result.self) {
    const gAny = grade(result.self.any, THRESHOLDS.selfAny);
    if (gAny === 'review') { p += 1.5; result.issues.push(`Autocomplementariedad de ${result.self.any} pb en el mejor alineamiento (se revisa por encima de ${THRESHOLDS.selfAny.good}).`); }
    else if (gAny === 'bad') { p += 3; result.issues.push(`Autocomplementariedad alta: ${result.self.any} pb (> ${THRESHOLDS.selfAny.review}, máximo por defecto de Primer3) — riesgo de dímero consigo mismo.`); }
    const gEnd = grade(result.self.end3, THRESHOLDS.selfEnd3);
    if (gEnd === 'review') { p += 2; result.issues.push(`Complementariedad 3′ de ${result.self.end3} pb: el extremo 3′ podría cebar sobre otra copia del primer.`); }
    else if (gEnd === 'bad') { p += 4; result.issues.push(`Complementariedad 3′ alta (${result.self.end3} pb): riesgo claro de dímero por extensión 3′.`); }
  }
  if (result.hairpin) {
    const gH = grade(result.hairpin.stem, THRESHOLDS.hairpinStem);
    if (gH === 'review') { p += 1.5; result.issues.push(`Posible horquilla con tallo de ${result.hairpin.stem} pb y bucle de ${result.hairpin.loop} nt.`); }
    else if (gH === 'bad') { p += 3; result.issues.push(`Horquilla probable: tallo de ${result.hairpin.stem} pb (≥5).`); }
  }
  if (v.ambiguous.length) result.notes.push(`Bases ambiguas (${v.ambiguous.join(', ')}): Tm y estructura no se calculan con exactitud.`);

  result.penalty = p;
  result.status = statusFromPenalty(p);
  return result;
}

export function statusFromPenalty(p) {
  if (p < 1) return STATUS.OPTIMAL;
  if (p < 3.5) return STATUS.ACCEPTABLE;
  if (p < 7) return STATUS.REVIEW;
  return STATUS.NOT_RECOMMENDED;
}

/**
 * Analiza un par de primers y, opcionalmente, su unión a un molde (búsqueda de coincidencia exacta).
 */
export function analyzePair(fwdSeq, revSeq, opts = {}) {
  const fwd = analyzePrimer(fwdSeq, opts);
  const rev = analyzePrimer(revSeq, opts);
  const pair = { fwd, rev, cross: null, tmDiff: null, product: null, issues: [], notes: [], penalty: 0, status: STATUS.NOT_RECOMMENDED };

  if (!fwd.valid || !rev.valid) {
    pair.issues.push('Corrige las secuencias no válidas para evaluar el par.');
    return pair;
  }
  if (fwd.tm !== null && rev.tm !== null) {
    pair.tmDiff = Math.abs(fwd.tm - rev.tm);
    const g = grade(pair.tmDiff, THRESHOLDS.tmDiff);
    if (g === 'review') { pair.penalty += 1.5; pair.issues.push(`Diferencia de Tm entre primers de ${pair.tmDiff.toFixed(1)} °C (recomendado ≤3 °C).`); }
    else if (g === 'bad') { pair.penalty += 3; pair.issues.push(`Diferencia de Tm de ${pair.tmDiff.toFixed(1)} °C (>5 °C): dificulta elegir una temperatura de anillamiento común.`); }
  }
  if (fwd.ambiguous.length === 0 && rev.ambiguous.length === 0) {
    pair.cross = crossComplementarity(fwdSeq, revSeq);
    const gAny = grade(pair.cross.any, THRESHOLDS.crossAny);
    if (gAny === 'review') { pair.penalty += 1.5; pair.issues.push(`Complementariedad cruzada de ${pair.cross.any} pb entre forward y reverse.`); }
    else if (gAny === 'bad') { pair.penalty += 3; pair.issues.push(`Complementariedad cruzada alta (${pair.cross.any} pb): riesgo de dímero de primers.`); }
    const gEnd = grade(pair.cross.end3, THRESHOLDS.crossEnd3);
    if (gEnd === 'review') { pair.penalty += 2; pair.issues.push(`Complementariedad 3′ cruzada de ${pair.cross.end3} pb.`); }
    else if (gEnd === 'bad') { pair.penalty += 4; pair.issues.push(`Complementariedad 3′ cruzada alta (${pair.cross.end3} pb): riesgo claro de dímero de primers por extensión.`); }
  }

  if (opts.template) {
    pair.product = locateOnTemplate(fwdSeq, revSeq, opts.template);
    if (!pair.product.found) pair.notes.push(pair.product.message);
    if (fwd.ambiguous.length === 0 && rev.ambiguous.length === 0) {
      pair.specificity = analyzeSpecificity(fwdSeq, revSeq, opts.template, opts.spec);
      if (pair.specificity.unintended.length) {
        pair.penalty += 3;
        pair.issues.push(`Especificidad sobre el molde: ${pair.specificity.unintended.length} producto(s) no deseado(s) posibles con sitios de unión de baja discriminación (criterio Primer-BLAST: se descartan sitios con ≥${pair.specificity.params.minMM} mismatches totales y ≥${pair.specificity.params.minMM3} en las últimas ${pair.specificity.params.last} bases 3′).`);
      }
      const extraF = pair.specificity.sites.fwd.filter(s => s.mm === 0).length + pair.specificity.sites.fwdOnMinus.filter(s => s.mm === 0).length - 1;
      const extraR = pair.specificity.sites.rev.filter(s => s.mm === 0).length + pair.specificity.sites.revOnPlus.filter(s => s.mm === 0).length - 1;
      if (extraF > 0) pair.notes.push(`El forward tiene ${extraF} sitio(s) exactos adicionales en el molde.`);
      if (extraR > 0) pair.notes.push(`El reverse tiene ${extraR} sitio(s) exactos adicionales en el molde.`);
    }
  }

  pair.penalty += fwd.penalty + rev.penalty;
  pair.status = statusFromPenalty(pair.penalty);
  return pair;
}

/**
 * Busca sitios de unión por coincidencia exacta: forward tal cual en el molde, reverse como
 * complemento inverso. Devuelve tamaño de producto si ambos se encuentran en orientación correcta.
 */
export function locateOnTemplate(fwdSeq, revSeq, template) {
  const fPos = allIndexes(template, fwdSeq);
  const rRC = reverseComplement(revSeq);
  const rPos = allIndexes(template, rRC);
  if (!fPos.length && !rPos.length) return { found: false, message: 'Ningún primer coincide exactamente con el molde (se busca coincidencia exacta, sin desapareamientos).' };
  if (!fPos.length) return { found: false, message: 'El primer forward no coincide exactamente con el molde.' };
  if (!rPos.length) return { found: false, message: 'El complemento inverso del primer reverse no coincide exactamente con el molde.' };
  const products = [];
  for (const f of fPos) for (const r of rPos) {
    const end = r + rRC.length;
    if (end > f) products.push({ start: f + 1, end, size: end - f });
  }
  if (!products.length) return { found: false, message: 'Ambos primers coinciden, pero no en orientación que produzca un amplicón (reverse aguas arriba del forward).' };
  products.sort((a, b) => a.size - b.size);
  return {
    found: true, products, fwdSites: fPos.length, revSites: rPos.length,
    message: products.length > 1 ? `Se predicen ${products.length} productos posibles (sitios múltiples).` : 'Un único producto predicho.'
  };
}

function allIndexes(hay, needle) {
  const out = [];
  if (!needle) return out;
  let i = hay.indexOf(needle);
  while (i !== -1) { out.push(i); i = hay.indexOf(needle, i + 1); }
  return out;
}

// ---------------------------------------------------------------------------
// Especificidad sobre el molde (estilo Primer-BLAST, restringido al molde dado)
// ---------------------------------------------------------------------------

export const SPEC_DEFAULTS = Object.freeze({
  minMM: 2,      // un sitio no deseado se considera descartado si tiene ≥ minMM mismatches totales…
  minMM3: 2,     // …Y ≥ minMM3 de ellos en las últimas `last` bases del 3′ (criterio por defecto de Primer-BLAST)
  last: 5,
  maxSize: 4000, // ignorar productos no deseados mayores que esto (pb)
  scanMM: 3      // nº máximo de mismatches explorados por sitio (límite de rastreo)
});

/**
 * Busca sitios de hibridación de un primer sobre una hebra dada (alineamiento sin huecos,
 * hasta scanMM mismatches). Devuelve posiciones 0-based sobre esa hebra.
 */
function scanStrand(primer, strand, scanMM) {
  const L = primer.length, N = strand.length, out = [];
  for (let s = 0; s + L <= N; s++) {
    let mm = 0, mm3 = 0;
    for (let k = 0; k < L; k++) {
      if (primer[k] !== strand[s + k]) {
        if (++mm > scanMM) { mm = -1; break; }
        if (k >= L - 5) mm3++;
      }
    }
    if (mm >= 0) out.push({ s, mm, mm3 });
  }
  return out;
}

/**
 * Sitios de unión de un primer en ambas hebras del molde, en coordenadas del molde (1-based).
 *  - `plus`: el primer es idéntico a la hebra + (ceba hacia la derecha →).
 *  - `minus`: el primer hibrida en la hebra + (es idéntico a la hebra −; ceba hacia la izquierda ←).
 */
export function findBindingSites(primer, template, scanMM = SPEC_DEFAULTS.scanMM) {
  const L = primer.length, N = template.length;
  const plus = scanStrand(primer, template, scanMM).map(h => ({ start: h.s + 1, end: h.s + L, mm: h.mm, mm3: h.mm3, dir: '→' }));
  const rc = reverseComplement(template);
  const minus = scanStrand(primer, rc, scanMM).map(h => ({ start: N - (h.s + L) + 1, end: N - h.s, mm: h.mm, mm3: h.mm3, dir: '←' }));
  return { plus, minus };
}

/**
 * Evalúa la especificidad de un par sobre el molde: enumera todos los productos posibles
 * combinando sitios «→» y «←» de ambos primers (incluye F–F y R–R), descarta los sitios que
 * cumplen el criterio de discriminación de Primer-BLAST y separa el producto previsto de los
 * no deseados. Solo analiza el molde proporcionado: la especificidad genómica requiere BLAST.
 */
export function analyzeSpecificity(fwdSeq, revSeq, template, spec = {}, cache = null) {
  const P = { ...SPEC_DEFAULTS, ...spec };
  const get = seq => {
    if (!cache) return findBindingSites(seq, template, P.scanMM);
    if (!cache.has(seq)) cache.set(seq, findBindingSites(seq, template, P.scanMM));
    return cache.get(seq);
  };
  const f = get(fwdSeq);
  const r = get(revSeq);
  const risky = st => !(st.mm >= P.minMM && st.mm3 >= P.minMM3); // sitio que la polimerasa podría usar
  const right = [
    ...f.plus.filter(risky).map(s => ({ ...s, by: 'F' })),
    ...r.plus.filter(risky).map(s => ({ ...s, by: 'R' }))
  ];
  const left = [
    ...f.minus.filter(risky).map(s => ({ ...s, by: 'F' })),
    ...r.minus.filter(risky).map(s => ({ ...s, by: 'R' }))
  ];
  const products = [];
  for (const a of right) for (const b of left) {
    if (b.end <= a.start) continue;
    const size = b.end - a.start + 1;
    if (size > P.maxSize) continue;
    products.push({ start: a.start, end: b.end, size, by: `${a.by}(${a.mm}mm)→ ←${b.by}(${b.mm}mm)`, mmSum: a.mm + b.mm });
  }
  // producto previsto = el F→R perfecto más corto (con sitios múltiples, cualquier otro es artefacto)
  let intendedIdx = -1;
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (p.mmSum === 0 && p.by === 'F(0mm)→ ←R(0mm)' && (intendedIdx < 0 || p.size < products[intendedIdx].size)) intendedIdx = i;
  }
  const intended = intendedIdx >= 0 ? products[intendedIdx] : null;
  const unintended = products.filter((p, i) => i !== intendedIdx).sort((a, b) => a.mmSum - b.mmSum || a.size - b.size);
  return {
    params: P, intended, unintended: unintended.slice(0, 10), unintendedTotal: unintended.length,
    sites: { fwd: f.plus, fwdOnMinus: f.minus, rev: r.minus, revOnPlus: r.plus }
  };
}
