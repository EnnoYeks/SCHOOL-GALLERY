import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { renderSlot } from "./media-slots.js";

const firebaseConfig = {
  apiKey: "AIzaSyCoFBtKrk7ZRvV1mZe5hN9tRCPKsuQBlgo",
  authDomain: "school-gallery-62032.firebaseapp.com",
  projectId: "school-gallery-62032",
  messagingSenderId: "931689210926",
  appId: "1:931689210926:web:fd2daf8495d6e6f3e42bbf",
  measurementId: "G-5W89YVBV6J"
};
const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const root = document.getElementById("media-admin-root");
let currentUser = null;
let state = { slots: [], items: [], library: [], libraryHasMore: false, libraryNextOffset: 100 };
let selectedKey = "";
let draggedId = "";

const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[ch]));
const pageLabel = value => String(value || "other").replace(/[_-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
const slotItems = () => state.items.filter(item => item.slot_key === selectedKey).sort((a,b) => Number(a.position)-Number(b.position));
const getSlot = () => state.slots.find(slot => slot.key === selectedKey);

async function request(method, body, query = "") {
  if (!currentUser) throw new Error("Sign in required");
  const token = await currentUser.getIdToken();
  const response = await fetch("/api/admin/media" + query, {
    method,
    cache: "no-store",
    headers: { Authorization: "Bearer " + token, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || "Request failed");
    error.status = response.status;
    throw error;
  }
  return payload;
}

function showLogin() {
  root.innerHTML = '<section class="mm-gate"><div class="mm-gate-mark">H</div><p class="mm-kicker">HSHS WORLD</p><h1>Sign in to continue</h1><p>This area is reserved for authorized administrators.</p><a class="mm-primary" href="/login/">Go to login</a></section>';
}
function showNoAccess() {
  root.innerHTML = '<section class="mm-gate"><div class="mm-gate-mark">H</div><p class="mm-kicker">HSHS WORLD</p><h1>No access</h1><p>Your account does not have permission to manage site media.</p><a class="mm-secondary" href="/">Return home</a></section>';
}
function showError(message) {
  root.innerHTML = '<section class="mm-gate"><h1>Media Manager unavailable</h1><p>' + esc(message) + '</p><button class="mm-secondary" id="mm-retry">Retry</button></section>';
  document.getElementById("mm-retry")?.addEventListener("click", loadAdmin);
}

async function loadAdmin() {
  root.innerHTML = '<div class="mm-loading">' + (window.HshsLoading && HshsLoading.pyramid ? HshsLoading.pyramid('md') : '<span class="mm-spinner"></span>') + '<p>Checking administrator access…</p></div>';
  try {
    const data = await request("GET");
    state = { slots: data.slots || [], items: data.items || [], library: data.library || [], libraryHasMore: !!data.libraryHasMore, libraryNextOffset: Number(data.libraryNextOffset) || 100 };
    selectedKey = selectedKey && state.slots.some(slot => slot.key === selectedKey) ? selectedKey : (state.slots[0]?.key || "");
    renderApp();
  } catch (error) {
    if (error.status === 403) return showNoAccess();
    if (error.status === 401) return showLogin();
    showError(error.message);
  }
}

function renderApp() {
  root.innerHTML = '<div class="mm-shell">' +
    '<aside class="mm-sidebar"><div class="mm-brand"><span class="mm-brand-icon">H</span><div><b>HSHS World</b><small>Media Manager</small></div></div>' +
    '<div class="mm-side-head"><span>MEDIA PLACEMENTS</span><button id="mm-refresh" title="Refresh" aria-label="Refresh">↻</button></div><nav id="mm-slot-nav"></nav>' +
    '<a class="mm-home-link" href="/admin/">← Admin dashboard</a></aside>' +
    '<main class="mm-main"><header class="mm-topbar"><div><p class="mm-kicker">CONTROL ROOM / MEDIA</p><h1>Media Manager</h1><p>Choose what appears across HSHS World.</p></div><a href="/" class="mm-secondary">View site ↗</a></header>' +
    '<div id="mm-editor"></div></main></div>';
  renderNavigation();
  renderEditor();
  document.getElementById("mm-refresh").addEventListener("click", loadAdmin);
}

function renderNavigation() {
  const nav = document.getElementById("mm-slot-nav");
  const grouped = state.slots.reduce((acc, slot) => ((acc[slot.page] ||= []).push(slot), acc), {});
  nav.innerHTML = Object.entries(grouped).map(([page, slots]) =>
    '<section class="mm-nav-group"><h2>' + esc(pageLabel(page)) + '</h2>' +
    slots.map(slot => '<button class="mm-nav-item ' + (slot.key === selectedKey ? "is-active" : "") + '" data-slot="' + esc(slot.key) + '">' +
      '<span class="mm-nav-dot"></span><span>' + esc(slot.label) + '</span><small>' + state.items.filter(item => item.slot_key === slot.key).length + '</small></button>').join("") +
    '</section>'
  ).join("");
  nav.querySelectorAll("[data-slot]").forEach(button => button.addEventListener("click", () => {
    selectedKey = button.dataset.slot;
    renderNavigation();
    renderEditor();
  }));
}

function localDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0,16);
}
function isoDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("Enter a valid date");
  return date.toISOString();
}
function actionState(button, callback) {
  const original = button.textContent;
  button.disabled = true;
  button.textContent = "Saving…";
  callback().then(() => {
    button.textContent = "Saved";
    setTimeout(() => { button.textContent = original; button.disabled = false; }, 900);
  }).catch(error => {
    button.textContent = "Failed · Retry";
    button.disabled = false;
    button.title = error.message;
    button.onclick = () => actionState(button, callback);
  });
}

