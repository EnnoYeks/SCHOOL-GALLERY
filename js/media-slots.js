const PUBLIC_API = "/api/slots";

function safeLink(value) {
  try {
    const url = new URL(String(value || ""), window.location.origin);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch (_) { return ""; }
}

function showSkeleton(container, layout, count) {
  if (!container) return;
  container.hidden = false;
  container.setAttribute("aria-busy", "true");
  container.classList.add("hshs-media-slot");
  container.dataset.mediaSlotLayout = layout || "grid";
  container.innerHTML = "";
  const total = Math.max(1, Math.min(6, Number(count) || 3));
  for (let i = 0; i < total; i++) {
    const item = document.createElement("div");
    item.className = "hshs-slot-skeleton";
    container.appendChild(item);
  }
}

function itemShape(item) {
  const media = item.media || item;
  const video = String(media.mediaType || media.type || item.mediaType || "").toLowerCase().includes("video");
  return {
    id: item.id || media.id || "",
    src: media.src || media.videoUrl || item.src || "",
    srcSet: media.srcSet || item.srcSet || "",
    poster: media.poster || item.poster || (video ? "" : media.src) || "",
    videoUrl: media.videoUrl || item.videoUrl || (video ? media.src : "") || "",
    video,
    caption: item.caption || media.caption || media.title || "",
    focalX: Number(item.focal_x ?? item.focalX ?? media.focalX ?? 0.5),
    focalY: Number(item.focal_y ?? item.focalY ?? media.focalY ?? 0.5),
    linkUrl: safeLink(item.link_url || item.linkUrl || ""),
    position: Number(item.position || 0)
  };
}

export function renderSlot(key, container, suppliedSlot, options = {}) {
  if (!container) return 0;
  const slot = suppliedSlot || {};
  const items = (slot.items || []).map(itemShape).filter(item => item.src || item.poster);
  const preview = options.preview === true;
  container.classList.add("hshs-media-slot");
  container.dataset.mediaSlotKey = key;
  container.dataset.mediaSlotLayout = slot.layout || "grid";
  container.style.setProperty("--hshs-slot-aspect", slot.aspect_ratio || slot.aspectRatio || "16/9");
  container.style.aspectRatio = slot.aspect_ratio || slot.aspectRatio || "16/9";
  container.setAttribute("aria-busy", "false");
  container.innerHTML = "";

  if (!items.length) {
    if (preview) {
      const empty = document.createElement("div");
      empty.className = "hshs-slot-empty";
      empty.textContent = "No media selected for this slot yet";
      container.appendChild(empty);
      container.hidden = false;
    } else {
      container.hidden = true;
      const section = container.closest("[data-media-slot-section]");
      if (section) section.hidden = true;
    }
    return 0;
  }

  container.hidden = false;
  const section = container.closest("[data-media-slot-section]");
  if (section) section.hidden = false;
  const fragment = document.createDocumentFragment();

  items.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "hshs-slot-card";
    card.dataset.mediaSlotItem = item.id;
    const mediaBox = document.createElement("div");
    mediaBox.className = "hshs-slot-card__media";
    mediaBox.style.aspectRatio = slot.aspect_ratio || slot.aspectRatio || "16/9";

    if (item.video) {
      const video = document.createElement("video");
      video.src = item.videoUrl;
      if (item.poster) video.poster = item.poster;
      video.muted = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.controls = preview || slot.layout === "card";
      video.addEventListener("loadeddata", () => video.classList.add("is-loaded"), { once: true });
      video.addEventListener("error", () => {
        card.hidden = true;
        hideIfEmpty(container, preview);
      }, { once: true });
      mediaBox.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.src = item.src;
      if (item.srcSet) img.srcset = item.srcSet;
      img.sizes = key === "home_hero" ? "100vw" : slot.layout === "strip" ? "320px" : "(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw";
      img.alt = item.caption || "HSHS World media";
      img.loading = key === "home_hero" && index === 0 ? "eager" : "lazy";
      img.decoding = "async";
      if (key === "home_hero" && index === 0) img.fetchPriority = "high";
      img.style.objectPosition = (item.focalX * 100) + "% " + (item.focalY * 100) + "%";
      img.addEventListener("load", () => img.classList.add("is-loaded"), { once: true });
      img.addEventListener("error", () => {
        card.hidden = true;
        hideIfEmpty(container, preview);
      }, { once: true });
      mediaBox.appendChild(img);
    }

    card.appendChild(mediaBox);
    if (item.caption) {
      const caption = document.createElement("div");
      caption.className = "hshs-slot-card__caption";
      caption.textContent = item.caption;
      card.appendChild(caption);
    }

    if (item.linkUrl) {
      const link = document.createElement("a");
      link.className = "hshs-slot-card__link";
      link.href = item.linkUrl;
      link.setAttribute("aria-label", item.caption || "Open media");
      link.appendChild(card.cloneNode(true));
      fragment.appendChild(link);
    } else {
      fragment.appendChild(card);
    }
  });

  container.appendChild(fragment);
  return items.length;
}

function hideIfEmpty(container, preview) {
  const visible = [...container.children].some(child => !child.hidden);
  if (visible) return;
  if (preview) {
    const empty = document.createElement("div");
    empty.className = "hshs-slot-empty";
    empty.textContent = "No media could be loaded";
    container.appendChild(empty);
  } else {
    container.hidden = true;
    const section = container.closest("[data-media-slot-section]");
    if (section) section.hidden = true;
  }
}

export async function loadSlots(keys, containers, options = {}) {
  const unique = [...new Set((keys || []).filter(Boolean))];
  Object.entries(containers || {}).forEach(([key, container]) => {
    const count = options.skeletonCount || 3;
    showSkeleton(container, container.dataset.mediaSlotLayout || "grid", count);
  });
  if (!unique.length) return {};
  const url = PUBLIC_API + "?keys=" + encodeURIComponent(unique.join(","));
  const response = await fetch(url, { cache: options.noStore ? "no-store" : "default" });
  if (!response.ok) throw new Error("Media slots could not be loaded (" + response.status + ")");
  const payload = await response.json();
  const byKey = new Map((payload.slots || []).map(slot => [slot.key, slot]));
  Object.entries(containers || {}).forEach(([key, container]) => renderSlot(key, container, byKey.get(key) || null));
  return Object.fromEntries(byKey);
}

if (typeof window !== "undefined") {
  window.HshsMediaSlots = { renderSlot, loadSlots, showSkeleton };
}
