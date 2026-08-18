/* Keneflex 0.4.4W — P0 story-quality gate.
   Fixes the pre-human blockers found in founder QA:
   - make the homepage immediately explain when Keneflex is useful
   - distinguish PRESENT / DENIED / UNKNOWN facts in natural-language stories
   - carry provider instructions and existing-product information forward
   - preserve thumb-side-of-wrist relationships instead of flattening anatomy
   - extract common natural-language duration phrases
   - remove already-answered pattern choices from follow-up questions
   - stop presenting the personalized care packet as having "$0 value"
*/
(function(){
  const priorParse=typeof parseDetail==='function'?parseDetail:null;
  const priorAskDetail=typeof askDetail==='function'?askDetail:null;
  const priorMulti=typeof multiselect==='function'?multiselect:null;
  const priorShowSolution=typeof showSolution==='function'?showSolution:null;

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function ensureStoryState(){
    state.storyFacts=state.storyFacts||{};
    state.storyFacts.status=state.storyFacts.status||{};
    state.explicitDenied=state.explicitDenied||new Set();
    state.explicitPresent=state.explicitPresent||new Set();
    state.patternDenied=state.patternDenied||new Set();
  }

  const featurePatterns={
    pain:/\b(pain|painful|ache|aching|sore|soreness|hurt|hurting|tender|tenderness)\b/i,
    swelling:/\b(swelling|swollen|swell|swells)\b/i,
    stiff:/\b(stiff|stiffness)\b/i,
    neuro:/\b(numb|numbness|tingle|tingling|pins\s*(?:and|&)\s*needles|altered feeling|loss of feeling)\b/i,
    weakness:/\b(weak|weakness)\b/i,
    skin:/\b(rash|itch|itching|red skin|skin change|skin changes)\b/i,
    wound:/\b(open wound|cut|wound|burn|skin breakdown)\b/i,
    color:/\b(color change|colour change|temperature change|blue|pale|cold to the touch)\b/i
  };

  function clauses(text){
    return String(text||'')
      .replace(/[’]/g,"'")
      .split(/(?:[.!?;]+|\bbut\b|\bhowever\b|\band now\b)/i)
      .map(x=>x.trim()).filter(Boolean);
  }
  function isNegated(clause,index){
    const before=clause.slice(Math.max(0,index-70),index).toLowerCase();
    if(/(?:^|\b)(?:no|not|never|without|deny|denies|denied)\b[^.!?;]{0,55}$/.test(before))return true;
    if(/(?:don't|do not|doesn't|does not|didn't|did not|haven't|have not|hasn't|has not|isn't|is not|wasn't|was not|weren't|were not)\b[^.!?;]{0,55}$/.test(before))return true;
    if(/^\s*(?:i\s+)?(?:have\s+|had\s+)?no\b/i.test(clause)&&index<90)return true;
    return false;
  }
  function applyFeatureStatus(text){
    ensureStoryState();
    Object.entries(featurePatterns).forEach(([key,re])=>{
      let last=null;
      clauses(text).forEach(c=>{
        const m=c.match(re);if(!m)return;
        const idx=m.index||0;
        last=isNegated(c,idx)?'denied':'present';
      });
      if(!last)return;
      state.storyFacts.status[key]=last;
      if(last==='denied'){
        state.explicitDenied.add(key);state.explicitPresent.delete(key);
        if(state.features&&state.features.delete)state.features.delete(key);
      }else{
        state.explicitPresent.add(key);state.explicitDenied.delete(key);
        if(state.features&&state.features.add)state.features.add(key);
      }
    });
  }

  const numberWords={a:1,an:1,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12};
  function durationFrom(text){
    const s=String(text||'').toLowerCase().replace(/[’]/g,"'");
    if(/\byesterday\b/.test(s))return 'since yesterday';
    if(/\btoday\b/.test(s)&&/start|began|since/.test(s))return 'since today';
    if(/\b(?:a\s+)?couple\s+(?:of\s+)?days?\b/.test(s))return 'a couple of days';
    if(/\b(?:a\s+)?few\s+days?\b/.test(s))return 'a few days';
    if(/\blast\s+week\b/.test(s))return 'since last week';
    if(/\blast\s+month\b/.test(s))return 'since last month';
    const m=s.match(/\b(?:for\s+|about\s+|around\s+|roughly\s+|nearly\s+|almost\s+)?(\d+|a|an|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s*(day|days|week|weeks|month|months)\b/);
    if(!m)return '';
    const raw=m[1],n=/^\d+$/.test(raw)?Number(raw):(numberWords[raw]||raw);
    const unit=m[2];
    return `${n===1?'1':n} ${unit.replace(/s$/,'')}${n===1?'':'s'}`;
  }

  function explicitTraumaStatus(text){
    const s=String(text||'').toLowerCase().replace(/[’]/g,"'");
    const denied=/\b(no (?:specific )?(?:injury|trauma|fall)|no particular injury|don't remember (?:a|one|any) (?:specific )?injury|do not remember (?:a|one|any) (?:specific )?injury|didn't fall|did not fall|wasn't from a fall|was not from a fall|nothing happened|no single event)\b/.test(s);
    if(denied)return 'denied';
    const present=/\b(fell|fall|fallen|hit it|direct blow|blow to|twisted it|sudden twist|specific injury|injured it|injury happened)\b/.test(s);
    return present?'present':'';
  }

  function extractPatternFacts(text){
    ensureStoryState();
    const s=String(text||'').toLowerCase().replace(/[’]/g,"'");
    const rules=[
      ['night',/\b(at night|nighttime|night time)\b/,/\b(not|never|doesn't|does not|isn't|is not)\b[^.!?;]{0,25}\b(at night|nighttime|night time)\b/],
      ['wake',/\b(wakes? me up|waking me up|wake up because|woken up by)\b/,/\b(doesn't|does not|never|not)\b[^.!?;]{0,25}\b(wake|wakes|waking)\b/],
      ['rest',/\b(at rest|while resting|even when (?:i'm|im|i am) not using)\b/,/\b(not|never|doesn't|does not)\b[^.!?;]{0,25}\b(at rest|while resting|resting)\b/],
      ['morning',/\b(in the morning|first thing in the morning|morning stiffness)\b/,/\b(not|never|doesn't|does not)\b[^.!?;]{0,25}\bmorning\b/],
      ['constant',/\b(constant|constantly|all the time)\b/,/\b(not constant|isn't constant|is not constant)\b/],
      ['intermittent',/\b(comes and goes|off and on|intermittent)\b/,null]
    ];
    rules.forEach(([key,pos,neg])=>{
      if(neg&&neg.test(s)){state.patternDenied.add(key);if(state.pattern&&state.pattern.delete)state.pattern.delete(key);return;}
      if(pos.test(s)){state.pattern.add(key);state.patternDenied.delete(key);}
    });
  }

  function extractProviderInstruction(text){
    const raw=String(text||'').trim();const s=raw.toLowerCase().replace(/[’]/g,"'");
    const provider=/\b(doctor|dr\.?|provider|physician|physical therapist|pt|occupational therapist|ot|chiropractor|surgeon|urgent care|clinician)\b/;
    const directive=/\b(told|recommended|advised|instructed|said i should|wants? me to|asked me to|prescribed)\b/;
    if(provider.test(s)&&directive.test(s)){
      state.providerInstruction={present:true,text:raw};
      state.storyFacts.providerInstruction='present';
    }
  }

  function extractExistingProduct(text){
    const raw=String(text||'').trim();const s=raw.toLowerCase().replace(/[’]/g,"'");
    const product=/\b(brace|support|splint|cold pack|ice pack|heating pad|heat wrap|tens|cream|gel|biofreeze|wrap)\b/;
    const own=/\b(i already have|i already own|i own|i have an? |i've got|i have got|already using|already wear|already wearing)\b/;
    if(!product.test(s)||!own.test(s))return;
    let status='needs-check';
    if(/\b(old|stretched|stretched out|torn|ripped|broken|dirty|smells?|worn out|worn down|doesn't fit|does not fit|too tight|too loose|expired)\b/.test(s))status='problem';
    else if(/\b(fits well|fits fine|good condition|clean and intact|works well|working well|comfortable and intact)\b/.test(s))status='appears-usable';
    state.existingProduct={present:true,text:raw,status};
    state.storyFacts.existingProduct=status;
  }

  function fixAnatomyRelationship(text){
    const s=String(text||'').toLowerCase();
    if(/\b(thumb[- ]side (?:of )?(?:my |the )?wrist|radial side (?:of )?(?:my |the )?wrist)\b/.test(s)){
      state.subLocation='thumb-side of wrist';
      if(state.location&&state.location.add)state.location.add('wrist');
      // Do not turn "thumb side of the wrist" into two separate symptomatic regions
      // unless the consumer separately says the thumb itself also hurts.
      const stripped=s.replace(/thumb[- ]side (?:of )?(?:my |the )?wrist/g,'');
      if(!/\bthumb\b/.test(stripped)&&state.location&&state.location.delete)state.location.delete('thumb');
    }
  }

  function interpretText(text){
    ensureStoryState();
    const d=durationFrom(text);if(d)state.duration=d;
    applyFeatureStatus(text);
    extractPatternFacts(text);
    fixAnatomyRelationship(text);
    extractProviderInstruction(text);
    extractExistingProduct(text);
    const trauma=explicitTraumaStatus(text);
    if(trauma==='denied'){state.trauma='gradual';state.storyFacts.trauma='denied';}
    if(trauma==='present'){state.trauma='trauma';state.storyFacts.trauma='present';}
    return state.storyFacts;
  }

  if(priorParse){
    parseDetail=function(t){
      priorParse(t);
      interpretText(t);
    };
  }
  window.kfxStoryInterpret=interpretText;

  function locSummary(){
    if(state.subLocation)return state.subLocation;
    if(state.location&&state.location.size)return Array.from(state.location).join(' + ');
    return state.region||'';
  }
  function symptomSummaryW(){
    ensureStoryState();const yes=[],no=[];
    const labels={pain:'pain/soreness',swelling:'swelling',stiff:'stiffness',neuro:'numbness/tingling',weakness:'weakness',skin:'skin changes',wound:'wound/skin breakdown',color:'color/temperature change'};
    Object.keys(labels).forEach(k=>{
      if(state.explicitPresent.has(k))yes.push(labels[k]);
      if(state.explicitDenied.has(k))no.push(labels[k]);
    });
    return {yes,no};
  }
  function storyReflectionHTML(){
    const bits=[];const loc=locSummary(),sx=symptomSummaryW();
    if(loc)bits.push(`<b>Area:</b> ${esc((state.side&&state.side!=='unsure'?state.side+' ':'')+loc)}`);
    if(sx.yes.length)bits.push(`<b>You are noticing:</b> ${esc(sx.yes.join(', '))}`);
    if(sx.no.length)bits.push(`<b>You specifically said no:</b> ${esc(sx.no.join(', '))}`);
    if(state.duration)bits.push(`<b>Timing:</b> ${esc(state.duration)}`);
    if(state.triggerSummary||state.triggerDetail)bits.push(`<b>Connected with:</b> ${esc(state.triggerDetail||state.triggerSummary)}`);
    if(state.storyFacts&&state.storyFacts.trauma==='denied')bits.push('<b>Specific injury:</b> you did not report one');
    if(state.providerInstruction&&state.providerInstruction.present)bits.push('<b>Provider instruction:</b> captured and treated as a constraint');
    if(state.existingProduct&&state.existingProduct.present)bits.push(`<b>Product you already own:</b> captured${state.existingProduct.status==='problem'?' — condition concerns noted':''}`);
    if(!bits.length)return '';
    return `<div class="kfxWHeard"><div class="kfxWHeardTitle">Here’s what Keneflex heard from your story.</div>${bits.map(x=>`<div class="kfxWFact">${x}</div>`).join('')}<div class="kfxWHeardFoot">Keneflex will carry these answers forward and only ask about gaps that could still change safety or the recommendation.</div></div>`;
  }

  if(priorAskDetail){
    askDetail=function(){
      ensureStoryState();
      if(!state._kfxWReflected){
        state._kfxWReflected=true;
        const html=storyReflectionHTML();if(html)addAI(html);
        if(state.providerInstruction&&state.providerInstruction.present){
          addAI('<b>I caught the provider instruction.</b> Keneflex will treat it as a governing constraint and should not recommend something that competes with it.');
        }
      }
      if(state.existingProduct&&state.existingProduct.status==='needs-check'&&!state._kfxWExistingChecked){
        state._kfxWExistingChecked=true;
        addAI('<b>You already own something that may fill part of the plan.</b> Before Keneflex recommends another one, it should check whether yours is actually usable.');
        oneSelect('How is the product you already own?','Think fit, condition, cleanliness and whether it still does the job.',[
          {value:'usable',label:'It fits, is in good condition, and seems to do its job'},
          {value:'problem',label:'It is worn, damaged, dirty, expired, uncomfortable, or does not fit well'},
          {value:'unsure',label:'I’m not sure whether it is still the right product for me'}
        ],v=>{state.existingProduct.status=v==='usable'?'appears-usable':v==='problem'?'problem':'uncertain';priorAskDetail();});
        return;
      }
      priorAskDetail();
    };
  }

  if(priorMulti){
    multiselect=function(title,hint,opts,nextLabel,cb){
      if(/Anything else you.ve noticed|Does it also show up/i.test(title||'')){
        ensureStoryState();
        const known=state.pattern||new Set(),denied=state.patternDenied||new Set();
        const terminal=new Set(['noneOther','unsure','known']);
        const filtered=(opts||[]).filter(o=>terminal.has(o.value)||(!known.has(o.value)&&!denied.has(o.value)));
        const meaningful=filtered.filter(o=>!terminal.has(o.value));
        if(!meaningful.length){
          addAI('You already covered the timing patterns I would have asked about, so I’m not going to make you answer them again.');
          setTimeout(()=>cb(new Set()),0);return;
        }
        opts=filtered;
        hint='I removed the timing patterns you already told Keneflex about. Pick only anything additional that applies, or choose the last option.';
      }
      priorMulti(title,hint,opts,nextLabel,cb);
    };
  }

  function orientHomepage(){
    const hero=document.querySelector('#intro .hero');
    if(hero){
      const eyebrow=hero.querySelector('.eyebrow');if(eyebrow)eyebrow.textContent='Prototype 0.4.4W • P0 readiness';
      const h=hero.querySelector('h1');if(h)h.textContent='Pain, strain, or an injury? Start here.';
      const p=hero.querySelector(':scope > p');if(p)p.innerHTML='<b>Tell Keneflex what’s bothering you.</b> Keneflex helps you decide what to do next, what may help, what to buy or keep, and when self-care is not the right next step.';
      const pills=hero.querySelectorAll('.promise .pill');
      const labels=['New pain or strain','Sports / overuse','Not sure what to buy or do'];
      pills.forEach((x,i)=>{if(labels[i])x.textContent=labels[i];});
    }
    const card=document.querySelector('#intro .introCard');
    if(card){
      const q=card.querySelector('.question');if(q)q.textContent='What’s bothering you?';
      const help=card.querySelector('.help');if(help)help.innerHTML='Tell the story in your own words. <b>Include anything you already know — where it hurts, what it feels like, how it started, what brings it on, what you have tried, or what a provider told you.</b>';
      const micro=card.querySelector('.micro');if(micro)micro.textContent='Keneflex reads what you already told it and asks only for missing information that could change the answer.';
      if(window.opening)opening.placeholder='For example: My right wrist has hurt on the thumb side for about three weeks after pickleball. No numbness or swelling. I already have an old brace that does not fit well.';
    }
  }

  function fixCarePlanValueLanguage(){
    const packet=document.getElementById('kfxVPacketValue');
    if(packet){
      const price=packet.querySelector('.kfxVPacketPrice');
      if(price)price.innerHTML='Included<small>with your Keneflex plan</small>';
    }
    document.querySelectorAll('#solutionView .help,#solutionView .micro').forEach(el=>{
      el.innerHTML=el.innerHTML
        .replace(/included at \$0/gi,'included with your plan at no additional charge')
        .replace(/included with your solution at \$0/gi,'included with your solution at no additional charge')
        .replace(/Self-care is included at \$0\.?/gi,'Your personalized care plan is included with your solution at no additional charge.');
    });
  }

  function renderCarriedForward(){
    if(document.getElementById('kfxWCarry'))return;
    if(!(state.providerInstruction||state.existingProduct))return;
    const main=document.querySelector('#solutionView .main');if(!main)return;
    const first=main.querySelector('.block');if(!first)return;
    const box=document.createElement('div');box.id='kfxWCarry';box.className='block';
    let html='<div class="eyebrow">CARRIED FORWARD FROM YOUR STORY</div><h2>Keneflex did not forget what you already told it.</h2>';
    if(state.providerInstruction&&state.providerInstruction.present)html+=`<p><b>Provider instruction:</b> ${esc(state.providerInstruction.text)}<br><span class="help">This is a constraint on the Keneflex plan. Keneflex should not recommend a conflicting product or use schedule.</span></p>`;
    if(state.existingProduct&&state.existingProduct.present){const label=state.existingProduct.status==='appears-usable'?'appears potentially usable':state.existingProduct.status==='problem'?'has condition/fit concerns':'still needs verification';html+=`<p><b>Product you already own:</b> ${esc(state.existingProduct.text)}<br><span class="help">Status: ${esc(label)}. Ownership alone is not treated as proof that the product should be kept.</span></p>`;}
    box.innerHTML=html;main.insertBefore(box,first);
  }

  if(priorShowSolution){
    showSolution=function(){priorShowSolution();setTimeout(()=>{fixCarePlanValueLanguage();renderCarriedForward();},30);};
  }

  const style=document.createElement('style');style.id='kfxWStyle';style.textContent=`
    .kfxWHeard{margin:8px 0 2px;border:1px solid #cad9cf;border-radius:16px;background:#f5faf5;padding:14px}.kfxWHeardTitle{font-weight:950;margin-bottom:8px}.kfxWFact{font-size:12px;line-height:1.45;margin:4px 0;color:#4e655d}.kfxWFact b{color:var(--ink)}.kfxWHeardFoot{font-size:11px;line-height:1.45;color:var(--muted);margin-top:9px;padding-top:8px;border-top:1px solid #dce6df}`;document.head.appendChild(style);

  orientHomepage();
})();
