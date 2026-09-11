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
  onAuthStateChanged
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
  var profile = {
    uid: uid,
    email: (data.email || user.email || "").toLowerCase(),
    fullName: data.fullName || user.displayName || "HSHS Student",
    username: (data.username || "").toLowerCase(),
    studentId: String(data.studentId || "").trim(),
    classYear: data.classYear || "Campus",
    role: data.role || "student",
    photoURL: data.photoURL || user.photoURL || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isAnonymous: false
  };
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
    await updateProfile(user, { displayName: profile.fullName, photoURL: profile.photoURL || undefined });
  } catch (e) {}
  profile.createdAt = Date.now();
  profile.updatedAt = Date.now();
  return profile;
}

async function loadOrCreateProfile(user) {
  if (!user) return null;
  try {
    var ref = doc(db(), "users", user.uid);
    var snap = await getDoc(ref);
    if (snap.exists()) {
      var data = snap.data();
      return {
        uid: user.uid,
        email: data.email || user.email || "",
        fullName: data.fullName || user.displayName || "HSHS Student",
        username: data.username || "",
        studentId: data.studentId || "",
        classYear: data.classYear || "Campus",
        role: data.role || "student",
        photoURL: data.photoURL || user.photoURL || "",
        isAnonymous: !!user.isAnonymous
      };
    }
  } catch (e) {
    console.warn("[auth] load profile", e);
  }
  return saveProfile(user, {
    email: user.email || "",
    fullName: user.displayName || "HSHS Student",
    username: "",
    studentId: "",
    classYear: "Campus"
  });
}

async function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(appAuth(), email, password);
}

async function signUpWithEmail(email, password) {
  return createUserWithEmailAndPassword(appAuth(), email, password);
}

async function signOutUser() {
  try { localStorage.removeItem("userProfile"); } catch (e) {}
  return signOut(appAuth());
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
  signInWithEmail: signInWithEmail,
  signUpWithEmail: signUpWithEmail,
  signOutUser: signOutUser,
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
      try { localStorage.setItem("userProfile", JSON.stringify(p)); } catch (e) {}
      window.hshsProfile = p;
      document.dispatchEvent(new CustomEvent("hshs:auth", { detail: { user: user, profile: p } }));
    });
  } else {
    document.dispatchEvent(new CustomEvent("hshs:auth", { detail: { user: user || null } }));
  }
});

console.info("[HSHS] Auth API ready");
