// Exam-style question (IB MAI Hub): marks shown per part, work on paper, then a model markscheme with
// M, A and R marks the student ticks off. The markscheme is written for this page in the style of IB markschemes.
// Section config: paper, gdc (bool), total, prompt, parts [{text, marks}], markscheme [{part, lines:[{text, mark}]}], note.
import { esc, tex } from '../util.js';

const value = (code) => Number((/(\d+)/.exec(code) || [0, 0])[1]);

export function render(sec) {
  const parts = sec.parts.map((p) => `<div class="q-part">${tex(p.text)} <span class="q-marks">[${p.marks}]</span></div>`).join('');
  const ms = sec.markscheme.map((blk) => {
    const sub = blk.lines.reduce((s, l) => s + value(l.mark), 0);
    return `
      <div class="q-ms">
        <div class="q-mshead">${esc(blk.part)} <span>[${sub} ${sub === 1 ? 'mark' : 'marks'}]</span></div>
        ${blk.lines.map((l) => `
          <button class="check q-line" role="checkbox" aria-checked="false" data-mark="${value(l.mark)}">
            <span class="box"></span><span class="q-text">${tex(l.text)}</span><span class="q-code">${esc(l.mark)}</span>
          </button>`).join('')}
      </div>`;
  }).join('');
  return `
    <div class="q-head"><span>${esc(sec.paper)}</span><span>[Maximum mark: ${sec.total}]</span><span>${sec.gdc ? 'GDC allowed' : 'No GDC'}</span></div>
    <div class="frq-prompt">${tex(sec.prompt)}</div>
    <div class="q-parts">${parts}</div>
    <div class="small-note">${tex(sec.note || 'Work it on paper first, with the GDC if you like. Then check your marks.')}</div>
    <div><button class="btn btn-primary" data-q-toggle>Show the markscheme</button></div>
    <div class="q-reveal" data-q-reveal hidden>
      <div class="frq-score" data-q-score>Your marks: 0 of ${sec.total}</div>
      ${ms}
      <div class="small-note">Model markscheme written for this page, in the style of IB markschemes. Tick each mark you earned. R1 comes before the A1 it supports.</div>
    </div>`;
}

export function mount(el, sec) {
  const reveal = el.querySelector('[data-q-reveal]');
  const toggle = el.querySelector('[data-q-toggle]');
  toggle.addEventListener('click', () => {
    reveal.hidden = !reveal.hidden;
    toggle.textContent = reveal.hidden ? 'Show the markscheme' : 'Hide the markscheme';
  });
  el.querySelectorAll('.q-line').forEach((c) => c.addEventListener('click', () => {
    const on = c.getAttribute('aria-checked') !== 'true';
    c.setAttribute('aria-checked', String(on));
    c.querySelector('.box').textContent = on ? '✓' : '';
    const n = [...el.querySelectorAll('.q-line[aria-checked=true]')].reduce((s, x) => s + Number(x.dataset.mark), 0);
    el.querySelector('[data-q-score]').textContent = `Your marks: ${n} of ${sec.total}`;
  }));
}
