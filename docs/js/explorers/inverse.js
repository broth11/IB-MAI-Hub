// Explorer library: inverse functions and reflection in y = x.
// An equal-scale grid (one unit is the same length on both axes, like the calculator after Zoom Square)
// with a function, a draggable horizontal line for the one-to-one test, an optional reflection in y = x
// (the inverse), and a mirror point. A quadratic can be restricted to the right or left of its vertex.
// Section config: intro, stories {key: text}, initial {preset}, presets [{label, sub, name, fn, ..., mode, story, k, a}]
//   fn 'quad':  f(x) = (x - h)^2 + k0     keys h, k0; mode is 'all', 'right' or 'left' (which part of the domain is kept)
//   fn 'sqrt':  f(x) = sqrt(x + c)        key c; domain x >= -c
//   fn 'line':  f(x) = m x + b            keys m, b
//   name is the function letter ('f', 'h', ...); k is the starting height of the test line; a is the starting x.
import { esc, tex } from '../util.js';

const W = 640, H = 320, S = 32, OX = W / 2, OY = H / 2, XMAX = OX / S, YMAX = OY / S; // x in [-10, 10], y in [-5, 5]
const INK = '#201e1d', ACC = '#ec3013', GREY = '#bab6b6', MID = '#605d5d';
const MODES = [['all', 'All real numbers'], ['right', 'Right of the vertex'], ['left', 'Left of the vertex']];
const num = (v) => String(+v.toFixed(2)).replace('-', '−');
const px = (x) => OX + S * x, py = (y) => OY - S * y;
const signed = (v) => (v < 0 ? `-${-v}` : `+${v}`);

function fnOf(p) {
  if (p.fn === 'sqrt') return { f: (x) => Math.sqrt(x + p.c), lo: -p.c, hi: XMAX, canRestrict: false };
  if (p.fn === 'line') return { f: (x) => p.m * x + p.b, lo: -XMAX, hi: XMAX, canRestrict: false };
  return { f: (x) => (x - p.h) ** 2 + p.k0, lo: -XMAX, hi: XMAX, canRestrict: true };
}
function domainOf(p, mode) {
  const d = fnOf(p);
  if (!d.canRestrict) return [d.lo, d.hi];
  if (mode === 'right') return [p.h, XMAX];
  if (mode === 'left') return [-XMAX, p.h];
  return [-XMAX, XMAX];
}
// Number of times the horizontal line y = k meets the graph over the kept domain.
function crossings(p, mode, k) {
  if (p.fn === 'sqrt') return k >= 0 ? 1 : 0;
  if (p.fn === 'line') return 1;
  if (k < p.k0 - 1e-9) return 0;
  if (Math.abs(k - p.k0) < 1e-9) return 1;
  return mode === 'all' ? 2 : 1;
}
function crossXs(p, mode, k) {
  if (p.fn === 'sqrt') return k >= 0 ? [k * k - p.c] : [];
  if (p.fn === 'line') return [(k - p.b) / p.m];
  if (k < p.k0) return [];
  const r = Math.sqrt(k - p.k0);
  const xs = mode === 'all' ? [p.h - r, p.h + r] : mode === 'right' ? [p.h + r] : [p.h - r];
  return r === 0 ? [p.h] : xs;
}
function aRange(p, mode) {
  if (p.fn === 'sqrt') return [-p.c, 8];
  if (p.fn === 'line') return [-5, 5];
  if (mode === 'right') return [p.h, p.h + 3.5];
  if (mode === 'left') return [p.h - 3.5, p.h];
  return [p.h - 3, p.h + 3];
}
// The inverse as written on an exam, and the domain and range sentence.
function inverseTex(p, mode) {
  const name = p.name;
  if (p.fn === 'line') {
    const top = p.b === 0 ? 'x' : `x${signed(-p.b)}`;
    return p.m === 1 ? `$${name}^{-1}(x)=${top}$` : `$${name}^{-1}(x)=\\dfrac{${top}}{${p.m}}$`;
  }
  if (p.fn === 'sqrt') return `$${name}^{-1}(x)=x^2${signed(-p.c)},\\ x\\ge0$`;
  const inner = p.k0 === 0 ? 'x' : `x${signed(-p.k0)}`;
  const h = p.h === 0 ? '' : `${p.h}`;
  if (mode === 'right') return `$${name}^{-1}(x)=${h}${h ? '+' : ''}\\sqrt{${inner}}$`;
  if (mode === 'left') return `$${name}^{-1}(x)=${h}-\\sqrt{${inner}}$`;
  return `$${name}^{-1}\\text{ is not a function: } y=${h}\\pm\\sqrt{${inner}}$`;
}
function domainTex(p, mode) {
  const n = p.name;
  if (p.fn === 'line') return `Domain and range of $${n}$ and $${n}^{-1}$ are all real numbers.`;
  if (p.fn === 'sqrt') return `Domain of $${n}$: $x\\ge${-p.c}$. Range: $y\\ge0$. So $${n}^{-1}$ has domain $x\\ge0$ and range $y\\ge${-p.c}$.`;
  if (mode === 'all') return `Domain of $${n}$: all real numbers. Range: $y\\ge${p.k0}$. Two inputs give one output, so $${n}$ is not one-to-one.`;
  const side = mode === 'right' ? `x\\ge${p.h}` : `x\\le${p.h}`;
  const inv = mode === 'right' ? `y\\ge${p.h}` : `y\\le${p.h}`;
  return `Domain of $${n}$: $${side}$. Range: $y\\ge${p.k0}$. So $${n}^{-1}$ has domain $x\\ge${p.k0}$ and range $${inv}$.`;
}

