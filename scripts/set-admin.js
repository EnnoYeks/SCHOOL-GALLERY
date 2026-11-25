const { cert, getApps, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Usage: node scripts/set-admin.js add|remove email1 [email2 ...]");
    process.exit(1);
  }
  const action = args[0].toLowerCase();
  if (action !== "add" && action !== "remove") {
    console.error("First arg must be add or remove");
    process.exit(1);
  }
  const emails = args.slice(1).map(e => String(e).trim().toLowerCase()).filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
  if (!emails.length) {
    console.error("Provide at least one valid email");
    process.exit(1);
  }
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is required");
  }
  if (!getApps().length) {
    initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
      projectId: "school-gallery-62032"
    });
  }
  const auth = getAuth();
  for (const email of emails) {
    try {
      const user = await auth.getUserByEmail(email);
      if (action === "add") {
        if (!user.emailVerified) {
          console.log("SKIP (email not verified):", email);
          continue;
        }
        const claims = { ...(user.customClaims || {}), admin: true };
        await auth.setCustomUserClaims(user.uid, claims);
        console.log("Admin claim ADDED for:", email, "UID:", user.uid);
      } else {
        const claims = { ...(user.customClaims || {}) };
        delete claims.admin;
        await auth.setCustomUserClaims(user.uid, claims);
        await auth.revokeRefreshTokens(user.uid);
        console.log("Admin claim REMOVED and tokens revoked for:", email, "UID:", user.uid);
      }
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        console.log("NOT SIGNED UP YET:", email, "- they must create an account first");
      } else {
        console.error("ERROR for", email, ":", err.message);
      }
    }
  }
  console.log("Done. Users must refresh their ID token or sign in again for claim changes to take effect.");
}

main().catch((error) => {
  console.error("[set-admin]", error.message);
  process.exitCode = 1;
});
