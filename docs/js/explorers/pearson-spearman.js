// Explorer library: Pearson versus Spearman (IB MAI SL 4.10).
// Click the grid to add a point, drag a point to move it. r and r_s update live. The Linear toggle draws the
// regression line; the Monotonic toggle joins the points in x order and says whether the pattern is increasing,
// decreasing, or neither. The rank table shows each point's ranks (ties averaged).
// Section config: intro, presets [{label, sub, pts [[x, y], ...], story}]
import { esc, tex } from '../util.js';
import { pearson, spearman, ranks, linreg, sf } from './lib/fit.js';
import { frame, INK, ACC, MID, GOOD } from './lib/plot.js';

const W = 640, H = 300, XR = [0, 10], YR = [0, 10];

export function renderSide(sec) {
  return `<div class="side-copy">${tex(sec.intro)}</div><div class="side-story"><div class="kicker">Story</div><div class="text" data-story>${tex(sec.presets[0].story)}</div></div>`;
}

export function render(sec) {
  const presets = sec.presets.map((p, i) => `<button class="btn btn-secondary" data-preset="${i}"><span>${esc(p.label)}</span>${tex(p.sub)}</button>`).join('');
  return `
    <div class="explorer">
      <div class="ex-presets ex-cols-${sec.presets.length}">${presets}</div>
      <div class="ex-actions ex-cols-5">
        <button class="ex-mode" data-t="line" aria-pressed="false">Linear: line of best fit</button>
        <button class="ex-mode" data-t="mono" aria-pressed="false">Monotonic: join in order</button>
        <button class="ex-mode" data-t="ranks" aria-pressed="false">Show the ranks</button>
        <button class="btn btn-secondary" data-undo>Remove last point</button>
        <button class="btn btn-secondary" data-clear>Clear</button>
      </div>
      <div class="ex-chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Scatter diagram: click to add points, drag to move them" data-chart style="touch-action:none;cursor:crosshair"></svg></div>
      <div class="ex-note" data-note></div>
      <div class="ex-stats ex-cols-4">
        <div class="ex-stat"><div class="label">Points</div><div class="value" data-n></div></div>
        <div class="ex-stat"><div class="label">Pearson's r (straight line)</div><div class="value accent" data-r></div></div>
        <div class="ex-stat"><div class="label">Spearman's rs (ranks)</div><div class="value accent" data-rs></div></div>
        <div class="ex-stat"><div class="label">Pattern in x order</div><div class="value small" data-mono></div></div>
      </div>
    </div>`;
}

function monotonic(pts) {
  const s = [...pts].sort((a, b) => a[0] - b[0]);
  let up = true, down = true;
  for (let i = 1; i < s.length; i++) { if (s[i][1] < s[i - 1][1]) up = false; if (s[i][1] > s[i - 1][1]) down = false; }
  return up && !down ? 'Increasing' : down && !up ? 'Decreasing' : up && down ? 'Flat' : 'Neither';
}

