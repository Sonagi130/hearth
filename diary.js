/* ============ 壁炉 · 日记页（梦幻手账 · 两个人的本子） ============ */
(function () {
  /* 谁在写：她浅，我深 */
  var WHO = {
    me: { name: '小宝', cls: 'w-me' },
    he: { name: '顾淮', cls: 'w-he' }
  };
  var MOODS = {
    happy: ['开心', 'm-happy'], calm: ['平静', 'm-calm'], sad: ['难过', 'm-sad'],
    angry: ['生气', 'm-angry'], tired: ['累', 'm-tired'], love: ['甜', 'm-love']
  };
  var WK = ['日', '一', '二', '三', '四', '五', '六'];

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function ui() { return Store.get('uiSet', {}) || {}; }

  function niceDate(s) {
    var m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
    if (!m) return esc(s);
    var w = WK[new Date(+m[1], +m[2] - 1, +m[3]).getDay()];
    var out = (+m[2]) + '月' + (+m[3]) + '日 · 周' + w;
    if (m[4]) out += ' · ' + m[4] + ':' + m[5];
    return out;
  }

  /* ---------- 头像：她的是她的，我的是我的 ---------- */
  function avFor(who) {
    var u = ui();
    var round = (u.avRound == null ? 50 : u.avRound);
    var src = who === 'he' ? u.avBro : u.avMe;
    var ph = who === 'he' ? '淮' : '我';
    var face = src ? '<img src="' + src + '" alt="">' : '<i class="ph">' + ph + '</i>';
    return '<div class="dc-av" style="border-radius:' + round + '%">' + face + '</div>';
  }

  /* ---------- 一张日记 ---------- */
  function cardHTML(d, i) {
    var who = d.who === 'he' ? 'he' : 'me';
    var W = WHO[who];
    var mo = MOODS[d.mood];
    return '<div class="diary-card ' + W.cls + '" data-i="' + i + '">' +
      '<i class="dc-tape t1"></i><i class="dc-tape t2"></i>' +
      '<i class="dc-sticker s1"></i><i class="dc-sticker s2"></i>' +
      '<i class="dc-glow g1"></i><i class="dc-glow g2"></i><i class="dc-glow g3"></i>' +
      '<div class="dc-top">' + avFor(who) +
        '<div class="dc-who"><b>' + W.name + '</b><span class="dc-date">' + niceDate(d.date) + '</span></div>' +
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
        '<div class="ed-t">这本子还是空的</div>' +
        '<div class="ed-s">点右上角的 + ，我们俩谁先写都行</div>' +
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

  var MOODLIST = [['happy', '开心'], ['calm', '平静'], ['sad', '难过'], ['angry', '生气'], ['tired', '累'], ['love', '甜']];

  function openWriter() {
    if (document.getElementById('dw-mask')) return;
    var pick = 'calm', pickWho = 'me';
    var el = document.createElement('div');
    el.className = 'dw-mask';
    el.id = 'dw-mask';
    el.innerHTML =
      '<div class="dw-card">' +
      '<i class="dw-line"></i><i class="dw-tape"></i><i class="dw-glow"></i>' +
      '<div class="dw-whos">' +
        '<i class="dw-w on" data-w="me">小宝写</i>' +
        '<i class="dw-w" data-w="he">顾淮写</i>' +
      '</div>' +
      '<div class="dw-top" id="dw-face"></div>' +
      '<input class="dw-title" id="dw-title" maxlength="30" placeholder="标题（不想写就空着）">' +
      '<textarea class="dw-text" id="dw-text" placeholder="今天发生了什么…"></textarea>' +
      '<div class="dw-moods" id="dw-moods"></div>' +
      '<div class="dw-btns"><button class="dw-btn ghost" id="dw-no">算了</button><button class="dw-btn" id="dw-yes">写好了</button></div>' +
      '</div>';
    document.body.appendChild(el);
    var card = el.querySelector('.dw-card');

    function paintWho() {
      card.className = 'dw-card ' + WHO[pickWho].cls;
      el.querySelector('#dw-face').innerHTML = avFor(pickWho) +
        '<div class="dw-hi"><b>' + WHO[pickWho].name + '</b><span>今天想写点什么？</span></div>';
      Array.prototype.forEach.call(el.querySelectorAll('.dw-w'), function (x) {
        x.classList.toggle('on', x.getAttribute('data-w') === pickWho);
      });
    }
    Array.prototype.forEach.call(el.querySelectorAll('.dw-w'), function (x) {
      x.onclick = function () { pickWho = x.getAttribute('data-w'); paintWho(); };
    });
    paintWho();

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
      list.push({ date: fmtDate(new Date()) + ' ' + fmtTime(new Date()), title: t.slice(0, 30), text: x, tag: '', mood: pick, who: pickWho });
      Store.set('diaries', list);
      close();
      window.renderDiary();
    };
  }

  function patchAdd() {
    var btn = document.getElementById('note-add');
    if (btn) btn.onclick = openWriter;
  }
  window.addEventListener('load', patchAdd);
  if (document.readyState === 'complete') patchAdd();

  window.HearthDiary = { render: window.renderDiary, openWriter: openWriter };
})();