/* Keneflex 0.4.4M — plan-first polish, compact safety entry, price-adjacent tuning,
   and a fat-boxed at-home solution. */
(function(){
  function isDigital(){
    const s=((state&&state.triggerSummary)||'').toLowerCase();
    return /phone|computer|typing|keyboard|mouse/.test(s);
  }
  function cleanGoal(){
    const g=(typeof kfxHGoal==='function'?kfxHGoal():(state&&state.goal)||'').trim();
    return g||'keep doing the things that matter without this getting in the way';
  }
  function sideArea(){
    const side=(typeof kfxKSideLabel==='function'?kfxKSideLabel():'');
    const area=(typeof kfxHLoc==='function'?kfxHLoc():'the area you described');
    return `${side?side+' ':''}${area}`.trim();
  }
  function openDisclosure(key){
    const main=document.querySelector('#solutionView .main');
    const b=main&&main.querySelector(`[data-disclosure="${key}"]`);
    if(!b)return;
    b.style.display='block';
    setTimeout(()=>b.scrollIntoView({behavior:'smooth',block:'start'}),30);
  }

  function orientIntro(){
    const hero=document.querySelector('#intro .hero');
    if(!hero)return;
    const h1=hero.querySelector('h1');
    const p=hero.querySelector(':scope > p');
    if(h1)h1.textContent='Something bothering you? Tell Keneflex.';
    if(p)p.innerHTML='<b>Keneflex helps you figure out what may help.</b> Describe what is going on in your own words. Keneflex asks what matters, researches products and practical options, and builds a clear plan specific to you.';
    const promise=hero.querySelector('.promise');
    if(promise)promise.innerHTML='<span class="pill">Talk normally</span><span class="pill">Keneflex does the narrowing</span><span class="pill">Get a complete plan</span>';
  }

  function streamlineSolution(){
    const view=document.getElementById('solutionView');
    if(!view)return;

    const heroBox=view.querySelector('.heroBox');
    if(heroBox)heroBox.remove();
    const solHero=view.querySelector('.solHero');
    if(solHero)solHero.style.gridTemplateColumns='1fr';
    const lead=document.getElementById('solutionLead');
    if(lead)lead.textContent='Based on what you told Keneflex, this plan brings together the products, recovery steps and practical changes Keneflex would start with for the way this is showing up for you.';

    const total=document.getElementById('total');
    const totalBlock=total&&total.closest('.block');
    if(totalBlock){
      const help=totalBlock.querySelector('.help');
      if(help)help.textContent='This is the complete starting plan. Adjust it for what you already own, what you will use, or what you can spend.';
      if(!document.getElementById('kfxMAdjust')){
        const b=document.createElement('button');
        b.id='kfxMAdjust';b.type='button';b.className='kfxMAdjust';b.textContent='Adjust this plan →';
        b.onclick=()=>openDisclosure('adjust');
        totalBlock.appendChild(b);
      }
    }

    const nav=view.querySelector('.kfxKNext');
    if(nav){
      const h=nav.querySelector('h2');if(h)h.textContent='More from your Keneflex plan';
      const p=nav.querySelector('.help');if(p)p.textContent='The plan is above. Open any of these when they are useful.';
      const adjust=nav.querySelector('[data-open="adjust"]');if(adjust)adjust.remove();
      const home=nav.querySelector('[data-open="home"]');if(home)home.textContent='Your at-home plan';
      const why=nav.querySelector('[data-open="why"]');if(why)why.textContent='Why this plan fits you';
      const research=nav.querySelector('[data-open="research"]');if(research)research.textContent='How Keneflex researched the plan';
      const doctor=nav.querySelector('[data-open="doctor"]');if(doctor)doctor.textContent='Share with your healthcare professional';
    }

    const cart=document.getElementById('cartPreviewBtn');
    if(cart)cart.textContent='Add this plan to cart →';

    const tune=view.querySelector('[data-disclosure="adjust"]');
    if(tune){
      const h=tune.querySelector('h2');if(h)h.textContent='Adjust this plan';
      const p=tune.querySelector('.help');if(p)p.textContent='Tell Keneflex what is true in real life. Keneflex will rebuild the plan without handing the product decision back to you.';
      const map=[
        ['cold','Already have a good cold pack'],['topical','Skip the topical'],['budget','Keep the spend under $30'],['support','Already own a wrist/thumb support']
      ];
      map.forEach(([key,label])=>{const b=tune.querySelector(`[data-tune="${key}"]`);if(b)b.textContent=label;});
    }

    // Keep the excellent safety review, but remove the large safety conversation
    // from the plan itself. One compact entry lives beside price and checkout still
    // requires review through the existing safety layer.
    const banner=document.getElementById('kfxSafetyBanner');if(banner)banner.remove();
    const minis=[...view.querySelectorAll('.kfxSafetyMini')];
    if(minis.length && totalBlock){
      let safety=document.getElementById('kfxMSafety');
      if(!safety){
        safety=minis[0];
        safety.id='kfxMSafety';
        safety.className='kfxMSafety';
        safety.innerHTML='⚠ Safety & use information →';
        totalBlock.appendChild(safety);
      }
      minis.slice(1).forEach(x=>x.remove());
    }

    // If tuning re-inserts warning controls later, keep the recommendation clean.
    view.querySelectorAll('.kfxSafetyMini').forEach(x=>x.remove());
  }

  function ergonomicAidsHTML(){
    if(!isDigital())return '';
    return `<section class="kfxMErgo">
      <div class="kfxMSectionHead"><span>WORK / DEVICE SETUP</span><h2>Make the setup do more of the work</h2><p>Because computer and phone use are part of your pattern, Keneflex would address the setup as part of the solution — not just the hand.</p></div>
      <div class="kfxMAidGrid">
        <article><div class="kfxMAidIcon">▱</div><h3>Screen or laptop riser</h3><p>Raise the display when needed so the screen can be viewed comfortably. If raising a laptop makes the keyboard too high, pair the riser with a separate keyboard and mouse.</p></article>
        <article><div class="kfxMAidIcon">⌨</div><h3>Keyboard + mouse position</h3><p>Keep the keyboard and pointing device close enough that the shoulders can relax and the wrist can stay relatively straight rather than bent or reaching.</p></article>
        <article><div class="kfxMAidIcon">▯</div><h3>Phone stand or support</h3><p>For longer phone sessions, prop the phone when practical so one hand and thumb do not have to hold, reach and scroll continuously.</p></article>
        <article><div class="kfxMAidIcon">◉</div><h3>Alternative input</h3><p>Use voice input, shortcuts, an external pointing device or another input method when it meaningfully reduces the motion that keeps setting the problem off.</p></article>
      </div>
      <div class="kfxMEmployer"><b>Worth checking:</b> if this is work-related, ask whether your employer offers an ergonomic assessment, workstation equipment, or reimbursement/benefits for approved ergonomic aids.</div>
    </section>`;
  }

  // Replace the printable with a branded, complete solution sheet. It should be
  // useful enough to keep, not merely a recap of brace/ice/topical instructions.
  kfxHOpenHomePlan=function(){
    const goal=cleanGoal();
    const area=sideArea();
    const activity=(typeof kfxHActivity==='function'?kfxHActivity():(state&&state.triggerSummary)||'the activities you described');
    const split=state&&state.areaRelationship==='different'&&state.areaPatternDetail?`<div class="split"><b>Keneflex is keeping two patterns separate for now.</b><span>${state.areaPatternDetail}</span></div>`:'';
    const supportImg='https://www.neo-g.com/cdn/shop/files/722-13-Box_R_1080x.png?v=1725268865';
    const coldText=state&&state.ownedCold?'Use the suitable cold pack you already own.':'Use the reusable cold option in the plan after aggravating use if it feels helpful.';
    const topicalText=state&&state.noTopical?'The topical is not part of your current plan.':'Use the topical only for temporary comfort and follow its Drug Facts label. Do not put it underneath the support; use them at separate times.';
    const digital=isDigital();
    const activityTip=typeof kfxIActivityTip==='function'?kfxIActivityTip():'Break up the activity that repeatedly brings the symptoms on and change the setup or motion when practical.';

    const html=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your Keneflex plan at home</title><style>
      *{box-sizing:border-box}body{margin:0;background:#f5f0e4;color:#153f3b;font-family:Arial,sans-serif}.sheet{max-width:920px;margin:auto;padding:28px}.hero{background:linear-gradient(135deg,#174b46,#27766a);color:#fff;border-radius:28px;padding:30px}.brand{font-size:14px;letter-spacing:.22em;font-weight:900}.hero h1{font-size:40px;margin:12px 0 8px}.hero p{font-size:18px;line-height:1.45;color:#e6f1ed;max-width:720px}.tag{display:inline-block;margin-top:10px;background:#d8ea64;color:#153f3b;padding:8px 12px;border-radius:999px;font-size:12px;font-weight:900}.summary{margin:18px 0;background:#e6f2df;border-radius:20px;padding:18px;line-height:1.55}.split{margin-top:10px;background:#fff0d7;border-left:4px solid #e1903a;padding:12px;border-radius:12px}.split b,.split span{display:block}.split span{margin-top:4px}.sectionHead span,.kfxMSectionHead span{font-size:11px;letter-spacing:.15em;font-weight:900;color:#6b7e76}.sectionHead h2,.kfxMSectionHead h2{font-size:26px;margin:5px 0 6px}.sectionHead p,.kfxMSectionHead p{margin:0;color:#5d7069;line-height:1.5}.products{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:14px 0 24px}.prod{background:#fff;border:1px solid #d8e0da;border-radius:20px;padding:16px}.prod .visual{height:90px;display:flex;align-items:center;justify-content:center;background:#f4f7f3;border-radius:14px}.prod img{max-height:82px;max-width:90%;object-fit:contain}.prod h3{font-size:17px;margin:12px 0 6px}.prod p{font-size:13px;line-height:1.45;color:#5c6f68}.kfxMErgo{margin:22px 0}.kfxMAidGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}.kfxMAidGrid article{background:#fff;border:1px solid #d8e0da;border-radius:18px;padding:16px}.kfxMAidIcon{width:44px;height:44px;border-radius:13px;background:#d8ea64;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900}.kfxMAidGrid h3{margin:10px 0 5px;font-size:17px}.kfxMAidGrid p{margin:0;font-size:13px;line-height:1.48;color:#5a6d66}.kfxMEmployer{margin-top:12px;background:#e7f1f4;border-radius:16px;padding:14px;font-size:13px;line-height:1.5}.steps{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}.step{background:#fff;border:1px solid #d8e0da;border-radius:18px;padding:16px}.num{width:30px;height:30px;border-radius:50%;background:#d8ea64;display:flex;align-items:center;justify-content:center;font-weight:900}.step h3{margin:9px 0 5px}.step p{font-size:13px;line-height:1.48;color:#5a6d66}.safety{margin:20px 0;background:#fff0d7;border-left:5px solid #df8a2e;border-radius:16px;padding:16px}.safety h2{margin:0 0 7px;font-size:20px}.safety p{margin:4px 0;line-height:1.5;font-size:13px}.follow{background:#174b46;color:#fff;border-radius:22px;padding:22px;margin-top:20px}.follow h2{margin:0 0 8px}.follow p{color:#e1eeea;line-height:1.5}.marketing{margin-top:18px;border-top:1px solid #cfd8d2;padding-top:15px;display:flex;justify-content:space-between;gap:16px;align-items:flex-end}.marketing b{display:block;font-size:18px}.marketing span{font-size:12px;color:#687a73;line-height:1.4}.actions{display:flex;gap:10px;margin:20px 0}.actions button{border:0;border-radius:12px;padding:13px 18px;background:#174b46;color:#fff;font-weight:900}@media(max-width:680px){.sheet{padding:14px}.products,.steps,.kfxMAidGrid{grid-template-columns:1fr}.hero h1{font-size:31px}.marketing{display:block}.marketing span{display:block;margin-top:5px}}@media print{body{background:#fff}.sheet{padding:0}.actions{display:none}.hero,.summary,.prod,.kfxMAidGrid article,.kfxMEmployer,.step,.safety,.follow{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    </style></head><body><main class="sheet">
      <section class="hero"><div class="brand">KENEFLEX</div><h1>Your complete plan at home</h1><p>Products are only part of the answer. This page puts the full Keneflex plan in one place — what to use, what to change, what to consider for your setup, and what to do next.</p><span class="tag">YOUR GOAL: ${goal}</span></section>
      <div class="summary"><b>Built around:</b> ${area}, mainly around ${activity}. ${split}</div>
      <section><div class="sectionHead"><span>PRODUCTS IN THE PLAN</span><h2>What Keneflex selected</h2><p>Each item has a different job. The goal is the complete useful solution, not the largest cart.</p></div><div class="products">
        <article class="prod"><div class="visual"><img src="${supportImg}" alt="Recommended wrist and thumb support"></div><h3>Support</h3><p>Use the recommended wrist/thumb support where it helps with the aggravating activities and where it remains comfortable.</p></article>
        <article class="prod"><div class="visual"><div style="font-size:46px">❄</div></div><h3>Recovery</h3><p>${coldText}</p></article>
        <article class="prod"><div class="visual"><div style="font-size:46px">◌</div></div><h3>Comfort</h3><p>${topicalText}</p></article>
      </div></section>
      ${ergonomicAidsHTML()}
      <section><div class="sectionHead"><span>WHAT TO DO</span><h2>Put the plan into practice</h2><p>These steps are part of the recommendation, not extras after the products.</p></div><div class="steps">
        <article class="step"><span class="num">1</span><h3>Change the aggravating pattern</h3><p>${activityTip}</p></article>
        <article class="step"><span class="num">2</span><h3>Use the support strategically</h3><p>Use it during the activities where it is useful rather than assuming it belongs on all day. Follow the product directions and stop if it causes new irritation or other problems.</p></article>
        <article class="step"><span class="num">3</span><h3>Recover after use</h3><p>${coldText} Keep cold applications within the product directions and give the skin time between applications.</p></article>
        <article class="step"><span class="num">4</span><h3>Keep comfortable movement</h3><p>Keep the hand, thumb and wrist moving through comfortable ranges rather than repeatedly forcing motions that clearly make the problem worse.</p></article>
      </div></section>
      <section class="safety"><h2>Important use note</h2><p>${topicalText}</p><p>Review the complete safety and use information in your Keneflex plan and on each product label before use.</p></section>
      <section class="follow"><h2>Then tell Keneflex what happened</h2><p>If the plan is helping, keep the parts that are helping. If it is not, return to Keneflex with what improved, what did not, and anything new. That new information should change what Keneflex considers next.</p></section>
      <div class="marketing"><div><b>KENEFLEX</b><span>Tell Keneflex what is bothering you. Get a plan specific to you.</span></div><span>This personalized sheet is part of your Keneflex plan. Keep it, print it, or share the relevant parts with your healthcare professional.</span></div>
      <div class="actions"><button onclick="window.print()">Print / save this plan</button><button onclick="window.close()">Close</button></div>
    </main></body></html>`;
    const w=window.open('','_blank');
    if(!w){modalContent.innerHTML='<h2>Your complete plan at home</h2><p>Your browser blocked the printable window. Allow pop-ups for this prototype and try again.</p>';modal.classList.remove('hidden');return;}
    w.document.open();w.document.write(html);w.document.close();
  };

  orientIntro();
  if(typeof showSolution==='function'){
    const prior=showSolution;
    showSolution=function(){prior();streamlineSolution();};
  }
  streamlineSolution();

  // Keep later DOM changes from the tuning/safety layers from reintroducing the
  // large banner or duplicate warning buttons.
  const view=document.getElementById('solutionView');
  if(view){
    const obs=new MutationObserver(()=>{
      const banner=document.getElementById('kfxSafetyBanner');if(banner)banner.remove();
      const extras=[...view.querySelectorAll('.kfxSafetyMini')];extras.forEach(x=>x.remove());
    });
    obs.observe(view,{childList:true,subtree:true});
  }

  const style=document.createElement('style');
  style.textContent=`#solutionView .heroBox{display:none!important}#solutionView .solHero{grid-template-columns:1fr!important}.kfxMAdjust,.kfxMSafety{display:block;width:100%;margin-top:10px;border-radius:12px;padding:12px 14px;font-weight:900;text-align:left;cursor:pointer}.kfxMAdjust{border:0;background:#174b46;color:#fff}.kfxMSafety{border:1px solid #d29a30;background:#fff8e9;color:#66470c}.kfxKLinks{grid-template-columns:1fr 1fr}.kfxKNext [data-open="adjust"]{display:none!important}@media(max-width:650px){.kfxKLinks{grid-template-columns:1fr}}`;
  document.head.appendChild(style);
})();