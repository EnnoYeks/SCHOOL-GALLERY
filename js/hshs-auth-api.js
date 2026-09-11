/**
 * Firebase Auth API for HSHS World
 * Email/password + profile index for studentId / username login
 */
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail
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

async function lookupUserField(field, value) {
  var v = String(value || "").trim();
  if (!v) return null;
  if (field === "username" || field === "email") v = v.toLowerCase();
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
    username: String(raw.username || "").toLowerCase(),
    studentId: String(raw.studentId || "").trim(),
    classYear: raw.classYear || "Campus",
    house: raw.house || "",
    bio: String(raw.bio || "").slice(0, 160),
    headline: String(raw.headline || "").slice(0, 80),
    pronouns: raw.pronouns || "",
    phone: raw.phone || "",
    whatsapp: raw.whatsapp || "",
    location: raw.location || "",
    website: raw.website || "",
    instagram: String(raw.instagram || "").replace(/^@/, ""),
    tiktok: String(raw.tiktok || "").replace(/^@/, ""),
    interests: Array.isArray(raw.interests) ? raw.interests : [],
    photoURL: raw.photoURL || raw.avatar || (user && user.photoURL) || "",
    avatar: raw.photoURL || raw.avatar || (user && user.photoURL) || "",
    coverURL: raw.coverURL || raw.cover || "",
    cover: raw.coverURL || raw.cover || "",
    showEmail: !!raw.showEmail,
    showPhone: !!raw.showPhone,
    showStudentId: raw.showStudentId !== false,
    privateAccount: !!raw.privateAccount,
    allowMessages: raw.allowMessages !== false,
    showActivity: raw.showActivity !== false,
    role: raw.role || "student",
    isAnonymous: false,
    createdAt: ts(raw.createdAt),
    updatedAt: ts(raw.updatedAt)
  };
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

async function saveProfile(user, data) {
  var uid = user.uid;
  data = data || {};
  var photo = data.photoURL || data.avatar || user.photoURL || "";
  var cover = data.coverURL || data.cover || "";
  if (typeof photo === "string" && photo.length > 700000) photo = "";
  if (typeof cover === "string" && cover.length > 700000) cover = "";

  var profile = {
    uid: uid,
    email: (data.email || user.email || "").toLowerCase(),
    fullName: data.fullName || data.name || user.displayName || "HSHS Student",
    name: data.fullName || data.name || user.displayName || "HSHS Student",
    username: String(data.username || "").toLowerCase().replace(/[^a-z0-9._]/g, ""),
    studentId: String(data.studentId || "").trim(),
    classYear: data.classYear || "Campus",
    house: data.house || "",
    bio: String(data.bio || "").slice(0, 160),
    headline: String(data.headline || "").slice(0, 80),
    pronouns: data.pronouns || "",
    phone: data.phone || "",
    whatsapp: data.whatsapp || "",
    location: data.location || "",
    website: data.website || "",
    instagram: String(data.instagram || "").replace(/^@/, ""),
    tiktok: String(data.tiktok || "").replace(/^@/, ""),
    interests: Array.isArray(data.interests) ? data.interests.slice(0, 20) : [],
    photoURL: photo,
    avatar: photo,
    coverURL: cover,
    cover: cover,
    showEmail: !!data.showEmail,
    showPhone: !!data.showPhone,
    showStudentId: data.showStudentId !== false,
    privateAccount: !!data.privateAccount,
    allowMessages: data.allowMessages !== false,
    showActivity: data.showActivity !== false,
    role: data.role || "student",
    updatedAt: serverTimestamp(),
    isAnonymous: false
  };

  var existing = await getDoc(doc(db(), "users", uid));
  if (!existing.exists()) {
    profile.createdAt = serverTimestamp();
  }

  await setDoc(doc(db(), "users", uid), profile, { merge: true });

  if (profile.studentId) {
    await setDoc(doc(db(), "userIndex", "studentId_" + profile.studentId), {
      uid: uid, email: profile.email, field: "studentId", value: profile.studentId
    }, { merge: true });
  }
  if (profile.username) {
    await setDoc(doc(db(), "userIndex", "username_" + profile.username), {
      uid: uid, email: profile.email, field: "username", value: profile.username
    }, { merge: true });
  }
  try {
    await updateProfile(user, {
      displayName: profile.fullName,
      photoURL: profile.photoURL && profile.photoURL.indexOf("http") === 0 ? profile.photoURL : undefined
    });
  } catch (e) {}
  profile.createdAt = Date.now();
  profile.updatedAt = Date.now();
  var out = normalizeProfile(profile, user);
  persistProfileLocal(out);
  return out;
}

