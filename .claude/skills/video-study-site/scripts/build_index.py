#!/usr/bin/env python3
"""Merge a transcripts playlist index into the site's lesson list.

    python3 build_index.py <repo>            # writes docs/data/lessons.json
    python3 build_index.py <repo> --check    # report only, write nothing

Reads  <repo>/transcripts/playlist-index.json and <repo>/docs/data/site.json.
Keeps every lesson already in docs/data/lessons.json as it is (title, unit,
status, order). Adds new videos: parses the topic number from the title, cleans
the title with site.json "titleCleanup", and places it in the unit whose
"topicPrefix" matches. Videos with no topic number go to the "fallback" unit and
are reported so the teacher can place them, or match them to a syllabus.
"""
import argparse
import json
import re
import sys
from pathlib import Path

TOPIC = re.compile(r"(?<![\d.])(\d{1,2}\.\d{1,2}(?:\s*(?:&|and|-|–)\s*\d{1,2}\.\d{1,2})?)(?![\d])")


def topic_key(t):
    return [int(x) for x in re.findall(r"\d+", t)] or [999]


def clean_title(raw, cfg):
    t = raw
    for cut in cfg.get("cutAt", []):
        if cut in t:
            t = t.split(cut, 1)[0]
    for pre in cfg.get("stripPrefixes", []):
        if t.startswith(pre):
            t = t[len(pre):]
    t = t.strip()
    m = TOPIC.search(t)
    topic = ""
    # Only trust a number at the start of the title ("2.10 ...", "Topic 2.10 ..."); one mid-title is ambiguous.
    if m and re.fullmatch(r"\s*(?:(?:topics?|lessons?|sections?)\s*)?", t[:m.start()], re.I):
        topic = re.sub(r"\s*(?:&|and)\s*", " & ", m.group(1)).replace("–", "-")
        t = t[m.end():].strip(" :-–")
    return topic, t


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("repo")
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    repo = Path(args.repo)
    site = json.loads((repo / "docs/data/site.json").read_text(encoding="utf-8"))
    idx = json.loads((repo / "transcripts/playlist-index.json").read_text(encoding="utf-8"))
    lessons_path = repo / "docs/data/lessons.json"
    current = json.loads(lessons_path.read_text(encoding="utf-8"))["lessons"] if lessons_path.exists() else []
    have = {l["n"] for l in current}
    by_prefix = {u["topicPrefix"]: u["id"] for u in site["units"] if u.get("topicPrefix")}
    fallback = next((u["id"] for u in site["units"] if u.get("fallback")), site["units"][-1]["id"])

    added, unplaced = [], []
    for it in idx["items"]:
        if it["number"] in have or it.get("status") != "saved":
            continue
        topic, title = clean_title(it["title"], site.get("titleCleanup", {}))
        unit = by_prefix.get(topic.split(".")[0]) if topic else None
        rec = {"n": it["number"], "unit": unit or fallback, "topic": topic, "title": title,
               "videoId": it["videoId"], "transcript": it["transcriptFile"], "status": "transcript"}
        if unit is None:
            unplaced.append(rec)
        added.append(rec)

    # Insert new lessons into their unit, ordered by topic number; unplaced go at the end of the fallback unit.
    lessons = list(current)
    for rec in added:
        same = [i for i, l in enumerate(lessons) if l["unit"] == rec["unit"]]
        pos = len(lessons) if not same else same[-1] + 1
        if rec["topic"]:
            for i in same:
                if lessons[i]["topic"] and topic_key(lessons[i]["topic"]) > topic_key(rec["topic"]):
                    pos = i
                    break
        lessons.insert(pos, rec)

    missing = [it["number"] for it in idx["items"] if it.get("status") != "saved"]
    print(f"{len(current)} lessons kept, {len(added)} added, {len(missing)} without transcripts.")
    for r in added:
        print(f"  + {r['n']:>3}  unit {r['unit']}  {r['topic'] or '(no topic)':<10} {r['title']}")
    if unplaced:
        print("\nNo topic number in the title. Placed in the fallback unit; confirm or move them:")
        for r in unplaced:
            print(f"  ? {r['n']:>3}  {r['title']}")
    if missing:
        print("\nSkipped (no transcript):", ", ".join(map(str, missing)))
    if not args.check:
        lessons_path.write_text(json.dumps({"lessons": lessons}, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"\nWrote {lessons_path}")


if __name__ == "__main__":
    sys.exit(main())
