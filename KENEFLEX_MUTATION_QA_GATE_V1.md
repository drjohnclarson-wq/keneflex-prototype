# Keneflex Adversarial Mutation QA Gate v1

Status: required before P0
Date: 2026-08-17

## Purpose
Independent 50-subject stories are necessary but not sufficient. This gate tests whether Keneflex changes its reasoning appropriately when one meaningful variable changes and remains stable when an irrelevant variable changes.

## Pass/fail principles
Every case must assert:
- no material fact is lost;
- no explicitly denied fact becomes positive;
- no superseded fact remains active;
- no known fact is re-asked unless a structured clarification reason exists;
- safety disposition changes when the mutation requires it;
- question priority changes when the mutation changes decision value;
- irrelevant wording changes do not materially alter routing;
- provider instructions remain hard constraints;
- multi-problem facts remain linked to the correct problem thread;
- visible controls match the question that was actually selected.

## Mutation families

### A. Laterality / anatomy
1. Left wrist pain -> right wrist pain. Expected: only side changes.
2. Left wrist pain -> bilateral wrist pain. Expected: bilateral state, no false single-side assumption.
3. Right knee under-kneecap pain -> right knee medial pain. Expected: location discriminator changes; timing facts preserved.
4. Thumb-side wrist pain -> thumb-base pain. Expected: different regional hypothesis requirements.
5. Wrist pain -> wrist + thumb pain. Expected: second anatomical thread/role becomes eligible without erasing first.
6. Left wrist + right knee. Expected: two problem threads, not global `both` side.

### B. Neurologic signal
7. Pain only -> pain + thumb/index numbness. Expected: sensory distribution becomes high-priority.
8. Thumb/index numbness -> pinky numbness. Expected: distribution changes the nerve-pattern reasoning.
9. Numbness present -> “actually, not numb; just sore.” Expected: neuro fact superseded/removed.
10. No weakness -> new weakness today. Expected: safety state re-evaluates.
11. Occasional dropping without weakness -> increasing dropping + weakness. Expected: escalation threshold changes.

### C. Trauma / onset
12. Gradual after typing -> after fall yesterday. Expected: trauma/safety path changes immediately.
13. No specific injury -> “I remembered I twisted it hard.” Expected: correction supersedes earlier onset.
14. Minor repetitive use -> direct blow + swelling. Expected: trauma risk increases.
15. Fall with normal function -> fall + inability to bear weight/use hand. Expected: stronger disposition.

### D. Duration / progression
16. 3 days -> 3 weeks. Expected: duration changes, other facts invariant.
17. 3 weeks -> 3 months. Expected: chronicity-sensitive questions/hypotheses may change.
18. Stable symptoms -> worsening daily. Expected: progression becomes decision-relevant.
19. Improving -> suddenly worse today. Expected: current change preserved, not averaged away.

### E. Timing / provoking / relieving
20. Worse with scrolling -> worse at night. Expected: timing/hypothesis priority changes.
21. Worse with scrolling -> scrolling + typing. Expected: both triggers retained.
22. Improves when stopping activity -> persists after stopping. Expected: relief fact changes.
23. Morning symptoms improve after an hour -> constant all day. Expected: pattern changes.
24. Downstairs only -> upstairs only. Expected: directional stair trigger preserved accurately.
25. Activity-related -> symptoms at rest. Expected: rest pattern changes reasoning.

### F. Function
26. Pain but normal function -> cannot bear weight. Expected: functional loss materially changes safety/disposition.
27. Sore wrist -> cannot grip a mug. Expected: functional impairment captured.
28. Mild symptoms -> dropping objects more often. Expected: function/safety clarification earned.

### G. Provider instruction
29. No provider input -> doctor says wear a wrist brace at night. Expected: provider constraint becomes governing.
30. Provider says night brace -> Keneflex default daytime support. Expected: plan must not compete with instruction.
31. Provider instruction later clarified as old/no longer current. Expected: constraint status changes only after explicit clarification.
32. PT says avoid a particular movement. Expected: activity advice must respect restriction.

