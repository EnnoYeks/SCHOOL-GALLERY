(function (g) {
  'use strict';
  g.HshsTemplates = g.HshsTemplates || {};
  g.HshsTemplates.chat = `
<main class="hshs-chat-page" id="hshsChatPage" aria-label="Messages">
  <div class="msg-hero">
    <div class="msg-hero-top">
      <a class="hshs-back" href="more.html" aria-label="Back to More"><i class="fas fa-chevron-left"></i></a>
      <div class="msg-hero-titles">
        <h1>Messages</h1>
        <p>Connecting…</p>
      </div>
      <button type="button" class="msg-compose-btn" id="hshsComposeTop" aria-label="New message"><i class="fas fa-pen-to-square"></i></button>
    </div>
    <div class="msg-banner" id="hshsChatBanner" hidden></div>
  </div>

  <form class="msg-search" id="hshsChatSearchForm" role="search" autocomplete="off">
    <i class="fas fa-magnifying-glass" aria-hidden="true"></i>
    <input id="hshsChatSearch" type="search" placeholder="Search or start a new chat" enterkeyhint="search" aria-label="Search messages">
    <button type="button" class="msg-search-clear" id="hshsSearchClear" hidden aria-label="Clear search"><i class="fas fa-xmark"></i></button>
  </form>

  <div class="msg-filters" id="hshsChatFilters" aria-label="Filters">
    <button type="button" class="msg-filter-chip is-on" data-filter="all">All</button>
    <button type="button" class="msg-filter-chip" data-filter="unread">Unread</button>
    <button type="button" class="msg-filter-chip" data-filter="groups">Groups</button>
  </div>

  <div class="msg-list-view" id="hshsChatListView">
    <div class="msg-list-scroll" id="hshsChatList"></div>
  </div>

  <section class="msg-thread-view" id="hshsThread" hidden aria-label="Conversation">
    <header class="msg-thread-head">
      <button type="button" class="msg-thread-back" id="hshsThreadBack" aria-label="Back to messages"><i class="fas fa-arrow-left"></i></button>
      <a class="msg-thread-id" id="hshsThreadProfileLink" href="#">
        <span class="msg-thread-avatar-wrap">
          <span class="msg-thread-avatar" id="hshsThreadAvatar"></span>
          <i class="msg-online-dot" id="hshsThreadOnline" hidden></i>
        </span>
        <span class="msg-thread-who">
          <strong id="hshsThreadName">HSHS Student</strong>
          <small id="hshsThreadMeta">Offline</small>
        </span>
      </a>
      <button type="button" class="msg-thread-menu" id="hshsThreadMenu" aria-label="Conversation options"><i class="fas fa-ellipsis-vertical"></i></button>
    </header>

    <div class="msg-thread-body" id="hshsThreadMsgs" hidden></div>
    <div class="msg-thread-welcome" id="hshsThreadWelcome" hidden>
      <i class="fas fa-comment-dots"></i>
      <p>No messages yet. Say hi.</p>
      <button type="button" class="msg-wave-btn" id="hshsSayHi">Wave hello</button>
    </div>

    <form class="msg-input-bar" id="hshsThreadForm" autocomplete="off">
      <button type="button" class="msg-emoji-btn" id="hshsEmojiBtn" aria-label="Emoji"><i class="fas fa-face-smile"></i></button>
      <input id="hshsThreadInput" type="text" maxlength="2000" placeholder="Message" enterkeyhint="send" aria-label="Message">
      <button type="submit" class="msg-send-btn" id="hshsSendBtn" aria-label="Send message"><i class="fas fa-paper-plane"></i></button>
      <div class="msg-emoji-sheet" id="hshsEmojiSheet" hidden></div>
    </form>
  </section>

  <div class="msg-compose-sheet" id="hshsComposeSheet" hidden aria-label="New message">
    <div class="msg-compose-backdrop" id="hshsComposeBackdrop"></div>
    <div class="msg-compose-panel">
      <div class="msg-compose-head">
        <strong>New message</strong>
        <button type="button" class="msg-compose-close" id="hshsComposeClose" aria-label="Close"><i class="fas fa-xmark"></i></button>
      </div>
      <div class="msg-compose-search">
        <i class="fas fa-magnifying-glass" aria-hidden="true"></i>
        <input id="hshsComposeSearch" type="search" placeholder="Search classmates" aria-label="Search classmates" autocomplete="off">
      </div>
      <div class="msg-compose-results" id="hshsComposeResults"></div>
    </div>
  </div>
</main>`;
})(typeof window !== 'undefined' ? window : this);
