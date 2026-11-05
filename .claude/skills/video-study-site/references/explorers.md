# Explorer library

Explorers live in `docs/js/explorers/<name>.js`. A lesson uses one through an `explorer` section: `{ "type": "explorer", "explorer": "<name>", ...config }`. The page loads only the explorers a lesson names.

## Catalog

Update this table whenever you add an explorer or a config option.

| Name | Shows | Good for | Config |
|---|---|---|---|
| `binomial` | Bar chart of a binomial distribution with the event $P(X=k)$, $P(X\le k)$ or $P(X\ge k)$ highlighted; mean and SD | Binomial and other counts with fixed $n$ and $p$; cumulative probability; complements | `intro`, `stories {key: text}`, `initial {n, p, k, mode, story}`, `presets [{label, sub, n, p, k, mode, story}]`; `mode` is `eq`, `le` or `ge` |
| `random-assignment` | Subjects with one extraneous variable assigned to two groups, completely at random or blocked; histogram of the imbalance over many assignments | Random assignment, replication (bigger groups balance better), blocking, confounding | `intro`, `story`, `labels {variable, other, groupA, groupB}`, `initial {n, older, mode}`, `presets [{label, sub, n, older, mode}]`; `mode` is `crd` or `block`; `older` is the share with the variable |
| `one-proportion-test` | Null distribution of $\hat p$ with the p-value tail(s) shaded, $z$, p-value, decision at $\alpha$, and a simulation of 1,000 samples under $H_0$ | One-sample $z$ test for $p$, p-values, one- vs two-sided, $\alpha$, simulation-based p-values | `intro`, `stories {key: text}`, `initial {n, p0, x, alt, alpha, story}`, `presets [{label, sub, n, p0, x, alt, story}]`; `alt` is `lt`, `gt` or `ne` |
| `sampling-distribution` | Histogram of simulated sample proportions with the normal model N(p, sqrt(p(1-p)/n)) drawn over it; average and SD of the simulated p-hats next to the theory values; large counts check | Sampling distribution of p-hat, center and spread, effect of n, unbiased vs biased estimators | `intro`, `stories {key: text}`, `initial {n, p, story}`, `presets [{label, sub, n, p, mode, story}]`, `bias` (true shows a Random / Biased switch), `biasFactor` (default 1.5); `mode` is `random` or `biased` |
| `ci-capture` | 100 one-sample z intervals for p per press, gray if they catch the true p and red if they miss; running capture rate; margin of error | What a confidence level means, effect of level and n on width, capture rate | `intro`, `stories {key: text}`, `initial {n, p, level, story}`, `presets [{label, sub, n, p, level, story}]`; `level` is 0.9, 0.95 or 0.99 |

Likely next additions as more lessons are built: normal distribution (areas and percentiles), sampling distribution of $\bar x$ (CLT), two-proportion test, t distribution vs normal, chi-square, regression with residuals. Build each only when a lesson needs it.

## Reuse, adapt, or build

1. **Reuse** when an existing explorer shows the lesson's idea with only different presets or stories.
2. **Adapt** when it nearly fits: add an optional config field (for example new labels, a second chart mode, or a range setting), default it so existing lessons look the same, and document it in the catalog. Check every lesson that uses the explorer still renders.
3. **Build** a new module only when the picture is genuinely different.

## Module interface

```js
import { esc, tex } from '../util.js';
export function renderSide(sec, ctx) { /* optional: HTML under the section title (intro, story) */ }
export function render(sec, ctx)     { /* HTML string for the explorer body */ }
export function mount(el, sec, ctx)  { /* wire events on el, draw the first state */ }
```

`ctx.site` is `site.json`. Helpers in `util.js`: `esc`, `tex` (wraps text with `$...$` math in a `<tex-text>`), `fmtTime`, `pmf` (binomial), `normalCdf`, `shuffle`. To update a label that contains math, replace its innerHTML with `tex(...)` so KaTeX re-renders. A preset that changes the story updates `#s-<id> [data-story]`.

Start the file with a comment block that says what it shows and lists the section config, like the existing modules.

## Layout rules (from the teacher)

- The explorer fits one screen with no scrolling; the chart takes the leftover space. Use the `.explorer` flex column, `flex: none` rows, and `.ex-chart { flex: 1 }` with an SVG `viewBox="0 0 640 260"`.
- Controls sit in equal-width columns, centered, stretched to full width: `.ex-presets`, `.ex-sliders`, `.ex-modes`, `.ex-actions`, `.ex-stats`, with `.ex-cols-2/3/4` to set the count.
- Preset buttons show a name on row 1 and the values on row 2 (`<span>Name</span>` then `tex(sub)`), and values never split across rows.
- Every explorer has a short story under its title in the side column: who, how many, and what is being measured.
- **Stat row** (`.ex-stats` of `.ex-stat` cells, each a `.label` then a `.value`): formula and expression labels are 13px; bold results are 25px (decision text uses `.value.small`, 18px). The cells use a CSS subgrid so every label sits on one shared baseline row and every result starts on one shared top edge, as if one horizontal line cut through the tops of all the results. Keep one `.label` and one `.value` per cell so the subgrid lines up. Put a line break between the parts of a two-part result (for example "Reject $H_0$" then "at $\alpha=0.05$") so it never wraps mid-phrase.
- Toggle buttons use `.ex-mode` with `aria-pressed`. The main action is `.btn-primary`; the rest are `.btn-secondary`.
- Colors come from the design system: accent `#ec3013` for the highlighted event, `#bab6b6` for the rest, ink `#201e1d`. Labels are flush left except inside explorer controls, which are centered.
- At 390px wide there is no horizontal scroll (the site CSS drops presets and actions to 2 columns and sliders to 1).

## Checking an explorer

- Compute the expected values for each preset in Python and compare them with what the page shows.
- If it simulates, check the simulated value lands near the exact one.
- Screenshot it at 1440x900 and look at it: labels must not overlap, bars must not alias, and the empty state must say what to press.
