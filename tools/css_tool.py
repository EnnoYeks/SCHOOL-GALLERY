"""Analyze CSS files for duplicates and overrides, produce a single merged + minified bundle.

Does not modify original CSS files. Outputs to dist-css/ by default.
Includes a verify mode that warns about order-sensitive overrides.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Dict, Iterable, List


CSS_SELECTOR_RE = re.compile(r"([^{]+)\{", re.MULTILINE)


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
    if not css_dir.exists():
        return []
    return sorted(css_dir.glob("*.css"))


def extract_selector_names(css_text: str) -> List[str]:
    selectors = []
    for match in CSS_SELECTOR_RE.finditer(css_text):
        selector = match.group(1).strip()
        if selector:
            selectors.append(selector)
    return selectors


def deduplicate_and_find_overrides(css_files: Iterable[Path]) -> dict:
    seen: Dict[str, str] = {}
    duplicates = []
    override_candidates = []
    all_selectors = []

    for path in css_files:
        text = path.read_text(encoding="utf-8", errors="ignore")
        for selector in extract_selector_names(text):
            key = selector.split()[0].strip()
            if key in seen and seen[key] != path.name:
                duplicates.append({"selector": key, "files": [seen[key], path.name]})
            else:
                seen[key] = path.name
            all_selectors.append({"selector": selector, "file": path.name})

    for item in all_selectors:
        if item["selector"].startswith("@") or not item["selector"].startswith("."):
            continue
        override_candidates.append(item)

    return {
        "duplicates": duplicates,
        "override_candidates": override_candidates[:300],
        "total": len(all_selectors),
    }


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
    merged_parts = []
    for path in css_files:
        text = path.read_text(encoding="utf-8", errors="ignore")
        merged_parts.append(f"/* {path.name} */\n{text}")

    merged_text = "\n\n".join(merged_parts)
    merged_path = output_dir / "merged.css"
    merged_path.write_text(merged_text, encoding="utf-8")

    # Simple minification: collapse whitespace, keep structure
    minified = re.sub(r"\s+", " ", merged_text)
    minified = re.sub(r"\s*([{}:;,])\s*", r"\1", minified)
    minified = re.sub(r";}", "}", minified)
    min_path = output_dir / "merged.min.css"
    min_path.write_text(minified, encoding="utf-8")

    return {
        "merged_path": str(merged_path),
        "minified_path": str(min_path),
        "size_bytes": len(merged_text.encode("utf-8")),
        "minified_bytes": len(minified.encode("utf-8")),
        "file_count": len(css_files),
    }


def verify_order(css_files: list[Path]) -> list[str]:
    """Warn about possible order-sensitive overrides by checking later files redefining earlier selectors."""
    warnings = []
    selector_last: Dict[str, str] = {}
    for path in css_files:
        text = path.read_text(encoding="utf-8", errors="ignore")
        for selector in extract_selector_names(text):
            key = selector.split()[0].strip()
            if key in selector_last and selector_last[key] != path.name:
                warnings.append(
                    f"Possible override: '{key}' defined in {selector_last[key]} then again in {path.name}"
                )
            selector_last[key] = path.name
    return warnings[:50]


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
        "duplicate_selectors": analysis["duplicates"][:100],
        "likely_unused": unused[:100],
        "merged_bundle": str(output_dir / "merged.min.css"),
        "note": "Original CSS files were not modified.",
    }
    return json.dumps(report, indent=2)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Analyze CSS for duplicates and likely overrides, then build a safe merged + minified bundle."
    )
    parser.add_argument("--root", default=".", help="Project root")
    parser.add_argument("--report-dir", default="dist-css", help="Output folder for CSS bundles")
    parser.add_argument("--verify", action="store_true", help="Run verification pass for order-sensitive overrides")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    output_dir = root / args.report_dir
    css_files = list_css_files(root)

    if not css_files:
        print("No CSS files found in /css")
        return 1

    print(f"Found {len(css_files)} CSS files")
    bundle = merge_css_files(css_files, output_dir)
    report = generate_report(root, css_files, output_dir)
    (output_dir / "audit-report.json").write_text(report, encoding="utf-8")

    print(f"CSS bundle created in {output_dir}")
    print(f"Merged size: {bundle['size_bytes']} bytes, minified: {bundle['minified_bytes']} bytes")
    print(report[:500] + "..." if len(report) > 500 else report)

    if args.verify:
        warnings = verify_order(css_files)
        print(f"\nVerification: {len(warnings)} possible order-sensitive overrides found")
        for w in warnings[:10]:
            print(f"  - {w}")
        if not warnings:
            print("  No obvious order conflicts detected.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
