"""Pilot content for the IB MAI Hub code pages: SL 4.4, SL 4.10, AHL 4.13.
Every number in a worked example is computed here, not typed.
Writes pilot.json (all statements, status draft) for the review artifact."""
import json
import numpy as np
from scipy import stats

R = lambda v, s=3: float(f"{v:.{s}g}")
F = lambda v: np.format_float_positional(float(v), precision=3, unique=False, fractional=False, trim="k").rstrip(".")

# ---------- computed worked examples ----------
# SL 4.4: revision hours vs test score
hx = np.array([2, 3, 5, 6, 8, 9, 11, 12.]); hy = np.array([48, 55, 58, 66, 70, 77, 80, 88.])
r44 = np.corrcoef(hx, hy)[0, 1]; a44, b44 = np.polyfit(hx, hy, 1)
p10 = a44 * 10 + b44; p20 = a44 * 20 + b44
# SL 4.10: practice hours vs typing errors
px = np.array([1, 2, 3, 4, 5, 6, 8, 10.]); py = np.array([30, 22, 17, 17, 12, 10, 9, 8.])
rkx, rky = stats.rankdata(px), stats.rankdata(py)
rs410 = np.corrcoef(rkx, rky)[0, 1]; r410 = np.corrcoef(px, py)[0, 1]
# AHL 4.13: video views by day
t = np.arange(1, 8.); v = np.array([120, 190, 310, 480, 790, 1240, 2010.])
B, A = np.polyfit(t, np.log(v), 1); ea, eb = np.exp(A), np.exp(B)
R2exp = np.corrcoef(t, np.log(v))[0, 1] ** 2; R2lin = np.corrcoef(t, v)[0, 1] ** 2
d10 = ea * eb ** 10

assert abs(R(r44) - 0.988) < 1e-9 and abs(R(rs410) + 0.994) < 1e-9

def tbl(rows):
    return rows

STRUCTURE = [
    # id, section, Learn, Revise, note
    ("video", "Video with timestamped key moments", True, False, "One or more videos per code; codes without a video still get a page."),
    ("ican", "I can… checklist", True, True, "The spine of Revise mode. Students tick items; ticks stay in their browser."),
    ("ku", "Key understandings", True, True, "4 to 6 statements, each one sentence or two."),
    ("visuals", "Key visuals (carousel with commentary)", True, False, "Static house-style figures that tell a story; reuse deck animations where they exist."),
    ("map", "Where it fits (mind map)", True, False, "Generated linked-bubble map in the IB mind-map style, per topic cluster, this code highlighted."),
    ("misc", "Misconceptions (weak answer, better answer)", True, True, "Grounded in markscheme notes and syllabus guidance."),
    ("terms", "Command terms and answer wording", True, True, "What the command terms demand for this code."),
    ("formula", "Formula booklet pointer", True, True, "What is given, what is not, what the GDC does."),
    ("gdc", "GDC steps (fx-CG50)", True, True, "Real emulator captures with lit keys; verified key paths only."),
    ("worked", "Worked example (model solution)", True, True, "Original question, mark-style steps."),
    ("kq", "Key questions (explain why)", True, True, "Conceptual prompts with a model answer behind a reveal."),
    ("history", "History note", True, False, "Optional; only where it earns its place; every claim sourced."),
    ("explorer", "Explorer", True, False, "Optional per topic; needs discussion and approval before building."),
]

def items(prefix, rows):
    out = [dict(id=f"{prefix}-{i+1}", **r) for i, r in enumerate(rows)]
    return [r for r in out if not r.get("cut")]  # ids stay stable when an item is cut

CODES = []

