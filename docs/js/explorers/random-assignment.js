// Explorer library: random assignment and blocking.
// Subjects have one extraneous variable (older or younger). Assign them to two treatment
// groups completely at random or blocked by age, repeat many times, and watch how big the
// age imbalance between the groups tends to be.
// Section config: intro, story, initial {n, older, mode}, presets [{label, sub, n, older, mode}],
//   labels {variable: 'older', other: 'younger', groupA: 'Vitamin D', groupB: 'Placebo'} (optional).
import { esc, tex, shuffle } from '../util.js';

const MODES = [['crd', 'Completely randomized'], ['block', 'Block by age']];

export function renderSide(sec) {
  return `
    <div class="side-copy">${tex(sec.intro)}</div>
    <div class="side-story">
      <div class="kicker">Story</div>
      <div class="text">${tex(sec.story)}</div>
    </div>`;
}

export function render(sec) {
  const lab = labels(sec);
  const presets = sec.presets.map((p, i) =>
    `<button class="btn btn-secondary" data-preset="${i}"><span>${esc(p.label)}</span>${tex(p.sub)}</button>`).join('');
  return `
    <div class="explorer">
      <div class="ex-presets ex-cols-${Math.min(sec.presets.length, 4)}">${presets}</div>
      <div class="ex-sliders ex-cols-2">
        <label><span>Subjects <span data-n-label></span></span><input type="range" min="8" max="200" step="2" data-n></label>
        <label><span>Share ${esc(lab.variable)} <span data-o-label></span></span><input type="range" min="0.1" max="0.9" step="0.05" data-o></label>
      </div>
      <div class="ex-modes ex-cols-2">${MODES.map(([m, l]) => `<button class="ex-mode" data-mode="${m}" aria-pressed="false">${l}</button>`).join('')}</div>
      <div class="ex-actions ex-cols-3">
        <button class="btn btn-primary" data-once>Assign once</button>
        <button class="btn btn-secondary" data-many>Assign 100 times</button>
        <button class="btn btn-secondary" data-clear>Clear history</button>
      </div>
      <div class="ex-chart"><svg viewBox="0 0 640 260" role="img" aria-label="Treatment groups and the distribution of age imbalance" data-chart></svg></div>
      <div class="ex-stats ex-cols-4">
        <div class="ex-stat"><div class="label">% ${esc(lab.variable)}, ${esc(lab.groupA)}</div><div class="value" data-a></div></div>
        <div class="ex-stat"><div class="label">% ${esc(lab.variable)}, ${esc(lab.groupB)}</div><div class="value" data-b></div></div>
        <div class="ex-stat"><div class="label">Difference (points)</div><div class="value accent" data-d></div></div>
        <div class="ex-stat"><div class="label">Typical difference (SD)</div><div class="value" data-sd></div></div>
      </div>
    </div>`;
}

function labels(sec) {
  return { variable: 'older', other: 'younger', groupA: 'Group A', groupB: 'Group B', ...(sec.labels || {}) };
}

// Returns an array of 0 (group A) or 1 (group B) for each subject; subjects 0..k-1 are "older".
function assign(n, k, mode) {
  const g = new Array(n);
  if (mode === 'block') {
    for (const [lo, hi] of [[0, k], [k, n]]) {
      const idx = shuffle(Array.from({ length: hi - lo }, (_, i) => lo + i));
      let half = Math.floor(idx.length / 2);
      if (idx.length % 2 && Math.random() < 0.5) half += 1;
      idx.forEach((s, i) => { g[s] = i < half ? 0 : 1; });
    }
  } else {
    shuffle(Array.from({ length: n }, (_, i) => i)).forEach((s, i) => { g[s] = i < n / 2 ? 0 : 1; });
  }
  return g;
}

function pct(g, k, grp) {
  let tot = 0, old = 0;
  g.forEach((v, i) => { if (v === grp) { tot++; if (i < k) old++; } });
  return tot ? (100 * old) / tot : 0;
}

