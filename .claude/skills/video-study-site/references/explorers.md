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
| `inverse` | Equal-scale grid with a function, a draggable horizontal line (one-to-one test with crossing count), the reflection in $y=x$ as the inverse, a mirror point $(a,b)\to(b,a)$, and the domain and range swap; a quadratic can be restricted to either side of its vertex | Inverse functions, one-to-one, domain restriction, reflection in $y=x$ (IB MAI AHL 2.7) | `intro`, `stories {key: text}`, `initial {preset}`, `presets [{label, sub, name, fn, mode, story, k, a, ...}]`; `fn` is `quad` (keys `h`, `k0`: $(x-h)^2+k_0$, `mode` `all`, `right` or `left`), `sqrt` (key `c`: $\sqrt{x+c}$) or `line` (keys `m`, `b`) |
| `correlation-slider` | A slider sets a target $r$; $n$ points are drawn with exactly that sample $r$, the regression line of $y$ on $x$, and the mean point $(\bar x,\bar y)$ with crosshairs. New data keeps $r$ | Pearson's $r$, strength and direction, the line through the mean point (IB MAI SL 4.4) | `intro`, `story`, `n`, `xMean`, `xSd`, `yMean`, `ySd`, `xname`, `yname`, `xv`, `yv`, `presets [{label, r}]` |
| `pearson-spearman` | Click to add points, drag to move; live $r$ and $r_s$; Linear toggle draws the line, Monotonic toggle joins points in $x$ order and labels increasing, decreasing or neither; rank labels (ties averaged) | Pearson versus Spearman, monotonic versus linear, outliers, ranks (IB MAI SL 4.10) | `intro`, `presets [{label, sub, pts [[x, y]], story}]`; grid is 0 to 10 on both axes |
| `model-choice` | Data sets 1 to 6; seven models (linear, quadratic, cubic, exponential, power, sine, logistic) with the curve, residuals, the curve dashed outside the data, $R^2$, $SS_{res}$, MSE, a comparison table, and Reveal with a context reason | Choosing a regression model, $R^2$ versus context, extrapolation (IB MAI AHL 4.13) | `intro`, `sets [{key, label, xv, yv, xname, yname, x, y, best, reason}]`. $R^2=1-SS_{res}/SS_{tot}$ on the data (the GDC's exponential and power $r^2$ comes from its log fit); MSE $=SS_{res}/(n-k)$ |
| `linearise` | $\ln x$ and $\ln y$ buttons slide the points and axes to log scales; straight-line fit and $r$ for what is plotted; the line turned back into an exponential, power or logarithmic model | Linearising data, log-log and semi-log (IB MAI AHL 4.13, AHL 2.10) | `intro`, `sets [{key, label, sub, xv, yv, xname, yname, x, y, straight, story}]`; `straight` is `x`, `y` or `xy` |

Likely next additions as more lessons are built: normal distribution (areas and percentiles), sampling distribution of $\bar x$ (CLT), two-proportion test, t distribution vs normal, chi-square. Build each only when a lesson needs it.

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

## Shared helpers for regression explorers

`docs/js/explorers/lib/fit.js`: `pearson`, `ranks` (ties averaged), `spearman`, `linreg` (IB letters $y=ax+b$), `fitModel(name, x, y)` for the seven AHL 4.13 models, `modelTex`, and `sf` (3 significant figures with a true minus). `docs/js/explorers/lib/plot.js`: `frame` (axes, nice ticks, pixel maps and their inverses), `curve`, colours.

## On code pages

Code pages (`code.html`) mount explorers from a code's `explorers` list: each approved spec with a `config` whose `explorer` names a module here. `export_code_pages.py --explorers <file>` merges the config (see `notes/code-pages/explorers-topic4.json`, generated by `explorer_data.py`, which also writes the values each preset should show). Two or more explorers on one code get tabs. Story text updates inside the nearest `.ex-wrap`.