# ======================= SL 4.4 =======================
CODES.append(dict(
    code="SL 4.4", slug="sl-4-4", title="Correlation and linear regression", level="SL",
    videos=[{"n": 405, "title": "Independent & Dependent Variables, Scatter Plots"},
            {"n": 406, "title": "Correlation: Pearson's & Spearman's", "partial": True},
            {"n": 407, "title": "Line of Regression Equation (& Reliability)"}],
    sections=dict(
        ku=items("sl44-ku", [
            {"text": "Pearson's $r$ measures the strength and direction of a <b>linear</b> relationship only. It runs from $-1$ to $1$, and its value says nothing about a curved pattern."},
            {"text": "A strong correlation shows that two variables move together, not that one causes the other. A third variable, or coincidence, can produce the same pattern."},
            {"text": "The regression line of $y$ on $x$ makes the sum of the squared vertical distances from the points as small as possible. It always passes through the mean point $(\\bar{x},\\bar{y})$."},
            {"text": "In $y=ax+b$, the gradient $a$ is the change in $y$ for each one-unit increase in $x$, in context and with units. The intercept $b$ is the predicted $y$ when $x=0$, which is often outside the data and meaningless."},
            {"text": "A prediction is trustworthy only when $|r|$ is strong and the $x$-value lies inside the data (interpolation). Predicting outside the data (extrapolation) is unreliable."},
            {"text": "The $y$-on-$x$ line predicts $y$ from $x$. It is the wrong tool for predicting $x$ from a given $y$."},
        ]),
        ican=items("sl44-ican", [
            {"text": "I can describe a scatter diagram by direction, strength, form, and any outliers."},
            {"text": "I can draw a line of best fit by eye through the mean point."},
            {"text": "I can find $r$ and the regression line on my GDC and write them to 3 significant figures, as an equation in the question's variables."},
            {"text": "I can interpret $r$, the gradient, and the intercept in the context of the question, with units."},
            {"text": "I can use the regression line to predict, and say whether the prediction is reliable and why."},
            {"text": "I can explain why correlation does not show causation, using the context."},
        ]),
        misc=items("sl44-misc", [
            {"weak": "\"$r=0.15$, so there is no relationship between the variables.\"",
             "better": "There is very weak <b>linear</b> correlation. The variables could still be related in a non-linear way, so look at the scatter diagram.",
             "why": "Syllabus guidance: $r$ is only meaningful for linear relationships. Markschemes credit \"$r$ only measures linear correlation\" as a reason."},
            {"weak": "\"$r=0.95$, so more revision causes higher scores.\"",
             "better": "There is strong positive linear correlation between revision time and score. This does not show that revision causes the higher scores.",
             "why": "Correlation versus causation is named in the syllabus guidance and is a common one-mark \"explain\" or \"give a reason\" part."},
            {"weak": "Using the $y$-on-$x$ line to estimate $x$ from a given $y$.",
             "better": "Use the $x$-on-$y$ line (swap the lists on the GDC), or state that the $y$-on-$x$ line is not reliable for this.",
             "why": "Syllabus guidance. One markscheme awards a mark for saying it is unreliable to use the $y$-on-$x$ equation to estimate $x$."},
            {"weak": "Predicting at an $x$-value far outside the data and trusting the answer.",
             "better": "Note that the value is outside the data range, so the prediction is an extrapolation and may not be reliable.",
             "why": "The danger of extrapolation is in the syllabus guidance and is credited as a reason in markschemes."},
            {"weak": "Writing the regression result as \"$3.72x+41.7$\", or truncating $0.8539$ to $0.853$.",
             "better": "Write a full equation in the question's variables, such as $S=3.72h+41.7$, and round correctly to 3 s.f.",
             "why": "Markschemes often hold back an answer mark when the result is not an equation, and some reserve a mark for the correct variables. Truncated or wrongly rounded values can lose the answer mark."},
            {"weak": "\"The gradient 3.72 means the score is 3.72.\"",
             "better": "On average, the score increases by about 3.72 marks for each extra hour of revision.",
             "why": "Interpreting a parameter needs the rate, both variables, and units. Markschemes accept \"rate of change\" wording."},
        ]),
        terms=items("sl44-term", [
            {"term": "Write down", "text": "Read the value from the GDC; no working is needed, but the value must be correct to 3 s.f."},
            {"term": "Interpret", "text": "Say what the value means for these variables, in context: name both variables, the direction, and the units."},
            {"term": "State / Give a reason", "text": "One clear reason tied to the data or context, such as \"the $x$-value is outside the data range\"."},
            {"term": "Explain / Justify", "text": "A reason that refers to the value, for example \"since $r=0.854$ is close to 1, the line is suitable for prediction\"."},
        ]),
        formula=items("sl44-form", [
            {"text": "Nothing for this code is in the formula booklet. Find $r$ and the line with the GDC."},
            {"text": "When a question needs a critical value of $r$, the question gives it."},
        ]),
        gdc=items("sl44-gdc", [
            {"text": "Open Statistics: [MENU] [2]. Enter $x$ in List 1 and $y$ in List 2.", "verified": True},
            {"text": "Check the lists: [F2] CALC, [F6] SET: 2Var XList = List1, 2Var YList = List2, then [EXIT].", "verified": True},
            {"text": "Regression: [F3] REG, [F1] X, [F1] ax+b. Read $a$, $b$, $r$ and $r^2$.", "verified": True},
            {"text": "Predict: in Run-Matrix, type the $x$-value, then [OPTN] [F5] STAT [F2] $\\hat{y}$ [EXE]. It uses the last regression.", "verified": True},
            {"text": "$x$ on $y$: in SET, swap the lists (XList = List2, YList = List1), then REG again. Put the lists back afterwards.", "verified": True},
        ]),
        worked=dict(id="sl44-we",
            prompt="Eight students recorded their revision time, $h$ hours, and their test score, $S$ (out of 100).",
            table=[["$h$"] + [f"{int(x)}" for x in hx], ["$S$"] + [f"{int(y)}" for y in hy]],
            parts=[
                {"label": "(a)", "q": "Find Pearson's product-moment correlation coefficient, $r$.", "marks": 2,
                 "a": f"$r={R(r44):.3f}$ $({r44:.6f}\\ldots)$", "m": "A2"},
                {"label": "(b)", "q": "Find the equation of the regression line of $S$ on $h$.", "marks": 2,
                 "a": f"$S={F(a44)}h+{F(b44)}$", "m": "A1A1 (A1 for each coefficient; needs an equation in $S$ and $h$)"},
                {"label": "(c)", "q": "Interpret the gradient in context.", "marks": 1,
                 "a": f"On average, the score rises by about {F(a44)} marks for each extra hour of revision.", "m": "R1"},
                {"label": "(d)", "q": "Use your line to estimate the score of a student who revised for 10 hours.", "marks": 2,
                 "a": f"${F(a44)}\\times10+{F(b44)}$, so $S\\approx{F(p10)}$", "m": "(M1)A1"},
                {"label": "(e)", "q": "Comment on using the line for a student who revised for 20 hours.", "marks": 1,
                 "a": f"Not reliable: 20 is outside the data range (extrapolation). The line gives {F(p20)}, which is more than the maximum score of 100.", "m": "R1"},
            ]),
        kq=items("sl44-kq", [
            {"q": "Why can $r$ be close to 0 even when $y$ depends strongly on $x$?",
             "model": "Because $r$ only measures how close the points are to a straight line. A strong curved pattern, such as a U shape, can give $r$ near 0."},
            {"q": "Why is the $y$-on-$x$ line not the best line for predicting $x$ from $y$?",
             "model": "It is chosen to make the vertical (y) errors small. Predicting $x$ needs the horizontal errors small, which gives a different line unless $r=\\pm1$."},
            {"q": "A town finds $r=0.9$ between ice-cream sales and swimming accidents. Why should it not ban ice cream?",
             "model": "Both rise in hot weather. Temperature is a third variable that drives both, so the correlation does not show that ice cream causes accidents."},
            {"q": "Why does the regression line always pass through $(\\bar{x},\\bar{y})$?",
             "model": "The least-squares line balances the points above and below it, so the residuals sum to zero. That only happens when the line goes through the mean point."},
        ]),
        visuals=items("sl44-vis", [
            {"text": "Scatter of the revision data with the mean point marked and the regression line through it. Caption: the line is pinned at $(\\bar{x},\\bar{y})$."},
            {"text": "Four small scatters with the same $r$ but very different shapes (one curved, one with an outlier). Caption: always look at the picture before trusting $r$."},
            {"text": "The same line with vertical residual segments drawn. Caption: least squares makes these vertical gaps, squared, as small as possible."},
            {"text": "The line extended past the data, with the data range shaded. Caption: inside is interpolation; outside is extrapolation and the line gives an impossible score."},
            {"text": "A three-box diagram: temperature pointing to both ice-cream sales and swimming accidents. Caption: correlation without causation."},
        ]),
        map=dict(id="sl44-map",
            needs=[["SL 2.1", "Gradient and intercept of a straight line"], ["SL 4.3", "Mean of a data set"]],
            leadsTo=[["SL 4.10", "Spearman's rank correlation"], ["AHL 4.13", "Non-linear regression and $R^2$"], ["AHL 4.18", "Testing whether $\\rho=0$"], ["AHL 2.10", "Linearising data with logarithms"]],
            withIn=[["SL 2.5", "Modelling with functions"], ["SL 2.6", "Modelling skills"]]),
        history=items("sl44-hist", [
            {"text": "The word <i>regression</i> comes from Francis Galton. In 1886 he compared the heights of adult children with their parents' average height and found that children of very tall or very short parents tended to be closer to the average. He called this \"regression towards mediocrity\"; today we say regression towards the mean.",
             "sources": [["Galton (1886), Regression Towards Mediocrity in Hereditary Stature", "https://zenodo.org/record/1449548/files/article.pdf"],
                         ["Bland (2017), Regression toward the mean, SAGE", "https://eprints.whiterose.ac.uk/id/eprint/118488/"]]},
            {"text": "Karl Pearson published his correlation coefficient in 1896, building on Galton's ideas and on earlier work by the French physicist Auguste Bravais.",
             "sources": [["Britannica: Pearson's correlation coefficient", "https://www.britannica.com/topic/Pearsons-correlation-coefficient"]]},
            {"text": "Galton and Pearson both promoted eugenics. The tools they built outlived that purpose, and the history is a good case for the TOK question of how knowledge is used.",
             "sources": [["Britannica: Pearson's correlation coefficient (Galton as eugenicist)", "https://www.britannica.com/topic/Pearsons-correlation-coefficient"], ["Variances (2026), history of correlation (Pearson and eugenics, in French)", "https://variances.eu/wp-content/uploads/2026/04/Variances-Correlation-VF.pdf"]]},
        ]),
    )))

