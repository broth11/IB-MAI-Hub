// Explorer library: one-sample z test for a proportion.
// Draws the null distribution of p-hat (normal, centered at p0, SD from p0), shades the
// p-value tail(s) beyond the observed p-hat, and can simulate samples assuming H0 is true.
// Section config: intro, stories {key: text}, initial {n, p0, x, alt, alpha, story},
//   presets [{label, sub, n, p0, x, alt, story}]. alt is 'lt', 'gt' or 'ne'.
import { esc, tex, normalCdf } from '../util.js';

const ALTS = [['lt', '$H_a: p<p_0$'], ['gt', '$H_a: p>p_0$'], ['ne', '$H_a: p\\ne p_0$']];

export function renderSide(sec) {
  return `
    <div class="side-copy">${tex(sec.intro)}</div>
    <div class="side-story">
      <div class="kicker">Story</div>
      <div class="text" data-story>${tex(sec.stories[sec.initial.story])}</div>
    </div>`;
}

export function render(sec) {
  const presets = sec.presets.map((p, i) =>
    `<button class="btn btn-secondary" data-preset="${i}"><span>${esc(p.label)}</span>${tex(p.sub)}</button>`).join('');
  return `
    <div class="explorer">
      <div class="ex-presets ex-cols-${Math.min(sec.presets.length, 4)}">${presets}</div>
      <div class="ex-sliders">
        <label><span>Sample size <span data-n-label></span></span><input type="range" min="10" max="1000" step="1" data-n></label>
        <label><span>Null proportion <span data-p0-label></span></span><input type="range" min="0.01" max="0.99" step="0.01" data-p0></label>
        <label><span>Successes <span data-x-label></span></span><input type="range" min="0" max="1000" step="1" data-x></label>
      </div>
      <div class="ex-modes">${ALTS.map(([a, l]) => `<button class="ex-mode" data-alt="${a}" aria-pressed="false">${tex(l)}</button>`).join('')}</div>
      <div class="ex-actions ex-cols-4">
        <button class="btn btn-primary" data-sim>Simulate 1,000 samples</button>
        <button class="btn btn-secondary" data-clear>Clear simulation</button>
        <button class="ex-mode" data-alpha="0.05" aria-pressed="false">${tex('$\\alpha=0.05$')}</button>
        <button class="ex-mode" data-alpha="0.01" aria-pressed="false">${tex('$\\alpha=0.01$')}</button>
      </div>
      <div class="ex-chart"><svg viewBox="0 0 640 260" role="img" aria-label="Null distribution of the sample proportion with the p-value shaded" data-chart></svg></div>
      <div class="ex-stats ex-cols-4">
        <div class="ex-stat"><div class="label">${tex('$\\hat p=x/n$')}</div><div class="value" data-ph></div></div>
        <div class="ex-stat"><div class="label">${tex('$z=\\dfrac{\\hat p-p_0}{\\sqrt{p_0(1-p_0)/n}}$')}</div><div class="value" data-z></div></div>
        <div class="ex-stat"><div class="label">P-value</div><div class="value accent" data-pv></div></div>
        <div class="ex-stat"><div class="label">Decision</div><div class="value small" data-dec></div></div>
      </div>
    </div>`;
}

// One binomial draw by summing Bernoulli trials (n is at most 1000, so this is fast enough).
function binom(n, p) { let c = 0; for (let i = 0; i < n; i++) if (Math.random() < p) c++; return c; }

