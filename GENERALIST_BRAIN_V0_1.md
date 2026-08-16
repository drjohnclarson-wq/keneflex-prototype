# Keneflex Generalist Brain v0.1

Status: architecture and P0 build gate
Date: 2026-08-16

## Core purpose
Keneflex must begin as a broad consumer-health reasoner, not as an MSK questionnaire. MSK remains the first commercial wedge, but the intake architecture must be capable of starting from vague consumer language, maintaining multiple plausible problem classes, identifying safety concerns, asking the highest-information next question, and only then narrowing into the appropriate self-care / OTC / product pathway.

The consumer should experience one simple Keneflex conversation. Cross-specialty complexity stays backstage.

## Reasoning loop
For every consumer turn, Keneflex should internally maintain:

1. **Observed facts** — exactly what the consumer has told us; do not manufacture certainty.
2. **Broad hypothesis classes** — plausible domains/explanations still in play (e.g., MSK/mechanical, neurologic, dermatologic, inflammatory, infectious, vascular, traumatic, medication/systemic, other).
3. **Can't-miss / escalation possibilities** — conditions or combinations that would change disposition or stop commerce.
4. **Knowledge gaps** — facts that could materially change safety, domain, intervention requirements, or disposition.
5. **Next-question value** — rank candidate questions by how much the answer could change the decision.
6. **Disposition confidence** — insufficient information / urgent or clinician evaluation / reasonable conservative self-care-OTC path.
7. **Solution requirements** — only after sufficient narrowing: what the solution must do, avoid, fit, cost, and accommodate.

Loop: understand -> hypothesize broadly -> safety check -> identify decision-changing knowledge gap -> ask one simple question -> update -> repeat until enough information exists to choose disposition and solution requirements.

## Question-selection rule
Do not ask a question merely because it is part of a medical intake template. Ask it only if at least one plausible answer could materially change:

- safety/escalation;
- which problem class remains plausible;
- whether self-care/OTC is appropriate;
- the type of intervention required;
- a contraindication or incompatibility;
- the product requirements/fit;
- or the consumer's ability to follow the plan.

Prefer the question with the highest expected information gain and lowest consumer burden. Avoid asking the consumer to provide the medical conclusion Keneflex should infer (for example, "How much restriction do you want?"). Ask about the consumer's experience and goal; Keneflex determines the clinical/product implication.

## Knowledge stack — production target
The model's native knowledge is not the sole clinical source. Production architecture should be retrieval/tool based and provenance-aware.

### A. General clinical evidence
Evaluate commercial rights/API access for evidence-based point-of-care sources such as BMJ Best Practice, DynaMed/DynaMedex, and UpToDate Connect. Selection criteria: breadth, currency, consumer-facing/AI rights, retrieval granularity, provenance, drug integration, and economics.

### B. Differential / triage cross-check
Evaluate Infermedica and Isabel as independent second-opinion engines. Keneflex remains the orchestrator; these tools should surface missed hypotheses, high-risk combinations, and useful follow-up questions rather than own the consumer experience.

### C. Structured terminology
Use UMLS/SNOMED CT and related vocabularies to map ordinary consumer language to structured concepts without forcing medical vocabulary on the consumer. Use RxNorm for normalized drug identity.

### D. Medication / OTC truth layer
Use authoritative labeling and structured drug sources (FDA OTC monographs, DailyMed, RxNorm; likely a commercial interaction/contraindication source for production). Do not rely on model memory for medication safety.

### E. Conservative / integrative evidence
Make conservative and complementary options first-class candidates, not afterthoughts. Use evidence-oriented sources such as NCCIH and specialty clinical practice guidelines (PT, sports medicine, chiropractic where high-quality guidance exists, acupuncture/integrative medicine, nutrition, etc.). Conservative does not mean weak evidence; unconventional does not mean excluded.

### F. Expert Practice Library — proprietary
Capture structured knowledge from respected practitioners across family/internal medicine, pharmacy, dermatology, sports medicine/PM&R, PT, chiropractic, acupuncture, nutrition and other domains as Keneflex expands.

Each expert-practice entry must retain:
- expert identity/credentials/specialty;
- exact claim or practice pattern;
- clinical context and exclusions;
- date;
- supporting evidence if any;
- agreement/disagreement from other experts;
- conflicts of interest;
- confidence classification.

Expert practice can suggest questions/options and identify blind spots. It cannot override hard safety rules or stronger contradictory evidence without explicit review.

### G. Lived-experience / anecdotal signal layer — proprietary
Keneflex should listen to consumer anecdotes, clinician anecdotes, reviews, community discussions, product failure patterns, and Keneflex outcomes without treating anecdotes as proof.

Classify signals by provenance and strength. Anecdotal signals can:
- generate hypotheses;
- identify overlooked low-risk options;
- reveal fit/usability/adherence problems;
- identify product failure modes;
- prioritize questions or future testing.

They cannot independently establish efficacy, diagnose a condition, or override safety/contraindication evidence.

