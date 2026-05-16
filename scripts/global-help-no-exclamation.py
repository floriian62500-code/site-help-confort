#!/usr/bin/env python3
"""
Global replacement script: "HELP! Confort" -> "HELP Confort"
Walks all .html/.js/.ts/.py/.json/.md/.css files (and a few more text extensions),
skips binary files, backup directories, node_modules, .git.
Reports count of replacements per file and a final total.
"""

import os
import sys

ROOT = "/Users/HP/Documents/Claude/Projects/SITE INTERNET"
TEXT_EXTS = {
    ".html", ".htm", ".js", ".ts", ".tsx", ".jsx",
    ".py", ".json", ".md", ".css", ".scss",
    ".yml", ".yaml", ".toml", ".sql", ".txt",
    ".sh", ".command", ".webmanifest",
}
SKIP_DIR_NAMES = {"node_modules", ".git", "__pycache__", ".venv", "venv"}
SKIP_DIR_SUFFIXES = (".bak",)  # any dir ending with .bak

OLD = "HELP! Confort"
NEW = "HELP Confort"


def should_skip_dir(dirpath: str) -> bool:
    base = os.path.basename(dirpath)
    if base in SKIP_DIR_NAMES:
        return True
    for s in SKIP_DIR_SUFFIXES:
        if base.endswith(s):
            return True
    return False


def is_text_file(path: str) -> bool:
    ext = os.path.splitext(path)[1].lower()
    return ext in TEXT_EXTS


def process_file(path: str) -> int:
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
    except (UnicodeDecodeError, OSError):
        return 0
    count = content.count(OLD)
    if count == 0:
        return 0
    new_content = content.replace(OLD, NEW)
    try:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
    except OSError as e:
        print(f"ERROR writing {path}: {e}", file=sys.stderr)
        return 0
    return count


def main():
    total = 0
    files_touched = 0
    per_file = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        # Filter dirnames in place
        dirnames[:] = [
            d for d in dirnames
            if not should_skip_dir(os.path.join(dirpath, d))
        ]
        for fn in filenames:
            full = os.path.join(dirpath, fn)
            if not is_text_file(full):
                continue
            c = process_file(full)
            if c > 0:
                files_touched += 1
                total += c
                rel = os.path.relpath(full, ROOT)
                per_file.append((rel, c))
    per_file.sort(key=lambda x: -x[1])
    for rel, c in per_file:
        print(f"  {c:4d}  {rel}")
    print()
    print(f"Files touched: {files_touched}")
    print(f"Total replacements: {total}")


if __name__ == "__main__":
    main()
