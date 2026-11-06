# Code pages (pilot, 6 Nov 2026)

The hub is moving from one page per video to one page per IB syllabus code: `code.html?c=<slug>`, data in `docs/data/codes/<slug>.json`. A code's videos (none, one, or several) are one section of its page. The pilot is Topic 4 correlation and regression: SL 4.4, SL 4.10 and AHL 4.13.

## Sections

Order and Revise-mode visibility live in `docs/data/site.json` under `codePage.sections` (agreed by Ben in review round 1):

| # | Section | Revise mode |
|---|---|---|
| 1 | Video (timestamped key moments to come) | no |
| 2 | I can… checklist (ticks saved in the student's browser) | yes |
| 3 | Key understandings | yes |
| 4 | Key visuals (static carousel with captions) | no |
| 5 | Where it fits (mind map in the IB hand-drawn style) | no |
| 6 | Misconceptions (weak answer, better answer) | yes |
| 7 | Command terms and answer wording | yes |
| 8 | Formula booklet pointer | yes |
| 9 | GDC steps (fx-CG50) | yes |
| 10 | Worked example (model solution behind a reveal) | yes |
| 11 | Key questions (explain why, model answer behind a reveal) | yes |
| 12 | History note (optional, every claim sourced) | no |
| 13 | Explorer (optional, only after discussion) | no |

"How the IB assesses it" was cut in round 1. `exam.json` stays in the repo for authoring, but code pages do not show it.

## Review loop

1. Claude drafts every statement from Ben's resources (transcripts, question bank, syllabus, Haese) with `content_<batch>.py`. Every number is computed in code.
2. `build_review.py` makes a review artifact: Agree, Revise (with a note) or Cut per statement, exported as a verdicts JSON.
3. Claude applies the verdicts, lists changed items in `changed`, and runs the next round; approved items are hidden in later rounds.
4. `.claude/skills/video-study-site/scripts/export_code_pages.py <pilot.json> <verdicts_r1.json> [<verdicts_r2.json> ...] .` writes the code-page data. Each item carries `status`; the page shows only `approved`. Cut items never reach the data.

## Not built yet

- **Visuals.** The carousel stories are approved, but no figures are drawn. A visual shows only once its `figure` path is set.
- **Explorers.** Four specs are approved (SL 4.4 correlation slider; SL 4.10 Pearson versus Spearman; AHL 4.13 choose the model, and linearising data). Each needs a discussion before it is built. Nothing renders until then.
- **GDC screens.** Steps are text with keycaps. Steps not yet checked on the emulator show "Key names still to be checked"; captures come with the `gdc-online-deck` workflow.
- **Key moments.** Videos are embedded without timestamps; key moments come from the `video-study-site` skill.
- **Drafts still waiting for Ben:** SL 4.4 GDC steps 4 and 5 and key question 2; SL 4.10 GDC "put back" step and its mind map; AHL 4.13 mind map.
