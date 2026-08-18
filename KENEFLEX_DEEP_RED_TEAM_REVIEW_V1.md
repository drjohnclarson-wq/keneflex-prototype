# Keneflex Prototype Deep Red-Team Review v1

Status: PRE-P0 BLOCKER REVIEW
Date: 2026-08-17
Reviewed baseline: `befcb9612e6217df7a5fd22b4684c842c63f0d97` (Prototype 0.4.5A)

## Purpose
This is a cross-functional red-team review of the participant-facing prototype through the lenses of senior software architecture, conversational AI/NLP, QA/test automation, frontend/mobile UX, clinical/conservative-care content, behavioral science, consumer comprehension, product intelligence, regulatory/claims integrity, and data/analytics.

The objective is not to add features. It is to identify root causes that can still make Keneflex misunderstand, repeat, contradict, over-assume, route incorrectly, or feel unintelligent before P0.

## Executive conclusion
P0 remains BLOCKED.

The 0.4.5 Story State parser is a meaningful improvement, but the current runtime still consists of a long chain of historical scripts that repeatedly override shared functions. The final 0.4.5A integration prevents some repetitions, but it does not yet establish one authoritative conversation controller. The system therefore remains vulnerable to state conflicts, stale positives after consumer correction, orphaned UI, flat multi-problem representation, and static rather than hypothesis-sensitive next-question selection.

The correct cleanup is a bounded behavioral refactor, not another patch series and not a full visual rebuild.

---

# Cross-functional findings

## CRITICAL 1 — Multiple owners still control conversation flow
Category: Architecture
Severity: CRITICAL

The loader executes the core plus many historical behavior patches before the 0.4.5 parser/integration. Several files redefine `parseDetail`, `askDetail`, `addAI`, `multiselect`, `oneSelect`, `askFit`, `showSolution`, safety behavior, and routing. A later patch can therefore alter an earlier behavior without a single source of truth.

### Required correction
Create one authoritative `ConversationController` that alone decides:
- what the current Story State is;
- what facts are known / denied / uncertain / unknown;
- which safety gate is active;
- which question is next;
- whether a question is allowed to render;
- when enough information exists to advance;
- what branch owns the next transition.

Legacy modules may supply content or specialized logic, but may not independently choose the next question.

---

## CRITICAL 2 — Story State is still projected into legacy state rather than owning it
Category: Architecture / AI reasoning
Severity: CRITICAL

0.4.5A parses an authoritative story model and then copies selected facts into legacy Sets/strings. That creates two representations of the same consumer truth. These can diverge.

Example failure class: a consumer first reports numbness, then corrects it and says there is no numbness. The story model can change, while the legacy `state.features` Set may retain a prior positive because projection predominantly adds facts rather than reconciling/removing stale facts.

### Required correction
Story State becomes canonical. Legacy UI derives a view-model from Story State. No independent clinical fact storage is allowed in UI routing state.

---

## CRITICAL 3 — Corrections and contradictions are not first-class events
Category: Conversational AI / clinical safety
Severity: CRITICAL

The current parser works primarily from accumulated text. It does not robustly model chronology, correction, retraction, or conflict at the fact level.

Examples that must be handled explicitly:
- “I said left before, but it is actually my right wrist.”
- “I thought it was numbness, but it is really just soreness.”
- “No swelling this morning, but it is swollen now.”
- “I usually do not have weakness, but today my grip suddenly feels weak.”

### Required correction
Each fact must retain provenance and status:
`present | denied | uncertain | contradicted | superseded`
plus turn/time order. Latest explicit correction supersedes an earlier statement, while clinically meaningful temporal changes are preserved rather than simply overwritten.

---

## CRITICAL 4 — Multi-region and multi-problem stories are flattened
Category: Data model / clinical reasoning
Severity: CRITICAL for generalist architecture; HIGH for current wrist P0

The 0.4.5 parser has a single global `side`, symptom list, trigger list, and temporal pattern. This is insufficient for stories such as:
- left wrist pain + right knee pain;
- thumb soreness + index/middle finger numbness;
- wrist pain with a separate neck symptom;
- bilateral symptoms with asymmetric severity.

Global side can become `both` even when the consumer described different sides for different body regions.

### Required correction
Introduce `ProblemThread[]` objects. Each thread links anatomy, side, symptoms, timing, triggers, function, safety clues, treatment history, and uncertainty. Shared systemic facts remain global.

---

## CRITICAL 5 — No-repeat protection can suppress the AI bubble while leaving the interactive question
Category: Frontend / integration
Severity: CRITICAL

0.4.5A can suppress `addAI()` when a question concept is already known, but a legacy function can then continue and render `oneSelect`, `multiselect`, or a composer beneath the missing bubble. This creates an orphaned or contextless interaction.

### Required correction
Question permission must happen before the entire question turn renders. A `QuestionTurn` is atomic: rationale + prompt + interaction control + callback. If prohibited, the whole turn is skipped and the controller requests the next eligible question.

