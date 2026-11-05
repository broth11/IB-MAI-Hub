// Free response: plain-text box with a symbols bar, then a sample response and a scoring checklist.
import { esc, tex } from '../util.js';

export function render(sec, ctx) {
  const keys = (sec.symbols || ctx.site.frqSymbols || []).map(([title, ch]) => `<button class="frq-key" type="button" title="${esc(title)}" data-ins="${esc(ch)}">${esc(ch)}</button>`).join('');
  const checks = sec.checklist.map((c, i) => `
    <button class="check" role="checkbox" aria-checked="false" data-check="${i}"><span class="box"></span><span>${tex(c)}</span></button>`).join('');
  return `
    <div class="frq-prompt">${tex(sec.prompt)}</div>
    <div class="frq-parts">${sec.parts.map(tex).join('<br>')}</div>
    <div class="frq-box">
      <div class="frq-tools"><span class="lab">Symbols</span><div class="frq-keys">${keys}</div></div>
      <textarea class="input" data-frq placeholder="Type your response in plain text. Insert statistical symbols from the menu above."></textarea>
    </div>
    <div class="small-note">${tex(sec.note || ctx.site.frqNote || '')}</div>
    <div><button class="btn btn-primary" data-frq-toggle>Reveal sample response and scoring checklist</button></div>
    <div class="frq-reveal" data-frq-reveal hidden>
      <div class="frq-sample">${sec.sample.map(tex).join('')}</div>
      <div>
        <div class="frq-score" data-frq-score>Score yourself: 0 of ${sec.checklist.length} points</div>
        ${checks}
      </div>
    </div>`;
}

export function mount(el, sec) {
  const box = el.querySelector('[data-frq]');
  el.querySelectorAll('[data-ins]').forEach((b) => b.addEventListener('click', () => {
    const ch = b.dataset.ins, s = box.selectionStart, e = box.selectionEnd;
    box.value = box.value.slice(0, s) + ch + box.value.slice(e);
    box.focus();
    box.setSelectionRange(s + ch.length, s + ch.length);
  }));

  const reveal = el.querySelector('[data-frq-reveal]');
  const toggle = el.querySelector('[data-frq-toggle]');
  toggle.addEventListener('click', () => {
    reveal.hidden = !reveal.hidden;
    toggle.textContent = reveal.hidden ? 'Reveal sample response and scoring checklist' : 'Hide sample response';
  });

  el.querySelectorAll('[data-check]').forEach((c) => c.addEventListener('click', () => {
    c.setAttribute('aria-checked', String(c.getAttribute('aria-checked') !== 'true'));
    c.querySelector('.box').textContent = c.getAttribute('aria-checked') === 'true' ? '✓' : '';
    const n = el.querySelectorAll('[aria-checked=true]').length;
    el.querySelector('[data-frq-score]').textContent = `Score yourself: ${n} of ${sec.checklist.length} points`;
  }));
}
