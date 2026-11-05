#!/usr/bin/env python3
"""Search or slice a timestamped transcript.

    python3 find.py <transcript.txt> --grep "p-value" "null hypothesis"   # lines that match, with seconds
    python3 find.py <transcript.txt> --at 12:30                            # 60 s of text from 12:30
    python3 find.py <transcript.txt> --from 12:30 --to 15:00               # a window, joined into prose
    python3 find.py <transcript.txt> --outline 120                         # first words of every 2-minute block

Times print as m:ss plus seconds, ready for "t"/"seek" fields in lesson JSON.
"""
import argparse
import re
import sys

LINE = re.compile(r"\[(\d+):(\d{2})(?::(\d{2}))?\]\s*(.*)")


def parse(path):
    rows = []
    with open(path, encoding="utf-8") as f:
        for raw in f:
            m = LINE.match(raw.strip())
            if not m:
                continue
            a, b, c, text = m.groups()
            secs = int(a) * 3600 + int(b) * 60 + int(c) if c else int(a) * 60 + int(b)
            rows.append((secs, text))
    return rows


def to_secs(s):
    parts = [int(p) for p in s.split(":")]
    return parts[0] * 3600 + parts[1] * 60 + parts[2] if len(parts) == 3 else parts[0] * 60 + parts[1] if len(parts) == 2 else parts[0]


def fmt(s):
    return f"{s // 60}:{s % 60:02d}"


def window(rows, lo, hi):
    return " ".join(t for s, t in rows if lo <= s < hi)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("path")
    ap.add_argument("--grep", nargs="+")
    ap.add_argument("--at")
    ap.add_argument("--from", dest="frm")
    ap.add_argument("--to")
    ap.add_argument("--outline", type=int)
    a = ap.parse_args()
    rows = parse(a.path)
    if not rows:
        sys.exit("No timestamped lines found.")
    if a.grep:
        pats = [re.compile(re.escape(g), re.I) for g in a.grep]
        for s, t in rows:
            if any(p.search(t) for p in pats):
                print(f"{fmt(s):>6} ({s:>5}s)  {t}")
    elif a.at:
        s = to_secs(a.at)
        print(f"{fmt(s)} ({s}s): {window(rows, s, s + 60)}")
    elif a.frm:
        lo = to_secs(a.frm)
        hi = to_secs(a.to) if a.to else lo + 120
        print(f"{fmt(lo)}-{fmt(hi)}: {window(rows, lo, hi)}")
    elif a.outline:
        end = rows[-1][0]
        for lo in range(0, end + 1, a.outline):
            words = window(rows, lo, lo + a.outline).split()
            print(f"{fmt(lo):>6} ({lo:>5}s)  {' '.join(words[:28])}")
    else:
        print(f"{len(rows)} lines, ends at {fmt(rows[-1][0])} ({rows[-1][0]}s)")


if __name__ == "__main__":
    main()
