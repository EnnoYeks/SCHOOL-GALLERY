const { supabaseAdmin } = require("./_supabase");

const TABLES = ["posts", "photos", "videos"];
const PAGE_TABLES = {
  home: TABLES,
  videos: ["videos"],
  photos: ["photos"],
  memories: TABLES,
  vibe: ["videos"],
  gallery: TABLES,
  trending: TABLES,
  spotlight: ["posts", "photos"]
};

function publicBase() {
  return String(process.env.R2_PUBLIC_BASE_URL || "").replace(/\/+$/, "");
}

function publicUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw) || /^data:image\//i.test(raw) || /^blob:/i.test(raw)) return raw;
  const base = publicBase();
  return base ? base + "/" + raw.replace(/^\/+/, "") : "";
}

function imageSource(row, layout) {
  const key = row.media_key || row.mediaKey || "";
  const processed = row.processed_key || row.processedKey || "";
  const width = Number(row.width || 0);
  const wanted = layout === "carousel" ? 1440 : layout === "strip" ? 320 : 960;
  if (processed && publicBase()) {
    const available = [320, 640, 960, 1440].filter((w) => !width || w <= width);
    if (available.length) {
      const selected = available.filter((w) => w <= wanted).pop() || available[0];
      return publicUrl(processed + "-" + selected + ".webp");
    }
  }
  if (key) {
    const fromKey = publicUrl(key);
    if (fromKey) return fromKey;
  }
  return publicUrl(row.thumbnail_url || row.thumbnailUrl || row.image_url || row.imageUrl || row.image || "");
}

function normalize(row, table, slot, item) {
  const isVideo = table === "videos" || String(row.type || row.media_type || "").toLowerCase() === "video";
  const poster = publicUrl(row.poster_key || row.posterKey || row.thumbnail_url || row.image_url || row.image || row.media_key || "");
  const src = isVideo
    ? publicUrl(row.preview_key || row.previewKey || row.video_url || row.videoUrl || row.media_key || "")
    : imageSource(row, slot.layout);
  if (!src && !poster) return null;
  return {
    id: row.id,
    table,
    title: item?.caption || row.title || row.description || "",
    caption: item?.caption || row.description || row.title || "",
    mediaType: isVideo ? "video" : "photo",
    src,
    poster,
    videoUrl: isVideo ? publicUrl(row.video_url || row.videoUrl || row.media_key || "") : "",
    createdAt: row.created_at || row.createdAt || null,
    likes: Number(row.likes ?? row.likes_count ?? 0),
    views: Number(row.views ?? row.views_count ?? 0),
    comments: Number(row.comments ?? row.comments_count ?? 0),
    focalX: item?.focal_x ?? 0.5,
    focalY: item?.focal_y ?? 0.5,
    linkUrl: item?.link_url || null,
    position: item?.position ?? null
  };
}

