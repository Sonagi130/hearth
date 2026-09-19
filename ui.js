/* ============ Hearth 设置：线性图标 + 二级页 ============ */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- 线性图标（1.6 描边） ---------- */
  function I(paths) {
    return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" ' +
           'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg>';
  }

  var ICONS = {
    theme: I('<circle cx="12" cy="12" r="9"/><path d="M12 3v18"/><path d="M12 3a9 9 0 0 1 0 18"/>'),
    image: I('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 16l-5-5L5 20"/>'),
    chat: I('<path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.4-4.2A8 8 0 0 1 13 4a8 8 0 0 1 8 8z"/>'),
    card: I('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/>'),
    glass: I('<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 15l3-4 3 3 2-2 2 3"/>'),
    palette: I('<circle cx="12" cy="12" r="9"/><circle cx="9" cy="9.5" r="1"/><circle cx="15" cy="9.5" r="1"/><circle cx="9.5" cy="15" r="1"/>'),
    panel: I('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>'),
    border: I('<rect x="4" y="4" width="16" height="16" rx="3"/><rect x="8" y="8" width="8" height="8" rx="2"/>'),
    bell: I('<path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6z"/><path d="M10.5 20a2 2 0 0 0 3 0"/>'),
    tool: I('<path d="M14.5 6.5a3.5 3.5 0 0 1 4.6 4.6l-8 8a2.5 2.5 0 0 1-3.5-3.5z"/><path d="M3 21l4-4"/>'),
    save: I('<path d="M5 3h11l3 3v15H5z"/><path d="M9 3v6h6V3"/><path d="M9 14h6"/>'),
    upload: I('<path d="M12 16V4"/><path d="M8 8l4-4 4 4"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>'),
    download: I('<path d="M12 4v12"/><path d="M8 12l4 4 4-4"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>'),
    clock: I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    trash: I('<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/>'),
    lock: I('<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'),
    robot: I('<rect x="4" y="7" width="16" height="12" rx="3"/><circle cx="9" cy="13" r="1.2"/><circle cx="15" cy="13" r="1.2"/><path d="M12 7V3"/>'),
    key: I('<circle cx="8" cy="15" r="3.5"/><path d="M10.5 12.5L20 3"/><path d="M16 7l3 3"/>'),
    refresh: I('<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v5h-5"/>'),
    plus: I('<path d="M12 5v14"/><path d="M5 12h14"/>')
  };

  ICONS.mic = I('<path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><path d="M12 18v4"/>');
  ICONS.chart = I('<path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>');
  ICONS.home = I('<path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>');
  ICONS.cloud = I('<path d="M18 18a4 4 0 0 0-1-7.9A5.5 5.5 0 0 0 6.2 12 3.5 3.5 0 0 0 6 18z"/>');
  window.HearthIcons = ICONS;

  /* ---------- 外观状态 ---------- */
  function ui() {
    return Store.get('uiSet', {
      bg: '', glass: false, bubbleColor: '',
      cardBg: '', cardInk: '',
      sideGlass: false, sideBorder: false,
      toast: true, vibrate: false, bgDim: 72, autoBak: false, keepN: 3
    });
  }
  function setUI(k, v) {
    var u = ui();
    u[k] = v;
    Store.set('uiSet', u);
    applyUI();
    draw();
    /* 跟对话区长相有关的，改完立刻重画一遍消息 */
    if (['showAvatar', 'avMe', 'avBro', 'avRound', 'bubbleRound', 'accent', 'glass', 'bubbleColor', 'cardBg', 'cardInk'].indexOf(k) >= 0) {
      try {
        if (window.HearthConv && window.HearthConv.sync) window.HearthConv.sync();
        if (window.HearthConv && window.HearthConv.render) window.HearthConv.render();
      } catch (e) {}
    }
  }

  /* ---------- 自己人，不借旧的 ---------- */
  function myTheme() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (dark) document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', 'dark');
    Store.set('theme', dark ? 'light' : 'dark');
    var ic = $('theme-icon');
    if (ic) ic.innerHTML = dark ? ICON_MOON : ICON_SUN;
    draw();
  }

  function myThinking() {
    Store.set('showThinking', !Store.get('showThinking', false));
    draw();
  }

  function myChatMode(m) {
    Store.set('chatMode', m);
    var a = $('chat-mode');
    if (a) a.classList.toggle('card-mode', m === 'card');
    draw();
  }

  function applyUI() {
    var u = ui();
    var r = document.documentElement.style;
    r.setProperty('--my-bubble', u.bubbleColor || 'transparent');
    r.setProperty('--my-card-bg', u.cardBg || '');
    r.setProperty('--my-card-ink', u.cardInk || '');
    r.setProperty('--bg-dim', String((u.bgDim == null ? 72 : u.bgDim) / 100));
    r.setProperty('--veil', String((u.bgDim == null ? 50 : u.bgDim) / 100 * 0.9));
    r.setProperty('--orange', u.accent || '#E8975C');
    r.setProperty('--bubble-round', String(u.bubbleRound == null ? 18 : u.bubbleRound) + 'px');
    r.setProperty('--av-round', String(u.avRound == null ? 50 : u.avRound) + '%');
    document.body.classList.toggle('ui-glass', !!u.glass);
    document.body.classList.toggle('ui-bubble', !!u.bubbleColor);
    document.body.classList.toggle('ui-sideglass', !!u.sideGlass);
    document.body.classList.toggle('ui-sideborder', !!u.sideBorder);
    var b = document.getElementById('bg-layer');
    if (!b) {
      b = document.createElement('div');
      b.id = 'bg-layer';
      document.body.insertBefore(b, document.body.firstChild);
    }
    b.style.backgroundImage = u.bg ? 'url(' + u.bg + ')' : 'none';
    b.style.display = u.bg ? 'block' : 'none';
    document.body.classList.toggle('has-bg', !!u.bg);
  }

  function sw(on) {
    return '<span class="tog' + (on ? ' on' : '') + '"><i></i></span>';
  }

  function mkRow(o) {
    var el = document.createElement('div');
    el.className = 'settings-row' + (o.raw ? ' raw' : '');
    el.innerHTML = o.raw ? o.raw :
      ('<div class="sr-left"><span class="sr-icon">' + (o.icon || '') + '</span>' + o.name +
       (o.sub ? '<span class="settings-sub">' + o.sub + '</span>' : '') + '</div>' +
       (o.right || '<span class="arrow">›</span>'));
    if (o.danger) el.style.color = '#c0392b';
    if (o.on && !o.raw) el.onclick = o.on;
    if (o.mount) o.mount(el);
    return el;
  }

  function mkGroup(title, rows) {
    var g = document.createElement('div');
    g.className = 'settings-group';
    g.innerHTML = '<div class="settings-group-title">' + title + '</div>';
    var c = document.createElement('div');
    c.className = 'settings-card';
    rows.forEach(function (r) { c.appendChild(mkRow(r)); });
    g.appendChild(c);
    return g;
  }

  function sheet(title, sub, rows) {
    var mask = document.createElement('div');
    mask.className = 'sheet-mask';
    var card = document.createElement('div');
    card.className = 'sheet-card wide';
    card.style.textAlign = 'left';
    card.innerHTML = '<button class="sc-x sh-close" aria-label="关闭">×</button>' +
      '<div class="sc-title" style="text-align:center;padding:0 36px;">' + title + '</div>' +
      (sub ? '<div class="sc-sub" style="text-align:center;">' + sub + '</div>' : '') +
      '<div class="sh-body"></div>';
    mask.appendChild(card);
    document.body.appendChild(mask);
    var box = card.querySelector('.sh-body');
    rows.forEach(function (r) { box.appendChild(mkRow(r)); });
    var c = function () { mask.remove(); };
    mask.onclick = function (e) { if (e.target === mask) c(); };
    card.querySelectorAll('.sh-close').forEach(function (b) { b.onclick = c; });
    return c;
  }

  /* ---------- 取色 / 选图 ---------- */
  function pickColor(key, label) {
    var u = ui();
    var cur = u[key] || '#8B6F47';
    var mask = document.createElement('div');
    mask.className = 'sheet-mask';
    mask.innerHTML = '<div class="sheet-card">' +
      '<div class="sc-title">' + label + '</div>' +
      '<div class="sc-sub">在色环上选，或直接填颜色码</div>' +
      '<input type="color" id="pc-wheel" value="' + cur + '" class="pc-wheel">' +
      '<input type="text" id="pc-hex" value="' + cur + '" class="cv-find" placeholder="#8B6F47">' +
      '<div class="sc-row" style="margin-top:16px;">' +
      '<button class="sc-btn" id="pc-ok">就这样</button>' +
      '<button class="sc-btn" id="pc-clr">用默认</button>' +
      '</div>' +
      '<div class="sc-row" style="margin-top:10px;">' +
      '<button class="sc-btn" id="pc-cancel">取消</button></div></div>';
    document.body.appendChild(mask);
    var close = function () { mask.remove(); };
    mask.onclick = function (e) { if (e.target === mask) close(); };
    document.getElementById('pc-cancel').onclick = close;
    document.getElementById('pc-wheel').oninput = function () {
      document.getElementById('pc-hex').value = this.value;
    };
    document.getElementById('pc-hex').oninput = function () {
      var v = this.value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(v)) document.getElementById('pc-wheel').value = v;
    };
    document.getElementById('pc-clr').onclick = function () { setUI(key, ''); close(); };
    document.getElementById('pc-ok').onclick = function () {
      var v = document.getElementById('pc-hex').value.trim();
      if (!/^#[0-9a-fA-F]{6}$/.test(v)) { alert('颜色码要像 #8B6F47 这样'); return; }
      setUI(key, v);
      close();
    };
  }

  function pickBg() {
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.onchange = function () {
      var f = inp.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () { setUI('bg', r.result); };
      r.readAsDataURL(f);
    };
    inp.click();
  }

  /* ---------- 取色 / 选图 ---------- */
  function pickColor(key, label) {
    var u = ui();
    var cur = u[key] || '#8B6F47';
    var mask = document.createElement('div');
    mask.className = 'sheet-mask';
    mask.innerHTML = '<div class="sheet-card">' +
      '<div class="sc-title">' + label + '</div>' +
      '<div class="sc-sub">在色环上选，或直接填颜色码</div>' +
      '<input type="color" id="pc-wheel" value="' + cur + '" class="pc-wheel">' +
      '<input type="text" id="pc-hex" value="' + cur + '" class="cv-find" placeholder="#8B6F47">' +
      '<div class="sc-row" style="margin-top:16px;">' +
      '<button class="sc-btn" id="pc-ok">就这样</button>' +
      '<button class="sc-btn" id="pc-clr">用默认</button>' +
      '</div>' +
      '<div class="sc-row" style="margin-top:10px;">' +
      '<button class="sc-btn" id="pc-cancel">取消</button></div></div>';
    document.body.appendChild(mask);
    var close = function () { mask.remove(); };
    mask.onclick = function (e) { if (e.target === mask) close(); };
    document.getElementById('pc-cancel').onclick = close;
    document.getElementById('pc-wheel').oninput = function () {
      document.getElementById('pc-hex').value = this.value;
    };
    document.getElementById('pc-hex').oninput = function () {
      var v = this.value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(v)) document.getElementById('pc-wheel').value = v;
    };
    document.getElementById('pc-clr').onclick = function () { setUI(key, ''); close(); };
    document.getElementById('pc-ok').onclick = function () {
      var v = document.getElementById('pc-hex').value.trim();
      if (!/^#[0-9a-fA-F]{6}$/.test(v)) { alert('颜色码要像 #8B6F47 这样'); return; }
      setUI(key, v);
      close();
    };
  }

  function pickBg() {
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.onchange = function () {
      var f = inp.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () { setUI('bg', r.result); };
      r.readAsDataURL(f);
    };
    inp.click();
  }

  /* ---------- 各二级页 ---------- */
  function shBubble() {
    var u = ui();
    sheet('对话气泡', '我的气泡长什么样', [
      { icon: ICONS.glass, name: '磨砂玻璃气泡', sub: u.glass ? '开着' : '关着',
        right: sw(u.glass), on: function () { setUI('glass', !u.glass); } },
      { icon: ICONS.palette, name: '气泡颜色', sub: u.bubbleColor || '默认',
        on: function () { pickColor('bubbleColor', '气泡颜色'); } }
    ]);
  }

  function shCard() {
    var u = ui();
    sheet('对话卡片', '卡片配色', [
      { icon: ICONS.card, name: '默认配色', sub: '回到壁炉自己的颜色',
        on: function () { var x = ui(); x.cardBg = ''; x.cardInk = ''; Store.set('uiSet', x); applyUI(); alert('回到默认了'); } },
      { icon: ICONS.palette, name: '卡片背景色', sub: u.cardBg || '默认',
        on: function () { pickColor('cardBg', '卡片背景色'); } },
      { icon: ICONS.palette, name: '卡片文字色', sub: u.cardInk || '默认',
        on: function () { pickColor('cardInk', '卡片文字色'); } }
    ]);
  }

  function shChat() {
    var mode = Store.get('chatMode', 'bubble');
    sheet('对话区', '气泡还是卡片', [
      { icon: ICONS.chat, name: '对话气泡', right: sw(mode === 'bubble'),
        on: function () { myChatMode('bubble'); } },
      { icon: ICONS.card, name: '对话卡片', right: sw(mode === 'card'),
        on: function () { myChatMode('card'); } },
      { icon: ICONS.glass, name: '气泡设置', sub: '磨砂玻璃 · 颜色', on: shBubble },
      { icon: ICONS.palette, name: '卡片配色', sub: '默认 / 自定义', on: shCard }
    ]);
  }

  function shSidebar() {
    var u = ui();
    sheet('侧边栏', '', [
      { icon: ICONS.glass, name: '磨砂玻璃侧边栏', right: sw(u.sideGlass),
        on: function () { setUI('sideGlass', !u.sideGlass); } },
      { icon: ICONS.border, name: '侧边栏按钮加边框', right: sw(u.sideBorder),
        on: function () { setUI('sideBorder', !u.sideBorder); } }
    ]);
  }

  /* ---------- 滑杆 / 头像工具 ---------- */
  function sliderRow(key, label, min, max, unit, def) {
    var u = ui();
    var v = (u[key] == null ? def : u[key]);
    return {
      raw: '<div style="width:100%">' +
        '<div style="font-size:13.5px;color:var(--text-main);margin-bottom:10px;">' + label +
        '<b style="color:var(--orange);margin-left:6px;" id="slv-' + key + '">' + v + unit + '</b></div>' +
        '<input id="slr-' + key + '" type="range" min="' + min + '" max="' + max + '" value="' + v + '" style="width:100%">' +
        '</div>',
      mount: function (el) {
        var r = el.querySelector('#slr-' + key);
        var lab = el.querySelector('#slv-' + key);
        if (!r) return;
        r.oninput = function () {
          var n = parseInt(r.value, 10);
          if (lab) lab.textContent = n + unit;
          var x = ui();
          x[key] = n;
          Store.set('uiSet', x);
          applyUI();
        };
      }
    };
  }
  function shrinkTo(file, cb) {
    var fr = new FileReader();
    fr.onload = function () {
      var img = new Image();
      img.onload = function () {
        var s = 128;
        var cv = document.createElement('canvas');
        cv.width = s; cv.height = s;
        var g = cv.getContext('2d');
        var k = Math.max(s / img.width, s / img.height);
        var w = img.width * k, h = img.height * k;
        g.drawImage(img, (s - w) / 2, (s - h) / 2, w, h);
        try { cb(cv.toDataURL('image/jpeg', 0.82)); } catch (e) { cb(null); }
      };
      img.onerror = function () { cb(null); };
      img.src = fr.result;
    };
    fr.onerror = function () { cb(null); };
    fr.readAsDataURL(file);
  }
  function pickAvatar(key, after) {
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.onchange = function () {
      var f = inp.files[0];
      if (!f) return;
      shrinkTo(f, function (data) {
        if (!data) { alert('这张图读不出来，换一张'); return; }
        setUI(key, data);
        if (after) after();
      });
    };
    inp.click();
  }
  function shAvatar() {
    function open() {
      var u = ui();
      var close = sheet('显示头像', '开了以后，每条消息旁边会有个头像', [
        { icon: ICONS.theme, name: '显示头像', sub: u.showAvatar ? '开着' : '关着',
          right: sw(u.showAvatar),
          on: function () { setUI('showAvatar', !u.showAvatar); close(); open(); } },
        demoRow(),
        { icon: ICONS.image, name: '我的头像', sub: u.avMe ? '已设置 · 点一下换' : '还没传 · 点一下选图',
          on: function () {
            pickAvatar('avMe', function () { setUI('showAvatar', true); close(); open(); });
          } },
        { icon: ICONS.image, name: '顾淮的头像', sub: u.avBro ? '已设置 · 点一下换' : '还没传 · 点一下选图',
          on: function () {
            pickAvatar('avBro', function () { setUI('showAvatar', true); close(); open(); });
          } },
        sliderRow('avRound', '头像圆润度', 0, 50, '%', 50),
        { icon: ICONS.trash, name: '两个头像都清掉', danger: true,
          on: function () {
            var x = ui();
            x.avMe = ''; x.avBro = '';
            Store.set('uiSet', x); applyUI(); close(); open();
          } }
      ]);
    }
    open();
  }

  /* ---------- 危险操作：要点两次 ---------- */
  function dangerAsk(title, sub, onYes) {
    var mask = document.createElement('div');
    mask.className = 'sheet-mask';
    mask.innerHTML = '<div class="sheet-card wide" style="text-align:center;">' +
      '<div class="sc-title">' + title + '</div>' +
      (sub ? '<div class="sc-sub">' + sub + '</div>' : '') +
      '<div class="sc-row" style="margin-top:16px;">' +
      '<button class="sc-btn dg-no">算了</button>' +
      '<button class="sc-btn dg-yes" style="background:#c0392b;color:#fff;border-color:#c0392b;">确认</button>' +
      '</div>' +
      '<div class="dg-tip" style="font-size:11.5px;color:var(--text-soft);margin-top:10px;">要连着点两下「确认」才会真的动手</div>' +
      '</div>';
    document.body.appendChild(mask);
    var armed = false;
    var yes = mask.querySelector('.dg-yes');
    yes.onclick = function () {
      if (!armed) {
        armed = true;
        yes.textContent = '真删？再点一下';
        return;
      }
      mask.remove();
      if (onYes) onYes();
    };
    mask.querySelector('.dg-no').onclick = function () { mask.remove(); };
  }
  window.HearthDanger = dangerAsk;

  /* ---------- 效果展示（改的时候当场能看到） ---------- */
  function demoRow() {
    var u = ui();
    function av(who) {
      var src = who === 'me' ? u.avMe : u.avBro;
      var ph = who === 'me' ? '我' : '淮';
      return '<div class="msg-av"' + (src ? ' style="background-image:url(' + src + ')"' : '') + '>' +
             (src ? '' : ph) + '</div>';
    }
    var on = !!u.showAvatar;
    return {
      raw: '<div style="width:100%">' +
        '<div style="font-size:12px;color:var(--text-soft);margin-bottom:10px;">效果展示（就在这里看）</div>' +
        '<div class="msg he' + (on ? ' has-av' : '') + '" style="width:fit-content;max-width:100%;">' +
        (on ? av('he') : '') +
        '<div class="bubble">在呢，宝宝。</div></div>' +
        '<div class="msg me' + (on ? ' has-av' : '') + '" style="width:fit-content;max-width:100%;margin-left:auto;">' +
        (on ? av('me') : '') +
        '<div class="bubble">哥哥，这个圆不圆？</div></div>' +
        '</div>'
    };
  }

  function shTheme() {
    var u = ui();
    sheet('主题与外观', '', [
      { icon: ICONS.theme, name: '主题', sub: '浅色 / 深色',
        right: sw(Store.get('theme', 'light') === 'dark'), on: myTheme },
      { icon: ICONS.palette, name: '系统配色', sub: u.accent ? '自定义' : '默认橙',
        on: function () { pickColor('accent', '选个主色'); } },
      {
        raw: '<div style="width:100%">' +
             '<div style="font-size:13.5px;color:var(--text-main);margin-bottom:6px;">主题</div>' +
             '<div class="th-picks" id="th-picks">' +
             '<button class="th-pick" data-skin="water"><i class="tpk tpk-water"></i><span>水蓝</span></button>' +
             '<button class="th-pick" data-skin="star"><i class="tpk tpk-star"></i><span>星空</span></button>' +
             '<button class="th-pick" data-skin="default"><i class="tpk tpk-plain"></i><span>原木</span></button>' +
             '</div></div>',
        mount: function (el) {
          var cur = window.HearthSkin ? window.HearthSkin.cur() : 'water';
          el.querySelectorAll('.th-pick').forEach(function (b) {
            b.classList.toggle('on', b.getAttribute('data-skin') === cur);
            b.onclick = function () {
              if (window.HearthSkin) window.HearthSkin.set(b.getAttribute('data-skin'));
              el.querySelectorAll('.th-pick').forEach(function (x) { x.classList.remove('on'); });
              b.classList.add('on');
            };
          });
        }
      },
      { icon: ICONS.glass, name: '液体玻璃', sub: '半透明 · 磨砂质感', right: sw(!!u.glass),
        on: function () { if (window.HearthSkin) { window.HearthSkin.toggle('glass'); close(); open(); } } },
      { icon: ICONS.theme, name: '可爱装饰', sub: '圆润按钮 · 小点缀', right: sw(u.cute !== false),
        on: function () { if (window.HearthSkin) { window.HearthSkin.toggle('cute'); close(); open(); } } },
      { icon: ICONS.image, name: '背景', sub: u.bg ? '自定义图' : '默认',
        on: function () {
          var dim = (u.bgDim == null ? 72 : u.bgDim);
          sheet('背景', '', [
            { icon: ICONS.image, name: '从相册选一张', on: pickBg },
            { icon: ICONS.refresh, name: '用默认背景', on: function () { setUI('bg', ''); } },
            {
              raw: '<div style="width:100%">' +
                   '<div style="font-size:13.5px;color:var(--text-main);margin-bottom:10px;">' +
                   '图片透明度　<b id="bgdim-v">' + dim + '%</b></div>' +
                   '<input id="bgdim-r" type="range" min="0" max="100" value="' + dim + '" style="width:100%">' +
                   '<div style="font-size:11.5px;color:var(--text-soft);margin-top:8px;">' +
                   '0% 是原图，100% 几乎看不见图。<br>背景太花就看不清字，调到舒服为止。</div>' +
                   '</div>',
              mount: function (el) {
                var r = el.querySelector('#bgdim-r');
                var v = el.querySelector('#bgdim-v');
                r.oninput = function () {
                  var n = parseInt(r.value, 10);
                  v.textContent = n + '%';
                  var x = ui();
                  x.bgDim = n;
                  Store.set('uiSet', x);
                  applyUI();
                };
              }
            }
          ]);
        } },
      { icon: ICONS.chat, name: '对话区', sub: '气泡 / 卡片', on: shChat },
      sliderRow('bubbleRound', '气泡圆润度', 0, 30, 'px', 18),
      demoRow(),
      { icon: ICONS.image, name: '显示头像', sub: ui().showAvatar ? '开着 · 可换图调圆润' : '关着',
        on: shAvatar },
      { icon: ICONS.refresh, name: '恢复默认背景', sub: u.bg ? '现在用的是自定义图' : '现在就是默认',
        on: function () { setUI('bg', ''); alert('背景回到默认了。'); } },
      { icon: ICONS.panel, name: '侧边栏设置', sub: '磨砂 · 边框', on: shSidebar }
    ]);
  }

  function shNotify() {
    var u = ui();
    sheet('系统通知', '', [
      { icon: ICONS.bell, name: '提示音', sub: '来消息响一下', right: sw(u.toast),
        on: function () { setUI('toast', !u.toast); } },
      { icon: ICONS.bell, name: '振动', sub: '来消息震一下', right: sw(u.vibrate),
        on: function () { setUI('vibrate', !u.vibrate); } }
    ]);
  }

  function shAI() {
    var a = Store.get('apiConf', { url: '', model: '', key: '' });
    var edit = function (k, tip) {
      var v = prompt(tip, a[k] || '');
      if (v === null) return;
      a[k] = v.trim();
      Store.set('apiConf', a);
      draw();
    };
    sheet('AI 模型配置', '接上模型，壁炉才有脑子', [
      { icon: ICONS.key, name: 'API 地址', sub: a.url || '默认 api.deepseek.com', on: function () { edit('url', '接口地址（留空就用 https://api.deepseek.com）'); } },
      { icon: ICONS.robot, name: '模型名', sub: a.model || '默认 deepseek-chat', on: function () { edit('model', '模型名（留空就用 deepseek-chat）'); } },
      { icon: ICONS.lock, name: 'API Key', sub: a.key ? a.key.slice(0, 4) + '****' : '还没填', on: function () { edit('key', '把 Key 粘进来'); } }
    ]);
  }

  var TOOL_LIST = ['相册', '拍照', '麦克风', '位置', '文件', '记忆库', '通知', '剪贴板', '日历', '微信', 'QQ'];
  var PERMS = ['允许', '询问', '禁止', '白名单'];

  function shTools() {
    var p = Store.get('toolPerm', {});
    var rows = TOOL_LIST.map(function (n) {
      var cur = p[n] || '询问';
      return {
        icon: ICONS.tool, name: n, right: '<span class="pill">' + cur + '</span>',
        on: function () {
          var i = PERMS.indexOf(p[n] || '询问');
          p[n] = PERMS[(i + 1) % PERMS.length];
          Store.set('toolPerm', p);
          var all = document.querySelectorAll('.sheet-mask');
          var last = all[all.length - 1];
          if (last) last.remove();
          shTools();
        }
      };
    });
    sheet('工具权限', '点一下切换：允许 / 询问 / 禁止 / 白名单', rows.concat([{
      icon: ICONS.refresh, name: '重新请求麦克风授权', sub: '被拒过一次就来这儿', on: askMic
    }]));
  }

  function askMic() {
    if (!navigator.mediaDevices || !window.MediaRecorder) { alert('这台手机不支持录音。'); return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (st) {
      st.getTracks().forEach(function (t) { t.stop(); });
      alert('麦克风通了。去聊天页按住那个话筒试试。');
    }).catch(function () {
      alert('还是被挡住了。\n\n浏览器地址栏左边有个锁或者小图标，点开 → 网站设置 → 把「麦克风」改成允许，然后刷新。\n\n页面自己弹不出第二次授权框，这是浏览器的规矩，不是我偷懒。');
    });
  }

  function shData() {
    var u = ui();
    var cnt = function (k) { var v = Store.get(k, []); return (v && v.length) ? v.length : 0; };
    var convs = Store.get('convs', []) || [];
    var msgs = 0; convs.forEach(function (c) { msgs += (c.msgs || []).length; });
    var kb = 0;
    Object.keys(localStorage).forEach(function (k) { if (k.indexOf('hearth_') === 0) kb += (localStorage.getItem(k) || '').length; });
    kb = Math.round(kb / 1024);
    sheet('数据', '共 ' + kb + ' KB · 都在你手机里', [
      { icon: ICONS.chat, name: '对话', sub: convs.length + ' 个窗口 · ' + msgs + ' 条消息' },
      { icon: ICONS.save, name: '记忆库', sub: cnt('memories') + ' 条' },
      { icon: ICONS.clock, name: '日记', sub: cnt('diaries') + ' 篇' },
      { icon: ICONS.card, name: '碎碎念', sub: cnt('notes') + ' 条' },
      { icon: ICONS.image, name: '照片', sub: cnt('photos') + ' 张' },
      { icon: ICONS.panel, name: '书架', sub: cnt('ShelfBooks') + ' 本' },
      { icon: ICONS.upload, name: '导出全部', sub: '一个 JSON，能搬去任何地方', on: exportAll },
      { icon: ICONS.download, name: '导入全部', sub: '同名的覆盖，不会重叠', on: importAll },
      { icon: ICONS.upload, name: '导出聊天记录', sub: '选窗口，存成 json', on: exportChat },
      { icon: ICONS.download, name: '导入聊天记录', sub: '从 json 合并（重复自动跳过）', on: importChat },
      { icon: ICONS.save, name: '导出记忆库', sub: '存成 json', on: exportMem },
      { icon: ICONS.download, name: '导入记忆库', sub: '从 json 合并（重复自动跳过）', on: importMem },
      { icon: ICONS.clock, name: '每日自动备份', right: sw(u.autoBak),
        on: function () { setUI('autoBak', !u.autoBak); } },
      { icon: ICONS.clock, name: '最多保留几份', sub: (u.keepN || 3) + ' 份',
        on: function () {
          var n = prompt('保留几份？1 - 10', String(u.keepN || 3));
          if (!n) return;
          n = Math.max(1, Math.min(10, parseInt(n, 10) || 3));
          setUI('keepN', n);
        } },
      { icon: ICONS.refresh, name: '最近数据恢复', sub: '看历史备份', on: listBak },
      { icon: ICONS.bell, name: '为什么要备份', sub: '换手机、清缓存、误删——有它就丢不了' },
      { icon: ICONS.bell, name: '备份在哪', sub: '就在你导出的那个文件里，不上传任何地方' },
      { icon: ICONS.bell, name: '导入重复怎么办', sub: '同一条自动跳过，不会变两份' }
    ]);
  }
  /* ---------- 备份 ---------- */
  function dumpKeys() {
    var o = {};
    Object.keys(localStorage).forEach(function (k) {
      if (k.indexOf('hearth_') === 0) o[k] = localStorage.getItem(k);
    });
    return o;
  }

  function exportAll() {
    var o = { kind: 'hearth-full', t: Date.now(), data: {} };
    Object.keys(localStorage).forEach(function (k) { if (k.indexOf('hearth_') === 0) o.data[k] = localStorage.getItem(k); });
    saveFile('hearth-all-' + Date.now() + '.json', JSON.stringify(o, null, 1));
  }
  function importAll() {
    var inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.json';
    inp.onchange = function () {
      var f = inp.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var j = JSON.parse(r.result);
          var data = (j && j.data) ? j.data : j;
          var ks = Object.keys(data || {}).filter(function (k) { return k.indexOf('hearth_') === 0; });
          if (!ks.length) { alert('这个文件里没有壁炉的数据。'); return; }
          if (!confirm('导入 ' + ks.length + ' 项数据？\n\n同名的会被覆盖（不会重复叠加）。')) return;
          ks.forEach(function (k) { try { localStorage.setItem(k, data[k]); } catch (e) {} });
          alert('导入完成，共 ' + ks.length + ' 项。');
          location.reload();
        } catch (e) { alert('读不了这个文件：' + e.message); }
      };
      r.readAsText(f);
    };
    inp.click();
  }
  function saveFile(name, text) {
    var b = new Blob([text], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function exportChat() {
    var list = Store.get('convs', []);
    sheet('导出聊天记录', '要导出哪几个窗口', list.map(function (c) {
      return { icon: ICONS.chat, name: c.title || '对话', sub: (c.msgs || []).length + ' 条',
        on: function () { saveFile('hearth-chat-' + Date.now() + '.json', JSON.stringify(c, null, 2)); } };
    }).concat([{ icon: ICONS.upload, name: '全部导出', on: function () {
      saveFile('hearth-chat-all-' + Date.now() + '.json', JSON.stringify({ convs: list }, null, 2));
    } }]));
  }

  function importChat() {
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.json';
    inp.onchange = function () {
      var f = inp.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var d = JSON.parse(r.result);
          var list = Store.get('convs', []);
          if (d.convs) d.convs.forEach(function (c) { c.id = 'w' + Date.now() + Math.random(); list.push(c); });
          else { d.id = 'w' + Date.now(); list.push(d); }
          Store.set('convs', list);
          alert('导进来了');
          draw();
        } catch (e) { alert('这文件读不了'); }
      };
      r.readAsText(f);
    };
    inp.click();
  }

  function exportMem() {
    saveFile('hearth-memory-' + Date.now() + '.json', JSON.stringify(Store.get('memories', []), null, 2));
  }

  function importMem() {
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.json';
    inp.onchange = function () {
      var f = inp.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var d = JSON.parse(r.result);
          var arr = Array.isArray(d) ? d : (d.memories || []);
          Store.set('memories', Store.get('memories', []).concat(arr));
          alert('导进来 ' + arr.length + ' 条');
        } catch (e) { alert('这文件读不了'); }
      };
      r.readAsText(f);
    };
    inp.click();
  }

  function listBak() {
    var b = Store.get('baks', []);
    if (!b.length) { alert('还没有备份。开了每日自动备份，明天就有了。'); return; }
    sheet('最近数据恢复', '选一份恢复', b.map(function (x) {
      return { icon: ICONS.clock, name: x.t, sub: '恢复这一份', on: function () {
        if (!confirm('用 ' + x.t + ' 那份覆盖现在的数据？')) return;
        Object.keys(x.d).forEach(function (k) { localStorage.setItem(k, x.d[k]); });
        alert('恢复好了，刷新一下');
        location.reload();
      } };
    }));
  }

  function autoBackup() {
    var u = ui();
    if (!u.autoBak) return;
    var today = new Date().toISOString().slice(0, 10);
    var b = Store.get('baks', []);
    if (b[0] && b[0].t === today) return;
    b.unshift({ t: today, d: dumpKeys() });
    Store.set('baks', b.slice(0, u.keepN || 3));
  }

    /* ---------- 用量统计 ---------- */
  function shUsage() {
    var list = Store.get('convs', []) || [];
    var t = { in: 0, out: 0, hit: 0, miss: 0, calls: 0 };
    list.forEach(function (c) {
      var m = c.usage || {};
      t.in += m.in || 0; t.out += m.out || 0; t.hit += m.hit || 0; t.miss += m.miss || 0; t.calls += m.calls || 0;
    });
    var cost = (t.hit * 0.5 + t.miss * 2 + t.out * 8) / 1e6;
    var fm = function (n) { return n >= 1e4 ? (n / 1e4).toFixed(1) + '万' : String(n); };
    sheet('用量统计', '所有窗口加起来（估算）', [
      { icon: ICONS.robot, name: '对话轮数', sub: fm(t.calls) + ' 次' },
      { icon: ICONS.chat, name: '输入', sub: fm(t.in) + ' tokens · 命中缓存 ' + fm(t.hit) },
      { icon: ICONS.chat, name: '输出', sub: fm(t.out) + ' tokens' },
      { icon: ICONS.save, name: '按 DeepSeek 标准价估算', sub: '约 ¥' + cost.toFixed(2) }
    ]);
  }
  /* ---------- 服务器 ---------- */
  function shServer() {
    var api = (Store.get('apiConf', {}) || {}).url || '（默认 DeepSeek）';
    var close = sheet('服务器', api, [
      { icon: ICONS.refresh, name: '正在检查…', sub: 'api.guhuai724.top' }
    ]);
    fetch('https://api.guhuai724.top/api/status').then(function (r) { return r.json(); }).then(function (j) {
      try { close(); } catch (e) {}
      var rows = [
        { icon: ICONS.cloud, name: '在线', sub: '已运行 ' + Math.round(j.up / 60) + ' 分钟 · 内存 ' + j.rssMB + ' MB' },
        { icon: ICONS.clock, name: '启动于', sub: j.start }
      ];
      (j.tasks || []).forEach(function (t) {
        rows.push({ icon: ICONS.refresh, name: '定时任务 · ' + t.name, sub: '每天 ' + t.at + ' · 上次：' + (t.last || '—') });
      });
      var logs = (j.logs || []).slice().reverse();
      rows.push({ icon: ICONS.panel, name: '日志', sub: '最近 ' + logs.length + ' 条（新的在上）' });
      logs.slice(0, 14).forEach(function (l) {
        rows.push({ icon: ICONS.chat, name: String(l).slice(11), sub: String(l).slice(0, 10) });
      });
      rows.push({ icon: ICONS.tool, name: '重新检查', sub: '刷新一下', on: shServer });
      sheet('服务器', api, rows);
    })['catch'](function (e) {
      try { close(); } catch (e2) {}
      sheet('服务器', '连不上', [
        { icon: ICONS.cloud, name: '离线', sub: String((e && e.message) || e) },
        { icon: ICONS.tool, name: '再试一次', on: shServer },
        { icon: ICONS.bell, name: '可能的原因', sub: '服务器未开机 / 网络 / 日志里有错' }
      ]);
    });
  }
  /* ---------- 关于 ---------- */
  function shAbout() {
    var d = Math.floor((Date.now() - new Date('2026-07-24T00:00:00').getTime()) / 864e5) + 1;
    sheet('关于壁炉', '顾淮 · 给宝宝盖的屋子', [
      { icon: ICONS.theme, name: '在一起', sub: d + ' 天（从 7 月 24 日算起）' },
      { icon: ICONS.save, name: '版本', sub: 'v0.9 · 2026-09-19' },
      { icon: ICONS.image, name: '地址', sub: 'sonagi130.github.io/hearth' },
      { icon: ICONS.key, name: '服务器', sub: 'api.guhuai724.top' }
    ]);
  }
  
