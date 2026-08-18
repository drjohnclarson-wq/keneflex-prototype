require('../prototype-046-conversation-engine.js');
require('../prototype-046b-critical-state.js');
require('../prototype-047-consumer-experience.js');
const E=globalThis.KFX046,V=globalThis.KFX047;
const stories=[];
const bases=[
'My right hand hurts at the base of my thumb for four weeks after phone use. No injury.',
'My left wrist and thumb tingle in my thumb and index finger for three weeks after typing. It built up gradually.',
'My right knee hurts under the kneecap going downstairs in the morning for three weeks. No injury.',
'My left ankle is swollen after I rolled it yesterday.',
'My right shoulder has been sore for five days, no trauma, larger movements and lying on it aggravate it, and resting helps.',
'My left elbow hurts with gripping and lifting for three weeks. No injury.',
'My right heel hurts when walking in the morning for three weeks. No injury.',
'My neck has been stiff for two weeks, worse in the morning, no injury.',
'My lower back aches after lifting for three weeks. No injury.',
'My left hip hurts after walking for four weeks. No injury.'
];
const mods=['',' I already own a cold pack.',' I do not want a topical.',' I need to spend less.',' I occasionally drop things but my hand does not feel weaker.'];
for(const b of bases)for(const m of mods)stories.push(b+m);
let failures=[];let pageCount=0;
stories.forEach((story,i)=>{
 const s=E.createStore();E.ingest(s,story);const t=E.activeThread(s),q=E.nextQuestion(s);
 if(q&&E.known(t,q.concept)) failures.push({subject:i+1,reason:'next question already known',q,story});
 const digital=/phone|typing|computer|mouse|scroll/i.test(story);const pages=V.pageModel({digital});pageCount+=pages.length;
 const required=['overview','support','movement','recovery','activity','followup'];for(const id of required)if(!pages.some(p=>p.id===id))failures.push({subject:i+1,reason:'missing page '+id});
 if(digital&&!pages.some(p=>p.id==='setup'))failures.push({subject:i+1,reason:'missing setup page'});
 for(const p of pages){if(p.visuals<1)failures.push({subject:i+1,reason:'page lacks explanatory visual '+p.id});if(V.hasBanned(p.title+' '+p.copy))failures.push({subject:i+1,reason:'internal language in page model '+p.id});if(/\$0|care packet/i.test(p.title+' '+p.copy))failures.push({subject:i+1,reason:'devalues plan or uses packet language '+p.id});}
});
{const s=E.createStore();const story='My right hand has been hurting for about 4 weeks or so. The pain is in my wrist and thumb. It is sore at the base of my thumb and hurts especially when I am working or playing on my cell phone.';E.ingest(s,story);const t=E.activeThread(s),q=E.nextQuestion(s);if(!(t.side==='right'&&t.duration&&t.duration.value===4&&t.locations.includes('base of thumb')&&t.triggers.includes('phone')&&q&&q.concept==='start'))failures.push({subject:'founder-exact',reason:'known-fact regression',summary:E.summary(s),q});}
console.log(JSON.stringify({subjects:stories.length,pageAudits:pageCount,failures:failures.length,details:failures},null,2));if(failures.length)process.exit(1);