export function renderSide(sec) {
  const first = sec.presets[sec.initial.preset || 0];
  return `
    <div class="side-copy">${tex(sec.intro)}</div>
    <div class="side-story">
      <div class="kicker">Story</div>
      <div class="text" data-story>${tex(sec.stories[first.story])}</div>
    </div>`;
}

export function render(sec) {
  const presets = sec.presets.map((p, i) =>
    `<button class="btn btn-secondary" data-preset="${i}"><span>${esc(p.label)}</span>${tex(p.sub)}</button>`).join('');
  const modes = MODES.map(([m, label]) => `<button class="ex-mode" data-mode="${m}" aria-pressed="false">${esc(label)}</button>`).join('');
  return `
    <div class="explorer">
      <div class="ex-presets ex-cols-4">${presets}</div>
      <div class="ex-sliders ex-cols-2">
        <label><span>Horizontal line <span data-k-label></span></span><input type="range" min="-4.5" max="4.5" step="0.1" data-k></label>
        <label><span>Point on the graph <span data-a-label></span></span><input type="range" min="-3" max="3" step="0.1" data-a></label>
      </div>
      <div class="ex-actions ex-cols-5">
        ${modes}
        <button class="ex-mode" data-ex-toggle="inv" aria-pressed="false">Show the inverse</button>
        <button class="ex-mode" data-ex-toggle="pt" aria-pressed="false">Show the mirror point</button>
      </div>
      <div class="ex-chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Graph of a function and its reflection in y = x" data-chart></svg></div>
      <div class="ex-note" data-note></div>
      <div class="ex-stats ex-cols-4">
        <div class="ex-stat"><div class="label" data-hit-label></div><div class="value" data-hit></div></div>
        <div class="ex-stat"><div class="label">One-to-one?</div><div class="value accent" data-one></div></div>
        <div class="ex-stat"><div class="label" data-fa-label></div><div class="value" data-fa></div></div>
        <div class="ex-stat"><div class="label">Mirror point on the inverse</div><div class="value" data-mirror></div></div>
      </div>
    </div>`;
}

