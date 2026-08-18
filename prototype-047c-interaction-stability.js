/* Keneflex 0.4.7C — interaction stability owner.
   Smooth scrolling made controls appear continuously in motion to browser actionability checks
   and can make tap targets feel jumpy on smaller screens. Keep scrolling deterministic during
   intake; conversational scroll behavior can still be requested explicitly where useful. */
(function(root){'use strict';if(typeof document==='undefined')return;const style=document.createElement('style');style.id='kfx047c-stability';style.textContent='html{scroll-behavior:auto!important}#openingBtn,#interaction button,#solutionView button{transition:none!important;animation:none!important}#openingBtn{scroll-margin-bottom:24px}';if(!document.getElementById(style.id))document.head.appendChild(style);root.KFX047C={build:'0.4.7C',pass:true};})(typeof window!=='undefined'?window:globalThis);
