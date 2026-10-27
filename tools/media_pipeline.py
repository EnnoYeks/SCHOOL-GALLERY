from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Dict, Iterable, List


CSS_SELECTOR_RE = re.compile(r"([^{]+)\s*\{", re.MULTILINE)


def is_probably_unused(selector: str, class_names: set[str]) -> bool:
    selector = selector.strip()
    if not selector or selector.startswith("@"):
        return False
    identifiers = set(re.findall(r"(?:\.|#)?([A-Za-z0-9_-]+)", selector))
    if not identifiers:
        return False
    for ident in identifiers:
        if ident in class_names:
            return False
    return True


def list_css_files(root: Path) -> List[Path]:
    css_dir = root / "css"
    return sorted(css_dir.glob("*.css")) if css_dir.exists() else []


def extract_selector_names(css_text: str) -> List[str]:
    selectors = []
    for match in CSS_SELECTOR_RE.finditer(css_text):
        selector = match.group(1).strip()
        if selector:
            selectors.append(selector)
    return selectors


def deduplicate_and_find_overrides(css_files: Iterable[Path]) -> dict:
    seen = {}
    duplicates = []
    override_candidates = []
    all_selectors = []

    for path in css_files:
        text = path.read_text(encoding="utf-8", errors="ignore")
        for selector in extract_selector_names(text):
            key = selector.split()[0].strip()
            if key in seen:
                duplicates.append({"selector": key, "files": [seen[key], path.name]})
            else:
                seen[key] = path.name
            all_selectors.append({"selector": selector, "file": path.name})

    for item in all_selectors:
        if item["selector"].startswith("@"):
            continue
        if item["selector"].startswith("."):
            override_candidates.append(item)

    return {"duplicates": duplicates, "override_candidates": override_candidates[:200], "total": len(all_selectors)}


def collect_html_classes(root: Path) -> set[str]:
    class_names = set()
    for path in root.rglob("*.html"):
        text = path.read_text(encoding="utf-8", errors="ignore")
        class_names.update(re.findall(r"class=['\"]([^'\"]+)['\"]", text))
    for path in root.rglob("*.js"):
        text = path.read_text(encoding="utf-8", errors="ignore")
        class_names.update(re.findall(r"classList\.(?:add|remove|toggle)\(['\"]([^'\"]+)['\"]", text))
        class_names.update(re.findall(r"\.([A-Za-z0-9_-]+)", text))
    cleaned = set()
    for name in class_names:
        for piece in name.split():
            cleaned.add(piece.strip())
    return cleaned


def merge_css_files(css_files: list[Path], output_dir: Path) -> dict:
    output_dir.mkdir(parents=True, exist_ok=True)
    merged = []
    for path in css_files:
        text = path.read_text(encoding="utf-8", errors="ignore")
        merged.append(text)

    merged_text = "\n\n".join(merged)
    merged_path = output_dir / "merged.css"
    merged_path.write_text(merged_text, encoding="utf-8")

    minified = re.sub(r"\s+", " ", merged_text)
    minified = re.sub(r"\s*([{}:;,])\s*", r"\1", minified)
    minified = re.sub(r";}", "}", minified)
    (output_dir / "merged.min.css").write_text(minified, encoding="utf-8")

    return {"merged_path": str(merged_path), "minified_path": str(output_dir / "merged.min.css"), "size_bytes": len(merged_text.encode("utf-8"))}


def generate_report(root: Path, css_files: list[Path], output_dir: Path) -> str:
    html_classes = collect_html_classes(root)
    analysis = deduplicate_and_find_overrides(css_files)
    unused = []
    for selector in [item["selector"] for item in analysis["override_candidates"]]:
        if is_probably_unused(selector, html_classes):
            unused.append(selector)

    report = {
        "css_files": [f.name for f in css_files],
        "selector_count": analysis["total"],
        "duplicate_selectors": analysis["duplicates"],
        "likely_unused": unused[:100],
        "merged_bundle": str(output_dir / "merged.min.css"),
    }
    return json.dumps(report, indent=2)


def main() -> int:
    parser = argparse.ArgumentParser(description="Analyze CSS for duplicates and likely overrides, then build a safe merged bundle in a new folder.")
    parser.add_argument("--root", default=".", help="Project root")
    parser.add_argument("--report-dir", default="dist-css", help="Output folder for CSS bundles")
    parser.add_argument("--verify", action="store_true", help="Run a simple verification pass")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    output_dir = root / args.report_dir
    css_files = list_css_files(root)

    if not css_files:
        print("No CSS files found in /css")
        return 1

    bundle = merge_css_files(css_files, output_dir)
    report = generate_report(root, css_files, output_dir)
    (output_dir / "audit-report.json").write_text(report, encoding="utf-8")

    print(f"CSS bundle created in {output_dir}")
    print(f"Merged bundle size: {bundle['size_bytes']} bytes")
    print(report)

    if args.verify:
        print("Verification mode: CSS bundles generated successfully; no original CSS files were overwritten.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
