// Desmos walkthrough: an empty calculator plus guided steps. No button loads a solution.
import { esc, tex, fmtTime } from '../util.js';

export function render(sec, ctx) {
  const steps = sec.steps.map((d, i) => `
    <div class="dstep">
      <div class="row1"><span class="num">${i + 1}</span><span class="stitle">${tex(d.title)}</span></div>
      <div class="line"><b>Suppose</b> ${tex(d.suppose)}</div>
      <div class="line"><b>To do that,</b> ${tex(d.how)}</div>
      <div class="line"><b>Observe.</b> ${tex(d.observe)}</div>
      <button class="bare reveal" data-reveal="${i}" aria-expanded="false">Show expected result</button>
      <div class="expected" data-expected="${i}" hidden><b>Expected:</b> ${tex(d.expected)}</div>
      <div class="go"><button class="btn btn-ghost" data-seek="${d.seek}">Video ${fmtTime(d.seek)}</button></div>
    </div>`).join('');
  return `
    <div class="desmos-intro">${tex(sec.intro)}</div>
    <div class="desmos-wrap">
      <div class="desmos-steps">${steps}</div>
      <div class="desmos-calc-col">
        <div class="desmos-calc" data-calc></div>
        <div class="desmos-actions">
          <button class="btn btn-secondary" data-clear>Clear calculator</button>
          <span class="small-note">${tex(sec.note || ctx.site.calculator.examNote || '')}</span>
        </div>
      </div>
    </div>`;
}

let loading = null;
function loadDesmos(cfg) {
  if (window.Desmos) return Promise.resolve(window.Desmos);
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = `${cfg.desmosSrc}?apiKey=${encodeURIComponent(cfg.desmosApiKey)}`;
      s.onload = () => resolve(window.Desmos);
      s.onerror = () => reject(new Error('Desmos failed to load'));
      document.head.appendChild(s);
    });
  }
  return loading;
}

export function mount(el, sec, ctx) {
  let calc = null;
  const host = el.querySelector('[data-calc]');

  el.querySelectorAll('[data-reveal]').forEach((b) => b.addEventListener('click', () => {
    const box = el.querySelector(`[data-expected="${b.dataset.reveal}"]`);
    const show = box.hidden;
    box.hidden = !show;
    b.textContent = show ? 'Hide expected result' : 'Show expected result';
    b.setAttribute('aria-expanded', String(show));
  }));
  el.querySelector('[data-clear]').addEventListener('click', () => { if (calc) calc.setBlank(); });

  // The calculator is created the first time the section opens, so it measures a visible box.
  return {
    onOpen() {
      loadDesmos(ctx.site.calculator).then((Desmos) => {
        if (!calc) calc = Desmos.GraphingCalculator(host, { expressionsTopbar: true, settingsMenu: true, expressions: true });
        else calc.resize();
      }).catch(() => { host.textContent = 'The Desmos calculator could not load. Check your connection and reload.'; });
    }
  };
}
