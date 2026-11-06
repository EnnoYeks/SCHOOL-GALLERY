/**
 * HSHS World - R2 + Admin Worker (upload-hardened)
 * Binding: MEDIA_BUCKET
 * Vars: ADMIN_UIDS, SUPABASE_URL, REQUIRE_UPLOAD_AUTH
 * Secret: SUPABASE_SERVICE_ROLE_KEY
 */
const PROJECT_ID = "school-gallery-62032";
const ISSUER = "https://securetoken.google.com/" + PROJECT_ID;
const ALLOWED_ORIGIN = "https://hshsgallery.vercel.app";
let certsCache = { keys: null, expires: 0 };

const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "video/mp4", "video/webm", "video/quicktime"
]);
const MAX_PHOTO = 25 * 1024 * 1024;
const MAX_VIDEO = 50 * 1024 * 1024;
const ALLOWED = new Set(["posts", "photos", "videos"]);

function cors(admin = false) {
  const origin = admin ? ALLOWED_ORIGIN : (ALLOWED_ORIGIN || "*");
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Max-Age": "86400"
  };
}
function json(data, status = 200, admin = false) {
  return new Response(JSON.stringify(data), {
    status,
    headers: Object.assign({ "Content-Type": "application/json" }, cors(admin))
  });
}
function validateKey(key, uid) {
  if (!key || key.length > 512) return "Invalid key";
  if (key.includes("..") || key.startsWith("/") || key.startsWith("admin/")) return "Invalid key path";
  if (!/^(photos|videos)\//.test(key)) return "Key must start with photos/ or videos/";
  return null;
}
function requireUploadAuth(env) {
  return String(env.REQUIRE_UPLOAD_AUTH || "") === "1";
}
async function optionalUploadAuth(request, env) {
  const auth = request.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) {
    if (requireUploadAuth(env)) return { ok: false, status: 401, error: "Missing token" };
    return { ok: true, uid: null, optional: true };
  }
  return verifyFirebaseToken(request);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const bucket = env.MEDIA_BUCKET || env.MEDIA || env.BUCKET || env.hshs_world_media;
    const isAdminRoute = url.pathname.startsWith("/admin/");

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors(isAdminRoute) });
    }
    if (url.pathname === "/" || url.pathname === "") {
      return json({ ok: true, service: "hshs-r2-sign" }, 200, isAdminRoute);
    }

    if (url.pathname === "/list" && request.method === "GET") {
      if (!bucket) return json({ error: "No R2 binding" }, 500);
      try {
        const limit = Math.min(100, Number(url.searchParams.get("limit") || 40));
        const prefix = url.searchParams.get("prefix") || undefined;
        const listed = await bucket.list({ limit, prefix });
        const objects = (listed.objects || []).map(o => ({ key: o.key, size: o.size, uploaded: o.uploaded }));
        const res = json({ objects });
        res.headers.set("Cache-Control", "public, max-age=45");
        return res;
      } catch (e) {
        return json({ error: "List failed", detail: String(e && e.message || e) }, 500);
      }
    }

    if ((url.pathname === "/sign" || url.pathname === "/sign/") && request.method === "POST") {
      if (!bucket) return json({ error: "No R2 binding" }, 500);
      const verified = await optionalUploadAuth(request, env);
      if (!verified.ok) return json({ error: verified.error || "Unauthorized" }, verified.status || 401);
      let body = {};
      try { body = await request.json(); } catch (e) {}
      const key = String(body.key || "").replace(/^\/+/, "");
      if (!key) return json({ error: "Missing key" }, 400);
      const keyErr = validateKey(key, verified.uid);
      if (keyErr) return json({ error: keyErr }, 400);
      const contentType = String(body.contentType || body.content_type || "").toLowerCase();
      const size = Number(body.size || 0);
      const kind = String(body.kind || (contentType.startsWith("video/") ? "video" : "photo"));
      if (contentType && !ALLOWED_TYPES.has(contentType) && !contentType.startsWith("image/") && !contentType.startsWith("video/")) {
        return json({ error: "Unsupported content type" }, 415);
      }
      const max = kind === "video" ? MAX_VIDEO : MAX_PHOTO;
      if (size > max) return json({ error: "File too large (max " + Math.round(max / 1048576) + " MB)" }, 413);
      const putUrl = url.origin + "/put?key=" + encodeURIComponent(key);
      return json({ url: putUrl, putUrl, key, requestId: crypto.randomUUID() });
    }

    if (url.pathname === "/put" && request.method === "PUT") {
      if (!bucket) return json({ error: "No R2 binding" }, 500);
      const verified = await optionalUploadAuth(request, env);
      if (!verified.ok) return json({ error: verified.error || "Unauthorized" }, verified.status || 401);
      const key = String(url.searchParams.get("key") || "").replace(/^\/+/, "");
      if (!key) return json({ error: "Missing key" }, 400);
      const keyErr = validateKey(key, verified.uid);
      if (keyErr) return json({ error: keyErr }, 400);
      const contentType = (request.headers.get("content-type") || "application/octet-stream").toLowerCase();
      if (contentType && contentType !== "application/octet-stream") {
        if (!ALLOWED_TYPES.has(contentType) && !contentType.startsWith("image/") && !contentType.startsWith("video/")) {
          return json({ error: "Unsupported content type" }, 415);
        }
      }
      const lenHeader = request.headers.get("content-length");
      if (lenHeader != null) {
        const len = Number(lenHeader);
        const isVideo = contentType.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(key);
        const max = isVideo ? MAX_VIDEO : MAX_PHOTO;
        if (len > max) return json({ error: "File too large" }, 413);
      }
      try {
        await bucket.put(key, request.body, {
          httpMetadata: {
            contentType,
            cacheControl: "public, max-age=31536000, immutable"
          }
        });
        return new Response(null, { status: 200, headers: cors(false) });
      } catch (e) {
        return json({
          error: "Upload failed",
          detail: String(e && e.message || e),
          requestId: crypto.randomUUID()
        }, 500);
      }
    }

    if (isAdminRoute) {
      const verified = await verifyFirebaseToken(request);
      if (!verified.ok) return json({ error: verified.error }, verified.status, true);
      const uid = verified.uid;
      if (!isAdmin(uid, env)) return json({ error: "Forbidden" }, 403, true);
      const sb = supabaseClient(env);

      if (url.pathname === "/admin/me" && request.method === "GET") {
        return json({ uid, admin: true }, 200, true);
      }
      if (url.pathname === "/admin/posts" && request.method === "GET") {
        const { data, error } = await sb.from("posts").select("*").eq("is_official", true).order("created_at", { ascending: false });
        if (error) return json({ error: error.message }, 500, true);
        return json({ posts: data || [] }, 200, true);
      }
      if (url.pathname === "/admin/posts" && request.method === "POST") {
        let body = {};
        try { body = await request.json(); } catch (e) {}
        const validation = validatePost(body);
        if (!validation.ok) return json({ error: validation.error }, 400, true);
        const payload = { ...validation.data, author_id: uid, author_role: "admin", is_official: true, updated_at: new Date().toISOString() };
        const { data, error } = await sb.from("posts").insert(payload).select().single();
        if (error) return json({ error: error.message }, 500, true);
        return json(data, 201, true);
      }
      const postIdMatch = url.pathname.match(/^\/admin\/posts\/([^/]+)$/);
      if (postIdMatch && request.method === "PATCH") {
        const id = postIdMatch[1];
        let body = {};
        try { body = await request.json(); } catch (e) {}
        const validation = validatePost(body, true);
        if (!validation.ok) return json({ error: validation.error }, 400, true);
        const patch = { ...validation.data, updated_at: new Date().toISOString() };
        delete patch.author_id; delete patch.author_role; delete patch.is_official;
        const { data, error } = await sb.from("posts").update(patch).eq("id", id).eq("is_official", true).select().single();
        if (error) return json({ error: error.message }, 500, true);
        return json(data, 200, true);
      }
      if (postIdMatch && request.method === "DELETE") {
        const id = postIdMatch[1];
        const { data: row } = await sb.from("posts").select("media_key").eq("id", id).eq("is_official", true).single();
        if (row && row.media_key && bucket) { try { await bucket.delete(row.media_key); } catch (e) {} }
        const { error } = await sb.from("posts").delete().eq("id", id).eq("is_official", true);
        if (error) return json({ error: error.message }, 500, true);
        return new Response(null, { status: 204, headers: cors(true) });
      }
      if (url.pathname === "/admin/upload" && request.method === "PUT") {
        if (!bucket) return json({ error: "No R2 binding" }, 500, true);
        const contentType = request.headers.get("content-type") || "";
        const contentLength = Number(request.headers.get("content-length") || 0);
        const kind = contentType.startsWith("video/") ? "video" : "photo";
        const max = kind === "video" ? MAX_VIDEO : MAX_PHOTO;
        if (contentLength > max) return json({ error: "File too large" }, 413, true);
        const allowed = kind === "video" ? ["video/mp4", "video/webm"] : ["image/jpeg", "image/png", "image/webp"];
        if (!allowed.includes(contentType)) return json({ error: "Unsupported type" }, 415, true);
        const ext = contentType.split("/")[1] || "bin";
        const key = "admin/" + uid + "/" + crypto.randomUUID() + "." + ext;
        await bucket.put(key, request.body, { httpMetadata: { contentType, cacheControl: "public, max-age=31536000, immutable" } });
        return json({ key }, 200, true);
      }
      if (url.pathname === "/admin/feature" && request.method === "POST") {
        let body = {};
        try { body = await request.json(); } catch (e) {}
        const { id, featured, col } = body;
        if (!id || !ALLOWED.has(col)) return json({ error: "Invalid feature request" }, 400, true);
        const patch = featured ? { featured: true, featured_at: new Date().toISOString() } : { featured: false, featured_at: null };
        const { error } = await sb.from(col).update(patch).eq("id", id);
        if (error) return json({ error: error.message }, 500, true);
        return json({ ok: true }, 200, true);
      }
      if (url.pathname === "/admin/events" && request.method === "POST") {
        let body = {};
        try { body = await request.json(); } catch (e) {}
        if (!body.title || !body.date) return json({ error: "Title and date required" }, 400, true);
        const { data, error } = await sb.from("events").insert({ title: body.title, date: body.date, location: body.location || "" }).select().single();
        if (error) return json({ error: error.message }, 500, true);
        return json(data, 201, true);
      }
      const eventIdMatch = url.pathname.match(/^\/admin\/events\/([^/]+)$/);
      if (eventIdMatch && request.method === "DELETE") {
        const id = eventIdMatch[1];
        const { error } = await sb.from("events").delete().eq("id", id);
        if (error) return json({ error: error.message }, 500, true);
        return new Response(null, { status: 204, headers: cors(true) });
      }
      if (url.pathname === "/admin/content" && request.method === "POST") {
        let body = {};
        try { body = await request.json(); } catch (e) {}
        const target = String(body.target || "posts");
        if (!ALLOWED.has(target)) return json({ error: "Invalid target" }, 400, true);
        const row = contentPayload(body, target, uid);
        if (!row.ok) return json({ error: row.error }, 400, true);
        const { data, error } = await sb.from(target).insert(row.data).select().single();
        if (error) return json({ error: error.message || "Insert failed" }, 500, true);
        return json(data, 201, true);
      }
      const contentMatch = url.pathname.match(/^\/admin\/content\/([^/]+)\/([^/]+)$/);
      if (contentMatch && request.method === "PATCH") {
        const target = contentMatch[1], id = contentMatch[2];
        if (!ALLOWED.has(target)) return json({ error: "Invalid target" }, 400, true);
        let body = {};
        try { body = await request.json(); } catch (e) {}
        const row = contentPayload(body, target, uid, true);
        if (!row.ok) return json({ error: row.error }, 400, true);
        const { data, error } = await sb.from(target).update(row.data).eq("id", id).single();
        if (error) return json({ error: error.message || "Update failed" }, 500, true);
        return json(data, 200, true);
      }
      if (contentMatch && request.method === "DELETE") {
        const target = contentMatch[1], id = contentMatch[2];
        if (!ALLOWED.has(target)) return json({ error: "Invalid target" }, 400, true);
        const { error } = await sb.from(target).delete().eq("id", id);
        if (error) return json({ error: error.message || "Delete failed" }, 500, true);
        return new Response(null, { status: 204, headers: cors(true) });
      }
      return json({ error: "Not found" }, 404, true);
    }
    return json({ error: "Not found" }, 404);
  }
};

