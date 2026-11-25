const { cert, getApps, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

async function main() {
  const email = String(process.argv[2] || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Usage: npm run set-admin -- admin@example.com");
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
  const user = await auth.getUserByEmail(email);
  if (!user.emailVerified) throw new Error("The Firebase account email must be verified first");
  const claims = { ...(user.customClaims || {}), admin: true };
  await auth.setCustomUserClaims(user.uid, claims);
  console.log("Admin claim set for verified account:", user.email, "UID:", user.uid);
  console.log("The user must refresh their ID token or sign in again before the claim appears.");
}

main().catch((error) => {
  console.error("[set-admin]", error.message);
  process.exitCode = 1;
});
