// Macrogen Iberoamérica - main.js
// Mobile nav · counters · country selector · Formspree real email submission

document.addEventListener('DOMContentLoaded', () => {

  // ========== Announcement bar · one config for the whole site ==========
  // The bar is INJECTED here on every page (no HTML copies to maintain).
  // While `ends` has not passed it shows everywhere, including servicios/
  // and blog/ pages; after that date the bar AND the megamenu promo tiles
  // that mention the code disappear automatically. Next campaign = edit
  // this PROMO object only. Test an expired promo with ?showpromo=1.
  const PATH_PREFIX = /\/(servicios|blog)\//.test(location.pathname) ? '../' : '';
  const PROMO = {
    code: 'NUEVO10',
    ends: '2026-08-31', // last valid day, inclusive (local time)
    html: '<span class="lb-tag">LANZAMIENTO WEB</span> <strong>10% OFF</strong> en <strong>Sanger · NGS · Oligos &amp; Síntesis</strong> con código <code class="lb-code">NUEVO10</code> · hasta 31 ago 2026 <a href="{pre}contacto?promo=NUEVO10" class="lb-cta">Cotizar →</a>'
  };

  (function renderPromo() {
    const force = new URLSearchParams(location.search).get('showpromo') === '1';
    const active = force || Date.now() <= new Date(PROMO.ends + 'T23:59:59').getTime();
    if (active) {
      const bar = document.createElement('div');
      bar.className = 'launch-bar';
      bar.innerHTML = PROMO.html.replace(/\{pre\}/g, PATH_PREFIX);
      document.body.insertBefore(bar, document.body.firstChild);
    } else {
      document.querySelectorAll('.nav-megamenu a').forEach(a => {
        if (a.textContent.includes(PROMO.code)) a.remove();
      });
    }
  })();

  // ========== Cookie consent (RGPD) · Google Consent Mode v2 ==========
  // Every page starts with all consent DENIED (see the gtag snippet in
  // <head>). GA4 falls back to cookieless pings; full analytics cookies and
  // Microsoft Clarity load only after the visitor accepts. The choice is
  // remembered in localStorage['mc_consent'] = 'granted' | 'denied'.
  (function cookieConsent() {
    const KEY = 'mc_consent';

    function loadClarity() {
      if (window.clarity) return;
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "x8wd9440bz");
    }

    function grantAll() {
      if (typeof gtag === 'function') {
        gtag('consent', 'update', {
          'analytics_storage': 'granted',
          'ad_storage': 'granted',
          'ad_user_data': 'granted',
          'ad_personalization': 'granted'
        });
      }
      loadClarity();
    }

    const saved = localStorage.getItem(KEY);
    if (saved === 'granted') { grantAll(); return; }
    if (saved === 'denied') return;

    const box = document.createElement('div');
    box.className = 'consent-banner';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Aviso de cookies');
    box.innerHTML =
      '<p><span data-i18n="consent.text">Usamos cookies de analítica (GA4 y Clarity) para entender cómo se usa la web y mejorarla. Solo se activan si aceptas.</span> ' +
      '<a href="' + PATH_PREFIX + 'privacidad" data-i18n="consent.more">Más información</a></p>' +
      '<div class="consent-actions">' +
      '<button type="button" class="btn-consent-accept" data-i18n="consent.accept">Aceptar</button>' +
      '<button type="button" class="btn-consent-reject" data-i18n="consent.reject">Solo esenciales</button>' +
      '</div>';
    document.body.appendChild(box);
    box.querySelector('.btn-consent-accept').addEventListener('click', () => {
      localStorage.setItem(KEY, 'granted'); grantAll(); box.remove();
    });
    box.querySelector('.btn-consent-reject').addEventListener('click', () => {
      localStorage.setItem(KEY, 'denied'); box.remove();
    });
  })();

  // ========== Main header Servicios mega menu · click-to-pin ==========
  // The mega menu opens on hover (CSS), but ALSO supports clicking the
  // "Servicios" link to PIN it open. Useful for keyboard users, mobile, and
  // users who want to browse the menu without keeping cursor on it.
  document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
    const trigger = dropdown.querySelector(':scope > a');
    if (!trigger) return;

    // Click on the trigger toggles the .is-open class (keeps menu pinned)
    trigger.addEventListener('click', e => {
      // Only intercept on desktop where the megamenu is shown
      if (window.innerWidth < 769) return;
      // Allow default behavior (navigation) on second click
      if (dropdown.classList.contains('is-open')) {
        // Second click = let navigation happen
        return;
      }
      e.preventDefault();
      dropdown.classList.add('is-open');
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (dropdown.classList.contains('is-open') && !dropdown.contains(e.target)) {
        dropdown.classList.remove('is-open');
      }
    });

    // Close on mouseleave with a small delay (mirror CSS transition)
    let leaveTimer;
    dropdown.addEventListener('mouseleave', () => {
      clearTimeout(leaveTimer);
      leaveTimer = setTimeout(() => {
        // Only close if not pinned by click
        if (!dropdown.classList.contains('is-open')) return;
        // Auto-unpin only if cursor really left (debounce)
        if (!dropdown.matches(':hover')) {
          dropdown.classList.remove('is-open');
        }
      }, 500);
    });
    dropdown.addEventListener('mouseenter', () => {
      clearTimeout(leaveTimer);
    });
  });

  // Close mega menus on Escape (added once globally)
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-dropdown.is-open').forEach(d => d.classList.remove('is-open'));
    }
  });

  // ========== Service switcher dropdown · tap-to-toggle for mobile ==========
  // Desktop uses :hover CSS; mobile needs explicit toggle on tap.
  // Also closes on outside click and Escape key.
  document.querySelectorAll('[data-service-switcher]').forEach(switcher => {
    const trigger = switcher.querySelector('[data-switcher-trigger]');
    if (!trigger) return;

    trigger.addEventListener('click', e => {
      e.preventDefault();
      const isOpen = switcher.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close when clicking outside
    document.addEventListener('click', e => {
      if (switcher.classList.contains('is-open') && !switcher.contains(e.target)) {
        switcher.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Escape closes all open switchers
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('[data-service-switcher].is-open').forEach(s => {
        s.classList.remove('is-open');
        const t = s.querySelector('[data-switcher-trigger]');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // ========== Sticky header height → CSS variable ==========
  // Exposes the actual rendered height of the main site-header as --header-h
  // so .service-subnav (and any other below-header sticky element) can stack
  // immediately below it across all viewport sizes + translation changes.
  (function syncHeaderHeight() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    function update() {
      const h = header.offsetHeight || 78;
      document.documentElement.style.setProperty('--header-h', h + 'px');
    }
    update();

    // Re-measure on viewport changes (mobile nav open, font swap, translation, etc.)
    if (window.ResizeObserver) {
      new ResizeObserver(update).observe(header);
    } else {
      window.addEventListener('resize', update, { passive: true });
    }
    // Also re-measure when fonts finish loading (Inter changes header height slightly)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(update);
    }
  })();


  // ========== CONTACT FORM · detect ?promo= URL param and pre-fill ==========
  // When user arrives at contacto.html?promo=NUEVO10 from the popup,
  // show a confirmation banner + inject hidden field so Sales sees the code in Brevo.
  (function initPromoBanner() {
    const promo = new URLSearchParams(window.location.search).get('promo');
    if (!promo) return;
    const form = document.querySelector('form[data-country-form]');
    if (!form) return;

    // Inject hidden field so Sales sees "Código promo: NUEVO10" in the email
    let hidden = form.querySelector('input[name="codigo_promo"]');
    if (!hidden) {
      hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = 'codigo_promo';
      form.appendChild(hidden);
    }
    hidden.value = promo;

    // Inject confirmation banner above the form
    const formSection = form.closest('section, div');
    if (!formSection) return;
    const banner = document.createElement('div');
    banner.className = 'promo-banner-inline';
    banner.innerHTML = `
      <span class="promo-banner-icon"></span>
      <div class="promo-banner-text">
        <strong>Aplicaremos tu descuento de lanzamiento</strong>
        <span>Código <code>${promo}</code> · 10% OFF en Sanger · NGS · Oligos &amp; Síntesis · vigente hasta 31 ago 2026</span>
      </div>
    `;
    form.parentNode.insertBefore(banner, form);

    // Re-run i18n for the freshly injected banner
    if (window.MacrogenI18n) {
      window.MacrogenI18n.setLanguage(window.MacrogenI18n.getLanguage());
    }
  })();

  // ========== PROMO POPUP · NUEVO10 launch campaign · 10% off CES + NGS + Oligos ==========
  // Triggers only on home page (index.html or /).
  // Activates with website launch and runs through Aug 31, 2026.
  // Snoozes for 7 days when user dismisses or clicks "Order Now".
  // Condition: web request + sample receipt must both occur before Aug 31.
  (function initPromoPopup() {
    const STORAGE_KEY = 'mc_promo_nuevo10_dismissed_until';
    const STARTS_AT  = new Date('2026-06-15T00:00:00Z').getTime();
    const EXPIRES_AT = new Date('2026-09-01T00:00:00Z').getTime();
    const SHOW_AFTER_MS = 3000;
    const SNOOZE_DAYS = 7;

    const urlParams = new URLSearchParams(window.location.search);

    // Force-show escape hatch for testing/demos: macrogen-es.com/?showpromo=1
    // Also clears the snooze flag so subsequent visits show it again naturally.
    const forceShow = urlParams.get('showpromo') === '1';
    if (forceShow) {
      localStorage.removeItem(STORAGE_KEY);
      console.log('[promo] force-show triggered, snooze cleared');
    }

    // Show the popup as a pre-launch teaser too — the message "vigente hasta
    // 31 ago 2026" is valid before, during, and we only stop after expiry.
    // STARTS_AT kept as a comment for documentation purposes only.
    if (Date.now() >= EXPIRES_AT) return;

    // Only show on home page (unless force-show)
    const path = window.location.pathname.replace(/\/$/, '').toLowerCase();
    const isHome =
      path === '' ||
      path === '/' ||
      path.endsWith('/index.html') ||
      path.endsWith('index.html') ||
      path === '/macrogen-es' ||
      path === '/macrogen-es/';
    if (!forceShow && !isHome) {
      console.log('[promo] not on home page, skipping. path:', path);
      return;
    }

    // Bail if recently dismissed (unless force-show)
    const dismissedUntil = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    if (!forceShow && dismissedUntil > Date.now()) {
      const daysLeft = Math.ceil((dismissedUntil - Date.now()) / 86400000);
      console.log('[promo] snoozed for', daysLeft, 'more days. To force show: append ?showpromo=1 to URL');
      return;
    }

    // Build popup HTML
    const overlay = document.createElement('div');
    overlay.className = 'promo-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'promo-title');
    overlay.innerHTML = `
      <div class="promo-modal">
        <button class="promo-close" data-promo-close aria-label="Close">×</button>
        <div class="promo-banner">
          <span class="promo-decoration"></span>
          <span class="promo-eyebrow">◉ &nbsp;LANZAMIENTO · WEB NUEVA</span>
          <div class="promo-discount">10%</div>
        </div>
        <div class="promo-body">
          <h3 class="promo-title" id="promo-title">de descuento en TODOS los servicios</h3>
          <p class="promo-subtitle">Para celebrar nuestra <strong>nueva web</strong> · aplicable a tu próxima cotización en España, Portugal, Chile y Perú</p>
          <div class="promo-services">
            <div class="promo-service-pill is-sanger">
              <span class="ico">🧬</span>
              <div class="name">SANGER</div>
              <div class="desc">24-48 h</div>
            </div>
            <div class="promo-service-pill is-ngs">
              <span class="ico">🔬</span>
              <div class="name">NGS</div>
              <div class="desc">WGS · WES · RNA</div>
            </div>
            <div class="promo-service-pill is-synth">
              <span class="ico">⚗️</span>
              <div class="name">SÍNTESIS</div>
              <div class="desc">DNA · RNA · Pep</div>
            </div>
          </div>
          <div class="promo-code-box">
            <div class="promo-code-info">
              <div class="promo-code-label">Usa el código</div>
              <div class="promo-code-value" data-promo-code>NUEVO10</div>
            </div>
            <button class="promo-copy-btn" data-promo-copy>Copiar</button>
          </div>
          <div class="promo-actions">
            <a href="contacto" class="promo-btn-order" data-promo-order>Aplicar descuento →</a>
            <button type="button" class="promo-btn-dismiss" data-promo-dismiss>Tal vez después</button>
          </div>
          <p class="promo-validity">⏱ Disponible <strong>hasta el 31 de agosto de 2026</strong> · Solicitud web + recepción de muestras antes del cierre</p>
          <button type="button" class="promo-btn-never" data-promo-never aria-label="Stop showing this promotion" style="display:block; margin:12px auto 0; background:transparent; border:none; color:rgba(255,255,255,0.42); font-size:11px; cursor:pointer; text-decoration:underline; letter-spacing:0.3px; font-weight:500; padding:6px 12px; transition:color 0.2s;" onmouseover="this.style.color='rgba(255,255,255,0.85)';" onmouseout="this.style.color='rgba(255,255,255,0.42)';">🚫 No mostrar más esta promoción</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Re-run i18n on the freshly injected popup
    if (window.MacrogenI18n) {
      window.MacrogenI18n.setLanguage(window.MacrogenI18n.getLanguage());
    }

    // Dismiss logic
    function permanentDismiss() {
      // Suppress until promo expires (Sep 1, 2026). After that, popup naturally stops anyway.
      localStorage.setItem(STORAGE_KEY, String(EXPIRES_AT));
    }
    function closePopup() {
      overlay.classList.remove('is-open');
      setTimeout(() => overlay.remove(), 400);
      document.removeEventListener('keydown', onEsc);
    }
    function onEsc(e) {
      if (e.key === 'Escape') closePopup();
    }

    // Bindings — popup re-appears every visit by default.
    // Only [data-promo-never] persists a permanent dismissal in localStorage.
    overlay.querySelector('[data-promo-close]').addEventListener('click', closePopup);
    overlay.querySelector('[data-promo-dismiss]').addEventListener('click', closePopup);
    overlay.querySelector('[data-promo-order]').addEventListener('click', closePopup); // user converted → just close
    const neverBtn = overlay.querySelector('[data-promo-never]');
    if (neverBtn) {
      neverBtn.addEventListener('click', () => {
        permanentDismiss();
        closePopup();
      });
    }

    // Click outside the modal closes (no snooze — shows again next visit)
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closePopup();
    });

    // Copy code to clipboard
    const copyBtn = overlay.querySelector('[data-promo-copy]');
    const codeEl = overlay.querySelector('[data-promo-code]');
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(codeEl.textContent.trim());
      } catch (err) {
        // Fallback for browsers without clipboard API
        const range = document.createRange();
        range.selectNode(codeEl);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        try { document.execCommand('copy'); } catch (e2) {}
        window.getSelection().removeAllRanges();
      }
      copyBtn.classList.add('is-copied');
      const originalKey = copyBtn.dataset.i18n;
      copyBtn.dataset.i18n = 'promo_sanger.copied';
      if (window.MacrogenI18n) {
        window.MacrogenI18n.setLanguage(window.MacrogenI18n.getLanguage());
      } else {
        copyBtn.textContent = '¡Copiado!';
      }
      setTimeout(() => {
        copyBtn.classList.remove('is-copied');
        copyBtn.dataset.i18n = originalKey;
        if (window.MacrogenI18n) {
          window.MacrogenI18n.setLanguage(window.MacrogenI18n.getLanguage());
        }
      }, 2200);
    });

    document.addEventListener('keydown', onEsc);

    // Show with delay
    setTimeout(() => {
      overlay.classList.add('is-open');
    }, SHOW_AFTER_MS);
  })();

  // ========== Hero video: force autoplay on iOS Safari ==========
  // iOS Safari (and some Android browsers) block autoplay even with all the correct
  // attributes until JS explicitly calls .play(). This also handles Low Power Mode
  // gracefully by falling back to the poster image.
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    // Make sure attributes are set programmatically (some browsers ignore HTML attrs on autoplay)
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.playsInline = true;
    heroVideo.setAttribute('playsinline', '');
    heroVideo.setAttribute('webkit-playsinline', '');

    // Try to play immediately
    const tryPlay = () => {
      const promise = heroVideo.play();
      if (promise !== undefined) {
        promise.catch(err => {
          // Autoplay blocked (Low Power Mode, Data Saver, etc.) — try once more on user interaction
          const resumeOnce = () => {
            heroVideo.play().catch(() => {});
            document.removeEventListener('touchstart', resumeOnce);
            document.removeEventListener('click', resumeOnce);
            document.removeEventListener('scroll', resumeOnce);
          };
          document.addEventListener('touchstart', resumeOnce, { once: true, passive: true });
          document.addEventListener('click', resumeOnce, { once: true });
          document.addEventListener('scroll', resumeOnce, { once: true, passive: true });
        });
      }
    };

    // Try immediately, plus retry once metadata loads (covers slow connections)
    tryPlay();
    heroVideo.addEventListener('loadedmetadata', tryPlay, { once: true });
    heroVideo.addEventListener('canplay', tryPlay, { once: true });

    // Pause when tab is hidden (saves battery on mobile) and resume when visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        heroVideo.pause();
      } else {
        heroVideo.play().catch(() => {});
      }
    });
  }

  // ========== Mobile nav toggle ==========
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', menu.classList.contains('is-open'));
    });
  }

  // ========== Mega menu · tap-to-toggle on mobile, hover on desktop ==========
  // Desktop uses CSS :hover. Mobile (touch) needs explicit tap to open the dropdown
  // — but should still navigate to /servicios.html if the user taps a second time.
  document.querySelectorAll('.nav-dropdown').forEach(drop => {
    const trigger = drop.querySelector('a');
    if (!trigger) return;
    trigger.addEventListener('click', e => {
      // Only intercept on touch / narrow viewport
      if (window.matchMedia('(max-width: 980px)').matches || window.matchMedia('(hover: none)').matches) {
        if (!drop.classList.contains('is-open')) {
          e.preventDefault();
          // Close other open dropdowns
          document.querySelectorAll('.nav-dropdown.is-open').forEach(d => {
            if (d !== drop) d.classList.remove('is-open');
          });
          drop.classList.add('is-open');
        }
        // Second tap navigates normally
      }
    });
  });
  // Close mega menu when clicking outside
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown.is-open').forEach(d => d.classList.remove('is-open'));
    }
  });

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

    // Spain-only Direct Customer pricing note (auto-show when ES selected)
    const esPricingNote = document.querySelector('[data-es-pricing-note]');

    select.addEventListener('change', (e) => {
      // Toggle Direct Customer pricing notice (Spain web visitors)
      if (esPricingNote) {
        esPricingNote.style.display = e.target.value === 'ES' ? 'block' : 'none';
      }

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
      // _cc: always chash@macrogen.com. Formspree's default recipient for this
      // form (xaqvkoaw) is jaykim@macrogen.com, so CL/PE/OTRO previously set
      // _cc to config.to (also jaykim@macrogen.com), which Formspree rejects
      // as a duplicate ("Each email address ... should be unique between to,
      // cc, and bcc"). Fixed 2026-07-22.
      // _replyto: clicking Reply in the email goes to the visitor
      // _subject: human-readable subject line
      // _format: plain text email
      formData.set('_cc', 'chash@macrogen.com');
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

  // ========== SCROLL REVEAL · desenfoque que se aclara al hacer scroll ==========
  // Los bloques de contenido entran desplazados y desenfocados, y se aclaran
  // al entrar en el viewport. Estilos en main.css (bloque "SCROLL REVEAL").
  //
  // Decisiones importantes:
  //  · El HTML no se toca: los elementos se marcan aquí con [data-reveal].
  //  · html.js-reveal sólo se añade si el navegador soporta IntersectionObserver,
  //    así que sin JS (o en navegadores antiguos) el contenido se ve normal.
  //  · Lo que ya está en pantalla al cargar se revela de inmediato — evita el
  //    parpadeo y el efecto "página vacía que aparece de golpe".
  //  · Se excluye todo el chrome (header, subnav sticky, footer, modales) para
  //    que nada de la navegación se mueva ni se desenfoque.
  (function scrollReveal() {
    if (!('IntersectionObserver' in window)) return;

    // Bloques de contenido a animar. Se toman los hijos de .grid (tarjetas)
    // en lugar del .grid completo, para poder escalonar la entrada.
    const SELECTORS = [
      '.section > .container > *:not(.grid)',
      '.section > .container-narrow > *:not(.grid)',
      '.section .grid > *',
      '.article-body > h2',
      '.article-body > h3',
      '.article-body > p',
      '.article-body > ul',
      '.article-body > ol',
      '.article-body > table',
      '.article-body > div',
      'article.article > .container-narrow > figure',
      'article.article > .container-narrow > .article-header'
    ].join(',');

    // Nada de la navegación ni de los overlays entra en la animación.
    // .hero queda fuera a propósito: es lo primero que se ve y debe estar
    // nítido desde el primer frame.
    const EXCLUDE = [
      '.site-header', '.service-subnav', '.site-footer', '.launch-bar',
      '.promo-modal', '.promo-overlay', '.hero', '.brand-strip', '.nav-megamenu'
    ].join(',');

    let els = Array.from(document.querySelectorAll(SELECTORS))
      .filter(el => !el.closest(EXCLUDE));

    // Si un elemento contiene a otro de la lista, se anima sólo el interior
    // (evita animar dos veces lo mismo y permite el escalonado en las grillas).
    const set = new Set(els);
    els = els.filter(el => {
      for (const other of set) {
        if (other !== el && el.contains(other)) return false;
      }
      return true;
    });

    if (!els.length) return;

    document.documentElement.classList.add('js-reveal');
    els.forEach(el => el.setAttribute('data-reveal', ''));

    // Con reduced-motion el CSS ya los deja visibles: no observamos nada.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Escalonado entre hermanos de una misma grilla o fila.
    const count = new Map();
    els.forEach(el => {
      const parent = el.parentElement;
      const i = count.get(parent) || 0;
      count.set(parent, i + 1);
      if (i > 0) el.style.setProperty('--reveal-delay', Math.min(i, 5) * 70 + 'ms');
    });

    // Lo que ya se ve al cargar: visible de inmediato, sin transición.
    const vh = window.innerHeight || 800;
    const pending = [];
    els.forEach(el => {
      if (el.getBoundingClientRect().top < vh * 0.92) {
        el.classList.add('reveal-instant');
        el.style.removeProperty('--reveal-delay');
      } else {
        pending.push(el);
      }
    });

    if (!pending.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('is-revealed');
        io.unobserve(el);

        // Al terminar, se sueltan filter y will-change (ver comentario en main.css).
        let done = false;
        const cleanup = () => {
          if (done) return;
          done = true;
          el.classList.add('reveal-done');
          el.style.removeProperty('--reveal-delay');
        };
        el.addEventListener('transitionend', cleanup, { once: true });
        setTimeout(cleanup, 1500); // por si transitionend no llega a dispararse
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    pending.forEach(el => io.observe(el));
  })();

  // ========== Sub-nav: keep the clicked item selected immediately ==========
  // The per-page scroll-spy re-syncs afterwards; this makes the blue selected
  // state appear the instant the user clicks, not after the smooth scroll.
  document.querySelectorAll('[data-subnav] a[data-anchor]').forEach(a => {
    a.addEventListener('click', () => {
      a.closest('[data-subnav]').querySelectorAll('a[data-anchor]').forEach(x => {
        x.classList.toggle('is-active', x === a);
      });
    });
  });

  // ========== TYPING EFFECT · hero + main subtitles ==========
  // Types the hero eyebrow (with a blinking caret, console-style), then the
  // hero lead, and each section subtitle when it scrolls into view.
  //  · Waits for i18n to settle so it types the final (dictionary) text.
  //  · Skipped entirely under prefers-reduced-motion.
  //  · Skipped for non-Spanish sessions: Google Translate mutates the DOM
  //    while translating and would fight the animation.
  (function typeFx() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lang = localStorage.getItem('mc_lang') || 'es';
    if (lang !== 'es') return;

    const heroEyebrow = document.querySelector('.hero .eyebrow');
    const heroLead = document.querySelector('.hero p.lead');
    const subtitles = Array.from(document.querySelectorAll('.section-head p'));
    if (!heroEyebrow && !heroLead && !subtitles.length) return;

    function textNodesOf(el) {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const nodes = [];
      let n;
      while ((n = walker.nextNode())) nodes.push(n);
      return nodes;
    }

    // HTML-aware typing: reveals characters across the element's text nodes
    // in order, so <strong>/<br> structure survives.
    function typeElement(el, opts, done) {
      if (!el || el.dataset.typed) { if (done) done(); return; }
      el.dataset.typed = '1';
      const nodes = textNodesOf(el);
      const originals = nodes.map(t => t.textContent);
      const total = originals.reduce((s, t) => s + t.length, 0);
      if (!total) { el.classList.remove('typefx-pending'); if (done) done(); return; }
      // Whole element types in ~1.2–1.8s regardless of length
      const perChar = Math.max(4, Math.min(18, Math.round(1500 / total)));
      nodes.forEach(t => { t.textContent = ''; });
      el.classList.remove('typefx-pending');
      let caret = null;
      if (opts && opts.caret) {
        caret = document.createElement('span');
        caret.className = 'type-caret';
        caret.setAttribute('aria-hidden', 'true');
        el.appendChild(caret);
      }
      let ni = 0, ci = 0;
      (function tick() {
        if (ni >= nodes.length) {
          if (caret) setTimeout(() => caret.remove(), 3200);
          if (done) done();
          return;
        }
        ci++;
        nodes[ni].textContent = originals[ni].slice(0, ci);
        if (ci >= originals[ni].length) { ni++; ci = 0; }
        setTimeout(tick, perChar);
      })();
    }

    function start() {
      // Hide targets just before typing begins (no flash of empty content
      // for elements far below the fold — they only hide once observed).
      [heroEyebrow, heroLead].forEach(el => { if (el && !el.dataset.typed) el.classList.add('typefx-pending'); });
      typeElement(heroEyebrow, { caret: true }, () => typeElement(heroLead, {}, null));

      if (subtitles.length && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver(entries => {
          entries.forEach(e => {
            if (!e.isIntersecting) return;
            io.unobserve(e.target);
            typeElement(e.target, {}, null);
          });
        }, { threshold: .5 });
        subtitles.forEach(p => io.observe(p));
      }
    }

    // Wait for the i18n dictionary to land (it rewrites tagged text on load);
    // fall back after 900ms in case i18n.js fails to run.
    let started = false;
    function startOnce() { if (!started) { started = true; start(); } }
    document.addEventListener('i18n:changed', startOnce, { once: true });
    setTimeout(startOnce, 900);
  })();

});
