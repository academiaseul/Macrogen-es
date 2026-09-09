/**
 * checker.js (UI) — vista «Verificador de primers».
 */
import { el, fmt, label, numField, statusChip, seqStatusLine, alertBox, emptyState, toast, futureCta, sampleTag, popover, expandable } from './components.js';
import { primerCard, qualityHeader, issuesList } from './results.js';
import { normalize, validate, gcContent, SAMPLE_PRIMERS, SAMPLE_TEMPLATE } from '../engine/sequence.js';
import { analyzePrimer, analyzePair } from '../engine/checker.js';
import { METHODS, DEFAULT_CONDITIONS } from '../engine/thermo.js';
import { THRESHOLDS, grade } from '../engine/structure.js';
import { primersToFasta, copyText, downloadText } from '../engine/export.js';
import { evalClass, evalWord } from './components.js';

const state = {
  fwd: '', rev: '', tpl: '', method: 'nn', cond: { ...DEFAULT_CONDITIONS }, result: null, sample: false,
  // criterios de evaluación (valores por defecto de PCR estándar; configurables en la UI)
  crit: { tmMin: 55, tmMax: 65, lenMin: 18, lenMax: 30, gcMin: 40, gcMax: 60 }
};

export function mount(root) {
  root.innerHTML = '';
  root.append(
    el('div', { class: 'tool-head' },
      el('p', { class: 'eyebrow' }, '02 · Verificador de primers'),
      el('h1', {}, 'Comprobación de primers existentes'),
      el('p', {}, 'Introduce uno o dos primers y evalúa validez, longitud, GC %, Tm, peso molecular, homopolímeros, autocomplementariedad, complementariedad 3′, horquillas y dímero entre ambos. Cada resultado incluye el criterio aplicado y cómo se ha calculado.')
    ),
    el('div', { class: 'tool' }, inputColumn(root), resultsColumn(root))
  );
}
export function unmount() {}

function seqField(id, text, value, optional, rows, popKey, onchange) {
  const ta = el('textarea', { class: 'seq', id, rows, spellcheck: 'false', autocomplete: 'off', placeholder: '5′ → 3′', 'aria-describedby': id + '-status' }, value);
  const st = el('div', { id: id + '-status' });
  const refresh = () => {
    const n = normalize(ta.value); const v = validate(n.sequence);
    st.replaceChildren(seqStatusLine({ length: n.sequence.length, gc: gcContent(n.sequence), invalid: v.invalid, ambiguousCount: v.ambiguousCount, ok: v.ok }));
    ta.setAttribute('aria-invalid', n.sequence.length && !v.ok ? 'true' : 'false');
  };
  ta.addEventListener('input', () => { onchange(ta.value); refresh(); });
  refresh();
  return { node: el('div', { class: 'field' }, label(text, id, popKey, optional), ta, st), ta, refresh };
}

