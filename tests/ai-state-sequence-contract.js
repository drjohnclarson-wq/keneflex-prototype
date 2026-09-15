require('../prototype-046-conversation-engine.js');
require('../prototype-046b-critical-state.js');
const assert = require('assert');
const E = globalThis.KFX046;

function interpretation(overrides = {}) {
  return {
    problems: [{
      family: 'hand', side: null, areas: ['wrist'], locations: [], symptoms: ['pain'], negatives: [], qualities: ['sore'],
      triggers: [], patterns: [], relievers: [], functionEffects: [], sensory: [], onset: null, duration: null, provider: [],
      ...overrides
    }],
    clarifications: [], missingDecisionFacts: []
  };
}

const turns = ['My wrist hurts.', 'Right.', 'Gradually.', 'Three weeks.', 'Lift.'];
let store = E.createStore();
store = E.mergeInterpretation(store, interpretation(), [turns[0]]);
E.recordContextAnswer(store, 'side', 'Right');
assert.equal(E.activeThread(store).side, 'right');

// A later AI response may omit an earlier fact. Durable canonical state must keep it.
store = E.mergeInterpretation(store, interpretation({ onset: 'gradual' }), turns.slice(0, 3));
E.recordContextAnswer(store, 'start', 'Gradually');
assert.equal(E.activeThread(store).side, 'right');
assert(E.known(E.activeThread(store), 'side'));

store = E.mergeInterpretation(store, interpretation({ duration: { value: 3, unit: 'week', raw: 'Three weeks' } }), turns.slice(0, 4));
E.recordContextAnswer(store, 'duration', 'Three weeks');
assert.equal(E.activeThread(store).side, 'right');
assert.equal(E.activeThread(store).onset, 'gradual');

// Simulate a temporary API failure: deterministic ingest must not discard AI state.
E.ingest(store, 'Lift');
E.recordContextAnswer(store, 'function', 'Lift');
assert(E.activeThread(store).functionEffects.includes('Lift'));

// AI recovery still cannot erase the short contextual answer or earlier side.
store = E.mergeInterpretation(store, interpretation({ triggers: ['lifting'] }), turns);
assert.equal(E.activeThread(store).side, 'right');
assert(E.activeThread(store).functionEffects.includes('Lift'));
assert(E.known(E.activeThread(store), 'function'));

// Uncertainty is not falsely treated as a durable fact.
const uncertain = E.createStore();
E.ingest(uncertain, 'My wrist hurts.');
E.recordContextAnswer(uncertain, 'side', 'Not sure');
assert(!E.known(E.activeThread(uncertain), 'side'));

// Explicit corrections are allowed and supersede earlier laterality.
E.ingest(store, 'Actually, I meant my left wrist.');
assert.equal(E.activeThread(store).side, 'left');

// Question budgets match the pretest contract.
const complete = E.createStore();
E.ingest(complete, 'My right wrist is sore after typing for three weeks and it built up gradually.');
assert.equal(E.questionBudget(complete), 0);
const moderate = E.createStore();
E.ingest(moderate, 'My right wrist is sore after typing.');
assert(E.questionBudget(moderate) <= 2);
const sparse = E.createStore();
E.ingest(sparse, 'My wrist hurts.');
assert(E.questionBudget(sparse) <= 5);

// Wrist-only concerns do not need extra location detail to choose the launch SKU.
assert.equal(E.needsPreciseLocation(E.activeThread(complete)), false);

// AI-generated safety negatives are never accepted without explicit consumer support.
let groundedSafety = E.createStore();
const safetyTurns = [
  'My right wrist is stiff in the morning and typing makes it worse. I want help choosing a wrist brace.',
  'Gradually.',
  'About four weeks.'
];
groundedSafety = E.mergeInterpretation(groundedSafety, interpretation({
  side: 'right',
  symptoms: ['stiffness'],
  negatives: ['pain', 'numbness', 'tingling', 'swelling', 'redness', 'warmth', 'wound', 'weakness'],
  patterns: ['morning'],
  triggers: ['typing'],
  onset: 'gradual',
  duration: { value: 4, unit: 'week', raw: 'About four weeks' }
}), safetyTurns);
const groundedThread = E.activeThread(groundedSafety);
assert(!groundedThread.negatives.includes('numbness'));
assert(!groundedThread.negatives.includes('swelling'));
assert(!groundedThread.negatives.includes('weakness'));

console.log('PASS durable AI state, fallback recovery, corrections, uncertainty, and question budgets');
