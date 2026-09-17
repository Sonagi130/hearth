/* ============ 壁炉 · 界面皮肤 ============
   水蓝 / 原木 / 星空 三套配色 + 液体玻璃 / 可爱装饰开关。用 CSS 变量 + 类名，随时切。 */
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
  var STAR = {
    '--orange': '#A8CBE4',
    '--brown': '#8FB8D9',
    '--brown-light': '#2E3B52',
    '--brown-dark': '#C7D8EA',
    '--bg-cream': '#101725',
    '--card-bg': 'rgba(255,255,255,.065)',
    '--text-main': '#E6EDF6',
    '--text-soft': '#8FA2B8'
  };
  var KEYS = Object.keys(WATER);

  function u() { return Store.get('uiSet', {}) || {}; }
  function save(o) { Store.set('uiSet', o); }
  function cur() { return u().skin || 'water'; }

  function apply() {
    var b = document.body;
    if (!b) return;
    var s = u();
    var c = cur();
    KEYS.forEach(function (k) { b.style.removeProperty(k); });
    if (c === 'water') KEYS.forEach(function (k) { b.style.setProperty(k, WATER[k]); });
    if (c === 'star') KEYS.forEach(function (k) { b.style.setProperty(k, STAR[k]); });
    b.classList.toggle('skin-water', c === 'water');
    b.classList.toggle('skin-star', c === 'star');
    b.classList.toggle('skin-glass', !!s.glass);
    b.classList.toggle('skin-cute', s.cute !== false);
    if (c === 'star') ensureFx();
  }

  /* 星空的粒子与流星：只在星空主题里养一池子 */
  function ensureFx() {
    if (!document.body || document.getElementById('star-fx')) return;
    var fx = document.createElement('div');
    fx.id = 'star-fx';
    var html = '', i;
    for (i = 0; i < 26; i++) {
      var l = Math.round(Math.random() * 96) + 2;
      var d = Math.round(Math.random() * 16);
      var sz = (Math.random() * 1.6 + 0.8).toFixed(1);
      var dur = (Math.random() * 14 + 10).toFixed(1);
      html += '<i style="left:' + l + '%;animation-delay:-' + d + 's;width:' + sz + 'px;height:' + sz + 'px;animation-duration:' + dur + 's"></i>';
    }
    html += '<b class="m1"></b><b class="m2"></b>';
    fx.innerHTML = html;
    document.body.appendChild(fx);
  }

  function refresh() {
    apply();
    try { if (window.HearthConv && window.HearthConv.render) window.HearthConv.render(); } catch (e) {}
  }

  function set(name) {
    var s = u();
    s.skin = name;
    save(s);
    refresh();
    return s;
  }

  function toggle(what) {
    var s = u();
    if (what === 'skin') s.skin = (cur() === 'water' ? 'default' : 'water');
    else s[what] = !s[what];
    save(s);
    refresh();
    return s;
  }

  window.HearthSkin = { apply: apply, toggle: toggle, set: set, cur: cur };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
})();