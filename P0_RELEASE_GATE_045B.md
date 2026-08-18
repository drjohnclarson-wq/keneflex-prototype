# Keneflex Prototype 0.4.5B — P0 Release Gate

Status: engineering upgrade complete; automated reasoning gate green locally; participant build ready for final interactive smoke test.

## Structural upgrades completed

1. Canonical event log: every consumer turn is stored as an event rather than being flattened into one mutable sentence.
2. Canonical Story State: one authoritative state model owns the facts used for question selection.
3. Problem threads: separate body-region/laterality threads prevent left-wrist and right-knee facts from being blended.
4. Fact status: present, denied, uncertain and superseded states are represented distinctly.
5. Contradiction/supersession: later corrections such as “actually, it is the right wrist” or “to clarify, it is not numb” update active truth rather than leaving incompatible facts active.
6. Context-sensitive next-best-question ranking: unresolved questions are ranked by safety/disposition/recommendation value rather than by a fixed intake order.
7. Hard KNOWN != ASKABLE gate: a known concept is not eligible for another ordinary question unless the turn is explicitly a clarification.
8. Atomic question handling: legacy one-select and multi-select controls are intercepted at the question level so the system does not merely hide a duplicate AI bubble while leaving a redundant control behind.
9. Body-part-agnostic comprehension: knee, ankle, foot, elbow, shoulder, neck, back and hip stories are understood at the story layer even though only hand/wrist/thumb is configured to complete a product recommendation in this prototype.
10. Legacy isolation: the 0.4.5B controller loads last and owns conversation truth; historical modules are retained temporarily only as downstream UI/safety/product/plan services.

## Automated regression gate

The repository contains `tests/prototype-045b-regression.js` and `.github/workflows/p0-regression.yml`.

The local pre-commit run passed 70/70 assertions, including rich knee and digital-wrist stories, written/numeric durations, explicit negatives, sensory distribution, trauma versus gradual onset, provider instructions, owned products, bilateral complaints, multiple simultaneous body-region threads, corrections, KNOWN != ASKABLE behavior, meaningful single-variable mutations, stability to irrelevant wording changes, and adversarial body-region variants.

Any future push to `main` or `prototype-045-clean` is configured to rerun this regression suite in GitHub Actions.

## P0 final interactive smoke gate

Before a counted participant is run, complete one non-counted browser pass through the canonical `test.html` participant route on a phone-sized viewport. This is the only remaining class of validation that cannot be proven by the pure reasoning regression suite.

Must-pass browser cases:
1. Rich wrist/phone/computer story does not re-ask already supplied facts.
2. Rich knee story is accurately understood and stops honestly because knee recommendation is outside prototype scope.
3. Contradictory correction updates the conversation rather than preserving the old answer.
4. Numbness/tingling with finger distribution does not ask the sensory location twice.
5. Provider instruction remains a hard downstream constraint.
6. Safety flow renders with no dead-end, orphan control or duplicate AI turn.
7. Hand/wrist/thumb path reaches recommendation, explanation, solution tuning and cart preview.
8. Owned-item, no-topical and budget tuning states still mutate the visible plan correctly.
9. Mobile scrolling/composer controls remain usable.
10. Refreshing `test.html` retrieves the current build rather than a cached historical loader.

## Freeze rule

If all 10 browser checks pass, freeze the exact commit SHA and run P0. Do not add more behavior, products or copy before P0. If a browser check fails, fix the owning system and rerun the automated regression gate plus the failed browser case; do not add a new patch layer.
