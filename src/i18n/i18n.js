'use strict';
// Current language and string lookup. Strings live in data/i18n/*.js, species names in data/i18n/species/*.js.
(() => {
  const LANGS = ['ko', 'en', 'zh', 'ms'];
  const NAMES = { ko: '한국어', en: 'English', zh: '中文', ms: 'Bahasa Melayu' };
  const ENGLISH = { ko: 'Korean', en: 'English', zh: 'Chinese', ms: 'Malay' };
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
  // Korean particles depend on whether the word before them ends in a consonant. Strings write both forms
  // (the keys of PARTICLE) and this picks one. The last pair also takes its short form after a final rieul.
  const PARTICLE = { '을(를)': ['을', '를'], '이(가)': ['이', '가'], '은(는)': ['은', '는'], '(으)로': ['으로', '로'] };
  function particles(str) {
    return str.replace(/([가-힣])(을\(를\)|이\(가\)|은\(는\)|\(으\)로)/g, (m, ch, p) => {
      const tail = (ch.charCodeAt(0) - 0xAC00) % 28, open = tail === 0 || (p === '(으)로' && tail === 8);
      return ch + PARTICLE[p][open ? 1 : 0];
    });
  }
  function format(str, params) {
    return particles(str.replace(/\{(\w+)\}/g, (m, k) => params && params[k] != null ? params[k] : m));
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
  // one line about the real animal, for the field guide
  PI.fact = id => (PI.i18n.facts[lang] || {})[id] || (PI.i18n.facts.en || {})[id] || '';
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
  PI.langEnglish = l => ENGLISH[l];
  // the words that describe one creature in a sentence: level, colour and species
  PI.describe = c => ({ lv: c.lv, color: PI.t('color.' + c.color), species: PI.speciesName(c.sp.id) });
  PI.detectLang = detect;
  const saved = PI.store.get('lang');
  if (saved && LANGS.includes(saved)) { lang = saved; document.documentElement.lang = saved; }
})();
