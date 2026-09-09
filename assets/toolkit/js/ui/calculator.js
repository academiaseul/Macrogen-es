/**
 * calculator.js (UI) — vista «Calculadora Tm / GC».
 * Calcula en vivo (con retardo corto) y también con el botón, para que el usuario vea
 * explícitamente qué método y condiciones se han usado.
 */
import { el, fmt, label, numField, seqStatusLine, alertBox, emptyState, toast, sampleTag, metric, expandable, popover } from './components.js';
import { normalize, validate, gcContent, molecularWeight, counts, reverseComplement, SAMPLE_PRIMERS } from '../engine/sequence.js';
import { meltingTemperature, roundTm, METHODS, DEFAULT_CONDITIONS, CONDITION_PRESETS } from '../engine/thermo.js';
import { copyText } from '../engine/export.js';

const state = { raw: '', method: 'nn', cond: { ...DEFAULT_CONDITIONS }, sample: false };
let timer = null;

export function mount(root) {
  root.innerHTML = '';
  root.append(
    el('div', { class: 'tool-head' },
      el('p', { class: 'eyebrow' }, '03 · Calculadora Tm / GC'),
      el('h1', {}, 'Propiedades de un oligonucleótido'),
      el('p', {}, 'Longitud, composición, GC %, temperatura de fusión por tres métodos publicados y peso molecular. La Tm se muestra siempre junto al método y las condiciones con que se ha calculado.')
    ),
    el('div', { class: 'tool' }, inputColumn(root), el('div', { id: 'k-results', tabindex: '-1', 'aria-live': 'polite' }))
  );
  render(root);
}
export function unmount() { clearTimeout(timer); }

