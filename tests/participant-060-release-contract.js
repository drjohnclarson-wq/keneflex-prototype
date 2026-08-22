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
const controller = fs.readFileSync('participant-controller.js', 'utf8');
const critical = fs.readFileSync('prototype-046b-critical-state.js', 'utf8');
const participantCss = fs.readFileSync('participant-consolidated.css', 'utf8');

const loadedScripts = [...loader.matchAll(/src=\"([^\"]+)/g)].map(match => match[1].split('?')[0]);
check(loadedScripts.length === 3, 'participant loader has exactly three explicit runtime scripts');
check(loadedScripts[0] === 'prototype-046-conversation-engine.js', 'canonical story engine loads first');
check(loadedScripts[1] === 'prototype-046b-critical-state.js', 'critical provider, owned-item, correction, and multi-problem invariants load second');
check(loadedScripts[2] === 'participant-controller.js', 'single participant controller loads last');
check((loader.match(/<script defer/g) || []).length === 3, 'consolidated runtime starts after the legacy inline parser phase');
check(!/prototype-04(?:4[bc-dh-z]?|5[a-c]?|7)|prototype-050|prototype-052/.test(loader), 'legacy patch stack is absent from production loader');
check(route.includes("searchParams.set('participant','063')"), 'participant route matches consolidated release');
check(route.includes("searchParams.set('build',String(stamp))"), 'participant route cache-busts each launch');
check(html.includes('participant-consolidated.css?v=063'), 'consolidated stylesheet is loaded');
check(!html.includes('function calcTotal()') && !html.includes('tune=function'), 'legacy inline commerce runtime is removed');
check(controller.includes('const model ='), 'one authoritative participant model exists');
check(controller.includes("disposition: 'BUY'"), 'commerce disposition is explicit');
check(controller.includes("disposition === 'BUY' ? product.price : 0"), 'only BUY items contribute to total');
check(controller.includes('function checkout()'), 'checkout has one controller owner');
check(controller.includes('function openPlan()'), 'plan page has one controller owner');
check(controller.includes('function adjust(kind)'), 'solution adjustment has one controller owner');
check(controller.includes("thread.family !== 'hand'"), 'unsupported regions cannot receive a hand recommendation');
check(controller.includes("model.cart.support.disposition = 'REVIEW'"), 'altered-feeling pattern blocks automatic support checkout');
check(controller.includes('Provider direction protected'), 'provider direction is visible in recommendation reasoning');
check(controller.includes('function classifyOwnedProduct('), 'owned products are resolved as adequate, inadequate, or unknown');
check(controller.includes("rec.ownedResolution === 'inadequate'"), 'proven-inadequate owned products do not block a replacement BUY');
check(controller.includes("negative.has('swelling')") && controller.includes("negative.has('weakness')"), 'safety gate suppresses facts already supplied as negatives');
check(critical.includes('needsPreciseHandLocation'), 'combined wrist/thumb stories require decision-changing location detail');
check(participantCss.includes('@media(max-width:900px)') && participantCss.includes('.grid{grid-template-columns:1fr}'), 'tablet layout uses one primary reading column');
check(controller.includes('function applyConsumerCopy()'), 'consumer copy is authored once without observer cleanup');
check(!controller.includes('MutationObserver'), 'participant controller does not repair itself with DOM observers');
check(!controller.includes('setTimeout('), 'participant controller does not use timing patches for synchronization');

console.log(`\n${total - failed}/${total} consolidated release assertions passed`);
process.exit(failed ? 1 : 0);
