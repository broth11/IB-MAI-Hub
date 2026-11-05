#!/usr/bin/env python3
"""Check a lesson JSON file and print a review report.

    python3 validate.py <repo> <n>             # errors and warnings only
    python3 validate.py <repo> <n> --report    # plus a markdown review report for the PR

Errors (exit code 1) break the page or the data contract. Warnings are style or
review items. The report lists every timestamp beside the transcript text found
there, so a reviewer can confirm each one without scrubbing the video.
"""
import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from find import parse, window, fmt  # noqa: E402

errors, warnings = [], []

GDC_KEYS = set("F1 F2 F3 F4 F5 F6 SHIFT OPTN VARS MENU ALPHA SQR POW EXIT XTT LOG LN SIN COS TAN FRAC SD LP RP COMMA STO DEL AC MUL DIV ADD SUB DOT EXP NEG EXE UP DOWN LEFT RIGHT 0 1 2 3 4 5 6 7 8 9".split())
EXAM_CODES = set()
GDC_TOKEN = re.compile(r"\[([A-Z0-9]+)\]")


def err(msg):
    errors.append(msg)


def warn(msg):
    warnings.append(msg)


def strings(obj, path=""):
    if isinstance(obj, str):
        yield path, obj
    elif isinstance(obj, dict):
        for k, v in obj.items():
            yield from strings(v, f"{path}.{k}" if path else k)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            yield from strings(v, f"{path}[{i}]")


def seeks(obj, path=""):
    if isinstance(obj, dict):
        for k, v in obj.items():
            p = f"{path}.{k}" if path else k
            if k in ("seek", "t") and isinstance(v, (int, float)):
                yield p, v
            else:
                yield from seeks(v, p)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            yield from seeks(v, f"{path}[{i}]")


def need(obj, keys, where):
    for k in keys:
        if k not in obj or obj[k] in ("", None, []):
            err(f"{where}: missing '{k}'")


