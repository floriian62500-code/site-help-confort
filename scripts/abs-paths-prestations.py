#!/usr/bin/env python3
"""
Convert relative '../' paths to absolute '/' paths in prestation HTML files.
This fixes asset loading on Netlify clean URLs.
"""

import os
import re
from pathlib import Path

PRESTATIONS_DIR = Path(__file__).parent.parent / "prestations"

# Patterns to convert: attribute="../..." -> attribute="/..."
# Only matches paths starting with ../
PATTERNS = [
    (re.compile(r'href="\.\./'), 'href="/'),
    (re.compile(r"href='\.\./"), "href='/"),
    (re.compile(r'src="\.\./'), 'src="/'),
    (re.compile(r"src='\.\./"), "src='/"),
    (re.compile(r'url\(\.\./'), 'url(/'),
    (re.compile(r'url\("\.\./'), 'url("/'),
    (re.compile(r"url\('\.\./"), "url('/"),
    (re.compile(r'action="\.\./'), 'action="/'),
    (re.compile(r"action='\.\./"), "action='/"),
    (re.compile(r'srcset="\.\./'), 'srcset="/'),
    (re.compile(r"srcset='\.\./"), "srcset='/"),
    (re.compile(r'poster="\.\./'), 'poster="/'),
    (re.compile(r"poster='\.\./"), "poster='/"),
    (re.compile(r'data="\.\./'), 'data="/'),
    (re.compile(r"data='\.\./"), "data='/"),
]


def strip_scripts(html: str):
    """Replace <script>...</script> blocks with placeholders to avoid altering JS."""
    script_blocks = []
    pattern = re.compile(r'<script\b[^>]*>.*?</script>', re.DOTALL | re.IGNORECASE)

    def replace(match):
        script_blocks.append(match.group(0))
        return f"___SCRIPT_BLOCK_{len(script_blocks) - 1}___"

    stripped = pattern.sub(replace, html)
    return stripped, script_blocks


def restore_scripts(html: str, script_blocks: list):
    """Restore script blocks from placeholders."""
    for i, block in enumerate(script_blocks):
        html = html.replace(f"___SCRIPT_BLOCK_{i}___", block, 1)
    return html


def process_file(filepath: Path) -> tuple[bool, list]:
    """Process a single HTML file. Returns (modified, sample_changes)."""
    original = filepath.read_text(encoding='utf-8')

    # Protect <script> blocks
    working, scripts = strip_scripts(original)

    # Capture a few sample changes for reporting
    sample_changes = []
    new_content = working
    for pattern, replacement in PATTERNS:
        if len(sample_changes) < 3:
            for match in pattern.finditer(new_content):
                if len(sample_changes) >= 3:
                    break
                original_str = match.group(0)
                new_str = replacement
                sample_changes.append((original_str, new_str))
        new_content = pattern.sub(replacement, new_content)

    # Restore scripts
    new_content = restore_scripts(new_content, scripts)

    if new_content != original:
        filepath.write_text(new_content, encoding='utf-8')
        return True, sample_changes
    return False, []


def main():
    if not PRESTATIONS_DIR.exists():
        print(f"ERROR: Directory not found: {PRESTATIONS_DIR}")
        return

    html_files = sorted(PRESTATIONS_DIR.glob("*.html"))
    print(f"Found {len(html_files)} HTML files in {PRESTATIONS_DIR}")

    modified_count = 0
    all_samples = []

    for filepath in html_files:
        modified, samples = process_file(filepath)
        if modified:
            modified_count += 1
            if len(all_samples) < 3 and samples:
                all_samples.extend(samples[:3 - len(all_samples)])
            print(f"  MODIFIED: {filepath.name}")
        else:
            print(f"  unchanged: {filepath.name}")

    print(f"\n=== SUMMARY ===")
    print(f"Total files modified: {modified_count} / {len(html_files)}")
    if all_samples:
        print(f"\nSample conversions:")
        for orig, new in all_samples[:3]:
            print(f"  {orig}  ->  {new}")


if __name__ == "__main__":
    main()
