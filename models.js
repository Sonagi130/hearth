/* ============ 壁炉 · 多模型 + 语音配置 ============ */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };

  var CSS = [
    '.md-mask{position:fixed;inset:0;z-index:9400;background:rgba(30,22,16,.45);display:flex;align-items:flex-end;}',
    '.md-card{width:100%;max-height:82vh;overflow:auto;background:var(--cream,#FBF6EE);border-radius:18px 18px 0 0;padding:16px 14px 22px;box-sizing:border-box;}',
    '.md-t{font-size:16px;font-weight:700;text-align:center;color:var(--brown,#5B4636);}',
    '.md-s{font-size:12px;opacity:.6;text-align:center;margin:4px 0 10px;}',
    '.md-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 10px;border-radius:12px;background:#fff;margin-top:8px;}',
    '.md-l{font-size:14px;font-weight:600;color:var(--brown,#5B4636);}',
    '.md-sub{display:block;font-size:12px;opacity:.62;font-weight:400;margin-top:3px;}',
    '.md-arrow{opacity:.4;}',
    '.md-btn{width:100%;margin-top:12px;padding:12px;border-radius:12px;border:1px solid var(--brown,#5B4636);background:transparent;color:var(--brown,#5B4636);font-size:14px;}'
  ].join('');

  function inject() {
    if ($('md-style')) return;
    var s = document.createElement('style');
    s.id = 'md-style';
    s.textContent = CSS;
    document.head.appendChild(s);
  }
  function closeAll() {
    document.querySelectorAll('.md-mask').forEach(function (m) { m.remove(); });
  }
  function sheet(title, sub, rows, foot) {
    inject();
    var mask = document.createElement('div');
    mask.className = 'md-mask';
    var card = document.createElement('div');
    card.className = 'md-card';
    card.innerHTML = '<div class="md-t">' + title + '</div>' +
      (sub ? '<div class="md-s">' + sub + '</div>' : '');
    rows.forEach(function (r) {
      var el = document.createElement('div');
      el.className = 'md-row';
      el.innerHTML = '<div><div class="md-l">' + r.name +
        '<span class="md-sub">' + (r.sub || '') + '</span></div></div>' +
        '<span class="md-arrow">›</span>';
      el.onclick = r.on;
      card.appendChild(el);
    });
    if (foot) {
      var fb = document.createElement('button');
      fb.className = 'md-btn';
      fb.textContent = foot.name;
      fb.onclick = foot.on;
      card.appendChild(fb);
    }
    var cb = document.createElement('button');
    cb.className = 'md-btn';
    cb.textContent = '关闭';
    cb.onclick = function () { mask.remove(); };
    card.appendChild(cb);
    mask.appendChild(card);
    mask.onclick = function (e) { if (e.target === mask) mask.remove(); };
    document.body.appendChild(mask);
    return mask;
  }

  /* ---------- 五个格子 ---------- */
  var SLOTS = [
    ['chat', '对话模型', '现在跟你说话用的'],
    ['translate', '翻译模型', '长按消息 → 翻译'],
    ['audio', '音频解析', '语音转文字'],
    ['video', '视频解析', '看视频'],
    ['vision', '识图', '看图（deepseek-flash 就支持）']
  ];

  function getSlot(k) {
    if (k === 'chat') {
      var a = Store.get('apiConf', {}) || {};
      return { url: a.url || '', model: a.model || '', key: a.key || '' };
    }
    var s = Store.get('modelSlots', {}) || {};
    return s[k] || { url: '', model: '', key: '' };
  }
  function setSlot(k, v) {
    if (k === 'chat') { Store.set('apiConf', { url: v.url, model: v.model, key: v.key }); return; }
    var s = Store.get('modelSlots', {}) || {};
    s[k] = v;
    Store.set('modelSlots', s);
  }
  function maskOf(k) {
    var v = getSlot(k);
    if (v.key) return v.key.slice(0, 5) + '****';
    return k === 'chat' ? '还没填' : '沿用对话的 Key';
  }

  /* ---------- 编辑一个格子 ---------- */
  function editSlot(k) {
    var name = k;
    for (var i = 0; i < SLOTS.length; i++) if (SLOTS[i][0] === k) name = SLOTS[i][1];
    function open() {
      var v = getSlot(k);
      sheet(name, '地址和模型留空用默认，Key 留空就沿用对话模型那个', [
        { name: '接口地址', sub: v.url || '默认 https://api.deepseek.com', on: function () {
          var x = prompt('接口地址（留空用默认）', v.url);
          if (x === null) return;
          v.url = x.trim(); setSlot(k, v); closeAll(); open();
        } },
        { name: '模型名', sub: v.model || '还没填', on: function () {
          var x = prompt('模型名（如 deepseek-flash / deepseek-v4-pro）', v.model);
          if (x === null) return;
          v.model = x.trim(); setSlot(k, v); closeAll(); open();
        } },
        { name: 'API Key', sub: maskOf(k), on: function () {
          var x = prompt('API Key（留空就沿用对话模型那个）', v.key);
          if (x === null) return;
          v.key = x.trim(); setSlot(k, v); closeAll(); open();
        } }
      ]);
    }
    open();
  }

  function ai() {
    var rows = SLOTS.map(function (s) {
      var v = getSlot(s[0]);
      var m = v.model || (s[0] === 'chat' ? '还没填' : '没填 · 用不到就不填');
      return { name: s[1], sub: m + ' · ' + s[2], on: function () { editSlot(s[0]); } };
    });
    sheet('AI 模型配置', '五个格子，各管一件事', rows);
  }

  /* ---------- 语音配置（TTS） ---------- */
  function ttsConf() {
    return Store.get('ttsConf', { url: '', model: '', voice: '', key: '' });
  }
  function tryTTS() {
    var t = ttsConf();
    var c = Store.get('apiConf', {}) || {};
    var key = String(t.key || c.key || '').trim();
    var base = String(t.url || c.url || 'https://api.deepseek.com').replace(/\/+$/, '');
    if (!key) { alert('先填个 Key'); return; }
    if (!t.model) { alert('先填模型名（比如 tts-1）'); return; }
    fetch(base + '/audio/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
      body: JSON.stringify({
        model: t.model,
        input: '哥哥在呢，小锚。',
        voice: t.voice || 'alloy',
        response_format: 'mp3'
      })
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (x) { throw new Error('HTTP ' + r.status + ' ' + String(x).slice(0, 120)); });
      return r.blob();
    }).then(function (b) {
      new Audio(URL.createObjectURL(b)).play();
    })['catch'](function (e) { alert('试听失败：' + (e && e.message)); });
  }
  function tts() {
    function open() {
      var t = ttsConf();
      var c = Store.get('apiConf', {}) || {};
      function save() { Store.set('ttsConf', t); }
      var ask = function (k, tip, ph) {
        var x = prompt(tip, t[k] || '');
        if (x === null) return;
        t[k] = x.trim(); save(); closeAll(); open();
      };
      sheet('语音配置', '我发语音给你的时候，用这个声音说话', [
        { name: '接口地址', sub: t.url || ('跟对话模型走同一个（' + (c.url || 'api.deepseek.com') + '）'),
          on: function () { ask('url', '语音接口地址（留空就跟对话模型同一个）'); } },
        { name: '模型名', sub: t.model || '还没填',
          on: function () { ask('model', '语音模型名（比如 tts-1 / cosyvoice）'); } },
        { name: '声音码', sub: t.voice || '还没填（比如 alloy / zhixiaobai）',
          on: function () { ask('voice', '声音码 / 音色 ID（厂商文档里那串）'); } },
        { name: 'API Key', sub: t.key ? (t.key.slice(0, 5) + '****') : '沿用对话的 Key',
          on: function () { ask('key', '语音用的 Key（留空就沿用对话模型那个）'); } }
      ], { name: '试听一句', on: tryTTS });
    }
    open();
  }

  window.HearthModels = { ai: ai, tts: tts, slot: getSlot, set: setSlot };

  function init() {
    if (location.hash.indexOf('@models') > 0) setTimeout(ai, 400);
    if (location.hash.indexOf('@tts') > 0) setTimeout(tts, 400);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();