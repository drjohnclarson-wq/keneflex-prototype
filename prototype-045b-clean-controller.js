/* Keneflex Prototype 0.4.5B — canonical story-state + conversation controller.
   Loaded LAST. This layer owns consumer truth, problem threads, contradiction/supersession,
   next-best-question selection, and the KNOWN != ASKABLE gate. Legacy modules remain as
   downstream safety/product/plan services only. */
(function(root){
'use strict';

const REGION_RX={
 hand:/\bhands?\b/i,wrist:/\bwrists?\b/i,thumb:/\bthumbs?\b/i,finger:/\b(?:finger|fingers|index|pointer|middle|ring|pinky|little finger)\b/i,
 knee:/\b(?:knee|knees|kneecap|knee cap)\b/i,ankle:/\bankles?\b/i,foot:/\b(?:foot|feet|heel|arch|toe|toes)\b/i,
 elbow:/\belbows?\b/i,shoulder:/\bshoulders?\b/i,neck:/\bneck\b/i,back:/\b(?:low back|lower back|mid back|upper back|back)\b/i,hip:/\bhips?\b/i
};
const NUMWORDS={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12};
const STATUS={PRESENT:'present',DENIED:'denied',UNCERTAIN:'uncertain',UNKNOWN:'unknown'};
function norm(v){return String(v||'').replace(/[’]/g,"'").replace(/\s+/g,' ').trim();}
function uniq(a){return [...new Set((a||[]).filter(Boolean))];}
function clauses(t){const base=norm(t).split(/(?<=[.!?;])\s+|\s+(?:but|however|although|except)\s+/i).filter(Boolean);const out=[];base.forEach(c=>{if(/\bleft\b/i.test(c)&&/\bright\b/i.test(c)&&Object.values(REGION_RX).filter(rx=>rx.test(c)).length>1){c.split(/\s+and\s+(?=(?:my\s+)?(?:left|right|both)\b)/i).forEach(x=>out.push(x));}else out.push(c);});return out;}
function correctionCue(t){return /\b(?:actually|sorry|correction|i meant|rather|not .* after all|i was wrong|to clarify)\b/i.test(t);}
function uncertaintyCue(t){return /\b(?:maybe|perhaps|not sure|unsure|i think|hard to tell|can't tell|cannot tell)\b/i.test(t);}
function denied(c,rx){const m=c.match(rx);if(!m)return false;const b=c.slice(Math.max(0,(m.index||0)-70),m.index||0);return /(?:\bno\b|\bnot\b|\bnever\b|\bwithout\b|don't|do not|doesn't|does not|didn't|did not|haven't|have not|hasn't|has not)\b[^.!?;]{0,55}$/i.test(b)||/^\s*no\b/i.test(c);}
function sideFrom(c){let l=/\bleft\b/i.test(c),r=/\bright\b/i.test(c);if(/\bboth\b|bilateral/i.test(c))return 'both';if(l&&r)return 'both';return l?'left':r?'right':null;}
function regionsFrom(c){const out=[];let scrub=String(c);const radialWrist=/\bwrist\b[^.!?]{0,45}\bthumb side\b|\bthumb[- ]side\b[^.!?]{0,30}\bwrist\b/i.test(scrub);if(radialWrist)scrub=scrub.replace(/\bthumb\b/ig,'radial');scrub=scrub.replace(/thumb[- ]side (?:of )?(?:my |the )?wrist|(?:on|along) the thumb side (?:of )?(?:my |the )?wrist/ig,'wrist');Object.entries(REGION_RX).forEach(([k,rx])=>{if(rx.test(scrub))out.push(k)});if((out.includes('thumb')||out.includes('finger'))&&!out.includes('hand'))out.push('hand');return uniq(out);}
function durationFrom(t){const s=norm(t).toLowerCase();let m=s.match(/(?:for|about|around|roughly|over|nearly|almost)?\s*(\d+(?:\.\d+)?)\s*(day|days|week|weeks|month|months|year|years)\b/);if(m)return {value:+m[1],unit:m[2].replace(/s$/,''),raw:m[0].trim()};m=s.match(/(?:for|about|around|roughly|over)?\s*(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s*(day|days|week|weeks|month|months|year|years)\b/);if(m)return {value:NUMWORDS[m[1]],unit:m[2].replace(/s$/,''),raw:m[0].trim()};if(/\bfew days\b/.test(s))return {value:3,unit:'day',raw:'a few days'};if(/\bcouple (?:of )?weeks\b/.test(s))return {value:2,unit:'week',raw:'a couple weeks'};if(/\bsince yesterday\b|\byesterday\b/.test(s))return {value:1,unit:'day',raw:'since yesterday'};return null;}
function parseTurn(text){
 const raw=norm(text), cs=clauses(raw), out={raw,clauses:[],provider:[],owned:[],correction:correctionCue(raw)};
 cs.forEach(c=>{
   const regs=regionsFrom(c),side=sideFrom(c),f={raw:c,regions:regs,side,locations:[],symptoms:[],qualities:[],triggers:[],patterns:[],relievers:[],functionEffects:[],sensory:[],negatives:[],onset:null,duration:durationFrom(c),uncertain:uncertaintyCue(c)};
   const loc=[['under kneecap',/under (?:my |the )?(?:left |right )?(?:kneecap|knee cap)/i],['front of knee',/front of (?:my |the )?(?:left |right )?knee/i],['inside knee',/(?:inside|medial)(?: side)? (?:of )?(?:my |the )?knee/i],['outside knee',/(?:outside|lateral)(?: side)? (?:of )?(?:my |the )?knee/i],['thumb side of wrist',/(?:thumb[- ]side (?:of )?(?:my |the )?wrist|(?:on|along) the thumb side(?: (?:of )?(?:my |the )?wrist)?|wrist[^.!?]{0,45}thumb side|radial (?:side of )?wrist)/i],['pinky side of wrist',/(?:pinky|little finger)[- ]side (?:of )?(?:my |the )?wrist|ulnar (?:side of )?wrist/i],['base of thumb',/base of (?:my |the )?(?:left |right )?thumb/i],['palm',/\bpalm\b/i],['heel',/\bheel\b/i],['arch',/\barch\b/i]];loc.forEach(([k,rx])=>{if(rx.test(c))f.locations.push(k)});
   const sx=[['pain',/\b(?:pain|painful|hurt|hurts|ache|aches|aching|sore|soreness|tender|tenderness)\b/i],['numbness',/\bnumb(?:ness)?\b/i],['tingling',/\b(?:tingle|tingles|tingling|pins and needles)\b/i],['swelling',/\b(?:swelling|swollen|swell|swells)\b/i],['stiffness',/\bstiff(?:ness)?\b/i],['weakness',/\bweak(?:ness|er)?\b/i],['redness',/\bred(?:ness)?\b/i],['warmth',/\b(?:hot|warm|warmth)\b/i],['wound',/\b(?:cut|wound|open skin|burn)\b/i]];
   sx.forEach(([k,rx])=>{if(rx.test(c)){if(denied(c,rx))f.negatives.push(k);else f.symptoms.push(k)}});
   [['sharp',/\bsharp\b/i],['dull',/\bdull\b/i],['burning',/\bburning\b/i],['throbbing',/\bthrobbing\b/i],['aching',/\baching\b/i]].forEach(([k,rx])=>{if(rx.test(c))f.qualities.push(k)});
   [['stairs',/\bstairs?|steps?\b/i],['down stairs',/(?:down|descending|going down|coming down) (?:the )?(?:stairs?|steps?)|\bdownstairs\b/i],['up stairs',/(?:up|ascending|climbing) (?:the )?(?:stairs?|steps?)/i],['phone',/\b(?:phone|cellphone|smartphone)\b/i],['scrolling',/\bscroll(?:ing)?\b/i],['computer',/\b(?:computer|laptop|desktop)\b/i],['typing',/\b(?:typing|type|keyboard)\b/i],['mouse',/\bmouse\b/i],['gripping',/\bgrip(?:ping)?\b/i],['twisting',/\btwist(?:ing)?\b/i],['pickleball',/\bpickleball\b/i],['running',/\brun(?:ning|s)?\b/i],['walking',/\bwalk(?:ing)?\b/i],['squatting',/\bsquat(?:ting|s)?\b/i],['lifting',/\blift(?:ing)?\b/i]].forEach(([k,rx])=>{if(rx.test(c))f.triggers.push(k)});
   if(/\bmornings?\b|first thing in the morning/i.test(c))f.patterns.push('morning');if(/\bnight\b|nighttime|wakes? me/i.test(c))f.patterns.push('night');if(/during the day|daytime/i.test(c))f.patterns.push('daytime');if(/comes? and goes?|sometimes|intermittent|off and on/i.test(c))f.patterns.push('intermittent');if(/at rest|while resting/i.test(c))f.patterns.push('rest');
   if(/(?:better|improves?|subsides?|eases?|goes away|relief)/i.test(c)){if(/(?:stop|rest|break|avoid|not using)/i.test(c))f.relievers.push('stopping/reducing provoking activity');if(/(?:after|within) (?:about )?(?:an? |\d+ )?(?:hour|minutes?)/i.test(c))f.relievers.push('time');if(/ice|cold pack/i.test(c))f.relievers.push('cold');}
   if(/hard to (?:put )?weight|hard to bear weight|can't bear weight|cannot bear weight|difficult to (?:put )?weight/i.test(c))f.functionEffects.push('weight bearing difficult');if(/drop(?:s|ping)? things?/i.test(c))f.functionEffects.push('dropping objects');if(/hard to grip|grip is weak|weaker grip/i.test(c))f.functionEffects.push('grip difficulty');
   if(/built up|gradual|gradually|over time|no (?:specific |particular )?injury|no fall|not sure (?:when|how) it started/i.test(c))f.onset='gradual';if(/after (?:a )?(?:fall|hit|twist|injury|accident)|\bfell\b|\brolled my\b|sudden twist/i.test(c))f.onset='specific event';
   if(/numb|tingl|pins and needles/i.test(c)&&!/\bno\b|without|don't have|do not have/i.test(c)){if(/thumb/i.test(c))f.sensory.push('thumb');if(/index|pointer|first finger/i.test(c))f.sensory.push('index');if(/middle|second finger/i.test(c))f.sensory.push('middle');if(/ring|third finger/i.test(c))f.sensory.push('ring');if(/pinky|little finger|small finger/i.test(c))f.sensory.push('pinky');if(/palm/i.test(c))f.sensory.push('palm');}
   Object.keys(f).forEach(k=>{if(Array.isArray(f[k]))f[k]=uniq(f[k])});out.clauses.push(f);
 });
 const providerRx=/\b(?:doctor|physician|provider|chiropractor|physical therapist|pt|occupational therapist|ot|surgeon)\b[^.!?]{0,140}\b(?:told|said|recommended|instructed|asked|prescribed)\b[^.!?]*/ig;let m;while((m=providerRx.exec(raw)))out.provider.push(m[0]);
 const ownRx=/\b(?:already have|already own|i own|i have|using|wearing|tried)\b[^.!?]{0,120}\b(?:brace|support|splint|wrap|ice pack|cold pack|cream|gel|tens)\b[^.!?]*/ig;while((m=ownRx.exec(raw)))out.owned.push(m[0]);
 return out;
}
function newFact(value,status,turn,source,raw){return {value,status:status||STATUS.PRESENT,turn,source:source||'consumer',raw:raw||'',active:true};}
function createStore(){return {events:[],threads:{},activeThread:null,global:{provider:[],owned:[]},turn:0};}
function threadKey(side,region){return (side||'unspecified')+':'+(region||'unspecified');}
function ensureThread(store,key,region,side){return store.threads[key]||(store.threads[key]={key,region,side,facts:{locations:[],symptoms:[],qualities:[],triggers:[],patterns:[],relievers:[],functionEffects:[],sensory:[],negatives:[]},onset:null,duration:null,history:[]});}
function supersedeScalar(th,field,fact,force){const old=th[field];if(old&&old.active&&(force||old.value!==fact.value)){old.active=false;old.supersededBy=fact.turn;}th[field]=fact;}
function addArrayFact(th,field,fact,force){const arr=th.facts[field]||(th.facts[field]=[]);if(force){arr.forEach(x=>{if(x.active&&x.value!==fact.value)x.active=false;});}const same=arr.find(x=>x.active&&x.value===fact.value&&x.status===fact.status);if(!same)arr.push(fact);}
function ingest(store,text,source){
 const turn=++store.turn,p=parseTurn(text),force=p.correction;store.events.push({turn,text:norm(text),source:source||'consumer',parsed:p});
 p.provider.forEach(x=>store.global.provider.push(newFact(x,STATUS.PRESENT,turn,source,text)));p.owned.forEach(x=>store.global.owned.push(newFact(x,STATUS.PRESENT,turn,source,text)));
 p.clauses.forEach(c=>{
   const regs=c.regions.length?c.regions:[store.activeThread&&store.threads[store.activeThread]?store.threads[store.activeThread].region:null].filter(Boolean);
   const actualRegs=regs.length?regs:['unspecified'];
   actualRegs.forEach(region=>{
     const side=c.side||(store.activeThread&&store.threads[store.activeThread]&&store.threads[store.activeThread].region===region?store.threads[store.activeThread].side:null);
     const key=threadKey(side,region),th=ensureThread(store,key,region,side);store.activeThread=key;th.history.push(turn);
     c.locations.forEach(v=>addArrayFact(th,'locations',newFact(v,STATUS.PRESENT,turn,source,c.raw),force));
     c.symptoms.forEach(v=>addArrayFact(th,'symptoms',newFact(v,c.uncertain?STATUS.UNCERTAIN:STATUS.PRESENT,turn,source,c.raw),false));
     c.negatives.forEach(v=>{addArrayFact(th,'negatives',newFact(v,STATUS.DENIED,turn,source,c.raw),false);(th.facts.symptoms||[]).forEach(x=>{if(x.active&&x.value===v)x.active=false;});});
     ['qualities','triggers','patterns','relievers','functionEffects','sensory'].forEach(field=>c[field].forEach(v=>addArrayFact(th,field,newFact(v,c.uncertain?STATUS.UNCERTAIN:STATUS.PRESENT,turn,source,c.raw),false)));
     if(c.onset)supersedeScalar(th,'onset',newFact(c.onset,c.uncertain?STATUS.UNCERTAIN:STATUS.PRESENT,turn,source,c.raw),force||!!th.onset);
     if(c.duration)supersedeScalar(th,'duration',newFact(c.duration,STATUS.PRESENT,turn,source,c.raw),force||!!th.duration);
   });
 });
 return store;
}
function activeVals(th,field){return uniq(((th&&th.facts&&th.facts[field])||[]).filter(x=>x.active&&(field==='negatives'||x.status!==STATUS.DENIED)).map(x=>x.value));}
function isKnown(th,concept){if(!th)return false;switch(concept){case'where':return th.region&&th.region!=='unspecified';case'side':return !!th.side;case'preciseLocation':return activeVals(th,'locations').length>0;case'symptom':return activeVals(th,'symptoms').length>0||activeVals(th,'qualities').length>0;case'quality':return activeVals(th,'qualities').length>0;case'start':return !!(th.onset&&th.onset.active);case'duration':return !!(th.duration&&th.duration.active);case'trigger':return activeVals(th,'triggers').length>0;case'timing':return activeVals(th,'patterns').length>0;case'relief':return activeVals(th,'relievers').length>0;case'function':return activeVals(th,'functionEffects').length>0;case'sensoryMap':return activeVals(th,'sensory').length>0;default:return false;}}
function questionConcept(q){q=norm(q).toLowerCase();if(/which side|left or right/.test(q))return'side';if(/where exactly|where do you feel|where.*pain|place it precisely/.test(q))return /thumb|wrist|knee|strongest|centered/.test(q)?'preciseLocation':'where';if(/what does it feel|what are you noticing|which.*symptom/.test(q))return'symptom';if(/how did it start|specific injury|build up/.test(q))return'start';if(/how long/.test(q))return'duration';if(/which fingers|where.*numb|where.*tingl|nerve-type feeling/.test(q))return'sensoryMap';if(/what.*doing|what.*bring.*on|which actions|motion tends to reproduce/.test(q))return'trigger';if(/when.*notice|when.*show|timing|morning|night/.test(q))return'timing';if(/what helps|what makes.*better|relief/.test(q))return'relief';if(/what.*difficult|function|weight bear|drop things/.test(q))return'function';return null;}
function activeThread(store){return store.threads[store.activeThread]||Object.values(store.threads)[0]||null;}
function candidates(store){
 const th=activeThread(store);if(!th)return[{concept:'where',score:100,why:'locate the problem'}];const sx=activeVals(th,'symptoms'),tr=activeVals(th,'triggers'),fn=activeVals(th,'functionEffects');const out=[];
 function add(c,s,w){if(!isKnown(th,c))out.push({concept:c,score:s,why:w});}
 add('where',100,'identify the problem thread');add('side',92,'separate laterality and multiple problems');add('symptom',90,'characterize the complaint');
 if((sx.includes('numbness')||sx.includes('tingling'))&&!isKnown(th,'sensoryMap'))add('sensoryMap',98,'neurologic distribution can change safety and support requirements');
 if(fn.includes('weight bearing difficult'))add('start',97,'weight-bearing loss changes trauma/escalation interpretation');else add('start',82,'trauma versus gradual onset can change disposition');
 add('duration',76,'course can change interpretation');
 if(th.region==='hand'||th.region==='wrist'||th.region==='thumb'||th.region==='finger')add('preciseLocation',74,'exact hand/wrist location changes support requirements');
 add('trigger',72,'provocation helps distinguish mechanical patterns');add('timing',62,'time pattern may distinguish competing patterns');add('function',58,'functional loss can change escalation or plan');add('relief',45,'response to stopping/activity can refine the plan');
 if(tr.some(x=>['phone','scrolling','typing','computer','mouse'].includes(x))&&(sx.includes('numbness')||sx.includes('tingling')))out.forEach(x=>{if(x.concept==='sensoryMap')x.score+=8;if(x.concept==='timing')x.score+=4;});
 return out.sort((a,b)=>b.score-a.score);
}
function nextQuestion(store){const th=activeThread(store),c=candidates(store)[0];if(!c)return null;const q={where:'Where is the problem?',side:'Which side is bothering you?',symptom:'What are you noticing there?',sensoryMap:'Which fingers or part of the hand feel numb or tingly?',start:'Did this build up gradually or follow one specific injury?',duration:'About how long has this been going on?',preciseLocation:'Where is it centered most precisely?',trigger:'What tends to bring it on or make it worse?',timing:'When do you tend to notice it most?',function:'What, if anything, has become difficult to do because of it?',relief:'What makes it settle down or feel better?'}[c.concept];return {...c,text:q,thread:th&&th.key};}
function adequateForHandoff(store){const th=activeThread(store);if(!th)return false;return isKnown(th,'where')&&isKnown(th,'symptom')&&isKnown(th,'start')&&isKnown(th,'duration')&&(isKnown(th,'trigger')||isKnown(th,'timing'))&&(!activeVals(th,'symptoms').some(x=>x==='numbness'||x==='tingling')||isKnown(th,'sensoryMap'));}
function summary(store){return Object.values(store.threads).map(th=>({thread:th.key,region:th.region,side:th.side,locations:activeVals(th,'locations'),symptoms:activeVals(th,'symptoms'),qualities:activeVals(th,'qualities'),triggers:activeVals(th,'triggers'),patterns:activeVals(th,'patterns'),relievers:activeVals(th,'relievers'),functionEffects:activeVals(th,'functionEffects'),sensory:activeVals(th,'sensory'),onset:th.onset&&th.onset.active?th.onset.value:null,duration:th.duration&&th.duration.active?th.duration.value:null}));}
const Engine={STATUS,parseTurn,createStore,ingest,activeThread,activeVals,isKnown,questionConcept,candidates,nextQuestion,adequateForHandoff,summary};root.KFXCleanEngine=Engine;

if(typeof document==='undefined'||typeof state==='undefined')return;
const store=state.kfxCanonical=state.kfxCanonical||Engine.createStore();
function ingestBrowser(text){if(!norm(text))return;Engine.ingest(store,text,'consumer');projectLegacy();}
function projectLegacy(){
 const th=Engine.activeThread(store);if(!th)return;state.storyModel=Engine.summary(store);state.side=th.side||state.side;state.location=state.location||new Set();
 ['wrist','thumb'].forEach(r=>{if(th.region===r||th.region==='hand'&&Engine.activeVals(th,'locations').some(x=>x.includes(r)))state.location.add(r)});if(th.region==='finger')state.location.add('fingers');if(['hand','wrist','thumb','finger'].includes(th.region))state.region='hand';
 state.features=state.features||new Set();Engine.activeVals(th,'symptoms').forEach(x=>{if(x==='pain')state.features.add('pain');if(x==='swelling')state.features.add('swelling');if(x==='stiffness')state.features.add('stiff');if(x==='numbness'||x==='tingling')state.features.add('neuro');if(x==='weakness')state.features.add('weakness');});
 if(th.onset&&th.onset.active)state.trauma=th.onset.value==='specific event'?'trauma':'gradual';if(th.duration&&th.duration.active){const d=th.duration.value;if(d.unit==='day'&&d.value<=7)state.duration='days';else if(d.unit==='week'&&d.value<=2)state.duration='1-2w';else if(d.unit==='week'&&d.value<=4)state.duration='3w';else state.duration='month';}
 const tr=Engine.activeVals(th,'triggers');if(tr.length)state.triggerSummary=tr.join(', ');state.pattern=state.pattern||new Set();Engine.activeVals(th,'patterns').forEach(x=>state.pattern.add(x));const sens=Engine.activeVals(th,'sensory');if(sens.length){state.storySensoryMap=new Set(sens);state.mskEvidence=state.mskEvidence||{};state.mskEvidence.sensoryMap=sens.slice();}
 if(store.global.provider.length){state.hasProviderInstruction=true;state.providerInstructionText=store.global.provider.filter(x=>x.active!==false).map(x=>x.value).join(' ');}
}
const priorParse=typeof parseDetail==='function'?parseDetail:null;if(priorParse)parseDetail=function(t){priorParse(t);ingestBrowser(t);};
function mapKnownToOption(concept,opts){const th=Engine.activeThread(store);if(!th)return null;if(concept==='side'&&th.side){return opts.find(o=>o.value===th.side)?.value||null;}if(concept==='start'&&th.onset){const v=th.onset.value==='specific event'?'trauma':'gradual';return opts.find(o=>o.value===v)?.value||null;}if(concept==='duration'&&state.duration)return opts.find(o=>o.value===state.duration)?.value||null;if(concept==='preciseLocation'){const loc=Engine.activeVals(th,'locations');for(const o of opts){if(loc.some(v=>String(o.label||'').toLowerCase().includes(v.split(' ')[0])))return o.value;}}return null;}
const priorOne=typeof oneSelect==='function'?oneSelect:null;if(priorOne)oneSelect=function(title,hint,opts,cb){const c=Engine.questionConcept((title||'')+' '+(hint||'')),th=Engine.activeThread(store);if(c&&Engine.isKnown(th,c)){const v=mapKnownToOption(c,opts||[]);if(v!==null){setTimeout(()=>cb(v),0);return;}if(c!=='preciseLocation')return;}priorOne(title,hint,opts,cb);};
const priorMulti=typeof multiselect==='function'?multiselect:null;if(priorMulti)multiselect=function(title,hint,opts,nextLabel,cb){const c=Engine.questionConcept((title||'')+' '+(hint||'')),th=Engine.activeThread(store);if(c==='sensoryMap'&&Engine.isKnown(th,c)){const vals=new Set(Engine.activeVals(th,'sensory'));setTimeout(()=>cb(vals),0);return;}priorMulti(title,hint,opts,nextLabel,cb);};
const priorText=typeof textComposer==='function'?textComposer:null;if(priorText)textComposer=function(placeholder,buttonText,cb){priorText(placeholder,buttonText,v=>{ingestBrowser(v);cb(v);});};
function askCanonical(){
 const th=Engine.activeThread(store);setProgress(Math.min(72,18+store.turn*8));
 if(Engine.adequateForHandoff(store)){
   const supported=th&&['hand','wrist','thumb','finger'].includes(th.region);
   addAI('<b>Keneflex has enough of the story to move forward.</b> It will use what you already said rather than asking you to repeat it.');
   if(!supported){addAI('The prototype has captured this problem, but this body region is not yet configured for a product recommendation. That is intentional for this build.');interaction.innerHTML='';return;}
   if(typeof askSafetyBroad==='function'){askSafetyBroad();return;}if(typeof askSafety==='function'){askSafety();return;}
 }
 const n=Engine.nextQuestion(store);if(!n){addAI('Keneflex has the story it needs for this prototype.');return;}
 addAI(n.text);
 textComposer('Answer in your own words.','Continue →',v=>{askCanonical();});
}
askDetail=function(){if(state.opening&&!store.events.length)ingestBrowser(state.opening);askCanonical();};
const priorAI=typeof addAI==='function'?addAI:null;if(priorAI)addAI=function(html){const c=Engine.questionConcept(String(html||'')),th=Engine.activeThread(store);if(c&&Engine.isKnown(th,c)&&!/clarif|different|change|worsen|new|more specific|precisely|most centered/i.test(String(html||'')))return;priorAI(html);};
if(state.opening)ingestBrowser(state.opening);
document.title='Keneflex Prototype 0.4.5B';const eb=document.querySelector('#intro .hero .eyebrow');if(eb)eb.textContent='Prototype 0.4.5B • canonical conversation controller';
})(typeof window!=='undefined'?window:globalThis);
