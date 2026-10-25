/**
 * HSHS World - R2 + Admin Worker (restored; content routes in follow-up)
 * See repo history 665385d for full prior version.
 * PLACEHOLDER_RESTORE_ME
 */
export default { async fetch() { return new Response(JSON.stringify({ error: 'Worker restore incomplete - redeploy from local artifacts' }), { status: 503, headers: { 'Content-Type': 'application/json' } }); } };
