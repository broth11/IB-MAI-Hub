// Explorer library: sampling distribution of a sample proportion.
// Takes simulated random samples of size n from a population with proportion p and stacks the
// sample proportions into a histogram, with the normal model N(p, sqrt(p(1-p)/n)) drawn over it.
// An optional "biased" mode over-selects people with the trait, so the average of the p-hats misses p.
// Section config: intro, stories {key: text}, initial {n, p, story},
//   presets [{label, sub, n, p, story}], bias (optional): true to show the Random / Biased switch,
//   biasFactor (optional, default 1.5): how many times more likely a person with the trait is to be picked.
import { esc, tex } from '../util.js';

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
  const modes = sec.bias
    ? `<div class="ex-modes ex-cols-2">
        <button class="ex-mode" data-mode="random" aria-pressed="true">Random sample</button>
        <button class="ex-mode" data-mode="biased" aria-pressed="false">Biased sample</button>
      </div>` : '';
  return `
    <div class="explorer">
      <div class="ex-presets ex-cols-${Math.min(sec.presets.length, 4)}">${presets}</div>
      <div class="ex-sliders ex-cols-2">
        <label><span>Sample size <span data-n-label></span></span><input type="range" min="10" max="1000" step="10" data-n></label>
        <label><span>Population proportion <span data-p-label></span></span><input type="range" min="0.05" max="0.95" step="0.01" data-p></label>
      </div>
      ${modes}
      <div class="ex-actions ex-cols-3">
        <button class="btn btn-secondary" data-one>Take 1 sample</button>
        <button class="btn btn-primary" data-many>Take 1,000 samples</button>
        <button class="btn btn-secondary" data-clear>Clear</button>
      </div>
      <div class="ex-chart"><svg viewBox="0 0 640 260" role="img" aria-label="Histogram of simulated sample proportions with the normal model drawn over it" data-chart></svg></div>
      <div class="ex-stats ex-cols-4">
        <div class="ex-stat"><div class="label">${tex('Average of the simulated $\\hat p$')}</div><div class="value" data-mean></div></div>
        <div class="ex-stat"><div class="label">${tex('$\\mu_{\\hat p}=p$')}</div><div class="value accent" data-mu></div></div>
        <div class="ex-stat"><div class="label">${tex('Simulated SD of $\\hat p$')}</div><div class="value" data-sd></div></div>
        <div class="ex-stat"><div class="label">${tex('$\\sigma_{\\hat p}=\\sqrt{p(1-p)/n}$')}</div><div class="value accent" data-sigma></div></div>
      </div>
    </div>`;
}

