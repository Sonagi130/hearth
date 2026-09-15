/* ============ 壁炉 · 界面皮肤 ============
   水蓝配色 / 液体玻璃 / 可爱装饰。用 CSS 变量 + 类名，随时切。 */
(function () {
  'use strict';
  var WATER = {
    '--orange': '#8FB8D9',
    '--brown': '#5B7C93',
    '--brown-light': '#C9DCEA',
    '--brown-dark': '#456172',
    '--bg-cream': '#F4FAFD',
    '--card-bg': '#FFFFFF',
    '--text-main': '#3E4A57',
    '--text-soft': '#74899A'
  };
  var KEYS = Object.keys(WATER);

  function u() { return Store.get('uiSet', {}) || {}; }
  function save(o) { Store.set('uiSet', o); }
  function cur() { return u().skin || 'water'; }

  function apply() {
    var b = document.body;
    if (!b) return;
    var s = u();
    KEYS.forEach(function (k) { b.style.removeProperty(k); });
    if (cur() === 'water') KEYS.forEach(function (k) { b.style.setProperty(k, WATER[k]); });
    b.classList.toggle('skin-water', cur() === 'water');
    b.classList.toggle('skin-glass', !!s.glass);
    b.classList.toggle('skin-cute', s.cute !== false);
  }

  function toggle(what) {
    var s = u();
    if (what === 'skin') s.skin = (cur() === 'water' ? 'default' : 'water');
    else s[what] = !s[what];
    save(s);
    apply();
    try { if (window.HearthConv && window.HearthConv.render) window.HearthConv.render(); } catch (e) {}
    return s;
  }

  window.HearthSkin = { apply: apply, toggle: toggle, cur: cur };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
})();