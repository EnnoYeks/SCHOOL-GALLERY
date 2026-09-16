/**
 * HSHS World · one Firebase Auth API
 * Email/password + Google. Username is unique. Firebase UID is identity.
 */
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

function appAuth() {
  return window.auth || getAuth(window.firebaseApp);
}
function db() {
  return window.firestore || getFirestore(window.firebaseApp);
}

function cleanUsername(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9._]/g, "").slice(0, 24);
}

function emitState(user, profile) {
  var real = !!(user && !user.isAnonymous);
  var state = real ? "authenticated" : "guest";
  window.hshsAuthState = state;
  window.hshsAuthUser = real ? user : null;
  window.hshsProfile = profile || null;
  window.hshsUid = real ? user.uid : window.hshsUid;
  document.documentElement.dataset.hshsAuth = state;
  document.dispatchEvent(new CustomEvent("hshs:auth", { detail: { user: window.hshsAuthUser, profile: profile || null, state: state } }));
  document.dispatchEvent(new CustomEvent("hshs:profile", { detail: { profile: profile || null } }));
}

function persistProfileLocal(profile) {
  if (!profile) return;
  try { localStorage.setItem("userProfile", JSON.stringify(profile)); } catch (e) {}
  if (profile.uid) {
    try { localStorage.setItem("hshsUid", profile.uid); } catch (e) {}
    window.hshsUid = profile.uid;
  }
  window.hshsProfile = profile;
}

function clearLocalAccount() {
  try {
    localStorage.removeItem("userProfile");
    localStorage.removeItem("hshsUid");
  } catch (e) {}
  window.hshsProfile = null;
  window.hshsAuthUser = null;
}

function normalizeProfile(raw, user) {
  raw = raw || {};
  var uid = (user && user.uid) || raw.uid || "";
  function ts(v) {
    if (v == null) return Date.now();
    if (typeof v === "number") return v;
    if (v && typeof v.toMillis === "function") return v.toMillis();
    if (v && typeof v.seconds === "number") return v.seconds * 1000;
    return Date.now();
  }
  return {
    uid: uid,
    email: (raw.email || (user && user.email) || "").toLowerCase(),
    fullName: raw.fullName || raw.name || (user && user.displayName) || "HSHS Student",
    name: raw.fullName || raw.name || (user && user.displayName) || "HSHS Student",
    username: cleanUsername(raw.username),
    classYear: raw.classYear || "Campus",
    house: raw.house || "",
    bio: String(raw.bio || "").slice(0, 160),
    photoURL: raw.photoURL || raw.avatar || (user && user.photoURL) || "",
    avatar: raw.photoURL || raw.avatar || (user && user.photoURL) || "",
    coverURL: raw.coverURL || raw.cover || "",
    role: raw.role || "student",
    isAnonymous: false,
    createdAt: ts(raw.createdAt),
    updatedAt: ts(raw.updatedAt)
  };
}

async function lookupUserField(field, value) {
  var v = String(value || "").trim();
  if (!v) return null;
  if (field === "username" || field === "email") v = v.toLowerCase();
  if (field === "studentId") return null;
  try {
    var idx = await getDoc(doc(db(), "userIndex", field + "_" + v));
    if (idx.exists()) {
      var data = idx.data();
      return { uid: data.uid, email: data.email, field: data.field, value: data.value };
    }
  } catch (e) {}
  try {
    var q = query(collection(db(), "users"), where(field, "==", v), limit(1));
    var snap = await getDocs(q);
    if (snap.empty) return null;
    var d = snap.docs[0];
    return Object.assign({ uid: d.id }, d.data());
  } catch (e) {
    console.warn("[auth] lookup", field, e);
    return null;
  }
}

async function isUsernameTaken(username, exceptUid) {
  username = cleanUsername(username);
  if (!username || username.length < 3) return false;
  var found = await lookupUserField("username", username);
  if (!found || !found.uid) return false;
  return found.uid !== exceptUid;
}

async function claimUsername(uid, username, email) {
  username = cleanUsername(username);
  if (!username) return;
  var ref = doc(db(), "userIndex", "username_" + username);
  var snap = await getDoc(ref);
  if (snap.exists() && snap.data().uid && snap.data().uid !== uid) {
    throw new Error("That username is taken. Choose another.");
  }
  try {
    await setDoc(ref, {
      uid: uid,
      email: (email || "").toLowerCase(),
      field: "username",
      value: username
    }, { merge: true });
  } catch (e) {
    if (e && e.code === "permission-denied") {
      console.warn("[auth] username index write blocked by rules", e);
      return;
    }
    throw e;
  }
}

