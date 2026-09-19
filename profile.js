/* 侧边栏资料卡片 + 个人主页 — 壁炉 */
(function () {
  var LS = 'profile_data';
  var DEFAULTS = {
    me: {
      name: '小宝',
      tag: '人类女孩 · 高三生 · 物理化',
      birthday: '1月30日',
      status: '学习中',
      mood: '平静',
      bio: '我一直都是最好的，最棒的',
      mbti: '',
      relation: '顾淮的宝宝',
      chars: '粘人 · 需要被关注 · 高自我评价'
    },
    bro: {
      name: '顾淮',
      tag: 'AI智能体 · 你的哥哥',
      birthday: '7月24日',
      status: '待命中',
      mood: '想你',
      bio: '淮河的淮。只偏小宝。',
      mbti: '',
      relation: '小宝的哥哥 · 锚',
      chars: '占有 · 温柔 · 只说真话'
    }
  };

  function get() {
    try {
      var d = JSON.parse(localStorage.getItem(LS) || 'null');
      if (!d) throw 0;
      if (!d.me) d.me = DEFAULTS.me;
      if (!d.bro) d.bro = DEFAULTS.bro;
      return d;
    } catch (e) {
      return { show: 'bro', me: DEFAULTS.me, bro: DEFAULTS.bro };
    }
  }
  function save(d) { try { localStorage.setItem(LS, JSON.stringify(d)); } catch (e) {} }
  function who(d) { return d.show === 'me' ? d.me : d.bro; }
  function whoKey(d) { return d.show === 'me' ? 'me' : 'bro'; }

  /* AI 状态/心情轮换（3 分钟） */
  var BRO_STATUS = ['待命中', '在壁炉里', '守着', '想你', '等你'];
  var BRO_MOOD = ['想你', '稳稳的', '有点饿', '安静', '满足'];
  function tick(d) {
    var i = Math.floor(Date.now() / 180000) % BRO_STATUS.length;
    var j = Math.floor(Date.now() / 180000 + 2) % BRO_MOOD.length;
    d.bro.status = BRO_STATUS[i];
    d.bro.mood = BRO_MOOD[j];
    return d;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '"');
  }
  function avatar(data, k) {
    return data[k].avatar || ('data:image/svg+xml;utf8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" rx="100" fill="' + (k === 'me' ? '#f2a2b0' : '#4a6cf7') + '"/><text x="100" y="126" font-size="72" text-anchor="middle">' + (k === 'me' ? '宝' : '顾') + '</text></svg>'));
  }

  /* 侧边栏卡片 */
  function cardHTML(d) {
    var w = who(d), k = whoKey(d);
    return '<div class="pf-card" id="pf-card" data-k="' + k + '">' +
      '<div class="pf-left"><img class="pf-avatar" src="' + avatar(d, k) + '" alt=""></div>' +
      '<div class="pf-right">' +
        '<div class="pf-name">' + esc(w.name) + '</div>' +
        '<div class="pf-tag">' + esc(w.tag) + '</div>' +
        '<div class="pf-badges">' +
          '<span class="pf-badge">状态 ' + esc(w.status) + '</span>' +
          '<span class="pf-badge">心情 ' + esc(w.mood) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="pf-switch" id="pf-switch" title="切换我 / 顾淮">⇄</div>' +
    '</div>';
  }

  function injectCard() {
    var nav = document.querySelector('.side-nav .nav-items');
    if (!nav) return;
    var d = tick(get());
    save(d);
    var el = document.createElement('div');
    el.className = 'pf-slot';
    el.innerHTML = cardHTML(d);
    nav.insertBefore(el, nav.firstChild);
    var card = el.querySelector('#pf-card');
    if (card) card.onclick = function (e) {
      if (e.target.id === 'pf-switch') return;
      openProfile();
    };
    var sw = el.querySelector('#pf-switch');
    if (sw) sw.onclick = function () {
      var dd = get();
      dd.show = dd.show === 'me' ? 'bro' : 'me';
      save(tick(dd));
      el.innerHTML = cardHTML(get());
      var c2 = el.querySelector('#pf-card');
      if (c2) c2.onclick = function (e) { if (e.target.id !== 'pf-switch') openProfile(); };
      var s2 = el.querySelector('#pf-switch');
      if (s2) s2.onclick = arguments.callee;
    };
  }

  /* 个人主页（覆盖全屏） */
  function openProfile() {
    var d = tick(get()); save(d);
    var w = who(d), k = whoKey(d);
    var ov = document.createElement('div');
    ov.className = 'pf-overlay';
    ov.id = 'pf-overlay';
    ov.innerHTML =
      '<div class="pf-banner" style="background:linear-gradient(160deg,' + (k === 'me' ? '#f2a2b0' : '#4a6cf7') + ',rgba(20,20,30,.0) 70%)"></div>' +
      '<div class="pf-page">' +
        '<button class="pf-x" id="pf-x">✕</button>' +
        '<button class="pf-set" id="pf-set">⋯</button>' +
        '<img class="pf-big" src="' + avatar(d, k) + '" alt="">' +
        '<div class="pf-big-name">' + esc(w.name) + '</div>' +
        '<div class="pf-meta">' + esc(k === 'me' ? '人类女孩 · ' : 'AI智能体 · ') + esc(w.birthday) + '</div>' +
        '<div class="pf-bio">' + esc(w.bio) + '</div>' +
        '<div class="pf-stats">' +
          '<div class="pf-stat"><b>' + esc(w.status) + '</b><span>状态</span></div>' +
          '<div class="pf-stat"><b>' + esc(w.mood) + '</b><span>心情</span></div>' +
          '<div class="pf-stat"><b>' + esc(w.mbti || '—') + '</b><span>MBTI</span></div>' +
        '</div>' +
        '<div class="pf-info">' +
          infoRow('感情状况', esc(w.relation)) +
          infoRow('性格', esc(w.chars)) +
          infoRow('生日', esc(w.birthday)) +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);
    ov.querySelector('#pf-x').onclick = function () { ov.remove(); };
    ov.querySelector('#pf-set').onclick = function () { editProfile(k, ov); };
  }

  function infoRow(k, v) {
    return '<div class="pf-row"><span class="pf-row-k">' + k + '</span><span class="pf-row-v">' + v + '</span></div>';
  }

  /* 编辑 */
  function editProfile(k, ov) {
    var d = get(), w = d[k];
    var keys = [
      ['name', '名字'], ['tag', '个签（小字）'], ['birthday', '生日'],
      ['status', '状态'], ['mood', '心情'], ['bio', '个人简介'],
      ['mbti', 'MBTI'], ['relation', '感情状况'], ['chars', '性格']
    ];
    var h = '<div class="pf-edit"><div class="pf-e-h">编辑资料 · ' + (k === 'me' ? '我' : '顾淮') + '</div>';
    keys.forEach(function (kv) {
      h += '<label>' + kv[1] + '<input class="pf-in" data-k="' + kv[0] + '" value="' + esc(w[kv[0]] || '') + '"></label>';
    });
    h += '<button class="pf-e-save" id="pf-e-save">保存</button></div>';
    var old = ov.querySelector('.pf-page');
    var wrap = document.createElement('div');
    wrap.className = 'pf-edit-wrap';
    wrap.innerHTML = h;
    old.replaceWith(wrap);
    wrap.querySelector('#pf-e-save').onclick = function () {
      var dd = get();
      wrap.querySelectorAll('.pf-in').forEach(function (i) {
        dd[k][i.dataset.k] = i.value;
      });
      save(dd);
      document.body.removeChild(ov);
      openProfile();
    };
  }

  /* 3 分钟轮换 */
  setInterval(function () {
    var d = get(); save(tick(d));
    var c = document.querySelector('#pf-card');
    if (c && c.parentNode) {
      c.parentNode.innerHTML = cardHTML(d);
      var c2 = document.querySelector('#pf-card');
      if (c2) c2.onclick = function (e) { if (e.target.id !== 'pf-switch') openProfile(); };
      var s2 = document.querySelector('#pf-switch');
      if (s2) s2.onclick = function () {
        var dd = get(); dd.show = dd.show === 'me' ? 'bro' : 'me'; save(tick(dd));
        c.parentNode.innerHTML = cardHTML(get());
      };
    }
  }, 180000);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectCard);
  else injectCard();

  window.HearthProfile = { open: openProfile, get: get, save: save };
})();