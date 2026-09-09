/**
 * home.js — portada de las herramientas.
 */
import { el } from './components.js';

export function mount(root) {
  root.innerHTML = '';
  root.append(
    el('div', { class: 'home' },
      el('p', { class: 'eyebrow', style: 'font-family:var(--mc-font-mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--mc-teal-ink);margin:0 0 8px' }, 'Recursos · Herramientas online gratuitas'),
      el('h1', { style: 'margin:0;font-size:30px;font-weight:600;color:var(--mc-navy);letter-spacing:-.01em' }, 'Primer Designer'),
      el('p', { class: 'lead' }, 'Diseña, verifica y calcula primers con métodos publicados y resultados explicables — gratis y sin registro. Todo el cálculo ocurre en tu navegador: tus secuencias nunca se envían a ningún servidor, ni siquiera al nuestro.'),
      el('div', { class: 'home-grid' },
        card('01', 'Diseñador de primers', 'Pega un molde y obtén pares candidatos puntuados, con posición, tamaño de producto, Tm, GC % y las razones de cada evaluación.', '#/designer'),
        card('02', 'Verificador de primers', 'Evalúa primers existentes: validez, longitud, GC %, Tm, peso molecular, homopolímeros, autocomplementariedad, 3′, horquillas y dímeros.', '#/checker'),
        card('03', 'Calculadora Tm / GC', 'Longitud, composición, GC %, Tm por tres métodos (con sus supuestos) y peso molecular de un oligonucleótido.', '#/calculator')
      ),
      el('div', { class: 'home-notes' },
        note('Transparencia científica', ['Tm por vecino más cercano (SantaLucia 1998) con sal y Mg²⁺/dNTP (von Ahsen 2001); Wallace y Marmur–Doty como referencia.', 'Peso molecular con la fórmula de IDT para ssDNA anhidro.', 'Especificidad sobre el molde con los umbrales de Primer-BLAST; cribados de estructura sin ΔG, con umbrales visibles.', 'Cada resultado incluye «¿Qué significa?» y «Detalles del cálculo».']),
        note('Privacidad de los datos', ['Todo el cálculo se ejecuta en tu navegador.', 'Ninguna secuencia se envía a ningún servidor — ni siquiera al nuestro.', 'Tus secuencias no se almacenan: sin registro, sin localStorage, sin base de datos.', 'Los datos de ejemplo están etiquetados como tales.']),
        note('Sobre esta herramienta', ['Versión beta: agradecemos sugerencias en info-spain@macrogen.com o info-chile@macrogen.com.', 'Para especificidad genómica real, cada par incluye acceso directo a Primer-BLAST (NCBI).', 'Los primers que diseñes se pueden pedir directamente: síntesis con QC MALDI-TOF.', 'Complemento de los 96 primers universales gratuitos del servicio Sanger.'])
      )
    )
  );
}
export function unmount() {}

function card(num, title, text, href) {
  return el('a', { class: 'home-card', href },
    el('div', { class: 'num' }, num), el('h2', {}, title), el('p', {}, text), el('span', { class: 'go' }, 'Abrir →'));
}
function note(title, items) {
  return el('section', { class: 'panel' }, el('div', { class: 'panel-h' }, title), el('div', { class: 'panel-b' }, el('ul', {}, ...items.map(i => el('li', {}, i)))));
}
