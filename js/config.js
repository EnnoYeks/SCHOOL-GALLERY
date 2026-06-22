
// ============================================
// ENNOYEKS SCHOOL GALLERY - CONFIGURATION
// ============================================

// API Configuration
import { createClient } from "@supabase/supabase-js";

// Supabase setup
const supabaseUrl = "https://hhlogdqpgjiajeufwnop.supabase.co";
const supabaseKey = "sb_publishable_RVPCBfzNQ5OvdPp96MUqVA_AG5wazGk";

export const supabase = createClient(supabaseUrl, supabaseKey);

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
