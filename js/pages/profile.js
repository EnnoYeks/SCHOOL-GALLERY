export const pageId = "profile";
export const styles = ["css/hshs-social.css", "css/mobile-shell.css"];
export const scripts = ["js/hshs-store.js", "js/hshs-social.js"];
export const rootIds = ["hshsProfileRoot"];
export const bodyClass = "light-mode";
export function render() { return `<div id="hshsProfileRoot"><div class="hshs-profile-empty">Loading profile…</div></div>`; }
export async function init() {}
