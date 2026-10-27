"""Find common legacy route/path patterns in JavaScript and page entry files."""
from pathlib import Path

BAD = ("index/", ".pop()", "base()", "inSub(")
FILES = list(Path("js").rglob("*.js"))
FILES += [p for p in Path(".").glob("*/index.html") if p.is_file()]
found = 0
for path in FILES:
    for number, line in enumerate(path.read_text(encoding="utf-8", errors="ignore").splitlines(), 1):
        for pattern in BAD:
            if pattern in line:
                print(f"{path}:{number}: [{pattern}] {line.strip()[:160]}")
                found += 1
print(f"Audit complete: {found} matching line(s). Review hits manually; some may be legitimate.")
