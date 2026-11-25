#!/usr/bin/env node
/**
 * HSHS World media reference audit.
 * Required environment: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 * Optional: R2_LIST_URL and R2_PUBLIC_BASE.
 * Read-only against Supabase. Audit and backup files are written locally only.
 */
import { readdir, readFile, mkdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const SUPABASE_URL = String(process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const R2_LIST_URL = process.env.R2_LIST_URL || "https://hshs-r2-sign.ennoyeks.workers.dev/list";
const R2_PUBLIC_BASE = (process.env.R2_PUBLIC_BASE || "https://pub-cf880c90c5ff4ca697baac59284a6024.r2.dev").replace(/\/+$/, "");
const PAGE_SIZE = 1000;
const R2_PAGE_SIZE = 100;
const SKIP = new Set([".git", "node_modules", ".vercel", "dist", "build", "coverage", "audit", "backup"]);
const EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".html", ".css", ".json", ".md", ".webmanifest", ".xml", ".txt"]);
const TABLES = {
  photos: ["image", "image_url", "thumbnail_url", "media_key", "media_provider", "processed_key"],
  posts: ["image", "image_url", "thumbnail_url", "media_key", "media_provider"],
  videos: ["video_url", "image", "image_url", "thumbnail_url", "media_key", "media_provider", "poster_key", "preview_key"],
  users: ["photo_url"]
};

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY locally. Their values are never printed.");
  process.exit(2);
}

const rows = [];
const liveKeys = new Set();

function csvCell(value) {
  return '"' + String(value ?? "").replace(/"/g, '""') + '"';
}
function add(sourceType, location, rowId, column, line, raw, key, verdict) {
  rows.push({ source_type: sourceType, location, row_id: rowId, column, line, raw_reference: raw, object_key: key, verdict });
}
function parseR2(raw) {
  try {
    const url = new URL(raw);
    if (url.hostname !== new URL(R2_PUBLIC_BASE).hostname) return null;
    return decodeURIComponent(url.pathname.replace(/^\/+/, ""));
  } catch { return null; }
}
function classifyReference(raw, column = "") {
  const value = String(raw || "").trim();
  if (!value) return null;
  if (/^blob:/i.test(value)) return { key: "", verdict: "BLOB" };
  if (/^data:/i.test(value)) return { key: "", verdict: "DATA_URI" };
  if (/^https?:\/\//i.test(value)) {
    const key = parseR2(value);
    if (key === "") return null;
    if (key !== null) return { key, verdict: liveKeys.has(key) ? "OK" : "DEAD" };
    return { key: "", verdict: "EXTERNAL" };
  }
  if (column.endsWith("_key") || column === "media_key" || column === "processed_key") {
    if (/^[a-z0-9_-]+\/.+/i.test(value)) return { key: value, verdict: liveKeys.has(value) ? "OK" : "DEAD" };
  }
  if (/^\/?assets\//i.test(value)) return { key: value.replace(/^\/+/, ""), verdict: "LOCAL_PENDING" };
  return { key: "", verdict: "EXTERNAL" };
}
async function fetchJson(url, init = {}) {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error("HTTP " + response.status + " while requesting " + new URL(url).pathname);
  return response.json();
}
async function listLiveObjects() {
  let cursor = "";
  const seen = new Set();
  const objects = [];
  for (let page = 0; page < 10000; page++) {
    const url = new URL(R2_LIST_URL);
    url.searchParams.set("limit", String(R2_PAGE_SIZE));
    if (cursor) url.searchParams.set("cursor", cursor);
    const data = await fetchJson(url);
    if (!Array.isArray(data.objects)) throw new Error("R2 Worker response has no objects array.");
    for (const item of data.objects) {
      if (item && typeof item.key === "string") {
        objects.push(item);
        liveKeys.add(item.key);
      }
    }
    if (data.truncated === true) {
      if (!data.cursor || seen.has(data.cursor)) throw new Error("R2 pagination cursor is missing or repeated; inventory is incomplete.");
      seen.add(data.cursor);
      cursor = data.cursor;
      continue;
    }
    if (data.truncated === false) return objects;
    throw new Error("R2 Worker does not expose pagination metadata. Deploy the updated Worker or provide a Cloudflare dashboard bucket export.");
  }
  throw new Error("R2 listing exceeded the page safety limit.");
}
async function readTable(table, columns) {
  const output = [];
  for (let offset = 0; offset < 1000000; offset += PAGE_SIZE) {
    const url = new URL(SUPABASE_URL + "/rest/v1/" + table);
    url.searchParams.set("select", ["id", ...columns].join(","));
    url.searchParams.set("order", "id.asc");
    const response = await fetch(url, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: "Bearer " + SERVICE_KEY,
        Range: offset + "-" + (offset + PAGE_SIZE - 1),
        "Range-Unit": "items"
      }
    });
    if (!response.ok) throw new Error("Supabase read failed for " + table + " (" + response.status + "). Check schema and permissions.");
    const batch = await response.json();
    if (!Array.isArray(batch)) throw new Error("Unexpected Supabase response for " + table);
    output.push(...batch);
    if (batch.length < PAGE_SIZE) return output;
  }
  throw new Error("Supabase table " + table + " exceeded the page safety limit.");
}
async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP.has(entry.name)) await walk(path.join(dir, entry.name), out);
    } else if (EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}
