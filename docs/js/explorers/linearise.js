// Explorer library: linearising data with logarithms (IB MAI AHL 4.13, AHL 2.10).
// An ln(x) button replaces every x-value by its natural log and an ln(y) button does the same for y. The points and the
// axes slide to their new places, so students see the scale pull in. The page fits a straight line to whatever is
// plotted, shows r for it, and turns the line back into a model for y:
//   ln y = mx + c      ->  y = e^c (e^m)^x   (exponential)
//   ln y = m ln x + c  ->  y = e^c x^m       (power)
//   y = m ln x + c     ->  logarithmic model
// Section config: intro, sets [{key, label, sub, xv, yv, xname, yname, x, y, straight, story}]; straight is
// 'x', 'y' or 'xy', the logs that make the set linear.
import { esc, tex } from '../util.js';
import { pearson, linreg, sf } from './lib/fit.js';
import { frame, plain, INK, ACC, MID, GOOD } from './lib/plot.js';

const W = 640, H = 290, MS = 550;
const t3 = (v) => sf(v).replace('−', '-');

export function renderSide(sec) {
  return `<div class="side-copy">${tex(sec.intro)}</div><div class="side-story"><div class="kicker">Story</div><div class="text" data-story>${tex(sec.sets[0].story)}</div></div>`;
}

export function render(sec) {
  const sets = sec.sets.map((s, i) => `<button class="btn btn-secondary" data-set="${i}"><span>${esc(s.label)}</span>${esc(s.sub)}</button>`).join('');
  return `
    <div class="explorer">
      <div class="ex-presets ex-cols-${sec.sets.length}">${sets}</div>
      <div class="ex-actions ex-cols-3">
        <button class="ex-mode" data-log="x" aria-pressed="false">Take ln of x</button>
        <button class="ex-mode" data-log="y" aria-pressed="false">Take ln of y</button>
        <button class="ex-mode" data-fitline aria-pressed="true">Show the straight-line fit</button>
      </div>
      <div class="ex-chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Scatter diagram that can be replotted on log scales" data-chart></svg></div>
      <div class="ex-note" data-note></div>
      <div class="ex-stats ex-cols-3">
        <div class="ex-stat"><div class="label">r for what is plotted</div><div class="value accent" data-r></div></div>
        <div class="ex-stat"><div class="label">Straight line through the plotted points</div><div class="value small" data-line></div></div>
        <div class="ex-stat"><div class="label">So the model for y is</div><div class="value small" data-model></div></div>
      </div>
    </div>`;
}

