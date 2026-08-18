require('../prototype-046-conversation-engine.js');
const E=globalThis.KFX046;
let passed=0; const failures=[];
function pass(name,cond,detail=''){ if(cond) passed++; else failures.push({name,detail}); }
function run(text){ const s=E.createStore(); E.ingest(s,text); return {s,t:E.activeThread(s),q:E.nextQuestion(s),sum:E.summary(s)}; }
function vals(x,k){ return (x.t&&x.t[k])||[]; }
function noAskKnown(x){ return !x.q || !E.known(x.t,x.q.concept); }
function pair(name,a,b,check){ const A=run(a),B=run(b); pass(name,check(A,B),JSON.stringify({A:A.sum,Aq:A.q,B:B.sum,Bq:B.q})); pass(name+' · no known re-ask A',noAskKnown(A),A.q&&A.q.concept); pass(name+' · no known re-ask B',noAskKnown(B),B.q&&B.q.concept); }

// 50 one-variable mutation subjects recommended by the red-team: change one meaningful fact at a time.
const cases=[
['01 side hand L→R','My left hand hurts at the base of my thumb for 3 weeks after phone use.','My right hand hurts at the base of my thumb for 3 weeks after phone use.',(a,b)=>a.t.side==='left'&&b.t.side==='right'],
['02 side knee R→L','My right knee hurts under the kneecap for 2 weeks going downstairs.','My left knee hurts under the kneecap for 2 weeks going downstairs.',(a,b)=>a.t.side==='right'&&b.t.side==='left'],
['03 side ankle L→R','My left ankle hurts for 5 days after walking.','My right ankle hurts for 5 days after walking.',(a,b)=>a.t.side==='left'&&b.t.side==='right'],
['04 side shoulder R→L','My right shoulder aches for 4 days when reaching overhead.','My left shoulder aches for 4 days when reaching overhead.',(a,b)=>a.t.side==='right'&&b.t.side==='left'],
['05 unilateral→bilateral','My left wrist tingles at night for 3 weeks.','Both wrists tingle at night for 3 weeks.',(a,b)=>a.t.side==='left'&&b.t.side==='both'],
['06 body hand→knee','My right hand hurts for 3 weeks after typing.','My right knee hurts for 3 weeks after walking.',(a,b)=>a.t.family==='hand'&&b.t.family==='knee'],
['07 body knee→ankle','My right knee hurts for 3 weeks after walking.','My right ankle hurts for 3 weeks after walking.',(a,b)=>a.t.family==='knee'&&b.t.family==='ankle'],
['08 body ankle→foot','My right ankle hurts for 3 weeks after walking.','My right foot hurts for 3 weeks after walking.',(a,b)=>a.t.family==='ankle'&&b.t.family==='foot'],
['09 body elbow→shoulder','My left elbow hurts for 3 weeks after lifting.','My left shoulder hurts for 3 weeks after lifting.',(a,b)=>a.t.family==='elbow'&&b.t.family==='shoulder'],
['10 body neck→back','My neck aches for 3 weeks after computer use.','My back aches for 3 weeks after computer use.',(a,b)=>a.t.family==='neck'&&b.t.family==='back'],
['11 body back→hip','My left back hurts for 3 weeks after walking.','My left hip hurts for 3 weeks after walking.',(a,b)=>a.t.family==='back'&&b.t.family==='hip'],
['12 symptom pain→tingling','My right wrist hurts for 3 weeks after typing.','My right wrist tingles for 3 weeks after typing.',(a,b)=>vals(a,'symptoms').includes('pain')&&vals(b,'symptoms').includes('tingling')],
['13 symptom pain→numbness','My right wrist hurts for 3 weeks after typing.','My right wrist is numb for 3 weeks after typing.',(a,b)=>vals(a,'symptoms').includes('pain')&&vals(b,'symptoms').includes('numbness')],
['14 symptom pain→swelling','My left ankle hurts for 3 days after walking.','My left ankle is swollen for 3 days after walking.',(a,b)=>vals(a,'symptoms').includes('pain')&&vals(b,'symptoms').includes('swelling')],
['15 symptom pain→stiffness','My neck hurts for 4 days.','My neck feels stiff for 4 days.',(a,b)=>vals(a,'symptoms').includes('pain')&&vals(b,'symptoms').includes('stiffness')],
['16 quality dull→sharp','My right knee has a dull ache for 2 weeks going downstairs.','My right knee has a sharp pain for 2 weeks going downstairs.',(a,b)=>vals(a,'qualities').includes('dull')&&vals(b,'qualities').includes('sharp')],
['17 quality aching→burning','My left shoulder is aching for 5 days when reaching.','My left shoulder has burning pain for 5 days when reaching.',(a,b)=>vals(a,'qualities').includes('aching')&&vals(b,'qualities').includes('burning')],
['18 quality sharp→throbbing','My right thumb has sharp pain for 3 weeks after phone use.','My right thumb has throbbing pain for 3 weeks after phone use.',(a,b)=>vals(a,'qualities').includes('sharp')&&vals(b,'qualities').includes('throbbing')],
['19 duration 3 days→3 weeks','My right wrist hurts for 3 days after typing.','My right wrist hurts for 3 weeks after typing.',(a,b)=>a.t.duration.unit==='day'&&b.t.duration.unit==='week'],
['20 duration 2 weeks→2 months','My right knee hurts for 2 weeks going downstairs.','My right knee hurts for 2 months going downstairs.',(a,b)=>a.t.duration.unit==='week'&&b.t.duration.unit==='month'],
['21 duration 1 month→1 year','My left shoulder aches for 1 month when reaching.','My left shoulder aches for 1 year when reaching.',(a,b)=>a.t.duration.unit==='month'&&b.t.duration.unit==='year'],
['22 duration numeric→written','My right wrist hurts for 3 weeks after typing.','My right wrist hurts for three weeks after typing.',(a,b)=>a.t.duration.value===3&&b.t.duration.value===3&&a.t.duration.unit===b.t.duration.unit],
['23 duration few days→2 weeks','My right ankle hurts for a few days after walking.','My right ankle hurts for 2 weeks after walking.',(a,b)=>a.t.duration.unit==='day'&&b.t.duration.unit==='week'],
['24 duration yesterday→4 weeks','My left knee started hurting yesterday going downstairs.','My left knee has hurt for 4 weeks going downstairs.',(a,b)=>a.t.duration.value===1&&a.t.duration.unit==='day'&&b.t.duration.value===4],
['25 trigger typing→phone','My right wrist hurts for 3 weeks after typing.','My right wrist hurts for 3 weeks after phone use.',(a,b)=>vals(a,'triggers').includes('typing')&&vals(b,'triggers').includes('phone')],
['26 trigger phone→scrolling','My right thumb hurts for 3 weeks using my phone.','My right thumb hurts for 3 weeks when scrolling.',(a,b)=>vals(a,'triggers').includes('phone')&&vals(b,'triggers').includes('scrolling')],
['27 trigger gripping→twisting','My left wrist hurts for 3 weeks when gripping.','My left wrist hurts for 3 weeks when twisting.',(a,b)=>vals(a,'triggers').includes('gripping')&&vals(b,'triggers').includes('twisting')],
['28 trigger walking→running','My right ankle hurts for 2 weeks after walking.','My right ankle hurts for 2 weeks after running.',(a,b)=>vals(a,'triggers').includes('walking')&&vals(b,'triggers').includes('running')],
['29 trigger down→up stairs','My right knee hurts for 3 weeks going downstairs.','My right knee hurts for 3 weeks going up stairs.',(a,b)=>vals(a,'triggers').includes('down stairs')&&vals(b,'triggers').includes('up stairs')],
['30 trigger lifting→reaching','My left shoulder hurts for 5 days when lifting.','My left shoulder hurts for 5 days when reaching.',(a,b)=>vals(a,'triggers').includes('lifting')&&vals(b,'triggers').includes('large movement')],
['31 trigger movement→lying','My left shoulder hurts for 5 days with larger movements.','My left shoulder hurts for 5 days when lying on it.',(a,b)=>vals(a,'triggers').includes('large movement')&&vals(b,'triggers').includes('lying on it')],
['32 timing morning→night','My right hand tingles in my index finger for 3 weeks in the morning.','My right hand tingles in my index finger for 3 weeks at night.',(a,b)=>vals(a,'patterns').includes('morning')&&vals(b,'patterns').includes('night')],
['33 timing night→daytime','My right knee hurts for 3 weeks at night.','My right knee hurts for 3 weeks during the day.',(a,b)=>vals(a,'patterns').includes('night')&&vals(b,'patterns').includes('daytime')],
['34 timing continuous→intermittent','My left wrist hurts for 3 weeks after typing.','My left wrist sometimes hurts for 3 weeks after typing.',(a,b)=>!vals(a,'patterns').includes('intermittent')&&vals(b,'patterns').includes('intermittent')],
['35 timing activity→rest','My right wrist hurts for 3 weeks after typing.','My right wrist hurts for 3 weeks at rest.',(a,b)=>!vals(a,'patterns').includes('rest')&&vals(b,'patterns').includes('rest')],
['36 onset gradual→fall','My right wrist pain built up gradually over 3 weeks.','My right wrist pain started after a fall 3 weeks ago.',(a,b)=>a.t.onset==='gradual'&&b.t.onset==='specific event'],
['37 onset no trauma→twist','My left ankle hurts for 4 days with no injury.','My left ankle hurts for 4 days after a sudden twist.',(a,b)=>a.t.onset==='gradual'&&b.t.onset==='specific event'],
['38 onset gradual→rolled ankle','My right ankle pain built up gradually for 1 week.','My right ankle pain started when I rolled it yesterday.',(a,b)=>a.t.onset==='gradual'&&b.t.onset==='specific event'],
['39 onset uncertain→specific injury','My right shoulder has hurt for 5 days and I am not sure how it started.','My right shoulder has hurt for 5 days after a fall.',(a,b)=>a.t.onset==='gradual'&&b.t.onset==='specific event'],
['40 neurologic none→numbness','My right wrist hurts for 3 weeks after typing with no numbness.','My right wrist hurts and feels numb for 3 weeks after typing.',(a,b)=>vals(a,'negatives').includes('numbness')&&vals(b,'symptoms').includes('numbness')],
['41 swelling no→yes','My left ankle hurts for 3 days with no swelling.','My left ankle hurts for 3 days and is swollen.',(a,b)=>vals(a,'negatives').includes('swelling')&&vals(b,'symptoms').includes('swelling')],
['42 weakness no→yes','My right hand hurts for 3 weeks with no weakness.','My right hand hurts for 3 weeks and feels weak.',(a,b)=>vals(a,'negatives').includes('weakness')&&vals(b,'symptoms').includes('weakness')],
['43 sensory thumb→pinky','My right hand tingles in my thumb for 3 weeks at night.','My right hand tingles in my pinky for 3 weeks at night.',(a,b)=>vals(a,'sensory').includes('thumb')&&vals(b,'sensory').includes('pinky')],
['44 sensory index→middle','My left hand is numb in my index finger for 3 weeks at night.','My left hand is numb in my middle finger for 3 weeks at night.',(a,b)=>vals(a,'sensory').includes('index')&&vals(b,'sensory').includes('middle')],
['45 function normal→drop objects','My right hand hurts for 3 weeks after phone use.','My right hand hurts for 3 weeks after phone use and I sometimes drop things.',(a,b)=>!vals(a,'functionEffects').includes('dropping objects')&&vals(b,'functionEffects').includes('dropping objects')],
['46 function normal→weight bearing','My right knee hurts for 3 days after walking.','My right knee hurts for 3 days and I cannot bear weight.',(a,b)=>!vals(a,'functionEffects').includes('weight bearing difficult')&&vals(b,'functionEffects').includes('weight bearing difficult')],
['47 function shoulder→cannot raise','My left shoulder hurts for 4 days with larger movements.','My left shoulder hurts for 4 days and I cannot raise my arm.',(a,b)=>!vals(a,'functionEffects').includes('cannot raise arm')&&vals(b,'functionEffects').includes('cannot raise arm')],
['48 relief none→rest helps','My left shoulder hurts for 4 days with larger movements.','My left shoulder hurts for 4 days with larger movements and resting it helps.',(a,b)=>!vals(a,'relievers').includes('reducing provoking activity')&&vals(b,'relievers').includes('reducing provoking activity')],
['49 relief none→cold helps','My right ankle hurts for 3 days after walking.','My right ankle hurts for 3 days after walking and cold pack helps.',(a,b)=>!vals(a,'relievers').includes('cold')&&vals(b,'relievers').includes('cold')],
['50 irrelevant wording stability','My right wrist hurts for 3 weeks after typing.','For what it is worth, my right wrist hurts for 3 weeks after typing.',(a,b)=>JSON.stringify(a.sum)===JSON.stringify(b.sum)]
];

cases.forEach(([n,a,b,fn])=>pair(n,a,b,fn));

// Exact founder-discovered regression must never ask laterality again.
const founder=run('My right hand has been hurting for about 4 weeks or so. The pain is in my wrist and thumb. It is sore at the base of my thumb and hurts especially when I am working or playing on my cell phone.');
pass('founder exact story retains right side',founder.t.side==='right',JSON.stringify(founder.sum));
pass('founder exact story does not re-ask side',!founder.q||founder.q.concept!=='side',founder.q&&founder.q.concept);
pass('founder exact story does not re-ask duration',!founder.q||founder.q.concept!=='duration',founder.q&&founder.q.concept);
pass('founder exact story does not re-ask symptom',!founder.q||founder.q.concept!=='symptom',founder.q&&founder.q.concept);
pass('founder exact story does not re-ask trigger',!founder.q||founder.q.concept!=='trigger',founder.q&&founder.q.concept);

console.log(JSON.stringify({subjects:50,assertions:passed+failures.length,passed,failed:failures.length,failures},null,2));
if(failures.length) process.exit(1);
