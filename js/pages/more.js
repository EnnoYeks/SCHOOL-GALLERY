export const pageId = "more";
export const styles = ["css/hshs-account.css", "css/mobile-shell.css", "css/hshs-theme.css", "css/hshs-campus-wire.css"];
export const scripts = ["js/hshs-tab-order.js"];
export const rootIds = ["morePageMe"];
export const bodyClass = "dark-mode has-mobile-shell";
export function render() {
  return `<main class="hshs-account-page">
  <a class="hshs-me-card" href="index/profile.html" id="morePageMe">
    <img class="hshs-me-pic" id="morePagePic" alt="Your profile" src="https://hawthorne-scribner.ac.ug/wp-content/uploads/2024/12/Hawthorne-Scribner-Badge-png-768x771.png">
    <span class="hshs-me-copy">
      <strong id="morePageName">John Doe</strong>
      <small id="morePageEmail">john.doe@hshs.ac.ug</small>
      <em id="morePageRole">HSHS Student</em>
    </span>
    <span class="hshs-me-go"><i class="fas fa-user"></i> View Profile</span>
  </a>
  <div class="hshs-menu-list">
    <a class="hshs-menu-item" href="index/profile.html"><i class="fas fa-user"></i><span><b>Profile</b><small>View and edit your profile</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="index/chat.html"><i class="fas fa-envelope"></i><span><b>Messages</b><small>View your messages and chats</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="index/notifications.html"><i class="fas fa-bell"></i><span><b>Notifications</b><small>Manage your notifications</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="index/saved.html"><i class="fas fa-star"></i><span><b>Saved</b><small>View your saved posts and items</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="index/spotlight.html"><i class="fas fa-users"></i><span><b>My Groups</b><small>Groups you belong to</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="index/memories.html"><i class="fas fa-calendar"></i><span><b>Events</b><small>Upcoming events and activities</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="index/gallery.html"><i class="fas fa-image"></i><span><b>Gallery</b><small>Photos and videos gallery</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="index/settings.html#privacy"><i class="fas fa-shield-halved"></i><span><b>Privacy</b><small>Privacy settings and controls</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="index/settings.html"><i class="fas fa-gear"></i><span><b>Settings</b><small>App settings and preferences</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="index/contat.html"><i class="fas fa-circle-question"></i><span><b>Help & Support</b><small>Get help and contact support</small></span><i class="fas fa-chevron-right"></i></a>
  </div>
</main>`;
}
export async function init() {
  document.body.classList.add("dark-mode", "has-mobile-shell");
  document.body.setAttribute("data-hshs-page", "more");
}
