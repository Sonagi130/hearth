/* ============ 壁炉 · 今天页 ============ */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var CITY = { name: '新乡', lat: 35.30, lon: 113.93 };
  var WK = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

  function pad2(n) { return String(n).padStart(2, '0'); }
  function ui() { return Store.get('uiSet', {}) || {}; }

  function avHTML(who) {
    var u = ui();
    var src = who === 'he' ? u.avBro : u.avMe;
    var ph = who === 'he' ? '淮' : '宝';
    var round = 50;
    return '<span class="td-av" style="border-radius:' + round + '%">' +
      (src ? '<img src="' + src + '" alt="">' : '<i>' + ph + '</i>') + '</span>';
  }

  function daysTogether() {
    var now = new Date();
    var a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var b = new Date(2026, 6, 24);
    return Math.round((a - b) / 86400000) + 1;
  }

  /* ---------- 天气 ---------- */
  function wxIcon(c) {
    c = +c;
    var s = '<svg class="td-wx" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">';
    if (c === 0 || c === 1) {
      s += '<circle cx="12" cy="12" r="4.4"/><path d="M12 2.2v2.2M12 19.6v2.2M2.2 12h2.2M19.6 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6"/>';
    } else if (c >= 51 && c <= 99) {
      s += '<path d="M7 15.5a4 4 0 0 1 .7-8 5.6 5.6 0 0 1 10.4 1.4 3.6 3.6 0 0 1-.6 6.6Z"/><path d="M9 18.6l-1 2.2M13 18.6l-1 2.2M17 18.6l-1 2.2"/>';
    } else {
      s += '<path d="M7 16a4 4 0 0 1 .7-8 5.6 5.6 0 0 1 10.4 1.4 3.6 3.6 0 0 1-.6 6.6Z"/>';
    }
    return s + '</svg>';
  }
  function wxWord(c) {
    c = +c;
    if (c === 0) return '晴';
    if (c === 1) return '少云';
    if (c === 2) return '多云';
    if (c === 3) return '阴';
    if (c === 45 || c === 48) return '有雾';
    if (c >= 51 && c <= 57) return '毛毛雨';
    if (c >= 61 && c <= 67) return '雨';
    if (c >= 71 && c <= 77) return '雪';
    if (c >= 80 && c <= 82) return '阵雨';
    if (c === 85 || c === 86) return '阵雪';
    if (c >= 95) return '雷阵雨';
    return '';
  }
  function loadWx(cb) {
    var c = Store.get('wx', null);
    if (c && c.its && (Date.now() - c.its < 3600000)) { cb(c); return; }
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + CITY.lat + '&longitude=' + CITY.lon +
      '&current=temperature_2m,weather_code&timezone=Asia%2FShanghai';
    fetch(url).then(function (r) { return r.json(); }).then(function (j) {
      var cur = j.current || {};
      var o = { t: Math.round(cur.temperature_2m), c: cur.weather_code, its: Date.now() };
      Store.set('wx', o);
      cb(o);
    })['catch'](function () { if (c) cb(c); });
  }

  /* ---------- 渲染 ---------- */
  var timer = null;
  function renderToday() {
    var box = $('today-wrap');
    if (!box) return;
    var d = new Date();
    var n = daysTogether();
    var h = '';
    h += '<div class="td-head"><div class="td-avs">' + avHTML('he') + '<i class="amp">&amp;</i>' + avHTML('me') + '</div></div>';
    h += '<div class="td-brand">HEARTH<em>since Jul 24</em></div>';
    h += '<div class="td-days"><div class="td-num">' + n + '</div>' +
      '<div class="td-sub"><em>days together</em></div></div>';
    h += '<div class="td-now"><div class="td-line1"><span class="td-date">' + (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + WK[d.getDay()] + '</span>' +
      '<span class="td-clock" id="td-clock">' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + '</span></div>' +
      '<div class="td-weather" id="td-weather"><span class="td-wx-s">看天…</span></div></div>';
    var todayKey = d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
    var todos = (Store.get('todos', []) || []).filter(function (x) { return x && x.date === todayKey; });
    var left = todos.filter(function (x) { return !x.done; });
    var p = (window.HearthPeriod && window.HearthPeriod.status) ? window.HearthPeriod.status() : null;
    h += '<div class="td-card"><div class="td-card-t">TODAY\'S PLAN<em>今天的事</em></div>';
    if (!todos.length) h += '<div class="td-empty">今天还没安排。<br>有要做的，去日历里加一条。</div>';
    else {
      todos.forEach(function (x) {
        h += '<div class="td-todo' + (x.done ? ' done' : '') + '"><i></i><span>' + String(x.text || '').replace(/</g, '&lt;') + '</span></div>';
      });
      h += left.length ? '<div class="td-left">还有 ' + left.length + ' 件没做</div>' : '<div class="td-left ok">今天的事都做完了</div>';
    }
    h += '</div>';
    if (p && p.s) h += '<div class="td-card"><div class="td-card-t">BODY<em>身体</em></div><div class="td-pline">' + p.t + '</div></div>';
    h += '<div class="td-quick">' +
      '<button class="td-btn" data-go="diary">写一篇日记</button>' +
      '<button class="td-btn ghost" data-go="chat">跟哥哥说句话</button></div>';
    box.innerHTML = h;

    if (timer) clearInterval(timer);
    timer = setInterval(function () {
      var c = $('td-clock');
      if (!c) { clearInterval(timer); timer = null; return; }
      var t = new Date();
      c.textContent = pad2(t.getHours()) + ':' + pad2(t.getMinutes());
    }, 20000);

    loadWx(function (w) {
      var el = $('td-weather');
      if (!el || !w) return;
      el.innerHTML = wxIcon(w.c) + '<span class="td-wx-w">' + CITY.name + ' · ' + w.t + '℃</span>' +
        '<span class="td-wx-s">' + wxWord(w.c) + '</span>';
    });

    box.querySelectorAll('[data-go]').forEach(function (b) {
      b.onclick = function () { if (window.HearthGo) window.HearthGo(b.getAttribute('data-go')); };
    });
  }
  window.renderToday = renderToday;
})();