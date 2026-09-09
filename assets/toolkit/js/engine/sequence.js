/**
 * sequence.js — normalización, validación y estadísticas básicas de secuencias de ADN.
 * Módulo puro: sin DOM, sin estado global. Todas las funciones son deterministas.
 *
 * Alfabeto aceptado: bases canónicas A C G T y códigos de ambigüedad IUPAC
 * (R Y S W K M B D H V N). U se convierte a T (entrada de ARN).
 */

export const CANONICAL = new Set(['A', 'C', 'G', 'T']);
export const IUPAC_AMBIGUOUS = new Set(['R', 'Y', 'S', 'W', 'K', 'M', 'B', 'D', 'H', 'V', 'N']);

const COMPLEMENT = {
  A: 'T', T: 'A', C: 'G', G: 'C',
  R: 'Y', Y: 'R', S: 'S', W: 'W', K: 'M', M: 'K',
  B: 'V', V: 'B', D: 'H', H: 'D', N: 'N'
};

/**
 * Limpia una entrada de usuario: elimina cabeceras FASTA (líneas que empiezan
 * por ">"), números, espacios y saltos de línea; pasa a mayúsculas; U→T.
 * Devuelve también la cabecera FASTA si existía.
 * @param {string} raw
 * @returns {{ sequence: string, header: string|null, removed: { whitespace: number, digits: number } }}
 */
export function normalize(raw) {
  const text = String(raw ?? '');
  const lines = text.split(/\r?\n/);
  let header = null;
  const body = [];
  for (const line of lines) {
    if (line.startsWith('>')) { if (header === null) header = line.slice(1).trim(); continue; }
    if (line.startsWith(';')) continue; // comentarios FASTA antiguos
    body.push(line);
  }
  const joined = body.join('');
  const whitespace = (joined.match(/\s/g) || []).length;
  const digits = (joined.match(/\d/g) || []).length;
  const sequence = joined.replace(/[\s\d]/g, '').toUpperCase().replace(/U/g, 'T');
  return { sequence, header, removed: { whitespace, digits } };
}

/**
 * Valida el alfabeto de una secuencia ya normalizada.
 * @param {string} seq
 * @returns {{ ok: boolean, invalid: string[], ambiguous: string[], ambiguousCount: number }}
 */
export function validate(seq) {
  const invalid = new Set();
  const ambiguous = new Set();
  let ambiguousCount = 0;
  for (const ch of seq) {
    if (CANONICAL.has(ch)) continue;
    if (IUPAC_AMBIGUOUS.has(ch)) { ambiguous.add(ch); ambiguousCount++; continue; }
    invalid.add(ch);
  }
  return { ok: invalid.size === 0, invalid: [...invalid].sort(), ambiguous: [...ambiguous].sort(), ambiguousCount };
}

/** @param {string} seq  @returns {string} complemento inverso (5'→3') */
export function reverseComplement(seq) {
  let out = '';
  for (let i = seq.length - 1; i >= 0; i--) out += COMPLEMENT[seq[i]] ?? 'N';
  return out;
}

/** Recuento de bases canónicas y ambiguas. */
export function counts(seq) {
  const c = { A: 0, C: 0, G: 0, T: 0, other: 0 };
  for (const ch of seq) { if (ch in c) c[ch]++; else c.other++; }
  return c;
}

/**
 * Porcentaje G+C sobre bases canónicas (las ambiguas no cuentan ni en numerador ni en denominador).
 * @returns {number|null} null si no hay bases canónicas
 */
export function gcContent(seq) {
  const c = counts(seq);
  const canonical = c.A + c.C + c.G + c.T;
  if (canonical === 0) return null;
  return (100 * (c.G + c.C)) / canonical;
}

/**
 * Peso molecular anhidro de un oligo de ADN monocatenario sin modificaciones
 * (5'-OH, sin fosfato 5'). Fórmula publicada por IDT (Integrated DNA Technologies):
 *   MW = A·313.21 + T·304.20 + C·289.18 + G·329.21 − 61.96
 * El término −61.96 corrige la eliminación de HPO2 (−63.98) y la adición de dos H (+2.02).
 * @returns {number|null} g/mol; null si hay bases ambiguas (no se puede calcular con exactitud)
 */
