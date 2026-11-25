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

function safeMediaSource(value) {
  const raw = String(value || "");
  return /^https?:\\/\\//i.test(raw) ? raw : "";
}

function cleanTitle(value) {
  const title = String(value || "").trim();
  return /^(campus moment|hshs moment|campus photo|campus video)$/i.test(title) ? "" : title;
}

function renderHomeHero(container, items) {
  const photos = items.filter(item => safeMediaSource(item.poster || (item.video ? "" : item.src)));
  container.innerHTML = "";
  container.hidden = !photos.length;
  if (!photos.length) return 0;
  const duration = Math.max(1, photos.length) * 4.5;
  photos.slice(0, 6).forEach((item, index) => {
    const span = document.createElement("span");
    span.className = "is-campus";
    span.style.backgroundImage = "none";
    span.style.animationDuration = duration + "s";
    span.style.animationDelay = (index * 4.5) + "s";
    span.style.animationPlayState = document.hidden ? "paused" : "running";
    const img = document.createElement("img");
    img.src = safeMediaSource(item.poster || item.src);
    if (item.srcSet) img.srcset = item.srcSet;
    img.sizes = "100vw";
    img.alt = "";
    img.loading = index === 0 ? "eager" : "lazy";
    img.decoding = "async";
    if (index === 0) img.fetchPriority = "high";
    img.addEventListener("error", () => {
      span.hidden = true;
      if (![...container.children].some(node => !node.hidden)) container.hidden = true;
    }, { once: true });
    span.appendChild(img);
    container.appendChild(span);
  });
  if (!window.__hshsHeroVisibilityBound) {
    window.__hshsHeroVisibilityBound = true;
    document.addEventListener("visibilitychange", () => {
      document.querySelectorAll(".vibe-hero-photos span").forEach(span => {
        span.style.animationPlayState = document.hidden ? "paused" : "running";
      });
    });
  }
  return photos.length;
}

function renderHomeFeatured(container, slot, items) {
  const cards = items.filter(item => safeMediaSource(item.video ? item.poster : item.src));
  container.innerHTML = "";
  if (!cards.length) {
    container.hidden = true;
    const section = container.closest("[data-media-slot-section]");
    if (section) section.hidden = true;
    return 0;
  }
  container.hidden = false;
  const section = container.closest("[data-media-slot-section]");
  if (section) section.hidden = false;
  cards.slice(0, Number(slot.max_items) || 6).forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "home-feature-card is-alive";
    const media = document.createElement("div");
    media.className = "home-feature-media";
    media.setAttribute("role", "img");
    media.setAttribute("aria-label", item.caption || "HSHS World media");
    const img = document.createElement("img");
    img.src = safeMediaSource(item.video ? item.poster : item.src);
    if (item.srcSet) img.srcset = item.srcSet;
    img.sizes = "(max-width: 640px) 72vw, 220px";
    img.alt = item.caption || "HSHS World media";
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("load", () => img.classList.add("is-loaded"), { once: true });
    img.addEventListener("error", () => {
      card.hidden = true;
      if (![...container.children].some(node => !node.hidden)) {
        container.hidden = true;
        const section = container.closest("[data-media-slot-section]");
        if (section) section.hidden = true;
      }
    }, { once: true });
    media.appendChild(img);
    media.style.animationDelay = (index * 1.2) + "s";
    const overlay = document.createElement("div");
    overlay.className = "home-feature-overlay";
    const body = document.createElement("div");
    body.className = "home-feature-body";
    const type = document.createElement("span");
    type.className = "home-feature-type";
    type.textContent = item.video ? "Vibe" : "Photo";
    body.appendChild(type);
    const title = cleanTitle(item.caption || item.title);
    if (title) {
      const heading = document.createElement("h3");
      heading.textContent = title;
      body.appendChild(heading);
    }
    const counts = [];
    if (Number(item.likes) > 0) counts.push(Number(item.likes).toLocaleString() + " likes");
    if (Number(item.views) > 0) counts.push(Number(item.views).toLocaleString() + " views");
    if (counts.length) {
      const meta = document.createElement("div");
      meta.className = "home-feature-meta";
      meta.textContent = counts.join(" · ");
      body.appendChild(meta);
    }
    card.append(media, overlay, body);
    container.appendChild(card);
  });
  return cards.length;
}