export function mount(el, sec) {
  const q = (s) => el.querySelector(s);
  q('[data-r]').previousElementSibling.innerHTML = tex("Pearson's $r$ (straight line)");
  q('[data-rs]').previousElementSibling.innerHTML = tex("Spearman's $r_s$ (ranks)");
  const svg = q('[data-chart]');
  const state = { pts: sec.presets[0].pts.map((p) => [...p]), line: false, mono: false, ranks: false, drag: -1 };
  let F;

  function toData(ev) {
    const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
    const s = Math.min(r.width / vb.width, r.height / vb.height); // preserveAspectRatio meet
    const ox = (r.width - vb.width * s) / 2, oy = (r.height - vb.height * s) / 2;
    const px = (ev.clientX - r.left - ox) / s, py = (ev.clientY - r.top - oy) / s;
    return [Math.min(XR[1], Math.max(XR[0], F.invX(px))), Math.min(YR[1], Math.max(YR[0], F.invY(py))), px, py];
  }

  function paint() {
    F = frame({ W, H, xr: XR, yr: YR, xlabel: 'x', ylabel: 'y' });
    let s = F.svg;
    const P = state.pts, n = P.length, x = P.map((p) => p[0]), y = P.map((p) => p[1]);
    const ok = n >= 3;
    const rx = ok ? ranks(x) : [], ry = ok ? ranks(y) : [];
    if (state.line && ok) {
      const { a, b } = linreg(x, y);
      s += `<line x1="${F.X(XR[0])}" y1="${F.Y(a * XR[0] + b)}" x2="${F.X(XR[1])}" y2="${F.Y(a * XR[1] + b)}" stroke="${ACC}" stroke-width="2.5" clip-path="url(#ps-clip)"></line>`;
    }
    if (state.mono && n >= 2) {
      const ord = P.map((p, i) => i).sort((i, j) => P[i][0] - P[j][0]);
      const m = monotonic(P);
      s += `<path d="${ord.map((i, k) => `${k ? 'L' : 'M'}${F.X(P[i][0])} ${F.Y(P[i][1])}`).join('')}" fill="none" stroke="${m === 'Neither' ? MID : GOOD}" stroke-width="2" stroke-dasharray="${m === 'Neither' ? '5 4' : ''}"></path>`;
    }
    P.forEach((p, i) => {
      s += `<circle cx="${F.X(p[0])}" cy="${F.Y(p[1])}" r="${state.drag === i ? 8 : 6.5}" fill="${INK}" data-i="${i}" style="cursor:grab"></circle>`;
      if (state.ranks && ok) s += `<text x="${F.X(p[0]) + 9}" y="${F.Y(p[1]) - 8}" font-size="11" fill="${ACC}" font-weight="700">(${+rx[i].toFixed(1)}, ${+ry[i].toFixed(1)})</text>`;
    });
    svg.innerHTML = `<defs><clipPath id="ps-clip"><rect x="${F.box.L}" y="${F.box.T}" width="${W - F.box.L - F.box.R}" height="${H - F.box.T - F.box.B}"></rect></clipPath></defs>` + s;
    q('[data-n]').textContent = n;
    q('[data-r]').textContent = ok ? sf(pearson(x, y)) : '–';
    q('[data-rs]').textContent = ok ? sf(spearman(x, y)) : '–';
    q('[data-mono]').textContent = n >= 2 ? monotonic(P) : '–';
    q('[data-note]').innerHTML = !ok ? tex('Add at least 3 points: click anywhere on the grid.')
      : state.ranks ? tex('Each label is (rank of $x$, rank of $y$), from smallest. Moving a point changes $r_s$ only when it passes another point.')
      : tex('$r$ asks how close the points are to a straight line. $r_s$ asks only whether $y$ keeps rising (or keeps falling) as $x$ rises.');
    el.querySelectorAll('[data-t]').forEach((b) => b.setAttribute('aria-pressed', String(state[b.dataset.t])));
  }

  svg.addEventListener('pointerdown', (ev) => {
    const c = ev.target.closest('circle[data-i]');
    if (c) { state.drag = +c.dataset.i; svg.setPointerCapture(ev.pointerId); paint(); return; }
    const [x, y, px, py] = toData(ev);
    if (px < F.box.L || px > W - F.box.R || py < F.box.T || py > H - F.box.B) return;
    if (state.pts.length >= 25) return;
    state.pts.push([+x.toFixed(2), +y.toFixed(2)]); paint();
  });
  svg.addEventListener('pointermove', (ev) => {
    if (state.drag < 0) return;
    const [x, y] = toData(ev); state.pts[state.drag] = [+x.toFixed(2), +y.toFixed(2)]; paint();
  });
  const end = () => { if (state.drag >= 0) { state.drag = -1; paint(); } };
  svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
  el.querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', () => { state[b.dataset.t] = !state[b.dataset.t]; paint(); }));
  q('[data-undo]').addEventListener('click', () => { state.pts.pop(); paint(); });
  q('[data-clear]').addEventListener('click', () => { state.pts = []; paint(); });
  el.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => {
    const p = sec.presets[+b.dataset.preset]; state.pts = p.pts.map((v) => [...v]);
    const story = el.closest('.ex-wrap, section') && el.closest('.ex-wrap, section').querySelector('[data-story]');
    if (story) story.innerHTML = tex(p.story);
    paint();
  }));
  paint();
}