export function mount(el, sec) {
  const q = (s) => el.querySelector(s);
  const S0 = sec.presets[sec.initial.preset || 0];
  const state = { i: sec.initial.preset || 0, mode: S0.mode || 'all', k: S0.k ?? 1, a: S0.a ?? 1, inv: false, pt: false };
  const kIn = q('[data-k]'), aIn = q('[data-a]');
  const setTex = (node, text) => { node.innerHTML = tex(text); };

  function path(pts) { return pts.map(([x, y], j) => `${j ? 'L' : 'M'}${px(x).toFixed(1)} ${py(y).toFixed(1)}`).join(''); }

  function paint() {
    const p = sec.presets[state.i];
    const d = fnOf(p);
    if (!d.canRestrict) state.mode = p.mode || 'all';
    const [lo, hi] = domainOf(p, state.mode);
    const [aLo, aHi] = aRange(p, state.mode);
    state.a = Math.min(aHi, Math.max(aLo, state.a));
    aIn.min = aLo; aIn.max = aHi; aIn.value = state.a; kIn.value = state.k;
    const k = state.k, a = state.a, fa = d.f(a);
    const pts = [];
    for (let x = lo; x <= hi + 1e-9; x += 0.05) pts.push([x, d.f(x)]);
    const swapped = pts.map(([x, y]) => [y, x]);

    let svg = `<defs><clipPath id="invclip-${esc(sec.id)}"><rect x="0" y="0" width="${W}" height="${H}"></rect></clipPath></defs>`;
    for (let g = -10; g <= 10; g++) svg += `<line x1="${px(g)}" y1="0" x2="${px(g)}" y2="${H}" stroke="${g === 0 ? INK : '#d7d3d3'}" stroke-width="${g === 0 ? 1.6 : 1}"></line>`;
    for (let g = -5; g <= 5; g++) svg += `<line x1="0" y1="${py(g)}" x2="${W}" y2="${py(g)}" stroke="${g === 0 ? INK : '#d7d3d3'}" stroke-width="${g === 0 ? 1.6 : 1}"></line>`;
    for (let g = -10; g <= 10; g += 2) if (g) svg += `<text x="${px(g)}" y="${OY + 13}" text-anchor="middle" font-size="10" fill="${MID}">${num(g)}</text>`;
    for (let g = -4; g <= 4; g += 2) if (g) svg += `<text x="${OX - 5}" y="${py(g) + 3}" text-anchor="end" font-size="10" fill="${MID}">${num(g)}</text>`;
    svg += `<g clip-path="url(#invclip-${esc(sec.id)})">`;
    svg += `<line x1="${px(-XMAX)}" y1="${py(-XMAX)}" x2="${px(XMAX)}" y2="${py(XMAX)}" stroke="${MID}" stroke-width="1.5" stroke-dasharray="6 5"></line>`;
    svg += `<text x="${px(4.6)}" y="${py(4.6) - 6}" font-size="12" fill="${MID}" font-style="italic">y = x</text>`;
    svg += `<line x1="0" y1="${py(k)}" x2="${W}" y2="${py(k)}" stroke="${INK}" stroke-width="1.5" stroke-dasharray="3 4"></line>`;
    if (state.inv) {
      svg += `<line x1="${px(k)}" y1="0" x2="${px(k)}" y2="${H}" stroke="${ACC}" stroke-width="1.5" stroke-dasharray="3 4"></line>`;
      svg += `<path d="${path(swapped)}" fill="none" stroke="${ACC}" stroke-width="3"></path>`;
    }
    svg += `<path d="${path(pts)}" fill="none" stroke="${INK}" stroke-width="3"></path>`;
    crossXs(p, state.mode, k).forEach((x) => { svg += `<circle cx="${px(x)}" cy="${py(k)}" r="4.5" fill="${INK}"></circle>`; });
    if (state.inv) crossXs(p, state.mode, k).forEach((x) => { svg += `<circle cx="${px(k)}" cy="${py(x)}" r="4.5" fill="${ACC}"></circle>`; });
    svg += `<circle cx="${px(a)}" cy="${py(fa)}" r="5.5" fill="${INK}"></circle>`;
    if (state.inv && state.pt) {
      svg += `<line x1="${px(a)}" y1="${py(fa)}" x2="${px(fa)}" y2="${py(a)}" stroke="${GREY}" stroke-width="2" stroke-dasharray="4 3"></line>`;
      svg += `<circle cx="${px(fa)}" cy="${py(a)}" r="5.5" fill="${ACC}"></circle>`;
    }
    svg += '</g>';
    svg += `<text x="10" y="18" font-size="13" font-weight="700" fill="${INK}">${esc(p.name)}(x): black</text>`;
    if (state.inv) svg += `<text x="10" y="36" font-size="13" font-weight="700" fill="${ACC}">reflection in y = x: red</text>`;
    q('[data-chart]').innerHTML = svg;

    setTex(q('[data-k-label]'), `$y=${num(k)}$`);
    setTex(q('[data-a-label]'), `$x=${num(a)}$`);
    const n = crossings(p, state.mode, k);
    setTex(q('[data-hit-label]'), `Line $y=${num(k)}$ meets the graph`);
    q('[data-hit]').textContent = `${n} ${n === 1 ? 'time' : 'times'}`;
    const one = p.fn !== 'quad' || state.mode !== 'all';
    q('[data-one]').textContent = one ? 'Yes' : 'No';
    setTex(q('[data-fa-label]'), `$${p.name}(${num(a)})$`);
    q('[data-fa]').textContent = num(fa);
    q('[data-mirror]').textContent = state.inv && state.pt ? `(${num(fa)}, ${num(a)})` : 'Press Show the inverse, then the mirror point';
    q('[data-mirror]').classList.toggle('small', !(state.inv && state.pt));
    setTex(q('[data-note]'), state.inv ? `${inverseTex(p, state.mode)}. ${domainTex(p, state.mode)}` : `Predict the inverse first. ${domainTex(p, state.mode)}`);

    el.querySelectorAll('[data-mode]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.mode === state.mode));
      b.disabled = !d.canRestrict;
    });
    q('[data-ex-toggle="inv"]').setAttribute('aria-pressed', String(state.inv));
    const ptBtn = q('[data-ex-toggle="pt"]');
    ptBtn.setAttribute('aria-pressed', String(state.pt));
    ptBtn.disabled = !state.inv;
  }

  kIn.addEventListener('input', () => { state.k = +kIn.value; paint(); });
  aIn.addEventListener('input', () => { state.a = +aIn.value; paint(); });
  el.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => { state.mode = b.dataset.mode; paint(); }));
  q('[data-ex-toggle="inv"]').addEventListener('click', () => { state.inv = !state.inv; if (!state.inv) state.pt = false; paint(); });
  q('[data-ex-toggle="pt"]').addEventListener('click', () => { if (state.inv) { state.pt = !state.pt; paint(); } });
  el.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => {
    const i = Number(b.dataset.preset), p = sec.presets[i];
    Object.assign(state, { i, mode: p.mode || 'all', k: p.k ?? 1, a: p.a ?? 1, inv: false, pt: false });
    const story = document.querySelector('#s-' + sec.id + ' [data-story]');
    if (story) story.innerHTML = tex(sec.stories[p.story]);
    paint();
  }));
  paint();
}
