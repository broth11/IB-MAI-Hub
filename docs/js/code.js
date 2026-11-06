// Code page: one page per IB syllabus code, rendered from data/codes/<slug>.json.
// Learn mode shows every section; Revise mode shows only the sections marked revise in site.json codePage.
// Only items with status "approved" are shown; drafts stay in the data until Ben approves them.
import './tex-text.js';
import { esc, tex, fmtTime, getJSON, $, $$ } from './util.js';
import { seekVideo } from './video.js';
import { renderTopbar } from './shell.js';

const ok = (arr) => (arr || []).filter((x) => x.status === 'approved');
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
};

// [F2] CALC and [MENU] become keycaps; the rest goes through tex() so math still renders.
function keyed(t) {
  return t.split(/(\[[^\]]+\])/g).map((p) => (/^\[[^\]]+\]$/.test(p) ? `<kbd class="key">${esc(p.slice(1, -1))}</kbd>` : p ? tex(p) : '')).join('');
}

const R = {
  video(C, ctx) {
    if (C.videos.status !== 'approved' || !C.videos.items.length) return '';
    const v = C.videos.items; const cur = v[ctx.vid || 0];
    const tabs = v.length > 1 ? `<div class="vid-tabs">${v.map((x, i) => `<button class="vid-tab${x === cur ? ' is-on' : ''}" data-vid="${i}">${esc(x.title)}${x.partial ? ' <span class="also">part</span>' : ''}</button>`).join('')}</div>` : '';
    const notes = [...(C.videos.sharedNote ? [C.videos.sharedNote] : []), ...(cur.notes || [])];
    const LBL = { omission: 'Not in the video', error: 'Correction' };
    const notesHtml = notes.length ? `<div class="corrections"><div class="corr-head">Before you rely on this video</div>${notes.map((c) => `
      <div class="corr"><span class="corr-badge corr-${esc(c.kind)}">${LBL[c.kind] || 'Note'}</span>
        <div class="corr-title">${tex(c.title)}</div><div class="corr-text">${tex(c.text)}</div>
        <div class="corr-write"><b>Write:</b> ${tex(c.write)}</div>
        ${c.section && ctx.shown.has(c.section) ? `<button class="link-btn" data-sec-tab="${esc(c.section)}">Go to ${esc(ctx.tabName[c.section])}</button>` : ''}</div>`).join('')}</div>` : '';
    const moments = (cur.moments || []).map((m) => `
      <button class="moment" data-seek="${m.t}"><span class="time">${fmtTime(m.t)}</span>
        <span class="body"><span class="eyebrow">${esc(m.type)}</span><span class="mtitle">${tex(m.title)}</span><span class="mtext">${tex(m.text)}</span></span></button>`).join('');
    return `${tabs}<div class="video-sec code-video">
      <div class="video-col"><div class="video-frame"><iframe id="yt" referrerpolicy="strict-origin-when-cross-origin"
        src="https://www.youtube.com/embed/${esc(cur.videoId)}?enablejsapi=1&rel=0&modestbranding=1" title="${esc(cur.title)}"
        allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>
        ${notesHtml}
        <div class="video-note">Select a key moment to jump the video there. Video by Revision Village: <a href="https://www.youtube.com/watch?v=${esc(cur.videoId)}" target="_blank" rel="noopener">open on YouTube</a>.</div></div>
      ${moments ? `<div class="moments-col"><h3 class="mm-h">Key moments</h3><div class="moments-box">${moments}</div></div>` : ''}
    </div>`;
  },
  ican(C) {
    const items = ok(C.ican); if (!items.length) return '';
    const done = store.get('ican:' + C.slug, {});
    return `<ul class="ican">${items.map((x) => `<li><label><input type="checkbox" data-ican="${esc(x.id)}"${done[x.id] ? ' checked' : ''}><span>${tex(x.text)}</span></label></li>`).join('')}</ul>
      <div class="small-note" data-ican-count></div>`;
  },
  ku(C) {
    const items = ok(C.ku); if (!items.length) return '';
    return `<ol class="ku">${items.map((x) => `<li>${tex(x.text)}</li>`).join('')}</ol>`;
  },
  visuals(C) {
    const items = ok(C.visuals).filter((x) => x.figure); if (!items.length) return '';
    return `<div class="carousel" data-carousel>${items.map((x, i) => `<figure class="slide"${i ? ' hidden' : ''}><img src="${esc(x.figure)}" alt=""><figcaption>${tex(x.text)}</figcaption></figure>`).join('')}
      <div class="btn-row"><button class="btn btn-secondary" data-car="-1">Back</button><span class="small-note" data-car-count></span><button class="btn btn-secondary" data-car="1">Next</button></div></div>`;
  },
  map(C, ctx) {
    const m = C.map; if (m.status !== 'approved') return '';
    const node = ([code, label]) => {
      const row = ctx.syl.codes.find((c) => c.code === code);
      const inner = `<b>${esc(code)}</b> ${tex(label)}`;
      return row && row.page ? `<a class="bubble" href="code.html?c=${esc(row.page)}">${inner}</a>` : `<div class="bubble">${inner}</div>`;
    };
    return `<div class="mindmap">
        <div class="mm-col"><div class="mm-lbl">Builds on</div>${m.needs.map(node).join('')}</div>
        <div class="mm-arrow" aria-hidden="true">→</div>
        <div class="mm-col mm-mid"><div class="bubble bubble--me"><b>${esc(C.code)}</b><br>${esc(C.title)}</div></div>
        <div class="mm-arrow" aria-hidden="true">→</div>
        <div class="mm-col"><div class="mm-lbl">Leads to</div>${m.leadsTo.map(node).join('')}</div>
      </div>
      ${m.withIn && m.withIn.length ? `<div class="mm-with"><span class="mm-lbl">Often appears with</span> ${m.withIn.map(node).join('')}</div>` : ''}`;
  },
  misc(C) {
    const items = ok(C.misc); if (!items.length) return '';
    return `<div class="misc">${items.map((x) => `<div class="misc-card"><div class="weak"><span class="eyebrow">Weak</span>${tex(x.weak)}</div><div class="better"><span class="eyebrow">Better</span>${tex(x.better)}</div></div>`).join('')}</div>`;
  },
  terms(C) {
    const items = ok(C.terms); if (!items.length) return '';
    return `<dl class="terms">${items.map((x) => `<dt>${esc(x.term)}</dt><dd>${tex(x.text)}</dd>`).join('')}</dl>`;
  },
  formula(C) {
    const items = ok(C.formula); if (!items.length) return '';
    return `<ul class="plain">${items.map((x) => `<li>${tex(x.text)}</li>`).join('')}</ul>`;
  },
  gdc(C) {
    const items = ok(C.gdc); if (!items.length) return '';
    return `<ol class="gdc-steps">${items.map((x) => `<li>${keyed(x.text)}${x.verified ? '' : '<div class="tocheck">Key names still to be checked on the calculator.</div>'}</li>`).join('')}</ol>
      <div class="small-note">Casio fx-CG50. Calculator screens are coming.</div>`;
  },
  worked(C) {
    const W = C.worked; if (W.status !== 'approved') return '';
    return `<div class="worked"><p>${tex(W.prompt)}</p>
      <div class="table-wrap"><table class="table data-row">${W.table.map((r) => `<tr>${r.map((c, i) => (i ? `<td>${tex(c)}</td>` : `<th>${tex(c)}</th>`)).join('')}</tr>`).join('')}</table></div>
      ${W.parts.map((p, i) => `<div class="wpart"><div class="wq"><b>${esc(p.label)}</b> ${tex(p.q)} <span class="marks">[${p.marks}]</span></div>
        <button class="btn btn-ghost" data-reveal="w${i}">Show solution</button>
        <div class="wa" id="w${i}" hidden>${tex(p.a)} <span class="mcode">${esc(p.m)}</span></div></div>`).join('')}
      <div class="small-note">Model markscheme written for this page. M = method, A = answer, R = reasoning.</div></div>`;
  },
  kq(C) {
    const items = ok(C.kq); if (!items.length) return '';
    return `<div class="kq">${items.map((x) => `<details class="kq-item"><summary>${tex(x.q)}</summary><div class="kq-a">${tex(x.model)}</div></details>`).join('')}</div>
      <div class="small-note">Answer in your own words first, then open the model answer.</div>`;
  },
  history(C) {
    const items = ok(C.history); if (!items.length) return '';
    return `<div class="history">${items.map((x) => `<p>${tex(x.text)}</p>`).join('')}
      <div class="small-note">Sources: ${[...new Map(items.flatMap((x) => x.sources).map((s) => [s[1], s])).values()].map((s) => `<a href="${esc(s[1])}" target="_blank" rel="noopener">${esc(s[0])}</a>`).join(' · ')}</div></div>`;
  },
  explorer(C) {
    return ''; // explorers are specified (C.explorers) but not built yet
  },
};

