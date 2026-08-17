/* Keneflex 0.4.4k — orientation, laterality, multi-pattern intake, and plan-first answer architecture. */

/* ---- Opening orientation: tell a first-time consumer what Keneflex is ---- */
(function kfxKOrientIntro(){
  const hero=document.querySelector('#intro .hero');
  if(!hero)return;
  const h1=hero.querySelector('h1');
  const p=hero.querySelector('p');
  if(h1)h1.textContent="Tell Keneflex what’s bothering you.";
  if(p)p.innerHTML='<b>Keneflex helps you figure out what may help.</b> Describe the problem in your own words. Keneflex asks what matters, researches the reasonable options, and builds a plan specific to you — including what to buy, what to do at home, and what may not be worth adding.';
  const promise=hero.querySelector('.promise');
  if(promise)promise.innerHTML='<span class="pill">Talk normally</span><span class="pill">Keneflex does the narrowing</span><span class="pill">Get a clear plan</span>';
  const q=document.querySelector('#intro .question');
  if(q)q.textContent='What’s bothering you?';
  const help=document.querySelector('#intro .help');
  if(help)help.textContent='Start the way you would with a very knowledgeable person. A sentence is enough.';
})();

/* ---- Laterality + multiple-area intelligence ---- */
function kfxKAskSide(){
  setProgress(43);
  addAI('Which side is bothering you?');
  oneSelect('Which side?','Choose the closest answer.',[
    {value:'left',label:'Left'},
    {value:'right',label:'Right'},
    {value:'both',label:'Both sides'},
    {value:'unsure',label:'I’m not sure'}
  ],v=>{state.side=v;kfxKAskAreaRelationship()});
}

function kfxKAskAreaRelationship(){
  if(state.location.size<2){askOnset();return;}
  setProgress(46);
  addAI('You pointed to more than one area. Keneflex should not assume they are all the same problem. Do they seem to act together, or differently?');
  oneSelect('How do the areas behave?','This can help Keneflex avoid forcing two different patterns into one explanation.',[
    {value:'same',label:'They usually bother me together / seem like one pattern'},
    {value:'different',label:'They feel different or show up with different activities'},
    {value:'unsure',label:'I’m not sure'}
  ],v=>{
    state.areaRelationship=v;
    if(v!=='different'){askOnset();return;}
    addAI('Tell Keneflex how they differ. A simple comparison is enough.');
    textComposer('For example: my wrist bothers me at the computer, but my thumb is worse after using my phone…','Continue →',txt=>{
      state.areaPatternDetail=txt.trim();
      askOnset();
    });
  });
}

askLocation=function(){
  setProgress(39);
  if(state.location.size)addAI(`You already mentioned the ${[...state.location].join(' and ')} area. Keneflex just wants to make sure it has the location right.`);
  else addAI('Where in the hand do you feel it most?');
  multiselect('Where do you feel it?','Pick all that apply.',[
    {value:'thumb',label:'Thumb / base of thumb'},{value:'fingers',label:'Fingers'},{value:'palm',label:'Palm'},
    {value:'back',label:'Back of hand'},{value:'wrist',label:'Wrist'},{value:'pinky',label:'Pinky-side of hand/wrist'},
    {value:'diffuse',label:'Several areas / hard to pinpoint'}
  ],'Continue →',sel=>{state.location=sel;kfxKAskSide()});
};

function kfxKSideLabel(){
  return ({left:'left',right:'right',both:'both',unsure:''})[state.side]||'';
}

/* ---- Humanize long trigger echoes ---- */
function kfxKCompactTriggerDetail(){
  const raw=(state.triggerDetail||'').trim();
  if(!raw)return '';
  const s=raw.toLowerCase();
  const parts=[];
  if(/computer|typing|keyboard|mouse/.test(s))parts.push('computer work');
  if(/phone|scroll|text|game/.test(s))parts.push('phone use');
  if(/grip|jar/.test(s))parts.push('gripping');
  if(/twist/.test(s))parts.push('twisting');
  if(/workout|exercise|weight/.test(s))parts.push('workouts');
  return [...new Set(parts)].join(' and ') || (raw.length<=70?raw:'the activities you described');
}

