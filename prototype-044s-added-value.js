/* Keneflex 0.4.4S — added-value breakdown + fat-boxed at-home plan.
   Every recommendation should make its job visible: what it adds, why it belongs,
   how it works with the rest of the plan, what changes if it is removed, and
   whether the role is core, supportive, or optional. */
(function(){
  function addStyle(){
    if(document.getElementById('kfxSStyle'))return;
    const s=document.createElement('style');s.id='kfxSStyle';
    s.textContent=`
      .kfxSValue{margin:18px 0 0;padding:18px;border:1px solid var(--line);border-radius:20px;background:#f8fbf6}
      .kfxSValueHead{display:flex;justify-content:space-between;gap:14px;align-items:flex-end;margin-bottom:12px}
      .kfxSValueHead h3{margin:0;font-size:20px;line-height:1.08}.kfxSValueHead p{margin:0;max-width:420px;color:var(--muted);font-size:12px;line-height:1.45}
      .kfxSValueGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      .kfxSCard{background:#fff;border:1px solid #d8e1da;border-radius:16px;padding:14px;min-height:150px}
      .kfxSCard.core{border-top:4px solid #9eb92f}.kfxSCard.supportive{border-top:4px solid #6ba69a}.kfxSCard.optional{border-top:4px solid #c8bfae}
      .kfxSTop{display:flex;justify-content:space-between;gap:8px;align-items:center}.kfxSTop b{font-size:15px}.kfxSLevel{font-size:9px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;border-radius:999px;padding:5px 7px;background:#eef2ec;color:#587068}
      .kfxSLevel.core{background:#dce96b;color:#153f3b}.kfxSLevel.optional{background:#f1efea;color:#736b60}
      .kfxSLine{margin-top:10px;font-size:12px;line-height:1.45;color:#536963}.kfxSLine strong{color:var(--ink)}
      .kfxSWhole{margin-top:12px;border-radius:14px;padding:13px 14px;background:#174b46;color:#fff;font-size:12px;line-height:1.5}.kfxSWhole b{display:block;font-size:14px;margin-bottom:4px}
      @media(max-width:680px){.kfxSValueHead{display:block}.kfxSValueHead p{margin-top:6px}.kfxSValueGrid{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }

  function crossoverIncomplete(){return !!(state&&state.crossoverPlan&&state.crossoverPlan.supportRoles&&state.crossoverPlan.supportRoles.length>1);}
  function nervePattern(){return !!(state&&state.mskPatterns&&state.mskPatterns.has&&state.mskPatterns.has('median-nerve-pattern'));}
  function digital(){const s=((state&&state.triggerSummary)||'').toLowerCase();return /phone|computer|typing|keyboard|mouse/.test(s);}

  function card(title,level,cls,adds,why,works,remove){
    return `<article class="kfxSCard ${cls}"><div class="kfxSTop"><b>${title}</b><span class="kfxSLevel ${cls}">${level}</span></div><div class="kfxSLine"><strong>What it adds:</strong> ${adds}</div><div class="kfxSLine"><strong>Why it belongs:</strong> ${why}</div><div class="kfxSLine"><strong>Works with:</strong> ${works}</div><div class="kfxSLine"><strong>If you change it:</strong> ${remove}</div></article>`;
  }

  function valueHTML(){
    const supportAdds=crossoverIncomplete()?'The support portion is not finished yet. Keneflex found more than one support job and will not pretend one device automatically covers both.':'Physical support/positioning for the wrist/thumb role Keneflex identified.';
    const supportRemove=crossoverIncomplete()?'Keneflex must finish the missing support role before calling this a complete plan.':'Removing the core support without an adequate substitute materially changes the plan.';
    const setupWhy=digital()?'Your symptoms are tied to phone/computer use, so reducing the repeated or awkward load is part of the solution — not an extra tip.':'The story suggests that what you do with the area can influence how often it is irritated.';
    const movementWhy=nervePattern()?'Keneflex is keeping the movement piece conservative because a nerve-type pattern survived the work-up; condition-specific nerve mobility should only be added when it is clearly appropriate.':'The plan should preserve comfortable motion rather than rely only on passive products.';
    return `<section class="kfxSValue" id="kfxSValue"><div class="kfxSValueHead"><div><div class="eyebrow">WHY EACH PART IS HERE</div><h3>Every part of the plan has a job.</h3></div><p>Keneflex is not adding products or advice to make the plan look bigger. Each part should add a different kind of value to the complete solution.</p></div><div class="kfxSValueGrid">
      ${card('Support','Core','core',supportAdds,'The work-up identified a role that needs physical support or positioning.','The at-home/load changes and recovery pieces, which address different parts of the problem.',supportRemove)}
      ${card('At-home / setup changes','Core','core','Reduces the repeated load that keeps provoking the problem.',setupWhy,'The products manage the problem while setup and behavior changes reduce the reason it keeps getting stirred up.','Skipping this can leave the aggravating pattern unchanged even if a product temporarily helps.')}
      ${card('Recovery','Supportive','supportive','Gives the irritated area a recovery option after aggravating use when that feels helpful.','Symptoms can remain sore after use, so Keneflex included a recovery role rather than only an in-the-moment product.','The support/use changes during activity and the follow-up plan after activity.','An adequate cold option you already own can fill the same job; removing the recovery job entirely makes the plan less complete.')}
      ${card('Comfort','Optional','optional','Adds temporary symptom comfort; it is not the engine of the plan.','Keneflex includes it only when it adds useful comfort without being mistaken for the whole solution.','The core support, recovery and at-home changes.','Skipping it may mean less temporary comfort, but the core plan can remain intact.')}
      ${card('Movement / exercises','Supportive','supportive','Keeps the hand/wrist moving comfortably and gives the plan an active recovery component.',movementWhy,'Load reduction, support and recovery rather than aggressive stretching or exercise through symptoms.','This part should be adjusted to the pattern. Keneflex should not prescribe a generic exercise merely to fill the page.')}
      ${card('Follow-up / reassessment','Core','core','Defines what success, partial success, failure or worsening means and what Keneflex does next.','The first plan is a reasoned starting point, not a promise that every person responds the same way.','Every other component — Keneflex learns which parts helped and which problem pattern remains.','Without follow-up, the consumer is left to restart the research process alone if the plan does not work.')}
    </div><div class="kfxSWhole"><b>The added value is the coordination.</b> Keneflex is building one complete solution from different jobs — not handing you a pile of products. If you modify the plan, Keneflex should tell you whether the same jobs are still covered and what benefit may be reduced.</div></section>`;
  }

  function enhanceSolution(){
    addStyle();
    const total=document.getElementById('total');
    const totalBlock=total&&total.closest('.block');
    if(!totalBlock||document.getElementById('kfxSValue'))return;
    totalBlock.insertAdjacentHTML('afterend',valueHTML());
  }

  function addHomeStyles(doc){
    const s=doc.createElement('style');s.id='kfxSHomeStyle';s.textContent=`
      .kfxSHomeValue{margin:24px 0}.kfxSHomeValue h2{font-size:27px;margin:5px 0 8px}.kfxSHomeValue>p{color:#5d7069;line-height:1.5;margin:0 0 14px}.kfxSHomeGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.kfxSHomeJob{border-radius:18px;padding:15px;background:#fff;border:1px solid #d8e0da}.kfxSHomeJob strong{display:block;font-size:16px;margin:8px 0 5px}.kfxSHomeJob span{display:block;font-size:12px;line-height:1.45;color:#5b6f68}.kfxSJobIcon{width:44px;height:44px;border-radius:14px;background:#d8ea64;display:flex;align-items:center;justify-content:center;font-size:23px}.kfxSMove{margin:24px 0}.kfxSMoveGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:14px}.kfxSMoveCard{background:#fff;border:1px solid #d8e0da;border-radius:20px;overflow:hidden}.kfxSMoveArt{height:120px;background:linear-gradient(135deg,#e4f1e8,#f5efcb);display:flex;align-items:center;justify-content:center}.kfxSMoveArt svg{width:100px;height:90px}.kfxSMoveBody{padding:14px}.kfxSMoveBody b{display:block;font-size:17px;margin-bottom:5px}.kfxSMoveBody p{font-size:12px;line-height:1.5;color:#5b6f68;margin:0}.kfxSMoveCaution{margin-top:12px;background:#fff0d7;border-left:4px solid #df8a2e;border-radius:14px;padding:13px;font-size:12px;line-height:1.5;color:#596b65}
      @media(max-width:680px){.kfxSHomeGrid,.kfxSMoveGrid{grid-template-columns:1fr}}@media print{.kfxSHomeJob,.kfxSMoveCard,.kfxSMoveArt,.kfxSMoveCaution{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    `;doc.head.appendChild(s);
  }

  function handSvg(kind){
    if(kind==='open')return `<svg viewBox="0 0 120 100" aria-hidden="true"><rect x="47" y="52" width="28" height="34" rx="13" fill="#f08b66"/><rect x="45" y="12" width="9" height="48" rx="5" fill="#f08b66"/><rect x="58" y="8" width="9" height="50" rx="5" fill="#f08b66"/><rect x="71" y="14" width="9" height="47" rx="5" fill="#f08b66"/><rect x="84" y="23" width="9" height="40" rx="5" fill="#f08b66"/><path d="M48 61 C33 55,26 49,23 40" fill="none" stroke="#f08b66" stroke-width="10" stroke-linecap="round"/><path d="M20 82 Q60 96 100 80" fill="none" stroke="#1c6b64" stroke-width="4" stroke-linecap="round"/></svg>`;
    if(kind==='thumb')return `<svg viewBox="0 0 120 100" aria-hidden="true"><path d="M34 68 C45 52,58 43,72 40 C88 37,96 47,95 59 C94 73,81 82,62 83 C49 84,40 78,34 68Z" fill="#f08b66"/><path d="M70 44 C65 30,68 18,77 14 C84 11,90 16,89 23 C88 34,82 43,73 50" fill="#f08b66"/><circle cx="91" cy="27" r="8" fill="#d8ea64"/><path d="M82 34 Q91 40 99 33" fill="none" stroke="#1c6b64" stroke-width="4" stroke-linecap="round"/></svg>`;
    return `<svg viewBox="0 0 120 100" aria-hidden="true"><rect x="40" y="35" width="42" height="28" rx="10" fill="#f08b66"/><path d="M31 49 H90" stroke="#1c6b64" stroke-width="5" stroke-linecap="round"/><path d="M25 35 V64" stroke="#1c6b64" stroke-width="4" stroke-linecap="round"/><path d="M97 35 V64" stroke="#1c6b64" stroke-width="4" stroke-linecap="round"/><path d="M21 39 L25 34 L29 39 M93 39 L97 34 L101 39" fill="none" stroke="#1c6b64" stroke-width="3"/></svg>`;
  }

  function homeValueHTML(){
    const nerve=nervePattern();
    return `<section class="kfxSHomeValue"><div class="sectionHead"><span>WHY THIS IS MORE THAN A SHOPPING LIST</span><h2>Six jobs in one coordinated plan</h2><p>The value is not the number of things in the plan. It is that each recommendation addresses a different job and Keneflex ties them together.</p></div><div class="kfxSHomeGrid">
      <div class="kfxSHomeJob"><div class="kfxSJobIcon">◇</div><strong>Protect / support</strong><span>Give the irritated area the support or positioning its pattern calls for.</span></div>
      <div class="kfxSHomeJob"><div class="kfxSJobIcon">↔</div><strong>Reduce the trigger</strong><span>Change the setup, position, repetition or load that keeps bringing the problem back.</span></div>
      <div class="kfxSHomeJob"><div class="kfxSJobIcon">❄</div><strong>Recover</strong><span>Give the area an after-use recovery strategy instead of only treating it while active.</span></div>
      <div class="kfxSHomeJob"><div class="kfxSJobIcon">◌</div><strong>Keep moving</strong><span>Use comfortable movement matched to the pattern rather than aggressive generic stretching.</span></div>
      <div class="kfxSHomeJob"><div class="kfxSJobIcon">＋</div><strong>Add comfort</strong><span>Use optional symptom-relief tools only when they add useful value.</span></div>
      <div class="kfxSHomeJob"><div class="kfxSJobIcon">↻</div><strong>Learn what happens</strong><span>Track what improves and what does not so the next Keneflex decision gets smarter.</span></div>
    </div></section>
    <section class="kfxSMove"><div class="sectionHead"><span>COMFORTABLE MOVEMENT</span><h2>Your movement reset</h2><p>These are deliberately gentle. Keneflex should only add condition-specific exercise protocols when the regional work-up says they fit.</p></div><div class="kfxSMoveGrid">
      <article class="kfxSMoveCard"><div class="kfxSMoveArt">${handSvg('open')}</div><div class="kfxSMoveBody"><b>Relax and open the hand</b><p>Let the grip soften, open the fingers comfortably, then relax. Use this as a reset after sustained phone, keyboard or mouse use rather than forcing a stretch.</p></div></article>
      <article class="kfxSMoveCard"><div class="kfxSMoveArt">${handSvg('thumb')}</div><div class="kfxSMoveBody"><b>Comfortable thumb motion</b><p>Move the thumb through a comfortable range and toward the fingertips without forcing the painful end range. Stop if the motion clearly increases symptoms.</p></div></article>
      <article class="kfxSMoveCard"><div class="kfxSMoveArt">${handSvg('neutral')}</div><div class="kfxSMoveBody"><b>Reset the wrist position</b><p>Return the wrist toward a relaxed, straight position and reduce sustained bending during longer device sessions. The goal is a comfortable neutral reset, not rigid posture all day.</p></div></article>
    </div><div class="kfxSMoveCaution"><b>${nerve?'Nerve-type pattern noted. ':'Exercise matching matters. '}</b>${nerve?'Because the work-up found a possible nerve-type pattern, Keneflex should not automatically add a generic nerve-glide sequence. AAOS notes that some patients may benefit from nerve-gliding exercises, but specific exercises are typically selected by a clinician or therapist. ':'If a more specific tendon, joint or nerve pattern survives the work-up, the production Keneflex plan should swap these general resets for the appropriate evidence-based exercise module rather than giving everyone the same routine.'}</div></section>`;
  }

  function enhanceHome(child){
    try{
      if(!child||child.closed||!child.document||child.document.getElementById('kfxSHomeStyle'))return;
      const doc=child.document;addHomeStyles(doc);
      const products=doc.querySelector('.products');
      const productSection=products&&products.closest('section');
      if(productSection)productSection.insertAdjacentHTML('afterend',homeValueHTML());
      // Ensure reimbursement/employer language never reappears in this layer.
      doc.querySelectorAll('.kfxMEmployer').forEach(n=>n.remove());
    }catch(e){}
  }

  const priorHome=typeof kfxHOpenHomePlan==='function'?kfxHOpenHomePlan:null;
  if(priorHome){
    kfxHOpenHomePlan=function(){
      const originalOpen=window.open;let child=null;
      window.open=function(){child=originalOpen.apply(window,arguments);return child;};
      try{priorHome();}finally{window.open=originalOpen;}
      setTimeout(()=>enhanceHome(child),80);
    };
  }

  const priorShow=typeof showSolution==='function'?showSolution:null;
  if(priorShow){showSolution=function(){priorShow();setTimeout(enhanceSolution,55);};}
  addStyle();enhanceSolution();
})();