async function scanRepository() {
  const files = await walk(ROOT);
  const urlPattern = /https?:\/\/[^\s"'<>]+/gi;
  const blobPattern = /\bblob:[^\s"'<>]*/gi;
  const dataPattern = /data:(?:image|video|audio)\/[a-z0-9.+-]+;base64,[a-z0-9+/=]+/gi;
  const objectUrlPattern = /(?:URL|webkitURL)\.createObjectURL\s*\([^)]*\)/g;
  const localPattern = /(?:\/?(?:assets|images|media)\/)[a-z0-9_./-]+\.(?:svg|png|jpe?g|gif|webp|avif|mp4|webm|ogg|mov)/gi;
  for (const file of files) {
    const relative = path.relative(ROOT, file).split(path.sep).join("/");
    const content = await readFile(file, "utf8").catch(() => "");
    const lines = content.split(/\r?\n/);
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      for (const match of line.matchAll(urlPattern)) {
        const raw = match[0].replace(/[),.;]+$/, "");
        if (!/r2\.dev/i.test(raw) && !/\.(?:jpe?g|png|gif|webp|avif|mp4|webm|ogg|mov)(?:[?#]|$)/i.test(raw)) continue;
        const key = parseR2(raw);
        if (key === "") continue;
        add("repo", relative, "", "", index + 1, raw, key || "", key === null ? "EXTERNAL" : (liveKeys.has(key) ? "OK" : "DEAD"));
      }
      for (const match of line.matchAll(blobPattern)) add("repo", relative, "", "", index + 1, match[0], "", "BLOB");
      for (const match of line.matchAll(dataPattern)) add("repo", relative, "", "", index + 1, match[0].slice(0, 100) + "…", "", "DATA_URI");
      for (const match of line.matchAll(objectUrlPattern)) add("repo", relative, "", "", index + 1, match[0], "", "BLOB");
      for (const match of line.matchAll(localPattern)) {
        const raw = match[0];
        const local = raw.replace(/^\/+/, "");
        const exists = await stat(path.join(ROOT, local)).then(() => true).catch(() => false);
        add("repo", relative, "", "", index + 1, raw, local, exists ? "LOCAL" : "DEAD");
      }
    }
  }
}
async function scanDatabase() {
  const deadRows = new Map();
  for (const [table, columns] of Object.entries(TABLES)) {
    const data = await readTable(table, columns);
    for (const row of data) {
      for (const column of columns) {
        const raw = row[column];
        if (typeof raw !== "string" || !raw.trim()) continue;
        const classified = classifyReference(raw, column);
        if (!classified) continue;
        let verdict = classified.verdict;
        if (column === "media_key" && row.media_provider && row.media_provider !== "cloudflare-r2") verdict = "EXTERNAL";
        if (verdict === "LOCAL_PENDING") {
          verdict = await stat(path.join(ROOT, classified.key)).then(() => "LOCAL").catch(() => "DEAD");
        }
        add("database", table, row.id, column, "", raw, classified.key, verdict);
        if (verdict === "DEAD" && classified.key) {
          deadRows.set(table + ":" + row.id, { table, id: row.id });
        }
      }
    }
  }
  return deadRows;
}
async function backupDeadRows(deadRows, date) {
  const grouped = new Map();
  for (const { table, id } of deadRows.values()) {
    const url = new URL(SUPABASE_URL + "/rest/v1/" + table);
    url.searchParams.set("select", "*");
    url.searchParams.set("id", "eq." + id);
    const found = await fetchJson(url, { headers: { apikey: SERVICE_KEY, Authorization: "Bearer " + SERVICE_KEY } });
    if (!grouped.has(table)) grouped.set(table, []);
    grouped.get(table).push(...found);
  }
  if (!grouped.size) return;
  await mkdir(path.join(ROOT, "backup"), { recursive: true });
  for (const [table, records] of grouped) {
    await writeFile(path.join(ROOT, "backup", table + "-" + date + ".json"), JSON.stringify(records, null, 2) + "\n", { mode: 0o600 });
  }
}
async function main() {
  const date = new Date().toISOString().slice(0, 10);
  await mkdir(path.join(ROOT, "audit"), { recursive: true });
  const objects = await listLiveObjects();
  await writeFile(path.join(ROOT, "audit", "live-objects.json"), JSON.stringify({ generated_at: new Date().toISOString(), count: objects.length, objects }, null, 2) + "\n");
  await scanRepository();
  const deadRows = await scanDatabase();
  await backupDeadRows(deadRows, date);
  const headers = ["source_type", "location", "row_id", "column", "line", "raw_reference", "object_key", "verdict"];
  const csv = [headers.join(","), ...rows.map(row => headers.map(key => csvCell(row[key])).join(","))].join("\n") + "\n";
  await writeFile(path.join(ROOT, "audit", "report.csv"), csv);
  const counts = Object.fromEntries(["OK", "DEAD", "EXTERNAL", "LOCAL", "BLOB", "DATA_URI"].map(v => [v, rows.filter(r => r.verdict === v).length]));
  console.log(JSON.stringify({ live_objects: objects.length, references: rows.length, counts, backed_up_rows: deadRows.size, report: "audit/report.csv", inventory: "audit/live-objects.json" }, null, 2));
  if (counts.DEAD > 0) process.exitCode = 1;
}
main().catch(error => {
  console.error("Media audit stopped:", error.message);
  process.exitCode = 2;
});
