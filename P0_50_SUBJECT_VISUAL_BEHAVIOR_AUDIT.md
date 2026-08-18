# Keneflex P0 — 50-Subject Visual, Behavioral & Full-Page Audit

## Purpose
This is a synthetic/adversarial QA cohort, not a substitute for real human P0/P1 research. Its job is to expose defects before humans see the prototype.

## Specialist review lenses
Every path is reviewed simultaneously through these lenses:
1. Consumer behavior / decision closure
2. UX / interaction design
3. Visual communication / information design
4. Consumer-health content
5. Clinical safety / conservative-care logic
6. Product intelligence / fit / KEEP
7. Conversation / story-memory engineering
8. Accessibility / mobile readability
9. Commerce integrity / optionality
10. Software QA / state persistence

## 50-subject variable matrix
Run 50 distinct stories across: sparse vs rich opening; left/right/bilateral; wrist/thumb/fingers/hand/shoulder/other MSK wording; days/weeks/months; sudden/gradual/uncertain onset; sports/phone/computer/work/home/sleep triggers; pain/soreness/tingling/numbness/weakness/swelling/stiffness; explicit negatives; ambiguous dropping; prior provider direction; owned usable/unusable product; no owned product; budget pressure; no topical; no cold; combined constraints; uncertain anatomy; no obvious purchasable brace role; and stories containing several facts in one sentence.

At least 10 cases must deliberately change multiple variables at once. At least 10 must contain facts that the old flow historically re-asked. At least 5 must contain an answer that is ambiguous and requires one clarification rather than assumption. At least 5 must be outside the happy-path wrist/thumb story to test graceful scope handling.

## Mandatory page traversal
Every consumer-visible page/state must be reached across the cohort, including: home/opening; every conversation question type; story summary; safety clarification; provider constraint; owned-item evaluation; recommendation reveal; reasoning/proof; product cards; rejected options; confidence/uncertainty; commercial disclosure; plan tuning; safety review; cart preview; Keneflex Plan; movement; support-use guidance; recovery; activity modification; workstation/device guidance; follow-up; How it works; Our approach; KEEP/$0 states; budget/no-topical/owned-cold combinations; and any stop/escalation state.

## Hard consumer-language gate
FAIL any rendered text containing internal-development language or internal taxonomy, including examples such as: prototype, production system, production engine, product-intelligence note, support role still being completed, second support role, future commerce opportunity, eligible after verification, current story, automatically escalating merchandise, treatment value not filler, or instructions describing what Keneflex 'should' do.

Consumer copy may communicate uncertainty, but must translate it into a useful consumer action. Never expose implementation scaffolding.

## Visual-first design gate
Default rule: if a picture can communicate an action, position, fit, sequence, comparison or setup faster than prose, use the picture and shorten the prose.

Every instructional visual must answer a specific question: WHAT do I do? WHERE? HOW? HOW MUCH/HOW LONG? WHAT SHOULD IT FEEL LIKE? WHAT SHOULD MAKE ME STOP?

Generic decorative icons do not count as instructional imagery. Avoid ambiguous hand silhouettes when anatomy, direction or positioning matters. Prefer clean, consistent Keneflex illustrations/photo-diagrams with the relevant body area/device, directional arrows only where useful, and one idea per frame.

Target: the consumer should be able to understand the gist of each plan section by scanning headings + visuals before reading body copy.

## Page redesign rules
### Keneflex Plan
One consumer concept, not a configurable 'packet'. Remove $0/value framing. Keneflex preselects relevant content. Optional print/save customization is secondary.

### Starting plan
Replace internal role language with a short visual sequence: 1) protect/support when needed, 2) reduce the trigger, 3) recover after aggravating use, 4) keep comfortable movement, 5) optional comfort, 6) tell Keneflex what changed. Only show steps that apply to this consumer.

### Movement
No generic placeholder exercise card may masquerade as personalized treatment. Each included movement needs a clear illustration or short visual sequence plus plain-language dose/stop rule appropriate to the evidence available. If Keneflex cannot support a specific exercise confidently, say what safe movement principle applies rather than exposing an internal note.

### Support use
Show the actual selected product and visually demonstrate fit/position/use context when verified. Translate manufacturer constraints and Keneflex person-specific context into simple instructions. No 'current prototype found...' language.

### Recovery
Show the actual verified recovery product or the consumer's KEEP item, where it goes, skin barrier/timing where relevant, and sequencing with other products. Remove product-verification notes from consumer view.

### Activity modification
Turn phone/computer/activity changes into visual before/after or do/avoid cards. No 'treatment value' or merchandising language.

### Workstation/device
Consumer framing: 'Your setup may be contributing.' Show no-cost changes first with imagery. Future product engine behavior: Keneflex identifies the best option within each useful ergonomic role; consumer chooses which optional improvements to add, rather than choosing among a shelf of products.

### Follow-up
Use a simple visual status choice: Better / partly better / not better / something changed. Ask only the outcome facts needed to re-solve. Keep warning changes visually distinct and concise.

### Recommendation
Consumer must instantly understand: what Keneflex thinks matters; what to do; which product(s) are essential vs optional; why each was selected; when each is used. Internal role taxonomy stays hidden.

## Behavioral gates
- No fact already supplied is re-asked unless Keneflex explicitly explains why clarification is needed.
- Rich opening stories must reduce question burden.
- Contradictory facts trigger clarification, not silent overwrite.
- Ambiguity triggers one useful clarification, not assumption or immediate escalation.
- Provider instructions are hard constraints.
- KEEP products pass the same functional/fit/condition/safety gate as purchasable products.
- Tuning re-solves the visible plan and cart.
- Safety follows the currently configured solution.
- Optional components remain optional; Keneflex selects the best option within a role, consumer chooses whether to adopt optional roles.
- No unsupported body-region/product capability is fabricated. Out-of-scope cases receive useful conservative next-step handling rather than a fake recommendation.

## Visual/behavior scoring for each of 50 subjects
Score 0/1 for each:
1. Story understood
2. No redundant question
3. Logical next question
4. Safety calibrated
5. Recommendation coherent
6. Plan complete
7. Essential vs optional obvious
8. Imagery improves comprehension
9. Page understandable by scan
10. No internal language
11. Consumer retains appropriate control
12. No shopping burden returned to consumer
13. Mobile layout usable
14. State persists through tuning/safety/cart
15. Follow-up is obvious

Any safety, provider-constraint, internal-language, contradictory-plan, broken-state or fabricated-capability failure is a HARD FAIL regardless of total score.

## Release threshold
P0 is blocked until:
- 50/50 have zero hard failures;
- >= 48/50 pass all non-safety behavioral gates;
- 50/50 pages contain no internal-development leakage;
- all instructional pages meet the visual-first gate or explicitly document why text is superior;
- all historically failing regression cases pass;
- one complete desktop and one complete phone-width traversal pass after the final code change.

## Human validation remains required
This audit can make the prototype cleaner and more adversarially tested, but it cannot truthfully simulate human trust, delight, comprehension, fatigue or decision closure. P0 remains a non-counted human dry run after this gate is green.