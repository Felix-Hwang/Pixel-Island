'use strict';
// Current language and string lookup. Strings live in data/i18n/*.js, species names in data/i18n/species/*.js.
(() => {
  const LANGS = ['ko', 'en', 'zh', 'ms'];
  const NAMES = { ko: '한국어', en: 'English', zh: '中文', ms: 'Bahasa Melayu' };
  const warned = new Set();
  let lang = null;
  function detect() {
    const nav = (navigator.language || 'en').toLowerCase();
    if (nav.startsWith('ko')) return 'ko';
    if (nav.startsWith('zh')) return 'zh';
    if (nav.startsWith('ms')) return 'ms';
    if (nav.startsWith('en')) return 'en';
    return null;
  }
  function format(str, params) {
    return str.replace(/\{(\w+)\}/g, (m, k) => params && params[k] != null ? params[k] : m);
  }
  PI.t = (key, params) => {
    const table = PI.i18n[lang] || {}, en = PI.i18n.en || {};
    let s = table[key];
    if (s == null) s = en[key];
    if (s == null) {
      if (!warned.has(key)) { warned.add(key); console.warn('i18n: missing key', key, 'for', lang); }
      return key;
    }
    return format(s, params);
  };
  PI.speciesName = id => {
    const t = PI.i18n.species[lang] || {}, en = PI.i18n.species.en || {};
    return t[id] || en[id] || id;
  };
  PI.setLang = l => {
    if (!LANGS.includes(l)) l = 'en';
    lang = l;
    document.documentElement.lang = l;
    PI.store.set('lang', l);
    document.dispatchEvent(new CustomEvent('pi:lang', { detail: l }));
  };
  PI.lang = () => lang;
  PI.langs = () => LANGS.slice();
  PI.langName = l => NAMES[l];
  PI.detectLang = detect;
  const saved = PI.store.get('lang');
  if (saved && LANGS.includes(saved)) { lang = saved; document.documentElement.lang = saved; }
})();
