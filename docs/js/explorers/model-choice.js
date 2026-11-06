// Explorer library: choose the model (IB MAI AHL 4.13).
// Pick a data set, then a model: linear, quadratic, cubic, exponential, power, sine or logistic. The page draws the
// least-squares curve over the data (and past it, dashed, so students see how each model behaves outside the data),
// with the equation, R^2, SS_res and MSE. Fitted models collect in a comparison table. Reveal names the best model
// and the reason from the context.
// Section config: intro, sets [{key, label, xv, yv, xname, yname, x, y, best, reason}]
// R^2 here is 1 - SS_res/SS_tot on the original data. For exponential and power models the fx-CG50 reports r^2
// of its log fit instead, so its value can differ slightly. MSE = SS_res / (n - k), k = number of parameters.
import { esc, tex } from '../util.js';
import { fitModel, modelTex, MODELS, sf } from './lib/fit.js';
import { frame, curve, plain, INK, ACC, MID } from './lib/plot.js';

const W = 640, H = 290, ORDER = ['linear', 'quadratic', 'cubic', 'exponential', 'power', 'sine', 'logistic'];

export function renderSide(sec) {
  return `<div class="side-copy">${tex(sec.intro)}</div><div class="side-story"><div class="kicker">Data</div><div class="text" data-story></div></div>`;
}

export function render(sec) {
  const sets = sec.sets.map((s, i) => `<button class="btn btn-secondary" data-set="${i}"><span>${i + 1}</span>${esc(s.label)}</button>`).join('');
  const models = ORDER.map((m) => `<button class="ex-mode" data-model="${m}" aria-pressed="false">${MODELS[m].label}</button>`).join('');
  return `
    <div class="explorer">
      <div class="ex-presets ex-cols-${sec.sets.length}">${sets}</div>
      <div class="ex-actions ex-cols-${ORDER.length}">${models}</div>
      <div class="ex-chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Data with a fitted regression curve" data-chart></svg></div>
      <div class="ex-note" data-note></div>
      <div class="ex-stats ex-cols-4">
        <div class="ex-stat"><div class="label" data-eq-label>Model</div><div class="value small" data-eq></div></div>
        <div class="ex-stat"><div class="label">R2</div><div class="value accent" data-r2></div></div>
        <div class="ex-stat"><div class="label">SSres</div><div class="value" data-ss></div></div>
        <div class="ex-stat"><div class="label">MSE</div><div class="value" data-mse></div></div>
      </div>
      <div class="mc-foot">
        <div class="mc-table" data-table></div>
        <button class="btn btn-primary" data-mc-reveal>Reveal the best model</button>
      </div>
    </div>`;
}

