(function (global) {
  'use strict';
  global.HshsTemplates = global.HshsTemplates || {};
  global.HshsTemplates.chat = `
    <main class="hshs-chat-page msg" id="hshsChatPage" data-theme="ocean" data-bubbles="rounded" aria-label="Messages">
      <div id="hshsChatBanner" class="hshs-chat-banner" hidden></div>
      <div class="hshs-chat-layout">
        <aside class="hshs-chat-side" id="hshsChatSide">
          <div class="msg-hero"><h1>Messages</h1><p>Campus chats and class groups</p></div>
          <div class="hshs-chat-search msg-search"><i class="fas fa-search"></i><input type="search" id="hshsChatSearch" placeholder="Search conversations" autocomplete="off"></div>
          <div class="msg-notes" id="hshsChatNotes"></div>
          <div class="msg-chips" id="hshsChatChips">
            <button type="button" class="on" data-chip="all">All</button>
            <button type="button" data-chip="unread">Unread</button>
            <button type="button" data-chip="groups">Groups</button>
          </div>
          <div class="hshs-side-actions" hidden>
            <select id="hshsThemeSelect" aria-label="Chat theme"><option value="ocean">Ocean</option></select>
            <span class="hshs-chat-me" id="hshsChatMe">You</span>
          </div>
          <div class="hshs-chat-list" id="hshsChatList"><div class="hshs-chat-empty">Loading chats…</div></div>
        </aside>
        <section class="hshs-chat-main" id="hshsChatMain">
          <div class="hshs-chat-empty-main" id="hshsChatEmptyMain"><h2>Pick a chat</h2><p>Open a classmate or group to start messaging.</p></div>
          <div class="hshs-thread" id="hshsThread" hidden>
            <div class="hshs-thread-head">
              <button type="button" class="hshs-thread-back" id="hshsThreadBack" aria-label="Back"><i class="fas fa-chevron-left"></i></button>
              <div class="hshs-thread-avatar" id="hshsThreadAvatar">?</div>
              <div class="hshs-thread-who">
                <strong id="hshsThreadName">Contact</strong>
                <em id="hshsThreadHandle">@user</em>
                <small id="hshsThreadMeta">Online now</small>
              </div>
              <button type="button" class="hshs-thread-more" id="hshsThreadMore" aria-label="More"><i class="fas fa-ellipsis-vertical"></i></button>
            </div>
            <div class="hshs-thread-stage">
              <div class="hshs-thread-welcome" id="hshsThreadWelcome">
                <div class="tw-mark" aria-hidden="true">HSHS</div>
                <p class="tw-script" aria-hidden="true">More Than A School</p>
                <div class="tw-orb">
                  <b id="hshsWelcomeAvatar">BK</b>
                  <i class="tw-online" aria-hidden="true"></i>
                  <span class="tw-bubble"><i class="fas fa-comment-dots"></i></span>
                </div>
                <h2>Say hi to <span id="hshsWelcomeName">Brian</span> 👋</h2>
                <p>Start a conversation, share ideas, photos or just check in. Good vibes make a brighter campus! ✨</p>
                <div class="tw-actions">
                  <button type="button" id="hshsSharePhoto"><i class="fas fa-camera"></i> Share a photo</button>
                  <button type="button" id="hshsSayHi"><i class="far fa-face-smile"></i> Say hi</button>
                </div>
                <small class="tw-kicker">Capture · Connect · Belong</small>
              </div>
              <div class="hshs-thread-msgs" id="hshsThreadMsgs" hidden></div>
            </div>
            <div class="hshs-attach-preview" id="hshsAttachPreview"><img src="" alt=""><button type="button" id="hshsClearAttach" aria-label="Remove">×</button></div>
            <div class="hshs-emoji-sheet" id="hshsEmojiPanel" hidden></div>
            <div class="hshs-compose-wrap" id="hshsComposeWrap">
              <div class="hshs-rec-bar" id="hshsRecBar" hidden><span class="hshs-rec-dot"></span><span class="hshs-rec-timer" id="hshsRecTimer">0:00</span><span class="hshs-rec-slide" id="hshsRecSlide">Slide to cancel</span><button type="button" class="hshs-rec-trash" id="hshsRecCancel" aria-label="Cancel recording"><i class="fas fa-trash"></i></button></div>
              <form class="hshs-thread-compose" id="hshsThreadForm">
                <button type="button" class="hshs-plus" id="hshsPlusBtn" aria-label="Add">+</button>
                <div class="hshs-compose-pill"><input type="text" id="hshsThreadInput" placeholder="Message…" maxlength="800" autocomplete="off"><button type="button" class="hshs-compose-icon" id="hshsEmojiBtn" aria-label="Emoji"><i class="far fa-face-smile"></i></button><button type="button" class="hshs-compose-icon" id="hshsAttachBtn" aria-label="Photo"><i class="fas fa-image"></i></button></div>
                <button type="button" class="hshs-fab" id="hshsVoiceBtn" aria-label="Voice note"><i class="fas fa-microphone"></i></button>
                <button type="submit" class="hshs-fab send" id="hshsSendBtn" aria-label="Send"><i class="fas fa-paper-plane"></i></button>
                <input type="file" id="hshsAttachInput" accept="image/*" hidden>
                <input type="file" id="hshsCameraInput" accept="image/*" capture="environment" hidden>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>`;
})(typeof window !== 'undefined' ? window : this);
