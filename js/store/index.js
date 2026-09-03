// Lightweight client-side store (pub/sub + simple state)
const listeners = new Map();

export const state = {
  notifications: [],
  uploads: {}
};

export function subscribe(event, fn) {
  if (!listeners.has(event)) listeners.set(event, []);
  listeners.get(event).push(fn);
  return () => unsubscribe(event, fn);
}

export function unsubscribe(event, fn) {
  if (!listeners.has(event)) return;
  listeners.set(event, listeners.get(event).filter(f => f !== fn));
}

export function emit(event, payload) {
  const list = listeners.get(event) || [];
  list.forEach(f => {
    try { f(payload); } catch (e) { console.warn('store handler failed', e); }
  });
}

export function setState(key, value) {
  state[key] = value;
  emit('state:' + key, value);
}

export function updateState(key, patch) {
  state[key] = Object.assign({}, state[key] || {}, patch);
  emit('state:' + key, state[key]);
}

export function getState(key) {
  return state[key];
}
