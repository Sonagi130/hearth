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
    var page = $('page-chat');
    if (!page || $('conv-bar')) return;
    var bar = document.createElement('div');
    bar.className = 'conv-bar';
    bar.id = 'conv-bar';
    bar.innerHTML =
      '<span style="width:30px;flex-shrink:0;"></span>' +
      '<div class="cb-mid" id="conv-title">' +
        '<span class="cb-name">顾淮</span>' +
        '<span class="cb-win" id="conv-win">对话</span>' +
        '<span class="cb-caret">▾</span>' +
      '</div>' +
      '<button class="cb-new" id="conv-new">＋</button>';
    page.insertBefore(bar, page.firstChild);
    $('conv-title').addEventListener('click', openList);
    $('conv-new').addEventListener('click', newConv);
  }

  function renderTitle() {
    var w = $('conv-win');
    if (!w) return;
    var c = conc();
    w.textContent = c.title || '对话';
  }

  /* ---------- 窗口列表 ---------- */
  function openList() {
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

  function thinkHTML(who) {
    if (who === 'me' || !Store.get('showThinking', false)) return '';
    return '<div class="think"><div class="think-h">思考过程 ▾</div>' +
           '<div class="think-b">（接上模型后，这里显示我这一句是怎么想出来的。）</div></div>';
  }

  function bodyHTML(t) {
    t = String(t == null ? '' : t);
    if (t.indexOf('__IMG__') === 0) {
      return '<img class="msg-img" src="' + t.slice(7).replace(/"/g, '') + '" alt="">';
    }
    if (t.indexOf('__AUD__') === 0) {
      return '<audio class="msg-aud" controls src="' + t.slice(7).replace(/"/g, '') + '"></audio>';
    }
    return esc(t);
  }

  function renderMessages() {
    var c = conc();
    var box = $('chat-messages');
    if (!box) return;
    box.innerHTML = '';
    (c.msgs || []).forEach(function (m) {
      var who = m.who === 'me' ? 'me' : 'he';
      var div = document.createElement('div');
      div.className = 'msg ' + who;
      div.innerHTML = thinkHTML(who) +
        '<div class="bubble">' + bodyHTML(m.text) + '</div>' +
        '<div class="time">' + esc(m.time || '') + '</div>';
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
      out.push({
        who: m.classList.contains('me') ? 'me' : 'he',
        text: b ? b.textContent : '',
        time: t ? t.textContent : ''
      });
    });
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === curId) { list[i].msgs = out; break; }
    }
    save(list);
  }

  window.addMsg = function (text, who) {
    var list = load();
    var w = who === 'me' ? 'me' : 'he';
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === curId) {
        list[i].msgs.push({ who: w, text: String(text), time: (w === 'me' ? '我' : '顾淮') + ' · ' + stamp().slice(11) });
        break;
      }
    }
    save(list);
    var box = $('chat-messages');
    var div = document.createElement('div');
    div.className = 'msg ' + w;
    div.innerHTML = thinkHTML(w) +
      '<div class="bubble">' + bodyHTML(text) + '</div>' +
      '<div class="time">' + (w === 'me' ? '我' : '顾淮') + ' · ' + stamp().slice(11) + '</div>';
    if (box) { box.appendChild(div); box.scrollTop = box.scrollHeight; }
  };

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

    var h = '<div class="info-grid">' +
      '<div><b>' + msgs.length + '</b><span>条消息</span></div>' +
      '<div><b>' + rounds + '</b><span>轮对话</span></div>' +
      '<div><b>~' + tin + '</b><span>输入 token</span></div>' +
      '<div><b>~' + tout + '</b><span>输出 token</span></div>' +
      '<div><b>0</b><span>缓存命中</span></div>' +
      '<div><b>~' + (tin + tout) + '</b><span>合计</span></div>' +
      '</div>' +
      '<div class="info-note">token 是估算的。接上模型后，这里换成真实的数字。</div>' +
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
      if (!confirm('删掉「' + (c.title || '对话') + '」？这个窗口的聊天记录全没。')) return;
      var arr = load().filter(function (x) { return x.id !== id; });
      if (!arr.length) { alert('就剩这一个窗口了，留着吧。'); return; }
      save(arr);
      if (id === curId) { curId = arr[arr.length - 1].id; Store.set('curConv', curId); }
      close();
      renderMessages();
    };

    var inp = $('cv-find');
    inp.oninput = function () {
      var kw = inp.value.trim();
      var out = $('cv-find-out');
      if (!kw) { out.innerHTML = ''; return; }
      var hits = msgs.filter(function (m) { return (m.text || '').indexOf(kw) >= 0; });
      if (!hits.length) { out.innerHTML = '<div class="cv-hit">没找到</div>'; return; }
      out.innerHTML = '<div class="cv-hit">找到 ' + hits.length + ' 条</div>' +
        hits.slice(0, 8).map(function (m) {
          var i = (m.text || '').indexOf(kw);
          var s = Math.max(0, i - 12);
          return '<div class="cv-hit">' + (m.who === 'me' ? '我' : '顾淮') + ' · ' +
                 esc((m.text || '').slice(s, s + 44)) + '</div>';
        }).join('');
    };
  }

  function init() {
    load();
    var saved = Store.get('curConv', null);
    if (saved) curId = saved;
    mountBar();
    renderMessages();
    try { pageTitles.chat = ''; } catch (e) {}
    if (document.querySelector('#page-chat.active')) {
      try { $('top-title').textContent = ''; } catch (e) {}
    }
    var navChat = document.querySelector('.side-nav .nav-item[data-page=\'chat\']');
    if (navChat) {
      navChat.addEventListener('click', function () {
        setTimeout(function () {
          try { $('top-title').textContent = ''; } catch (e) {}
        }, 0);
      });
    }
  }

  window.loadChatHistory = function () { renderMessages(); };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.HearthConv = {
    list: load,
    current: conc,
    switchTo: switchTo,
    create: newConv,
    info: showInfo,
    render: renderMessages
  };
})();
