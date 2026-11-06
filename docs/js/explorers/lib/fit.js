// Shared statistics for the regression explorers: correlation, ranks, and least-squares fits.
// Linear, quadratic and cubic are exact least squares. Exponential and power are fitted on logs, as the
// fx-CG50 does. Sine and logistic are least squares in the original units, found by Levenberg-Marquardt.
// Every fit returns { name, params, f, ssRes, r2, mse, k }: ssRes is in the original units, r2 = 1 - SSres/SStot,
// mse = SSres / (n - k) with k the number of parameters.

export const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;

export function pearson(x, y) {
  const mx = mean(x), my = mean(y);
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < x.length; i++) { const dx = x[i] - mx, dy = y[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
  return sxx && syy ? sxy / Math.sqrt(sxx * syy) : NaN;
}

// Ranks from smallest (1) to largest; tied values share the average of the ranks they would take.
export function ranks(a) {
  const idx = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]);
  const r = new Array(a.length);
  for (let i = 0; i < idx.length;) {
    let j = i;
    while (j + 1 < idx.length && Math.abs(idx[j + 1][0] - idx[i][0]) < 1e-12) j++;
    const avg = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) r[idx[k][1]] = avg;
    i = j + 1;
  }
  return r;
}
export const spearman = (x, y) => pearson(ranks(x), ranks(y));

// Line of y on x: y = a x + b (IB letters).
export function linreg(x, y) {
  const mx = mean(x), my = mean(y);
  let sxy = 0, sxx = 0;
  for (let i = 0; i < x.length; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; }
  const a = sxy / sxx;
  return { a, b: my - a * mx };
}

function solve(A, b) { // Gaussian elimination with partial pivoting
  const n = b.length, M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    if (Math.abs(M[c][c]) < 1e-14) return null;
    for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
  }
  return M.map((row, i) => row[n] / row[i]);
}

function polyfit(x, y, deg) { // returns coefficients highest power first
  const k = deg + 1, A = Array.from({ length: k }, () => new Array(k).fill(0)), b = new Array(k).fill(0);
  for (let i = 0; i < x.length; i++) {
    const p = Array.from({ length: k }, (_, j) => x[i] ** (deg - j));
    for (let r = 0; r < k; r++) { b[r] += p[r] * y[i]; for (let c = 0; c < k; c++) A[r][c] += p[r] * p[c]; }
  }
  return solve(A, b);
}

// Levenberg-Marquardt on a model g(x, params), numeric Jacobian.
function lm(x, y, g, p0, iters = 400) {
  let p = [...p0], lambda = 1e-2;
  const sse = (q) => x.reduce((s, xi, i) => { const e = y[i] - g(xi, q); return s + e * e; }, 0);
  let cur = sse(p);
  for (let it = 0; it < iters; it++) {
    const n = p.length, JTJ = Array.from({ length: n }, () => new Array(n).fill(0)), JTr = new Array(n).fill(0);
    for (let i = 0; i < x.length; i++) {
      const gi = g(x[i], p), r = y[i] - gi, J = new Array(n);
      for (let j = 0; j < n; j++) { const h = 1e-6 * Math.max(1, Math.abs(p[j])); const q = [...p]; q[j] += h; J[j] = (g(x[i], q) - gi) / h; }
      for (let a = 0; a < n; a++) { JTr[a] += J[a] * r; for (let b = 0; b < n; b++) JTJ[a][b] += J[a] * J[b]; }
    }
    let improved = false;
    for (let tries = 0; tries < 12; tries++) {
      const A = JTJ.map((row, i) => row.map((v, j) => v + (i === j ? lambda * (v || 1e-9) : 0)));
      const d = solve(A, JTr);
      if (!d) { lambda *= 10; continue; }
      const q = p.map((v, i) => v + d[i]), s = sse(q);
      if (Number.isFinite(s) && s < cur) { p = q; const done = cur - s < 1e-12 * (1 + cur); cur = s; lambda = Math.max(lambda / 10, 1e-12); improved = true; if (done) it = iters; break; }
      lambda *= 10;
    }
    if (!improved) break;
  }
  return p;
}

function finish(name, x, y, f, params, k) {
  const my = mean(y);
  let ssRes = 0, ssTot = 0;
  for (let i = 0; i < x.length; i++) { ssRes += (y[i] - f(x[i])) ** 2; ssTot += (y[i] - my) ** 2; }
  return { name, params, f, ssRes, r2: 1 - ssRes / ssTot, mse: ssRes / (x.length - k), k };
}

// Starting values for the sine fit: d from the mean, a from the spread, b from the zero crossings, then the best phase on a grid.
function sineStart(x, y) {
  const d = mean(y), a = (Math.max(...y) - Math.min(...y)) / 2;
  const order = x.map((v, i) => i).sort((i, j) => x[i] - x[j]);
  let cross = 0; for (let t = 1; t < order.length; t++) if ((y[order[t - 1]] - d) * (y[order[t]] - d) < 0) cross++;
  const span = x[order[order.length - 1]] - x[order[0]];
  const b0 = Math.max(cross, 1) * Math.PI / span;
  let best = null;
  for (const b of [b0 * 0.8, b0, b0 * 1.25]) for (let c = -Math.PI; c < Math.PI; c += Math.PI / 12) {
    const s = x.reduce((acc, xi, i) => acc + (y[i] - (a * Math.sin(b * xi + c) + d)) ** 2, 0);
    if (!best || s < best.s) best = { s, p: [a, b, c, d] };
  }
  return best.p;
}

