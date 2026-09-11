/**
 * HSHS World \u00b7 FirebaseUI login (Google, Facebook, Email)
 * + school Student ID / Username fallback
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
    return !profile.studentId || !profile.username;
  }

  async function finishSignIn(user) {
    try {
      var profile = await ensureUserDoc(user);
      storeProfile(profile || {
        uid: user.uid,
        email: user.email || "",
        fullName: user.displayName || "HSHS Student",
        photoURL: user.photoURL || ""
      });
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
        provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        fullLabel: "Continue with Facebook"
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
    msg("Could not load sign-in UI. Enable Google/Facebook/Email in Firebase Console.");
  }

  var method = "studentId";
  document.querySelectorAll("[data-login-method]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      method = btn.getAttribute("data-login-method");
      document.querySelectorAll("[data-login-method]").forEach(function (b) {
        b.classList.toggle("is-on", b === btn);
      });
      document.querySelectorAll("[data-method-panel]").forEach(function (p) {
        p.hidden = p.getAttribute("data-method-panel") !== method;
      });
    });
  });

  document.querySelectorAll("[data-toggle-password]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-toggle-password");
      var input = document.getElementById(id);
      if (!input) return;
      input.type = input.type === "password" ? "text" : "password";
      var icon = btn.querySelector("i");
      if (icon) icon.className = input.type === "password" ? "fas fa-eye" : "fas fa-eye-slash";
    });
  });

  var schoolForm = document.getElementById("authSchoolForm");
  if (schoolForm) {
    schoolForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      var password = (document.getElementById("loginPassword") || {}).value || "";
      if (password.length < 6) {
        msg("Enter your password.");
        return;
      }
      var email = null;
      try {
        msg("Looking up account\u2026");
        if (method === "studentId") {
          var sid = ((document.getElementById("loginStudentId") || {}).value || "").trim();
          if (!sid) {
            msg("Enter your student ID.");
            return;
          }
          var idx = await db.collection("userIndex").doc("studentId_" + sid).get();
          if (!idx.exists) {
            var q = await db.collection("users").where("studentId", "==", sid).limit(1).get();
            if (q.empty) {
              msg("No account with that student ID.");
              return;
            }
            email = (q.docs[0].data().email || "").toLowerCase();
          } else {
            email = (idx.data().email || "").toLowerCase();
          }
        } else {
          var un = ((document.getElementById("loginUsername") || {}).value || "").trim().toLowerCase();
          if (!un) {
            msg("Enter your username.");
            return;
          }
          var idx2 = await db.collection("userIndex").doc("username_" + un).get();
          if (!idx2.exists) {
            var q2 = await db.collection("users").where("username", "==", un).limit(1).get();
            if (q2.empty) {
              msg("No account with that username.");
              return;
            }
            email = (q2.docs[0].data().email || "").toLowerCase();
          } else {
            email = (idx2.data().email || "").toLowerCase();
          }
        }
        if (!email) {
          msg("Account found but has no email. Use Google / email sign-in.");
          return;
        }
        var cred = await auth.signInWithEmailAndPassword(email, password);
        window.__hshsFuiHandled = true;
        await finishSignIn(cred.user);
      } catch (err) {
        var code = err && err.code;
        if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
          msg("Wrong password.");
        } else if (code === "auth/user-not-found") {
          msg("Account not found.");
        } else {
          msg((err && err.message) || "Sign-in failed.");
        }
      }
    });
  }
})();
