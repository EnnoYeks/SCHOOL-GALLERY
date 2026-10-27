# HSHS World Python Tooling

This repository now includes Python tooling for site auditing, CSS safety, media processing, backups, moderation, album grouping, and reporting.

## Important notes

- These are intentionally designed for low-data / slow-connection environments.
- All destructive actions default to safe dry-run behavior.
- Secrets must come from environment variables; see `.env.example`.
- Heavy compute (ffmpeg, large batch uploads) is kept in CLI tools rather than Vercel serverless functions.

## Tool index

1. `tools/site_check.py` — crawl the live site or local HTML and report broken links, missing assets, and page health. Output: terminal report + `report.html`.
2. `tools/css_tool.py` — analyze CSS, find duplicates and likely overrides, produce a safe merged CSS bundle in `/dist-css` without touching originals.
3. `tools/media_pipeline.py` — resize images, convert to WebP, blur placeholders, strip EXIF GPS, create video posters, and upload processed assets to R2.
4. `tools/backup.py` — copy R2 media to B2, export Supabase data, verify checksums.
5. `tools/moderate.py` — scan for unsafe media, flag for admin review, and write moderation records to Supabase.
6. `tools/auto_albums.py` — group asset files by date into album suggestions.
7. `tools/weekly_report.py` — generate a summary report for staff from Supabase.
8. `tools/yearbook_pdf.py` — export a yearbook-style PDF for an album or event.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Then fill in your keys in `.env`.

## Example commands

```bash
python tools/site_check.py --base-url https://hshsgallery.vercel.app
python tools/css_tool.py --root . --report-dir /tmp/hshs-css
python tools/media_pipeline.py --input-dir ./uploads --dry-run
python tools/backup.py --dry-run
python tools/moderate.py --input-dir ./uploads --dry-run
python tools/auto_albums.py --input-dir ./uploads --dry-run
python tools/weekly_report.py --output ./reports/weekly.html
python tools/yearbook_pdf.py --album-name "2026 Events" --output ./reports/yearbook.pdf
```

## Why these tools work

- `site_check.py` uses `requests` + `BeautifulSoup` to inspect HTML and catch common route/asset issues.
- `css_tool.py` reads the real CSS and the real HTML/JS class names so it can estimate duplicates and suspicious overrides.
- `media_pipeline.py` uses Pillow to normalize images and ffmpeg to prepare video posters without putting heavy work into Vercel serverless functions.
- `backup.py` and `moderate.py` are intentionally safe: they default to dry-run and never delete from the source store.
- `auto_albums.py`, `weekly_report.py`, and `yearbook_pdf.py` all read metadata or Supabase data and produce staff-friendly outputs rather than altering the core app design.
