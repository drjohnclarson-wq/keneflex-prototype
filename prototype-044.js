const state={
  opening:'',detail:'',features:new Set(),location:new Set(),duration:'',pattern:new Set(),
  trigger:'',triggerSummary:'',activity:'',trauma:'',redFlags:new Set(),wrist:'',step:0,
  ownedCold:false,noTopical:false,budget:false,relief:'',goal:'',gripConcern:'',region:''
};

const intro=document.getElementById('intro'),chatView=document.getElementById('chatView'),solutionView=document.getElementById('solutionView'),conversation=document.getElementById('conversation'),interaction=document.getElementById('interaction'),prog=document.getElementById('prog');
const opening=document.getElementById('opening'),openingBtn=document.getElementById('openingBtn');
opening.placeholder='For example: My hand hurts after I use my phone for a while.';
opening.addEventListener('input',()=>openingBtn.disabled=opening.value.trim().length<3);
openingBtn.addEventListener('click',()=>{
  state.opening=opening.value.trim();
  parseDetail(state.opening);
  intro.classList.add('hidden');chatView.classList.remove('hidden');addUser(state.opening);
  setTimeout(()=>askDetail(),180);
});

function addAI(html){const d=document.createElement('div');d.className='bubble ai';d.innerHTML='<b>Keneflex</b>'+html;conversation.appendChild(d);window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'})}
function addUser(text){const d=document.createElement('div');d.className='bubble user';d.textContent=text;conversation.appendChild(d)}
function setProgress(n){prog.style.width=Math.max(8,Math.min(100,n))+'%'}
function textComposer(placeholder,buttonText,cb){interaction.innerHTML=`<textarea id="reply" placeholder="${placeholder}"></textarea><div class="row"><button id="send" class="primary">${buttonText}</button></div>`;document.getElementById('reply').focus();document.getElementById('send').onclick=()=>{const v=document.getElementById('reply').value.trim();if(!v)return;addUser(v);interaction.innerHTML='';cb(v)}}
function multiselect(title,hint,opts,nextLabel,cb){interaction.innerHTML=`<div class="selectHead">${title}</div><div class="selectHint">${hint}</div><div class="options" id="opts"></div><div class="row"><button id="nextMulti" class="primary">${nextLabel}</button></div>`;const box=document.getElementById('opts'),sel=new Set();opts.forEach(o=>{const b=document.createElement('button');b.className='opt'+(o.wide?' wide':'');b.innerHTML=o.label+(o.small?`<small>${o.small}</small>`:'');b.onclick=()=>{if(o.single){sel.clear();[...box.children].forEach(x=>x.classList.remove('on'))}else{opts.filter(x=>x.single).forEach(x=>{sel.delete(x.value);const idx=opts.indexOf(x);if(box.children[idx])box.children[idx].classList.remove('on')})}if(sel.has(o.value)){sel.delete(o.value);b.classList.remove('on')}else{sel.add(o.value);b.classList.add('on')}};box.appendChild(b)});document.getElementById('nextMulti').onclick=()=>{if(!sel.size)return;const labels=[...sel].map(v=>opts.find(o=>o.value===v)?.label.replace(/<[^>]*>/g,'')||v);addUser(labels.join(', '));interaction.innerHTML='';cb(sel)}}
function oneSelect(title,hint,opts,cb){interaction.innerHTML=`<div class="selectHead">${title}</div><div class="selectHint">${hint}</div><div class="options" id="one"></div>`;const box=document.getElementById('one');opts.forEach(o=>{const b=document.createElement('button');b.className='opt'+(o.wide?' wide':'');b.innerHTML=o.label+(o.small?`<small>${o.small}</small>`:'');b.onclick=()=>{addUser(o.label.replace(/<[^>]*>/g,''));interaction.innerHTML='';cb(o.value)};box.appendChild(b)})}

function phraseTrigger(s){
  const bits=[];
  if(/cell\s*phone|phone|scroll/.test(s))bits.push('prolonged phone use');
  if(/work\s*out|workout|exercise|gym|lifting|weights/.test(s))bits.push('workouts/exercise');
  if(/typing|keyboard|mouse/.test(s))bits.push('typing/computer use');
  if(/grip|gripping|jar/.test(s))bits.push('gripping');
  if(/twist|twisting/.test(s))bits.push('twisting');
  if(/pickle/.test(s))bits.push('pickleball');
  return [...new Set(bits)].join(' and ');
}
function parseDetail(t){
  const s=(t||'').toLowerCase();
  if(/\bhand\b|finger|thumb|wrist|palm/.test(s))state.region='hand';
  if(/wrist/.test(s))state.location.add('wrist');
  if(/thumb/.test(s))state.location.add('thumb');
  if(/finger/.test(s))state.location.add('fingers');
  if(/palm/.test(s))state.location.add('palm');
  if(/ache|aching|sore|soreness|hurt|hurting|pain/.test(s))state.features.add('pain');
  if(/stiff/.test(s))state.features.add('stiff');
  if(/rash|itch|red skin|skin change/.test(s))state.features.add('skin');
  if(/swell/.test(s))state.features.add('swelling');
  if(/numb|tingl|pins|needles/.test(s))state.features.add('neuro');
  if(/weak/.test(s))state.features.add('weakness');
  if(/pickle/.test(s))state.activity='pickleball';
  const m=s.match(/(\d+)\s*(day|days|week|weeks|month|months)/);if(m)state.duration=m[1]+' '+m[2];
  const ts=phraseTrigger(s);if(ts){state.trigger=t;state.triggerSummary=ts;}
  if(/\bafter\b/.test(s)&&ts)state.pattern.add('after');
  if(/\bwhile\b|\bduring\b/.test(s)&&ts)state.pattern.add('use');
  if(/prolonged|repetitive|overuse|after .*phone|after .*workout|after .*exercise|after .*typing/.test(s))state.trauma='activity';
  if(/fall|fell|hit|blow|twist(ed)? it|injur/.test(s))state.trauma='trauma';
}
function openingHasUsefulDetail(){
  let score=0;
  if(state.region||state.location.size)score++;
  if(state.features.size)score++;
  if(state.triggerSummary||state.duration||state.pattern.size)score++;
  return score>=3 || (score>=2 && state.triggerSummary);
}
function reflectionFromOpening(){
  const clues=[];
  if(state.region==='hand')clues.push('your hand is the area bothering you');
  if(state.triggerSummary)clues.push(`it tends to show up around ${state.triggerSummary}`);
  if(state.duration)clues.push(`it has been going on for ${state.duration}`);
  return clues.join(', and ');
}

function askDetail(){
  setProgress(17);
  if(openingHasUsefulDetail()){
    const r=reflectionFromOpening();
    addAI(`I heard useful detail in that already${r?`: ${r}`:''}. I won’t make you repeat it. I want to understand what the area itself is doing when it bothers you.`);
    askBroad();
    return;
  }
  addAI(`Tell me a little more about that—what have you noticed? <span class="micro">Use normal words. If you’re not sure how to describe it, I’ll help narrow it down.</span>`);
  textComposer('For example: It aches after I use it, it feels stiff in the morning, it tingles at night…','Continue →',v=>{
    if(/answered.*above|already.*(said|told)|same as above/i.test(v)){
      addAI(`You’re right—I already have your first description. I won’t make you repeat it.`);
      parseDetail(state.opening);
    }else{state.detail=v;parseDetail(v)}
    askBroad();
  });
}

function askBroad(){
  setProgress(29);
  const alreadyPain=state.features.has('pain');
  addAI(alreadyPain?`You’ve already told me it hurts. I want to check what, if anything, comes with the pain because that can point me in a very different direction.`:`Before I assume this is a muscle-or-joint problem, I want to understand what kind of problem this may be.`);
  const opts=[];
  if(!alreadyPain)opts.push({value:'pain',label:'Pain / soreness'});
  opts.push(
    {value:'swelling',label:'Swelling'},{value:'stiff',label:'Stiffness'},{value:'neuro',label:'Numbness / tingling'},
    {value:'weakness',label:'Weakness'},{value:'skin',label:'Rash / redness / skin change'},{value:'wound',label:'Cut / wound / burn'},
    {value:'color',label:'Color or temperature change'},{value:'other',label:'Something else'},
    {value:'none',label:alreadyPain?'Nothing else — mainly the pain/soreness':'None of these',wide:true,single:true},{value:'unsure',label:'I’m not sure',wide:true,single:true}
  );
  multiselect(alreadyPain?'Anything else with it?':'What are you noticing?','Pick everything that applies. You do not need to select the pain again if you already told me about it.',opts,'Continue →',sel=>{
    sel.forEach(x=>{if(x!=='none'&&x!=='unsure')state.features.add(x)});
    if(sel.has('skin')||sel.has('wound')||sel.has('color'))addAI(`That extra detail matters. I would branch into skin, wound, or circulation questions before assuming a muscle-or-joint solution.`);
    askLocation();
  });
}

function askLocation(){
  setProgress(39);
  if(state.location.size)addAI(`You already mentioned the ${[...state.location].join(' and ')} area. I just want to make sure I have the location right.`);else addAI(`Let’s narrow down where in the hand it is bothering you most.`);
  multiselect('Where do you feel it?','Pick all that apply.',[
    {value:'thumb',label:'Thumb / base of thumb'},{value:'fingers',label:'Fingers'},{value:'palm',label:'Palm'},
    {value:'back',label:'Back of hand'},{value:'wrist',label:'Wrist'},{value:'pinky',label:'Pinky-side of hand/wrist'},
    {value:'diffuse',label:'Several areas / hard to pinpoint'}
  ],'Continue →',sel=>{state.location=sel;askOnset()});
}

function askOnset(){
  setProgress(49);
  if(state.trauma==='activity'){
    addAI(`You already told me this tends to happen with ${state.triggerSummary||'repeated use'}, so I’m not going to ask you to describe the onset again. I only need to check whether there was also a specific injury.`);
    oneSelect('Was there also a specific injury?','A fall, hit, sudden twist, or other clear event would change the path.',[
      {value:'activity',label:'No — no specific injury, it seems related to use'},{value:'trauma',label:'Yes — there was also a fall, hit, twist, or other injury'}
    ],v=>{state.trauma=v;if(v==='trauma')askSafety();else askDuration()});
    return;
  }
  addAI(`One thing that changes what I’d be comfortable suggesting is whether this followed an injury or came on more gradually.`);
  oneSelect('How did it start?','Choose the closest answer.',[
    {value:'gradual',label:'It came on gradually / I’m not sure exactly when'},{value:'activity',label:'I noticed it after repeated use or activity'},{value:'trauma',label:'After a fall, hit, twist, or other injury'}
  ],v=>{state.trauma=v;if(v==='trauma')askSafety();else askDuration()});
}

function askSafety(){
  setProgress(56);
  addAI(`Because there was an injury, I’d check a few things that can change whether a store product is the right next step.`);
  multiselect('Any of these now?','Pick all that apply.',[
    {value:'deformity',label:'Looks crooked or deformed'},{value:'move',label:'Can’t move it normally or can’t hold ordinary objects'},
    {value:'numb',label:'Loss of feeling in part or all of the hand'},{value:'weak',label:'Clear new weakness after the injury'},
    {value:'wound',label:'Open wound'},{value:'none',label:'None of these',wide:true,single:true}
  ],'Continue →',sel=>{state.redFlags=sel;if(!sel.has('none'))stopForCare('injury');else askDuration()});
}

function askDuration(){
  setProgress(59);
  if(state.duration){addAI(`You already said this has been going on for ${state.duration}. I won’t ask that again. The pattern of when it appears can be just as useful.`);askPattern();return;}
  addAI(`How long it’s been there helps, but I won’t stop at duration—I also care about when you notice it.`);
  oneSelect('How long has this been going on?','Closest answer is fine.',[
    {value:'days',label:'A few days or less'},{value:'1-2w',label:'About 1–2 weeks'},{value:'3w',label:'About 3 weeks'},
    {value:'month',label:'More than a month'},{value:'unsure',label:'I’m not sure'}
  ],v=>{state.duration=v;askPattern()});
}

function askPattern(){
  setProgress(67);
  const knowsAfter=state.pattern.has('after'),knowsUse=state.pattern.has('use');
  if(knowsAfter||knowsUse){
    addAI(`You already told me it shows up ${knowsAfter?'after':'while'} ${state.triggerSummary||'use'}. I’m keeping that. I just want to know whether there are other times that matter.`);
    multiselect('Does it also show up at any of these times?','Choose anything else that applies, or choose “mostly the pattern I already described.”',[
      {value:'morning',label:'First thing in the morning'},{value:'night',label:'At night'},{value:'wake',label:'It wakes me up'},
      {value:'constant',label:'Pretty much all the time'},{value:'intermittent',label:'It comes and goes'},
      {value:'known',label:'Mostly the use-related pattern I already described',wide:true,single:true},{value:'unsure',label:'I haven’t noticed another pattern',wide:true,single:true}
    ],'Continue →',sel=>{sel.forEach(x=>{if(x!=='known'&&x!=='unsure')state.pattern.add(x)});askTrigger()});
    return;
  }
  multiselect('When do you notice it most?','Pick all that apply. This helps me distinguish different patterns rather than treating every hand complaint the same.',[
    {value:'use',label:'While I’m using my hand'},{value:'after',label:'After activity / later that day'},{value:'morning',label:'First thing in the morning'},
    {value:'night',label:'At night'},{value:'wake',label:'It wakes me up'},{value:'constant',label:'Pretty much all the time'},
    {value:'intermittent',label:'It comes and goes'},{value:'unsure',label:'I haven’t noticed a pattern'}
  ],'Continue →',sel=>{state.pattern=sel;askTrigger()});
}

function askTrigger(){
  setProgress(74);
  if(state.trigger){
    addAI(`You already told me ${state.triggerSummary||'some of the things that aggravate it'}, so I won’t make you repeat that. What, if anything, makes it feel better?`);
    textComposer('Rest, changing position, ice, moving it around, nothing I’ve noticed…','Continue →',v=>{state.relief=v;askGoal()});
  }else{
    addAI(`What tends to bring it on or make it worse?`);
    textComposer('Gripping, twisting, typing, lifting, sleeping on it…','Continue →',v=>{state.trigger=v;state.triggerSummary=phraseTrigger(v.toLowerCase())||v;askGoal()});
  }
}

function askGoal(){
  setProgress(81);
  if(state.activity){addAI(`You mentioned ${state.activity}. I care about what you’re trying to keep doing, not asking you to choose the medical solution yourself.`);state.goal='keep '+state.activity;askSafetyBroad();return;}
  addAI(`What are you trying to keep doing—or get back to doing—without this getting in the way?`);
  textComposer('Work, sleep, using my phone, exercise, pickleball, lifting, everyday tasks…','Continue →',v=>{state.activity=v;state.goal=v;askSafetyBroad()});
}

function askSafetyBroad(){
  setProgress(88);
  addAI(`I’m close. A few symptoms can change whether self-care is the right next step, but I don’t want to overreact to a vague answer.`);
  multiselect('Have you noticed any of these?','Pick all that apply. The wording matters here.',[
    {value:'suddenWeak',label:'Sudden new weakness of the hand or arm',small:'Especially if it appeared abruptly.'},
    {value:'loss',label:'New loss of feeling in part or all of the hand',small:'Different from brief, occasional tingling.'},
    {value:'grip',label:'New/worsening grip weakness or frequent dropping',small:'Because the hand feels weak, numb, or unreliable.'},
    {value:'majorSwelling',label:'Major or rapidly increasing swelling'},{value:'fever',label:'Fever or feeling significantly unwell with a hot/red/swollen area'},
    {value:'deformity',label:'Obvious deformity'},{value:'open',label:'Open wound / significant skin breakdown'},
    {value:'none',label:'None of these',wide:true,single:true}
  ],'Continue →',sel=>{
    state.redFlags=sel;
    if(sel.has('suddenWeak')||sel.has('loss')||sel.has('deformity')||sel.has('open')||sel.has('majorSwelling')||sel.has('fever')){stopForCare('hard');return;}
    if(sel.has('grip')){clarifyGrip();return;}
    askFit();
  });
}

function clarifyGrip(){
  setProgress(90);
  addAI(`I want to clarify that before I label it a safety stop. Occasionally dropping something is too vague by itself. What matters is whether this represents a new or worsening loss of hand function.`);
  oneSelect('Which is closest?','Think about whether this is new, becoming more frequent, or accompanied by weakness/numbness.',[
    {value:'casual',label:'It happens occasionally, but it is not new or getting worse and my hand does not feel weak or numb'},
    {value:'changing',label:'It is new or happening more often, or my grip actually feels weaker/numb'},
    {value:'unsure',label:'I’m not sure — I just know I sometimes drop things'}
  ],v=>{
    if(v==='casual'){
      state.gripConcern='low';
      addAI(`That is different from a clear progressive weakness. I would keep it in mind, but I would not stop the entire self-care path on that answer alone.`);
      askFit();
    }else{clarifyGripFunction(v)}
  });
}

function clarifyGripFunction(source){
  setProgress(92);
  addAI(`That deserves one more question because the difference between occasional clumsiness and true loss of grip function matters.`);
  oneSelect('Can you grip and hold ordinary objects normally right now?','Choose the closest answer.',[
    {value:'normal',label:'Yes — I can hold normal objects; I have only noticed occasional episodes'},
    {value:'impaired',label:'No — my hand is clearly weaker or I cannot reliably hold ordinary objects'},
    {value:'sudden',label:'The weakness came on suddenly, or there are other sudden arm/face/speech symptoms'}
  ],v=>{
    if(v==='sudden'){stopForCare('sudden');return;}
    if(v==='impaired'){stopForCare('function');return;}
    state.gripConcern=source==='unsure'?'watch':'changed-but-function-intact';
    addAI(`I would not call that an emergency from this answer alone, but because you noticed a possible change in grip, I would flag it for follow-up rather than pretending it means nothing. We can still finish the conservative prototype plan while making the reassessment threshold explicit.`);
    askFit();
  });
}

function askFit(){
  setProgress(94);
  addAI(`Based on the pattern so far, I’m comfortable considering a conservative wrist/thumb-support plan. To choose a specific support, I need one fit detail.`);
  textComposer('Enter wrist circumference in inches (for the test, 7.0)','Use this measurement →',v=>{state.wrist=v||'7.0';showEnough()});
}

function stopForCare(reason){
  setProgress(100);
  let copy=`<strong>I wouldn’t force a store-product recommendation from this answer.</strong> I’d want this clarified by a healthcare professional before treating it as an ordinary self-care problem.`;
  if(reason==='sudden')copy=`<strong>This is not a “shop the aisle first” situation.</strong> Sudden new weakness—especially with other sudden neurologic symptoms—needs urgent medical evaluation.`;
  else if(reason==='function')copy=`<strong>Clear loss of grip function changes the plan.</strong> If you cannot reliably hold ordinary objects or the weakness is new/progressive, I’d want professional evaluation rather than guessing with a brace.`;
  else if(reason==='injury')copy=`<strong>The injury plus the finding you selected changes the safest next step.</strong> I would not jump straight to an over-the-counter product without evaluation.`;
  addAI(copy);
  interaction.innerHTML='<div class="notice warn">Keneflex stopped the shopping path because the clarified information—not a vague keyword—crossed the safety threshold.</div>';
}

function showEnough(){
  setProgress(100);addAI(`Okay—I think I have enough to tell you where I’d start.`);
  const summary=document.createElement('div');summary.className='card enough';summary.style.marginTop='12px';
  const grip=state.gripConcern?` I’m also keeping your comment about occasional dropping in the follow-up plan rather than treating it as an automatic emergency.`:'';
  summary.innerHTML=`<h2>Here’s the picture I’m working with.</h2><p>This is mainly a ${[...state.location].join(' + ')} problem with a ${state.triggerSummary||'use-related'} pattern. You want to keep doing ${state.activity||'your normal activities'}, and the information so far supports a conservative self-care trial rather than a more restrictive approach.${grip}</p><div class="row"><button id="seePlan" class="primary">Show me what you’d do →</button></div>`;
  interaction.replaceWith(summary);document.getElementById('seePlan').onclick=showSolution;
}
function showSolution(){chatView.classList.add('hidden');solutionView.classList.remove('hidden');renderWhy();window.scrollTo(0,0)}
function renderWhy(){
  const rows=document.getElementById('whyRows'),location=[...state.location].join(' + ')||'wrist/thumb area',activity=state.activity||'your activity',pattern=[...state.pattern].filter(x=>x!=='unsure').join(', ')||state.triggerSummary||'with use',wrist=state.wrist||'7.0';
  rows.innerHTML=`<div class="whyrow"><div class="whyIn"><b>You told me</b>${location}, mainly connected with ${state.triggerSummary||state.trigger||'use'}.</div><div class="arrow">→</div><div class="whyOut"><b>Why that matters</b>I looked for a support that covers the irritated area and works with the way the problem is actually showing up.</div></div><div class="whyrow"><div class="whyIn"><b>You want to keep doing</b>${activity}.</div><div class="arrow">→</div><div class="whyOut"><b>Why that matters</b>I ruled out more rigid options that would limit more useful motion than your current pattern appears to require.</div></div><div class="whyrow"><div class="whyIn"><b>The timing pattern</b>${pattern}.</div><div class="arrow">→</div><div class="whyOut"><b>Why that matters</b>That supports pairing the brace with load changes and recovery rather than treating the product as the whole solution.</div></div><div class="whyrow"><div class="whyIn"><b>Your fit</b>${wrist}-inch wrist.</div><div class="arrow">→</div><div class="whyOut"><b>Why that matters</b>Medium is the fit I’d use for the support shown in this prototype.</div></div>`;
}

function tune(kind){const r=document.getElementById('tuneResult');r.classList.remove('hidden');if(kind==='cold'){state.ownedCold=true;r.innerHTML='<b>Use yours.</b> If your cold pack is intact, clean, comfortable and works for the intended recovery role, I would not sell you another one. Your revised product total is <b>$31.98</b>.';document.getElementById('total').textContent='$31.98'}if(kind==='topical'){state.noTopical=true;r.innerHTML='<b>Remove the topical.</b> It is supportive, not essential. The brace + recovery + self-care plan remains coherent. Revised total: <b>$40.99</b>.';document.getElementById('total').textContent='$40.99'}if(kind==='budget'){state.budget=true;r.innerHTML='<b>I would protect the core plan before chasing the lowest price.</b> First remove the optional topical. If you already have an adequate cold option, use it. That brings the spend to <b>$19.99</b> without substituting a poorer-fitting primary support.';document.getElementById('total').textContent='$19.99'}}
document.querySelectorAll('[data-tune]').forEach(b=>b.addEventListener('click',()=>tune(b.dataset.tune)));

const modal=document.getElementById('modal'),modalContent=document.getElementById('modalContent');
const modalCopy={
  how:`<h2>How Keneflex works</h2><h3>1. Talk normally</h3><p>Start with whatever you know. You do not need the diagnosis, the right anatomy word, or a product in mind.</p><h3>2. I listen before I ask</h3><p>Keneflex should extract what you already told it, reflect that understanding, and only ask for information that is still missing and can change safety or the solution.</p><h3>3. I do the homework</h3><p>The intended production system combines clinical knowledge, conservative-care options, product evidence, expert practice, real-world success/failure patterns and Keneflex outcome data.</p><h3>4. I build the best complete plan</h3><p>That may include products, home care, behavior changes—or a recommendation not to buy something. Budget and preferences can adjust the plan afterward.</p><h3>5. We learn from what happens</h3><p>If the plan works, great. If not, Keneflex should reconsider the problem rather than blindly escalate products.</p>`,
  approach:`<h2>Our approach</h2><h3>Start with the problem, not the shelf.</h3><p>We are trying to remove decision work, not give you another catalog.</p><h3>Think broadly before narrowing.</h3><p>A vague complaint should not automatically become a product category. Keneflex should consider other relevant problem types and know when self-care is not the right next step.</p><h3>Clarify before escalating.</h3><p>A vague potentially concerning answer should trigger a better question, not an automatic panic response. Hard safety findings still stop commerce.</p><h3>Recommend what we would recommend to someone we care about.</h3><p>The default is the best coherent solution—not the smallest cart and not the largest cart.</p><h3>Evidence matters, but so does real-world experience.</h3><p>Strong evidence, conservative practice, expert observations and anecdotal patterns can all inform the search, but they should not be treated as equally certain.</p><h3>Commercial economics come after suitability.</h3><p>Keneflex may eventually earn money from purchases. That cannot make an option eligible or change which option wins.</p>`
};
document.querySelectorAll('[data-modal]').forEach(b=>b.onclick=()=>{modalContent.innerHTML=modalCopy[b.dataset.modal];modal.classList.remove('hidden')});
document.getElementById('closeModal').onclick=()=>modal.classList.add('hidden');modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.add('hidden')});