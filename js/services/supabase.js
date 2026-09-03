import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = window.SUPABASE_URL || "https://hhlogdqpgjiajeufwnop.supabase.co";
const supabaseKey = window.SUPABASE_ANON_KEY || "sb_publishable_RVPCBfzNQ5OvdPp96MUqVA_AG5wazGk";

export function getSupabase() {
  if (window.supabase) return window.supabase;
  try {
    const client = createClient(supabaseUrl, supabaseKey);
    window.supabase = client;
    return client;
  } catch (e) {
    console.warn('getSupabase failed', e);
    return window.supabase || null;
  }
}
