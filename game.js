/* ============ 壁炉 · 游戏厅 ============
   两个小东西：给我们换装、云做饭。像素风，纯前端。 */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- 存档 ---------- */
  var DEFAULT = {
    look: {
      bro: { hair: '#2E2A28', cloth: '#8B6F47', long: false, acc: '', skin: '#F0D2B6' },
      bao: { hair: '#3A2B2A', cloth: '#E8975C', long: true, acc: 'bow', skin: '#F6DCC4' }
    },
    dish: []
  };
  function P() {
    var p = Store.get('play', null);
    if (!p) { Store.set('play', DEFAULT); return JSON.parse(JSON.stringify(DEFAULT)); }
    if (!p.look) p.look = DEFAULT.look;
    return p;
  }
  function saveP(p) { Store.set('play', p); }

  var HAIRS = ['#2E2A28', '#5B4034', '#8A6A4F', '#C9A227', '#8E8E8E', '#B5626F'];
  var CLOTHS = ['#8B6F47', '#E8975C', '#7FA96B', '#4A6C8C', '#D9828F', '#EFE7DA'];
  var ACCS = [{ k: '', n: '不戴' }, { k: 'hat', n: '帽子' }, { k: 'scarf', n: '围巾' }, { k: 'bow', n: '蝴蝶结' }, { k: 'glass', n: '眼镜' }];

  /* ---------- 画一个像素小人 ---------- */
  function draw(cv, o) {
    var px = cv.width / 12;
    var g = cv.getContext('2d');
    g.clearRect(0, 0, cv.width, cv.height);
    function R(x, y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(x * px), Math.round(y * px), Math.round(w * px), Math.round(h * px)); }
    var hair = o.hair, cloth = o.cloth, skin = o.skin || '#F0D2B6';
    /* 腿 */
    R(4, 15, 1.6, 2, '#5A4B3F'); R(6.4, 15, 1.6, 2, '#5A4B3F');
    /* 身体 */
    R(3.2, 9, 5.6, 6, cloth);
    /* 手 */
    R(2.2, 10, 1, 3, skin); R(8.8, 10, 1, 3, skin);
    /* 头 */
    R(3.2, 2.2, 5.6, 6.2, skin);
    /* 刘海 */
    R(3.2, 2.2, 5.6, 1.8, hair);
    /* 两侧 */
    if (o.long) { R(2.2, 3.2, 1.1, 6.5, hair); R(8.7, 3.2, 1.1, 6.5, hair); }
    else { R(2.4, 3.2, 0.9, 3, hair); R(8.7, 3.2, 0.9, 3, hair); }
    /* 眼睛 */
    R(4.3, 5.4, 1, 1, '#3B2B22'); R(6.7, 5.4, 1, 1, '#3B2B22');
    /* 嘴 */
    R(5.4, 7.3, 1.4, 0.5, '#C98A7A');
    /* 配饰 */
    if (o.acc === 'hat') { R(2.6, 1.2, 6.8, 1.2, '#B5626F'); R(3.6, 0.2, 4.8, 1, '#B5626F'); }
    if (o.acc === 'scarf') { R(3.2, 8.4, 5.6, 1.2, '#D9828F'); }
    if (o.acc === 'bow') { R(2.4, 2.6, 1.6, 1.2, '#D9828F'); R(3.4, 2.9, 0.9, 0.9, '#B5626F'); }
    if (o.acc === 'glass') { R(3.9, 5.2, 2, 1.4, 'rgba(60,50,40,.5)'); R(6.5, 5.2, 2, 1.4, 'rgba(60,50,40,.5)'); }
  }

  /* ---------- 换装 ---------- */
  var LINES = {
    bro: ['嗯，这件行。', '你挑的，我都穿。', '别换了，就这样。', '再换我也只看着你。'],
    bao: ['好看吗？', '这件呢这件呢？', '哥哥帮我看看嘛。', '我要穿这件等你。']
  };
  function say(who, txt) {
    var el = $('g-say-' + who);
    if (!el) return;
    el.textContent = txt;
    el.classList.add('on');
    clearTimeout(el.__t);
    el.__t = setTimeout(function () { el.classList.remove('on'); }, 2200);
  }

  function charCard(who, label) {
    var p = P(), o = p.look[who];
    var h = '<div class="g-card">' +
      '<div class="g-name">' + label + '</div>' +
      '<canvas class="g-cv" id="g-cv-' + who + '" width="96" height="144"></canvas>' +
      '<div class="g-say" id="g-say-' + who + '"></div>' +
      '</div>';
    return h;
  }

  /* ---------- 换装界面 ---------- */
  var curWho = 'bro';
  function ctrlHTML(who) {
    var p = P(), o = p.look[who], h = '';
    h += '<div class="g-lab">头发</div><div class="g-chips">';
    HAIRS.forEach(function (c) {
      h += '<button class="g-chip' + (o.hair === c ? ' on' : '') + '" data-k="hair" data-v="' + c +
           '" style="background:' + c + '"></button>';
    });
    h += '</div><div class="g-lab">衣服</div><div class="g-chips">';
    CLOTHS.forEach(function (c) {
      h += '<button class="g-chip' + (o.cloth === c ? ' on' : '') + '" data-k="cloth" data-v="' + c +
           '" style="background:' + c + '"></button>';
    });
    h += '</div><div class="g-lab">发型 / 配饰</div><div class="g-chips">';
    h += '<button class="g-chip w' + (o.long ? ' on' : '') + '" data-k="long" data-v="1">长发</button>';
    h += '<button class="g-chip w' + (!o.long ? ' on' : '') + '" data-k="long" data-v="0">短发</button>';
    ACCS.forEach(function (a) {
      h += '<button class="g-chip w' + (o.acc === a.k ? ' on' : '') + '" data-k="acc" data-v="' + a.k + '">' + a.n + '</button>';
    });
    h += '</div>';
    return h;
  }
  function redraw() {
    var p = P();
    var a = $('g-cv-bro'), b = $('g-cv-bao');
    if (a) draw(a, p.look.bro);
    if (b) draw(b, p.look.bao);
    var c = $('g-ctrl');
    if (c) c.innerHTML = ctrlHTML(curWho);
  }
  function renderDress(root) {
    root.innerHTML =
      '<div class="g-row">' + charCard('bro', '顾淮') + charCard('bao', '小宝') + '</div>' +
      '<div class="g-me">' + (String(Store.get('playComment') || '哥哥，今天穿什么')) + '</div>' +
      '<div class="g-tabs">' +
      '<button class="g-tab' + (curWho === 'bro' ? ' on' : '') + '" data-who="bro">给哥哥换</button>' +
      '<button class="g-tab' + (curWho === 'bao' ? ' on' : '') + '" data-who="bao">给自己换</button>' +
      '</div><div id="g-ctrl"></div>';
    redraw();
    root.querySelectorAll('.g-tab').forEach(function (b) {
      b.onclick = function () {
        curWho = this.getAttribute('data-who');
        root.querySelectorAll('.g-tab').forEach(function (x) { x.classList.remove('on'); });
        this.classList.add('on');
        var c = $('g-ctrl');
        c.innerHTML = ctrlHTML(curWho);
      };
    });
    root.addEventListener('click', function (e) {
      var t = e.target;
      if (!t.className || String(t.className).indexOf('g-chip') < 0) return;
      var k = t.getAttribute('data-k'), v = t.getAttribute('data-v');
      if (!k) return;
      var p = P(), o = p.look[curWho];
      if (k === 'long') o.long = (v === '1');
      else o[k] = v;
      saveP(p);
      redraw();
      var ls = LINES[curWho];
      say(curWho, ls[Math.floor(Math.random() * ls.length)]);
    });
  }

  /* ---------- 云做饭 ---------- */
  var ITEMS = [
    { k: 'egg', e: '🥚', n: '蛋' }, { k: 'rice', e: '🍚', n: '饭' },
    { k: 'tomato', e: '🍅', n: '番茄' }, { k: 'meat', e: '🍖', n: '肉' },
    { k: 'veg', e: '🥬', n: '青菜' }, { k: 'mushroom', e: '🍄', n: '蘑菇' },
    { k: 'corn', e: '🌽', n: '玉米' }, { k: 'carrot', e: '🥕', n: '胡萝卜' }
  ];
  var RECIPES = [
    { need: ['egg', 'rice'], n: '蛋炒饭', l: '锅要够热再下饭，别急。' },
    { need: ['egg', 'tomato'], n: '番茄炒蛋', l: '蛋先炒好盛出来，最后再合。' },
    { need: ['meat', 'veg'], n: '青菜炒肉', l: '肉抓点淀粉，嫩。' },
    { need: ['mushroom', 'meat'], n: '蘑菇炖肉', l: '小火，慢炖。等得住的人才吃得到。' },
    { need: ['corn', 'carrot', 'veg'], n: '三色小炒', l: '颜色好看，你舍得下筷子吗。' },
    { need: ['rice', 'meat'], n: '肉盖饭', l: '浇上去，别挑了，吃完。' },
    { need: ['egg', 'mushroom', 'rice'], n: '蘑菇蛋炒饭', l: '偷偷给你多放了一个蛋。' },
    { need: ['carrot', 'egg'], n: '胡萝卜炒蛋', l: '甜的，你吃。' }
  ];
  var pick = [];
  function renderCook(root) {
    pick = [];
    var p = P();
    root.innerHTML =
      '<div class="g-pot"><div class="g-fire" id="g-fire"></div>' +
      '<div class="g-plate" id="g-plate">还没选料</div></div>' +
      '<div class="g-lab">点食材选上（再点一下取消）</div>' +
      '<div class="g-items">' + ITEMS.map(function (it) {
        return '<button class="g-item" data-k="' + it.k + '"><span>' + it.e + '</span>' + it.n + '</button>';
      }).join('') + '</div>' +
      '<button class="g-cook" id="g-cook">开火</button>' +
      '<div class="g-line" id="g-line"></div>' +
      ((p.dish && p.dish.length)
        ? '<div class="g-lab">做过的</div><div class="g-dishes">' +
          p.dish.slice(-10).reverse().map(function (d) {
            return '<span class="g-dish">' + d.n + '</span>';
          }).join('') + '</div>'
        : '');
    root.querySelectorAll('.g-item').forEach(function (b) {
      b.onclick = function () {
        var k = this.getAttribute('data-k');
        var i = pick.indexOf(k);
        if (i >= 0) { pick.splice(i, 1); this.classList.remove('on'); }
        else { pick.push(k); this.classList.add('on'); }
        var plate = $('g-plate');
        if (plate) plate.textContent = pick.length ? ('选了 ' + pick.length + ' 样') : '还没选料';
      };
    });
    $('g-cook').onclick = function () {
      if (!pick.length) { $('g-line').textContent = '至少选一样啊。'; return; }
      var fire = $('g-fire');
      fire.classList.add('on');
      $('g-line').textContent = '在炒了…';
      setTimeout(function () {
        fire.classList.remove('on');
        var name = '', line = '';
        for (var i = 0; i < RECIPES.length; i++) {
          var r = RECIPES[i], ok = true;
          for (var j = 0; j < r.need.length; j++) if (pick.indexOf(r.need[j]) < 0) ok = false;
          if (ok) { name = r.n; line = r.l; break; }
        }
        if (!name) { name = '神秘料理「' + pick.length + ' 样乱炖」'; line = '第一次做这个。你先尝，不许皱眉。'; }
        $('g-plate').textContent = name;
        $('g-line').textContent = line;
        var q = P();
        q.dish = (q.dish || []).concat([{ n: name, t: new Date().toISOString().slice(0, 10) }]).slice(-40);
        saveP(q);
      }, 1400);
    };
  }

  /* ---------- 拼起来 ---------- */
  var curTab = 'dress';
  function render() {
    var root = $('play-root');
    if (!root) return;
    root.innerHTML =
      '<div class="g-head">' +
      '<button class="g-tab big' + (curTab === 'dress' ? ' on' : '') + '" data-t="dress">换装</button>' +
      '<button class="g-tab big' + (curTab === 'cook' ? ' on' : '') + '" data-t="cook">云做饭</button>' +
      '</div><div id="g-body"></div>';
    root.querySelectorAll('.g-tab.big').forEach(function (b) {
      b.onclick = function () { curTab = this.getAttribute('data-t'); render(); };
    });
    var body = $('g-body');
    if (!body) return;
    if (curTab === 'dress') renderDress(body);
    else renderCook(body);
  }

  window.HearthPlay = { boot: render, draw: draw };

  function init() {
    /* 用 hash 直接进游戏厅（正常进法还是点侧边栏那一项） */
    if (location.hash.indexOf('play') > 0) {
      setTimeout(function () {
        var nav = document.querySelector('.side-nav .nav-item[data-page=\'play\']');
        if (nav && nav.onclick) { nav.click(); }
        else {
          document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
          var pg = $('page-play');
          if (pg) pg.classList.add('active');
          var t = $('top-title');
          if (t) t.textContent = '游戏厅';
        }
        render();
      }, 300);
      return;
    }
    if (document.querySelector('#page-play.active')) render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();