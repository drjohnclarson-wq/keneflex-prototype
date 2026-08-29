const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('prototype-046-conversation-engine.js','utf8');
const context={console,globalThis:{}};vm.createContext(context);vm.runInContext(source,context);
const E=context.globalThis.KFX046;

const banned=[
  /What are you noticing there/i,
  /Where is it centered most precisely/i,
  /Where is the problem\?/i
];
const cases=[
  {name:'sparse pickleball story',opening:'My wrist has been bothering me after playing pickleball. I need help figuring out what to buy.',answers:{side:'Right',start:'Gradually',symptom:'It feels sore and stiff.',duration:'About three weeks.',preciseLocation:'On the thumb side of my wrist.',trigger:'Gripping the paddle makes it worse.'}},
  {name:'known brace shopper',opening:'I know I want a wrist brace but need help choosing the right one. My right wrist is sore when I type.',answers:{start:'Gradually',duration:'About a month.',preciseLocation:'Across the palm side of my wrist.'}},
  {name:'stiffness and heat story',opening:'My left wrist feels stiff in the morning and heat seems to help.',answers:{start:'Gradually',duration:'For two months.',preciseLocation:'Mostly on the back of my wrist.',trigger:'Typing makes it worse.'}},
  {name:'tingling story',opening:'My right hand has tingling.',answers:{sensoryMap:'My thumb and index finger.',start:'Gradually',duration:'For one week.',preciseLocation:'It is in my palm too.',trigger:'Using my phone brings it on.'}},
  {name:'complete story',opening:'My right wrist has been sore on the thumb side for three weeks. It built up gradually after pickleball and gripping the paddle makes it worse.',answers:{}}
];

let journeys=0,questions=0;
for(const test of cases){
  const store=E.createStore();E.ingest(store,test.opening);const seen=[];
  for(let turn=0;turn<12&&!E.adequate(store);turn++){
    const q=E.nextQuestion(store);assert(q,`${test.name}: missing next question`);
    assert(!E.known(E.activeThread(store),q.concept),`${test.name}: re-asked known ${q.concept}`);
    for(const rx of banned)assert(!rx.test(q.text),`${test.name}: vague wording: ${q.text}`);
    assert(!seen.includes(q.concept),`${test.name}: repeated ${q.concept}`);seen.push(q.concept);questions++;
    if(q.concept==='symptom'){
      assert(/what does it feel like/i.test(q.text),`${test.name}: symptom question lacks plain-language purpose`);
      assert(/pain|soreness|stiffness/i.test(q.text),`${test.name}: symptom question lacks examples`);
    }
    if(q.concept==='preciseLocation'){
      assert(/where exactly/i.test(q.text),`${test.name}: location question lacks plain-language purpose`);
      assert(/thumb side|pinky side|palm side|back/i.test(q.text),`${test.name}: location question lacks examples`);
    }
    const answer=test.answers[q.concept]||({where:'My wrist.',side:'Right',symptom:'It feels sore.',start:'Gradually',duration:'About three weeks.',trigger:'Using it makes it worse.',timing:'Mostly in the morning.',relief:'Rest helps.',function:'Opening jars is difficult.',sensoryMap:'My thumb and index finger.',preciseLocation:'On the thumb side of my wrist.'}[q.concept]);
    assert(answer,`${test.name}: no test answer for ${q.concept}`);E.ingest(store,answer);
  }
  assert(E.adequate(store),`${test.name}: journey did not reach a decision-ready story`);journeys++;
}

const screenshot=E.createStore();
E.ingest(screenshot,'My wrist has been bothering me after playing pickleball. I need help figuring out what to buy.');
assert.equal(E.nextQuestion(screenshot).concept,'side');E.ingest(screenshot,'Right');
assert.equal(E.nextQuestion(screenshot).concept,'symptom');
assert(/What does it feel like/i.test(E.nextQuestion(screenshot).text));

console.log(`PASS: ${journeys} consumer-language journeys and ${questions} nonredundant questions`);