def check_section(s, i, repo):
    where = f"sections[{i}] ({s.get('id', '?')})"
    need(s, ["id", "type", "tab", "kicker", "title"], where)
    t = s.get("type")
    if t == "decision":
        cols = s.get("columns", [])
        for j, r in enumerate(s.get("rows", [])):
            if len(r.get("cells", [])) != len(cols):
                err(f"{where}.rows[{j}]: {len(r.get('cells', []))} cells for {len(cols)} columns")
        if not s.get("cards") and not s.get("rows"):
            err(f"{where}: needs cards or rows")
    elif t == "procedure":
        need(s, ["intro"], where)
    elif t == "explorer":
        name = s.get("explorer", "")
        if not re.fullmatch(r"[a-z0-9-]+", name or ""):
            err(f"{where}: bad explorer name '{name}'")
        elif not (repo / f"docs/js/explorers/{name}.js").exists():
            err(f"{where}: docs/js/explorers/{name}.js does not exist")
    elif t == "desmos":
        for j, st in enumerate(s.get("steps", [])):
            need(st, ["title", "suppose", "how", "observe", "expected"], f"{where}.steps[{j}]")
        if not s.get("steps"):
            err(f"{where}: no steps")
    elif t == "wording":
        for j, tr in enumerate(s.get("traps", [])):
            need(tr, ["kind", "title", "weak", "better", "seek"], f"{where}.traps[{j}]")
    elif t == "gdc":
        need(s, ["intro"], where)
        steps = s.get("steps", [])
        if not steps:
            err(f"{where}: no steps")
        if not 2 <= len(steps) <= 8:
            warn(f"{where}: {len(steps)} steps (aim for about 5 to 6 per section; split a long procedure)")
        screens = [("start", s.get("start"))] + [(f"steps[{j}].s", st.get("s")) for j, st in enumerate(steps)]
        for j, st in enumerate(steps):
            w = f"{where}.steps[{j}]"
            need(st, ["t"], w)
            text = st.get("t", "") or ""
            for k in GDC_TOKEN.findall(text):
                if k not in GDC_KEYS:
                    err(f"{w}: unknown key [{k}]")
            if not GDC_TOKEN.search(text) and not re.search(r"\{[^}]+\}", text):
                warn(f"{w}: presses no key and types no entry")
        for name, scr in screens:
            if not scr or not scr.get("src"):
                warn(f"{where}.{name}: no capture; the page shows 'Screen not captured yet'")
            elif not (repo / "docs" / scr["src"]).exists():
                err(f"{where}.{name}: docs/{scr['src']} does not exist")
    elif t == "exam":
        need(s, ["codes", "asks", "marks"], where)
        for c in s.get("codes", []):
            if c not in EXAM_CODES:
                err(f"{where}: code '{c}' is not in docs/data/exam.json")
        for j, m in enumerate(s.get("marks", [])):
            need(m, ["label", "text"], f"{where}.marks[{j}]")
        for j, tr in enumerate(s.get("traps", [])):
            need(tr, ["kind", "title", "weak", "better"], f"{where}.traps[{j}]")
        if not s.get("gdc"):
            warn(f"{where}: no GDC guidance (say when the GDC is useful, or that it is not needed)")
    elif t == "question":
        need(s, ["paper", "total", "prompt", "parts", "markscheme"], where)
        val = lambda code: int((re.search(r"(\d+)", code) or [0, "0"])[1]) if re.search(r"(\d+)", code or "") else 0
        pm = sum(int(p.get("marks", 0)) for p in s.get("parts", []))
        mm = sum(val(l.get("mark", "")) for b in s.get("markscheme", []) for l in b.get("lines", []))
        if pm != s.get("total"):
            err(f"{where}: part marks add to {pm} but total is {s.get('total')}")
        if mm != s.get("total"):
            err(f"{where}: markscheme marks add to {mm} but total is {s.get('total')}")
        if len(s.get("markscheme", [])) != len(s.get("parts", [])):
            err(f"{where}: markscheme needs one block per part")
    elif t == "frq":
        need(s, ["prompt", "parts", "sample", "checklist"], where)
    else:
        err(f"{where}: unknown section type '{t}'")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("repo")
    ap.add_argument("n", type=int)
    ap.add_argument("--report", action="store_true")
    a = ap.parse_args()
    repo = Path(a.repo)
    path = repo / f"docs/data/lessons/{a.n}.json"
    try:
        L = json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:  # noqa: BLE001
        sys.exit(f"ERROR {path}: {e}")
    site = json.loads((repo / "docs/data/site.json").read_text(encoding="utf-8"))
    ex = repo / "docs/data/exam.json"
    if ex.is_file():
        EXAM_CODES.update(json.loads(ex.read_text(encoding="utf-8"))["codes"])
    index = {l["n"]: l for l in json.loads((repo / "docs/data/lessons.json").read_text(encoding="utf-8"))["lessons"]}

    need(L, ["n", "unit", "title", "videoId", "videoTitle", "intro", "moments", "sections", "review"], "lesson")
    entry = index.get(a.n)
    if not entry:
        err(f"lesson {a.n} is not in docs/data/lessons.json")
    else:
        if entry.get("videoId") != L.get("videoId"):
            err(f"videoId {L.get('videoId')} does not match lessons.json ({entry.get('videoId')})")
        if entry.get("unit") != L.get("unit"):
            err(f"unit {L.get('unit')} does not match lessons.json ({entry.get('unit')})")
    if L.get("unit") not in {u["id"] for u in site["units"]}:
        err(f"unit {L.get('unit')} is not in site.json")

    rows = []
    tfile = repo / "transcripts" / (entry or {}).get("transcript", "")
    if entry and tfile.is_file():
        rows = parse(tfile)
    else:
        warn("transcript not found; timestamps not range-checked")
    end = rows[-1][0] if rows else None

    ms = L.get("moments", [])
    ts = [m.get("t") for m in ms]
    if ts != sorted(ts):
        err("moments are not in time order")
    if not 6 <= len(ms) <= 24:
        warn(f"{len(ms)} key moments (aim for 8 to 20)")
    for j, m in enumerate(ms):
        need(m, ["t", "type", "title", "text"], f"moments[{j}]")

    cids = set()
    sec_ids = {s.get("id") for s in L.get("sections", [])}
    for j, c in enumerate(L.get("corrections", [])):
        w = f"corrections[{j}]"
        need(c, ["id", "seek", "kind", "title", "text", "write"], w)
        if c.get("kind") not in ("error", "omission"):
            err(f"{w}: kind must be 'error' or 'omission'")
        if c.get("kind") == "error":
            warn(f"{w}: kind 'error' says the video is wrong; reserve it for genuine errors and use 'omission' for things the video leaves out")
        if c.get("id") in cids:
            err(f"{w}: duplicate id '{c.get('id')}'")
        cids.add(c.get("id"))
        if c.get("section") and c["section"] not in sec_ids:
            err(f"{w}: section '{c['section']}' does not exist")
    if len(L.get("corrections", [])) > 4:
        warn(f"{len(L['corrections'])} corrections (aim for 3 or fewer; students should not be told to distrust a mostly good video)")
    for j, m in enumerate(ms):
        if m.get("correction") and m["correction"] not in cids:
            err(f"moments[{j}]: correction '{m['correction']}' is not in corrections")

    ids = [s.get("id") for s in L.get("sections", [])]
    if len(ids) != len(set(ids)):
        err("section ids are not unique")
    for i, s in enumerate(L.get("sections", [])):
        check_section(s, i, repo)
    types = {s.get("type") for s in L.get("sections", [])}
    if not types & {"wording", "exam"}:
        warn("core section missing: 'exam' (IB) or 'wording' (AP)")
    if not types & {"frq", "question"}:
        warn("core section missing: 'question' (IB) or 'frq' (AP)")

    for p, v in seeks(L):
        if v < 0 or (end is not None and v > end + 15):
            err(f"{p} = {v}s is outside the video (ends {end}s)")
    plain = re.compile(r"(\.tab|\.kicker|\.type|\.letter|\.label|\.kind|^videoTitle)$")
    for p, sv in strings(L):
        if sv.count("$") % 2:
            err(f"{p}: unbalanced $ math delimiters")
        if "$" in sv and plain.search(p) and not p.endswith("presets") and ".sub" not in p:
            err(f"{p}: shown as plain text, so $...$ will not render; remove the math")
        if re.search(r"\\[a-zA-Z]", re.sub(r"\$[^$]*\$", "", sv)):
            err(f"{p}: LaTeX command outside $...$ will show raw")
        if "—" in sv:
            warn(f"{p}: em dash; rewrite the sentence")

    rv = L.get("review", {})
    if rv.get("status") not in ("draft", "approved"):
        err("review.status must be 'draft' or 'approved'")

    for e in errors:
        print("ERROR  ", e)
    for w in warnings:
        print("WARN   ", w)
    print(f"\n{path.name}: {len(errors)} errors, {len(warnings)} warnings")

    if a.report:
        print(f"\n## Review: {L.get('topic', '')} {L.get('title', '')}\n")
        print(f"Page: `lesson.html?v={a.n}` (status `{rv.get('status')}`). Video: https://www.youtube.com/watch?v={L.get('videoId')}\n")
        flags = rv.get("flags", [])
        if flags:
            print("### Flags to check\n")
            for f in flags:
                print(f"- **{f.get('kind', 'note')}**: {f.get('text', '')}")
            print()
        print("### Timestamps\n")
        print("| Time | Claimed | Transcript at that time |\n|---|---|---|")
        for p, v in seeks(L):
            here = window(rows, int(v), int(v) + 20)[:140] if rows else ""
            label = p.split(".")[-1]
            obj = L
            for part in re.findall(r"[^.\[\]]+", p)[:-1]:
                obj = obj[int(part)] if part.isdigit() else obj[part]
            claim = obj.get("title") or obj.get("label") or obj.get("stem") or obj.get("scenario") or (obj.get("cells") or [""])[0]
            claim = re.sub(r"\s+", " ", str(claim))[:70].replace("|", "/")
            print(f"| [{fmt(int(v))}](https://www.youtube.com/watch?v={L.get('videoId')}&t={int(v)}s) | {claim} | {here.replace('|', '/')} |")
        print("\nMerging the PR publishes this page.")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
