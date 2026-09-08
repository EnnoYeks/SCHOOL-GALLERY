(function (g) {
  'use strict';
  if (g.__hshsChatAttach) return;
  g.__hshsChatAttach = true;

  function boot() {
    if (!g.HshsMessagesUi) return;
    if (g.HshsMessagesUi.boot) g.HshsMessagesUi.boot();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  document.addEventListener('hshs:page', boot);
  g.HshsChatAttach = {
    boot: boot,
    close: function () { if (g.HshsMessagesUi && g.HshsMessagesUi.closeAttach) g.HshsMessagesUi.closeAttach(); },
    open: function () { if (g.HshsMessagesUi && g.HshsMessagesUi.openAttach) g.HshsMessagesUi.openAttach(); }
  };
})(typeof window !== 'undefined' ? window : this);
