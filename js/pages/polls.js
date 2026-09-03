export const pageId = "polls";
export const styles = ["css/mobile-shell.css", "css/hshs-theme.css"];
export const scripts = [];
export const rootIds = ["activePollsList", "createPollBtn"];
export const bodyClass = "light-mode";
export function render() {
  return `<div class="container" style="padding:2rem;position:relative;z-index:10;margin-top:60px;max-width:800px">
    <div style="background:linear-gradient(135deg,var(--primary-color),var(--secondary-color));border-radius:20px;padding:3rem;color:white;margin-bottom:3rem;text-align:center">
      <h1 style="font-size:2.5rem;font-weight:800;margin-bottom:1rem"><i class="fas fa-poll"></i> Live Polls</h1>
      <p>Vote on your favorite events, people, and things!</p>
    </div>
    <div id="activePollsList"></div>
    <button style="width:100%;padding:1rem;margin-top:2rem;border:none;border-radius:10px;background:linear-gradient(135deg,var(--primary-color),var(--secondary-color));color:white;font-weight:600" id="createPollBtn" type="button"><i class="fas fa-plus"></i> Create New Poll</button>
    <div style="margin-top:4rem"><h2 class="section-title"><i class="fas fa-history"></i> Closed Polls</h2><div id="closedPollsList"></div></div>
  </div>`;
}
export async function init() {}
