/* Keneflex 0.4.4R — complete-plan integrity and adjustment tradeoffs.
   The complete recommendation should be clearly distinguished from a modified plan.
   Keneflex explains what each adjustment preserves or gives up without promising a
   faster recovery or a guaranteed health outcome. */
(function(){
  function addStyle(){
    if(document.getElementById('kfxRStyle'))return;
    const s=document.createElement('style');s.id='kfxRStyle';
    s.textContent=`
      .kfxRIntegrity{margin:12px 0 10px;padding:16px 17px;border-radius:16px;background:#edf5e8;border:1px solid #cadbc8;color:var(--ink)}
      .kfxRIntegrity b{display:block;font-size:15px;margin-bottom:6px}.kfxRIntegrity p{margin:0;font-size:12px;line-height:1.5;color:var(--muted)}
      .kfxRIntegrity .kfxRNote{margin-top:8px;font-size:11px;color:#6a7973}
      .kfxRTradeoff{margin-top:12px;padding:14px 15px;border-radius:14px;background:#fff8e8;border-left:4px solid #dca34a;font-size:12px;line-height:1.5;color:#52655f}
      .kfxRTradeoff b{display:block;color:var(--ink);margin-bottom:4px}
      .kfxRRole{display:inline-flex;margin-top:7px;padding:5px 8px;border-radius:999px;background:#edf2ec;color:#4c625b;font-size:10px;font-weight:900;letter-spacing:.06em;text-transform:uppercase}
      .kfxRRole.core{background:#dce96b;color:#153f3b}.kfxRRole.optional{background:#f1efea;color:#736b60}
    `;document.head.appendChild(s);
  }

  function crossoverIncomplete(){
    return !!(state&&state.crossoverPlan&&state.crossoverPlan.supportRoles&&state.crossoverPlan.supportRoles.length>1);
  }

  function integrityHTML(){
    if(crossoverIncomplete()){
      return `<b>Keneflex is still completing this plan.</b><p>More than one problem pattern survived the work-up and they require different support jobs. Keneflex will not call the current product list the complete solution until each important role has an adequate option.</p><div class="kfxRNote">The goal is one coordinated plan — not two unrelated shopping lists.</div>`;
    }
    return `<b>This is Keneflex’s complete recommended starting plan.</b><p>Keneflex built the pieces to work together: the right support, recovery, practical at-home changes, and added comfort where it meaningfully belongs. Changing the plan is absolutely okay, but removing or replacing a part can change what the plan is designed to cover. Keneflex will show you the tradeoff and rebuild the remaining plan rather than imply every modified version is equivalent.</p><div class="kfxRNote">Keneflex cannot promise a faster recovery or a specific outcome. “Complete” means the plan preserves all of the roles Keneflex believes belong based on what you told us.</div>`;
  }

  function addRole(itemId,label,kind){
    const item=document.getElementById(itemId);if(!item)return;
    const target=item.querySelector('.planCopy')||item.querySelector('.planName');if(!target)return;
    if(item.querySelector('.kfxRRole'))return;
    const t=document.createElement('span');t.className='kfxRRole '+(kind||'');t.textContent=label;
    target.insertAdjacentElement('afterend',t);
  }

  function enhance(){
    addStyle();
    const total=document.getElementById('total');
    const totalBlock=total&&total.closest('.block');
    if(totalBlock){
      const help=totalBlock.querySelector('.help');
      if(help)help.textContent='This is Keneflex’s complete starting recommendation. If you adjust it, Keneflex will explain what the change preserves and what it may give up.';
      let box=document.getElementById('kfxRIntegrity');
      if(!box){box=document.createElement('div');box.id='kfxRIntegrity';box.className='kfxRIntegrity';const adjust=document.getElementById('kfxMAdjust');if(adjust)totalBlock.insertBefore(box,adjust);else totalBlock.appendChild(box);}
      box.innerHTML=integrityHTML();
    }
    addRole('supportItem','Core role','core');
    addRole('coldItem','Supportive recovery role','');
    addRole('topicalItem','Optional comfort role','optional');

    const tune=document.querySelector('#solutionView [data-disclosure="adjust"]')||document.querySelector('#solutionView .tune');
    if(tune){
      const help=tune.querySelector('.help');
      if(help)help.textContent='Tell Keneflex what is true in real life. Keneflex will rebuild the plan and show whether the modified version still covers the same important jobs.';
      tune.querySelectorAll('[data-tune]').forEach(b=>{
        if(b.dataset.kfxRBound)return;b.dataset.kfxRBound='1';
        b.addEventListener('click',()=>setTimeout(()=>showTradeoff(b.dataset.tune,tune),35));
      });
    }
  }

  function showTradeoff(kind,tune){
    let box=document.getElementById('kfxRTradeoff');
    if(!box){box=document.createElement('div');box.id='kfxRTradeoff';box.className='kfxRTradeoff';const result=document.getElementById('tuneResult');if(result)result.insertAdjacentElement('afterend',box);else tune.appendChild(box);}
    const copy={
      cold:`<b>What changes:</b> If the cold pack you already own is intact, usable, and appropriate for the recovery role, the plan can remain just as complete — Keneflex is replacing a purchase, not removing the recovery job. If you skip recovery altogether, the modified plan no longer covers that role in the same way.`,
      topical:`<b>What changes:</b> The topical is optional comfort support. Removing it may mean giving up some temporary symptom relief, but it does not remove the core support, recovery, or at-home parts of the plan.`,
      budget:`<b>What changes:</b> Keneflex will protect the most important roles first. A lower-cost version is only equivalent to the complete recommendation when the removed jobs are still covered by something adequate you already own or a no-cost alternative. Otherwise it is a compromise, and Keneflex should say so clearly.`,
      support:`<b>What changes:</b> Owning a wrist/thumb support does not automatically make it an adequate substitute. Keneflex should first check its fit, condition, coverage, comfort, and whether it performs the specific support role this plan requires. Only then can Keneflex call the modified plan equivalent.`
    };
    box.innerHTML=copy[kind]||`<b>What changes:</b> Keneflex will show whether this adjustment preserves the important roles in the original recommendation or creates a meaningful tradeoff.`;
  }

  const priorShow=typeof showSolution==='function'?showSolution:null;
  if(priorShow){showSolution=function(){priorShow();setTimeout(enhance,30);};}
  enhance();
})();