function renderEditor() {
  const slot = getSlot();
  const editor = document.getElementById("mm-editor");
  if (!slot) {
    editor.innerHTML = '<div class="mm-empty"><h2>No media slots</h2><p>There are no configured placements yet.</p></div>';
    return;
  }
  const items = slotItems();
  editor.innerHTML = '<section class="mm-slot-settings"><div class="mm-section-heading"><div><p class="mm-kicker">' + esc(pageLabel(slot.page)) + '</p><h2>' + esc(slot.label) + '</h2><p>Configure this placement and choose its media.</p></div><span class="mm-status ' + (slot.visible ? "is-visible" : "is-hidden") + '">' + (slot.visible ? "Visible" : "Hidden") + '</span></div>' +
    '<div class="mm-settings-grid">' +
    '<label>Layout<select id="mm-layout"><option value="carousel">Carousel</option><option value="grid">Grid</option><option value="strip">Strip</option><option value="card">Card</option></select></label>' +
    '<label>Content mode<select id="mm-mode"><option value="manual">Manual</option><option value="latest">Latest</option><option value="most_liked">Most liked · 30 days</option><option value="mixed">Manual + latest</option></select></label>' +
    '<label>Maximum items<input id="mm-max" type="number" min="1" max="100" value="' + Number(slot.max_items) + '"></label>' +
    '<label>Aspect ratio<input id="mm-aspect" value="' + esc(slot.aspect_ratio || "16/9") + '" placeholder="16/9"></label>' +
    '<label class="mm-switch-row"><input id="mm-visible" type="checkbox" ' + (slot.visible ? "checked" : "") + '><span>Show this placement publicly</span></label>' +
    '<button class="mm-primary" id="mm-save-slot">Save placement</button></div></section>' +
    '<section class="mm-content-section"><div class="mm-section-heading"><div><p class="mm-kicker">ASSIGNED MEDIA</p><h2>Items in this slot</h2><p>Reorder, edit captions, set focal points and schedule visibility.</p></div><button class="mm-primary" id="mm-add">＋ Add from library</button></div>' +
    '<div class="mm-items" id="mm-items">' + (items.length ? items.map(renderItem).join("") : '<div class="mm-empty"><strong>No media assigned</strong><span>Add items from the library or switch to an automatic mode.</span></div>') + '</div></section>' +
    '<section class="mm-preview-section"><div class="mm-section-heading"><div><p class="mm-kicker">LIVE PREVIEW</p><h2>Public appearance</h2><p>Uses the same renderer as public media placements.</p></div></div><div class="mm-preview-frame"><div id="mm-preview"></div></div></section>' +
    '<div id="mm-library-modal" class="mm-modal" hidden><div class="mm-modal-card"><div class="mm-modal-head"><div><p class="mm-kicker">MEDIA LIBRARY</p><h2>Add media to ' + esc(slot.label) + '</h2></div><button id="mm-close-library" class="mm-icon-btn" aria-label="Close">×</button></div><input id="mm-library-search" class="mm-search" placeholder="Search titles and captions…"><div id="mm-library-grid" class="mm-library-grid"></div><button id="mm-library-more" class="mm-secondary mm-library-more">Load more media</button></div></div>';
  document.getElementById("mm-layout").value = slot.layout;
  document.getElementById("mm-mode").value = slot.mode;
  document.getElementById("mm-save-slot").addEventListener("click", saveSlot);
  document.getElementById("mm-add").addEventListener("click", openLibrary);
  document.getElementById("mm-generate-sizes").addEventListener("click", generateOldSizes);
  document.getElementById("mm-close-library").addEventListener("click", closeLibrary);
  document.getElementById("mm-library-search").addEventListener("input", renderLibrary);
  document.getElementById("mm-library-more").addEventListener("click", loadMoreLibrary);
  wireItems();
  const preview = document.getElementById("mm-preview");
  renderSlot(slot.key, preview, { ...slot, items }, { preview: true });
}