function pageHtml(C, ctx, mode) {
  const secs = ctx.site.codePage.sections.filter((s) => mode === 'learn' || s.revise);
  ctx.tabName = Object.fromEntries(secs.map((s) => [s.key, s.tab]));
  ctx.shown = new Set(secs.filter((s) => s.key !== 'video' && R[s.key](C, ctx)).map((s) => s.key));
  const rendered = secs.map((s) => ({ s, html: R[s.key](C, ctx) })).filter((x) => x.html);
  const body = rendered.map(({ s, html }) => `
    <section id="s-${s.key}" class="sec code-sec">
      <div class="kicker">${esc(s.kicker || '')}</div>
      <h2>${esc(s.title)}</h2>${html}
    </section>`).join('');
  return {
    tabs: rendered.map(({ s }) => ({ id: s.key, label: s.tab })),
    html: `
    <div class="lesson code-page">
      <a class="link-btn" href="index.html#unit-${C.code.split(' ')[1].split('.')[0]}">All syllabus codes</a>
      <div class="lesson-head">
        <div><div class="kicker">${esc(C.level === 'AHL' ? 'Additional higher level' : 'Standard level')}</div>
          <h1>${esc(C.code)} ${esc(C.title)}</h1></div>
        <div class="mode-switch" role="group" aria-label="Page mode">
          <button class="mode-btn${mode === 'learn' ? ' is-on' : ''}" data-mode="learn">Learn</button>
          <button class="mode-btn${mode === 'revise' ? ' is-on' : ''}" data-mode="revise">Revise</button>
          <div class="small-note">${mode === 'learn' ? 'Everything, in teaching order.' : 'The exam essentials only.'}</div>
        </div>
      </div>
      ${body}
    </div>`,
  };
}

