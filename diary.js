/* ============ 壁炉 · 日记页（少女梦想风） ============ */
(function () {
  var MOODS = {
    happy: ['开心', 'm-happy'], calm: ['平静', 'm-calm'], sad: ['难过', 'm-sad'],
    angry: ['生气', 'm-angry'], tired: ['累', 'm-tired'], love: ['甜', 'm-love']
  };
  var WK = ['日', '一', '二', '三', '四', '五', '六'];

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function niceDate(s) {
    var m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
    if (!m) return esc(s);
    var y = +m[1], mo = +m[2], d = +m[3];
    var w = WK[new Date(y, mo - 1, d).getDay()];
    var out = mo + '月' + d + '日 · 周' + w;
    if (m[4]) out += ' · ' + m[4] + ':' + m[5];
    return out;
  }

  /* ---------- 头像（跟设置里那个人同步，没传就先站着） ---------- */
  function avHTML() {
    var u = Store.get('uiSet', {}) || {};
    var round = (u.avRound == null ? 50 : u.avRound);
    var st = 'style="border-radius:' + round + '%"';
    if (u.avMe) return '<div class="dc-av" ' + st + '><img src="' + u.avMe + '" alt=""></div>';
    return '<div class="dc-av ph" ' + st + '>我</div>';
  }

  /* ---------- 一张日记 ---------- */
  function cardHTML(d, i) {
    var mo = MOODS[d.mood];
    return '<div class="diary-card" data-i="' + i + '">' +
      '<i class="dc-edge"></i>' +
      '<i class="dc-tape"></i>' +
      '<i class="dc-spark s1"></i><i class="dc-spark s2"></i><i class="dc-spark s3"></i>' +
      '<div class="dc-top">' + avHTML() +
        '<div class="dc-who"><b>小宝</b><span class="dc-date">' + niceDate(d.date) + '</span></div>' +
        (mo ? '<span class="dc-mood ' + mo[1] + '">' + mo[0] + '</span>' : '') +
      '</div>' +
      (d.title ? '<div class="d-title">' + esc(d.title) + '</div>' : '') +
      '<div class="content">' + esc(d.text) + '</div>' +
      '<div class="card-more">点一下展开 · 双击删除</div>' +
      '</div>';
  }

  /* ---------- 渲染整页 ---------- */
  window.renderDiary = function () {
    var box = document.getElementById('diary-list');
    if (!box) return;
    var list = Store.get('diaries', []) || [];
    if (!list.length) {
      box.innerHTML = '<div class="empty-diary">' +
        '<i class="ed-book"><em></em></i>' +
        '<div class="ed-t">还没有日记</div>' +
        '<div class="ed-s">点右上角的 + ，写下第一篇</div>' +
        '</div>';
      return;
    }
    var sorted = list.slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    var h = '';
    sorted.forEach(function (d) { h += cardHTML(d, list.indexOf(d)); });
    box.innerHTML = h;

    Array.prototype.forEach.call(box.querySelectorAll('.diary-card'), function (card) {
      var i = +card.getAttribute('data-i');
      var t = 0;
      card.onclick = function () {
        if (t) { clearTimeout(t); t = 0; if (window.askDeleteDiary) window.askDeleteDiary(i); return; }
        t = setTimeout(function () { t = 0; card.classList.toggle('open'); }, 260);
      };
    });
  };

  /* ---------- 写日记（自己的面板，不用浏览器那个框） ---------- */
  var MOODLIST = [['happy', '开心'], ['calm', '平静'], ['sad', '难过'], ['angry', '生气'], ['tired', '累'], ['love', '甜']];

  function openWriter() {
    if (document.getElementById('dw-mask')) return;
    var pick = 'calm';
    var el = document.createElement('div');
    el.className = 'dw-mask';
    el.id = 'dw-mask';
    el.innerHTML =
      '<div class="dw-card">' +
      '<i class="dw-line"></i><i class="dw-tape"></i>' +
      '<div class="dw-top">' + avHTML() + '<div class="dw-hi"><b>小宝</b><span>今天想写点什么？</span></div></div>' +
      '<input class="dw-title" id="dw-title" maxlength="30" placeholder="标题（不想写就空着）">' +
      '<textarea class="dw-text" id="dw-text" placeholder="今天发生了什么…"></textarea>' +
      '<div class="dw-moods" id="dw-moods"></div>' +
      '<div class="dw-btns"><button class="dw-btn ghost" id="dw-no">算了</button><button class="dw-btn" id="dw-yes">写好了</button></div>' +
      '</div>';
    document.body.appendChild(el);
    var mb = el.querySelector('#dw-moods');
    MOODLIST.forEach(function (m) {
      var b = document.createElement('i');
      b.className = 'dw-mood' + (m[0] === pick ? ' on' : '');
      b.textContent = m[1];
      b.onclick = function () {
        pick = m[0];
        Array.prototype.forEach.call(mb.children, function (x) { x.classList.remove('on'); });
        b.classList.add('on');
      };
      mb.appendChild(b);
    });
    var close = function () { el.remove(); };
    el.onclick = function (e) { if (e.target === el) close(); };
    el.querySelector('#dw-no').onclick = close;
    el.querySelector('#dw-yes').onclick = function () {
      var t = String(el.querySelector('#dw-title').value || '').trim();
      var x = String(el.querySelector('#dw-text').value || '').trim();
      if (!x) { el.querySelector('#dw-text').focus(); return; }
      var list = Store.get('diaries', []) || [];
      list.push({ date: fmtDate(new Date()) + ' ' + fmtTime(new Date()), title: t.slice(0, 30), text: x, tag: '', mood: pick });
      Store.set('diaries', list);
      close();
      window.renderDiary();
    };
  }

  /* 把右上角那个 + 接到自己的面板上 */
  function patchAdd() {
    var btn = document.getElementById('note-add');
    if (btn) btn.onclick = openWriter;
  }
  window.addEventListener('load', patchAdd);
  if (document.readyState === 'complete') patchAdd();

  window.HearthDiary = { render: window.renderDiary, openWriter: openWriter };
})();