function renderItem(item, index) {
  const media = item.media || {};
  const src = media.src || "";
  return '<article class="mm-item" draggable="true" data-item-id="' + esc(item.id) + '">' +
    '<div class="mm-item-top"><div class="mm-item-thumb" data-focal="' + esc(item.id) + '">' + (src ? '<img src="' + esc(src) + '" alt="" style="object-position:' + (Number(item.focal_x ?? .5)*100) + '% ' + (Number(item.focal_y ?? .5)*100) + '%">' : '<span>Missing media</span>') + '</div>' +
    '<div class="mm-item-main"><div class="mm-item-title">' + esc(media.title || "Untitled media") + '</div><small>' + esc(item.media_table) + ' · position ' + esc(item.position) + '</small>' +
    (item.missing ? '<span class="mm-warning">Missing source record</span>' : '') +
    '<div class="mm-item-actions"><button data-move="up" data-id="' + esc(item.id) + '" ' + (index === 0 ? "disabled" : "") + '>↑</button><button data-move="down" data-id="' + esc(item.id) + '">↓</button><button data-remove="' + esc(item.id) + '" class="mm-danger">Remove</button></div></div></div>' +
    '<div class="mm-item-fields"><label>Caption<input data-field="caption" value="' + esc(item.caption || "") + '" maxlength="2000" placeholder="Caption"></label>' +
    '<label>Link URL<input data-field="link_url" value="' + esc(item.link_url || "") + '" placeholder="https://…"></label>' +
    '<label>Starts at<input data-field="starts_at" type="datetime-local" value="' + localDate(item.starts_at) + '"></label>' +
    '<label>Ends at<input data-field="ends_at" type="datetime-local" value="' + localDate(item.ends_at) + '"></label>' +
    '<label class="mm-switch-row"><input data-field="visible" type="checkbox" ' + (item.visible ? "checked" : "") + '><span>Visible</span></label>' +
    '<button class="mm-secondary mm-save-item" data-save="' + esc(item.id) + '">Save item</button></div>' +
    '<small class="mm-focal-hint">Tap the preview image to set its focal point.</small></article>';
}

function wireItems() {
  const list = document.getElementById("mm-items");
  list.querySelectorAll("[data-save]").forEach(button => button.addEventListener("click", () => {
    const card = button.closest(".mm-item");
    const value = field => card.querySelector('[data-field="' + field + '"]');
    const payload = {
      action: "update-item", id: button.dataset.save,
      caption: value("caption").value,
      link_url: value("link_url").value,
      starts_at: value("starts_at").value || null,
      ends_at: value("ends_at").value || null,
      visible: value("visible").checked
    };
    actionState(button, async () => {
      const result = await request("POST", payload);
      state.items = state.items.map(item => item.id === result.data.id ? { ...item, ...result.data } : item);
      renderNavigation(); renderPreviewOnly();
    });
  }));
  list.querySelectorAll("[data-remove]").forEach(button => button.addEventListener("click", () => {
    actionState(button, async () => {
      await request("POST", { action: "delete-item", id: button.dataset.remove });
      state.items = state.items.filter(item => item.id !== button.dataset.remove);
      renderEditor(); renderNavigation();
    });
  }));
  list.querySelectorAll("[data-move]").forEach(button => button.addEventListener("click", () => moveItem(button.dataset.id, button.dataset.move === "up" ? -1 : 1)));
  list.querySelectorAll("[data-focal]").forEach(box => box.addEventListener("click", event => {
    const rect = box.getBoundingClientRect();
    const focal_x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const focal_y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    request("POST", { action: "update-item", id: box.dataset.focal, focal_x, focal_y })
      .then(result => { state.items = state.items.map(item => item.id === result.data.id ? { ...item, ...result.data } : item); renderEditor(); })
      .catch(error => alert(error.message));
  }));
  list.querySelectorAll(".mm-item").forEach(card => {
    card.addEventListener("dragstart", () => { draggedId = card.dataset.itemId; card.classList.add("is-dragging"); });
    card.addEventListener("dragend", () => card.classList.remove("is-dragging"));
    card.addEventListener("dragover", event => event.preventDefault());
    card.addEventListener("drop", event => {
      event.preventDefault();
      const targetId = card.dataset.itemId;
      if (draggedId && draggedId !== targetId) moveBefore(draggedId, targetId);
      draggedId = "";
    });
  });
}

