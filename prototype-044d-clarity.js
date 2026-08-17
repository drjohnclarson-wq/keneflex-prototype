/* Keneflex 0.4.4d — Answer Sufficiency Gate
   A consumer answer should not merely advance the questionnaire. Keneflex first
   decides whether the answer resolves the thread it asked about. If not, it asks
   one natural clarification before moving on. */

function kfxClean(v){return (v||'').trim().replace(/[.?!]+$/,'');}
function kfxMechanismIsVague(v){
  const s=kfxClean(v).toLowerCase();
  if(!s) return true;
  if(/^(sometimes|it varies|varies|not sure|i'?m not sure|depends|same|usual|normally|just using it|using it|working|phone|computer|typing)$/.test(s)) return true;
  /* A useful mechanism usually contains an action, position, tool, or grip detail. */
  const useful=/hold|holding|scroll|text|type|typing|keyboard|mouse|trackpad|grip|gripping|rest|resting|bend|bending|twist|lift|lifting|weight|press|push|pull|carry|carrying|position|desk|thumb|finger|wrist|phone in|one hand|two hand/;
  return s.length<14 && !useful.test(s);
}

function kfxAskMechanismClarification(first,done){
  const firstClean=kfxClean(first);
  addAI(firstClean?`Got it. When you say “${firstClean},” what is your hand actually doing at that point?`:`What is your hand actually doing right before you notice it?`);
  textComposer('For example: holding the phone in one hand, scrolling with my thumb, typing, using the mouse, resting my wrist on the desk…','Continue →',v=>{
    const clean=kfxClean(v);
    /* Do not trap the consumer in a loop. One clarification is enough for P0; if it
       remains vague, preserve it honestly and continue. */
    done(clean||firstClean||'using the hand');
  });
}

askUseMechanism=function(){
  setProgress(66);
  addAI(`When it comes on during ${activityContext()}, what are you usually doing with that hand right before you notice it?`);
  textComposer('For example: holding the phone, scrolling/texting, typing, using the mouse, resting my wrist on the desk…','Continue →',v=>{
    const finish=(detail)=>{
      state.triggerDetail=detail;
      parseDetail(detail);
      addAI(`That helps${detail?` — especially ${detail}`:''}. About how long are you usually doing that before you notice the hand bothering you?`);
      askUseLatency(false);
    };
    if(kfxMechanismIsVague(v)){
      kfxAskMechanismClarification(v,finish);
      return;
    }
    finish(kfxClean(v));
  });
};

/* Keep summaries natural: low-concern occasional dropping was clarified and should
   not be reintroduced as though it remains an active problem. */
showEnough=function(){
  setProgress(100);addAI(`Okay — I have enough to tell you where I’d start.`);
  const summary=document.createElement('div');summary.className='card enough';summary.style.marginTop='12px';
  const locLabels={thumb:'thumb/base of thumb',fingers:'fingers',palm:'palm',back:'back of the hand',wrist:'wrist',pinky:'pinky-side of the hand/wrist',diffuse:'hand in several areas'};
  const location=[...state.location].map(x=>locLabels[x]||x).join(' and ')||'hand/wrist';
  const detail=state.triggerDetail?` You notice it especially when ${state.triggerDetail}.`:'';
  const relief=state.relief==='quick'?' It settles fairly quickly when you stop or change what you’re doing.':state.relief==='gradual'?' It settles after you stop, but takes a while.':state.relief==='no'?' It tends to linger even after you stop.':'';
  const grip=state.gripConcern==='changing'?` I’m also accounting for the change in grip reliability in what I tell you next.`:'';
  summary.innerHTML=`<h2>Here’s what I’m hearing.</h2><p>The ${location} is bothering you mainly around ${activityContext()}.${detail}${relief} Your goal is to keep doing ${state.activity||'your normal activities'} without this getting in the way.${grip}</p><div class="row"><button id="seePlan" class="primary">Show me what you’d do →</button></div>`;
  interaction.replaceWith(summary);document.getElementById('seePlan').onclick=showSolution;
};
