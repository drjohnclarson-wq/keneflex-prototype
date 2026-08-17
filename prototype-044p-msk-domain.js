/* Keneflex 0.4.4P — MSK regional playbook gate.
   This is deliberately NOT a carpal-tunnel patch. Whenever the hand/wrist/thumb
   region remains on a conservative MSK path, Keneflex activates a regional
   differential playbook and asks only the discriminators that could materially
   change the solution. The consumer does not see a diagnosis list. */
(function(){
  if(typeof askFit!=='function')return;
  const originalAskFit=askFit;

  function hasLoc(x){return !!(state.location&&state.location.has&&state.location.has(x));}
  function digitalPattern(){return /phone|computer|typing|keyboard|mouse/.test(((state.triggerSummary||'')+' '+(state.triggerDetail||'')).toLowerCase());}
  function longerCourse(){return state.duration==='month'||/month/.test((state.duration||'').toLowerCase());}
  function nerveScreenEarned(){
    return hasLoc('wrist')||hasLoc('fingers')||hasLoc('palm')||digitalPattern()||longerCourse()||
      (state.pattern&&state.pattern.has&&(['night','wake'].some(x=>state.pattern.has(x))))||!!state.gripConcern;
  }

  function finishMSK(){
    state._mskDomainDone=true;
    originalAskFit();
  }

  function startMSK(){
    state.mskPatterns=state.mskPatterns||new Set();
    state.mskEvidence=state.mskEvidence||{};
    if(nerveScreenEarned()){askNervePattern();return;}
    askThumbPattern();
  }

  function askNervePattern(){
    setProgress(92);
    addAI('Before Keneflex chooses a wrist or thumb support, Keneflex wants to separate a possible nerve-type pattern from tendon, joint, and ordinary overuse patterns. A few of these can look similar at first.');
    multiselect('Have any of these been part of it?','Choose anything you have actually noticed. If none fit, choose none.',[
      {value:'sensory',label:'Numbness, tingling, pins-and-needles, or burning in the hand/fingers'},
      {value:'night',label:'It is worse at night or wakes me from sleep'},
      {value:'shake',label:'Shaking or flicking my hand seems to help'},
      {value:'clumsy',label:'The hand feels clumsy/weak or I have been dropping things more than usual'},
      {value:'proximal',label:'Symptoms also seem to travel from my neck/arm into the hand'},
      {value:'none',label:'None of these',wide:true,single:true}
    ],'Continue →',sel=>{
      state.mskEvidence.nerve=[...sel];
      if(sel.has('none')){askThumbPattern();return;}
      if(sel.has('proximal'))state.mskPatterns.add('proximal-nerve-pattern');
      if(sel.has('sensory')||sel.has('night')||sel.has('shake')||sel.has('clumsy')){askSensoryMap(sel);return;}
      askThumbPattern();
    });
  }

  function askSensoryMap(sel){
    setProgress(93);
    addAI('That is worth narrowing before Keneflex picks the support. Where do you notice the numbness, tingling, burning, or altered feeling — if you have any?');
    multiselect('Where do you notice the nerve-type feeling?','Choose all that apply. If you do not actually have numbness/tingling/burning, choose the last option.',[
      {value:'thumb',label:'Thumb'}, {value:'index',label:'Index finger'}, {value:'middle',label:'Middle finger'},
      {value:'ring',label:'Ring finger'}, {value:'pinky',label:'Pinky'}, {value:'palm',label:'Palm'},
      {value:'none',label:'I do not have numbness / tingling / burning',wide:true,single:true}
    ],'Continue →',map=>{
      state.mskEvidence.sensoryMap=[...map];
      const median=['thumb','index','middle','ring'].filter(x=>map.has(x)).length;
      const ulnar=map.has('pinky');
      let score=0;
      if(sel.has('sensory')&&median)score++;
      if(sel.has('night'))score++;
      if(sel.has('shake'))score++;
      if(sel.has('clumsy'))score++;
      if(median>=2&&!ulnar)score++;
      state.mskEvidence.medianNerveScore=score;
      if(score>=2)state.mskPatterns.add('median-nerve-pattern');
      if(ulnar)state.mskPatterns.add('ulnar-nerve-pattern');
      if(score>=2){
        addAI('Those details create enough of a nerve-type pattern that Keneflex will keep it separate from the thumb/tendon story instead of forcing everything into one overuse explanation.');
      }
      askThumbPattern();
    });
  }

  function askThumbPattern(){
    if(!hasLoc('thumb')){askWristPattern();return;}
    setProgress(94);
    addAI('For the thumb part, one location detail can change which kind of support makes sense.');
    oneSelect('Where is the thumb pain most centered?','Choose the closest description.',[
      {value:'base',label:'Right at the base of the thumb where it meets the hand/wrist'},
      {value:'radialWrist',label:'Along the thumb-side of the wrist'},
      {value:'thumbJoint',label:'More in the thumb itself / one of the thumb joints'},
      {value:'diffuse',label:'Hard to pinpoint / more than one of these'}
    ],v=>{
      state.mskEvidence.thumbLocation=v;
      if(v==='base'||v==='radialWrist'){askThumbLoad(v);return;}
      askWristPattern();
    });
  }

  function askThumbLoad(loc){
    setProgress(95);
    addAI('What kind of motion tends to reproduce that thumb-side pain most clearly?');
    multiselect('Which actions bring it out?','Choose what you have actually noticed.',[
      {value:'pinch',label:'Pinching, gripping, opening jars, turning keys/lids'},
      {value:'thumbMotion',label:'Moving the thumb away from the hand or repeated thumb motion'},
      {value:'lift',label:'Lifting/carrying something with the thumb and wrist working together'},
      {value:'phone',label:'Scrolling, texting, gaming, or holding the phone'},
      {value:'none',label:'None of these / I am not sure',wide:true,single:true}
    ],'Continue →',sel=>{
      state.mskEvidence.thumbLoad=[...sel];
      if(loc==='base'&&sel.has('pinch'))state.mskPatterns.add('thumb-base-joint-pattern');
      if(loc==='radialWrist'&&(sel.has('thumbMotion')||sel.has('lift')))state.mskPatterns.add('radial-thumb-tendon-pattern');
      askWristPattern();
    });
  }

  function askWristPattern(){
    if(!hasLoc('wrist')){askOtherMSK();return;}
    setProgress(96);
    addAI('For the wrist itself, where it is centered helps Keneflex avoid treating every wrist complaint the same way.');
    oneSelect('Where is the wrist pain strongest?','Closest answer is enough.',[
      {value:'thumbSide',label:'Thumb side of the wrist'},
      {value:'pinkySide',label:'Pinky side of the wrist'},
      {value:'palmSide',label:'Palm side / center of the wrist'},
      {value:'back',label:'Back of the wrist'},
      {value:'diffuse',label:'Hard to pinpoint / more than one area'}
    ],v=>{state.mskEvidence.wristLocation=v;askOtherMSK()});
  }

  function askOtherMSK(){
    setProgress(97);
    const alreadySwelling=state.features&&state.features.has&&state.features.has('swelling');
    const alreadyStiff=state.features&&state.features.has&&state.features.has('stiff');
    addAI('One last check: Keneflex wants to make sure there is not another wrist/hand pattern that would change the plan.');
    const opts=[
      {value:'click',label:'Clicking, catching, locking, or a tendon that seems to snap'},
      {value:'lump',label:'A noticeable lump or bump at the wrist/hand'},
      {value:'multiJoint',label:'Several hand joints are involved or morning stiffness lasts a long time'},
      {value:'hot',label:'A joint becomes hot, very red, or suddenly very swollen'},
      {value:'none',label:'None of these',wide:true,single:true}
    ];
    multiselect('Any of these?','Only choose what is actually present.',opts,'Continue →',sel=>{
      state.mskEvidence.other=[...sel];
      if(sel.has('click'))state.mskPatterns.add('tendon-catching-pattern');
      if(sel.has('lump'))state.mskPatterns.add('mass-ganglion-pattern');
      if(sel.has('multiJoint')||alreadyStiff)state.mskPatterns.add('joint-inflammatory-pattern');
      if(sel.has('hot'))state.mskPatterns.add('acute-inflammatory-pattern');
      if(alreadySwelling)state.mskEvidence.swellingAlreadyReported=true;
      finishMSK();
    });
  }

  // Interpose the regional playbook immediately before product-fit selection.
  askFit=function(){
    if(state._mskDomainDone){originalAskFit();return;}
    if(state.region==='hand' && (hasLoc('wrist')||hasLoc('thumb')||hasLoc('fingers')||hasLoc('palm')||hasLoc('pinky'))){startMSK();return;}
    state._mskDomainDone=true;originalAskFit();
  };

  // Make the pre-plan summary acknowledge when more than one meaningful pattern
  // survived the regional work-up, without naming diagnoses to the consumer.
  if(typeof showEnough==='function'){
    const priorShowEnough=showEnough;
    showEnough=function(){
      priorShowEnough();
      try{
        if(!state.mskPatterns||!state.mskPatterns.size)return;
        const card=document.querySelector('.card.enough');
        const p=card&&card.querySelector('p');
        if(!p)return;
        const n=state.mskPatterns.size;
        if(n>1)p.insertAdjacentHTML('beforeend',` Keneflex also found ${n} different pattern types worth keeping separate, so the plan should not assume every symptom has one cause.`);
        else if(state.mskPatterns.has('median-nerve-pattern'))p.insertAdjacentHTML('beforeend',' Keneflex also found a nerve-type pattern that must be accounted for before treating this as a simple wrist/thumb overuse problem.');
      }catch(e){}
    };
  }
})();

/* Remove all employer/reimbursement-benefit messaging from the printable home plan.
   Equipment can still be recommended when it belongs in the solution. */
(function(){
  if(typeof kfxHOpenHomePlan!=='function')return;
  const prior=kfxHOpenHomePlan;
  kfxHOpenHomePlan=function(){
    const originalOpen=window.open;
    let child=null;
    window.open=function(){child=originalOpen.apply(window,arguments);return child;};
    try{prior();}finally{window.open=originalOpen;}
    setTimeout(()=>{
      try{
        if(!child||child.closed)return;
        child.document.querySelectorAll('.kfxMEmployer').forEach(n=>n.remove());
      }catch(e){}
    },40);
  };
})();
