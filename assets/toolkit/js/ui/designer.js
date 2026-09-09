/**
 * designer.js — vista «Diseñador de primers».
 * Flujo: SECUENCIA → ANALIZAR → DISEÑAR → REVISAR → EXPORTAR.
 */
import { el, fmt, label, numField, statusChip, seqStatusLine, alertBox, emptyState, toast, futureCta, sampleTag, popover } from './components.js';
import { primerCard, ampliconMap, issuesList } from './results.js';
import { normalize, validate, gcContent, SAMPLE_TEMPLATE } from '../engine/sequence.js';
import { designPrimers, DEFAULT_PARAMS, MAX_TEMPLATE_LENGTH, MIN_TEMPLATE_LENGTH } from '../engine/design.js';
import { METHODS, CONDITION_PRESETS } from '../engine/thermo.js';
import { candidatesToCsv, primersToFasta, copyText, downloadText } from '../engine/export.js';

// Estado de la vista (en memoria; no se persiste — las secuencias no se almacenan).
const state = { raw: '', params: { ...DEFAULT_PARAMS, cond: { ...DEFAULT_PARAMS.cond } }, result: null, open: 1, isSample: false };

export function mount(root) {
  root.innerHTML = '';
  const flow = flowBar(state.result ? 4 : (state.raw ? 2 : 1));

  root.append(
    el('div', { class: 'tool-head' },
      flow,
      el('p', { class: 'eyebrow' }, '01 · Diseñador de primers'),
      el('h1', {}, 'Diseño de pares de primers para PCR'),
      el('p', {}, 'Pega una secuencia molde (texto o FASTA) y obtén pares candidatos puntuados por Tm, GC %, estructura secundaria, dímeros y especificidad sobre el molde — con parámetros y criterios alineados con Primer-BLAST (NCBI) y las razones de cada evaluación.')
    ),
    el('div', { class: 'tool' }, inputColumn(root), resultsColumn(root))
  );
}

export function unmount() { /* nada que limpiar: sin temporizadores globales */ }

function flowBar(step) {
  const steps = ['Secuencia', 'Analizar', 'Diseñar', 'Revisar', 'Exportar', 'Pedido (futuro)'];
  const bar = el('div', { class: 'tk-flow', 'aria-label': 'Flujo de trabajo' });
  steps.forEach((s, i) => {
    if (i) bar.append(el('span', { class: 'sep', 'aria-hidden': 'true' }, '→'));
    bar.append(el('span', { class: i + 1 < step ? 'is-done' : i + 1 === step ? 'is-on' : '' }, `${String(i + 1).padStart(2, '0')} ${s}`));
  });
  return bar;
}

