/**
 * results.js — presentación de los resultados del motor (primer individual, par, detalles de cálculo).
 * No calcula nada: solo formatea lo que devuelve js/engine.
 */
import { el, fmt, statusChip, seqLine, metric, expandable, evalClass, evalWord, popover } from './components.js';
import { QUALITY_WORD, QUALITY_WHY } from './strings.js';
import { METHODS } from '../engine/thermo.js';
import { THRESHOLDS, grade } from '../engine/structure.js';

/** Cabecera de calidad «CALIDAD DEL PRIMER / Buena» con motivo. */
export function qualityHeader(status, labelText = 'Calidad del primer') {
  return el('div', { class: 'quality' },
    el('div', { class: 'k' }, labelText),
    el('div', { class: 'v' }, QUALITY_WORD[status] || '—', statusChip(status)),
    el('p', { class: 'why' }, QUALITY_WHY[status] || '')
  );
}

/** Tira de métricas principales de un primer. */
export function primerMetrics(a) {
  return el('div', { class: 'metrics' },
    metric('Longitud', String(a.length), 'nt'),
    metric('GC', a.gc === null ? '—' : fmt(a.gc, 1), '%', null, 'gc'),
    metric('Tm', a.tm === null ? '—' : fmt(a.tm, 1), '°C', a.tmDetails ? METHODS[a.tmDetails.method].short : null, 'tm'),
    metric('Peso molecular', a.mw === null ? '—' : fmt(a.mw, 1), 'g/mol', null, 'mw')
  );
}

/** Tabla de análisis detallado de un primer: valor · criterio · evaluación. */
export function analysisTable(a) {
  const rows = [];
  const push = (name, value, crit, g, popKey) => rows.push({ name, value, crit, g, popKey });

  push('Validez', a.valid ? (a.ambiguous.length ? `Válida · ambiguas: ${a.ambiguous.join(', ')}` : 'Válida (A/C/G/T)') : `No válida: ${a.invalid.join(', ')}`,
    'Solo A, C, G, T; códigos IUPAC admitidos pero limitan el cálculo', a.valid ? (a.ambiguous.length ? 'review' : 'good') : 'bad');
  push('Longitud', `${a.length} nt`, '18–30 nt (recomendado 18–25)', a.length >= 18 && a.length <= 30 ? 'good' : a.length >= 15 && a.length <= 35 ? 'review' : 'bad');
  push('GC %', a.gc === null ? '—' : `${fmt(a.gc, 1)} %`, '40–60 %', a.gc === null ? null : (a.gc >= 40 && a.gc <= 60 ? 'good' : a.gc >= 35 && a.gc <= 65 ? 'review' : 'bad'), 'gc');
  push('Tm', a.tm === null ? (a.tmError || '—') : `${fmt(a.tm, 1)} °C`, a.tmDetails ? `${METHODS[a.tmDetails.method].short}; 55–65 °C` : '55–65 °C', a.tm === null ? null : (a.tm >= 55 && a.tm <= 65 ? 'good' : a.tm >= 50 && a.tm <= 70 ? 'review' : 'bad'), 'tm');
  push('Peso molecular', a.mw === null ? '—' : `${fmt(a.mw, 1)} g/mol`, 'Fórmula IDT, ssDNA anhidro sin modificar', a.mw === null ? null : 'good', 'mw');
  push('Homopolímero más largo', `${a.homopolymer} nt`, '≤ 4 bases iguales seguidas', grade(a.homopolymer, THRESHOLDS.homopolymer), 'homopolymer');
  if (a.diRepeat !== undefined && a.diRepeat !== null) push('Repetición dinucleotídica', `${a.diRepeat} unidades`, `≤ ${THRESHOLDS.diRepeat.good} unidades (AT×n, CA×n…)`, grade(a.diRepeat, THRESHOLDS.diRepeat), 'direpeat');
  push('GC clamp (últimas 5 nt del 3′)', `${a.gcClamp} G/C`, '1–3 G/C', a.gcClamp >= 1 && a.gcClamp <= 3 ? 'good' : a.gcClamp === 0 ? 'review' : 'bad', 'clamp');
  if (a.self) {
    push('Autocomplementariedad (cualquier posición)', `${a.self.any} pb`, `≤ ${THRESHOLDS.selfAny.good} pb en el mejor alineamiento sin huecos (máx. ${THRESHOLDS.selfAny.review}, como Primer3)`, grade(a.self.any, THRESHOLDS.selfAny), 'self');
    push('Complementariedad 3′ (consigo mismo)', `${a.self.end3} pb`, '≤ 2 pb contiguas desde el extremo 3′', grade(a.self.end3, THRESHOLDS.selfEnd3), 'end3');
  } else {
    push('Autocomplementariedad', 'No calculada', 'Requiere secuencia sin bases ambiguas', null, 'self');
  }
  if (a.hairpin !== undefined) {
    const h = a.hairpin;
    push('Horquilla', h ? `Tallo ${h.stem} pb · bucle ${h.loop} nt · desde pos. ${h.position}` : 'No detectada (tallo < 3 pb)', 'Tallo ≤ 3 pb', h ? grade(h.stem, THRESHOLDS.hairpinStem) : (a.self ? 'good' : null), 'hairpin');
  }

  return el('div', { class: 'table-scroll' },
    el('table', { class: 'rep' },
      el('thead', {}, el('tr', {}, el('th', {}, 'Parámetro'), el('th', {}, 'Valor'), el('th', {}, 'Criterio'), el('th', {}, 'Evaluación'))),
      el('tbody', {}, ...rows.map(r => el('tr', {},
        el('td', {}, r.name, r.popKey ? ' ' : null, r.popKey ? popover(r.popKey) : null),
        el('td', { class: 'mono' }, r.value),
        el('td', {}, el('span', { class: 'crit' }, r.crit)),
        el('td', { class: evalClass(r.g) }, evalWord(r.g))
      )))
    )
  );
}