function inputColumn(root) {
  const ta = el('textarea', { class: 'seq', id: 'k-seq', rows: 4, spellcheck: 'false', autocomplete: 'off', placeholder: '5′ → 3′  p. ej. TAATACGACTCACTATAGGG', 'aria-describedby': 'k-seq-status' }, state.raw);
  const st = el('div', { id: 'k-seq-status' });
  const tag = el('div', { style: 'margin-top:8px;display:flex;gap:12px;align-items:center;flex-wrap:wrap' });
  const refresh = () => {
    const n = normalize(ta.value); const v = validate(n.sequence);
    st.replaceChildren(seqStatusLine({ length: n.sequence.length, gc: gcContent(n.sequence), invalid: v.invalid, ambiguousCount: v.ambiguousCount, ok: v.ok }));
    ta.setAttribute('aria-invalid', n.sequence.length && !v.ok ? 'true' : 'false');
    tag.replaceChildren(
      el('button', { type: 'button', class: 'btn-link', onclick: () => { ta.value = SAMPLE_PRIMERS.T7.seq; state.raw = ta.value; state.sample = true; refresh(); render(root); } }, `Cargar ejemplo (${SAMPLE_PRIMERS.T7.name})`),
      state.sample && ta.value.trim().toUpperCase() === SAMPLE_PRIMERS.T7.seq ? sampleTag('Ejemplo: primer universal real') : null,
      ta.value ? el('button', { type: 'button', class: 'btn-link', onclick: () => { ta.value = ''; state.raw = ''; state.sample = false; refresh(); render(root); } }, 'Limpiar') : null
    );
  };
  ta.addEventListener('input', () => { state.raw = ta.value; state.sample = false; refresh(); clearTimeout(timer); timer = setTimeout(() => render(root), 250); });
  refresh();

  const method = el('select', { class: 'sel', id: 'k-method', onchange: e => { state.method = e.target.value; render(root); } }, ...Object.values(METHODS).map(m => el('option', { value: m.id, selected: state.method === m.id }, m.name)));
  const na = numField('k-na', 'Na⁺ (mM)', state.cond.Na_mM, { min: 1, max: 1000, step: 1 }, 'salt');
  const conc = numField('k-conc', 'Primer (nM)', state.cond.primerConc_nM, { min: 10, max: 5000, step: 10 }, 'conc');
  const mg = numField('k-mg', 'Mg²⁺ (mM)', state.cond.Mg_mM ?? 0, { min: 0, max: 20, step: 0.1 }, 'mg');
  const dntp = numField('k-dntp', 'dNTP (mM)', state.cond.dNTP_mM ?? 0, { min: 0, max: 5, step: 0.1 }, 'mg');
  const readCond = () => {
    state.cond = {
      Na_mM: Number(na.querySelector('input').value), primerConc_nM: Number(conc.querySelector('input').value),
      Mg_mM: Number(mg.querySelector('input').value), dNTP_mM: Number(dntp.querySelector('input').value)
    };
  };
  for (const f of [na, conc, mg, dntp]) f.querySelector('input').addEventListener('input', () => { readCond(); render(root); });
  const preset = el('div', { class: 'field' },
    el('select', { class: 'sel', id: 'k-preset', 'aria-label': 'Preajuste de condiciones', onchange: e => {
      const p = CONDITION_PRESETS[e.target.value];
      if (!p) return;
      na.querySelector('input').value = p.cond.Na_mM; conc.querySelector('input').value = p.cond.primerConc_nM;
      mg.querySelector('input').value = p.cond.Mg_mM; dntp.querySelector('input').value = p.cond.dNTP_mM;
      readCond(); render(root);
    } },
      el('option', { value: 'custom' }, 'Preajuste de condiciones…'),
      ...Object.values(CONDITION_PRESETS).map(p => el('option', { value: p.id }, p.name))
    )
  );

  return el('div', {},
    el('form', { novalidate: true, onsubmit: e => { e.preventDefault(); readCond(); render(root); root.querySelector('#k-results')?.focus(); } },
      el('section', { class: 'panel' },
        el('div', { class: 'panel-h' }, el('span', { class: 'num' }, '01'), 'Secuencia'),
        el('div', { class: 'panel-b' }, el('div', { class: 'field' }, label('Oligonucleótido (5′→3′)', 'k-seq'), ta, st, tag))
      ),
      el('section', { class: 'panel' },
        el('div', { class: 'panel-h' }, el('span', { class: 'num' }, '02'), 'Método y condiciones'),
        el('div', { class: 'panel-b' },
          el('div', { class: 'field' }, label('Método de Tm', 'k-method', 'tm'), method),
          preset,
          el('div', { class: 'grid-2' }, na, conc, mg, dntp),
          el('p', { class: 'hint' }, 'Las condiciones solo afectan al método de vecino más cercano (Mg²⁺/dNTP vía Na⁺ equivalente, von Ahsen 2001). Wallace y la fórmula por composición no las usan.'),
          el('div', { class: 'actions' }, el('button', { class: 'btn', type: 'submit' }, 'Calcular'), el('span', { class: 'note' }, 'Se recalcula también al escribir.'))
        )
      )
    )
  );
}

