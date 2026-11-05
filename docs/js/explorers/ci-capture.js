// Explorer library: confidence interval capture.
// Draws 100 random samples at a time, builds a one-sample z interval for p from each one
// (p-hat plus or minus z* times sqrt(p-hat(1-p-hat)/n)), and shows which intervals catch the true p.
// A running tally across all draws shows the capture rate settling near the confidence level.
// Section config: intro, stories {key: text}, initial {n, p, level, story},
//   presets [{label, sub, n, p, level, story}]. level is 0.90, 0.95 or 0.99.
import { esc, tex } from '../util.js';

const Z = { 0.9: 1.6449, 0.95: 1.96, 0.99: 2.5758 };

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
      <div class="ex-sliders ex-cols-2">
        <label><span>Sample size <span data-n-label></span></span><input type="range" min="20" max="2000" step="10" data-n></label>
        <label><span>Population proportion <span data-p-label></span></span><input type="range" min="0.05" max="0.95" step="0.01" data-p></label>
      </div>
      <div class="ex-modes ex-cols-3">
        ${[0.9, 0.95, 0.99].map((l) => `<button class="ex-mode" data-level="${l}" aria-pressed="false">${Math.round(l * 100)}% confidence</button>`).join('')}
      </div>
      <div class="ex-actions ex-cols-2">
        <button class="btn btn-primary" data-draw>Draw 100 intervals</button>
        <button class="btn btn-secondary" data-clear>Clear</button>
      </div>
      <div class="ex-chart"><svg viewBox="0 0 640 260" role="img" aria-label="One hundred confidence intervals, with the ones that miss the true proportion in red" data-chart></svg></div>
      <div class="ex-stats ex-cols-4">
        <div class="ex-stat"><div class="label">${tex('Margin of error, $z^*\\sqrt{p(1-p)/n}$')}</div><div class="value" data-moe></div></div>
        <div class="ex-stat"><div class="label">${tex('Intervals in this batch that caught $p$')}</div><div class="value" data-batch></div></div>
        <div class="ex-stat"><div class="label">Intervals drawn so far</div><div class="value" data-total></div></div>
        <div class="ex-stat"><div class="label">Capture rate so far</div><div class="value accent" data-rate></div></div>
      </div>
    </div>`;
}

export function mount(el, sec) {
  const S = { ...sec.initial, batch: [], drawn: 0, caught: 0 };
  const q = (s) => el.querySelector(s);
  const nIn = q('[data-n]'), pIn = q('[data-p]');

  function draw100() {
    const z = Z[S.level];
    S.batch = [];
    for (let k = 0; k < 100; k++) {
      let c = 0;
      for (let i = 0; i < S.n; i++) if (Math.random() < S.p) c++;
      const ph = c / S.n, me = z * Math.sqrt((ph * (1 - ph)) / S.n);
      const lo = ph - me, hi = ph + me, ok = lo <= S.p && S.p <= hi;
      S.batch.push({ ph, lo, hi, ok });
      S.drawn++; if (ok) S.caught++;
    }
  }

  function paint() {
    const z = Z[S.level], moe = z * Math.sqrt((S.p * (1 - S.p)) / S.n);
    // The x-range is fixed by the typical spread so changing the level or n visibly changes the interval widths.
    const half = 3.2 * Math.sqrt((S.p * (1 - S.p)) / S.n) + 0.4 * moe;
    const lo = S.p - half, hi = S.p + half;
    const X0 = 20, W = 600, top = 34, bot = 236;
    const xs = (v) => X0 + ((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * W;
    let svg = '';
    const rowH = (bot - top) / 100;
    S.batch.forEach((iv, i) => {
      const y = top + (i + 0.5) * rowH;
      svg += `<line x1="${xs(iv.lo)}" y1="${y}" x2="${xs(iv.hi)}" y2="${y}" stroke="${iv.ok ? '#8a8686' : '#ec3013'}" stroke-width="${iv.ok ? 1.1 : 1.8}"></line>`;
      svg += `<circle cx="${xs(iv.ph)}" cy="${y}" r="1.4" fill="${iv.ok ? '#201e1d' : '#ae1800'}"></circle>`;
    });
    svg += `<line x1="${xs(S.p)}" y1="${top - 8}" x2="${xs(S.p)}" y2="${bot + 4}" stroke="#201e1d" stroke-width="2"></line>`;
    svg += `<text x="${xs(S.p)}" y="${bot + 20}" text-anchor="middle" font-size="12" font-weight="700" fill="#201e1d">true p = ${S.p.toFixed(2)}</text>`;
    svg += `<text x="${X0}" y="16" font-size="12" fill="#201e1d">${S.batch.length ? 'Red intervals missed the true proportion' : 'Press “Draw 100 intervals”'}</text>`;
    q('[data-chart]').innerHTML = svg;

    nIn.value = S.n; pIn.value = S.p;
    q('[data-n-label]').innerHTML = tex(`$n=${S.n}$`);
    q('[data-p-label]').innerHTML = tex(`$p=${S.p.toFixed(2)}$`);
    el.querySelectorAll('[data-level]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.level) === S.level)));
    q('[data-moe]').textContent = moe.toFixed(4);
    q('[data-batch]').textContent = S.batch.length ? `${S.batch.filter((b) => b.ok).length} of 100` : 'n/a';
    q('[data-total]').textContent = S.drawn.toLocaleString();
    q('[data-rate]').textContent = S.drawn ? `${((100 * S.caught) / S.drawn).toFixed(1)}%` : 'n/a';
  }

  const clear = () => { S.batch = []; S.drawn = 0; S.caught = 0; };
  nIn.addEventListener('input', () => { S.n = +nIn.value; clear(); paint(); });
  pIn.addEventListener('input', () => { S.p = +pIn.value; clear(); paint(); });
  el.querySelectorAll('[data-level]').forEach((b) => b.addEventListener('click', () => { S.level = Number(b.dataset.level); clear(); paint(); }));
  q('[data-draw]').addEventListener('click', () => { draw100(); paint(); });
  q('[data-clear]').addEventListener('click', () => { clear(); paint(); });
  el.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => {
    const p = sec.presets[Number(b.dataset.preset)];
    Object.assign(S, { n: p.n, p: p.p, level: p.level });
    if (p.story && sec.stories[p.story]) {
      const story = document.querySelector('#s-' + sec.id + ' [data-story]');
      if (story) story.innerHTML = tex(sec.stories[p.story]);
    }
    clear(); paint();
  }));
  paint();
}
