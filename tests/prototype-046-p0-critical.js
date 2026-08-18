require('../prototype-046-conversation-engine.js');
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

// 2) Already-owned products must survive canonical ingest so KEEP/replace logic can assess
// fit, condition and function instead of silently reverting to BUY.
{
  const s=E.createStore();
  E.ingest(s,'I already have a wrist brace but it is old and does not fit well. My right wrist has hurt for three weeks after typing and there was no injury.');
  const t=E.activeThread(s);
  assert(Array.isArray(t.owned)&&t.owned.length>0,'owned product survives canonical ingest',{thread:t});
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
  if(typeof E.adequate==='function'){
    assert(E.adequate(s)===false,'multi-problem handoff waits for unresolved earlier thread',{summary:sum,active:E.activeThread(s)});
  } else {
    assert(false,'canonical engine exposes adequacy gate for multi-problem release testing',{exports:Object.keys(E)});
  }
}

console.log(`\n${total-failures.length}/${total} P0 critical assertions passed`);
if(failures.length){console.error(JSON.stringify({failures},null,2));process.exit(1);}