function inputColumn(root) {
  const ta = el('textarea', { class: 'seq', id: 'd-template', rows: 8, spellcheck: 'false', autocomplete: 'off', placeholder: '>nombre_opcional\nATGGCTAGC…', 'aria-describedby': 'd-template-status d-template-hint' }, state.raw);
  const statusHost = el('div', { id: 'd-template-status' });
  const sampleHost = el('div', { style: 'margin-top:8px;display:flex;gap:10px;align-items:center;flex-wrap:wrap' });

  const refreshStatus = () => {
    const n = normalize(ta.value);
    const v = validate(n.sequence);
    statusHost.replaceChildren(seqStatusLine({ length: n.sequence.length, gc: gcContent(n.sequence), invalid: v.invalid, ambiguousCount: v.ambiguousCount, ok: v.ok }));
    ta.setAttribute('aria-invalid', n.sequence.length && !v.ok ? 'true' : 'false');
    sampleHost.replaceChildren(
      el('button', { type: 'button', class: 'btn-link', onclick: () => { ta.value = '>Secuencia sintetica de ejemplo (500 pb, no es un gen real)\n' + SAMPLE_TEMPLATE; state.isSample = true; onInput(); } }, 'Cargar secuencia de ejemplo'),
      state.isSample && ta.value.includes(SAMPLE_TEMPLATE) ? sampleTag('Secuencia sintética de ejemplo · no es un gen real') : null,
      ta.value ? el('button', { type: 'button', class: 'btn-link', onclick: () => { ta.value = ''; state.isSample = false; onInput(); } }, 'Limpiar') : null
    );
  };
  const onInput = () => { state.raw = ta.value; if (!ta.value.includes(SAMPLE_TEMPLATE)) state.isSample = false; refreshStatus(); };
  ta.addEventListener('input', onInput);
  refreshStatus();

  const P = state.params;
  const method = el('select', { class: 'sel', id: 'd-method' }, ...Object.values(METHODS).map(m => el('option', { value: m.id, selected: P.method === m.id }, m.name)));

  const form = el('form', { novalidate: true, onsubmit: e => { e.preventDefault(); run(root, form); } },
    el('section', { class: 'panel' },
      el('div', { class: 'panel-h' }, el('span', { class: 'num' }, '01'), 'Secuencia molde'),
      el('div', { class: 'panel-b' },
        el('div', { class: 'field' },
          label('Secuencia de ADN (texto o FASTA)', 'd-template'),
          ta,
          statusHost,
          el('p', { class: 'hint', id: 'd-template-hint' }, `Se aceptan A, C, G, T; se ignoran espacios, números y saltos de línea; U→T. La herramienta procesa moldes de ${MIN_TEMPLATE_LENGTH} a ${MAX_TEMPLATE_LENGTH.toLocaleString('es-ES')} pb sin bases ambiguas.`),
          sampleHost
        ),
        el('div', { class: 'field', style: 'margin-top:14px' },
          el('div', { class: 'label', id: 'd-target-l' }, 'Región objetivo (opcional)', popover('target')),
          el('div', { class: 'range-pair', role: 'group', 'aria-labelledby': 'd-target-l' },
            el('input', { class: 'num', type: 'number', id: 'd-target-from', 'aria-label': 'Región objetivo: desde (posición 1-based)', placeholder: 'desde', min: 1, value: state.params.targetFrom ?? '' }),
            el('span', { class: 'dash', 'aria-hidden': 'true' }, '–'),
            el('input', { class: 'num', type: 'number', id: 'd-target-to', 'aria-label': 'Región objetivo: hasta (posición 1-based)', placeholder: 'hasta', min: 1, value: state.params.targetTo ?? '' })
          ),
          el('p', { class: 'hint' }, 'El amplicón contendrá este rango y los primers no lo solaparán.')
        ),
        el('details', { class: 'adv', open: !!(state.params.fixedFwd || state.params.fixedRev) },
          el('summary', {}, 'Usar mis propios primers'),
          el('div', { class: 'adv-b' },
            el('p', { class: 'hint', style: 'margin:8px 0 10px' }, 'Pega el primer que ya tienes (5′→3′) y se diseñará solo el que falta. ', popover('ownprimers')),
            el('div', { class: 'field' }, label('Forward fijo', 'd-fixed-fwd'), el('input', { class: 'seq', id: 'd-fixed-fwd', spellcheck: 'false', autocomplete: 'off', placeholder: 'opcional', value: state.params.fixedFwd || '' })),
            el('div', { class: 'field' }, label('Reverse fijo', 'd-fixed-rev'), el('input', { class: 'seq', id: 'd-fixed-rev', spellcheck: 'false', autocomplete: 'off', placeholder: 'opcional', value: state.params.fixedRev || '' }))
          )
        )
      )
    ),
    el('section', { class: 'panel' },
      el('div', { class: 'panel-h' }, el('span', { class: 'num' }, '02'), 'Parámetros'),
      el('div', { class: 'panel-b' },
        rangeField('Tamaño de producto', 'pb', 'd-prod', P.minProduct, P.maxProduct, { min: 40, max: 5000, step: 1 }, 'product'),
        rangeField('Tm del primer', '°C', 'd-tm', P.minTm, P.maxTm, { min: 40, max: 80, step: 0.5 }, 'tm'),
        rangeField('Longitud del primer', 'nt', 'd-len', P.minLen, P.maxLen, { min: 15, max: 35, step: 1 }),
        rangeField('GC %', '%', 'd-gc', P.minGc, P.maxGc, { min: 20, max: 80, step: 1 }, 'gc'),
        el('details', { class: 'adv' },
          el('summary', {}, 'Parámetros avanzados'),
          el('div', { class: 'adv-b' },
            el('div', { class: 'grid-2' },
              numField('d-optTm', 'Tm óptima (°C)', P.optTm, { min: 40, max: 80, step: 0.5 }),
              numField('d-optLen', 'Longitud óptima (nt)', P.optLen, { min: 15, max: 35, step: 1 }),
              numField('d-maxHomo', 'Máx. homopolímero (nt)', P.maxHomopolymer, { min: 3, max: 8, step: 1 }, 'homopolymer'),
              numField('d-maxDiff', 'Máx. ΔTm del par (°C)', P.maxPairDiffTm, { min: 1, max: 10, step: 0.5 }),
              numField('d-maxSelfAny', 'Máx. autocompl. (pb)', P.maxSelfAny, { min: 3, max: 12, step: 1 }, 'self'),
              numField('d-maxSelfEnd', 'Máx. compl. 3′ (pb)', P.maxSelfEnd3, { min: 1, max: 6, step: 1 }, 'end3'),
              numField('d-n', 'Nº de candidatos', P.maxCandidates, { min: 1, max: 20, step: 1 })
            ),
            el('div', { class: 'label', style: 'margin-top:14px' }, 'Condiciones de la reacción'),
            el('div', { class: 'field' },
              el('select', { class: 'sel', id: 'd-preset', 'aria-label': 'Preajuste de condiciones', onchange: e => applyPreset(form, e.target.value) },
                ...Object.values(CONDITION_PRESETS).map(p => el('option', { value: p.id, selected: presetMatches(P.cond, p.cond) }, p.name)),
                el('option', { value: 'custom', selected: !Object.values(CONDITION_PRESETS).some(p => presetMatches(P.cond, p.cond)) }, 'Personalizado')
              )
            ),
            el('div', { class: 'grid-2' },
              numField('d-na', 'Na⁺ (mM)', P.cond.Na_mM, { min: 1, max: 1000, step: 1 }, 'salt'),
              numField('d-conc', 'Primer (nM)', P.cond.primerConc_nM, { min: 10, max: 5000, step: 10 }, 'conc'),
              numField('d-mg', 'Mg²⁺ (mM)', P.cond.Mg_mM, { min: 0, max: 20, step: 0.1 }, 'mg'),
              numField('d-dntp', 'dNTP (mM)', P.cond.dNTP_mM, { min: 0, max: 5, step: 0.1 }, 'mg')
            ),
            el('div', { class: 'field', style: 'margin-top:10px' }, label('Método de Tm', 'd-method', 'tm'), method),
            el('div', { class: 'label', style: 'margin-top:14px' }, 'Especificidad sobre el molde ', popover('specificity')),
            el('div', { class: 'grid-3' },
              numField('d-spec-mm', 'Mín. mismatches', P.spec.minMM, { min: 1, max: 6, step: 1 }),
              numField('d-spec-mm3', 'Mín. en 3′ (5 nt)', P.spec.minMM3, { min: 1, max: 5, step: 1 }),
              numField('d-spec-size', 'Máx. prod. no deseado (pb)', P.spec.maxSize, { min: 100, max: 10000, step: 100 })
            )
          )
        ),
        el('div', { class: 'actions' },
          el('button', { class: 'btn', type: 'submit', id: 'd-run' }, 'Diseñar primers'),
          el('span', { class: 'note' }, 'Cálculo local en tu navegador.')
        )
      )
    )
  );
  return el('div', {}, form);
}

