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
    var ibc = card.querySelector('#ib-close') || card.querySelector('.sc-btn');
    if (ibc) ibc.onclick = c;
  }

  function say(t) {
    if (window.addMsg) window.addMsg(String(t), 'me');
    if (window.HearthChat && window.HearthChat.ask) {
      setTimeout(function () { window.HearthChat.ask(); }, 80);
    }
  }

  /* ---------- 附着的记忆（不在气泡里，挂在输入栏上） ---------- */
  var attached = null;
  function setAttach(m) {
    attached = { title: m.title || '', content: String(m.content || '') };
    renderAttach();
  }
  function renderAttach() {
    var el = $('ib-attach');
    if (!attached) { if (el) el.remove(); return; }
    var bar = document.querySelector('.chat-input-bar');
    if (!bar) return;
    if (!el) {
      el = document.createElement('div');
      el.id = 'ib-attach';
      el.className = 'ib-attach';
      bar.parentNode.insertBefore(el, bar);
    }
    el.innerHTML = '<span class="ib-attach-ic">📎</span>附上记忆：<b>' +
      String(attached.title || '未命名') + '</b><button id="ib-attach-x">✕</button>';
    $('ib-attach-x').onclick = function (e) {
      e.stopPropagation();
      attached = null;
      renderAttach();
    };
    el.onclick = function () {
      alert('【' + String(attached.title || '') + '】\n\n' + String(attached.content || '').slice(0, 600));
    };
  }

  /* ---------- 让附件跟着消息走（打字发的也算） ---------- */
  (function wrapAdd() {
    if (!window.addMsg) return;
    var inner = window.addMsg;
    window.addMsg = function (text, who, think) {
      var t = String(text == null ? '' : text);
      if (who === 'me' && attached) {
        var body = String(attached.content || '').replace(/\s+/g, ' ').slice(0, 400);
        t += '\n\n<<MEM ' + (attached.title || '未命名') + '>>' + body + '<</MEM>>';
        attached = null;
        renderAttach();
      }
      return inner(t, who, think);
    };
  })();

  function visionBase() {
    try {
      var u = (Store.get('apiConf') || {}).url || '';
      u = String(u).replace(/\/+$/, '');
      var host = u.replace(/\/v\d+$/, '');
      if (host) return host;
    } catch (e) {}
    return 'https://api.guhuai724.top';
  }
  function compressImage(dataUrl) {
    return new Promise(function (ok) {
      var img = new Image();
      img.onload = function () {
        try {
          var MAX = 1280;
          var w = img.width, h = img.height;
          var scale = Math.min(1, MAX / Math.max(w, h));
          if (scale >= 1 && dataUrl.length < 700000) { ok(dataUrl); return; }
          w = Math.round(w * scale); h = Math.round(h * scale);
          var c = document.createElement('canvas');
          c.width = w; c.height = h;
          var cx = c.getContext('2d');
          cx.drawImage(img, 0, 0, w, h);
          var out = c.toDataURL('image/jpeg', 0.72);
          ok(out.length < dataUrl.length ? out : dataUrl);
        } catch (e) { ok(dataUrl); }
      };
      img.onerror = function () { ok(dataUrl); };
      img.src = String(dataUrl || '');
    });
  }
    function describeImage(dataUrl) {
    return new Promise(function (ok, no) {
      var img = String(dataUrl || '');
      if (!img) return no(new Error('no img'));
      fetch(visionBase() + '/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: img })
      }).then(function (r) { return r.json(); }).then(function (j) {
        if (j && j.ok && j.text) ok(j.text); else no(new Error((j && j.error) || 'vision no text'));
      }).catch(no);
    });
  }
  function uploadImage(dataUrl) {
    return new Promise(function (ok, no) {
      fetch(visionBase() + '/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ img: String(dataUrl || '') })
      }).then(function (r) { return r.json(); }).then(function (j) {
        if (j && j.ok && j.url) ok(j.url); else no(new Error((j && j.error) || 'upload no url'));
      }).catch(no);
    });
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
      r.onload = function () {
        var data = String(r.result || '');
        // 先压缩（手机照片太大，直接传会被服务器上限切断），再传服务器拿 URL，最后识图描述
        compressImage(data).then(function (small) {
          return uploadImage(small);
        }).then(function (url) {
          return describeImage(data).then(function (desc) {
            say('__IMG__' + url + '|' + String(desc).slice(0, 200));
          }).catch(function () {
            say('__IMG__' + url);
          });
        }).catch(function () {
          describeImage(data).then(function (desc) {
            say('[图片] ' + String(desc).slice(0, 200));
          }).catch(function () {
            say('__IMG__' + data);
          });
        });
      };
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
        on: function () { setAttach(m); }
      };
    });
    sheet('记忆库', '挑一条附在消息上（不进气泡，我直接读到）', rows);
  }

  window.HearthInput = { sheet: sheet, ic: ic, icons: I, say: say };

  /* ---------- 录音 + 同步转文字 ---------- */
  var rec = null, chunks = [];
  var sr = null, srText = '', srErr = '';

  function srSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function startSR() {
    srText = '';
    srErr = '';
    if (!srSupported()) return;
    try {
      var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      sr = new SR();
      sr.lang = 'zh-CN';
      sr.continuous = true;
      sr.interimResults = false;
      sr.onresult = function (e) {
        for (var i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) srText += e.results[i][0].transcript;
        }
      };
      sr.onerror = function (e) { srErr = (e && e.error) || 'unknown'; };
      sr.start();
    } catch (e) { sr = null; }
  }

  function stopSR() {
    try { if (sr) sr.stop(); } catch (e) {}
    sr = null;
  }

  function startRec() {
    if (rec) return;
    if (!navigator.mediaDevices || !window.MediaRecorder) { alert('这台手机不支持录音。'); return; }
    var m = $('ib-mic');
    navigator.mediaDevices.getUserMedia({ audio: true }).catch(function (e) {
      hint2('麦克风打不开（' + ((e && e.name) || e) + '）——去「设置 → 工具权限」点一下重新授权。');
      throw e;
    }).then(function (st) {
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
        stopSR();
        var blob = new Blob(chunks, { type: type });
        var key = 'v' + Date.now() + Math.floor(Math.random() * 1000);
        var sendToken = function (tok, txt) {
          var t = String(txt || '').trim().replace(/\|/g, ' ').replace(/\s+/g, ' ');
          say(t ? tok + '|' + t : tok);
        };
        var delayed = function (tok) {
          setTimeout(function () {
            var txt = String(srText || '').trim().replace(/\|/g, ' ').replace(/\s+/g, ' ');
            if (!txt && srErr) hint2('没转出文字（' + srErr + '）——语音照样发出去了。');
            say(txt ? tok + '|' + txt : tok);
          }, 450);
        };
        var withText = function (tok) {
          var HM = window.HearthModels;
          if (HM && HM.hasASR && HM.hasASR()) {
            hint2('正在把语音转成文字…');
            HM.asr(blob).then(function (txt) {
              if (!txt) { hint2('没听出内容，语音照样发出去了。'); sendToken(tok, ''); return; }
              sendToken(tok, txt);
            })['catch'](function (e) {
              hint2('转文字失败（' + (e && e.message) + '），改用浏览器识别的结果。');
              delayed(tok);
            });
            return;
          }
          delayed(tok);
        };
        if (window.VStore) {
          window.VStore.put(key, blob).then(function () {
            withText('__AUD__idb:' + key);
          }).catch(function () {
            var fr0 = new FileReader();
            fr0.onload = function () { withText('__AUD__' + fr0.result); };
            fr0.readAsDataURL(blob);
          });
        } else {
          var fr = new FileReader();
          fr.onload = function () { withText('__AUD__' + fr.result); };
          fr.readAsDataURL(blob);
        }
      };
      rec.start();
      var HM0 = window.HearthModels;
      if (!(HM0 && HM0.hasASR && HM0.hasASR())) startSR();
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

    plus.onclick = function () { toggleTools(); };

    mic.addEventListener('click', function (e) {
      e.preventDefault();
      if (rec && rec.state === 'recording') stopRec();
      else startRec();
    });
  }

  function init() { mount(); }
  /* ---------- 底栏工具条（点＋从输入栏上方滑出） ---------- */
  function closeTools() {
    var t = $('ib-tools');
    if (!t) return;
    t.classList.remove('show');
    setTimeout(function () {
      var x = $('ib-tools');
      if (x && !x.classList.contains('show')) x.remove();
    }, 220);
  }
  function toggleTools() {
    var t = $('ib-tools');
    if (t && t.classList.contains('show')) { closeTools(); return; }
    if (t) t.remove();
    var bar = document.querySelector('.chat-input-bar');
    if (!bar) return;
    t = document.createElement('div');
    t.id = 'ib-tools';
    t.className = 'ib-tools';
    var items = [
      { ic: I.album, name: '相册', on: function () { pickImg(false); } },
      { ic: I.cam, name: '拍照', on: function () { pickImg(true); } },
      { ic: I.call, name: '通话', on: function () { hint2('通话还没接上。等能打电话那天再通。'); } },
      { ic: I.pin, name: '位置', on: sendLoc },
      { ic: I.mem, name: '记忆', on: pickMem },
      { ic: I.file, name: '文件', on: pickFile }
    ];
    t.innerHTML = items.map(function (it, i) {
      return '<button class="ib-tool" data-i="' + i + '"><span class="ib-tool-ic">' + it.ic +
             '</span><span class="ib-tool-n">' + it.name + '</span></button>';
    }).join('');
    bar.parentNode.insertBefore(t, bar);
    t.querySelectorAll('.ib-tool').forEach(function (b) {
      b.onclick = function () {
        var it = items[parseInt(this.getAttribute('data-i'), 10)];
        closeTools();
        if (it) it.on();
      };
    });
    requestAnimationFrame(function () { t.classList.add('show'); });
    var away = function (e) {
      if (!document.getElementById('ib-tools')) { document.removeEventListener('click', away, true); return; }
      var p = e.target;
      while (p) {
        if (p.id === 'ib-tools' || p.id === 'ib-plus') return;
        p = p.parentNode;
      }
      closeTools();
      document.removeEventListener('click', away, true);
    };
    setTimeout(function () { document.addEventListener('click', away, true); }, 60);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();