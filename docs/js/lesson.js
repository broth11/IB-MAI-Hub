// Lesson page: one template that renders any lesson from data/lessons/<n>.json.
// Every section module exports render(sec, ctx), optional renderSide(sec, ctx), and mount(el, sec, ctx).
import './tex-text.js';
import { esc, tex, fmtTime, getJSON, $, $$ } from './util.js';
import { renderTopbar } from './shell.js';
import { seekVideo } from './video.js';
import * as decision from './sections/decision.js';
import * as procedure from './sections/procedure.js';
import * as explorer from './sections/explorer.js';
import * as desmos from './sections/desmos.js';
import * as gdc from './sections/gdc.js';
import * as wording from './sections/wording.js';
import * as frq from './sections/frq.js';

const TYPES = { decision, procedure, explorer, desmos, gdc, wording, frq };
const STACKED = new Set(['desmos', 'gdc']); // header above the content instead of a side column
const TIGHT = new Set(['explorer']);

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const hb = document.getElementById('topbar');
  const hh = hb ? hb.offsetHeight : 140;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - hh + (id === 's-video' ? 14 : 0), behavior: 'smooth' });
}

function notesHtml(sec) {
  return (sec.notes || []).map((n) => `<div class="callout"><b>${esc(n.label || 'Note.')}</b> ${tex(n.text)}</div>`).join('');
}

function sectionHtml(sec, isLast, ctx) {
  const mod = TYPES[sec.type];
  const header = `
    <button class="sec-toggle" data-toggle="${esc(sec.id)}" aria-expanded="false">
      <div class="kicker">${esc(sec.kicker)}</div>
      <h2><span class="mark" aria-hidden="true">+</span>${tex(sec.title)}</h2>
    </button>`;
  const body = `<div class="${STACKED.has(sec.type) ? '' : 'sec-body'}" data-body hidden>${mod.render(sec, ctx)}${notesHtml(sec)}</div>`;
  const classes = `sec${TIGHT.has(sec.type) ? ' sec--tight' : ''}${isLast ? ' sec--last' : ''}`;
  if (STACKED.has(sec.type)) {
    return `<section id="s-${esc(sec.id)}" class="${classes}">${header}${body}</section>`;
  }
  const side = mod.renderSide ? mod.renderSide(sec, ctx) : '';
  return `<section id="s-${esc(sec.id)}" class="${classes}"><div class="sec-grid"><div class="sec-side">${header}${side}</div>${body}</div></section>`;
}

function lessonHtml(L, ctx) {
  const moments = L.moments.map((m) => `
    <button class="moment" data-seek="${m.t}">
      <span class="time">${fmtTime(m.t)}</span>
      <span class="body">
        <span class="eyebrow">${esc(m.type)}</span>
        <span class="mtitle">${tex(m.title)}</span>
        <span class="mtext">${tex(m.text)}</span>
      </span>
    </button>`).join('');
  const yt = `https://www.youtube.com/embed/${L.videoId}?enablejsapi=1&rel=0&modestbranding=1`;
  return `
    <div class="lesson">
      ${L.review && L.review.status !== 'approved' ? '<div class="draft-banner"><b>Draft.</b> This page has not been reviewed yet. Timestamps and wording may change.</div>' : ''}
      <a class="link-btn" href="index.html#unit-${L.unit}">All lessons</a>
      <div class="lesson-head">
        <div>
          <div class="kicker">${esc(ctx.unitLabel)}${L.syllabus && L.syllabus.length ? ' · ' + esc(L.syllabus.join(', ')) : L.topic ? ' · Topic ' + esc(L.topic) : ''}</div>
          <h1>${tex(L.title)}</h1>
        </div>
        <div class="intro">${tex(L.intro)}</div>
      </div>
      <div id="s-video" class="video-sec">
        <div class="video-col">
          <div class="video-frame">
            <iframe id="yt" referrerpolicy="strict-origin-when-cross-origin" src="${yt}" title="${esc(L.videoTitle)}"
              allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
          </div>
          <div class="video-note">Select a key moment to seek the video. If the player shows error 153, open it on YouTube. Source: <a href="https://www.youtube.com/watch?v=${esc(L.videoId)}" target="_blank" rel="noopener">youtube.com/watch?v=${esc(L.videoId)}</a></div>
        </div>
        <div class="moments-col">
          <h2>Key moments</h2>
          <div class="moments-box">${moments}</div>
        </div>
      </div>
      ${L.sections.map((s, i) => sectionHtml(s, i === L.sections.length - 1, ctx)).join('')}
      ${L.footer ? `<div class="page-foot">${tex(L.footer)}</div>` : ''}
    </div>`;
}

