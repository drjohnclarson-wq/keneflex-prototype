/* Keneflex 0.4.7A — presentation idempotence guard.
   Consumer-experience modules deliberately rewrite legacy presentation after it renders.
   Avoid replacing identical text nodes repeatedly, which would otherwise create recursive
   MutationObserver work and can stall the participant UI. */
(function(root){'use strict';if(typeof Node==='undefined')return;const d=Object.getOwnPropertyDescriptor(Node.prototype,'textContent');if(!d||!d.get||!d.set||Node.prototype.__kfxIdempotentTextContent)return;Object.defineProperty(Node.prototype,'textContent',{configurable:d.configurable,enumerable:d.enumerable,get:d.get,set:function(v){const next=v==null?'':String(v);let cur;try{cur=d.get.call(this);}catch(e){return d.set.call(this,next);}if(cur===next)return;return d.set.call(this,next);}});Object.defineProperty(Node.prototype,'__kfxIdempotentTextContent',{value:true,configurable:true});})(typeof window!=='undefined'?window:globalThis);