export function mount(el, sec) {
  const S = { mode: 'random', ...sec.initial, sims: [] };
  const factor = sec.biasFactor || 1.5;
  const q = (s) => el.querySelector(s);
  const nIn = q('[data-n]'), pIn = q('[data-p]');

  // One sample proportion: n Bernoulli draws. In biased mode a person with the trait is `factor` times as likely to be picked.
  function draw() {
    const pe = S.mode === 'biased' ? (factor * S.p) / (factor * S.p + (1 - S.p)) : S.p;
    let c = 0;
    for (let i = 0; i < S.n; i++) if (Math.random() < pe) c++;
    return c / S.n;
  }

  function paint() {
    const sigma = Math.sqrt((S.p * (1 - S.p)) / S.n);
    let lo = Math.max(0, S.p - 4.5 * sigma), hi = Math.min(1, S.p + 4.5 * sigma);
    // Widen the axis so a biased (shifted) set of samples is never cut off.
    if (S.sims.length) {
      const mn = S.sims.reduce((a, v) => Math.min(a, v), 1), mx = S.sims.reduce((a, v) => Math.max(a, v), 0);
      lo = Math.max(0, Math.min(lo, mn - sigma)); hi = Math.min(1, Math.max(hi, mx + sigma));
    }
    const X0 = 20, W = 600, base = 210, top = 40;
    const xs = (v) => X0 + ((v - lo) / (hi - lo)) * W;
    const pdf = (v) => Math.exp(-(((v - S.p) / sigma) ** 2) / 2) / (sigma * Math.sqrt(2 * Math.PI));
    let ymax = pdf(S.p) * 1.08;

    let bars = '';
    const m = S.sims.length;
    if (m) {
      // Bin on whole success counts so bars never alias against the 1/n grid.
      const g = Math.max(1, Math.ceil(((hi - lo) / 60) * S.n)), bw = g / S.n;
      const bins = {};
      S.sims.forEach((v) => { const b = Math.floor(Math.round(v * S.n) / g); bins[b] = (bins[b] || 0) + 1; });
      const dens = Object.entries(bins).map(([b, c]) => [(b * g - 0.5) / S.n, c / (m * bw)]);
      ymax = Math.max(ymax, ...dens.map((d) => d[1] * 1.05));
      dens.forEach(([b0, d]) => {
        if (b0 + bw < lo || b0 > hi) return;
        const h = (d / ymax) * (base - top);
        bars += `<rect x="${xs(b0) + 0.5}" y="${base - h}" width="${Math.max(1, xs(b0 + bw) - xs(b0) - 1)}" height="${h}" fill="#bab6b6" opacity="0.75"></rect>`;
      });
    }
    const ys = (d) => base - (d / ymax) * (base - top);
    const pts = [];
    for (let i = 0; i <= 200; i++) { const v = lo + ((hi - lo) * i) / 200; pts.push([v, pdf(v)]); }
    let svg = bars;
    svg += `<path d="${pts.map(([v, d], i) => `${i ? 'L' : 'M'}${xs(v)},${ys(d)}`).join(' ')}" fill="none" stroke="#201e1d" stroke-width="2"></path>`;
    svg += `<line x1="${X0}" y1="${base}" x2="${X0 + W}" y2="${base}" stroke="#201e1d" stroke-width="2"></line>`;
    [-3, -2, -1, 0, 1, 2, 3].forEach((s) => {
      const v = S.p + s * sigma;
      if (v < lo || v > hi) return;
      svg += `<line x1="${xs(v)}" y1="${base}" x2="${xs(v)}" y2="${base + 5}" stroke="#201e1d"></line>`;
      svg += `<text x="${xs(v)}" y="${base + 18}" text-anchor="middle" font-size="11" fill="#201e1d">${v.toFixed(3)}</text>`;
    });
    // True p (red) and the average of the simulated p-hats (dark dashed).
    svg += `<line x1="${xs(S.p)}" y1="${top - 8}" x2="${xs(S.p)}" y2="${base}" stroke="#ec3013" stroke-width="2.5"></line>`;
    svg += `<text x="${xs(S.p)}" y="${base + 33}" text-anchor="middle" font-size="12" font-weight="700" fill="#ae1800">true p = ${S.p.toFixed(2)}</text>`;
    let mean = null, sd = null;
    if (m) {
      mean = S.sims.reduce((a, b) => a + b, 0) / m;
      sd = m > 1 ? Math.sqrt(S.sims.reduce((a, b) => a + (b - mean) ** 2, 0) / (m - 1)) : null;
      const mx = xs(Math.max(lo, Math.min(hi, mean)));
      svg += `<line x1="${mx}" y1="${top - 8}" x2="${mx}" y2="${base}" stroke="#201e1d" stroke-width="2" stroke-dasharray="5 4"></line>`;
    }
    const counts = `np = ${(S.n * S.p).toFixed(1)}, n(1−p) = ${(S.n * (1 - S.p)).toFixed(1)}: ${S.n * S.p >= 10 && S.n * (1 - S.p) >= 10 ? 'both at least 10, so the shape is approximately normal' : 'not both at least 10, so do not use a normal model'}`;
    svg += `<text x="${X0}" y="16" font-size="12" fill="#201e1d">${m ? `${m.toLocaleString()} sample${m === 1 ? '' : 's'} of size ${S.n}${S.mode === 'biased' ? ' (biased)' : ''}` : 'Press a button to take samples'}</text>`;
    svg += `<text x="${X0}" y="31" font-size="11" fill="#605d5d">${counts}</text>`;
    q('[data-chart]').innerHTML = svg;

    nIn.value = S.n; pIn.value = S.p;
    q('[data-n-label]').innerHTML = tex(`$n=${S.n}$`);
    q('[data-p-label]').innerHTML = tex(`$p=${S.p.toFixed(2)}$`);
    el.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === S.mode)));
    q('[data-mean]').textContent = mean === null ? 'n/a' : mean.toFixed(4);
    q('[data-mu]').textContent = S.p.toFixed(4);
    q('[data-sd]').textContent = sd === null ? 'n/a' : sd.toFixed(4);
    q('[data-sigma]').textContent = sigma.toFixed(4);
  }

  const clear = () => { S.sims = []; };
  nIn.addEventListener('input', () => { S.n = +nIn.value; clear(); paint(); });
  pIn.addEventListener('input', () => { S.p = +pIn.value; clear(); paint(); });
  el.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => { S.mode = b.dataset.mode; clear(); paint(); }));
  q('[data-one]').addEventListener('click', () => { S.sims.push(draw()); paint(); });
  q('[data-many]').addEventListener('click', () => { for (let i = 0; i < 1000; i++) S.sims.push(draw()); paint(); });
  q('[data-clear]').addEventListener('click', () => { clear(); paint(); });
  el.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => {
    const p = sec.presets[Number(b.dataset.preset)];
    Object.assign(S, { n: p.n, p: p.p });
    if (p.mode) S.mode = p.mode;
    if (p.story && sec.stories[p.story]) {
      const story = document.querySelector('#s-' + sec.id + ' [data-story]');
      if (story) story.innerHTML = tex(sec.stories[p.story]);
    }
    clear(); paint();
  }));
  paint();
}
