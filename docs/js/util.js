// Small helpers shared by every page.

export const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Text that may contain $...$ math. Rendered by the <tex-text> element.
export const tex = (t) => `<tex-text text="${esc(t)}"></tex-text>`;

export const fmtTime = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');

// Binomial pmf as an array indexed by k = 0..n.
export function pmf(n, p) {
  const a = [Math.pow(1 - p, n)];
  for (let k = 1; k <= n; k++) a[k] = a[k - 1] * ((n - k + 1) / k) * (p / (1 - p));
  return a;
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${url} (${res.status})`);
  return res.json();
}

// Standard normal CDF (Abramowitz and Stegun 7.1.26, error below 1.5e-7).
export function normalCdf(z) {
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-(z * z) / 2);
  return z >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y);
}

export const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
