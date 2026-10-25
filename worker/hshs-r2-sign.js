/**
 * HSHS World — R2 + Admin Worker
 * Binding: MEDIA_BUCKET (hshs-world-media)
 * Vars: ADMIN_UIDS (comma list), SUPABASE_URL
 * Secret: SUPABASE_SERVICE_ROLE_KEY
 *
 * Existing routes kept working:
 *   POST /sign, PUT /put, GET /list, GET /
 *
 * New admin routes (require verified Firebase ID token + uid in ADMIN_UIDS):
 *   GET    /admin/me
 *   GET    /admin/posts
 *   POST   /admin/posts
 *   PATCH  /admin/posts/:id
 *   DELETE /admin/posts/:id
 *   PUT    /admin/upload
 *   POST   /admin/feature
 *   POST   /admin/events
 *   DELETE /admin/events/:id
 */

const PROJECT_ID = "school-gallery-62032";
const ISSUER = "https://securetoken.google.com/" + PROJECT_ID;
const ALLOWED_ORIGIN = "https://hshsgallery.vercel.app";

let certsCache = { keys: null, expires: 0 };

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

    // Existing public routes
    if (url.pathname === "/list" && request.method === "GET") {
      if (!bucket) return json({ error: "No R2 binding" }, 500);
      const limit = Math.min(100, Number(url.searchParams.get("limit") || 40));
      const prefix = url.searchParams.get("prefix") || undefined;
      const listed = await bucket.list({ limit, prefix });
      const objects = (listed.objects || []).map(o => ({ key: o.key, size: o.size, uploaded: o.uploaded }));
      return json({ objects });
    }

    if ((url.pathname === "/sign" || url.pathname === "/sign/") && request.method === "POST") {
      if (!bucket) return json({ error: "No R2 binding" }, 500);
      let body = {};
      try { body = await request.json(); } catch (e) {}
      const key = String(body.key || "").replace(/^\/+/, "");
      if (!key) return json({ error: "Missing key" }, 400);
      if (key.startsWith("admin/")) return json({ error: "Admin keys not allowed on /sign" }, 403);
      const putUrl = url.origin + "/put?key=" + encodeURIComponent(key);
      return json({ url: putUrl, putUrl, key });
    }

    if (url.pathname === "/put" && request.method === "PUT") {
      if (!bucket) return json({ error: "No R2 binding" }, 500);
      const key = url.searchParams.get("key");
      if (!key) return json({ error: "Missing key" }, 400);
      if (key.startsWith("admin/")) return json({ error: "Admin keys not allowed on /put" }, 403);
      const contentType = request.headers.get("content-type") || "application/octet-stream";
      await bucket.put(key, request.body, { httpMetadata: { contentType } });
      return new Response(null, { status: 200, headers: cors(false) });
    }

    // Admin routes
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
        const payload = {
          ...validation.data,
          author_id: uid,
          author_role: "admin",
          is_official: true,
          updated_at: new Date().toISOString()
        };
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
        if (row && row.media_key && bucket) {
          try { await bucket.delete(row.media_key); } catch (e) {}
        }
        const { error } = await sb.from("posts").delete().eq("id", id).eq("is_official", true);
        if (error) return json({ error: error.message }, 500, true);
        return new Response(null, { status: 204, headers: cors(true) });
      }

      if (url.pathname === "/admin/upload" && request.method === "PUT") {
        if (!bucket) return json({ error: "No R2 binding" }, 500, true);
        const contentType = request.headers.get("content-type") || "";
        const contentLength = Number(request.headers.get("content-length") || 0);
        const kind = contentType.startsWith("video/") ? "video" : "photo";
        const max = kind === "video" ? 104857600 : 52428800;
        if (contentLength > max) return json({ error: "File too large" }, 413, true);
        const allowed = kind === "video" ? ["video/mp4", "video/webm"] : ["image/jpeg", "image/png", "image/webp"];
        if (!allowed.includes(contentType)) return json({ error: "Unsupported type" }, 415, true);
        const ext = contentType.split("/")[1] || "bin";
        const key = "admin/" + uid + "/" + crypto.randomUUID() + "." + ext;
        await bucket.put(key, request.body, { httpMetadata: { contentType } });
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

      return json({ error: "Not found" }, 404, true);
    }

    return json({ error: "Not found" }, 404);
  }
};

const ALLOWED = new Set(["posts", "photos", "videos"]);

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
              const res = await fetch(q, {
                headers: { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json" }
              });
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
              const res = await fetch(q, {
                method: "DELETE",
                headers: { apikey: key, Authorization: "Bearer " + key }
              });
              resolve({ error: res.ok ? null : await res.json().catch(() => ({ message: res.statusText })) });
            }
          };
        }
      };
    }
  };
}

function validatePost(body, partial = false) {
  const title = String(body.title || "").slice(0, 200);
  const description = String(body.description || "").slice(0, 2000);
  const status = body.status || "draft";
  if (!["draft", "published"].includes(status)) return { ok: false, error: "Invalid status" };
  if (!partial && !description && !body.media_key && !body.image_url) return { ok: false, error: "Description or media required" };
  if (title.length > 200) return { ok: false, error: "Title too long" };
  return {
    ok: true,
    data: {
      title: title || "Untitled",
      description,
      type: body.type || "photo",
      image_url: body.image_url || "",
      thumbnail_url: body.thumbnail_url || body.image_url || "",
      media_key: body.media_key || "",
      media_provider: body.media_key ? "cloudflare-r2" : null,
      status,
      author: body.author || "HSHS Admin"
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
    // Signature verification with Google certs
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

function cors(admin = false) {
  const origin = admin ? ALLOWED_ORIGIN : "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": admin ? "Content-Type,Authorization" : "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
}

function json(data, status = 200, admin = false) {
  return new Response(JSON.stringify(data), {
    status,
    headers: Object.assign({ "Content-Type": "application/json" }, cors(admin))
  });
}
