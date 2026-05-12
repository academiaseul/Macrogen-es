// Macrogen Iberoamérica - main.js
// Mobile nav toggle + smooth interactions + country selector

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
      // After reset, restore inbox note to default
      const inboxNote = form.querySelector('[data-inbox-note]');
      if (inboxNote) {
        inboxNote.innerHTML = 'Selecciona tu país para que tu solicitud llegue al hub correspondiente.';
        inboxNote.style.borderLeftColor = 'var(--mc-line)';
        inboxNote.style.color = 'var(--mc-mute)';
      }
    });
  });

  // ----- Country selector: auto-update email/phone placeholders + show inbox routing -----
  const countryConfig = {
    'ES': {
      flag: '🇪🇸', label: 'España',
      email: 'tu@laboratorio.es',
      phone: '+34 ...',
      inbox: 'info-spain@macrogen.com',
      hub: 'Madrid'
    },
    'PT': {
      flag: '🇵🇹', label: 'Portugal',
      email: 'tu@laboratorio.pt',
      phone: '+351 ...',
      inbox: 'info-spain@macrogen.com',
      hub: 'Madrid'
    },
    'CL': {
      flag: '🇨🇱', label: 'Chile',
      email: 'tu@laboratorio.cl',
      phone: '+56 9 ...',
      inbox: 'info-chile@macrogen.com',
      hub: 'Santiago'
    },
    'PE': {
      flag: '🇵🇪', label: 'Perú',
      email: 'tu@laboratorio.pe',
      phone: '+51 ...',
      inbox: 'info-chile@macrogen.com',
      hub: 'Santiago'
    },
    'OTRO': {
      flag: '🌎', label: 'Otro país',
      email: 'tu@laboratorio.com',
      phone: '+ código país ...',
      inbox: 'info-spain@macrogen.com',
      hub: 'Madrid'
    }
  };

  document.querySelectorAll('form[data-country-form]').forEach(form => {
    const select = form.querySelector('[data-country]');
    const emailInput = form.querySelector('[data-email]');
    const phoneInput = form.querySelector('[data-phone]');
    const note = form.querySelector('[data-inbox-note]');
    if (!select) return;

    select.addEventListener('change', (e) => {
      const config = countryConfig[e.target.value];
      if (!config) {
        if (note) {
          note.innerHTML = 'Selecciona tu país para que tu solicitud llegue al hub correspondiente.';
          note.style.borderLeftColor = 'var(--mc-line)';
          note.style.color = 'var(--mc-mute)';
        }
        if (emailInput) emailInput.placeholder = 'tu@laboratorio.com';
        if (phoneInput) phoneInput.placeholder = 'Selecciona país primero';
        return;
      }
      if (emailInput) emailInput.placeholder = config.email;
      if (phoneInput) phoneInput.placeholder = config.phone;
      if (note) {
        note.innerHTML = `${config.flag} <strong style="color:var(--mc-navy);">Tu solicitud llegará al hub ${config.hub}</strong><br><span style="font-size:11px;">Atención por <a href="mailto:${config.inbox}" style="color:var(--mc-teal); font-weight:700;">${config.inbox}</a></span>`;
        note.style.borderLeftColor = 'var(--mc-green)';
        note.style.color = 'var(--mc-ink)';
      }
    });
  });

});
