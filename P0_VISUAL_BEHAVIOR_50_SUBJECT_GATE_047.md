# Keneflex 0.4.7 — Visual + Behavioral 50-Subject P0 Gate

## Why this gate exists
The reasoning QA is not enough. Every consumer-visible page must communicate the plan simply, visually, and without exposing internal Keneflex/prototype language. P0 is blocked until the complete participant journey passes this gate.

## Specialist panel
Run every screen through these lenses together, not sequentially:
- Consumer product/UX designer
- Information designer / visual storyteller
- Consumer decision & behavioral science
- Health literacy / plain-language editor
- Clinical conservative-care reviewer
- Product intelligence / merchandising
- Conversational AI / NLP
- Frontend/mobile/accessibility QA
- Trust/commercial-integrity reviewer

## Non-negotiable visual principle
Pictures must do explanatory work. Do not add decorative stock imagery merely to reduce text. Prefer simple, immediately understandable visuals that show WHAT to do, WHERE, WHEN, or HOW.

Examples:
- body-region illustration showing the relevant area
- support shown on the correct hand/body area
- day vs night use visual
- phone position before/after
- workstation before/after
- movement/exercise shown as 2–3 sequential frames or short animation/video in production
- cold/recovery placement and timing visual
- simple follow-up progress visual

If a picture cannot communicate the instruction accurately, use concise text rather than misleading art.

## Consumer-language firewall
FAIL any page containing internal implementation language, including: prototype, production system/engine, product-intelligence note, role still being completed, future commerce opportunity, current story, eligible after verification, automatically escalating merchandise, support job, second support role, or instructions telling Keneflex what Keneflex should do.

Internal reasoning may contain these concepts. Consumer rendering may not.

## Information hierarchy
The default plan should be simple enough to scan rather than read like a packet.
1. What Keneflex noticed / what matters
2. What to do now
3. What Keneflex recommends and why
4. When/how to use each selected component
5. Movement/activity changes with visual instruction
6. Recovery/comfort
7. Contributing setup factors, when relevant
8. What to watch for / when to check back

Detailed evidence, rejected products, source transparency, printable detail, and safety references should use progressive disclosure when they are not necessary to the immediate action.

Do not make consumers select which sheets are useful before Keneflex gives them the plan. The personalized plan is assembled automatically; print/save/customize is secondary.

## Ergonomic solution rule
If phone/computer/workstation setup is relevant, Keneflex identifies the specific contributing factors and the best option within each useful intervention category. The consumer may choose which OPTIONAL improvements to adopt, but Keneflex does not return a shelf of mice, stands, keyboards, grips, etc.

Order:
1. no-cost change if adequate
2. Keneflex's highest-priority equipment improvement, if warranted
3. additional worthwhile optional improvements

Future product cards should include useful product imagery plus setup/use imagery. Consumer choice is whether to implement an optional component, not which of many products to research.

## 50-subject simulated review
Create 50 distinct synthetic consumer stories spanning the currently supported journey and force each through EVERY page/state it can reach, including care-plan/detail pages, not only intake/recommendation.

Variables must include:
- vague vs rich opening
- left/right/bilateral/uncertain side
- wrist/thumb/fingers/hand plus unsupported/nearby body-region inputs
- pain/soreness, numbness/tingling, mixed symptoms
- acute/gradual/uncertain onset
- days/weeks/month+
- phone, computer, sport, work, sleep/morning, mixed triggers
- improves with rest vs persists
- occasional dropping vs worsening weakness/function
- trauma vs no trauma
- provider instruction vs none
- existing support/cold/topical/home remedy vs none
- adequate vs poor fit/condition
- budget constraint
- declines topical
- combined tuning constraints
- correction of a previously stated fact
- uncertain answers and irrelevant details

For each subject score every visible state/page on:
A. Story comprehension — no known fact is re-asked or contradicted.
B. Next-question quality — unresolved, decision-relevant, coherent.
C. Consumer language — zero internal/development leakage.
D. Scanability — consumer can identify the next action without reading paragraphs.
E. Visual explanatory value — imagery meaningfully reduces cognitive work.
F. Personalization — page reflects that consumer's actual story.
G. Decision burden — Keneflex chooses within solution roles; consumer is not sent shopping.
H. Plan coherence — recommendation, care plan, tuning, safety and cart agree.
I. Trust calibration — why/uncertainty/safety are available without overwhelming the default view.
J. Mobile usability — readable, tappable, no excessive vertical burden or orphan controls.

A subject FAILS if any safety-critical or recommendation-integrity defect occurs. A page FAILS if it exposes internal language. Repeated comprehension, visual, or burden defects become release blockers rather than copy nits.

## Required page coverage
The test must explicitly traverse and review:
- home/opening
- all intake conversation states generated by the story
- story summary/acknowledgment
- safety/provider constraint states
- recommendation reveal
- product cards and rationale
- evidence/rejected-option disclosure
- tuning/KEEP/budget states
- safety & use review after each materially changed plan
- cart preview
- Keneflex Plan overview
- What to do now / action plan
- movement/exercise content
- support-use content
- recovery/comfort content
- activity modification
- workstation/device content when relevant
- follow-up content
- How it works
- Our approach
- print/save/customize states

## Page-specific visual acceptance
Movement/exercise: no generic icons standing in for movements when a consumer could perform them incorrectly. Use anatomically understandable sequential visuals.
Support use: show the actual selected product on the relevant side/region and visually distinguish timing/use context.
Recovery: show placement/use sequence where it adds clarity; never imply an unverified use.
Activity modification: before/after visuals should make the behavior change obvious.
Workstation/device: show the consumer's relevant setup problem and recommended change; future product selection uses Keneflex's product engine and product/setup imagery.
Follow-up: visually simplify what improvement, partial response, no response, and worsening mean.

## Copy rules
- Replace “care packet” with “Keneflex Plan” in the default consumer experience.
- Never present included guidance as $0; inclusion does not mean zero value.
- Remove internal taxonomy badges unless a consumer comprehension test proves a badge helps.
- Avoid “treatment value,” “merchandise,” “role,” “production,” and similar internal vocabulary.
- One screen/section should answer one primary consumer question.

## Release gate
P0 may proceed only when:
- 50/50 synthetic subjects complete their reachable journey without safety/recommendation-integrity failure;
- 0 consumer-visible internal-language leaks remain across all traversed pages;
- no known fact is redundantly re-asked in the regression set;
- every recommendation remains coherent after tuning/provider/safety changes;
- every instructional visual is accurate and useful, or intentionally omitted pending a verified visual;
- phone-width browser QA passes;
- one final real-device founder walkthrough passes.

Do not broaden clinical/body-region scope to satisfy this gate. Unsupported inputs should be handled honestly. The purpose is to make the CURRENT prototype coherent, simple, trustworthy and visually understandable before P0.