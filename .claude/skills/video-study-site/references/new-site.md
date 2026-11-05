# Setting up a site for another course or teacher

The engine is course-neutral. A new site is a copy of this repo with its own `site.json`, lesson list, transcripts, and (optionally) colors.

## Steps

1. **Repos.** The teacher creates two GitHub repos: a public one for the site (for example `Biology-Hub`) and a private one for transcripts (`Biology-Hub-transcripts`), shared with any co-authors. Captions belong to the video creator, so they stay private.
2. **Copy the engine** into the public repo: `docs/` (without `docs/data/lessons/*.json`), `.github/workflows/pages.yml`, `.claude/skills/video-study-site/`, `README.md`, `.gitignore`. Start `docs/data/lessons.json` as `{"lessons": []}`.
3. **Link transcripts:** `git submodule add https://github.com/<owner>/<name>-transcripts.git transcripts`.
4. **Write `docs/data/site.json`:**
   - `siteTitle`, `course`, `playlist`, `videoCredit`
   - `home`: `headline`, `lede`, optional `pilot`
   - `units`: `{id, tab, kicker, name, topicPrefix}` per unit, plus one `{..., "fallback": true}` unit for reviews and anything without a topic number. `topicPrefix` is the part before the dot in topic numbers (`"3"` matches 3.1 to 3.15). If the course does not number topics, put every unit's video numbers in the teacher's syllabus and place them by hand after `build_index.py`.
   - `titleCleanup`: `stripPrefixes` (text to drop from the start of video titles) and `cutAt` (cut the title at the first of these)
   - `calculator`: `name`, `examNote`, and `desmosApiKey` / `desmosSrc` if the walkthrough uses Desmos. The key ships to every browser, which is normal for Desmos.
   - `frqSymbols` and `frqNote` for the response box
5. **Fetch and index:** run `fetch_playlist.py` on the teacher's computer, then `build_index.py`.
6. **Colors and fonts (optional):** edit the `:root` tokens at the top of `docs/css/modernist.css` (`--color-*`, `--font-*`). Keep the radius at 0 and the 2px rules unless the teacher wants a different look. The explorer SVGs use the accent `#ec3013` and grey `#bab6b6` directly; change those in the explorer files if the accent changes.
7. **Publish:** in the repo's Settings > Pages, set Source to **GitHub Actions**. Branch deploys fail on private submodules.

Then build lessons with the normal workflow in `SKILL.md`.

## Calculator other than Desmos

The `desmos` section embeds the Desmos API calculator. For a course that uses a different calculator (for example a Casio or TI handheld), skip that section and put the keystrokes in a `procedure` section with `steps`, or build a new section type in `docs/js/sections/` and register it in `TYPES` in `docs/js/lesson.js` and in `validate.py`.
