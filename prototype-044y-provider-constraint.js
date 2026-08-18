/* Keneflex 0.4.4Y — provider-constraint integrity gate.
   A provider instruction that appears in the consumer's story is a hard constraint,
   not another preference. The current standardized support must never silently
   compete with or substitute for that instruction.
*/
(function(){
  const priorShowSolution=typeof showSolution==='function'?showSolution:null;
  if(!priorShowSolution)return;

  document.title='Keneflex Prototype 0.4.4Y';
  const buildEyebrow=document.querySelector('#intro .hero .eyebrow');
  if(buildEyebrow)buildEyebrow.textContent='Prototype 0.4.4Y • P0 readiness';

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function providerText(){return state&&state.providerInstruction&&state.providerInstruction.present?String(state.providerInstruction.text||'').trim():'';}
  function exactProductNamed(text){
    const s=text.toLowerCase();
    return /\b(futuro|ace night wrist|neo g|braceability|mueller|push (?:ortho|metagrip)|ottobock|breg|aircast|biofreeze)\b/.test(s);
  }
  function specificUseNamed(text){
    const s=text.toLowerCase();
    return /\b(at night|nighttime|while sleeping|during sleep|during activity|while playing|all day|during the day|neutral|immobili[sz]|thumb spica|wrist brace|wrist support|thumb brace|splint)\b/.test(s);
  }

  function applyProviderConstraint(){
    const text=providerText();if(!text)return;
    const support=document.getElementById('supportItem');
    const cart=document.getElementById('cartPreviewBtn');
    const main=document.querySelector('#solutionView .main');
    if(!main)return;

    let gate=document.getElementById('kfxYProviderGate');
    if(!gate){
      gate=document.createElement('section');gate.id='kfxYProviderGate';gate.className='block kfxYProviderGate';
      const first=main.querySelector('.block');if(first)main.insertBefore(gate,first);else main.prepend(gate);
    }
    const named=exactProductNamed(text),specific=specificUseNamed(text);
    let action='The provider instruction defines the product/use job. Keneflex will not substitute the standard prototype support unless it independently matches that instruction.';
    if(named)action='You named a provider-directed product. Keneflex will not replace it with the standard prototype recommendation. The provider-directed product stays the governing choice unless the provider changes it.';
    else if(!specific)action='Keneflex needs the provider’s exact product or use requirement before it can responsibly choose a support. It will not guess and then compete with the provider.';
    gate.innerHTML=`<div class="eyebrow">PROVIDER INSTRUCTION — HARD CONSTRAINT</div><h2>Your provider’s direction comes first.</h2><p><b>Keneflex heard:</b> ${esc(text)}</p><p>${action}</p><div class="kfxYIntegrity">The rest of the self-care/safety work can still be useful, but the support transaction stays on hold until the provider-directed role is matched without conflict.</div>`;

    if(support){
      support.classList.add('kfxYHeld');
      const stateEl=document.getElementById('supportState');
      if(stateEl){stateEl.textContent='HOLD · provider instruction governs';stateEl.className='planState keep';}
      const price=document.getElementById('supportPrice');if(price)price.textContent='—';
      const copy=support.querySelector('.planCopy');if(copy)copy.textContent='Not treated as an eligible substitute while a provider instruction governs this role. Keneflex must first prove the product and use schedule match the provider’s direction.';
    }
    if(cart){cart.disabled=true;cart.textContent='Complete provider-directed match before cart →';}

    const confidence=document.getElementById('confidenceCopy');
    if(confidence)confidence.textContent='A provider instruction changes the decision boundary. Keneflex can support the plan, but it should not override or quietly substitute for that direction.';
  }

  showSolution=function(){priorShowSolution();setTimeout(applyProviderConstraint,60);};

  const style=document.createElement('style');style.textContent=`
    .kfxYProviderGate{border:2px solid #d7a63e;background:#fff8e5}.kfxYProviderGate h2{margin-bottom:9px}.kfxYProviderGate p{line-height:1.5}.kfxYIntegrity{margin-top:12px;border-left:4px solid #d7a63e;padding:11px 12px;background:#fffdf8;border-radius:10px;font-size:12px;line-height:1.5}.planItem.kfxYHeld{background:#fbf7ed;border-color:#dfca97}.planItem.kfxYHeld .price{color:var(--muted)}
  `;document.head.appendChild(style);
})();
