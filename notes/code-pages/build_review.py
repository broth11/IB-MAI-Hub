import json
pilot = json.load(open("/home/claude/work/pilot.json"))
exam = json.load(open("/home/claude/IB-MAI-Hub/docs/data/exam.json"))["codes"]
prev = {x["id"]: x for x in json.load(open("/home/claude/work/verdicts_r1.json"))["verdicts"]}
pilot["approved"] = sorted(i for i, x in prev.items() if x["verdict"] == "agree" and i not in pilot["changed"])
data = json.dumps(pilot, ensure_ascii=False).replace("</", "<\\/")

HTML = r"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>IB MAI Hub: pilot content review (Topic 4 correlation and regression)</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<script>window.MathJax={tex:{inlineMath:[['$','$']]},svg:{fontCache:'global'},startup:{typeset:false}};</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js" async id="mj"></script>
<style>
:root{--ink:#1b2430;--mute:#5b6676;--line:#dfe3ea;--bg:#f6f7f9;--card:#fff;--acc:#1f5fbf;--ok:#1d7a46;--okbg:#e6f4ec;--rev:#a15c00;--revbg:#fdf1de;--cut:#a32727;--cutbg:#fbe7e7}
*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,sans-serif;color:var(--ink);background:var(--bg);font-size:15px;line-height:1.5}
header{background:#14213d;color:#fff;padding:22px 24px 14px}
header h1{margin:0 0 4px;font-size:22px}header p{margin:0;color:#c9d3e6;max-width:900px}
.bar{position:sticky;top:0;z-index:5;background:#fff;border-bottom:1px solid var(--line);display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px 24px}
.tab{border:1px solid var(--line);background:#fff;border-radius:999px;padding:6px 14px;cursor:pointer;font:inherit;font-weight:500}
.tab.on{background:var(--acc);color:#fff;border-color:var(--acc)}
.prog{margin-left:auto;color:var(--mute);font-size:14px}
.btn{border:1px solid var(--acc);background:var(--acc);color:#fff;border-radius:8px;padding:7px 14px;cursor:pointer;font:inherit;font-weight:600}
.btn.ghost{background:#fff;color:var(--acc)}
main{max-width:1060px;margin:0 auto;padding:20px 24px 80px}
.sec{background:var(--card);border:1px solid var(--line);border-radius:12px;margin:0 0 16px;overflow:hidden}
.sec>h2{margin:0;font-size:16px;padding:12px 16px;border-bottom:1px solid var(--line);background:#fbfcfd;display:flex;gap:10px;align-items:center}
.sec>h2 .tag{font-size:12px;font-weight:600;padding:2px 8px;border-radius:999px;background:#eef2f8;color:var(--mute)}
.sec .intro{padding:10px 16px 0;color:var(--mute);font-size:14px}
.item{display:grid;grid-template-columns:1fr auto;gap:8px 16px;padding:12px 16px;border-top:1px solid #eef0f4}
.sec .item:first-of-type{border-top:0}
.item.agree{background:var(--okbg)}.item.revise{background:var(--revbg)}.item.cut{background:var(--cutbg)}
.txt b{font-weight:600}
.lbl{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:var(--mute);margin-right:6px}
.weak{color:var(--cut)}.better{color:var(--ok)}
.why,.src,.flag{font-size:13px;color:var(--mute);margin-top:4px}
.flag{color:var(--rev);font-weight:500}
.src a{color:var(--acc)}
.v{display:flex;gap:6px;align-items:flex-start}
.v button{border:1px solid var(--line);background:#fff;border-radius:8px;padding:5px 10px;cursor:pointer;font:inherit;font-size:13px;font-weight:600;color:var(--mute)}
.v button.agree.on{background:var(--ok);border-color:var(--ok);color:#fff}
.v button.revise.on{background:var(--rev);border-color:var(--rev);color:#fff}
.v button.cut.on{background:var(--cut);border-color:var(--cut);color:#fff}
.note{grid-column:1/-1;display:none}.item.revise .note,.item.cut .note,.note.has{display:block}
.note textarea{width:100%;min-height:54px;border:1px solid var(--line);border-radius:8px;padding:8px;font:inherit;font-size:14px;background:#fff}
table.d{border-collapse:collapse;margin:6px 0;font-size:14px}table.d td{border:1px solid var(--line);padding:4px 10px;text-align:center}
table.d td:first-child{background:#f3f5f8;font-weight:600}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;padding:12px 16px}
.stat{background:#f3f6fb;border-radius:10px;padding:10px 12px}.stat .k{font-size:12px;color:var(--mute);text-transform:uppercase;letter-spacing:.04em}.stat .n{font-size:22px;font-weight:700}.stat .s{font-size:13px;color:var(--mute)}
.sub{padding:8px 16px 0;font-weight:600;font-size:14px}
.map{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center;padding:6px 0}
.node{border:2px solid #c0392b;border-radius:14px;padding:6px 10px;background:#fff;font-size:13px}
.node.me{background:#c0392b;color:#fff;font-weight:600;text-align:center}
.col{display:flex;flex-direction:column;gap:6px}
.part{margin:8px 0;padding-left:10px;border-left:3px solid #e3e8f0}
.ans{margin-top:4px;color:var(--ok)}.mk{font-size:12px;font-weight:700;color:var(--mute);margin-left:6px}
details summary{cursor:pointer;color:var(--acc);font-size:14px;font-weight:500}
.kv{font-size:13px;color:var(--mute)}
.chk{color:var(--ok);font-weight:600}.unchk{color:var(--rev);font-weight:600}
#exportBox{display:none;position:fixed;inset:0;background:rgba(10,20,40,.45);z-index:10;align-items:center;justify-content:center}
#exportBox .in{background:#fff;border-radius:14px;max-width:760px;width:92%;padding:18px}
#exportBox textarea{width:100%;height:320px;font-family:ui-monospace,monospace;font-size:12px;border:1px solid var(--line);border-radius:8px;padding:8px}
.row{display:flex;gap:8px;justify-content:flex-end;margin-top:10px;flex-wrap:wrap}
.hint{font-size:13px;color:var(--mute);margin-right:auto;align-self:center}
.newtag{display:inline-block;font-size:11px;font-weight:700;background:#1f5fbf;color:#fff;border-radius:6px;padding:1px 6px;margin-right:4px;vertical-align:1px}
.empty{padding:14px 16px;color:var(--mute)}
.legend{display:flex;gap:14px;flex-wrap:wrap;font-size:13px;color:var(--mute);padding:0 0 12px}
@media(max-width:640px){.item{grid-template-columns:1fr}.map{grid-template-columns:1fr}}
</style></head><body>
<header><h1>IB MAI Hub: pilot content review</h1>
<p><b>Round 2.</b> Your round 1 cuts are gone and approved items are hidden; only changed, new, and unmarked items are shown. Mark each one <b>Agree</b>, <b>Revise</b> (say what to change), or <b>Cut</b>. Your choices stay in this browser. When you are done, press <b>Export verdicts</b>, copy the JSON, and paste it into the chat.</p></header>
<div class="bar" id="bar"></div>
<main id="main"></main>
<div id="exportBox"><div class="in"><h3 style="margin:0 0 8px">Verdicts (round <span id="rnd"></span>)</h3>
<textarea id="exportText" readonly></textarea>
<div class="row"><span class="hint" id="copyMsg">Copy, then paste into the chat.</span>
<button class="btn ghost" id="importBtn">Load verdicts…</button><button class="btn ghost" id="closeExp">Close</button><button class="btn" id="copyBtn">Copy JSON</button></div></div></div>
<script id="pilot" type="application/json">__DATA__</script>
<script>
const D=JSON.parse(document.getElementById('pilot').textContent);
const KEY='ibmai-review-r'+D.round;
let V={};try{V=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){V={}}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(V))}catch(e){}};
const REG={};// id -> {code,section,text}
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const SECNAME=Object.fromEntries(D.structure.map(s=>[s.key,s.name]));
const tabs=[{k:'structure',t:'Page template'}].concat(D.codes.map(c=>({k:c.slug,t:c.code})));
let cur=(location.hash||'').slice(1);if(!tabs.some(t=>t.k===cur))cur='structure';
const APP=new Set(D.approved),CHG=new Set(D.changed);let showApp=false;
function itemHTML(id,code,sec,body,plain){
  if(APP.has(id))return showApp?`<div class="item agree" data-id="${id}"><div class="txt">${body}</div><div class="v"><span class="kv chk">Approved</span></div></div>`:'';
  REG[id]={code,section:sec,text:plain};
  body=(CHG.has(id)?'<span class="newtag">Changed or new</span> ':'')+body;
  const v=(V[id]||{}).v||'',n=(V[id]||{}).n||'';
  return `<div class="item ${v}" data-id="${id}"><div class="txt">${body}</div>
  <div class="v"><button class="agree ${v==='agree'?'on':''}" data-v="agree">Agree</button><button class="revise ${v==='revise'?'on':''}" data-v="revise">Revise</button><button class="cut ${v==='cut'?'on':''}" data-v="cut">Cut</button></div>
  <div class="note ${n?'has':''}"><textarea placeholder="What should change? (optional for Agree)">${esc(n)}</textarea></div></div>`}
const strip=s=>String(s).replace(/<[^>]+>/g,'');
function sec(title,tag,intro,inner){if(!inner)return '';return `<section class="sec"><h2>${title}${tag?` <span class="tag">${tag}</span>`:''}</h2>${intro?`<div class="intro">${intro}</div>`:''}${inner}</section>`}
function list(code,key,arr){return arr.map(x=>itemHTML(x.id,code,key,`${x.text}${x.flag?`<div class="flag">⚑ ${x.flag}</div>`:''}`,x.text)).join('')}
function renderStructure(){
  let h=sec('Proposed code-page template','applies to all 78 codes','Order, and whether each section shows in Learn and Revise mode. Revise mode drops the media sections.',
   D.structure.map((s,i)=>itemHTML(s.id,'ALL','structure',`<b>${i+1}. ${s.name}</b> <span class="kv">· Learn ${s.learn?'<span class="chk">✓</span>':'–'} · Revise ${s.revise?'<span class="chk">✓</span>':'–'}</span><div class="why">${s.note}</div>`,`${s.name} | learn=${s.learn} revise=${s.revise}`)).join(''));
  return h}
function renderCode(c){
  const S=c.sections,code=c.code;let h='';
  h+=`<h2 style="margin:4px 0 12px">${code} ${c.title}</h2>`;h+=sec('Videos',c.level,null,itemHTML(c.slug+'-videos',code,'video',`<span class="lbl">Videos</span>${c.videos.map(v=>`${v.n} ${esc(v.title)}${v.partial?' <span class="kv">(part)</span>':''}`).join(' · ')}<div class="why">Key moments come later with the video-study-site skill; this checks only which videos attach to the code.</div>`,'videos: '+c.videos.map(v=>v.n).join(',')));
  h+=sec('I can… checklist','Learn + Revise',null,list(code,'ican',S.ican));
  h+=sec('Key understandings','Learn + Revise',null,list(code,'ku',S.ku));
  h+=sec('Key visuals (carousel plan)','Learn','Each slide is a planned figure and its caption. Figures get drawn after you approve the story.',list(code,'visuals',S.visuals));
  const m=S.map,node=a=>`<div class="node"><b>${a[0]}</b> ${a[1]}</div>`;
  h+=sec('Where it fits','Learn','Data for the generated mind map. The page will draw it in the IB mind-map style.',itemHTML(m.id,code,'map',`<div class="map"><div class="col"><span class="lbl">Needs</span>${m.needs.map(node).join('')}</div><div class="node me">${code}<br>${c.title}</div><div class="col"><span class="lbl">Leads to</span>${m.leadsTo.map(node).join('')}</div></div><div class="kv"><span class="lbl">Often examined with</span>${m.withIn.map(a=>`${a[0]} ${a[1]}`).join(' · ')}</div>`,'needs '+m.needs.map(a=>a[0])+' leads '+m.leadsTo.map(a=>a[0])+' with '+m.withIn.map(a=>a[0])));
  h+=sec('Misconceptions','Learn + Revise','The weak answer is what students write; the better answer earns the marks. The grey line is the evidence (for you; students would not see it).',S.misc.map(x=>itemHTML(x.id,code,'misc',`<div><span class="lbl">Weak</span><span class="weak">${x.weak}</span></div><div><span class="lbl">Better</span><span class="better">${x.better}</span></div><div class="why">${x.why}</div>`,`weak: ${strip(x.weak)} | better: ${strip(x.better)}`)).join(''));
  h+=sec('Command terms and answer wording','Learn + Revise',null,S.terms.map(x=>itemHTML(x.id,code,'terms',`<b>${x.term}</b>: ${x.text}`,`${x.term}: ${x.text}`)).join(''));
  h+=sec('Formula booklet pointer','Learn + Revise',null,list(code,'formula',S.formula));
  h+=sec('GDC steps (fx-CG50)','Learn + Revise','<span class="chk">✓</span> = key path already verified on the emulator; <span class="unchk">?</span> = still to verify. Screens get captured after approval.',S.gdc.map(x=>itemHTML(x.id,code,'gdc',`${x.verified?'<span class="chk">✓</span>':'<span class="unchk">?</span>'} ${x.text}${x.flag?`<div class="flag">⚑ ${x.flag}</div>`:''}`,x.text)).join(''));
  const W=S.worked;
  h+=sec('Worked example (model solution)','Learn + Revise','Original data; every number computed in code. Marks are a model markscheme.',itemHTML(W.id,code,'worked',`<div>${W.prompt}</div><table class="d">${W.table.map(r=>'<tr>'+r.map(x=>`<td>${x}</td>`).join('')+'</tr>').join('')}</table>${W.parts.map(p=>`<div class="part"><b>${p.label}</b> ${p.q} <span class="mk">[${p.marks}]</span><div class="ans">${p.a} <span class="mk">${p.m}</span></div></div>`).join('')}`,W.prompt+' '+W.parts.map(p=>p.label+' '+strip(p.q)).join(' ')));
  h+=sec('Key questions (explain why)','Learn + Revise',null,S.kq.map(x=>itemHTML(x.id,code,'kq',`<b>${x.q}</b><details><summary>Model answer</summary>${x.model}</details>`,`${strip(x.q)} | ${strip(x.model)}`)).join(''));
  h+=sec('History note','Learn','Optional section. Each claim is checked against the linked sources.',S.history.map(x=>itemHTML(x.id,code,'history',`${x.text}<div class="src">Sources: ${x.sources.map(s=>`<a href="${s[1]}" target="_blank" rel="noopener">${esc(s[0])}</a>`).join(' · ')}</div>${x.flag?`<div class="flag">⚑ ${x.flag}</div>`:''}`,strip(x.text))).join(''));
  h+=sec('Explorer specs','Learn','Written from your round 1 notes. Agree means "build this"; the suggestion line is mine, so say if you want it dropped.',(S.explorers||[]).map(x=>itemHTML(x.id,code,'explorer',`<b>${x.name}</b>: ${x.spec}<div class="why">Suggestion: ${x.suggest}</div>`,x.name+': '+strip(x.spec))).join(''));
  return h}
function counts(){const ids=Object.keys(REG);let a=0,r=0,x=0;ids.forEach(i=>{const v=(V[i]||{}).v;if(v==='agree')a++;else if(v==='revise')r++;else if(v==='cut')x++});return{t:ids.length,a,r,x}}
function renderBar(){const c=counts();document.getElementById('bar').innerHTML=tabs.map(t=>`<button class="tab ${t.k===cur?'on':''}" data-t="${t.k}">${t.t}</button>`).join('')+`<span class="prog">${c.a+c.r+c.x} of ${c.t} marked · ${c.a} agree · ${c.r} revise · ${c.x} cut</span><label class="kv" style="display:flex;gap:4px;align-items:center"><input type="checkbox" id="showApp" ${showApp?'checked':''}> Show approved</label><button class="btn" id="expBtn">Export verdicts</button>`}
function buildAll(){// register every item (all tabs) so counts and export cover everything
  const tmp=document.createElement('div');tmp.innerHTML=renderStructure()+D.codes.map(renderCode).join('')}
function render(){const m=document.getElementById('main');
  let h=cur==='structure'?renderStructure():renderCode(D.codes.find(c=>c.slug===cur));
  if(!/class="item/.test(h))h+='<div class="sec"><div class="empty">Nothing left to review on this tab.</div></div>';
  m.innerHTML=h;
  renderBar();if(window.MathJax&&MathJax.typesetPromise)MathJax.typesetPromise([m]).catch(()=>{})}
document.addEventListener('click',e=>{
  const t=e.target.closest('.tab');if(t){cur=t.dataset.t;try{history.replaceState(null,'','#'+cur)}catch(_){location.hash=cur}render();scrollTo(0,0);return}
  const b=e.target.closest('.v button');if(b){const it=b.closest('.item'),id=it.dataset.id,nv=b.dataset.v;V[id]=V[id]||{};V[id].v=(V[id].v===nv)?'':nv;save();
    it.classList.remove('agree','revise','cut');if(V[id].v)it.classList.add(V[id].v);it.querySelectorAll('.v button').forEach(x=>x.classList.toggle('on',x.dataset.v===V[id].v));
    if(V[id].v==='revise')it.querySelector('textarea').focus();renderBar();return}
  if(e.target.id==='expBtn'){openExport();return}
  if(e.target.id==='closeExp'){document.getElementById('exportBox').style.display='none';return}
  if(e.target.id==='copyBtn'){const ta=document.getElementById('exportText');ta.select();
    (navigator.clipboard?navigator.clipboard.writeText(ta.value):Promise.reject()).then(()=>msg('Copied. Paste it into the chat.')).catch(()=>{try{document.execCommand('copy');msg('Copied. Paste it into the chat.')}catch(_){msg('Select the text and copy it by hand.')}});return}
  if(e.target.id==='importBtn'){const ta=document.getElementById('exportText');ta.readOnly=false;ta.value='';ta.placeholder='Paste an exported verdicts JSON here, then press Load verdicts again.';
    if(e.target.dataset.armed){}e.target.dataset.armed='1';e.target.textContent='Load pasted JSON';e.target.id='doImport';return}
  if(e.target.id==='doImport'){try{const j=JSON.parse(document.getElementById('exportText').value);(j.verdicts||[]).forEach(x=>{V[x.id]={v:x.verdict||'',n:x.note||''}});save();msg('Loaded.');render()}catch(_){msg('That is not valid verdicts JSON.')}return}
});
document.addEventListener('change',e=>{if(e.target.id==='showApp'){showApp=e.target.checked;render()}});
document.addEventListener('input',e=>{if(e.target.matches('.note textarea')){const id=e.target.closest('.item').dataset.id;V[id]=V[id]||{};V[id].n=e.target.value;save()}});
function msg(s){document.getElementById('copyMsg').textContent=s}
function openExport(){const verdicts=Object.keys(REG).map(id=>({id,code:REG[id].code,section:REG[id].section,verdict:(V[id]||{}).v||'unmarked',note:(V[id]||{}).n||'',text:REG[id].text.slice(0,140)})).filter(x=>x.verdict!=='unmarked'||x.note);
  const c=counts();const out={hub:'IB-MAI-Hub',pilot:'Topic 4 correlation and regression',round:D.round,exported:new Date().toISOString(),summary:{total:c.t,agree:c.a,revise:c.r,cut:c.x,unmarked:c.t-c.a-c.r-c.x},verdicts};
  const ta=document.getElementById('exportText');ta.readOnly=true;ta.value=JSON.stringify(out,null,1);document.getElementById('rnd').textContent=D.round;msg('Copy, then paste into the chat.');
  const ib=document.getElementById('doImport');if(ib){ib.id='importBtn';ib.textContent='Load verdicts…'}
  document.getElementById('exportBox').style.display='flex'}
addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(tabs.some(t=>t.k===h)&&h!==cur){cur=h;render()}});
buildAll();render();
document.getElementById('mj').addEventListener('load',()=>{const w=()=>MathJax.startup&&MathJax.startup.promise?MathJax.startup.promise.then(()=>MathJax.typesetPromise([document.getElementById('main')])):setTimeout(w,100);w()});
</script></body></html>"""
open("/home/claude/work/review.html", "w").write(HTML.replace("__DATA__", data))
print("written", len(HTML) + len(data))
