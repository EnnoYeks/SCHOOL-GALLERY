from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def test_admin_ui_requires_worker_verified_admin():
    source = read("js/admin.js")
    assert "OPEN_ACCESS" not in source
    assert "openAccess" not in source
    assert "adminApi.me()" in source
    assert "me.admin === true" in source
    assert "Sign in required" in source
    assert "You do not have permission" in source


def test_admin_browser_has_no_direct_supabase_writes():
    source = read("js/admin.js")
    assert "window.supabase.from(" not in source
    assert "window.db.createPhoto" not in source
    assert "window.db.createVideo" not in source
    assert "window.db.createPost" not in source


def test_admin_worker_uses_verified_firebase_jwks():
    source = read("worker/hshs-r2-sign.js")
    assert "service_accounts/v1/jwk/securetoken@system.gserviceaccount.com" in source
    assert "robot/v1/metadata/x509" not in source
    assert 'header.alg !== "RS256"' in source
    assert "emailVerified: payload.email_verified === true" in source
    assert "ADMIN_EMAILS" in source


def test_worker_partial_updates_are_whitelisted_and_preserve_fields():
    source = read("worker/hshs-r2-sign.js")
    assert "const fields = [\"title\", \"description\", \"category\", \"class_tag\", \"image_url\", \"thumbnail_url\", \"video_url\", \"media_key\", \"width\", \"height\", \"featured\"]" in source
    assert "if (target === \"posts\" && Object.prototype.hasOwnProperty.call(body, \"status\"))" in source
    assert 'if (!data) return reply({ error: "Content not found" }, 404, true);' in source


def test_worker_delete_cleans_media_and_feature_toggle_is_partial():
    source = read("worker/hshs-r2-sign.js")
    assert 'select("*").eq("id", id).single()' in source
    assert "bucket.delete(key)" in source
    assert 'await window.adminApi.updateContent' not in source


def test_migration_locks_events_and_admin_fields_without_dropping_user_policies():
    sql = read("supabase-migration-admin-lockdown.sql")
    assert "revoke insert, update, delete on public.events from anon, authenticated" in sql
    assert "hshs_block_browser_admin_column_changes" in sql
    assert "drop policy" in sql.lower()
    assert "NOT applied to production" in sql


def test_public_worker_upload_routes_require_auth_and_ownership():
    source = read("worker/hshs-r2-sign.js")
    assert 'if (url.pathname === "/list" && request.method === "GET")' in source
    assert 'const verified = await verifyFirebaseToken(request);' in source
    assert 'if (!isAdmin(verified, env)) return reply({ error: "Forbidden" }, 403);' in source
    assert "async function assertCanWrite(bucket, uid, key)" in source
    assert "customMetadata: { uid: verified.uid }" in source
    assert "Content-Length required" in source
    assert "Access-Control-Allow-Origin: \"*\"" not in source
    assert "env.ALLOWED_ORIGINS" in source


def test_worker_firebase_issued_at_syntax_and_check():
    source = read("worker/hshs-r2-sign.js")
    assert "payload.iat > now)" in source
    assert "ADMIN_UIDS" not in source
