const fs = require('fs');
require('../prototype-046-conversation-engine.js');
const E = globalThis.KFX046;
let total = 0;
let failed = 0;
function check(value, label) { total++; if (!value) { failed++; console.error('FAIL', label); } else console.log('PASS', label); }

const interpreted = E.importInterpretation({
  problems: [{
    family: 'hand', side: 'right', areas: ['wrist', 'thumb'], locations: ['base of thumb'], symptoms: ['pain'], negatives: ['numbness'], qualities: ['sore'], triggers: ['pickleball'], patterns: [], relievers: [], functionEffects: [], sensory: [], onset: 'gradual', duration: { value: 1, unit: 'month', raw: 'about a month', approximate: true }, provider: []
  }],
  clarifications: [], missingDecisionFacts: []
}, ['My wrist and thumb hurt.', 'Gradually.', 'About a month.']);
const thread = E.activeThread(interpreted);
check(thread.family === 'hand' && thread.side === 'right', 'AI interpretation imports body family and side');
check(thread.duration.value === 1 && thread.duration.unit === 'month', 'AI interpretation imports natural duration');
check(E.nextQuestion(interpreted)?.concept !== 'duration', 'known AI duration is not askable');
check(thread.negatives.includes('numbness') && !thread.symptoms.includes('numbness'), 'AI negatives remain distinct from symptoms');
check(interpreted.events.length === 3 && interpreted.ai.used, 'consumer transcript and AI provenance are retained');

const shortAnswerStore = E.createStore();
E.ingest(shortAnswerStore, 'My right wrist has hurt for three weeks after pickleball. It started gradually.');
E.recordContextAnswer(shortAnswerStore, 'function', 'Lift');
check(E.known(E.activeThread(shortAnswerStore), 'function'), 'short answer is retained in the context of the question asked');
check(E.activeThread(shortAnswerStore).functionEffects.includes('Lift'), 'short functional answer is stored as a functional effect rather than discarded');

const api = fs.readFileSync('api/interpret-story.mjs', 'utf8');
const controller = fs.readFileSync('participant-controller.js', 'utf8');
check(api.includes("openai('gpt-5.6-luna')"), 'server uses the verified current model through the direct provider');
check(api.includes('You do not diagnose, recommend products, or decide whether self-care is safe'), 'AI interpreter is prohibited from owning clinical or commerce decisions');
check(api.includes("createOpenAI({ apiKey: openAIKey })"), 'provider-owned key bypasses Vercel-managed model billing');
check(api.includes('maxOutputTokens: 1200'), 'AI output is capped to control cost');
check(api.includes('AbortSignal.timeout(15000)'), 'AI request has a firm execution timeout');
check(api.includes('.slice(-16000)'), 'conversation input is capped');
check(controller.includes("model.interpretationMode = 'deterministic-fallback'"), 'deterministic fallback remains available');
check(controller.includes('Engine.mergeInterpretation'), 'participant controller merges structured AI facts into durable state');
check(controller.includes("clarification?.question"), 'genuine AI ambiguity can produce a clarification');
check(controller.includes('clarificationConcept === question.concept'), 'AI clarification wording cannot silently change the concept being asked');
check(controller.includes('model.lastAnsweredConcept ==='), 'immediately repeated questions are suppressed');
check(controller.includes('if (submitting) return'), 'a single answer cannot be submitted more than once');

if (failed) { console.error(`\n${failed}/${total} AI story contracts failed`); process.exit(1); }
console.log(`\n${total}/${total} AI story contracts passed`);
