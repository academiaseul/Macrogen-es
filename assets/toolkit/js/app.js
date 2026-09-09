/**
 * app.js — enrutador por hash y montaje de vistas.
 * Rutas: #/  #/designer  #/checker  #/calculator
 */
import * as home from './ui/home.js';
import * as designer from './ui/designer.js';
import * as checker from './ui/checker.js';
import * as calculator from './ui/calculator.js';

const routes = { '': home, designer, checker, calculator };
const titles = { '': 'Inicio', designer: 'Diseñador de primers', checker: 'Verificador de primers', calculator: 'Calculadora Tm / GC' };
let current = null;

function route() {
  const key = (location.hash.replace(/^#\/?/, '').split(/[/?]/)[0] || '').toLowerCase();
  const view = routes[key] || home;
  const name = routes[key] ? key : '';
  const main = document.getElementById('main');
  if (current && current.unmount) current.unmount();
  current = view;
  view.mount(main);
  document.title = name
    ? `${titles[name]} · Primer Designer | Macrogen`
    : 'Primer Designer: primers y Tm online gratis | Macrogen';
  document.querySelectorAll('.tk-nav a[data-route]').forEach(a => {
    if (a.dataset.route === name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  window.scrollTo({ top: 0, behavior: 'auto' });
}

window.addEventListener('hashchange', route);
route();
