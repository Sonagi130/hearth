/* ============ Hearth 输入栏：常用工具 + 语音 ============ */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  function ic(p) {
    return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" ' +
           'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  }

  var I = {
    plus: ic('<path d="M12 5v14"/><path d="M5 12h14"/>'),
    mic: ic('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/>'),
    album: ic('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 16l-5-5L5 20"/>'),
    cam: ic('<path d="M4 8h3l2-2h6l2 2h3v11H4z"/><circle cx="12" cy="13" r="3"/>'),
    call: ic('<path d="M6 3h3l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z"/>'),
    pin: ic('<path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
    mem: ic('<path d="M12 3a6 6 0 0 0-6 6c0 2 1 3.5 2.5 4.5V17h7v-3.5C17 12.5 18 11 18 9a6 6 0 0 0-6-6z"/><path d="M10 21h4"/>'),
    file: ic('<path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z"/><path d="M13 3v6h6"/>')
  };

  function sheet(title, sub, rows) {
    var mask = document.createElement('div');
    mask.className = 'sheet-mask';
    var card = document.createElement('div');
    card.className = 'sheet-card wide';
    card.style.textAlign = 'left';
    card.innerHTML = '<div class="sc-title" style="text-align:center;">' + title + '</div>' +
      (sub ? '<div class="sc-sub" style="text-align:center;">' + sub + '</div>' : '') +
      '<div class="sh-body"></div>' +
      '<div class="sc-row" style="margin-top:14px;"><button class="sc-btn" id="ib-close">关闭</button></div>';
    mask.appendChild(card);
    document.body.appendChild(mask);
    var box = card.querySelector('.sh-body');
    rows.forEach(function (r) {
      var el = document.createElement('div');
      el.className = 'settings-row';
      el.innerHTML = '<div class="sr-left"><span class="sr-icon">' + (r.icon || '') + '</span>' + r.name +
        '</div><span class="arrow">›</span>';
      el.onclick = function () { mask.remove(); r.on(); };
      box.appendChild(el);
    });
    var c = function () { mask.remove(); };
    mask.onclick = function (e) { if (e.target === mask) c(); };
    document.getElementById('ib-close').onclick = c;
  }

  function say(t) {
    if (window.addMsg) window.addMsg(t, 'me');
  }

  function pickImg(camera) {
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    if (camera) inp.capture = 'environment';
    inp.onchange = function () {
      var f = inp.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () { say('__IMG__' + r.result); };
      r.readAsDataURL(f);
    };
    inp.click();
  }

  function pickFile() {
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.onchange = function () {
      var f = inp.files[0];
      if (!f) return;
      say('[文件] ' + f.name + '　' + Math.round(f.size / 1024) + ' KB');
    };
    inp.click();
  }

  function sendLoc() {
    if (!navigator.geolocation) { alert('这台手机不给定位。'); return; }
    navigator.geolocation.getCurrentPosition(function (p) {
      say('[位置] 北纬 ' + p.coords.latitude.toFixed(5) + '，东经 ' + p.coords.longitude.toFixed(5));
    }, function () { alert('定位没拿到，可能要开权限。'); }, { timeout: 8000 });
  }

  function pickMem() {
    var list = Store.get('memories', []);
    if (!list.length) { alert('记忆库还是空的。'); return; }
    var rows = list.slice(0, 40).map(function (m) {
      return {
        icon: I.mem, name: m.title || '（无标题）',
        on: function () { say('[记忆] ' + (m.title || '') + '\n' + String(m.content || '').slice(0, 120)); }
      };
    });
    sheet('记忆库', '挑一条发给他', rows);
  }

  window.HearthInput = { sheet: sheet, ic: ic, icons: I, say: say };

  /* ---------- 录音 ---------- */
  var rec = null, chunks = [];

  function startRec() {
    if (rec) return;
    if (!navigator.mediaDevices || !window.MediaRecorder) { alert('这台手机不支持录音。'); return; }
    var m = $('ib-mic');
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (st) {
      chunks = [];
      try { rec = new MediaRecorder(st, { audioBitsPerSecond: 24000 }); }
      catch (e) { rec = new MediaRecorder(st); }
      rec.startedAt = Date.now();
      rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      rec.maxTimer = setTimeout(function () {
        if (rec && rec.state === 'recording') { hint2('到一分钟了，先发出去。'); rec.stop(); }
      }, 60000);
      rec.onstop = function () {
        var dur = Date.now() - rec.startedAt;
        var type = rec.mimeType || 'audio/webm';
        st.getTracks().forEach(function (t) { t.stop(); });
        hint(false);
        var mm = $('ib-mic');
        if (mm) mm.classList.remove('rec');
        rec = null;
        if (dur < 500) { hint2('太短了。点一下话筒开始，说完再点一下结束。'); return; }
        if (!chunks.length) { hint2('没录到声音。'); return; }
        var blob = new Blob(chunks, { type: type });
        var key = 'v' + Date.now() + Math.floor(Math.random() * 1000);
        if (window.VStore) {
          window.VStore.put(key, blob).then(function () {
            say('__AUD__idb:' + key);
          }).catch(function () {
            var fr0 = new FileReader();
            fr0.onload = function () { say('__AUD__' + fr0.result); };
            fr0.readAsDataURL(blob);
          });
        } else {
          var fr = new FileReader();
          fr.onload = function () { say('__AUD__' + fr.result); };
          fr.readAsDataURL(blob);
        }
      };
      rec.start();
      if (m) m.classList.add('rec');
      hint(true);
    }).catch(function () {
      hint2('麦克风被挡住了。去「设置 → 工具权限管理 → 重新请求麦克风授权」。');
    });
  }

  function stopRec() {
    try { if (rec && rec.state !== 'inactive') rec.stop(); } catch (e) {}
  }

  function hint(on) {
    var el = $('ib-rec');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ib-rec';
      el.className = 'ib-rec';
      document.body.appendChild(el);
    }
    el.textContent = on ? '● 正在录，再点一下话筒结束' : '';
    el.style.display = on ? 'block' : 'none';
  }

  function hint2(t) {
    var el = $('ib-rec');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ib-rec';
      el.className = 'ib-rec';
      document.body.appendChild(el);
    }
    el.textContent = t;
    el.style.display = 'block';
    setTimeout(function () { el.style.display = 'none'; }, 2400);
  }

  /* ---------- 装到输入栏上 ---------- */
  function mount() {
    var bar = document.querySelector('.chat-input-bar');
    if (!bar || bar.dataset.ib) return;
    bar.dataset.ib = '1';

    var plus = document.createElement('button');
    plus.className = 'ib-btn';
    plus.id = 'ib-plus';
    plus.innerHTML = I.plus;
    bar.insertBefore(plus, bar.firstChild);

    var mic = document.createElement('button');
    mic.className = 'ib-btn';
    mic.id = 'ib-mic';
    mic.innerHTML = I.mic;
    bar.insertBefore(mic, $('chat-send'));

    plus.onclick = function () {
      sheet('发点什么', '', [
        { icon: I.album, name: '相册', on: function () { pickImg(false); } },
        { icon: I.cam, name: '拍照', on: function () { pickImg(true); } },
        { icon: I.call, name: '通话', on: function () { alert('通话还没接。等哪天能打电话了，这儿就通了。'); } },
        { icon: I.pin, name: '位置', on: sendLoc },
        { icon: I.mem, name: '记忆', on: pickMem },
        { icon: I.file, name: '文件', on: pickFile }
      ]);
    };

    mic.addEventListener('click', function (e) {
      e.preventDefault();
      if (rec && rec.state === 'recording') stopRec();
      else startRec();
    });
  }

  function init() { mount(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();