function presetMatches(cond, preset) {
  return ['primerConc_nM', 'Na_mM', 'Mg_mM', 'dNTP_mM'].every(k => Number(cond[k] ?? 0) === Number(preset[k] ?? 0));
}
function applyPreset(form, id) {
  const p = CONDITION_PRESETS[id];
  if (!p) return;
  form.querySelector('#d-na').value = p.cond.Na_mM;
  form.querySelector('#d-conc').value = p.cond.primerConc_nM;
  form.querySelector('#d-mg').value = p.cond.Mg_mM;
  form.querySelector('#d-dntp').value = p.cond.dNTP_mM;
}

function rangeField(text, unit, id, lo, hi, attrs, popKey) {
  return el('div', { class: 'field' },
    el('div', { class: 'label', id: id + '-l' }, `${text} (${unit})`, popKey ? popover(popKey) : null),
    el('div', { class: 'range-pair', role: 'group', 'aria-labelledby': id + '-l' },
      el('input', { class: 'num', type: 'number', id: id + '-min', 'aria-label': `${text} mínimo`, value: lo, ...attrs }),
      el('span', { class: 'dash', 'aria-hidden': 'true' }, '–'),
      el('input', { class: 'num', type: 'number', id: id + '-max', 'aria-label': `${text} máximo`, value: hi, ...attrs })
    )
  );
}

