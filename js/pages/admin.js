export const pageId = "admin";
export const styles = ["css/admin.css", "css/mobile-shell.css"];
export const scripts = ["js/admin.js"];
export const rootIds = ["adminLock", "adminDesk"];
export const bodyClass = "dark-mode";
export function render() { return document.getElementById("app-root") ? document.getElementById("app-root").innerHTML : ""; }
export async function init() {}
