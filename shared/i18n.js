/* =============================================================
   GEM — Shared i18n engine
   • Loads locale JSON from shared/locales/ (path auto-detected)
   • Supports data-i18n, [html]key, data-i18n-placeholder
   • Sets dir="rtl" on <html> for Arabic
   • Exposes window.I18n and window.changeLang
============================================================= */
(function () {
    /* Capture script src synchronously so we can find locales/ */
    const _src  = document.currentScript ? document.currentScript.src : '';
    const _base = _src
        ? _src.substring(0, _src.lastIndexOf('/') + 1) + 'locales/'
        : 'locales/';

    const SUPPORTED    = ['en', 'ar'];
    const DEFAULT_LANG = 'en';
    const _cache       = {};
    let   _lang        = DEFAULT_LANG;

    const resolve = (obj, path) =>
        path.split('.').reduce((a, k) => (a != null ? a[k] : null), obj) ?? null;

    const detectLang = () => {
        const s = localStorage.getItem('lang');
        if (s && SUPPORTED.includes(s)) return s;
        return (navigator.language || '').toLowerCase().startsWith('ar') ? 'ar' : DEFAULT_LANG;
    };

    const load = async (lang) => {
        if (_cache[lang]) return _cache[lang];
        try {
            const res = await fetch(`${_base}${lang}.json`);
            if (!res.ok) throw new Error();
            _cache[lang] = await res.json();
        } catch {
            _cache[lang] = {};
        }
        return _cache[lang];
    };

    const t = (key) => resolve(_cache[_lang], key) ?? key;

    const apply = () => {
        const html = document.documentElement;
        html.lang = _lang;
        html.dir  = _lang === 'ar' ? 'rtl' : 'ltr';

        /* text / innerHTML nodes */
        document.querySelectorAll('[data-i18n]').forEach(el => {
            let key     = el.getAttribute('data-i18n');
            let useHTML = false;
            if (key.startsWith('[html]')) { useHTML = true; key = key.slice(6); }
            const val = t(key);
            if (val === key) return;
            if (useHTML) el.innerHTML = val; else el.textContent = val;
        });

        /* placeholder attributes */
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const val = t(el.getAttribute('data-i18n-placeholder'));
            if (val !== el.getAttribute('data-i18n-placeholder')) el.placeholder = val;
        });

        /* <title> */
        const titleEl = document.querySelector('title[data-i18n]');
        if (titleEl) document.title = t(titleEl.getAttribute('data-i18n'));

        /* nav language indicator */
        const currentLangEl = document.getElementById('currentLang');
        if (currentLangEl) currentLangEl.textContent = _lang.toUpperCase();

        const sideLangVal = document.getElementById('sideLangVal');
        if (sideLangVal)
            sideLangVal.innerHTML = (_lang === 'ar' ? 'العربية' : 'English') +
                ' <i class="fa-solid fa-caret-right"></i>';

        document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang: _lang } }));
    };

    const change = async (lang) => {
        if (!SUPPORTED.includes(lang)) return;
        await load(lang);
        _lang = lang;
        localStorage.setItem('lang', lang);
        apply();
    };

    const init = async () => {
    _lang = detectLang();
    await load(_lang);
    apply();
};

    const I18n = { init, change, t, get lang() { return _lang; } };
    window.I18n       = I18n;
    window.changeLang = change;

    /* ── Language dropdown (works on any page with .lang-dropdown) ── */
    document.addEventListener('click', (e) => {
        const dd = document.querySelector('.lang-dropdown');
        if (!dd) return;
        const opt = e.target.closest('[data-lang]');
        if (opt && dd.contains(opt)) {
            I18n.change(opt.dataset.lang);
            dd.classList.remove('active');
            return;
        }
        if (dd.contains(e.target)) { dd.classList.toggle('active'); return; }
        dd.classList.remove('active');
    });

    /* ── Auto-init ── */
    if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => I18n.init());
} else {
    I18n.init();
}
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(() => I18n.init(), 0));
} else {
    setTimeout(() => I18n.init(), 0);
}