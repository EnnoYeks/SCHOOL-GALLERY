const { cert, getApps, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

function firebaseAuth() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is not configured");
  }
  if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({ credential: cert(serviceAccount), projectId: "school-gallery-62032" });
  }
  return getAuth();
}

async function requireAdmin(req, res) {
  const header = String(req.headers.authorization || "");
  const token = header.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  if (!token) {
    res.status(401).json({ error: "No token" });
    return null;
  }

  try {
    const decoded = await firebaseAuth().verifyIdToken(token, true);
    if (decoded.admin !== true) {
      res.status(403).json({ error: "Not admin" });
      return null;
    }
    return decoded;
  } catch (error) {
    res.status(401).json({ error: "Bad token" });
    return null;
  }
}

module.exports = { requireAdmin };