/* ---- Doctor-facing branded summary ---- */
function kfxKDoctorText(){
  const side=kfxKSideLabel();
  const area=kfxHLoc();
  const rel=state.areaRelationship==='different'&&state.areaPatternDetail?`The consumer describes potentially different patterns across the selected areas: ${state.areaPatternDetail}. `:'';
  const activity=kfxHActivity();
  const goal=kfxHGoal();
  return `KENEFLEX CONSUMER SUMMARY\n\nConcern: ${side?side+' ':''}${area}.\nPattern: Symptoms are reported mainly around ${activity}. ${rel}\nDuration: ${state.duration||'not clearly established'}.\nGoal: ${goal}.\n\nCurrent Keneflex starting plan:\n- Neo G Airflow Wrist & Thumb Support — Medium (prototype recommendation)\n- Reusable cold option after aggravating use if helpful; use an adequate one already owned instead\n- Optional topical comfort product\n- At-home changes to reduce or modify aggravating use while maintaining comfortable movement\n\nThis is a consumer-generated Keneflex summary for discussion, not a diagnosis. Provider-specific product or use instructions should override Keneflex recommendations.`;
}

function kfxKOpenDoctorSummary(){
  const txt=kfxKDoctorText();
  const html=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Keneflex summary to share</title><style>
    *{box-sizing:border-box}body{margin:0;background:#f6f1e6;color:#153f3b;font-family:Arial,sans-serif}.sheet{max-width:850px;margin:auto;padding:32px}.hero{background:#174b46;color:#fff;border-radius:26px;padding:30px}.brand{font-weight:900;letter-spacing:.2em}.hero h1{font-size:34px;margin:12px 0 8px}.hero p{color:#e2eeea;line-height:1.45}.card{background:#fff;border:1px solid #d9e1dc;border-radius:20px;padding:22px;margin-top:16px}.card h2{margin-top:0}.row{display:grid;grid-template-columns:160px 1fr;gap:12px;margin:10px 0}.label{font-weight:900}.plan li{margin:8px 0;line-height:1.45}.note{background:#edf5ef}.actions{display:flex;gap:10px;margin:20px 0}.actions button{border:0;border-radius:12px;padding:13px 18px;background:#174b46;color:#fff;font-weight:900}.footer{margin-top:24px;padding-top:18px;border-top:1px solid #d6ddd8;color:#64766f;font-size:12px}.tagline{font-weight:900;color:#174b46}.copybox{white-space:pre-wrap;font-family:Arial,sans-serif;font-size:13px;line-height:1.5;background:#f6f8f6;border-radius:14px;padding:14px}@media(max-width:650px){.sheet{padding:16px}.row{grid-template-columns:1fr}.hero h1{font-size:28px}}@media print{body{background:#fff}.sheet{padding:0}.actions{display:none}.hero,.card{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style></head><body><main class="sheet"><section class="hero"><div class="brand">KENEFLEX</div><h1>Summary to share with your healthcare professional</h1><p>A clear snapshot of what you told Keneflex and the starting plan Keneflex suggested.</p></section>
  <section class="card"><div class="row"><div class="label">Area</div><div>${kfxKSideLabel()?kfxKSideLabel()+' ':''}${kfxHLoc()}</div></div><div class="row"><div class="label">Main pattern</div><div>${kfxHActivity()}</div></div>${state.areaRelationship==='different'&&state.areaPatternDetail?`<div class="row"><div class="label">Different patterns</div><div>${state.areaPatternDetail}</div></div>`:''}<div class="row"><div class="label">Duration</div><div>${state.duration||'Not clearly established'}</div></div><div class="row"><div class="label">Goal</div><div>${kfxHGoal()}</div></div></section>
  <section class="card plan"><h2>Keneflex starting plan</h2><ul><li>Recommended wrist/thumb support shown in the Keneflex plan.</li><li>Reusable cold option after aggravating use if helpful; use an adequate one already owned instead.</li><li>Optional topical comfort product.</li><li>Activity/setup changes and comfortable movement as part of the plan, not just products.</li></ul></section>
  <section class="card note"><h2>Important context</h2><p>This summary is designed to make it easier to share what you have already told Keneflex. It is not a diagnosis. If your healthcare professional has given specific product or use directions, those should guide the plan.</p></section>
  <section class="card"><h2>Copy/paste version</h2><div class="copybox" id="copytext"></div></section>
  <div class="actions"><button onclick="navigator.clipboard&&navigator.clipboard.writeText(document.getElementById('copytext').textContent)">Copy summary</button><button onclick="window.print()">Print / save</button><button onclick="window.close()">Close</button></div>
  <div class="footer"><span class="tagline">KENEFLEX</span> · Specific to you. Research translated into a clear next step.</div></main><script>document.getElementById('copytext').textContent=${JSON.stringify(txt)};<\/script></body></html>`;
  const w=window.open('','_blank');
  if(!w){modalContent.innerHTML='<h2>Share with your healthcare professional</h2><p>Your browser blocked the share window. Allow pop-ups for this prototype and try again.</p>';modal.classList.remove('hidden');return;}
  w.document.open();w.document.write(html);w.document.close();
}

/* ---- More valuable branded at-home printable ---- */
const _kfxKHomePlan=kfxHOpenHomePlan;
kfxHOpenHomePlan=function(){
  const side=kfxKSideLabel();
  const goal=kfxHGoal();
  const area=kfxHLoc();
  const activity=kfxHActivity();
  const detail=kfxKCompactTriggerDetail();
  const supportImg='https://www.neo-g.com/cdn/shop/files/722-13-Box_R_1080x.png?v=1725268865';
  const coldText=state.ownedCold?'Use the suitable cold pack you already own.':'Use the reusable cold option in your Keneflex plan after aggravating use if it feels helpful.';
  const topicalText=state.noTopical?'No topical is included in your current plan.':'The topical is optional for temporary comfort; follow the product label.';
  const split=state.areaRelationship==='different'&&state.areaPatternDetail?`<div class="pattern"><b>Keneflex noticed more than one pattern.</b><span>${state.areaPatternDetail}</span></div>`:'';
  const html=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your Keneflex at-home plan</title><style>
  *{box-sizing:border-box}body{margin:0;background:#f6f1e6;color:#153f3b;font-family:Arial,sans-serif}.sheet{max-width:900px;margin:auto;padding:30px}.hero{background:linear-gradient(135deg,#174b46,#23665e);color:#fff;border-radius:28px;padding:30px}.brand{font-size:14px;letter-spacing:.22em;font-weight:900}.hero h1{font-size:38px;margin:12px 0 8px}.hero p{font-size:18px;line-height:1.45;color:#e5f0ec}.tag{display:inline-block;margin-top:12px;background:#d8ea64;color:#153f3b;padding:7px 11px;border-radius:999px;font-weight:900;font-size:12px}.summary{margin:18px 0;background:#e5f2dd;border-radius:20px;padding:20px;font-size:16px;line-height:1.55}.pattern{background:#fff0dc;border-radius:16px;padding:14px;margin:14px 0}.pattern b,.pattern span{display:block}.pattern span{margin-top:4px}.products{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:18px 0}.prod{background:#fff;border:1px solid #d9e1dc;border-radius:18px;padding:14px;text-align:center}.prod img{height:82px;max-width:100%;object-fit:contain}.prod b{display:block;margin-top:8px}.prod span{display:block;color:#657770;font-size:12px;margin-top:4px}.steps{display:grid;grid-template-columns:1fr 1fr;gap:14px}.step{background:#fff;border:1px solid #d9e1dc;border-radius:20px;padding:18px}.num{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#d8ea64;font-weight:900}.step h2{font-size:19px;margin:10px 0 6px}.step p{font-size:14px;line-height:1.5;color:#516760}.why{margin-top:18px;background:#edf5ef;border-radius:20px;padding:20px}.why h2{margin-top:0}.why ul{padding-left:20px}.why li{margin:8px 0;line-height:1.45}.check{margin-top:18px;background:#fff0dc;border-radius:20px;padding:20px}.actions{display:flex;gap:10px;margin:20px 0}.actions button{border:0;border-radius:12px;padding:13px 18px;font-weight:900;background:#174b46;color:#fff}.footer{margin-top:22px;padding-top:16px;border-top:1px solid #d4ddd7;color:#66776f;font-size:12px}.footer b{color:#174b46}@media(max-width:650px){.sheet{padding:16px}.products,.steps{grid-template-columns:1fr}.hero h1{font-size:30px}}@media print{body{background:#fff}.sheet{padding:0}.actions{display:none}.hero,.summary,.pattern,.prod,.step,.why,.check{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style></head><body><main class="sheet"><section class="hero"><div class="brand">KENEFLEX</div><h1>Your plan at home</h1><p>Built around what you told Keneflex — not a generic handout.</p><span class="tag">Goal: ${goal}</span></section>
  <div class="summary"><b>What this plan is built around:</b> ${side?side+' ':''}${area}, mainly around ${activity}${detail?`, especially ${detail}`:''}.${split}</div>
  <section class="products"><article class="prod"><img src="${supportImg}" alt="Recommended support"><b>Support</b><span>Use the recommended wrist/thumb support where it helps with the aggravating activities.</span></article><article class="prod"><div style="height:82px;display:flex;align-items:center;justify-content:center">${kfxHColdSVG()}</div><b>Recovery</b><span>${coldText}</span></article><article class="prod"><div style="height:82px;display:flex;align-items:center;justify-content:center">${kfxHMotionSVG()}</div><b>Comfort + movement</b><span>${topicalText} Keep comfortable movement rather than forcing painful motion.</span></article></section>
  <section class="steps"><article class="step"><span class="num">1</span><h2>Change what keeps setting it off</h2><p>${kfxIActivityTip()}</p></article><article class="step"><span class="num">2</span><h2>Use support strategically</h2><p>Use the support for the activities Keneflex identified as aggravating if it is comfortable and consistent with the product directions. The goal is useful support, not automatically wearing it all day.</p></article><article class="step"><span class="num">3</span><h2>Recover after aggravating use</h2><p>${coldText} ${topicalText}</p></article><article class="step"><span class="num">4</span><h2>Keep comfortable motion</h2><p>Move the wrist and thumb gently through comfortable ranges and avoid forcing motions that clearly make the area worse.</p></article></section>
  <section class="why"><h2>Why Keneflex built the plan this way</h2><ul><li>The support covers the wrist and thumb without starting with the most restrictive option.</li><li>Recovery is included because you reported that symptoms can persist after the aggravating activity.</li><li>The topical is optional comfort support — not a requirement for the plan to work.</li><li>At-home changes matter because the products are only part of the solution.</li></ul></section>
  <section class="check"><h2>What happens next matters</h2><p><b>If you are improving:</b> keep the parts that are helping. <b>If you are not improving:</b> tell Keneflex what changed, what did not, and anything new so the next plan can change with the new information.</p></section>
  <div class="actions"><button onclick="window.print()">Print / save this plan</button><button onclick="window.close()">Close</button></div><div class="footer"><b>KENEFLEX</b> · Specific to you. Research translated into a clear next step. Keep this page with your plan or share it when useful.</div></main></body></html>`;
  const w=window.open('','_blank');
  if(!w){_kfxKHomePlan();return;}
  w.document.open();w.document.write(html);w.document.close();
};

/* ---- Plan first; deeper work becomes clear, optional links ---- */
function kfxKFindMainBlock(prefix){
  return [...document.querySelectorAll('#solutionView .main > .block')].find(b=>b.querySelector('h2')?.textContent.trim().startsWith(prefix));
}
function kfxKFindSideBlock(cls){return document.querySelector(`#solutionView .side > .block.${cls}`)}

function kfxKResearchHTML(){
  return `<h2>See how Keneflex researched the whole plan</h2>
    <p class="help">The product is not the plan. Keneflex should be able to explain how every part earned a place.</p>
    <div class="kfxKResearchRole"><h3>1. Support</h3><p><b>Job:</b> cover the wrist and thumb while preserving useful motion.</p><div class="rejects"><div class="reject"><img alt="" src="https://www.neo-g.com/cdn/shop/files/722-13-Box_R_1080x.png?v=1725268865"/><div><div class="rejectName">✓ Neo G Airflow</div><div class="rejectWhy">Selected in this prototype for combined wrist/thumb coverage, sizing and lower restriction.</div></div></div><div class="reject"><img alt="" src="https://i5.walmartimages.com/asr/f2040642-c7f9-4f11-bf91-f4142582c6fe.203d36a3da5092b0b01f98a9b53061ee.jpeg"/><div><div class="rejectName">FUTURO Deluxe Thumb Stabilizer</div><div class="rejectWhy">More thumb-focused and more restrictive than Keneflex would start with from this story.</div></div></div><div class="reject"><img alt="" src="https://hitechtherapyonline.co.za/images/thumbs/0001772_mueller-reversible-thumb-stabilizer_550.jpeg"/><div><div class="rejectName">Mueller Reversible Thumb Stabilizer</div><div class="rejectWhy">More rigid thumb control; not Keneflex’s first choice unless the need for stabilization changes.</div></div></div></div></div>
    <div class="kfxKResearchRole"><h3>2. Recovery</h3><p><b>Options Keneflex considered:</b> a reusable wrist-specific cold wrap, a general reusable cold pack you already own, or no additional recovery product. The wrist wrap earns a place only for convenience and coverage; an adequate cold pack you already own can replace it at $0.</p></div>
    <div class="kfxKResearchRole"><h3>3. Comfort</h3><p><b>Options Keneflex considered:</b> optional topical comfort support versus no topical. The topical is not treated as essential, which is why the plan can be rebuilt without it if you do not want it.</p></div>
    <div class="kfxKResearchRole"><h3>4. At-home changes</h3><p><b>Why they are included:</b> your story points to specific activities and positions that matter. Keneflex therefore includes changes to the aggravating setup and comfortable movement instead of pretending the purchased products are the whole answer.</p></div>
    <details><summary>How confident Keneflex is — and what is still unknown</summary><div class="detailInside"><div class="confgrid"><div class="confcard"><b>Fit information · strong</b><span>The wrist measurement is inside a defined manufacturer size range.</span></div><div class="confcard"><b>Plan match · reasonable</b><span>The products and at-home steps were selected to match the story you gave Keneflex.</span></div><div class="confcard"><b>Your result · still unknown</b><span>What happens after you try the plan becomes important new information.</span></div></div></div></details>
    <details><summary>Where Keneflex got the information</summary><div class="detailInside"><p class="help">This prototype uses manufacturer product information and a simplified demonstration of the Keneflex reasoning model. The production system is intended to add current evidence, conservative-care guidance, expert practice, product intelligence and real-world outcome patterns for every part of the solution.</p></div></details>`;
}

function kfxKRestructureSolution(){
  const main=document.querySelector('#solutionView .main');
  const side=document.querySelector('#solutionView .side');
  const grid=document.querySelector('#solutionView .grid');
  if(!main||!side||!grid)return;
  if(main.dataset.kfxk==='1')return; main.dataset.kfxk='1';

  const why=kfxKFindMainBlock('Why this plan fits you');
  const plan=kfxKFindMainBlock('Your complete Keneflex plan');
  const home=kfxKFindMainBlock('Your at-home plan');
  const research=[...document.querySelectorAll('#solutionView .main > .block')].find(b=>b.classList.contains('detailsBlock'));
  const ask=kfxKFindMainBlock('Ask Keneflex about your plan');
  const follow=kfxKFindMainBlock('Tell Keneflex what happened');
  const tune=kfxKFindSideBlock('tune');
  const total=[...side.querySelectorAll(':scope > .block')].find(b=>b.querySelector('.total'));
  const integrity=kfxKFindSideBlock('integrity');
  const notAdd=[...side.querySelectorAll(':scope > .block')].find(b=>b.querySelector('h2')?.textContent.includes('did not add'));
  const cart=kfxKFindSideBlock('cartPreview');

  if(plan)main.insertBefore(plan,main.firstChild);
  if(total&&plan)plan.insertAdjacentElement('afterend',total);
  if(home&&total)total.insertAdjacentElement('afterend',home);

  const nav=document.createElement('section');nav.className='block kfxKNext';nav.innerHTML=`<h2>Want the details?</h2><p class="help">Your plan is above. Open only what is useful to you.</p><div class="kfxKLinks"><button data-open="home">Open my at-home plan</button><button data-open="why">Why this plan fits me</button><button data-open="research">See Keneflex’s research</button><button data-open="adjust">Adjust my plan</button><button data-open="doctor">Share with my healthcare professional</button></div>`;
  const anchor=home||total||plan; if(anchor)anchor.insertAdjacentElement('afterend',nav); else main.prepend(nav);

  function makeDisclosure(block,label,key){
    if(!block)return;
    block.classList.add('kfxKDisclosure');block.dataset.disclosure=key;block.style.display='none';
    const h=block.querySelector(':scope > h2');if(h)h.textContent=label;
  }
  if(home){home.style.display='none';}
  makeDisclosure(why,'Why this plan fits you','why');
  if(research){research.innerHTML=kfxKResearchHTML();makeDisclosure(research,'See how Keneflex researched the whole plan','research');}
  if(tune){tune.classList.add('kfxKDisclosure');tune.dataset.disclosure='adjust';tune.style.display='none';main.appendChild(tune);}
  if(ask){ask.style.display='none';research&&research.appendChild(ask);ask.style.display='block';}
  if(notAdd){notAdd.style.display='none';research&&research.appendChild(notAdd);notAdd.style.display='block';}
  if(integrity){integrity.style.display='none';research&&research.appendChild(integrity);integrity.style.display='block';}
  if(follow)main.appendChild(follow);
  if(cart)main.appendChild(cart);

  nav.querySelector('[data-open="doctor"]').onclick=kfxKOpenDoctorSummary;
  nav.querySelector('[data-open="home"]').onclick=kfxHOpenHomePlan;
  const homeBtn=document.getElementById('kfxHomePlanBtn');if(homeBtn)homeBtn.onclick=kfxHOpenHomePlan;
  nav.querySelectorAll('[data-open]').forEach(btn=>{
    const key=btn.dataset.open;if(key==='doctor'||key==='home')return;
    btn.onclick=()=>{
      const b=main.querySelector(`[data-disclosure="${key}"]`);if(!b)return;
      const open=b.style.display==='none';b.style.display=open?'block':'none';
      if(open)b.scrollIntoView({behavior:'smooth',block:'start'});
    };
  });

  /* Make multi-pattern thinking visible without diagnosing. */
  if(state.areaRelationship==='different'&&state.areaPatternDetail&&plan){
    const note=document.createElement('div');note.className='kfxKPatternNote';note.innerHTML=`<b>Keneflex is keeping two patterns separate for now.</b><span>${state.areaPatternDetail}</span><small>Keneflex does not need to force the wrist and thumb into one explanation in order to build a practical first plan.</small>`;
    plan.insertBefore(note,plan.children[1]||null);
  }

  const style=document.createElement('style');style.textContent=`
    #solutionView .grid{grid-template-columns:minmax(0,1fr)!important;max-width:980px;margin-left:auto;margin-right:auto}
    #solutionView .side{display:none!important}
    .kfxKNext{background:#f7faf6}
    .kfxKLinks{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:14px}
    .kfxKLinks button{border:1px solid var(--line);border-radius:15px;background:#fff;color:var(--ink);padding:15px;text-align:left;font-weight:900;font-size:14px}
    .kfxKDisclosure{scroll-margin-top:90px}
    .kfxKResearchRole{border:1px solid var(--line);border-radius:18px;padding:17px;margin:12px 0;background:#fbfcfa}
    .kfxKResearchRole h3{margin:0 0 8px;font-size:17px}.kfxKResearchRole p{margin:0;line-height:1.55;color:var(--muted)}
    .kfxKPatternNote{background:#fff0dc;border-radius:16px;padding:14px;margin:12px 0 18px}.kfxKPatternNote b,.kfxKPatternNote span,.kfxKPatternNote small{display:block}.kfxKPatternNote span{margin-top:5px}.kfxKPatternNote small{margin-top:7px;color:var(--muted);line-height:1.4}
    @media(max-width:650px){.kfxKLinks{grid-template-columns:1fr}}
  `;document.head.appendChild(style);
}

const _kfxKShowSolution=showSolution;
showSolution=function(){_kfxKShowSolution();setTimeout(kfxKRestructureSolution,0)};
