# IB MAI Hub (project notes)

Set up on 2026-11-05 from the AP Statistics Hub template.

## Status

- Site engine copied from the AP Statistics Hub. No study pages built; all 82 lessons are `transcript` status.
- `site.json` written for IB Math AI HL: five topics as units, GDC instead of Desmos, IB-style response box symbols.
- `lessons.json` built with `scripts/build_index_topics.py`. Lesson number n = topic*100 + playlist position (4.06 = 406).

## Decisions to confirm with Ben

- **Syllabus codes.** Video titles carry no IB syllabus code (SL 4.5 and so on), so the lesson label on the home page is the playlist position. Supply a video-to-syllabus mapping if the list should follow the syllabus.
- **Multiple choice.** Ben's standing rule for MAI lessons is no multiple-choice questions. The engine's `mcq` section is required by the validator today. Decide whether to drop it for this site, and then change `validate.py` and the skill's content rules.
- **Calculator section.** There is no GDC (Casio fx-CG50) section module yet. Until one exists, put GDC keystrokes in a `procedure` section.
- **Explorers.** The explorer library (binomial, sampling distribution, and so on) is AP Statistics material. Reuse where it fits MAI Topic 4; build new ones for functions, trigonometry, and calculus.
- **Transcript quality.** See the transcripts repo README. The Whisper plus adjudication prompt used for the AP hub could be reused here.

## Setup state

- Private transcripts repo `broth11/IB-MAI-Hub-transcripts` must exist before the submodule is added (`git submodule add https://github.com/broth11/IB-MAI-Hub-transcripts.git transcripts`).
- GitHub Pages: Settings > Pages > Source = GitHub Actions.
