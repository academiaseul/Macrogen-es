// Macrogen Iberoamérica - main.js
// Mobile nav · counters · country selector · Formspree real email submission

document.addEventListener('DOMContentLoaded', () => {

  // ========== Mobile nav toggle ==========
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', menu.classList.contains('is-open'));
    });
  }

  // ========== Animated stat counters ==========
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

  // ========== COUNTRY ROUTING CONFIG ==========
  // Each country routes to ONE recipient (no more dual recipients)
  // ES, PT  → chash@macrogen.com   (Madrid hub)
  // CL, PE, OTRO → jaykim@macrogen.com (Santiago hub)
  const countryConfig = {
    'ES': {
      flag: '🇪🇸', label: 'España',
      email: 'tu@laboratorio.es', phone: '+34 ...',
      to: 'chash@macrogen.com',
      hub: 'Madrid'
    },
    'PT': {
      flag: '🇵🇹', label: 'Portugal',
      email: 'tu@laboratorio.pt', phone: '+351 ...',
      to: 'chash@macrogen.com',
      hub: 'Madrid'
    },
    'CL': {
      flag: '🇨🇱', label: 'Chile',
      email: 'tu@laboratorio.cl', phone: '+56 9 ...',
      to: 'jaykim@macrogen.com',
      hub: 'Santiago'
    },
    'PE': {
      flag: '🇵🇪', label: 'Perú',
      email: 'tu@laboratorio.pe', phone: '+51 ...',
      to: 'jaykim@macrogen.com',
      hub: 'Santiago'
    },
    'OTRO': {
      flag: '🌎', label: 'Otro país',
      email: 'tu@laboratorio.com', phone: '+ código país ...',
      to: 'jaykim@macrogen.com',
      hub: 'Santiago'
    }
  };

  // ========== Country selector: live-update placeholders + inbox preview ==========
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
        note.innerHTML = `${config.flag} <strong style="color:var(--mc-navy);">Tu solicitud llegará al hub ${config.hub}</strong><br><span style="font-size:11px;">Atención por <a href="mailto:${config.to}" style="color:var(--mc-teal); font-weight:700;">${config.to}</a></span>`;
        note.style.borderLeftColor = 'var(--mc-green)';
        note.style.color = 'var(--mc-ink)';
      }
    });
  });

  // ========== FAQ live search: filter questions by keyword ==========
  const faqInput = document.querySelector('[data-faq-search]');
  if (faqInput) {
    const allItems = document.querySelectorAll('.faq-item');
    const allSections = document.querySelectorAll('[data-faq-section]');
    const countEl = document.querySelector('[data-faq-count]');
    const emptyState = document.querySelector('[data-faq-empty]');
    const emptyQuery = document.querySelector('[data-faq-empty-query]');
    const clearBtn = document.querySelector('[data-faq-clear]');
    const totalCount = allItems.length;

    // Pre-cache lowercased text for each item (faster filtering)
    const itemTexts = Array.from(allItems).map(item => item.textContent.toLowerCase());

    const runFilter = () => {
      const q = faqInput.value.toLowerCase().trim();
      let visible = 0;

      // Show/hide clear button
      if (clearBtn) clearBtn.hidden = !q;

      // Filter items
      allItems.forEach((item, i) => {
        const matches = !q || itemTexts[i].includes(q);
        item.classList.toggle('is-hidden', !matches);
        if (matches) visible++;
      });

      // Hide sections that have no visible items
      allSections.forEach(section => {
        const visibleInSection = section.querySelectorAll('.faq-item:not(.is-hidden)').length;
        section.classList.toggle('is-hidden', visibleInSection === 0);
      });

      // Update count + empty state
      if (q && visible === 0) {
        if (emptyState) emptyState.hidden = false;
        if (emptyQuery) emptyQuery.textContent = q;
        if (countEl) countEl.innerHTML = `Sin resultados para "<strong>${q}</strong>"`;
      } else {
        if (emptyState) emptyState.hidden = true;
        if (countEl) {
          if (q) {
            countEl.innerHTML = `Mostrando <strong>${visible}</strong> de ${totalCount} preguntas para "<strong>${q}</strong>"`;
          } else {
            countEl.innerHTML = `Mostrando todas las <strong>${totalCount}</strong> preguntas`;
          }
        }
      }
    };

    // Debounce input for smoother typing
    let debounceTimer;
    faqInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(runFilter, 80);
    });

    // Clear button
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        faqInput.value = '';
        runFilter();
        faqInput.focus();
      });
    }

    // Esc key to clear
    faqInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        faqInput.value = '';
        runFilter();
      }
    });
  }

  // ========== Form submit: handles BOTH cotización + newsletter forms ==========
  // Cotización form has data-country-form (routes by country)
  // Newsletter form has only data-demo (just email)
  document.querySelectorAll('form[data-demo]').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const note = form.querySelector('[data-demo-msg]');
      const inboxNote = form.querySelector('[data-inbox-note]');
      const submitBtn = form.querySelector('button[type="submit"]');
      const isNewsletter = !form.hasAttribute('data-country-form');

      // Disable submit while sending
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.textContent;
        submitBtn.textContent = isNewsletter ? 'Suscribiendo...' : 'Enviando...';
      }

      const formData = new FormData(form);

      // ============== NEWSLETTER FORM PATH ==============
      if (isNewsletter) {
        const email = (formData.get('email') || '').trim();
        if (!email) {
          if (note) note.innerHTML = '⚠️ <strong style="color:#E0004D;">Por favor introduce un correo electrónico válido.</strong>';
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.originalText || 'Suscribirme';
          }
          return;
        }
        // Inject Formspree metadata for newsletter
        formData.set('_subject', `Nueva suscripción newsletter · ${email}`);
        formData.set('_format', 'plain');
        formData.set('form_type', 'newsletter');
        formData.set('Origen', 'macrogen-es.com / newsletter');

        try {
          const res = await fetch('https://formspree.io/f/xaqvkoaw', {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
          });
          if (res.ok) {
            if (note) note.innerHTML = '✅ <strong style="color:#84BD00;">¡Te suscribiste correctamente!</strong> Recibirás el primer newsletter el próximo lunes.';
            form.reset();
          } else {
            if (note) note.innerHTML = '⚠️ <strong style="color:#E0004D;">Hubo un problema. Intenta de nuevo o escribe a info-spain@macrogen.com.</strong>';
          }
        } catch (err) {
          if (note) note.innerHTML = '⚠️ <strong style="color:#E0004D;">Error de conexión. Verifica tu internet.</strong>';
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.originalText || 'Suscribirme';
          }
        }
        return;
      }

      // ============== COTIZACIÓN FORM PATH (country routing) ==============
      const country = formData.get('pais');

      // Validate country was picked
      if (!country || country === '') {
        if (inboxNote) {
          inboxNote.innerHTML = '⚠️ <strong style="color:var(--mc-red);">Por favor selecciona tu país antes de enviar.</strong>';
          inboxNote.style.borderLeftColor = 'var(--mc-red)';
          inboxNote.style.color = 'var(--mc-red)';
        }
        const sel = form.querySelector('[data-country]');
        if (sel) sel.focus();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.originalText || 'Enviar solicitud';
        }
        return;
      }

      const config = countryConfig[country] || countryConfig['OTRO'];

      // Pull form values for the email subject
      const institucion = (formData.get('institucion') || '').trim() || 'Sin institución';
      const servicio = (formData.get('servicio') || '').trim() || 'Sin servicio';
      const visitorEmail = (formData.get('email') || '').trim();

      // Append Formspree configuration fields
      // _cc: SINGLE recipient based on country (no more dual emails to avoid duplicates)
      // _replyto: clicking Reply in the email goes to the visitor
      // _subject: human-readable subject line
      // _format: plain text email
      formData.set('_cc', config.to);
      formData.set('_replyto', visitorEmail);
      formData.set('_subject', `Nueva cotización · ${config.flag} ${config.label} · ${servicio} · ${institucion}`);
      formData.set('_format', 'plain');

      // Add helpful metadata fields (visible in the email body and Formspree dashboard)
      formData.set('Hub asignado', config.hub);
      formData.set('País (display)', `${config.flag} ${config.label}`);
      formData.set('Destinatario', config.to);
      formData.set('Origen', 'macrogen-es.com / contacto.html');

      // Submit to Formspree
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          // Success
          if (note) {
            note.innerHTML = `✅ <strong style="color:#84BD00; font-size:14px;">¡Solicitud enviada con éxito!</strong><br>Te contactaremos en menos de 24h hábiles desde el hub <strong>${config.hub}</strong> (${config.to}).`;
            note.style.color = 'var(--mc-ink)';
          }
          form.reset();
          // Restore inbox note to default
          if (inboxNote) {
            inboxNote.innerHTML = 'Selecciona tu país para que tu solicitud llegue al hub correspondiente.';
            inboxNote.style.borderLeftColor = 'var(--mc-line)';
            inboxNote.style.color = 'var(--mc-mute)';
          }
        } else {
          // HTTP error from Formspree
          const errorData = await res.json().catch(() => ({}));
          const errorMsg = errorData.errors ? errorData.errors.map(e => e.message).join(', ') : `HTTP ${res.status}`;
          if (note) {
            note.innerHTML = `⚠️ <strong style="color:#E0004D;">Hubo un problema enviando tu solicitud (${errorMsg}).</strong><br>Por favor intenta de nuevo o escribe directo a <a href="mailto:${config.to}" style="color:var(--mc-teal);">${config.to}</a>`;
          }
        }
      } catch (err) {
        // Network error
        if (note) {
          note.innerHTML = `⚠️ <strong style="color:#E0004D;">Error de conexión.</strong><br>Verifica tu conexión a internet o escribe directo a <a href="mailto:${config.to}" style="color:var(--mc-teal);">${config.to}</a>`;
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.originalText || 'Enviar solicitud';
        }
      }
    });
  });

});
