// Macrogen Chile - main.js
// Mobile nav toggle + smooth interactions

document.addEventListener('DOMContentLoaded', () => {

  // ----- Mobile nav toggle -----
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', menu.classList.contains('is-open'));
    });
  }

  // ----- Smooth animated counters (if any present) -----
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length) {
    const animate = (el) => {
      const target = parseInt(el.dataset.counter, 10);
      const duration = 1400;
      const start = performance.now();
      const fmt = (n) => n.toLocaleString('es-CL');
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.floor(target * eased));
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = fmt(target);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animate(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(c => io.observe(c));
  }

  // ----- Forms: friendly demo submit -----
  document.querySelectorAll('form[data-demo]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const note = form.querySelector('[data-demo-msg]');
      if (note) {
        note.textContent = '¡Gracias! Recibimos tu solicitud. Nuestro equipo te contactará en breve.';
        note.style.color = '#84BD00';
      } else {
        alert('¡Gracias! Recibimos tu solicitud. Nuestro equipo te contactará en breve.');
      }
      form.reset();
    });
  });

});
