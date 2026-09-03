export const pageId = "clips";
export const styles = ["css/clips.css", "css/mobile-shell.css"];
export const scripts = ["js/clips.js"];
export const rootIds = ["clipFeed"];
export const bodyClass = "light-mode clips-page";
export function render() {
  return `<main class="clips-main"><div class="clip-feed" id="clipFeed"></div></main>
    <div class="clip-sheet" id="commentSheet"><div class="clip-sheet-handle"></div><h3>Comments</h3><div class="comment-list" id="commentList"></div><form class="comment-form" id="commentForm"><input type="text" id="commentInput" placeholder="Say something kind..." maxlength="160"><button type="submit"><i class="fas fa-paper-plane"></i></button></form></div>
    <div class="clip-sheet" id="musicSheet"><div class="clip-sheet-handle"></div><h3>School Mix</h3><div class="music-list" id="musicList"></div></div>
    <div class="clip-dim" id="clipDim"></div>`;
}
export async function init() {}
