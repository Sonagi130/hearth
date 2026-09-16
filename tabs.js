/* ============ 壁炉 · 底部导航 + 今天页 ============ */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var TITLES = {
    today: '今天', chat: '对话', diary: '日记', calendar: '日历', shelf: '书架',
    photos: '相片墙', notes: '碎碎念', memory: '记忆库', play: '游戏厅',
    bro: '哥哥', tools: '工具包', settings: '设置'
  };

  function go(page) {
    if (!page) return;
    var el = $('page-' + page);
    if (!el) return;
    document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
    el.classList.add('active');
    var t = $('top-title');
    if (t) t.textContent = TITLES[page] || '';
    document.querySelectorAll('.side-nav .nav-item').forEach(function (b) {
      b.classList.toggle('active', b.dataset.page === page);
    });
    document.querySelectorAll('.tab-bar .tab-item').forEach(function (b) {
      b.classList.toggle('active', b.dataset.page === page);
    });
    var nb = $('note-add');
    if (nb) nb.style.display = (page === 'diary') ? 'flex' : 'none';
    try {
      if (page === 'today') renderToday();
      if (page === 'calendar' && window.renderCalendar) window.renderCalendar();
      if (page === 'diary' && window.renderDiary) window.renderDiary();
      if (page === 'photos' && window.renderPhotos) window.renderPhotos();
      if (page === 'notes' && window.renderNotes) window.renderNotes();
      if (page === 'memory' && window.renderMemory) window.renderMemory();
      if (page === 'play' && window.HearthPlay) window.HearthPlay.boot();
      if (page === 'tools' && window.renderTools) window.renderTools();
      if (page === 'settings' && window.renderSettings) window.renderSettings();
    } catch (e) {}
  }
  window.HearthGo = go;

  /* 侧边栏每一项都走同一套 */
  function bindNav() {
    document.querySelectorAll('.side-nav .nav-item').forEach(function (b) {
      b.onclick = function () {
        go(b.dataset.page);
        if (window.closeNav) closeNav();
        else {
          var n = $('side-nav'); if (n) n.classList.remove('open');
          var o = $('nav-overlay'); if (o) o.classList.remove('show');
        }
      };
    });
    document.querySelectorAll('.tab-bar .tab-item[data-page]').forEach(function (b) {
      b.onclick = function () { go(b.dataset.page); };
    });
    var more = $('tab-more');
    if (more) more.onclick = function () {
      var n = $('side-nav'), o = $('nav-overlay');
      if (n) n.classList.add('open');
      if (o) o.classList.add('show');
    };
  }

  window.addEventListener('load', function () {
    bindNav();
    go('today');
  });
  if (document.readyState === 'complete') { bindNav(); go('today'); }

  /* ---------- 今天页 ---------- */
  function pad2(n) { return String(n).padStart(2, '0'); }
  function daysTogether() {
    var now = new Date();
    var a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var b = new Date(2026, 6, 24);
    return Math.round((a - b) / 86400000) + 1;
  }
  function renderToday() {
    var box = $('today-wrap');
    if (!box) return;
    var d = new Date();
    var WK = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    var todayKey = d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
    var todos = (Store.get('todos', []) || []).filter(function (t) { return t && t.date === todayKey; });
    var left = todos.filter(function (t) { return !t.done; });
    var p = (window.HearthPeriod && window.HearthPeriod.status) ? window.HearthPeriod.status() : null;
    var h = '';
    h += '<div class="td-hello"><div class="td-date">' + (d.getMonth() + 1) + '月' + d.getDate() + '日</div>' +
      '<div class="td-wk">' + WK[d.getDay()] + '</div></div>';
    h += '<div class="td-days"><span class="td-num">' + daysTogether() + '</span><span class="td-unit">天</span>' +
      '<div class="td-sub">从 7 月 24 日算起，第 ' + daysTogether() + ' 天</div></div>';
    h += '<div class="td-card"><div class="td-card-t">今天的事</div>';
    if (!todos.length) h += '<div class="td-empty">今天还没安排。有要做的，去日历里加一条。</div>';
    else {
      todos.forEach(function (t) {
        h += '<div class="td-todo' + (t.done ? ' done' : '') + '"><i></i><span>' + String(t.text || '').replace(/</g, '&lt;') + '</span></div>';
      });
      if (left.length) h += '<div class="td-left">还有 ' + left.length + ' 件没做</div>';
      else h += '<div class="td-left ok">今天的事都做完了</div>';
    }
    h += '</div>';
    if (p && p.s) h += '<div class="td-card td-p"><div class="td-card-t">身体</div><div class="td-pline">' + p.t + '</div></div>';
    h += '<div class="td-quick">' +
      '<button class="td-btn" data-go="diary">写一篇日记</button>' +
      '<button class="td-btn ghost" data-go="chat">跟哥哥说句话</button>' +
      '</div>';
    box.innerHTML = h;
    box.querySelectorAll('[data-go]').forEach(function (b) {
      b.onclick = function () { go(b.getAttribute('data-go')); };
    });
  }
  window.renderToday = renderToday;
})();