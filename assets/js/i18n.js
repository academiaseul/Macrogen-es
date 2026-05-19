// Macrogen Iberoamérica · i18n.js
// Lightweight client-side translation engine
// Supports: es (default) · en · pt · ko
//
// Usage in HTML:
//   <span data-i18n="nav.home">Inicio</span>                  → replaces textContent
//   <a data-i18n-html="footer.brand">...</a>                  → replaces innerHTML (allows <br>, <strong>)
//   <input data-i18n-attr="placeholder:form.email_placeholder">  → replaces an attribute
//   <meta data-i18n-attr="content:meta.description">          → meta tags

(function () {
  'use strict';

  const SUPPORTED = ['es', 'en', 'pt', 'ko'];
  const DEFAULT_LANG = 'es';
  const STORAGE_KEY = 'mc_lang';

  const FLAGS = {
    es: '🇪🇸',
    en: '🇬🇧',
    pt: '🇵🇹',
    ko: '🇰🇷'
  };

  const LABELS = {
    es: 'Español',
    en: 'English',
    pt: 'Português',
    ko: '한국어'
  };

  // ============ Path resolution ============
  // Detect if we're at root (index.html) or in a subfolder (servicios/wgs.html, blog/post.html)
  // so we know whether to load /i18n/en.json or ../i18n/en.json
  function getI18nPath() {
    const path = window.location.pathname;
    // Count subdirectory depth
    const segments = path.split('/').filter(s => s && !s.endsWith('.html'));
    const depth = segments.length;
    return depth === 0 ? 'i18n/' : '../'.repeat(depth) + 'i18n/';
  }

  // ============ Language detection ============
  // Default to Spanish always. Browser language is NOT auto-detected anymore —
  // user must explicitly choose another language via the switcher (then we
  // remember their choice in localStorage).
  function detectLanguage() {
    // Priority 1: explicit URL parameter ?lang=en (useful for email marketing links)
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    if (urlLang && SUPPORTED.includes(urlLang)) {
      localStorage.setItem(STORAGE_KEY, urlLang);
      return urlLang;
    }

    // Priority 2: previously chosen language stored in localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;

    // Default: Spanish for all first-time visitors
    return DEFAULT_LANG;
  }

  // ============ Translation cache ============
  const cache = {};

  async function loadDict(lang) {
    if (cache[lang]) return cache[lang];
    try {
      const res = await fetch(getI18nPath() + lang + '.json');
      if (!res.ok) throw new Error('Failed to load ' + lang);
      const dict = await res.json();
      cache[lang] = dict;
      return dict;
    } catch (err) {
      console.warn('[i18n] Failed to load', lang, err);
      return cache[DEFAULT_LANG] || null;
    }
  }

  // ============ Key resolver ============
  // Supports dot notation: "nav.home", "hero_index.eyebrow"
  function resolveKey(dict, keyPath) {
    if (!dict || !keyPath) return null;
    const parts = keyPath.split('.');
    let current = dict;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return null;
      }
    }
    return typeof current === 'string' ? current : null;
  }

  // ============ DOM translation ============
  function translate(dict) {
    if (!dict) return;

    // Text content nodes
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const value = resolveKey(dict, el.dataset.i18n);
      if (value !== null) el.textContent = value;
    });

    // HTML content nodes (for <br>, <strong>, etc.)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const value = resolveKey(dict, el.dataset.i18nHtml);
      if (value !== null) el.innerHTML = value;
    });

    // Attribute translation: data-i18n-attr="placeholder:form.email"
    // Multiple attrs supported: "placeholder:form.email,title:form.email_title"
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const pairs = el.dataset.i18nAttr.split(',');
      pairs.forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim());
        if (attr && key) {
          const value = resolveKey(dict, key);
          if (value !== null) el.setAttribute(attr, value);
        }
      });
    });

    // Update <html lang="...">
    const currentLang = document.documentElement.getAttribute('data-active-lang');
    if (currentLang) document.documentElement.setAttribute('lang', currentLang);
  }

  // ============ Google Translate integration ============
  // We layer Google Translate underneath our curated translations to cover
  // the body content of all 22 pages without manually tagging every <p>.
  // Curated translations (header/footer/hero) load first from JSON for quality;
  // GT then translates the rest of the body.
  let gtReady = false;
  let pendingGtLang = null;

  function injectGoogleTranslate() {
    if (document.getElementById('google_translate_element')) return;
    const div = document.createElement('div');
    div.id = 'google_translate_element';
    div.style.cssText = 'position:absolute; top:-9999px; left:-9999px; visibility:hidden;';
    document.body.appendChild(div);

    window.googleTranslateElementInit = function () {
      new google.translate.TranslateElement({
        pageLanguage: 'es',
        includedLanguages: 'en,pt,ko',
        autoDisplay: false,
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE
      }, 'google_translate_element');
      gtReady = true;
      if (pendingGtLang) {
        applyGoogleTranslate(pendingGtLang);
        pendingGtLang = null;
      }
    };

    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);
  }

  function applyGoogleTranslate(lang) {
    if (!gtReady) { pendingGtLang = lang; return; }

    if (lang === 'es') {
      // Restore original Spanish — reload to clear GT translation
      // (GT has no clean "untranslate" API, reload is the safest path)
      const cookieDomain = '.' + window.location.hostname.replace(/^www\./, '');
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname + ';';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + cookieDomain + ';';
      return;
    }

    // Set GT cookie so the language sticks across pages (no flash on navigation)
    document.cookie = 'googtrans=/es/' + lang + '; path=/;';

    // Trigger GT via its hidden combo select
    const tryTrigger = (attempts) => {
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event('change'));
      } else if (attempts < 30) {
        setTimeout(() => tryTrigger(attempts + 1), 200);
      }
    };
    tryTrigger(0);
  }

  // ============ Apply language ============
  async function applyLanguage(lang) {
    if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;
    const previousLang = document.documentElement.getAttribute('data-active-lang') || DEFAULT_LANG;
    document.documentElement.setAttribute('data-active-lang', lang);

    const dict = await loadDict(lang);
    if (dict) translate(dict);

    localStorage.setItem(STORAGE_KEY, lang);

    // Update language switcher UI
    document.querySelectorAll('[data-lang-current]').forEach(el => {
      el.textContent = FLAGS[lang] + ' ' + lang.toUpperCase();
    });
    document.querySelectorAll('[data-lang-option]').forEach(el => {
      el.classList.toggle('is-active', el.dataset.langOption === lang);
    });

    // Trigger Google Translate for body content (header/footer/hero already curated)
    if (lang === 'es' && previousLang !== 'es') {
      // Switching back to Spanish — clear GT cookie + reload to wipe DOM mutations
      const host = window.location.hostname;
      const expire = 'expires=Thu, 01 Jan 1970 00:00:00 UTC';
      document.cookie = 'googtrans=; ' + expire + '; path=/;';
      document.cookie = 'googtrans=; ' + expire + '; path=/; domain=' + host + ';';
      document.cookie = 'googtrans=; ' + expire + '; path=/; domain=.' + host + ';';
      setTimeout(() => window.location.reload(), 100);
    } else if (lang !== 'es') {
      applyGoogleTranslate(lang);
    }

    // Dispatch event for other scripts that may need to react
    document.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang } }));
  }

  // ============ Build switcher UI ============
  // The HTML can be either:
  // <li class="nav-lang"><div class="lang-switcher" data-lang-switcher></div></li>
  // and we'll populate it.
  function buildSwitcher() {
    const containers = document.querySelectorAll('[data-lang-switcher]');
    containers.forEach(container => {
      if (container.dataset.built) return;
      container.dataset.built = 'true';

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'lang-btn';
      button.setAttribute('aria-label', 'Select language');
      button.setAttribute('aria-haspopup', 'true');
      button.setAttribute('aria-expanded', 'false');
      const code = document.createElement('span');
      code.setAttribute('data-lang-current', '');
      code.textContent = '🇪🇸 ES';
      button.appendChild(code);
      const caret = document.createElement('span');
      caret.className = 'lang-caret';
      caret.textContent = '▾';
      button.appendChild(caret);

      const menu = document.createElement('ul');
      menu.className = 'lang-menu';
      menu.setAttribute('role', 'menu');
      SUPPORTED.forEach(lang => {
        const li = document.createElement('li');
        const a = document.createElement('button');
        a.type = 'button';
        a.className = 'lang-option';
        a.dataset.langOption = lang;
        a.setAttribute('role', 'menuitem');
        a.innerHTML = '<span class="lang-flag">' + FLAGS[lang] + '</span>'
                    + '<span class="lang-label">' + LABELS[lang] + '</span>'
                    + '<span class="lang-code">' + lang.toUpperCase() + '</span>';
        a.addEventListener('click', () => {
          applyLanguage(lang);
          menu.classList.remove('is-open');
          button.setAttribute('aria-expanded', 'false');
        });
        li.appendChild(a);
        menu.appendChild(li);
      });

      button.addEventListener('click', e => {
        e.stopPropagation();
        const wasOpen = menu.classList.contains('is-open');
        menu.classList.toggle('is-open');
        button.setAttribute('aria-expanded', wasOpen ? 'false' : 'true');
      });

      // Close on outside click or Escape
      document.addEventListener('click', e => {
        if (!container.contains(e.target)) {
          menu.classList.remove('is-open');
          button.setAttribute('aria-expanded', 'false');
        }
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          menu.classList.remove('is-open');
          button.setAttribute('aria-expanded', 'false');
        }
      });

      container.appendChild(button);
      container.appendChild(menu);
    });
  }

  // ============ Init ============
  function init() {
    buildSwitcher();
    injectGoogleTranslate();
    const lang = detectLanguage();
    applyLanguage(lang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose minimal API
  window.MacrogenI18n = {
    setLanguage: applyLanguage,
    getLanguage: () => document.documentElement.getAttribute('data-active-lang') || DEFAULT_LANG,
    supported: SUPPORTED.slice()
  };
})();
