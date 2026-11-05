---
name: video-study-site
description: Build study pages for a video study-guide site (one page per video, with key moments, exam wording, practice questions and interactive explorers) from a YouTube playlist link or a folder of timestamped transcripts. Use when a teacher gives a playlist URL, asks for a study page for a lesson, unit, list of lessons or transcript, wants to add lessons to the IB MAI Hub (or the AP Statistics Hub), or wants a new site like it for another course.
---

# Video study site

Turns lecture videos into study pages. Each page pairs the embedded video with key moments that seek the player, plus sections chosen for the topic: decision check, procedure, explorer, calculator walkthrough, exam wording and traps, and free response. The site is static (HTML, CSS, JavaScript modules, JSON) and publishes with GitHub Pages.

The engine is already built. Your job is mostly **content**: read a transcript, write one lesson JSON file, reuse or add an explorer, check it, and open a pull request. You rarely touch the page code.

## Repo layout

```
docs/                     the published site
  data/site.json          course config: titles, units, title cleanup, calculator, FRQ symbols
  data/lessons.json       every video: n, unit, topic, title, videoId, transcript, status
  data/lessons/<n>.json   one study page (n = playlist position)
  js/sections/*.js        one module per section type
  js/explorers/*.js       the explorer library
  css/modernist.css       design tokens (swap these to restyle a site)
transcripts/              PRIVATE git submodule: NN-<videoId>.txt and playlist-index.json
.claude/skills/video-study-site/
  scripts/                fetch_playlist.py, build_index.py, find.py, validate.py, check_pages.py
  references/             schema.md, explorers.md, new-site.md
```

Read `references/schema.md` before writing a lesson file. Read `references/explorers.md` before reusing or writing an explorer. Read `references/new-site.md` only when setting up a site for a different course or teacher.

## What the teacher decides (settled defaults)

- **Scope per run:** one lesson, a list, a unit, or the whole playlist. Each lesson is its own page. For more than 5 lessons, work in batches of up to 5 per branch so each review stays manageable, and say so.
- **Review gate:** the pull request is the review. Each PR sets its lessons to `live`, so merging it publishes them. Nothing reaches students until the teacher merges.
- **Git:** each run goes on its own branch and opens a pull request. Never push lesson pages straight to `main`.
- **Accuracy:** flag, never fix silently. Where the video's wording is weaker than exam wording, write the stronger wording, add a visible wording note on the page, and add a review flag.
- **Reference material:** the teacher may supply a CED, a syllabus, a skills list, question-archetype cards, or scoring guidelines. Use whatever is supplied to align topics, vocabulary, and question styles. If nothing is supplied, ground everything in the transcript and standard course knowledge.

Ask only when a choice changes what you build and none of these defaults covers it.

## Workflow

### 1. Orient

- `git submodule update --init` so `transcripts/` is present. If it fails, the teacher's GitHub access to the private transcripts repo is missing: say so and stop.
- Read `docs/data/site.json` and `docs/data/lessons.json`. Note which lessons are `live`, `draft`, `next`, or `transcript`.
- Create a branch: `lesson/<topic-slug>` for one lesson (for example `lesson/1-13`), or `lessons/<unit-or-batch>` for several.

### 2. Transcripts (only when given a playlist link, or the playlist grew)

`fetch_playlist.py` needs YouTube, which cloud workspaces usually cannot reach. Run it **on the teacher's computer**: in local Claude Code, or through the linked computer's shell if this session has one. If neither is available, say that the fetch must run locally and give the teacher the exact command.

```
pip install yt-dlp
python3 .claude/skills/video-study-site/scripts/fetch_playlist.py "<playlist URL>" transcripts/
```

It keeps existing files, so re-running it after a playlist grows only fetches the new videos. Commit and push **inside `transcripts/`** (the private repo) first, then commit the updated submodule pointer in the site repo.

### 3. Lesson index

```
python3 .claude/skills/video-study-site/scripts/build_index.py . --check
python3 .claude/skills/video-study-site/scripts/build_index.py .
```

It keeps existing lessons untouched and adds new videos. Topic numbers come from the start of each title (`2.10 ...`, `Topic 3.6 & 3.7 ...`). Videos without one go to the `fallback` unit and are listed. Place those using the teacher's syllabus or CED if supplied; otherwise list them in the PR for the teacher to place. Never guess a unit silently.

### 4. Build each lesson

For each lesson `n`:

1. **Read the transcript.** Start with the outline, then read the windows that matter:
   ```
   S=.claude/skills/video-study-site/scripts/find.py; T=transcripts/<file>.txt
   python3 $S $T                       # length
   python3 $S $T --outline 60          # one line per minute
   python3 $S $T --from 12:00 --to 14:30
   python3 $S $T --grep "p-value" "significance level"
   ```
   Read enough to know every definition, worked example, calculator procedure, and wording choice the video makes. A 50-minute video needs most of its windows read. Do not write from the outline alone.