async function moveItem(id, delta) {
  const items = slotItems();
  const from = items.findIndex(item => item.id === id);
  const to = from + delta;
  if (from < 0 || to < 0 || to >= items.length) return;
  const ordered = [...items];
  const [moved] = ordered.splice(from, 1);
  ordered.splice(to, 0, moved);
  await persistOrder(ordered, to);
}
async function moveBefore(id, targetId) {
  const items = slotItems();
  const ordered = [...items];
  const from = ordered.findIndex(item => item.id === id);
  const to = ordered.findIndex(item => item.id === targetId);
  if (from < 0 || to < 0) return;
  const [moved] = ordered.splice(from, 1);
  ordered.splice(to, 0, moved);
  await persistOrder(ordered, to);
}
async function persistOrder(ordered, index) {
  const item = ordered[index];
  const button = document.querySelector('[data-move][data-id="' + item.id + '"]');
  if (button) { button.disabled = true; button.textContent = "…"; }
  try {
    const data = await request("POST", {
      action: "reorder", id: item.id,
      previous_id: ordered[index - 1]?.id || null,
      next_id: ordered[index + 1]?.id || null
    });
    state.items = state.items.map(row => row.id === item.id ? { ...row, ...data.data } : row);
    renderEditor(); renderNavigation();
  } catch (error) {
    if (button) { button.disabled = false; button.textContent = "Retry"; }
    alert("Reorder failed: " + error.message);
  }
}

function renderPreviewOnly() {
  const slot = getSlot();
  const preview = document.getElementById("mm-preview");
  if (slot && preview) renderSlot(slot.key, preview, { ...slot, items: slotItems() }, { preview: true });
}

async function saveSlot(event) {
  const button = event.currentTarget;
  const slot = getSlot();
  const payload = {
    action: "save-slot", key: slot.key, label: slot.label, page: slot.page,
    layout: document.getElementById("mm-layout").value,
    mode: document.getElementById("mm-mode").value,
    max_items: Number(document.getElementById("mm-max").value),
    aspect_ratio: document.getElementById("mm-aspect").value,
    visible: document.getElementById("mm-visible").checked
  };
  actionState(button, async () => {
    const result = await request("POST", payload);
    state.slots = state.slots.map(item => item.key === slot.key ? result.data : item);
    renderNavigation(); renderPreviewOnly();
  });
}

async function ensureStorageTools() {
  if (window.HshsStorage && window.HshsStorage.generateVariants) return;
  window.__R2 = window.__R2 || {
    signUrl: "https://hshs-r2-sign.ennoyeks.workers.dev/sign",
    publicBaseUrl: "https://pub-cf880c90c5ff4ca697baac59284a6024.r2.dev"
  };
  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/js/storage.js?v=261128r2sec1";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Could not load the R2 upload helper"));
    document.head.appendChild(script);
  });
  if (!window.HshsStorage || !window.HshsStorage.generateVariants) throw new Error("R2 image-size generation is unavailable");
}