# ======================= SL 4.10 =======================
CODES.append(dict(
    code="SL 4.10", slug="sl-4-10", title="Spearman's rank correlation", level="SL",
    videos=[{"n": 406, "title": "Correlation: Pearson's & Spearman's"}],
    sections=dict(
        ku=items("sl410-ku", [
            {"text": "Spearman's $r_s$ is Pearson's $r$ calculated on the ranks of the data instead of the values."},
            {"text": "$r_s$ measures how <b>monotonic</b> a relationship is: whether $y$ always rises (or always falls) as $x$ rises, straight line or not."},
            {"text": "Tied values share the average of the ranks they would take. Two values tied for 5th and 6th both get rank 5.5."},
            {"text": "$r_s$ is less sensitive to outliers than $r$, because an extreme value can only move to the end of the ranking."},
            {"text": "Changing a value without changing its rank leaves $r_s$ unchanged."},
            {"text": "Use $r$ for a linear relationship between measurements. Use $r_s$ for ranked data, a curved but monotonic pattern, or data with outliers."},
        ]),
        ican=items("sl410-ican", [
            {"text": "I can rank two variables in the same direction and average the ranks of tied values."},
            {"text": "I can find $r_s$ on my GDC by finding $r$ for the two lists of ranks."},
            {"text": "I can interpret $r_s$ in context, as an association between the ranks."},
            {"text": "I can give a mathematical reason to choose $r_s$ over $r$, or $r$ over $r_s$."},
            {"text": "I can decide whether changing one data value changes $r_s$."},
        ]),
        misc=items("sl410-misc", [
            {"weak": "\"$r_s=-0.994$, so there is a strong negative linear correlation between practice hours and errors.\"",
             "better": "$r_s=-0.994$ shows a strong negative association between the <b>ranks</b>: students who practise more tend to make fewer errors.",
             "why": "Markschemes have refused interpretations that are not stated in terms of the ranks, and have said \"strong positive\" alone is not enough."},
            {"weak": "Giving two tied values the same lower rank (both 5), then carrying on from 6.",
             "better": "Average the ranks they would take: both get 5.5, and the next value is 7.",
             "why": "Syllabus guidance: if data items are equal, ranks are averaged."},
            {"weak": "Ranking one variable from largest to smallest and the other from smallest to largest.",
             "better": "Rank both variables in the same direction. Reversing one ranking flips the sign of $r_s$.",
             "why": "Reversing only one ranking gives the wrong sign, and markschemes take a mark off for a missing negative sign."},
            {"cut": True, "weak": "Using $r_s=1-\\dfrac{6\\sum d^2}{n(n^2-1)}$ when there are tied ranks.",
             "better": "Find $r$ for the two rank lists on the GDC. The $\\sum d^2$ formula is exact only when there are no ties.",
             "why": "The syllabus says $r_s$ is found with technology. A markscheme noted a slightly different value from the formula when ties were present."},
            {"weak": "\"An outlier will change $r_s$ a lot.\"",
             "better": "An outlier changes $r_s$ only through its rank, so $r_s$ is less affected than $r$.",
             "why": "Syllabus guidance; also credited as a reason for choosing Spearman's."},
        ]),
        terms=items("sl410-term", [
            {"term": "Complete", "text": "Fill in the ranks as given in the table layout; ties averaged."},
            {"term": "Interpret", "text": "Name both variables, the direction, and refer to their ranks."},
            {"term": "Suggest / Explain", "text": "One mathematical reason, such as non-linear pattern or an outlier, tied to these data."},
        ]),
        formula=items("sl410-form", [
            {"text": "Nothing for this code is in the formula booklet. Find $r_s$ with the GDC."},
            {"cut": True, "text": "The $\\sum d^2$ formula is not in the syllabus. It can be used only when there are no ties."},
        ]),
        gdc=items("sl410-gdc", [
            {"text": "Rank both variables by hand, averaging ties. Enter the ranks in List 3 and List 4.", "verified": True},
            {"text": "[F2] CALC, [F6] SET: 2Var XList = List3, 2Var YList = List4, [EXIT].", "verified": True},
            {"text": "[F3] REG, [F1] X, [F1] ax+b. The value of $r$ shown is $r_s$.", "verified": True},
            {"text": "The fx-CG50 has no built-in Spearman's function, so ranking is always by hand.", "verified": False, "flag": "Check on the emulator or manual."},
            {"text": "Put back: set 2Var XList = List1 and 2Var YList = List2.", "verified": True},
        ]),
        worked=dict(id="sl410-we",
            prompt="A typing teacher records the hours of practice, $h$, and the number of errors, $E$, in a test for eight students.",
            table=[["$h$"] + [f"{int(x)}" for x in px], ["$E$"] + [f"{int(y)}" for y in py]],
            parts=[
                {"label": "(a)", "q": "Rank both variables from smallest to largest.", "marks": 2,
                 "a": "$h$: " + ", ".join(f"{x:g}" for x in rkx) + ". $E$: " + ", ".join(f"{x:g}" for x in rky) + " (the two 17s share rank 5.5).", "m": "A1A1"},
                {"label": "(b)", "q": "Find Spearman's rank correlation coefficient, $r_s$.", "marks": 2,
                 "a": f"$r_s={R(rs410):.3f}$ $({rs410:.6f}\\ldots)$", "m": "A2"},
                {"label": "(c)", "q": "Interpret this value in context.", "marks": 1,
                 "a": "Strong negative association between the ranks: students who practise more tend to make fewer errors.", "m": "R1"},
                {"label": "(d)", "q": f"Pearson's $r$ for these data is ${R(r410):.3f}$. Suggest why $r_s$ is the better measure here.", "marks": 1,
                 "a": "The errors fall quickly at first and then level off, so the pattern is curved but always decreasing. $r_s$ measures a monotonic relationship; $r$ only a linear one.", "m": "R1"},
            ]),
        kq=items("sl410-kq", [
            {"q": "The top score in a data set is lowered by 20, but it is still the top score. Why does $r_s$ not change?",
             "model": "$r_s$ depends only on the ranks. The value changed, but its rank did not, so every rank and $r_s$ stay the same."},
            {"q": "Describe data where $r_s=1$ but $r<1$.",
             "model": "Any relationship that always increases but is curved, such as $y=x^2$ for positive $x$. The ranks match perfectly, but the points are not on a straight line."},
            {"q": "Why does a U-shaped relationship give $r_s$ close to 0?",
             "model": "The pattern falls then rises, so it is not monotonic. High ranks of $x$ pair with both high and low ranks of $y$, and the effect cancels."},
        ]),
        visuals=items("sl410-vis", [
            {"text": f"The typing data: a curved, decreasing scatter. Caption: $r={R(r410):.3f}$ but $r_s={R(rs410):.3f}$; the pattern is monotonic, not linear."},
            {"text": "The same scatter plotted as rank against rank. Caption: ranking straightens a monotonic pattern."},
            {"text": "One point dragged far out as an outlier, with $r$ and $r_s$ before and after. Caption: $r$ moves a lot, $r_s$ barely moves."},
            {"cut": True, "text": "A U-shaped scatter. Caption: neither coefficient sees this pattern; both are near 0."},
        ]),
        map=dict(id="sl410-map",
            needs=[["SL 4.4", "Pearson's correlation"], ["SL 4.1", "Outliers"]],
            leadsTo=[["AHL 4.12", "Reliability and validity"], ["AHL 4.18", "Testing correlation"]],
            withIn=[["SL 4.4", "Choosing between $r$ and $r_s$"]]),
        history=items("sl410-hist", [
            {"text": "Charles Spearman, an English psychologist, introduced his rank method in 1904 in \"The proof and measurement of association between two things\", written while he was still a graduate student. The same year he published his theory of general intelligence.",
             "sources": [["Spearman (1904), American Journal of Psychology 15(1), doi:10.2307/1412159", "https://bibbase.org/network/publication/spearman-theproofandmeasurementofassociationbetweentwothings-1904"],
                         ["Revelle, Charles Spearman (profile)", "https://www.personality-project.org/revelle/publications/spearman.pdf"]]},
        ]),
    )))

