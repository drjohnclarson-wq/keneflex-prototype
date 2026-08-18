/* Keneflex 0.4.5 — authoritative Story State + no-repeat question gate.
   Purpose: one body-part-agnostic comprehension layer owns fact extraction and
   prevents legacy question branches from asking for information already supplied. */
(function(root){
  'use strict';
  const REGIONS=['hand','wrist','thumb','finger','knee','ankle','foot','elbow','shoulder','neck','back','hip'];
  const REGION_RX={
    hand:/\bhands?\b/i,wrist:/\bwrists?\b/i,thumb:/\bthumbs?\b/i,finger:/\b(?:finger|fingers|index|pointer|middle|ring|pinky|little finger)\b/i,
    knee:/\b(?:knee|knees|kneecap|knee cap)\b/i,ankle:/\bankle\b/i,foot:/\b(?:foot|feet|heel|arch|toe|toes)\b/i,elbow:/\belbow\b/i,
    shoulder:/\bshoulder\b/i,neck:/\bneck\b/i,back:/\b(?:low back|lower back|mid back|upper back|back)\b/i,hip:/\bhip\b/i
  };
  function uniq(a){return [...new Set(a.filter(Boolean))];}
  function norm(s){return String(s||'').replace(/\s+/g,' ').trim();}
  function clauses(text){return norm(text).split(/(?<=[.!?;])\s+|\s+(?:but|however)\s+/i).filter(Boolean);}
  function duration(text){
    const s=text.toLowerCase();
    let m=s.match(/(?:for|about|around|roughly|over)\s+(\d+(?:\.\d+)?)\s*(day|days|week|weeks|month|months|year|years)/);
    if(m)return {raw:m[0],value:Number(m[1]),unit:m[2].replace(/s$/,'')};
    if(/few days/.test(s))return {raw:'a few days',value:3,unit:'day'};
    const words={one:1,two:2,three:3,four:4,five:5,six:6,eight:8,ten:10}; let w=s.match(/(?:for|about|around|roughly|over)\s+(one|two|three|four|five|six|eight|ten)\s+(day|days|week|weeks|month|months|year|years)/); if(w)return {raw:w[0],value:words[w[1]],unit:w[2].replace(/s$/,'')};
    if(/couple (?:of )?weeks/.test(s))return {raw:'a couple weeks',value:2,unit:'week'};
    let a=s.match(/(?:for|about|around|roughly|over)\s+(?:a|an)\s+(day|week|month|year)/); if(a)return {raw:a[0],value:1,unit:a[1]};
    if(/more than a month|over a month/.test(s))return {raw:'more than a month',value:1,unit:'month',atLeast:true};
    return null;
  }
  function parse(text){
    const raw=norm(text), s=raw.toLowerCase(), cs=clauses(raw);
    const f={raw,regions:[],side:null,locations:[],symptoms:[],qualities:[],triggers:[],relievers:[],patterns:[],functionEffects:[],onset:null,duration:null,trauma:null,negatives:[],providerInstructions:[],tried:[],sensoryMap:[],uncertainties:[]};
    for(const r of REGIONS)if(REGION_RX[r].test(s))f.regions.push(r); if((f.regions.includes('thumb')||f.regions.includes('finger'))&&!f.regions.includes('hand'))f.regions.push('hand');
    if(/\bleft\b/.test(s))f.side='left'; if(/\bright\b/.test(s))f.side=f.side==='left'?'both':'right'; if(/\bboth\b|bilateral/.test(s))f.side='both';
    const locPatterns=[['under kneecap',/under (?:my |the )?(?:(?:left|right) )?(?:knee\s*cap|kneecap)|(?:pain|ache|sharp|dull)[^.!?]{0,25}under (?:my |the )?(?:(?:left|right) )?(?:knee\s*cap|kneecap)/i],['front of knee',/(?:front of (?:my |the )?(?:(?:left|right) )?knee|(?:my |the )?(?:(?:left|right) )?knee[^.!?]{0,12}front)/i],['inside knee',/(?:inside|medial) (?:of )?(?:my |the )?knee/i],['outside knee',/(?:outside|lateral) (?:of )?(?:my |the )?knee/i],['thumb side of wrist',/(?:thumb[- ]side (?:of )?(?:my |the )?wrist|thumb side[^.!?]{0,18}wrist|radial (?:side of )?wrist)/i],['pinky side of wrist',/(?:pinky|little finger)[- ]side (?:of )?(?:my |the )?wrist|wrist[^.!?]{0,15}(?:pinky|little finger) side|ulnar (?:side of )?wrist/i],['base of thumb',/(?:base of (?:my |the )?(?:(?:left|right) )?thumb|(?:my |the )?(?:(?:left|right) )?thumb[^.!?]{0,15}base)/i],['palm',/\bpalm\b/i],['heel',/\bheel\b/i],['arch',/\barch\b/i]];
    locPatterns.forEach(([k,rx])=>{if(rx.test(raw))f.locations.push(k)});
    const symptomMap=[['pain',/\b(?:pain|hurt|hurts|ache|aches|aching|sore|soreness|tender)\b/i],['numbness',/\bnumb(?:ness)?\b/i],['tingling',/\btingl(?:e|es|ing)|pins and needles\b/i],['swelling',/\b(?:swelling|swollen|swelled|swell|swells)\b/i],['stiffness',/\bstiff(?:ness)?\b/i],['weakness',/\bweak(?:ness|er)?\b/i],['redness',/\bred(?:ness)?\b/i],['warmth',/\b(?:hot|warmth|warm)\b/i],['clicking',/\b(?:click|clicking|catching|locking|snapping)\b/i]];
    symptomMap.forEach(([k,rx])=>{if(rx.test(raw))f.symptoms.push(k)});
    const qs=[['sharp',/\bsharp\b/i],['dull',/\bdull\b/i],['burning',/\bburn(?:ing)?\b/i],['throbbing',/\bthrobb(?:ing)?\b/i],['aching',/\bach(?:e|ing)\b/i]];qs.forEach(([k,rx])=>{if(rx.test(raw))f.qualities.push(k)});
    const trig=[['stairs',/\bstairs?|steps?\b/i],['down stairs',/(?:down|descending|go(?:ing)? down|come down|coming down) (?:the )?(?:stairs?|steps?)|(?:downstairs)\b/i],['up stairs',/(?:up|ascending|climb(?:ing)?) (?:the )?(?:stairs?|steps?)/i],['phone',/\b(?:phone|cell phone|cellphone|smartphone)\b/i],['scrolling',/\bscroll(?:ing)?\b/i],['computer',/\bcomputer\b/i],['typing',/\btyp(?:e|ing)|keyboard\b/i],['mouse',/\bmouse\b/i],['gripping',/\bgrip(?:ping)?\b/i],['twisting',/\btwist(?:ing)?\b/i],['pickleball',/\bpickleball\b/i],['running',/\b(?:run|runs|running)\b/i],['walking',/\bwalk(?:ing)?\b/i],['squatting',/\bsquat(?:s|ting)?\b/i],['lifting',/\blift(?:ing)?\b/i]];
    trig.forEach(([k,rx])=>{if(rx.test(raw))f.triggers.push(k)});
    if(/\bmornings?\b|first thing/i.test(raw))f.patterns.push('morning'); if(/\bnight\b|nighttime|wakes? me/i.test(raw))f.patterns.push('night'); if(/during the day|daytime/i.test(raw))f.patterns.push('daytime'); if(/comes? and goes?|from time to time|sometimes/i.test(raw))f.patterns.push('intermittent'); if(/at rest|while resting/i.test(raw))f.patterns.push('rest');
    if(/(?:gets?|feels?|is) better|improves?|subsides?|eases?|goes away|relief/i.test(raw)){
      if(/(?:stop|stopping|rest|avoid|avoiding|not using|take a break)[^.]{0,120}(?:better|improv|subsid|ease|goes away)|(?:better|improv|subsid|ease|goes away)[^.]{0,120}(?:stop|rest|avoid|not using|break)/i.test(raw))f.relievers.push('stopping/reducing provoking activity');
      if(/after (?:an?|about )?hour|after \d+ (?:minutes?|hours?)/i.test(raw))f.relievers.push('time after waking/activity');
      if(/ice|cold pack/i.test(raw))f.relievers.push('cold');
    }
    if(/hard to (?:put )?weight|hard to bear weight|can'?t bear weight|difficult to (?:put )?weight/i.test(raw))f.functionEffects.push('weight bearing difficult');
    if(/drop(?:ping)? things?/i.test(raw))f.functionEffects.push('dropping objects');
    if(/hard to grip|grip is weak|weaker grip/i.test(raw))f.functionEffects.push('grip difficulty');
    if(/built up|builds up|gradual|gradually|over time|no (?:specific |particular )?injury|no fall|not sure (?:when|how) it started/i.test(raw)){f.onset='gradual/insidious';f.trauma='no specific injury stated';}
    if(/after (?:a )?(?:fall|hit|twist|injury|accident)|\bfell\b|\bhit my\b|\brolled my\b|sudden twist|hurt my [^.!?]{0,40}yesterday/i.test(raw)){f.onset='specific event';f.trauma='specific injury';}
    f.duration=duration(raw);
    for(const c of cs){
      const lc=c.toLowerCase();
      if(/\bno\b|\bwithout\b|don'?t have|do not have|doesn'?t feel|does not feel|never/.test(lc)){
        if(/numb/.test(lc))f.negatives.push('numbness'); if(/tingl/.test(lc))f.negatives.push('tingling'); if(/swell/.test(lc))f.negatives.push('swelling'); if(/weak/.test(lc))f.negatives.push('weakness'); if(/injury|fall|hit|twist|trauma/.test(lc))f.negatives.push('specific injury');
      }
    }
    f.symptoms=f.symptoms.filter(x=>!f.negatives.includes(x));
    const sensoryClauses=cs.filter((c,i)=>{const prev=i?cs[i-1]:'';return (/numb|tingl|pins and needles/i.test(c)||(/thumb|index|pointer|middle|ring|pinky|little finger/i.test(c)&&/numb|tingl|pins and needles/i.test(prev)))&&!/\bno\b|without|don'?t have|do not have/i.test(c)});
    sensoryClauses.forEach(c=>{if(/thumb/i.test(c))f.sensoryMap.push('thumb');if(/index|pointer|first finger/i.test(c))f.sensoryMap.push('index');if(/middle|second finger/i.test(c))f.sensoryMap.push('middle');if(/ring|third finger/i.test(c))f.sensoryMap.push('ring');if(/pinky|little finger|small finger/i.test(c))f.sensoryMap.push('pinky');if(/palm/i.test(c))f.sensoryMap.push('palm');});
    const provider=/\b(?:doctor|physician|chiropractor|physical therapist|pt|occupational therapist|ot|provider)\b[^.!?]{0,120}\b(?:told|said|recommended|instructed|asked)\b[^.!?]*/ig; let pm; while((pm=provider.exec(raw)))f.providerInstructions.push(pm[0]);
    const triedRx=/\b(?:tried|using|used|wearing|wore|take|taking)\b[^.!?]{0,90}/ig;let tm;while((tm=triedRx.exec(raw)))f.tried.push(tm[0]);
    ['regions','locations','symptoms','qualities','triggers','relievers','patterns','functionEffects','negatives','providerInstructions','tried','sensoryMap'].forEach(k=>f[k]=uniq(f[k]));
    return f;
  }
  function known(f,concept){
    switch(concept){
      case 'where': return !!(f.regions.length||f.locations.length);
      case 'side': return !!f.side;
      case 'symptom': return !!(f.symptoms.length||f.qualities.length);
      case 'quality': return !!f.qualities.length;
      case 'timing': return !!f.patterns.length;
      case 'start': return !!f.onset;
      case 'duration': return !!f.duration;
      case 'trigger': return !!f.triggers.length;
      case 'relief': return !!f.relievers.length;
      case 'sensoryMap': return !!f.sensoryMap.length;
      case 'provider': return !!f.providerInstructions.length;
      case 'function': return !!f.functionEffects.length;
      default:return false;
    }
  }
  function questionConcept(q){
    q=String(q||'').toLowerCase();
    if(/which side|left or right/.test(q))return 'side';
    if(/where do you feel|where.*bother|where.*pain|place it precisely/.test(q))return 'where';
    if(/what does it feel like|what are you noticing|which.*closest.*(?:pain|symptom)/.test(q))return 'symptom';
    if(/how did it start|build up|specific injury/.test(q))return 'start';
    if(/how long has|how long\?|duration/.test(q))return 'duration';
    if(/when.*show|when.*notice|anything else about when|timing pattern/.test(q))return 'timing';
    if(/what are you doing with the hand|what.*bring.*on|which actions|motion tends to reproduce/.test(q))return 'trigger';
    if(/what makes.*better|what helps|reliev/.test(q))return 'relief';
    if(/where do you notice.*(?:numb|tingl|nerve-type|altered feeling)/.test(q))return 'sensoryMap';
    return null;
  }
  function missingRank(f){
    const r=[];
    if(!known(f,'where'))r.push({concept:'where',score:100});
    if(!known(f,'side'))r.push({concept:'side',score:90});
    if(!known(f,'symptom'))r.push({concept:'symptom',score:85});
    if(!known(f,'start'))r.push({concept:'start',score:80});
    if(!known(f,'duration'))r.push({concept:'duration',score:75});
    if(!known(f,'trigger'))r.push({concept:'trigger',score:70});
    if(!known(f,'timing'))r.push({concept:'timing',score:60});
    if((f.symptoms.includes('numbness')||f.symptoms.includes('tingling'))&&!known(f,'sensoryMap'))r.push({concept:'sensoryMap',score:88});
    return r.sort((a,b)=>b.score-a.score);
  }
  function summary(f){
    const bits=[];
    if(f.side||f.regions.length||f.locations.length)bits.push([f.side,[...f.locations,...f.regions].join(' + ')].filter(Boolean).join(' '));
    if(f.qualities.length||f.symptoms.length)bits.push(uniq([...f.qualities,...f.symptoms]).join(', '));
    if(f.triggers.length)bits.push('connected with '+f.triggers.join(', '));
    if(f.patterns.length)bits.push(f.patterns.join(', '));
    if(f.duration)bits.push(f.duration.raw);
    if(f.relievers.length)bits.push('improves with '+f.relievers.join(', '));
    if(f.functionEffects.length)bits.push(f.functionEffects.join(', '));
    return bits;
  }
  const API={parse,known,questionConcept,missingRank,summary}; root.KFXStoryEngine=API;
  if(typeof window==='undefined'||!root.document||typeof root.state==='undefined')return;
  function refresh(extra){
    state.storyTranscript=[state.storyTranscript,extra].filter(Boolean).join('. ');
    state.storyModel=parse([state.opening,state.detail,state.storyTranscript].filter(Boolean).join('. '));
    const f=state.storyModel;
    if(f.side)state.side=f.side;
    state.location=state.location||new Set();
    if(f.regions.includes('wrist'))state.location.add('wrist'); if(f.regions.includes('thumb'))state.location.add('thumb'); if(f.regions.includes('finger'))state.location.add('fingers'); if(f.regions.includes('hand'))state.region='hand';
    if((f.regions.includes('wrist')||f.regions.includes('thumb')||f.regions.includes('finger'))&&!state.region)state.region='hand';
    state.features=state.features||new Set(); f.symptoms.forEach(x=>{if(x==='pain')state.features.add('pain');if(x==='swelling')state.features.add('swelling');if(x==='stiffness')state.features.add('stiff');if(x==='numbness'||x==='tingling')state.features.add('neuro');if(x==='weakness')state.features.add('weakness');});
    if(f.duration&&!state.duration){const d=f.duration;if(d.unit==='day'&&d.value<=7)state.duration='days';else if(d.unit==='week'&&d.value<=2)state.duration='1-2w';else if(d.unit==='week'&&d.value<=4)state.duration='3w';else state.duration='month';}
    if(f.onset&&!state.trauma)state.trauma=f.onset==='specific event'?'trauma':'gradual';
    state.pattern=state.pattern||new Set(); f.patterns.forEach(x=>state.pattern.add(x));
    if(f.triggers.length&&!state.triggerSummary)state.triggerSummary=f.triggers.join(', ');
    if(f.sensoryMap.length){state.storySensoryMap=new Set(f.sensoryMap);state.mskEvidence=state.mskEvidence||{};state.mskEvidence.sensoryMap=f.sensoryMap.slice();}
    if(f.relievers.length&&!state.relief)state.relief=f.relievers.join('; ');
    return f;
  }
  const priorParse=typeof root.parseDetail==='function'?root.parseDetail:null;
  if(priorParse)root.parseDetail=function(t){priorParse(t);refresh(t);};
  const priorOne=typeof root.oneSelect==='function'?root.oneSelect:null;
  if(priorOne)root.oneSelect=function(title,hint,opts,cb){
    const f=refresh(''), c=questionConcept(title+' '+hint); let v=null;
    if(c&&known(f,c)){if(c==='side')v=f.side;if(c==='start')v=f.onset==='specific event'?'trauma':'gradual';if(c==='duration'&&state.duration)v=state.duration;}
    if(v&&opts.some(o=>o.value===v)){setTimeout(()=>cb(v),0);return;} priorOne(title,hint,opts,cb);
  };
  const priorMulti=typeof root.multiselect==='function'?root.multiselect:null;
  if(priorMulti)root.multiselect=function(title,hint,opts,nextLabel,cb){
    const f=refresh(''), c=questionConcept(title+' '+hint);
    if(c==='sensoryMap'&&f.sensoryMap.length){setTimeout(()=>cb(new Set(f.sensoryMap)),0);return;}
    priorMulti(title,hint,opts,nextLabel,cb);
  };
  root.askDetail=function(){
    const f=refresh(state.opening||''); if(typeof setProgress==='function')setProgress(18); const missing=missingRank(f);
    if(known(f,'where')&&known(f,'symptom')&&(known(f,'trigger')||known(f,'timing')||known(f,'duration'))){
      if(typeof addAI==='function')addAI('<b>Keneflex has the important parts of your story.</b> It will only ask about details that could still change safety or the plan.');
      if(!known(f,'duration')&&typeof root.askDuration==='function'){root.askDuration();return;}
      if(typeof root.askSafetyBroad==='function'){root.askSafetyBroad();return;}
      if(typeof root.askSafety==='function'){root.askSafety();return;}
    }
    if(typeof addAI==='function')addAI('Keneflex has part of the picture. Add the one or two details you know that are still missing — you do not need medical words.');
    const concept=missing[0]&&missing[0].concept;
    const ph={where:'Where exactly is it bothering you?',side:'Which side?',symptom:'What does it feel like?',start:'Did it build up or follow a specific injury?',duration:'About how long has it been going on?',trigger:'What tends to bring it on?',timing:'When do you notice it most?',sensoryMap:'Which fingers or part of the hand feel numb or tingly?'}[concept]||'What else seems important?';
    if(typeof root.textComposer==='function')root.textComposer(ph,'Continue →',function(v){state.detail=[state.detail,v].filter(Boolean).join('. ');refresh(v);root.askDetail();});
  };
  if(state.opening)refresh(state.opening);
  try{document.title='Keneflex Prototype 0.4.5'; const e=document.querySelector('#intro .hero .eyebrow');if(e)e.textContent='Prototype 0.4.5 • Story State engine';}catch(e){}
})(typeof window!=='undefined'?window:globalThis);