function wire(C) {
  const count = () => {
    const boxes = $$('[data-ican]'); const n = boxes.filter((b) => b.checked).length;
    const el = $('[data-ican-count]'); if (el) el.textContent = `${n} of ${boxes.length} ticked. Ticks are saved in this browser only.`;
  };
  count();
  const car = $('[data-carousel]');
  if (car) {
    const slides = $$('.slide', car); let i = 0;
    const show = () => { slides.forEach((s, j) => { s.hidden = j !== i; }); $('[data-car-count]', car).textContent = `${i + 1} / ${slides.length}`; };
    car.addEventListener('click', (e) => { const b = e.target.closest('[data-car]'); if (!b) return; i = (i + Number(b.dataset.car) + slides.length) % slides.length; show(); });
    show();
  }
  $('#app').addEventListener('change', (e) => {
    if (!e.target.matches('[data-ican]')) return;
    const done = store.get('ican:' + C.slug, {}); done[e.target.dataset.ican] = e.target.checked; store.set('ican:' + C.slug, done); count();
  });
}

async function main() {
  const app = document.getElementById('app'); const bar = document.getElementById('topbar');
  try {
    const [site, syl] = await Promise.all([getJSON('data/site.json'), getJSON('data/syllabus.json')]);
    bar.innerHTML = renderTopbar({ site });
    const slug = new URLSearchParams(location.search).get('c') || '';
    if (!/^[a-z0-9-]+$/.test(slug)) throw new Error('No syllabus code chosen.');
    const C = await getJSON(`data/codes/${slug}.json`).catch(() => { throw new Error('This syllabus code does not have a page yet.'); });
    const ctx = { site, syl, vid: 0 };
    const unit = Number(C.code.split(' ')[1].split('.')[0]);
    let mode = store.get('codeMode', 'learn');
    document.title = `${C.code} ${C.title} | ${site.course}`;
    const draw = () => {
      const P = pageHtml(C, ctx, mode);
      bar.innerHTML = renderTopbar({ site, activeUnit: unit, crumb: `Topic ${unit} › ${C.code} ${C.title}`, sections: P.tabs, toggleAll: false });
      app.innerHTML = P.html; wire(C);
    };
    draw();
    document.addEventListener('click', (e) => {
      const m = e.target.closest('[data-mode]');
      if (m) { mode = m.dataset.mode; store.set('codeMode', mode); draw(); return; }
      const t = e.target.closest('[data-sec-tab]');
      if (t) { const el = document.getElementById('s-' + t.dataset.secTab); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - bar.offsetHeight - 8, behavior: 'smooth' }); return; }
      const r = e.target.closest('[data-reveal]');
      if (r) { const a = document.getElementById(r.dataset.reveal); a.hidden = !a.hidden; r.textContent = a.hidden ? 'Show solution' : 'Hide solution'; return; }
      const sk = e.target.closest('[data-seek]');
      if (sk) { seekVideo(Number(sk.dataset.seek)); const f = $('#yt'); if (f && f.getBoundingClientRect().top < bar.offsetHeight) f.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      const v = e.target.closest('[data-vid]');
      if (v) {
        ctx.vid = Number(v.dataset.vid);
        const sec = document.getElementById('s-video');
        sec.querySelectorAll('.vid-tabs, .video-sec').forEach((n) => n.remove());
        sec.insertAdjacentHTML('beforeend', R.video(C, ctx));
      }
    });
  } catch (e) {
    app.innerHTML = `<div class="error">${esc(e.message)} <a href="index.html">Back to all codes</a></div>`;
  }
}
main();
