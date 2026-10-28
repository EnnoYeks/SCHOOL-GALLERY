"""Pytest tests for the Python tooling.

Uses temporary directories and mocks for boto3 / supabase so no real network or keys are required.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest


@pytest.fixture
def tmp_media(tmp_path: Path):
    d = tmp_path / "uploads"
    d.mkdir()
    # Create a tiny fake image
    from PIL import Image
    img = Image.new("RGB", (400, 300), color="red")
    img.save(d / "test.jpg")
    return d


def test_site_check_import():
    from tools.site_check import main
    assert callable(main)


def test_css_tool_no_css(tmp_path: Path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    from tools.css_tool import list_css_files
    assert list_css_files(tmp_path) == []


def test_media_pipeline_dry_run(tmp_media: Path, tmp_path: Path):
    from tools.media_pipeline import process_directory
    out = tmp_path / "out"
    result = process_directory(tmp_media, out, dry_run=True)
    assert len(result) == 1
    assert (out / "images" / "thumb" / "test.webp").exists()
    assert (out / "manifest.json").exists()
    # Thumb should be small
    from PIL import Image
    with Image.open(out / "images" / "thumb" / "test.webp") as im:
        assert max(im.size) <= 320


def test_moderate_flags_tiny(tmp_path: Path):
    from tools.moderate import heuristic_score
    from PIL import Image
    tiny = tmp_path / "tiny.jpg"
    Image.new("RGB", (50, 50)).save(tiny)
    decision, reason = heuristic_score(tiny)
    assert decision == "flag"
    assert "small" in reason


def test_auto_albums_groups(tmp_media: Path):
    from tools.auto_albums import build_album_suggestions
    suggestions = build_album_suggestions(tmp_media)
    assert len(suggestions) >= 1
    assert "date" in suggestions[0]


def test_weekly_report_missing_creds(monkeypatch):
    monkeypatch.delenv("SUPABASE_URL", raising=False)
    monkeypatch.delenv("SUPABASE_SERVICE_ROLE_KEY", raising=False)
    from tools.weekly_report import fetch_summary
    summary = fetch_summary()
    assert summary["status"] == "missing-credentials"
    assert summary["total_posts"] is None


def test_yearbook_creates_pdf(tmp_path: Path, tmp_media: Path):
    from tools.yearbook_pdf import create_yearbook_pdf
    out = tmp_path / "yb.pdf"
    img = str(tmp_media / "test.jpg")
    result = create_yearbook_pdf("Test Album", out, [img], ["Caption"])
    assert result.exists()
    assert result.stat().st_size > 100


def test_backup_dry_run():
    from tools.backup import copy_r2_to_b2
    result = copy_r2_to_b2(dry_run=True)
    assert result[0]["status"] == "dry_run"


@patch("tools.backup.boto3")
def test_backup_verify_structure(mock_boto):
    from tools.backup import verify_backup
    summary = verify_backup([{"table": "posts", "count": 1}], [{"status": "copied"}])
    assert "verified" in summary
    assert summary["counts"]["copied_objects"] == 1
