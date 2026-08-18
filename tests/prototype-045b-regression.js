require('../prototype-045b-clean-controller.js');
const E=globalThis.KFXCleanEngine;
let passed=0;const failed=[];
function assert(name,cond,detail=''){if(cond){passed++;return;}failed.push({name,detail});}
function run(text){const s=E.createStore();E.ingest(s,text);return {s,th:E.activeThread(s)};}
function vals(th,k){return E.activeVals(th,k)}
const subjects=[
 ['rich knee','My right knee hurts under the kneecap. It is sharp going downstairs in the morning, hard to put weight on at first, gets better after about an hour, and sometimes bothers me during the day.',x=>x.th.region==='knee'&&x.th.side==='right'&&vals(x.th,'locations').includes('under kneecap')&&vals(x.th,'qualities').includes('sharp')&&vals(x.th,'triggers').includes('down stairs')&&vals(x.th,'patterns').includes('morning')&&vals(x.th,'functionEffects').includes('weight bearing difficult')],
 ['digital wrist','My left wrist and thumb hurt and my thumb and index finger tingle after scrolling on my phone and prolonged typing on my computer.',x=>x.th.side==='left'&&vals(x.th,'symptoms').includes('tingling')&&vals(x.th,'triggers').includes('scrolling')&&vals(x.th,'triggers').includes('typing')],
 ['thumb base','Pain at the base of my right thumb for three weeks after pickleball.',x=>x.th.side==='right'&&vals(x.th,'locations').includes('base of thumb')&&x.th.duration.value.value===3],
 ['radial wrist','My right wrist hurts on the thumb side after typing.',x=>vals(x.th,'locations').includes('thumb side of wrist')],
 ['ankle trauma','I rolled my left ankle yesterday and it is swollen.',x=>x.th.region==='ankle'&&x.th.onset.value==='specific event'&&vals(x.th,'symptoms').includes('swelling')],
 ['heel','My right heel aches when I walk in the morning.',x=>x.th.region==='foot'&&vals(x.th,'locations').includes('heel')&&vals(x.th,'patterns').includes('morning')],
 ['elbow','My left elbow hurts when gripping and lifting.',x=>x.th.region==='elbow'&&vals(x.th,'triggers').includes('gripping')],
 ['shoulder','My right shoulder has a dull ache when lifting.',x=>x.th.region==='shoulder'&&vals(x.th,'qualities').includes('dull')],
 ['neck','My neck has been stiff for two weeks.',x=>x.th.region==='neck'&&vals(x.th,'symptoms').includes('stiffness')],
 ['back','My lower back aches after lifting.',x=>x.th.region==='back'&&vals(x.th,'triggers').includes('lifting')],
 ['hip','My left hip hurts after walking.',x=>x.th.region==='hip'&&x.th.side==='left'],
 ['negative numbness','My wrist hurts but I have no numbness.',x=>vals(x.th,'symptoms').includes('pain')&&!vals(x.th,'symptoms').includes('numbness')&&vals(x.th,'negatives').includes('numbness')],
 ['negative swelling','My right knee hurts with stairs but no swelling.',x=>!vals(x.th,'symptoms').includes('swelling')],
 ['night','My hand tingles at night and wakes me.',x=>vals(x.th,'patterns').includes('night')],
 ['rest intermittent','My wrist sometimes aches at rest.',x=>vals(x.th,'patterns').includes('rest')&&vals(x.th,'patterns').includes('intermittent')],
 ['few days','My ankle has hurt for a few days.',x=>x.th.duration.value.value===3],
 ['written duration','My wrist has hurt for three weeks.',x=>x.th.duration.value.value===3],
 ['months','My shoulder has hurt for 2 months.',x=>x.th.duration.value.unit==='month'],
 ['provider','My doctor told me to wear a wrist brace at night. My right wrist hurts.',x=>x.s.global.provider.length===1],
 ['owned product','I already have a wrist brace that I am using. My right wrist hurts.',x=>x.s.global.owned.length>=1],
 ['bilateral','Both wrists tingle at night.',x=>x.th.side==='both'],
 ['median sensory','My right hand has numbness in the thumb, index and middle fingers at night.',x=>['thumb','index','middle'].every(v=>vals(x.th,'sensory').includes(v))],
 ['ulnar sensory','My left hand tingles in the pinky finger.',x=>vals(x.th,'sensory').includes('pinky')],
 ['weight bearing','My right knee hurts and I cannot bear weight.',x=>vals(x.th,'functionEffects').includes('weight bearing difficult')],
 ['dropping','My right hand sometimes drops things.',x=>vals(x.th,'functionEffects').includes('dropping objects')]
];
subjects.forEach(([n,t,fn])=>{const x=run(t);assert('subject '+n,!!fn(x),JSON.stringify(E.summary(x.s)))});
function seq(name,turns,fn){const s=E.createStore();turns.forEach(t=>E.ingest(s,t));assert(name,fn(s),JSON.stringify(E.summary(s)))}
seq('correction side',['My left wrist hurts for three weeks after typing.','Sorry, actually it is my right wrist.'],s=>E.summary(s).some(x=>x.side==='right'));
seq('correction onset',['My right wrist pain built up gradually over three weeks.','Actually, I remembered it started after a fall.'],s=>E.activeThread(s).onset.value==='specific event');
seq('negative to positive',['My wrist hurts. No numbness.','Actually I do get occasional numbness in my index finger.'],s=>vals(E.activeThread(s),'symptoms').includes('numbness')&&vals(E.activeThread(s),'sensory').includes('index'));
seq('positive to negative',['My wrist hurts and feels numb.','To clarify, it is not numb at all.'],s=>!vals(E.activeThread(s),'symptoms').includes('numbness'));
seq('multi region',['My left wrist hurts after typing and my right knee hurts going downstairs.'],s=>E.summary(s).some(x=>x.region==='wrist'&&x.side==='left')&&E.summary(s).some(x=>x.region==='knee'&&x.side==='right'));
const rich=run('My right knee hurts under the kneecap. Sharp pain going downstairs in the morning for three weeks. It built up gradually.');
['where','side','symptom','start','duration','trigger','timing'].forEach(c=>assert('KNOWN gate '+c,E.isKnown(rich.th,c)));
const nextRich=E.nextQuestion(rich.s);assert('no redundant rich-knee question',!nextRich||!['where','side','symptom','start','duration','trigger','timing'].includes(nextRich.concept),nextRich&&nextRich.concept);
const neuro=run('My left wrist tingles in my thumb and index finger after typing for three weeks. It built up gradually.');assert('sensory known',E.isKnown(neuro.th,'sensoryMap'));const nextNeuro=E.nextQuestion(neuro.s);assert('no sensory repeat',!nextNeuro||nextNeuro.concept!=='sensoryMap',nextNeuro&&nextNeuro.concept);
const mutations=[
 ['side','My left wrist hurts after typing for three weeks.','My right wrist hurts after typing for three weeks.',(a,b)=>a.th.side!==b.th.side],
 ['onset','My right wrist pain built up over three weeks.','My right wrist pain started after a fall three weeks ago.',(a,b)=>a.th.onset.value!==b.th.onset.value],
 ['symptom','My right wrist hurts after typing.','My right wrist tingles after typing.',(a,b)=>vals(a.th,'symptoms')[0]!==vals(b.th,'symptoms')[0]],
 ['location','Pain at the front of my right knee.','Pain on the inside of my right knee.',(a,b)=>vals(a.th,'locations').join()!=vals(b.th,'locations').join()],
 ['trigger','My right knee hurts going downstairs.','My right knee hurts walking.',(a,b)=>vals(a.th,'triggers').join()!=vals(b.th,'triggers').join()],
 ['night','My wrist hurts after typing.','My wrist hurts after typing and at night.',(a,b)=>!vals(a.th,'patterns').includes('night')&&vals(b.th,'patterns').includes('night')],
 ['neurologic','My wrist hurts after typing.','My wrist hurts and my index finger is numb after typing.',(a,b)=>!vals(a.th,'symptoms').includes('numbness')&&vals(b.th,'symptoms').includes('numbness')],
 ['swelling','My ankle hurts but no swelling.','My ankle hurts and is swollen.',(a,b)=>!vals(a.th,'symptoms').includes('swelling')&&vals(b.th,'symptoms').includes('swelling')],
 ['function','My knee hurts.','My knee hurts and I cannot bear weight.',(a,b)=>vals(b.th,'functionEffects').length>vals(a.th,'functionEffects').length],
 ['irrelevant wording','My right wrist hurts after typing for three weeks.','For what it is worth, my right wrist hurts after typing for three weeks.',(a,b)=>JSON.stringify(E.summary(a.s))===JSON.stringify(E.summary(b.s))]
];
mutations.forEach(([n,a,b,fn])=>assert('mutation '+n,fn(run(a),run(b))));
const variants=['My right wrist hurts after scrolling on my phone for two weeks.','My left thumb is sore at the base after pickleball for three weeks.','My right knee aches going up stairs in the morning for four weeks.','My left ankle hurts after running for two weeks.','My right shoulder aches after lifting for five weeks.','My left elbow hurts with gripping for six weeks.','My right heel hurts walking in the morning for three weeks.','My neck feels stiff in the morning for two weeks.','My lower back hurts after lifting for three weeks.','My left hip hurts walking for four weeks.'];
variants.forEach((v,i)=>{const x=run(v);assert('adversarial '+(i+1),x.th&&x.th.region!=='unspecified'&&(E.nextQuestion(x.s)||E.adequateForHandoff(x.s)))});
console.log(JSON.stringify({passed,failed:failed.length,failures:failed},null,2));if(failed.length)process.exit(1);
