import { subscribe, emit, getState, setState } from '../store/index.js';
import { getSupabase } from '../services/supabase.js';

const NOTIF_ICON_SELECTOR = '.notification-icon';
const NOTIF_DROPDOWN_ID = 'notificationDropdown';
const NOTIF_LIST_CLASS = 'notifications-list';

export function renderNotificationsList(list) {
  const container = document.getElementById(NOTIF_DROPDOWN_ID);
  if (!container) return;
  const listEl = container.querySelector('.' + NOTIF_LIST_CLASS);
  if (!listEl) return;
  if (!list || list.length === 0) {
    listEl.innerHTML = '<p class="empty-state">No notifications</p>';
    return;
  }
  listEl.innerHTML = list.map(n => `
    <div class="notification-item">
      <div class="notif-body">${n.title || n.text || ''}</div>
      <div class="notif-meta">${n.time || ''}</div>
    </div>
  `).join('');
}

export function initNotifications() {
  window.initNotifications = initNotifications;

  const icon = document.querySelector(NOTIF_ICON_SELECTOR);
  const dropdown = document.getElementById(NOTIF_DROPDOWN_ID);

  subscribe('state:notifications', (notifications) => {
    renderNotificationsList(notifications);
    const badge = document.getElementById('notificationBadge');
    if (badge) badge.textContent = (notifications && notifications.length) ? String(notifications.length) : '0';
  });

  if (icon && dropdown) {
    icon.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      dropdown.classList.remove('active');
    });
  }

  try {
    const supabase = getSupabase();
    if (supabase && typeof supabase.from === 'function') {
      try {
        supabase.from('notifications').on('INSERT', payload => {
          const n = payload.new;
          const current = getState('notifications') || [];
          const updated = [n].concat(current).slice(0, 50);
          setState('notifications', updated);
          emit('notification', n);
        }).subscribe();
      } catch (e) {
        console.warn('supabase realtime subscribe failed', e);
      }
    }
  } catch (e) {}
}

export function init() {
  return initNotifications();
}

export function notifyTest(payload) {
  const current = getState('notifications') || [];
  const n = Object.assign({ id: Date.now(), title: payload.title || payload.text || 'Notification', time: new Date().toLocaleTimeString() }, payload);
  const updated = [n].concat(current).slice(0, 50);
  setState('notifications', updated);
  emit('notification', n);
}