export const MODELS = {
  linear: { label: 'Linear', form: 'y=ax+b', k: 2 },
  quadratic: { label: 'Quadratic', form: 'y=ax^2+bx+c', k: 3 },
  cubic: { label: 'Cubic', form: 'y=ax^3+bx^2+cx+d', k: 4 },
  exponential: { label: 'Exponential', form: 'y=ab^x', k: 2 },
  power: { label: 'Power', form: 'y=ax^b', k: 2 },
  sine: { label: 'Sine', form: 'y=a\\sin(bx+c)+d', k: 4 },
  logistic: { label: 'Logistic', form: 'y=\\dfrac{L}{1+Ce^{-kx}}', k: 3 },
};

export function fitModel(name, x, y) {
  const k = MODELS[name].k;
  if (name === 'linear' || name === 'quadratic' || name === 'cubic') {
    const deg = { linear: 1, quadratic: 2, cubic: 3 }[name];
    const c = polyfit(x, y, deg);
    return finish(name, x, y, (t) => c.reduce((s, ci) => s * t + ci, 0), c, k);
  }
  if (name === 'exponential') {
    if (y.some((v) => v <= 0)) return null;
    const { a: m, b: c } = linreg(x, y.map(Math.log)); const A = Math.exp(c), B = Math.exp(m);
    return finish(name, x, y, (t) => A * B ** t, [A, B], k);
  }
  if (name === 'power') {
    if (y.some((v) => v <= 0) || x.some((v) => v <= 0)) return null;
    const { a: m, b: c } = linreg(x.map(Math.log), y.map(Math.log)); const A = Math.exp(c);
    return finish(name, x, y, (t) => A * t ** m, [A, m], k);
  }
  if (name === 'sine') {
    const g = (t, p) => p[0] * Math.sin(p[1] * t + p[2]) + p[3];
    const p = lm(x, y, g, sineStart(x, y));
    return finish(name, x, y, (t) => g(t, p), p, k);
  }
  if (name === 'logistic') {
    if (y.some((v) => v <= 0)) return null;
    const L0 = Math.max(...y) * 1.1, order = x.map((v, i) => i).sort((i, j) => x[i] - x[j]);
    const { a: m, b: c } = linreg(order.map((i) => x[i]), order.map((i) => Math.log(L0 / Math.min(y[i], L0 * 0.99) - 1)));
    const g = (t, p) => p[0] / (1 + p[1] * Math.exp(-p[2] * t));
    const p = lm(x, y, g, [L0, Math.exp(c), -m]);
    return finish(name, x, y, (t) => g(t, p), p, k);
  }
  return null;
}

// 3 significant figures, as an IB answer; the minus sign is a true minus.
export function sf(v, n = 3) {
  if (!Number.isFinite(v)) return '–';
  if (Math.abs(v) < 1e-9) return '0';
  const s = Number(v.toPrecision(n));
  const abs = Math.abs(s);
  const txt = abs >= 1e6 || abs < 1e-4 ? s.toExponential(n - 1).replace('e', '×10^') : String(s);
  return txt.replace('-', '−');
}

// Equation of a fitted model in TeX, coefficients to 3 s.f., in the given variable names.
export function modelTex(fit, xv = 'x', yv = 'y') {
  const P = fit.params, t = (v) => sf(v).replace('−', '-');
  const term = (c, pow, first) => {
    const s = sf(Math.abs(c)).replace('−', ''); const sign = c < 0 ? '-' : first ? '' : '+';
    return `${sign}${s}${pow === 0 ? '' : pow === 1 ? xv : `${xv}^{${pow}}`}`;
  };
  switch (fit.name) {
    case 'linear': return `${yv}=${term(P[0], 1, true)}${term(P[1], 0)}`;
    case 'quadratic': return `${yv}=${term(P[0], 2, true)}${term(P[1], 1)}${term(P[2], 0)}`;
    case 'cubic': return `${yv}=${term(P[0], 3, true)}${term(P[1], 2)}${term(P[2], 1)}${term(P[3], 0)}`;
    case 'exponential': return `${yv}=${t(P[0])}\\times${t(P[1])}^{${xv}}`;
    case 'power': return `${yv}=${t(P[0])}${xv}^{${t(P[1])}}`;
    case 'sine': return `${yv}=${t(P[0])}\\sin(${t(P[1])}${xv}${P[2] < 0 ? '-' : '+'}${sf(Math.abs(P[2]))})${P[3] < 0 ? '-' : '+'}${sf(Math.abs(P[3]))}`;
    case 'logistic': return `${yv}=\\dfrac{${t(P[0])}}{1+${t(P[1])}e^{-${t(P[2])}${xv}}}`;
    default: return '';
  }
}
