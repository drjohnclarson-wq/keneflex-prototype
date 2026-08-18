/* Keneflex 0.4.4X — regression hardening for the P0 story-quality gate.
   Tightens negation scope and non-traumatic language after automated story tests.
*/
(function(){
  const priorParse=typeof parseDetail==='function'?parseDetail:null;
  if(!priorParse)return;

  const patterns={
    pain:/\b(pain|painful|ache|aching|sore|soreness|hurt|hurts|hurting|tender|tenderness)\b/i,
    swelling:/\b(swelling|swollen|swell|swells)\b/i,
    stiff:/\b(stiff|stiffness)\b/i,
    neuro:/\b(numb|numbness|tingle|tingling|pins\s*(?:and|&)\s*needles|altered feeling|loss of feeling)\b/i,
    weakness:/\b(weak|weakness)\b/i,
    skin:/\b(rash|itch|itching|red skin|skin change|skin changes)\b/i,
    wound:/\b(open wound|cut|wound|burn|skin breakdown)\b/i,
    color:/\b(color change|colour change|temperature change|blue|pale|cold to the touch)\b/i
  };

  function ensure(){
    state.storyFacts=state.storyFacts||{};state.storyFacts.status=state.storyFacts.status||{};
    state.explicitDenied=state.explicitDenied||new Set();state.explicitPresent=state.explicitPresent||new Set();
  }
  function clauses(text){
    return String(text||'').replace(/[’]/g,"'")
      .split(/(?:[.!?;]+|,\s*(?=(?:but\s+)?(?:i|it|there|my|the|this|that)\b)|\bbut\b|\bhowever\b|\band now\b|\band\s+(?=(?:i|it|there|my|the|this|that)\b))/i)
      .map(x=>x.trim()).filter(Boolean);
  }
  function negated(clause,index){
    const before=clause.slice(Math.max(0,index-65),index).toLowerCase();
    if(/(?:^|\b)(?:no|not|never|without|deny|denies|denied)\b[^.!?;]{0,50}$/.test(before))return true;
    if(/(?:don't|do not|doesn't|does not|didn't|did not|haven't|have not|hasn't|has not|isn't|is not|wasn't|was not|weren't|were not)\b[^.!?;]{0,50}$/.test(before))return true;
    return false;
  }
  function correctFeatures(text){
    ensure();
    Object.entries(patterns).forEach(([key,re])=>{
      let status='';
      clauses(text).forEach(c=>{const m=c.match(re);if(m)status=negated(c,m.index||0)?'denied':'present';});
      if(!status)return;
      state.storyFacts.status[key]=status;
      if(status==='denied'){
        state.explicitDenied.add(key);state.explicitPresent.delete(key);if(state.features&&state.features.delete)state.features.delete(key);
      }else{
        state.explicitPresent.add(key);state.explicitDenied.delete(key);if(state.features&&state.features.add)state.features.add(key);
      }
    });
  }
  function correctTrauma(text){
    const s=String(text||'').toLowerCase().replace(/[’]/g,"'");
    const denied=/\b(no (?:specific |particular )?(?:injury|trauma|fall)|no single event|don't remember (?:(?:a|one|any) )?(?:specific |particular )?(?:injury|event|fall)|do not remember (?:(?:a|one|any) )?(?:specific |particular )?(?:injury|event|fall)|didn't fall|did not fall|wasn't from a fall|was not from a fall|nothing happened)\b/.test(s);
    if(denied){state.storyFacts=state.storyFacts||{};state.storyFacts.trauma='denied';state.trauma='nontraumatic';return;}
    const positive=/\b(fell|fallen|i fall|hit it|direct blow|blow to|twisted it|sudden twist|specific injury|injured it|injury happened)\b/.test(s);
    if(positive){state.storyFacts=state.storyFacts||{};state.storyFacts.trauma='present';state.trauma='trauma';}
  }

  parseDetail=function(t){priorParse(t);correctFeatures(t);correctTrauma(t);};

  // Keep the public QA hook aligned with the final parser rather than the pre-regression layer.
  window.kfxStoryParse=function(text){parseDetail(text);return state.storyFacts;};

  if(typeof opening!=='undefined'&&opening){
    opening.placeholder='For example: My right wrist has hurt on the thumb side for about three weeks after pickleball. No numbness or swelling. I already have an old brace that does not fit well.';
  }
})();
