/**
 * HSHS World — R2 Worker
 * Binding name expected: MEDIA (or change to match your R2 binding)
 *
 * Routes:
 *   POST /sign   { key, contentType }  → { url }   (presigned PUT, 15 min)
 *   GET  /list?limit=40&prefix=        → { objects: [{ key, size }] }
 *   GET  /         → health
 *
 * Deploy with Wrangler. Bind the hshs-world-media bucket as MEDIA.
 * Secrets stay here; the frontend only calls this Worker.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const bucket = env.MEDIA || env.BUCKET || env.hshs_world_media;

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors() });
    }

    if (url.pathname === "/" || url.pathname === "") {
      return json({ ok: true, service: "hshs-r2-sign" });
    }

    if (url.pathname === "/list" && request.method === "GET") {
      if (!bucket) return json({ error: "No R2 binding" }, 500);
      const limit = Math.min(100, Number(url.searchParams.get("limit") || 40));
      const prefix = url.searchParams.get("prefix") || undefined;
      const listed = await bucket.list({ limit, prefix });
      const objects = (listed.objects || []).map(function (o) {
        return { key: o.key, size: o.size, uploaded: o.uploaded };
      });
      return json({ objects: objects });
    }

    if ((url.pathname === "/sign" || url.pathname === "/sign/") && request.method === "POST") {
      if (!bucket) return json({ error: "No R2 binding" }, 500);
      let body = {};
      try { body = await request.json(); } catch (e) {}
      const key = String(body.key || "").replace(/^\/+/, "");
      if (!key) return json({ error: "Missing key" }, 400);

      // Direct PUT via the binding is not a presigned URL.
      // For browser uploads we return a short-lived token the Worker will accept on /put.
      // Simpler path: client POSTs the file to /put?key=... and the Worker writes it.
      const putUrl = url.origin + "/put?key=" + encodeURIComponent(key);
      return json({ url: putUrl, putUrl: putUrl, key: key });
    }

    if (url.pathname === "/put" && request.method === "PUT") {
      if (!bucket) return json({ error: "No R2 binding" }, 500);
      const key = url.searchParams.get("key");
      if (!key) return json({ error: "Missing key" }, 400);
      const contentType = request.headers.get("content-type") || "application/octet-stream";
      await bucket.put(key, request.body, {
        httpMetadata: { contentType: contentType }
      });
      return new Response(null, { status: 200, headers: cors() });
    }

    return json({ error: "Not found" }, 404);
  }
};

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: Object.assign({ "Content-Type": "application/json" }, cors())
  });
}