async function generateOldSizes(event) {
  const button = event.currentTarget;
  actionState(button, async () => {
    await ensureStorageTools();
    let allMedia = [...state.library];
    let offset = state.libraryNextOffset;
    let hasMore = state.libraryHasMore;
    while (hasMore) {
      const page = await request("GET", null, "?library_offset=" + offset);
      allMedia = allMedia.concat(page.library || []);
      hasMore = !!page.libraryHasMore;
      offset = Number(page.libraryNextOffset) || (offset + 100);
    }
    state.library = allMedia;
    state.libraryHasMore = false;
    state.libraryNextOffset = offset;
    const candidates = state.library.filter(item =>
      ["posts", "photos"].includes(item.table) &&
      item.media_key && !item.processedKey &&
      item.src && !String(item.type || "").toLowerCase().includes("video")
    );
    if (!candidates.length) {
      button.textContent = "All listed images have sizes";
      return;
    }
    const base = "https://pub-cf880c90c5ff4ca697baac59284a6024.r2.dev";
    const failures = [];
    let completed = 0;
    for (const item of candidates) {
      try {
        const response = await fetch(item.src, { mode: "cors", cache: "no-store" });
        if (!response.ok) throw new Error("Original image could not be fetched (" + response.status + ")");
        const blob = await response.blob();
        if (!/^image\//i.test(blob.type || "")) throw new Error("Stored media is not an image");
        const file = new File([blob], "legacy-" + item.id + ".jpg", { type: blob.type });
        const processedKey = await window.HshsStorage.generateVariants(file);
        await request("POST", {
          action: "save-processed-key",
          media_table: item.table,
          media_id: item.id,
          processed_key: processedKey
        });
        item.processedKey = processedKey;
        item.src = base + "/" + processedKey + "/medium.webp";
        item.srcSet = base + "/" + processedKey + "/thumb.webp 400w, " + item.src + " 900w, " + base + "/" + processedKey + "/large.webp 1600w";
        completed += 1;
        button.textContent = "Generating " + completed + "/" + candidates.length + "…";
      } catch (error) {
        failures.push(item.id + ": " + error.message);
      }
    }
    if (!document.getElementById("mm-library-modal")?.hidden) renderLibrary();
    renderPreviewOnly();
    if (failures.length) throw new Error(completed + " images updated; " + failures.length + " could not be processed. Retry after checking R2 CORS and original URLs.");
  });
}

function openLibrary() {
  document.getElementById("mm-library-modal").hidden = false;
  renderLibrary();
}
function closeLibrary() {
  document.getElementById("mm-library-modal").hidden = true;
}
async function loadMoreLibrary(event) {
  const button = event.currentTarget;
  if (!state.libraryHasMore) return;
  button.disabled = true;
  button.textContent = "Loading…";
  try {
    const page = await request("GET", null, "?library_offset=" + state.libraryNextOffset);
    const seen = new Set(state.library.map(item => item.table + ":" + item.id));
    (page.library || []).forEach(item => {
      const key = item.table + ":" + item.id;
      if (!seen.has(key)) state.library.push(item);
    });
    state.libraryHasMore = !!page.libraryHasMore;
    state.libraryNextOffset = Number(page.libraryNextOffset) || state.libraryNextOffset + 100;
    renderLibrary();
  } catch (error) {
    button.textContent = "Retry loading";
    button.title = error.message;
  } finally {
    button.disabled = false;
  }
}

function renderLibrary() {
  const query = document.getElementById("mm-library-search").value.trim().toLowerCase();
  const list = state.library.filter(item => !query || [item.title, item.description, item.type, item.table].join(" ").toLowerCase().includes(query));
  const grid = document.getElementById("mm-library-grid");
  grid.innerHTML = list.map(item =>
    '<button class="mm-library-item" data-library-id="' + esc(item.id) + '" data-library-table="' + esc(item.table) + '">' +
    (item.src ? '<img src="' + esc(item.src) + '" alt="" loading="lazy">' : '<span class="mm-library-placeholder">No preview</span>') +
    '<strong>' + esc(item.title) + '</strong><small>' + esc(item.table) + '</small></button>'
  ).join("") || '<p class="mm-library-empty">No matching media found.</p>';
  const more = document.getElementById("mm-library-more");
  if (more) more.hidden = !state.libraryHasMore;
  grid.querySelectorAll("[data-library-id]").forEach(button => button.addEventListener("click", async () => {
    button.disabled = true;
    try {
      const result = await request("POST", { action: "add-item", slot_key: selectedKey, media_table: button.dataset.libraryTable, media_id: button.dataset.libraryId });
      state.items.push({ ...result.data, media: state.library.find(item => item.id === button.dataset.libraryId && item.table === button.dataset.libraryTable), missing: false });
      closeLibrary(); renderEditor(); renderNavigation();
    } catch (error) {
      button.disabled = false;
      button.title = error.message;
      alert("Could not add media: " + error.message);
    }
  }));
}

onAuthStateChanged(auth, user => {
  currentUser = user && !user.isAnonymous ? user : null;
  if (!currentUser) return showLogin();
  loadAdmin();
});
