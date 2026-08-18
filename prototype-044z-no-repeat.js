/* Keneflex 0.4.4Z — no-repeat story memory hardening.
   Founder-QA fix: preserve specific facts already stated in the opening story and
   prevent later scripted branches from making the consumer repeat them. */
(function(){
  const priorParse=typeof parseDetail==='function'?parseDetail:null;
  const priorAddAI=typeof addAI==='function'?addAI:null;
  const priorMulti=typeof multiselect==='function'?multiselect:null;
  const priorComposer=typeof textComposer==='function'?textComposer:null;
  if(!priorParse||!priorAddAI||!priorMulti||!priorComposer)return;

  function ensure(){
    state.storyFacts=state.storyFacts||{};
    state.storySensoryMap=state.storySensoryMap||new Set();
  }
  function sensoryFrom(text){
    const out=new Set();
    String(text||'').toLowerCase().split(/[.!?;]+/).forEach(c=>{
      if(!/(numb|tingl|pins\s*(?:and|&)\s*needles|burning|altered feeling|loss of feeling)/.test(c))return;
      if(/thumb/.test(c))out.add('thumb');
      if(/index|pointer|first finger/.test(c))out.add('index');
      if(/middle|second finger/.test(c))out.add('middle');
      if(/ring|third finger/.test(c))out.add('ring');
      if(/pinky|little finger|small finger/.test(c))out.add('pinky');
      if(/palm/.test(c))out.add('palm');
    });
    return out;
  }
  function mechanismFrom(text){
    const s=String(text||'').toLowerCase(),bits=[];
    if(/scroll/.test(s))bits.push('scrolling');
    if(/texting|text message|typing on (?:my )?phone/.test(s))bits.push('texting');
    if(/typ(?:e|ing)|keyboard/.test(s))bits.push('typing');
    if(/mouse/.test(s))bits.push('using the mouse');
    if(/trackpad/.test(s))bits.push('using the trackpad');
    if(/hold(?:ing)?[^.]{0,25}(?:phone|cell)|(?:phone|cell)[^.]{0,25}hold/.test(s))bits.push('holding the phone');
    return [...new Set(bits)].join(', ');
  }
  function reliefFrom(text){
    const s=String(text||'').toLowerCase();
    if(/(?:stop|stopping|rest|avoiding|reduce|reducing)[^.]{0,80}(?:subsides?|eases?|better|improves?|goes away)|(?:subsides?|eases?|better|improves?|goes away)[^.]{0,80}(?:stop|stopping|rest|avoiding|reduce|reducing)/.test(s))return 'improves when the aggravating activity is stopped or reduced';
    if(/(?:ice|cold pack)[^.]{0,45}(?:help|better|relief|ease)/.test(s))return 'cold seems to help';
    return '';
  }

  parseDetail=function(t){
    priorParse(t);ensure();
    const map=sensoryFrom(t);map.forEach(x=>state.storySensoryMap.add(x));
    if(state.storySensoryMap.size){
      state.storyFacts.sensoryMap=[...state.storySensoryMap];
      state.mskEvidence=state.mskEvidence||{};
      state.mskEvidence.sensoryMap=[...state.storySensoryMap];
    }
    const mech=mechanismFrom(t);
    if(mech){state.triggerDetail=state.triggerDetail||mech;state.storyFacts.triggerDetail=state.triggerDetail;state.triggerLatency=state.triggerLatency||'not-needed';}
    const relief=reliefFrom(t);
    if(relief){state.relief=state.relief||relief;state.storyFacts.relief=state.relief;}
  };

  function knownTiming(){
    const p=state.pattern||new Set(),out=[];
    if(p.has('morning'))out.push('worse in the morning');
    if(p.has('night'))out.push('at night');
    if(p.has('wake'))out.push('wakes you');
    if(p.has('rest'))out.push('can happen at rest');
    if(p.has('use'))out.push('during use');
    if(p.has('after'))out.push('after use');
    return out.join(', ');
  }
  function rewriteAI(html){
    let s=String(html||'');
    if(/Two quick timing details help Keneflex avoid asking them separately\./i.test(s)){
      const known=knownTiming();
      s=(known?`Keneflex already has that it is ${known}. `:'')+'Two different facts are still missing: how this problem started and how long it has been going on.';
    }
    if(/When it starts during phone or computer use, what are you doing with the hand/i.test(s)){
      s='You already told Keneflex that phone or computer use brings it on. What Keneflex does not know yet is <b>which hand action is doing most of the provoking</b> — for example scrolling, holding the phone, typing, mouse use, or trackpad use.';
    }
    if(/Anything else about when it shows up\?/i.test(s)){
      const known=knownTiming();
      s=(known?`Keneflex already has ${known}. `:'')+'Only add another timing pattern if there is something else Keneflex has not already heard.';
    }
    if(/One follow-up matters here: where do you notice the numbness/i.test(s)&&state.storySensoryMap&&state.storySensoryMap.size){
      s=`Keneflex already has the numbness/tingling location from your story: <b>${[...state.storySensoryMap].join(', ')}</b>. It will use that rather than asking you for it again.`;
    }
    return s;
  }
  addAI=function(html){priorAddAI(rewriteAI(html));};

  textComposer=function(placeholder,buttonText,cb){
    let p=placeholder;
    if(/scrolling with my thumb after 20 minutes|typing for about an hour|mouse for 30 minutes/i.test(String(placeholder||''))){
      p='For example: scrolling with my thumb, holding the phone, typing, using the mouse or trackpad…';
    }
    priorComposer(p,buttonText,cb);
  };

  multiselect=function(title,hint,opts,nextLabel,cb){
    ensure();
    const sensoryTitle=/Where do you notice it\?|Where do you notice the nerve-type feeling\?/i.test(String(title||''));
    if(sensoryTitle&&state.storySensoryMap.size){
      const map=new Set(state.storySensoryMap);
      priorAddAI(`Keneflex already has that answer from your story: <b>${[...map].join(', ')}</b>. No need to repeat it.`);
      setTimeout(()=>cb(map),0);return;
    }
    priorMulti(title,hint,opts,nextLabel,cb);
  };

  // Re-interpret the opening once under the final parser so specific sensory and
  // mechanism facts are available to every later branch before the first follow-up.
  if(state&&state.opening)parseDetail(state.opening);
  document.title='Keneflex Prototype 0.4.4Z';
  const eyebrow=document.querySelector('#intro .hero .eyebrow');
  if(eyebrow)eyebrow.textContent='Prototype 0.4.4Z • story-memory hardening';
})();
