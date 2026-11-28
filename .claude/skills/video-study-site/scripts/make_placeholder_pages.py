#!/usr/bin/env python3
"""Give every syllabus code that has a video but no study page a video-only placeholder page.

Usage: make_placeholder_pages.py <repo>

Writes docs/data/codes/<slug>.json with "placeholder": true and only the video section, and adds "page"
and "placeholder" to the code's row in docs/data/syllabus.json. The slug is the one the full page will
use, so links to the placeholder keep working. Codes that already have a page are never touched.
export_code_pages.py replaces a placeholder with the full page and clears the flag.
"""
import json, sys, pathlib

repo = pathlib.Path(sys.argv[1])
data = repo / "docs/data"
syl = json.loads((data / "syllabus.json").read_text(encoding="utf-8"))
lessons = json.loads((data / "lessons.json").read_text(encoding="utf-8"))["lessons"]
made = []
for row in syl["codes"]:
    if row.get("page"):
        continue
    items = []
    for partial, key in ((False, "syllabus"), (True, "syllabusPartial")):
        for l in lessons:
            if row["code"] in l.get(key, []) and l["videoId"] not in [i["videoId"] for i in items]:
                items.append({"n": l["n"], "title": l["title"], "videoId": l["videoId"], "partial": partial, "moments": [], "notes": []})
    if not items:
        continue
    slug = row["code"].lower().replace(" ", "-").replace(".", "-")
    path = data / "codes" / f"{slug}.json"
    if path.exists():
        sys.exit(f"{path} exists but syllabus.json has no page for {row['code']}; not overwriting it")
    page = {"code": row["code"], "slug": slug, "title": row["title"], "level": row["level"], "placeholder": True,
            "videos": {"status": "approved", "items": items, "sharedNote": None},
            "ican": [], "ku": [], "visuals": [], "map": {"status": "draft", "needs": [], "leadsTo": [], "withIn": []},
            "misc": [], "terms": [], "formula": [], "gdc": [], "worked": {"status": "draft"}, "kq": [], "history": [], "explorers": []}
    path.write_text(json.dumps(page, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    row["page"] = slug
    row["placeholder"] = True
    made.append(f"{row['code']} ({len(items)} video{'s' if len(items) != 1 else ''})")
if made:
    (data / "syllabus.json").write_text(json.dumps(syl, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"{len(made)} placeholder pages: " + ", ".join(made))
