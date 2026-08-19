/* Keneflex 0.5.0 final release firewall. Keeps consumer language and purchase totals synchronized across late-rendered legacy content. */
(function(){'use strict';
function sanitize(root){if(!root)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){let v=n.nodeValue||'';v=v.replace(/Keneflex should/gi,'Keneflex will').replace(/re[- ]?solve/gi,'reconsider');if(v!==n.nodeValue)n.nodeValue=v;}}
function total(){return (document.getElementById('total')?.textContent||'$0.00').trim();}
function sync(){sanitize(document.querySelector('#solutionView'));sanitize(document.getElementById('modalContent'));const b=document.querySelector('.kfxBuy');if(b)b.textContent='Buy selected items — '+total();}
function later(){requestAnimationFrame(()=>{sync();setTimeout(sync,0);setTimeout(sync,80);});}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.matches('[data-tune],[data-modal]'))later();},true);
let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;sync();});}).observe(document.body,{subtree:true,childList:true,characterData:true});
sync();window.KFX050Final={sync,sanitize};
})();