function wire(L, ctx) {
  const mounted = {};
  const open = {};

  L.sections.forEach((sec) => {
    const el = document.getElementById('s-' + sec.id);
    mounted[sec.id] = TYPES[sec.type].mount($('[data-body]', el), sec, ctx) || {};
    open[sec.id] = false;
  });

  function setOpen(id, on) {
    open[id] = on;
    const el = document.getElementById('s-' + id);
    $('[data-body]', el).hidden = !on;
    $('.mark', el).textContent = on ? '−' : '+';
    $('[data-toggle]', el).setAttribute('aria-expanded', String(on));
    if (on && mounted[id].onOpen) mounted[id].onOpen();
    updateToggleAll();
  }

  function toggleSection(id) {
    const el = document.getElementById('s-' + id);
    const hb = document.getElementById('topbar');
    const atTop = Math.abs(el.getBoundingClientRect().top - hb.offsetHeight) < 12;
    if (open[id] && !atTop) { scrollToId('s-' + id); return; }
    setOpen(id, !open[id]);
    if (open[id]) setTimeout(() => scrollToId('s-' + id), 60);
  }

  const toggleAllBtn = $('[data-toggle-all]');
  function updateToggleAll() {
    toggleAllBtn.textContent = L.sections.every((s) => open[s.id]) ? 'Collapse all' : 'Expand all';
  }

  document.addEventListener('click', (e) => {
    const seekEl = e.target.closest('[data-seek]');
    if (seekEl) { seekVideo(Number(seekEl.dataset.seek)); scrollToId('s-video'); return; }
    const tog = e.target.closest('[data-toggle]');
    if (tog) { toggleSection(tog.dataset.toggle); return; }
    const tab = e.target.closest('[data-sec-tab]');
    if (tab) {
      const id = tab.dataset.secTab;
      if (id === 'video') { scrollToId('s-video'); return; }
      setOpen(id, true);
      setTimeout(() => scrollToId('s-' + id), 60);
      return;
    }
    if (e.target.closest('[data-toggle-all]')) {
      const all = L.sections.every((s) => open[s.id]);
      L.sections.forEach((s) => setOpen(s.id, !all));
    }
  });
}

async function loadExplorers(L) {
  const names = [...new Set(L.sections.filter((s) => s.type === 'explorer').map((s) => s.explorer))];
  const out = {};
  for (const name of names) {
    if (!/^[a-z0-9-]+$/.test(name || '')) throw new Error(`Bad explorer name "${name}"`);
    out[name] = await import(`./explorers/${name}.js`);
  }
  return out;
}

async function main() {
  const app = document.getElementById('app');
  const bar = document.getElementById('topbar');
  const n = new URLSearchParams(location.search).get('v');
  try {
    const site = await getJSON('data/site.json');
    bar.innerHTML = renderTopbar({ site });
    if (!/^\d+$/.test(n || '')) throw new Error('No lesson chosen.');
    const L = await getJSON(`data/lessons/${n}.json`).catch(() => {
      throw new Error('This lesson does not have a study page yet.');
    });
    for (const sec of L.sections) if (!TYPES[sec.type]) throw new Error(`Unknown section type "${sec.type}"`);
    const unit = site.units.find((u) => u.id === L.unit);
    const ctx = { site, explorers: await loadExplorers(L), unitLabel: unit ? unit.kicker : 'Unit ' + L.unit };
    document.title = `${L.topic} ${L.title} | ${site.course}`;
    const sections = [{ id: 'video', label: 'Video' }, ...L.sections.map((s) => ({ id: s.id, label: s.tab }))];
    bar.innerHTML = renderTopbar({ site, activeUnit: L.unit, crumb: `${unit ? unit.tab : 'Unit ' + L.unit} › ${L.topic} ${L.title}`, sections });
    app.innerHTML = lessonHtml(L, ctx);
    wire(L, ctx);
  } catch (e) {
    app.innerHTML = `<div class="error">${esc(e.message)} <a href="index.html">Back to all lessons</a></div>`;
  }
}
main();
