# IB MAI Hub

A study site for IB Mathematics: Applications and Interpretation HL students: a video study guide organized by IB syllabus code. The home page lists all 78 syllabus codes by topic, each with the videos that cover it, and marks codes that have no video yet. A Gaps tab lists every uncovered code. It uses the same engine as the [AP Statistics Hub](https://github.com/broth11/AP-Statistics-Hub). Each lesson page pairs a video with key moments and the sections the topic needs: a decision check, a procedure, an interactive explorer, a Casio fx-CG50 (GDC) walkthrough, exam wording and traps, and a free-response practice box. There are no multiple-choice questions, because the IB does not set them.

Live site (after enabling GitHub Pages, see below): https://broth11.github.io/IB-MAI-Hub/

The 82 videos come from Revision Village's five IB Math AI HL topic playlists. Right now every video is listed with its transcript only; no study pages are built yet.

## Publish with GitHub Pages

1. On GitHub, open the repo, then **Settings > Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**. Do not use "Deploy from a branch": the private transcripts submodule makes branch builds fail.
3. Every push to `main` that changes `docs/` runs `.github/workflows/pages.yml` and publishes the site. To publish by hand, open **Actions > Deploy site to GitHub Pages > Run workflow**.

Only the `docs/` folder is published.

## Run it on your computer

```
cd docs
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Layout

```
.
├── docs/                      the site (this is what GitHub Pages serves)
│   ├── index.html, lesson.html
│   ├── css/, js/              engine, sections (including the GDC section), explorers
│   ├── img/gdc/               fx-CG50 emulator body and captured screens
│   └── data/
│       ├── site.json          course config: titles, topics, GDC, response-box symbols
│       ├── syllabus.json      the 78 syllabus codes with short titles (the home page rows)
│       ├── lessons.json       all 82 videos: n = topic*100 + position, unit, title, syllabus codes, status
│       └── lessons/<n>.json   one study page per video (none built yet)
├── .claude/skills/video-study-site/   the skill that builds lesson pages
├── transcripts/               private submodule (see below)
└── notes/                     project notes
```

## Transcripts

`transcripts/` is a git submodule pointing at the private repo `broth11/IB-MAI-Hub-transcripts`. The captions belong to the video's creator, so only the site's authors can read them. Authors fetch it with:

```
git clone --recurse-submodules https://github.com/broth11/IB-MAI-Hub.git
# or, in an existing clone:
git submodule update --init
```

It holds 82 timestamped transcripts, one folder per topic. 80 are raw YouTube auto-captions; 2 (Topic 4, positions 6 and 7) were made with Whisper `medium.en` because YouTube had no English captions for them. They are uncorrected, so notation and numbers may contain errors.

## Build lesson pages

Open this repo in Claude Code and ask, for example, "Build the study page for lesson 406." The `video-study-site` skill reads the transcript, writes `docs/data/lessons/<n>.json`, reuses or adds an explorer, checks the page, and opens a pull request. Merging the pull request publishes the lesson. Course notes for this repo are in the skill's `SKILL.md`.

## Open items

See `notes/project-notes.md`.
