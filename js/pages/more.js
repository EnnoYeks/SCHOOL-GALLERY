export const pageId = "more";
export const styles = ["css/hshs-account.css", "css/mobile-shell.css", "css/hshs-theme.css", "css/hshs-campus-wire.css"];
export const scripts = ["js/hshs-tab-order.js"];
export const rootIds = ["hshsMoreMenu", "morePageMe"];
export const bodyClass = "dark-mode has-mobile-shell";
export function render() {
  return document.getElementById("app-root") ? document.getElementById("app-root").innerHTML : "";
}
export async function init() {
  document.body.classList.add("dark-mode", "has-mobile-shell");
  document.body.setAttribute("data-hshs-page", "more");
}
