/**
 * HSHS World · FirebaseUI login (Google + Email/password only)
 */
(function () {
  var firebaseConfig = {
    apiKey: "AIzaSyCoFBtKrk7ZRvV1mZe5hN9tRCPKsuQBlgo",
    authDomain: "school-gallery-62032.firebaseapp.com",
    projectId: "school-gallery-62032",
    messagingSenderId: "931689210926",
    appId: "1:931689210926:web:fd2daf8495d6e6f3e42bbf",
    measurementId: "G-5W89YVBV6J"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  var auth = firebase.auth();
  var db = firebase.firestore();

  function qs(name) {
    try {
      return new URLSearchParams(location.search).get(name);
    } catch (e) {
      return null;
    }
  }

  function nextUrl() {
    var n = qs("next");
    if (n && n.charAt(0) === "/") return n;
    if (n && /^index\//.test(n)) return "../" + n;
    return "../index.html";
  }

  function msg(text, ok) {
    var el = document.getElementById("authMsg");
    if (!el) return;
    el.textContent = text || "";
    el.className = "hshs-auth-msg" + (text ? (ok ? " is-ok" : " is-error") : "");
  }

  function storeProfile(profile) {
    try {
      localStorage.setItem("userProfile", JSON.stringify(profile));
      if (profile.uid) localStorage.setItem("hshsUid", profile.uid);
    } catch (e) {}
    window.hshsProfile = profile;
    window.hshsAuthUser = auth.currentUser;
    window.hshsUid = profile.uid;
    try {
      document.dispatchEvent(new CustomEvent("hshs:profile", { detail: { profile: profile } }));
      document.dispatchEvent(new CustomEvent("hshs:auth", { detail: { user: auth.currentUser } }));
    } catch (e) {}
  }

  async function ensureUserDoc(user) {
    if (!user || user.isAnonymous) return null;
    var ref = db.collection("users").doc(user.uid);
    var snap = await ref.get();
    var base = {
      uid: user.uid,
      email: (user.email || "").toLowerCase(),
      fullName: user.displayName || "HSHS Student",
      name: user.displayName || "HSHS Student",
      photoURL: user.photoURL || "",
      avatar: user.photoURL || "",
      isAnonymous: false,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    if (!snap.exists) {
      base.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      base.role = "student";
      base.classYear = "Campus";
      base.username = "";
      base.studentId = "";
      await ref.set(base, { merge: true });
      return Object.assign({}, base, {
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
    await ref.set(
      {
        email: base.email || snap.data().email || "",
        fullName: base.fullName || snap.data().fullName,
        photoURL: base.photoURL || snap.data().photoURL || "",
        avatar: base.photoURL || snap.data().avatar || "",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        isAnonymous: false
      },
      { merge: true }
    );
    var data = Object.assign({ uid: user.uid }, snap.data(), {
      email: base.email || snap.data().email,
      fullName: base.fullName || snap.data().fullName,
      photoURL: base.photoURL || snap.data().photoURL,
      updatedAt: Date.now()
    });
    return data;
  }

  function needsSchoolFields(profile) {
    if (!profile) return true;
    return !profile.username;
  }

  async function finishSignIn(user, method) {
    try {
      if (window.HshsAnalytics && window.HshsAnalytics.events) {
        window.HshsAnalytics.events.login(
          method ||
            (user && user.providerData && user.providerData[0] && user.providerData[0].providerId) ||
            "firebaseui"
        );
      }
      var profile = await ensureUserDoc(user);
      storeProfile(
        profile || {
          uid: user.uid,
          email: user.email || "",
          fullName: user.displayName || "HSHS Student",
          photoURL: user.photoURL || ""
        }
      );
      if (needsSchoolFields(profile)) {
        location.href = "edit-profile.html?welcome=1";
        return;
      }
      location.href = nextUrl();
    } catch (err) {
      console.error(err);
      msg((err && err.message) || "Signed in, but profile sync failed.");
      setTimeout(function () {
        location.href = nextUrl();
      }, 1200);
    }
  }

  var uiConfig = {
    signInFlow: "popup",
    signInSuccessUrl: nextUrl(),
    signInOptions: [
      {
        provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        fullLabel: "Continue with Google"
      },
      {
        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
        requireDisplayName: true,
        fullLabel: "Continue with Email"
      }
    ],
    callbacks: {
      signInSuccessWithAuthResult: function (authResult) {
        finishSignIn(authResult.user);
        return false;
      },
      signInFailure: function (error) {
        msg((error && error.message) || "Sign-in failed.");
        return Promise.resolve();
      },
      uiShown: function () {
        msg("");
      }
    },
    credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO
  };

  try {
    var ui = new firebaseui.auth.AuthUI(auth);
    ui.start("#firebaseui-auth-container", uiConfig);
  } catch (e) {
    console.error("[firebaseui]", e);
    msg("Could not load sign-in UI. Enable Google and Email in Firebase Console.");
  }
})();
