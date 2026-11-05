// Home page: choose a topic, then a syllabus code (each lists its videos; no video means a gap). Fits one screen; only the list scrolls.
import './tex-text.js';
import { esc, getJSON } from './util.js';
import { renderTopbar } from './shell.js';

const STATUS = { live: 'Study page', next: 'Next', draft: 'Draft', transcript: 'Transcript only' };

function unitFromHash() {
  const m = location.hash.match(/^#unit-(\d+)$/);
  return m ? Number(m[1]) : null;
}

// Lessons are listed under every syllabus code they cover. A code with no lesson is a gap.
function byCode(index) {
  const m = {};
  index.lessons.forEach((l) => (l.syllabus || []).forEach((c) => { (m[c] = m[c] || []).push(l); }));
  return m;
}

function videoItem(l, code) {
  const also = (l.syllabus || [])[0] !== code ? '<span class="also">also covers this</span>' : '';
  const inner = `<span class="vname">${esc(l.title)}</span>${also}<span class="status">${STATUS[l.status] || ''}</span>`;
  return l.status === 'live'
    ? `<a class="vid is-live" href="lesson.html?v=${l.n}">${inner}</a>`
    : `<div class="vid">${inner}</div>`;
}

function codeRow(c, map) {
  const vids = map[c.code] || [];
  return `
    <div class="syl-row${vids.length ? '' : ' is-gap'}">
      <span class="code">${esc(c.code)}</span>
      <span class="name">${esc(c.title)}</span>
      <div class="vids">${vids.length ? vids.map((l) => videoItem(l, c.code)).join('') : '<span class="gap-tag">No video yet</span>'}</div>
    </div>`;
}

function levelBlock(label, codes, map) {
  return codes.length ? `<div class="level-head">${label}</div>${codes.map((c) => codeRow(c, map)).join('')}` : '';
}

function unitPane(u, syl, map) {
  if (u.special === 'gaps') {
    const gaps = syl.codes.filter((c) => !(map[c.code] || []).length);
    const body = [1, 2, 3, 4, 5].map((t) => {
      const g = gaps.filter((c) => c.topic === t);
      return g.length ? `<div class="level-head">Topic ${t}</div>${g.map((c) => codeRow(c, map)).join('')}` : '';
    }).join('');
    return `
      <div class="unit-pane">
        <div class="unit-head">
          <div class="kicker">${esc(u.kicker)}</div>
          <h2>${esc(u.name)}</h2>
          <div class="unit-count">${gaps.length} of ${syl.codes.length} syllabus codes have no video</div>
        </div>
        <div class="lesson-rows">${body}</div>
      </div>`;
  }
  const codes = syl.codes.filter((c) => c.topic === u.id);
  const gaps = codes.filter((c) => !(map[c.code] || []).length).length;
  return `
    <div class="unit-pane">
      <div class="unit-head">
        <div class="kicker">${esc(u.kicker)}</div>
        <h2>${esc(u.name)}</h2>
        <div class="unit-count">${codes.length} syllabus codes, ${gaps} with no video</div>
      </div>
      <div class="lesson-rows">
        ${levelBlock('Standard level (SL)', codes.filter((c) => c.level === 'SL'), map)}
        ${levelBlock('Additional higher level (AHL)', codes.filter((c) => c.level === 'AHL'), map)}
      </div>
    </div>`;
}

function render(site, index, syl) {
  const unit = unitFromHash();
  document.title = site.siteTitle;
  document.getElementById('topbar').innerHTML = renderTopbar({ site, activeUnit: unit });
  const u = site.units.find((x) => x.id === unit);
  const pane = u ? unitPane(u, syl, byCode(index)) : '<div class="home-prompt">Choose a topic, then a syllabus code</div>';
  document.getElementById('app').innerHTML = `
    <div class="home">
      <div class="home-intro">
        <h1>${esc(site.home.headline)}</h1>
        <div class="lede">${esc(site.home.lede)}</div>
        ${site.home.pilot ? `<div class="pilot">${esc(site.home.pilot)}</div>` : ''}
      </div>
      <div class="home-list">${pane}</div>
    </div>`;
}

Promise.all([getJSON('data/site.json'), getJSON('data/lessons.json'), getJSON('data/syllabus.json')]).then(([site, index, syl]) => {
  render(site, index, syl);
  window.addEventListener('hashchange', () => render(site, index, syl));
}).catch((e) => {
  document.getElementById('app').innerHTML = `<div class="error">${esc(e.message)}</div>`;
});
