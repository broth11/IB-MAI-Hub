# fx-CG50 key sequences verified on the emulator

Running log for the AA SL GDC decks (`claude/PLAN-aasl-gdc-decks.md`). One row per sequence
actually pressed on Casio fx-CG Manager PLUS (fx-CG50 emulator) on the teacher's Mac. Seeded on
23/10/2026 with the sequences validated on G9X U3 L7 (artifact YAjiuXCD4V8oRS51gbgnx6); every deck
appends what it verifies. OS version: as shown by the emulator (seed rows: not recorded).

| Menu | Task | Keys (as on the emulator) | OS | Date | Deck |
|---|---|---|---|---|---|
| Main | Open Graph | [MENU] [5] | — | 23/10/2026 | G9X U3 L7 |
| Graph | Store a function | type in Y1, [EXE] (= highlighted, cursor to Y2) | — | 23/10/2026 | G9X U3 L7 |
| Graph | Line of wrong type (X=) | [F3] TYPE, [F1] Y= | — | 23/10/2026 | G9X U3 L7 |
| Graph | Select / deselect a function | [F1] SELECT toggles the highlighted = | — | 23/10/2026 | G9X U3 L7 |
| Graph | Draw | [F6] DRAW | — | 23/10/2026 | G9X U3 L7 |
| Graph | V-Window | [SHIFT] [F3] V-WIN; [F3] STANDRD = −10..10; typed values: Xmin [EXE] max [EXE] scale [EXE] lands on dot, [DOWN] skips dot, Ymin [EXE] max [EXE] scale [EXE]; [EXIT] | — | 23/10/2026 | G9X U3 L7 |
| Graph | Zoom | [SHIFT] [F2] ZOOM; [F1] BOX (corner [EXE], corner [EXE]); [F3] IN / [F4] OUT, pointer then [EXE]; pointer step one dot = width/126, height/62 | — | 23/10/2026 | G9X U3 L7 |
| Graph | ROOT | [F5] G-SOLV, [F1] ROOT, [RIGHT] next root | — | 23/10/2026 | G9X U3 L7 |
| Graph | Y-ICEPT | [F5] G-SOLV, [F4] Y-ICEPT | — | 23/10/2026 | G9X U3 L7 |
| Graph | MAX / MIN | [F5] G-SOLV, [F2] MAX / [F3] MIN ("Not Found" when none) | — | 23/10/2026 | G9X U3 L7 |
| Graph | INTSECT | [F5] G-SOLV, [F5] INTSECT, [RIGHT] next point | — | 23/10/2026 | G9X U3 L7 |
| Graph | Leaving a G-Solv result | [EXIT] returns to the function list, not the graph | — | 23/10/2026 | G9X U3 L7 |
| SET UP | Angle unit | [SHIFT] [MENU] SET UP, [DOWN]×10 to Angle, [F1] Deg / [F2] Rad, [EXIT] | — | 23/10/2026 | G9X U3 L7 |
| Graph | Rational function in Y1 | [LP] 2 [XTT] [ADD] 3 [RP] [DIV] [LP] [XTT] [SUB] 1 [RP] [EXE]; Math I/O shows it as a fraction after EXE | not shown | 23/10/2026 | AASL D1 |
| Graph | Exponent | [XTT] [POW] 3 then [RIGHT] to leave the exponent before typing on | not shown | 23/10/2026 | AASL D1 |
| Graph | V-Window with 378-dot width | dot = (Xmax − Xmin)/378 (e.g. 0.03174603 for −5..7); x = 1 falls on a dot, no joining line drawn for (2x+3)/(x−1) | not shown | 23/10/2026 | AASL D1 |
| Main | Open Table | [MENU] [7]; Table shares the function list with Graph | not shown | 23/10/2026 | AASL D1 |
| Table | Range | [F5] SET: Start [EXE] End [EXE] Step [EXE], [EXIT], [F6] TABLE; undefined value shows ERROR | not shown | 23/10/2026 | AASL D1 |
| Table | Type over an X cell | cursor on an X cell, type the value, [EXE]: the row is recomputed, cursor stays | not shown | 23/10/2026 | AASL D1 |
| Table | Read Y in full | [RIGHT] to the Y cell; value below the table, as a fraction in d/c mode; [SD] gives the decimal (needed for each cell) | not shown | 23/10/2026 | AASL D1 |
| Graph | MAX / MIN precision | numerical search: x shown to ~8 s.f. (−0.1547005063 for −0.1547005384; 2.154700554 for 2.154700538); y exact to 10 s.f. | not shown | 23/10/2026 | AASL D1 |
| Graph | Y-CAL / X-CAL | [F5] G-SOLV, [F6] ▷, [F1] Y-CAL ("Enter X-Value") / [F2] X-CAL ("Enter Y-Value"), value [EXE]; switch other graphs off first | not shown | 23/10/2026 | AASL D1 |
| Graph | Keys during a redraw | keys pressed while the graph is drawing are lost: wait for the graph before [F5] | not shown | 23/10/2026 | AASL D1 |
| SET UP | Angle unit (re-verified) | [SHIFT] [MENU], [DOWN]×10 to Angle, [F2] Rad, [EXIT]: status bar shows Rad | not shown | 23/10/2026 | AASL D2 |
| Graph | Domain after a function | [COMMA] [SHIFT] [ADD] gives `[`, [SHIFT] [SUB] gives `]`: 3sin(2X)+1,[0,2π]; π is [SHIFT] [EXP] | not shown | 23/10/2026 | AASL D2 |
| Graph | Trig in Y= | [SIN] / [COS] open no bracket: type [LP] … [RP] | not shown | 23/10/2026 | AASL D2 |
| Graph | V-Window in π | 2π = {2} [SHIFT] [EXP]; π/2 = [SHIFT] [EXP] [DIV] {2}; shown truncated: 6.2831853, 1.57079632 | not shown | 23/10/2026 | AASL D2 |
| Graph | MAX/MIN on a trig curve | numerical search: x = 0.785398 shown for π/4, 3.926990754 for 5π/4; MIN gave 2.35619449 and 5.497787144 | not shown | 23/10/2026 | AASL D2 |
| Graph | MAX with two graphs drawn | [F5] [F2] shows "[↑]/[↓]:Select graph"; [EXE] takes the highlighted one | not shown | 23/10/2026 | AASL D2 |
| Graph | Keys after EXE or EXIT | a key pressed while the list or graph redraws is lost (a 3 dropped from 32 in Y4; F6 dropped after EXIT): wait for the screen | not shown | 23/10/2026 | AASL D2 |
| Run-Matrix | Clear the history | [F2] DELETE, [F2] DEL-ALL, [F1] Yes ([AC] clears only the input line) | not shown | 23/10/2026 | AASL D3 |
| Run-Matrix | log, ln, eˣ | [LOG] / [LN] open no bracket: [LOG] 50 [EXE]; [SHIFT] [LN] gives the e^□ template | not shown | 23/10/2026 | AASL D3 |
| Run-Matrix | logab template | [F4] MATH, [F2] logab: log□(□), cursor in the base; base [RIGHT] argument [EXE] | not shown | 23/10/2026 | AASL D3 |
| Run-Matrix | Σ( template | [F4] MATH, [F6] ▷, [F2] Σ( (page 2: [F1] ∫dx, [F2] Σ(); cursor starts in the bracket; [RIGHT] → variable, [RIGHT] → start, [RIGHT] → end; from an exponent, one more [RIGHT] first | not shown | 23/10/2026 | AASL D3 |
| Run-Matrix | nCr | n, [OPTN] [F6] ▷, [F3] PROB, [F3] nCr, r [EXE] (PROB: [F1] x!, [F2] nPr, [F3] nCr, [F4] RAND) | not shown | 23/10/2026 | AASL D3 |
| Main | Open Equation | [MENU] [X,θ,T] (icon A); menu: [F1] SIMUL, [F2] POLY, [F3] SOLVER | not shown | 23/10/2026 | AASL D3 |
| Equation | Solver | [F3]; type the equation, = is [SHIFT] [.]; [EXE] lists x (start value), Lower, Upper; [F6] SOLVE shows x, Lft, Rgt | not shown | 23/10/2026 | AASL D3 |
| Equation | Polynomial | [F2] POLY, [F1] degree 2; a [EXE] b [EXE] c [EXE] (negative with [(−)]); [F1] SOLVE: cells truncated, highlighted root shown exact (surd) bottom right; [S⇔D] gives 10 s.f.; [DOWN] to X2 | not shown | 23/10/2026 | AASL D3 |
| Equation | Simultaneous | [F1] SIMUL, [F1] 2 unknowns; rows a b c each [EXE]; [F1] SOLVE gives X, Y | not shown | 23/10/2026 | AASL D3 |
| Equation | Back to the menu | from a POLY result: [EXIT] ×3 (result → table → Degree? → Equation menu) | not shown | 23/10/2026 | AASL D3 |
| Run-Matrix | d/dx, d²/dx² at a point | [OPTN] [F4] CALC (F1 Solve, F2 d/dx, F3 d²/dx², F4 ∫dx, F5 SolveN); template d/dx(□)│x=□: expression [RIGHT] value [EXE]; the CALC menu stays after EXE, so the next [F3] works directly. Also in [F4] MATH: F4 d/dx, F5 d²/dx² | not shown | 23/10/2026 | AASL D4 |
| Graph | Derivative as a graph | Y2: [OPTN] [F2] CALC [F1] d/dx, [VARS] [F4] GRAPH [F1] Y {1} [RIGHT] [X,θ,T] → d/dx(Y1)│x=x. Syntax ERROR at DRAW if Y1 carries a domain ,[a,b]: leave Y1 without one. Drawing Y2 takes ≈ 20 s | not shown | 23/10/2026 | AASL D4 |
| Graph | OPTN and VARS in the Y= editor | OPTN: F1 List, F2 CALC, F3 HYPERBL, F4 PROB, F5 NUMERIC; VARS: F1 V-WIN, F2 FACTOR, F3 STAT, F4 GRAPH (Y r Xt Yt X), F5 DYNA | not shown | 23/10/2026 | AASL D4 |
| Graph | G-Solv result screen | top line "[EXE]:Show coordinates"; [F5] works directly from a result (no EXIT needed); ROOT of d/dx(Y1) finds x = 0 at the window's left end | not shown | 23/10/2026 | AASL D4 |
| Graph | Y-CAL with two graphs | [F5] [F6] [F1], "Select graph", [EXE] for Y1, value [EXE] | not shown | 23/10/2026 | AASL D4 |
| Graph | Tangent | [SHIFT] [F4] SKETCH (F1 Cls, F2 Tangent, F3 Norm, F4 Inverse); [F2], "Select run position", type x [EXE]: X, Y and, with SET UP Derivative On, dY/dX to 5 s.f. No equation displayed. Derivative: [SHIFT] [MENU], [DOWN]×6, [F1] On | not shown | 23/10/2026 | AASL D4 |
| Main | Digit after MENU | a digit pressed right after [MENU] may land late (menu redraws): wait for the main menu | not shown | 23/10/2026 | AASL D4 |
| Main | Open Financial | [MENU] [ln] (icon C) | not shown | 23/10/2026 | AASL D5 |
| Financial | Compound Interest | [F2] CMPD; list n, I%, PV, PMT, FV, P/Y, C/Y (fresh: all 0, P/Y = C/Y = 12); value [EXE] moves the cursor down; negative with [(−)]; list scrolls past P/Y | not shown | 23/10/2026 | AASL D5 |
| Financial | Solve a variable | [F1] n, [F2] I%, [F3] PV, [F4] PMT, [F5] FV from the list; result screen: [F1] REPEAT returns to the list with the result stored, cursor on C/Y ([UP]×6 to n) | not shown | 23/10/2026 | AASL D5 |
| Emulator | Mouse input | clicks on keys closer than ≈ 0.5 s apart are lost or repeated (96 came out 77): space key presses | not shown | 23/10/2026 | AASL D5 |
| Run-Matrix | ∫dx template | [OPTN] [F4] CALC [F4] ∫dx: ∫□^□ □ dx, cursor in the integrand; after it, [RIGHT] → lower limit, [RIGHT] → upper (from an exponent or Abs, one more [RIGHT] first) | not shown | 23/10/2026 | AASL D6 |
| Run-Matrix | Abs | [OPTN] [F6] ▷ [F4] NUMERIC (F1 Abs, F2 Int, F3 Frac, F4 Rnd, F5 Intg), [F1]: \|□\| template; OPTN page 2: F1 CONVERT, F2 HYPERBL, F3 PROB, F4 NUMERIC, F5 ANGLE | not shown | 23/10/2026 | AASL D6 |
| Graph | G-Solv ∫dx | [F5] G-SOLV [F6] ▷ [F3] ∫dx opens F1 ∫dx, F2 ROOT, F3 INTSECT, F4 MIXED; [F1]: a typed digit opens "Enter Lower Bound", [EXE], digit, "Enter Upper Bound", [EXE]: region shaded, LOWER, UPPER, ∫dx shown to 9 s.f. (cut: 10.6666666 for 32/3) | not shown | 23/10/2026 | AASL D6 |
| Graph | Area between two curves | ∫dx menu [F3] INTSECT: lower limit set at the first intersection, [EXE]; [RIGHT] to the next intersection, [EXE]: ∫dx and area shown (6.42768737) | not shown | 23/10/2026 | AASL D6 |
| Graph | Function list after D4 | typing in Y= showed the F-key bar "Y r Xt Yt X" (VARS GRAPH left active); [EXE] or [EXIT] restores SELECT … DRAW | not shown | 23/10/2026 | AASL D6 |
| Main | Open Statistics | [MENU] [2] (wait for the main menu before the digit); list editor, Lists 1–4 visible | not shown | 23/10/2026 | AASL D7 |
| Statistics | Q1Q3 Type | [SHIFT] [MENU] (SET UP), [UP] once wraps to the last line Q1Q3 Type: [F1] Std / [F2] OnData; [EXIT]. Emulator default Std | not shown | 23/10/2026 | AASL D7 |
| Statistics | List editor menus | function bar has three pages: GRAPH CALC TEST INTR DIST ▷ → TOOL EDIT DELETE DEL-ALL INSERT ▷ → CSV ▷; [F6] cycles them (twice from TOOL back to GRAPH) | not shown | 23/10/2026 | AASL D7 |
| Statistics | Clear a list | cursor in the list, [F6] (▷) [F4] DEL-ALL, "Delete List?" [F1] Yes; [LEFT]/[RIGHT] to the next list, [F4] [F1] | not shown | 23/10/2026 | AASL D7 |
| Statistics | Enter data | value [EXE] moves down; [RIGHT] from the end of List 1 lands at the top of an empty List 2 | not shown | 23/10/2026 | AASL D7 |
| Statistics | 1-Var | [F2] CALC (F1 1-VAR, F2 2-VAR, F3 REG, F6 SET); [F6] SET: 1Var XList, 1Var Freq, 2Var XList, 2Var YList, 2Var Freq; [EXIT] [F1]: x̄ Σx Σx² σx sx n, [DOWN]×6: minX Q1 Med Q3 maxX Mod. Values cut to fit (σx 3.1685959) | not shown | 23/10/2026 | AASL D7 |
| Statistics | Freq = List n | in SET, [DOWN] to 1Var Freq, [F2] LIST, "Select List No. List[1~26]", n [EXE]; (F1 gives 1) | not shown | 23/10/2026 | AASL D7 |
| Statistics | Linear regression | [F2] CALC [F3] REG (F1 X, F2 Med, F3 X², F4 X³, F5 X⁴), [F1] X: F1 ax+b / F2 a+bx; result a, b, r, r², MSe (cut to fit) | not shown | 23/10/2026 | AASL D7 |
| Statistics | x on y | SET: 2Var XList [F1] LIST {2} [EXE], [DOWN], 2Var YList [F1] LIST {1} [EXE]; then REG as usual | not shown | 23/10/2026 | AASL D7 |
| Run-Matrix | ŷ, x̂ | value, [OPTN] [F5] STAT (F1 x̂, F2 ŷ, F3 DIST, F4 StdDev, F5 Var), [F2] ŷ, [EXE]: uses the last regression (7ŷ = 66.875) | not shown | 23/10/2026 | AASL D7 |
| Emulator | Mac keyboard (background, computer_app_key) | digits 0–9, Return = EXE, arrow keys reach the emulator; "." and "-" are refused in background (click [.] / [(−)] / [−] instead). With full-screen control (computer_type) "." and "-" also type. Mixed use works: digits by keyboard, F-keys, SHIFT, OPTN, MENU, DOT, NEG by click | not shown | 24/10/2026 | AASL D8 |
| Statistics | SET leftovers | D7 left 1Var Freq = List2 and 2Var XList/YList swapped: check SET before any deck that uses 1-VAR or REG | not shown | 24/10/2026 | AASL D8 |
| Statistics | E(X) from a table | x in List 1, P in List 2; [F2] CALC [F6] SET, [DOWN], [F2] LIST {2} [EXE]; [EXIT] [F1] 1-VAR: x̄ = E(X), n = 1 (sum of P); decimal frequencies accepted | not shown | 24/10/2026 | AASL D8 |
| Statistics | DIST menu | [F5] DIST: F1 NORM, F2 t, F3 CHI, F4 F, F5 BINOMIAL, F6 ▷; NORM: F1 Npd, F2 Ncd, F3 InvN; BINOMIAL: F1 Bpd, F2 Bcd, F3 InvB | not shown | 24/10/2026 | AASL D8 |
| Statistics | Bpd / Bcd | Data [F2] Var; Bpd: x, Numtrial, p; Bcd: Lower, Upper, Numtrial, p (shared between Bpd and Bcd); [DOWN] to Execute, [EXE]; result p to 8 s.f., cut (0.23113969) | not shown | 24/10/2026 | AASL D8 |
| Statistics | Ncd | Lower, Upper, σ, μ, Save Res, GphColor, Execute; keeps last Lower/Upper (also from Bcd); −∞ as [(−)] 1 [×10ˣ] 99; [EXE] on GphColor also runs it; result p, z:Low, z:Up | not shown | 24/10/2026 | AASL D8 |
| Statistics | InvN | Tail [F1] LEFT / [F2] RIGHT / [F3] CENTRAL, Area, σ, μ (kept from Ncd); result xInv to 9 s.f., rounded (180.252413); Central gives x1 Inv, x2 Inv | not shown | 24/10/2026 | AASL D8 |
| Run-Matrix | InvNormCD | [OPTN] [F5] STAT [F3] DIST [F1] NORM [F3] InvN → InvNormCD(; InvNormCD(0.2) = left tail, σ 1, μ 0 by default; 10 s.f. (1.281551566); 12÷Ans with [SHIFT] [(−)] | not shown | 24/10/2026 | AASL D8 |
| Form screens | EXIT | EXIT from a Bpd / Bcd / Ncd / InvN result returns to its form; EXIT from the form returns to the list editor (GRAPH… bar) | not shown | 24/10/2026 | AASL D8 |
