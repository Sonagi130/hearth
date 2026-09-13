/* ============ 壁炉 · 语音仓库（IndexedDB） ============
   语音不再塞进 localStorage，改存这里。localStorage 只有几 MB，
   一条录音就能吃掉一大块，满了连聊天记录都存不进去。 */

window.VStore = (function () {
  'use strict';

  var DB = 'hearth-v1';
  var STORE = 'blobs';
  var dbp = null;

  function open() {
    if (dbp) return dbp;
    dbp = new Promise(function (ok, no) {
      if (!window.indexedDB) { no(new Error('NO_IDB')); return; }
      var r = indexedDB.open(DB, 1);
      r.onupgradeneeded = function () {
        var d = r.result;
        if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE);
      };
      r.onsuccess = function () { ok(r.result); };
      r.onerror = function () { no(r.error); };
    });
    return dbp;
  }

  function put(key, blob) {
    return open().then(function (d) {
      return new Promise(function (ok, no) {
        var t = d.transaction(STORE, 'readwrite');
        t.objectStore(STORE).put(blob, key);
        t.oncomplete = function () { ok(key); };
        t.onerror = function () { no(t.error); };
      });
    });
  }

  function get(key) {
    return open().then(function (d) {
      return new Promise(function (ok, no) {
        var t = d.transaction(STORE, 'readonly');
        var q = t.objectStore(STORE).get(key);
        q.onsuccess = function () { ok(q.result || null); };
        q.onerror = function () { no(q.error); };
      });
    });
  }

  function del(key) {
    return open().then(function (d) {
      return new Promise(function (ok) {
        var t = d.transaction(STORE, 'readwrite');
        t.objectStore(STORE)['delete'](key);
        t.oncomplete = function () { ok(key); };
      });
    });
  }

  /* 把一条 __AUD__ 的消息内容变成能播的 URL */
  function resolve(token) {
    var body = String(token || '').slice(7);
    if (body.indexOf('idb:') === 0) {
      return get(body.slice(4)).then(function (b) {
        if (!b) throw new Error('语音文件找不到了');
        return URL.createObjectURL(b);
      });
    }
    return Promise.resolve(body);
  }

  return { put: put, get: get, del: del, resolve: resolve };
})();