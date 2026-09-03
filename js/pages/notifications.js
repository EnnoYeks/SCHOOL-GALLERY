export const pageId = "notifications";
export const styles = ["css/hshs-account.css", "css/mobile-shell.css"];
export const scripts = [];
export const rootIds = ["hshsNotifList"];
export const bodyClass = "light-mode";
export function render() {
  return `<main class="hshs-account-page"><div class="hshs-page-head"><a class="hshs-back" href="more.html" aria-label="Back"><i class="fas fa-chevron-left"></i></a><h1>Notifications</h1><button type="button" class="hshs-text-btn" id="hshsMarkRead">Mark all read</button></div><div class="hshs-tabs"><button type="button" class="hshs-tab on" data-notif-tab="all">All</button><button type="button" class="hshs-tab" data-notif-tab="mentions">Mentions</button><button type="button" class="hshs-tab" data-notif-tab="school">School</button></div><div id="hshsNotifList"></div></main>`;
}
export async function init() {}