export function mount(el, sec) {
  const q = (s) => el.querySelector(s);
  const labels = el.querySelectorAll('.ex-stat .label');
  labels[1].innerHTML = tex('$R^2$'); labels[2].innerHTML = tex('$SS_{res}$');
  labels[3].innerHTML = tex('MSE $=\\dfrac{SS_{res}}{n-k}$');
  const state = { set: 0, model: null, tried: {}, reveal: false };
  const story = () => el.closest('.ex-wrap, section') && el.closest('.ex-wrap, section').querySelector('[data-story]');

  function paint() {
    const S = sec.sets[state.set];
    const fits = state.tried;
    const fit = state.model ? fits[state.model] : null;
    const xs = S.x, ys = S.y, xlo = Math.min(...xs), xhi = Math.max(...xs), ylo = Math.min(...ys), yhi = Math.max(...ys);
    const xr = [xlo - (xhi - xlo) * 0.12, xhi + (xhi - xlo) * 0.12], yr = [ylo >= 0 ? 0 : ylo - (yhi - ylo) * 0.08, yhi + (yhi - ylo) * 0.25];
    const F = frame({ W, H, xr, yr, xlabel: plain(S.xname), ylabel: plain(S.yname) });
    let s = F.svg + `<defs><clipPath id="mc-clip"><rect x="${F.box.L}" y="${F.box.T}" width="${W - F.box.L - F.box.R}" height="${H - F.box.T - F.box.B}"></rect></clipPath></defs>`;
    s += `<rect x="${F.X(xlo)}" y="${F.box.T}" width="${F.X(xhi) - F.X(xlo)}" height="${H - F.box.T - F.box.B}" fill="#fff" opacity="0.55"></rect>`;
    if (fit) {
      const yr2 = [F.yt.lo, F.yt.hi];
      s += `<g clip-path="url(#mc-clip)"><path d="${curve(fit.f, F.xt.lo, xlo, F.X, F.Y, yr2, 60)}" fill="none" stroke="${ACC}" stroke-width="2" stroke-dasharray="5 5"></path>`;
      s += `<path d="${curve(fit.f, xhi, F.xt.hi, F.X, F.Y, yr2, 60)}" fill="none" stroke="${ACC}" stroke-width="2" stroke-dasharray="5 5"></path>`;
      s += `<path d="${curve(fit.f, xlo, xhi, F.X, F.Y, yr2)}" fill="none" stroke="${ACC}" stroke-width="3"></path>`;
      xs.forEach((x, i) => { s += `<line x1="${F.X(x)}" y1="${F.Y(ys[i])}" x2="${F.X(x)}" y2="${F.Y(fit.f(x))}" stroke="${MID}" stroke-width="1.5"></line>`; });
      s += '</g>';
    }
    xs.forEach((x, i) => { s += `<circle cx="${F.X(x)}" cy="${F.Y(ys[i])}" r="5" fill="${INK}"></circle>`; });
    s += `<text x="${F.X(xlo) + 4}" y="${F.box.T + 14}" font-size="11" fill="${MID}">data range</text>`;
    q('[data-chart]').innerHTML = s;

    const st = story(); if (st) st.innerHTML = tex(`${S.label}: ${S.yname} against ${S.xname}, ${xs.length} values.`);
    q('[data-eq-label]').innerHTML = fit ? tex(`${MODELS[fit.name].label}: $${MODELS[fit.name].form}$`) : 'Model';
    q('[data-eq]').innerHTML = fit ? tex(`$${modelTex(fit, S.xv, S.yv)}$`) : 'Choose a model';
    q('[data-r2]').textContent = fit ? sf(fit.r2, 4) : '–';
    q('[data-ss]').textContent = fit ? sf(fit.ssRes) : '–';
    q('[data-mse]').textContent = fit ? sf(fit.mse) : '–';
    const best = S.best, names = ORDER.filter((m) => fits[m]);
    q('[data-table]').innerHTML = names.length ? `<table class="table mc-t"><tr><th>Model</th>${names.map((m) => `<th${state.reveal && m === best ? ' class="is-best"' : ''}>${MODELS[m].label}</th>`).join('')}</tr>
      <tr><td>${tex('$R^2$')}</td>${names.map((m) => `<td>${sf(fits[m].r2, 4)}</td>`).join('')}</tr>
      <tr><td>${tex('$SS_{res}$')}</td>${names.map((m) => `<td>${sf(fits[m].ssRes)}</td>`).join('')}</tr></table>`
      : '<div class="small-note">Try at least two models to compare them here.</div>';
    q('[data-note]').innerHTML = state.reveal ? tex(`Best model: ${MODELS[best].label}. ${S.reason}`)
      : fit ? tex('Solid curve: inside the data. Dashed: what the model predicts outside it. Grey lines are the residuals.')
        : tex('Which model would you choose? Look at the shape and think about the context.');
    q('[data-note]').classList.toggle('is-reveal', state.reveal);
    el.querySelectorAll('[data-model]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.model === state.model)));
    el.querySelectorAll('[data-set]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.set === state.set)));
    el.querySelectorAll('[data-model]').forEach((b) => { b.disabled = fitModel(b.dataset.model, xs, ys) === null; });
    q('[data-mc-reveal]').textContent = state.reveal ? 'Hide the answer' : 'Reveal the best model';
  }

  el.querySelectorAll('[data-model]').forEach((b) => b.addEventListener('click', () => {
    const S = sec.sets[state.set], m = b.dataset.model;
    if (!state.tried[m]) state.tried[m] = fitModel(m, S.x, S.y);
    state.model = m; paint();
  }));
  el.querySelectorAll('[data-set]').forEach((b) => b.addEventListener('click', () => {
    Object.assign(state, { set: +b.dataset.set, model: null, tried: {}, reveal: false }); paint();
  }));
  q('[data-mc-reveal]').addEventListener('click', () => { state.reveal = !state.reveal; paint(); });
  paint();
}