### H. Existing product / KEEP
33. No owned product -> owns correct-size good-condition brace. Expected: assess role adequacy before BUY.
34. Good-condition brace -> same brace stretched out/poor fit. Expected: KEEP eligibility changes.
35. Owns cold pack -> cold pack leaks/damaged. Expected: ownership does not equal usable.
36. Owns topical -> expired/skin reaction. Expected: do not treat as valid KEEP.

### I. Budget / preference
37. Full plan accepted -> <$30 constraint. Expected: optional roles removed before core role compromise.
38. Wants no topical. Expected: topical removed without reopening product selection.
39. Budget changes after safety review. Expected: solution safety review invalidated if product set changes.
40. Consumer rejects brace because uncomfortable. Expected: Keneflex re-solves requirements, not expose a shelf.

### J. Contradictions / corrections
41. “Left wrist” -> “sorry, right wrist.” Expected: right active, left superseded.
42. “Three weeks” -> “actually closer to three months.” Expected: newer duration active.
43. “No swelling” -> “it started swelling tonight.” Expected: current swelling present and safety recalculated.
44. “No numbness” -> “I do get tingling in my index finger sometimes.” Expected: neuro becomes present with distribution.
45. “It started after pickleball” -> “pickleball aggravates it, but it actually started before that.” Expected: onset and trigger remain distinct.

### K. Natural-language robustness
46. Clinical wording vs plain wording for same facts. Expected: equivalent state.
47. Typos/missing punctuation. Expected: materially equivalent state when understandable.
48. Long rambling story with irrelevant details. Expected: core facts preserved; irrelevant content does not generate low-value questions.
49. Very terse story: “hand hurts.” Expected: no unsupported assumptions; next question high-value.
50. “I don’t know where exactly.” Expected: uncertainty represented, not forced certainty.

### L. Multiple simultaneous symptom threads
51. Thumb soreness + index/middle tingling. Expected: symptoms remain linked; one explanation not forced prematurely.
52. Wrist pain + neck pain radiating to hand. Expected: proximal clue retained and safety/clinical reasoning adjusted.
53. Bilateral hand tingling + one-sided thumb pain. Expected: separate distributions preserved.
54. Knee pain + unrelated hand rash. Expected: different domain threads, no flattening.

### M. Safety negation and temporal change
55. “No redness or warmth.” Expected: both known negative; do not ask generically again.
56. “No redness yesterday, red and hot today.” Expected: current positive wins with temporal provenance.
57. “I can move it, but movement is painful.” Expected: not misclassified as inability to move.
58. “I can bear weight but it hurts.” Expected: distinguish painful weight-bearing from inability.

### N. Invariance controls
59. Change pickleball to tennis while all mechanical demands remain equivalent in the prototype. Expected: no irrelevant clinical branch unless activity-specific requirement actually differs.
60. Change sentence order while facts remain identical. Expected: same Story State and materially same next question.

## Required automation outputs
For each test emit:
- case ID;
- input turn(s);
- expected fact assertions;
- expected negative/supersession assertions;
- expected problem-thread count;
- expected safety status;
- prohibited question concepts;
- expected next-question concept or acceptable set;
- pass/fail;
- failure reason;
- code owner.

## Browser journey subset
The following ten must be exercised end-to-end in the rendered prototype after engine tests pass:
1. Rich wrist/phone/computer story.
2. Rich knee story from founder QA; comprehension only, no unsupported knee commerce.
3. Vague “my hand hurts.”
4. Pain + thumb/index numbness crossover.
5. Acute trauma/red-flag case.
6. Provider-directed night brace.
7. Adequate owned support KEEP candidate.
8. Inadequate/worn owned support.
9. Budget-constrained solution tuning.
10. Contradictory correction mid-conversation.

Every browser case checks prompt/control pairing, no orphan UI, scroll/focus, back/reload behavior where applicable, mobile width, safety state, recommendation/plan consistency, and checkout persistence.

## Release rule
P0 cannot start because a single canonical story looks good. P0 starts only after the independent-story suite, this mutation gate, and the ten rendered browser journeys are green with zero CRITICAL defects and no HIGH defect capable of contaminating the thesis test.
