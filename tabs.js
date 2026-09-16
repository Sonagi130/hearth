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
    document.body.classList.toggle('no-tabs', page === 'chat');
    document.querySelectorAll('.side-nav .nav-item').forEach(function (b) {
      b.classList.toggle('active', b.dataset.page === page);
    });
    document.querySelectorAll('.tab-bar .tab-item').forEach(function (b) {
      b.classList.toggle('active', b.dataset.page === page);
    });
    var nb = $('note-add');
    if (nb) nb.style.display = (page === 'diary') ? 'flex' : 'none';
    try {
      if (page === 'today' && window.renderToday) window.renderToday();
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

})();
