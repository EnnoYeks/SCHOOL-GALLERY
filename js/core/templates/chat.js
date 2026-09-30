(function (g) {
  'use strict';
  g.HshsTemplates = g.HshsTemplates || {};
  g.HshsTemplates.chat = `
<main class="hshs-chat-page" id="hshsChatPage" aria-label="HSHS World chat">
  <header class="chat-home-head">
    <div class="chat-brand-row">
      <a class="chat-back" href="more.html" aria-label="Back"><i class="fas fa-chevron-left"></i></a>
      <div class="chat-brand">
        <span class="chat-kicker">HSHS WORLD</span>
        <h1>Chats <span class="chat-live-pulse"></span></h1>
      </div>
      <button type="button" class="chat-new-btn" id="hshsComposeTop" aria-label="New chat"><i class="fas fa-plus"></i></button>
    </div>
    <p class="chat-subtitle">Talk with classmates. Keep it real. 💬</p>
    <div class="chat-banner" id="hshsChatBanner" hidden></div>
  </header>

  <form class="chat-search" id="hshsChatSearchForm" role="search" autocomplete="off">
    <i class="fas fa-magnifying-glass" aria-hidden="true"></i>
    <input id="hshsChatSearch" type="search" placeholder="Search classmates or chats" enterkeyhint="search" aria-label="Search chats">
    <button type="button" id="hshsSearchClear" hidden aria-label="Clear search"><i class="fas fa-xmark"></i></button>
  </form>

  <nav class="chat-filters" id="hshsChatFilters" aria-label="Chat filters">
    <button type="button" class="chat-filter is-on" data-filter="all">All</button>
    <button type="button" class="chat-filter" data-filter="unread">Unread</button>
    <button type="button" class="chat-filter" data-filter="groups">Groups</button>
  </nav>

  <section class="chat-list-view" id="hshsChatListView">
    <div class="chat-list" id="hshsChatList"></div>
  </section>

  <section class="chat-thread" id="hshsThread" hidden aria-label="Conversation">
    <header class="chat-thread-head">
      <button type="button" class="chat-icon-btn" id="hshsThreadBack" aria-label="Back to chats"><i class="fas fa-arrow-left"></i></button>
      <a class="chat-thread-person" id="hshsThreadProfileLink" href="#">
        <span class="chat-thread-avatar-wrap">
          <span class="chat-avatar chat-avatar-lg" id="hshsThreadAvatar"></span>
          <i class="chat-status-dot" id="hshsThreadOnline" hidden></i>
        </span>
        <span class="chat-thread-who">
          <strong id="hshsThreadName">HSHS Student</strong>
          <small id="hshsThreadMeta">Offline</small>
        </span>
      </a>
      <button type="button" class="chat-icon-btn" id="hshsThreadMenu" aria-label="Chat options"><i class="fas fa-ellipsis"></i></button>
    </header>

    <div class="chat-thread-body" id="hshsThreadMsgs" hidden></div>
    <div class="chat-empty-thread" id="hshsThreadWelcome" hidden>
      <div class="chat-empty-orb"><i class="fas fa-comments"></i></div>
      <strong>Start the conversation</strong>
      <p>Say something simple. You never know where the chat goes. 👀</p>
      <button type="button" class="chat-wave-btn" id="hshsSayHi">Say hi 👋</button>
    </div>

    <div class="chat-composer-wrap">
      <div class="chat-quick-row" id="hshsChatQuick">
        <button type="button" data-quick="Hey! 👋">Hey! 👋</button>
        <button type="button" data-quick="How's school?">How's school?</button>
        <button type="button" data-quick="You coming? 👀">You coming? 👀</button>
      </div>
      <form class="chat-composer" id="hshsThreadForm" autocomplete="off">
        <button type="button" class="chat-emoji-btn" id="hshsEmojiBtn" aria-label="Emoji"><i class="far fa-face-smile"></i></button>
        <input id="hshsThreadInput" type="text" maxlength="2000" placeholder="Message..." enterkeyhint="send" aria-label="Message">
        <button type="submit" class="chat-send-btn" id="hshsSendBtn" aria-label="Send"><i class="fas fa-arrow-up"></i></button>
        <div class="chat-emoji-sheet" id="hshsEmojiSheet" hidden></div>
      </form>
      <p class="chat-no-media">Text + emoji for now • more chat features coming later</p>
    </div>
  </section>

  <section class="chat-compose" id="hshsComposeSheet" hidden aria-label="New chat">
    <div class="chat-compose-head">
      <button type="button" class="chat-icon-btn" id="hshsComposeBack" aria-label="Back"><i class="fas fa-arrow-left"></i></button>
      <div>
        <span class="chat-kicker">START SOMETHING</span>
        <strong>New chat</strong>
      </div>
      <button type="button" class="chat-icon-btn" id="hshsComposeClose" aria-label="Close"><i class="fas fa-xmark"></i></button>
    </div>
    <div class="chat-compose-search">
      <i class="fas fa-magnifying-glass" aria-hidden="true"></i>
      <input id="hshsComposeSearch" type="search" placeholder="Find a classmate or group..." aria-label="Find a classmate" autocomplete="off">
    </div>
    <div class="chat-compose-results" id="hshsComposeResults"></div>
  </section>
</main>`;
})(typeof window !== 'undefined' ? window : this);