function inputColumn(root) {
  const f = seqField('c-fwd', 'Primer forward (5′→3′)', state.fwd, false, 2, null, v => { state.fwd = v; state.sample = false; });
  const r = seqField('c-rev', 'Primer reverse (5′→3′)', state.rev, true, 2, null, v => { state.rev = v; state.sample = false; });
  const t = seqField('c-tpl', 'Molde para localizar el amplicón', state.tpl, true, 5, 'product', v => { state.tpl = v; });
  t.ta.placeholder = 'Opcional: pega el molde para buscar coincidencia exacta y calcular el tamaño de producto';

  const method = el('select', { class: 'sel', id: 'c-method' }, ...Object.values(METHODS).map(m => el('option', { value: m.id, selected: state.method === m.id }, m.name)));
  const loadSample = () => {
    f.ta.value = SAMPLE_PRIMERS.M13F.seq; r.ta.value = SAMPLE_PRIMERS.M13R.seq; t.ta.value = '';
    state.fwd = f.ta.value; state.rev = r.ta.value; state.tpl = ''; state.sample = true;
    f.refresh(); r.refresh(); t.refresh(); tagHost.replaceChildren(sampleTag(`Ejemplo: ${SAMPLE_PRIMERS.M13F.name} / ${SAMPLE_PRIMERS.M13R.name} (primers universales reales)`));
  };
  const tagHost = el('div', { style: 'margin-top:8px' }, state.sample ? sampleTag(`Ejemplo: ${SAMPLE_PRIMERS.M13F.name} / ${SAMPLE_PRIMERS.M13R.name} (primers universales reales)`) : null);

  const form = el('form', { novalidate: true, onsubmit: e => { e.preventDefault(); run(root, form); } },
    el('section', { class: 'panel' },
      el('div', { class: 'panel-h' }, el('span', { class: 'num' }, '01'), 'Primers'),
      el('div', { class: 'panel-b' }, f.node, r.node,
        el('div', { style: 'display:flex;gap:12px;flex-wrap:wrap;align-items:center' },
          el('button', { type: 'button', class: 'btn-link', onclick: loadSample }, 'Cargar ejemplo (M13F / M13R)'),
          el('button', { type: 'button', class: 'btn-link', onclick: () => { f.ta.value = ''; r.ta.value = ''; t.ta.value = ''; state.fwd = state.rev = state.tpl = ''; state.sample = false; f.refresh(); r.refresh(); t.refresh(); tagHost.replaceChildren(); } }, 'Limpiar')
        ),
        tagHost
      )
    ),
    el('section', { class: 'panel' },
      el('div', { class: 'panel-h' }, el('span', { class: 'num' }, '02'), 'Molde y condiciones'),
      el('div', { class: 'panel-b' }, t.node,
        el('div', { class: 'grid-2' },
          numField('c-na', 'Na⁺ (mM)', state.cond.Na_mM, { min: 1, max: 1000, step: 1 }, 'salt'),
          numField('c-conc', 'Primer (nM)', state.cond.primerConc_nM, { min: 10, max: 5000, step: 10 }, 'conc'),
          numField('c-mg', 'Mg²⁺ (mM)', state.cond.Mg_mM ?? 0, { min: 0, max: 20, step: 0.1 }, 'mg'),
          numField('c-dntp', 'dNTP (mM)', state.cond.dNTP_mM ?? 0, { min: 0, max: 5, step: 0.1 }, 'mg')
        ),
        el('div', { class: 'field', style: 'margin-top:10px' }, label('Método de Tm', 'c-method', 'tm'), method),
        el('details', { class: 'adv' },
          el('summary', {}, 'Criterios de evaluación'),
          el('div', { class: 'adv-b' },
            el('p', { class: 'hint', style: 'margin:8px 0 10px' }, 'Rangos que definen «Bien» en el análisis. Por defecto son los de un primer de PCR estándar; los primers universales de secuenciación (M13, T7, SP6…) suelen ser más cortos y con Tm más baja, y funcionan porque el protocolo de secuenciación anilla a menor temperatura.'),
            critRange('Tm', '°C', 'c-tm', state.crit.tmMin, state.crit.tmMax, { min: 30, max: 90, step: 0.5 }, 'tm'),
            critRange('Longitud', 'nt', 'c-len', state.crit.lenMin, state.crit.lenMax, { min: 8, max: 60, step: 1 }),
            critRange('GC', '%', 'c-gc', state.crit.gcMin, state.crit.gcMax, { min: 0, max: 100, step: 1 }, 'gc'),
            el('div', { style: 'display:flex;gap:12px;flex-wrap:wrap' },
              el('button', { type: 'button', class: 'btn-link', onclick: () => setCrit(form, { tmMin: 55, tmMax: 65, lenMin: 18, lenMax: 30, gcMin: 40, gcMax: 60 }) }, 'Preajuste: PCR estándar'),
              el('button', { type: 'button', class: 'btn-link', onclick: () => setCrit(form, { tmMin: 45, tmMax: 65, lenMin: 16, lenMax: 30, gcMin: 35, gcMax: 65 }) }, 'Preajuste: primer de secuenciación')
            )
          )
        ),
        el('div', { class: 'actions' },
          el('button', { class: 'btn', type: 'submit' }, 'Analizar primers'),
          el('span', { class: 'note' }, 'Cálculo local en tu navegador.')
        )
      )
    )
  );
  return el('div', {}, form);
}

function critRange(text, unit, id, lo, hi, attrs, popKey) {
  return el('div', { class: 'field' },
    el('div', { class: 'label', id: id + '-l' }, `${text} (${unit})`, popKey ? popover(popKey) : null),
    el('div', { class: 'range-pair', role: 'group', 'aria-labelledby': id + '-l' },
      el('input', { class: 'num', type: 'number', id: id + '-min', 'aria-label': `${text} mínimo`, value: lo, ...attrs }),
      el('span', { class: 'dash', 'aria-hidden': 'true' }, '–'),
      el('input', { class: 'num', type: 'number', id: id + '-max', 'aria-label': `${text} máximo`, value: hi, ...attrs })
    )
  );
}

function setCrit(form, c) {
  form.querySelector('#c-tm-min').value = c.tmMin; form.querySelector('#c-tm-max').value = c.tmMax;
  form.querySelector('#c-len-min').value = c.lenMin; form.querySelector('#c-len-max').value = c.lenMax;
  form.querySelector('#c-gc-min').value = c.gcMin; form.querySelector('#c-gc-max').value = c.gcMax;
}

