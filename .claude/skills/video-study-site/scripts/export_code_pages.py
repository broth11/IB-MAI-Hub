#!/usr/bin/env python3
"""Turn the reviewed pilot content into code-page data files.

Usage: export_code_pages.py <pilot.json> <verdicts_r1.json> [<verdicts_r2.json> ...] <repo>

An item is approved when its latest verdict is "agree". An item marked agree in an
earlier round but listed in a later round's "changed" list needs a fresh agree.
Cut items never reach the data. Everything else is written with status "draft",
and the page hides drafts. Writes docs/data/codes/<slug>.json and adds a "page"
field to the matching codes in docs/data/syllabus.json.
"""
import json, re, sys, pathlib

args = sys.argv[1:]
pilot = json.load(open(args[0])); repo = pathlib.Path(args[-1]); rounds = args[1:-1]
changed = set(pilot.get("changed", []))
verdict = {}
for i, f in enumerate(rounds):
    for v in json.load(open(f))["verdicts"]:
        verdict[v["id"]] = v["verdict"]
    if i == 0:  # items changed after round 1 lose their round 1 agree
        for c in changed:
            if verdict.get(c) == "agree":
                verdict[c] = "changed"
    else:
        pass
status = lambda i: "approved" if verdict.get(i) == "agree" else "draft"
plain = lambda s: re.sub(r"</?(b|i)>", "", s)  # tex() escapes HTML; emphasis is not carried

def clean(x):
    if isinstance(x, str): return plain(x)
    if isinstance(x, list): return [clean(y) for y in x]
    if isinstance(x, dict): return {k: clean(v) for k, v in x.items()}
    return x

def lst(arr):
    out = []
    for x in arr:
        if verdict.get(x["id"]) == "cut": continue
        y = clean(dict(x)); y["status"] = status(x["id"]); out.append(y)
    return out

def one(x):
    y = clean(dict(x)); y["status"] = status(x["id"]); return y

codes_dir = repo / "docs/data/codes"; codes_dir.mkdir(parents=True, exist_ok=True)
syl = json.load(open(repo / "docs/data/syllabus.json"))
lessons = {l["n"]: l for l in json.load(open(repo / "docs/data/lessons.json"))["lessons"]}
report = []
for c in pilot["codes"]:
    S = c["sections"]
    vids = [dict(n=v["n"], title=lessons[v["n"]]["title"], videoId=lessons[v["n"]]["videoId"], partial=v.get("partial", False)) for v in c["videos"]]
    worked = one(S["worked"])
    for p in worked["parts"]:
        p["m"] = re.sub(r"\s*\(.*\)$", "", p["m"])  # keep the mark codes, drop review notes
    gdc = lst(S["gdc"])
    for g in gdc: g.pop("flag", None)
    out = {
        "code": c["code"], "slug": c["slug"], "title": c["title"], "level": c["level"],
        "videos": {"status": status(c["slug"] + "-videos"), "items": vids},
        "ican": lst(S["ican"]), "ku": lst(S["ku"]),
        "visuals": [dict(v, figure=None) for v in lst(S["visuals"])],
        "map": one(S["map"]),
        "misc": [{k: v for k, v in m.items() if k != "why"} | {"evidence": plain(m["why"])} for m in lst(S["misc"])],
        "terms": lst(S["terms"]), "formula": lst(S["formula"]), "gdc": gdc,
        "worked": worked, "kq": lst(S["kq"]), "history": lst(S["history"]),
        "explorers": [dict(e, built=False) for e in lst(S.get("explorers", []))],
    }
    json.dump(out, open(codes_dir / f"{c['slug']}.json", "w"), indent=1, ensure_ascii=False)
    for row in syl["codes"]:
        if row["code"] == c["code"]: row["page"] = c["slug"]
    n_app = json.dumps(out).count('"status": "approved"'); n_dr = json.dumps(out).count('"status": "draft"')
    report.append(f"{c['code']}: {n_app} approved, {n_dr} draft")
json.dump(syl, open(repo / "docs/data/syllabus.json", "w"), indent=1, ensure_ascii=False)
print("\n".join(report))