## Evidence / option hierarchy
Do not use a simplistic "RCT or discard" rule. For every candidate intervention consider separately:

- evidence certainty;
- expected magnitude of benefit;
- downside/harm;
- contraindications/interactions;
- cost;
- consumer burden/adherence;
- reversibility;
- compatibility with core care;
- expert-practice support;
- real-world/lived-experience signal;
- uncertainty.

This permits a low-cost, low-risk conservative option with limited evidence to be presented honestly as optional while preventing anecdote from masquerading as established efficacy.

Internal confidence labels may include:
1. strong evidence;
2. moderate evidence;
3. limited evidence but clinically reasonable;
4. expert-practice signal;
5. real-world/consumer signal;
6. anecdotal/experimental;
7. evidence against / avoid.

Consumer language should be simpler and calibrated (e.g., "good evidence," "reasonable to try but evidence is limited," "I would not recommend this").

## Safety architecture
Safety is a separate deterministic/structured layer plus model reasoning. It should include cross-domain red flags and risky combinations, not merely MSK red flags. A safety trigger can stop commerce or require clinician/urgent evaluation even if the recommendation model otherwise has high confidence.

Keneflex must be allowed to conclude:
- I have enough to help with a conservative/OTC solution.
- I need one more piece of information.
- I do not have enough confidence to recommend a product.
- This should be evaluated by a clinician/urgent service rather than solved here.

## Consumer explanation rule
Never expose the internal differential or database architecture unless useful for safety. Translate reasoning into:

**What you told me -> why it mattered -> what I did because of it.**

Use minimum sufficient explanation. Do not overwhelm the consumer with a list of diagnoses or technical reasoning.

## Regulatory boundary
The intended use must be reviewed by specialized digital-health/FDA counsel before commercial deployment. The architecture should avoid unnecessary diagnostic/treatment claims while still doing deep internal reasoning. Patient/caregiver-facing software is not automatically covered by the statutory Non-Device CDS exclusion. Do not treat "wellness" wording as a regulatory shortcut.

This is a founder-level legal/regulatory gate before public production, not a blocker to the current formative prototype research.

---

# Prototype 0.4.4 — P0 Build Gate

We do **not** integrate all production medical APIs before P0. We simulate the Generalist Brain credibly for the standardized hand scenario and test whether consumers value the resulting experience.

P0 is ready only when these behaviors are visible:

### 1. Obvious conversational opening
Primary screen prominently asks **"What's bothering you?"** with a large own-words input and obvious action. The consumer should not hunt for where to type.

### 2. No wasteful "missing fields" page
After the initial statement, acknowledge it briefly and immediately continue narrowing. Do not show Keneflex's internal missing-field/database state to the consumer.

### 3. Broad first characterization
Before assuming MSK, ask an obvious **"Pick all that apply"** question capable of distinguishing at least pain/soreness, swelling, stiffness, numbness/tingling, weakness, rash/redness/skin change, wound/burn, visible/color change, something else, and not sure. Multi-select must be visually unmistakable.

### 4. Dynamic narrowing
For the standardized pain/soreness path, Keneflex narrows location and character only after the broad characterization. If skin/neuro/wound signals were selected, the conversation would visibly take a different path or state that the prototype would branch rather than silently continue down MSK.

### 5. Timing beyond duration when decision-relevant
Capture duration plus useful pattern when relevant: during use, after activity, morning, night, wakes from sleep, constant/intermittent, etc. Do not ask every timing question mechanically; demonstrate that timing is used because it changes reasoning.

### 6. Goal/activity rather than requested medical solution
Remove questions such as "How much restriction do you want?" Ask what the consumer needs to keep doing/get back to and what actions are difficult. Keneflex decides the appropriate support/stability/mobility tradeoff and explains it.

### 7. Visible deeper reasoning without technical leakage
Before recommending, the prototype should demonstrate that Keneflex considered what else could matter, checked safety, and determined it has enough information. Do not expose a frightening differential list.

### 8. Consumer-language reasoning rewrite
All "How your answers changed the solution" content must use the pattern **what you told me -> why it mattered -> what I did** in plain consumer language. Remove research/algorithm jargon from participant-facing screens.

### 9. Preserve existing thesis-critical behaviors
Do not lose provider-direction constraints, existing-product KEEP assessment, fit/condition assessment, complete solution/self-care, rejected alternatives, solution tuning, commercial disclosure, checkout consistency, or CLOSED/CONFIRMATION/REOPENED measurement.

### 10. P0 scope control
No production medical database integration, multimodal diagnosis, broad OTC catalog, membership, wearables, fulfillment integration, private label, or new commercial complexity is required for P0.

## P0 thesis question after 0.4.4
Does the participant experience Keneflex as an intelligent helper that can start from almost nothing, figure out what matters across a broad health frame, narrow efficiently, and finish an appropriate consumer decision — rather than as a disguised product quiz?

If that experience is not valuable, do not spend heavily on the production medical-intelligence stack. If it is valuable, begin vendor/API and regulatory diligence in parallel with the next validation stage.
