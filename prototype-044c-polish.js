/* 0.4.4c polish: accumulate the story and keep the voice human. */

const _keneflexParseDetail=parseDetail;
parseDetail=function(t){
  const prior=state.triggerSummary||'';
  _keneflexParseDetail(t);
  const latest=state.triggerSummary||'';
  if(prior && latest && prior!==latest){
    const parts=[...prior.split(' and '),...latest.split(' and ')].map(x=>x.trim()).filter(Boolean);
    state.triggerSummary=[...new Set(parts)].join(' and ');
  }
  if(/\b(drop|dropping|dropped)\b.*\b(thing|things|object|objects|stuff|phone|cup|cups)\b|\b(thing|things|object|objects|stuff)\b.*\b(drop|dropping|dropped)\b/i.test(t||'')) state.spontaneousDropping=true;
};

function activityContext(){
  const s=(state.triggerSummary||'').toLowerCase();
  const bits=[];
  if(s.includes('phone'))bits.push('phone use');
  if(s.includes('computer')||s.includes('typing'))bits.push('computer/typing');
  if(s.includes('workout')||s.includes('exercise'))bits.push('workouts/exercise');
  if(s.includes('gripping'))bits.push('gripping');
  if(s.includes('twisting'))bits.push('twisting');
  if(s.includes('pickleball'))bits.push('pickleball');
  return bits.length?[...new Set(bits)].join(' and '):(state.triggerSummary||'using your hand');
}
function cleanConsumerPhrase(v){return (v||'').trim().replace(/[.?!]+$/,'');}
function knownSymptomPhrase(v){return /ache|aching|sore|soreness|hurt|hurting|pain|stiff|swell|numb|tingl|pins|needles|weak|rash|itch|red|wound|cut|burn|color|temperature|warm|hot/i.test(v||'');}

/* A vague functional clue should trigger curiosity, not an automatic safety stop. */
function clarifySpontaneousDropping(next){
  if(!state.spontaneousDropping || state.gripConcern){next();return;}
  setProgress(35);
  addAI(`You mentioned dropping things sometimes. I want to understand what you mean before I make anything of that.`);
  oneSelect('Which is closest?','',[
    {value:'casual',label:'It happens occasionally, but my hand does not feel weaker or numb and it is not getting worse'},
    {value:'changing',label:'It is happening more often, or my hand really does feel weaker, numb, or less reliable'},
    {value:'unsure',label:'I’m not sure — I’ve just noticed that I sometimes drop things'}
  ],v=>{
    state.gripConcern=v==='casual'?'low':v;
    if(v==='casual') addAI(`Okay. That by itself doesn’t make me stop here.`);
    else if(v==='changing') addAI(`That matters. I’ll keep it in the safety check before I suggest anything.`);
    else addAI(`Okay. I won’t treat that alone as a red flag, but I’ll keep it in mind.`);
    next();
  });
}

function continueAfterSymptoms(){clarifySpontaneousDropping(()=>afterSymptomDescription());}

askDetail=function(){
  setProgress(17);
  if(openingHasUsefulDetail()){
    const context=state.triggerSummary?` mainly around ${activityContext()}`:'';
    addAI(`Got it. Your hand is bothering you${context}. What does it feel like when it acts up?`);
    textComposer('For example: sore and stiff, swollen, sharp, tingling, weak, itchy — or just describe it your way.','Continue →',v=>{
      const before=knownFeatureCount();
      parseDetail(v);addOtherIfNovel(v);
      if(knownFeatureCount()===before && !state.otherDetail && !state.spontaneousDropping && v.length<12){askSymptomPrompt();return;}
      continueAfterSymptoms();
    });
    return;
  }
  addAI(`Tell me a little more. What does it feel like, and when do you tend to notice it?`);
  textComposer('Just describe it normally — for example: sore after typing, tingles at night, itchy and red…','Continue →',v=>{
    state.detail=v;parseDetail(v);addOtherIfNovel(v);
    if(!state.features.size && !state.otherDetail && !state.spontaneousDropping){askSymptomPrompt();return;}
    continueAfterSymptoms();
  });
};

