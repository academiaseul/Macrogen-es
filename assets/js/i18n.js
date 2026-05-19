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
  function detectLanguage() {
    // Priority 1: explicit URL parameter ?lang=en
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    if (urlLang && SUPPORTED.includes(urlLang)) {
      localStorage.setItem(STORAGE_KEY, urlLang);
      return urlLang;
    }

    // Priority 2: stored preference
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;

    // Priority 3: browser language
    const navLang = (navigator.language || 'es').slice(0, 2).toLowerCase();
    if (SUPPORTED.includes(navLang)) return navLang;

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

  // ============ Apply language ============
  async function applyLanguage(lang) {
    if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;
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
