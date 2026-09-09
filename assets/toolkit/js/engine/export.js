/**
 * export.js — serialización de resultados (CSV, FASTA, JSON) y copia al portapapeles.
 * Módulo sin dependencias de la UI salvo el acceso a navigator.clipboard / Blob cuando se pide.
 */

function csvEscape(v) {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

/** CSV de candidatos del diseñador. */
export function candidatesToCsv(candidates, meta = {}) {
  const head = ['rank', 'status', 'fwd_seq', 'fwd_start', 'fwd_end', 'fwd_len', 'fwd_gc', 'fwd_tm', 'rev_seq', 'rev_start', 'rev_end', 'rev_len', 'rev_gc', 'rev_tm', 'product_bp', 'tm_diff', 'cross_any', 'cross_end3', 'penalty', 'score'];
  const rows = candidates.map(c => [
    c.rank, c.status, c.fwd.seq, c.fwd.start, c.fwd.end, c.fwd.length, c.fwd.gc, c.fwd.tm, c.rev.seq, c.rev.start, c.rev.end, c.rev.length, c.rev.gc, c.rev.tm,
    c.productSize, c.tmDiff, c.cross.any, c.cross.end3, c.penalty, c.score
  ]);
  const comment = `# Macrogen Herramientas de primers · generado ${new Date().toISOString()} · método Tm ${meta.method || 'nn'} · Na+ ${meta.Na_mM ?? ''} mM · primer ${meta.primerConc_nM ?? ''} nM`;
  return [comment, head.join(','), ...rows.map(r => r.map(csvEscape).join(','))].join('\n');
}

/** FASTA de un par o lista de primers. */
export function primersToFasta(entries) {
  return entries.map(e => `>${e.name}${e.desc ? ' ' + e.desc : ''}\n${e.seq}`).join('\n');
}

/** Copia texto al portapapeles con fallback. Devuelve true si tuvo éxito. */
export async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext !== false) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_) { /* cae al fallback */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.top = '-1000px';
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch (_) { return false; }
}

/** Descarga un archivo de texto (funciona en entornos que permiten descargas). */
export function downloadText(filename, text, mime = 'text/plain') {
  const blob = new Blob([text], { type: mime + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
