(function (g) {
  'use strict';
  if (g.__hshsChatAttach) return;
  g.__hshsChatAttach = true;

  function $(id) { return document.getElementById(id); }

  function toast(msg) {
    var el = $('hshsChatToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'hshsChatToast';
      el.className = 'hshs-chat-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg || 'Coming soon';
    el.classList.add('is-on');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove('is-on'); }, 1600);
  }

  function closeAttach() {
    var sheet = $('hshsAttachSheet');
    if (sheet) { sheet.hidden = true; sheet.classList.remove('is-open'); }
    var page = $('hshsChatPage');
    if (page) page.classList.remove('is-attach');
    var plus = $('hshsPlusBtn');
    if (plus) plus.classList.remove('is-on');
  }
  function openAttach() {
    if (g.HshsChatPacks && g.HshsChatPacks.close) g.HshsChatPacks.close();
    var sheet = $('hshsAttachSheet');
    if (sheet) { sheet.hidden = false; sheet.classList.add('is-open'); }
    var page = $('hshsChatPage');
    if (page) page.classList.add('is-attach');
    var plus = $('hshsPlusBtn');
    if (plus) plus.classList.add('is-on');
  }
  function toggleAttach() {
    var sheet = $('hshsAttachSheet');
    if (sheet && !sheet.hidden) closeAttach();
    else openAttach();
  }

  function fmtSize(n) {
    n = Number(n) || 0;
    if (n < 1024) return n + ' B';
    if (n < 1048576) return Math.round(n / 1024) + ' KB';
    return (n / 1048576).toFixed(1) + ' MB';
  }

  function sendFile(f, forceKind) {
    if (!f) return;
    var typ = (f.type || '');
    var kind = forceKind || (typ.indexOf('image/') === 0 ? 'photo' : typ.indexOf('video/') === 0 ? 'video' : 'file');
    var extra = { kind: kind, fileName: f.name, fileMeta: fmtSize(f.size) };
    var MAX = 1800000;
    function go(src) {
      if (src) extra.src = src;
      if (g.HshsMessagesUi && g.HshsMessagesUi.appendMine) {
        g.HshsMessagesUi.appendMine(f.name, extra);
        return;
      }
      var box = $('hshsThreadMsgs');
      var welcome = $('hshsThreadWelcome');
      if (welcome) welcome.hidden = true;
      if (box) {
        box.hidden = false;
        var inner = '';
        if (kind === 'photo' && src) inner = '<div class="hshs-bubble-media"><img src="' + src + '" alt="Photo"><div class="hshs-bubble-text">' + f.name + '</div></div>';
        else if (kind === 'video') inner = '<div class="hshs-bubble-media">' + (src ? '<video controls preload="metadata" src="' + src + '"></video>' : '') + '<div class="hshs-bubble-text">' + f.name + '</div></div>';
        else inner = '<div class="hshs-file-chip"><i class="fas fa-file-lines"></i><span><b>' + f.name + '</b><small>' + extra.fileMeta + '</small></span></div>';
        var row = document.createElement('div');
        row.className = 'hshs-row mine';
        row.innerHTML = '<div class="hshs-bubble mine">' + inner + '</div>';
        box.appendChild(row);
        box.scrollTop = box.scrollHeight;
      }
    }
    if (kind === 'file') { go(''); toast('Document attached'); return; }
    if (f.size > MAX) {
      var url = '';
      try { url = URL.createObjectURL(f); } catch (e) {}
      go(url);
      return;
    }
    var reader = new FileReader();
    reader.onload = function () { go(reader.result); };
    reader.readAsDataURL(f);
  }

  function pick(id) {
    var el = $(id);
    if (el) el.click();
  }

  function wireInputs() {
    [
      ['hshsAttachInput', 'photo'],
      ['hshsAttachGallery', 'photo'],
      ['hshsAttachCamera', 'photo'],
      ['hshsAttachVideo', 'video'],
      ['hshsAttachRecVideo', 'video'],
      ['hshsAttachDoc', 'file'],
      ['hshsAttachPdf', 'file']
    ].forEach(function (pair) {
      var el = $(pair[0]);
      if (!el || el.dataset.attachBound) return;
      el.dataset.attachBound = '1';
      el.addEventListener('change', function () {
        if (!el.files || !el.files[0]) return;
        sendFile(el.files[0], pair[1]);
        el.value = '';
      });
    });
  }

  function wire() {
    if (!$('hshsChatPage')) return;
    wireInputs();
    var plus = $('hshsPlusBtn');
    if (plus && !plus.dataset.attachBound) {
      plus.dataset.attachBound = '1';
      plus.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        toggleAttach();
      }, true);
    }
    var sheet = $('hshsAttachSheet');
    if (sheet && !sheet.dataset.attachBound) {
      sheet.dataset.attachBound = '1';
      sheet.addEventListener('click', function (e) {
        var b = e.target.closest('[data-attach]');
        if (!b) return;
        var mode = b.getAttribute('data-attach');
        closeAttach();
        if (mode === 'gallery') pick('hshsAttachGallery');
        else if (mode === 'video') pick('hshsAttachVideo');
        else if (mode === 'camera') pick('hshsAttachCamera');
        else if (mode === 'record') pick('hshsAttachRecVideo');
        else if (mode === 'document') pick('hshsAttachDoc');
        else if (mode === 'pdf') pick('hshsAttachPdf');
      });
    }
    var imageBtn = $('hshsImageBtn');
    if (imageBtn && !imageBtn.dataset.attachBound) {
      imageBtn.dataset.attachBound = '1';
      imageBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        closeAttach();
        pick('hshsAttachGallery');
      }, true);
    }
    var page = $('hshsChatPage');
    if (page && !page.dataset.attachDismiss) {
      page.dataset.attachDismiss = '1';
      page.addEventListener('click', function (e) {
        if (e.target.closest('#hshsPlusBtn, #hshsAttachSheet')) return;
        if ($('hshsAttachSheet') && !$('hshsAttachSheet').hidden) closeAttach();
      });
    }
  }

  function boot() {
    wire();
    setTimeout(wire, 220);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  document.addEventListener('hshs:page', boot);
  g.HshsChatAttach = { boot: boot, close: closeAttach, open: openAttach };
})(typeof window !== 'undefined' ? window : this);
