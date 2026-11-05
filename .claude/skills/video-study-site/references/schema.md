# Lesson file schema (`docs/data/lessons/<n>.json`)

`validate.py` enforces this. Working examples: `23.json` (binomial), `13.json` (experimental design), `36.json` (one-proportion test).

Any string may contain `$...$` math. Times (`t`, `seek`) are whole seconds into the video.

## Top level

```json
{
  "n": 13,                       // playlist position; must match docs/data/lessons.json
  "unit": 1,                     // unit id from site.json; must match lessons.json
  "topic": "1.13",
  "title": "Experimental Design",
  "videoId": "2Yn1235uFzE",      // must match lessons.json
  "videoTitle": "IB Math AI Topic 4 Correlation",   // iframe title, for screen readers
  "intro": "After this lesson you can ...",
  "moments": [ ... ],
  "sections": [ ... ],           // rendered in this order
  "footer": "Status: draft from auto-generated captions, ...",    // optional
  "review": { "status": "approved", "flags": [ { "kind": "wording", "text": "..." } ] }
}
```

`review.status` is `approved` (normal; set in every PR) or `draft` (shows a banner, for a page the teacher wants held back). Flag `kind` is free text; use `wording`, `caption`, `calculator`, `values`, `timestamps`, `explorer`, `placement`. Flags are not shown on the page but are public in the JSON, so keep them factual and short.

## Moments

```json
{ "t": 1265, "type": "Procedure", "title": "How to describe random assignment", "text": "Number the subjects, ..." }
```

`type` is a short label: Concept, Definition, Key idea, Principle, Procedure, Formula, Worked example, Calculator, Exam wording, Exam question, Design, Visual, Reference, Overview. Moments must be in time order.

## Every section

```json
{ "id": "mcq", "type": "mcq", "tab": "Multiple choice", "kicker": "Check your understanding", "title": "Multiple choice",
  "notes": [ { "label": "Wording check.", "text": "..." } ] }
```

`id` is unique in the file and used for `#s-<id>`. `tab` is the label in the section bar. `notes` is optional on any section and renders as callouts at the end of the section. Use it for wording checks students should see.

## `decision`

```json
{ "type": "decision",
  "cards": [ { "letter": "B", "name": "Binary", "text": "Each trial is a success or a failure." } ],
  "columns": ["Scenario", "B", "I", "T", "S", "Binomial?"],
  "verdictColumn": 5,
  "rows": [ { "cells": ["McKenzie makes 78% ...", "Yes", "Yes", "Yes", "Yes", "Binomial"], "seek": 336 } ] }
```

Cards and rows are both optional, but one is required. A "Video" column is added automatically; leave it out of `columns`. `verdictColumn` is the zero-based index shown bold. Each row has exactly one cell per column.

## `procedure`

```json
{ "type": "procedure",
  "intro": "Text above the steps.",
  "steps": ["Optional numbered steps ..."],
  "parts": [ { "label": "Combinations", "tex": "$\\binom{8}{3}=56$", "text": "..." } ],
  "line": "$P(X=x)=\\binom{n}{x}p^x(1-p)^{n-x}$",
  "buttons": [ { "label": "Watch the formula (26:56)", "seek": 1616 } ] }
```

Only `intro` is required.

## `explorer`

```json
{ "type": "explorer", "explorer": "binomial", "intro": "...", ...explorer-specific config }
```

`explorer` names `docs/js/explorers/<name>.js`. The remaining fields are that explorer's config; see `explorers.md`.

## `desmos` (calculator walkthrough)

```json
{ "type": "desmos", "intro": "The calculator starts empty. ...", "note": "optional; defaults to site.json calculator.examNote",
  "steps": [ { "title": "At most", "suppose": "we want $P(X\\le4)$.", "how": "open Cumulative Probability, ...",
               "observe": "The dots for 0 through 4 ...", "expected": "$P(X\\le4)\\approx 0.8917$", "seek": 2162 } ] }
```

Each step renders as "Suppose ... To do that, ... Observe." with a "Show expected result" toggle and a video link. Write `suppose` and `how` to continue those lead words (lowercase start).

## `wording`

```json
{ "type": "wording",
  "traps": [ { "kind": "Common trap", "title": "Reporting a bare decimal", "weak": "0.0266",
               "better": "$P(H=6)=0.0266$. The probability that ...", "seek": 2270 } ] }
```

`kind` is "Common trap" or "Exam wording". `weak` is shown in quotes, so do not add quote marks.

## `mcq`

```json
{ "type": "mcq",
  "questions": [ { "stem": "...", "opts": ["A", "B", "C", "D"], "ok": 1, "why": ["...", "...", "...", "..."], "seek": 236 } ] }
```

`ok` is the zero-based index of the correct option. `why` has one entry per option. On a wrong pick the page shows that option's `why` and then the correct one.

## `frq`

```json
{ "type": "frq", "prompt": "...", "parts": ["(a) ...", "(b) ..."], "sample": ["(a) ...", "(b) ..."],
  "checklist": ["(a) ...", "(b) ..."], "symbols": [["mu", "μ"]], "note": "..." }
```

`symbols` and `note` are optional and default to `site.json` `frqSymbols` and `frqNote`.

## `docs/data/lessons.json` entries

```json
{ "n": 13, "unit": 1, "topic": "1.13", "title": "Experimental Design", "videoId": "2Yn1235uFzE",
  "transcript": "13-2Yn1235uFzE.txt", "status": "live" }
```

`status`: `transcript` (listed only), `next` (planned), `draft` (page exists, held back, not linked), `live` (linked from the home page). A PR sets its lessons to `live`, so they publish when it is merged.