function readCrit(form) {
  const g = id => Number(form.querySelector('#' + id).value);
  return { tmMin: g('c-tm-min'), tmMax: g('c-tm-max'), lenMin: g('c-len-min'), lenMax: g('c-len-max'), gcMin: g('c-gc-min'), gcMax: g('c-gc-max') };
}

function run(root, form) {
  state.method = form.querySelector('#c-method').value;
  state.cond = {
    Na_mM: Number(form.querySelector('#c-na').value), primerConc_nM: Number(form.querySelector('#c-conc').value),
    Mg_mM: Number(form.querySelector('#c-mg').value), dNTP_mM: Number(form.querySelector('#c-dntp').value)
  };
  const host = root.querySelector('#c-results');
  const crit = readCrit(form);
  if (Object.values(crit).some(v => !Number.isFinite(v)) || crit.tmMin > crit.tmMax || crit.lenMin > crit.lenMax || crit.gcMin > crit.gcMax) {
    host.replaceChildren(alertBox('err', 'Criterios incoherentes', 'Revisa los rangos de evaluación: cada mínimo debe ser menor o igual que su máximo y todos los campos deben tener valor.'));
    return;
  }
  state.crit = crit;
  const nf = normalize(state.fwd), nr = normalize(state.rev), nt = normalize(state.tpl);
  if (!nf.sequence.length && !nr.sequence.length) { host.replaceChildren(alertBox('err', 'Faltan secuencias', 'Introduce al menos un primer.')); return; }
  const vt = validate(nt.sequence);
  const opts = {
    method: state.method, cond: state.cond, template: nt.sequence && vt.ok ? nt.sequence : null,
    tmRange: [crit.tmMin, crit.tmMax], lenRange: [crit.lenMin, crit.lenMax], gcRange: [crit.gcMin, crit.gcMax]
  };
  const warnings = [];
  if (nt.sequence && !vt.ok) warnings.push(`El molde contiene caracteres no válidos (${vt.invalid.join(', ')}); no se ha usado para localizar el amplicón.`);
  if (nt.sequence && vt.ok && vt.ambiguousCount) warnings.push('El molde contiene bases ambiguas; la búsqueda de coincidencia exacta puede fallar en esas posiciones.');

  let res;
  if (nf.sequence.length && nr.sequence.length) res = { kind: 'pair', pair: analyzePair(nf.sequence, nr.sequence, opts) };
  else res = { kind: 'single', single: analyzePrimer(nf.sequence || nr.sequence, opts), which: nf.sequence.length ? 'Forward' : 'Reverse' };
  res.warnings = warnings;
  state.result = res;
  mount(root);
  root.querySelector('#c-results')?.focus();
}

