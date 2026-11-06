// Shared SVG scatter frame for the regression explorers: nice ticks, axes, labels, and coordinate maps.
export const INK = '#201e1d', ACC = '#ec3013', GREY = '#bab6b6', MID = '#605d5d', GRID = '#d7d3d3', GOOD = '#2f7d4f';

export function niceTicks(lo, hi, count = 6) {
  if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
  const raw = (hi - lo) / count, mag = 10 ** Math.floor(Math.log10(raw)), f = raw / mag;
  const step = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * mag;
  const a = Math.floor(lo / step) * step, b = Math.ceil(hi / step) * step, t = [];
  for (let v = a; v <= b + step / 2; v += step) t.push(+v.toFixed(10));
  return { lo: a, hi: b, step, ticks: t };
}
const fmt = (v) => String(+v.toPrecision(4)).replace('-', '−');

// Returns { X, Y, svg } where X and Y map data to pixels and svg is the frame markup.
// opts: W, H, xr [lo, hi], yr [lo, hi], xlabel, ylabel (plain text)
export function frame({ W = 640, H = 300, xr, yr, xlabel = '', ylabel = '' }) {
  const L = 52, R = 14, T = 12, B = 38;
  const xt = niceTicks(xr[0], xr[1]), yt = niceTicks(yr[0], yr[1], 5);
  const X = (v) => L + ((v - xt.lo) / (xt.hi - xt.lo)) * (W - L - R);
  const Y = (v) => H - B - ((v - yt.lo) / (yt.hi - yt.lo)) * (H - T - B);
  let s = '';
  xt.ticks.forEach((v) => { s += `<line x1="${X(v)}" y1="${T}" x2="${X(v)}" y2="${H - B}" stroke="${GRID}"></line><text x="${X(v)}" y="${H - B + 15}" text-anchor="middle" font-size="11" fill="${MID}">${fmt(v)}</text>`; });
  yt.ticks.forEach((v) => { s += `<line x1="${L}" y1="${Y(v)}" x2="${W - R}" y2="${Y(v)}" stroke="${GRID}"></line><text x="${L - 6}" y="${Y(v) + 4}" text-anchor="end" font-size="11" fill="${MID}">${fmt(v)}</text>`; });
  s += `<line x1="${L}" y1="${H - B}" x2="${W - R}" y2="${H - B}" stroke="${INK}" stroke-width="1.5"></line><line x1="${L}" y1="${T}" x2="${L}" y2="${H - B}" stroke="${INK}" stroke-width="1.5"></line>`;
  s += `<text x="${(L + W - R) / 2}" y="${H - 6}" text-anchor="middle" font-size="12" fill="${INK}">${xlabel}</text>`;
  s += `<text transform="translate(13 ${(T + H - B) / 2}) rotate(-90)" text-anchor="middle" font-size="12" fill="${INK}">${ylabel}</text>`;
  return { X, Y, svg: s, box: { L, R, T, B, W, H }, xt, yt,
    invX: (px) => xt.lo + ((px - L) / (W - L - R)) * (xt.hi - xt.lo),
    invY: (py) => yt.lo + ((H - B - py) / (H - T - B)) * (yt.hi - yt.lo) };
}

// Plain-text axis label from a "name, $v$ (unit)" string: strips the dollar signs for SVG text.
export const plain = (s) => String(s || '').replace(/\$/g, '');

// Polyline path for a function over [a, b], clipped to the y range.
export function curve(f, a, b, X, Y, yr, n = 200) {
  let d = '', pen = false;
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n, y = f(x);
    if (!Number.isFinite(y) || y < yr[0] - (yr[1] - yr[0]) * 0.05 || y > yr[1] + (yr[1] - yr[0]) * 0.05) { pen = false; continue; }
    d += `${pen ? 'L' : 'M'}${X(x).toFixed(1)} ${Y(y).toFixed(1)}`; pen = true;
  }
  return d;
}
