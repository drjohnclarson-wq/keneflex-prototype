require('../prototype-046-conversation-engine.js');
const E=globalThis.KFX046;const failures=[];let pass=0;
const sides=['right','left','right','left','both'];
const cases=[
 ['hand','wrist and thumb','sore','typing on my computer and using my phone','4 weeks'],
 ['hand','wrist','aching','typing','3 weeks'],['hand','thumb','sore','scrolling on my phone','2 weeks'],
 ['shoulder','shoulder','sore','larger movements and lying on it','5 days'],
 ['knee','knee','painful','going downstairs','3 weeks'],['ankle','ankle','aching','walking','2 weeks'],
 ['foot','heel','aching','walking in the morning','3 weeks'],['elbow','elbow','sore','gripping and lifting','5 weeks'],
 ['neck','neck','stiff','in the morning','2 weeks'],['back','lower back','aching','lifting','3 weeks']
];
const extras=['No injury.','It came on gradually.','No numbness or swelling.','Resting it helps.','I am not sure what caused it.'];
for(let i=0;i<500;i++){
 const [family,area,symptom,trigger,dur]=cases[i%cases.length],side=sides[i%sides.length],extra=extras[Math.floor(i/cases.length)%extras.length];
 const story=`My ${side} ${area} has been ${symptom} for ${dur}. ${trigger} makes it worse. ${extra}`;
 try{const s=E.createStore();E.ingest(s,story);const t=E.activeThread(s),q=E.nextQuestion(s);if(!t)throw Error('no active thread');if(side!=='both'&&t.side!==side)throw Error(`side lost: ${t.side}`);if(q&&E.known(t,q.concept))throw Error(`re-asked known fact: ${q.concept}`);if(/Which side is bothering you/i.test(q?.text||'')&&t.side)throw Error('redundant side question');if(/What are you noticing there/i.test(q?.text||'')&&(t.symptoms.length||t.qualities.length))throw Error('generic symptom question despite known symptom');pass++;}catch(e){failures.push({subject:i+1,story,error:e.message});}
}
console.log(JSON.stringify({subjects:500,pass,failures:failures.length,sample:failures.slice(0,20)},null,2));if(failures.length)process.exit(1);
