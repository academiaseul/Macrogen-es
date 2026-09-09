/**
 * thermo.js — cálculo de temperatura de fusión (Tm) de oligonucleótidos.
 * Módulo puro. Tres métodos publicados, cada uno con sus supuestos explícitos:
 *
 *  1. 'nn'      Vecino más cercano (nearest-neighbor) con los parámetros unificados de
 *               SantaLucia (1998) PNAS 95:1460–1465 y corrección de sal
 *               ΔS(Na+) = ΔS(1 M) + 0.368·N·ln[Na+]  (N = nº de enlaces fosfodiéster = L−1).
 *               Tm = ΔH·1000 / (ΔS + R·ln(C/4)) − 273.15   (dúplex no autocomplementario,
 *               primer en exceso; R = 1.987 cal·K⁻¹·mol⁻¹; C = concentración del primer, M).
 *               Para secuencias autocomplementarias se aplica la corrección de simetría (ΔS −1.4)
 *               y se usa ln(C) en lugar de ln(C/4).
 *  2. 'wallace' Regla de Wallace (Wallace et al. 1979): Tm = 2·(A+T) + 4·(G+C).
 *               Solo orientativa para oligos cortos (≈14–20 nt) en condiciones de hibridación clásicas.
 *  3. 'basic'   Aproximación por composición (Marmur & Doty; forma habitual para N > 13):
 *               Tm = 64.9 + 41·(G+C − 16.4)/N.
 *
 * Ninguno modela Mg²⁺, dNTPs, DMSO ni desapareamientos; la Tm real en un PCR concreto
 * depende del tampón y del método. La UI muestra estos supuestos junto al resultado.
 */

const R = 1.987; // cal / (K·mol)

/** Parámetros NN unificados (SantaLucia 1998): ΔH kcal/mol, ΔS cal/(K·mol). Clave 5'→3'. */
export const NN_PARAMS = {
  AA: { dH: -7.9, dS: -22.2 }, TT: { dH: -7.9, dS: -22.2 },
  AT: { dH: -7.2, dS: -20.4 },
  TA: { dH: -7.2, dS: -21.3 },
  CA: { dH: -8.5, dS: -22.7 }, TG: { dH: -8.5, dS: -22.7 },
  GT: { dH: -8.4, dS: -22.4 }, AC: { dH: -8.4, dS: -22.4 },
  CT: { dH: -7.8, dS: -21.0 }, AG: { dH: -7.8, dS: -21.0 },
  GA: { dH: -8.2, dS: -22.2 }, TC: { dH: -8.2, dS: -22.2 },
  CG: { dH: -10.6, dS: -27.2 },
  GC: { dH: -9.8, dS: -24.4 },
  GG: { dH: -8.0, dS: -19.9 }, CC: { dH: -8.0, dS: -19.9 }
};
const INIT_GC = { dH: 0.1, dS: -2.8 };   // iniciación con par terminal G·C
const INIT_AT = { dH: 2.3, dS: 4.1 };    // iniciación con par terminal A·T
const SYMMETRY_DS = -1.4;

export const DEFAULT_CONDITIONS = Object.freeze({
  primerConc_nM: 250,   // concentración del oligo (valor por defecto de IDT OligoAnalyzer)
  Na_mM: 50,            // [Na+] monovalente
  Mg_mM: 0,             // [Mg2+] divalente
  dNTP_mM: 0            // dNTPs (quelan Mg2+)
});

/** Preajustes de condiciones documentados en la UI. */
export const CONDITION_PRESETS = Object.freeze({
  primerblast: {
    id: 'primerblast', name: 'PCR · Primer3/Primer-BLAST (50 nM · 50 mM Na⁺ · 1,5 mM Mg²⁺ · 0,6 mM dNTP)',
    cond: { primerConc_nM: 50, Na_mM: 50, Mg_mM: 1.5, dNTP_mM: 0.6 }
  },
  idt: {
    id: 'idt', name: 'IDT OligoAnalyzer (250 nM · 50 mM Na⁺ · sin Mg²⁺)',
    cond: { primerConc_nM: 250, Na_mM: 50, Mg_mM: 0, dNTP_mM: 0 }
  }
});

/**
 * [Na+] equivalente con corrección por cationes divalentes (von Ahsen, Wittwer & Schütz 2001,
 * Clin Chem 47:1956–1961; la misma aproximación que usa Primer3/Primer-BLAST por defecto):
 *   Na_eq = Na + 120·√(Mg − dNTP)   (mM; si dNTP ≥ Mg, los dNTPs quelan el Mg y no se corrige)
 */
export function effectiveNa(cond) {
  const c = { ...DEFAULT_CONDITIONS, ...cond };
  const free = Math.max(0, (c.Mg_mM || 0) - (c.dNTP_mM || 0));
  return c.Na_mM + (free > 0 ? 120 * Math.sqrt(free) : 0);
}

export const METHODS = Object.freeze({
  nn: {
    id: 'nn',
    name: 'Vecino más cercano (SantaLucia 1998)',
    short: 'NN · SantaLucia 1998',
    reference: 'SantaLucia J. (1998) PNAS 95:1460–1465',
    assumptions: [
      'Dúplex perfectamente apareado con su complementaria; no modela desapareamientos.',
      'Sal: ΔS + 0.368·N·ln[Na⁺eq], con Na⁺eq = Na⁺ + 120·√(Mg²⁺ − dNTP) (von Ahsen et al. 2001, la aproximación de Primer3/Primer-BLAST). DMSO y otros aditivos no se modelan.',
      'Primer en exceso respecto al molde: Tm = ΔH/(ΔS + R·ln(C/4)).',
      'Válido para oligos de 8 a ~60 nt sin bases ambiguas.'
    ]
  },
  wallace: {
    id: 'wallace',
    name: 'Regla de Wallace',
    short: 'Wallace (2AT + 4GC)',
    reference: 'Wallace R.B. et al. (1979) Nucleic Acids Res. 6:3543–3557',
    assumptions: [
      'Aproximación empírica para oligos cortos (≈14–20 nt) en hibridación clásica.',
      'Ignora la secuencia (solo composición), la concentración y la sal.'
    ]
  },
  basic: {
    id: 'basic',
    name: 'Composición GC (Marmur–Doty)',
    short: 'GC% (64.9 + 41·(GC−16.4)/N)',
    reference: 'Marmur J. & Doty P. (1962) J. Mol. Biol. 5:109–118 (forma para N > 13)',
    assumptions: [
      'Solo composición de bases; ignora el orden, la concentración y la sal.',
      'Orientativa para oligos de más de 13 nt.'
    ]
  }
});

