/**
 * components.js — piezas de interfaz reutilizables (sin lógica científica).
 */
import { STATUS_LABEL, GLOSSARY } from './strings.js';

/** Crea un elemento con atributos e hijos. */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

export function fmt(n, digits = 1) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return Number(n).toLocaleString('es-ES', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** Chip de estado con texto (nunca solo color). */
export function statusChip(status) {
  const s = status || 'NA';
  return el('span', { class: `status status-${s}`, role: 'img', 'aria-label': `Estado: ${STATUS_LABEL[s]}` }, STATUS_LABEL[s]);
}

/** Botón «?» con panel educativo accesible. */
let popCounter = 0;
export function popover(key, opts = {}) {
  const g = GLOSSARY[key];
  if (!g) return document.createTextNode('');
  const id = `pop-${++popCounter}`;
  const panel = el('div', { class: 'pop-panel', id, role: 'region', 'aria-label': g.title, hidden: true },
    el('p', { class: 't' }, g.title),
    ...g.body.map(p => el('p', {}, p))
  );
  const btn = el('button', { type: 'button', 'aria-expanded': 'false', 'aria-controls': id, 'aria-label': `${g.title} (información)`, title: g.title }, '?');
  const wrap = el('span', { class: 'pop' + (opts.right ? ' align-right' : '') }, btn, panel);
  const close = () => { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); document.removeEventListener('click', onDoc, true); document.removeEventListener('keydown', onKey); };
  const onDoc = e => { if (!wrap.contains(e.target)) close(); };
  const onKey = e => { if (e.key === 'Escape') { close(); btn.focus(); } };
  btn.addEventListener('click', () => {
    if (panel.hidden) {
      document.querySelectorAll('.pop-panel:not([hidden])').forEach(p => { p.hidden = true; p.previousElementSibling?.setAttribute('aria-expanded', 'false'); });
      panel.hidden = false; btn.setAttribute('aria-expanded', 'true');
      setTimeout(() => { document.addEventListener('click', onDoc, true); document.addEventListener('keydown', onKey); }, 0);
    } else close();
  });
  return wrap;
}

/** Etiqueta de campo con popover opcional. */
export function label(text, forId, popKey, optional) {
  return el('label', { class: 'label', for: forId },
    text, popKey ? popover(popKey) : null, optional ? el('span', { class: 'opt' }, '(opcional)') : null);
}

/** Campo numérico compacto. */
export function numField(id, text, value, attrs = {}, popKey) {
  return el('div', { class: 'field' },
    label(text, id, popKey),
    el('input', { class: 'num', type: 'number', id, name: id, value, ...attrs })
  );
}

/** Secuencia en monoespaciada con bases coloreadas y últimas 5 del 3′ resaltadas opcionalmente. */
export function seqSpan(seq, highlight3 = false) {
  const s = el('span', { class: 's' });
  const n = seq.length;
  for (let i = 0; i < n; i++) {
    const ch = seq[i];
    const b = el('span', { class: 'b-' + ch.toLowerCase() + (highlight3 && i >= n - 5 ? ' hl3' : '') }, ch);
    s.append(b);
  }
  return s;
}

export function seqLine(seq, opts = {}) {
  return el('div', { class: 'seqline' },
    el('span', { class: 'dir' }, "5′"),
    seqSpan(seq, opts.highlight3),
    el('span', { class: 'dir' }, "3′", opts.len !== false ? el('span', { class: 'len' }, ` · ${seq.length} nt`) : null)
  );
}

export function metric(k, v, unit, sub, popKey) {
  return el('div', { class: 'metric' },
    el('div', { class: 'k' }, k, popKey ? popover(popKey) : null),
    el('div', { class: 'v' }, v, unit ? el('small', {}, unit) : null),
    sub ? el('div', { class: 'sub' }, sub) : null
  );
}

export function expandable(title, ...content) {
  return el('details', { class: 'exp' }, el('summary', {}, title), el('div', { class: 'exp-b' }, ...content));
}

export function alertBox(kind, title, body, list) {
  return el('div', { class: `alert ${kind}`, role: kind === 'err' ? 'alert' : 'status' },
    title ? el('p', { class: 't' }, title) : null,
    el('p', {}, body),
    list && list.length ? el('ul', {}, ...list.map(x => el('li', {}, x))) : null
  );
}

export function emptyState(k, text) {
  return el('div', { class: 'empty' }, el('div', { class: 'k' }, k), el('div', {}, text));
}

let toastTimer = null;
export function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

/** CTA de pedido: sintetizamos los primers que diseñes aquí. */
export function futureCta() {
  return el('div', { class: 'future-cta' },
    el('div', { class: 'txt' },
      el('b', {}, 'Pide estos primers a Macrogen'),
      'Síntesis de oligos de ADN con control de calidad MALDI-TOF desde USD 0,20/base, entregados desde Madrid o Santiago. Copia las secuencias y pídelas en el portal, o solicita una cotización.'),
    el('a', { class: 'btn', href: 'https://dna.macrogen.com/?utm_source=web-es&utm_medium=toolkit', target: '_blank', rel: 'noopener' }, 'Pedir en el portal ↗'),
    el('a', { class: 'btn btn-ghost', href: '/servicios/sintesis-oligos-adn' }, 'Ver servicio de oligos')
  );
}

export function sampleTag(text = 'Datos de ejemplo') {
  return el('span', { class: 'sample-tag' }, text);
}

/** Estado en vivo de una secuencia bajo su textarea. */
export function seqStatusLine(stats) {
  const { length, gc, invalid, ambiguousCount, ok } = stats;
  const parts = [];
  parts.push(el('span', {}, 'Longitud ', el('b', {}, `${length} nt`)));
  parts.push(el('span', {}, 'GC ', el('b', {}, gc === null ? '—' : fmt(gc, 1) + ' %')));
  parts.push(el('span', { class: invalid.length ? 'bad' : '' }, 'Inválidos ', el('b', {}, invalid.length ? invalid.join(' ') : '0')));
  parts.push(el('span', { class: ambiguousCount ? 'warn' : '' }, 'Ambiguas ', el('b', {}, String(ambiguousCount))));
  const st = length === 0 ? ['—', ''] : !ok ? ['No válida', 'bad'] : ambiguousCount ? ['Válida con ambiguas', 'warn'] : ['Válida', 'ok'];
  parts.push(el('span', { class: st[1] }, 'Estado ', el('b', {}, st[0])));
  return el('div', { class: 'seq-status', 'aria-live': 'polite' }, ...parts);
}

export function evalClass(g) { return g === 'good' ? 'ev-good' : g === 'review' ? 'ev-review' : g === 'bad' ? 'ev-bad' : 'ev-na'; }
export function evalWord(g) { return g === 'good' ? 'Bien' : g === 'review' ? 'Revisar' : g === 'bad' ? 'No recomendado' : '—'; }
