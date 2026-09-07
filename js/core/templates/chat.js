(function (global) {
  'use strict';
  if (global.__hshsTplChat) return;
  global.__hshsTplChat = true;
  var html = `
<main class="hshs-chat-page msg" id="hshsChatPage" data-theme="campus" aria-label="Messages">
  <div id="hshsChatBanner" class="hshs-chat-banner" hidden></div>

  <!-- LIST -->
  <section class="msg-list-view" id="hshsChatListView">
    <header class="msg-hero">
      <div class="msg-hero-top">
        <div class="msg-list-brand">
          <span class="msg-crest" aria-hidden="true"><i class="fas fa-shield-halved"></i></span>
          <div class="msg-hero-titles">
            <h1>Messages</h1>
            <p>Stay connected, always. 🚀</p>
          </div>
        </div>
        <div class="msg-list-actions">
          <button type="button" class="msg-icon-btn msg-compose-top" id="hshsComposeTop" aria-label="New message"><i class="fas fa-pen-to-square"></i></button>
          <button type="button" class="msg-icon-btn msg-more-btn" id="hshsListMore" aria-label="More"><i class="fas fa-ellipsis-vertical"></i></button>
        </div>
      </div>
      <div class="msg-search" role="search">
        <span class="msg-search-icon" aria-hidden="true"><i class="fas fa-magnifying-glass"></i></span>
        <input type="search" id="hshsChatSearch" placeholder="Search conversations..." autocomplete="off" enterkeyhint="search">
        <button type="button" class="msg-search-clear" id="hshsSearchClear" hidden aria-label="Clear search"><i class="fas fa-xmark"></i></button>
      </div>
    </header>
    <div class="msg-list-scroll" id="hshsChatList"><div class="hshs-chat-empty">Loading chats…</div></div>
    <button type="button" class="msg-fab-compose" id="hshsComposeFab" aria-label="New chat"><i class="fas fa-pen-to-square"></i></button>
  </section>

  <!-- THREAD -->
  <section class="msg-thread-view" id="hshsThread" hidden>
    <div class="hshs-thread-head">
      <button type="button" class="hshs-thread-back" id="hshsThreadBack" aria-label="Back"><i class="fas fa-chevron-left"></i></button>
      <div class="hshs-thread-avatar-wrap">
        <div class="hshs-thread-avatar" id="hshsThreadAvatar">?</div>
        <i class="msg-online-dot" id="hshsThreadOnline" hidden></i>
      </div>
      <div class="hshs-thread-who">
        <strong id="hshsThreadName">Chat</strong>
        <em id="hshsThreadHandle">@user</em>
        <small id="hshsThreadMeta">Campus</small>
      </div>
      <button type="button" class="hshs-thread-more" id="hshsThreadMore" aria-label="More"><i class="fas fa-ellipsis-vertical"></i></button>
    </div>

    <div class="hshs-thread-stage" id="hshsThreadStage">
      <div class="msg-watermark" aria-hidden="true">
        <span class="wm-script left">Good Students<br>Brighter<br>Tomorrows</span>
        <span class="wm-script right">More Than<br>A School</span>
        <span class="wm-side">CAPTURE<br>CONNECT<br>BELONG</span>
      </div>

      <div class="hshs-thread-welcome" id="hshsThreadWelcome" hidden>
        <div class="tw-orb"><b id="hshsWelcomeAv">?</b><i class="tw-online"></i><span class="tw-bubble"><i class="fas fa-comment-dots"></i></span></div>
        <h2 id="hshsWelcomeTitle">Say hi 👋</h2>
        <p>Start a conversation, share ideas, photos or just check in. Good vibes make a brighter campus! ✨</p>
        <div class="tw-actions">
          <button type="button" id="hshsSharePhoto"><i class="fas fa-camera"></i> Share a photo</button>
          <button type="button" id="hshsSayHi"><i class="far fa-smile"></i> Say hi</button>
        </div>
      </div>

      <div class="hshs-thread-msgs" id="hshsThreadMsgs" hidden></div>
    </div>

    <!-- default compose -->
    <div class="hshs-compose-wrap" id="hshsComposeWrap">
      <form class="hshs-thread-compose" id="hshsThreadForm" autocomplete="off">
        <button type="button" class="hshs-plus" id="hshsPlusBtn" aria-label="Attach">+</button>
        <div class="hshs-compose-pill">
          <input type="text" id="hshsThreadInput" placeholder="Message..." maxlength="2000" enterkeyhint="send">
        </div>
        <button type="button" class="hshs-compose-icon" id="hshsEmojiBtn" aria-label="Emoji"><i class="far fa-smile"></i></button>
        <button type="button" class="hshs-compose-icon" id="hshsImageBtn" aria-label="Photo"><i class="far fa-image"></i></button>
        <button type="button" class="hshs-compose-icon" id="hshsMicBtn" aria-label="Voice note"><i class="fas fa-microphone"></i></button>
        <button type="submit" class="hshs-fab send" id="hshsSendBtn" aria-label="Send"><i class="fas fa-paper-plane"></i></button>
      </form>
      <input type="file" id="hshsAttachInput" accept="image/*" hidden>
    </div>

    <!-- voice recording bar (replaces compose while recording) -->
    <div class="msg-record-bar" id="hshsRecordBar" hidden>
      <button type="button" class="msg-rec-cancel" id="hshsRecCancel" aria-label="Cancel recording"><i class="fas fa-trash"></i></button>
      <span class="msg-rec-dot" aria-hidden="true"></span>
      <canvas class="msg-wave" id="hshsWaveCanvas" width="200" height="40"></canvas>
      <span class="msg-rec-time" id="hshsRecTime">0:00</span>
      <span class="msg-rec-hint" id="hshsRecHint"><i class="fas fa-chevron-left"></i> Slide left cancel · up send</span>
      <button type="button" class="hshs-fab send msg-rec-send" id="hshsRecSend" aria-label="Send voice"><i class="fas fa-paper-plane"></i></button>
    </div>
  </section>

  <!-- Emoji panel -->
  <div class="msg-emoji-sheet" id="hshsEmojiSheet" hidden>
    <div class="msg-emoji-handle"></div>
    <header class="msg-emoji-head">
      <div>
        <strong>Emoji</strong>
        <p>Add some emotion 😊</p>
      </div>
      <button type="button" id="hshsEmojiClose" class="msg-emoji-close" aria-label="Close"><i class="fas fa-xmark"></i></button>
    </header>
    <div class="msg-emoji-search"><i class="fas fa-search"></i><input type="search" id="hshsEmojiSearch" placeholder="Search emoji..." autocomplete="off"></div>
    <div class="msg-emoji-tabs" id="hshsEmojiTabs"></div>
    <div class="msg-emoji-body" id="hshsEmojiBody"></div>
    <div class="msg-emoji-dock" id="hshsEmojiDock"></div>
  </div>
</main>`;
  global.HshsTemplates = global.HshsTemplates || {};
  global.HshsTemplates.chat = html;
})(typeof window !== 'undefined' ? window : this);
