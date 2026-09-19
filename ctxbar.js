/* 上下文进度条 — 顾淮名字下方 */
(function () {
  var STYLE = [
    '#ctx-bar { position: absolute; left: 64px; right: 12px; bottom: 4px; height: 3px; border-radius: 2px; background: rgba(128,128,128,.15); display: none; overflow: hidden; }',
    '#ctx-bar .ctx-fill { height: 100%; width: 0; border-radius: 2px; background: #9ad0ec; transition: width .5s ease, background .5s ease; }',
    '#ctx-bar .ctx-fill.warn { background: #3a7bd5; }',
    '#ctx-bar .ctx-fill.hot { background: #ff8c42; }',
    'body.skin-star #ctx-bar .ctx-fill { background: #7ec8ff; }',
    'body.skin-star #ctx-bar .ctx-fill.warn { background: #4a9eff; }',
    'body.skin-star #ctx-bar .ctx-fill.hot { background: #ffb35c; }',
    'body.skin-ink #ctx-bar .ctx-fill { background: #666; }',
    'body.skin-ink #ctx-bar .ctx-fill.warn { background: #333; }',
    'body.skin-ink #ctx-bar .ctx-fill.hot { background: #111; }'
  ].join('\n');

  function ensure() {
    var bar = document.getElementById('ctx-bar');
    if (bar) return bar;
    var s = document.createElement('style');
    s.id = 'ctx-style';
    s.textContent = STYLE;
    document.head.appendChild(s);
    var tb = document.querySelector('.top-bar');
    if (!tb) return null;
    bar = document.createElement('div');
    bar.id = 'ctx-bar';
    bar.innerHTML = '<div class="ctx-fill"></div>';
    tb.appendChild(bar);
    return bar;
  }

  function refresh() {
    var bar = document.getElementById('ctx-bar');
    if (!bar) bar = ensure();
    if (!bar) return;
    // 只在对话页显示
    var chatPage = document.getElementById('page-chat');
    var active = chatPage && chatPage.classList.contains('active');
    if (!active) { bar.style.display = 'none'; return; }
    bar.style.display = 'block';
    var st = (window.HearthCtx && window.HearthCtx.stat()) || { used: 0, n: 0, cap: 20 };
    var fill = bar.querySelector('.ctx-fill');
    if (!fill) return;
    fill.style.width = Math.max(2, st.used) + '%';
    fill.className = 'ctx-fill' + (st.used >= 65 ? ' hot' : (st.used >= 40 ? ' warn' : ''));
    bar.title = '上下文 ' + st.n + ' / ' + st.cap + ' 条 · ' + st.used + '%';
  }

  function init() {
    ensure();
    refresh();
    setInterval(refresh, 3000);
    // 切换页面时也刷
    document.addEventListener('click', function () { setTimeout(refresh, 80); }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();