async function readMedia(sb, table, ids) {
  if (!ids.length) return [];
  let query = sb.from(table).select("*").in("id", ids);
  if (table === "posts") query = query.eq("status", "published");
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function latestMedia(sb, tables, limit) {
  const results = await Promise.all(tables.map(async (table) => {
    let query = sb.from(table).select("*").order("created_at", { ascending: false }).limit(Math.min(100, limit * 4));
    if (table === "posts") query = query.eq("status", "published");
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((row) => ({ row, table }));
  }));
  return results.flat().sort((a, b) => new Date(b.row.created_at || 0) - new Date(a.row.created_at || 0)).slice(0, limit);
}

async function mostLikedMedia(sb, tables, limit) {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: likes, error: likesError } = await sb.from("likes").select("item_id,type").gte("created_at", cutoff).limit(10000);
  if (likesError) throw likesError;
  const counts = new Map();
  (likes || []).forEach((like) => {
    const type = String(like.type || "post").toLowerCase();
    const table = type === "photo" || type === "photos" ? "photos" : type === "video" || type === "videos" ? "videos" : "posts";
    const key = table + ":" + like.item_id;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  const candidates = await latestMedia(sb, tables, Math.max(limit * 8, 40));
  return candidates
    .map((entry) => ({ ...entry, recentLikes: counts.get(entry.table + ":" + entry.row.id) || 0 }))
    .sort((a, b) => b.recentLikes - a.recentLikes || new Date(b.row.created_at || 0) - new Date(a.row.created_at || 0))
    .slice(0, limit);
}

async function getSlotItems(sb, slot) {
  const now = new Date().toISOString();
  const { data: manualRows, error } = await sb.from("media_slot_items")
    .select("*").eq("slot_key", slot.key).eq("visible", true)
    .or("starts_at.is.null,starts_at.lte." + now)
    .or("ends_at.is.null,ends_at.gt." + now)
    .order("position", { ascending: true });
  if (error) throw error;
  const manual = manualRows || [];
  const manualByTable = new Map();
  manual.forEach((item) => {
    if (!manualByTable.has(item.media_table)) manualByTable.set(item.media_table, []);
    manualByTable.get(item.media_table).push(item);
  });

  const manualEntries = [];
  for (const [table, items] of manualByTable.entries()) {
    const rows = await readMedia(sb, table, items.map((item) => item.media_id));
    const byId = new Map(rows.map((row) => [row.id, row]));
    items.forEach((item) => {
      const row = byId.get(item.media_id);
      if (row) manualEntries.push({ row, table, item });
    });
  }
  manualEntries.sort((a, b) => Number(a.item.position) - Number(b.item.position));

  if (slot.mode === "manual") {
    return manualEntries.map((entry) => normalize(entry.row, entry.table, slot, entry.item)).filter(Boolean).slice(0, slot.max_items);
  }

  const tables = PAGE_TABLES[slot.page] || TABLES;
  const remaining = Math.max(0, slot.max_items - (slot.mode === "mixed" ? manualEntries.length : 0));
  if (remaining === 0 && slot.mode === "mixed") {
    return manualEntries.map((entry) => normalize(entry.row, entry.table, slot, entry.item)).filter(Boolean).slice(0, slot.max_items);
  }

  const autoEntries = slot.mode === "most_liked"
    ? await mostLikedMedia(sb, tables, slot.mode === "mixed" ? remaining : slot.max_items)
    : await latestMedia(sb, tables, slot.mode === "mixed" ? remaining : slot.max_items);

  const manualKeys = new Set(manualEntries.map((entry) => entry.table + ":" + entry.row.id));
  const auto = autoEntries.filter((entry) => !manualKeys.has(entry.table + ":" + entry.row.id))
    .map((entry) => normalize(entry.row, entry.table, slot, null)).filter(Boolean);
  const curated = slot.mode === "mixed"
    ? manualEntries.map((entry) => normalize(entry.row, entry.table, slot, entry.item)).filter(Boolean).concat(auto)
    : auto;
  return curated.slice(0, slot.max_items);
}

module.exports = async function slots(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const sb = supabaseAdmin();
    const rawKeys = String(req.query.keys || "").split(",").map((key) => key.trim()).filter(Boolean);
    if (rawKeys.some((key) => !/^[a-z][a-z0-9_]{1,63}$/.test(key))) {
      return res.status(400).json({ error: "Invalid slot key" });
    }
    let query = sb.from("media_slots").select("*").eq("visible", true).order("page").order("key");
    if (rawKeys.length) query = query.in("key", [...new Set(rawKeys)]);
    const { data: slots, error } = await query;
    if (error) throw error;
    const result = await Promise.all((slots || []).map(async (slot) => ({
      key: slot.key,
      layout: slot.layout,
      aspectRatio: slot.aspect_ratio,
      visible: slot.visible,
      items: await getSlotItems(sb, slot)
    })));
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json({ slots: result });
  } catch (error) {
    console.error("[api/slots]", error.message);
    res.setHeader("Cache-Control", "no-store");
    return res.status(500).json({ error: "Could not load media slots" });
  }
};
