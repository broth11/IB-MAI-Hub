// Explorer library: binomial distribution.
// Sliders for n, p, k, an event selector, bars, and the probability, mean and SD.
// Section config: intro, stories {key: text}, initial {n,p,k,mode,story}, presets [{label, sub, n, p, k, mode, story}].
import { esc, tex, pmf } from '../util.js';

const MODES = [['eq', '$P(X=k)$'], ['le', '$P(X\\le k)$'], ['ge', '$P(X\\ge k)$']];

// The side column holds the intro and the story, so the section supplies it.
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
  const modes = MODES.map(([m, label]) => `<button class="ex-mode" data-mode="${m}" aria-pressed="false">${tex(label)}</button>`).join('');
  return `
    <div class="explorer">
      <div class="ex-presets">${presets}</div>
      <div class="ex-sliders">
        <label><span>Trials <span data-n-label></span></span><input type="range" min="1" max="40" step="1" data-n></label>
        <label><span>Probability of success <span data-p-label></span></span><input type="range" min="0.01" max="0.99" step="0.01" data-p></label>
        <label><span>Value <span data-k-label></span></span><input type="range" min="0" max="40" step="1" data-k></label>
      </div>
      <div class="ex-modes">${modes}</div>
      <div class="ex-chart"><svg viewBox="0 0 640 260" role="img" aria-label="Binomial probability bars" data-chart></svg></div>
      <div class="ex-stats">
        <div class="ex-stat"><div class="label" data-event></div><div class="value accent" data-prob></div></div>
        <div class="ex-stat"><div class="label">${tex('$\\text{Mean}=np$')}</div><div class="value" data-mean></div></div>
        <div class="ex-stat"><div class="label">${tex('$\\text{SD}=\\sqrt{np(1-p)}$')}</div><div class="value" data-sd></div></div>
      </div>
    </div>`;
}

export function mount(el, sec) {
  const S = { ...sec.initial };
  const q = (s) => el.querySelector(s);
  const nIn = q('[data-n]'), pIn = q('[data-p]'), kIn = q('[data-k]');

  function paint() {
    const { n, p, mode } = S;
    const k = Math.min(S.k, n);
    S.k = k;
    const a = pmf(n, p);
    const inSet = (i) => (mode === 'eq' ? i === k : mode === 'le' ? i <= k : i >= k);
    const prob = a.reduce((s, v, i) => s + (inSet(i) ? v : 0), 0);
    const maxv = Math.max(...a);
    const slot = 640 / (n + 1);
    const step = n > 24 ? 3 : n > 14 ? 2 : 1;
    let svg = '<line x1="0" y1="220" x2="640" y2="220" stroke="#201e1d" stroke-width="2"></line>';
    a.forEach((v, i) => {
      const h = Math.max(1, (v / maxv) * 190);
      svg += `<rect x="${i * slot + slot * 0.12}" y="${220 - h}" width="${slot * 0.76}" height="${h}" fill="${inSet(i) ? '#ec3013' : '#bab6b6'}"></rect>`;
      svg += `<text x="${i * slot + slot / 2}" y="238" text-anchor="middle" font-size="11" fill="#201e1d">${i % step === 0 ? i : ''}</text>`;
    });
    q('[data-chart]').innerHTML = svg;

    nIn.value = n; pIn.value = p; kIn.max = n; kIn.value = k;
    setTex(q('[data-n-label]'), `$n=${n}$`);
    setTex(q('[data-p-label]'), `$p=${p.toFixed(2)}$`);
    setTex(q('[data-k-label]'), `$k=${k}$`);
    const sym = mode === 'eq' ? '=' : mode === 'le' ? '\\le ' : '\\ge ';
    setTex(q('[data-event]'), `$P(X${sym}${k})$`);
    q('[data-prob]').textContent = prob.toFixed(4);
    q('[data-mean]').textContent = (n * p).toFixed(2);
    q('[data-sd]').textContent = Math.sqrt(n * p * (1 - p)).toFixed(3);
    el.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
  }

  // Replace the contents with a fresh <tex-text> so KaTeX re-renders.
  function setTex(node, text) { node.innerHTML = tex(text); }

  nIn.addEventListener('input', () => { S.n = +nIn.value; paint(); });
  pIn.addEventListener('input', () => { S.p = +pIn.value; paint(); });
  kIn.addEventListener('input', () => { S.k = +kIn.value; paint(); });
  el.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => { S.mode = b.dataset.mode; paint(); }));
  el.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => {
    const p = sec.presets[Number(b.dataset.preset)];
    Object.assign(S, { n: p.n, p: p.p, k: p.k, mode: p.mode, story: p.story });
    const story = document.querySelector('#s-' + sec.id + ' [data-story]');
    if (story) story.innerHTML = tex(sec.stories[p.story]);
    paint();
  }));
  paint();
}
