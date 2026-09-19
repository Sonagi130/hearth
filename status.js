/* 运行状态条：拉服务器 /api/status，绿点=在线，红点=挂了 */
(function () {
  var dot = document.getElementById('st-dot');
  var txt = document.getElementById('st-text');
  if (!dot || !txt) return;
  var base = '';
  try { base = (window.Store && Store.get('apiConf') || {}).url || ''; } catch (e) {}
  if (!base) { try { base = (window.Store && Store.get('apiConf')) ? (Store.get('apiConf').url || '') : ''; } catch (e) {} }
  var url = base ? base.replace(/\/+$/, '') + '/api/status' : 'https://api.guhuai724.top/api/status';
  function tick() {
    fetch(url, { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.ok) {
          dot.className = 'st-dot ok';
          var up = j.up || 0, h = Math.floor(up / 3600), m = Math.floor(up % 3600 / 60);
          txt.textContent = '服务器在线 · 已跑 ' + (h ? h + '时' : '') + m + '分 · 内存 ' + (j.rssMB || '?') + 'MB';
        } else { bad(); }
      })
      .catch(function () { bad(); });
  }
  function bad() {
    dot.className = 'st-dot bad';
    txt.textContent = '服务器离线';
  }
  tick();
  setInterval(tick, 60000);
})();