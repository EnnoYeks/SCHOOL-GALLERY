// ============================================
// HSHS WORLD - CONFIGURATION + AUTH BOOT
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyCoFBtKrk7ZRvV1mZe5hN9tRCPKsuQBlgo",
  authDomain: "school-gallery-62032.firebaseapp.com",
  projectId: "school-gallery-62032",
  messagingSenderId: "931689210926",
  appId: "1:931689210926:web:fd2daf8495d6e6f3e42bbf",
  measurementId: "G-5W89YVBV6J"
};

const app = initializeApp(firebaseConfig);

export const firestore = getFirestore(app);
export const auth = getAuth(app);

let analytics = null;
try {
  if (typeof window !== "undefined") analytics = getAnalytics(app);
} catch (e) {
  console.warn("Analytics init skipped:", e && e.message);
}
export { analytics };

export const CONFIG = {
  app: {
    name: "HSHS World",
    version: "1.2.0",
    school: "HAWTHORNE SCRIBNER HIGH SCHOOL",
    schoolMotto: "Educate Engage Empower.",
    schoolEmail: "info@hshs.ac.ug",
    schoolPhone: "+256 200 946933",
    schoolAddress: "Bududa Kikholo",
    schoolAnniversaryDate: "2026-08-15"
  },
  theme: {
    defaultMode: "dark",
    defaultTheme: "default",
    animationSpeed: 0.3,
    enableParticles: true,
    particleCount: 80
  },
  storage: {
    provider: "cloudflare-r2",
    maxFileSize: 104857600,
    maxPhotoSize: 52428800,
    maxVideoSize: 104857600
  },
  pagination: {
    postsPerPage: 10,
    photosPerPage: 20,
    videosPerPage: 12
  },
  features: {
    enableComments: true,
    enableLikes: true,
    enableSharing: true,
    enableLiveChat: true
  }
};

function applyAuthUser(user) {
  var real = !!(user && !user.isAnonymous);
  window.hshsAuthUser = real ? user : null;
  window.hshsAuthState = user ? (real ? "authenticated" : "guest") : "guest";
  if (real) {
    window.hshsUid = user.uid;
  } else if (!window.hshsUid) {
    try { window.hshsUid = localStorage.getItem("guestId") || null; } catch (e) {}
  }
  document.documentElement.dataset.hshsAuth = window.hshsAuthState;
  document.dispatchEvent(new CustomEvent("hshs:auth", {
    detail: { user: window.hshsAuthUser, state: window.hshsAuthState }
  }));
  if (window.HshsAnalytics && window.HshsAnalytics.setUser) {
    window.HshsAnalytics.setUser(window.hshsAuthUser);
  }
}

window.hshsAuthState = "loading";
document.documentElement.dataset.hshsAuth = "loading";

setPersistence(auth, browserLocalPersistence).catch(function (err) {
  console.warn("Auth persistence fallback:", err && err.message);
});

onAuthStateChanged(auth, applyAuthUser);

window.firebaseApp = app;
window.firestore = firestore;
window.auth = auth;
window.analytics = analytics;
window.CONFIG = CONFIG;
window.firebaseConfig = firebaseConfig;
