# HSHS World Python Tooling

This repository includes Python tooling for site auditing, CSS safety, media processing, backups, moderation, album grouping, and reporting.

## Important notes

- These are intentionally designed for low-data / slow-connection environments.
- All destructive actions default to safe dry-run behavior. Pass `--live` to perform real writes/uploads.
- Secrets must come from environment variables; see `.env.example`.
- Heavy compute (ffmpeg, large batch uploads) is kept in CLI tools rather than Vercel serverless functions.
- tools/python/ contains specialized jobs (R2-direct media processing, trending scores, path audit, streaming backup helper).

## Tool index

1. `tools/site_check.py` — crawl the live site or local HTML and report broken links, missing assets, clean-URL 404s, and page health. Output: terminal report + `report.html`. Exits 1 on issues (CI-friendly).
2. `tools/css_tool.py` — analyze the CSS files in `/css`, find duplicates and likely overrides, produce a single merged + minified bundle in `/dist-css` without touching originals. Use `--verify` for order-sensitive warnings.
3. `tools/media_pipeline.py` — resize images (true 320px thumbs, medium/large from original), convert to WebP, blur placeholders, strip EXIF GPS, create video posters, resumable R2 upload, progress bar, low-data mode, and write a manifest JSON.
4. `tools/backup.py` — stream R2 media to B2 (download + upload, paginated, skip same-size), export Supabase data, verify counts. Never deletes from source.
5. `tools/moderate.py` — basic screening (tiny, dark, blurry, oversized, wrong type, simple perceptual duplicates). Flags for admin review. Writes real UTC timestamps. Human review required.
6. `tools/auto_albums.py` — group asset files by EXIF/mtime date into album suggestions.
7. `tools/weekly_report.py` — generate a summary report for staff from real Supabase queries (shows clearly when data is missing).
8. `tools/yearbook_pdf.py` — export a yearbook-style PDF (cover, photo grids, captions, page numbers) from local images or R2 URLs.

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
python tools/css_tool.py --root . --report-dir dist-css --verify
python tools/media_pipeline.py --input-dir ./uploads --live --low-data
python tools/backup.py --live
python tools/moderate.py --input-dir ./uploads --live
python tools/auto_albums.py --input-dir ./uploads --live
python tools/weekly_report.py --output ./reports/weekly.html
python tools/yearbook_pdf.py --album-name "2026 Events" --output ./reports/yearbook.pdf --images photo1.jpg photo2.jpg
```

## Specialized jobs in tools/python/

```bash
python tools/python/process_media.py          # process media already in R2
python tools/python/trending_job.py           # refresh trending scores
python tools/python/backup_to_b2.py           # streaming R2→B2 helper
python tools/python/audit_paths.py            # scan for legacy path patterns
```

## Why these tools work

- `site_check.py` uses `requests` + `BeautifulSoup` to inspect HTML and catch common route/asset issues, including clean URL checks.
- `css_tool.py` reads the real CSS and HTML/JS class names so it can estimate duplicates and suspicious overrides, then emits a safe merged bundle.
- `media_pipeline.py` uses Pillow to normalize images (thumbs from original) and ffmpeg for video posters; uploads are resumable.
- `backup.py` streams objects so it works across providers and never loads large files fully into memory.
- `moderate.py` downscales before analysis and labels itself as basic screening only.
- `auto_albums.py`, `weekly_report.py`, and `yearbook_pdf.py` produce staff-friendly outputs rather than altering the core app design.