/* “Something else” must be resolved, but a familiar symptom such as soreness should
   be translated into the known symptom model rather than echoed as an unexplained extra. */
clarifyOther=function(){
  setProgress(33);
  addAI(`What else are you noticing? Just describe it normally.`);
  textComposer('For example: soreness, clicking, cramping, tenderness, a lump, warmth…','Continue →',v=>{
    const before=new Set(state.features);
    parseDetail(v);
    if(!knownSymptomPhrase(v) || state.features.size===before.size) state.otherDetail=v;
    else state.otherDetail='';
    clarifySpontaneousDropping(()=>{
      const sx=symptomSummary();
      addAI(sx?`Got it — ${sx}. Let’s pin down where you feel it most.`:`Got it. Let’s pin down where you feel it most.`);
      askLocation(false);
    });
  });
};

askUseMechanism=function(){
  setProgress(66);
  addAI(`When it comes on during ${activityContext()}, what are you usually doing with that hand right before you notice it?`);
  textComposer('For example: holding the phone, scrolling/texting, typing, using the mouse, resting my wrist on the desk…','Continue →',v=>{
    state.triggerDetail=v;
    parseDetail(v);
    const detail=cleanConsumerPhrase(v);
    addAI(`That helps${detail?` — especially ${detail}`:''}. About how long are you usually doing that before you notice the hand bothering you?`);
    askUseLatency(false);
  });
};

/* Allow the preceding answer to carry directly into timing instead of generating
   another detached Keneflex bubble. */
const _askUseLatency=askUseLatency;
askUseLatency=function(announce=true){
  setProgress(69);
  if(announce)addAI(`About how long are you usually doing that before you notice the hand bothering you?`);
  oneSelect('When does it start?','An estimate is enough.',[
    {value:'quick',label:'Pretty quickly / within a few minutes'},
    {value:'10-30',label:'Usually after about 10–30 minutes'},
    {value:'30-60',label:'Usually after 30–60 minutes'},
    {value:'longer',label:'Usually after an hour or more'},
    {value:'unsure',label:'I’m not sure'}
  ],v=>{state.triggerLatency=v;askOtherTimes()});
};

/* If the consumer already disclosed a meaningful change in grip reliability, do not
   make them rediscover that fact in a later checklist. Resolve it at the safety gate. */
const _askSafetyBroadPolish=askSafetyBroad;
askSafetyBroad=function(){
  if(state.gripConcern==='changing'){
    setProgress(90);
    addAI(`Earlier you said the dropping is new or the hand feels weaker, numb, or less reliable. Before I recommend a product, I need one more check on how much function has changed.`);
    clarifyGripFunction('changing');
    return;
  }
  _askSafetyBroadPolish();
};

showEnough=function(){
  setProgress(100);addAI(`Okay — I have enough to tell you where I’d start.`);
  const summary=document.createElement('div');summary.className='card enough';summary.style.marginTop='12px';
  const location=[...state.location].join(' + ')||'hand/wrist';
  const detail=state.triggerDetail?` You notice it especially when ${state.triggerDetail}.`:'';
  const relief=state.relief==='quick'?' It settles fairly quickly when you stop or change what you’re doing.':state.relief==='no'?' It tends to linger even after you stop.':'';
  const grip=state.gripConcern?` I’m also keeping the occasional dropping in the follow-up plan.`:'';
  summary.innerHTML=`<h2>Here’s what I’m hearing.</h2><p>The ${location} is bothering you mainly around ${activityContext()}.${detail}${relief} Your goal is to keep doing ${state.activity||'your normal activities'} without this getting in the way.${grip}</p><div class="row"><button id="seePlan" class="primary">Show me what you’d do →</button></div>`;
  interaction.replaceWith(summary);document.getElementById('seePlan').onclick=showSolution;
};
