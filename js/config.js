// ============================================
// ENNOYEKS SCHOOL GALLERY - CONFIGURATION
// ============================================

// Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBeAgoeUSwiPcpCsewe8VMqgZgTlSCbn-8",
  authDomain: "school-gallery-fc36e.firebaseapp.com",
  projectId: "school-gallery-fc36e",
  storageBucket: "school-gallery-fc36e.firebasestorage.app",
  messagingSenderId: "485007862668",
  appId: "1:485007862668:web:4910e96703730eb2d5c4a9",
  measurementId: "G-NWW1VES2CX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Analytics (optional)
export const analytics =
  typeof window !== "undefined"
    ? getAnalytics(app)
    : null;

// App configuration object
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
