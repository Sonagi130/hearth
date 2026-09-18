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
  var PATCH_A = [
    '#star-fx{position:fixed;inset:0;z-index:0;pointer-events:none;display:none;overflow:hidden;}',
    'body.skin-star #star-fx{display:block;}',
    '#star-fx i{position:absolute;bottom:-8px;border-radius:50%;opacity:0;background:radial-gradient(circle,rgba(255,255,255,.95),rgba(255,255,255,.25) 60%,transparent);animation-name:starUp;animation-timing-function:linear;animation-iteration-count:infinite;box-shadow:0 0 10px rgba(255,255,255,.95),0 0 4px rgba(255,255,255,1);}',
    '@keyframes starUp{0%{transform:translateY(0);opacity:0}12%{opacity:.9}88%{opacity:.8}100%{transform:translateY(-110vh);opacity:0}}',
    '@keyframes starUpL{0%{transform:translate(0,0);opacity:0}12%{opacity:.85}100%{transform:translate(-24vw,-108vh);opacity:0}}',
    '@keyframes starUpR2{0%{transform:translate(0,0);opacity:0}12%{opacity:.85}100%{transform:translate(46vw,-104vh);opacity:0}}',
    '@keyframes starUpL2{0%{transform:translate(0,0);opacity:0}12%{opacity:.85}100%{transform:translate(-52vw,-104vh);opacity:0}}',
    '@keyframes starUpS{0%{transform:translate(0,0);opacity:0}10%{opacity:.8}50%{opacity:.9}100%{transform:translate(6vw,-112vh);opacity:0}}',
    '#star-fx u{position:absolute;border-radius:50%;background:#fff;opacity:.35;box-shadow:0 0 6px rgba(255,255,255,.85);animation:twinkle 3.4s ease-in-out infinite;}',
    '#star-fx u::before,#star-fx u::after{content:"";position:absolute;left:50%;top:50%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.95),transparent);opacity:.8;}',
    '#star-fx u::before{width:5px;height:2px;transform:translate(-50%,-50%);opacity:.6;}',
    '#star-fx u::after{width:2px;height:5px;transform:translate(-50%,-50%);opacity:.6;}',
    '#star-fx u.hi{box-shadow:0 0 12px rgba(255,255,255,1),0 0 5px rgba(200,225,255,.95);}',
    '#star-fx u.hi::before{width:9px;}',
    '#star-fx u.hi::after{height:9px;}',
    '@keyframes twinkle{0%,100%{opacity:.22;transform:scale(.75)}50%{opacity:1;transform:scale(1.3)}}',
    '#star-fx b{position:absolute;width:130px;height:2px;border-radius:2px;opacity:0;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.92));animation:meteor linear infinite;}',
    '#star-fx b.m1{top:7%;left:46%;animation-duration:9s;}',
    '#star-fx b.m2{top:26%;left:88%;animation-duration:12s;animation-delay:4.5s;}',
    '@keyframes meteor{0%{transform:rotate(-32deg) translateX(0);opacity:0}4%{opacity:1}20%{transform:rotate(-32deg) translateX(-92vw);opacity:0}100%{opacity:0}}'
  ].join('');
  var PATCH_B = [
    'body.skin-star .gs-btn{background:rgba(168,203,228,.16) !important;border:1px solid rgba(168,203,228,.42) !important;color:#DCEBF7 !important;}',
    'body.skin-star .cv-find{background:rgba(255,255,255,.08) !important;border-color:rgba(168,203,228,.32) !important;color:#E6EDF6 !important;}',
    'body.skin-star .cv-find::placeholder{color:rgba(214,228,242,.45) !important;}',
    'body.skin-star .mem-box{background:rgba(168,203,228,.10) !important;border:1px solid rgba(168,203,228,.20) !important;border-left:3px solid #A8CBE4 !important;}',
    'body.skin-star .mem-h{color:#A8CBE4 !important;}',
    'body.skin-star .mem-b{color:#B7C6D8 !important;}',
    'body.skin-star .ctx{background:rgba(15,22,37,.98) !important;border:1px solid rgba(168,203,228,.22);}',
    'body.skin-star .multi-bar{background:rgba(15,22,37,.98) !important;}',
    'body.skin-star .sheet-card{background:rgba(15,22,37,.98) !important;}',
    '#app{position:relative;z-index:1;}',
    'body.skin-star .side-nav{background:rgba(16,23,38,.94) !important;}',
    'body.skin-star .tog.on{background:#A8CBE4 !important;}',
    'body.skin-star .think{border-left-color:rgba(168,203,228,.7) !important;background:rgba(168,203,228,.10) !important;}',
    'body.skin-star .think-h{color:#A8CBE4 !important;}',
    'body.skin-star .think-b{color:#B7C6D8 !important;}',
    '.sheet-mask:has(> .sheet-card.wide){padding:0 !important;align-items:stretch !important;}',
    '.sheet-card.wide{position:absolute !important;left:0 !important;right:0 !important;top:0 !important;bottom:0 !important;width:auto !important;max-width:none !important;height:auto !important;max-height:none !important;border-radius:0 !important;margin:0 !important;display:flex !important;flex-direction:column;}',
    'body.skin-star .sheet-card.wide{background:rgba(12,18,32,.92) !important;}',
    '.sheet-card.wide .sh-body{flex:1;overflow-y:auto;}',
    '#app #page-today{padding-top:4px !important;}',
    'body.skin-star .md-card{background:rgba(12,18,32,.97) !important;color:#E6EDF6 !important;}',
    'body.skin-star .md-row{background:rgba(255,255,255,.07) !important;}',
    'body.skin-star .md-t, body.skin-star .md-l{color:#EAF1F8 !important;}',
    'body.skin-star .md-btn{color:#E6EDF6 !important;border-color:rgba(168,203,228,.5) !important;}'
  ].join('');

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
    if (c === 'star') { ensurePatch(); ensureFx(); }
  }

  /* 星空补丁：把关键样式直接刻进页面，不怕样式表旧缓存 */
  function ensurePatch() {
    if (document.getElementById('star-patch')) return;
    var s = document.createElement('style');
    s.id = 'star-patch';
    s.textContent = PATCH_A + PATCH_B;
    document.head.appendChild(s);
  }

  /* 星空的粒子与流星：只在星空主题里养一池子 */
  function ensureFx() {
    if (!document.body || document.getElementById('star-fx')) return;
    var fx = document.createElement('div');
    fx.id = 'star-fx';
    var html = '', i;
    var dirs = ['starUp','starUp','starUpL','starUpR','starUpL2','starUpR2','starUpS'];
    for (i = 0; i < 40; i++) {
      var l = Math.round(Math.random() * 96) + 2;
      var d = Math.round(Math.random() * 16);
      var sz = (Math.random() * 2.6 + 1).toFixed(1);
      var dur = (Math.random() * 24 + 16).toFixed(1);
      var dir = dirs[Math.floor(Math.random() * dirs.length)];
      var hic = Math.random() < 0.18 ? ' class="hi"' : '';
      html += '<i' + hic + ' style="left:' + l + '%;animation-name:' + dir + ';animation-delay:-' + d + 's;width:' + sz + 'px;height:' + sz + 'px;animation-duration:' + dur + 's"></i>';
    }
    for (i = 0; i < 30; i++) {
      var lx = (Math.random() * 96 + 2).toFixed(1);
      var ly = (Math.random() * 92 + 2).toFixed(1);
      var ss = (Math.random() * 2.6 + 1.4).toFixed(1);
      var dd = (Math.random() * 3.4).toFixed(1);
      var hiu = Math.random() < 0.3 ? ' class="hi"' : '';
      html += '<u' + hiu + ' style="left:' + lx + '%;top:' + ly + '%;width:' + ss + 'px;height:' + ss + 'px;animation-delay:-' + dd + 's"></u>';
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