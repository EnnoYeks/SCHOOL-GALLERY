// ============================================
// HSHS WORLD - CONFIGURATION
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
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
export const analytics = getAnalytics(app);

export const CONFIG = {
  app: {
    name: "HSHS World",
    version: "1.1.0",
    school: "HAWTHORNE SCRIBNER HIGH SCHOOL",
    schoolMotto: "Educate Engage Empower.",
    schoolEmail: "info@hshs.ac.ug",
    schoolPhone: "+256 200 946933",
    schoolAddress: "Bududa Kikholo",
    schoolAnniversaryDate: "2026-08-15"
  },
  theme: {
    defaultMode: "light",
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

onAuthStateChanged(auth, function (user) {
  window.hshsAuthUser = user || null;
  window.hshsUid = user ? user.uid : (localStorage.getItem("guestId") || null);
  document.dispatchEvent(new CustomEvent("hshs:auth", { detail: { user: user || null } }));
});

signInAnonymously(auth).catch(function (err) {
  console.warn("Anonymous sign-in skipped:", err && err.message);
});

window.firebaseApp = app;
window.firestore = firestore;
window.auth = auth;
window.analytics = analytics;
window.CONFIG = CONFIG;
window.firebaseConfig = firebaseConfig;