function resultsColumn(root) {
  const host = el('div', { id: 'c-results', tabindex: '-1', 'aria-live': 'polite' });
  const r = state.result;
  if (!r) { host.append(el('section', { class: 'panel' }, emptyState('Resultados', 'Introduce uno o dos primers y pulsa «Analizar primers».'))); return host; }
  for (const w of r.warnings) host.append(alertBox('warn', 'Aviso', w));

  if (r.kind === 'single') {
    const a = r.single;
    host.append(el('section', { class: 'panel fade-in' }, qualityHeader(a.status)), el('div', { style: 'margin-top:16px' }, primerCard(a, r.which)), exportBar([{ name: r.which, seq: a.seq, a }]), futureCta());
    return host;
  }

  const p = r.pair;
  const rows = [];
  if (p.tmDiff !== null) rows.push(['Diferencia de Tm', `${fmt(p.tmDiff, 1)} °C`, '≤ 3 °C (aceptable hasta 5)', grade(p.tmDiff, THRESHOLDS.tmDiff)]);
  if (p.cross) {
    rows.push(['Complementariedad cruzada (cualquier posición)', `${p.cross.any} pb`, `≤ ${THRESHOLDS.crossAny.good} pb (máx. ${THRESHOLDS.crossAny.review}, como Primer3)`, grade(p.cross.any, THRESHOLDS.crossAny), 'dimer']);
    rows.push(['Compl. cruzada contigua', `${p.cross.contiguous} pb`, 'Orientativo', null]);
    rows.push(['Complementariedad 3′ cruzada', `${p.cross.end3} pb`, '≤ 2 pb', grade(p.cross.end3, THRESHOLDS.crossEnd3), 'end3']);
  } else rows.push(['Complementariedad cruzada', 'No calculada', 'Requiere ambos primers sin bases ambiguas', null]);
  if (p.product) {
    if (p.product.found) {
      const pr = p.product.products[0];
      rows.push(['Amplicón en el molde', `${pr.size} pb (pos. ${pr.start}–${pr.end})`, p.product.message, p.product.products.length > 1 ? 'review' : 'good', 'product']);
    } else rows.push(['Amplicón en el molde', 'No localizado', p.product.message, 'review', 'product']);
  }
  if (p.specificity) {
    const s = p.specificity;
    const nF = s.sites.fwd.length + s.sites.fwdOnMinus.length;
    const nR = s.sites.rev.length + s.sites.revOnPlus.length;
    rows.push(['Sitios de unión en el molde (≤3 mm, ambas hebras)', `Forward: ${nF} · Reverse: ${nR}`, 'Idealmente 1 sitio exacto por primer', nF === 1 && nR === 1 ? 'good' : 'review', 'specificity']);
    rows.push(['Productos no deseados en el molde', s.unintendedTotal ? `${s.unintendedTotal}: ${s.unintended.slice(0, 3).map(u => `${u.size} pb (${u.start}–${u.end})`).join(' · ')}` : 'Ninguno detectado',
      `Criterio Primer-BLAST: sitio descartado si ≥${s.params.minMM} mm y ≥${s.params.minMM3} en las últimas ${s.params.last} nt 3′`, s.unintendedTotal ? 'bad' : 'good', 'specificity']);
  }

  host.append(
    el('section', { class: 'panel fade-in' },
      qualityHeader(p.status, 'Calidad del par'),
      el('div', { class: 'table-scroll' }, el('table', { class: 'rep' },
        el('thead', {}, el('tr', {}, el('th', {}, 'Parámetro del par'), el('th', {}, 'Valor'), el('th', {}, 'Criterio'), el('th', {}, 'Evaluación'))),
        el('tbody', {}, ...rows.map(([n, v, c, g, pk]) => el('tr', {}, el('td', {}, n, pk ? ' ' : null, pk ? popover(pk) : null), el('td', { class: 'mono' }, v), el('td', {}, el('span', { class: 'crit' }, c)), el('td', { class: evalClass(g) }, evalWord(g)))))
      )),
      el('div', { class: 'panel-b' }, el('div', { class: 'label' }, 'Observaciones del par'), issuesList({ issues: p.issues, notes: p.notes })),
      expandable('¿Qué significa?', el('p', {}, 'La evaluación del par combina las de cada primer con dos criterios propios: que las Tm sean parecidas (para compartir temperatura de anillamiento) y que forward y reverse no sean complementarios entre sí, sobre todo en sus extremos 3′ (dímero de primers).'), el('p', {}, 'Si has pegado un molde, se busca coincidencia exacta del forward y del complemento inverso del reverse para predecir el tamaño del producto. No se buscan uniones con desapareamientos.'))
    ),
    el('div', { style: 'margin-top:16px' }, primerCard(p.fwd, 'Forward')),
    el('div', { style: 'margin-top:16px' }, primerCard(p.rev, 'Reverse')),
    exportBar([{ name: 'Forward', seq: p.fwd.seq, a: p.fwd }, { name: 'Reverse', seq: p.rev.seq, a: p.rev }]),
    futureCta()
  );
  return host;
}

function exportBar(list) {
  const txt = list.map(x => `${x.name}\t${x.seq}\tlen ${x.a.length}\tGC ${fmt(x.a.gc, 1)} %\tTm ${fmt(x.a.tm, 1)} °C\tMW ${fmt(x.a.mw, 1)} g/mol\t${x.a.status}`).join('\n');
  return el('div', { class: 'panel', style: 'margin-top:16px' },
    el('div', { class: 'export', style: 'border-top:0' },
      el('span', { class: 'k' }, 'Exportar'),
      el('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: async () => toast(await copyText(txt) ? 'Resumen copiado' : 'No se pudo copiar') }, 'Copiar resumen'),
      el('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => downloadText('macrogen-primers-verificados.fasta', primersToFasta(list.map(x => ({ name: x.name, desc: `Tm ${x.a.tm} GC ${x.a.gc?.toFixed(1)} ${x.a.status}`, seq: x.seq }))), 'text/plain') }, 'FASTA'),
      el('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => downloadText('macrogen-primers-verificados.json', JSON.stringify({ generated: new Date().toISOString(), prototype: true, method: state.method, cond: state.cond, primers: list.map(x => ({ name: x.name, ...x.a })) }, (k, v) => k === 'thermo' ? undefined : v, 2), 'application/json') }, 'JSON')
    )
  );
}
