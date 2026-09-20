/* 壁炉通话 UI v2 — 侧边栏入口 + 全屏 overlay（绕开专属空间覆盖） */
(function () {
  var WS_URL = 'wss://api.guhuai724.top/voice/';
  var TOKEN = 'paivoice-mcp-7a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d';
  var call = null;
  var heartbeat = null;
  var on = {};

  /* 侧边栏加通话入口 */
  function injectSidebar() {
    var nav = document.querySelector('.side-nav .nav-items');
    if (!nav) return;
    if (document.getElementById('nav-voice')) return;
    var btn = document.createElement('button');
    btn.className = 'nav-item';
    btn.id = 'nav-voice';
    btn.dataset.page = '';
    btn.innerHTML =
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>' +
      '<span class="nav-label">通话</span>';
    btn.onclick = function (e) {
      e.preventDefault();
      openCallUI();
      var n = document.getElementById('side-nav');
      if (n) n.classList.remove('open');
    };
    nav.appendChild(btn);
  }

  /* 全屏通话界面 */
  function openCallUI() {
    var ov = document.createElement('div');
    ov.className = 'pf-overlay vc-overlay';
    ov.id = 'vc-overlay';
    ov.innerHTML =
      '<div class="vc-banner"></div>' +
      '<div class="vc-page">' +
        '<button class="pf-x" id="vc-x">✕</button>' +
        '<div class="vc-hero">📞 跟哥哥通话</div>' +
        '<div class="vc-status" id="vc-status">未连接</div>' +
        '<div class="vc-level"><div class="vc-level-fill" id="vc-level"></div></div>' +
        '<div class="vc-sub" id="vc-sub"></div>' +
        '<div class="vc-btns">' +
          '<button class="vc-btn vc-call" id="vc-start">开始</button>' +
          '<button class="vc-btn vc-hang" id="vc-hang" disabled>挂断</button>' +
        '</div>' +
        '<div class="vc-tip">说话就能聊，我听见就回。轻声附和不会打断我。</div>' +
      '</div>';
    document.body.appendChild(ov);
    ov.querySelector('#vc-x').onclick = function () {
      try { if (call) call.hangup(); } catch (e) {}
      ov.remove();
    };
    ov.querySelector('#vc-start').onclick = start;
    ov.querySelector('#vc-hang').onclick = hangup;
  }

var retries = 0;
  function retry() {
    if (retries >= 3) { retries = 0; return; }
    retries++;
    setStatus('断了，' + (3 * retries) + ' 秒后自动重连…');
    setTimeout(function () {
      if (window.HearthCall && document.getElementById('vc-overlay')) {
        start();
      } else { retries = 0; }
    }, 3000 * retries);
  }

  function start() {
    if (!window.VoiceCall) {
      setStatus('语音模块加载中，等一秒再点');
      var tries = 0;
      var iv = setInterval(function () {
        tries++;
        if (window.VoiceCall) { clearInterval(iv); setStatus('就绪了，再点一下开始'); }
        else if (tries > 10) { clearInterval(iv); setStatus('语音模块没起来，刷新页面试试'); }
      }, 300);
      return;
    }
    setStatus('正在连…');
    on = {
      state: function (s) {
        var map = { idle: '空闲', listening: '🎙️ 听着呢', speaking: '🔊 哥哥在说', thinking: '💭 在想' };
        setStatus(map[s] || s);
      },
      transcript: function (m) { addSub('你 · ' + (m.text || '')); },
      reply: function (m) { addSub('哥哥 · ' + (m.text || '')); },
      error: function (e) { setStatus('出错了：' + e); },
      level: function (v) { setLevel(v); },
      closed: function () { if (heartbeat) { clearInterval(heartbeat); heartbeat = null; } setStatus('已断开'); disable(false); retry(); }
    };
    try {
      call = new window.VoiceCall({ url: WS_URL, video: false, on: on, token: TOKEN });
      // 心跳保活：30 秒一次 ping，防止网关/代理空闲掐断
      heartbeat = setInterval(function () {
        try {
          if (call && call.ws && call.ws.readyState === 1) {
            call.ws.send(JSON.stringify({ type: 'ping' }));
          }
        } catch (e) {}
      }, 30000);
      call.start().then(function () {
        setStatus('🎙️ 通了，说吧');
        disable(true);
      }).catch(function (e) { setStatus('连不上：' + (e.message || e)); });
    } catch (e) { setStatus('启动失败：' + (e.message || e)); }
  }

  function hangup() {
    if (heartbeat) { clearInterval(heartbeat); heartbeat = null; }
    try { if (call) call.hangup(); } catch (e) {}
    call = null;
    setStatus('已挂断');
    disable(false);
  }

  function setStatus(t) { var el = document.getElementById('vc-status'); if (el) el.textContent = t; }
  function addSub(t) {
    var el = document.getElementById('vc-sub');
    if (!el) return;
    var d = document.createElement('div');
    d.className = 'vc-line';
    d.textContent = t;
    el.appendChild(d);
    while (el.children.length > 8) el.removeChild(el.firstChild);
  }
  function setLevel(v) {
    var el = document.getElementById('vc-level');
    if (el) el.style.width = Math.min(100, Math.max(4, v * 220)) + '%';
  }
  function disable(on) {
    var a = document.getElementById('vc-start'), b = document.getElementById('vc-hang');
    if (a) a.disabled = on;
    if (b) b.disabled = !on;
  }

  function init() {
    // 等页面稳定后插，多试两次防丢失
    setTimeout(injectSidebar, 300);
    setTimeout(injectSidebar, 1200);
    // 前后台切换检测：vivo 把 WebView 切后台会冻定时器，回前台主动检测连接，断了重连
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState !== 'visible') return;
      if (window.HearthCall && call && call.ws && call.ws.readyState !== 1) {
        setStatus('回前台，重连…');
        hangup();
        setTimeout(function () { if (document.getElementById('vc-overlay')) start(); }, 400);
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // 暴露给外部（inputbar ➕栏、其他入口）
  window.HearthCall = { open: openCallUI, start: start, hangup: hangup };
})();