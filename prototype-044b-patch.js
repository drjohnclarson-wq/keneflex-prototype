/* Keneflex 0.4.4b — Conversation Director patch
   Keeps the validated 0.4.4 core but makes the intake follow the consumer's story
   instead of narrating internal state or marching through a rigid questionnaire. */

state.triggerDetail = state.triggerDetail || '';
state.triggerLatency = state.triggerLatency || '';
state.patternChecked = false;

function naturalTrigger(){
  const s=(state.triggerSummary||'').toLowerCase();
  const bits=[];
  if(s.includes('phone')) bits.push('using your phone');
  if(s.includes('computer')||s.includes('typing')) bits.push('working at the computer');
  if(s.includes('workout')||s.includes('exercise')) bits.push('working out');
  if(s.includes('gripping')) bits.push('gripping');
  if(s.includes('twisting')) bits.push('twisting');
  if(s.includes('pickleball')) bits.push('pickleball');
  return bits.length ? bits.join(' and ') : (state.triggerSummary||'using your hand');
}
function hasDigitalUse(){
  const s=(state.triggerSummary||'').toLowerCase();
  return s.includes('phone')||s.includes('computer')||s.includes('typing');
}
function knownFeatureCount(){return state.features.size;}
function addOtherIfNovel(v){
  const s=(v||'').toLowerCase();
  if(!s || /^(no|none|nothing|not really|just (the )?(pain|soreness)|only (the )?(pain|soreness))\b/.test(s)) return;
  const known=/ache|aching|sore|soreness|hurt|hurting|pain|stiff|swell|numb|tingl|pins|needles|weak|rash|itch|red|wound|cut|burn|color|temperature|warm|hot/;
  if(!known.test(s)) state.otherDetail=v;
}

/* Open-ended first. Structure only if the consumer cannot give enough detail. */
askDetail=function(){
  setProgress(17);
  if(openingHasUsefulDetail()){
    const where=state.region==='hand'?'your hand':'';
    const when=state.triggerSummary?naturalTrigger():'';
    const pieces=[where,when].filter(Boolean);
    addAI(`Got it${pieces.length?` — ${pieces.join(' seems to bother you around ')}`:''}. What does it feel like when it acts up?`);
    textComposer('For example: sore and stiff, swollen, sharp, tingling, weak, itchy — or just describe it your way.','Continue →',v=>{
      const before=knownFeatureCount();
      parseDetail(v);addOtherIfNovel(v);
      if(knownFeatureCount()===before && !state.otherDetail && v.length<12){askSymptomPrompt();return;}
      afterSymptomDescription();
    });
    return;
  }
  addAI(`Tell me a little more. What does it feel like, and when do you tend to notice it?`);
  textComposer('Just describe it normally — for example: sore after typing, tingles at night, itchy and red…','Continue →',v=>{
    state.detail=v;parseDetail(v);addOtherIfNovel(v);
    if(!state.features.size && !state.otherDetail){askSymptomPrompt();return;}
    afterSymptomDescription();
  });
};

askBroad=function(){
  /* Kept as a compatibility entry point. The conversational version goes straight
     to the open-ended symptom description instead of displaying a checklist. */
  askDetail();
};

function askSymptomPrompt(){
  setProgress(26);
  addAI(`No problem. Which of these is closest? You can pick more than one.`);
  multiselect('What are you noticing?','Pick anything that fits.',[
    {value:'pain',label:'Pain / soreness'},{value:'swelling',label:'Swelling'},{value:'stiff',label:'Stiffness'},
    {value:'neuro',label:'Numbness / tingling'},{value:'weakness',label:'Weakness'},
    {value:'skin',label:'Rash / redness / skin change'},{value:'wound',label:'Cut / wound / burn'},
    {value:'color',label:'Color or temperature change'},{value:'unsure',label:'I’m not sure',wide:true,single:true}
  ],'Continue →',sel=>{
    sel.forEach(x=>{if(x!=='unsure')state.features.add(x)});
    afterSymptomDescription();
  });
}
function afterSymptomDescription(){
  setProgress(33);
  const sx=symptomSummary();
  if(state.features.has('skin')||state.features.has('wound')||state.features.has('color')){
    addAI(`Thanks. ${sx?`I’m hearing ${sx}. `:''}That could take this in a different direction, so I wouldn’t assume it is simply a muscle-or-joint problem.`);
  }else if(sx){
    addAI(`Thanks — ${sx}. Where in your hand do you feel it most?`);
  }else{
    addAI(`Thanks. Where in your hand do you feel it most?`);
  }
  askLocation(false);
}

