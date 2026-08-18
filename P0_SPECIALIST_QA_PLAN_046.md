# Keneflex 0.4.6 — Specialist P0 QA Plan

Purpose: compress the remaining path to P0 by testing failure classes rather than repairing screenshots one at a time.

## Cross-functional specialist recommendations

### Senior software / architecture
- Keep one authoritative conversation owner.
- Test invariants, not individual prompts: KNOWN != ASKABLE; one problem thread does not leak into another; no prompt/control can render independently; a correction supersedes stale state.
- Treat every previously discovered defect as a permanent regression test.

### Conversational AI / NLP
- Use metamorphic testing: hold a story constant and change exactly one fact, then verify only the relevant state/reasoning changes.
- Test paraphrases, sentence order, negatives, uncertainty, corrections, multiple symptoms, multiple regions, and partial answers.
- Verify the next question is both unresolved and decision-relevant.

### Clinical / safety
- Stress boundaries that should change disposition: trauma, inability to bear weight/use the limb, neurologic findings, worsening weakness/function, significant swelling/redness/warmth/wound, and provider instructions.
- Test nearby low-risk variants to make sure ambiguity causes clarification rather than automatic escalation.

### QA / test automation
- Maintain three layers: pure reasoning regression; mutation/metamorphic regression; real-browser integration regression.
- Run all layers automatically before a build is declared P0-ready.
- A passing parser is insufficient if browser/UI integration fails.

### Frontend / mobile
- Assert atomic turns: a visible question and its response control must appear/disappear together.
- Test phone-width viewport, scrolling, controls, cache/versioning, and repeated fresh launches.

### Behavioral science / consumer comprehension
- Flag technically valid questions that feel repetitive, bookkeeping-like, or disconnected from the preceding answer.
- Prefer one coherent question per Keneflex turn and preserve the consumer's own words in the reasoning state.

## Test stack implemented

1. Existing canonical story regression.
2. Existing release-integrity contract regression.
3. First 50-subject 0.4.6 adversarial story suite.
4. Second 50-subject one-variable mutation suite. Each paired subject changes one meaningful variable across laterality, body region, symptom, quality, duration, trigger, timing, onset, neurologic findings, negatives, function, relief, or irrelevant wording. Every pair also asserts the next question is not already known.
5. Exact founder-discovered right-hand/wrist/thumb/4-week/phone story is a permanent regression and must not re-ask side, duration, symptom, or trigger.
6. Ten-story Playwright/Chromium browser smoke suite at a 390x844 phone viewport. It checks the live local participant route, orphan controls, release-integrity state, canonical next-question integrity, and the founder regression in a real browser engine.

## P0 release standard

P0 remains blocked unless all automated reasoning, mutation, release-contract, and browser-smoke jobs pass. After automation is green, one final real-device launch through `test.html` remains required because a headless Chromium run cannot fully substitute for the founder's actual Safari/Chrome/mobile environment.

No new features should enter before this gate is green.
