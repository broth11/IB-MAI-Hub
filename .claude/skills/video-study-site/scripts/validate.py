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
    elif t == "mcq":
        for j, q in enumerate(s.get("questions", [])):
            w = f"{where}.questions[{j}]"
            need(q, ["stem", "opts", "why", "seek"], w)
            if not isinstance(q.get("ok"), int) or not 0 <= q["ok"] < len(q.get("opts", [])):
                err(f"{w}: 'ok' is not a valid option index")
            if len(q.get("why", [])) != len(q.get("opts", [])):
                err(f"{w}: 'why' needs one explanation per option")
            if not 2 <= len(q.get("opts", [])) <= 4:
                err(f"{w}: 2 to 4 options allowed")
        n = len(s.get("questions", []))
        if not 3 <= n <= 5:
            warn(f"{where}: {n} questions (house rule is 3 to 5)")
        oks = [q.get("ok") for q in s.get("questions", [])]
        if len(oks) >= 3 and len(set(oks)) == 1:
            warn(f"{where}: every correct answer is option {oks[0]}; vary the position")
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

    ids = [s.get("id") for s in L.get("sections", [])]
    if len(ids) != len(set(ids)):
        err("section ids are not unique")
    for i, s in enumerate(L.get("sections", [])):
        check_section(s, i, repo)
    for core in ("wording", "mcq", "frq"):
        if core not in {s.get("type") for s in L.get("sections", [])}:
            warn(f"core section '{core}' is missing")

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
