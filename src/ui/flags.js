'use strict';
// Small flags for the language buttons, drawn as inline SVG. Flag emoji are not used because Windows shows
// two letters in their place.
(() => {
  // points of a star with n tips, outer radius r and inner radius q, first tip pointing up (turned by rot degrees)
  const star = (cx, cy, r, n = 5, q = r * .382, rot = 0) => {
    const pts = [];
    for (let k = 0; k < n * 2; k++) {
      const a = (k * 180 / n + rot - 90) * Math.PI / 180, d = k % 2 ? q : r;
      pts.push((cx + Math.cos(a) * d).toFixed(2) + ',' + (cy + Math.sin(a) * d).toFixed(2));
    }
    return pts.join(' ');
  };
  const stripes = (n, color) => {
    let out = '';
    for (let k = 0; k < n; k += 2) out += '<rect y="' + (16 * k / n).toFixed(3) + '" width="24" height="' + (16 / n).toFixed(3) + '" fill="' + color + '"/>';
    return out;
  };
  // three bars of a Korean trigram around (x, y), turned by angle; broken lists which bars are split in two
  const trigram = (x, y, angle, broken) => {
    let out = '<g transform="translate(' + x + ' ' + y + ') rotate(' + angle + ')" stroke="#000" stroke-width=".72">';
    for (let k = 0; k < 3; k++) {
      const at = (k - 1) * 1.15;
      out += '<path d="M-2 ' + at + 'H2"' + (broken.includes(k) ? ' stroke-dasharray="1.7 .6"' : '') + '/>';
    }
    return out + '</g>';
  };
  const dots = () => {
    let out = '';
    for (let row = 0; row < 4; row++) for (let col = 0; col < 5; col++) out += '<circle cx="' + (1.2 + col * 1.8) + '" cy="' + (1.3 + row * 2) + '" r=".42"/>';
    return out;
  };
  const ART = {
    ko: '<rect width="24" height="16" fill="#fff"/><g transform="rotate(33.7 12 8)"><path d="M8 8a4 4 0 0 1 8 0z" fill="#cd2e3a"/><path d="M8 8a4 4 0 0 0 8 0z" fill="#0047a0"/>'
      + '<circle cx="10" cy="8" r="2" fill="#cd2e3a"/><circle cx="14" cy="8" r="2" fill="#0047a0"/></g>'
      + trigram(5, 3.4, -56.3, []) + trigram(19, 3.4, 56.3, [0, 2]) + trigram(5, 12.6, 56.3, [1]) + trigram(19, 12.6, -56.3, [0, 1, 2]),
    en: '<rect width="24" height="16" fill="#fff"/>' + stripes(13, '#b22234') + '<rect width="9.6" height="8.62" fill="#3c3b6e"/><g fill="#fff">' + dots() + '</g>',
    zh: '<rect width="24" height="16" fill="#de2910"/><g fill="#ffde00"><polygon points="' + star(4, 4, 2.4) + '"/>'
      + [[8, 1.6, 23], [9.6, 3.2, 46], [9.6, 5.6, 0], [8, 7.2, 23]].map(s => '<polygon points="' + star(s[0], s[1], .8, 5, .31, s[2]) + '"/>').join('') + '</g>',
    ms: '<rect width="24" height="16" fill="#fff"/>' + stripes(14, '#cc0001') + '<rect width="12" height="9.14" fill="#010066"/>'
      + '<circle cx="4.9" cy="4.57" r="3" fill="#fc0"/><circle cx="5.8" cy="4.57" r="2.6" fill="#010066"/><polygon fill="#fc0" points="' + star(8.3, 4.57, 2, 14, .95) + '"/>',
  };
  // an <svg> element for one language, or null when there is no flag for it
  PI.ui.flag = lang => {
    if (!ART[lang]) return null;
    const box = document.createElement('span');
    box.className = 'flag';
    box.setAttribute('aria-hidden', 'true');
    box.innerHTML = '<svg viewBox="0 0 24 16" width="30" height="20">' + ART[lang] + '</svg>';
    return box;
  };
})();