---

## HIGH 6 — `KNOWN != ASKABLE` exists conceptually but clarification rules are too permissive
Category: Conversational AI
Severity: HIGH

The current integration allows repeat-like prompts when copy contains broad terms such as `precis`, `which part`, `which action`, `different`, or `else`. In particular, “else” can re-enable low-value “anything else?” behavior.

### Required correction
A known fact can only be revisited when the controller records a structured `clarificationReason`:
- ambiguous;
- contradictory;
- insufficient specificity for a decision;
- changed/worsening;
- safety verification.

No regex-based textual exception should authorize repetition.

---

## HIGH 7 — Next-question ranking is static, not truly decision-sensitive
Category: AI reasoning / clinical content
Severity: HIGH

The 0.4.5 engine uses generic fixed scores for missing concepts. This is better than a fixed questionnaire, but it is not the Generalist Brain described in the architecture. Question value should depend on the current competing patterns and whether an answer can alter safety, disposition, intervention requirements, or product choice.

### Required correction
Each candidate question receives a reasoned score from:
- safety impact;
- hypothesis discrimination;
- disposition impact;
- treatment-requirement impact;
- product-selection impact;
- burden;
- already-known penalty (infinite prohibition unless clarification earned).

Log the reason a question won.

---

## HIGH 8 — “Rich story” fast-path can advance before unresolved high-value gaps
Category: Routing
Severity: HIGH

0.4.5A labels a story rich when it has `where + symptom + (trigger or timing or duration)` and may jump toward safety. That does not guarantee side, onset, duration, sensory distribution, function change, or other decision-critical facts are resolved.

### Required correction
Remove “rich enough” as a generic shortcut. Advance only when the ranked unresolved-question list contains no fact above a defined decision-value threshold.

---

## HIGH 9 — Generic anatomy knowledge is too shallow for question sufficiency
Category: Clinical content / ontology
Severity: HIGH

Knowing the body region is not the same as knowing adequate location. “Knee” may still require anterior/medial/lateral/posterior localization. “Wrist” may require radial/ulnar/palmar/dorsal localization. “Hand” may require finger distribution. The current generic `known(where)` can mark anatomy complete too early.

### Required correction
Use hierarchical anatomy completeness: region -> subregion -> structure-relevant localization only when the surviving patterns require it. Do not ask finer anatomy if it cannot change the decision.

---

## HIGH 10 — Safety facts and ordinary clinical facts need separate governance
Category: Safety / regulatory
Severity: HIGH

Safety must not depend on the same permissive parsing/routing mechanism used for ordinary conversational convenience. A safety-relevant correction or ambiguity should trigger a deterministic re-evaluation before commerce.

### Required correction
Maintain a separately testable `SafetyState` derived from canonical Story State with explicit rules, unresolved safety ambiguities, escalation level, and reason. Any material Story State change invalidates prior safety clearance.

---

## HIGH 11 — Provider instruction handling must be semantic, not merely presence-based
Category: Clinical / product logic
Severity: HIGH

Capturing “a provider told me…” is necessary but not sufficient. Keneflex must identify what was instructed, duration/timing if supplied, whether it is still current, and which parts of Keneflex’s plan are constrained.

### Required correction
Represent provider directives as structured constraints: item/intervention, use schedule, body area, duration, confidence, current status, and prohibited conflicts.

---

## HIGH 12 — Existing-product KEEP logic needs the same structured requirements as BUY
Category: Product intelligence
Severity: HIGH

An owned item cannot pass merely because it matches a broad category. KEEP needs fit, condition, hygiene/expiration where relevant, function, compatibility, and treatment-role adequacy.

### Required correction
Route owned products through the same functional-capability gate as purchasable products. Unknown capability = not yet eligible.

---

## HIGH 13 — The conversational system has no durable question-decision audit trail
Category: Data / QA
Severity: HIGH

Without structured logs, regressions are found from screenshots rather than from traceable reasoning.

### Required correction
For every turn log locally during prototype QA:
- normalized Story State snapshot;
- facts added/removed/superseded;
- active problem threads;
- active safety state;
- candidate questions considered;
- selected question;
- why it won;
- why known questions were suppressed;
- next disposition/branch.

No personal identifying information is required for the P0 harness.

---

## HIGH 14 — The 50-subject test needs mutation families, not only independent stories
Category: QA
Severity: HIGH

Independent stories can all pass while the engine still fails to respond when one meaningful variable changes.

### Required correction
Create paired/mutated cases in which one variable changes at a time and assert that the downstream question or disposition changes when it should and remains invariant when it should not.

Core mutation axes: side, anatomy, quality, neuro symptoms, trauma, duration, morning/night/rest pattern, functional loss, worsening, provider instruction, existing product, budget, contradictory correction, multiple body regions, and symptom distribution.

---

## MEDIUM 15 — Automatic skipping can make Keneflex appear to jump mysteriously
Category: Behavioral science / UX
Severity: MEDIUM

