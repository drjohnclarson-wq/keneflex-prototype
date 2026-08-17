/* Keneflex 0.4.4L — product safety / warning information layer.
   Research-prototype implementation: prominent, pre-purchase, source-linked,
   and personalized where the current plan itself creates a relevant interaction. */
(function(){
  const safetySources={
    neo:'https://www.neo-g.com/products/722-airflow-wrist-thumb-support',
    polar:'https://www.polarproducts.com/polarshop/pc/Soft-Ice-Wrist-Wrap-p62.htm',
    biofreeze:'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?audience=consumer&setid=83d5c2f2-2413-4d28-83b2-0808d0917b4d'
  };
  let safetyReviewed=false;

  function currentSafetyInteraction(){
    if(state && !state.noTopical){
      return `<div class="kfxSafetyConflict"><b>Important for this specific plan</b><span>Do not put Biofreeze underneath the Neo G support. Neo G says the support should not be used over skin where gels, creams or ointments have been applied. If you use both, use them at separate times and put the support on clean, dry skin.</span></div>`;
    }
    return `<div class="kfxSafetyGood"><b>No brace/topical overlap in your current plan</b><span>The topical has been removed, so the specific gel-under-support issue does not apply.</span></div>`;
  }

  function safetyModalHTML(includeContinue){
    return `<h2>Important safety information</h2>
      <p class="help" style="font-size:14px;line-height:1.55">Keneflex should not recommend a product without also carrying forward the product’s official warnings and directions. The most important items for this plan are shown here before purchase.</p>
      ${currentSafetyInteraction()}
      <div class="kfxSafetyProduct">
        <h3>Neo G Airflow Wrist & Thumb Support</h3>
        <ul>
          <li>Do not wear it uncomfortably tight or in a way that restricts blood flow.</li>
          <li>Avoid prolonged wear such as sleeping in it unless a healthcare professional has advised otherwise.</li>
          <li>Use on clean, intact skin; do not put it over gels, creams, ointments or similar substances.</li>
          <li>Stop using it if a rash develops, pain persists, or the condition worsens.</li>
        </ul>
        <a class="kfxSafetySource" href="${safetySources.neo}" target="_blank" rel="noopener">View Neo G’s current product instructions ↗</a>
      </div>
      <div class="kfxSafetyProduct">
        <h3>Polar Soft Ice Wrist Wrap</h3>
        <ul>
          <li>For the cold-therapy role in this plan, Polar says applications should generally not exceed about 20 minutes at a time.</li>
          <li>Allow about 20 minutes between applications.</li>
          <li>Follow the product instructions for positioning and temperature preparation.</li>
        </ul>
        <a class="kfxSafetySource" href="${safetySources.polar}" target="_blank" rel="noopener">View Polar Products’ current instructions ↗</a>
      </div>
      <div class="kfxSafetyProduct">
        <h3>Biofreeze Pain Relief Gel — menthol 4%</h3>
        <ul>
          <li>For external use only; keep away from excessive heat or open flame.</li>
          <li>Avoid eyes and mucous membranes; do not apply to wounds, damaged skin, or irritated skin.</li>
          <li>Do not bandage tightly or use with a heating pad/device.</li>
          <li>Stop and seek medical advice if the condition worsens, significant skin symptoms develop, or symptoms persist beyond the label’s stated time limits.</li>
          <li>Pregnancy/breast-feeding and use in young children have specific label instructions.</li>
        </ul>
        <a class="kfxSafetySource" href="${safetySources.biofreeze}" target="_blank" rel="noopener">View the current FDA/DailyMed Drug Facts label ↗</a>
      </div>
      <div class="kfxSafetyPrototype"><b>Prototype limitation</b><span>The current research prototype does not yet ask every product-specific safety question. A production Keneflex system should use the warning data itself to trigger any additional questions needed before a product becomes eligible for recommendation.</span></div>
      ${includeContinue?'<button class="primary kfxSafetyContinue" id="kfxSafetyContinue">I’ve reviewed this — continue →</button>':''}`;
  }

  function openSafety(includeContinue=false){
    modalContent.innerHTML=safetyModalHTML(includeContinue);
    modal.classList.remove('hidden');
    const cont=document.getElementById('kfxSafetyContinue');
    if(cont)cont.onclick=()=>{
      safetyReviewed=true;
      modal.classList.add('hidden');
      const cart=document.getElementById('cartPreviewBtn');
      if(cart)setTimeout(()=>cart.click(),40);
    };
  }

  function addProductSafetyButton(item,label){
    if(!item || item.querySelector('.kfxSafetyMini'))return;
    const content=item.querySelector(':scope > div:nth-child(2)')||item;
    const b=document.createElement('button');
    b.type='button';
    b.className='kfxSafetyMini';
    b.innerHTML=`<span>⚠</span> ${label}`;
    b.onclick=(e)=>{e.preventDefault();openSafety(false)};
    content.appendChild(b);
  }

  function installSafetyLayer(){
    const view=document.getElementById('solutionView');
    if(!view)return;
    const planBlock=document.getElementById('supportItem')?.closest('.block');
    if(planBlock && !document.getElementById('kfxSafetyBanner')){
      const div=document.createElement('div');
      div.id='kfxSafetyBanner';
      div.className='kfxSafetyBanner';
      div.innerHTML=`<div class="kfxSafetyIcon">⚠</div><div><b>Safety is part of the recommendation.</b><p>Keneflex checks the official warnings and directions for the products in your plan — including whether two products should be used together. Review the important safety information before you use or buy the plan.</p>${currentSafetyInteraction()}<button type="button" id="kfxOpenSafety" class="kfxSafetyOpen">Review safety information →</button></div>`;
      const firstItem=document.getElementById('supportItem');
      planBlock.insertBefore(div,firstItem||planBlock.firstChild);
      document.getElementById('kfxOpenSafety').onclick=()=>openSafety(false);
    } else {
      const banner=document.getElementById('kfxSafetyBanner');
      const old=banner?.querySelector('.kfxSafetyConflict,.kfxSafetyGood');
      if(old)old.outerHTML=currentSafetyInteraction();
    }
    addProductSafetyButton(document.getElementById('supportItem'),'Important use & warning info');
    addProductSafetyButton(document.getElementById('coldItem'),'Important use & warning info');
    addProductSafetyButton(document.getElementById('topicalItem'),'Drug Facts & safety warnings');
  }

  if(typeof showSolution==='function'){
    const prior=showSolution;
    showSolution=function(){prior();installSafetyLayer();};
  }
  installSafetyLayer();

  document.addEventListener('click',function(e){
    const cart=e.target && e.target.closest && e.target.closest('#cartPreviewBtn');
    if(!cart || safetyReviewed)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    openSafety(true);
  },true);

  const style=document.createElement('style');
  style.textContent=`
    .kfxSafetyBanner{display:grid;grid-template-columns:48px 1fr;gap:14px;background:#fff4d8;border:2px solid #e4a62b;border-radius:20px;padding:18px;margin:10px 0 20px;box-shadow:0 7px 22px rgba(74,55,12,.07)}
    .kfxSafetyIcon{width:48px;height:48px;border-radius:15px;background:#ffd44a;display:flex;align-items:center;justify-content:center;font-size:26px}
    .kfxSafetyBanner>b,.kfxSafetyBanner div>b{font-size:18px}.kfxSafetyBanner p{margin:7px 0 12px;line-height:1.5;color:#5d5749;font-size:13px}
    .kfxSafetyOpen,.kfxSafetyMini{border:1px solid #c88b17;background:#fffaf0;color:#5e430d;border-radius:12px;padding:10px 12px;font-weight:900;text-align:left;cursor:pointer}
    .kfxSafetyMini{display:block;margin-top:10px;font-size:11px}.kfxSafetyMini span{font-size:13px}
    .kfxSafetyConflict,.kfxSafetyGood{border-radius:13px;padding:11px 12px;margin:9px 0 12px;line-height:1.42;font-size:12px}.kfxSafetyConflict{background:#ffe4c7;border-left:4px solid #d56b24}.kfxSafetyGood{background:#e6f3e9;border-left:4px solid #4f8b64}.kfxSafetyConflict b,.kfxSafetyConflict span,.kfxSafetyGood b,.kfxSafetyGood span{display:block}.kfxSafetyConflict span,.kfxSafetyGood span{margin-top:4px}
    .kfxSafetyProduct{border:1px solid var(--line);border-radius:16px;padding:15px;margin:12px 0;background:#fff}.kfxSafetyProduct h3{margin:0 0 8px;font-size:16px}.kfxSafetyProduct ul{margin:0;padding-left:19px}.kfxSafetyProduct li{margin:6px 0;line-height:1.4;font-size:13px}.kfxSafetySource{display:inline-block;margin-top:9px;font-size:12px;font-weight:900;color:#174b46}.kfxSafetyPrototype{border-radius:14px;background:#eef2f0;padding:13px;margin-top:14px}.kfxSafetyPrototype b,.kfxSafetyPrototype span{display:block}.kfxSafetyPrototype span{font-size:12px;line-height:1.45;margin-top:4px}.kfxSafetyContinue{width:100%;margin-top:14px}
    @media(max-width:650px){.kfxSafetyBanner{grid-template-columns:40px 1fr;padding:14px}.kfxSafetyIcon{width:40px;height:40px;border-radius:12px;font-size:22px}}
  `;
  document.head.appendChild(style);
})();