export function molecularWeight(seq) {
  const c = counts(seq);
  if (c.other > 0 || seq.length === 0) return null;
  return c.A * 313.21 + c.T * 304.20 + c.C * 289.18 + c.G * 329.21 - 61.96;
}

/** Longitud de la carrera más larga de una misma base (homopolímero). */
export function longestHomopolymer(seq) {
  let best = 0, run = 0, prev = '';
  for (const ch of seq) {
    run = ch === prev ? run + 1 : 1;
    prev = ch;
    if (run > best) best = run;
  }
  return best;
}

/**
 * Máximo número de unidades consecutivas de un motivo dinucleotídico de bases distintas
 * (p. ej. ATATATAT → 4 unidades de "AT"). Los homopolímeros se evalúan aparte.
 */
export function longestDinucleotideRepeat(seq) {
  let best = 1;
  for (let i = 0; i + 3 < seq.length; i++) {
    if (seq[i] === seq[i + 1]) continue;
    let units = 1;
    while (seq[i + units * 2] === seq[i] && seq[i + units * 2 + 1] === seq[i + 1]) units++;
    if (units > best) best = units;
  }
  return best;
}

/** Nº de G/C en las últimas n bases del extremo 3' ("GC clamp"). */
export function gcClamp3(seq, n = 5) {
  const tail = seq.slice(-n);
  let g = 0;
  for (const ch of tail) if (ch === 'G' || ch === 'C') g++;
  return g;
}

/**
 * Formatea una secuencia en bloques de 10 con numeración cada 60, estilo GenBank,
 * para presentación en pantalla/exportación.
 */
export function formatBlocks(seq, perLine = 60, block = 10) {
  const lines = [];
  for (let i = 0; i < seq.length; i += perLine) {
    const chunk = seq.slice(i, i + perLine);
    const blocks = chunk.match(new RegExp(`.{1,${block}}`, 'g')) || [];
    lines.push(String(i + 1).padStart(6, ' ') + '  ' + blocks.join(' '));
  }
  return lines.join('\n');
}

/**
 * Secuencia sintética de ejemplo (500 pb, ~52 % GC). NO es un gen real: generada
 * de forma determinista para esta herramienta; está etiquetada como tal en la UI.
 */
export const SAMPLE_TEMPLATE =
  'ATGGCTAGCAAGGGCGAGGAGCTGTTCACCGGGGTGGTGCCCATCCTGGTCGAGCTGGACGGCGACGTAAACGGCCACAAGTTCAGCGTGTCCGGCGAGGGCGAGGGCGATGCCACCTACGGCAAGCTGACCCTGAAGTTCATCTGCACCACCGGCAAGCTGCCCGTGCCCTGGCCCACCCTCGTGACCACCCTGACCTACGGCGTGCAGTGCTTCAGCCGCTACCCCGACCACATGAAGCAGCACGACTTCTTCAAGTCCGCCATGCCCGAAGGCTACGTCCAGGAGCGCACCATCTTCTTCAAGGACGACGGCAACTACAAGACCCGCGCCGAGGTGAAGTTCGAGGGCGACACCCTGGTGAACCGCATCGAGCTGAAGGGCATCGACTTCAAGGAGGACGGCAACATCCTGGGGCACAAGCTGGAGTACAACTACAACAGCCACAACGTCTATATCATGGCCGACAAGCAGAAGAACGGCATCAAGGTGAACTTCAAGATCCGCCACAACATCGAGGACGGCAGCGTGCAGCTC';

/** Primers universales reales del stock de Macrogen (verificados en el catálogo del sitio). */
export const SAMPLE_PRIMERS = {
  M13F: { name: 'M13F (-20)', seq: 'GTAAAACGACGGCCAGT' },
  M13R: { name: 'M13R', seq: 'GCGGATAACAATTTCACACAGG' },
  T7: { name: 'T7 promoter', seq: 'TAATACGACTCACTATAGGG' }
};
