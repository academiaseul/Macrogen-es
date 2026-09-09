/**
 * strings.js — textos de la interfaz (español) y glosario educativo.
 * Centralizado para facilitar traducción y revisión científica del copy.
 */

export const STATUS_LABEL = {
  OPTIMAL: 'Óptimo',
  ACCEPTABLE: 'Aceptable',
  REVIEW: 'Revisar',
  NOT_RECOMMENDED: 'No recomendado',
  NA: 'Sin evaluar'
};

/** Interpretación de calidad para la cabecera del verificador. */
export const QUALITY_WORD = {
  OPTIMAL: 'Buena',
  ACCEPTABLE: 'Aceptable',
  REVIEW: 'Requiere revisión',
  NOT_RECOMMENDED: 'No recomendada',
  NA: '—'
};

export const QUALITY_WHY = {
  OPTIMAL: 'Cumple todos los criterios de cribado de la herramienta: longitud, GC %, Tm, sin homopolímeros largos, baja autocomplementariedad y extremo 3′ sin riesgo detectado.',
  ACCEPTABLE: 'Cumple los criterios principales con alguna desviación menor. Revisa las observaciones antes de pedir.',
  REVIEW: 'Presenta uno o más indicadores de riesgo (por ejemplo complementariedad 3′, horquilla o Tm fuera de rango). Conviene revisarlo o rediseñarlo.',
  NOT_RECOMMENDED: 'Varios criterios fallan o hay un riesgo claro de dímero/horquilla. Se recomienda rediseñar.',
  NA: 'No se ha podido evaluar.'
};

