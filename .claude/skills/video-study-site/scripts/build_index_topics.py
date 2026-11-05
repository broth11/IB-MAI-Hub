#!/usr/bin/env python3
"""Build docs/data/lessons.json from a transcripts repo laid out by topic (IB MAI Hub).

    python3 build_index_topics.py <repo> [--check]

Reads  <repo>/transcripts/playlist-index.json  ({"playlists": [{"topic": N, "videos": [...]}]})
and    <repo>/docs/data/site.json  (titleCleanup).
Lesson number n = topic * 100 + playlist position. Unit id = topic. The "topic" label is the
playlist position inside the topic (not a syllabus code); add a "syllabus" list and set "topic" to its first code by hand. Existing lessons keep their title,
unit and status; only new videos are added. Videos without a saved transcript are skipped and listed.
"""
import argparse, json, sys
from pathlib import Path

def clean(raw, cfg):
    t = raw
    for cut in cfg.get("cutAt", []):
        if cut in t:
            t = t.split(cut, 1)[0]
    for pre in cfg.get("stripPrefixes", []):
        if t.startswith(pre):
            t = t[len(pre):]
    return t.strip()

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("repo"); ap.add_argument("--check", action="store_true")
    a = ap.parse_args(); repo = Path(a.repo)
    site = json.loads((repo / "docs/data/site.json").read_text(encoding="utf-8"))
    idx = json.loads((repo / "transcripts/playlist-index.json").read_text(encoding="utf-8"))
    lp = repo / "docs/data/lessons.json"
    current = json.loads(lp.read_text(encoding="utf-8"))["lessons"] if lp.exists() else []
    have = {l["n"] for l in current}
    lessons, added, skipped = list(current), [], []
    for pl in idx["playlists"]:
        for v in pl["videos"]:
            n = pl["topic"] * 100 + v["number"]
            if n in have:
                continue
            if not str(v.get("status", "")).startswith("saved"):
                skipped.append(n); continue
            added.append({"n": n, "unit": pl["topic"], "topic": str(v["number"]), "title": clean(v["title"], site.get("titleCleanup", {})),
                          "videoId": v["videoId"], "transcript": v["transcriptFile"], "status": "transcript"})
    lessons += added
    lessons.sort(key=lambda l: l["n"])
    print(f"{len(current)} kept, {len(added)} added, {len(skipped)} skipped (no transcript): {skipped}")
    if not a.check:
        lp.write_text(json.dumps({"lessons": lessons}, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"Wrote {lp}")

if __name__ == "__main__":
    sys.exit(main())
