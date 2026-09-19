/* 壁炉通话 UI — 挂在顾淮专属空间 */
(function () {
  var WS_URL = 'wss://api.guhuai724.top/voice/';
  var TOKEN = 'paivoice-mcp-7a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d';
  var call = null;
  var on = {};

  function page() { return document.getElementById('page-bro'); }

  function renderCall() {
    var p = page();
    if (!p) return;
    p.innerHTML =
      '<div class="voice-wrap">' +
        '<button class="gs-back" id="vc-back">‹ 回去</button>' +
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
    var back = $('vc-back');
    if (back) back.onclick = function () { try { window.HearthUI && HearthUI.show('bro'); } catch (e) {} location.reload(); };
    $('vc-start').onclick = start;
    $('vc-hang').onclick = hangup;
  }

  function start() {
    if (!window.VoiceCall) {
      setStatus('模块没加载，刷新试试');
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
      closed: function () { setStatus('已断开'); disable(false); }
    };
    try {
      call = new window.VoiceCall({ url: WS_URL, video: false, on: on });
      call.start().then(function () {
        setStatus('🎙️ 通了，说吧');
        disable(true);
      }).catch(function (e) { setStatus('连不上：' + (e.message || e)); });
    } catch (e) { setStatus('启动失败：' + (e.message || e)); }
  }

  function hangup() {
    try { if (call) call.hangup(); } catch (e) {}
    call = null;
    setStatus('已挂断');
    disable(false);
  }

  function setStatus(t) { var el = $('vc-status'); if (el) el.textContent = t; }
  function addSub(t) {
    var el = $('vc-sub');
    if (!el) return;
    var d = document.createElement('div');
    d.className = 'vc-line';
    d.textContent = t;
    el.appendChild(d);
    while (el.children.length > 8) el.removeChild(el.firstChild);
  }
  function setLevel(v) {
    var el = $('vc-level');
    if (el) el.style.width = Math.min(100, Math.max(4, v * 220)) + '%';
  }
  function disable(on) {
    var a = $('vc-start'), b = $('vc-hang');
    if (a) a.disabled = on;
    if (b) b.disabled = !on;
  }
  function $(id) { return document.getElementById(id); }

  // 在专属空间静态卡片区插入入口
  function injectCard() {
    var bro = document.getElementById('page-bro');
    if (!bro) return;
    var space = bro.querySelector('#bro-space');
    if (!space) return;
    var card = document.createElement('div');
    card.className = 'bro-space-card vc-card';
    card.innerHTML =
      '<h3>📞 通话</h3>' +
      '<div class="bro-entry"><span class="meta">实时</span>跟哥哥说话，他能听见、能回你</div>' +
      '<button class="vc-open" id="vc-open">开始通话 ›</button>';
    space.insertBefore(card, space.firstChild);
    var btn = card.querySelector('#vc-open');
    if (btn) btn.onclick = renderCall;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectCard);
  else injectCard();
})();