// GDC section: Casio fx-CG50 walkthrough. Numbered steps on the left; the calculator on the right shows
// the real screen after the chosen step and rings the keys that step presses, in order.
// Screens are real emulator captures (docs/img/gdc/*.jpg), never drawn. Kit and rules: gdc-online-deck skill.
import { esc, tex } from '../util.js';

// Key ids -> label shown in a step's key chip.
const LABEL = { F1: 'F1', F2: 'F2', F3: 'F3', F4: 'F4', F5: 'F5', F6: 'F6', SHIFT: 'SHIFT', OPTN: 'OPTN', VARS: 'VARS', MENU: 'MENU',
  ALPHA: 'ALPHA', SQR: 'x²', POW: '^', EXIT: 'EXIT', XTT: 'X,θ,T', LOG: 'log', LN: 'ln', SIN: 'sin', COS: 'cos', TAN: 'tan',
  FRAC: '▫⁄▫', SD: 'S⇔D', LP: '(', RP: ')', COMMA: ',', STO: '→', DEL: 'DEL', AC: 'AC/ON', MUL: '×', DIV: '÷', ADD: '+', SUB: '−',
  DOT: '.', EXP: '×10ˣ', NEG: '(−)', EXE: 'EXE', UP: '▲', DOWN: '▼', LEFT: '◀', RIGHT: '▶',
  0: '0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9' };

// Keypad hotspots: centre x, y and size in px of the keypad region (560 x 776) of calc_body.webp.
const KW = 560, KH = 776;
const KX = { F: [60, 148, 236, 324, 410, 498], A: [64, 148, 236, 320], C6: [66, 148, 236, 322, 410, 496], C5: [66, 174, 280, 384, 488] };
const KP = {};
const put = (ids, xs, y, w, h) => ids.forEach((id, i) => { KP[id] = [xs[i], y, w, h]; });
put(['F1', 'F2', 'F3', 'F4', 'F5', 'F6'], KX.F, 66, 54, 50);
put(['SHIFT', 'OPTN', 'VARS', 'MENU'], KX.A, 146, 80, 42);
put(['ALPHA', 'SQR', 'POW', 'EXIT'], KX.A, 216, 80, 42);
KP.UP = [458, 128, 40, 40]; KP.DOWN = [458, 212, 40, 40]; KP.LEFT = [414, 170, 40, 40]; KP.RIGHT = [502, 170, 40, 40];
put(['XTT', 'LOG', 'LN', 'SIN', 'COS', 'TAN'], KX.C6, 300, 82, 42);
put(['FRAC', 'SD', 'LP', 'RP', 'COMMA', 'STO'], KX.C6, 370, 82, 42);
put(['7', '8', '9', 'DEL', 'AC'], KX.C5, 464, 94, 52);
put(['4', '5', '6', 'MUL', 'DIV'], KX.C5, 552, 94, 52);
put(['1', '2', '3', 'ADD', 'SUB'], KX.C5, 636, 94, 52);
put(['0', 'DOT', 'EXP', 'NEG', 'EXE'], KX.C5, 724, 94, 52);

const TOKEN = /(\[[A-Z0-9]+\]|\{[^}]+\})/;

// Step text: [KEY] is a key chip; {-2.5} is a typed entry. Everything else is normal text with $math$.
function stepHtml(t) {
  return String(t).split(TOKEN).map((part) => {
    if (/^\[[A-Z0-9]+\]$/.test(part)) { const k = part.slice(1, -1); return `<span class="kc">${esc(LABEL[k] ?? k)}</span>`; }
    if (/^\{[^}]+\}$/.test(part)) return `<span class="entry">${esc(part.slice(1, -1).replace(/^-/, '−'))}</span>`;
    return part ? tex(part) : '';
  }).join('');
}

// Keys a step presses, in order. A typed entry lights its digits, DOT, and NEG (leading minus) or SUB.
function keysOf(t) {
  const out = [];
  String(t).split(TOKEN).forEach((part) => {
    if (/^\[[A-Z0-9]+\]$/.test(part)) out.push(part.slice(1, -1));
    else if (/^\{[^}]+\}$/.test(part)) [...part.slice(1, -1)].forEach((c, i) => {
      if (/[0-9]/.test(c)) out.push(c); else if (c === '.') out.push('DOT'); else if (c === '-') out.push(i ? 'SUB' : 'NEG');
    });
  });
  return out;
}

