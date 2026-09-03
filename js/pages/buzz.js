/* buzz page module — original markup, hydrate-first. */
export const pageId = "buzz";
export const styles = ["css/clips.css", "css/mobile-shell.css", "css/hshs-theme.css"];
export const scripts = ["js/clips.js"];
export const rootIds = ["clipFeed"];
export const bodyClass = "light-mode clips-page";
export function render() {
  return `<div id="clipFeed" class="clip-feed"></div><div id="clipDim" class="clip-dim" hidden></div><section id="commentSheet" class="comment-sheet"><h3>Comments</h3><div id="commentList"></div><form id="commentForm"><input id="commentInput" placeholder="Say something kind..."></form></section><section id="musicSheet" class="music-sheet"><h3>School Mix</h3><p>Pick a track from the school library. Random internet songs are not allowed.</p><div id="musicList"></div></section>`;
}
export async function init() {
  document.documentElement.classList.remove("hshs-booting");
  document.documentElement.classList.add("hshs-ready");
  if (document.body) document.body.classList.add("has-mobile-shell");
}