/* Optional announce=false lets the preceding response flow directly into the location choices. */
const _coreAskLocation=askLocation;
askLocation=function(announce=true){
  setProgress(39);
  if(announce){
    if(state.location.size)addAI(`And where is it strongest?`);
    else addAI(`Where in your hand do you feel it most?`);
  }
  multiselect('Where do you feel it?','Pick all that apply.',[
    {value:'thumb',label:'Thumb / base of thumb'},{value:'fingers',label:'Fingers'},{value:'palm',label:'Palm'},
    {value:'back',label:'Back of hand'},{value:'wrist',label:'Wrist'},{value:'pinky',label:'Pinky-side of hand/wrist'},
    {value:'diffuse',label:'Several areas / hard to pinpoint'}
  ],'Continue →',sel=>{state.location=sel;askOnset()});
};

askOnset=function(){
  setProgress(49);
  if(state.trauma==='trauma'){addAI(`Since there was an injury, I want to check a few things before we talk about what might help.`);askSafety();return;}
  addAI(`Did this build up over time, or was there one specific moment when it started?`);
  oneSelect('How did it start?','Choose the closest answer.',[
    {value:'gradual',label:'It built up gradually / I’m not sure exactly when'},
    {value:'activity',label:'I first noticed it around repeated use or activity'},
    {value:'trauma',label:'It started after a fall, hit, sudden twist, or other injury'}
  ],v=>{state.trauma=v;if(v==='trauma')askSafety();else askDuration()});
};

askDuration=function(){
  setProgress(57);
  if(state.duration){askPattern();return;}
  addAI(`About how long has this been going on?`);
  oneSelect('How long?','Closest answer is fine.',[
    {value:'days',label:'A few days or less'},{value:'1-2w',label:'About 1–2 weeks'},
    {value:'3w',label:'About 3 weeks'},{value:'month',label:'More than a month'},{value:'unsure',label:'I’m not sure'}
  ],v=>{state.duration=v;askPattern()});
};

/* Follow the strongest clue before asking generic timing questions. */
askPattern=function(){
  setProgress(65);
  if(hasDigitalUse()){askUseMechanism();return;}
  askOtherTimes();
};

function askUseMechanism(){
  setProgress(66);
  addAI(`When it starts with ${naturalTrigger()}, what are you usually doing with that hand right before you notice it?`);
  textComposer('For example: holding the phone, scrolling/texting, typing, using the mouse, resting my wrist on the desk…','Continue →',v=>{
    state.triggerDetail=v;parseDetail(v);
    askUseLatency();
  });
}
function askUseLatency(){
  setProgress(69);
  addAI(`Does it usually start pretty quickly, or only after you’ve been doing that for a while?`);
  oneSelect('When does it start?','An estimate is enough.',[
    {value:'quick',label:'Pretty quickly / within a few minutes'},
    {value:'10-30',label:'Usually after about 10–30 minutes'},
    {value:'30-60',label:'Usually after 30–60 minutes'},
    {value:'longer',label:'Usually after an hour or more'},
    {value:'unsure',label:'I’m not sure'}
  ],v=>{state.triggerLatency=v;askOtherTimes()});
}
function askOtherTimes(){
  setProgress(72);
  if(state.patternChecked){askRelief();return;}
  state.patternChecked=true;
  const intro=hasDigitalUse()?`Does it also bother you when you’re not doing those things?`:`Are there particular times when it tends to be better or worse?`;
  addAI(intro);
  multiselect('Anything else you’ve noticed?','Pick anything that applies, or choose the last option.',[
    {value:'morning',label:'Worse first thing in the morning'},{value:'night',label:'Bothers me at night'},
    {value:'wake',label:'Wakes me up'},{value:'rest',label:'Can bother me even at rest'},
    {value:'intermittent',label:'Comes and goes at other times'},
    {value:'noneOther',label:'No — mostly with the activities I described',wide:true,single:true},
    {value:'unsure',label:'I haven’t noticed',wide:true,single:true}
  ],'Continue →',sel=>{
    sel.forEach(x=>{if(!['noneOther','unsure','rest'].includes(x))state.pattern.add(x)});
    if(sel.has('rest'))state.pattern.add('rest');
    askRelief();
  });
}
function askRelief(){
  setProgress(76);
  const context=hasDigitalUse()?`when you stop, put the phone down, or change position`:`when you stop the aggravating activity`;
  addAI(`What happens ${context}? Does it settle down?`);
  oneSelect('What happens afterward?','Choose the closest answer.',[
    {value:'quick',label:'Yes — it settles fairly quickly'},
    {value:'gradual',label:'Yes — but it takes a while'},
    {value:'no',label:'No — it tends to stick around'},
    {value:'varies',label:'It varies / I’m not sure'}
  ],v=>{state.relief=v;askGoal()});
}