function readParams(form) {
  const g = id => Number(form.querySelector('#' + id).value);
  const opt = id => { const v = form.querySelector('#' + id).value.trim(); return v === '' ? null : Number(v); };
  return {
    minProduct: g('d-prod-min'), maxProduct: g('d-prod-max'),
    minTm: g('d-tm-min'), maxTm: g('d-tm-max'),
    minLen: g('d-len-min'), maxLen: g('d-len-max'),
    minGc: g('d-gc-min'), maxGc: g('d-gc-max'),
    optTm: g('d-optTm'), optLen: g('d-optLen'), maxHomopolymer: g('d-maxHomo'), maxPairDiffTm: g('d-maxDiff'),
    maxSelfAny: g('d-maxSelfAny'), maxSelfEnd3: g('d-maxSelfEnd'), maxCandidates: g('d-n'),
    method: form.querySelector('#d-method').value,
    cond: { Na_mM: g('d-na'), primerConc_nM: g('d-conc'), Mg_mM: g('d-mg'), dNTP_mM: g('d-dntp') },
    targetFrom: opt('d-target-from'), targetTo: opt('d-target-to'),
    fixedFwd: form.querySelector('#d-fixed-fwd').value.trim(),
    fixedRev: form.querySelector('#d-fixed-rev').value.trim(),
    spec: { minMM: g('d-spec-mm'), minMM3: g('d-spec-mm3'), maxSize: g('d-spec-size') }
  };
}

function run(root, form) {
  const params = readParams(form);
  const skip = new Set(['cond', 'method', 'spec', 'targetFrom', 'targetTo', 'fixedFwd', 'fixedRev']);
  const bad = Object.entries(params).filter(([k, v]) => !skip.has(k) && !Number.isFinite(v)).map(([k]) => k);
  const host = root.querySelector('#d-results');
  if (bad.length || !Number.isFinite(params.cond.Na_mM) || !Number.isFinite(params.cond.primerConc_nM)) {
    host.replaceChildren(alertBox('err', 'Parámetros incompletos', 'Todos los campos numéricos deben tener un valor.'));
    return;
  }
  state.params = params;
  const n = normalize(state.raw);
  const v = validate(n.sequence);
  if (!n.sequence.length) { host.replaceChildren(alertBox('err', 'Falta la secuencia', 'Pega una secuencia molde o carga la de ejemplo.')); return; }
  if (!v.ok) { host.replaceChildren(alertBox('err', 'Secuencia no válida', `Se encontraron caracteres no admitidos: ${v.invalid.join(', ')}. Revisa que no haya restos de cabeceras, comentarios o traducción a proteína.`)); return; }
  if (v.ambiguousCount) { host.replaceChildren(alertBox('err', 'Bases ambiguas en el molde', `El molde contiene códigos IUPAC (${v.ambiguous.join(', ')}). El diseñador necesita una secuencia sin ambigüedades: sustitúyelas o recorta la región.`)); return; }

  const btn = form.querySelector('#d-run');
  btn.disabled = true; btn.textContent = 'Calculando…';
  host.replaceChildren(emptyState('Calculando', 'Enumerando ventanas y evaluando pares…'));
  // deja pintar el estado antes del cálculo síncrono
  setTimeout(() => {
    const t0 = performance.now();
    const res = designPrimers(n.sequence, params);
    res.elapsedMs = Math.round(performance.now() - t0);
    res.template = n.sequence;
    res.header = n.header;
    state.result = res; state.open = 1;
    btn.disabled = false; btn.textContent = 'Diseñar primers';
    mount(root);
    root.querySelector('#d-results')?.focus();
  }, 20);
}

