# HSHS World media-reference audit

Run this from the repository root after deploying the updated R2 Worker pagination route:

```bash
SUPABASE_URL="https://hhlogdqpgjiajeufwnop.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="(set locally; never commit or paste it)" \
node scripts/check-media-refs.mjs
```

The script reads the R2 object inventory and the candidate media columns in Supabase. It does not modify database rows or apply migrations. It writes:

- `audit/live-objects.json`: complete R2 object inventory.
- `audit/report.csv`: repository and database reference classifications.
- `backup/<table>-<date>.json`: full copies of database rows containing references classified as DEAD, before any later repair.

The audit stops if the Worker does not return `truncated` and `cursor` pagination metadata. In that case, deploy `worker/hshs-r2-sign.js` or export the bucket object listing from the Cloudflare dashboard and provide the export.

Verdicts include OK, DEAD, EXTERNAL, LOCAL, BLOB and DATA_URI. A BLOB hit in source code is not automatically a persisted database value; inspect the matching call path. DATA_URI is reported separately because it is neither a blob URL nor a durable R2 object reference.

The script exits non-zero if any DEAD references are found. It uses the service-role key only in request headers and never prints it. Audit and backup outputs are ignored by git because they can contain private object keys and user content.

The script currently uses the media columns verified in the live public schema: photos, posts, videos and users. Re-check the schema if those tables change.
