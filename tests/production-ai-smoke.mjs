import assert from 'node:assert/strict';

const base=process.env.KFX_PRODUCTION_URL||'https://keneflex-prototype-ai.vercel.app';
const engine=await fetch(`${base}/prototype-046-conversation-engine.js`,{headers:{'cache-control':'no-cache'}});
assert.equal(engine.status,200,'production engine must load');
const source=await engine.text();
assert.match(source,/What does it feel like/,'production must contain the clear symptom question');
assert.doesNotMatch(source,/What are you noticing there/,'production must not contain the vague symptom question');

const response=await fetch(`${base}/api/interpret-story`,{
  method:'POST',headers:{'content-type':'application/json'},
  body:JSON.stringify({turns:[{role:'user',content:'My wrist has been bothering me after playing pickleball. I need help figuring out what to buy.'}]})
});
assert.equal(response.status,200,'production AI route must return 200');
const payload=await response.json();
assert.equal(payload?.interpretation?.problems?.[0]?.family,'hand','AI must map wrist to the hand pathway');
assert(payload.interpretation.missingDecisionFacts.includes('symptom'),'AI must identify the missing symptom without inventing one');
console.log('PASS production engine wording');
console.log('PASS production AI interpretation route');
