// HSHS WORLD — LOCAL-FIRST PAGE DATA SERVICE
// Reads cached local data first, then refreshes from the existing database bridge.

const CACHE_PREFIX = 'hshs:cache:';
const CACHE_TTL = 5 * 60 * 1000;

function cacheKey(collection) {
  return `${CACHE_PREFIX}${collection}`;
}

function readCache(collection) {
  try {
    const raw = localStorage.getItem(cacheKey(collection));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) return [];
    return parsed.items;
  } catch (_) {
    return [];
  }
}

function writeCache(collection, items) {
  try {
    localStorage.setItem(cacheKey(collection), JSON.stringify({
      savedAt: Date.now(),
      items: Array.isArray(items) ? items : []
    }));
  } catch (_) {
    // localStorage can be unavailable/full; remote data should still work.
  }
}

function freshEnough(collection) {
  try {
    const raw = localStorage.getItem(cacheKey(collection));
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.savedAt && Date.now() - parsed.savedAt < CACHE_TTL);
  } catch (_) {
    return false;
  }
}

async function fromDb(method, limit, offset) {
  try {
    if (window.db && typeof window.db[method] === 'function') {
      return await window.db[method](limit, offset);
    }
  } catch (error) {
    console.warn(`HSHS data refresh failed for ${method}:`, error);
  }
  return [];
}

async function getCollection(collection, method, limit = 20, offset = 0) {
  const cached = readCache(collection);

  if (freshEnough(collection) && offset === 0) {
    return cached.slice(0, limit);
  }

  const remote = await fromDb(method, limit, offset);
  if (remote.length || !cached.length) {
    if (offset === 0) writeCache(collection, remote);
    return remote;
  }

  return cached.slice(offset, offset + limit);
}

export async function getPosts(limit = 20, offset = 0) {
  return getCollection('posts', 'getPosts', limit, offset);
}

export async function getPhotos(limit = 20, offset = 0) {
  return getCollection('photos', 'getPhotos', limit, offset);
}

export async function getVideos(limit = 20, offset = 0) {
  return getCollection('videos', 'getVideos', limit, offset);
}

export function getCached(collection) {
  return readCache(collection);
}

export function saveLocal(collection, item) {
  const items = readCache(collection);
  const id = item?.id;
  const next = id == null
    ? [item, ...items]
    : [item, ...items.filter(existing => String(existing?.id) !== String(id))];
  writeCache(collection, next);
  return item;
}

export function removeLocal(collection, id) {
  const next = readCache(collection).filter(item => String(item?.id) !== String(id));
  writeCache(collection, next);
}

export function clearCache(collection) {
  try { localStorage.removeItem(cacheKey(collection)); } catch (_) {}
}
