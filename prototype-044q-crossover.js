/* Keneflex 0.4.4Q — crossover treatment resolver.
   If more than one MSK pattern survives the regional work-up, Keneflex reconciles
   the conservative-care requirements before product selection. The prototype does
   not fake a second SKU if product intelligence for that role has not been built. */
(function(){
  function patterns(){return state.mskPatterns?Array.from(state.mskPatterns):[];}
  function has(x){return state.mskPatterns&&state.mskPatterns.has&&state.mskPatterns.has(x);}
  function build(){
    const p=patterns();
    const common=[]; const unique=[]; const supportRoles=[];
    if(p.length>1 || has('median-nerve-pattern')){
      common.push('modify the repetitive or sustained activity that provokes symptoms');
      common.push('use ergonomic/device changes when they reduce the provoking load');
      common.push('track each symptom pattern separately so improvement in one does not hide persistence of another');
    }
    if(has('median-nerve-pattern')){
      unique.push('protect a neutral wrist position during sleep when appropriate for the nerve-type pattern');
      supportRoles.push({role:'night wrist role',need:'a support that holds the wrist in a comfortable neutral position during sleep without unnecessary thumb restriction'});
    }
    if(has('radial-thumb-tendon-pattern')){
      unique.push('reduce repeated thumb motion and combined thumb/wrist loading that reproduces the thumb-side pain');
      supportRoles.push({role:'thumb/wrist activity role',need:'support of the thumb and wrist during provoking daytime activity while preserving useful motion'});
    }
    if(has('thumb-base-joint-pattern')){
      unique.push('reduce high-load pinch/grip and use adaptive grip/setup strategies where useful');
      supportRoles.push({role:'thumb-base activity role',need:'thumb-base support during aggravating pinch/grip tasks without unnecessary all-day wrist restriction'});
    }
    state.crossoverPlan={patterns:p,common,unique,supportRoles,multiple:supportRoles.length>1||p.length>1};
    return state.crossoverPlan;
  }

  const priorShowSolution=showSolution;
  showSolution=function(){
    build();
    priorShowSolution();
    setTimeout(renderCrossover,20);
  };

  function renderCrossover(){
    const cp=state.crossoverPlan;if(!cp||!cp.multiple)return;
    const main=document.querySelector('#solutionView .main');if(!main)return;
    const firstPlan=[...main.querySelectorAll('.block')].find(b=>/complete keneflex plan|complete plan|recommend/i.test((b.querySelector('h2')||{}).textContent||''));
    if(!firstPlan)return;
    if(document.getElementById('kfxCrossover'))return;
    const box=document.createElement('div');box.id='kfxCrossover';box.className='notice';box.style.margin='0 0 16px';
    const roles=cp.supportRoles.map(r=>`<li><b>${r.role}:</b> ${r.need}</li>`).join('');
    box.innerHTML=`<b>Keneflex is solving more than one pattern at the same time.</b><p style="margin:7px 0 0">The shared parts of the plan can be combined, but Keneflex will not assume one brace or one use schedule covers every problem.</p>${roles?`<ul style="margin:9px 0 0;padding-left:20px">${roles}</ul>`:''}`;
    firstPlan.insertBefore(box,firstPlan.firstChild);

    // The current prototype's product catalog is complete for the standardized
    // single-pattern pathway, but not yet for every crossover support role. Do not
    // let a static SKU pretend to close a plan that needs a second role researched.
    if(cp.supportRoles.length>1){
      const cart=document.getElementById('cartPreviewBtn');
      if(cart){
        cart.disabled=true;
        cart.textContent='Keneflex is completing the second support role before cart →';
      }
      const help=document.createElement('p');help.className='micro';help.style.marginTop='8px';
      help.textContent='Prototype note: Keneflex identified separate support jobs. The production product engine must compare and select the best eligible product for each job before checkout.';
      if(cart&&cart.parentElement)cart.parentElement.appendChild(help);
    }
  }
})();
