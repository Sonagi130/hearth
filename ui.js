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
      '<div class="sh-body"></div>' +
      '<div class="sc-row" style="margin-top:14px;"><button class="sc-btn sh-close">关闭</button></div>';
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
                   '奶油层浓淡　<b id="bgdim-v">' + dim + '%</b></div>' +
                   '<input id="bgdim-r" type="range" min="0" max="100" value="' + dim + '" style="width:100%">' +
                   '<div style="font-size:11.5px;color:var(--text-soft);margin-top:8px;">' +
                   '0% 是原图，100% 基本看不见背景。<br>背景太花就看不清字，调到舒服为止。</div>' +
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
    sheet('数据备份与导入', '', [
      { icon: ICONS.upload, name: '导出聊天记录', sub: '选窗口，存成 json', on: exportChat },
      { icon: ICONS.download, name: '导入聊天记录', sub: '从 json 合并回来', on: importChat },
      { icon: ICONS.save, name: '导出记忆库', sub: '存成 json', on: exportMem },
      { icon: ICONS.download, name: '导入记忆库', sub: '从 json 合并', on: importMem },
      { icon: ICONS.clock, name: '每日自动备份', right: sw(u.autoBak),
        on: function () { setUI('autoBak', !u.autoBak); } },
      { icon: ICONS.clock, name: '最多保留几份', sub: (u.keepN || 3) + ' 份',
        on: function () {
          var n = prompt('保留几份？1 - 10', String(u.keepN || 3));
          if (!n) return;
          n = Math.max(1, Math.min(10, parseInt(n, 10) || 3));
          setUI('keepN', n);
        } },
      { icon: ICONS.refresh, name: '最近数据恢复', sub: '看历史备份', on: listBak }
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

  /* ---------- 根页 ---------- */
  function draw() {
    var box = $('settings-list');
    if (!box) return;
    box.innerHTML = '';
    var u = ui();
    box.appendChild(mkGroup('主题与外观', [
      { icon: ICONS.theme, name: '主题与外观', sub: '背景 · 气泡 · 卡片 · 侧边栏', on: shTheme },
      { icon: ICONS.image, name: '背景', sub: u.bg ? '自定义图' : '默认', on: pickBg }
    ]));
    box.appendChild(mkGroup('系统与权限', [
      { icon: ICONS.bell, name: '系统通知设置', sub: '提示音 · 振动', on: shNotify },
      { icon: ICONS.tool, name: '工具权限管理', sub: '允许 · 询问 · 禁止 · 白名单', on: shTools }
    ]));
    box.appendChild(mkGroup('AI 模型', [
      { icon: ICONS.robot, name: 'AI 模型配置', sub: '对话 · 翻译 · 音频 · 视频 · 识图', on: function () { if (window.HearthModels) window.HearthModels.ai(); else shAI(); } },
      { icon: ICONS.bell, name: '语音配置', sub: '我说话的声音（TTS）', on: function () { if (window.HearthModels) window.HearthModels.tts(); } },
      { icon: ICONS.chat, name: 'AI 思考链展示', sub: '聊天里可展开思考过程',
        right: sw(Store.get('showThinking', false)), on: myThinking }
    ]));
    box.appendChild(mkGroup('数据', [
      { icon: ICONS.save, name: '数据备份与导入', sub: '聊天 · 记忆库 · 自动备份', on: shData },
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

  window.renderSettings = draw;

  function init() {
    applyUI();
    autoBackup();
    if (location.hash.indexOf('@') > 0) {
      var k = location.hash.split('@')[1];
      setTimeout(function () {
        if (k === 'theme') shTheme();
        else if (k === 'notify') shNotify();
        else if (k === 'tools') shTools();
        else if (k === 'data') shData();
        else if (k === 'ai') shAI();
        else if (k === 'chat') shChat();
        else if (k === 'side') shSidebar();
      }, 260);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
