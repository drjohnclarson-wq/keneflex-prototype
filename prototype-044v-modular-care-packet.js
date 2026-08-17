/* Keneflex 0.4.4V — modular care packet, separated workstation follow-up,
   and value-preserving budget adjustment.

   Design rules:
   1) The at-home plan is part of the Keneflex solution, not an afterthought.
   2) Implementation guidance is delivered as purpose-built printable sheets.
   3) No-cost activity/setup changes may belong in the immediate plan; purchasable
      workstation equipment is a separate follow-up solution.
   4) "Spend less" never assumes an arbitrary budget or silently strips roles.
*/
(function(){
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function digitalContext(){
    const s=[state&&state.opening,state&&state.detail,state&&state.trigger,state&&state.triggerSummary,state&&state.triggerDetail,state&&state.activity].filter(Boolean).join(' ').toLowerCase();
    return /phone|computer|typing|keyboard|mouse|laptop|desktop|scroll|texting/.test(s);
  }
  function nervePattern(){return !!(state&&state.mskPatterns&&state.mskPatterns.has&&state.mskPatterns.has('median-nerve-pattern'));}
  function crossoverIncomplete(){return !!(state&&state.crossoverPlan&&state.crossoverPlan.supportRoles&&state.crossoverPlan.supportRoles.length>1);}
  function goal(){return (typeof kfxHGoal==='function'&&kfxHGoal())||(state&&state.goal)||'keep doing the things that matter without this getting in the way';}
  function area(){
    const side=(typeof kfxKSideLabel==='function'&&kfxKSideLabel())||'';
    const loc=(typeof kfxHLoc==='function'&&kfxHLoc())||((state&&state.location&&state.location.size)?Array.from(state.location).join(' + '):'the area you described');
    return (side?side+' ':'')+loc;
  }
  function activity(){return (typeof kfxHActivity==='function'&&kfxHActivity())||(state&&state.triggerSummary)||(state&&state.activity)||'the activities you described';}

  function addMainStyles(){
    if(document.getElementById('kfxVStyle'))return;
    const s=document.createElement('style');s.id='kfxVStyle';s.textContent=`
      .kfxVPacketValue{margin:16px 0 4px;border:1px solid #cbd9cd;border-radius:20px;background:linear-gradient(135deg,#edf6e7,#f8fbf4);padding:18px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:center}
      .kfxVPacketValue .eyebrow{margin-bottom:5px}.kfxVPacketValue h3{font-size:20px;margin:0 0 6px}.kfxVPacketValue p{font-size:12px;line-height:1.5;color:var(--muted);margin:0}.kfxVPacketPrice{text-align:right;font-weight:950;font-size:22px;color:var(--ink)}.kfxVPacketPrice small{display:block;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-top:2px}
      .kfxVPacketChips{display:flex;flex-wrap:wrap;gap:6px;margin:11px 0}.kfxVPacketChips span{border-radius:999px;padding:6px 9px;background:#fff;border:1px solid #d6e0d8;font-size:10px;font-weight:850;color:#46615a}.kfxVPacketBtn{border:0;border-radius:13px;padding:11px 13px;background:#174b46;color:#fff;font-weight:900;cursor:pointer}
      .kfxVWorkspace{margin:14px 0 4px;border:1px solid #d9e1dc;border-radius:18px;padding:16px;background:#fff}.kfxVWorkspace .kfxVTop{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.kfxVWorkspace h3{margin:3px 0 6px;font-size:18px}.kfxVWorkspace p{margin:0;font-size:12px;line-height:1.5;color:var(--muted)}.kfxVWorkspaceTag{font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;background:#eef2ec;border-radius:999px;padding:6px 8px;white-space:nowrap}.kfxVWorkspace button{margin-top:11px;border:1px solid #b9cbc3;background:#f7faf7;color:var(--ink);border-radius:12px;padding:10px 12px;font-weight:900;cursor:pointer}
      .kfxVBudget{margin-top:10px}.kfxVBudget h3{font-size:16px;margin:0 0 6px}.kfxVBudget p{font-size:12px;line-height:1.5;margin:0 0 10px}.kfxVBudgetActions{display:flex;flex-wrap:wrap;gap:8px}.kfxVBudgetActions button{border:1px solid #c8d6cf;border-radius:11px;background:#fff;color:var(--ink);padding:10px 11px;font-weight:850}.kfxVBudgetEntry{display:none;margin-top:10px}.kfxVBudgetEntry.show{display:flex;gap:8px;align-items:center}.kfxVBudgetEntry input{width:130px;border:1px solid #c8d6cf;border-radius:11px;padding:10px}.kfxVBudgetMsg{margin-top:10px;padding:11px 12px;border-radius:12px;background:#f7faf7;font-size:12px;line-height:1.5}
      @media(max-width:650px){.kfxVPacketValue{grid-template-columns:1fr}.kfxVPacketPrice{text-align:left}.kfxVWorkspace .kfxVTop{display:block}.kfxVWorkspaceTag{display:inline-block;margin-top:8px}}
    `;document.head.appendChild(s);
  }

  function rewriteAddedValueCard(){
    document.querySelectorAll('.kfxSCard').forEach(card=>{
      const title=card.querySelector('.kfxSTop b');
      if(!title||!/At-home\s*\/\s*setup changes/i.test(title.textContent))return;
      title.textContent='At-home implementation';
      const lines=card.querySelectorAll('.kfxSLine');
      if(lines[0])lines[0].innerHTML='<strong>What it adds:</strong> Turns the recommendation into specific actions the consumer can actually follow between purchases.';
      if(lines[1])lines[1].innerHTML='<strong>Why it belongs:</strong> A product alone does not change the repeated load, use pattern, recovery routine, or follow-up behavior that may matter.';
      if(lines[2])lines[2].innerHTML='<strong>Works with:</strong> The selected products, movement guidance, recovery plan, and reassessment steps.';
      if(lines[3])lines[3].innerHTML='<strong>If you change it:</strong> Keneflex should preserve the important care jobs even when the product cart changes. Purchasable ergonomic equipment is handled separately.';
    });
  }

  function addPacketValue(){
    const plan=document.getElementById('supportItem')&&document.getElementById('supportItem').closest('.block');
    if(!plan||document.getElementById('kfxVPacketValue'))return;
    const box=document.createElement('div');box.id='kfxVPacketValue';box.className='kfxVPacketValue';
    box.innerHTML=`<div><div class="eyebrow">INCLUDED WITH YOUR KENEFLEX PLAN</div><h3>Your personalized care packet</h3><p>This is part of the recommendation — not a generic handout after the products. Keneflex turns the plan into separate sheets you can use, print, save, or share.</p><div class="kfxVPacketChips"><span>Action plan</span><span>Exercises / movement</span><span>How to use support</span><span>Recovery</span><span>Activity changes</span><span>Follow-up</span><span>Safety reference</span></div><button class="kfxVPacketBtn" id="kfxVPacketBtn" type="button">View / print my care packet →</button></div><div class="kfxVPacketPrice">$0<small>included value</small></div>`;
    const topical=document.getElementById('topicalItem');
    if(topical&&topical.parentElement===plan)topical.insertAdjacentElement('afterend',box);else plan.appendChild(box);
    box.querySelector('#kfxVPacketBtn').onclick=openPacket;
  }

  function addWorkspaceFollowup(){
    if(!digitalContext()||document.getElementById('kfxVWorkspace'))return;
    const packet=document.getElementById('kfxVPacketValue');if(!packet)return;
    const box=document.createElement('div');box.id='kfxVWorkspace';box.className='kfxVWorkspace';
    box.innerHTML=`<div class="kfxVTop"><div><div class="eyebrow">SEPARATE FOLLOW-UP OPPORTUNITY</div><h3>Your workstation may deserve its own Keneflex solution.</h3><p>The immediate care plan can include no-cost changes such as position, breaks, hand rotation, and propping the phone. Specific risers, keyboards, mice, phone supports, or other equipment should be researched as a separate solution rather than quietly fattening this cart.</p></div><span class="kfxVWorkspaceTag">Not in current product total</span></div><button type="button" id="kfxVWorkspaceBtn">See the workstation follow-up →</button>`;
    packet.insertAdjacentElement('afterend',box);
    box.querySelector('#kfxVWorkspaceBtn').onclick=openWorkspace;
  }

  function relabelHomeLinks(){
    document.querySelectorAll('#solutionView [data-open="home"]').forEach(b=>{b.textContent='View / print my care packet';b.onclick=openPacket;});
    const homeBtn=document.getElementById('kfxHomePlanBtn');if(homeBtn){homeBtn.textContent='View / print my care packet';homeBtn.onclick=openPacket;}
    const nav=document.querySelector('#solutionView .kfxKNext');if(nav){
      const h=nav.querySelector('h2');if(h)h.textContent='Use the rest of your Keneflex plan';
      const p=nav.querySelector('.help');if(p)p.textContent='Your product plan is above. Your personalized care packet is included at $0 and can be printed as separate sheets.';
    }
    const total=document.getElementById('total');const totalBlock=total&&total.closest('.block');
    if(totalBlock){const help=totalBlock.querySelector('.help');if(help)help.textContent='Product total. Your personalized Keneflex care packet is included at $0.';}
  }

  function bindBudget(){
    const b=document.querySelector('#solutionView [data-tune="budget"]');if(!b)return;
    b.textContent='I need to spend less';
    if(b.dataset.kfxVBound)return;b.dataset.kfxVBound='1';
    b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openBudgetFlow();},true);
  }

  function openBudgetFlow(){
    const r=document.getElementById('tuneResult');if(!r)return;
    r.classList.remove('hidden');
    r.innerHTML=`<div class="kfxVBudget"><h3>Spend less without guessing your budget.</h3><p>Keneflex will not automatically turn the plan into a $30 plan — or any other arbitrary number. Start with the least damaging savings, or tell Keneflex the maximum you actually need to stay under.</p><div class="kfxVBudgetActions"><button type="button" id="kfxVLeastImpact">Show me the lowest-impact savings</button><button type="button" id="kfxVHaveBudget">I have a budget in mind</button></div><div class="kfxVBudgetEntry" id="kfxVBudgetEntry"><span>$</span><input id="kfxVBudgetInput" type="number" min="0" step="1" placeholder="Maximum"><button type="button" id="kfxVApplyBudget">Re-solve around this</button></div><div id="kfxVBudgetMsg"></div></div>`;
    document.getElementById('kfxVLeastImpact').onclick=lowestImpactSavings;
    document.getElementById('kfxVHaveBudget').onclick=()=>document.getElementById('kfxVBudgetEntry').classList.add('show');
    document.getElementById('kfxVApplyBudget').onclick=applyBudgetTarget;
    const reset=document.getElementById('resetTune');if(reset)reset.classList.remove('hidden');
  }

  function lowestImpactSavings(){
    // The optional topical is the first current product role that can be removed
    // without pretending the core support or recovery role disappeared harmlessly.
    state.noTopical=true;state.budget=false;
    if(typeof setPlanState==='function')setPlanState('topical','REMOVE · lower-impact savings','remove','$0','removed');
    const total=typeof calcTotal==='function'?calcTotal():40.99;
    const msg=document.getElementById('kfxVBudgetMsg');if(msg)msg.innerHTML=`<div class="kfxVBudgetMsg"><b>First lower-impact step:</b> remove the optional comfort topical. The current product total becomes <b>$${Number(total).toFixed(2)}</b>. Keneflex has not assumed that you own a cold pack and has not downgraded the core support. If you need to go lower, enter the number you actually need to stay under.</div>`;
  }

  function applyBudgetTarget(){
    const input=document.getElementById('kfxVBudgetInput');const amount=input?Number(input.value):NaN;const msg=document.getElementById('kfxVBudgetMsg');if(!msg)return;
    if(!Number.isFinite(amount)||amount<0){msg.innerHTML='<div class="kfxVBudgetMsg">Enter the maximum you actually want Keneflex to work around.</div>';return;}
    const current=typeof calcTotal==='function'?calcTotal():52.98;
    if(amount>=current){msg.innerHTML=`<div class="kfxVBudgetMsg"><b>Your current plan already fits that limit.</b> The current product total is $${Number(current).toFixed(2)}, so Keneflex would not remove anything simply because a lower price is possible.</div>`;return;}
    msg.innerHTML=`<div class="kfxVBudgetMsg"><b>Target received: $${amount.toFixed(2)}.</b> Keneflex should now preserve the most important treatment jobs while checking, in order: optional items, adequate products you already own, and lower-cost products that independently meet the same functional requirements. The prototype will not silently strip the plan or substitute an unverified cheaper product just to hit the number.</div>`;
  }

  function handSVG(kind){
    if(kind==='open')return `<svg viewBox="0 0 140 110" role="img" aria-label="Open relaxed hand illustration"><rect x="54" y="58" width="32" height="36" rx="14" fill="#ef8c68"/><rect x="51" y="14" width="10" height="50" rx="5" fill="#ef8c68"/><rect x="65" y="9" width="10" height="53" rx="5" fill="#ef8c68"/><rect x="79" y="14" width="10" height="50" rx="5" fill="#ef8c68"/><rect x="93" y="24" width="10" height="41" rx="5" fill="#ef8c68"/><path d="M55 67 C39 62 30 55 27 45" fill="none" stroke="#ef8c68" stroke-width="11" stroke-linecap="round"/><path d="M24 94 Q70 105 113 90" fill="none" stroke="#17645c" stroke-width="4" stroke-linecap="round"/></svg>`;
    if(kind==='thumb')return `<svg viewBox="0 0 140 110" role="img" aria-label="Gentle thumb movement illustration"><path d="M38 78 C50 59 66 49 83 47 C100 45 109 56 107 68 C105 83 91 93 70 94 C55 95 44 88 38 78Z" fill="#ef8c68"/><path d="M81 51 C76 34 79 20 89 16 C97 13 104 18 103 26 C101 39 95 49 84 57" fill="#ef8c68"/><path d="M102 29 Q118 35 120 50" fill="none" stroke="#17645c" stroke-width="4" stroke-linecap="round"/><path d="M116 43 L121 50 L113 51" fill="#d9eb65"/></svg>`;
    return `<svg viewBox="0 0 140 110" role="img" aria-label="Neutral wrist position illustration"><rect x="42" y="43" width="50" height="30" rx="12" fill="#ef8c68"/><path d="M27 58 H111" stroke="#17645c" stroke-width="5" stroke-linecap="round"/><path d="M26 39 V78 M112 39 V78" stroke="#17645c" stroke-width="3"/><path d="M21 45 L26 38 L31 45 M107 45 L112 38 L117 45" fill="none" stroke="#17645c" stroke-width="3"/></svg>`;
  }

  function moduleCard(id,title,desc,checked,badge){
    return `<label class="modulePick"><input type="checkbox" data-module-pick="${id}" ${checked?'checked':''}><span><b>${title}</b><small>${desc}</small></span>${badge?`<em>${badge}</em>`:''}</label>`;
  }

  function actionSheet(){
    const split=state&&state.areaRelationship==='different'&&state.areaPatternDetail?`<div class="note"><b>More than one pattern is being kept separate.</b>${esc(state.areaPatternDetail)}</div>`:'';
    const incomplete=crossoverIncomplete()?`<div class="warn"><b>Support role still being completed.</b> Keneflex identified more than one support job. The prototype should not call one current brace a complete solution until every hard role has an adequate product.</div>`:'';
    return `<section class="printSheet" data-module="action"><div class="sheetTop"><span>KENEFLEX CARE PACKET · SHEET 1</span><b>Action Plan</b></div><h1>Your Keneflex starting plan</h1><p class="lead">One page for what matters most: what Keneflex is trying to accomplish, the roles in the solution, and what to do first.</p><div class="summary"><b>Built around:</b> ${esc(area())}<br><b>Main activity / trigger:</b> ${esc(activity())}<br><b>Your goal:</b> ${esc(goal())}</div>${split}${incomplete}<div class="jobGrid"><article><i>1</i><b>Protect / support</b><p>Use the support role Keneflex selected where it meaningfully reduces aggravating load or improves positioning. A second role should not be assumed covered unless the product passes it.</p></article><article><i>2</i><b>Reduce the trigger</b><p>Change the repeated motion, sustained position, or load that keeps bringing the problem back. Start with no-cost behavior changes before adding equipment.</p></article><article><i>3</i><b>Recover</b><p>Use the recovery component after aggravating use when it is appropriate and helpful, following the selected product directions.</p></article><article><i>4</i><b>Keep comfortable movement</b><p>Maintain comfortable motion matched to the pattern rather than forcing aggressive stretches into symptoms.</p></article><article><i>5</i><b>Add comfort only where useful</b><p>The topical is an optional comfort role, not the engine of the plan.</p></article><article><i>6</i><b>Report what happens</b><p>Keneflex should learn which symptom pattern improves, which does not, and what changes next.</p></article></div><div class="value"><b>Why this packet matters</b> The product cart is only part of the solution. These implementation sheets are included at $0 so the consumer is not left to figure out how to use the plan alone.</div></section>`;
  }

  function movementSheet(){
    const nerve=nervePattern();
    return `<section class="printSheet" data-module="movement"><div class="sheetTop"><span>KENEFLEX CARE PACKET · MOVEMENT</span><b>Exercises & Movement</b></div><h1>Your movement reset</h1><p class="lead">Only movements Keneflex is comfortable including for the pattern shown so far. The production system should replace these with a condition-specific module whenever the regional work-up supports one.</p><div class="moveGrid"><article><div class="art">${handSVG('open')}</div><h2>Relax and open the hand</h2><p>Let the grip soften. Open the fingers comfortably, then relax. Use this as a reset after sustained gripping, phone, keyboard, or mouse use — not as a forced stretch.</p></article><article><div class="art">${handSVG('thumb')}</div><h2>Comfortable thumb motion</h2><p>Move the thumb through a comfortable range and toward the fingertips without forcing the painful end range. Stop if it clearly increases symptoms.</p></article><article><div class="art">${handSVG('neutral')}</div><h2>Reset wrist position</h2><p>Return the wrist toward a relaxed, relatively straight position after sustained use. The goal is a comfortable reset, not rigid posture all day.</p></article></div><div class="${nerve?'warn':'note'}"><b>${nerve?'Nerve-type pattern noted.':'Exercise matching matters.'}</b> ${nerve?'Keneflex should not automatically add a generic nerve-glide sequence simply because tingling or a median-nerve-type pattern was detected. Specific nerve mobility work should only appear when the clinical logic says it fits and the instructions are adequately supported.':'Do not add stretches merely to make the packet look robust. The exercise sheet should expand only when the regional playbook identifies an appropriate low-risk protocol.'}</div><div class="stop"><b>Stop or change the movement if:</b> it causes a meaningful increase in pain, numbness, tingling, weakness, swelling, or symptoms that do not settle after stopping.</div></section>`;
  }

  function supportSheet(){
    const incomplete=crossoverIncomplete();
    return `<section class="printSheet" data-module="support"><div class="sheetTop"><span>KENEFLEX CARE PACKET · EQUIPMENT USE</span><b>How to Use Your Support</b></div><h1>Make the support do its job</h1><p class="lead">This sheet explains the role Keneflex is trying to fill. Final wear time, fit, cleaning, and contraindications must stay consistent with the exact selected product labeling.</p>${incomplete?`<div class="warn"><b>This case may need more than one support role.</b> The current prototype found separate night-wrist and thumb/wrist activity jobs. Do not use one device for both merely because it is called a wrist/thumb brace.</div>`:''}<div class="useRows"><article><b>When to use it</b><p>Use the support in the context Keneflex selected for that specific role — for example, aggravating daytime activity or a verified night-neutral role. Do not automatically make it an all-day/all-night device.</p></article><article><b>Fit check</b><p>It should perform the required support job without creating new numbness, tingling, color change, pressure points, or obvious circulation problems. "One size fits most" is not the same as a confirmed fit.</p></article><article><b>Skin & topical timing</b><p>Use on clean, dry skin when the selected support requires it. Do not automatically place a topical underneath a support; follow both product labels and the Keneflex safety sequence.</p></article><article><b>Re-check the job</b><p>If the brace controls the wrong area, slips, blocks needed function, or is intolerable enough that you will not use it, Keneflex should re-solve the product choice rather than blame adherence.</p></article></div><div class="note"><b>Manufacturer directions remain authoritative for product-specific use.</b> Keneflex adds the person-specific context: why this product role was chosen, when it belongs in this plan, and when it no longer fits.</div></section>`;
  }

  function recoverySheet(){
    const cold=state&&state.ownedCold?'Use the adequate cold option you already own; Keneflex should not sell a duplicate.':'Use the selected reusable cold/recovery option if it remains eligible after product verification.';
    const topical=state&&state.noTopical?'No topical is currently included.':'The topical is optional for temporary comfort only.';
    return `<section class="printSheet" data-module="recovery"><div class="sheetTop"><span>KENEFLEX CARE PACKET · RECOVERY</span><b>Recovery & Comfort</b></div><h1>What to do after aggravating use</h1><p class="lead">Recovery should have a defined job and sequence. It should not become an excuse to ignore the repeated trigger.</p><div class="timeline"><article><span>1</span><div><b>Stop or reduce the aggravating load</b><p>Give the area a chance to settle rather than immediately repeating the same load.</p></div></article><article><span>2</span><div><b>Use the recovery role</b><p>${esc(cold)} Follow the exact product directions for duration, skin protection, and re-use.</p></div></article><article><span>3</span><div><b>Use comfort separately when appropriate</b><p>${esc(topical)} Do not assume the topical belongs underneath a brace or compression. The current plan keeps topical and support use separate unless the exact labels and product interaction logic say otherwise.</p></div></article><article><span>4</span><div><b>Notice what changes</b><p>Record whether soreness, tingling, thumb pain, grip tolerance, or activity tolerance changed. Different symptom patterns can respond differently.</p></div></article></div><div class="warn"><b>Prototype product-intelligence note:</b> the exact cold/recovery SKU still requires verification for the therapeutic job Keneflex is assigning it. The production packet should pull instructions from the verified product safety record, not a generic template.</div></section>`;
  }

  function activitySheet(){
    const digital=digitalContext();
    const content=digital?`<div class="actionGrid"><article><b>Shorten uninterrupted sessions</b><p>Change position or take a brief reset before symptoms build rather than waiting until the hand is already flared.</p></article><article><b>Share the workload</b><p>Alternate hands when practical and use voice input or shortcuts for longer messages when that genuinely reduces the provoking motion.</p></article><article><b>Prop the phone when practical</b><p>Reduce continuous gripping and thumb reach without turning a phone stand into an automatic purchase.</p></article><article><b>Bring input closer</b><p>Avoid sustained reaching or extreme wrist positions. This is a no-cost setup principle; specific equipment belongs in the separate workstation solution.</p></article></div>`:`<div class="actionGrid"><article><b>Reduce the specific provoking load</b><p>Temporarily change the grip, repetition, intensity, duration, or technique that clearly brings symptoms on.</p></article><article><b>Do not stop everything automatically</b><p>Keep comfortable activities that do not meaningfully aggravate the pattern unless the regional plan says otherwise.</p></article><article><b>Use support strategically</b><p>Pair the support with the activity it was selected for rather than assuming more wear is always better.</p></article><article><b>Re-test gradually</b><p>As symptoms settle, test the activity in a measured way and tell Keneflex what happened.</p></article></div>`;
    return `<section class="printSheet" data-module="activity"><div class="sheetTop"><span>KENEFLEX CARE PACKET · ACTIVITY</span><b>Activity Modification</b></div><h1>Change what keeps setting it off</h1><p class="lead">The immediate plan starts with practical changes that cost nothing. Equipment purchases are considered only when a separate product solution adds enough value.</p>${content}<div class="value"><b>This is treatment value, not filler.</b> If the trigger remains unchanged, the consumer can keep re-aggravating the problem even while using a good product.</div></section>`;
  }

  function followSheet(){
    return `<section class="printSheet" data-module="follow"><div class="sheetTop"><span>KENEFLEX CARE PACKET · FOLLOW-UP</span><b>What Happens Next</b></div><h1>Tell Keneflex what changed</h1><p class="lead">A good first plan should make the next decision easier, whether it works completely, partly, or not at all.</p><div class="followGrid"><article class="good"><b>If it is helping</b><p>Keep the parts that are helping. Do not add products simply because more products exist.</p></article><article><b>If only one pattern improves</b><p>Say exactly which one. Example: "the nighttime tingling is better, but the thumb still hurts with phone use." Keneflex should not mark the whole plan a success or failure.</p></article><article><b>If it is not helping</b><p>Report what did not change, what activity still triggers it, whether the support was tolerable, and whether any new symptom appeared. Keneflex should rethink the problem before automatically escalating merchandise.</p></article><article class="warnBox"><b>If the picture changes</b><p>New or progressive weakness, loss of feeling, major swelling, obvious deformity, hot/red systemic illness pattern, or other meaningful worsening should change the self-care pathway.</p></article></div><div class="checklist"><b>Useful things to report back</b><span>□ pain/soreness trend</span><span>□ numbness/tingling trend</span><span>□ thumb-specific symptoms</span><span>□ grip/function</span><span>□ sleep impact</span><span>□ activity tolerance</span><span>□ product fit/comfort</span><span>□ what you actually used</span></div></section>`;
  }

  function safetySheet(){
    return `<section class="printSheet" data-module="safety"><div class="sheetTop"><span>KENEFLEX CARE PACKET · REFERENCE</span><b>Safety & Use Reference</b></div><h1>Use the plan intelligently</h1><p class="lead">Keneflex should surface the safety information needed for this specific plan while keeping the official manufacturer/FDA labeling available.</p><div class="useRows"><article><b>Support</b><p>Stop and reassess if the product causes new numbness, tingling, color change, significant pressure, rash, worsening pain, or another unexpected problem. Follow the exact manufacturer's wear and cleaning instructions.</p></article><article><b>Cold / recovery</b><p>Protect the skin and use only within the exact selected product directions. Do not assume every cooling wrist product is a therapeutic cold-treatment product.</p></article><article><b>Topical</b><p>External-use precautions, skin warnings, heat restrictions, frequency, age/pregnancy considerations, and bandaging/compression warnings must come from the current Drug Facts label. Do not place it under the support by default.</p></article><article><b>Exercises</b><p>Stop or modify any movement that meaningfully increases pain, sensory symptoms, weakness, swelling, or other concerning symptoms.</p></article></div><div class="warn"><b>Before purchase/use:</b> the Keneflex safety review remains required. This printable reference does not replace the official product labels.</div></section>`;
  }

  function workstationSheet(){
    return `<section class="printSheet" data-module="workstation"><div class="sheetTop"><span>KENEFLEX FOLLOW-UP · SEPARATE SOLUTION</span><b>Workstation / Device Setup</b></div><h1>A separate Keneflex workstation solution</h1><p class="lead">This is intentionally separated from the immediate hand/wrist product cart. Keneflex should first use the current story to decide which equipment categories could materially reduce load, then research specific products instead of adding generic accessories.</p><div class="actionGrid"><article><b>Screen / laptop height</b><p>Evaluate whether display position is contributing to sustained reaching or awkward arm/wrist posture. If a riser is indicated, determine whether a separate keyboard/mouse becomes necessary.</p></article><article><b>Keyboard + pointing device</b><p>Evaluate reach, wrist position, grip, clicking/scrolling demand, hand size, dominant hand, and whether a different input device would actually reduce the provoking load.</p></article><article><b>Phone support</b><p>Evaluate whether prolonged holding, thumb reach, or one-handed scrolling is a meaningful trigger before recommending a stand, grip, mount, or other support.</p></article><article><b>Alternative input</b><p>Consider voice input, shortcuts, trackball/vertical mouse concepts, external keyboards, or other methods only when the specific motion they change maps to the consumer's trigger.</p></article></div><div class="value"><b>Future commerce opportunity — but only if it earns its place.</b> These items are not included in the current product total. A production Keneflex workflow could offer: "Keneflex found something in your setup worth fixing. Want Keneflex to build a separate workstation solution?"</div></section>`;
  }

  function packetHTML(focus){
    const digital=digitalContext();
    const modules=[
      ['action','Action plan','1-page summary of the coordinated solution',true,'CORE'],
      ['movement','Exercises & movement','Illustrated movements matched to what is safe to include',true,'INCLUDED'],
      ['support','How to use your support','Role, timing, fit checks, and product-use context',true,'INCLUDED'],
      ['recovery','Recovery & comfort','How the recovery pieces fit together',true,'INCLUDED'],
      ['activity','Activity modification','No-cost changes to the provoking pattern',true,'INCLUDED'],
      ['follow','Follow-up','What improvement, partial improvement, or failure means',true,'CORE'],
      ['safety','Safety reference','Plan-specific safety reminders plus official-label reminder',true,'REFERENCE']
    ];
    if(digital)modules.push(['workstation','Workstation / device setup','Separate follow-up solution; not in the current product total',focus==='workstation','FOLLOW-UP']);
    const picks=modules.map(m=>moduleCard(...m)).join('');
    const sheets=[actionSheet(),movementSheet(),supportSheet(),recoverySheet(),activitySheet(),followSheet(),safetySheet(),digital?workstationSheet():''].join('');
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>My Keneflex care packet</title><style>
      *{box-sizing:border-box}body{margin:0;background:#eee9dd;color:#153f3b;font-family:Arial,sans-serif}.builder{max-width:980px;margin:0 auto;padding:22px}.builderHero{background:linear-gradient(135deg,#174b46,#24766a);color:#fff;border-radius:26px;padding:27px}.brand{font-size:13px;letter-spacing:.22em;font-weight:950}.builderHero h1{font-size:36px;margin:10px 0 7px}.builderHero p{max-width:760px;color:#e5f0ed;line-height:1.5;margin:0}.included{display:inline-block;margin-top:12px;background:#d9eb65;color:#153f3b;border-radius:999px;padding:7px 10px;font-size:11px;font-weight:950}.picker{background:#fff;border:1px solid #d4ded8;border-radius:22px;padding:19px;margin:15px 0}.picker h2{margin:0 0 4px;font-size:22px}.picker>p{margin:0 0 13px;color:#5d7069;font-size:13px}.moduleList{display:grid;grid-template-columns:1fr 1fr;gap:9px}.modulePick{display:grid;grid-template-columns:auto 1fr auto;gap:9px;align-items:start;border:1px solid #d9e1dc;border-radius:14px;padding:12px;background:#fbfcfa}.modulePick input{margin-top:3px}.modulePick b,.modulePick small{display:block}.modulePick small{font-size:11px;line-height:1.35;color:#64766f;margin-top:3px}.modulePick em{font-style:normal;font-size:8px;font-weight:950;letter-spacing:.08em;background:#eef2ec;border-radius:999px;padding:5px 6px}.builderActions{display:flex;flex-wrap:wrap;gap:9px;margin-top:14px}.builderActions button{border:0;border-radius:12px;padding:12px 14px;background:#174b46;color:#fff;font-weight:900}.builderActions .secondary{background:#eef3ef;color:#174b46;border:1px solid #c8d6cf}.printArea{max-width:920px;margin:0 auto;padding:0 22px 30px}.printSheet{background:#fff;border:1px solid #d5ded8;border-radius:24px;margin:20px 0;padding:32px;min-height:980px;page-break-after:always}.printSheet.hiddenModule{display:none}.sheetTop{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #d9eb65;padding-bottom:10px;margin-bottom:22px;font-size:10px;letter-spacing:.12em;font-weight:950}.sheetTop b{letter-spacing:0;font-size:13px}.printSheet h1{font-size:34px;line-height:1.05;margin:0 0 9px}.lead{font-size:16px;line-height:1.5;color:#596e66;max-width:760px}.summary,.note,.warn,.value,.stop{border-radius:17px;padding:15px 16px;margin:15px 0;line-height:1.5;font-size:13px}.summary{background:#edf5e8}.note{background:#eef5f2;border-left:4px solid #6ba69a}.warn{background:#fff0d7;border-left:4px solid #df8a2e}.value{background:#174b46;color:#fff}.stop{background:#f7f1eb;border-left:4px solid #b88b6c}.jobGrid,.moveGrid,.actionGrid,.followGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0}.jobGrid article,.moveGrid article,.actionGrid article,.followGrid article,.useRows article{border:1px solid #d9e1dc;border-radius:17px;padding:15px;background:#fbfcfa}.jobGrid i{display:flex;width:28px;height:28px;border-radius:50%;background:#d9eb65;align-items:center;justify-content:center;font-style:normal;font-weight:950}.jobGrid b,.actionGrid b,.followGrid b,.useRows b{display:block;margin:7px 0 5px;font-size:16px}.jobGrid p,.actionGrid p,.followGrid p,.useRows p{margin:0;color:#5b6f68;line-height:1.45;font-size:12px}.moveGrid{grid-template-columns:repeat(3,1fr)}.moveGrid .art{height:145px;border-radius:14px;background:linear-gradient(135deg,#e4f1e8,#f4edc9);display:flex;align-items:center;justify-content:center}.moveGrid svg{width:120px;height:100px}.moveGrid h2{font-size:17px;margin:12px 0 5px}.moveGrid p{font-size:12px;line-height:1.45;color:#5b6f68}.useRows{display:grid;gap:10px;margin:15px 0}.timeline{display:grid;gap:10px;margin:17px 0}.timeline article{display:grid;grid-template-columns:38px 1fr;gap:12px;border:1px solid #d9e1dc;border-radius:17px;padding:14px}.timeline span{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#d9eb65;font-weight:950}.timeline b{font-size:16px}.timeline p{margin:4px 0 0;font-size:12px;color:#5b6f68;line-height:1.45}.checklist{display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#edf5e8;border-radius:17px;padding:16px}.checklist b{grid-column:1/-1}.checklist span{font-size:12px}.good{border-top:4px solid #6ba69a!important}.warnBox{border-top:4px solid #df8a2e!important}.footerNote{font-size:11px;color:#6b7c75;margin:0 22px 25px;text-align:center}
      @media(max-width:700px){.builder,.printArea{padding:12px}.moduleList,.jobGrid,.actionGrid,.followGrid,.moveGrid{grid-template-columns:1fr}.printSheet{padding:20px;min-height:0}.builderHero h1{font-size:29px}.printSheet h1{font-size:28px}}
      @media print{body{background:#fff}.builder,.footerNote{display:none!important}.printArea{max-width:none;padding:0}.printSheet{border:0;border-radius:0;margin:0;padding:14mm;min-height:0;break-after:page;page-break-after:always;-webkit-print-color-adjust:exact;print-color-adjust:exact}.printSheet.hiddenModule{display:none!important}.printSheet:last-child{page-break-after:auto}}
    </style></head><body><div class="builder"><section class="builderHero"><div class="brand">KENEFLEX</div><h1>Your personalized care packet</h1><p>One coordinated solution, delivered as separate sheets so you can print only what is useful. The default packet contains the implementation guidance Keneflex believes belongs with the plan.</p><span class="included">INCLUDED WITH YOUR PLAN · $0</span></section><section class="picker"><h2>Choose the sheets you want</h2><p>The core packet is preselected. Workstation/equipment purchasing is separated as a follow-up rather than automatically added to the current cart.</p><div class="moduleList">${picks}</div><div class="builderActions"><button type="button" id="printSelected">Print / save selected sheets</button><button type="button" class="secondary" id="showSelected">Show only selected</button><button type="button" class="secondary" onclick="window.close()">Close</button></div></section></div><main class="printArea">${sheets}</main><div class="footerNote">Keneflex prototype care packet · personalized self-care guidance, not a diagnosis. Product-specific labeling and professional instructions remain controlling where applicable.</div><script>
      (function(){
        function sync(){document.querySelectorAll('[data-module-pick]').forEach(function(cb){var sheet=document.querySelector('.printSheet[data-module="'+cb.getAttribute('data-module-pick')+'"]');if(sheet)sheet.classList.toggle('hiddenModule',!cb.checked);});}
        document.getElementById('showSelected').onclick=sync;
        document.getElementById('printSelected').onclick=function(){sync();setTimeout(function(){window.print();},50);};
        ${focus==='workstation'?`var ws=document.querySelector('[data-module-pick="workstation"]');if(ws){document.querySelectorAll('[data-module-pick]').forEach(function(x){x.checked=false;});ws.checked=true;sync();setTimeout(function(){var s=document.querySelector('.printSheet[data-module="workstation"]');if(s)s.scrollIntoView();},30);}`:''}
      })();
    <\/script></body></html>`;
  }

  function openPacket(focus){
    const w=window.open('','_blank');
    if(!w){
      if(typeof modalContent!=='undefined'&&modalContent){modalContent.innerHTML='<h2>Your Keneflex care packet</h2><p>Your browser blocked the packet window. Allow pop-ups for this prototype and try again.</p>';if(typeof modal!=='undefined'&&modal)modal.classList.remove('hidden');}
      return;
    }
    w.document.open();w.document.write(packetHTML(focus||''));w.document.close();
  }
  window.kfxVOpenPacket=openPacket;

  function openWorkspace(){openPacket('workstation');}

  // Replace the old one-page at-home printable with the modular packet builder.
  if(typeof kfxHOpenHomePlan==='function')kfxHOpenHomePlan=function(){openPacket('');};

  function enhance(){
    addMainStyles();
    addPacketValue();
    addWorkspaceFollowup();
    relabelHomeLinks();
    rewriteAddedValueCard();
    bindBudget();
  }

  const priorShow=typeof showSolution==='function'?showSolution:null;
  if(priorShow)showSolution=function(){priorShow();setTimeout(enhance,140);};
  setTimeout(enhance,180);
})();
