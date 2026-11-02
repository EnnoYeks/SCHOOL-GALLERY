#!/usr/bin/env python3
"""
Normalize ?v= tags across HTML files so the same asset has one version.
Run from repo root. Makes one commit-ready change set.
"""
import os, re, sys
from collections import defaultdict

VERSION = "261102fix1"  # single site-wide version for this pass

def find_html(root):
    for dirpath, _, files in os.walk(root):
        if any(x in dirpath for x in [".git", "node_modules", "__pycache__"]):
            continue
        for f in files:
            if f.endswith(".html"):
                yield os.path.join(dirpath, f)

def normalize_file(path):
    with open(path, "r", encoding="utf-8") as fh:
        text = fh.read()
    new = re.sub(r'((?:href|src)=["\'])/?(css|js)/([^"\'?]+)\?v=[^"\']+', r'\1/\2/\3?v=' + VERSION, text)
    if new != text:
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(new)
        return True
    return False

if __name__ == "__main__":
    changed = []
    for p in find_html("."):
        if normalize_file(p):
            changed.append(p)
    print(f"Updated {len(changed)} files to version {VERSION}")
    for c in changed[:30]:
        print(" ", c)
    if len(changed) > 30:
        print(f"  ... and {len(changed)-30} more")
