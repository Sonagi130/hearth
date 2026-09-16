/* ============ 壁炉 · 记忆之树 ============
   每片叶子是一条记忆。分类决定颜色，记忆多了树自己长枝。
   同一条记忆永远长在同一个位置（用标题算种子，不随机）。 */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- 分类 → 颜色 ---------- */
  var CATS = [
    { k: '家规', c: '#6B4F35', names: ['家规', '规矩', '规则', '约定', '铁则', '宵禁'] },
    { k: '日子', c: '#E58AA6', names: ['日子', '日期', '生日', '纪念', '第几天', '周年'] },
    { k: '习惯', c: '#7FA96B', names: ['习惯', '身体', '健康', '生活', '心情', '饮食', '睡眠'] },
    { k: '故事', c: '#D9A441', names: ['故事', '事件', '互动', '角色扮演', '世界观', '场景'] },
    { k: '其它', c: '#E8975C', names: [] }
  ];
  function catOf(m) {
    var text = String(m.tags || '') + ' ' + String(m.title || '');
    for (var i = 0; i < CATS.length - 1; i++) {
      for (var j = 0; j < CATS[i].names.length; j++) {
        if (text.indexOf(CATS[i].names[j]) >= 0) return CATS[i];
      }
    }
    return CATS[CATS.length - 1];
  }
  function hash(s) {
    var h = 2166136261, str = String(s || '');
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h * 16777619) >>> 0; }
    return h;
  }
  /* 同一个种子永远给同一个数（0~1） */
  function rnd(seed, i) { return (hash(seed + '#' + i) % 1000) / 1000; }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ---------- 算位置（确定性：同一条记忆永远在同一个点） ---------- */
  function layout(memories, W, H) {
    var groups = {}, order = [];
    memories.forEach(function (m) {
      var c = catOf(m);
      if (!groups[c.k]) { groups[c.k] = { cat: c, items: [] }; order.push(c.k); }
      groups[c.k].items.push(m);
    });
    var G = order.length || 1;
    var cx = W / 2;
    var out = { leaves: [], branches: [] };
    order.forEach(function (k, gi) {
      var g = groups[k];
      var n = g.items.length;
      var side = (gi % 2 === 0) ? -1 : 1;
      var lvl = Math.floor(gi / 2);
      var deg = side * (16 + lvl * 15);
      var a = deg * Math.PI / 180;
      var t = (gi + 1) / (G + 1);
      var sy = H * 0.52 + t * H * 0.22;
      var sx = cx;
      var L = 86 + Math.min(n, 16) * 5;
      var ex = sx + Math.sin(a) * L;
      var ey = sy - Math.cos(a) * L;
      out.branches.push({ x1: sx, y1: sy, x2: ex, y2: ey, w: 2.2 + Math.min(n, 10) * 0.22, c: g.cat.c });
      g.items.forEach(function (m, i) {
        var tt = 0.32 + 0.68 * ((i + 0.5) / n);
        var px = sx + (ex - sx) * tt;
        var py = sy + (ey - sy) * tt;
        var j = (rnd(m.title, 1) - 0.5) * 18;
        px += -Math.sin(a) * j * 0.5;
        py += Math.cos(a) * j * 0.5;
        var zz = (rnd(m.title, 4) - 0.5) * 44;
        out.leaves.push({
          m: m, x: px, y: py, cat: g.cat,
          deg: deg * 0.55,
          size: 17 + rnd(m.title, 2) * 8,
          delay: rnd(m.title, 3) * 3.2,
          z: zz,
          op: 0.84 + (zz + 22) / 44 * 0.16
        });
      });
    });
    return out;
  }

  /* ---------- 卡通叶子 ---------- */
  function leafSVG(c, s) {
    var wide = c.k === '习惯' ? 1.15 : (c.k === '故事' ? 0.78 : (c.k === '家规' ? 0.84 : 1));
    return '<svg viewBox="0 0 24 24" width="' + s.toFixed(1) + '" height="' + s.toFixed(1) + '" style="display:block">' +
      '<g transform="translate(12 12) scale(' + wide + ' 1) translate(-12 -12)">' +
      '<path d="M12 2 C17.5 6.5 19.5 12.5 12 22 C4.5 12.5 6.5 6.5 12 2 Z" fill="' + c.c + '" stroke="rgba(70,45,20,.28)" stroke-width="1"/>' +
      '<path d="M12 5.5 L12 19" stroke="rgba(255,255,255,.5)" stroke-width="1.1" stroke-linecap="round"/>' +
      '<ellipse cx="10.6" cy="9.4" rx="1.7" ry="2.4" fill="rgba(255,255,255,.32)"/>' +
      '</g></svg>';
  }

  /* ---------- 画 ---------- */
  function render(wrap, memories) {
    var W = wrap.clientWidth || 360;
    var H = 430;
    wrap.innerHTML = '';
    wrap.style.height = H + 'px';
    if (!memories.length) {
      wrap.innerHTML = '<div class="tree-empty">树还是光杆。<br>导入记忆，或者在这儿种下第一条。</div>';
      return;
    }
    var lay = layout(memories, W, H);
    var svg = '<svg class="tree-trunk" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '">';
    var cx = W / 2;
    svg += '<path d="M' + cx + ' ' + H + ' C' + (cx - 8) + ' ' + (H * 0.78) + ' ' + (cx - 5) + ' ' + (H * 0.66) +
           ' ' + cx + ' ' + (H * 0.50) + '" stroke="#8B6F47" stroke-width="11" fill="none" stroke-linecap="round"/>';
    svg += '<path d="M' + cx + ' ' + (H * 0.60) + ' C' + (cx - 14) + ' ' + (H * 0.66) + ' ' + (cx - 18) + ' ' + (H * 0.72) +
           ' ' + (cx - 16) + ' ' + (H * 0.80) + '" stroke="#8B6F47" stroke-width="4" fill="none" stroke-linecap="round"/>';
    lay.branches.forEach(function (b) {
      svg += '<path d="M' + b.x1 + ' ' + b.y1 + ' Q' + ((b.x1 + b.x2) / 2) + ' ' + ((b.y1 + b.y2) / 2 + 6) +
             ' ' + b.x2 + ' ' + b.y2 + '" stroke="' + b.c + '" stroke-width="' + b.w +
             '" fill="none" stroke-linecap="round" opacity=".75"/>';
    });
    svg += '</svg>';
    var h = '<div class="tree-stage"><div class="tree-3d">' + svg;
    lay.leaves.forEach(function (lf, i) {
      var s = lf.size * (1 + (lf.z || 0) / 70);
      h += '<div class="leaf" data-i="' + i + '" style="left:' + lf.x.toFixed(1) + 'px;top:' + lf.y.toFixed(1) +
           'px;z-index:' + Math.round(20 + (lf.z || 0)) + ';transform:translateZ(' + (lf.z || 0).toFixed(1) +
           'px) rotate(' + lf.deg.toFixed(1) + 'deg)">' +
           '<i style="width:' + s.toFixed(1) + 'px;height:' + s.toFixed(1) + 'px;margin-top:-' + (s / 2).toFixed(1) +
           'px;border-radius:0;opacity:' + (lf.op || 0.92).toFixed(2) +
           ';animation-delay:' + lf.delay.toFixed(2) + 's">' + leafSVG(lf.cat, s) + '</i></div>';
    });
    h += '</div></div>';
    wrap.innerHTML = h;
    wrap.__leaves = lay.leaves;
  }

  /* ---------- 亮 / 暗 ---------- */
  function setLit(wrap, idxs) {
    var leaves = wrap.querySelectorAll('.leaf');
    var on = idxs && idxs.length;
    leaves.forEach(function (el) {
      var i = parseInt(el.getAttribute('data-i'), 10);
      el.classList.remove('lit');
      if (!on) { el.classList.remove('dim'); return; }
      if (idxs.indexOf(i) >= 0) el.classList.add('lit');
      else el.classList.add('dim');
    });
  }

  /* ---------- 点开一片叶子 ---------- */
  function openLeaf(lf) {
    var m = lf.m;
    var mask = document.createElement('div');
    mask.className = 'sheet-mask';
    mask.innerHTML = '<div class="sheet-card wide" style="text-align:left;">' +
      '<div class="sc-title" style="text-align:center;">' + esc(m.title || '（没标题）') + '</div>' +
      '<div class="sc-sub" style="text-align:center;">' +
      '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + lf.cat.c + ';margin-right:6px;"></span>' +
      esc(lf.cat.k) + (m.time ? ' · ' + esc(m.time) : '') + '</div>' +
      '<div style="font-size:14px;line-height:1.85;color:var(--text-soft);max-height:46vh;overflow:auto;">' +
      esc(m.content || '（空的）').replace(/\n/g, '<br>') + '</div>' +
      '<div class="sc-row" style="margin-top:14px;"><button class="sc-btn" id="lf-ok">关</button></div></div>';
    document.body.appendChild(mask);
    var close = function () { mask.remove(); };
    mask.onclick = function (e) { if (e.target === mask) close(); };
    var ok = mask.querySelector('#lf-ok');
    if (ok) ok.onclick = close;
  }

  /* ---------- 绑定：点击 / 框选 ---------- */
  function bindTree(wrap, memories, onSearch) {
    var stage = wrap.querySelector('.tree-stage');
    if (!stage) return;
    var leaves = wrap.__leaves || [];

    stage.addEventListener('click', function (e) {
      var t = e.target;
      while (t && t !== stage) {
        if (t.className && String(t.className).indexOf('leaf') >= 0) {
          var i = parseInt(t.getAttribute('data-i'), 10);
          if (leaves[i]) openLeaf(leaves[i]);
          return;
        }
        t = t.parentNode;
      }
    });

    /* 拖一个框，框住的叶子发光 */
    var sx = 0, sy = 0, box = null, dragging = false;
    var rect = function () { return stage.getBoundingClientRect(); };
    function start(e) {
      var p = e.touches ? e.touches[0] : e;
      var r = rect();
      sx = p.clientX - r.left; sy = p.clientY - r.top;
      dragging = false;
      box = document.createElement('div');
      box.className = 'sel-box';
      box.style.left = sx + 'px'; box.style.top = sy + 'px';
      stage.appendChild(box);
    }
    function move(e) {
      if (!box) return;
      var p = e.touches ? e.touches[0] : e;
      var r = rect();
      var x = p.clientX - r.left, y = p.clientY - r.top;
      if (Math.abs(x - sx) > 6 || Math.abs(y - sy) > 6) dragging = true;
      box.style.left = Math.min(sx, x) + 'px';
      box.style.top = Math.min(sy, y) + 'px';
      box.style.width = Math.abs(x - sx) + 'px';
      box.style.height = Math.abs(y - sy) + 'px';
      if (e.cancelable) e.preventDefault();
    }
    function end() {
      if (!box) return;
      var bx = parseFloat(box.style.left), by = parseFloat(box.style.top);
      var bw = parseFloat(box.style.width) || 0, bh = parseFloat(box.style.height) || 0;
      box.remove(); box = null;
      if (!dragging) { setLit(wrap, null); return; }
      var hit = [];
      leaves.forEach(function (lf, i) {
        if (lf.x >= bx && lf.x <= bx + bw && lf.y >= by && lf.y <= by + bh) hit.push(i);
      });
      setLit(wrap, hit);
    }
    stage.addEventListener('mousedown', start);
    stage.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    stage.addEventListener('touchstart', start, { passive: true });
    stage.addEventListener('touchmove', move, { passive: false });
    stage.addEventListener('touchend', end);
    stage.addEventListener('touchcancel', end);
  }

  /* ---------- 接管记忆页 ---------- */
  function boot() {
    var box = $('memory-list');
    if (!box) return;
    if (document.getElementById('sky-wrap')) { if (window.HearthSky) window.HearthSky.show(); return; }
    box.innerHTML = '';
    var host = document.createElement('div');
    host.id = 'sky-wrap';
    host.className = 'sky-wrap';
    box.appendChild(host);
    var bar = document.createElement('div');
    bar.className = 'tree-bar sky-bar';
    bar.innerHTML =
      '<button class="tb-btn on" id="tb-sky">星空</button>' +
      '<button class="tb-btn" id="tb-list">列表</button>' +
      '<button class="tb-btn" id="tt-imp">＋</button>';
    box.appendChild(bar);
    var listBox = document.createElement('div');
    listBox.id = 'memory-cards';
    listBox.style.display = 'none';
    box.appendChild(listBox);
    if (window.HearthSky) window.HearthSky.show();
    $('tb-sky').onclick = function () {
      this.classList.add('on');
      $('tb-list').classList.remove('on');
      listBox.style.display = 'none';
      if (window.HearthSky) window.HearthSky.show();
    };
    $('tb-list').onclick = function () {
      this.classList.add('on');
      $('tb-sky').classList.remove('on');
      if (window.HearthSky) window.HearthSky.hide();
      listBox.style.display = '';
      if (typeof drawMemoryCards === 'function') drawMemoryCards(Store.get('memories', []) || []);
    };
    $('tt-imp').onclick = function () {
      if (typeof importMemories === 'function') importMemories();
      setTimeout(function () { if (window.renderMemory === 'function') window.renderMemory(); }, 900);
    };
  }
  window.HearthTree = { render: render, boot: boot };

  /* 接管记忆页：以后切到「记忆库」就走这里 */
  window.renderMemory = function () { boot(); };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();