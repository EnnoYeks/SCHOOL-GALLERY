"""Refresh trending_score for photos and videos. Keep the Supabase service key server-side."""
import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])


def score(row, now):
    raw = row.get("created_at")
    if not raw:
        return 0.0
    created = datetime.fromisoformat(raw.replace("Z", "+00:00"))
    hours = max((now - created).total_seconds() / 3600, 0)
    points = (row.get("likes") or 0) * 3 + (row.get("views") or 0)
    return points / ((hours + 2) ** 1.5)


def main():
    now = datetime.now(timezone.utc)
    for table in ("photos", "videos"):
        rows = sb.table(table).select("id,created_at,likes,views").limit(5000).execute().data or []
        for row in rows:
            sb.table(table).update({"trending_score": round(score(row, now), 4)}).eq("id", row["id"]).execute()
        print(table, "scored", len(rows), "rows")


if __name__ == "__main__":
    main()
