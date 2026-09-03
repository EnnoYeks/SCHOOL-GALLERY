export const pageId = "spotlight";
export const styles = ["css/spotlight.css", "css/mobile-shell.css"];
export const scripts = ["js/spotlight.js"];
export const rootIds = ["featuredStudent", "spotlightGrid"];
export const bodyClass = "light-mode";
export function render() { return document.getElementById("app-root") ? document.getElementById("app-root").innerHTML : ""; }
export async function init() {}