2. **Pick 8 to 20 key moments** at the points where an idea starts. Take `t` from the transcript line where it begins (seconds). Paraphrase in your own words, at most about 25 words each.
3. **Choose sections.** Always: `wording`, `frq`. Add `decision`, `procedure`, `explorer`, `gdc`, or `desmos` (AP only) only when the topic calls for it:
   - `decision` when students must choose (which design, which test, is it binomial, reject or not).
   - `procedure` when there is a method to follow or a formula to build.
   - `explorer` when a picture that changes with inputs makes the idea click.
   - `gdc` (or `desmos` on the AP site) when the video shows calculator steps the exam expects.
   Order: decision, procedure, explorer, gdc, desmos, wording, frq.
4. **Explorer.** Check the catalog in `references/explorers.md`. Reuse an explorer if one fits; add config options to it if it nearly fits; build a new library module only when nothing fits. New explorers follow the layout and interface rules there and get added to the catalog.
5. **Write the content** (rules below) into `docs/data/lessons/<n>.json`. Generate it with a short script when it contains numbers, so every value is **computed in code**, never typed from memory. Re-run the computation after any edit to the inputs.
6. **Flags.** Add `review.flags` for: weak video wording you strengthened, apparent caption errors (wrong sign, misspoken number), values that depend on what is on screen, calculator menu names taken from the captions, any new explorer.
7. In `lessons.json`, set the lesson's `status` to `live`. Set `review.status` to `approved` in the lesson file. Both take effect only when the teacher merges the PR. If `site.json` `home.pilot` mentions which lessons exist, update it.

### 5. Check

```
python3 .claude/skills/video-study-site/scripts/validate.py . <n>            # must show 0 errors
python3 .claude/skills/video-study-site/scripts/validate.py . <n> --report   # review report for the PR
```

Then run the page check, which loads each page in a browser with every section open:

```
python3 .claude/skills/video-study-site/scripts/check_pages.py . <n> [<n> ...] --shots <folder>
```

It fails on unrendered math or raw LaTeX anywhere on the page, KaTeX errors, page errors, an explorer taller than the screen, stat results that do not share one top edge, a title card that is not full width, or horizontal scroll at 390px. If the KaTeX CDN is blocked (common in cloud workspaces), `npm i katex@0.16.11` in a scratch folder and set `KATEX_DIR` to its `node_modules/katex/dist`. Look at the screenshots it saves.

Read the report's timestamp table. Every row should show transcript text that matches its claim; move any timestamp that lands before or after its idea. Finally, click through the explorer presets and confirm they give the values your script computed, and that the FRQ reveal works.

### 6. Pull request

Commit on the branch, push, and open a PR titled `<topic> <title>` (or a batch title). The body is the validator's review report for each lesson, plus a short list of anything new (explorers, schema options). Start the body with one line: "Merging this publishes these lessons." Before the PR is merged the teacher can preview a page at `lesson.html?v=<n>` by serving the branch locally. If `gh` is unavailable or not signed in, push the branch and give the teacher the compare link: `https://github.com/<owner>/<repo>/compare/main...<branch>`.

### 7. After review

Merging the PR is the approval; nothing else is needed to publish. Remove flags the teacher says are resolved. If the teacher wants a page held back without merging, set its `status` to `draft` and `review.status` to `draft` on the branch.

## This repo: IB MAI Hub (course notes)

