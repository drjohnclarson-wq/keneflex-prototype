/* Keneflex 0.4.7D — release shell owner.
   Final startup guard for participant-facing P0. Keeps the opening interaction visibly usable,
   prevents accidental modal/overlay obstruction before intake begins, and improves mobile modal fit. */
(function(root){'use strict';if(typeof document==='undefined')return;
const style=document.createElement('style');style.id='kfx047d-release-shell';style.textContent=`
body:not(.kfxStarted) #intro{display:block!important;visibility:visible!important;opacity:1!important}
body:not(.kfxStarted) #opening{display:block!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important}
body:not(.kfxStarted) #openingBtn{display:inline-flex!important;visibility:visible!important;opacity:1;pointer-events:auto!important}
body:not(.kfxStarted) #modal:not(.kfxUserOpened){display:none!important}
#opening,#openingBtn{transform:none!important;transition:none!important;animation:none!important}
@media(max-width:650px){.modal{align-items:flex-start!important;padding:12px!important;overflow:auto!important}.modalCard{width:100%!important;max-width:100%!important;max-height:calc(100dvh - 24px)!important;padding:20px!important;margin:0!important}.modalCard h2{font-size:26px!important}.modalCard p{font-size:16px!important;line-height:1.48!important}.close{position:sticky!important;top:0!important;z-index:2!important;float:right!important}}
`;if(!document.getElementById(style.id))document.head.appendChild(style);
const intro=document.getElementById('intro'),opening=document.getElementById('opening'),btn=document.getElementById('openingBtn'),modal=document.getElementById('modal');
if(intro)intro.classList.remove('hidden');if(modal){modal.classList.add('hidden');modal.classList.remove('kfxUserOpened');}
if(opening){opening.disabled=false;opening.readOnly=false;opening.setAttribute('aria-label','Tell Keneflex what is bothering you');}
if(btn){btn.setAttribute('aria-label','Tell Keneflex');btn.addEventListener('click',()=>document.body.classList.add('kfxStarted'),true);}
document.querySelectorAll('[data-modal]').forEach(x=>x.addEventListener('click',()=>{if(modal)modal.classList.add('kfxUserOpened');},true));
const close=document.getElementById('closeModal');if(close)close.addEventListener('click',()=>{if(modal)modal.classList.remove('kfxUserOpened');},true);
function audit(){const r=opening&&opening.getBoundingClientRect(),b=btn&&btn.getBoundingClientRect();const cs=opening&&getComputedStyle(opening),bs=btn&&getComputedStyle(btn);return{build:'0.4.7D',openingPresent:!!opening,openingVisible:!!(r&&r.width&&r.height&&cs.display!=='none'&&cs.visibility!=='hidden'),openingEditable:!!(opening&&!opening.disabled&&!opening.readOnly),buttonPresent:!!btn,buttonVisible:!!(b&&b.width&&b.height&&bs.display!=='none'&&bs.visibility!=='hidden'),modalClosed:!!(!modal||modal.classList.contains('hidden')||getComputedStyle(modal).display==='none'),pass:!!(opening&&btn&&r&&r.width&&r.height&&!opening.disabled&&!opening.readOnly&&b&&b.width&&b.height)};}
root.KFX047DReleaseAudit=audit;root.KFX047D={build:'0.4.7D',audit};
})(typeof window!=='undefined'?window:globalThis);
