/*
 * ENNOYEKS School Gallery - Trending Page
 * Requires an existing Firebase setup from ./config.js that exports Firestore and Storage.
 */
import db from './db.js';
import { firestore, storage } from './config.js';
import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js';
import { ref, getDownloadURL } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js';

// Trending is driven by two related signals:
// 1. Total engagement: likes + comments + shares
// 2. Likes: given an extra boost because they are the clearest positive signal
// Views provide reach/context without overpowering actual interaction.
const TRENDING_WEIGHTS = Object.freeze({ engagement: 4, likes: 2, views: 1 });
const PAGE_SIZE = 9;
const CACHE_TTL = 5 * 60 * 1000;
const SEARCH_MIN_LENGTH = 2;
const state = {
  period: 'week',
  posts: [],
  visiblePosts: [],
  page: 1,
  isLoading: false,
  hasMore: true,
  cache: new Map(),
  notificationUnsubscribe: null,
};

const $ = (id) => document.getElementById(id);
const els = {
  trendingGrid: $('trendingGrid'),
  topCategoriesGrid: $('topCategoriesGrid'),
  topLikedList: $('topLikedList'),
  topViewedList: $('topViewedList'),
  topCommentedList: $('topCommentedList'),
  searchInput: $('searchInput'),
  searchResults: $('searchResults'),
  notificationBadge: $('notificationBadge'),
  notificationsList: $('notificationsList'),
};

const escapeHTML = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
}[char]));
const toNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const debounce = (fn, wait = 250) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
};

async function resolveMediaURL(url = '') {
  if (!url || !storage || !url.startsWith('gs://')) return url;
  try {
    return await getDownloadURL(ref(storage, url));
  } catch (error) {
    console.warn('Unable to resolve Storage URL:', error);
    return '';
  }
}

async function normalizePost(snapshotOrData) {
  const data = typeof snapshotOrData.data === 'function' ? snapshotOrData.data() : snapshotOrData;
  const id = snapshotOrData.id || data.id;
  return {
    id,
    title: data.title || 'Untitled post',
    description: data.description || '',
    mediaURL: await resolveMediaURL(data.mediaURL || data.thumbnailURL || ''),
    mediaType: data.mediaType || 'image',
    category: data.category || 'General',
    author: data.author || data.authorName || 'ENNOYEKS Student',
    authorPhoto: data.authorPhoto || '',
    timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp || Date.now()),
    likesCount: toNumber(data.likesCount),
    commentsCount: toNumber(data.commentsCount),
    viewsCount: toNumber(data.viewsCount),
    sharesCount: toNumber(data.sharesCount),
    featured: Boolean(data.featured),
  };
}

function getPeriodStart(period = 'week') {
  const now = new Date();
  const start = new Date(now);
  if (period === 'today') start.setHours(0, 0, 0, 0);
  else if (period === 'month') start.setDate(now.getDate() - 30);
  else start.setDate(now.getDate() - 7);
  return start;
}

function calculateTrendingScore(post) {
  const engagement = post.likesCount + post.commentsCount + post.sharesCount;
  return (engagement * TRENDING_WEIGHTS.engagement)
    + (post.likesCount * TRENDING_WEIGHTS.likes)
    + (post.viewsCount * TRENDING_WEIGHTS.views);
}

function withScores(posts) {
  return posts.map((post) => ({
    ...post,
    engagementCount: post.likesCount + post.commentsCount + post.sharesCount,
    trendingScore: calculateTrendingScore(post),
  }))
    .sort((a, b) => b.trendingScore - a.trendingScore || b.timestamp - a.timestamp);
}

function timeAgo(date) {
  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
  const match = units.find(([, value]) => seconds >= value);
  if (!match) return 'just now';
  const amount = Math.floor(seconds / match[1]);
  return `${amount} ${match[0]}${amount > 1 ? 's' : ''} ago`;
}

function cacheGet(key) {
  const item = state.cache.get(key);
  return item && Date.now() - item.time < CACHE_TTL ? item.data : null;
}
function cacheSet(key, data) { state.cache.set(key, { data, time: Date.now() }); }

function renderSkeleton(target, count = 6, type = 'card') {
  if (!target) return;
  target.innerHTML = Array.from({ length: count }, () => `<article class="skeleton ${type}-skeleton"><span></span><div></div><p></p><p></p></article>`).join('');
}
function renderMessage(target, message, icon = '✨') {
  if (target) target.innerHTML = `<div class="empty-state"><span>${icon}</span><h3>${escapeHTML(message)}</h3><p>Check back soon for more ENNOYEKS School Gallery moments.</p></div>`;
}
function renderError(target, message = 'Something went wrong while loading trending content.') { renderMessage(target, message, '⚠️'); }

