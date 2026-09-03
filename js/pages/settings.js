export const pageId = "settings";
export const styles = ["css/hshs-account.css", "css/mobile-shell.css"];
export const scripts = ["js/hshs-settings.js"];
export const rootIds = ["hshsSettingsRoot"];
export const bodyClass = "light-mode";
export function render() { return document.getElementById("app-root") ? document.getElementById("app-root").innerHTML : ""; }
export async function init() {}
