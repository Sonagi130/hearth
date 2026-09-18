/* ============ Hearth 对话多窗口 ============ */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  var KEY = 'convs';
  var curId = null;

  function load() {
    var list = Store.get('convs', null);
    if (!list || !list.length) {
      var old = Store.get('chatHistory', []);
      list = [{
        id: 'w' + Date.now(),
        title: old.length ? '最早那个窗口' : '第一个窗口',
        msgs: old,
        createdAt: Date.now()
      }];
      Store.set('convs', list);
    }
    return list;
  }

  function save(list) { Store.set('convs', list); }

  function conc() {
    var list = load();
    if (!curId) {
      curId = list[list.length - 1].id;
      Store.set('curConv', curId);
    }
    for (var i = 0; i < list.length; i++) if (list[i].id === curId) return list[i];
    curId = list[list.length - 1].id;
    return list[list.length - 1];
  }

  function stamp(d) {
    d = d || new Date();
    var p = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
           ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }


  /* ---------- 光标栏 ---------- */
  function mountBar() {
    var t = $('top-title');
    if (!t || t.dataset.cb) return;
    t.dataset.cb = '1';
    t.addEventListener('click', openList);

    var acts = document.querySelector('.top-bar .top-actions');
    if (acts && !document.getElementById('conv-new')) {
      var plus = document.createElement('button');
      plus.className = 'icon-btn cb-new';
      plus.id = 'conv-new';
      plus.textContent = '＋';
      plus.addEventListener('click', function (e) {
        e.stopPropagation();
        newConv();
      });
      acts.insertBefore(plus, acts.firstChild);
    }
  }

  function renderTitle() {
    var t = $('top-title');
    if (!t) return;
    var c = conc();
    t.classList.add('has-sub');
    t.innerHTML = '顾淮<span class="tb-sub">' + esc(c.title || '对话') + '</span>';
  }

  /* ---------- 窗口列表 ---------- */
  function openList() {
    if (!document.querySelector('#page-chat.active')) return;
    var list = load().slice().reverse();
    var h = '<div class="sheet-card wide">' +
      '<div class="sc-title">窗口</div>' +
      '<div class="conv-list">';
    list.forEach(function (c) {
      var n = (c.msgs || []).length;
      h += '<div class="conv-row' + (c.id === curId ? ' on' : '') + '" data-id="' + c.id + '">' +
           '<div class="cr-t">' + esc(c.title || '对话') + '</div>' +
           '<div class="cr-m">' + n + ' 条 · ' + (c.msgs && c.msgs.length ? esc(c.msgs[c.msgs.length - 1].time || '') : '空') + '</div>' +
           '<button class="cr-i" data-info="' + c.id + '">⋯</button>' +
           '</div>';
    });
    h += '</div>' +
      '<div class="sc-row" style="margin-top:14px;">' +
      '<button class="sc-btn" id="cv-new">新建窗口</button>' +
      '<button class="sc-btn" id="cv-close">关闭</button>' +
      '</div></div>';
    var mask = document.createElement('div');
    mask.className = 'sheet-mask';
    mask.id = 'conv-mask';
    mask.innerHTML = h;
    document.body.appendChild(mask);
    var close = function () { mask.remove(); };
    mask.onclick = function (e) { if (e.target === mask) close(); };
    $('cv-close').onclick = close;
    $('cv-new').onclick = function () { close(); newConv(); };
    mask.querySelectorAll('.conv-row').forEach(function (row) {
      row.querySelector('.cr-i').onclick = function (e) {
        e.stopPropagation();
        close();
        showInfo(row.dataset.id);
      };
      row.onclick = function () { close(); switchTo(row.dataset.id); };
    });
  }

  function thinkHTML(who, think) {
    if (who === 'me' || !Store.get('showThinking', false)) return '';
    var body = think ? esc(think) : '（这一条没有思考过程。）';
    return '<div class="think"><div class="think-h">思考过程 ▸</div>' +
           '<div class="think-b">' + body + '</div></div>';
  }

  /* ---------- 头像 ---------- */
  function avEl(who) {
    var u = Store.get('uiSet', {}) || {};
    if (!u.showAvatar) return null;
    var d = document.createElement('div');
    d.className = 'msg-av';
    var src = who === 'me' ? u.avMe : u.avBro;
    if (src) d.style.backgroundImage = 'url(' + src + ')';
    else d.textContent = who === 'me' ? '我' : '淮';
    return d;
  }
  function attachAv(div, who) {
    var av = avEl(who);
    if (!av) return;
    div.classList.add('has-av');
    div.insertBefore(av, div.firstChild);
  }

  function bodyHTML(t) {
    t = String(t == null ? '' : t);
    if (t.indexOf('__IMG__') === 0) {
      return '<img class="msg-img" src="' + t.slice(7).replace(/"/g, '') + '" alt="">';
    }
    if (t.indexOf('__AUD__') === 0) {
      var rest = t.slice(7);
      var bar = rest.indexOf('|');
      var body = (bar >= 0 ? rest.slice(0, bar) : rest).replace(/["<>]/g, '');
      var said = bar >= 0 ? rest.slice(bar + 1) : '';
      var idb = body.indexOf('idb:') === 0 ? body.slice(4) : '';
      var srcAttr = idb ? '' : ' src="' + body + '"';
      var bars = '';
      for (var i = 0; i < 26; i++) {
        var hh = 22 + ((i * 47) % 62);
        bars += '<i style="height:' + hh + '%"></i>';
      }
      return '<div class="vaud"' + (idb ? ' data-idb="' + idb + '"' : '') + '>' +
             '<audio preload="metadata"' + srcAttr + '></audio>' +
             '<button class="vaud-play" type="button">▶</button>' +
             '<div class="vaud-wave">' + bars + '</div>' +
             '<span class="vaud-time">0:00</span></div>' +
             (said ? '<div class="vaud-text">' + esc(said) + '</div>' : '');
    }
    var mm = t.match(/<<MEM ([^>]*)>>([\s\S]*?)<<\/MEM>>/);
    if (mm) {
      var clean = t.replace(mm[0], '').trim();
      return (clean ? esc(clean) : '') +
        '<div class="mem-box"><div class="mem-h">📎 附着的记忆 · ' + esc(mm[1]) + ' ▾</div>' +
        '<div class="mem-b">' + esc(mm[2]) + '</div></div>';
    }
    return esc(t);
  }

  function renderMessages() {
    var c = conc();
    var box = $('chat-messages');
    if (!box) return;
    box.innerHTML = '';
    (c.msgs || []).forEach(function (m, mi) {
      var who = m.who === 'me' ? 'me' : 'he';
      var div = document.createElement('div');
      div.className = 'msg ' + who;
      div.setAttribute('data-i', String(mi));
      div.setAttribute('data-raw', String(m.text == null ? '' : m.text));
      if (m.think) div.setAttribute('data-think', String(m.think));
      div.innerHTML = thinkHTML(who, m.think) +
        '<div class="bubble">' + bodyHTML(m.text) + '</div>' +
        '<div class="time">' + esc(m.time || '') + '</div>';
      attachAv(div, who);
      box.appendChild(div);
    });
    box.scrollTop = box.scrollHeight;
    renderTitle();
  }

  function switchTo(id) {
    saveFromDom();
    curId = id;
    Store.set('curConv', id);
    renderMessages();
  }

  function newConv() {
    saveFromDom();
    var list = load();
    var id = 'w' + Date.now();
    list.push({ id: id, title: '窗口 ' + (list.length + 1), msgs: [], createdAt: Date.now() });
    save(list);
    curId = id;
    Store.set('curConv', id);
    renderMessages();
  }

  function saveFromDom() {
    var box = $('chat-messages');
    if (!box) return;
    var list = load();
    var out = [];
    box.querySelectorAll('.msg').forEach(function (m) {
      var b = m.querySelector('.bubble');
      var t = m.querySelector('.time');
      var raw = m.getAttribute('data-raw');
      var th = m.getAttribute('data-think');
      out.push({
        who: m.classList.contains('me') ? 'me' : 'he',
        text: raw == null ? (b ? b.textContent : '') : raw,
        time: t ? t.textContent : '',
        think: th || ''
      });
    });
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === curId) { list[i].msgs = out; break; }
    }
    save(list);
  }

  window.addMsg = function (text, who, think) {
    var list = load();
    var w = who === 'me' ? 'me' : 'he';
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === curId) {
        list[i].msgs.push({ who: w, text: String(text), time: (w === 'me' ? '我' : '顾淮') + ' · ' + stamp().slice(11), think: String(think || '') });
        break;
      }
    }
    save(list);
    var box = $('chat-messages');
    var div = document.createElement('div');
    div.className = 'msg ' + w;
    div.setAttribute('data-raw', String(text));
    if (think) div.setAttribute('data-think', String(think));
    div.innerHTML = thinkHTML(w, think) +
      '<div class="bubble">' + bodyHTML(text) + '</div>' +
      '<div class="time">' + (w === 'me' ? '我' : '顾淮') + ' · ' + stamp().slice(11) + '</div>';
    attachAv(div, w);
    if (box) { box.appendChild(div); box.scrollTop = box.scrollHeight; }
  };

  /* ---------- 累计真实用量（接口吐出来的，不是估的） ---------- */
  function addUsage(u) {
    var list = load();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id !== curId) continue;
      var m = list[i].usage || { in: 0, out: 0, hit: 0, miss: 0, calls: 0 };
      m.in += (u.prompt_tokens || 0);
      m.out += (u.completion_tokens || 0);
      m.hit += (u.prompt_cache_hit_tokens || 0);
      m.miss += (u.prompt_cache_miss_tokens || 0);
      m.calls += 1;
      m.lastIn = u.prompt_tokens || 0;
      m.lastOut = u.completion_tokens || 0;
      m.lastHit = u.prompt_cache_hit_tokens || 0;
      list[i].usage = m;
      save(list);
      return;
    }
  }

  /* ---------- 按 flash 的价估个钱 ---------- */
  function cost(u) {
    var hit = u.hit || 0;
    var miss = (u.miss != null && u.miss !== 0) ? u.miss : ((u.in || 0) - hit);
    var out = u.out || 0;
    var usd = hit / 1e6 * 0.006 + miss / 1e6 * 0.3 + out / 1e6 * 1.2;
    return '¥' + (usd * 7.2).toFixed(4);
  }

  function showInfo(id) {
    var list = load();
    var c = null;
    for (var i = 0; i < list.length; i++) if (list[i].id === id) c = list[i];
    if (!c) return;
    var msgs = c.msgs || [];
    var inC = 0, outC = 0, rounds = 0;
    msgs.forEach(function (m) {
      if (m.who === 'me') { inC += (m.text || '').length; rounds++; }
      else outC += (m.text || '').length;
    });
    var tin = Math.ceil(inC * 0.75) + 4 * (rounds + 1);
    var tout = Math.ceil(outC * 0.75) + 4 * msgs.length;
    var u = c.usage || null;
    var real = !!(u && u.calls);
    var nIn = real ? u.in : ('~' + tin);
    var nOut = real ? u.out : ('~' + tout);
    var nHit = real ? u.hit : 0;
    var nAll = real ? (u.in + u.out) : ('~' + (tin + tout));
    var h = '<div class="info-grid">' +
      '<div><b>' + msgs.length + '</b><span>条消息</span></div>' +
      '<div><b>' + rounds + '</b><span>轮对话</span></div>' +
      '<div><b>' + nIn + '</b><span>输入 token</span></div>' +
      '<div><b>' + nOut + '</b><span>输出 token</span></div>' +
      '<div><b>' + nHit + '</b><span>缓存命中</span></div>' +
      '<div><b>' + nAll + '</b><span>合计</span></div>' +
      '</div>' +
      (real
        ? '<div class="info-note">接口给的真实数字 · 共 ' + u.calls + ' 次请求 · 按 flash 价约 ' + cost(u) + '</div>'
        : '<div class="info-note">这个窗口还没聊过，数字是估的。聊一句之后就是真实的。</div>') +
      '<input id="cv-find" class="cv-find" placeholder="在这个窗口里搜…">' +
      '<div id="cv-find-out" class="cv-find-out"></div>' +
      '<div class="sc-row" style="margin-top:14px;">' +
      '<button class="sc-btn" id="cv-ren">改名</button>' +
      '<button class="sc-btn" id="cv-del" style="background:#c0392b;color:#fff;">删除</button>' +
      '<button class="sc-btn" id="cv-back">关</button>' +
      '</div>';

    var mask = document.createElement('div');
    mask.className = 'sheet-mask';
    mask.innerHTML = '<div class="sheet-card wide"><div class="sc-title">' +
      esc(c.title || '对话') + '</div><div class="sc-sub">' +
      esc(stamp(new Date(c.createdAt || Date.now()))) + ' 建的</div>' + h + '</div>';
    document.body.appendChild(mask);

    var close = function () { mask.remove(); };
    mask.onclick = function (e) { if (e.target === mask) close(); };
    $('cv-back').onclick = close;
    $('cv-ren').onclick = function () {
      var t = prompt('给这个窗口起个名：', c.title || '');
      if (t === null) return;
      var arr = load();
      for (var k = 0; k < arr.length; k++) if (arr[k].id === id) arr[k].title = t.slice(0, 20) || '对话';
      save(arr);
      close();
      renderTitle();
    };
    $('cv-del').onclick = function () {
      var arr = load().filter(function (x) { return x.id !== id; });
      if (!arr.length) { alert('就剩这一个窗口了，留着吧。'); return; }
      var run = function () {
        save(arr);
        if (id === curId) { curId = arr[arr.length - 1].id; Store.set('curConv', curId); }
        close();
        renderMessages();
      };
      if (window.HearthDanger) window.HearthDanger('删掉这个窗口？', (c.title || '对话') + '的聊天记录会一起没', run);
      else if (confirm('删掉这个窗口？')) run();
    };

    var inp = $('cv-find');
    inp.oninput = function () {
      var kw = inp.value.trim();
      var out = $('cv-find-out');
      if (!kw) { out.innerHTML = ''; return; }
      var hits = [];
      msgs.forEach(function (m, i) {
        if ((m.text || '').indexOf(kw) >= 0) hits.push({ m: m, i: i });
      });
      if (!hits.length) { out.innerHTML = '<div class="cv-hit">没找到</div>'; return; }
      out.innerHTML = '<div class="cv-hit">找到 ' + hits.length + ' 条 · 点一下跳过去</div>' +
        hits.slice(0, 12).map(function (h) {
          var i = (h.m.text || '').indexOf(kw);
          var s = Math.max(0, i - 12);
          return '<div class="cv-hit cv-go" data-i="' + h.i + '">' +
                 (h.m.who === 'me' ? '我' : '顾淮') + ' · ' +
                 esc((h.m.text || '').slice(s, s + 44)) + '</div>';
        }).join('');
      out.querySelectorAll('.cv-go').forEach(function (el) {
        el.onclick = function () {
          var n = parseInt(this.getAttribute('data-i'), 10);
          close();
          jumpTo(n);
        };
      });
    };
  }

  /* ---------- 跳到某一条消息 ---------- */
  function jumpTo(n) {
    var box = $('chat-messages');
    if (!box) return;
    var el = box.querySelector('.msg[data-i="' + n + '"]');
    if (!el) return;
    try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    catch (e) { el.scrollIntoView(); }
    el.classList.add('jump-flash');
    setTimeout(function () { el.classList.remove('jump-flash'); }, 1800);
  }

  function init() {
    load();
    var saved = Store.get('curConv', null);
    if (saved) curId = saved;
    mountBar();
    renderMessages();
    try { pageTitles.chat = '顾淮'; } catch (e) {}
    if (document.querySelector('#page-chat.active')) {
      renderTitle();
    }
    var navChat = document.querySelector('.side-nav .nav-item[data-page=\'chat\']');
    if (navChat) {
      navChat.addEventListener('click', function () {
        setTimeout(renderTitle, 0);
      });
    }
  }

  window.loadChatHistory = function () { renderMessages(); };

  /* ---------- 语音条播放 ---------- */
  function fmtTime(s) {
    s = Math.max(0, Math.floor(s || 0));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  function tick(box, au) {
    var lab = box.querySelector('.vaud-time');
    var d = au.duration || 0;
    if (!d || !isFinite(d)) return;
    if (lab) lab.textContent = au.paused ? fmtTime(d) : '-' + fmtTime(d - au.currentTime);
    var bars = box.querySelectorAll('.vaud-wave i');
    var n = bars.length;
    var k = Math.round((au.currentTime / d) * n);
    for (var i = 0; i < n; i++) bars[i].classList.toggle('played', i < k);
  }

  function stopOthers(except) {
    document.querySelectorAll('.vaud').forEach(function (b) {
      if (b === except) return;
      var a = b.querySelector('audio');
      if (a && !a.paused) a.pause();
    });
  }

  function wireOne(box) {
    if (box.dataset.wired) return;
    box.dataset.wired = '1';
    var au = box.querySelector('audio');
    if (!au) return;
    au.addEventListener('loadedmetadata', function () { tick(box, au); });
    au.addEventListener('timeupdate', function () { tick(box, au); });
    au.addEventListener('ended', function () {
      box.classList.remove('playing');
      var b = box.querySelector('.vaud-play');
      if (b) b.textContent = '▶';
      au.currentTime = 0;
      tick(box, au);
    });
  }

  function wireAudio() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('.vaud-play');
      if (!btn) return;
      var box = btn.closest('.vaud');
      if (!box) return;
      var au = box.querySelector('audio');
      if (!au) return;

      var ready = Promise.resolve(au);
      if (!au.getAttribute('src') && box.dataset.idb && window.VStore) {
        btn.textContent = '…';
        ready = window.VStore.resolve('__AUD__idb:' + box.dataset.idb).then(function (url) {
          au.setAttribute('src', url);
          wireOne(box);
          return au;
        }).catch(function () {
          btn.textContent = '▶';
          var t = box.querySelector('.vaud-time');
          if (t) t.textContent = '丢了';
          return null;
        });
      }

      ready.then(function (a) {
        if (!a) return;
        if (a.paused) {
          stopOthers(box);
          box.classList.add('playing');
          btn.textContent = '❚❚';
          var p = a.play();
          if (p && p.catch) p.catch(function () {
            box.classList.remove('playing');
            btn.textContent = '▶';
          });
        } else {
          a.pause();
          box.classList.remove('playing');
          btn.textContent = '▶';
        }
      });
    });
  }

  wireAudio();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ---------- 底部弹层：思考链全文 ---------- */
  var HS = null, HS_PREV = '';
  function hsBuild() {
    if (HS) return HS;
    var mask = document.createElement('div'); mask.className = 'hsheet-mask';
    var sheet = document.createElement('div'); sheet.className = 'hsheet';
    sheet.innerHTML = '<div class="hsheet-grab"><i></i></div>' +
      '<div class="hsheet-h"><b>思考过程</b><em></em><button type="button">✕</button></div>' +
      '<div class="hsheet-b"></div>';
    document.body.appendChild(mask);
    document.body.appendChild(sheet);
    var grab = sheet.querySelector('.hsheet-grab');
    var bodyEl = sheet.querySelector('.hsheet-b');
    var emEl = sheet.querySelector('.hsheet-h em');
    var closeBtn = sheet.querySelector('.hsheet-h button');
    var sy = 0, dy = 0, drag = false, liveEl = null;
    function close() {
      if (!HS || !sheet.classList.contains('show')) return;
      sheet.classList.remove('show'); mask.classList.remove('show');
      sheet.style.transform = '';
      liveEl = null;
      document.body.style.overflow = HS_PREV;
    }
    function open(title, text, note, el) {
      sheet.querySelector('.hsheet-h b').textContent = title || '';
      emEl.textContent = note || '';
      liveEl = el || null;
      bodyEl.textContent = text || '（这一条没有思考过程。）';
      bodyEl.scrollTop = 0;
      HS_PREV = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      mask.classList.add('show');
      sheet.classList.add('show');
    }
    mask.addEventListener('click', close);
    closeBtn.addEventListener('click', close);
    grab.addEventListener('touchstart', function (e) {
      sy = e.touches[0].clientY; dy = 0; drag = true; sheet.style.transition = 'none';
    }, { passive: true });
    grab.addEventListener('touchmove', function (e) {
      if (!drag) return;
      dy = e.touches[0].clientY - sy;
      if (dy < 0) dy = dy * 0.28;
      sheet.style.transform = 'translateY(' + dy + 'px)';
      if (e.cancelable) e.preventDefault();
    }, { passive: false });
    grab.addEventListener('touchend', function () {
      drag = false; sheet.style.transition = '';
      if (dy > 86) close(); else sheet.style.transform = '';
    });
    /* 生成中：跟着长，并且自动滚到底（除非她自己往上翻了） */
    function update(text) {
      if (!liveEl || !sheet.classList.contains('show')) return;
      var atEnd = (bodyEl.scrollHeight - bodyEl.scrollTop - bodyEl.clientHeight) < 52;
      bodyEl.textContent = text || '';
      if (atEnd) bodyEl.scrollTop = bodyEl.scrollHeight;
    }
    HS = { mask: mask, sheet: sheet, close: close, open: open, update: update };
    return HS;
  }
  function openSheet(title, text, note, el) { hsBuild().open(title, text, note, el); }
  /* 对外接口：一开始就挂着，不用等点过一次 */
  window.HearthSheet = {
    open: function (t, x, n, e) { hsBuild().open(t, x, n, e); },
    close: function () { if (HS) HS.close(); },
    update: function (x) { if (HS && HS.update) HS.update(x); }
  };
  /* ---------- 点标题：弹底部；记忆块：就地展开 ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target;
    while (t && t !== document) {
      var cls = String(t.className || '');
      if (cls.indexOf('think-h') >= 0) {
        var box = t.parentNode;
        var hb = box.querySelector('.think-b');
        var msg = box.closest ? box.closest('.msg') : null;
        var full = '';
        if (msg && msg.getAttribute) full = msg.getAttribute('data-think') || '';
        if (!full && hb) full = hb.textContent || '';
        openSheet('思考过程', full, '顾淮', msg);
        return;
      }
      if (cls.indexOf('mem-h') >= 0) {
        t.parentNode.classList.toggle('open');
        return;
      }
      t = t.parentNode;
    }
  });
  window.HearthConv = {
    list: load,
    current: conc,
    switchTo: switchTo,
    create: newConv,
    info: showInfo,
    render: renderMessages,
    sync: saveFromDom,
    addUsage: addUsage
  };
})();