async function loadOrCreateProfile(user) {
  if (!user) return null;
  try {
    var ref = doc(db(), "users", user.uid);
    var snap = await getDoc(ref);
    if (snap.exists()) {
      var data = normalizeProfile(Object.assign({ uid: user.uid }, snap.data()), user);
      persistProfileLocal(data);
      return data;
    }
    var created = await saveProfile(user, {
      fullName: user.displayName || "HSHS Student",
      email: user.email || "",
      photoURL: user.photoURL || "",
      classYear: "Campus"
    });
    var normalized = normalizeProfile(created, user);
    persistProfileLocal(normalized);
    return normalized;
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
  return signInWithEmailAndPassword(appAuth(), email, password);
}

async function signUpWithEmail(email, password) {
  return createUserWithEmailAndPassword(appAuth(), email, password);
}

async function signOutUser() {
  try {
    localStorage.removeItem("userProfile");
    localStorage.removeItem("hshsUid");
  } catch (e) {}
  window.hshsProfile = null;
  window.hshsUid = null;
  window.hshsAuthUser = null;
  return signOut(appAuth());
}

async function sendPasswordReset(email) {
  return sendPasswordResetEmail(appAuth(), String(email || "").trim());
}

async function activityForUser(uid, max) {
  max = max || 40;
  var out = { posts: [], photos: [], videos: [] };
  if (!uid) return out;
  try {
    var postsQ = query(collection(db(), "posts"), where("authorId", "==", uid), limit(max));
    var postsSnap = await getDocs(postsQ);
    out.posts = postsSnap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
  } catch (e) { console.warn("[auth] activity posts", e); }
  try {
    var photosQ = query(collection(db(), "photos"), where("authorId", "==", uid), limit(max));
    var photosSnap = await getDocs(photosQ);
    out.photos = photosSnap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
  } catch (e) {}
  try {
    var videosQ = query(collection(db(), "videos"), where("authorId", "==", uid), limit(max));
    var videosSnap = await getDocs(videosQ);
    out.videos = videosSnap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
  } catch (e) {}
  return out;
}

async function lookupUserFieldSafe(field, value) {
  var v = String(value || "").trim();
  if (field === "username") v = v.toLowerCase();
  try {
    var idx = await getDoc(doc(db(), "userIndex", field + "_" + v));
    if (idx.exists()) {
      var data = idx.data();
      return { uid: data.uid, email: data.email };
    }
  } catch (e) {}
  return lookupUserField(field, value);
}

window.HshsAuthApi = {
  lookupUserField: lookupUserFieldSafe,
  saveProfile: saveProfile,
  loadOrCreateProfile: loadOrCreateProfile,
  normalizeProfile: normalizeProfile,
  persistProfileLocal: persistProfileLocal,
  signInWithEmail: signInWithEmail,
  signUpWithEmail: signUpWithEmail,
  signOutUser: signOutUser,
  sendPasswordReset: sendPasswordReset,
  activityForUser: activityForUser,
  onAuthStateChanged: function (cb) {
    return onAuthStateChanged(appAuth(), cb);
  }
};

onAuthStateChanged(appAuth(), function (user) {
  window.hshsAuthUser = user || null;
  window.hshsUid = user ? user.uid : null;
  if (user && !user.isAnonymous) {
    loadOrCreateProfile(user).then(function (p) {
      if (p) persistProfileLocal(p);
      document.dispatchEvent(new CustomEvent("hshs:auth", { detail: { user: user, profile: p || null } }));
      document.dispatchEvent(new CustomEvent("hshs:profile", { detail: { profile: p || null } }));
    }).catch(function (err) {
      console.warn("[auth] profile hydrate failed", err);
      document.dispatchEvent(new CustomEvent("hshs:auth", { detail: { user: user, profile: null } }));
    });
  } else {
    document.dispatchEvent(new CustomEvent("hshs:auth", { detail: { user: user || null, profile: null } }));
  }
});

console.info("[HSHS] Auth API ready");
