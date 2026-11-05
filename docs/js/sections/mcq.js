// Multiple choice with instant feedback: red ✕ on a wrong pick, green ✓ on the correct option.
import { tex, fmtTime } from '../util.js';

const L = ['A', 'B', 'C', 'D'];

export function renderSide(sec) {
  return `<div class="side-copy" data-score>${sec.questions.length} questions. Feedback appears after each answer.</div>`;
}

export function render(sec) {
  const qs = sec.questions.map((q, qi) => `
    <div class="q" data-q="${qi}">
      <div class="eyebrow">Question ${qi + 1}</div>
      <div class="stem">${tex(q.stem)}</div>
      ${q.opts.map((t, oi) => `
        <button class="opt" data-q="${qi}" data-o="${oi}">
          <span class="letter">${L[oi]}</span><span class="txt">${tex(t)}</span><span class="mk"></span>
        </button>`).join('')}
      <div class="explain" data-explain hidden></div>
    </div>`).join('');
  return `<div class="mcq-list">${qs}</div>`;
}

export function mount(el, sec, ctx) {
  const answers = {};
  const score = document.querySelector('#s-' + sec.id + ' [data-score]');

  el.querySelectorAll('.opt').forEach((btn) => btn.addEventListener('click', () => {
    const qi = Number(btn.dataset.q), oi = Number(btn.dataset.o);
    if (answers[qi] !== undefined) return;
    answers[qi] = oi;
    const q = sec.questions[qi];
    const wrap = el.querySelector(`.q[data-q="${qi}"]`);
    wrap.querySelectorAll('.opt').forEach((b, i) => {
      b.classList.add('is-locked');
      if (i === q.ok) { b.classList.add('is-correct'); b.querySelector('.mk').textContent = '✓'; }
      else if (i === oi) { b.classList.add('is-wrong'); b.querySelector('.mk').textContent = '✕'; }
    });
    const right = oi === q.ok;
    const explain = wrap.querySelector('[data-explain]');
    explain.innerHTML = `<b>${right ? 'Correct.' : 'Not quite.'}</b> ${tex(q.why[oi] + (right ? '' : ' Correct answer ' + L[q.ok] + ': ' + q.why[q.ok]))}
      <button class="btn btn-ghost" data-seek="${q.seek}">Video ${fmtTime(q.seek)}</button>`;
    explain.hidden = false;
    const done = Object.keys(answers).length;
    const correct = Object.entries(answers).filter(([i, a]) => sec.questions[i].ok === a).length;
    if (score) score.textContent = `${correct} correct of ${done} answered`;
  }));
}
