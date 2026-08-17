/* Keneflex 0.4.4T — adaptive fast-path intake.
   Reduce consumer effort without reducing the clinical work-up: extract more from
   the opening story, combine low-burden related questions, ask only missing or
   decision-changing information, and remove the redundant pre-plan confirmation. */
(function(){
  const currentParse=parseDetail;

  function hasLoc(x){return !!(state.location&&state.location.has&&state.location.has(x));}
  function digitalPattern(){return /phone|computer|typing|keyboard|mouse|trackpad/.test(((state.triggerSummary||'')+' '+(state.opening||'')+' '+(state.detail||'')).toLowerCase());}
  function relevantHandRegion(){return state.region==='hand'||hasLoc('wrist')||hasLoc('thumb')||hasLoc('fingers')||hasLoc('palm')||hasLoc('pinky');}

  function extractLatency(s){
    const m=(s||'').toLowerCase().match(/(?:after|within|takes?\s+(?:about\s+)?)\s*(\d+)\s*(min|mins|minute|minutes|hour|hours)/);
    if(!m)return '';
    let n=Number(m[1]); if(/hour/.test(m[2]))n*=60;
    if(n<=5)return 'quick'; if(n<=30)return '10-30'; if(n<=60)return '30-60'; return 'longer';
  }
  function extractMechanism(s){
    s=(s||'').toLowerCase(); const bits=[];
    if(/hold(?:ing)?[^.]{0,20}phone|phone[^.]{0,20}hold/.test(s))bits.push('holding the phone');
    if(/scroll/.test(s))bits.push('scrolling');
    if(/text|typing on (?:my )?phone/.test(s))bits.push('texting');
    if(/typ(?:e|ing)|keyboard/.test(s))bits.push('typing');
    if(/mouse/.test(s))bits.push('using the mouse');
    if(/trackpad/.test(s))bits.push('using the trackpad');
    if(/rest(?:ing)?[^.]{0,20}wrist|wrist[^.]{0,20}(?:desk|edge)/.test(s))bits.push('resting the wrist on the desk');
    if(/grip|gripping/.test(s))bits.push('gripping');
    if(/twist|twisting/.test(s))bits.push('twisting');
    return [...new Set(bits)].join(', ');
  }

  parseDetail=function(t){
    currentParse(t);
    const s=(t||'').toLowerCase();
    if(/\bright\s+(?:hand|wrist|thumb|finger|palm)|(?:hand|wrist|thumb|finger|palm)[^.]{0,12}\bright\b/.test(s))state.side='right';
    if(/\bleft\s+(?:hand|wrist|thumb|finger|palm)|(?:hand|wrist|thumb|finger|palm)[^.]{0,12}\bleft\b/.test(s))state.side='left';
    if(/\bboth\s+(?:hands|wrists|thumbs)|(?:both sides|both hands|both wrists)\b/.test(s))state.side='both';
    if(!state.triggerLatency){const l=extractLatency(s);if(l)state.triggerLatency=l;}
    if(!state.triggerDetail){const d=extractMechanism(s);if(d)state.triggerDetail=d;}
    if(/\bat night\b|nighttime|night time/.test(s))state.pattern.add('night');
    if(/wake(?:s|n|ing)?\s+(?:me|you)?\s*up|wakes?\s+up/.test(s))state.pattern.add('wake');
    if(/\bat rest\b|even when (?:i'?m|im) not using|while resting/.test(s))state.pattern.add('rest');
    if(/\bin the morning\b|first thing in the morning/.test(s))state.pattern.add('morning');
    if(/built up|gradually|over time/.test(s)&&!state.trauma)state.trauma='gradual';
  };

  function openingRichEnough(){
    const where=state.region||state.location.size;
    const what=state.features.size||state.otherDetail||state.spontaneousDropping;
    const context=state.triggerSummary||state.duration||state.pattern.size||state.triggerDetail;
    return !!(where&&what&&context);
  }
  function inferActivity(){
    if(state.activity)return true;
    const s=(state.triggerSummary||'').toLowerCase();
    if(s.includes('phone')&&(s.includes('computer')||s.includes('typing'))){state.activity='use your phone and computer comfortably';return true;}
    if(s.includes('phone')){state.activity='use your phone comfortably';return true;}
    if(s.includes('computer')||s.includes('typing')){state.activity='work at your computer comfortably';return true;}
    if(s.includes('pickleball')){state.activity='keep playing pickleball';return true;}
    if(s.includes('workout')||s.includes('exercise')){state.activity='keep exercising';return true;}
    if(s.includes('gripping')||s.includes('twisting')){state.activity='keep doing the activities that require gripping and twisting';return true;}
    return false;
  }

  function orient(){
    const hero=document.querySelector('#intro .hero'); if(!hero)return;
    const h=hero.querySelector('h1'); if(h)h.textContent='Tell Keneflex what’s bothering you.';
    const q=document.querySelector('#intro .question'); if(q)q.textContent='What’s going on?';
    const help=document.querySelector('#intro .help');
    if(help)help.innerHTML='Say it naturally. <b>If you can, include where you feel it, what it feels like, how long it has been going on, and when you notice it.</b> More detail can mean fewer follow-up questions.';
    if(opening)opening.placeholder='Describe it the way you would to someone who knows how to help.';
  }

  function afterOpening(){
    if(!state.location.size || !state.side){askWhereAndSide();return;}
    if(state.location.size>1 && !state.areaRelationship)state.areaRelationship='unsure';
    askStartFast();
  }

  function askWhereAndSide(){
    setProgress(31);
    if(state.location.size && !state.side){
      addAI('Got it. Which side is bothering you?');
      oneSelect('Which side?','',[
        {value:'left',label:'Left'},{value:'right',label:'Right'},{value:'both',label:'Both sides'},{value:'unsure',label:'I’m not sure'}
      ],v=>{state.side=v;if(state.location.size>1&&!state.areaRelationship)state.areaRelationship='unsure';askStartFast();});
      return;
    }
    if(!state.location.size && state.side){
      addAI('Got it. Help Keneflex pin down where you feel it most.');
      multiselect('Where do you feel it?','Pick all that apply.',[
        {value:'thumb',label:'Thumb / base of thumb'},{value:'fingers',label:'Fingers'},{value:'palm',label:'Palm'},
        {value:'back',label:'Back of hand'},{value:'wrist',label:'Wrist'},{value:'pinky',label:'Pinky-side of hand/wrist'},
        {value:'diffuse',label:'Several areas / hard to pinpoint'}
      ],'Continue →',sel=>{state.location=sel;if(sel.size>1&&!state.areaRelationship)state.areaRelationship='unsure';askStartFast();});
      return;
    }

    addAI('Help Keneflex place it precisely. You can answer both parts here.');
    interaction.innerHTML=`<div class="selectHead">Where do you feel it?</div><div class="selectHint">Pick all that apply.</div><div class="options" id="kfxTLoc"></div><div class="selectHead" style="margin-top:16px">Which side?</div><div class="selectHint">Choose one.</div><div class="options" id="kfxTSide"></div><div class="row"><button class="primary" id="kfxTWhereNext">Continue →</button></div>`;
    const locOpts=[['thumb','Thumb / base of thumb'],['fingers','Fingers'],['palm','Palm'],['back','Back of hand'],['wrist','Wrist'],['pinky','Pinky-side of hand/wrist'],['diffuse','Several areas / hard to pinpoint']];
    const selected=new Set(); const locBox=document.getElementById('kfxTLoc');
    locOpts.forEach(([v,label])=>{const b=document.createElement('button');b.className='opt';b.textContent=label;b.onclick=()=>{selected.has(v)?selected.delete(v):selected.add(v);b.classList.toggle('on',selected.has(v));};locBox.appendChild(b);});
    let side=''; const sideBox=document.getElementById('kfxTSide');
    [['left','Left'],['right','Right'],['both','Both'],['unsure','Not sure']].forEach(([v,label])=>{const b=document.createElement('button');b.className='opt';b.textContent=label;b.onclick=()=>{side=v;[...sideBox.children].forEach(x=>x.classList.remove('on'));b.classList.add('on');};sideBox.appendChild(b);});
    document.getElementById('kfxTWhereNext').onclick=()=>{if(!selected.size||!side)return;state.location=selected;state.side=side;if(selected.size>1&&!state.areaRelationship)state.areaRelationship='unsure';addUser(`${[...selected].join(', ')} · ${side}`);interaction.innerHTML='';askStartFast();};
  }

  function askStartFast(){
    setProgress(45);
    const needStart=!state.trauma, needDuration=!state.duration;
    if(!needStart&&!needDuration){afterStartFast();return;}
    if(needStart&&!needDuration){
      addAI('One timing detail: did this build up, or was there one specific injury?');
      oneSelect('How did it start?','',[
        {value:'gradual',label:'Built up gradually / not sure exactly when'},
        {value:'activity',label:'First noticed it around repeated use or activity'},
        {value:'trauma',label:'After a fall, hit, sudden twist, or other specific injury'}
      ],v=>{state.trauma=v;if(v==='trauma')askSafety();else afterStartFast();});return;
    }
    if(!needStart&&needDuration){askDuration();return;}

    addAI('Two quick timing details help Keneflex avoid asking them separately.');
    interaction.innerHTML=`<div class="selectHead">How did it start?</div><div class="options" id="kfxTStart"></div><div class="selectHead" style="margin-top:16px">About how long has it been going on?</div><div class="options" id="kfxTDur"></div><div class="row"><button class="primary" id="kfxTStartNext">Continue →</button></div>`;
    let start='',dur='';
    const bind=(id,opts,setter)=>{const box=document.getElementById(id);opts.forEach(([v,label])=>{const b=document.createElement('button');b.className='opt';b.textContent=label;b.onclick=()=>{setter(v);[...box.children].forEach(x=>x.classList.remove('on'));b.classList.add('on');};box.appendChild(b);});};
    bind('kfxTStart',[['gradual','Built up gradually / not sure exactly when'],['activity','First noticed it around repeated use or activity'],['trauma','After a fall, hit, sudden twist, or other injury']],v=>start=v);
    bind('kfxTDur',[['days','A few days or less'],['1-2w','About 1–2 weeks'],['3w','About 3 weeks'],['month','More than a month'],['unsure','Not sure']],v=>dur=v);
    document.getElementById('kfxTStartNext').onclick=()=>{if(!start||!dur)return;state.trauma=start;state.duration=dur;addUser(`${start==='trauma'?'Specific injury':start==='activity'?'Around repeated use/activity':'Gradual'} · ${dur}`);interaction.innerHTML='';if(start==='trauma')askSafety();else afterStartFast();};
  }

  askDuration=function(){
    if(state.duration){afterStartFast();return;}
    addAI('About how long has this been going on?');
    oneSelect('How long?','Closest answer is fine.',[
      {value:'days',label:'A few days or less'},{value:'1-2w',label:'About 1–2 weeks'},{value:'3w',label:'About 3 weeks'},
      {value:'month',label:'More than a month'},{value:'unsure',label:'I’m not sure'}
    ],v=>{state.duration=v;afterStartFast();});
  };

  function afterStartFast(){
    if(digitalPattern() && (!state.triggerDetail||!state.triggerLatency)){askMechanismFast();return;}
    askPatternFast();
  }

  function askMechanismFast(){
    setProgress(58);
    addAI('When it starts during phone or computer use, what are you doing with the hand — and roughly how long before you notice it?');
    textComposer('For example: scrolling with my thumb after 20 minutes, typing for about an hour, using the mouse for 30 minutes…','Continue →',v=>{
      state.triggerDetail=extractMechanism(v)||v.trim();
      parseDetail(v);
      if(!state.triggerLatency)state.triggerLatency='unsure';
      askPatternFast();
    });
  }

  function askPatternFast(){
    setProgress(67);
    addAI('Anything else about when it shows up? This helps Keneflex catch patterns that can look similar at first.');
    multiselect('Anything else you’ve noticed?','Pick anything that applies, or choose the last option.',[
      {value:'morning',label:'Worse first thing in the morning'},{value:'night',label:'Bothers me at night'},
      {value:'wake',label:'Wakes me up'},{value:'rest',label:'Can bother me even at rest'},
      {value:'intermittent',label:'Comes and goes at other times'},
      {value:'noneOther',label:'No — mostly with what I already described',wide:true,single:true},
      {value:'unsure',label:'I haven’t noticed',wide:true,single:true}
    ],'Continue →',sel=>{
      sel.forEach(x=>{if(!['noneOther','unsure'].includes(x))state.pattern.add(x)});
      afterPatternFast();
    });
  }

  function afterPatternFast(){
    if(inferActivity()){state.goal=state.activity;askSafetyBroad();return;}
    askGoal();
  }

  askDetail=function(){
    setProgress(18);
    if(openingRichEnough()){afterOpening();return;}
    addAI('Tell Keneflex a little more — what does it feel like, and when do you tend to notice it?');
    textComposer('Use normal words. Include whatever you know; Keneflex will only ask for what is still missing.','Continue →',v=>{
      state.detail=v;parseDetail(v);
      if(!state.features.size&&!state.otherDetail&&!state.spontaneousDropping){askSymptomPrompt();return;}
      afterOpening();
    });
  };

  /* If the structured symptom fallback is needed, resume into the fast path rather
     than the older location/onset chain. */
  const priorSymptomPrompt=typeof askSymptomPrompt==='function'?askSymptomPrompt:null;
  if(priorSymptomPrompt){
    askSymptomPrompt=function(){
      setProgress(24);
      addAI('Which of these is closest? You can pick more than one.');
      multiselect('What are you noticing?','Pick anything that fits.',[
        {value:'pain',label:'Pain / soreness'},{value:'swelling',label:'Swelling'},{value:'stiff',label:'Stiffness'},
        {value:'neuro',label:'Numbness / tingling'},{value:'weakness',label:'Weakness'},
        {value:'skin',label:'Rash / redness / skin change'},{value:'wound',label:'Cut / wound / burn'},
        {value:'color',label:'Color or temperature change'},{value:'unsure',label:'I’m not sure',wide:true,single:true}
      ],'Continue →',sel=>{sel.forEach(x=>{if(x!=='unsure')state.features.add(x)});afterOpening();});
    };
  }

  /* ---- Faster regional MSK gate ----
     The entire regional map remains backstage. One high-yield screen surfaces the
     discriminators; only positive nerve clues earn a sensory-map follow-up. */
  const priorAskFit=askFit;
  function finishRegional(){
    state._kfxTFastRegionalDone=true;
    state._mskDomainDone=true; // bypass the older multi-screen regional gate
    priorAskFit();
  }
  function sensoryMapFast(baseScore){
    setProgress(93);
    addAI('One follow-up matters here: where do you notice the numbness, tingling, burning, or altered feeling — if you have any?');
    multiselect('Where do you notice it?','Pick all that apply, or choose the last option.',[
      {value:'thumb',label:'Thumb'},{value:'index',label:'Index finger'},{value:'middle',label:'Middle finger'},
      {value:'ring',label:'Ring finger'},{value:'pinky',label:'Pinky'},{value:'palm',label:'Palm'},
      {value:'none',label:'I do not actually have numbness / tingling / burning',wide:true,single:true}
    ],'Continue →',map=>{
      state.mskEvidence.sensoryMap=[...map];
      const median=['thumb','index','middle','ring'].filter(x=>map.has(x)).length;
      const ulnar=map.has('pinky');
      const score=baseScore+(median>=2&&!ulnar?1:0);
      state.mskEvidence.medianNerveScore=score;
      if(score>=2)state.mskPatterns.add('median-nerve-pattern');
      if(ulnar)state.mskPatterns.add('ulnar-nerve-pattern');
      finishRegional();
    });
  }
  function regionalFast(){
    state.mskPatterns=state.mskPatterns||new Set();
    state.mskEvidence=state.mskEvidence||{};
    setProgress(90);
    const opts=[];
    const knownNeuro=state.features&&state.features.has&&state.features.has('neuro');
    if(!knownNeuro)opts.push({value:'sensory',label:'Numbness, tingling, burning, or pins-and-needles'});
    opts.push({value:'night',label:'Worse at night or wakes me from sleep'});
    opts.push({value:'shake',label:'Shaking or flicking the hand seems to help'});
    opts.push({value:'proximal',label:'Symptoms seem to travel from my neck or arm into the hand'});
    if(hasLoc('thumb')){
      opts.push({value:'thumbBase',label:'Pain right at the thumb base, especially with pinch/grip/jars'});
      opts.push({value:'thumbTendon',label:'Pain along the thumb-side of the wrist, especially with thumb motion or lifting'});
    }
    if(hasLoc('wrist')||hasLoc('pinky'))opts.push({value:'ulnarWrist',label:'Pinky-side wrist pain, clicking, or pain with twisting/loading'});
    opts.push({value:'mechanical',label:'Catching, locking, snapping, or a noticeable lump'});
    opts.push({value:'inflammatory',label:'Hot/red marked swelling, or several joints with long morning stiffness'});
    opts.push({value:'none',label:'None of these',wide:true,single:true});
    addAI('Before Keneflex chooses a support, one quick pattern check helps separate problems that can need different conservative care.');
    multiselect('Have any of these been part of it?','Choose only what you have actually noticed.',opts,'Continue →',sel=>{
      state.mskEvidence.fastRegional=[...sel];
      if(sel.has('proximal'))state.mskPatterns.add('proximal-nerve-pattern');
      if(sel.has('thumbBase'))state.mskPatterns.add('thumb-base-joint-pattern');
      if(sel.has('thumbTendon'))state.mskPatterns.add('radial-thumb-tendon-pattern');
      if(sel.has('ulnarWrist'))state.mskPatterns.add('ulnar-wrist-pattern');
      if(sel.has('mechanical'))state.mskPatterns.add('mechanical-hand-wrist-pattern');
      if(sel.has('inflammatory'))state.mskPatterns.add('joint-inflammatory-pattern');
      let nerveScore=0;
      if(knownNeuro||sel.has('sensory'))nerveScore++;
      if(sel.has('night'))nerveScore++;
      if(sel.has('shake'))nerveScore++;
      if(state.gripConcern&&state.gripConcern!=='low')nerveScore++;
      if(knownNeuro||sel.has('sensory')||nerveScore>=2){sensoryMapFast(nerveScore);return;}
      finishRegional();
    });
  }
  askFit=function(){
    if(state._kfxTFastRegionalDone){priorAskFit();return;}
    if(relevantHandRegion()){regionalFast();return;}
    state._kfxTFastRegionalDone=true;state._mskDomainDone=true;priorAskFit();
  };

  /* The old “Here’s what Keneflex heard → Show me the plan” card costs a full
     interaction after Keneflex already has enough. Put that summary in the answer
     layer instead and go straight to the solution. */
  showEnough=function(){
    setProgress(100);
    addAI('Thanks — Keneflex has enough. Building your plan now…');
    setTimeout(()=>showSolution(),120);
  };

  orient();
})();
