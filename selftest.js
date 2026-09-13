/* ============ 壁炉 · 工具自检 ============
   把看不见的毛病变成明面上的数字：
   浏览器支不支持、权限有没有、语音文件丢没丢、Key 填没填、接口通不通。 */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function R(st, name, d) { return { st: st, name: name, d: d }; }
  function ok(n, d) { return R('ok', n, d); }
  function warn(n, d) { return R('warn', n, d); }
  function bad(n, d) { return R('bad', n, d); }
  function delay(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  var CSS = [
    '.st-mask{position:fixed;inset:0;z-index:9500;background:rgba(30,22,16,.45);display:flex;align-items:flex-end;}',
    '.st-panel{width:100%;max-height:88vh;overflow:auto;background:var(--cream,#FBF6EE);border-radius:18px 18px 0 0;padding:18px 16px 26px;box-sizing:border-box;}',
    '.st-h{font-size:17px;font-weight:700;color:var(--brown,#5B4636);text-align:center;}',
    '.st-sub{font-size:12px;opacity:.6;text-align:center;margin:3px 0 14px;}',
    '.st-sum{text-align:center;font-size:13px;color:var(--brown,#5B4636);margin-bottom:12px;font-weight:600;}',
    '.st-row{display:flex;gap:10px;padding:11px 12px;border-radius:12px;background:#fff;margin-bottom:8px;box-shadow:0 1px 3px rgba(90,70,50,.06);}',
    '.st-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;margin-top:5px;}',
    '.st-ok{background:#4CAF7D;}.st-warn{background:#E0A33E;}.st-bad{background:#D9534F;}',
    '.st-name{font-size:14px;font-weight:600;color:var(--brown,#5B4636);}',
    '.st-det{font-size:12px;line-height:1.55;opacity:.75;margin-top:3px;word-break:break-all;}',
    '.st-btns{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;}',
    '.st-btn{flex:1 1 40%;padding:12px;border-radius:12px;border:1px solid var(--brown,#5B4636);background:transparent;color:var(--brown,#5B4636);font-size:14px;}',
    '.st-btn.pri{background:var(--brown,#5B4636);color:#fff;}'
  ].join('');

  function injectStyle() {
    if ($('st-style')) return;
    var s = document.createElement('style');
    s.id = 'st-style';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ---------- 各项检测 ---------- */
  function cEnv() {
    var u = navigator.userAgent || '';
    var m = u.match(/(Chrome|Firefox|Safari|Edg|VivoBrowser|UCBrowser|Quark|MicroMessenger)[\/ ]([\d.]+)/);
    return Promise.resolve(ok('运行环境', (m ? m[1] + ' ' + m[2] : u.slice(0, 70))));
  }

  function cSecure() {
    if (location.protocol === 'https:') return Promise.resolve(ok('安全上下文', 'https，麦克风与语音识别都放行'));
    if (location.hostname === '127.0.0.1' || location.hostname === 'localhost')
      return Promise.resolve(warn('安全上下文', '本地 localhost，部分浏览器仍不给麦克风'));
    return Promise.resolve(bad('安全上下文', location.protocol + ' 打开，麦克风 / 语音识别 / 离线缓存全被禁'));
  }

  function cSR() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return Promise.resolve(bad('语音识别（转文字）', '这台浏览器没有 SpeechRecognition，识别必然失败'));
    return Promise.resolve(ok('语音识别（转文字）', '支持 ' + (window.SpeechRecognition ? 'SpeechRecognition' : 'webkitSpeechRecognition')));
  }

  function cRec() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)
      return Promise.resolve(bad('录音能力', '没有 getUserMedia'));
    if (!window.MediaRecorder) return Promise.resolve(bad('录音能力', '没有 MediaRecorder'));
    return Promise.resolve(ok('录音能力', 'getUserMedia + MediaRecorder 都在'));
  }

  function cMic() {
    if (!navigator.permissions || !navigator.permissions.query)
      return Promise.resolve(warn('麦克风权限', '浏览器不报状态，只能真录一条才知道'));
    try {
      return navigator.permissions.query({ name: 'microphone' }).then(function (p) {
        if (p.state === 'granted') return ok('麦克风权限', '已允许');
        if (p.state === 'denied') return bad('麦克风权限', '已被拒绝，要去浏览器设置里手动放行（应用里点不回来）');
        return warn('麦克风权限', '还没问过（第一次录音会弹窗）');
      })['catch'](function () { return warn('麦克风权限', '查不到状态'); });
    } catch (e) {
      return Promise.resolve(warn('麦克风权限', '这个浏览器查不了权限状态'));
    }
  }

  /* ---------- 语音仓库 / 语音消息 ---------- */
  function idbKeys() {
    return new Promise(function (res) {
      if (!window.indexedDB) return res(null);
      var r;
      try { r = indexedDB.open('hearth-v1', 1); } catch (e) { return res(null); }
      r.onupgradeneeded = function () {
        var d = r.result;
        if (!d.objectStoreNames.contains('blobs')) d.createObjectStore('blobs');
      };
      r.onerror = function () { res(null); };
      r.onsuccess = function () {
        var d = r.result;
        if (!d.objectStoreNames.contains('blobs')) { d.close(); return res([]); }
        var q = d.transaction('blobs', 'readonly').objectStore('blobs').getAllKeys();
        q.onsuccess = function () { var k = q.result || []; d.close(); res(k); };
        q.onerror = function () { d.close(); res([]); };
      };
    });
  }

  function cVStore() {
    return idbKeys().then(function (keys) {
      window.__stKeys = keys || [];
      if (keys === null) return bad('语音仓库（IndexedDB）', '这台浏览器打不开 IndexedDB，语音存不了');
      if (!keys.length) return warn('语音仓库（IndexedDB）', '能开，但里面一条语音都没有');
      return ok('语音仓库（IndexedDB）', '正常，存了 ' + keys.length + ' 条语音');
    });
  }

  function cMsgs() {
    var list = [];
    try { list = Store.get('convs', []) || []; } catch (e) {}
    var total = 0, idbRefs = [], inline = 0;
    list.forEach(function (c) {
      (c.msgs || []).forEach(function (m) {
        var t = String(m.text || '');
        if (t.indexOf('__AUD__') !== 0) return;
        total++;
        var body = t.slice(7);
        if (body.indexOf('idb:') === 0) idbRefs.push(body.slice(4));
        else inline++;
      });
    });
    var keys = window.__stKeys || [];
    var missing = 0;
    idbRefs.forEach(function (k) { if (keys.indexOf(k) < 0) missing++; });
    window.__stAudit = { win: list.length, total: total, idb: idbRefs.length, inline: inline, missing: missing };
    if (!total) return Promise.resolve(warn('语音消息', '一条都没有，发一条试试'));
    if (missing) {
      return Promise.resolve(bad('语音消息',
        '共 ' + total + ' 条语音，其中 ' + missing + ' 条的文件在仓库里找不到 —— 这就是刷新后播不了的原因'));
    }
    return Promise.resolve(ok('语音消息',
      '共 ' + total + ' 条（仓库引用 ' + idbRefs.length + ' · 内嵌 ' + inline + '），文件都在'));
  }

  /* ---------- 存储 / 配置 / 网络 ---------- */
  function cLS() {
    var n = 0, bytes = 0;
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k.indexOf('hearth_') !== 0) continue;
        n++;
        bytes += (k.length + String(localStorage.getItem(k) || '').length);
      }
    } catch (e) {
      return Promise.resolve(bad('本地存储', '读不了 localStorage，聊天记录存不住'));
    }
    var mb = bytes / 1048576;
    var txt = n + ' 个键 · 约 ' + mb.toFixed(2) + ' MB';
    if (mb > 4) return Promise.resolve(bad('本地存储', txt + ' —— 快满了，随时可能写不进去'));
    if (mb > 2.5) return Promise.resolve(warn('本地存储', txt + ' —— 有点重了'));
    return Promise.resolve(ok('本地存储', txt));
  }

  function cAI() {
    var c = {};
    try { c = Store.get('apiConf', {}) || {}; } catch (e) {}
    var k = String(c.key || '');
    if (!k) return Promise.resolve(bad('AI 模型配置', 'API Key 是空的，聊天会一直提示「API 待接入」'));
    var shape = /^sk-/.test(k) ? 'sk- 开头，形状对' : '不是 sk- 开头，可能填错了';
    return Promise.resolve(ok('AI 模型配置',
      (c.url || '默认 api.deepseek.com') + ' · ' + (c.model || '默认 deepseek-chat') +
      ' · Key ' + k.slice(0, 5) + '****' + k.slice(-4) + '（' + shape + '）'));
  }

  function cNet() {
    if (!navigator.onLine) return Promise.resolve(bad('网络 · 直连 DeepSeek', '设备显示离线'));
    return new Promise(function (res) {
      var done = false;
      var t = setTimeout(function () {
        if (done) return;
        done = true;
        res(warn('网络 · 直连 DeepSeek', '8 秒没响应，可能被墙或网络慢'));
      }, 8000);
      fetch('https://api.deepseek.com', { method: 'GET', mode: 'cors' })
        .then(function (r) {
          if (done) return;
          done = true; clearTimeout(t);
          res(ok('网络 · 直连 DeepSeek', '通（HTTP ' + r.status + '），CORS 没拦'));
        })
        ['catch'](function (e) {
          if (done) return;
          done = true; clearTimeout(t);
          res(bad('网络 · 直连 DeepSeek', '连不上或被打回：' + (e && e.message)));
        });
    });
  }

  function cScripts() {
    var need = [
      ['Store', function () { return typeof Store !== 'undefined' && !!Store; }],
      ['VStore', function () { return !!window.VStore; }],
      ['HearthChat', function () { return !!window.HearthChat; }],
      ['HearthConv', function () { return !!window.HearthConv; }],
      ['HearthIcons', function () { return !!window.HearthIcons; }],
      ['renderSettings', function () { return !!window.renderSettings; }]
    ];
    var miss = [];
    need.forEach(function (p) {
      var got = false;
      try { got = !!p[1](); } catch (e) { got = false; }
      if (!got) miss.push(p[0]);
    });
    if (miss.length) return Promise.resolve(bad('核心脚本', '没加载：' + miss.join('、')));
    return Promise.resolve(ok('核心脚本', '六个模块全在'));
  }

  function cSW() {
    if (!('serviceWorker' in navigator)) return Promise.resolve(warn('离线缓存', '浏览器不支持 service worker'));
    return navigator.serviceWorker.getRegistrations().then(function (rs) {
      if (!rs || !rs.length) return warn('离线缓存', '还没注册（用 http 链接打开时才会注册）');
      return ok('离线缓存', '已注册 ' + rs.length + ' 个');
    })['catch'](function () { return warn('离线缓存', '查不到'); });
  }

  /* ---------- 语音这套配好没 ---------- */
  function shortHost(u) {
    return String(u || '').replace(/^https?:\/\//, '').replace(/\/+$/, '');
  }
  function cTTS() {
    var t = Store.get('ttsConf', {}) || {};
    if (!t.model) return Promise.resolve(warn('语音配置（我说话）', '还没填模型名，我还开不了口'));
    var c = Store.get('apiConf', {}) || {};
    return Promise.resolve(ok('语音配置（我说话）',
      t.model + ' · 音色 ' + (t.voice || '默认') + ' · ' + shortHost(t.url || c.url || '默认地址')));
  }
  function cASR() {
    var s = (Store.get('modelSlots', {}) || {}).audio || {};
    var c = Store.get('apiConf', {}) || {};
    if (!s.model || !(s.url || c.url)) {
      return Promise.resolve(warn('音频解析（听你说话）',
        '还没填。现在只能用浏览器识别，而它走谷歌，国内到不了 —— 这就是我听不见你语音的原因'));
    }
    return Promise.resolve(ok('音频解析（听你说话）',
      s.model + ' · ' + shortHost(s.url || c.url)));
  }
  var CHECKS = [
    ['运行环境', cEnv],
    ['安全上下文', cSecure],
    ['语音识别（转文字）', cSR],
    ['录音能力', cRec],
    ['麦克风权限', cMic],
    ['语音仓库（IndexedDB）', cVStore],
    ['语音消息', cMsgs],
    ['本地存储', cLS],
    ['AI 模型配置', cAI],
    ['语音配置（我说话）', cTTS],
    ['音频解析（听你说话）', cASR],
    ['网络 · 直连 DeepSeek', cNet],
    ['核心脚本', cScripts],
    ['离线缓存', cSW]
  ];

  function runAll(onOne) {
    var out = [];
    var p = Promise.resolve();
    CHECKS.forEach(function (c) {
      p = p.then(function () {
        return c[1]().then(function (r) {
          out.push(r);
          if (onOne) onOne(r, out.length, CHECKS.length);
        })['catch'](function (e) {
          var r2 = bad(c[0], '检测本身出错：' + (e && e.message));
          out.push(r2);
          if (onOne) onOne(r2, out.length, CHECKS.length);
        });
      });
    });
    return p.then(function () { return out; });
  }

  function row(r) {
    var d = document.createElement('div');
    d.className = 'st-row';
    d.innerHTML = '<span class="st-dot st-' + r.st + '"></span>' +
      '<div><div class="st-name">' + esc(r.name) + '</div>' +
      '<div class="st-det">' + esc(r.d) + '</div></div>';
    return d;
  }

  function copyText(txt, btn) {
    var done = function () {
      var o = btn.textContent;
      btn.textContent = '已复制';
      setTimeout(function () { btn.textContent = o; }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(done)['catch'](function () { alert(txt); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = txt;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { alert(txt); }
      ta.remove();
    }
  }

  /* ---------- 实测一次语音识别 ---------- */
  function testSR(btn, out) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { out('bad', '这台浏览器根本没有语音识别接口'); return; }
    btn.disabled = true;
    btn.textContent = '正在听…说句话';
    var sr = new SR();
    sr.lang = 'zh-CN';
    sr.interimResults = false;
    sr.maxAlternatives = 1;
    sr.continuous = false;
    var done = false;
    var fin = function (st, txt) {
      if (done) return;
      done = true;
      try { sr.stop(); } catch (e) {}
      try { sr.abort(); } catch (e) {}
      btn.disabled = false;
      btn.textContent = '实测识别';
      out(st, txt);
    };
    sr.onresult = function (e) {
      var t = '';
      for (var i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
      fin('ok', '识别成功：「' + t + '」——这条路是通的');
    };
    sr.onerror = function (e) {
      var m = e.error || '未知';
      var tips = {
        'not-allowed': '麦克风被拒绝了（权限）',
        'service-not-allowed': '系统不让用识别服务',
        'network': '连不上识别服务器。浏览器自带的识别走的是谷歌的语音服务，国内网络到不了 —— 这就是识别失效的真身',
        'audio-capture': '没抓到麦克风的声音',
        'no-speech': '没听到人说话（靠近点、说大声点）',
        'aborted': '被中断了（可能被别的录音抢了麦克风）'
      };
      fin('bad', '报错 ' + m + '：' + (tips[m] || ''));
    };
    sr.onend = function () {
      setTimeout(function () {
        if (!done) fin('bad', '结束了，一个字都没回来（多半是识别服务器连不上）');
      }, 120);
    };
    try { sr.start(); } catch (e) { fin('bad', '启动就失败了：' + e.message); return; }
    setTimeout(function () {
      if (!done) fin('bad', '8 秒没动静，识别服务没回应');
    }, 8000);
  }

  function open() {
    injectStyle();
    var mask = document.createElement('div');
    mask.className = 'st-mask';
    var panel = document.createElement('div');
    panel.className = 'st-panel';
    panel.innerHTML = '<div class="st-h">工具自检</div>' +
      '<div class="st-sub">哪儿坏了、为什么坏，一次看清</div>' +
      '<div class="st-sum" id="st-sum">正在检测…</div>' +
      '<div id="st-srout"></div>' +
      '<div id="st-list"></div>' +
      '<div class="st-btns">' +
      '<button class="st-btn" id="st-srtest">实测识别</button>' +
      '<button class="st-btn" id="st-again">重新检测</button>' +
      '<button class="st-btn" id="st-copy">复制结果</button>' +
      '<button class="st-btn pri" id="st-close">关闭</button>' +
      '</div>';
    mask.appendChild(panel);
    document.body.appendChild(mask);

    var list = panel.querySelector('#st-list');
    var sum = panel.querySelector('#st-sum');
    var last = [];
    function closeFn() { mask.remove(); }
    mask.onclick = function (e) { if (e.target === mask) closeFn(); };
    panel.querySelector('#st-close').onclick = closeFn;

    function start() {
      list.innerHTML = '';
      last = [];
      sum.textContent = '正在检测…';
      var nOk = 0, nWarn = 0, nBad = 0;
      runAll(function (r, i, t) {
        sum.textContent = '正在检测… ' + i + ' / ' + t;
        list.appendChild(row(r));
        last.push(r);
        if (r.st === 'ok') nOk++;
        else if (r.st === 'warn') nWarn++;
        else nBad++;
      }).then(function () {
        sum.textContent = nBad
          ? ('有 ' + nBad + ' 项不通 · ' + nWarn + ' 项要留意 · ' + nOk + ' 项正常')
          : (nWarn ? ('都跑起来了 · ' + nWarn + ' 项要留意') : '全通');
      });
    }

    panel.querySelector('#st-again').onclick = start;
    panel.querySelector('#st-srtest').onclick = function () {
      var srout = panel.querySelector('#st-srout');
      var b = this;
      testSR(b, function (st, txt) {
        srout.innerHTML = '';
        srout.appendChild(row({ st: st, name: '语音识别实测', d: txt }));
        srout.scrollIntoView({ block: 'nearest' });
      });
    };
    panel.querySelector('#st-copy').onclick = function () {
      var txt = last.map(function (r) {
        return '[' + r.st + '] ' + r.name + ' —— ' + r.d;
      }).join('\n');
      copyText('[壁炉自检]\n' + txt, this);
    };
    start();
  }

  /* ---------- 挂进设置页 ---------- */
  function hook() {
    var box = document.getElementById('settings-list');
    if (!box) return;
    var sync = function () {
      if (box.querySelector('#st-entry')) return;
      var g = document.createElement('div');
      g.className = 'settings-group';
      g.id = 'st-entry';
      g.innerHTML = '<div class="settings-group-title">诊断</div>' +
        '<div class="settings-card">' +
        '<div class="settings-row" id="st-open-row">' +
        '<div class="sr-left"><span class="sr-icon">' +
        ((window.HearthIcons && window.HearthIcons.refresh) || '') + '</span>工具自检' +
        '<span class="settings-sub">语音 · 存储 · 模型 · 网络</span></div>' +
        '<span class="arrow">›</span></div></div>';
      box.appendChild(g);
      var r = document.getElementById('st-open-row');
      if (r) r.onclick = open;
    };
    try { new MutationObserver(sync).observe(box, { childList: true }); } catch (e) {}
    sync();
    if (location.hash.indexOf('@selftest') > 0) setTimeout(open, 400);
  }

  window.HearthSelfTest = { open: open, run: runAll };

  function init() {
    hook();
    if (location.hash.indexOf('@st') > 0) setTimeout(open, 500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