function isSelfComplementary(seq) {
  const comp = { A: 'T', T: 'A', C: 'G', G: 'C' };
  const L = seq.length;
  for (let i = 0; i < L; i++) if (comp[seq[i]] !== seq[L - 1 - i]) return false;
  return true;
}

/**
 * Tm por vecino más cercano. Devuelve null (con motivo) si la secuencia contiene
 * bases ambiguas o es demasiado corta.
 * @param {string} seq  secuencia 5'→3' en mayúsculas, solo A/C/G/T
 * @param {{primerConc_nM?: number, Na_mM?: number}} cond
 * @returns {{ tm: number|null, dH: number, dS: number, dS_salt: number, details: object, error?: string }}
 */
export function tmNearestNeighbor(seq, cond = {}) {
  const c = { ...DEFAULT_CONDITIONS, ...cond };
  if (!/^[ACGT]+$/.test(seq)) return { tm: null, error: 'El método NN requiere solo bases A, C, G, T (sin códigos ambiguos).' };
  if (seq.length < 8) return { tm: null, error: 'Secuencia demasiado corta para el modelo NN (mínimo 8 nt).' };

  let dH = 0, dS = 0;
  for (let i = 0; i < seq.length - 1; i++) {
    const p = NN_PARAMS[seq.slice(i, i + 2)];
    dH += p.dH; dS += p.dS;
  }
  for (const end of [seq[0], seq[seq.length - 1]]) {
    const t = (end === 'G' || end === 'C') ? INIT_GC : INIT_AT;
    dH += t.dH; dS += t.dS;
  }
  const symmetric = isSelfComplementary(seq);
  if (symmetric) dS += SYMMETRY_DS;

  const N = seq.length - 1;
  const NaEq_mM = effectiveNa(c);
  const dS_salt = dS + 0.368 * N * Math.log(NaEq_mM / 1000);
  const C = c.primerConc_nM * 1e-9;
  const concTerm = symmetric ? Math.log(C) : Math.log(C / 4);
  const tm = (dH * 1000) / (dS_salt + R * concTerm) - 273.15;

  return {
    tm, dH, dS, dS_salt, symmetric, NaEq_mM,
    details: {
      method: 'nn',
      steps: seq.length - 1,
      primerConc_nM: c.primerConc_nM,
      Na_mM: c.Na_mM, Mg_mM: c.Mg_mM || 0, dNTP_mM: c.dNTP_mM || 0,
      NaEq_mM: Math.round(NaEq_mM * 10) / 10,
      formula: symmetric
        ? 'Tm = ΔH·1000 / (ΔS_sal + R·ln C) − 273.15  (autocomplementaria)'
        : 'Tm = ΔH·1000 / (ΔS_sal + R·ln(C/4)) − 273.15',
      saltFormula: 'ΔS_sal = ΔS(1 M Na⁺) + 0.368·(L−1)·ln[Na⁺eq] · Na⁺eq = Na⁺ + 120·√(Mg²⁺ − dNTP)'
    }
  };
}

/** Regla de Wallace. */
export function tmWallace(seq) {
  if (!/^[ACGT]+$/.test(seq)) return { tm: null, error: 'La regla de Wallace requiere solo bases A, C, G, T.' };
  let at = 0, gc = 0;
  for (const ch of seq) (ch === 'A' || ch === 'T') ? at++ : gc++;
  return { tm: 2 * at + 4 * gc, details: { method: 'wallace', at, gc, formula: 'Tm = 2·(A+T) + 4·(G+C)' } };
}

/** Aproximación por composición GC (Marmur–Doty, forma para N > 13). */
export function tmBasic(seq) {
  if (!/^[ACGT]+$/.test(seq)) return { tm: null, error: 'Este método requiere solo bases A, C, G, T.' };
  const N = seq.length;
  if (N <= 13) return { tm: null, error: 'La fórmula por composición solo es orientativa para más de 13 nt.' };
  let gc = 0;
  for (const ch of seq) if (ch === 'G' || ch === 'C') gc++;
  return { tm: 64.9 + 41 * (gc - 16.4) / N, details: { method: 'basic', gc, N, formula: 'Tm = 64.9 + 41·(G+C − 16.4)/N' } };
}

/**
 * Punto de entrada único.
 * @param {string} seq
 * @param {'nn'|'wallace'|'basic'} method
 * @param {object} cond
 */
export function meltingTemperature(seq, method = 'nn', cond = {}) {
  switch (method) {
    case 'wallace': return tmWallace(seq);
    case 'basic': return tmBasic(seq);
    default: return tmNearestNeighbor(seq, cond);
  }
}

/** Redondeo científico razonable: 1 decimal para Tm (la incertidumbre del modelo es ≥ ±1 °C). */
export function roundTm(tm) {
  return tm === null || tm === undefined || Number.isNaN(tm) ? null : Math.round(tm * 10) / 10;
}
