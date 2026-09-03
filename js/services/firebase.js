import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js";

// Use window.firebaseConfig if available (set by js/config.js), otherwise expect callers to provide
const firebaseConfig = window.firebaseConfig || {};

export function getFirebaseApp() {
  if (window.firebaseApp) return window.firebaseApp;
  try {
    const app = initializeApp(firebaseConfig);
    window.firebaseApp = app;
    return app;
  } catch (e) {
    console.warn('getFirebaseApp failed', e);
    return window.firebaseApp || null;
  }
}

export function getFirestoreClient() {
  if (window.firestore) return window.firestore;
  const app = getFirebaseApp();
  if (!app) return null;
  const db = getFirestore(app);
  window.firestore = db;
  return db;
}

export function getAuthClient() {
  if (window.auth) return window.auth;
  const app = getFirebaseApp();
  if (!app) return null;
  const a = getAuth(app);
  window.auth = a;
  return a;
}

export function getStorageClient() {
  if (window.storage) return window.storage;
  const app = getFirebaseApp();
  if (!app) return null;
  const s = getStorage(app);
  window.storage = s;
  return s;
}

export function getAnalyticsClient() {
  if (window.analytics) return window.analytics;
  try {
    const app = getFirebaseApp();
    if (!app) return null;
    const an = getAnalytics(app);
    window.analytics = an;
    return an;
  } catch (e) {
    // analytics can throw in non-browser or blocked environments
    console.warn('getAnalyticsClient failed', e);
    return window.analytics || null;
  }
}
