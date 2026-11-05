# IB MAI Hub (project notes)

Set up on 2026-11-05 from the AP Statistics Hub template.

## Status

- Site engine copied from the AP Statistics Hub. No study pages built; all 82 lessons are `transcript` status.
- `site.json` written for IB Math AI HL: five topics as units, GDC instead of Desmos, IB-style response box symbols.
- `lessons.json` built with `scripts/build_index_topics.py`. Lesson number n = topic*100 + playlist position (4.06 = 406). Each lesson has a `syllabus` list.
- Multiple choice removed (engine section, styles, validator, skill text). The IB does not use it. Core sections are `wording` and `frq`.
- New `gdc` section (Casio fx-CG50): steps beside the real emulator body with the pressed keys ringed, screens from real captures. Tested in a browser on a throwaway page using the eight angle-unit captures (deleted afterwards). Only those eight captures exist so far; every other GDC step needs a new capture from the emulator.

## Syllabus mapping (needs Ben's check)

Videos were matched to codes in `IB MAI SYLLABUS.html` (RIS Secondary Math Content/01-sources/syllabi) by title, 5 Nov 2026. All codes exist in the syllabus. Judgment calls worth a look:

- 204 Perpendicular Bisectors is SL 3.5 (the syllabus puts it in Geometry, not Functions).
- 208 GDC Tips: nSolve is SL 1.8 (technology for solving equations).
- 302 Pythagoras is SL 3.3. 309 Graphs of Trig Functions is AHL 3.8 and AHL 2.9. 315 Graph Theory is AHL 3.14 only, though 3.15 and 3.16 may also be partly covered.
- 406 Correlation is SL 4.4 and SL 4.10. 418 Hypothesis Testing is SL 4.11 and AHL 4.18. 419 Estimation and Confidence Intervals is AHL 4.16.

Syllabus codes with no video in the five playlists: SL 1.5, AHL 1.9, 1.10, 1.11, SL 2.6, AHL 2.10, 3.12, 3.15, 3.16, SL 4.5, AHL 4.12, 5.17, 5.18.

## Open items

- **GDC captures.** Build them on Ben's Mac with computer use (see the `gdc-online-deck` skill). The key-sequence log `gdc/menu_paths_verified.md` covers many menus already. Ben's `Calculator Skills (Haese MAI HL Casio).md` is a candidate source for steps.
- **Explorers.** The explorer library (binomial, sampling distribution, and so on) is AP Statistics material. Reuse where it fits MAI Topic 4; build new ones for functions, trigonometry, and calculus.
- **Transcript quality.** Raw YouTube captions, except two Whisper transcripts. The Whisper plus adjudication prompt used for the AP hub could be reused.
- **Transcripts submodule.** The private repo `broth11/IB-MAI-Hub-transcripts` must exist before the submodule is added (`git submodule add https://github.com/broth11/IB-MAI-Hub-transcripts.git transcripts`).
- **GitHub Pages.** Settings > Pages > Source = GitHub Actions.
