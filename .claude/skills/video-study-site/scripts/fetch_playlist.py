#!/usr/bin/env python3
"""Fetch a YouTube playlist's captions into a transcripts folder.

Run this on the teacher's own computer: cloud workspaces usually cannot reach YouTube.

    pip install yt-dlp
    python3 fetch_playlist.py "https://www.youtube.com/playlist?list=..." transcripts/

Writes, in the output folder:
    NN-<videoId>.txt        one line per caption event: "[m:ss] text"
    playlist-index.json     {playlist, source, visibleVideos, unavailableVideos, items: [...]}
    playlist-index.csv      the same items as a table

Existing transcript files are kept (use --refresh to fetch them again), so the
script can be re-run after a playlist grows. Auto-generated captions are used
when the creator has not uploaded English subtitles.
"""
import argparse
import csv
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


def run_json(args):
    out = subprocess.run(args, capture_output=True, text=True)
    if out.returncode != 0:
        sys.exit(f"yt-dlp failed:\n{out.stderr.strip()[-2000:]}")
    return json.loads(out.stdout)


def stamp(ms):
    s = int(ms // 1000)
    return f"[{s // 60}:{s % 60:02d}]"


def json3_to_lines(path):
    """Convert a YouTube json3 caption file to "[m:ss] text" lines."""
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    lines = []
    for ev in data.get("events", []):
        if "segs" not in ev or "tStartMs" not in ev:
            continue
        text = "".join(seg.get("utf8", "") for seg in ev["segs"]).replace("\n", " ").strip()
        if not text:
            continue
        line = f"{stamp(ev['tStartMs'])} {text}"
        if lines and lines[-1] == line:
            continue
        lines.append(line)
    return lines


def fetch_captions(video_id, workdir):
    """Download English captions (uploaded first, then auto) as json3. Returns a path or None."""
    url = f"https://www.youtube.com/watch?v={video_id}"
    base = [
        "yt-dlp", "--skip-download", "--sub-format", "json3", "--sub-langs", "en.*,en",
        "-o", str(Path(workdir) / "%(id)s.%(ext)s"), "--no-warnings", "--quiet",
    ]
    # Last pass asks for the original-language auto track by name: some videos list many
    # translated "en" variants, and the wildcard request then saves nothing.
    for flag, langs in (("--write-subs", "en.*,en"), ("--write-auto-subs", "en.*,en"), ("--write-auto-subs", "en-orig")):
        cmd = list(base)
        cmd[cmd.index("--sub-langs") + 1] = langs
        subprocess.run(cmd + [flag, url], capture_output=True, text=True)
        found = sorted(Path(workdir).glob(f"{video_id}*.json3"))
        if found:
            return found[0]
    return None


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("playlist_url")
    ap.add_argument("out_dir")
    ap.add_argument("--refresh", action="store_true", help="fetch captions again even if a file exists")
    ap.add_argument("--only", help="comma-separated playlist positions to fetch, e.g. 3,7,12")
    args = ap.parse_args()

    if not shutil.which("yt-dlp"):
        sys.exit("yt-dlp is not installed. Run: pip install yt-dlp")

    out = Path(args.out_dir)
    out.mkdir(parents=True, exist_ok=True)
    info = run_json(["yt-dlp", "--flat-playlist", "-J", "--no-warnings", args.playlist_url])
    entries = info.get("entries") or []
    only = {int(x) for x in args.only.split(",")} if args.only else None

    old = {}
    idx_path = out / "playlist-index.json"
    if idx_path.exists():
        old = {it["videoId"]: it for it in json.loads(idx_path.read_text(encoding="utf-8")).get("items", [])}

    items, unavailable, pos = [], 0, 0
    with tempfile.TemporaryDirectory() as tmp:
        for e in entries:
            title = e.get("title") or ""
            if not e.get("id") or title in ("[Private video]", "[Deleted video]"):
                unavailable += 1
                continue
            pos += 1
            vid = e["id"]
            fname = f"{pos:02d}-{vid}.txt"
            item = {
                "number": pos, "title": title, "videoId": vid,
                "url": f"https://www.youtube.com/watch?v={vid}&list={info.get('id', '')}&index={pos}",
                "status": "missing", "transcriptFile": fname, "characters": 0, "timestampedSegments": 0,
            }
            target = out / fname
            if only and pos not in only:
                if vid in old:
                    item.update({k: old[vid][k] for k in ("status", "characters", "timestampedSegments") if k in old[vid]})
                items.append(item)
                continue
            if target.exists() and not args.refresh:
                text = target.read_text(encoding="utf-8")
                item.update(status="saved", characters=len(text), timestampedSegments=text.count("\n") + 1)
                print(f"{pos:02d} kept    {title[:70]}")
            else:
                cap = fetch_captions(vid, tmp)
                if cap:
                    lines = json3_to_lines(cap)
                    text = "\n".join(lines)
                    target.write_text(text, encoding="utf-8")
                    item.update(status="saved", characters=len(text), timestampedSegments=len(lines))
                    print(f"{pos:02d} saved   {title[:70]}")
                else:
                    item["status"] = "no-captions"
                    print(f"{pos:02d} NO CAPTIONS  {title[:70]}")
            items.append(item)

    index = {
        "playlist": args.playlist_url,
        "source": info.get("uploader") or info.get("channel") or "",
        "visibleVideos": len(items),
        "unavailableVideos": unavailable,
        "items": items,
    }
    idx_path.write_text(json.dumps(index, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    with open(out / "playlist-index.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(items[0].keys()) if items else ["number"])
        w.writeheader()
        w.writerows(items)
    missing = [i for i in items if i["status"] != "saved"]
    print(f"\n{len(items)} videos, {len(items) - len(missing)} with transcripts, {unavailable} unavailable.")
    if missing:
        print("Without captions:", ", ".join(str(i["number"]) for i in missing))


if __name__ == "__main__":
    main()