export const GLOSSARY = {
  tm: {
    title: '¿Qué es la Tm?',
    body: [
      'La temperatura de fusión (Tm) es la temperatura a la que la mitad de las moléculas del primer están hibridadas con su secuencia complementaria y la otra mitad separadas.',
      'Depende de la secuencia y de las condiciones (concentración de primer, sales, aditivos). Por eso esta herramienta muestra siempre el método y los parámetros usados. Para PCR se suele elegir una temperatura de anillamiento unos 3–5 °C por debajo de la Tm más baja del par.'
    ]
  },
  gc: {
    title: '¿Qué es el GC %?',
    body: [
      'Es el porcentaje de bases G y C en el primer. Los pares G·C forman tres puentes de hidrógeno (frente a dos en A·T) y apilan mejor, así que un GC % alto eleva la Tm.',
      'Para primers de PCR se suele buscar 40–60 %. Valores muy altos favorecen uniones inespecíficas y estructuras secundarias; muy bajos dan Tm demasiado baja.'
    ]
  },
  good: {
    title: '¿Qué hace bueno a un primer?',
    body: [
      'Como orientación general: 18–25 nt, GC 40–60 %, Tm 55–65 °C y diferencia de Tm entre forward y reverse ≤ 3 °C.',
      'Además: sin carreras de 5+ bases iguales, 1–3 G/C en las últimas 5 bases del 3′ («GC clamp» moderado), y baja complementariedad consigo mismo, con su pareja y dentro de sí mismo (horquillas).'
    ]
  },
  dimer: {
    title: '¿Qué es un dímero de primers?',
    body: [
      'Es un producto artefactual que se forma cuando dos primers (o dos copias del mismo) se hibridan entre sí y la polimerasa los extiende. Consume primers y dNTPs y compite con el producto deseado.',
      'El riesgo es mayor cuando los extremos 3′ son complementarios, porque la polimerasa solo extiende desde un 3′ apareado. Los cribados de esta herramienta cuentan pares complementarios en alineamientos sin huecos; no calculan ΔG.'
    ]
  },
  end3: {
    title: '¿Qué es la complementariedad 3′?',
    body: [
      'Mide cuántas bases consecutivas del extremo 3′ de un primer pueden aparearse con otro primer (o con otra copia del mismo). Es el indicador más importante de riesgo de dímero porque la extensión por la polimerasa empieza en el 3′.',
      'Umbrales de la herramienta: ≤ 2 pb bien · 3 pb revisar · ≥ 4 pb no recomendado.'
    ]
  },
  hairpin: {
    title: '¿Qué es una horquilla?',
    body: [
      'Una estructura intramolecular en la que dos regiones del mismo primer se aparean formando un «tallo» cerrado por un «bucle». Puede impedir que el primer se una al molde.',
      'La herramienta busca tallos antiparalelos perfectos de ≥ 3 pb con bucles de ≥ 3 nt. Umbrales: ≤ 3 pb bien · 4 pb revisar · ≥ 5 pb no recomendado.'
    ]
  },
  homopolymer: {
    title: '¿Qué es un homopolímero?',
    body: [
      'Una carrera de bases idénticas consecutivas (p. ej. AAAAA). Las carreras largas favorecen el deslizamiento de la polimerasa y el cebado fuera de registro.',
      'Se recomienda evitar carreras de 5 o más bases.'
    ]
  },
  clamp: {
    title: '¿Qué es el «GC clamp»?',
    body: [
      'La presencia de G o C en las últimas bases del extremo 3′ estabiliza la unión justo donde la polimerasa empieza a extender.',
      'Se recomienda 1–3 G/C en las últimas 5 bases. Más de 3 favorece cebado inespecífico.'
    ]
  },
  mw: {
    title: '¿Qué es el peso molecular?',
    body: [
      'Masa de una molécula del oligo, en g/mol. Se calcula sumando el peso de cada nucleótido y restando la masa perdida al formar los enlaces fosfodiéster.',
      'La herramienta usa la fórmula de IDT para ADN monocatenario anhidro sin modificaciones. Se utiliza para convertir masa en moles y preparar diluciones.'
    ]
  },
  self: {
    title: '¿Qué es la autocomplementariedad?',
    body: [
      'Cuántas bases de un primer pueden aparearse con otra copia de sí mismo en el mejor alineamiento antiparalelo sin huecos. Valores altos indican riesgo de dímero consigo mismo.',
      'Umbrales de la herramienta (pares en el mejor alineamiento): ≤ 6 bien · 7–8 revisar · > 8 no recomendado. El máximo 8 es el valor por defecto de Primer3 (PRIMER_MAX_SELF_ANY).'
    ]
  },
  salt: {
    title: 'Concentración de Na⁺',
    body: [
      'Los cationes monovalentes apantallan la repulsión entre las cargas negativas de los fosfatos y estabilizan el dúplex, elevando la Tm.',
      'El modelo aplica ΔS + 0.368·(L−1)·ln[Na⁺eq] (SantaLucia 1998), donde Na⁺eq incluye la contribución del Mg²⁺ (ver el «?» de Mg²⁺).'
    ]
  },
  mg: {
    title: 'Mg²⁺ y dNTPs',
    body: [
      'El Mg²⁺ estabiliza el dúplex mucho más que el Na⁺; los dNTPs lo quelan y restan Mg²⁺ libre. Ambos afectan a la Tm real en PCR.',
      'Se modela con la aproximación de von Ahsen et al. (2001), la misma que usa Primer3/Primer-BLAST: Na⁺eq = Na⁺ + 120·√(Mg²⁺ − dNTP), en mM. Si dNTP ≥ Mg²⁺, no se aplica corrección.'
    ]
  },
  specificity: {
    title: '¿Qué es la especificidad?',
    body: [
      'Un par de primers es específico cuando solo amplifica el producto previsto. Sitios de unión parecidos en otras partes del molde (o del genoma) pueden generar productos no deseados.',
      'Esta herramienta escanea AMBAS hebras del molde con hasta 3 mismatches y aplica el criterio por defecto de Primer-BLAST: un sitio se considera seguro si tiene ≥2 mismatches totales y ≥2 de ellos en las últimas 5 bases del 3′; se ignoran productos >4.000 pb.',
      'Importante: solo se analiza el molde que pegaste. La especificidad frente a un genoma completo requiere BLAST — usa Primer-BLAST (NCBI) para esa verificación.'
    ]
  },
  target: {
    title: 'Región objetivo',
    body: [
      'Rango del molde (posiciones 1-based) que el amplicón debe contener: el forward termina antes de la región y el reverse empieza después. Los primers nunca se solapan con ella.',
      'Útil para amplificar alrededor de un SNP, un exón o un sitio de inserción. Equivale al «target» de Primer-BLAST/Primer3.'
    ]
  },
  direpeat: {
    title: 'Repeticiones dinucleotídicas',
    body: [
      'Carreras del tipo ATATATAT o CACACACA. Igual que los homopolímeros, favorecen el deslizamiento de la polimerasa y el cebado fuera de registro.',
      'Umbrales de la herramienta: ≤4 unidades bien · 5 revisar · >5 no recomendado.'
    ]
  },
  ownprimers: {
    title: 'Usar mis propios primers',
    body: [
      'Si ya tienes uno de los dos primers (o ambos), pégalo aquí y el diseñador buscará solo la pareja que falta, evaluando ΔTm, dímeros cruzados y especificidad contra tu primer.',
      'El primer fijado debe coincidir exactamente con el molde (5′→3′). Si tiene varios sitios, se consideran hasta 3.'
    ]
  },
  conc: {
    title: 'Concentración de primer',
    body: [
      'A mayor concentración total de oligo, mayor Tm (término R·ln(C/4) para dúplex no autocomplementarios en los que el primer está en exceso).',
      'Un valor típico en PCR es 200–500 nM; OligoAnalyzer usa 250 nM por defecto.'
    ]
  },
  product: {
    title: 'Tamaño de producto',
    body: [
      'Longitud del amplicón desde el 5′ del forward hasta el 5′ del reverse (ambos incluidos), en pares de bases.',
      'Para PCR convencional y secuenciación Sanger suelen usarse productos de 150–1000 pb; para qPCR, 70–200 pb.'
    ]
  }
};
