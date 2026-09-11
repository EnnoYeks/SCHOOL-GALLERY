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
  return profile;
}
