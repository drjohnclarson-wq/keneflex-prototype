/* Keneflex 0.4.7E — final story-first intake gate for P0.
   Owns the opening click before any legacy questionnaire routing. It reparses the exact visible
   narrative immediately before question selection, preserves complaint duration separately from
   relief-duration language, blocks common body-word idioms from creating false problem threads,
   and only renders an unresolved canonical question. */
(function(root){'use strict';if(typeof document==='undefined'||!root.KFX046||typeof state==='undefined')return;
const E=root.KFX046,openingEl=document.getElementById('opening'),openingBtnEl=document.getElementById('openingBtn');
function sanitizeStory(text){return String(text||'').replace(/\b(?:comes|come|came|coming|gets|get|got|getting)\s+back\b/ig,'returns').replace(/\bgo(?:es|ing)?\s+back\b/ig,'returns');}
function normalizeDurationLanguage(text){return sanitizeStory(text).replace(/\b(about|around|roughly|for|over|nearly|almost)\s+a\s+(day|week|month|year)\b/ig,'$1 one $2').replace(/\bfor\s+an\s+(hour|day|week|month|year)\b/ig,'for one $1');}
function complaintDuration(text){
 const clauses=String(text||'').replace(/\s+/g,' ').split(/(?<=[.!?;])\s+|\s+(?:but|however|although)\s+/i).filter(Boolean),candidates=[];
 const unitRx=/(?:for|about|around|roughly|over|nearly|almost)?\s*(\d+(?:\.\d+)?|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|a|an|few|couple(?: of)?)\s*(day|days|week|weeks|month|months|year|years)\b/i;
 const nums={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,a:1,an:1,few:3,'couple of':2,couple:2};
 clauses.forEach((c,i)=>{const m=c.match(unitRx);if(!m)return;const relief=/\b(?:rest|resting|stop|stopping|break|avoid|better|improve|improves|improved|subsides?|eases?|goes away|settles?)\b/i.test(c);const complaint=/\b(?:hurt|hurts|hurting|pain|painful|sore|soreness|ache|aching|tingl|numb|stiff|swollen|swelling|bothering|problem|symptom|going on|been)\b/i.test(c);const score=(complaint?4:0)-(relief?5:0)+(i===0?1:0),raw=m[1].toLowerCase().replace(/\s+/g,' '),value=/^\d/.test(raw)?parseFloat(raw):(nums[raw]||null);if(value)candidates.push({score,value,unit:m[2].toLowerCase().replace(/s$/,''),raw:m[0].trim()});});
 candidates.sort((a,b)=>b.score-a.score);return candidates.length&&candidates[0].score>0?candidates[0]:null;
}
function resetAndIngestOpening(){
 const v=(openingEl?.value||state.opening||'').trim();if(!v)return null;state.opening=v;
 const store=state.kfx046=E.createStore(),normalized=normalizeDurationLanguage(v);E.ingest(store,normalized);
 const threads=(store.order||[]).map(k=>store.threads[k]).filter(Boolean),primary=threads.find(t=>t.family!=='unspecified')||E.activeThread(store),d=complaintDuration(v);if(primary&&d)primary.duration={value:d.value,unit:d.unit,raw:d.raw};if(primary)store.active=store.order.find(k=>store.threads[k]===primary)||store.active;
 if(typeof parseDetail==='function')parseDetail(v);return store;
}
function ingestOpening(){
 const v=(state.opening||openingEl?.value||'').trim();if(!v)return null;const store=state.kfx046||(state.kfx046=E.createStore());
 if(!(store.events||[]).length){E.ingest(store,normalizeDurationLanguage(v));const threads=(store.order||[]).map(k=>store.threads[k]).filter(Boolean),primary=threads.find(t=>t.family!=='unspecified')||E.activeThread(store),d=complaintDuration(v);if(primary&&d)primary.duration={value:d.value,unit:d.unit,raw:d.raw};if(primary)store.active=store.order.find(k=>store.threads[k]===primary)||store.active;}
 return store;
}
function renderCanonical(){
 const store=ingestOpening();if(!store)return;const t=E.activeThread(store);if(typeof setProgress==='function')setProgress(Math.min(72,18+(store.events||[]).length*8));
 if(E.adequate(store)){
   if(typeof addAI==='function')addAI('<b>Keneflex has enough of your story to move forward.</b> It will use what you already told it instead of asking you to repeat it.');
   if(!t||t.family!=='hand'){if(typeof addAI==='function')addAI('Keneflex understands the story, but it is not ready to recommend products for this body area yet.');if(typeof interaction!=='undefined')interaction.innerHTML='';return;}
   if(typeof askSafetyBroad==='function'){askSafetyBroad();return;}if(typeof askSafety==='function'){askSafety();return;}return;
 }
 const q=E.nextQuestion(store);if(!q)return;if(E.known(t,q.concept)){setTimeout(renderCanonical,0);return;}
 if(typeof addAI==='function')addAI(q.text);if(typeof textComposer==='function')textComposer('Answer in your own words.','Continue →',v=>{E.ingest(store,normalizeDurationLanguage(v));if(typeof parseDetail==='function')parseDetail(v);renderCanonical();});
}
function startFromVisibleStory(ev){
 const v=(openingEl?.value||'').trim();if(!v)return;if(ev){ev.preventDefault();ev.stopImmediatePropagation();}
 const store=resetAndIngestOpening();if(!store)return;document.body.classList.add('kfxStarted');if(typeof intro!=='undefined'&&intro)intro.classList.add('hidden');if(typeof chatView!=='undefined'&&chatView)chatView.classList.remove('hidden');if(typeof addUser==='function')addUser(v);if(typeof interaction!=='undefined')interaction.innerHTML='';setTimeout(renderCanonical,0);
}
if(openingBtnEl)openingBtnEl.addEventListener('click',startFromVisibleStory,true);
askDetail=function(){renderCanonical();};
root.KFX047E={build:'0.4.7E',sanitizeStory,ingestOpening,resetAndIngestOpening,complaintDuration,renderCanonical,startFromVisibleStory,audit:function(){const store=ingestOpening(),t=store&&E.activeThread(store),q=store&&E.nextQuestion(store);return{summary:store?E.summary(store):[],next:q,pass:!!store&&!(q&&E.known(t,q.concept))};}};
})(typeof window!=='undefined'?window:globalThis);
(function(){if(typeof document==='undefined'||document.querySelector('script[data-kfx048]'))return;const s=document.createElement('script');s.src='prototype-048-consumer-surface.js?v=048a';s.dataset.kfx048='1';s.defer=true;document.head.appendChild(s);})();
