// HSHS WORLD — LOCAL-FIRST PAGE DATA SERVICE
// Store -> local cache -> existing database bridge.

const CACHE_PREFIX = 'hshs:cache:';
const CACHE_TTL = 5 * 60 * 1000;

function cacheKey(collection) { return `${CACHE_PREFIX}${collection}`; }
function readCache(collection) {
  try {
    const parsed = JSON.parse(localStorage.getItem(cacheKey(collection)) || 'null');
    return Array.isArray(parsed?.items) ? parsed.items : [];
  } catch (_) { return []; }
}
function writeCache(collection, items) {
  try { localStorage.setItem(cacheKey(collection), JSON.stringify({ savedAt: Date.now(), items: Array.isArray(items) ? items : [] })); } catch (_) {}
}
function freshEnough(collection) {
  try {
    const parsed = JSON.parse(localStorage.getItem(cacheKey(collection)) || 'null');
    return Boolean(parsed?.savedAt && Date.now() - parsed.savedAt < CACHE_TTL);
  } catch (_) { return false; }
}

async function fromStore(method, limit, offset) {
  const store = window.HshsStore;
  if (!store || typeof store[method] !== 'function') return [];
  try {
    const result = await store[method](limit, offset);
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.warn(`HshsStore ${method} failed:`, error);
    return [];
  }
}

async function fromDb(method, limit, offset) {
  try {
    if (window.db && typeof window.db[method] === 'function') return await window.db[method](limit, offset);
  } catch (error) {
    console.warn(`Database ${method} failed:`, error);
  }
  return [];
}

async function getCollection(collection, method, limit = 20, offset = 0) {
  const cached = readCache(collection);
  if (freshEnough(collection) && offset === 0) return cached.slice(0, limit);

  const storeItems = await fromStore(method, limit, offset);
  if (storeItems.length) {
    if (offset === 0) writeCache(collection, storeItems);
    return storeItems;
  }

  const remote = await fromDb(method, limit, offset);
  if (remote.length || !cached.length) {
    if (offset === 0) writeCache(collection, remote);
    return remote;
  }
  return cached.slice(offset, offset + limit);
}

export const getPosts = (limit = 20, offset = 0) => getCollection('posts', 'getPosts', limit, offset);
export const getPhotos = (limit = 20, offset = 0) => getCollection('photos', 'getPhotos', limit, offset);
export const getVideos = (limit = 20, offset = 0) => getCollection('videos', 'getVideos', limit, offset);
export function getCached(collection) { return readCache(collection); }
export function saveLocal(collection, item) {
  const items = readCache(collection);
  const next = item?.id == null ? [item, ...items] : [item, ...items.filter(x => String(x?.id) !== String(item.id))];
  writeCache(collection, next);
  return item;
}
export function removeLocal(collection, id) { writeCache(collection, readCache(collection).filter(x => String(x?.id) !== String(id))); }
export function clearCache(collection) { try { localStorage.removeItem(cacheKey(collection)); } catch (_) {} }
