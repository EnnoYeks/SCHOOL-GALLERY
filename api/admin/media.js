const { requireAdmin } = require("../_auth");
const { supabaseAdmin } = require("../_supabase");

const TABLES = new Set(["posts", "photos", "videos"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LAYOUTS = new Set(["carousel", "grid", "strip", "card"]);
const MODES = new Set(["manual", "latest", "most_liked", "mixed"]);

function fail(res, status, error) {
  return res.status(status).json({ error });
}
function cleanText(value, max) {
  return String(value == null ? "" : value).trim().slice(0, max);
}
function validUrl(value) {
  if (value == null || value === "") return null;
  try {
    const url = new URL(String(value));
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : false;
  } catch (_) { return false; }
}
function validDate(value) {
  if (value == null || value === "") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? false : date.toISOString();
}
function publicMedia(row) {
  if (!row) return null;
  const base = String(process.env.R2_PUBLIC_BASE_URL || "").replace(/\/+$/, "");
  const key = row.media_key || row.mediaKey || "";
  const direct = row.thumbnail_url || row.image_url || row.image || row.video_url || "";
  const src = key && base ? base + "/" + String(key).replace(/^\/+/, "") : direct;
  return {
    id: row.id,
    title: row.title || row.description || "Untitled media",
    description: row.description || "",
    type: row.media_type || row.type || (row.video_url ? "video" : "photo"),
    src,
    media_key: key,
    created_at: row.created_at || null,
    likes: Number(row.likes ?? row.likes_count ?? 0),
    views: Number(row.views ?? row.views_count ?? 0)
  };
}
async function getMediaRows(sb, table, ids) {
  if (!ids.length) return [];
  let query = sb.from(table).select("*").in("id", ids);
  if (table === "posts") query = query.eq("status", "published");
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
async function hydrateItems(sb, items) {
  const grouped = new Map();
  items.forEach((item) => {
    if (!grouped.has(item.media_table)) grouped.set(item.media_table, []);
    grouped.get(item.media_table).push(item);
  });
  const hydrated = [];
  for (const [table, rows] of grouped.entries()) {
    const media = await getMediaRows(sb, table, rows.map((row) => row.media_id));
    const byId = new Map(media.map((row) => [row.id, row]));
    rows.forEach((item) => {
      const source = byId.get(item.media_id) || null;
      hydrated.push({ ...item, media: publicMedia(source), missing: !source });
    });
  }
  return hydrated.sort((a, b) => a.slot_key.localeCompare(b.slot_key) || Number(a.position) - Number(b.position));
}
async function readLibrary(sb, req) {
  const table = TABLES.has(req.query.table) ? req.query.table : null;
  const search = cleanText(req.query.search, 100).toLowerCase();
  const selected = table ? [table] : [...TABLES];
  const results = await Promise.all(selected.map(async (name) => {
    let query = sb.from(name).select("*").order("created_at", { ascending: false }).limit(100);
    if (name === "posts") query = query.eq("status", "published");
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((row) => ({ table: name, ...publicMedia(row) }));
  }));
  return results.flat().filter((item) => !search || [item.title, item.description, item.type].join(" ").toLowerCase().includes(search));
}
async function getSlot(sb, key) {
  const { data, error } = await sb.from("media_slots").select("key").eq("key", key).maybeSingle();
  if (error) throw error;
  return data;
}
async function getItem(sb, id) {
  const { data, error } = await sb.from("media_slot_items").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}
async function neighbor(sb, slotKey, id) {
  if (!id) return null;
  const { data, error } = await sb.from("media_slot_items").select("id,slot_key,position").eq("id", id).eq("slot_key", slotKey).maybeSingle();
  if (error) throw error;
  return data;
}
async function nextPosition(sb, slotKey) {
  const { data, error } = await sb.from("media_slot_items").select("position").eq("slot_key", slotKey).order("position", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data ? Number(data.position) + 1 : 1;
}
async function computePosition(sb, slotKey, previousId, nextId) {
  const [previous, next] = await Promise.all([
    neighbor(sb, slotKey, previousId),
    neighbor(sb, slotKey, nextId)
  ]);
  if (previousId && !previous) throw new Error("Previous item does not belong to this slot");
  if (nextId && !next) throw new Error("Next item does not belong to this slot");
  if (previous && next) {
    if (Number(previous.position) >= Number(next.position)) throw new Error("Invalid item order");
    return { position: (Number(previous.position) + Number(next.position)) / 2, gap: Number(next.position) - Number(previous.position) };
  }
  if (next) return { position: Number(next.position) - 1, gap: Infinity };
  if (previous) return { position: Number(previous.position) + 1, gap: Infinity };
  return { position: await nextPosition(sb, slotKey), gap: Infinity };
}
async function reorder(sb, body) {
  if (!UUID.test(String(body.id || ""))) throw new Error("Invalid item ID");
  const item = await getItem(sb, body.id);
  if (!item) throw new Error("Media slot item not found");
  let result = await computePosition(sb, item.slot_key, body.previous_id || null, body.next_id || null);
  if (result.gap < 0.0001) {
    const { error: renumberError } = await sb.rpc("hshs_renumber_media_slot_items", { p_slot_key: item.slot_key });
    if (renumberError) throw renumberError;
    result = await computePosition(sb, item.slot_key, body.previous_id || null, body.next_id || null);
  }
  const { data, error } = await sb.from("media_slot_items").update({ position: result.position, updated_at: new Date().toISOString() }).eq("id", item.id).select("*").single();
  if (error) throw error;
  return data;
}
async function handlePost(sb, body) {
  const action = String(body.action || "");
  if (action === "save-slot") {
    const key = cleanText(body.key, 64);
    const label = cleanText(body.label, 100);
    const page = cleanText(body.page, 40);
    const layout = String(body.layout || "");
    const mode = String(body.mode || "manual");
    const maxItems = Number(body.max_items);
    const aspect = String(body.aspect_ratio || "16/9");
    if (!/^[a-z][a-z0-9_]{1,63}$/.test(key) || !label || !page || !LAYOUTS.has(layout) || !MODES.has(mode)) throw new Error("Invalid slot settings");
    if (!Number.isInteger(maxItems) || maxItems < 1 || maxItems > 100) throw new Error("max_items must be between 1 and 100");
    if (!/^\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?$/.test(aspect)) throw new Error("Invalid aspect ratio");
    const { data, error } = await sb.from("media_slots").upsert({
      key, label, page, layout, mode, max_items: maxItems, aspect_ratio: aspect.replace(/\s/g, ""),
      visible: body.visible !== false, updated_at: new Date().toISOString()
    }).select("*").single();
    if (error) throw error;
    return data;
  }
  if (action === "add-item") {
    const slotKey = cleanText(body.slot_key, 64);
    const table = String(body.media_table || "");
    const mediaId = String(body.media_id || "");
    if (!/^[a-z][a-z0-9_]{1,63}$/.test(slotKey) || !TABLES.has(table) || !UUID.test(mediaId)) throw new Error("Invalid media assignment");
    if (!(await getSlot(sb, slotKey))) throw new Error("Media slot not found");
    const sourceRows = await getMediaRows(sb, table, [mediaId]);
    if (!sourceRows.length) throw new Error("Selected media is missing or not public");
    const position = body.position == null ? await nextPosition(sb, slotKey) : Number(body.position);
    if (!Number.isFinite(position)) throw new Error("Invalid position");
    const link = validUrl(body.link_url);
    if (link === false) throw new Error("Link must be an http or https URL");
    const { data, error } = await sb.from("media_slot_items").insert({
      slot_key: slotKey, media_table: table, media_id: mediaId, position,
      caption: cleanText(body.caption, 2000) || null, link_url: link,
      focal_x: body.focal_x == null ? 0.5 : Number(body.focal_x),
      focal_y: body.focal_y == null ? 0.5 : Number(body.focal_y),
      starts_at: validDate(body.starts_at), ends_at: validDate(body.ends_at),
      visible: body.visible !== false
    }).select("*").single();
    if (error) throw error;
    return data;
  }
  if (action === "update-item") {
    const id = String(body.id || "");
    if (!UUID.test(id)) throw new Error("Invalid item ID");
    const patch = { updated_at: new Date().toISOString() };
    if ("caption" in body) patch.caption = cleanText(body.caption, 2000) || null;
    if ("link_url" in body) {
      const link = validUrl(body.link_url);
      if (link === false) throw new Error("Link must be an http or https URL");
      patch.link_url = link;
    }
    if ("visible" in body) patch.visible = body.visible === true;
    if ("focal_x" in body) patch.focal_x = Number(body.focal_x);
    if ("focal_y" in body) patch.focal_y = Number(body.focal_y);
    if ("starts_at" in body) patch.starts_at = validDate(body.starts_at);
    if ("ends_at" in body) patch.ends_at = validDate(body.ends_at);
    if (patch.focal_x != null && (!Number.isFinite(patch.focal_x) || patch.focal_x < 0 || patch.focal_x > 1)) throw new Error("focal_x must be between 0 and 1");
    if (patch.focal_y != null && (!Number.isFinite(patch.focal_y) || patch.focal_y < 0 || patch.focal_y > 1)) throw new Error("focal_y must be between 0 and 1");
    if (patch.starts_at && patch.ends_at && patch.starts_at >= patch.ends_at) throw new Error("Start date must be before end date");
    const { data, error } = await sb.from("media_slot_items").update(patch).eq("id", id).select("*").single();
    if (error) throw error;
    return data;
  }
  if (action === "reorder") return reorder(sb, body);
  if (action === "delete-item") {
    const id = String(body.id || "");
    if (!UUID.test(id)) throw new Error("Invalid item ID");
    const { error } = await sb.from("media_slot_items").delete().eq("id", id);
    if (error) throw error;
    return { id, deleted: true };
  }
  throw new Error("Unknown media manager action");
}

module.exports = async function adminMedia(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET" && req.method !== "POST" && req.method !== "DELETE") {
    res.setHeader("Allow", "GET, POST, DELETE");
    return fail(res, 405, "Method not allowed");
  }
  const decoded = await requireAdmin(req, res);
  if (!decoded) return;
  try {
    const sb = supabaseAdmin();
    if (req.method === "GET") {
      const [slotsResult, itemsResult, library] = await Promise.all([
        sb.from("media_slots").select("*").order("page").order("key"),
        sb.from("media_slot_items").select("*").order("slot_key").order("position"),
        readLibrary(sb, req)
      ]);
      if (slotsResult.error) throw slotsResult.error;
      if (itemsResult.error) throw itemsResult.error;
      return res.status(200).json({
        admin: { uid: decoded.uid, email: decoded.email || null },
        slots: slotsResult.data || [],
        items: await hydrateItems(sb, itemsResult.data || []),
        library
      });
    }
    const body = req.method === "DELETE" ? { action: "delete-item", id: req.query.id } : (req.body || {});
    const data = await handlePost(sb, body);
    return res.status(200).json({ ok: true, data });
  } catch (error) {
    const message = String(error.message || "Media manager request failed");
    const status = /not found/i.test(message) ? 404 : /invalid|must be|unknown|before|between/i.test(message) ? 400 : 500;
    console.error("[api/admin/media]", message);
    return fail(res, status, status === 500 ? "Media manager operation failed" : message);
  }
};
