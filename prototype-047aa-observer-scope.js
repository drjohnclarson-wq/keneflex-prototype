/* Keneflex 0.4.7AA — scope the legacy consumer rewrite observer.
   The next MutationObserver created by prototype-047-consumer-experience is intentionally
   converted to a no-op. That module still performs its initial rewrite and explicit audits,
   while the later 0.4.7B firewall retains the only live presentation observer. This removes
   continuous full-DOM rewrite pressure during intake without changing clinical/conversation state. */
(function(root){'use strict';if(typeof root.MutationObserver!=='function')return;const Native=root.MutationObserver;let consumed=false;function OneShotSuppressedObserver(cb){if(!consumed){consumed=true;root.MutationObserver=Native;return{observe:function(){},disconnect:function(){},takeRecords:function(){return[];}};}return new Native(cb);}OneShotSuppressedObserver.prototype=Native.prototype;root.MutationObserver=OneShotSuppressedObserver;root.KFX047AA={build:'0.4.7AA',suppressesNextPresentationObserver:true};})(typeof window!=='undefined'?window:globalThis);
