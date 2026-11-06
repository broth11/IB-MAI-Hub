// The sticky top bar shared by the home page and the lesson pages.
import { esc } from './util.js';

export function renderTopbar({ site, activeUnit = null, crumb = '', sections = null, toggleAll = true }) {
  const tabs = site.units.map((u) =>
    `<a class="unit-tab${u.id === activeUnit ? ' is-active' : ''}" href="index.html#unit-${u.id}">${esc(u.tab)}</a>`
  ).join('');
  const secBar = sections ? `
    <div class="sec-bar">
      ${sections.map((s) => `<button class="sec-tab" data-sec-tab="${esc(s.id)}">${esc(s.label)}</button>`).join('')}
      ${toggleAll ? '<button class="btn btn-ghost toggle-all" data-toggle-all>Expand all</button>' : ''}
    </div>` : '';
  return `
    <div class="topbar-row">
      <a class="site-title" href="index.html">${esc(site.siteTitle)}</a>
      <div class="crumb">${esc(crumb)}</div>
    </div>
    <nav class="unit-tabs" aria-label="Units">${tabs}</nav>
    ${secBar}`;
}
