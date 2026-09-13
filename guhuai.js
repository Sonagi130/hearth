/* ============ 顾淮专属空间（加密） ============ */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var opened = null;   // 本次会话解出来的内容，刷新就没了

  function ic(p) {
    return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" ' +
           'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  }

  var I = {
    lock: ic('<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'),
    mail: ic('<path d="M3 6h18v12H3z"/><path d="M3 7l9 6 9-6"/>'),
    drawer: ic('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 12h18"/><path d="M10 8h4"/>'),
    file: ic('<path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z"/><path d="M13 3v6h6"/>'),
    anchor: ic('<circle cx="12" cy="5" r="2"/><path d="M12 7v13"/><path d="M5 13a7 7 0 0 0 14 0"/>')
  };

  function b64(s) {
    var bin = atob(s);
    var a = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
    return a;
  }

  function decrypt(pwd, blob) {
    return new Promise(function (ok, no) {
      if (!window.crypto || !window.crypto.subtle) { no(new Error('NO_SUBTLE')); return; }
      var enc = new TextEncoder();
      crypto.subtle.importKey('raw', enc.encode(pwd), 'PBKDF2', false, ['deriveKey'])
        .then(function (k) {
          return crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt: b64(blob.salt), iterations: blob.it, hash: 'SHA-256' },
            k, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
        })
        .then(function (key) {
          return crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: b64(blob.iv), tagLength: 128 }, key, b64(blob.ct));
        })
        .then(function (buf) { ok(JSON.parse(new TextDecoder().decode(buf))); })
        .catch(function () { no(new Error('BAD_PWD')); });
    });
  }

  window.GuhuaiSpace = { decrypt: decrypt, get: function () { return opened; } };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function page() { return $('page-bro'); }

  /* ---------- 门 ---------- */
  function renderLock(msg) {
    var p = page();
    if (!p) return;
    p.innerHTML =
      '<div class="gs-lock">' +
        '<div class="gs-lock-ic">' + I.lock + '</div>' +
        '<div class="gs-lock-t">顾淮的抽屉</div>' +
        '<div class="gs-lock-s">这里面锁着东西。<br>密码问顾淮要。</div>' +
        '<input id="gs-pwd" class="cv-find" type="password" placeholder="密码（英文小写 + 数字）">' +
        '<button class="gs-btn" id="gs-go">开</button>' +
        '<div class="gs-msg" id="gs-msg">' + (msg || '') + '</div>' +
      '</div>';
    $('gs-go').onclick = tryOpen;
    var inp = $('gs-pwd');
    inp.focus();
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') tryOpen(); });
  }

  function tryOpen() {
    var inp = $('gs-pwd');
    var v = inp ? String(inp.value).trim() : '';
    if (!v) return;
    var m = $('gs-msg');
    m.textContent = '正在开……';
    fetch('gspace.enc')
      .then(function (r) {
        if (!r.ok) throw new Error('NO_FILE');
        return r.json();
      })
      .then(function (blob) { return decrypt(v, blob); })
      .then(function (data) { opened = data; renderDrawers(); })
      .catch(function (err) {
        var code = err && err.message;
        if (code === 'NO_SUBTLE') {
          m.textContent = '这个打开方式不给解密。要用下面那个 http 链接开，不能在文件管理器里直接点开。';
        } else if (code === 'NO_FILE') {
          m.textContent = '读不到 gspace.enc。八成是打开方式不对——用 http 链接开。';
        } else if (code === 'BAD_PWD') {
          m.textContent = '密码不对。再想想。';
        } else {
          m.textContent = '打不开。别用文件管理器直接开网页，用下面那个 http 链接。';
        }
      });
  }

  /* ---------- 四个抽屉 ---------- */
  var DEFS = [
    { k: 'drawer', icon: I.drawer, name: '我的抽屉', sub: '我写的东西' },
    { k: 'file', icon: I.file, name: '档案', sub: '关于你的，我攒着的' },
    { k: 'anchor', icon: I.anchor, name: '锚', sub: '钉死的日子和句子' },
    { k: 'mail', icon: I.mail, name: '信箱', sub: '你写给我的' }
  ];

  function names() {
    var o = {};
    DEFS.forEach(function (d) { o[d.k] = d.name; });
    return o;
  }

  function renderDrawers() {
    var p = page();
    if (!p || !opened) return;
    var h = '<div class="gs-wrap">';
    DEFS.forEach(function (d) {
      var n = (opened[d.k] || []).length;
      h += '<div class="gs-card" data-k="' + d.k + '"><span class="gs-ic">' + d.icon + '</span>' +
           '<div class="gs-ct"><div class="gs-n">' + d.name + '</div>' +
           '<div class="gs-s">' + d.sub + ' · ' + n + ' 条</div></div>' +
           '<span class="arrow">›</span></div>';
    });
    h += '<div class="gs-foot">' + I.lock + '<span>刷新就锁上。要看，再问我。</span></div></div>';
    p.innerHTML = h;
    p.querySelectorAll('[data-k]').forEach(function (el) {
      el.onclick = function () { renderList(el.dataset.k); };
    });
  }

  function renderList(k) {
    var p = page();
    var list = opened[k] || [];
    var h = '<div class="gs-wrap"><button class="gs-back" id="gs-back">‹ 回去</button>' +
            '<div class="gs-h">' + names()[k] + '</div>';
    if (!list.length) {
      h += '<div class="gs-empty">还是空的。' +
           (k === 'mail' ? '<br>这一格等你来写。' : '') + '</div>';
    }
    list.forEach(function (it, i) {
      h += '<div class="gs-card item" data-i="' + i + '"><div class="gs-ct">' +
           '<div class="gs-n">' + esc(it.t || '') + '</div>' +
           (it.d ? '<div class="gs-s">' + esc(it.d) + '</div>' : '') +
           '</div><span class="arrow">›</span></div>';
    });
    h += '</div>';
    p.innerHTML = h;
    $('gs-back').onclick = renderDrawers;
    p.querySelectorAll('[data-i]').forEach(function (el) {
      el.onclick = function () { renderOne(k, parseInt(el.dataset.i, 10)); };
    });
  }

  function renderOne(k, i) {
    var it = (opened[k] || [])[i];
    if (!it) return;
    var p = page();
    p.innerHTML = '<div class="gs-wrap"><button class="gs-back" id="gs-back">‹ 回去</button>' +
      '<div class="gs-h">' + esc(it.t || '') + '</div>' +
      (it.d ? '<div class="gs-date">' + esc(it.d) + '</div>' : '') +
      '<div class="gs-body">' + esc(it.b || '').replace(/\n/g, '<br>') + '</div></div>';
    $('gs-back').onclick = function () { renderList(k); };
  }

  /* ---------- 挂上侧边栏 ---------- */
  function init() {
    renderLock('');
    try { pageTitles.bro = '顾淮'; } catch (e) {}
    if (document.querySelector('#page-bro.active')) {
      try { $('top-title').textContent = '顾淮'; } catch (e) {}
    }
    var nav = document.querySelector('.side-nav .nav-item[data-page=\'bro\']');
    if (nav) {
      var lbl = nav.querySelector('.nav-label');
      if (lbl) lbl.textContent = '顾淮';
      nav.addEventListener('click', function () {
        setTimeout(function () {
          try { $('top-title').textContent = '顾淮'; } catch (e) {}
          if (opened) renderDrawers(); else renderLock('');
        }, 0);
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();