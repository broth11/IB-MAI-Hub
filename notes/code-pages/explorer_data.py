"""Data and config for the Topic 4 explorers (SL 4.4, SL 4.10, AHL 4.13).
Writes explorers-topic4.json (merged into the code pages by export_code_pages.py) and
explorer-check.json (the values each preset should show, for the page check).
Noise is seeded, so the numbers are the same every run."""
import json, pathlib
import numpy as np
from scipy import stats, optimize

rng = np.random.default_rng(20261106)
here = pathlib.Path(__file__).parent
r3 = lambda v: float(f"{v:.4g}")

# ---------- AHL 4.13: data sets for "Choose the model" ----------
def noisy(f, x, sd, lo=None):
    y = f(x) + rng.normal(0, sd, len(x))
    if lo is not None: y = np.maximum(y, lo)
    return [r3(v) for v in y]

sets = []
x = np.arange(1, 9.)
sets.append(dict(key="taxi", label="Taxi fares", xv="d", yv="C", xname="distance, $d$ (km)", yname="fare, $C$ (baht)",
    x=x.tolist(), y=noisy(lambda d: 35 + 6.5 * d, x, 1.6), best="linear",
    reason="The fare grows by about the same amount for each extra kilometre, so a straight line fits, and a fixed starting fare explains the intercept. The curved models add parameters but barely lower $SS_{res}$."))
x = np.arange(0, 2.01, 0.2)
sets.append(dict(key="ball", label="Thrown ball", xv="t", yv="h", xname="time, $t$ (s)", yname="height, $h$ (m)",
    x=[r3(v) for v in x], y=noisy(lambda t: 1.5 + 9.2 * t - 4.9 * t ** 2, x, 0.15), best="quadratic",
    reason="Under gravity the height rises, peaks, and falls symmetrically: a quadratic. The cubic fits about as closely, but its extra term has no physical meaning."))
x = np.arange(1, 8.)
sets.append(dict(key="views", label="Video views", xv="t", yv="V", xname="day, $t$", yname="total views, $V$",
    x=x.tolist(), y=[120, 190, 310, 480, 790, 1240, 2010], best="exponential",
    reason="The views grow by about the same factor (about 1.6) each day, which is exponential growth. A cubic can follow these seven points, but it would turn down outside them."))
x = np.array([0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.5, 1.8, 2.0])
sets.append(dict(key="pendulum", label="Pendulum", xv="L", yv="T", xname="length, $L$ (m)", yname="period, $T$ (s)",
    x=x.tolist(), y=noisy(lambda L: 2.01 * L ** 0.5, x, 0.02), best="power",
    reason="A power model $T=aL^b$ with $b$ close to 0.5 matches the physics: the period grows with the square root of the length, and $T=0$ when $L=0$."))
x = np.arange(0, 24.1, 2)
sets.append(dict(key="tide", label="Tide height", xv="t", yv="h", xname="time, $t$ (hours)", yname="water depth, $h$ (m)",
    x=x.tolist(), y=noisy(lambda t: 2.1 * np.sin(0.5 * t + 0.4) + 3.2, x, 0.12), best="sine",
    reason="Tides rise and fall in a repeating cycle, about every 12.5 hours. Only the sine model repeats; every polynomial runs off to infinity outside the data."))
x = np.arange(0, 15.)
sets.append(dict(key="plant", label="Seedling height", xv="w", yv="H", xname="week, $w$", yname="height, $H$ (cm)",
    x=x.tolist(), y=noisy(lambda w: 60 / (1 + 30 * np.exp(-0.55 * w)), x, 0.9, lo=0.4), best="logistic",
    reason="The plant grows slowly, then quickly, then levels off near its full height of about 60 cm. The logistic model has that ceiling; the cubic scores a similar $R^2$ but would keep growing, or shrink, after week 14."))

def fits(xs, ys):
    xs, ys = np.array(xs, float), np.array(ys, float)
    out, sst = {}, ((ys - ys.mean()) ** 2).sum()
    def rec(name, f, k):
        ss = ((ys - f(xs)) ** 2).sum(); out[name] = dict(r2=1 - ss / sst, ssRes=ss, mse=ss / (len(xs) - k))
    for name, deg in [("linear", 1), ("quadratic", 2), ("cubic", 3)]:
        c = np.polyfit(xs, ys, deg); rec(name, lambda t, c=c: np.polyval(c, t), deg + 1)
    if (ys > 0).all():
        m, c = np.polyfit(xs, np.log(ys), 1); rec("exponential", lambda t: np.exp(c) * np.exp(m) ** t, 2)
        if (xs > 0).all():
            m2, c2 = np.polyfit(np.log(xs), np.log(ys), 1); rec("power", lambda t: np.exp(c2) * t ** m2, 2)
    g = lambda t, a, b, c, d: a * np.sin(b * t + c) + d
    best = None
    for b0 in np.linspace(0.05, 3, 60):
        for c0 in np.linspace(-np.pi, np.pi, 13):
            try:
                p, _ = optimize.curve_fit(g, xs, ys, p0=[(ys.max() - ys.min()) / 2, b0, c0, ys.mean()], maxfev=4000)
                ss = ((ys - g(xs, *p)) ** 2).sum()
                if best is None or ss < best[0]: best = (ss, p)
            except Exception: pass
    rec("sine", lambda t: g(t, *best[1]), 4)
    if (ys > 0).all():
        lg = lambda t, L, C, k: L / (1 + C * np.exp(-k * t))
        try:
            p, _ = optimize.curve_fit(lg, xs, ys, p0=[ys.max() * 1.1, 10, 0.5], maxfev=20000)
            rec("logistic", lambda t: lg(t, *p), 3)
        except Exception: pass
    return out

