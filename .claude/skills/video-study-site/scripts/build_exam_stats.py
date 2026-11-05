#!/usr/bin/env python3
"""Build docs/data/exam.json: per syllabus code, what the IB exam asks, from the question bank.

    python3 build_exam_stats.py <repo> <question-bank-folder> <syllabus.html>

Reads <question-bank-folder>/index.json (one object per past-paper question, tagged with syllabus codes,
command terms and mark codes) and the formula-booklet data inside the syllabus HTML. Uses the
applications and interpretation course, HL-level questions (what MAI HL students sit). Writes aggregates
only: counts, papers, marks, command terms, mark types, co-tested codes and the names of the booklet
formulas. It never copies question text and never records question ids (exam tips carry no citations).
"""
import json, re, sys, statistics
from collections import Counter
from pathlib import Path

repo, bank, syl = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
idx = json.loads((bank / "index.json").read_text(encoding="utf-8"))
ref = json.loads((bank / "syllabus_reference.json").read_text(encoding="utf-8"))["AI"]
codes = [c["code"] for c in json.loads((repo / "docs/data/syllabus.json").read_text(encoding="utf-8"))["codes"]]
html = syl.read_text(encoding="utf-8")
fdata = json.loads(re.search(r'<script id="formula-data" type="application/json">(.*?)</script>', html, re.S).group(1))
bare = {c.split()[1]: c for c in codes}                      # "2.7" -> "AHL 2.7"

formulas = {}
for b in fdata["booklets"]:
    if b["level"] != "HL":
        continue
    for t in b["topics"]:
        for f in t["formulas"]:
            c = f.get("code")
            if c and c in bare:
                formulas.setdefault(bare[c], []).extend(n.strip() for n in f["name"].split("\n") if n.strip())

def mark_kinds(mc):
    kinds = set()
    for k in mc:
        m = re.match(r"\(?([A-Z]+)\d*\)?$", k.strip())
        if m:
            kinds.add(m.group(1))
    return kinds

qs_all = [q for q in idx if q["course"] == "AI" and q["level"] == "HL"]
out = {"source": "IB question bank, applications and interpretation, HL-level questions", "years": [min(q["year"] for q in qs_all), max(q["year"] for q in qs_all)], "codes": {}}
for code in codes:
    qs = [q for q in qs_all if code in q["syllabus_codes"]]
    entry = {"label": ref.get(code, {}).get("label", ""), "n": len(qs), "formulas": sorted(set(formulas.get(code, [])), key=formulas.get(code, []).index)}
    if qs:
        marks = [q["total_marks"] for q in qs]
        kinds = [mark_kinds(q["mark_codes"]) for q in qs]
        entry.update({
            "papers": {str(p): sum(1 for q in qs if q["paper"] == p) for p in (1, 2, 3)},
            "calculator": sum(1 for q in qs if q["calculator"]),
            "marks": {"median": statistics.median(marks), "min": min(marks), "max": max(marks)},
            "commandTerms": Counter(t for q in qs for t in q["command_terms"]).most_common(6),
            "markTypes": {k: sum(1 for ks in kinds if k in ks) for k in ("M", "A", "R", "AG")},
            "alsoWith": [[c, n] for c, n in Counter(c for q in qs for c in q["syllabus_codes"] if c != code).most_common(5)],
            "tags": [t for t, _ in Counter(s for q in qs for s in q["subtopics"]).most_common(6)],
        })
    out["codes"][code] = entry
(repo / "docs/data/exam.json").write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
have = sum(1 for e in out["codes"].values() if e["n"])
print(f"{have} of {len(codes)} codes have HL questions; years {out['years'][0]}-{out['years'][1]}; wrote docs/data/exam.json")
print("codes with none:", [c for c, e in out["codes"].items() if not e["n"]])
