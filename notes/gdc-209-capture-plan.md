# GDC section for lesson 209 (AHL 2.7): capture plan

Goal: students graph a function and its inverse and check that the two are reflections in the line y = x. They also learn Zoom Square, because in the Standard window the picture is stretched and the reflection looks wrong.

Not built yet. The emulator could not be read in the session that wrote this (no computer-use tools), and no key sequence below is verified. Do not publish a `gdc` section from this until every step has been run on the emulator and each screen captured. Rules are in `.claude/skills/video-study-site/SKILL.md` (GDC) and the `gdc-online-deck` skill.

## Function pair

Use the video's own pair, so the section matches the lesson:

- Y1 = sqrt(X + 1)
- Y2 = X^2 - 1 with the domain limited to X >= 0 (the inverse, restricted to the range of Y1)
- Y3 = X (the mirror line)

Good because h(x) = sqrt(x + 1) is one-to-one, so no restriction is needed on Y1, and Y2 shows why the domain of the inverse matters: without the limit, Y2 is the whole parabola and it is not the reflection.

## Sequence to verify and capture

| # | Screen to capture | Keys to test (unverified) |
|---|---|---|
| 1 | Main menu, Graph highlighted | [MENU] [5] |
| 2 | Y1 entered | root key (probably [SHIFT] [x^2]), then X+1, close the root |
| 3 | Y2 entered with a domain | X^2 - 1, then [COMMA] [SHIFT] [ADD] 0 [COMMA] 10 [SHIFT] [SUB]; verified earlier: `[COMMA] [SHIFT] [ADD]` gives `[` and `[SHIFT] [SUB]` gives `]` (AASL D2) |
| 4 | Y3 = X | [X,theta,T] [EXE] |
| 5 | Graph in the Standard window, which looks stretched | [SHIFT] [F3] V-WIN, [F3] STANDRD, [EXIT], [F6] DRAW. Verified in the log: the V-Window path and Standard = -10 to 10 |
| 6 | Zoom menu | [SHIFT] [F2] ZOOM. Verified: F1 BOX, F3 IN, F4 OUT |
| 7 | Square option | Probably [F6] (next page) then SQR. Not verified: find the real key |
| 8 | Graph after Zoom Square: the curves mirror in y = x | [F6] DRAW if needed |
| 9 | Optional: check one point | [F5] G-SOLV or trace to confirm (4, ?) matches the mirror (?, 4) |

## Things to find out on the emulator

- The root key and whether the bracket must be closed before X + 1.
- The exact Zoom Square key sequence and its menu name on the fx-CG50.
- What the Y2 line looks like with a domain, and whether the domain brackets show.
- Whether the screen after Zoom Square has x and y scales that make y = x look like 45 degrees.
- Whether the graph is slow to draw (Y2 with a domain).
- What state to restore afterwards: reset the window to Standard, and clear Y1 to Y3.

## Teaching points for the steps

1. Standard window (expected, confirm on the emulator): y = x does not look like 45 degrees, so the reflection looks wrong. The reason is that the graph area is about twice as wide as it is tall, while Standard gives both axes the same range.
2. Zoom Square equalizes the scales: now the curves are mirror images.
3. Check: the inverse graph is the reflection of the original in y = x; pick one point (a, b) on Y1 and find (b, a) on Y2.
4. "Put it back" line: return to the Standard window and clear the functions.

## Where it goes

A `gdc` section after `method` and before `wording`, tab "GDC", with `start` and `steps` captures saved in `docs/img/gdc/` (names like `ahl27_01.jpg`). The `inverse` explorer (see the explorer plan) and this section teach the same fact: the explorer shows it, the GDC lets students check it.
