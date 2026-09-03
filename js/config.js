// ============================================
// HSHS WORLD - CONFIGURATION (guarded initialization)
// ============================================

// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js";

// Supabase (Media Storage)
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const firebaseConfig = {
  apiKey: "AIzaSyCoFBtKrk7ZRvV1mZe5hN9tRCPKsuQBlgo",
  authDomain: "school-gallery-62032.firebaseapp.com",
  projectId: "school-gallery-62032",
  storageBucket: "school-gallery-62032.firebasestorage.app",
  messagingSenderId: "931689210926",
  appId: "1:931689210926:web:fd2daf8495d6e6f3e42bbf",
  measurementId: "G-5W89YVBV6J"
};

// Use existing window instances when available to avoid duplicate initialization
const app = window.firebaseApp || initializeApp(firebaseConfig);

const firestore = window.firestore || getFirestore(app);
const auth = window.auth || getAuth(app);
const storage = window.storage || getStorage(app);

// getAnalytics may throw in some environments (e.g. if not available), so guard it
let analytics;
try {
  analytics = window.analytics || getAnalytics(app);
} catch (e) {
  // Analytics isn't critical for runtime; keep null and continue
  analytics = window.analytics || null;
}

const supabaseUrl = "https://hhlogdqpgjiajeufwnop.supabase.co";
const supabaseKey = window.SUPABASE_ANON_KEY || "sb_publishable_RVPCBfzNQ5OvdPp96MUqVA_AG5wazGk";

const supabase = window.supabase || createClient(supabaseUrl, supabaseKey);

export { firestore, auth, storage, analytics, supabase };

export const CONFIG = {
  app: {
    name: "HSHS World",
    version: "1.0.0",
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
    enableSharing: true
  }
};

// Expose singletons to window to avoid duplicate initializations across modules
window.firebaseApp = app;
window.firestore = firestore;
window.auth = auth;
window.storage = storage;
window.analytics = analytics;
window.supabase = supabase;
window.CONFIG = CONFIG;
window.firebaseConfig = firebaseConfig;
