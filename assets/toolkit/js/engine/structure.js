/**
 * structure.js — heurísticas de estructura secundaria y dimerización para primers.
 * Módulo puro.
 *
 * IMPORTANTE (transparencia científica): estas funciones son CRIBADOS de complementariedad
 * por alineamiento sin huecos, al estilo de los criterios clásicos de diseño de primers
 * (p. ej. las puntuaciones "self any" / "self end" de Primer3). Cuentan pares de bases
 * complementarios; NO son un modelo termodinámico de ΔG de dímeros ni de horquillas.
 * Un valor alto señala riesgo que conviene revisar; no predice cuantitativamente un artefacto.
 */

const COMP = { A: 'T', T: 'A', C: 'G', G: 'C' };

/**
 * Alinea `a` (5'→3') contra `b` antiparalela (es decir, contra `b` leída 3'→5') en todos los
 * desplazamientos sin huecos y devuelve el máximo de pares complementarios en un alineamiento
 * (ANY) y la mejor carrera contigua.
 * @param {string} a
 * @param {string} b
 * @returns {{ any: number, contiguous: number, offset: number }}
 */
export function antiparallelComplementarity(a, b) {
  const bRev = b.split('').reverse().join('');
  let bestAny = 0, bestRun = 0, bestOffset = 0;
  for (let offset = -(bRev.length - 1); offset < a.length; offset++) {
    let matches = 0, run = 0, maxRun = 0;
    for (let i = 0; i < a.length; i++) {
      const j = i - offset;
      if (j < 0 || j >= bRev.length) { run = 0; continue; }
      if (COMP[a[i]] === bRev[j]) { matches++; run++; if (run > maxRun) maxRun = run; }
      else run = 0;
    }
    if (matches > bestAny) { bestAny = matches; bestOffset = offset; }
    if (maxRun > bestRun) bestRun = maxRun;
  }
  return { any: bestAny, contiguous: bestRun, offset: bestOffset };
}

/**
 * Complementariedad en el extremo 3': pares complementarios contiguos que arrancan en la
 * última base 3' de `a` alineada contra `b` antiparalela (cualquier desplazamiento).
 * Es el criterio más relevante para la extensión espuria por la polimerasa.
 * @returns {number} longitud de la carrera complementaria anclada en el 3' de `a`
 */
export function threePrimeComplementarity(a, b) {
  const bRev = b.split('').reverse().join('');
  let best = 0;
  const last = a.length - 1;
  for (let j = 0; j < bRev.length; j++) {
    // alinea la última base de a con la posición j de bRev y extiende hacia 5'
    let run = 0;
    for (let k = 0; last - k >= 0 && j - k >= 0; k++) {
      if (COMP[a[last - k]] === bRev[j - k]) run++; else break;
    }
    if (run > best) best = run;
  }
  return best;
}

/** Autocomplementariedad: el primer contra sí mismo. */
export function selfComplementarity(seq) {
  return { ...antiparallelComplementarity(seq, seq), end3: threePrimeComplementarity(seq, seq) };
}

/** Complementariedad cruzada entre dos primers (riesgo de dímero de primers). */
export function crossComplementarity(fwd, rev) {
  const anyFR = antiparallelComplementarity(fwd, rev);
  return {
    any: anyFR.any,
    contiguous: anyFR.contiguous,
    end3: Math.max(threePrimeComplementarity(fwd, rev), threePrimeComplementarity(rev, fwd))
  };
}

/**
 * Horquilla (hairpin): busca un tallo de ≥ minStem pares complementarios antiparalelos dentro de
 * la misma molécula, separados por un bucle de ≥ minLoop nt. Devuelve el tallo más largo hallado.
 * @returns {{ stem: number, loop: number, position: number }|null}
 */
export function hairpin(seq, minStem = 3, minLoop = 3) {
  const L = seq.length;
  let best = null;
  for (let i = 0; i < L; i++) {
    for (let j = L - 1; j > i + minLoop; j--) {
      // extiende el tallo desde (i, j) hacia dentro
      let stem = 0;
      while (i + stem < j - stem - minLoop && COMP[seq[i + stem]] === seq[j - stem]) stem++;
      if (stem >= minStem && (!best || stem > best.stem)) {
        best = { stem, loop: (j - stem) - (i + stem) + 1, position: i + 1 };
      }
    }
  }
  return best;
}

/**
 * Umbrales de cribado de la herramienta (en pares de bases). Documentados en la UI como
 * criterios orientativos; no son constantes físicas. Los máximos «review» de
 * complementariedad coinciden con los valores por defecto de Primer3
 * (PRIMER_MAX_SELF_ANY / PRIMER_PAIR_MAX_COMPL_ANY = 8; PRIMER_MAX_SELF_END /
 * PRIMER_PAIR_MAX_COMPL_END = 3), que aceptan hasta ese valor y rechazan por encima.
 */
export const THRESHOLDS = Object.freeze({
  selfAny: { good: 6, review: 8 },      // ≤6 bien · 7–8 revisar · >8 no recomendado
  selfEnd3: { good: 2, review: 3 },     // ≤2 bien · 3 revisar · ≥4 no recomendado
  crossAny: { good: 6, review: 8 },
  crossEnd3: { good: 2, review: 3 },
  hairpinStem: { good: 3, review: 4 },  // ≤3 bien · 4 revisar · ≥5 no recomendado
  homopolymer: { good: 4, review: 4 },  // ≤4 bien · 5 no recomendado
  diRepeat: { good: 4, review: 5 },     // unidades de repetición dinucleotídica (ATAT…)
  gcClamp: { min: 1, max: 3 },          // G/C en las últimas 5 bases
  tmDiff: { good: 3, review: 5 }        // diferencia de Tm entre primers (°C)
});

/** Clasifica un valor "cuanto menor mejor" contra {good, review}. */
export function grade(value, t) {
  if (value <= t.good) return 'good';
  if (value <= t.review) return 'review';
  return 'bad';
}
