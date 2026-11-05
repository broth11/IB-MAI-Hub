// "In the exam" (IB MAI Hub): what the exam asks for a syllabus code, from the question bank statistics in
// data/exam.json (counts only, no question text), plus hand-written guidance and the common mark losers.
// Section config: codes ["AHL 2.7", ...], asks [text], marks [{label, text}], gdc text, traps [{kind,title,weak,better,seek}].
import { esc, tex, fmtTime } from '../util.js';

// Plain-language meanings of IB command terms, in our own words.
const TERMS = {
  'Find': 'Get the answer and show the working that leads to it.',
  'Write down': 'Give the answer with little or no working, often read from the question or a graph.',
  'State': 'Give a short answer with no working.',
  'Solve': 'Get the answer by algebra, a graph, or the GDC.',
  'Sketch': 'Draw the general shape with the key features labelled.',
  'Use': 'Apply a given rule, result, or method.',
  'Express': 'Write it in the form the question asks for.',
  'Describe': 'Give a clear account in words.',
  'Interpret': 'Say what the answer means in the context of the question.',
  'Calculate': 'Get a numerical answer and show the working.',
  'Show that': 'Reach the result you are given, with every step visible.',
  'Hence': 'Use the previous result. You must use it.',
  'Hence or otherwise': 'Using the previous result is the intended route, but any correct method earns the marks.',
  'Complete': 'Fill in the missing values or parts.',
  'Determine': 'Get the answer by working or calculation.',
  'Justify': 'Give valid reasons for your answer.',
  'Explain': 'Give the reasons or causes.',
  'Plot': 'Mark the points on a graph.',
  'Draw': 'Draw an accurate diagram or graph, with a ruler where needed.',
};

function statsHtml(code, e) {
  if (!e || !e.n) return `<div class="exam-code"><div class="exam-codehead"><b>${esc(code)}</b> Not tagged on any HL question in the question bank, 2021 to 2025.</div></div>`;
  const papers = Object.entries(e.papers).filter(([, n]) => n).map(([p, n]) => `Paper ${p}: ${n}`).join(' · ');
  const facts = [
    ['Papers', papers],
    ['Marks', `${e.marks.min} to ${e.marks.max}, median ${e.marks.median}`],
    ['GDC', `allowed in ${e.calculator} of ${e.n}`],
    ['Mark types', `method in ${e.markTypes.M}, answer in ${e.markTypes.A}, reasoning in ${e.markTypes.R}`],
  ].map(([k, v]) => `<div class="exam-fact"><div class="k">${k}</div><div class="v">${esc(v)}</div></div>`).join('');
  const terms = e.commandTerms.map(([t, n]) => `<span class="exam-term">${esc(t)} <i>${n}</i></span>`).join('');
  const also = e.alsoWith.slice(0, 4).map(([c, n]) => `${esc(c)} (${n})`).join(', ');
  return `
    <div class="exam-code">
      <div class="exam-codehead"><b>${esc(code)}</b> ${esc(e.label)}. Asked in ${e.n} HL questions, 2021 to 2025.</div>
      <div class="exam-facts">${facts}</div>
      <div class="exam-terms"><span class="lab">Command terms</span>${terms}</div>
      ${also ? `<div class="exam-also">Often asked together with: ${also}.</div>` : ''}
    </div>`;
}

export function render(sec, ctx) {
  const data = (ctx.exam && ctx.exam.codes) || {};
  const stats = sec.codes.map((c) => statsHtml(c, data[c])).join('');
  const used = new Set();
  sec.codes.forEach((c) => ((data[c] && data[c].commandTerms) || []).forEach(([t]) => used.add(t)));
  const defs = [...used].filter((t) => TERMS[t]).map((t) => `<div class="exam-def"><b>${esc(t)}</b> ${esc(TERMS[t])}</div>`).join('');
  const forms = [...new Set(sec.codes.flatMap((c) => (data[c] && data[c].formulas) || []))];
  const traps = (sec.traps || []).map((t) => `
    <div class="trap">
      <div><div class="eyebrow">${esc(t.kind)}</div><div class="ttitle">${tex(t.title)}</div></div>
      <div class="pair">
        <div class="weak"><div class="lbl">✕ Loses marks</div>${tex('“' + t.weak + '”')}</div>
        <div><div class="lbl">✓ Earns marks</div>${tex(t.better)}</div>
      </div>
      ${t.seek != null ? `<div class="foot"><button class="btn btn-ghost" data-seek="${t.seek}">Video ${fmtTime(t.seek)}</button></div>` : ''}
    </div>`).join('');
  return `
    <div class="exam">
      <div class="exam-block"><h3>What the question bank shows</h3>${stats}${defs ? `<div class="exam-deflab">What the command terms mean</div><div class="exam-defs">${defs}</div>` : ''}</div>
      <div class="exam-block"><h3>What the exam asks</h3><ul class="exam-list">${sec.asks.map((a) => `<li>${tex(a)}</li>`).join('')}</ul></div>
      <div class="exam-block"><h3>How the marks are earned</h3>
        <div class="exam-marks">${sec.marks.map((m) => `<div class="exam-mark"><div class="lab">${esc(m.label)}</div><div>${tex(m.text)}</div></div>`).join('')}</div>
        <div class="small-note">M is a method mark, A is an answer mark, R is a reasoning mark. A bracket such as (M1) means the mark can be implied by a correct later step. Give answers to 3 significant figures unless the question says otherwise.</div>
      </div>
      <div class="exam-block"><h3>GDC and formulas</h3>
        ${sec.gdc ? `<p>${tex(sec.gdc)}</p>` : ''}
        <p><b>Formula booklet.</b> ${forms.length ? forms.map(tex).join('; ') : 'No formula for this topic is given, so learn the method.'}</p>
      </div>
      ${traps ? `<div class="exam-block"><h3>Where marks are lost</h3><div class="traps">${traps}</div></div>` : ''}
    </div>`;
}
export function mount() {}