check = {"model-choice": {s["key"]: fits(s["x"], s["y"]) for s in sets}}
for s in sets:
    f = check["model-choice"][s["key"]]
    assert max(f, key=lambda k: f[k]["r2"]) in (s["best"], "cubic", "quadratic", "logistic", "sine"), s["key"]

# ---------- AHL 4.13: "Linearising data" ----------
lin = []
x = np.arange(1, 8.)
lin.append(dict(key="exp", label="Video views", sub="Exponential", xv="t", yv="V", xname="day, $t$", yname="views, $V$",
    x=x.tolist(), y=[120, 190, 310, 480, 790, 1240, 2010], straight="y",
    story="Total views of a video at the end of each day after it was posted. Which log button makes the points line up?"))
x = np.array([0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.5, 1.8, 2.0])
lin.append(dict(key="pow", label="Pendulum", sub="Power", xv="L", yv="T", xname="length, $L$ (m)", yname="period, $T$ (s)",
    x=x.tolist(), y=sets[3]["y"], straight="xy",
    story="The period of a pendulum for nine lengths of string. This one needs both buttons."))
x = np.array([1, 2, 4, 7, 10, 15, 20, 30, 40.])
lin.append(dict(key="log", label="Vocabulary", sub="Logarithmic", xv="m", yv="W", xname="study time, $m$ (minutes)", yname="words remembered, $W$",
    x=x.tolist(), y=noisy(lambda m: 5 + 14 * np.log(m), x, 0.8), straight="x",
    story="Words a student remembers after studying a list for different lengths of time. Here only one of the logs helps."))
check["linearise"] = {}
for d in lin:
    X, Y = np.array(d["x"]), np.array(d["y"])
    check["linearise"][d["key"]] = {k: float(np.corrcoef(a, b)[0, 1]) for k, (a, b) in
        {"none": (X, Y), "x": (np.log(X), Y), "y": (X, np.log(Y)), "xy": (np.log(X), np.log(Y))}.items()}

# ---------- SL 4.10: Pearson versus Spearman presets ----------
ps = [
    dict(label="Linear", sub="straight-line pattern", pts=[[1, 1.6], [2, 2.1], [3, 3.4], [4, 3.6], [5, 5.0], [6, 5.4], [7, 6.9], [8, 7.3]],
         story="A straight-line pattern: $r$ and $r_s$ are both close to 1."),
    dict(label="Curved", sub="typing practice", pts=[[1, 9.0], [2, 6.6], [3, 5.1], [4, 5.1], [5, 3.6], [6, 3.0], [8, 2.7], [10, 2.4]],
         story="Hours of typing practice (across) and errors in a test (up), as on the SL 4.10 worked example. Always decreasing, but curved."),
    dict(label="Outlier", sub="one extreme point", pts=[[1, 1.0], [2, 1.4], [3, 1.9], [4, 2.3], [5, 2.6], [6, 3.1], [7, 3.5], [8, 9.6]],
         story="Seven points on a rising line and one extreme point. $r$ drops because the point is far from the line; $r_s$ stays at 1 because the point is still ranked last. Drag it below its neighbours and watch $r_s$ move."),
    dict(label="U shape", sub="not monotonic", pts=[[1, 8.0], [2, 5.6], [3, 3.7], [4, 2.6], [5, 2.5], [6, 3.6], [7, 5.4], [8, 7.9]],
         story="Falls, then rises. Neither coefficient sees this pattern."),
]
check["pearson-spearman"] = {p["label"]: dict(r=float(np.corrcoef(*zip(*p["pts"]))[0, 1]),
                                              rs=float(stats.spearmanr(*zip(*p["pts"])).statistic)) for p in ps}

cfg = {
 "SL 4.4": [dict(id="sl44-exp-1", explorer="correlation-slider",
    intro="Set a correlation and the page draws 20 students with exactly that $r$. The regression line always passes through the mean point $(\\bar{x},\\bar{y})$.",
    story="Twenty students: hours of revision (across) and test score out of 100 (up).",
    xname="revision, $h$ (hours)", yname="score, $S$", xv="h", yv="S", n=20, xMean=6.5, xSd=2.6, yMean=64, ySd=11,
    presets=[dict(label="Strong +", r=0.9), dict(label="Moderate +", r=0.6), dict(label="None", r=0), dict(label="Strong −", r=-0.85)])],
 "SL 4.10": [dict(id="sl410-exp-1", explorer="pearson-spearman",
    intro="Click the grid to add a point; drag a point to move it. Compare Pearson's $r$, which measures a straight line, with Spearman's $r_s$, which only asks whether the pattern always rises or always falls.",
    presets=ps)],
 "AHL 4.13": [dict(id="ahl413-exp-1", explorer="model-choice",
    intro="Pick a data set, then try models. Each fit shows $R^2$, $SS_{res}$, and the MSE. Decide which model you would use before you press Reveal.",
    sets=sets),
   dict(id="ahl413-exp-2", explorer="linearise",
    intro="Take logs of one or both variables and watch the axes pull in. When the points fall on a straight line, the line's equation turns back into the model.",
    sets=lin)],
}
json.dump(cfg, open(here / "explorers-topic4.json", "w"), indent=1, ensure_ascii=False)
json.dump(check, open(here / "explorer-check.json", "w"), indent=1)
for k, v in check["model-choice"].items():
    print(k, {m: round(x["r2"], 4) for m, x in v.items()})
print({k: {a: round(b, 4) for a, b in v.items()} for k, v in check["linearise"].items()})
print({k: {a: round(b, 4) for a, b in v.items()} for k, v in check["pearson-spearman"].items()})
