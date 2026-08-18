/* Keneflex 0.4.5A — browser integration for Story State.
   Loaded after the pure parser. Uses the shared classic-script lexical `state`.
*/
(function(){
  if(typeof KFXStoryEngine==='undefined'||typeof state==='undefined')return;
  const E=KFXStoryEngine;
  function refresh(extra){
    state.storyTranscript=[state.storyTranscript,extra].filter(Boolean).join('. ');
    const f=E.parse([state.opening,state.detail,state.storyTranscript].filter(Boolean).join('. '));
    state.storyModel=f;
    if(f.side)state.side=f.side;
    state.location=state.location||new Set();
    if(f.regions.includes('wrist'))state.location.add('wrist');
    if(f.regions.includes('thumb'))state.location.add('thumb');
    if(f.regions.includes('finger'))state.location.add('fingers');
    if(f.regions.includes('hand')||f.regions.includes('wrist')||f.regions.includes('thumb')||f.regions.includes('finger'))state.region='hand';
    state.features=state.features||new Set();
    f.symptoms.forEach(x=>{if(x==='pain')state.features.add('pain');if(x==='swelling')state.features.add('swelling');if(x==='stiffness')state.features.add('stiff');if(x==='numbness'||x==='tingling')state.features.add('neuro');if(x==='weakness')state.features.add('weakness');});
    if(f.duration&&!state.duration){const d=f.duration;if(d.unit==='day'&&d.value<=7)state.duration='days';else if(d.unit==='week'&&d.value<=2)state.duration='1-2w';else if(d.unit==='week'&&d.value<=4)state.duration='3w';else state.duration='month';}
    if(f.onset&&!state.trauma)state.trauma=f.onset==='specific event'?'trauma':'gradual';
    state.pattern=state.pattern||new Set();f.patterns.forEach(x=>state.pattern.add(x));
    if(f.triggers.length&&!state.triggerSummary)state.triggerSummary=f.triggers.join(', ');
    if(f.sensoryMap.length){state.storySensoryMap=new Set(f.sensoryMap);state.mskEvidence=state.mskEvidence||{};state.mskEvidence.sensoryMap=f.sensoryMap.slice();}
    if(f.relievers.length&&!state.relief)state.relief=f.relievers.join('; ');
    if(f.providerInstructions.length){state.providerInstructionText=state.providerInstructionText||f.providerInstructions.join(' ');state.hasProviderInstruction=true;}
    return f;
  }
  const oldParse=parseDetail;
  parseDetail=function(t){oldParse(t);refresh(t);};
  const oldOne=oneSelect;
  oneSelect=function(title,hint,opts,cb){
    const f=refresh(''),c=E.questionConcept(title+' '+hint);let v=null;
    if(c==='side'&&f.side)v=f.side;
    if(c==='start'&&f.onset)v=f.onset==='specific event'?'trauma':'gradual';
    if(c==='duration'&&state.duration)v=state.duration;
    if(v&&opts.some(o=>o.value===v)){setTimeout(()=>cb(v),0);return;}
    oldOne(title,hint,opts,cb);
  };
  const oldMulti=multiselect;
  multiselect=function(title,hint,opts,nextLabel,cb){
    const f=refresh(''),c=E.questionConcept(title+' '+hint);
    if(c==='sensoryMap'&&f.sensoryMap.length){setTimeout(()=>cb(new Set(f.sensoryMap)),0);return;}
    oldMulti(title,hint,opts,nextLabel,cb);
  };
  askDetail=function(){
    const f=refresh(state.opening||'');
    setProgress(18);
    const rich=E.known(f,'where')&&E.known(f,'symptom')&&(E.known(f,'trigger')||E.known(f,'timing')||E.known(f,'duration'));
    if(rich){
      addAI('<b>Keneflex has the important parts of your story.</b> It will only ask about details that could still change safety or the plan.');
      if(!E.known(f,'duration')&&typeof askDuration==='function'){askDuration();return;}
      if(typeof askSafetyBroad==='function'){askSafetyBroad();return;}
      if(typeof askSafety==='function'){askSafety();return;}
    }
    const missing=E.missingRank(f),concept=missing[0]&&missing[0].concept;
    const prompt={where:'Where exactly is it bothering you?',side:'Which side?',symptom:'What does it feel like?',start:'Did it build up or follow a specific injury?',duration:'About how long has it been going on?',trigger:'What tends to bring it on?',timing:'When do you notice it most?',sensoryMap:'Which fingers or part of the hand feel numb or tingly?'}[concept]||'What else seems important?';
    addAI('Keneflex has part of the picture. Add the most important detail that is still missing — normal words are fine.');
    textComposer(prompt,'Continue →',v=>{state.detail=[state.detail,v].filter(Boolean).join('. ');refresh(v);askDetail();});
  };
  const oldAI=addAI;
  addAI=function(html){
    const f=refresh(''),c=E.questionConcept(String(html||''));
    if(c&&E.known(f,c)){
      const clarifies=/precis|which part|which action|new|worsen|more frequent|different|else/i.test(String(html||''));
      if(!clarifies)return;
    }
    oldAI(html);
  };
  refresh(state.opening||'');
  document.title='Keneflex Prototype 0.4.5A';
  const e=document.querySelector('#intro .hero .eyebrow');if(e)e.textContent='Prototype 0.4.5A • 50-story regression build';
})();
