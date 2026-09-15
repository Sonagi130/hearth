/* ============ Hearth 对话长按菜单 ============ */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var cur = null;       // 当前长按的 .msg
  var multiOn = false;
  var picked = [];

  function closeCtx() {
    var m = $('ctx-mask');
    if (m) m.remove();
    var b = $('ctx');
    if (b) b.remove();
    cur = null;
  }

  function toast(t) {
    var el = document.createElement('div');
    el.className = 'sheet-mask';
    el.style.background = 'transparent';
    el.innerHTML = '<div class="sheet-card" style="max-width:220px;padding:16px;">' +
                   '<div class="sc-sub" style="margin:0;">' + t + '</div></div>';
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 1400);
  }

  function bubbleOf(el) {
    var b = el.querySelector('.bubble');
    return b ? b.textContent : '';
  }
  /* 原始内容（语音/图片的标记都在里面，收藏要用这个） */
  function rawOf(el) {
    var r = el.getAttribute('data-raw');
    return r == null ? bubbleOf(el) : r;
  }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function nowStamp() {
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) +
           ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }
  function addFav(el) {
    var list = Store.get('favs', []);
    var tm = el.querySelector('.time');
    var win = '';
    try { win = (window.HearthConv.current() || {}).title || ''; } catch (e) {}
    list.unshift({
      id: 'f' + Date.now() + Math.floor(Math.random() * 100),
      who: isAI(el) ? 'he' : 'me',
      text: String(rawOf(el)),
      from: tm ? String(tm.textContent) : '',
      at: nowStamp(),
      win: win
    });
    Store.set('favs', list.slice(0, 600));
  }

  function isAI(el) { return el.classList.contains('he'); }

  /* ---------- 菜单 ---------- */
  function openMenu(el) {
    closeCtx();
    cur = el;
    var mask = document.createElement('div');
    mask.className = 'ctx-mask';
    mask.id = 'ctx-mask';

    var box = document.createElement('div');
    box.className = 'ctx';
    box.id = 'ctx';

    var items = [
      { k: 'copy', t: '复制' },
      { k: 'fav', t: '收藏' },
      { k: 'trans', t: '翻译' },
      { k: 'info', t: '信息' },
      { k: 'share', t: '分享' }
    ];
    if (isAI(el)) items.push({ k: 'regen', t: '重新生成' });
    items.push({ k: 'multi', t: '多选' });
    items.push({ k: 'del', t: '删除', cls: 'red' });

    var h = '';
    items.forEach(function (it) {
      if (it.k === 'del') h += '<div class="ctx-sep"></div>';
      h += '<button data-k="' + it.k + '"' + (it.cls ? ' class="' + it.cls + '"' : '') +
           '>' + it.t + '</button>';
    });
    box.innerHTML = h;
    document.body.appendChild(mask);
    document.body.appendChild(box);

    // 定位：贴着这条消息
    var r = el.getBoundingClientRect();
    var bw = 176, bh = box.offsetHeight;
    var left = Math.min(Math.max(12, r.left + 16), window.innerWidth - bw - 12);
    var top = r.top + 12;
    if (top + bh > window.innerHeight - 80) top = Math.max(12, r.bottom - bh - 12);
    box.style.left = left + 'px';
    box.style.top = top + 'px';

    mask.onclick = closeCtx;
    box.querySelectorAll('button').forEach(function (b) {
      b.onclick = function (e) {
        e.stopPropagation();
        doAction(b.dataset.k, el);
      };
    });
  }

  function doAction(k, el) {
    var txt = bubbleOf(el);
    if (k === 'copy') {
      copy(txt);
      closeCtx();
      toast('复制好了');
    } else if (k === 'fav') {
      closeCtx();
      addFav(el);
      toast('收进收藏夹了');
    } else if (k === 'del') {
      closeCtx();
      el.remove();
      try { Store.set('chatHistory', getChatHistory()); } catch (e) {}
    } else if (k === 'regen') {
      closeCtx();
      var b = el.querySelector('.bubble');
      if (b) b.textContent = '（还没接 API，接上就能重说一遍。）';
    } else if (k === 'share') {
      closeCtx();
      if (navigator.share) navigator.share({ text: txt }).catch(function () {});
      else { copy(txt); toast('这段不能分享，已经复制了'); }
    } else if (k === 'trans') {
      closeCtx();
      doTranslate(txt, el);
    } else if (k === 'info') {
      closeCtx();
      showInfo(txt, el);
    } else if (k === 'multi') {
      closeCtx();
      startMulti(el);
    }
  }

  /* ---------- 翻译（用「翻译模型」那格，没填就沿用对话模型） ---------- */
  function doTranslate(text, el) {
    var oldBox = el ? el.querySelector('.tr-box') : null;
    if (oldBox) { oldBox.classList.remove('off'); return; }
    var slot = {};
    try { slot = (window.HearthModels && window.HearthModels.slot('translate')) || {}; } catch (e) {}
    var c = Store.get('apiConf', {}) || {};
    var key = String(slot.key || c.key || '').trim();
    var base = String(slot.url || c.url || 'https://api.deepseek.com')
      .replace(/\/(audio\/speech|audio\/transcriptions)\/*$/i, '').replace(/\/+$/, '');
    var model = slot.model || c.model || 'deepseek-chat';
    if (!key) { toast('还没填 Key，去设置里填上'); return; }
    var box = document.createElement('div');
    box.className = 'tr-box';
    box.innerHTML = '<div class="tr-h"><span>翻译</span>' +
      '<button class="tr-x tr-copy">复制</button>' +
      '<button class="tr-x tr-close">收起</button></div>' +
      '<div class="tr-b">正在翻…</div>';
    if (el) el.appendChild(box); else document.body.appendChild(box);
    box.querySelector('.tr-close').onclick = function () { box.classList.add('off'); };
    var out = box.querySelector('.tr-b');
    var done = '';
    fetch(base + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: '你是翻译。把用户给的内容翻译过去：如果原文主要是中文，就译成英文；否则译成中文。只输出译文本身，不要解释、不要加引号。' },
          { role: 'user', content: String(text).slice(0, 2000) }
        ],
        stream: false
      })
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error((j && j.error && j.error.message) || ('HTTP ' + r.status));
        return j;
      });
    }).then(function (j) {
      done = String((j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '').trim();
      out.textContent = done || '（没翻出东西）';
    })['catch'](function (e) {
      out.textContent = '翻不了：' + (e && e.message);
    });
    box.querySelector('.tr-copy').onclick = function () { copy(done || out.textContent); toast('复制好了'); };
  }

  function copy(t) {
    if (navigator.clipboard) { navigator.clipboard.writeText(t).catch(function () {}); return; }
    var ta = document.createElement('textarea');
    ta.value = t;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    ta.remove();
  }

  /* ---------- 信息卡 ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function showInfo(t, el) {
    var chars = t.length;
    var tokens = Math.ceil(chars * 0.75) + 4;
    var who = isAI(el) ? '顾淮' : '我';
    var tm = el.querySelector('.time');
    var box = document.createElement('div');
    box.className = 'sheet-mask';
    box.innerHTML =
      '<div class="sheet-card" style="text-align:left;">' +
      '<div class="sc-title" style="text-align:center;">这条消息</div>' +
      '<div class="sc-sub" style="text-align:center;">' + who + ' · ' +
      esc(tm ? tm.textContent : '') + '</div>' +
      '<div style="font-size:13px;line-height:2.1;color:var(--text-soft);">' +
      '字数　' + chars + '<br>' +
      '估算 token　~' + tokens + '<br>' +
      '模型　还未接上' +
      '</div>' +
      '<div class="sc-row" style="margin-top:16px;">' +
      '<button class="sc-btn" id="info-ok">知道了</button></div></div>';
    document.body.appendChild(box);
    var close = function () { box.remove(); };
    box.onclick = function (e) { if (e.target === box) close(); };
    $('info-ok').onclick = close;
  }

  /* ---------- 多选 ---------- */
  function startMulti(first) {
    multiOn = true;
    picked = [];
    ensureBar();
    if (first) togglePick(first);
  }

  function ensureBar() {
    if ($('multi-bar')) return;
    var bar = document.createElement('div');
    bar.className = 'multi-bar';
    bar.id = 'multi-bar';
    bar.innerHTML =
      '<button id="mb-count" style="flex:1.5;background:transparent;">已选 0 条</button>' +
      '<button class="mb-go" id="mb-img">生成图片</button>' +
      '<button id="mb-cancel">取消</button>';
    document.body.appendChild(bar);
    $('mb-cancel').onclick = stopMulti;
    $('mb-img').onclick = makeImage;
  }

  function togglePick(m) {
    var i = picked.indexOf(m);
    if (i >= 0) { picked.splice(i, 1); m.classList.remove('picked'); }
    else { picked.push(m); m.classList.add('picked'); }
    var c = $('mb-count');
    if (c) c.textContent = '已选 ' + picked.length + ' 条';
  }

  function stopMulti() {
    multiOn = false;
    picked.forEach(function (m) { m.classList.remove('picked'); });
    picked = [];
    var bar = $('multi-bar');
    if (bar) bar.remove();
  }

  /* ---------- 生成图片 ---------- */
  function wrapText(text, per) {
    var out = [], line = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (ch === '\n') { out.push(line); line = ''; continue; }
      line += ch;
      if (line.length >= per) { out.push(line); line = ''; }
    }
    if (line) out.push(line);
    return out.length ? out : [''];
  }

  function makeImage() {
    if (!picked.length) { toast('先选几条'); return; }
    var W = 720, pad = 44, lh = 34, fs = 22;
    var blocks = picked.map(function (m) {
      var t = bubbleOf(m);
      return {
        who: m.classList.contains('me') ? '我' : '顾淮',
        lines: wrapText(t, Math.floor((W - pad * 2) / fs))
      };
    });
    var need = pad * 2 + 70;
    blocks.forEach(function (b) { need += b.lines.length * lh + 50; });
    var H = Math.max(need, 420);

    var cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    var g = cv.getContext('2d');
    g.fillStyle = '#FFF8F0'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#8B6F47'; g.font = '600 21px sans-serif';
    g.fillText('Hearth', pad, pad + 6);
    g.fillStyle = '#C4A882'; g.font = '13px sans-serif';
    g.fillText(new Date().toLocaleString(), pad, pad + 30);

    var y = pad + 76;
    blocks.forEach(function (b) {
      g.fillStyle = '#9C8A79'; g.font = '13px sans-serif';
      g.fillText(b.who, pad, y);
      y += 24;
      g.fillStyle = '#3D2B1F'; g.font = fs + 'px sans-serif';
      b.lines.forEach(function (ln) { g.fillText(ln, pad, y); y += lh; });
      y += 18;
      g.strokeStyle = 'rgba(139,111,71,.18)';
      g.beginPath(); g.moveTo(pad, y - 10); g.lineTo(W - pad, y - 10); g.stroke();
      y += 18;
    });

    var a = document.createElement('a');
    a.href = cv.toDataURL('image/png');
    a.download = 'hearth-' + Date.now() + '.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    stopMulti();
    toast('图存下了，在相册里找');
  }

  /* ---------- 长按绑定 ---------- */
  var pressTimer = null;

  function bind(el) {
    if (el.dataset.lp) return;
    el.dataset.lp = '1';
    var start = function () {
      if (multiOn) return;
      clearTimeout(pressTimer);
      pressTimer = setTimeout(function () { pressTimer = null; openMenu(el); }, 520);
    };
    var cancel = function () { clearTimeout(pressTimer); pressTimer = null; };
    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchend', cancel);
    el.addEventListener('touchmove', cancel);
    el.addEventListener('mousedown', start);
    el.addEventListener('mouseup', cancel);
    el.addEventListener('mouseleave', cancel);
    el.addEventListener('click', function (e) {
      if (multiOn) { e.preventDefault(); e.stopPropagation(); togglePick(el); }
    });
  }

  function scan() {
    document.querySelectorAll('#chat-messages .msg').forEach(bind);
  }

  function init() {
    scan();
    var box = $('chat-messages');
    if (box && window.MutationObserver) {
      new MutationObserver(scan).observe(box, { childList: true });
    }
    document.addEventListener('click', function (e) {
      if (!multiOn) return;
      if (e.target.closest('#multi-bar')) return;
      if (e.target.closest('.msg')) return;
      stopMulti();
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