async function saveProfile(user, data) {
  if (!user || user.isAnonymous) throw new Error("Sign in first.");
  var uid = user.uid;
  data = data || {};
  var username = cleanUsername(data.username);
  var existingSnap = await getDoc(doc(db(), "users", uid));
  var existing = existingSnap.exists() ? existingSnap.data() : {};
  if (!username) username = cleanUsername(existing.username);

  if (username && await isUsernameTaken(username, uid)) {
    throw new Error("That username is taken. Choose another.");
  }

  var photo = data.photoURL || data.avatar || existing.photoURL || user.photoURL || "";
  if (typeof photo === "string" && photo.length > 700000) photo = existing.photoURL || "";

  var profile = {
    uid: uid,
    email: (data.email || user.email || existing.email || "").toLowerCase(),
    fullName: String(data.fullName || data.name || existing.fullName || user.displayName || "HSHS Student").slice(0, 80),
    name: String(data.fullName || data.name || existing.name || user.displayName || "HSHS Student").slice(0, 80),
    username: username,
    classYear: data.classYear || existing.classYear || "Campus",
    house: data.house || existing.house || "",
    bio: String(data.bio != null ? data.bio : (existing.bio || "")).slice(0, 160),
    photoURL: photo,
    avatar: photo,
    role: existing.role || data.role || "student",
    updatedAt: serverTimestamp(),
    isAnonymous: false
  };
  if (!existingSnap.exists()) profile.createdAt = serverTimestamp();

  try {
    await setDoc(doc(db(), "users", uid), profile, { merge: true });
  } catch (e) {
    persistProfileLocal(normalizeProfile(Object.assign({}, existing, profile, { createdAt: Date.now(), updatedAt: Date.now() }), user));
    if (e && e.code === "permission-denied") {
      throw new Error("Could not save your profile yet. Sign in again after the school updates Firestore rules.");
    }
    throw e;
  }

  if (username) await claimUsername(uid, username, profile.email);

  try {
    await updateProfile(user, {
      displayName: profile.fullName,
      photoURL: profile.photoURL && String(profile.photoURL).indexOf("http") === 0 ? profile.photoURL : undefined
    });
  } catch (e) {}

  var out = normalizeProfile(Object.assign({}, existing, profile, { createdAt: Date.now(), updatedAt: Date.now() }), user);
  persistProfileLocal(out);
  return out;
}

async function loadOrCreateProfile(user, extra) {
  if (!user || user.isAnonymous) return null;
  extra = extra || {};
  try {
    var ref = doc(db(), "users", user.uid);
    var snap = await getDoc(ref);
    if (snap.exists()) {
      var keep = snap.data();
      var data = normalizeProfile(Object.assign({ uid: user.uid }, keep, {
        email: keep.email || user.email || "",
        photoURL: keep.photoURL || user.photoURL || ""
      }), user);
      persistProfileLocal(data);
      return data;
    }
    if (window.__hshsSigningUp && !extra.username && !extra.fullName) return null;
    return saveProfile(user, {
      fullName: extra.fullName || user.displayName || "HSHS Student",
      email: extra.email || user.email || "",
      username: extra.username || "",
      photoURL: extra.photoURL || user.photoURL || "",
      classYear: extra.classYear || "Campus"
    });
  } catch (e) {
    console.warn("[auth] loadOrCreateProfile", e);
    try {
      var local = JSON.parse(localStorage.getItem("userProfile") || "null");
      if (local && local.uid === user.uid) return normalizeProfile(local, user);
    } catch (e2) {}
    return null;
  }
}

async function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(appAuth(), String(email || "").trim().toLowerCase(), password);
}

async function signUpWithEmail(email, password) {
  return createUserWithEmailAndPassword(appAuth(), String(email || "").trim().toLowerCase(), password);
}

async function signInWithGoogle() {
  var provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(appAuth(), provider);
}

async function signOutUser() {
  clearLocalAccount();
  emitState(null, null);
  return signOut(appAuth());
}

async function sendPasswordReset(email) {
  return sendPasswordResetEmail(appAuth(), String(email || "").trim().toLowerCase());
}

window.HshsAuthApi = {
  lookupUserField: lookupUserField,
  isUsernameTaken: isUsernameTaken,
  saveProfile: saveProfile,
  loadOrCreateProfile: loadOrCreateProfile,
  normalizeProfile: normalizeProfile,
  persistProfileLocal: persistProfileLocal,
  signInWithEmail: signInWithEmail,
  signUpWithEmail: signUpWithEmail,
  signInWithGoogle: signInWithGoogle,
  signOutUser: signOutUser,
  sendPasswordReset: sendPasswordReset,
  cleanUsername: cleanUsername,
  state: function () { return window.hshsAuthState || "loading"; },
  isAuthenticated: function () { return window.hshsAuthState === "authenticated"; },
  onAuthStateChanged: function (cb) { return onAuthStateChanged(appAuth(), cb); }
};

window.HshsAuth = window.HshsAuthApi;

onAuthStateChanged(appAuth(), function (user) {
  if (user && !user.isAnonymous) {
    loadOrCreateProfile(user).then(function (p) {
      emitState(user, p || null);
    }).catch(function () {
      emitState(user, null);
    });
  } else {
    if (user && user.isAnonymous) {
      signOut(appAuth()).catch(function () {});
    }
    emitState(null, null);
  }
});

console.info("[HSHS] Auth API ready");
