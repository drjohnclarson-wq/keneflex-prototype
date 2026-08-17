/* Keneflex 0.4.4U — front-load the consumer story.
   One broad, high-value opening invitation before structured prompts. The consumer
   can give as much as they know; Keneflex extracts it and only follows gaps that
   can change the recommendation. */
(function(){
  function style(){
    if(document.getElementById('kfxUStyle'))return;
    const s=document.createElement('style');s.id='kfxUStyle';
    s.textContent=`
      .kfxUCues{display:flex;flex-wrap:wrap;gap:7px;margin:10px 0 2px}
      .kfxUCue{display:inline-flex;padding:6px 9px;border-radius:999px;background:#eef3ec;border:1px solid #d9e2da;color:#586d66;font-size:10px;font-weight:800}
      .kfxUReassure{margin-top:8px;font-size:11px;line-height:1.45;color:var(--muted)}
    `;document.head.appendChild(s);
  }

  function orient(){
    style();
    const hero=document.querySelector('#intro .hero');
    if(hero){
      const h=hero.querySelector('h1');if(h)h.textContent='Tell Keneflex what’s going on.';
      const p=hero.querySelector(':scope > p');
      if(p)p.innerHTML='<b>Give Keneflex the whole story in your own words.</b> The more useful detail you can share up front, the fewer follow-up questions Keneflex may need before it can build your plan.';
    }
    const card=document.querySelector('#intro .introCard');
    if(!card)return;
    const q=card.querySelector('.question');if(q)q.textContent='Tell Keneflex everything you can about what’s going on.';
    const help=card.querySelector('.help');
    if(help){
      help.innerHTML='No medical terms or perfect explanation needed. Include anything you think may matter.';
      if(!document.getElementById('kfxUCues')){
        help.insertAdjacentHTML('afterend','<div class="kfxUCues" id="kfxUCues"><span class="kfxUCue">Where you feel it</span><span class="kfxUCue">What it feels like</span><span class="kfxUCue">How long</span><span class="kfxUCue">When it happens</span><span class="kfxUCue">What brings it on</span><span class="kfxUCue">What helps</span><span class="kfxUCue">Anything unusual</span></div><div class="kfxUReassure">Don’t know all of that? No problem. Start with what you know — Keneflex will fill in only what still matters.</div>');
      }
    }
    if(window.opening)opening.placeholder='For example: describe where it bothers you, what you notice, when it happens, and anything else you think is connected.';
    const micro=card.querySelector('.micro');
    if(micro)micro.textContent='One message is easiest. Keneflex will pull out the useful details.';
  }

  function disclosureDimensions(){
    let n=0;
    if(state.region||state.location.size)n++;
    if(state.features.size||state.otherDetail||state.spontaneousDropping)n++;
    if(state.duration)n++;
    if(state.triggerSummary||state.triggerDetail)n++;
    if(state.pattern&&state.pattern.size)n++;
    if(state.side)n++;
    if(state.trauma)n++;
    return n;
  }

  const priorAskDetail=typeof askDetail==='function'?askDetail:null;
  if(priorAskDetail){
    askDetail=function(){
      state.initialStoryWords=(state.opening||'').trim().split(/\s+/).filter(Boolean).length;
      state.initialStoryDimensions=disclosureDimensions();
      if(state.initialStoryDimensions>=4){
        addAI('That gave Keneflex a lot to work with. Keneflex will only ask about the gaps that could still change the recommendation.');
      }
      priorAskDetail();
    };
  }

  orient();
})();
