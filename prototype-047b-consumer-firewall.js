/* Keneflex 0.4.7B — final consumer-language firewall.
   P0 stability rule: one coalesced presentation observer only. Late-rendered legacy elements
   are translated into consumer language before the visible-language audit runs. */
(function(root){'use strict';if(typeof document==='undefined')return;
const inherited=root.KFX047&&root.KFX047.BANNED||[];
const banned=inherited.concat([/\bproblem pattern\b/i,/\bwork-up\b/i,/\bnight wrist role\b/i,/\bthumb-base activity role\b/i,/\bcore role\b/i,/\bsupportive recovery role\b/i,/\bcurrent product list\b/i,/\bclinical logic\b/i,/\btherapeutic job\b/i,/\bseparate night[- ]wrist\b/i,/\bcare packet\b/i,/included at \$0/i,/included value/i,/\bcurrent cart\b/i]);
function visible(e){if(!e||!e.getClientRects)return false;const s=getComputedStyle(e);return s.display!=='none'&&s.visibility!=='hidden'&&e.getClientRects().length>0;}
function text(el,value){if(el&&el.textContent!==value)el.textContent=value;}
function tuneContainer(){const explicit=document.querySelector('#solutionView .tune');if(explicit)return explicit;const btn=document.querySelector('#solutionView [data-tune]');return btn&&(btn.closest('.block')||btn.parentElement);}
function translateKnownLegacy(){
 document.title='Keneflex';
 const solution=document.getElementById('solutionView');
 const eb=document.querySelector('#intro .hero .eyebrow');text(eb,'Personalized health & product guidance');
 const supportCopy=document.querySelector('#supportItem .planCopy');if(supportCopy&&/prototype/i.test(supportCopy.textContent||''))text(supportCopy,'Supports both the wrist and thumb while preserving more usable movement than a rigid immobilizer. Your wrist measurement falls within the selected manufacturer size range.');
 const tune=tuneContainer();if(tune){if(solution&&!solution.classList.contains('hidden')){tune.classList.remove('hidden');tune.style.display='block';tune.style.visibility='visible';}let h=tune.querySelector('h2');if(!h){h=document.createElement('h2');tune.insertBefore(h,tune.firstChild);}text(h,"Something about this plan doesn't work for me");let help=tune.querySelector('.help');if(!help){help=document.createElement('p');help.className='help';h.insertAdjacentElement('afterend',help);}text(help,"Tell Keneflex what doesn't fit your real life. Keneflex will rework the plan without handing the shopping decision back to you.");}
 const packet=document.getElementById('kfxVPacketValue');if(packet){packet.classList.add('kfx047simple');text(packet.querySelector('.eyebrow'),'YOUR KENEFLEX PLAN');text(packet.querySelector('h3'),'Your Keneflex Plan');text(packet.querySelector('p'),'Your personalized actions, product-use guidance, movement, recovery and follow-up are already assembled for you.');text(packet.querySelector('button'),'View / save my Keneflex Plan →');const price=packet.querySelector('.kfxVPacketPrice');if(price)price.style.display='none';const chips=packet.querySelector('.kfxVPacketChips');if(chips)chips.style.display='none';}
 document.querySelectorAll('#solutionView [data-open="home"],#kfxHomePlanBtn').forEach(b=>text(b,'View / save my Keneflex Plan'));
 const next=document.querySelector('#solutionView .kfxKNext');if(next){text(next.querySelector('h2'),'Use the rest of your Keneflex Plan');text(next.querySelector('.help'),'Your product recommendations and personalized actions belong to one coordinated plan.');}
 const total=document.getElementById('total'),tb=total&&total.closest('.block');if(tb)text(tb.querySelector('.help'),'Product total. Your Keneflex Plan is part of the recommendation.');
 const ws=document.getElementById('kfxVWorkspace');if(ws){text(ws.querySelector('.eyebrow'),'OPTIONAL SETUP IMPROVEMENTS');text(ws.querySelector('h3'),'Your setup may be contributing, too.');text(ws.querySelector('p'),'Keneflex noticed that phone or computer use matters in your story. Start with the no-cost changes; optional equipment improvements can be added later.');text(ws.querySelector('.kfxVWorkspaceTag'),'Optional');text(ws.querySelector('button'),'See setup changes →');}
}
let observer=null,pending=false;
function clean(){translateKnownLegacy();document.querySelectorAll('body *').forEach(e=>{if(e.children.length>3)return;const t=(e.textContent||'').trim();if(!t||!banned.some(rx=>rx.test(t)))return;const box=e.closest('.notice,.kfxSCard,.kfxSWhole,.kfxKRole,.kfxQBanner,.kfxRBanner,.kfxKBanner');if(box){if(box.style.display!=='none')box.style.display='none';return;}if(e.closest('#intro .hero'))return;if(e.matches('p,small,span,.micro,.help,.tag,.planState,.kfxSLevel')&&e.style.display!=='none')e.style.display='none';});}
function runClean(){pending=false;if(observer)observer.disconnect();try{clean();}finally{if(observer&&document.body)observer.observe(document.body,{subtree:true,childList:true,characterData:true});}}
function scheduleClean(){if(pending)return;pending=true;(root.requestAnimationFrame||function(fn){setTimeout(fn,0)})(runClean);}
function audit(){runClean();const leaks=[];document.querySelectorAll('body *').forEach(e=>{if(e.children.length||!visible(e))return;const t=(e.textContent||'').trim();if(t&&banned.some(rx=>rx.test(t)))leaks.push(t)});return{build:'0.4.7B',visibleInternalLanguage:leaks,pass:leaks.length===0};}
observer=new MutationObserver(scheduleClean);if(document.body)observer.observe(document.body,{subtree:true,childList:true,characterData:true});clean();root.KFX047VisibleAudit=audit;
})(typeof window!=='undefined'?window:globalThis);
