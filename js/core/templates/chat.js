(function (global) {
  'use strict';
  var html = '<main id="hshsChatBlank" class="hshs-chat-blank-canvas" aria-label="Chat"></main>';
  global.__hshsTplChat = true;
  global.HshsTemplates = global.HshsTemplates || {};
  global.HshsTemplates.chat = html;
})(typeof window !== 'undefined' ? window : this);
