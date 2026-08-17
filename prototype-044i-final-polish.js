/* Keneflex 0.4.4i — final consumer polish before P0 */

const _kfxIPlanCopy=kfxHUpdatePlanCopy;
kfxHUpdatePlanCopy=function(){
  _kfxIPlanCopy();
  const conf=document.getElementById('confidenceCopy');
  if(conf)conf.textContent='Based on what you told Keneflex, this is a sensible place to start. Try the plan, see how your hand responds, and tell Keneflex what happens next.';
};

if(typeof modalCopy!=='undefined'){
  modalCopy.approach=`<h2>Our approach</h2>
    <h3>Start with you, not the shelf.</h3><p>Tell Keneflex what is bothering you in your own words. Keneflex does the work of figuring out what matters.</p>
    <h3>Think broadly. Keep it simple for you.</h3><p>Keneflex looks across reasonable products, at-home steps and conservative options, then turns that work into a clear recommendation.</p>
    <h3>Recommend the whole plan.</h3><p>If several things genuinely belong, Keneflex should include them. If something adds little value, Keneflex should leave it out.</p>
    <h3>Be willing to say “don’t buy it.”</h3><p>If something you already own does the job, or buying something is not the right next step, Keneflex should tell you.</p>
    <h3>Learn from what happens.</h3><p>If the plan helps, great. If it does not, tell Keneflex what happened so the next recommendation can change with the new information.</p>`;
}

function kfxIActivityTip(){
  const s=(state.triggerSummary||'').toLowerCase();
  const digital=s.includes('phone')||s.includes('computer')||s.includes('typing');
  if(digital)return 'Break up long uninterrupted phone or computer sessions. Change hand position before symptoms build. Prop the phone when practical, alternate hands, use voice input for long messages, and adjust the keyboard or mouse position so the same hand is not doing all the work.';
  if(s.includes('pickleball'))return 'Reduce the amount or intensity of the specific gripping, twisting or swing motion that clearly brings it on. Take short breaks before the hand becomes increasingly irritated rather than waiting for a larger flare.';
  if(s.includes('workout')||s.includes('exercise'))return 'Temporarily reduce the exercise, grip or load that clearly brings it on. Adjust the movement or weight and take a break before the hand becomes increasingly irritated.';
  return `Break up long periods of ${kfxHActivity()}. Change or reduce the specific motion that clearly brings the symptoms on, and take a break before the hand becomes increasingly irritated.`;
}
function kfxIActivitySVG(){
  const s=(state.triggerSummary||'').toLowerCase();
  if(s.includes('phone')||s.includes('computer')||s.includes('typing'))return kfxHPhoneSVG();
  if(s.includes('pickleball'))return `<svg viewBox="0 0 180 130" aria-hidden="true"><circle cx="130" cy="35" r="10" fill="#d8ea64"/><ellipse cx="78" cy="59" rx="35" ry="45" fill="#e99071" transform="rotate(-28 78 59)"/><rect x="94" y="82" width="18" height="44" rx="8" fill="#174b46" transform="rotate(-28 103 104)"/><path d="M28 104c30-10 59-34 83-70" fill="none" stroke="#257a83" stroke-width="5" stroke-linecap="round" stroke-dasharray="7 8"/></svg>`;
  if(s.includes('workout')||s.includes('exercise'))return `<svg viewBox="0 0 180 130" aria-hidden="true"><rect x="55" y="56" width="70" height="18" rx="9" fill="#174b46"/><rect x="35" y="43" width="18" height="44" rx="6" fill="#e99071"/><rect x="127" y="43" width="18" height="44" rx="6" fill="#e99071"/><rect x="22" y="49" width="12" height="32" rx="5" fill="#257a83"/><rect x="146" y="49" width="12" height="32" rx="5" fill="#257a83"/></svg>`;
  return kfxHMotionSVG();
}

