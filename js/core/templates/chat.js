(function (global) {
  'use strict';
  global.HshsTemplates = global.HshsTemplates || {};
  global.HshsTemplates.chat = `
    <main class="hshs-chat-page msg" id="hshsChatPage" data-theme="ocean" data-bubbles="rounded" aria-label="Messages">
      <div id="hshsChatBanner" class="hshs-chat-banner" hidden></div>
      <div class="hshs-chat-layout">
        <aside class="hshs-chat-side" id="hshsChatSide">
          <header class="msg-appbar">
            <div class="msg-brand"><span>♚</span><strong>HSHS</strong><small>SCHOOL GALLERY</small></div>
            <p class="msg-tag">More Than A School</p>
            <button type="button" class="msg-ico" aria-label="Search"><i class="fas fa-magnifying-glass"></i></button>
            <button type="button" class="msg-ico" aria-label="New chat"><i class="fas fa-pen-to-square"></i></button>
          </header>
          <div class="msg-hero"><h1>Messages</h1><p>Connect • Chat • Share • Belong</p></div>
          <div class="hshs-chat-search msg-search"><i class="fas fa-search"></i><input type="search" id="hshsChatSearch" placeholder="Search conversations..." autocomplete="off"></div>
          <div class="msg-notes" id="hshsChatNotes"></div>
          <div class="msg-chips" id="hshsChatChips">
            <button type="button" class="on" data-chip="all">All</button>
            <button type="button" data-chip="unread">Unread <em>3</em></button>
            <button type="button" data-chip="groups">Groups</button>
            <button type="button" data-chip="requests">Requests</button>
          </div>
          <div class="hshs-side-actions" hidden>
            <select id="hshsThemeSelect" aria-label="Chat theme"><option value="ocean">Ocean</option><option value="grape">Grape</option></select>
            <span class="hshs-chat-me" id="hshsChatMe">You</span>
          </div>
          <div class="hshs-chat-list" id="hshsChatList"><div class="hshs-chat-empty">Loading chats…</div></div>
        </aside>
        <section class="hshs-chat-main" id="hshsChatMain">
          <div class="hshs-chat-empty-main" id="hshsChatEmptyMain"><h2>HSHS Messages</h2><p>Pick a conversation to start chatting.</p></div>
          <div class="hshs-thread" id="hshsThread" hidden>
            <div class="hshs-thread-head">
              <button type="button" class="hshs-thread-back" id="hshsThreadBack" aria-label="Back"><i class="fas fa-arrow-left"></i></button>
              <div class="hshs-thread-avatar" id="hshsThreadAvatar">?</div>
              <div class="hshs-thread-who"><strong id="hshsThreadName">Contact</strong><small id="hshsThreadMeta">tap for info</small></div>
              <div class="hshs-thread-tools">
                <button type="button" class="hshs-head-icon" aria-label="Voice call"><i class="fas fa-phone"></i></button>
                <button type="button" class="hshs-head-icon" aria-label="Video call"><i class="fas fa-video"></i></button>
                <button type="button" class="hshs-head-icon" aria-label="More"><i class="fas fa-ellipsis-vertical"></i></button>
              </div>
            </div>
            <div class="msg-thread-cover" id="hshsThreadCover"></div>
            <div class="hshs-thread-msgs" id="hshsThreadMsgs"></div>
            <div class="hshs-attach-preview" id="hshsAttachPreview"><img src="" alt=""><button type="button" id="hshsClearAttach" aria-label="Remove">×</button></div>
            <div class="hshs-emoji-sheet" id="hshsEmojiPanel" hidden></div>
            <div class="hshs-compose-wrap" id="hshsComposeWrap">
              <div class="hshs-rec-bar" id="hshsRecBar" hidden><span class="hshs-rec-dot"></span><span class="hshs-rec-timer" id="hshsRecTimer">0:00</span><span class="hshs-rec-slide" id="hshsRecSlide">Slide to cancel</span><button type="button" class="hshs-rec-trash" id="hshsRecCancel" aria-label="Cancel recording"><i class="fas fa-trash"></i></button></div>
              <form class="hshs-thread-compose" id="hshsThreadForm">
                <button type="button" class="msg-plus" aria-label="Add">+</button>
                <div class="hshs-compose-pill"><input type="text" id="hshsThreadInput" placeholder="Type a message..." maxlength="800" autocomplete="off"><button type="button" class="hshs-compose-icon" id="hshsEmojiBtn" aria-label="Emoji"><i class="far fa-face-smile"></i></button><button type="button" class="hshs-compose-icon" id="hshsAttachBtn" aria-label="Photo"><i class="fas fa-image"></i></button></div>
                <button type="button" class="hshs-fab" id="hshsVoiceBtn" aria-label="Voice note"><i class="fas fa-microphone"></i></button>
                <button type="submit" class="hshs-fab" id="hshsSendBtn" hidden aria-label="Send"><i class="fas fa-paper-plane"></i></button>
                <input type="file" id="hshsAttachInput" accept="image/*" hidden>
                <input type="file" id="hshsCameraInput" accept="image/*" capture="environment" hidden>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>`;
})(typeof window !== 'undefined' ? window : this);
