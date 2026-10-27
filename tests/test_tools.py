from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas


def create_yearbook_pdf(album_name: str, output_path: Path, photo_paths: list[str] | None = None) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(output_path), pagesize=letter)
    c.setTitle(f"HSHS World — {album_name}")
    c.setAuthor("HSHS World")
    c.setFont("Helvetica-Bold", 22)
    c.drawString(1 * inch, 10 * inch, "HSHS World")
    c.setFont("Helvetica-Oblique", 12)
    c.drawString(1 * inch, 9.6 * inch, "Educate. Engage. Empower.")
    c.setFont("Helvetica-Bold", 18)
    c.drawString(1 * inch, 8.8 * inch, album_name)

    photo_paths = photo_paths or []
    x_positions = [1.0 * inch, 3.6 * inch, 6.2 * inch]
    y_positions = [7.1 * inch, 5.1 * inch, 3.1 * inch]
    for index, photo in enumerate(photo_paths[:9]):
        x = x_positions[index % 3]
        y = y_positions[index // 3]
        if os.path.exists(photo):
            c.drawImage(photo, x, y, width=2.1 * inch, height=1.7 * inch)
        else:
            c.rect(x, y, 2.1 * inch, 1.7 * inch, stroke=1, fill=0)
    c.save()
    return output_path


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate a printable yearbook-style PDF with the HSHS World brand.")
    parser.add_argument("--album-name", default="School Moments 2026", help="Album or event name")
    parser.add_argument("--output", default="./reports/yearbook.pdf", help="Where to save the PDF")
    parser.add_argument("--images", nargs="*", default=[], help="Optional image paths used in the yearbook")
    args = parser.parse_args()

    pdf_path = create_yearbook_pdf(args.album_name, Path(args.output), args.images)
    print(f"Yearbook PDF created: {pdf_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
