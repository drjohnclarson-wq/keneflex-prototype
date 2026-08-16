/* Keneflex Prototype 0.4.3 — thesis-critical solution mutation layer.
   Designed to be loaded after app.js. It preserves Keneflex ownership of the
   decision when the consumer changes constraints. No catalog is exposed. */
(function(){
  const PRICE={support:19.99,cold:21.00,topical:11.99};
  function blocks(){
    const all=[...document.querySelectorAll('#solution .block')];
    return {
      cold:all.find(b=>b.querySelector('.prodtag')?.textContent.includes('2 · Recovery')),
      topical:all.find(b=>b.querySelector('.prodtag')?.textContent.includes('3 · Targeted')),
      total:document.querySelector('#solution .totalcard'),
      checkout:[...document.querySelectorAll('#checkout .cartrow')]
    };
  }
  function money(n){return '$'+n.toFixed(2)}
  function current(){
    const s=window.state||{};
    return {ownedCold:!!s.ownedCold,noTopical:!!s.noTopical,budget:s.budget||null};
  }
  function effective(c){
    // Budget tuning removes optional topical first. It never silently swaps the
    // primary support. An owned adequate cold component can satisfy recovery.
    return {
      support:true,
      cold:!c.ownedCold,
      topical:!c.noTopical && !c.budget
    };
  }
  function render(){
    const c=current(),e=effective(c),b=blocks();
    if(b.cold)b.cold.style.display=e.cold?'':'none';
    if(b.topical)b.topical.style.display=e.topical?'':'none';
    const subtotal=PRICE.support+(e.cold?PRICE.cold:0)+(e.topical?PRICE.topical:0);
    if(b.total){
      const t=b.total.querySelector('.total'); if(t)t.textContent=money(subtotal);
      const k=b.total.querySelector('.kicker'); if(k)k.textContent=(1+(e.cold?1:0)+(e.topical?1:0))+'-product solution + self-care';
      const copy=b.total.querySelector('.totalcopy');
      if(copy){
        let parts=['$19.99 primary support'];
        if(e.cold)parts.push('$21.00 recovery wrap'); else if(c.ownedCold)parts.push('your adequate cold option ($0 purchase)');
        if(e.topical)parts.push('$11.99 topical');
        if(c.noTopical||c.budget)parts.push('topical removed');
        copy.textContent=parts.join(' + ')+'. Self-care remains included. Tax/shipping not included; prototype prices can change.';
      }
    }
    // Checkout rows: support, cold, topical, self-care, subtotal.
    if(b.checkout.length>=5){
      b.checkout[1].style.display=e.cold?'':'none';
      b.checkout[2].style.display=e.topical?'':'none';
      const last=b.checkout[b.checkout.length-1].querySelector('.cartprice'); if(last)last.textContent=money(subtotal);
      const careMeta=b.checkout[3].querySelector('.cartmeta');
      if(careMeta && c.ownedCold)careMeta.textContent='Load modification • gentle mobility • use your adequate cold option • reassessment triggers';
    }
    const care=[...document.querySelectorAll('#solution .careCard')].find(x=>x.textContent.includes('cool + recover'));
    if(care&&c.ownedCold){const span=care.querySelector('span');if(span)span.textContent='Use your existing adequate cold option according to its directions if it feels helpful. You do not need to buy another cold product just because it appeared in the original solution.';}
    const result=document.getElementById('tuneResult');
    if(result&&c.budget){
      const budgetOK=subtotal<=c.budget;
      result.innerHTML='<strong>'+ (budgetOK?'I rebuilt this to stay within your $'+c.budget+' limit.':'I reduced the solution without compromising the primary support.')+'</strong><br>'+
        (budgetOK?'The primary support and $0 self-care plan remain; optional components were removed or replaced by something adequate you already own.':'At '+money(subtotal)+', I cannot honestly get below your stated budget with the current information without either confirming an adequate recovery item you already own or substituting a cheaper support that clears the same hard requirements. I would ask that next rather than silently downgrade the recommendation.');
    }
  }
  // app.js owns state but declares it with const, so it is not a window property.
  // Observe the tuning result text and infer the state that app.js just applied.
  function inferAndRender(){
    const r=document.getElementById('tuneResult'); if(!r)return;
    const txt=r.textContent.toLowerCase();
    const cold=txt.includes('use yours')||txt.includes('existing cold');
    const noTop=txt.includes('remove the topical')||txt.includes('optional topical');
    const budget=txt.includes('essentials')||txt.includes('cheaper support');
    const pseudo={ownedCold:cold,noTopical:noTop,budget:budget?30:null};
    const e={support:true,cold:!pseudo.ownedCold,topical:!pseudo.noTopical&&!pseudo.budget};
    const b=blocks();
    if(b.cold)b.cold.style.display=e.cold?'':'none';
    if(b.topical)b.topical.style.display=e.topical?'':'none';
    const subtotal=PRICE.support+(e.cold?PRICE.cold:0)+(e.topical?PRICE.topical:0);
    if(b.total){const t=b.total.querySelector('.total');if(t)t.textContent=money(subtotal);const k=b.total.querySelector('.kicker');if(k)k.textContent=(1+(e.cold?1:0)+(e.topical?1:0))+'-product solution + self-care';}
    if(b.checkout.length>=5){b.checkout[1].style.display=e.cold?'':'none';b.checkout[2].style.display=e.topical?'':'none';const last=b.checkout[b.checkout.length-1].querySelector('.cartprice');if(last)last.textContent=money(subtotal);}
    if(r&&budget){r.innerHTML='<strong>'+ (subtotal<=30?'I rebuilt this to stay within your $30 limit.':'I reduced the solution without compromising the primary support.')+'</strong><br>'+(subtotal<=30?'The primary support and $0 self-care plan remain.':'The current essentials are '+money(subtotal)+'. I would next check whether you already own an adequate recovery option or whether a cheaper support clears the same hard requirements. I would not silently downgrade the primary product.');}
  }
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-tune]'))setTimeout(inferAndRender,0);
    if(e.target.closest('#tuneReset'))setTimeout(()=>location.reload(),0);
    if(e.target.closest('#cartBtn,#cartBtnMobile'))setTimeout(inferAndRender,0);
  });
  new MutationObserver(()=>{if(document.getElementById('solutionTuning'))inferAndRender();}).observe(document.body,{childList:true,subtree:true});
})();
