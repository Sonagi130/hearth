/* ============ 壁炉 · 经期记录与推算 ============
   记录每次例假的开始日，自己设周期和经期天数，
   日历上自动标出「记过的」和「推算的」，并算出下次大概什么时候。 */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- 数据 ---------- */
  function cfg() {
    return Store.get('period', { starts: [], cycle: 28, days: 5 });
  }
  function save(o) { Store.set('period', o); }

  function pad2(n) { return String(n).padStart(2, '0'); }
  function key(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function parse(s) {
    var p = String(s || '').split('-');
    return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
  }
  function dayDiff(a, b) { return Math.round((a - b) / 86400000); }
  function today0() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }

  /* ---------- 推算 ---------- */
  function status() {
    var c = cfg();
    if (!c.starts.length) return { t: '还没记过。点头一下日期，选「例假开始」', s: 'none' };
    var t0 = today0();
    var list = c.starts.slice().sort();
    var last = parse(list[list.length - 1]);
    var d = dayDiff(t0, last);
    if (d >= 0 && d < c.days) {
      return { t: '今天是第 ' + (d + 1) + ' 天', s: 'on', day: d + 1 };
    }
    /* 从最后一次往后推，找到第一个还在今天之后的预测 */
    var next = new Date(last.getTime());
    var guard = 0;
    while (dayDiff(next, t0) < 0 && guard < 400) { next.setDate(next.getDate() + c.cycle); guard++; }
    var left = dayDiff(next, t0);
    if (left === 0) return { t: '预计就是今天', s: 'pred' };
    if (left < 0 || left > c.cycle) return { t: '该来没来？点一下日期记上', s: 'late' };
    if (left > 10) return { t: '预计还有 ' + left + ' 天（' + (next.getMonth() + 1) + '月' + next.getDate() + '日）', s: 'pred' };
    return { t: '预计还有 ' + left + ' 天', s: 'pred' };
  }
  /* 某一天属于经期吗？（记过的 / 推算的） */
  function dayKind(dateStr) {
    var c = cfg();
    var d0 = parse(dateStr);
    var i;
    for (i = 0; i < c.starts.length; i++) {
      var s = parse(c.starts[i]);
      var dd = dayDiff(d0, s);
      if (dd >= 0 && dd < c.days) return 'on';
      if (dd === 0) return 'on';
    }
    if (!c.starts.length) return '';
    var list = c.starts.slice().sort();
    var last = parse(list[list.length - 1]);
    var n = dayDiff(d0, last);
    if (n <= 0) return '';
    if (n % c.cycle < c.days) return 'pred';
    return '';
  }
  function isStart(dateStr) { return cfg().starts.indexOf(dateStr) >= 0; }

  /* ---------- 在日历上打点 ---------- */
  function paint() {
    var grid = $('cal-grid');
    var mEl = $('cal-month');
    if (!grid || !mEl) return;
    var mm = String(mEl.textContent || '').match(/(\d+)年(\d+)月/);
    if (!mm) return;
    var y = parseInt(mm[1], 10), mo = parseInt(mm[2], 10) - 1;
    var firstDay = new Date(y, mo, 1).getDay();
    var daysInMonth = new Date(y, mo + 1, 0).getDate();
    var cells = grid.querySelectorAll('.cal-cell');
    for (var i = 0; i < daysInMonth; i++) {
      var cell = cells[firstDay + i];
      if (!cell) continue;
      var ds = y + '-' + pad2(mo + 1) + '-' + pad2(i + 1);
      var k = dayKind(ds);
      cell.classList.remove('p-on', 'p-pred', 'p-start');
      if (k === 'on') cell.classList.add('p-on');
      else if (k === 'pred') cell.classList.add('p-pred');
      if (isStart(ds)) cell.classList.add('p-start');
    }
  }

  /* ---------- 顶上那一条 ---------- */
  function strip() {
    var page = $('page-calendar');
    if (!page) return;
    var el = $('p-strip');
    if (!el) {
      el = document.createElement('div');
      el.id = 'p-strip';
      el.className = 'p-strip';
      page.insertBefore(el, page.firstChild);
    }
    var st = status();
    el.className = 'p-strip s-' + st.s;
    el.innerHTML = '<span class="p-ic">🌸</span><span class="p-t">' + st.t + '</span>' +
                   '<span class="p-set">设置</span>';
    var s = el.querySelector('.p-set');
    if (s) s.onclick = openSettings;
  }

  function refresh() { paint(); strip(); }

  /* ---------- 长按某一天 ---------- */
  function daySheet(ds) {
    var mask = document.createElement('div');
    mask.className = 'sheet-mask';
    var on = isStart(ds);
    mask.innerHTML = '<div class="sheet-card wide" style="text-align:left;">' +
      '<div class="sc-title" style="text-align:center;">' + ds + '</div>' +
      '<div class="sc-sub" style="text-align:center;">把这一天标成什么？</div>' +
      '<div class="sh-body">' +
      '<div class="settings-row" id="pd-start"><div class="sr-left">' +
      '<span class="sr-icon">🌸</span>' + (on ? '取消「例假开始」' : '这是例假开始的那天') +
      '</div><span class="arrow">›</span></div>' +
      '<div class="settings-row" id="pd-set"><div class="sr-left">' +
      '<span class="sr-icon">⚙</span>周期和天数设置' +
      '</div><span class="arrow">›</span></div>' +
      '<div class="sc-row" style="margin-top:14px;"><button class="sc-btn" id="pd-ok">关</button></div>' +
      '</div></div>';
    document.body.appendChild(mask);
    var close = function () { mask.remove(); };
    mask.onclick = function (e) { if (e.target === mask) close(); };
    mask.querySelector('#pd-ok').onclick = close;
    mask.querySelector('#pd-start').onclick = function () {
      var c = cfg();
      var i = c.starts.indexOf(ds);
      if (i >= 0) c.starts.splice(i, 1);
      else c.starts.push(ds);
      c.starts.sort();
      save(c);
      close();
      refresh();
      if (window.renderCalendar) { try { window.renderCalendar(); } catch (e) {} }
    };
    mask.querySelector('#pd-set').onclick = function () { close(); openSettings(); };
  }

  /* ---------- 设置 ---------- */
  function openSettings() {
    var c = cfg();
    var mask = document.createElement('div');
    mask.className = 'sheet-mask';
    mask.innerHTML = '<div class="sheet-card wide" style="text-align:left;">' +
      '<div class="sc-title" style="text-align:center;">经期设置</div>' +
      '<div class="sc-sub" style="text-align:center;">填你自己的，别看默认的</div>' +
      '<div class="sh-body">' +
      '<div class="settings-row" id="ps-cycle"><div class="sr-left">周期天数' +
      '<span class="settings-sub">两次例假第一天之间隔多少天</span></div>' +
      '<span class="pill">' + c.cycle + ' 天</span></div>' +
      '<div class="settings-row" id="ps-days"><div class="sr-left">经期持续' +
      '<span class="settings-sub">每次来几天</span></div>' +
      '<span class="pill">' + c.days + ' 天</span></div>' +
      '<div class="settings-row" id="ps-list"><div class="sr-left">已经记下的' +
      '<span class="settings-sub">' + (c.starts.length ? c.starts.join('、') : '还没记过') + '</span></div>' +
      '<span class="arrow">›</span></div>' +
      '<div class="sc-row" style="margin-top:14px;"><button class="sc-btn" id="ps-ok">关</button></div>' +
      '</div></div>';
    document.body.appendChild(mask);
    var close = function () { mask.remove(); };
    mask.onclick = function (e) { if (e.target === mask) close(); };
    mask.querySelector('#ps-ok').onclick = close;
    mask.querySelector('#ps-cycle').onclick = function () {
      var v = prompt('周期多少天？（常见 26～32）', c.cycle);
      if (v === null) return;
      var n = parseInt(v, 10);
      if (!n || n < 15 || n > 60) { alert('填 15～60 之间'); return; }
      c.cycle = n; save(c); close(); refresh(); openSettings();
    };
    mask.querySelector('#ps-days').onclick = function () {
      var v = prompt('每次来几天？（常见 3～7）', c.days);
      if (v === null) return;
      var n = parseInt(v, 10);
      if (!n || n < 1 || n > 14) { alert('填 1～14 之间'); return; }
      c.days = n; save(c); close(); refresh(); openSettings();
    };
    mask.querySelector('#ps-list').onclick = function () {
      if (!c.starts.length) { alert('还没有记录。长按日历上的某一天就能记。'); return; }
      var v = prompt('记下的日期（逗号分隔，可以删掉不要的）：', c.starts.join(','));
      if (v === null) return;
      var arr = v.split(/[,，\\s]+/).map(function (x) { return x.trim(); })
        .filter(function (x) { return /^\\d{4}-\\d{1,2}-\\d{1,2}$/.test(x); });
      c.starts = arr.sort(); save(c); close(); refresh();
    };
  }

  /* ---------- 启动 ---------- */
  function init() {
    refresh();
    var grid = $('cal-grid');
    if (grid && window.MutationObserver) {
      new MutationObserver(function () { paint(); }).observe(grid, { childList: true });
    }
    /* 长按记日期（不抢点击） */
    function bindPress(el) {
      var timer = null;
      var start = function (e) {
        var t = e.target;
        while (t && t !== el) {
          if (t.className && String(t.className).indexOf('cal-cell') >= 0) {
            if (String(t.className).indexOf('other-month') >= 0) return;
            var mEl = $('cal-month');
            var mm = String(mEl ? mEl.textContent : '').match(/(\d+)年(\d+)月/);
            if (!mm) return;
            var ds = mm[1] + '-' + pad2(parseInt(mm[2], 10)) + '-' + pad2(parseInt(t.textContent, 10));
            clearTimeout(timer);
            timer = setTimeout(function () { daySheet(ds); }, 520);
            return;
          }
          t = t.parentNode;
        }
      };
      var cancel = function () { clearTimeout(timer); };
      el.addEventListener('touchstart', start, { passive: true });
      el.addEventListener('touchend', cancel);
      el.addEventListener('touchmove', cancel);
      el.addEventListener('mousedown', start);
      el.addEventListener('mouseup', cancel);
      el.addEventListener('mouseleave', cancel);
    }
    if (grid) bindPress(grid);
    var nav = $('page-calendar');
    if (nav) nav.addEventListener('click', function () { setTimeout(strip, 30); }, true);
  }

  window.HearthPeriod = { refresh: refresh, status: status, settings: openSettings };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();