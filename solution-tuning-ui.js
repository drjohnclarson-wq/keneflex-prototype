/* Keneflex Prototype 0.4.3 — solution mutation layer. Load after app.js. */
(function(){
 const PRICE={support:19.99,cold:21,topical:11.99};
 function blocks(){const all=[...document.querySelectorAll('#solution .block')];return{cold:all.find(b=>b.querySelector('.prodtag')?.textContent.includes('2 · Recovery')),topical:all.find(b=>b.querySelector('.prodtag')?.textContent.includes('3 · Targeted')),total:document.querySelector('#solution .totalcard'),checkout:[...document.querySelectorAll('#checkout .cartrow')]};}
 function money(n){return '$'+n.toFixed(2)}
 function inferAndRender(){
  const r=document.getElementById('tuneResult');if(!r)return;
  const txt=r.textContent.toLowerCase();
  const ownedCold=txt.includes('use yours')||txt.includes('existing cold');
  const noTopical=txt.includes('remove the topical');
  const budget=txt.includes('essentials')||txt.includes('cheaper support');
  const e={cold:!ownedCold,topical:!noTopical&&!budget};const b=blocks();
  if(b.cold)b.cold.style.display=e.cold?'':'none';if(b.topical)b.topical.style.display=e.topical?'':'none';
  const subtotal=PRICE.support+(e.cold?PRICE.cold:0)+(e.topical?PRICE.topical:0);
  if(b.total){const t=b.total.querySelector('.total');if(t)t.textContent=money(subtotal);const k=b.total.querySelector('.kicker');if(k)k.textContent=(1+(e.cold?1:0)+(e.topical?1:0))+'-product solution + self-care';const c=b.total.querySelector('.totalcopy');if(c)c.textContent='$19.99 primary support'+(e.cold?' + $21.00 recovery wrap':ownedCold?' + your adequate cold option ($0 purchase)':'')+(e.topical?' + $11.99 topical':'')+'. Self-care remains included.';}
  if(b.checkout.length>=5){b.checkout[1].style.display=e.cold?'':'none';b.checkout[2].style.display=e.topical?'':'none';const last=b.checkout[b.checkout.length-1].querySelector('.cartprice');if(last)last.textContent=money(subtotal);}
  if(ownedCold){const care=[...document.querySelectorAll('#solution .careCard')].find(x=>x.textContent.includes('cool + recover'));if(care){const span=care.querySelector('span');if(span)span.textContent='Use your existing adequate cold option according to its directions if it feels helpful. You do not need to buy another cold product just because it appeared in the original solution.';}}
  if(budget)r.innerHTML='<strong>'+(subtotal<=30?'I rebuilt this to stay within your $30 limit.':'I reduced the solution without compromising the primary support.')+'</strong><br>'+(subtotal<=30?'The primary support and $0 self-care plan remain.':'The current essentials are '+money(subtotal)+'. I would next check whether you already own an adequate recovery option or whether a cheaper support clears the same hard requirements. I would not silently downgrade the primary product.');
 }
 document.addEventListener('click',e=>{if(e.target.closest('[data-tune],#cartBtn,#cartBtnMobile'))setTimeout(inferAndRender,0);if(e.target.closest('#tuneReset'))setTimeout(()=>location.reload(),0);});
 new MutationObserver(()=>{if(document.getElementById('solutionTuning'))inferAndRender();}).observe(document.body,{childList:true,subtree:true});
})();