export function mount(el, sec) {
  const q = (s) => el.querySelector(s);
  const L = el.querySelectorAll('.ex-stat .label');
  L[0].innerHTML = tex('$r$ for what is plotted'); L[2].innerHTML = tex('So the model for $y$ is');
  el.querySelector('[data-log="x"]').innerHTML = tex('Take $\\ln$ of $x$');
  el.querySelector('[data-log="y"]').innerHTML = tex('Take $\\ln$ of $y$');
  const state = { set: 0, lx: false, ly: false, line: true, tx: 1, ty: 1, anim: null };
  // tx, ty run from 0 (raw) to 1 (logged) when lx, ly are on; they ease between for the slide.
  state.tx = 0; state.ty = 0;

  function coords(S) {
    const lerp = (a, b, t) => a + (b - a) * t;
    return {
      x: S.x.map((v) => lerp(v, Math.log(v), state.tx)),
      y: S.y.map((v) => lerp(v, Math.log(v), state.ty)),
    };
  }

  function paint() {
    const S = sec.sets[state.set], { x, y } = coords(S);
    const pad = (a) => { const lo = Math.min(...a), hi = Math.max(...a); return [lo - (hi - lo) * 0.08, hi + (hi - lo) * 0.08]; };
    const xl = state.lx ? `ln ${S.xv}` : plain(S.xname), yl = state.ly ? `ln ${S.yv}` : plain(S.yname);
    const F = frame({ W, H, xr: pad(x), yr: pad(y), xlabel: xl, ylabel: yl });
    let s = F.svg;
    const settled = state.anim === null;
    const r = pearson(x, y), { a: m, b: c } = linreg(x, y);
    const good = settled && Math.abs(r) > 0.995;
    if (state.line && settled) {
      s += `<defs><clipPath id="ln-clip"><rect x="${F.box.L}" y="${F.box.T}" width="${W - F.box.L - F.box.R}" height="${H - F.box.T - F.box.B}"></rect></clipPath></defs>`;
      s += `<line x1="${F.X(F.xt.lo)}" y1="${F.Y(m * F.xt.lo + c)}" x2="${F.X(F.xt.hi)}" y2="${F.Y(m * F.xt.hi + c)}" stroke="${good ? GOOD : ACC}" stroke-width="2.5" clip-path="url(#ln-clip)"></line>`;
    }
    x.forEach((xi, i) => { s += `<circle cx="${F.X(xi)}" cy="${F.Y(y[i])}" r="5.5" fill="${INK}"></circle>`; });
    q('[data-chart]').innerHTML = s;
    if (!settled) return;

    const X = state.lx ? `\\ln ${S.xv}` : S.xv, Y = state.ly ? `\\ln ${S.yv}` : S.yv;
    q('[data-r]').textContent = sf(r, 4);
    q('[data-line]').innerHTML = tex(`$${Y}=${t3(m)}${X}${c < 0 ? '-' : '+'}${sf(Math.abs(c))}$`);
    let model;
    if (state.lx && state.ly) model = `$${S.yv}=e^{${t3(c)}}${S.xv}^{${t3(m)}}=${t3(Math.exp(c))}${S.xv}^{${t3(m)}}$ (power)`;
    else if (state.ly) model = `$${S.yv}=e^{${t3(c)}}\\left(e^{${t3(m)}}\\right)^{${S.xv}}=${t3(Math.exp(c))}\\times${t3(Math.exp(m))}^{${S.xv}}$ (exponential)`;
    else if (state.lx) model = `$${S.yv}=${t3(m)}\\ln ${S.xv}${c < 0 ? '-' : '+'}${sf(Math.abs(c))}$ (logarithmic)`;
    else model = `$${S.yv}=${t3(m)}${S.xv}${c < 0 ? '-' : '+'}${sf(Math.abs(c))}$ (linear)`;
    q('[data-model]').innerHTML = tex(model);
    const want = S.straight, have = (state.lx ? 'x' : '') + (state.ly ? 'y' : '');
    q('[data-note]').innerHTML = tex(have === want
      ? `Straight: $|r|$ is very close to 1. These logs linearise the data, so the model for $${S.yv}$ is the one shown.`
      : have === '' ? 'Curved on ordinary axes. Which log, or both, will straighten it? Predict, then press.'
      : `Still curved: compare $r$ with the other choices. A straight line on these axes would mean a ${state.lx && state.ly ? 'power' : state.ly ? 'exponential' : 'logarithmic'} model.`);
    el.querySelector('[data-log="x"]').setAttribute('aria-pressed', String(state.lx));
    el.querySelector('[data-log="y"]').setAttribute('aria-pressed', String(state.ly));
    q('[data-fitline]').setAttribute('aria-pressed', String(state.line));
    el.querySelectorAll('[data-set]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.set === state.set)));
  }

  function animate() {
    const fx = state.tx, fy = state.ty, gx = state.lx ? 1 : 0, gy = state.ly ? 1 : 0, t0 = performance.now();
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    cancelAnimationFrame(state.anim);
    const step = (now) => {
      const u = reduce ? 1 : Math.min(1, (now - t0) / MS), e = u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2;
      state.tx = fx + (gx - fx) * e; state.ty = fy + (gy - fy) * e;
      if (u < 1) { state.anim = requestAnimationFrame(step); paint(); } else { state.anim = null; paint(); }
    };
    state.anim = requestAnimationFrame(step);
  }

  el.querySelectorAll('[data-log]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.log === 'x') state.lx = !state.lx; else state.ly = !state.ly; animate();
  }));
  q('[data-fitline]').addEventListener('click', () => { state.line = !state.line; paint(); });
  el.querySelectorAll('[data-set]').forEach((b) => b.addEventListener('click', () => {
    cancelAnimationFrame(state.anim);
    Object.assign(state, { set: +b.dataset.set, lx: false, ly: false, tx: 0, ty: 0, anim: null });
    const st = el.closest('.ex-wrap, section') && el.closest('.ex-wrap, section').querySelector('[data-story]');
    if (st) st.innerHTML = tex(sec.sets[state.set].story);
    paint();
  }));
  paint();
}