export function mount(el, sec) {
  const S = { alpha: 0.05, ...sec.initial, sims: [] };
  const q = (s) => el.querySelector(s);
  const nIn = q('[data-n]'), pIn = q('[data-p0]'), xIn = q('[data-x]');

  function calc() {
    const ph = S.x / S.n, sd = Math.sqrt((S.p0 * (1 - S.p0)) / S.n), z = (ph - S.p0) / sd;
    const pv = S.alt === 'gt' ? 1 - normalCdf(z) : S.alt === 'lt' ? normalCdf(z) : 2 * (1 - normalCdf(Math.abs(z)));
    return { ph, sd, z, pv };
  }
  const extreme = (v, ph) => (S.alt === 'gt' ? v >= ph - 1e-12 : S.alt === 'lt' ? v <= ph + 1e-12 : Math.abs(v - S.p0) >= Math.abs(ph - S.p0) - 1e-12);

  function paint() {
    S.x = Math.min(S.x, S.n);
    const { ph, sd, z, pv } = calc();
    let lo = Math.max(0, Math.min(S.p0 - 4.2 * sd, ph - sd)), hi = Math.min(1, Math.max(S.p0 + 4.2 * sd, ph + sd));
    const X0 = 20, W = 600, base = 210, top = 54;
    const xs = (v) => X0 + ((v - lo) / (hi - lo)) * W;
    const pdf = (v) => Math.exp(-(((v - S.p0) / sd) ** 2) / 2) / (sd * Math.sqrt(2 * Math.PI));
    const peak = pdf(S.p0);
    let ymax = peak;

    // Simulated histogram (density scale so it lines up with the curve).
    let simSvg = '', simText = '';
    if (S.sims.length) {
      // Bin on whole success counts (g counts per bar) so bars never alias against the 1/n grid.
      const g = Math.max(1, Math.ceil(((hi - lo) / 70) * S.n));
      const bw = g / S.n;
      const bins = {};
      S.sims.forEach((v) => { const b = Math.floor(Math.round(v * S.n) / g); bins[b] = (bins[b] || 0) + 1; });
      const dens = Object.entries(bins).map(([b, c]) => [(b * g - 0.5) / S.n, c / (S.sims.length * bw)]);
      ymax = Math.max(ymax, ...dens.map((d) => d[1]));
      dens.forEach(([b0, d]) => {
        if (b0 + bw < lo || b0 > hi) return;
        const h = (d / ymax) * (base - top);
        const mid = b0 + bw / 2;
        simSvg += `<rect x="${xs(b0) + 0.5}" y="${base - h}" width="${Math.max(1, xs(b0 + bw) - xs(b0) - 1)}" height="${h}" fill="${extreme(mid, ph) ? '#ec3013' : '#bab6b6'}" opacity="0.55"></rect>`;
      });
      const k = S.sims.filter((v) => extreme(v, ph)).length;
      simText = `Simulated: ${k} of ${S.sims.length} samples as extreme (${(k / S.sims.length).toFixed(3)})`;
    }
    const ys = (d) => base - (d / ymax) * (base - top);

    // Curve and shaded tail(s).
    const N = 240, pts = [];
    for (let i = 0; i <= N; i++) { const v = lo + ((hi - lo) * i) / N; pts.push([v, pdf(v)]); }
    const area = (from, to) => {
      const seg = pts.filter(([v]) => v >= from && v <= to);
      if (seg.length < 2) return '';
      return `<path d="M${xs(seg[0][0])},${base} ${seg.map(([v, d]) => `L${xs(v)},${ys(d)}`).join(' ')} L${xs(seg[seg.length - 1][0])},${base} Z" fill="#ec3013" opacity="0.35"></path>`;
    };
    let svg = simSvg;
    const dist = Math.abs(ph - S.p0);
    if (S.alt === 'gt' || S.alt === 'ne') svg += area(S.alt === 'gt' ? ph : S.p0 + dist, hi);
    if (S.alt === 'lt' || S.alt === 'ne') svg += area(lo, S.alt === 'lt' ? ph : S.p0 - dist);
    svg += `<path d="${pts.map(([v, d], i) => `${i ? 'L' : 'M'}${xs(v)},${ys(d)}`).join(' ')}" fill="none" stroke="#201e1d" stroke-width="2"></path>`;
    svg += `<line x1="${X0}" y1="${base}" x2="${X0 + W}" y2="${base}" stroke="#201e1d" stroke-width="2"></line>`;
    [-3, -2, -1, 0, 1, 2, 3].forEach((s) => {
      const v = S.p0 + s * sd;
      if (v < lo || v > hi) return;
      svg += `<line x1="${xs(v)}" y1="${base}" x2="${xs(v)}" y2="${base + 5}" stroke="#201e1d"></line>`;
      svg += `<text x="${xs(v)}" y="${base + 18}" text-anchor="middle" font-size="11" fill="#201e1d">${v.toFixed(3)}</text>`;
    });
    svg += `<text x="${xs(S.p0)}" y="${base + 32}" text-anchor="middle" font-size="11" fill="#605d5d">null value p₀</text>`;
    const px = xs(Math.max(lo, Math.min(hi, ph)));
    svg += `<line x1="${px}" y1="${top - 12}" x2="${px}" y2="${base}" stroke="#ec3013" stroke-width="2.5"></line>`;
    svg += `<text x="${Math.min(X0 + W - 60, Math.max(X0 + 60, px))}" y="${top - 18}" text-anchor="middle" font-size="12" font-weight="700" fill="#ae1800">p̂ = ${ph.toFixed(3)}</text>`;
    if (simText) svg += `<text x="${X0}" y="16" font-size="12" fill="#201e1d">${simText}</text>`;
    q('[data-chart]').innerHTML = svg;

    nIn.value = S.n; pIn.value = S.p0; xIn.max = S.n; xIn.value = S.x;
    q('[data-n-label]').innerHTML = tex(`$n=${S.n}$`);
    q('[data-p0-label]').innerHTML = tex(`$p_0=${S.p0.toFixed(2)}$`);
    q('[data-x-label]').innerHTML = tex(`$x=${S.x}$`);
    el.querySelectorAll('[data-alt]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.alt === S.alt)));
    el.querySelectorAll('[data-alpha]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.alpha) === S.alpha)));
    q('[data-ph]').textContent = ph.toFixed(4);
    q('[data-z]').textContent = z.toFixed(3);
    q('[data-pv]').textContent = pv < 0.0001 ? '< 0.0001' : pv.toFixed(4);
    q('[data-dec]').innerHTML = tex(pv <= S.alpha ? 'Reject $H_0$' : 'Fail to reject $H_0$') + '<br>' + tex(`at $\\alpha=${S.alpha}$`);
  }

  const clear = () => { S.sims = []; };
  nIn.addEventListener('input', () => { S.n = +nIn.value; clear(); paint(); });
  pIn.addEventListener('input', () => { S.p0 = +pIn.value; clear(); paint(); });
  xIn.addEventListener('input', () => { S.x = +xIn.value; paint(); });
  el.querySelectorAll('[data-alt]').forEach((b) => b.addEventListener('click', () => { S.alt = b.dataset.alt; paint(); }));
  el.querySelectorAll('[data-alpha]').forEach((b) => b.addEventListener('click', () => { S.alpha = Number(b.dataset.alpha); paint(); }));
  q('[data-sim]').addEventListener('click', () => {
    for (let i = 0; i < 1000; i++) S.sims.push(binom(S.n, S.p0) / S.n);
    paint();
  });
  q('[data-clear]').addEventListener('click', () => { clear(); paint(); });
  el.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => {
    const p = sec.presets[Number(b.dataset.preset)];
    Object.assign(S, { n: p.n, p0: p.p0, x: p.x, alt: p.alt });
    if (p.story && sec.stories[p.story]) {
      const story = document.querySelector('#s-' + sec.id + ' [data-story]');
      if (story) story.innerHTML = tex(sec.stories[p.story]);
    }
    clear(); paint();
  }));
  paint();
}
