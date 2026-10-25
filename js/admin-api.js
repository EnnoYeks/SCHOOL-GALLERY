// Thin wrapper for admin Worker routes. Gets Firebase ID token and calls /admin/*.
// No secrets in the client. Base from CONFIG.r2.signUrl.

import { auth, CONFIG } from "./config.js";

const BASE = (CONFIG.r2.signUrl || "").replace(/\/sign\/?$/i, "").replace(/\/$/, "");

async function getToken() {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) throw new Error("Not signed in");
  return await user.getIdToken();
}

async function call(method, path, body, isJson = true) {
  const token = await getToken();
  const opts = {
    method,
    headers: {
      Authorization: "Bearer " + token,
      ...(isJson && body ? { "Content-Type": "application/json" } : {})
    }
  };
  if (body) opts.body = isJson ? JSON.stringify(body) : body;
  const res = await fetch(BASE + path, opts);
  if (!res.ok) {
    let msg = res.statusText;
    try { const j = await res.json(); msg = j.error || j.message || msg; } catch (e) {}
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  try { return await res.json(); } catch (e) { return null; }
}

export const adminApi = {
  async me() { return call("GET", "/admin/me"); },
  async listPosts() { return call("GET", "/admin/posts"); },
  async createPost(data) { return call("POST", "/admin/posts", data); },
  async updatePost(id, data) { return call("PATCH", "/admin/posts/" + encodeURIComponent(id), data); },
  async deletePost(id) { return call("DELETE", "/admin/posts/" + encodeURIComponent(id)); },
  /** Unified content: target = posts | photos | videos */
  async createContent(data) { return call("POST", "/admin/content", data); },
  async updateContent(target, id, data) {
    return call("PATCH", "/admin/content/" + encodeURIComponent(target) + "/" + encodeURIComponent(id), data);
  },
  async deleteContent(target, id) {
    return call("DELETE", "/admin/content/" + encodeURIComponent(target) + "/" + encodeURIComponent(id));
  },
  async feature(id, featured, col = "posts") { return call("POST", "/admin/feature", { id, featured, col }); },
  async createEvent(data) { return call("POST", "/admin/events", data); },
  async deleteEvent(id) { return call("DELETE", "/admin/events/" + encodeURIComponent(id)); }
};

window.adminApi = adminApi;
