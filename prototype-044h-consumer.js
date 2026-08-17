/* Keneflex 0.4.4h — consumer answer / total-solution pass
   Keeps the conversational reasoning work, but rewrites the answer layer in
   consumer language and makes the at-home plan specific, printable, and visual. */

function kfxHLoc(){
  const labels={thumb:'thumb/base of thumb',fingers:'fingers',palm:'palm',back:'back of the hand',wrist:'wrist',pinky:'pinky-side of the hand/wrist',diffuse:'hand'};
  const vals=[...state.location].map(x=>labels[x]||x);
  if(!vals.length)return 'hand/wrist area';
  if(vals.length===1)return vals[0];
  return vals.slice(0,-1).join(', ')+' and '+vals[vals.length-1];
}
function kfxHActivity(){
  const s=(state.triggerSummary||'').toLowerCase();
  const phone=s.includes('phone'), computer=s.includes('computer')||s.includes('typing');
  const workout=s.includes('workout')||s.includes('exercise'), pickle=s.includes('pickleball');
  const grip=s.includes('gripping'), twist=s.includes('twisting');
  if(phone&&computer)return 'using your phone or working at your computer';
  if(phone)return 'using your phone';
  if(computer)return 'working at your computer';
  if(pickle)return 'playing pickleball';
  if(workout)return 'working out';
  if(grip&&twist)return 'gripping or twisting';
  if(grip)return 'gripping';
  if(twist)return 'twisting';
  return state.triggerSummary||'using your hand';
}
function kfxHDetail(){
  const s=(state.triggerDetail||'').toLowerCase();
  if(!s)return '';
  const phone=[];
  if(/hold|holding/.test(s)&&/phone/.test(s))phone.push('holding your phone');
  if(/scroll/.test(s))phone.push('scrolling');
  if(/text/.test(s))phone.push('texting');
  if(/game/.test(s))phone.push('playing games');
  const comp=[];
  if(/typ/.test(s))comp.push('typing');
  if(/mouse/.test(s))comp.push('using the mouse');
  if(/trackpad/.test(s))comp.push('using the trackpad');
  if(/rest.*wrist|wrist.*desk/.test(s))comp.push('resting your wrist on the desk');
  const join=(a)=>a.length<2?a[0]:(a.length===2?a.join(' and '):a.slice(0,-1).join(', ')+', and '+a[a.length-1]);
  const parts=[];
  if(phone.length)parts.push(join([...new Set(phone)]) + (/phone/.test(s)?' on your phone':''));
  if(comp.length)parts.push(join([...new Set(comp)]));
  if(parts.length)return parts.join(' and ');
  return kfxClean(state.triggerDetail).replace(/\bmy\b/gi,'your').replace(/\bi\b/gi,'you').replace(/^./,m=>m.toLowerCase());
}
function kfxHGoal(){
  const raw=(state.activity||state.goal||'').trim();
  const s=raw.toLowerCase();
  if(/work|job|computer/.test(s))return 'keep working';
  if(/pickle/.test(s))return 'keep playing pickleball';
  if(/exercise|workout|gym/.test(s))return 'keep exercising';
  if(/sleep/.test(s))return 'sleep more comfortably';
  if(/phone|text|scroll/.test(s))return 'use your phone comfortably';
  let clean=raw.replace(/^i['’]?\s*d like to (be able to )?/i,'')
               .replace(/^i would like to (be able to )?/i,'')
               .replace(/^i want to (be able to )?/i,'')
               .replace(/^be able to /i,'')
               .replace(/^continue /i,'keep ');
  if(!clean)return 'keep doing your normal activities';
  if(!/^keep\b/i.test(clean)&&!/^(sleep|use|work|play|exercise)/i.test(clean))clean='keep doing '+clean;
  return clean.charAt(0).toLowerCase()+clean.slice(1);
}
function kfxHPattern(){
  const p=state.pattern||new Set();
  const bits=[];
  if(p.has('night'))bits.push('you also notice it at night');
  if(p.has('wake'))bits.push('it can wake you up');
  if(p.has('morning'))bits.push('it can be worse first thing in the morning');
  if(p.has('rest'))bits.push('it can also bother you at rest');
  return bits.length?bits.join(', and '):'';
}
function kfxHLatency(){
  const m={quick:'within a few minutes','10-30':'after about 10–30 minutes','30-60':'after about 30–60 minutes',longer:'after an hour or more'};
  return m[state.triggerLatency]||'';
}
function kfxHRelief(){
  if(state.relief==='quick')return 'It settles fairly quickly when you stop or change position.';
  if(state.relief==='gradual')return 'It eases after you stop, but takes a while.';
  if(state.relief==='no')return 'It tends to linger even after you stop.';
  return '';
}
function kfxHCap(s){return s?s.charAt(0).toUpperCase()+s.slice(1):s;}

showEnough=function(){
  setProgress(100);
  addAI(`Okay — Keneflex has enough to show you where it would start.`);
  const summary=document.createElement('div');
  summary.className='card enough kfxSummary';
  summary.style.marginTop='12px';

  const loc=kfxHLoc();
  const activity=kfxHActivity();
  const detail=kfxHDetail();
  const latency=kfxHLatency();
  const pattern=kfxHPattern();
  const relief=kfxHRelief();
  const goal=kfxHGoal();

  const sentences=[];
  sentences.push(`The area around your ${loc} bothers you most, especially when ${activity}.`);
  if(detail)sentences.push(`${kfxHCap(detail)} ${latency?`tends to bring it on ${latency}`:'seems to be one of the main triggers'}.`);
  else if(latency)sentences.push(`It usually starts ${latency}.`);
  if(relief)sentences.push(relief);
  if(pattern)sentences.push(`${kfxHCap(pattern)}.`);
  sentences.push(`Your main goal is to ${goal.replace(/^keep /,'keep ')} without this getting in the way.`);

  summary.innerHTML=`<h2>Here’s what Keneflex heard.</h2><p>${sentences.join(' ')}</p><div class="row"><button id="seePlan" class="primary">Show me the plan →</button></div>`;
  interaction.replaceWith(summary);
  document.getElementById('seePlan').onclick=showSolution;
};

renderWhy=function(){
  const rows=document.getElementById('whyRows');
  if(!rows)return;
  const loc=kfxHLoc(), activity=kfxHActivity(), detail=kfxHDetail(), goal=kfxHGoal();
  const timing=[kfxHLatency(), kfxHPattern(), kfxHRelief()].filter(Boolean).join('. ');
  const wrist=state.wrist||'7.0';
  const first=`The soreness is centered around your ${loc} and shows up mainly when ${activity}${detail?`, especially ${detail}`:''}.`;
  rows.innerHTML=`
    <div class="kfxReason">
      <div class="kfxReasonLabel">What Keneflex heard</div>
      <div class="kfxReasonText">${first}</div>
      <div class="kfxReasonArrow">↓</div>
      <div class="kfxReasonAction"><b>What Keneflex did with that</b><span>Keneflex looked for a solution that supports the areas you described without adding more restriction than the story calls for.</span></div>
    </div>
    <div class="kfxReason">
      <div class="kfxReasonLabel">What matters to you</div>
      <div class="kfxReasonText">You want to ${goal} without this getting in the way.</div>
      <div class="kfxReasonArrow">↓</div>
      <div class="kfxReasonAction"><b>What Keneflex did with that</b><span>Keeping useful movement and making the plan realistic for your day became part of the recommendation.</span></div>
    </div>
    <div class="kfxReason">
      <div class="kfxReasonLabel">How it behaves</div>
      <div class="kfxReasonText">${timing||`It is tied mainly to the activities you described.`}</div>
      <div class="kfxReasonArrow">↓</div>
      <div class="kfxReasonAction"><b>What Keneflex did with that</b><span>That is why the plan combines support with changes to the aggravating activity and recovery instead of relying on one product alone.</span></div>
    </div>
    <div class="kfxReason">
      <div class="kfxReasonLabel">Fit</div>
      <div class="kfxReasonText">The wrist measurement entered for this prototype is ${wrist} inches.</div>
      <div class="kfxReasonArrow">↓</div>
      <div class="kfxReasonAction"><b>What Keneflex did with that</b><span>Medium is the manufacturer size Keneflex would use for the support shown here.</span></div>
    </div>`;
};

function kfxHUpdatePlanCopy(){
  const h1=document.querySelector('#solutionView .solHero h1');
  if(h1)h1.textContent='Here’s what Keneflex recommends.';
  const lead=document.getElementById('solutionLead');
  if(lead)lead.textContent=`Based on what you told Keneflex, the plan combines the right support, recovery and comfort options with a few practical changes to ${kfxHActivity()}. The goal is a complete plan that is useful without making it more complicated than it needs to be.`;
  const heroB=document.querySelector('#solutionView .heroBox b');
  if(heroB)heroB.textContent='Why Keneflex is starting here';
  const conf=document.getElementById('confidenceCopy');
  if(conf)conf.textContent='From what you told Keneflex, starting with a conservative self-care plan makes sense. If the pattern changes or the plan does not help, Keneflex should reassess with you.';

  const supportCopy=document.querySelector('#supportItem .planCopy');
  if(supportCopy)supportCopy.textContent='Covers both the wrist and thumb while preserving more usable movement than a rigid immobilizer. The 7.0-inch wrist measurement used in this prototype falls in the Medium size range.';
  const coldCopy=document.getElementById('coldCopy');
  if(coldCopy)coldCopy.textContent=`A reusable cold option for after ${kfxHActivity()} when the area is left sore. If you already own a suitable cold pack, use yours instead.`;
  const topicalCopy=document.querySelector('#topicalItem .planCopy');
  if(topicalCopy)topicalCopy.textContent='An optional comfort tool for temporary symptom relief. Keneflex includes it as support, not as the part that makes the overall plan work.';
}

const _kfxHShowSolution=showSolution;
showSolution=function(){
  kfxHUpdatePlanCopy();
  _kfxHShowSolution();
};

function kfxHFindBlock(start){
  return [...document.querySelectorAll('#solutionView .main > .block')].find(b=>{
    const h=b.querySelector(':scope > h2');
    return h&&h.textContent.trim().startsWith(start);
  });
}
function kfxHStaticPolish(){
  document.title='Keneflex Prototype 0.4.4h';
  const eyebrow=document.querySelector('#intro .eyebrow');
  if(eyebrow)eyebrow.textContent='Prototype 0.4.4h • Generalist Brain';

  const why=kfxHFindBlock('Why this fits you');
  if(why&&why.querySelector('h2'))why.querySelector('h2').textContent='Why this plan fits you';

  const complete=kfxHFindBlock('The complete plan');
  if(complete){
    complete.querySelector('h2').textContent='Your complete Keneflex plan';
    const help=complete.querySelector('.help');
    if(help)help.textContent='Keneflex starts with the complete plan it would recommend from what you told it. You can adjust the plan afterward for what you already own, what you do not want, or what you can spend.';
  }

  const home=kfxHFindBlock('What I’d have you do');
  if(home){
    home.innerHTML=`
      <div class="kfxHomeIntro">
        <div class="kfxHomeIcon">⌂</div>
        <div>
          <h2>Your at-home plan, specific to you</h2>
          <p>Products are only part of the answer. Keneflex has also built a simple plan for what to do at home and during the activities that are bothering you.</p>
        </div>
      </div>
      <button class="kfxHomeButton" id="kfxHomePlanBtn">Open my at-home plan →</button>
      <p class="micro kfxPrintNote">Designed as a colorful one-page guide you can save or print.</p>`;
    document.getElementById('kfxHomePlanBtn').onclick=kfxHOpenHomePlan;
  }

  const details=document.querySelector('#solutionView .detailsBlock');
  if(details){
    details.innerHTML=`
      <h2>Want to see how Keneflex chose your plan?</h2>
      <details>
        <summary>How each part of your plan earned a place</summary>
        <div class="detailInside">
          <div class="kfxPlanLogic">
            <div><b>Support</b><span>Keneflex wanted combined wrist/thumb coverage with less restriction than a rigid immobilizer.</span></div>
            <div><b>Recovery</b><span>Because the area can stay sore after use, Keneflex included a reusable cold option — but an adequate one you already own can do that job.</span></div>
            <div><b>Comfort</b><span>The topical is optional. It can add temporary comfort, but the plan still works without it.</span></div>
            <div><b>At-home changes</b><span>Keneflex included changes to the aggravating activity and comfortable movement because the product is not the whole solution.</span></div>
          </div>
          <h3 class="kfxSubhead">For the support role, Keneflex also compared:</h3>
          <div class="rejects">
            <div class="reject"><img alt="" src="https://www.neo-g.com/cdn/shop/files/722-13-Box_R_1080x.png?v=1725268865"/><div><div class="rejectName">✓ Neo G Airflow</div><div class="rejectWhy">Combined wrist/thumb coverage, measured sizing and less restriction fit this scenario best.</div></div></div>
            <div class="reject"><img alt="" src="https://i5.walmartimages.com/asr/f2040642-c7f9-4f11-bf91-f4142582c6fe.203d36a3da5092b0b01f98a9b53061ee.jpeg"/><div><div class="rejectName">FUTURO Deluxe Thumb Stabilizer</div><div class="rejectWhy">More thumb-specific stabilization and more restriction than Keneflex would start with from this story.</div></div></div>
            <div class="reject"><img alt="" src="https://hitechtherapyonline.co.za/images/thumbs/0001772_mueller-reversible-thumb-stabilizer_550.jpeg"/><div><div class="rejectName">Mueller Reversible Thumb Stabilizer</div><div class="rejectWhy">Rigid stays limit more thumb motion. Keneflex would not start there unless the problem or functional need changed.</div></div></div>
          </div>
        </div>
      </details>
      <details>
        <summary>How confident Keneflex is — and what is still unknown</summary>
        <div class="detailInside"><div class="confgrid">
          <div class="confcard"><b>Fit information · strong</b><span>The wrist measurement is inside a defined manufacturer size range.</span></div>
          <div class="confcard"><b>Plan match · reasonable</b><span>The products and at-home steps were selected to match the story you gave Keneflex.</span></div>
          <div class="confcard"><b>Your result · still unknown</b><span>No recommendation can know your outcome in advance. How you respond becomes important new information.</span></div>
        </div></div>
      </details>
      <details>
        <summary>Where Keneflex got the information</summary>
        <div class="detailInside"><p class="help" style="font-size:12px;margin:0">For this prototype, product specifications and sizing come from manufacturer information. The production Keneflex system is intended to add current evidence, conservative-care guidance, expert practice, product intelligence and real-world outcome patterns before making a recommendation.</p></div>
      </details>`;
  }

  const ask=kfxHFindBlock('Ask Keneflex about this pick');
  if(ask){
    ask.innerHTML=`
      <h2>Ask Keneflex about your plan</h2>
      <div class="askList">
        <button class="askQ" data-ask="a1">Why include the brace at all? +</button>
        <div class="askA" id="a1">The brace fills one role in the plan: supporting both areas during the activities that are aggravating them. Keneflex is not treating the brace as the whole answer.</div>
        <button class="askQ" data-ask="a2">Why these products together? +</button>
        <div class="askA" id="a2">Each item has a different job: support, recovery, or optional comfort. Keneflex would remove any component that is unnecessary, duplicated by something you already own, or not worth using for you.</div>
        <button class="askQ" data-ask="a3">What would make Keneflex change the plan? +</button>
        <div class="askA" id="a3">A different symptom pattern, new injury, a fit or comfort problem, something you already own, your budget or preferences, or simply learning that the first plan is not helping enough.</div>
      </div>`;
  }

  const follow=kfxHFindBlock('Then tell me what happened');
  if(follow){
    follow.innerHTML=`<h2>Tell Keneflex what happened.</h2>
      <p><b>If it helps:</b> keep the parts that are helping. Keneflex will not add more just because more products exist.</p>
      <p><b>If it doesn’t:</b> come back and tell Keneflex what improved, what did not, and anything new. Keneflex should rethink the plan rather than automatically adding another product.</p>`;
  }

  const sideBlocks=[...document.querySelectorAll('#solutionView .side > .block')];
  const didNot=sideBlocks.find(b=>b.querySelector('h2')?.textContent.trim()==='What I did not add');
  if(didNot){
    didNot.querySelector('h2').textContent='What Keneflex did not add';
    const help=didNot.querySelector('.help');
    if(help)help.textContent='The goal is the most complete useful plan — not the largest cart.';
  }
  const tune=sideBlocks.find(b=>b.classList.contains('tune'));
  if(tune){
    tune.querySelector('h2').textContent='Adjust your solution';
    const help=tune.querySelector('.help');
    if(help)help.textContent='Tell Keneflex what changes in real life. Keneflex should rebuild the plan without handing the shopping decision back to you.';
    const reset=tune.querySelector('#resetTune'); if(reset)reset.textContent='Restore Keneflex’s complete plan';
  }
  const integ=sideBlocks.find(b=>b.classList.contains('integrity'));
  if(integ){
    integ.querySelector('h2').textContent='Why trust this plan?';
    const ps=integ.querySelectorAll('p');
    if(ps[0])ps[0].textContent='Keneflex should do the research before asking you to buy: your problem, the role each solution plays, fit, evidence, limitations, conservative alternatives and real-world patterns.';
    if(ps[1])ps[1].innerHTML='<b>Commercial transparency:</b> Keneflex may eventually earn money from a purchase. That never decides what Keneflex recommends.';
  }
  const cart=document.getElementById('cartPreviewBtn');
  if(cart)cart.textContent='Put my Keneflex plan in my cart →';

  if(typeof modalCopy!=='undefined'){
    modalCopy.how=`<h2>How Keneflex works</h2>
      <h3>1. Tell Keneflex what’s bothering you.</h3><p>Use normal words. You do not need to know what the problem is called or which aisle to shop.</p>
      <h3>2. Keneflex asks what matters.</h3><p>If you give a lot of useful detail, Keneflex moves faster. If you are not sure how to explain something, Keneflex helps you narrow it down.</p>
      <h3>3. Keneflex looks at the whole solution.</h3><p>Products, things you can do at home, conservative options, what you already own and what may not be worth adding all belong in the decision.</p>
      <h3>4. Keneflex recommends a plan specific to you.</h3><p>You get a clear starting point rather than another list of things to research.</p>
      <h3>5. Tell Keneflex how it went.</h3><p>If the plan works, great. If it does not, that result becomes new information and Keneflex should reconsider the plan with you.</p>`;

    modalCopy.approach=`<h2>Our approach</h2>
      <h3>Start with you, not the shelf.</h3><p>Tell Keneflex what is bothering you in your own words. Keneflex does the work of narrowing down what matters.</p>
      <h3>Keep the conversation simple.</h3><p>The thinking can be complicated behind the scenes. Your experience should not be.</p>
      <h3>Look broadly before choosing.</h3><p>Keneflex considers the reasonable ways to help — including simple at-home steps, conservative options and products — before recommending what belongs in your plan.</p>
      <h3>Recommend the whole solution.</h3><p>If Keneflex believes a brace, cold pack and topical all have a useful role, it should say so. If one item adds little value, it should leave it out.</p>
      <h3>Be willing to say “don’t buy it.”</h3><p>If something you already own does the job, or a product is unnecessary, Keneflex should tell you.</p>
      <h3>Know when a store solution is not enough.</h3><p>If what you tell Keneflex changes the situation enough that self-care is no longer the right place to start, Keneflex should say that clearly.</p>
      <h3>Learn from what happens next.</h3><p>Your response to the plan helps Keneflex decide whether to keep going, adjust something or rethink the approach.</p>`;
  }

  const style=document.createElement('style');
  style.textContent=`
    .kfxSummary p{font-size:18px;line-height:1.58}
    .kfxReason{border:1px solid var(--line);border-radius:20px;padding:18px;margin:0 0 16px;background:#fff}
    .kfxReasonLabel{font-size:12px;text-transform:uppercase;letter-spacing:.08em;font-weight:900;color:var(--muted);margin-bottom:8px}
    .kfxReasonText{font-size:16px;line-height:1.5}
    .kfxReasonArrow{text-align:center;font-size:25px;color:#8aa59c;padding:9px 0}
    .kfxReasonAction{background:#eef6f1;border-radius:15px;padding:14px;line-height:1.45}
    .kfxReasonAction b{display:block;margin-bottom:5px}
    .kfxReasonAction span{display:block}
    .kfxHomeIntro{display:grid;grid-template-columns:54px 1fr;gap:14px;align-items:start}
    .kfxHomeIntro h2{margin-top:0}
    .kfxHomeIntro p{color:var(--muted);line-height:1.55;margin:8px 0 0}
    .kfxHomeIcon{width:54px;height:54px;border-radius:16px;background:var(--lime);display:flex;align-items:center;justify-content:center;font-size:29px;font-weight:900}
    .kfxHomeButton{width:100%;border:0;border-radius:16px;background:var(--ink);color:#fff;font-weight:900;font-size:17px;padding:17px;margin-top:18px}
    .kfxPrintNote{text-align:center;margin-top:9px}
    .kfxPlanLogic{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:18px}
    .kfxPlanLogic>div{border:1px solid var(--line);border-radius:14px;padding:14px;background:#f8fbf8}
    .kfxPlanLogic b{display:block;margin-bottom:5px}
    .kfxPlanLogic span{font-size:12px;line-height:1.45;color:var(--muted)}
    .kfxSubhead{font-size:15px;margin:20px 0 10px}
    @media(max-width:650px){.kfxPlanLogic{grid-template-columns:1fr}.kfxHomeIntro{grid-template-columns:46px 1fr}.kfxHomeIcon{width:46px;height:46px}}
  `;
  document.head.appendChild(style);
}

function kfxHPhoneSVG(){
  return `<svg viewBox="0 0 180 130" aria-hidden="true"><rect x="63" y="14" width="54" height="96" rx="10" fill="#174b46"/><rect x="69" y="24" width="42" height="69" rx="5" fill="#dff1e7"/><circle cx="90" cy="101" r="4" fill="#dff1e7"/><path d="M38 97c17-8 27-10 39-2l20 14c7 5 15 3 19-4l12-21" fill="none" stroke="#e99071" stroke-width="11" stroke-linecap="round"/><path d="M45 66h22M34 51h34" stroke="#9bbd4f" stroke-width="7" stroke-linecap="round"/></svg>`;
}
function kfxHMotionSVG(){
  return `<svg viewBox="0 0 180 130" aria-hidden="true"><path d="M48 83c18-7 35-8 50 0l29 16" fill="none" stroke="#e99071" stroke-width="15" stroke-linecap="round"/><path d="M77 79V43c0-12 17-12 17 0v29" fill="none" stroke="#e99071" stroke-width="15" stroke-linecap="round"/><path d="M115 43c17 8 25 23 23 39" fill="none" stroke="#174b46" stroke-width="6" stroke-linecap="round"/><path d="M132 76l7 9 7-9" fill="none" stroke="#174b46" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function kfxHColdSVG(){
  return `<svg viewBox="0 0 180 130" aria-hidden="true"><circle cx="91" cy="63" r="42" fill="#dceff0"/><path d="M91 30v66M62 46l58 34M62 80l58-34" stroke="#257a83" stroke-width="7" stroke-linecap="round"/><path d="M91 30l-8 10m8-10 8 10M91 96l-8-10m8 10 8-10" stroke="#257a83" stroke-width="5" stroke-linecap="round"/></svg>`;
}
function kfxHOpenHomePlan(){
  const goal=kfxHGoal(), activity=kfxHActivity(), detail=kfxHDetail();
  const supportImg='https://www.neo-g.com/cdn/shop/files/722-13-Box_R_1080x.png?v=1725268865';
  const coldText=state.ownedCold?'Use the suitable cold pack you already own.':'Use the reusable cold option in your Keneflex plan if it feels helpful after aggravating use.';
  const topicalText=state.noTopical?'No topical is included in your current plan.':'The topical is optional for temporary comfort; use it only as directed on the label.';
  const html=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your Keneflex at-home plan</title>
  <style>
  *{box-sizing:border-box}body{margin:0;background:#f7f3e9;color:#153f3b;font-family:Arial,sans-serif}.sheet{max-width:850px;margin:auto;padding:34px}.hero{background:#174b46;color:white;border-radius:28px;padding:30px}.brand{font-size:14px;letter-spacing:.2em;font-weight:900}.hero h1{font-size:38px;margin:12px 0 8px}.hero p{font-size:18px;line-height:1.45;color:#e1eeea}.summary{margin:20px 0;background:#e7f3dd;border-radius:20px;padding:20px;font-size:17px;line-height:1.5}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.step{background:white;border-radius:22px;padding:18px;border:1px solid #d6dfd8;page-break-inside:avoid}.visual{height:130px;border-radius:16px;background:#f3f7f1;display:flex;align-items:center;justify-content:center;overflow:hidden}.visual svg{width:100%;height:100%}.visual img{max-width:88%;max-height:118px;object-fit:contain}.num{display:inline-flex;width:30px;height:30px;border-radius:50%;align-items:center;justify-content:center;background:#d8ea64;font-weight:900;margin-top:15px}.step h2{font-size:20px;margin:10px 0 7px}.step p{font-size:15px;line-height:1.5;color:#506762}.check{margin-top:18px;background:#fff2dc;border-radius:20px;padding:20px}.check h2{margin-top:0}.check p{line-height:1.5}.actions{display:flex;gap:10px;margin:22px 0}.actions button{border:0;border-radius:12px;padding:13px 18px;font-weight:900;background:#174b46;color:white}.fine{font-size:11px;color:#667873;line-height:1.45;margin-top:16px}@media(max-width:650px){.sheet{padding:16px}.grid{grid-template-columns:1fr}.hero h1{font-size:30px}}@media print{body{background:white}.sheet{padding:0}.actions{display:none}.hero,.step,.summary,.check{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style></head><body><main class="sheet">
  <section class="hero"><div class="brand">KENEFLEX</div><h1>Your at-home plan</h1><p>Specific to what you told Keneflex. The goal: ${goal} without this getting in the way.</p></section>
  <div class="summary"><b>What Keneflex is working with:</b> your ${kfxHLoc()} is bothered mainly when ${activity}${detail?`, especially ${detail}`:''}. This sheet turns the recommendation into a simple plan you can follow at home.</div>
  <section class="grid">
    <article class="step"><div class="visual">${kfxHPhoneSVG()}</div><span class="num">1</span><h2>Change the aggravating setup</h2><p>Break up long uninterrupted periods of ${activity}. Change hand position before symptoms build. For phone/computer use, consider propping the device, alternating hands, using voice input for long messages, and adjusting the keyboard or mouse position so the same hand is not doing all the work.</p></article>
    <article class="step"><div class="visual"><img src="${supportImg}" alt="Recommended wrist and thumb support"></div><span class="num">2</span><h2>Use the support when it is useful</h2><p>Use the recommended wrist/thumb support for the activities Keneflex identified as aggravating, if it is comfortable and following the product directions. The goal is support, not automatically wearing it all day.</p></article>
    <article class="step"><div class="visual">${kfxHColdSVG()}</div><span class="num">3</span><h2>Recover after aggravating use</h2><p>${coldText} ${topicalText}</p></article>
    <article class="step"><div class="visual">${kfxHMotionSVG()}</div><span class="num">4</span><h2>Keep comfortable movement</h2><p>Keep the wrist and thumb moving gently through comfortable ranges instead of forcing stretches or motions that clearly make the area feel worse.</p></article>
  </section>
  <section class="check"><h2>Then check back with Keneflex</h2><p><b>If you are improving:</b> keep the parts that are helping; there is no reason to add more just because more options exist.</p><p><b>If you are not improving:</b> tell Keneflex what changed, what did not, and anything new. That information should change what Keneflex considers next.</p></section>
  <div class="actions"><button onclick="window.print()">Print / save this plan</button><button onclick="window.close()">Close</button></div>
  <p class="fine">Prototype self-care guide. Follow product labels and any instructions you have received from your own healthcare professional. This sheet is designed to demonstrate the intended Keneflex experience and is not a substitute for individualized professional care when that is needed.</p>
  </main></body></html>`;
  const w=window.open('','_blank');
  if(!w){modalContent.innerHTML='<h2>Your at-home plan</h2><p>Your browser blocked the printable window. Allow pop-ups for this prototype and try again.</p>';modal.classList.remove('hidden');return;}
  w.document.open();w.document.write(html);w.document.close();
}

kfxHStaticPolish();
