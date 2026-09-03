export const pageId = "more";
export const styles = ["css/hshs-account.css", "css/mobile-shell.css"];
export const scripts = [];
export const rootIds = ["hshsMoreMenu", "morePageMe"];
export const bodyClass = "light-mode";
export function render() {
  return document.getElementById("app-root") ? document.getElementById("app-root").innerHTML : "";
}
export async function init() {}