- Course: IB Mathematics Applications and Interpretation HL. Videos are Revision Village's five topic playlists (Number and Algebra, Functions, Geometry and Trigonometry, Statistics and Probability, Calculus). Units 1 to 5 are the five topics; there is no Reviews unit yet.
- Video titles carry no syllabus code, so `build_index.py` cannot place them. `scripts/build_index_topics.py` reads the per-topic playlist indexes and numbers lessons `n = topic*100 + position` (for example 4.06 is lesson 406). Each lesson in `lessons.json` has a `syllabus` list (for example `["SL 4.4", "SL 4.10"]`, checked against Ben's `IB MAI SYLLABUS.html` in `RIS Secondary Math Content/01-sources/syllabi`); the first code is the home-page label. The mapping was made from video titles on 5 Nov 2026 and is **not yet confirmed by Ben**; it is a judgment call for videos that span two codes. Thirteen syllabus codes have no video (SL 1.5, AHL 1.9, 1.10, 1.11, SL 2.6, AHL 2.10, 3.12, 3.15, 3.16, SL 4.5, AHL 4.12, 5.17, 5.18). New videos get `topic` = playlist position until a `syllabus` list is added by hand.
- Transcripts live in the private submodule in the topic-folder layout (`Topic N - .../transcripts/NN-<id>.txt`). `lessons.json` `transcript` holds that relative path, so `find.py` and `validate.py` work unchanged. Two transcripts (Topic 4, positions 6 and 7) were made with Whisper `medium.en` because YouTube had no English captions; the rest are raw YouTube captions.
- **No multiple choice.** The IB does not set multiple-choice questions, so this site has no `mcq` section. Core sections are `wording` and `frq`. Do not add a multiple-choice check.
- **GDC.** The calculator is the Casio fx-CG50, not Desmos. Do not use the `desmos` section (it stays in the engine only so the template matches the AP Statistics Hub). Use the `gdc` section: numbered steps beside the real fx-CG50 emulator with the pressed keys ringed. Rules: GDC first, before any hand method; screens are real emulator captures, never drawn; every step names the keys actually pressed, in order, verified on the emulator; a section that changes a setting other than the angle unit ends with a "put it back" line. Key sequences already verified are in `gdc/menu_paths_verified.md`; capture and crop with `gdc/cap.py`. The maintained kit and the capture workflow are in the `gdc-online-deck` skill (master: `MAI HL/_tools/skills_sync/masters/gdc-online-deck.skill`). Ben's calculator references: `MAI HL/Calculator Skills (Haese MAI HL Casio).md`. Captures need the emulator on Ben's Mac (computer use), so a step without a capture shows "Screen not captured yet" and the validator warns.
- Ben's standing rules for his MAI material: GDC first, exam tips without citations, no em dashes.

## Page formatting (house rules, set in `docs/css/site.css`)

- **Title card:** the lesson title and the intro sentence are stacked, and each spans the full content width. The title is `clamp(20px, 2.5vw, 32px)` (half the old display size); the intro is 17px. Keep the title to the topic name, since a long title wraps across the full width.
- **Explorer stat row:** labels (formulas and expressions) are 13px; bold results are 25px, with decision text at 18px; all results share one top edge. Details in `references/explorers.md`.
- **Math never breaks:** a math expression is one object and never wraps across lines (`.katex { white-space: nowrap; }`). Text around it may wrap. In tight spaces, such as stat cells and buttons, add a line break between phrases yourself so the result reads cleanly, for example "Reject $H_0$" then "at $\alpha=0.05$".
- **Math rendering:** every content string goes through `tex()` in the page code, so math renders wherever it appears. When you add a section type or an explorer, render content fields with `tex()`, not `esc()`; keep `esc()` only for ids, attributes, and the plain-text fields listed under Math.
- If the teacher changes a formatting rule, change `site.css` (or the module), update this list, and rerun `check_pages.py` on every live lesson.

## Content rules

- **Original practice.** Write every FRQ fresh. Do not copy the video's questions, a textbook's, or the exam board's or a publisher's. Reuse the video's scenarios only in worked examples and explorers, where they help students connect back to the video.
- **Quotes.** Keep any transcript quote to a short phrase inside a wording note or flag. Explanations are in your own words.
- **Math.** All math goes in `$...$` for KaTeX, including simple expressions like `$p=0.12$` and `$P(X=2)$`. Write formulas as `$\text{Mean}=np$`. Plain-text exceptions: decimals inside prose answers, and the `weak` strings in traps that show a bare number on purpose. Never write a LaTeX command (`\hat`, `\frac`, `\alpha`) outside `$...$`. These fields are shown as plain text, so they must contain no math at all: `tab`, `kicker`, moment `type`, card `letter`, part `label`, trap `kind`, and preset `label` (put the math in the preset's `sub`). The validator rejects both mistakes.
- **Exam wording.** Conclusions in context, about the alternative, with non-definitive language. Interpretations name the variable, the context, and the condition. When the video's wording is weaker, the page uses the exam wording and says so in a note.
- **Traps.** `weak` is the realistic wrong answer (shown in quotes), `better` is the full-credit version. 4 to 5 per lesson, each with the moment in the video that teaches it.
- **Free response.** A new scenario, 3 or 4 parts, a sample response that would earn full credit, and a 5 or 6 item scoring checklist.
- **Calculator (Desmos, AP site only).** Steps follow "Suppose ... To do that ... Observe ...", with the menu path the video shows. The calculator starts empty and no button loads an answer: students practice the keystrokes. Expected values are computed. Menu names from captions are flagged as unconfirmed.
- **Voice.** Plain and matter-of-fact, varied sentence length, no filler sections. No em dashes. Oxford commas.
- **Scope.** Build what the topic needs and nothing extra. Keep text the teacher wrote verbatim. A small request changes only what was asked.
