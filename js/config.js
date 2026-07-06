// ============================================
// ENNOYEKS SCHOOL GALLERY - CONFIGURATION
// ============================================

// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js";

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

export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

// ============================================
// SUPABASE CONFIGURATION (MEDIA STORAGE)
// ============================================

const supabaseUrl = "https://hhlogdqpgjiajeufwnop.supabase.co";
const supabaseKey = "YOUR_SUPABASE_ANON_KEY";

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
    particleCount: 50
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
