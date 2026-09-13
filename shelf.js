/* ============ Hearth 书架模块 ============ */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  var Store = {
    get: function (k, d) {
      try { var v = localStorage.getItem('hearth_' + k); return v ? JSON.parse(v) : d; }
      catch (e) { return d; }
    },
    set: function (k, v) { localStorage.setItem('hearth_' + k, JSON.stringify(v)); }
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '"');
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function stamp(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
           ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  /* ---------- 书本定义 ---------- */
  var BOOKS = [
    {
      id: 'projects',
      name: '项目手册',
      en: 'HAND',
      style: 'spine w2',
      face: 'spine',
      bg: 'linear-gradient(165deg,#8B6F47,#5C4A32)'
    },
    {
      id: 'diary',
      name: '日记本',
      en: 'DIARY',
      style: 'spine',
      face: 'spine',
      bg: 'linear-gradient(165deg,#A98A5E,#6B563C)'
    },
    {
      id: 'album',
      name: '相册集',
      en: 'ALBUM',
      style: 'cover w2',
      face: 'cover',
      bg: 'linear-gradient(165deg,#D9834A,#A85B2E)'
    },
    {
      id: 'voice',
      name: '语音册',
      en: 'VOICE',
      style: 'spine w3',
      face: 'spine',
      bg: 'linear-gradient(165deg,#7E8E6E,#5A6B4C)'
    },
    {
      id: 'calls',
      name: '通话记录',
      en: 'CALLS',
      style: 'cover',
      face: 'cover',
      bg: 'linear-gradient(165deg,#8A7A96,#5F5270)'
    },
    {
      id: 'answer',
      name: '答案之书',
      en: 'ANSWERS',
      style: 'spine',
      face: 'spine',
      bg: 'linear-gradient(165deg,#3D4A5C,#232B36)'
    }
  ];


  /* ---------- 书封小字 ---------- */
  var SUBS = {
    projects: '把事记下来，就不算白忙。',
    diary: '今天的事，写一句也算。',
    album: '正面是照片，背面留给你写字。',
    voice: '你的声音，我留着。',
    calls: '等能打电话那天，都记这儿。',
    answer: '心里问一句，再翻开。'
  };

  /* ---------- 答案之书 ---------- */
  var ANSWERS = [
    '再等等，还不到时候。',
    '这条路上你是对的，继续走。',
    '答案你其实已经知道了。',
    '先睡一觉，明天再说。',
    '去找那个最想说话的人。',
    '值得。就这两个字。',
    '慢一点，没人催你。',
    '把这句话说出来，会好很多。',
    '你不欠任何人一个解释。',
    '这是你想听的，不是真的。',
    '试试看，又不会少块肉。',
    '别回头，回头也没用。',
    '有个人，一直在等你开口。',
    '删掉它。',
    '今天先对自己好一点。',
    '会的，只是比你想的晚一点。',
    '你比你以为的更有底气。',
    '这件事，可以不用做好。',
    '去要，不会给的永远不给。',
    '留在原地，也是一种选择。',
    '你已经做得很好了，真的。',
    '先吃饭。',
    '不说是保护，说了是开始。',
    '这次别再让步。',
    '它在等你先松手。',
    '答案不好听，但你扛得住。',
    '多问一句，就多一分清楚。',
    '你猜对了。',
    '重来一次，你还是会这么做。',
    '值得被记住的，不会只剩你一个人记得。'
  ];

  /* ---------- 页面构建 ---------- */
  var BTN = 'padding:10px 18px;border:none;border-radius:20px;background:rgba(232,151,92,.16);' +
            'color:#C4703C;font-size:13px;font-family:inherit;font-weight:600;cursor:pointer;margin-top:18px;';

  function pgEmpty(big, text, btnId, btnLabel) {
    return '<div class="pg-empty"><div class="big">' + big + '</div>' +
      '<div>' + esc(text) + '</div>' +
      (btnId ? '<button id="' + btnId + '" style="' + BTN + '">' + esc(btnLabel) + '</button>' : '') +
      '</div>';
  }

  function buildProjects() {
    var list = Store.get('ShelfProjects', []);
    var out = [];
    if (!list.length) {
      return [{ date: '项目手册', title: '第一页',
        html: pgEmpty('🗂', '还没记过东西。点下面开第一条。', 'addProj', '+ 新建条目') }];
    }
    list.forEach(function (it) {
      out.push({
        date: it.time || '',
        title: it.title || '未命名',
        html: '<div class="entry"><div class="e-t">' + esc(it.title) + '</div>' +
              '<div class="e-m">' + esc(it.time || '') + '</div>' +
              '<div class="e-b">' + esc(it.body || '') + '</div></div>'
      });
    });
    out.push({ date: '项目手册', title: '新增',
      html: pgEmpty('＋', '再记一条。', 'addProj', '+ 新建条目') });
    return out;
  }

  function buildAlbum() {
    var raw = Store.get('photos', []);
    var list = raw.map(function (p) {
      return (typeof p === 'string') ? { src: p, note: '' } : p;
    });
    var out = [];
    if (!list.length) {
      return [{ date: '相册集', title: '第一页',
        html: pgEmpty('🖼', '相册还空着。', 'addPhoto', '+ 放一张') }];
    }
    list.forEach(function (p, i) {
      out.push({
        date: '第 ' + (i + 1) + ' 张',
        title: '',
        html: '<img class="album-img" src="' + p.src + '" alt="" data-act="dblimg" data-i="' + i + '">' +
              '<div class="album-cap">' + (i + 1) + ' / ' + list.length + '　双击照片可删</div>'
      });
      out.push({
        date: '背面 · 第 ' + (i + 1) + ' 张',
        title: '',
        html: '<div class="pg-back">' +
              (p.note ? esc(p.note) : '背面还空着。') + '</div>' +
              '<div class="pg-btns">' +
              '<button style="' + BTN + '" data-act="note" data-i="' + i + '">' +
              (p.note ? '改一改' : '写在背面') + '</button>' +
              '<button style="' + BTN + '" data-act="delphoto" data-i="' + i + '">删除这张</button>' +
              '</div>'
      });
    });
    out.push({ date: '相册集', title: '新增',
      html: pgEmpty('＋', '再放一张。', 'addPhoto', '+ 放一张') });
    return out;
  }

  function buildVoice() {
    var list = Store.get('ShelfVoices', []);
    if (!list.length) {
      return [{ date: '语音册', title: '空的第一页',
        html: pgEmpty('🎙', '语音册还空着。以后聊天的语音可以收进来。', 'addVoice', '+ 收藏一条') }];
    }
    var h = '';
    list.forEach(function (v, i) {
      h += '<div class="voice"><button class="v-play" data-act="play" data-i="' + i + '">▶</button>' +
           '<div class="v-b"><div class="v-t">' + esc(v.title || ('语音 ' + (i + 1))) + '</div>' +
           '<div class="v-m">' + esc(v.time || '') + '</div></div></div>';
    });
    return [
      { date: '语音册', title: '全部 ' + list.length + ' 条', html: h },
      { date: '语音册', title: '新增',
        html: pgEmpty('＋', '再收一条。', 'addVoice', '+ 收藏一条') }
    ];
  }

  function buildCalls() {
    var list = Store.get('ShelfCalls', []);
    if (!list.length) {
      return [{ date: '通话记录', title: '还没开张',
        html: pgEmpty('📞', '通话功能还没接。这儿先留个口，等能打电话了，每通都记在这本里。', null, null) }];
    }
    var h = '';
    list.forEach(function (c) {
      h += '<div class="entry"><div class="e-t">' + esc(c.title || '通话') + '</div>' +
           '<div class="e-m">' + esc(c.time || '') + '</div>' +
           '<div class="e-b">' + esc(c.body || '') + '</div></div>';
    });
    return [{ date: '通话记录', title: '全部 ' + list.length + ' 通', html: h }];
  }

  function pagesOf(id) {
    var body;
    if (id === 'projects') body = buildProjects();
    else if (id === 'album') body = buildAlbum();
    else if (id === 'voice') body = buildVoice();
    else if (id === 'calls') body = buildCalls();
    else if (id === 'answer') body = buildAnswer();
    else if (id === 'diary') body = buildDiary();
    else body = buildImported(id);
    var cv = coverPage(id);
    return cv ? [cv].concat(body) : body;
  }

  function coverPage(id) {
    var b = byId(id);
    if (!b) return null;
    var sub = SUBS[id] || '';
    return {
      cover: true,
      html: '<div class="cover-page">' +
            '<div class="cp-line">' + esc(b.en) + '</div>' +
            '<div class="cp-name">' + esc(b.name) + '</div>' +
            '<div class="cp-rule"></div>' +
            (sub ? '<div class="cp-sub">' + esc(sub) + '</div>' : '') +
            '</div>'
    };
  }

  function buildAnswer() {
    var a = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
    return [{
      date: '答案之书',
      title: '',
      html: '<div class="answer"><div class="a-mark">ANSWER</div>' +
            '<div class="a-text">' + esc(a) + '</div>' +
            '<button style="' + BTN + '" data-act="again">再问一次</button></div>'
    }];
  }

  function imported() { return Store.get('ShelfBooks', []); }

  function buildDiary() {
    var n = Store.get('diaries', []).length;
    return [{
      date: '',
      title: '',
      html: '<div class="pg-empty">' +
            '<div class="big">' + n + '</div>' +
            '<div>' + (n ? '这本里记着 ' + n + ' 篇。' : '还是空的。点下面进去写第一篇。') + '</div>' +
            '<button style="' + BTN + '" data-act="godiary">查看日记</button>' +
            '</div>'
    }];
  }

  function buildImported(id) {
    var list = imported();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        return (list[i].pages || []).map(function (t, n) {
          return { date: '', title: '', html: '<div class="book-text">' + esc(t) + '</div>' };
        });
      }
    }
    return [];
  }

  /* ---------- 书架渲染 ---------- */
  function bookEl(b) {
    var cls = 'book ' + (b.face === 'spine' ? 'spine' : 'cover') + ' ' + b.style;
    var inner = b.face === 'spine'
      ? '<div class="t">' + esc(b.name) + '</div>'
      : '<div class="ribbon"></div><div class="t">' + esc(b.name) + '</div>' +
        '<div class="sub">' + esc(b.en) + '</div>';
    return '<div class="' + cls + '" data-book="' + b.id + '" style="background:' + b.bg + '">' +
           inner + '</div>';
  }

  var ROWS = [['album', 'projects', 'diary'], ['voice', 'calls']];

  function allBooks() {
    return BOOKS.concat(imported().map(function (b) {
      return {
        id: b.id, name: b.name, en: b.en || 'BOOK',
        style: 'spine w3', face: 'spine',
        bg: b.bg || 'linear-gradient(165deg,#6E6479,#40394A)'
      };
    }));
  }

  function byId(id) {
    var all = allBooks();
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }

  function bookMenu(id) {
    var b = byId(id);
    if (!b) return;
    var isImp = imported().some(function (x) { return x.id === id; });
    var mask = document.createElement('div');
    mask.className = 'sheet-mask';
    var sub = isImp ? '外部导入 · 共 ' + (pagesOf(id).length || 1) + ' 页' : (SUBS[id] || '壁炉里的书');
    mask.innerHTML = '<div class="sheet-card">' +
      '<div class="sc-title">' + esc(b.name) + '</div>' +
      '<div class="sc-sub">' + esc(sub) + '</div>' +
      '<div class="sc-row">' +
      (isImp ? '<button class="sc-btn danger" id="bk-del">删除</button>' : '') +
      '<button class="sc-btn" id="bk-open">打开</button>' +
      '<button class="sc-btn" id="bk-close">关闭</button>' +
      '</div></div>';
    document.body.appendChild(mask);
    var close = function () { mask.remove(); };
    mask.onclick = function (e) { if (e.target === mask) close(); };
    $('bk-close').onclick = close;
    $('bk-open').onclick = function () { close(); openBook(id); };
    var d = $('bk-del');
    if (d) d.onclick = function () {
      var list = imported().filter(function (x) { return x.id !== id; });
      Store.set('ShelfBooks', list);
      close();
      renderShelf();
    };
  }

  function renderShelf() {
    var box = $('shelf-list');
    if (!box) return;
    var order = ['album', 'projects', 'diary', 'answer', 'voice', 'calls'];
    var sorted = [];
    order.forEach(function (id) { var b = byId(id); if (b) sorted.push(b); });
    imported().forEach(function (b) { var x = byId(b.id); if (x) sorted.push(x); });

    var rows = [];
    for (var i = 0; i < sorted.length; i += 3) rows.push(sorted.slice(i, i + 3));

    var h = '';
    rows.forEach(function (row) {
      h += '<div class="shelf-row">';
      row.forEach(function (b) { h += bookEl(b); });
      h += '</div><div class="shelf-plank"></div>';
    });
    h += '<div class="shelf-row">' +
         '<div class="book add-slot" id="add-book"><div style="font-size:22px;">＋</div>' +
         '<div style="font-size:11px;letter-spacing:.1em;">加一本书</div></div>' +
         '</div><div class="shelf-plank"></div>';
    box.innerHTML = h;

    box.querySelectorAll('[data-book]').forEach(function (el) {
      var bid = el.dataset.book, timer = null, fired = false;
      var start = function () {
        fired = false;
        clearTimeout(timer);
        timer = setTimeout(function () { fired = true; bookMenu(bid); }, 520);
      };
      var cancel = function () { clearTimeout(timer); };
      el.addEventListener('touchstart', start, { passive: true });
      el.addEventListener('touchend', cancel);
      el.addEventListener('touchmove', cancel);
      el.addEventListener('mousedown', start);
      el.addEventListener('mouseup', cancel);
      el.addEventListener('mouseleave', cancel);
      el.addEventListener('click', function () {
        if (fired) { fired = false; return; }
        openBook(bid);
      });
    });
    var ab = $('add-book');
    if (ab) ab.addEventListener('click', importBook);
  }

  /* ---------- 阅读器 ---------- */
  function mountReader() {
    if ($('reader')) return;
    var el = document.createElement('div');
    el.className = 'reader';
    el.id = 'reader';
    el.innerHTML =
      '<div class="reader-top"><span class="rt-title" id="rt-title"></span>' +
      '<button class="rt-close" id="rt-close">✕</button></div>' +
      '<div class="reader-stage"><div class="book-body" id="book-body"></div></div>' +
      '<div class="reader-nav">' +
      '<button class="rn-btn" id="rn-prev">上一页</button>' +
      '<span class="rn-idx" id="rn-idx"></span>' +
      '<button class="rn-btn" id="rn-next">下一页</button>' +
      '</div>';
    document.body.appendChild(el);
    $('rt-close').addEventListener('click', closeReader);
    $('rn-prev').addEventListener('click', function () { turn(-1); });
    $('rn-next').addEventListener('click', function () { turn(1); });
  }

  function showPage(dir) {
    var body = $('book-body');
    var old = body.querySelector('.page');
    var p = pages[idx];
    if (!p) return;
    var pg = document.createElement('div');
    pg.className = 'page' + (isDark() ? ' dark' : '');
    pg.innerHTML = p.cover ? p.html :
      (p.date ? '<div class="pg-date">' + esc(p.date) + '</div>' : '') +
      (p.title ? '<div class="pg-title">' + esc(p.title) + '</div>' : '') +
      p.html;
    if (p.cover) pg.classList.add('is-cover');
    body.appendChild(pg);
    if (dir && old) {
      old.classList.add(dir > 0 ? 'flip-out' : 'flip-in');
      setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 360);
    } else if (old) {
      old.parentNode.removeChild(old);
    }
    pg.classList.add(dir && dir < 0 ? 'flip-in' : 'flip-in');
    $('rn-idx').textContent = (idx + 1) + ' / ' + pages.length;
    $('rn-prev').disabled = idx <= 0;
    $('rn-next').disabled = idx >= pages.length - 1;
    bindPage(pg);
  }

  function turn(d) {
    if (busy) return;
    var n = idx + d;
    if (n < 0 || n > pages.length - 1) return;
    busy = true;
    idx = n;
    showPage(d);
    setTimeout(function () { busy = false; }, 360);
  }

  /* ---------- 页内交互 ---------- */
  function bindPage(pg) {
    var b;
    b = pg.querySelector('#addProj');  if (b) b.onclick = addProject;
    b = pg.querySelector('#addPhoto'); if (b) b.onclick = addPhoto;
    b = pg.querySelector('#addVoice'); if (b) b.onclick = addVoice;
    pg.querySelectorAll('[data-act=\'note\']').forEach(function (el) {
      el.onclick = function () { editNote(parseInt(el.dataset.i, 10)); };
    });
    pg.querySelectorAll('[data-act=\'play\']').forEach(function (el) {
      el.onclick = function () { playVoice(parseInt(el.dataset.i, 10)); };
    });
    pg.querySelectorAll('[data-act=\'again\']').forEach(function (el) {
      el.onclick = function () {
        pages = pagesOf(cur);
        if (idx > pages.length - 1) idx = pages.length - 1;
        showPage(0);
      };
    });
    pg.querySelectorAll('[data-act=\'delphoto\']').forEach(function (el) {
      el.onclick = function () { delPhoto(parseInt(el.dataset.i, 10)); };
    });
    pg.querySelectorAll('[data-act=\'dblimg\']').forEach(function (el) {
      var t = 0;
      el.onclick = function () {
        if (t) { clearTimeout(t); t = 0; delPhoto(parseInt(el.dataset.i, 10)); return; }
        t = setTimeout(function () { t = 0; }, 300);
      };
    });
    pg.querySelectorAll('[data-act=\'godiary\']').forEach(function (el) {
      el.onclick = function () {
        closeReader();
        setTimeout(goDiary, 120);
      };
    });
  }

  function delPhoto(i) {
    var list = Store.get('photos', []);
    if (!list[i]) return;
    if (!confirm('删掉第 ' + (i + 1) + ' 张？背面的字也一起没。')) return;
    list.splice(i, 1);
    Store.set('photos', list);
    pages = pagesOf(cur);
    idx = Math.min(1 + i * 2, pages.length - 1);
    if (idx < 0) idx = 0;
    showPage(0);
  }

  function refresh() {
    pages = pagesOf(cur);
    if (idx > pages.length - 1) idx = pages.length - 1;
    if (idx < 0) idx = 0;
    showPage(0);
  }

  function addProject() {
    var txt = prompt('项目笔记（第一行当标题）：');
    if (!txt) return;
    var lines = txt.split('\n');
    var title = (lines[0] || '未命名').slice(0, 24);
    var body = lines.slice(1).join('\n');
    var list = Store.get('ShelfProjects', []);
    list.unshift({ title: title, body: body, time: stamp() });
    Store.set('ShelfProjects', list);
    idx = 1;
    refresh();
  }

  function pickFile(accept, cb) {
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = accept;
    inp.onchange = function () {
      var f = inp.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () { cb(r.result, f.name); };
      r.readAsDataURL(f);
    };
    inp.click();
  }

  function addPhoto() {
    pickFile('image/*', function (src) {
      var list = Store.get('photos', []);
      list.push({ src: src, note: '' });
      Store.set('photos', list);
      idx = 1 + (list.length - 1) * 2;
      refresh();
    });
  }

  function addVoice() {
    pickFile('audio/*', function (src, name) {
      var list = Store.get('ShelfVoices', []);
      list.unshift({ src: src, title: (name || '语音').replace(/\.[^.]+$/, ''), time: stamp() });
      Store.set('ShelfVoices', list);
      idx = 1;
      refresh();
    });
  }

  function importBook() {
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.txt,.md,.text,text/plain';
    inp.onchange = function () {
      var f = inp.files[0];
      if (!f) return;
      if (/\.epub$/i.test(f.name)) {
        alert('epub 暂时读不了，先转成 txt 或 md 再给我。');
        return;
      }
      var r = new FileReader();
      r.onerror = function () { alert('这个文件读不出来。'); };
      r.onload = function () {
        var text = String(r.result || '').replace(/\r\n/g, '\n');
        var nm = f.name.replace(/\.[^.]+$/, '').slice(0, 12);
        var size = 900;
        var pgs = [];
        for (var i = 0; i < text.length; i += size) pgs.push(text.slice(i, i + size));
        if (!pgs.length) pgs = ['（这本是空的）'];
        var list = Store.get('ShelfBooks', []);
        list.push({ id: 'bk' + Date.now(), name: nm, en: 'BOOK', pages: pgs });
        Store.set('ShelfBooks', list);
        alert('《' + nm + '》放上书架了，共 ' + pgs.length + ' 页。');
        renderShelf();
      };
      r.readAsText(f, 'utf-8');
    };
    inp.click();
  }

  function editNote(i) {
    var list = Store.get('photos', []);
    var p = list[i];
    if (!p) return;
    if (typeof p === 'string') { p = { src: p, note: '' }; list[i] = p; }
    var t = prompt('写在背面：', p.note || '');
    if (t === null) return;
    p.note = t;
    Store.set('photos', list);
    refresh();
  }

  function playVoice(i) {
    var v = Store.get('ShelfVoices', [])[i];
    if (!v || !v.src) return;
    try { new Audio(v.src).play(); } catch (e) {}
  }

  /* ---------- 开合 ---------- */
  function goDiary() {
    var nav = document.querySelector('.side-nav .nav-item[data-page=\'diary\']');
    if (nav) nav.click();
  }

  function openBook(id) {
    mountReader();
    var b = byId(id);
    cur = id;
    pages = pagesOf(id);
    idx = 0;
    if (!pages.length) return;
    $('rt-title').textContent = b ? b.name : '';
    showPage(0);
    $('reader').classList.add('open');
  }

  function closeReader() {
    var r = $('reader');
    if (r) r.classList.remove('open');
    cur = null;
    pages = [];
    idx = 0;
  }

  /* ---------- 状态 ---------- */
  var cur = null;
  var pages = [];
  var idx = 0;
  var busy = false;

  /* ---------- 启动 ---------- */
  function init() {
    try { pageTitles.shelf = '书架'; } catch (e) {}
    var nav = document.querySelector('.side-nav .nav-item[data-page=\'shelf\']');
    if (nav) {
      nav.addEventListener('click', function () {
        setTimeout(function () {
          try { $('top-title').textContent = '书架'; } catch (e) {}
          renderShelf();
        }, 0);
      });
    }
    renderShelf();
    if (location.hash === '#shelf') {
      var n2 = document.querySelector('.side-nav .nav-item[data-page=\'shelf\']');
      if (n2) n2.click();
    }
    var pg = location.hash.slice(1).split('@')[0].split('-')[0];
    if (['chat', 'diary', 'calendar', 'notes', 'memory', 'bro', 'tools', 'settings'].indexOf(pg) >= 0) {
      var n5 = document.querySelector('.side-nav .nav-item[data-page=\'' + pg + '\']');
      if (n5) n5.click();
    }
    if (location.hash.indexOf('#book-') === 0) {
      var n3 = document.querySelector('.side-nav .nav-item[data-page=\'shelf\']');
      if (n3) n3.click();
      setTimeout(function () { openBook(location.hash.slice(6).split('@')[0]); }, 60);
    }
    if (location.hash.indexOf('@') > 0) {
      var n4 = parseInt(location.hash.split('@')[1], 10);
      setTimeout(function () {
        if (!isNaN(n4) && pages[n4]) { idx = n4; showPage(0); }
      }, 220);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.HearthShelf = { books: BOOKS, open: openBook, render: renderShelf, close: closeReader };
})();
