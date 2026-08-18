# Keneflex 0.4.7 — Visual + Behavioral Deep Audit Before P0

## Why this gate exists
The current build contains increasingly strong reasoning but too much internal scaffolding, text density, weak/generic imagery, and consumer burden in the downstream plan pages. P0 is blocked until the *entire available participant experience* is audited, not only the conversation and recommendation reveal.

## Specialist panel
Every screen/branch is reviewed through these lenses:
- Consumer product/UX design
- Visual communication / information design
- Consumer decision & behavioral science
- Health literacy / plain-language content
- Conversational AI / NLP
- Clinical/safety content
- E-commerce / conversion
- Frontend/mobile accessibility
- QA/test automation
- Product intelligence / recommendation integrity

## Permanent experience principles
1. **Pictures should do work.** Prefer a useful image/diagram/sequence over a paragraph when the visual can communicate the idea faster or more accurately.
2. **Simple first, depth on demand.** Default view shows the decision and the next action. Explanation/research/detail is progressively disclosed.
3. **No internal language.** Prototype, production, role-completion, product-intelligence notes, future-commerce notes, engine instructions, implementation commentary, and internal taxonomies never render to a participant.
4. **Keneflex carries the decision burden.** The consumer chooses whether to adopt optional components; Keneflex chooses the best eligible option within each component.
5. **The plan is the product.** Do not frame non-merchandise guidance as $0 paperwork or filler.
6. **Consumer language only.** A screen must make sense without clinical, product-development, or software knowledge.
7. **One screen = one primary job.** Remove competing calls to action and unnecessary choices.
8. **Imagery must be specific to the instruction.** Decorative icons do not count as useful imagery.
9. **No false completion.** If Keneflex has identified two hard solution requirements, it cannot visually imply that one unresolved product completes the plan.
10. **Mobile first.** Every available page must remain legible and obvious at phone width.

## 50-subject simulated deep test
Run 50 distinct synthetic consumer profiles through the complete currently available experience. This is a QA simulation, not a substitute for real P0/P1 consumers.

Variables must include:
- vague vs rich opening story
- sentence order/paraphrases/typos
- left/right/bilateral/uncertain side
- wrist/thumb/hand plus out-of-scope MSK regions to test graceful boundaries
- pain/soreness/numbness/tingling/weakness/swelling/stiffness combinations
- acute/gradual/repetitive/uncertain onset
- days/weeks/month+ duration
- phone/computer/sport/work/sleep/mixed triggers
- improvement with rest vs persistent symptoms
- ambiguous vs meaningful dropping/weakness
- trauma and no-trauma variants
- provider instruction present/absent
- already-owned item usable/unusable/unknown
- budget constraint
- declined topical/recovery/support component
- multiple surviving problem patterns
- ergonomic contribution present/absent
- consumer who wants only essentials vs consumer interested in optional improvements

### Every subject must reach and audit every page that is logically available
Conversation → story comprehension → safety/provider constraint → reasoning/decision work → recommendation → complete plan → product explanation/rejected options → safety/use → plan adjustment → care-plan/action content → movement/exercise → support use → recovery/comfort → activity modification → workstation/device content when relevant → follow-up → research/how-it-works/our-approach where available → checkout or legitimate blocked state.

## Page-by-page scoring
Each rendered page receives PASS/FAIL on:
- immediate comprehension in ~5 seconds
- consumer-facing language
- personalization to facts actually supplied
- no redundant questions or stale facts
- visual hierarchy
- text burden
- useful imagery
- imagery/instruction correspondence
- clear next action
- appropriate optionality
- trust/integrity
- recommendation consistency
- safety consistency
- mobile readability
- no internal/prototype leakage

Any FAIL is logged by failure class, corrected at the root, then the entire relevant regression family is rerun.

## Visual redesign standard
### Recommendation/product pages
- Real product image large enough to understand the item.
- At-a-glance: what it is, why Keneflex chose it for *this person*, when/how it fits the plan, essential vs optional.
- Hide internal role labels.

### Movement/exercise pages
Replace generic decorative hand icons with simple, attractive step-by-step instructional visuals showing:
- starting position
- movement direction
- end position/range
- repetitions/time where supported
- stop/change cue
A consumer should understand the movement before reading the paragraph.

### Support-use pages
Use product-specific imagery or simple diagrams for:
- correct orientation/placement
- fit/tightness checks
- when to wear it
- relevant do/don't interaction (e.g. topical/compression timing when applicable)
Avoid generic text such as "make the support do its job" without showing how.

### Recovery pages
Use a short visual sequence: aggravating activity → reduce/stop load → selected recovery method → reassess. Product-specific use remains consistent with verified labeling.

### Activity/ergonomic pages
Show the provoking setup/motion and the recommended change side-by-side where possible. No-cost change first. If equipment is worth considering, Keneflex eventually identifies the best eligible option for that person's requirement; the consumer may add the optional improvement without being asked to shop a catalog.

### Follow-up
Use a simple visual progress choice (better / partly better / not better / new or worse) and ask only the outcome facts needed to re-solve the plan.

## Behavioral-science gate
The experience must not create confidence through information volume. Test whether each element answers one of these consumer questions:
- Did Keneflex understand me?
- Why is this the right plan for me?
- What exactly should I do?
- What is essential vs optional?
- What did Keneflex rule out and why?
- Can I change a constraint without restarting shopping?
- What happens if this does not work?
If content answers none of these, remove or hide it.

## Consumer-language leakage blacklist
Automatically inspect visible strings for terms/phrases including: prototype, production system, production engine, product-intelligence note, future commerce opportunity, current cart, support role still, role being completed, should replace these, should not automatically, separate solution, implementation sheets, filler, escalating merchandise, current story, eligible after product verification. A match is a release failure unless explicitly approved as legitimate consumer language.

## P0 freeze rule
Do not run P0 until:
1. all 50 synthetic complete-path subjects have been evaluated;
2. every available downstream page has been inspected;
3. root-cause fixes have been rerun against affected variants;
4. internal-language scan is clean;
5. visual/behavioral specialist gate is green;
6. phone-width browser pass is green;
7. one final real-device smoke test passes.

After this gate is green, stop polishing and run P0. Real consumer behavior remains the next source of truth.