function resultsColumn(root) {
  const host = el('div', { id: 'd-results', tabindex: '-1', 'aria-live': 'polite' });
  const r = state.result;
  if (!r) {
    host.append(el('section', { class: 'panel' }, emptyState('Resultados', 'Introduce un molde y pulsa «Diseñar primers». Los candidatos aparecerán aquí con su estado y las razones de cada evaluación.')));
    return host;
  }
  if (!r.ok) { host.append(alertBox('err', 'No se pudo diseñar', r.error)); return host; }
  if (!r.candidates.length) {
    host.append(alertBox('warn', 'Sin candidatos', r.error, [
      `Ventanas forward válidas: ${r.stats.forwardWindows} · reverse: ${r.stats.reverseWindows} · pares evaluados: ${r.stats.pairsEvaluated}.`,
      'Prueba a ampliar el rango de Tm o de tamaño de producto, o relaja los límites avanzados.'
    ]));
    return host;
  }

  const P = r.params;
  const summary = el('section', { class: 'panel fade-in' },
    el('div', { class: 'panel-h' }, el('span', { class: 'num' }, '03'), 'Candidatos', el('span', { class: 'right' }, `${r.candidates.length} pares · ${r.elapsedMs} ms`)),
    el('div', { class: 'panel-b', style: 'padding-bottom:8px' },
      el('div', { class: 'seq-status' },
        el('span', {}, 'Molde ', el('b', {}, `${r.stats.templateLength} pb`), r.header ? ` · ${r.header}` : ''),
        el('span', {}, 'Ventanas ', el('b', {}, `${r.stats.forwardWindows} F / ${r.stats.reverseWindows} R`)),
        el('span', {}, 'Pares evaluados ', el('b', {}, String(r.stats.pairsEvaluated))),
        el('span', {}, 'Tm ', el('b', {}, METHODS[P.method].short), ` · Na⁺ ${P.cond.Na_mM} mM · Mg²⁺ ${P.cond.Mg_mM} mM · dNTP ${P.cond.dNTP_mM} mM · ${P.cond.primerConc_nM} nM`),
        P.targetFrom ? el('span', {}, 'Objetivo ', el('b', {}, `${P.targetFrom}–${P.targetTo}`)) : null,
        r.stats.fixed ? el('span', {}, el('b', {}, 'Primer propio fijado')) : null
      ),
      state.isSample && r.template === SAMPLE_TEMPLATE ? el('p', { style: 'margin:10px 0 0' }, sampleTag('Resultado sobre la secuencia sintética de ejemplo')) : null
    ),
    el('div', { class: 'table-scroll' }, candidatesTable(root, r)),
    el('div', { class: 'export' },
      el('span', { class: 'k' }, 'Exportar'),
      el('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: async () => toast(await copyText(pairText(r.candidates[state.open - 1])) ? 'Par copiado al portapapeles' : 'No se pudo copiar') }, 'Copiar par seleccionado'),
      el('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => downloadText('macrogen-primers-candidatos.csv', candidatesToCsv(r.candidates, { method: P.method, ...P.cond }), 'text/csv') }, 'CSV'),
      el('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => downloadText('macrogen-primers-candidatos.fasta', fastaAll(r.candidates), 'text/plain') }, 'FASTA'),
      el('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => downloadText('macrogen-primers-candidatos.json', JSON.stringify({ generated: new Date().toISOString(), prototype: true, params: P, stats: r.stats, candidates: r.candidates }, jsonReplacer, 2), 'application/json') }, 'JSON')
    )
  );
  host.append(summary);

  const c = r.candidates[state.open - 1];
  if (c) {
    host.append(
      el('section', { class: 'panel fade-in', style: 'margin-top:16px', 'aria-label': `Detalle del candidato ${c.rank}` },
        el('div', { class: 'panel-h' }, el('span', { class: 'num' }, `Par #${c.rank}`), statusChip(c.status), el('span', { class: 'right' }, `Producto ${c.productSize} pb · ΔTm ${fmt(c.tmDiff, 1)} °C · penalización ${fmt(c.penalty, 1)} · puntuación ${fmt(c.score, 2)}`)),
        ampliconMap(r.stats.templateLength, c.fwd, c.rev),
        el('div', { class: 'panel-b' },
          el('div', { class: 'label' }, 'Evaluación del par'),
          issuesList({ issues: c.issues, notes: [] }),
          el('dl', { class: 'kv', style: 'margin-top:12px' },
            el('dt', {}, 'Compl. cruzada'), el('dd', {}, `${c.cross.any} pb en el mejor alineamiento · ${c.cross.contiguous} pb contiguas · ${c.cross.end3} pb en 3′ `, popover('dimer')),
            el('dt', {}, 'Especificidad'), el('dd', {},
              `Sitios de unión en el molde (≤3 mismatches, ambas hebras): forward ${c.spec.fwdSites} · reverse ${c.spec.revSites}. `,
              c.spec.unintendedTotal
                ? `${c.spec.unintendedTotal} producto(s) no deseado(s): ${c.spec.unintended.map(u => `${u.size} pb (${u.start}–${u.end}, ${u.by})`).join(' · ')}. `
                : 'Sin productos no deseados detectados. ',
              popover('specificity')),
            el('dt', {}, 'Penalización'), el('dd', {}, `${fmt(c.penalty, 1)} — suma de los criterios con observación; decide el estado (< 1 Óptimo · < 3.5 Aceptable · < 7 Revisar · ≥ 7 No recomendado).`),
            el('dt', {}, 'Puntuación'), el('dd', {}, `${fmt(c.score, 2)} — penalización más preferencias blandas (cercanía a la Tm y longitud óptimas); solo ordena los candidatos, no cambia el estado.`)
          ),
          el('div', { style: 'margin-top:12px; padding-top:12px; border-top:1px solid var(--mc-line); display:flex; gap:10px; flex-wrap:wrap; align-items:center' },
            el('button', {
              class: 'btn btn-ghost btn-sm', type: 'button',
              onclick: async () => {
                const ok = await copyText(`>pair${c.rank}_F\n${c.fwd.seq}\n>pair${c.rank}_R\n${c.rev.seq}`);
                window.open('https://www.ncbi.nlm.nih.gov/tools/primer-blast/', '_blank', 'noopener');
                toast(ok ? 'Par copiado — pégalo en Primer-BLAST' : 'Abre Primer-BLAST y copia el par a mano');
              }
            }, 'Copiar par y abrir Primer-BLAST ↗'),
            el('span', { class: 'note', style: 'font-size:12.5px;color:var(--mc-mute)' }, 'La especificidad genómica requiere BLAST contra el organismo. No se envía nada automáticamente: tú pegas las secuencias en NCBI si lo decides.')
          )
        )
      ),
      el('div', { style: 'margin-top:16px' }, primerCard(toAnalysis(c.fwd), 'Forward', { right: `pos. ${c.fwd.start}–${c.fwd.end}` })),
      el('div', { style: 'margin-top:16px' }, primerCard(toAnalysis(c.rev), 'Reverse', { right: `pos. ${c.rev.start}–${c.rev.end} (hebra complementaria)` })),
      el('section', { class: 'panel', style: 'margin-top:16px' },
        el('details', { class: 'exp', style: 'border-top:0' },
          el('summary', {}, 'Cómo se han generado los candidatos'),
          el('div', { class: 'exp-b' },
            el('p', {}, `1. Se enumeran todas las ventanas de ${P.minLen}–${P.maxLen} nt del molde (forward) y de su complemento inverso (reverse): ${r.stats.forwardWindows} y ${r.stats.reverseWindows} ventanas cumplen Tm ${P.minTm}–${P.maxTm} °C, GC ${P.minGc}–${P.maxGc} %, homopolímero ≤ ${P.maxHomopolymer}, autocomplementariedad ≤ ${P.maxSelfAny} pb y complementariedad 3′ ≤ ${P.maxSelfEnd3} pb.`),
            el('p', {}, `2. Cada ventana recibe una penalización por los criterios que incumple (los mismos que muestra el verificador) y una preferencia blanda de ordenación: |longitud − ${P.optLen}|·0.2 + |Tm − ${P.optTm}|·0.3.`),
            el('p', {}, `3. Se combinan las 40 mejores forward con las 40 mejores reverse cuyo producto cae en ${P.minProduct}–${P.maxProduct} pb (${r.stats.pairsEvaluated} pares); se descartan ΔTm > ${P.maxPairDiffTm} °C y complementariedad 3′ cruzada ≥ 4 pb; se añaden las penalizaciones de ΔTm y complementariedad cruzada del par.`),
            el('p', {}, `4. Especificidad sobre el molde: se escanean ambas hebras con hasta 3 mismatches y se aplican los umbrales de Primer-BLAST (un sitio se descarta si tiene ≥ ${P.spec.minMM} mismatches totales y ≥ ${P.spec.minMM3} en las últimas 5 bases 3′; productos no deseados hasta ${P.spec.maxSize} pb).`),
            el('p', {}, '5. Se ordenan por puntuación (penalización + preferencias blandas) evitando repetir el mismo forward o reverse. El estado depende solo de la penalización: < 1 Óptimo · < 3.5 Aceptable · < 7 Revisar · ≥ 7 No recomendado.'),
            el('p', {}, el('b', {}, 'Límites de la herramienta: '), 'la especificidad solo se comprueba dentro del molde pegado — la genómica requiere BLAST (botón «Primer-BLAST» del detalle). No calcula ΔG de estructuras secundarias; el Mg²⁺ se modela con la aproximación de von Ahsen 2001; no considera desapareamientos en la Tm. La puntuación es un cribado, no una predicción experimental.')
          )
        )
      ),
      futureCta()
    );
  }
  return host;
}

function candidatesTable(root, r) {
  const head = el('thead', {}, el('tr', {},
    el('th', {}, '#'), el('th', {}, 'Estado'), el('th', {}, 'Forward 5′→3′'), el('th', {}, 'Reverse 5′→3′'),
    el('th', { class: 'num' }, 'Producto'), el('th', { class: 'num' }, 'Tm F'), el('th', { class: 'num' }, 'Tm R'), el('th', { class: 'num' }, 'ΔTm'), el('th', { class: 'num' }, 'GC F/R'), el('th', {}, 'Espec.')
  ));
  const body = el('tbody', {});
  for (const c of r.candidates) {
    const tr = el('tr', {
      class: 'row-click' + (state.open === c.rank ? ' is-open' : ''), tabindex: '0', role: 'button',
      'aria-pressed': state.open === c.rank ? 'true' : 'false', 'aria-label': `Ver detalle del par ${c.rank}`,
      onclick: () => { state.open = c.rank; mount(root); root.querySelector('#d-results')?.focus(); },
      onkeydown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tr.click(); } }
    },
      el('td', { class: 'mono' }, String(c.rank)),
      el('td', {}, statusChip(c.status)),
      el('td', { class: 'seq' }, c.fwd.seq),
      el('td', { class: 'seq' }, c.rev.seq),
      el('td', { class: 'num' }, `${c.productSize} pb`),
      el('td', { class: 'num' }, fmt(c.fwd.tm, 1)),
      el('td', { class: 'num' }, fmt(c.rev.tm, 1)),
      el('td', { class: 'num' }, fmt(c.tmDiff, 1)),
      el('td', { class: 'num' }, `${fmt(c.fwd.gc, 0)} / ${fmt(c.rev.gc, 0)}`),
      el('td', { class: c.spec.unintendedTotal ? 'ev-review' : 'ev-good' }, c.spec.unintendedTotal ? `${c.spec.unintendedTotal} alt.` : 'OK')
    );
    body.append(tr);
  }
  return el('table', { class: 'rep' }, el('caption', { class: 'sr-only' }, 'Pares de primers candidatos; selecciona una fila para ver el detalle'), head, body);
}

function toAnalysis(p) {
  return {
    seq: p.seq, length: p.length, valid: true, invalid: [], ambiguous: [], gc: p.gc, tm: p.tm, tmError: null, mw: p.mw,
    homopolymer: p.homopolymer, gcClamp: p.gcClamp,
    diRepeat: p.diRepeat,
    self: p.selfAny === null ? null : { any: p.selfAny, end3: p.selfEnd3 },
    hairpin: p.hairpin,
    issues: p.issues, notes: p.notes, status: p.status, tmDetails: p.tmDetails, thermo: p.thermo
  };
}

function pairText(c) {
  return `Forward (${c.fwd.start}-${c.fwd.end})\t${c.fwd.seq}\tTm ${c.fwd.tm} °C\tGC ${c.fwd.gc} %\nReverse (${c.rev.start}-${c.rev.end})\t${c.rev.seq}\tTm ${c.rev.tm} °C\tGC ${c.rev.gc} %\nProducto ${c.productSize} pb · estado ${c.status} · macrogen-es.com/recursos/herramientas-primers`;
}
function fastaAll(cands) {
  return primersToFasta(cands.flatMap(c => [
    { name: `pair${c.rank}_F`, desc: `pos ${c.fwd.start}-${c.fwd.end} Tm ${c.fwd.tm} GC ${c.fwd.gc} ${c.status}`, seq: c.fwd.seq },
    { name: `pair${c.rank}_R`, desc: `pos ${c.rev.start}-${c.rev.end} Tm ${c.rev.tm} GC ${c.rev.gc} product ${c.productSize}bp`, seq: c.rev.seq }
  ]));
}
function jsonReplacer(k, v) { return k === 'thermo' || k === 'tmDetails' ? undefined : v; }
