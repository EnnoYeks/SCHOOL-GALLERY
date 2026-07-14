// ============================================
// ENNOYEKS SCHOOL GALLERY - CONFIGURATION
// ============================================

// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js";

// Supabase (Media Storage)
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ============================================
// FIREBASE CONFIGURATION
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyCoFBtKrk7ZRvV1mZe5hN9tRCPKsuQBlgo",
  authDomain: "school-gallery-62032.firebaseapp.com",
  projectId: "school-gallery-62032",
  storageBucket: "school-gallery-62032.firebasestorage.app",
  messagingSenderId: "931689210926",
  appId: "1:931689210926:web:fd2daf8495d6e6f3e42bbf",
  measurementId: "G-5W89YVBV6J"
};

const app = initializeApp(firebaseConfig);

export const firestore = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const storage = getStorage(app);

// ============================================
// SUPABASE CONFIGURATION (MEDIA STORAGE)
// ============================================

const supabaseUrl = "https://hhlogdqpgjiajeufwnop.supabase.co";
const supabaseKey = const supabaseKey =
  window.SUPABASE_ANON_KEY || "sb_publishable_RVPCBfzNQ5OvdPp96MUqVA_AG5wazGk";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

// ============================================
// APP CONFIGURATION
// ============================================

export const CONFIG = {
  app: {
    name: "HSHS School Gallery",
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

// Expose shared globals for legacy page scripts.
window.firebaseApp = app;
window.firestore = firestore;
window.auth = auth;
window.analytics = analytics;
window.storage = storage;
window.supabase = supabase;
window.CONFIG = CONFIG;
window.firebaseConfig = firebaseConfig;

