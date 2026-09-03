export const pageId = "more";
export const styles = ["css/hshs-account.css", "css/mobile-shell.css", "css/hshs-theme.css", "css/hshs-campus-wire.css"];
export const scripts = ["js/hshs-tab-order.js"];
export const rootIds = ["morePageMe"];
export const bodyClass = "dark-mode has-mobile-shell";

function item(href, icon, title, sub) {
  return '<a class="hshs-menu-item" href="' + href + '">' +
    '<i class="fas ' + icon + '"></i>' +
    '<span><b>' + title + '</b><small>' + sub + '</small></span>' +
    '<i class="fas fa-chevron-right"></i></a>';
}

export function render() {
  return '<main class="hshs-account-page">' +
    '<a class="hshs-me-card" href="/index/profile.html" id="morePageMe">' +
      '<img class="hshs-me-pic" id="morePagePic" alt="Your profile" src="https://hawthorne-scribner.ac.ug/wp-content/uploads/2024/12/Hawthorne-Scribner-Badge-png-768x771.png">' +
      '<span class="hshs-me-copy">' +
        '<strong id="morePageName">John Doe</strong>' +
        '<small id="morePageEmail">john.doe@hshs.ac.ug</small>' +
        '<em id="morePageRole">HSHS Student</em>' +
      '</span>' +
      '<span class="hshs-me-go"><i class="fas fa-user"></i> View Profile</span>' +
    '</a>' +
    '<div class="hshs-menu-list" id="hshsMoreMenu">' +
      item('/index/profile.html', 'fa-user', 'Profile', 'View and edit your profile') +
      item('/index/chat.html', 'fa-envelope', 'Messages', 'View your messages and chats') +
      item('/index/notifications.html', 'fa-bell', 'Notifications', 'Manage your notifications') +
      item('/index/saved.html', 'fa-star', 'Saved', 'View your saved posts and items') +
      item('/index/spotlight.html', 'fa-users', 'My Groups', 'Groups you belong to') +
      item('/index/memories.html', 'fa-calendar', 'Events', 'Upcoming events and activities') +
      item('/index/gallery.html', 'fa-image', 'Gallery', 'Photos and videos gallery') +
      item('/index/photos.html', 'fa-camera', 'Photos', 'School photo albums') +
      item('/index/videos.html', 'fa-play', 'Vibe', 'Campus videos') +
      item('/index/buzz.html', 'fa-bolt', 'Buzz', 'Short clips from around school') +
      item('/index/trending.html', 'fa-fire', 'Trending', 'What the school is talking about') +
      item('/index/spotlight.html', 'fa-trophy', 'Spotlight', 'Featured students and moments') +
      item('/index/polls.html', 'fa-square-poll-vertical', 'Polls', 'Vote on school questions') +
      item('/index/settings.html#privacy', 'fa-shield-halved', 'Privacy', 'Privacy settings and controls') +
      item('/index/settings.html', 'fa-gear', 'Settings', 'App settings and preferences') +
      item('/index/about.html', 'fa-graduation-cap', 'About', 'About HSHS World') +
      item('/index/contat.html', 'fa-circle-question', 'Help & Support', 'Get help and contact support') +
    '</div>' +
  '</main>';
}

export async function init() {
  document.body.classList.add('dark-mode', 'has-mobile-shell');
  document.body.setAttribute('data-hshs-page', 'more');
}