function postMedia(post, large = true) {
  if (post.mediaType === 'video') {
    return `<video class="post-media" ${large ? 'controls' : ''} preload="metadata" poster="${escapeHTML(post.mediaURL)}"><source src="${escapeHTML(post.mediaURL)}"></video>`;
  }
  return `<img class="post-media" src="${escapeHTML(post.mediaURL)}" alt="${escapeHTML(post.title)}" loading="lazy">`;
}

function renderTrendingPosts(append = false) {
  if (!els.trendingGrid) return;
  const nextPosts = state.posts.slice(0, state.page * PAGE_SIZE);
  state.visiblePosts = nextPosts;
  state.hasMore = nextPosts.length < state.posts.length;
  if (!nextPosts.length) return renderMessage(els.trendingGrid, 'No trending posts yet');
  els.trendingGrid.innerHTML = nextPosts.map((post, index) => `
    <article class="trending-card fade-in" style="--delay:${Math.min(index, 8) * 70}ms" data-post-id="${escapeHTML(post.id)}">
      <div class="media-wrap">
        ${postMedia(post)}
        <span class="category-badge">${escapeHTML(post.category)}</span>
        ${post.featured ? '<span class="featured-badge">Featured</span>' : ''}
      </div>
      <div class="card-content">
        <h3>${escapeHTML(post.title)}</h3>
        <p>${escapeHTML(post.description.slice(0, 150))}${post.description.length > 150 ? '…' : ''}</p>
        <div class="author-row">
          <img src="${escapeHTML(post.authorPhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.author))}" alt="${escapeHTML(post.author)}" loading="lazy">
          <div><strong>${escapeHTML(post.author)}</strong><span>${timeAgo(post.timestamp)}</span></div>
        </div>
        <div class="stats-row">
          <span>❤️ ${post.likesCount}</span><span>💬 ${post.commentsCount}</span><span>👁️ ${post.viewsCount}</span><span>🔁 ${post.sharesCount}</span><span class="engagement">⚡ ${post.engagementCount}</span><span class="hot">🔥 ${post.trendingScore}</span>
        </div>
      </div>
    </article>`).join('');
  if (!append) els.trendingGrid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

export async function getTrendingPosts(period = state.period) {
  const key = `trending:${period}`;
  const cached = cacheGet(key);
  if (cached) return cached;
  const q = query(collection(firestore, 'posts'), where('timestamp', '>=', getPeriodStart(period)), orderBy('timestamp', 'desc'), limit(60));
  const snap = await getDocs(q);
  const posts = withScores(await Promise.all(snap.docs.map(normalizePost)));
  cacheSet(key, posts);
  return posts;
}

export async function getTopCategories() {
  const posts = cacheGet(`trending:${state.period}`) || await getTrendingPosts(state.period);
  const categories = [...posts.reduce((map, post) => {
    const current = map.get(post.category) || { name: post.category, postsCount: 0, engagement: 0 };
    current.postsCount += 1;
    current.engagement += post.engagementCount;
    map.set(post.category, current);
    return map;
  }, new Map()).values()].sort((a, b) => b.engagement - a.engagement);
  return categories;
}
export async function getTopLikedPosts() { return (await getTrendingPosts(state.period)).slice().sort((a, b) => b.likesCount - a.likesCount).slice(0, 5); }
export async function getTopViewedPosts() { return (await getTrendingPosts(state.period)).slice().sort((a, b) => b.viewsCount - a.viewsCount).slice(0, 5); }
export async function getTopCommentedPosts() { return (await getTrendingPosts(state.period)).slice().sort((a, b) => b.commentsCount - a.commentsCount).slice(0, 5); }
export async function searchTrendingPosts(queryText) {
  const queryLower = queryText.trim().toLowerCase();
  if (queryLower.length < SEARCH_MIN_LENGTH) return [];
  const posts = cacheGet(`trending:${state.period}`) || await getTrendingPosts(state.period);
  return posts.filter((post) => [post.title, post.description, post.category].some((field) => field.toLowerCase().includes(queryLower))).slice(0, 8);
}

function renderCategories(categories) {
  if (!els.topCategoriesGrid) return;
  if (!categories.length) return renderMessage(els.topCategoriesGrid, 'No category activity yet');
  const icons = ['🎓', '🏆', '🎨', '🔬', '📚', '🎭', '⚽', '🎵'];
  els.topCategoriesGrid.innerHTML = categories.map((cat, i) => `<article class="category-card slide-up"><span>${icons[i % icons.length]}</span><h4>${escapeHTML(cat.name)}</h4><p>${cat.postsCount} posts</p><strong>${cat.engagement.toLocaleString()} engagement</strong></article>`).join('');
}
function renderLeaderboard(target, posts, metric, icon) {
  if (!target) return;
  if (!posts.length) return renderMessage(target, 'No posts to rank yet', '🏅');
  target.innerHTML = posts.map((post, i) => `<li class="leaderboard-item"><b>#${i + 1}</b><img src="${escapeHTML(post.mediaURL)}" alt="${escapeHTML(post.title)}" loading="lazy"><span>${escapeHTML(post.title)}</span><strong>${icon} ${post[metric].toLocaleString()}</strong></li>`).join('');
}
async function renderSidebars() {
  const [categories, liked, viewed, commented] = await Promise.all([getTopCategories(), getTopLikedPosts(), getTopViewedPosts(), getTopCommentedPosts()]);
  renderCategories(categories);
  renderLeaderboard(els.topLikedList, liked, 'likesCount', '❤️');
  renderLeaderboard(els.topViewedList, viewed, 'viewsCount', '👁');
  renderLeaderboard(els.topCommentedList, commented, 'commentsCount', '💬');
}

async function loadTrending(period = state.period) {
  try {
    state.isLoading = true; state.period = period; state.page = 1;
    renderSkeleton(els.trendingGrid, 6); renderSkeleton(els.topCategoriesGrid, 4, 'category');
    state.posts = await getTrendingPosts(period);
    renderTrendingPosts();
    await renderSidebars();
  } catch (error) {
    console.error(error);
    renderError(els.trendingGrid);
  } finally { state.isLoading = false; }
}

function setupTabs() {
  const container = document.querySelector('[data-trending-tabs]') || document.querySelector('.trending-tabs');
  if (!container) return;
  container.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-period]');
    if (!tab) return;
    container.querySelectorAll('[data-period]').forEach((item) => item.classList.toggle('active', item === tab));
    loadTrending(tab.dataset.period);
  });
}
function setupSearch() {
  if (!els.searchInput || !els.searchResults) return;
  els.searchInput.addEventListener('input', debounce(async (event) => {
    const results = await searchTrendingPosts(event.target.value);
    els.searchResults.classList.toggle('show', results.length > 0);
    els.searchResults.innerHTML = results.map((post) => `<button class="search-result" data-post-id="${escapeHTML(post.id)}"><img src="${escapeHTML(post.mediaURL)}" alt=""><span><strong>${escapeHTML(post.title)}</strong><small>${escapeHTML(post.category)} • 🔥 ${post.trendingScore}</small></span></button>`).join('');
  }));
  document.addEventListener('click', (event) => {
    if (!els.searchInput.contains(event.target) && !els.searchResults.contains(event.target)) els.searchResults.classList.remove('show');
  });
}
function setupInfiniteScroll() {
  window.addEventListener('scroll', debounce(() => {
    if (state.isLoading || !state.hasMore) return;
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 600) {
      state.page += 1;
      renderTrendingPosts(true);
    }
  }, 120));
}
function setupNotifications() {
  if (!els.notificationBadge && !els.notificationsList) return;
  const q = query(collection(firestore, 'notifications'), orderBy('timestamp', 'desc'), limit(10));
  state.notificationUnsubscribe = onSnapshot(q, (snap) => {
    const notifications = snap.docs.map((item) => ({ id: item.id, ...item.data() }));
    const unread = notifications.filter((item) => !item.read).length;
    if (els.notificationBadge) {
      els.notificationBadge.textContent = unread;
      els.notificationBadge.hidden = unread === 0;
    }
    if (els.notificationsList) {
      els.notificationsList.innerHTML = notifications.length ? notifications.map((item) => `<button class="notification-item ${item.read ? '' : 'unread'}" data-notification-id="${item.id}"><strong>${escapeHTML(item.title || 'Notification')}</strong><span>${escapeHTML(item.message || item.body || '')}</span></button>`).join('') : '<div class="empty-notifications">No notifications yet.</div>';
    }
  });
  els.notificationsList?.addEventListener('click', async (event) => {
    const item = event.target.closest('[data-notification-id]');
    if (item) await updateDoc(doc(firestore, 'notifications', item.dataset.notificationId), { read: true, readAt: serverTimestamp() });
  });
}

function boot() {
  setupTabs(); setupSearch(); setupInfiniteScroll(); setupNotifications(); loadTrending('week');
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
