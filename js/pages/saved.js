export const pageId = "saved";
export const styles = ["css/hshs-account.css", "css/mobile-shell.css"];
export const scripts = [];
export const rootIds = ["hshsSavedList"];
export const bodyClass = "light-mode";
export function render() {
  return `<main class="hshs-account-page"><div class="hshs-page-head"><a class="hshs-back" href="more.html"><i class="fas fa-chevron-left"></i></a><h1>Saved</h1></div><div class="hshs-tabs"><button type="button" class="hshs-tab on" data-saved-tab="saved">Saved posts</button><button type="button" class="hshs-tab" data-saved-tab="interacted">Interacted</button></div><div id="hshsSavedList"></div><div id="hshsInteractedList" hidden></div></main>`;
}
export async function init() {}
