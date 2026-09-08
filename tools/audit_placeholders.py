"""Final-pass check before the demo freeze: run this against the real
Home.jsx to confirm no earlier-day placeholder got carried into the demo
silently. A clean run means either a real value now exists, or the team
has explicitly agreed to ship the placeholder -- not a silent carry-over.

Usage: python3 tools/audit_placeholders.py frontend/src/pages/Home.jsx
"""
import sys


def audit_placeholders(source_text):
    flags = []
    if "confirm source with Ayaan" in source_text:
        flags.append("AUC/ground-truth-count placeholder still present -- resolve or ship deliberately")
    if "PLACEHOLDER_STATS" in source_text:
        flags.append("PLACEHOLDER_STATS still referenced somewhere")
    return flags


if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else "frontend/src/pages/Home.jsx"
    with open(path) as f:
        source = f.read()
    flags = audit_placeholders(source)
    print("Placeholder audit:", flags if flags else "clean")
