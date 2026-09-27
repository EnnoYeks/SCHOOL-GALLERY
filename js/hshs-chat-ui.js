/* HSHS Messages UI — loading real build */
(function (g) {
  'use strict';
  if (g.__hshsChatUi) return;
  g.__hshsChatUi = true;
  g.HshsMessagesUi = {
    boot: function () {},
    openThread: function () {},
    showList: function () {},
    appendMine: function () {},
    setMode: function () {},
    setInbox: function () {},
    applyRemoteThread: function () {},
    setPresenceMap: function () {},
    activeId: function () { return ''; },
    mode: function () { return 'connecting'; }
  };
})(typeof window !== 'undefined' ? window : this);