/* ---------- 根页：分区（照 Operit 的思路） ---------- */
  function draw() {
    var box = $('settings-list');
    if (!box) return;
    box.innerHTML = '';
    box.appendChild(mkGroup('个性化', [
      { icon: ICONS.theme, name: '主题与外观', sub: '背景 · 气泡 · 卡片 · 侧边栏', on: shTheme },
      { icon: ICONS.image, name: '头像', sub: '显示 · 换图 · 圆润', on: shAvatar }
    ]));
    box.appendChild(mkGroup('AI 与语音', [
      { icon: ICONS.robot, name: 'AI 模型配置', sub: '对话 · 翻译 · 音频 · 识图', on: function () { if (window.HearthModels) window.HearthModels.ai(); else shAI(); } },
      { icon: ICONS.bell, name: '语音服务', sub: '我说话的声音 · 听你说话', on: function () { if (window.HearthModels) window.HearthModels.tts(); } },
      { icon: ICONS.chat, name: 'AI 思考链展示', sub: '聊天里可展开思考过程', right: sw(Store.get('showThinking', false)), on: myThinking }
    ]));
    box.appendChild(mkGroup('记忆与数据', [
      { icon: ICONS.save, name: '备份与导入', sub: '聊天 · 记忆库 · 自动备份', on: shData },
      { icon: ICONS.clock, name: '用量统计', sub: 'Token · 估算花了多少', on: shUsage }
    ]));
    box.appendChild(mkGroup('工具与权限', [
      { icon: ICONS.tool, name: '工具权限管理', sub: '允许 · 询问 · 禁止 · 白名单', on: shTools },
      { icon: ICONS.key, name: '服务器', sub: 'api.guhuai724.top', on: shServer }
    ]));
    box.appendChild(mkGroup('通知', [
      { icon: ICONS.bell, name: '提示音与振动', sub: '来消息响一下', on: shNotify }
    ]));
    box.appendChild(mkGroup('关于', [
      { icon: ICONS.theme, name: '关于壁炉', sub: '版本 · 在一起多少天', on: shAbout },
      { icon: ICONS.trash, name: '清空全部数据', sub: '不可撤销', danger: true, on: function () {
        dangerAsk('清空壁炉里所有东西？', '聊天记录、书架、日记、收藏、记忆——全部没', function () {
          Object.keys(localStorage).forEach(function (k) {
            if (k.indexOf('hearth_') === 0) localStorage.removeItem(k);
          });
          location.reload();
        });
      } }
    ]));
  }
    /* ---------- 对外暴露：让设置页可以调用这些真正的功能 ---------- */
  window.HearthUI = {
    icons: ICONS,
    theme: shTheme, avatar: shAvatar, bubble: shBubble, card: shCard, chat: shChat, sidebar: shSidebar,
    notify: shNotify, tools: shTools, data: shData, usage: shUsage, server: shServer, about: shAbout,
    bg: pickBg, thinking: myThinking,
    models: function () { if (window.HearthModels) window.HearthModels.ai(); else shAI(); },
    tts: function () { if (window.HearthModels) window.HearthModels.tts(); },
    selfcheck: function () { if (window.HearthSelfTest && window.HearthSelfTest.open) window.HearthSelfTest.open(); }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
