const fs = require('fs');

let total = 0;
let failed = 0;
function check(condition, message) {
  total++;
  if (condition) console.log('PASS', message);
  else { failed++; console.error('FAIL', message); }
}

const loader = fs.readFileSync('prototype-044.js', 'utf8');
const route = fs.readFileSync('test.html', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const engine = fs.readFileSync('prototype-046-conversation-engine.js', 'utf8');
const critical = fs.readFileSync('prototype-046b-critical-state.js', 'utf8');
const participant = fs.readFileSync('participant-controller.js', 'utf8');

const loadedScripts = [...loader.matchAll(/src="([^"]+)/g)]
  .map(match => match[1].split('?')[0]);
const legacyPatch = /prototype-04(?:4[bc-dh-z]?|5[a-c]?|7)|prototype-050|prototype-052/;

// This P0 contract follows the production participant architecture. Historical
// patch files remain useful references, but loading them would duplicate runtime
// ownership and make this regression test validate the architecture it replaced.
check(loadedScripts.length === 3, 'only the three consolidated runtime scripts are loaded');
check(loadedScripts[0] === 'prototype-046-conversation-engine.js', 'conversation engine loads first');
check(loadedScripts[1] === 'prototype-046b-critical-state.js', 'critical state loads second');
check(loadedScripts[2] === 'participant-controller.js', 'participant controller loads last');
check((loader.match(/<script defer/g) || []).length === 3, 'runtime scripts use one deterministic deferred phase');
check(!legacyPatch.test(loader), 'legacy patch stack is absent from the production loader');
check(!loader.includes('MutationObserver'), 'loader has no observer repair logic');
check(!loader.includes('setTimeout('), 'loader has no timing repair logic');

check(route.includes('<title>Keneflex</title>'), 'participant route uses consumer-facing title');
check(route.includes("searchParams.set('participant','063')"), 'participant route requests consolidated release 0.6.3');
check(route.includes("searchParams.set('build',String(stamp))") && route.includes("searchParams.set('cache','no-store')"), 'participant route uses unique no-store URL');
check(route.includes('location.replace(u.href)'), 'participant route uses deterministic top-level navigation');
check(html.includes('participant-consolidated.css?v=063'), 'participant route loads consolidated styles');
check(!html.includes('function calcTotal()') && !html.includes('tune=function'), 'duplicated inline commerce runtime is absent');

check(engine.includes("hand:'hand',wrist:'hand',thumb:'hand',finger:'hand'"), 'hand family canonicalization retained');
check(engine.includes('function candidates(s)'), 'single-owner next-question gate exists');
check(engine.includes("if(!known(t,c))a.push"), 'known facts excluded before question rendering');
check(critical.includes('collectProvider'), 'provider instructions retained');
check(critical.includes('collectOwned'), 'owned items retained');
check(critical.includes('correctionSide'), 'laterality corrections supported');
check(critical.includes('threads.every(threadAdequate)'), 'multi-problem adequacy retained');

check(participant.includes('const model ='), 'one authoritative participant model exists');
check(participant.includes("release: '0.6.3'"), 'participant model identifies consolidated release');
check(participant.includes("thread.family !== 'hand'"), 'unsupported regions cannot receive a hand recommendation');
check(participant.includes('function safetyGate()'), 'safety gate has one controller owner');
check(participant.includes("model.cart.support.disposition = 'REVIEW'"), 'altered-feeling pattern blocks automatic support checkout');
check(participant.includes('Provider direction protected'), 'provider direction appears in recommendation reasoning');
check(participant.includes('function classifyOwnedProduct(') && participant.includes('fit, condition, cleanliness, coverage, and function'), 'owned items retain suitability checks and explicit resolution');
check(participant.includes("disposition: 'BUY'"), 'commerce disposition is explicit');
check(participant.includes("disposition === 'BUY' ? product.price : 0"), 'only BUY items contribute to total');
check(participant.includes('function adjust(kind)'), 'solution adjustment has one controller owner');
check(participant.includes('function checkout()'), 'checkout has one controller owner');
check(participant.includes('function openPlan()'), 'plan page has one controller owner');
check(participant.includes('function applyConsumerCopy()'), 'consumer copy has one controller owner');
check(participant.includes('Buy selected items'), 'controller owns the visible purchase CTA');
check(participant.includes('Your Keneflex Plan'), 'controller owns the consumer plan page');
check(!participant.includes('MutationObserver'), 'controller does not repair itself with DOM observers');
check(!participant.includes('setTimeout('), 'controller does not use timing patches');

console.log(`\n${total - failed}/${total} release-contract assertions passed`);
process.exit(failed ? 1 : 0);
