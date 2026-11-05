// Decision check: optional condition cards, then a scenario table with a video link per row.
import { esc, tex, fmtTime } from '../util.js';

export function render(sec) {
  const cards = (sec.cards || []).map((c) => `
    <div class="bits-card">
      <div class="letter">${esc(c.letter)}</div>
      <div class="name">${tex(c.name)}</div>
      <div class="text">${tex(c.text)}</div>
    </div>`).join('');
  const head = [...sec.columns, 'Video'].map((c) => `<th>${tex(c)}</th>`).join('');
  const rows = (sec.rows || []).map((r) => `
    <tr>
      ${r.cells.map((c, i) => `<td${i === sec.verdictColumn ? ' class="verdict"' : ''}>${tex(c)}</td>`).join('')}
      <td>${r.seek != null ? `<button class="btn btn-ghost" data-seek="${r.seek}">${fmtTime(r.seek)}</button>` : ''}</td>
    </tr>`).join('');
  return `
    ${cards ? `<div class="bits-cards">${cards}</div>` : ''}
    ${rows ? `<div class="table-wrap"><table class="table"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>` : ''}`;
}
export function mount() {}