export function mount(el, sec) {
  const lab = labels(sec);
  const S = { ...sec.initial, g: null, hist: [] };
  const q = (s) => el.querySelector(s);
  const nIn = q('[data-n]'), oIn = q('[data-o]');
  const k = () => Math.round(S.n * S.older);

  function once() {
    S.g = assign(S.n, k(), S.mode);
    S.hist.push(pct(S.g, k(), 0) - pct(S.g, k(), 1));
  }

  function paint() {
    const kk = k();
    let svg = '';
    // Left: the two groups as dot grids.
    const per = S.n / 2, cols = per <= 16 ? 4 : per <= 36 ? 6 : 10;
    const rows = Math.ceil(per / cols), cell = Math.min(130 / cols, 190 / rows), r = Math.max(2.2, cell * 0.36);
    [0, 1].forEach((grp) => {
      const x0 = grp * 150 + 6;
      svg += `<text x="${x0 + 65}" y="14" text-anchor="middle" font-size="12" font-weight="700" fill="#201e1d">${esc(grp ? lab.groupB : lab.groupA)}</text>`;
      svg += `<rect x="${x0}" y="22" width="130" height="200" fill="none" stroke="#bab6b6" stroke-width="1"></rect>`;
      if (!S.g) { svg += `<text x="${x0 + 65}" y="118" text-anchor="middle" font-size="12" fill="#605d5d">Not assigned yet</text>`; return; }
      const members = [];
      S.g.forEach((v, i) => { if (v === grp) members.push(i < kk); });
      members.sort((a, b) => b - a).forEach((isOld, j) => {
        const cx = x0 + 65 - (cols * cell) / 2 + (j % cols) * cell + cell / 2;
        const cy = 32 + Math.floor(j / cols) * cell + cell / 2;
        svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${isOld ? '#ec3013' : '#bab6b6'}"></circle>`;
      });
    });
    svg += `<circle cx="16" cy="244" r="5" fill="#ec3013"></circle><text x="26" y="248" font-size="11" fill="#201e1d">${esc(lab.variable)}</text>`;
    svg += `<circle cx="86" cy="244" r="5" fill="#bab6b6"></circle><text x="96" y="248" font-size="11" fill="#201e1d">${esc(lab.other)}</text>`;

    // Right: histogram of the difference in % older (A minus B), from -50 to 50 points.
    const X0 = 330, W = 300, base = 210, span = 50, bw = 4;
    const xs = (d) => X0 + ((d + span) / (2 * span)) * W;
    const bins = {};
    S.hist.forEach((d) => { const b = Math.max(-span, Math.min(span - bw, Math.floor(d / bw) * bw)); bins[b] = (bins[b] || 0) + 1; });
    const maxc = Math.max(1, ...Object.values(bins));
    Object.entries(bins).forEach(([b, c]) => {
      const h = (c / maxc) * 160;
      svg += `<rect x="${xs(+b) + 0.5}" y="${base - h}" width="${(bw / (2 * span)) * W - 1}" height="${h}" fill="#ec3013" opacity="0.85"></rect>`;
    });
    svg += `<line x1="${X0}" y1="${base}" x2="${X0 + W}" y2="${base}" stroke="#201e1d" stroke-width="2"></line>`;
    svg += `<line x1="${xs(0)}" y1="40" x2="${xs(0)}" y2="${base}" stroke="#605d5d" stroke-dasharray="3 3"></line>`;
    [-40, -20, 0, 20, 40].forEach((t) => { svg += `<text x="${xs(t)}" y="${base + 16}" text-anchor="middle" font-size="11" fill="#201e1d">${t}</text>`; });
    svg += `<text x="${X0 + W / 2}" y="${base + 34}" text-anchor="middle" font-size="11" fill="#201e1d">% ${esc(lab.variable)} in ${esc(lab.groupA)} minus % in ${esc(lab.groupB)}</text>`;
    svg += `<text x="${X0 + W / 2}" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="#201e1d">${S.hist.length} assignment${S.hist.length === 1 ? '' : 's'}</text>`;
    q('[data-chart]').innerHTML = svg;

    nIn.value = S.n; oIn.value = S.older;
    q('[data-n-label]').innerHTML = tex(`$n=${S.n}$`);
    q('[data-o-label]').innerHTML = tex(`$${Math.round(S.older * 100)}\\%$`);
    el.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === S.mode)));
    const a = S.g ? pct(S.g, kk, 0) : null, b = S.g ? pct(S.g, kk, 1) : null;
    q('[data-a]').textContent = a == null ? '–' : a.toFixed(0) + '%';
    q('[data-b]').textContent = b == null ? '–' : b.toFixed(0) + '%';
    q('[data-d]').textContent = a == null ? '–' : (a - b >= 0 ? '+' : '−') + Math.abs(a - b).toFixed(0);
    const h = S.hist, m = h.reduce((s, v) => s + v, 0) / (h.length || 1);
    const sd = h.length > 1 ? Math.sqrt(h.reduce((s, v) => s + (v - m) ** 2, 0) / (h.length - 1)) : null;
    q('[data-sd]').textContent = sd == null ? '–' : sd.toFixed(1);
  }

  const reset = () => { S.g = null; S.hist = []; };
  nIn.addEventListener('input', () => { S.n = +nIn.value; reset(); paint(); });
  oIn.addEventListener('input', () => { S.older = +oIn.value; reset(); paint(); });
  el.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => { S.mode = b.dataset.mode; reset(); paint(); }));
  q('[data-once]').addEventListener('click', () => { once(); paint(); });
  q('[data-many]').addEventListener('click', () => { for (let i = 0; i < 100; i++) once(); paint(); });
  q('[data-clear]').addEventListener('click', () => { reset(); paint(); });
  el.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => {
    const p = sec.presets[Number(b.dataset.preset)];
    Object.assign(S, { n: p.n, older: p.older, mode: p.mode });
    reset(); once(); paint();
  }));
  paint();
}