/** Lista de observaciones (problemas + notas). */
export function issuesList(a) {
  const items = [...(a.issues || []).map(s => el('li', {}, s)), ...(a.notes || []).map(s => el('li', { class: 'note' }, s))];
  if (!items.length) return el('ul', { class: 'issues none' }, el('li', {}, 'Sin observaciones: dentro de todos los criterios de cribado.'));
  return el('ul', { class: 'issues' }, ...items);
}

/** «Detalles del cálculo» para un primer (Tm, MW, cribados). */
export function calcDetails(a) {
  const parts = [];
  const t = a.thermo;
  if (t && t.details) {
    const m = METHODS[t.details.method];
    if (t.details.method === 'nn') {
      parts.push(el('p', {}, el('b', {}, 'Tm — '), m.name, '. ', el('span', { class: 'mono' }, m.reference)));
      parts.push(el('div', { class: 'calc' },
        `ΔH  = ${t.dH.toFixed(1)} kcal/mol      (suma de ${t.details.steps} pasos NN + iniciación${t.symmetric ? ' + simetría' : ''})\n` +
        `ΔS  = ${t.dS.toFixed(1)} cal/(K·mol)   (a 1 M Na⁺)\n` +
        `${t.details.saltFormula}\n` +
        `Na⁺eq = ${t.details.Na_mM} + 120·√(${t.details.Mg_mM} − ${t.details.dNTP_mM}) = ${t.details.NaEq_mM} mM   (von Ahsen 2001)\n` +
        `ΔS' = ${t.dS_salt.toFixed(1)} cal/(K·mol)\n` +
        `${t.details.formula}\n` +
        `C   = ${t.details.primerConc_nM} nM · R = 1.987 cal/(K·mol)\n` +
        `Tm  = ${t.tm.toFixed(2)} °C  →  se muestra ${fmt(a.tm, 1)} °C (1 decimal: la incertidumbre del modelo es ≥ ±1 °C)`
      ));
    } else if (t.details.method === 'wallace') {
      parts.push(el('p', {}, el('b', {}, 'Tm — '), m.name, '. ', el('span', { class: 'mono' }, m.reference)));
      parts.push(el('div', { class: 'calc' }, `${t.details.formula}\nA+T = ${t.details.at} · G+C = ${t.details.gc}\nTm = 2·${t.details.at} + 4·${t.details.gc} = ${t.tm} °C`));
    } else {
      parts.push(el('p', {}, el('b', {}, 'Tm — '), m.name, '. ', el('span', { class: 'mono' }, m.reference)));
      parts.push(el('div', { class: 'calc' }, `${t.details.formula}\nG+C = ${t.details.gc} · N = ${t.details.N}\nTm = ${t.tm.toFixed(2)} °C`));
    }
    parts.push(el('ul', { class: 'assump' }, ...m.assumptions.map(s => el('li', {}, s))));
  } else if (a.tmError) {
    parts.push(el('p', {}, el('b', {}, 'Tm — '), a.tmError));
  }
  if (a.mw !== null && a.mw !== undefined) {
    const c = countBases(a.seq);
    parts.push(el('p', {}, el('b', {}, 'Peso molecular — '), 'fórmula de IDT para ssDNA anhidro, 5′-OH, sin modificaciones:'));
    parts.push(el('div', { class: 'calc' }, `MW = A·313.21 + T·304.20 + C·289.18 + G·329.21 − 61.96\n   = ${c.A}·313.21 + ${c.T}·304.20 + ${c.C}·289.18 + ${c.G}·329.21 − 61.96\n   = ${a.mw.toFixed(2)} g/mol`));
  }
  parts.push(el('p', {}, el('b', {}, 'Cribados de estructura — '), 'alineamientos antiparalelos sin huecos que cuentan pares complementarios (estilo Primer3 «self any» / «self end»). No son cálculos de ΔG; los umbrales (', el('span', { class: 'mono' }, 'js/engine/structure.js · THRESHOLDS'), ') son criterios orientativos de la herramienta.'));
  return parts;
}