function renderHomeTrend(container, item, rank) {
  container.innerHTML = "";
  const source = item && safeMediaSource(item.video ? item.poster : item.src);
  if (!item || !source) {
    container.hidden = true;
    return 0;
  }
  container.hidden = false;
  const link = document.createElement("a");
  link.className = "home-trend-item";
  link.href = safeLink(item.linkUrl) || "/trending/";
  const thumb = document.createElement("span");
  thumb.className = "home-trend-thumb";
  const image = document.createElement("img");
  image.src = source;
  if (item.srcSet) image.srcset = item.srcSet;
  image.sizes = "56px";
  image.alt = "";
  image.loading = "lazy";
  image.decoding = "async";
  image.addEventListener("error", () => {
    container.hidden = true;
    const section = container.closest(".home-section");
    if (section && ["homeTrendA", "homeTrendB"].every(id => {
      const el = document.getElementById(id);
      return !el || el.hidden;
    })) section.hidden = true;
  }, { once: true });
  thumb.appendChild(image);
  const copy = document.createElement("span");
  copy.className = "home-trend-copy";
  const label = document.createElement("small");
  label.textContent = "Trending today";
  copy.appendChild(label);
  const title = cleanTitle(item.caption || item.title);
  if (title) {
    const heading = document.createElement("strong");
    heading.textContent = title;
    copy.appendChild(heading);
  }
  if (Number(item.likes) > 0) {
    const likes = document.createElement("em");
    likes.textContent = Number(item.likes).toLocaleString() + " likes";
    copy.appendChild(likes);
  }
  link.append(thumb, copy);
  container.appendChild(link);
  const section = container.closest(".home-section");
  if (section) {
    const bothEmpty = ["homeTrendA", "homeTrendB"].every(id => {
      const el = document.getElementById(id);
      return !el || el.hidden;
    });
    section.hidden = bothEmpty;
  }
  return 1;
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
    position: Number(item.position || 0),
    title: item.title || media.title || item.caption || "",
    description: item.description || media.description || "",
    author: item.author || media.author || "",
    authorId: item.authorId || media.authorId || "",
    category: item.category || media.category || "",
    likes: item.likes == null ? null : Number(item.likes),
    views: item.views == null ? null : Number(item.views),
    comments: item.comments == null ? null : Number(item.comments),
    createdAt: item.createdAt || media.createdAt || null,
    table: item.table || media.table || ""
  };
}

export function renderSlot(key, container, suppliedSlot, options = {}) {
  if (!container) return 0;
  const slot = suppliedSlot || {};
  const items = (slot.items || []).map(itemShape).filter(item => item.src || item.poster);
  if (typeof options.renderer === "function") return options.renderer(slot, items, container);
  const preview = options.preview === true;
  container.classList.add("hshs-media-slot");
  container.dataset.mediaSlotKey = key;
  container.dataset.mediaSlotLayout = slot.layout || "grid";
  container.style.setProperty("--hshs-slot-aspect", slot.aspect_ratio || slot.aspectRatio || "16/9");
  if (key !== "home_hero") container.style.aspectRatio = slot.aspect_ratio || slot.aspectRatio || "16/9";
  container.setAttribute("aria-busy", "false");
  if (key === "home_hero" && container.classList.contains("vibe-hero-photos")) return renderHomeHero(container, items);
  if (key === "home_featured" && container.id === "featuredGrid") return renderHomeFeatured(container, slot, items);
  if (key === "home_trending_left" || key === "home_trending_right") return renderHomeTrend(container, items[0], key === "home_trending_left" ? 1 : 2);

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
    const card = document.createElement(item.linkUrl ? "a" : "article");
    card.className = "hshs-slot-card";
    card.dataset.mediaSlotItem = item.id;
    if (item.linkUrl) {
      card.href = item.linkUrl;
      card.setAttribute("aria-label", item.caption || "Open media");
    }
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

    fragment.appendChild(card);
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
    if (key === "home_hero" && container.classList.contains("vibe-hero-photos")) {
      container.querySelectorAll("span").forEach(span => span.classList.add("is-slot-loading"));
      return;
    }
    if (container.children.length) {
      container.setAttribute("aria-busy", "true");
      return;
    }
    showSkeleton(container, container.dataset.mediaSlotLayout || "grid", count);
  });
  if (!unique.length) return {};
  const url = PUBLIC_API + "?keys=" + encodeURIComponent(unique.join(","));
  const response = await fetch(url, { cache: options.noStore ? "no-store" : "default" });
  if (!response.ok) throw new Error("Media slots could not be loaded (" + response.status + ")");
  const payload = await response.json();
  const byKey = new Map((payload.slots || []).map(slot => [slot.key, slot]));
  Object.entries(containers || {}).forEach(([key, container]) => renderSlot(key, container, byKey.get(key) || null, {
    renderer: options.renderers && options.renderers[key]
  }));
  return Object.fromEntries(byKey);
}

if (typeof window !== "undefined") {
  window.HshsMediaSlots = { renderSlot, loadSlots, showSkeleton };
}
