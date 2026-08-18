/* Keneflex 0.4.5C — release-integrity owner.
   Loaded LAST. Fixes atomic-turn failures caused by stacked historical wrappers.
   The release rule is simple: no prompt suppression may leave an input/control behind.
   This module restores unsuppressed prompt rendering and makes structured auto-skip safe. */
(function(root){
'use strict';
if(typeof document==='undefined'||typeof state==='undefined')return;
const E=root.KFXCleanEngine, store=state.kfxCanonical;
const conversation=document.getElementById('conversation'), interaction=document.getElementById('interaction');
if(!conversation||!interaction)return;
function activeThread(){return E&&store?E.activeThread(store):null;}
function known(concept){const th=activeThread();return !!(concept&&th&&E&&E.isKnown(th,concept));}
function rawAddAI(html){const d=document.createElement('div');d.className='bubble ai';d.dataset.kfxTurn='prompt';d.innerHTML='<b>Keneflex</b>'+String(html||'');conversation.appendChild(d);window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'});return d;}
function rawAddUser(text){const d=document.createElement('div');d.className='bubble user';d.textContent=String(text||'');conversation.appendChild(d);return d;}
// Critical fix: bypass every historical addAI suppression wrapper. The canonical
// controller decides whether a question is askable BEFORE it is rendered.
addAI=rawAddAI;
function conceptOf(text){return E&&E.questionConcept?E.questionConcept(String(text||'')):null;}
function lastPrompt(){const xs=conversation.querySelectorAll('.bubble.ai');return xs.length?xs[xs.length-1]:null;}
function lastConversationBubble(){const xs=conversation.querySelectorAll('.bubble');return xs.length?xs[xs.length-1]:null;}
function ensurePromptForControl(){const last=lastConversationBubble();if(last&&last.classList.contains('ai'))return true;rawAddAI('Keneflex needs one more detail before it can continue.');return true;}
function mapKnown(concept,opts){const th=activeThread();if(!th||!E)return null;if(concept==='side'&&th.side)return (opts||[]).find(o=>o.value===th.side)?.value??null;if(concept==='start'&&th.onset&&th.onset.active){const v=th.onset.value==='specific event'?'trauma':'gradual';return (opts||[]).find(o=>o.value===v)?.value??null;}if(concept==='duration'&&state.duration)return (opts||[]).find(o=>o.value===state.duration)?.value??null;return null;}
function removeRedundantPrompt(concept){const p=lastPrompt();if(!p)return;const c=conceptOf(p.textContent||'');if(c===concept)p.remove();}
const priorOne=typeof oneSelect==='function'?oneSelect:null;
oneSelect=function(title,hint,opts,cb){const concept=conceptOf((title||'')+' '+(hint||''));if(known(concept)){const mapped=mapKnown(concept,opts);if(mapped!==null){removeRedundantPrompt(concept);interaction.innerHTML='';setTimeout(()=>cb(mapped),0);return;}}
  // Known generally but not safely mappable to offered choices is a real clarification,
  // so render it rather than silently returning/dead-ending.
  ensurePromptForControl();
  interaction.innerHTML=`<div class="selectHead">${title||''}</div><div class="selectHint">${hint||''}</div><div class="options" id="one"></div>`;
  const box=document.getElementById('one');(opts||[]).forEach(o=>{const b=document.createElement('button');b.className='opt'+(o.wide?' wide':'');b.innerHTML=o.label+(o.small?`<small>${o.small}</small>`:'');b.onclick=()=>{rawAddUser(String(o.label||'').replace(/<[^>]*>/g,''));interaction.innerHTML='';cb(o.value);};box.appendChild(b);});
};
multiselect=function(title,hint,opts,nextLabel,cb){const concept=conceptOf((title||'')+' '+(hint||'')),th=activeThread();if(concept==='sensoryMap'&&known(concept)&&E){removeRedundantPrompt(concept);interaction.innerHTML='';setTimeout(()=>cb(new Set(E.activeVals(th,'sensory'))),0);return;}
  ensurePromptForControl();
  interaction.innerHTML=`<div class="selectHead">${title||''}</div><div class="selectHint">${hint||''}</div><div class="options" id="opts"></div><div class="row"><button id="nextMulti" class="primary">${nextLabel||'Continue →'}</button></div>`;
  const box=document.getElementById('opts'),sel=new Set();(opts||[]).forEach(o=>{const b=document.createElement('button');b.className='opt'+(o.wide?' wide':'');b.innerHTML=o.label+(o.small?`<small>${o.small}</small>`:'');b.onclick=()=>{if(o.single){sel.clear();[...box.children].forEach(x=>x.classList.remove('on'));}else{(opts||[]).filter(x=>x.single).forEach(x=>{sel.delete(x.value);const idx=opts.indexOf(x);if(box.children[idx])box.children[idx].classList.remove('on');});}if(sel.has(o.value)){sel.delete(o.value);b.classList.remove('on');}else{sel.add(o.value);b.classList.add('on');}};box.appendChild(b);});
  const next=document.getElementById('nextMulti');if(next)next.onclick=()=>{if(!sel.size)return;const labels=[...sel].map(v=>(opts.find(o=>o.value===v)?.label||v).replace(/<[^>]*>/g,''));rawAddUser(labels.join(', '));interaction.innerHTML='';cb(sel);};
};
function audit(){const controls=[...interaction.querySelectorAll('textarea,input,button')];const last=lastConversationBubble();const orphan=controls.length>0&&!(last&&last.classList.contains('ai'));const emptyButtons=[...interaction.querySelectorAll('button')].filter(b=>!(b.textContent||'').trim()).length;const emptyTextarea=[...interaction.querySelectorAll('textarea')].filter(t=>!t.getAttribute('placeholder')).length;return {build:'0.4.5C',orphanControls:orphan,controlCount:controls.length,emptyButtons,emptyTextarea,pass:!orphan&&!emptyButtons&&!emptyTextarea};}
root.KFXReleaseAudit=audit;
const observer=new MutationObserver(()=>{const a=audit();document.documentElement.dataset.kfxIntegrity=a.pass?'pass':'fail';});observer.observe(interaction,{childList:true,subtree:true});
document.title='Keneflex Prototype 0.4.5C';const eb=document.querySelector('#intro .hero .eyebrow');if(eb)eb.textContent='Prototype 0.4.5C • atomic-turn release build';
})(typeof window!=='undefined'?window:globalThis);