askTrigger=function(){askRelief();};

askGoal=function(){
  setProgress(81);
  addAI(`What would you most like to be able to keep doing without this getting in the way?`);
  textComposer('Work at my computer, use my phone, exercise, sleep, play pickleball, everyday tasks…','Continue →',v=>{
    state.activity=v;state.goal=v;askSafetyBroad();
  });
};

askSafetyBroad=function(){
  setProgress(88);
  addAI(`Before I suggest anything, I want to check a few things that would change what I’d tell you to do next.`);
  multiselect('Any of these?','Pick all that apply.',[
    {value:'suddenWeak',label:'Sudden new weakness of the hand or arm'},
    {value:'loss',label:'New loss of feeling in part or all of the hand'},
    {value:'grip',label:'New/worsening grip weakness or frequent dropping',small:'Because the hand feels weak, numb, or unreliable.'},
    {value:'majorSwelling',label:'Major or rapidly increasing swelling'},
    {value:'fever',label:'Fever or feeling very unwell with a hot/red/swollen area'},
    {value:'deformity',label:'Obvious deformity'},{value:'open',label:'Open wound / significant skin breakdown'},
    {value:'none',label:'None of these',wide:true,single:true}
  ],'Continue →',sel=>{
    state.redFlags=sel;
    if(sel.has('suddenWeak')||sel.has('loss')||sel.has('deformity')||sel.has('open')||sel.has('majorSwelling')||sel.has('fever')){stopForCare('hard');return;}
    if(sel.has('grip')){clarifyGrip();return;}
    askFit();
  });
};

/* Shorter, more human clarification copy. */
clarifyGrip=function(){
  setProgress(90);
  addAI(`Tell me a little more about the dropping. Is this an occasional thing, or does the hand actually feel weaker or less reliable than it used to?`);
  oneSelect('Which is closest?','',[
    {value:'casual',label:'Occasional — not new or getting worse, and my hand does not feel weak or numb'},
    {value:'changing',label:'It is new/more frequent, or my grip really does feel weaker or numb'},
    {value:'unsure',label:'I’m not sure — I just know I sometimes drop things'}
  ],v=>{
    if(v==='casual'){state.gripConcern='low';addAI(`Okay. I’ll keep that in mind, but that alone isn’t enough reason to stop here.`);askFit();}
    else clarifyGripFunction(v);
  });
};

/* Make the pre-recommendation summary sound like advice, not an algorithm report. */
showEnough=function(){
  setProgress(100);addAI(`Okay — I have enough to tell you where I’d start.`);
  const summary=document.createElement('div');summary.className='card enough';summary.style.marginTop='12px';
  const location=[...state.location].join(' + ')||'hand/wrist';
  const detail=state.triggerDetail?` You notice it especially with ${state.triggerDetail}.`:'';
  const relief=state.relief==='quick'?' It settles fairly quickly when you stop or change what you’re doing.':state.relief==='no'?' It tends to linger even after you stop.':'';
  const grip=state.gripConcern?` I’m also keeping the occasional dropping in the follow-up plan.`:'';
  summary.innerHTML=`<h2>Here’s what I’m hearing.</h2><p>The ${location} is bothering you mainly around ${naturalTrigger()}.${detail}${relief} Your goal is to keep doing ${state.activity||'your normal activities'} without this getting in the way.${grip}</p><div class="row"><button id="seePlan" class="primary">Show me what you’d do →</button></div>`;
  interaction.replaceWith(summary);document.getElementById('seePlan').onclick=showSolution;
};
