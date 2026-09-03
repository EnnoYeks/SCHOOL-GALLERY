import { getSupabase } from '../services/supabase.js';
import { emit } from '../store/index.js';

// Basic runtime realtime connector that prefers Supabase; otherwise no-op.
export function connectRealtime() {
  if (window.__realtimeConnected) return;
  try {
    const supabase = getSupabase();
    if (supabase && typeof supabase.from === 'function') {
      try {
        // Subscribe to a 'notifications' table INSERT events
        supabase.from('notifications').on('INSERT', payload => {
          const n = payload.new;
          // Emit to store via event bus
          import('../store/index.js').then(m => m.emit('notification', n));
        }).subscribe();
        window.__realtimeConnected = true;
        return;
      } catch (e) {
        console.warn('supabase realtime channel error', e);
      }
    }
  } catch (e) {
    console.warn('connectRealtime error', e);
  }
  // Fallback: listen for a debug event on window
  window.addEventListener('hshs:realtime:notification', (e) => {
    const payload = (e && e.detail) || {};
    import('../store/index.js').then(m => m.emit('notification', payload));
  });
  window.__realtimeConnected = true;
}
