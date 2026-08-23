require('../prototype-046-conversation-engine.js');
require('../prototype-046b-critical-state.js');
const E=globalThis.KFX046;
let total=0, failures=[];
function assert(cond,name,detail){total++;if(!cond)failures.push({name,detail});else console.log('PASS',name);}

// 1) Provider instructions are not optional metadata. The canonical owner must retain them
// so downstream recommendation/tuning cannot compete with a clinician's specific instruction.
{
  const s=E.createStore();
  E.ingest(s,'My doctor told me to wear a wrist brace at night. My right wrist has hurt for three weeks after typing and there was no injury.');
  const t=E.activeThread(s);
  assert(Array.isArray(t.provider)&&t.provider.length>0,'provider instruction survives canonical ingest',{thread:t});
}

// 2) Consumer-owned products must not alter Keneflex's vetted recommendation.
{
  const s=E.createStore();
  E.ingest(s,'I already have a wrist brace but it is old and does not fit well. My right wrist has hurt for three weeks after typing and there was no injury.');
  const t=E.activeThread(s);
  assert(Array.isArray(t.owned)&&t.owned.length===0,'owned product does not alter canonical recommendation state',{thread:t});
}

// 3) A correction must supersede stale laterality. It must never become bilateral merely
// because both the old and corrected sides appear in the same correction sentence.
{
  const s=E.createStore();
  E.ingest(s,'My right wrist has hurt for three weeks after typing and there was no injury.');
  E.ingest(s,'Actually, I meant my left wrist, not my right.');
  const t=E.activeThread(s);
  assert(t&&t.side==='left','laterality correction supersedes stale side',{summary:E.summary(s),active:t});
}

// 4) Correction of duration must replace stale duration, not coexist as an untracked conflict.
{
  const s=E.createStore();
  E.ingest(s,'My right wrist has hurt for three weeks after typing and there was no injury.');
  E.ingest(s,'Correction: it has actually been five weeks, not three.');
  const t=E.activeThread(s);
  assert(t&&t.duration&&t.duration.value===5&&t.duration.unit==='week','duration correction supersedes stale duration',{summary:E.summary(s),active:t});
}

// 5) Multi-problem stories cannot hand off simply because the last-mentioned problem is adequate.
// Every surviving problem thread must either be adequately assessed, explicitly deferred, or safely stopped.
{
  const s=E.createStore();
  E.ingest(s,'My left wrist hurts after typing for three weeks. My right knee hurts going downstairs for two weeks and it came on gradually.');
  const sum=E.summary(s);
  assert(sum.length>=2,'multi-problem story retains separate problem threads',{summary:sum});
  assert(E.adequate(s)===false,'multi-problem handoff waits for unresolved earlier thread',{summary:sum,active:E.activeThread(s)});
}

// 6) A later explicit positive correction must supersede a previously denied symptom.
{
  const s=E.createStore();
  E.ingest(s,'My right wrist hurts after typing for three weeks. No numbness. No injury.');
  E.ingest(s,'Actually, I do get numbness sometimes.');
  const t=E.activeThread(s);
  assert(t.symptoms.includes('numbness')&&!t.negatives.includes('numbness'),'positive symptom correction supersedes stale negative',{thread:t});
}

// 7) A new symptom introduced with a connector must not inherit the prior symptom's negation.
{
  const s=E.createStore();
  E.ingest(s,'My right wrist hurts for three weeks. I have no numbness with rapidly increasing swelling.');
  const t=E.activeThread(s);
  assert(t.negatives.includes('numbness')&&t.symptoms.includes('swelling')&&!t.negatives.includes('swelling'),'with connector restarts symptom polarity',{thread:t});
}

console.log(`\n${total-failures.length}/${total} P0 critical assertions passed`);
if(failures.length){console.error(JSON.stringify({failures},null,2));process.exit(1);}