function countBases(seq) { const c = { A: 0, C: 0, G: 0, T: 0 }; for (const ch of seq) if (ch in c) c[ch]++; return c; }

/** Tarjeta completa de un primer: nombre, secuencia, métricas, observaciones y detalles. */
export function primerCard(a, title, opts = {}) {
  return el('section', { class: 'panel fade-in', 'aria-label': title },
    el('div', { class: 'panel-h' }, el('span', { class: 'num' }, title), statusChip(a.status), opts.right ? el('span', { class: 'right' }, opts.right) : null),
    el('div', { class: 'panel-b' }, seqLine(a.seq, { highlight3: true }), el('p', { class: 'hint' }, 'Las últimas 5 bases del 3′ aparecen subrayadas (región del «GC clamp»).')),
    primerMetrics(a),
    el('div', { class: 'panel-b' }, el('div', { class: 'label' }, 'Observaciones'), issuesList(a)),
    expandable('¿Qué significa?', el('p', {}, QUALITY_WHY[a.status]), el('p', {}, 'Cada fila de «Análisis detallado» muestra el valor medido, el criterio de referencia y la evaluación. Los estados son textuales (Bien / Revisar / No recomendado) y nunca dependen solo del color.')),
    expandable('Análisis detallado', analysisTable(a)),
    expandable('Detalles del cálculo', ...calcDetails(a))
  );
}

/** Mapa SVG sencillo del amplicón sobre el molde. */
export function ampliconMap(templateLength, fwd, rev) {
  const W = 1000, H = 44;
  const x = p => Math.round((p / templateLength) * W);
  const svg = `
<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Posición del amplicón: forward ${fwd.start}–${fwd.end}, reverse ${rev.start}–${rev.end} sobre un molde de ${templateLength} pb">
  <line x1="0" y1="22" x2="${W}" y2="22" stroke="#B9C4D2" stroke-width="2"/>
  <rect x="${x(fwd.start - 1)}" y="8" width="${Math.max(4, x(fwd.end) - x(fwd.start - 1))}" height="28" fill="#001E62"/>
  <rect x="${x(fwd.end)}" y="18" width="${Math.max(2, x(rev.start - 1) - x(fwd.end))}" height="8" fill="#00BFB2" opacity=".55"/>
  <rect x="${x(rev.start - 1)}" y="8" width="${Math.max(4, x(rev.end) - x(rev.start - 1))}" height="28" fill="#007368"/>
</svg>`;
  return el('div', { class: 'map' },
    el('div', { class: 'k' }, `Mapa del amplicón · molde ${templateLength} pb`),
    el('div', { html: svg }),
    el('div', { class: 'legend' }, el('span', {}, `▮ Forward ${fwd.start}–${fwd.end}`), el('span', {}, `▮ Reverse ${rev.start}–${rev.end}`), el('span', {}, `Producto ${rev.end - fwd.start + 1} pb`))
  );
}