Silently auto-calling callbacks for already-known structured questions is correct computationally but can create abrupt transitions if several legacy steps disappear at once.

### Required correction
The controller should produce one brief human reflection when useful, then advance. Do not expose hidden bookkeeping and do not generate one acknowledgement per skipped field.

---

## MEDIUM 16 — Reflection quality should demonstrate selective listening
Category: Consumer comprehension / behavior
Severity: MEDIUM

“Keneflex has the important parts of your story” is weaker than showing the 2–4 facts that materially changed the next step.

### Required correction
Reflect only decision-relevant facts, e.g. “You said the numbness is in the thumb and index finger and gets worse with scrolling, so Keneflex is treating that differently from the soreness.”

---

## MEDIUM 17 — Hard-coded regex vocabulary is acceptable for P0 but not the production brain
Category: AI/NLP architecture
Severity: MEDIUM now; CRITICAL before scale

The parser is a useful deterministic test harness, not a scalable natural-language understanding strategy. Consumer phrasing will outrun hand-authored regexes.

### Required correction after thesis validation
Use model-based structured extraction with schema validation, deterministic safety cross-checks, terminology normalization, provenance, and regression tests. The deterministic parser remains useful as an independent check/fallback for high-value facts.

---

## MEDIUM 18 — Participant-facing regulatory/claims boundary needs a dedicated content gate
Category: Regulatory / claims
Severity: MEDIUM for formative P0; HIGH before commercialization

The prototype internally reasons about patterns and conservative care. Consumer language must avoid implying unsupported diagnosis or guaranteed treatment outcomes, and the intended use requires formal regulatory review before commercial deployment.

### Required correction
Create a claims lint/review gate for recommendation text, confidence wording, safety language, evidence statements, affiliate disclosure, and outcome promises.

---

# Specialist conclusions

## Senior engineering
Do not continue stacking patches. Consolidate behavior ownership. Preserve the working visual/commerce shell while replacing the fragmented conversation controller.

## Conversational AI/NLP
Fact extraction alone is insufficient. The required unit is a provenance-aware Story State with problem threads, contradictions, uncertainty, and a decision-sensitive next-question policy.

## QA/test automation
Move from screenshot discovery to executable assertions. Run story extraction, mutation, routing, safety, and browser journeys on every release candidate.

## Frontend/mobile UX
Question rendering must be atomic. No AI bubble can be suppressed independently from its controls. Test scroll/focus/back/reload/tap behavior at phone width.

## Clinical/conservative-care content
Question value must be tied to what can change safety, disposition, treatment requirements, or product function. Avoid completeness-by-template.

## Behavioral science
Listening is demonstrated by non-repetition and selective follow-through. Excessive reflection is also friction; reflect only what explains why Keneflex is doing something different.

## Product intelligence
Clinical requirements and product capabilities remain separate layers. KEEP and BUY use the same adequacy standard. Commercial economics remain downstream.

## Regulatory/claims
Continue formative research, but keep the intended-use/regulatory boundary explicit and avoid diagnostic/treatment overclaims. Commercial deployment requires specialized counsel.

## Data/analytics
Instrument reasoning now. Future proprietary outcome data is only valuable if the input story, recommendation rationale, product choice, modifications, adherence, and outcome can be linked reliably.

---

# Required architectural target before P0

```text
Consumer turn
   -> Canonical Story Event Log
   -> Story State Builder
       -> Global facts
       -> ProblemThread[]
       -> provenance / polarity / uncertainty / supersession
   -> Safety State
   -> Hypothesis / requirement state
   -> Candidate Question Generator
   -> Decision-Value Ranker
   -> Question Permission Gate (KNOWN != ASKABLE)
   -> Atomic Question Turn renderer
   -> answer -> event log -> rebuild state -> repeat
   -> disposition
   -> solution requirements
   -> product intelligence
   -> coordinated plan
```

Legacy UI components may render outputs, but no legacy branch should independently select the next clinical question.

---

# P0 release criteria

P0 remains blocked until all are true:

1. Zero CRITICAL findings remain open.
2. All HIGH findings capable of contaminating Decision Closure are closed.
3. Canonical Story State owns conversation truth.
4. Corrections/retractions work.
5. Multi-thread story representation exists at least at comprehension level.
6. Question turns are atomic; no orphan controls.
7. `KNOWN != ASKABLE` is enforced structurally, not by prompt-copy regex.
8. Safety re-evaluates after any material story/solution change.
9. Provider instructions are hard constraints.
10. 50+ independent stories pass.
11. Mutation families pass.
12. 10 complete browser journeys pass on desktop and phone width.
13. No P0-blocking console/runtime errors.
14. Exact participant build SHA is frozen.

# Scope guard
Do NOT add new body-part commerce modules, membership, wearables, fulfillment, additional products, avatar work, private label, or broader OTC catalog before this gate is green.