kfxHOpenHomePlan=function(){
  const goal=kfxHGoal(), activity=kfxHActivity(), detail=kfxHDetail();
  const supportImg='https://www.neo-g.com/cdn/shop/files/722-13-Box_R_1080x.png?v=1725268865';
  const coldText=state.ownedCold?'Use the suitable cold pack you already own.':'Use the reusable cold option in your Keneflex plan if it feels helpful after aggravating use.';
  const topicalText=state.noTopical?'No topical is included in your current plan.':'The topical is optional for temporary comfort; follow the product label.';
  const html=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your Keneflex at-home plan</title>
  <style>*{box-sizing:border-box}body{margin:0;background:#f7f3e9;color:#153f3b;font-family:Arial,sans-serif}.sheet{max-width:850px;margin:auto;padding:34px}.hero{background:#174b46;color:#fff;border-radius:28px;padding:30px}.brand{font-size:14px;letter-spacing:.2em;font-weight:900}.hero h1{font-size:38px;margin:12px 0 8px}.hero p{font-size:18px;line-height:1.45;color:#e1eeea}.summary{margin:20px 0;background:#e7f3dd;border-radius:20px;padding:20px;font-size:17px;line-height:1.5}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.step{background:#fff;border-radius:22px;padding:18px;border:1px solid #d6dfd8;page-break-inside:avoid}.visual{height:130px;border-radius:16px;background:#f3f7f1;display:flex;align-items:center;justify-content:center;overflow:hidden}.visual svg{width:100%;height:100%}.visual img{max-width:88%;max-height:118px;object-fit:contain}.num{display:inline-flex;width:30px;height:30px;border-radius:50%;align-items:center;justify-content:center;background:#d8ea64;font-weight:900;margin-top:15px}.step h2{font-size:20px;margin:10px 0 7px}.step p{font-size:15px;line-height:1.5;color:#506762}.check{margin-top:18px;background:#fff2dc;border-radius:20px;padding:20px}.check h2{margin-top:0}.check p{line-height:1.5}.actions{display:flex;gap:10px;margin:22px 0}.actions button{border:0;border-radius:12px;padding:13px 18px;font-weight:900;background:#174b46;color:#fff}.fine{font-size:11px;color:#667873;line-height:1.45;margin-top:16px}@media(max-width:650px){.sheet{padding:16px}.grid{grid-template-columns:1fr}.hero h1{font-size:30px}}@media print{body{background:#fff}.sheet{padding:0}.actions{display:none}.hero,.step,.summary,.check{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><main class="sheet">
  <section class="hero"><div class="brand">KENEFLEX</div><h1>Your at-home plan</h1><p>Specific to what you told Keneflex. Your goal: ${goal} without this getting in the way.</p></section>
  <div class="summary"><b>What Keneflex heard:</b> your ${kfxHLoc()} is bothered mainly when ${activity}${detail?`, especially ${detail}`:''}. Here is the practical plan Keneflex would have you follow.</div>
  <section class="grid">
    <article class="step"><div class="visual">${kfxIActivitySVG()}</div><span class="num">1</span><h2>Change what is aggravating it</h2><p>${kfxIActivityTip()}</p></article>
    <article class="step"><div class="visual"><img src="${supportImg}" alt="Recommended wrist and thumb support"></div><span class="num">2</span><h2>Use the support where it helps</h2><p>Use the recommended wrist/thumb support for the activities Keneflex identified as aggravating, if it is comfortable and consistent with the product directions. The goal is useful support, not automatically wearing it all day.</p></article>
    <article class="step"><div class="visual">${kfxHColdSVG()}</div><span class="num">3</span><h2>Recover after aggravating use</h2><p>${coldText} ${topicalText}</p></article>
    <article class="step"><div class="visual">${kfxHMotionSVG()}</div><span class="num">4</span><h2>Keep comfortable movement</h2><p>Keep the wrist and thumb moving gently through comfortable ranges instead of forcing stretches or motions that clearly make the area feel worse.</p></article>
  </section>
  <section class="check"><h2>Then tell Keneflex what happened</h2><p><b>If you are improving:</b> keep the parts that are helping; there is no reason to add more just because more options exist.</p><p><b>If you are not improving:</b> tell Keneflex what changed, what did not, and anything new. That information should change what Keneflex considers next.</p></section>
  <div class="actions"><button onclick="window.print()">Print / save this plan</button><button onclick="window.close()">Close</button></div>
  <p class="fine">Prototype self-care guide. Follow product labels and any instructions from your own healthcare professional. This sheet demonstrates the intended Keneflex experience and is not a substitute for professional care when that is needed.</p>
  </main></body></html>`;
  const w=window.open('','_blank');
  if(!w){modalContent.innerHTML='<h2>Your at-home plan</h2><p>Your browser blocked the printable window. Allow pop-ups for this prototype and try again.</p>';modal.classList.remove('hidden');return;}
  w.document.open();w.document.write(html);w.document.close();
};