# ======================= AHL 4.13 =======================
CODES.append(dict(
    code="AHL 4.13", slug="ahl-4-13", title="Non-linear regression and R squared", level="AHL",
    videos=[{"n": 408, "title": "Coefficient of Determination"}, {"n": 409, "title": "Non-Linear Regression"}],
    sections=dict(
        ku=items("ahl413-ku", [
            {"text": "The GDC fits a least-squares curve for linear, quadratic, cubic, exponential, power, and sine models. The shape of the data and the context decide which to try."},
            {"text": "A residual is observed minus predicted. The sum of square residuals, $SS_{res}$, measures how far the data are from the model: smaller is a closer fit to the same data."},
            {"text": "$R^2$ is the proportion of the variation in $y$ that the model accounts for. For a linear model, $R^2=r^2$."},
            {"text": "A high $R^2$ alone does not choose a model. Check how the model behaves in context: outside the data, at $t=0$, and in the long run."},
            {"cut": True, "text": "Adding terms (linear to quadratic to cubic) can never lower $R^2$ on the same data, so $R^2$ cannot fairly compare models with different numbers of parameters."},
            {"text": "Logarithms straighten some curves: if $\\ln y$ against $x$ is linear, the model is exponential; if $\\ln y$ against $\\ln x$ is linear, it is a power model."},
        ]),
        ican=items("ahl413-ican", [
            {"text": "I can choose a regression model from the shape of a scatter diagram and the context."},
            {"text": "I can find a non-linear model on my GDC and write it as an equation in the question's variables."},
            {"text": "I can find $R^2$ and interpret it as a percentage of the variation explained."},
            {"text": "I can calculate $SS_{res}$ from a table of observed and predicted values."},
            {"text": "I can compare two models with $R^2$ or $SS_{res}$ and give a reason from the context."},
            {"text": "I can turn a linearised equation, such as $\\ln y=m\\ln x+c$, back into a model for $y$."},
        ]),
        misc=items("ahl413-misc", [
            {"weak": "\"$R^2=0.86$, so the model is 86% accurate.\"",
             "better": "About 86% of the variation in $y$ is explained by $x$.",
             "why": "The syllabus defines $R^2$ as a proportion of variability; markschemes credit the percentage-of-variation wording or a comparison with 1."},
            {"weak": "\"The quadratic has the higher $R^2$, so it is the best model.\"",
             "better": "The quadratic fits these data more closely, but check the context: it predicts a negative population before the data begin, so it is not realistic there.",
             "why": "Syllabus guidance: $R^2$ by itself is not a good way to choose between models. Markschemes reward a contextual reason against a model."},
            {"weak": "Comparing $R^2$ for the exponential model with $r$ for the linear model.",
             "better": "Compare like with like: $R^2$ with $r^2$ (or $R$ with $r$).",
             "why": "A markscheme gave the reasoning mark only for an unambiguous comparison of $R^2$ with $r^2$."},
            {"weak": "Using two values from the data table to find a doubling time or rate.",
             "better": "Use the model equation, since the question asks what the model predicts.",
             "why": "Markschemes give no credit for a doubling time worked out from table values instead of the model."},
            {"weak": "Fitting the model to the raw variable when the question defines a shifted one, such as years since 1900 or temperature above room temperature.",
             "better": "Read how each variable is defined and transform the data before the regression.",
             "why": "Markschemes have penalised or adjusted marks when the shift was not applied."},
            {"weak": "Forgetting to square residuals, or using predicted minus observed and then dropping negatives.",
             "better": "$SS_{res}=\\sum(y_{\\text{observed}}-y_{\\text{model}})^2$: square every residual, then add.",
             "why": "Calculating a squared residual is a method mark in markschemes that ask for $SS_{res}$."},
        ]),
        terms=items("ahl413-term", [
            {"term": "Find (a model)", "text": "Give the full equation with coefficients to 3 s.f., in the question's variables."},
            {"term": "Comment on", "text": "Make a judgement and back it with a value or the context, for example \"$R^2=0.988$ is close to 1, so a good fit\"."},
            {"term": "Suggest", "text": "A reasonable idea from the context, such as why a model fails for large $t$."},
            {"term": "Hence", "text": "Use the model just found; another method may score nothing."},
        ]),
        formula=items("ahl413-form", [
            {"text": "Nothing for this code is in the formula booklet. Models and $R^2$ come from the GDC."},
            {"text": "$R^2=1-\\dfrac{SS_{res}}{SS_{tot}}$ may help understanding but is not examined."},
        ]),
        gdc=items("ahl413-gdc", [
            {"text": "Enter $x$ in List 1 and $y$ in List 2; check SET as for linear regression.", "verified": True},
            {"text": "Quadratic: [F2] CALC, [F3] REG, [F3] X². Read $a$, $b$, $c$ and $R^2$.", "verified": False, "flag": "X² key verified; result screen not yet captured."},
            {"text": "Exponential, power, sine, logistic: [F3] REG then the next page of the menu ([F6] ▷) for Exp, Pwr, Sin, Lgst.", "verified": False, "flag": "Key names and page not yet verified on the emulator."},
            {"text": "Exponential has two forms on the fx-CG50 ($ae^{bx}$ and $ab^x$); pick the one the question uses.", "verified": False, "flag": "Check menu names."},
        ]),
        worked=dict(id="ahl413-we",
            prompt="A video's total views, $V$, are recorded at the end of each day, $t$, after it is posted.",
            table=[["$t$"] + [f"{int(x)}" for x in t], ["$V$"] + [f"{int(y)}" for y in v]],
            parts=[
                {"label": "(a)", "q": "Find an exponential model of the form $V=ab^t$.", "marks": 2,
                 "a": f"$V={F(ea)}\\times{F(eb)}^t$", "m": "A1A1"},
                {"label": "(b)", "q": "Write down $R^2$ for this model and interpret it.", "marks": 2,
                 "a": f"$R^2={R2exp:.4f}$; about {100*R2exp:.2f}% of the variation in views, $V$, is explained by the number of days, $t$.", "m": "A1R1"},
                {"label": "(c)", "q": f"For a linear model, $R^2={R(R2lin):.3f}$. State which model fits better, with a reason.", "marks": 1,
                 "a": "Exponential: its $R^2$ is closer to 1, and the views grow by about the same factor each day.", "m": "R1"},
                {"label": "(d)", "q": "Use the exponential model to estimate the views at the end of day 10, and comment on the estimate.", "marks": 3,
                 "a": f"$V\\approx{F(d10)}$ (M1A1). This is an extrapolation, and views cannot keep growing by 60% a day forever, so the estimate may be too high (R1).", "m": "(M1)A1R1"},
            ]),
        kq=items("ahl413-kq", [
            {"cut": True, "q": "Why can a quadratic model never have a lower $R^2$ than a linear model on the same data?",
             "model": "A linear model is a quadratic with $a=0$. The quadratic fit can always do at least as well by choosing $a=0$, so its errors cannot be larger."},
            {"q": "Why might the model with the lower $R^2$ be the better choice?",
             "model": "It may behave sensibly in context, for example level off at a carrying capacity, while the higher-$R^2$ model predicts something impossible outside the data."},
            {"q": "What does $SS_{res}=0$ mean, and why is it rarely good news with real data?",
             "model": "The model passes through every point. Real data contain noise, so a model that fits every point exactly is usually chasing the noise and predicts badly."},
            {"q": "Why does a straight line on a graph of $\\ln y$ against $x$ point to an exponential model?",
             "model": "If $y=ab^x$ then $\\ln y=\\ln a+x\\ln b$, which is linear in $x$ with gradient $\\ln b$ and intercept $\\ln a$."},
        ]),
        visuals=items("ahl413-vis", [
            {"text": "The views data with a linear and an exponential fit, residuals drawn as squares. Caption: the exponential model's squares are tiny; that is $SS_{res}$."},
            {"text": "Two bars: total variation $SS_{tot}$ and leftover variation $SS_{res}$. Caption: $R^2$ is the part of the bar the model explains."},
            {"text": "A quadratic and a logistic model on population data, extended past the data. Caption: high $R^2$, but only one makes sense in the long run."},
            {"text": "The views data replotted as $\\ln V$ against $t$. Caption: the curve becomes a straight line."},
        ]),
        map=dict(id="ahl413-map",
            needs=[["SL 4.4", "Linear regression and $r$"], ["SL 2.5", "Linear, quadratic, exponential models"], ["AHL 2.9", "Logistic, sinusoidal, logarithmic models"]],
            leadsTo=[["AHL 2.10", "Linearising with logarithms"], ["SL 2.6", "Testing and reflecting on a model"]],
            withIn=[["SL 1.3", "Geometric sequences (syllabus link)"]]),
        history=items("ahl413-hist", [
            {"text": "Adrien-Marie Legendre published the method of least squares in 1805, in an appendix to a book on comet orbits. In 1809 Carl Friedrich Gauss wrote that he had used it since 1795, which began one of the most famous priority disputes in mathematics.",
             "sources": [["MacTutor (St Andrews): Legendre", "https://mathshistory.st-andrews.ac.uk/BEA/legendre_bea.pdf"],
                         ["Stigler, Gauss and the invention of least squares", "https://economia.uniroma2.it/corso/asset/YTo0OntzOjI6ImlkIjtzOjQ6IjI2OTIiO3M6MzoiaWRhIjtzOjU6IjgxNDkzIjtzOjI6ImVtIjtOO3M6MToiYyI7czo1OiJjMDhmZCI7fQ=="]]},
        ]),
    )))

