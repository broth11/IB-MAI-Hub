// Exam wording and traps: "Weak" in quoted italics, "Better" below, video link in its own row.
import { esc, tex, fmtTime } from '../util.js';

export function render(sec) {
  const traps = sec.traps.map((t) => `
    <div class="trap">
      <div><div class="eyebrow">${esc(t.kind)}</div><div class="ttitle">${tex(t.title)}</div></div>
      <div class="pair">
        <div class="weak"><div class="lbl">✕ Weak</div>${tex('“' + t.weak + '”')}</div>
        <div><div class="lbl">✓ Better</div>${tex(t.better)}</div>
      </div>
      <div class="foot"><button class="btn btn-ghost" data-seek="${t.seek}">Video ${fmtTime(t.seek)}</button></div>
    </div>`).join('');
  return `<div class="traps">${traps}</div>`;
}
export function mount() {}
