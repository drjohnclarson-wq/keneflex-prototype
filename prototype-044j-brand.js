/* Keneflex 0.4.4j — brand-voice consistency gate before P0.
   Purpose: remove remaining first-person / quasi-clinical language from the
   participant-facing answer layer without changing reasoning or test logic. */
(function(){
  function setText(sel,text){const el=document.querySelector(sel);if(el)el.textContent=text;}

  // Opening promise: Keneflex is the speaker/brand, not an unnamed clinician.
  const hero=document.querySelector('#intro .hero');
  if(hero){
    setText('#intro .hero h1','Tell Keneflex what’s bothering you.');
    const p=hero.querySelector(':scope > p');
    if(p)p.textContent='Start in your own words. You don’t need to know what it is or what product you need — Keneflex should figure out what matters.';
    const pills=hero.querySelectorAll('.promise .pill');
    const copy=['Talk naturally','Keneflex asks what matters','Keneflex shows where it would start'];
    pills.forEach((el,i)=>{if(copy[i])el.textContent=copy[i];});
  }

  // Solution headings/copy are patched again here so the participant never
  // encounters the older first-person language if a prior cosmetic hook misses.
  function polishSolution(){
    setText('#solutionView .solHero h1','Here’s what Keneflex recommends.');
    const lead=document.getElementById('solutionLead');
    if(lead)lead.textContent='Based on what you told Keneflex, the plan combines support, recovery and practical at-home changes chosen for the way this is showing up for you.';
    const heroB=document.querySelector('#solutionView .heroBox b');
    if(heroB)heroB.textContent='Why Keneflex is starting here';
    const conf=document.getElementById('confidenceCopy');
    if(conf)conf.textContent='What you told Keneflex gives it enough to suggest a reasonable first plan. Try it, see how your hand responds, and tell Keneflex what happens next.';

    document.querySelectorAll('#solutionView h2').forEach(h=>{
      const t=h.textContent.trim();
      if(t==='What I did not add')h.textContent='What Keneflex left out';
      if(t==='Adjust my solution')h.textContent='Adjust your solution';
      if(t==='Then tell me what happened.')h.textContent='Then tell Keneflex what happened.';
    });

    const tune=document.querySelector('#solutionView .tune .help');
    if(tune)tune.textContent='Start with Keneflex’s best recommendation, then add what is true in real life. Keneflex should re-solve the plan rather than hand the shopping decision back to you.';

    const cart=document.getElementById('cartPreviewBtn');
    if(cart)cart.textContent='Put my current solution in my cart →';
  }

  // showSolution is the stable transition into the recommendation. Wrap it so
  // dynamic copy is polished after every recommendation render.
  if(typeof showSolution==='function'){
    const prior=showSolution;
    showSolution=function(){prior();polishSolution();};
  }
  polishSolution();

  // Keep the research question consumer-facing: evidence is for the whole plan,
  // not a brace-only proof exercise.
  document.querySelectorAll('#solutionView details summary').forEach(s=>{
    if(s.textContent.trim()==='See evidence confidence & uncertainty')s.textContent='How sure Keneflex is — and what it still doesn’t know';
    if(s.textContent.trim()==='Source transparency')s.textContent='Where Keneflex got the information';
  });
})();