function render(root) {
  const host = root.querySelector('#k-results');
  if (!host) return;
  const n = normalize(state.raw);
  const v = validate(n.sequence);
  if (!n.sequence.length) { host.replaceChildren(el('section', { class: 'panel' }, emptyState('Resultados', 'Escribe o pega un oligonucleótido para ver sus propiedades.'))); return; }
  if (!v.ok) { host.replaceChildren(alertBox('err', 'Secuencia no válida', `Caracteres no admitidos: ${v.invalid.join(', ')}. Solo se aceptan A, C, G, T y códigos IUPAC de ambigüedad.`)); return; }

  const seq = n.sequence;
  const c = counts(seq);
  const gc = gcContent(seq);
  const mw = molecularWeight(seq);
  const t = meltingTemperature(seq, state.method, state.cond);
  const tm = roundTm(t.tm);
  const all = ['nn', 'wallace', 'basic'].map(m => ({ m, r: meltingTemperature(seq, m, state.cond) }));
  const M = METHODS[state.method];

  const countsTable = el('table', { class: 'rep' },
    el('thead', {}, el('tr', {}, el('th', {}, 'Base'), el('th', { class: 'num' }, 'Recuento'), el('th', { class: 'num' }, '%'))),
    el('tbody', {}, ...['A', 'T', 'G', 'C'].map(b => el('tr', {}, el('td', { class: 'mono' }, b), el('td', { class: 'num' }, String(c[b])), el('td', { class: 'num' }, fmt(100 * c[b] / seq.length, 1)))),
      c.other ? el('tr', {}, el('td', { class: 'mono' }, 'Ambiguas'), el('td', { class: 'num' }, String(c.other)), el('td', { class: 'num' }, fmt(100 * c.other / seq.length, 1))) : null)
  );

  const cmp = el('table', { class: 'rep' },
    el('thead', {}, el('tr', {}, el('th', {}, 'Método'), el('th', { class: 'num' }, 'Tm (°C)'), el('th', {}, 'Referencia'))),
    el('tbody', {}, ...all.map(({ m, r }) => el('tr', { style: m === state.method ? 'font-weight:600' : '' },
      el('td', {}, METHODS[m].name, m === state.method ? ' (seleccionado)' : ''),
      el('td', { class: 'num' }, r.tm === null ? '—' : fmt(r.tm, 1)),
      el('td', {}, el('span', { class: 'crit' }, r.tm === null ? r.error : METHODS[m].reference))
    )))
  );

  const summary = `Secuencia ${seq}\nLongitud ${seq.length} nt · GC ${fmt(gc, 1)} % · Tm ${tm === null ? '—' : fmt(tm, 1) + ' °C'} (${M.short}${state.method === 'nn' ? `, Na+ ${state.cond.Na_mM} mM, ${state.cond.primerConc_nM} nM` : ''}) · MW ${mw === null ? '—' : fmt(mw, 1) + ' g/mol'}\nA ${c.A} · T ${c.T} · G ${c.G} · C ${c.C}\nMacrogen · macrogen-es.com/recursos/herramientas-primers`;

  host.replaceChildren(
    el('section', { class: 'panel fade-in' },
      el('div', { class: 'panel-h' }, el('span', { class: 'num' }, '03'), 'Resultados', el('span', { class: 'right' }, state.sample && seq === SAMPLE_PRIMERS.T7.seq ? sampleTag('Ejemplo') : null)),
      el('div', { class: 'panel-b' },
        el('div', { class: 'seqline' }, el('span', { class: 'dir' }, '5′'), el('span', { class: 's mono' }, seq), el('span', { class: 'dir' }, '3′')),
        el('div', { class: 'seqline', style: 'padding-top:0' }, el('span', { class: 'dir' }, '3′'), el('span', { class: 's mono', style: 'color:var(--mc-mute)' }, reverseComplement(seq).split('').reverse().join('')), el('span', { class: 'dir' }, '5′ (complementaria)'))
      ),
      el('div', { class: 'metrics' },
        metric('Longitud', String(seq.length), 'nt'),
        metric('GC', gc === null ? '—' : fmt(gc, 1), '%', null, 'gc'),
        metric('Tm', tm === null ? '—' : fmt(tm, 1), '°C', M.short, 'tm'),
        metric('Peso molecular', mw === null ? '—' : fmt(mw, 1), 'g/mol', mw === null ? 'requiere A/C/G/T' : 'ssDNA anhidro', 'mw')
      ),
      t.error ? el('div', { class: 'panel-b' }, alertBox('warn', 'Tm no calculada', t.error)) : null,
      el('div', { class: 'panel-b' },
        el('div', { class: 'label' }, 'Condiciones aplicadas'),
        el('dl', { class: 'kv' },
          el('dt', {}, 'Método'), el('dd', {}, M.name, ' — ', el('span', { class: 'mono' }, M.reference)),
          el('dt', {}, 'Na⁺'), el('dd', {}, state.method === 'nn' ? `${state.cond.Na_mM} mM` : 'no aplica'),
          el('dt', {}, 'Mg²⁺ / dNTP'), el('dd', {}, state.method === 'nn' ? `${state.cond.Mg_mM ?? 0} mM / ${state.cond.dNTP_mM ?? 0} mM${t.details && t.details.NaEq_mM !== undefined ? ` → Na⁺eq ${t.details.NaEq_mM} mM` : ''}` : 'no aplica'),
          el('dt', {}, 'Primer'), el('dd', {}, state.method === 'nn' ? `${state.cond.primerConc_nM} nM` : 'no aplica'),
          el('dt', {}, 'Supuestos'), el('dd', {}, el('ul', { class: 'assump', style: 'margin-top:0' }, ...M.assumptions.map(s => el('li', {}, s))))
        ),
        alertBox('', 'La Tm depende de las condiciones', 'El valor calculado es una estimación para las condiciones indicadas. En un PCR real intervienen Mg²⁺, dNTPs, aditivos y la concentración de molde; distintos programas dan valores distintos para el mismo oligo porque usan métodos o parámetros diferentes. Compara siempre métodos y condiciones, no solo la cifra.')
      ),
      el('div', { class: 'table-scroll' }, el('div', { class: 'panel-b', style: 'padding-bottom:0' }, el('div', { class: 'label' }, 'Composición')), countsTable),
      el('div', { class: 'table-scroll' }, el('div', { class: 'panel-b', style: 'padding-bottom:0' }, el('div', { class: 'label' }, 'Comparación de métodos', popover('tm'))), cmp),
      expandable('Detalles del cálculo', ...calcDetails(seq, t, mw, c)),
      el('div', { class: 'export' },
        el('span', { class: 'k' }, 'Exportar'),
        el('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: async () => toast(await copyText(summary) ? 'Resumen copiado' : 'No se pudo copiar') }, 'Copiar resumen')
      )
    )
  );
}

function calcDetails(seq, t, mw, c) {
  const parts = [];
  if (t.details) {
    const m = METHODS[t.details.method];
    parts.push(el('p', {}, el('b', {}, 'Tm — '), m.name));
    if (t.details.method === 'nn') {
      parts.push(el('div', { class: 'calc' },
        `ΔH  = ${t.dH.toFixed(1)} kcal/mol      (${t.details.steps} pasos NN + iniciación${t.symmetric ? ' + simetría' : ''})\n` +
        `ΔS  = ${t.dS.toFixed(1)} cal/(K·mol)   (1 M Na⁺)\n${t.details.saltFormula}\nNa⁺eq = ${t.details.Na_mM} + 120·√(${t.details.Mg_mM} − ${t.details.dNTP_mM}) = ${t.details.NaEq_mM} mM\nΔS' = ${t.dS_salt.toFixed(1)} cal/(K·mol)\n${t.details.formula}\nC = ${t.details.primerConc_nM} nM · R = 1.987 cal/(K·mol)\nTm = ${t.tm.toFixed(2)} °C  →  ${roundTm(t.tm).toFixed(1)} °C`));
    } else if (t.details.method === 'wallace') {
      parts.push(el('div', { class: 'calc' }, `${t.details.formula}\nTm = 2·${t.details.at} + 4·${t.details.gc} = ${t.tm} °C`));
    } else {
      parts.push(el('div', { class: 'calc' }, `${t.details.formula}\nG+C = ${t.details.gc} · N = ${t.details.N}\nTm = ${t.tm.toFixed(2)} °C`));
    }
  } else if (t.error) parts.push(el('p', {}, el('b', {}, 'Tm — '), t.error));
  parts.push(el('p', {}, el('b', {}, 'GC % — '), `100·(G+C)/(A+C+G+T) = 100·${c.G + c.C}/${c.A + c.C + c.G + c.T}; las bases ambiguas no cuentan.`));
  if (mw !== null) parts.push(el('p', {}, el('b', {}, 'Peso molecular — '), 'fórmula IDT (ssDNA anhidro, 5′-OH):'), el('div', { class: 'calc' }, `MW = ${c.A}·313.21 + ${c.T}·304.20 + ${c.C}·289.18 + ${c.G}·329.21 − 61.96 = ${mw.toFixed(2)} g/mol`));
  parts.push(el('p', {}, el('b', {}, 'Precisión — '), 'Tm con 1 decimal (incertidumbre del modelo ≥ ±1 °C); GC % con 1 decimal; MW con 1 decimal.'));
  return parts;
}