function screenHtml(s) {
  if (!s || !s.src) return '<div class="gdc-nocap">Screen not captured yet</div>';
  const labels = (s.labels || []).map((l) =>
    `<span class="lbl" style="left:${l[0]}%;top:${l[1]}%;width:${l[2]}%;height:${l[3]}%${l[5] ? `;background:${esc(l[5])}` : ''}">${esc(l[4])}</span>`).join('');
  const hl = s.hl ? `<span class="hl" style="left:${s.hl[0]}%;top:${s.hl[1]}%;width:${s.hl[2]}%;height:${s.hl[3]}%"></span>` : '';
  return `<div class="shot"><img src="${esc(s.src)}" alt="${esc(s.alt || 'Calculator screen')}">${labels}${hl}</div>`;
}

const keypadHtml = () => `<div class="kimg">${Object.entries(KP).map(([id, [x, y, w, h]]) =>
  `<span class="hk" data-k="${id}" style="left:${(100 * x / KW).toFixed(2)}%;top:${(100 * y / KH).toFixed(2)}%;width:${(100 * w / KW).toFixed(2)}%;height:${(100 * h / KH).toFixed(2)}%"></span>`).join('')}</div>`;

export function render(sec) {
  const steps = (sec.steps || []).map((st, i) => `
    <li class="gdc-step" data-i="${i + 1}" tabindex="0"><span class="n">${i + 1}</span><span class="t">${stepHtml(st.t)}</span></li>`).join('');
  return `
    <div class="gdc" data-gdc>
      <div class="gdc-left">
        <div class="prose">${tex(sec.intro)}</div>
        ${sec.stem ? `<div class="gdc-stem">${tex(sec.stem)}</div>` : ''}
        <ol class="gdc-steps">${steps}</ol>
        <div class="gdc-ctl">
          <button class="btn btn-secondary" type="button" data-gdc-prev>Back</button>
          <span class="gdc-pos" data-gdc-pos aria-live="polite"></span>
          <button class="btn btn-secondary" type="button" data-gdc-next>Next step</button>
          <button class="btn btn-secondary" type="button" data-gdc-keys aria-pressed="false">Screen only</button>
        </div>
        ${sec.restore ? `<div class="callout"><b>Put it back.</b> ${tex(sec.restore)}</div>` : ''}
      </div>
      <div class="calc" data-calc>
        <img class="body" src="img/gdc/calc_body.webp" alt="" aria-hidden="true">
        <div class="bezel"><div class="lcd" data-lcd></div></div>
        <div class="keys" data-keys>${keypadHtml()}</div>
      </div>
    </div>`;
}

export function mount(el, sec) {
  const root = el.querySelector('[data-gdc]');
  const steps = sec.steps || [];
  const lcd = root.querySelector('[data-lcd]');
  const pos = root.querySelector('[data-gdc-pos]');
  const items = [...root.querySelectorAll('.gdc-step')];
  let cur = 0; // 0 = start screen, 1..N = after that step

  function show(i) {
    cur = Math.max(0, Math.min(steps.length, i));
    const scr = cur === 0 ? sec.start : steps[cur - 1].s;
    lcd.innerHTML = screenHtml(scr);
    const keys = cur === 0 ? [] : keysOf(steps[cur - 1].t);
    root.querySelectorAll('.hk').forEach((k) => { k.classList.remove('lit'); k.querySelector('.badge')?.remove(); });
    const order = {};
    keys.forEach((k, n) => { (order[k] = order[k] || []).push(n + 1); });
    Object.entries(order).forEach(([k, nums]) => {
      const hk = root.querySelector(`.hk[data-k="${k}"]`);
      if (!hk) return;
      hk.classList.add('lit');
      if (keys.length > 1) {
        const b = document.createElement('span');
        b.className = 'badge';
        b.textContent = nums.length > 2 ? `${nums[0]}…` : nums.join(',');
        hk.appendChild(b);
      }
    });
    items.forEach((li, n) => { li.classList.toggle('now', n + 1 === cur); li.classList.toggle('done', n + 1 < cur); });
    pos.textContent = cur === 0 ? `Start (${steps.length} steps)` : `Step ${cur} of ${steps.length}`;
    root.querySelector('[data-gdc-prev]').disabled = cur === 0;
    root.querySelector('[data-gdc-next]').disabled = cur === steps.length;
  }

  root.querySelector('[data-gdc-prev]').addEventListener('click', () => show(cur - 1));
  root.querySelector('[data-gdc-next]').addEventListener('click', () => show(cur + 1));
  items.forEach((li) => {
    li.addEventListener('click', () => show(Number(li.dataset.i)));
    li.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(Number(li.dataset.i)); } });
  });
  const toggle = root.querySelector('[data-gdc-keys]');
  toggle.addEventListener('click', () => {
    const on = root.classList.toggle('nokeys');
    toggle.setAttribute('aria-pressed', String(on));
    toggle.textContent = on ? 'Show keys' : 'Screen only';
  });
  show(0);
}
