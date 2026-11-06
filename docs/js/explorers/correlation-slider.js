// Explorer library: correlation slider (IB MAI SL 4.4).
// A slider sets a target r. The page draws n points whose sample correlation is exactly that r, with the
// regression line of y on x and the mean point (x-bar, y-bar) marked on it. New data keeps r and redraws the points.
// Section config: intro, story, n, xMean, xSd, yMean, ySd, xname, yname, xv, yv, presets [{label, r}]
import { esc, tex } from '../util.js';
import { mean, pearson, linreg, sf } from './lib/fit.js';
import { frame, plain, INK, ACC, MID } from './lib/plot.js';

const W = 640, H = 300;

function randn() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
const standardise = (a) => { const m = mean(a), s = Math.sqrt(mean(a.map((v) => (v - m) ** 2))); return a.map((v) => (v - m) / s); };

// zx and e are fixed for one "data set"; y is built so that corr(x, y) equals r exactly.
function makeBase(n) {
  const zx = standardise(Array.from({ length: n }, randn));
  let e = Array.from({ length: n }, randn);
  const b = e.reduce((s, v, i) => s + v * zx[i], 0) / zx.reduce((s, v) => s + v * v, 0);
  e = standardise(e.map((v, i) => v - b * zx[i])); // orthogonal to zx
  return { zx, e };
}

export function renderSide(sec) {
  return `<div class="side-copy">${tex(sec.intro)}</div><div class="side-story"><div class="kicker">Story</div><div class="text" data-story>${tex(sec.story)}</div></div>`;
}

export function render(sec) {
  const presets = sec.presets.map((p, i) => `<button class="btn btn-secondary" data-preset="${i}"><span>${esc(p.label)}</span>${tex(`$r=${String(p.r).replace('-', '-')}$`)}</button>`).join('');
  return `
    <div class="explorer">
      <div class="ex-presets ex-cols-${sec.presets.length}">${presets}</div>
      <div class="ex-sliders ex-cols-2">
        <label><span>Correlation <span data-r-label></span></span><input type="range" min="-1" max="1" step="0.01" data-r></label>
        <div class="ex-actions ex-cols-2" style="align-self:end">
          <button class="btn btn-secondary" data-new>New data, same $r$</button>
          <button class="ex-mode" data-toggle-mean aria-pressed="true">Show the mean point</button>
        </div>
      </div>
      <div class="ex-chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Scatter diagram with its regression line" data-chart></svg></div>
      <div class="ex-stats ex-cols-4">
        <div class="ex-stat"><div class="label">Pearson's $r$</div><div class="value accent" data-rv></div></div>
        <div class="ex-stat"><div class="label">Regression line of $${sec.yv}$ on $${sec.xv}$</div><div class="value small" data-eq></div></div>
        <div class="ex-stat"><div class="label">$\\bar{${sec.xv}}$</div><div class="value" data-mx></div></div>
        <div class="ex-stat"><div class="label">$\\bar{${sec.yv}}$</div><div class="value" data-my></div></div>
      </div>
    </div>`;
}

export function mount(el, sec) {
  const q = (s) => el.querySelector(s);
  el.querySelectorAll('.label, [data-new]').forEach((n) => { n.innerHTML = tex(n.textContent); });
  const state = { r: sec.presets[0].r, base: makeBase(sec.n || 20), showMean: true };
  const rIn = q('[data-r]');

  function paint() {
    const { zx, e } = state.base, r = state.r, k = Math.sqrt(Math.max(0, 1 - r * r));
    const x = zx.map((z) => sec.xMean + sec.xSd * z);
    const y = zx.map((z, i) => sec.yMean + sec.ySd * (r * z + k * e[i]));
    const { a, b } = linreg(x, y), mx = mean(x), my = mean(y), rr = pearson(x, y);
    const pad = (lo, hi) => [lo - (hi - lo) * 0.08, hi + (hi - lo) * 0.08];
    const F = frame({ W, H, xr: pad(Math.min(...x), Math.max(...x)), yr: pad(Math.min(...y), Math.max(...y)), xlabel: plain(sec.xname), ylabel: plain(sec.yname) });
    let s = F.svg;
    const x0 = F.xt.lo, x1 = F.xt.hi;
    s += `<line x1="${F.X(x0)}" y1="${F.Y(a * x0 + b)}" x2="${F.X(x1)}" y2="${F.Y(a * x1 + b)}" stroke="${ACC}" stroke-width="2.5" clip-path="inset(0)"></line>`;
    x.forEach((xi, i) => { s += `<circle cx="${F.X(xi)}" cy="${F.Y(y[i])}" r="5" fill="${INK}" fill-opacity="0.85"></circle>`; });
    if (state.showMean) {
      s += `<line x1="${F.X(mx)}" y1="${F.box.T}" x2="${F.X(mx)}" y2="${H - F.box.B}" stroke="${MID}" stroke-dasharray="5 4"></line>`;
      s += `<line x1="${F.box.L}" y1="${F.Y(my)}" x2="${W - F.box.R}" y2="${F.Y(my)}" stroke="${MID}" stroke-dasharray="5 4"></line>`;
      s += `<circle cx="${F.X(mx)}" cy="${F.Y(my)}" r="8" fill="#fff" stroke="${ACC}" stroke-width="3"></circle>`;
      s += `<text x="${F.X(mx) - 12}" y="${F.Y(my) + 24}" text-anchor="end" font-size="13" font-weight="700" fill="${ACC}" stroke="#f3f2f2" stroke-width="5" paint-order="stroke">mean point</text>`;
    }
    q('[data-chart]').innerHTML = `<defs><clipPath id="cs-clip"><rect x="${F.box.L}" y="${F.box.T}" width="${W - F.box.L - F.box.R}" height="${H - F.box.T - F.box.B}"></rect></clipPath></defs>` + s.replace('clip-path="inset(0)"', 'clip-path="url(#cs-clip)"');
    rIn.value = r;
    q('[data-r-label]').innerHTML = tex(`$r=${r.toFixed(2)}$`);
    q('[data-rv]').textContent = sf(rr);
    const bb = sf(Math.abs(b));
    q('[data-eq]').innerHTML = tex(`$${sec.yv}=${sf(a).replace('−', '-')}${sec.xv}${b < 0 ? '-' : '+'}${bb}$`);
    q('[data-mx]').textContent = sf(mx);
    q('[data-my]').textContent = sf(my);
    q('[data-toggle-mean]').setAttribute('aria-pressed', String(state.showMean));
  }
  rIn.addEventListener('input', () => { state.r = +rIn.value; paint(); });
  q('[data-new]').addEventListener('click', () => { state.base = makeBase(sec.n || 20); paint(); });
  q('[data-toggle-mean]').addEventListener('click', () => { state.showMean = !state.showMean; paint(); });
  el.querySelectorAll('[data-preset]').forEach((btn) => btn.addEventListener('click', () => { state.r = sec.presets[+btn.dataset.preset].r; paint(); }));
  paint();
}