function isAdmin(uid, env) {
  const list = String(env.ADMIN_UIDS || "").split(",").map(s => s.trim()).filter(Boolean);
  return list.includes(uid);
}
function supabaseClient(env) {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase config");
  return {
    from(table) {
      return {
        select(cols) {
          return {
            eq(col, val) { this._eq = { col, val }; return this; },
            order(col, opts) { this._order = { col, opts }; return this; },
            async then(resolve) {
              const q = new URL(url + "/rest/v1/" + table);
              q.searchParams.set("select", cols || "*");
              if (this._eq) q.searchParams.set(this._eq.col, "eq." + this._eq.val);
              if (this._order) q.searchParams.set("order", this._order.col + "." + (this._order.opts?.ascending === false ? "desc" : "asc"));
              const res = await fetch(q, { headers: { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json" } });
              const data = await res.json();
              resolve({ data, error: res.ok ? null : data });
            }
          };
        },
        insert(payload) {
          return {
            select() { return this; },
            async single() {
              const res = await fetch(url + "/rest/v1/" + table, {
                method: "POST",
                headers: { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json", Prefer: "return=representation" },
                body: JSON.stringify(payload)
              });
              const data = await res.json();
              return { data: Array.isArray(data) ? data[0] : data, error: res.ok ? null : data };
            }
          };
        },
        update(payload) {
          return {
            eq(col, val) { this._eq = { col, val }; return this; },
            select() { return this; },
            async single() {
              const q = new URL(url + "/rest/v1/" + table);
              if (this._eq) q.searchParams.set(this._eq.col, "eq." + this._eq.val);
              const res = await fetch(q, {
                method: "PATCH",
                headers: { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json", Prefer: "return=representation" },
                body: JSON.stringify(payload)
              });
              const data = await res.json();
              return { data: Array.isArray(data) ? data[0] : data, error: res.ok ? null : data };
            }
          };
        },
        delete() {
          return {
            eq(col, val) { this._eq = { col, val }; return this; },
            async then(resolve) {
              const q = new URL(url + "/rest/v1/" + table);
              if (this._eq) q.searchParams.set(this._eq.col, "eq." + this._eq.val);
              const res = await fetch(q, { method: "DELETE", headers: { apikey: key, Authorization: "Bearer " + key } });
              resolve({ error: res.ok ? null : await res.json().catch(() => ({ message: res.statusText })) });
            }
          };
        }
      };
    }
  };
}
function contentPayload(body, target, uid, partial = false) {
  const title = String(body.title || "").slice(0, 200);
  const description = String(body.description || "").slice(0, 2000);
  const category = String(body.category || "events").slice(0, 40);
  const class_tag = String(body.class_tag || body.classTag || "Campus").slice(0, 40);
  const type = String(body.type || (target === "videos" ? "video" : "photo")).slice(0, 20);
  const image_url = String(body.image_url || body.image || "").slice(0, 1000);
  const video_url = String(body.video_url || "").slice(0, 1000);
  const thumbnail_url = String(body.thumbnail_url || image_url || "").slice(0, 1000);
  const media_key = String(body.media_key || body.mediaKey || "").slice(0, 500);
  if (!partial && target === "photos" && !image_url && !media_key) return { ok: false, error: "Photo requires media" };
  if (!partial && target === "videos" && !video_url && !media_key) return { ok: false, error: "Video requires media" };
  if (!partial && target === "posts" && !description && !image_url && !media_key) return { ok: false, error: "Description or media required" };
  const data = {
    title: title || (target === "photos" ? "Photo" : target === "videos" ? "Video" : "Untitled"),
    description, category, class_tag, image: image_url, image_url, thumbnail_url, media_key,
    media_provider: media_key ? "cloudflare-r2" : null,
    author: body.author || "HSHS Admin", author_id: uid, updated_at: new Date().toISOString()
  };
  if (target === "posts") {
    data.type = type;
    data.status = ["draft", "published"].includes(body.status) ? body.status : "published";
    data.is_official = true;
    data.author_role = "admin";
  }
  if (target === "videos") { data.video_url = video_url; data.type = "video"; }
  if (body.feature) data.featured = true;
  return { ok: true, data };
}
function validatePost(body, partial = false) {
  const title = String(body.title || "").slice(0, 200);
  const description = String(body.description || "").slice(0, 2000);
  const status = body.status || "draft";
  if (!["draft", "published"].includes(status)) return { ok: false, error: "Invalid status" };
  if (!partial && !description && !body.media_key && !body.image_url) return { ok: false, error: "Description or media required" };
  return {
    ok: true,
    data: {
      title: title || "Untitled", description, type: body.type || "photo",
      image_url: body.image_url || "", thumbnail_url: body.thumbnail_url || body.image_url || "",
      media_key: body.media_key || "", media_provider: body.media_key ? "cloudflare-r2" : null,
      status, author: body.author || "HSHS Admin"
    }
  };
}
async function verifyFirebaseToken(request) {
  const auth = request.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return { ok: false, status: 401, error: "Missing token" };
  const token = auth.slice(7);
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { ok: false, status: 401, error: "Invalid token" };
    const header = JSON.parse(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")));
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.iss !== ISSUER || payload.aud !== PROJECT_ID) return { ok: false, status: 401, error: "Bad iss/aud" };
    if (payload.exp * 1000 < Date.now()) return { ok: false, status: 401, error: "Expired" };
    if (!payload.sub) return { ok: false, status: 401, error: "No sub" };
    if (payload.firebase && payload.firebase.sign_in_provider === "anonymous") return { ok: false, status: 401, error: "Anonymous not allowed" };
    const keys = await getGoogleCerts();
    const key = keys[header.kid];
    if (!key) return { ok: false, status: 401, error: "Unknown kid" };
    const data = new TextEncoder().encode(parts[0] + "." + parts[1]);
    const sig = Uint8Array.from(atob(parts[2].replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey("jwk", key, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", cryptoKey, sig, data);
    if (!valid) return { ok: false, status: 401, error: "Bad signature" };
    return { ok: true, uid: payload.sub };
  } catch (e) {
    return { ok: false, status: 401, error: "Token verify failed" };
  }
}
async function getGoogleCerts() {
  if (certsCache.keys && Date.now() < certsCache.expires) return certsCache.keys;
  const res = await fetch("https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com");
  const keys = await res.json();
  certsCache = { keys, expires: Date.now() + 3600000 };
  return keys;
}