EXPLORERS = {
 "SL 4.4": [dict(id="sl44-exp-1", name="Correlation slider",
   spec="A slider sets the target $r$ from $-1$ to $1$. The page draws a scatter with that correlation, its regression line, and the mean point $(\\bar{x},\\bar{y})$ marked on the line. Readouts: $r$, the equation $y=ax+b$, $\\bar{x}$, and $\\bar{y}$.",
   suggest="A New data button keeps $r$ but redraws the points, so students see the line always passes through the mean point.")],
 "SL 4.10": [dict(id="sl410-exp-1", name="Pearson versus Spearman",
   spec="Students click to add or drag points. The page shows $r$ and $r_s$ live. A Linear toggle draws the line of best fit. A Monotonic toggle joins the points in $x$ order and labels the pattern increasing, decreasing, or neither.",
   suggest="Optionally show the rank table beside the plot, so students see that dragging a point without passing a neighbour leaves $r_s$ unchanged.")],
 "AHL 4.13": [dict(id="ahl413-exp-1", name="Choose the model",
   spec="Buttons for data sets 1 to 5. Students pick a model (linear, quadratic, cubic, exponential, power, sine, logistic) and see the regression curve with $R^2$, $SS_{res}$, and MSE. A Reveal button shows the best model and why.",
   suggest="Use MSE as the GDC shows it (MSe). The reveal should give a context reason, not only the highest $R^2$."),
  dict(id="ahl413-exp-2", name="Linearising data",
   spec="An ln($x$) button logs every $x$-value and rescales the $x$-axis; an ln($y$) button does the same for $y$. Students see an exponential set straighten with ln($y$) only, and a power set straighten with both, with the fitted line and its equation shown.",
   suggest="Pairs with AHL 2.10, so the same explorer could appear on that page.")],
}
for c in CODES:
    c["sections"]["explorers"] = EXPLORERS.get(c["code"], [])

CHANGED = ["ahl413-we", "ahl413-misc-1", "sl44-hist-3", "sl44-exp-1", "sl410-exp-1", "ahl413-exp-1", "ahl413-exp-2"]
out = dict(round=2, changed=CHANGED, created="2026-11-06", previous="verdicts_r1.json", structure=[dict(id=f"struct-{s[0]}", key=s[0], name=s[1], learn=s[2], revise=s[3], note=s[4]) for s in STRUCTURE], codes=CODES)
json.dump(out, open("/home/claude/work/pilot.json", "w"), indent=1, ensure_ascii=False)
print("ok", R(r44), R(a44), R(b44), R(p10), R(p20), R(rs410), R(r410), R(ea), R(eb), round(R2exp, 4), R(R2lin), R(d10))
