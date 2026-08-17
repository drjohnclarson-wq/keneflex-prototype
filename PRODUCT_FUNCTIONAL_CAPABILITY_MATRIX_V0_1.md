# Keneflex Product Functional Capability Matrix v0.1

## Purpose

Keneflex must not select a product because its label, category, popularity, affiliate economics, or marketing claims say it is appropriate for a condition. Product selection occurs only after the clinical/conservative-care layer defines the **functional jobs** the solution must perform.

The Product Functional Capability Matrix (PFCM) is the bridge between those treatment requirements and specific products. It is designed to become proprietary product intelligence and, later, to absorb Keneflex testing and outcome data.

## Permanent selection rule

**Clinical reasoning defines the job. Product intelligence proves which product can do the job. Commercial economics are downstream of the winner.**

A product is eligible only if it clears every hard requirement for the role. A crossover product is eligible only if its verified capabilities independently clear the hard requirements of every role it is being asked to replace.

Marketing language such as “for carpal tunnel,” “wrist & thumb,” “arthritis,” “sports,” or “all-day support” is evidence to investigate, never evidence sufficient to qualify the product.

## Product record

Every candidate product should carry the following fields.

### Identity and evidence provenance
- product_id
- brand
- model/SKU
- product type
- manufacturer URL
- instructions-for-use / label source
- source dates
- evidence tier for every material capability claim: manufacturer documentation / independent specification or test / Keneflex bench test / Keneflex consumer outcome data
- reviewer/date of last verification

### Anatomical control
- body region(s) covered
- structures/segments intentionally stabilized
- thumb included: none / CMC-MCP / MCP-IP / full thumb / unclear
- wrist included: yes/no
- laterality
- proximal/distal coverage

### Mechanical function
- wrist stabilization: none / flexible reminder / semi-rigid / rigid
- wrist position controllability: neutral-capable yes/no/uncertain
- wrist flexion-extension control
- radial-ulnar deviation control
- thumb stabilization level
- compression level/adjustability
- removable stays/splints
- direction-specific support
- motion deliberately preserved
- motion deliberately restricted

### Use-context fit
- sleep suitability
- daytime desk/phone suitability
- sport/activity suitability
- wet/sweat tolerance
- dexterity impact
- grip/pinch interference
- keyboard/mouse interference
- ease of don/doff
- left/right usability
- duration limits or manufacturer wear instructions

### Person fit
- sizing system and measurement points
- size range
- adjustability
- hand dominance implications
- material/allergy considerations
- skin/contact issues
- bulk profile
- known fit failure modes

### Safety / interaction
- contraindications/warnings
- circulation/neurologic precautions
- skin integrity precautions
- topical/heat/cold interaction rules
- sleep-use cautions
- cleaning/hygiene requirements
- provider-use instructions that can override Keneflex defaults

### Commercial/operational data — never used to determine clinical winner
- retail price
- Keneflex landed/affiliate economics
- availability
- delivery speed
- return policy
- warranty
- supplier reliability
- inventory status

These fields may break a tie **only after** products are clinically/functionally eligible, except when a consumer constraint such as delivery timing or budget is itself a declared solution requirement.

### Performance and outcome data
- manufacturer performance evidence
- independent testing/reviews
- Keneflex bench-test results
- fit success rate
- KEEP/replacement rate
- return rate and reason
- adherence/wearability outcomes
- symptom/function outcomes by use case
- consumer confidence/decision-closure outcomes
- adverse-event/complaint signals
- sample size and confidence level

## Treatment-role object

Before products are scored, the regional playbook / Crossover Resolver outputs one or more treatment-role objects:

- role_id
- surviving pattern(s)
- goal of role
- HARD requirements — failure of any one makes a product ineligible
- SOFT preferences — improve suitability but cannot rescue a hard failure
- timing: sleep / daytime / provoking activity / recovery / continuous as appropriate
- required motion to preserve
- motion/load to restrict
- person-specific fit constraints
- safety constraints
- provider instructions
- owned-item candidate, if any

## Eligibility algorithm

1. Build treatment-role object(s) from the clinical/conservative-care layer.
2. Apply safety/provider exclusions.
3. Compare every candidate against every HARD requirement.
4. Mark each requirement VERIFIED PASS / VERIFIED FAIL / UNKNOWN.
5. **UNKNOWN on a hard requirement is not a pass.** Product remains ineligible until verified.
6. Only eligible products proceed to comparative scoring on soft preferences, usability, evidence quality, fit, consumer constraints, delivery, returns, price, and eventually Keneflex outcome data.
7. Select one winner per role unless one verified product clears all roles.
8. If one product is proposed for multiple roles, run the Crossover Eligibility Gate below.
9. If no product clears the role, Keneflex says the product intelligence is incomplete rather than substituting a convenient SKU.
10. Commercial margin/affiliate/private-label status is appended only after winner selection and cannot change the winner.

## Crossover Eligibility Gate

A single product may replace two or more support roles only when all are true:

1. It independently passes every HARD requirement for Role A.
2. It independently passes every HARD requirement for Role B (and C, etc.).
3. The use schedule is compatible. Example: a product suitable for daytime activity is not assumed suitable for sleep.
4. The mechanical function required for one role does not undermine the other role.
5. Required useful motion for one problem is not unnecessarily restricted to satisfy the other.
6. The combined device does not introduce a new fit, pressure, skin, dexterity, grip, or adherence problem that makes the plan worse in practice.
7. Evidence exists for the actual capability, not merely condition names printed on packaging.

If any gate fails, Keneflex uses separate products, separate timing, or a non-product strategy as appropriate.

## Example: median-nerve-type pattern + radial-thumb tendon pattern

Illustrative treatment roles only; the regional playbook remains the authority.

### Role A — night wrist role
Hard requirements may include:
- reliably supports a comfortable neutral wrist position
- suitable/tolerable for sleep
- does not create harmful pressure or circulation problems
- fits the consumer correctly

Soft preferences may include:
- low bulk
- breathable
- easy nighttime don/doff
- minimal unnecessary thumb restriction

### Role B — thumb/wrist activity role
Hard requirements may include:
- provides the thumb/wrist stabilization required by the surviving thumb-side pattern
- compatible with the provoking daytime task
- preserves the useful motion the plan intentionally wants to retain
- fits the consumer correctly

A generic “wrist & thumb support” does **not** qualify for both roles until the matrix verifies both sets of hard requirements and compatible timing.

## Owned-product / KEEP rule

An owned product is evaluated through the same matrix as a product Keneflex could sell. Ownership does not imply adequacy. Keneflex checks:
- correct size/fit
- current condition/wear
- hygiene/expiration where relevant
- functional capability for the assigned role
- safety

If it clears the role, outcome = KEEP/$0 and Keneflex does not sell a redundant replacement.

## Prototype 0.4.4 implementation boundary

P0 does not require a production-scale database. It does require the prototype to behave honestly:
- do not claim one static brace solves multiple support roles without verified capability data;
- if a second role is identified and no verified candidate exists, hold checkout for that role;
- show the consumer the treatment job, not an internal diagnostic label;
- keep the consumer experience simple even though the backend matrix is detailed.

## Initial research queue

For the hand/wrist/thumb proving ground, populate and verify at least these product-role classes before expanding the catalog:
1. neutral-wrist night support
2. thumb-spica / thumb+wrist activity support
3. thumb-base/CMC-focused support
4. flexible movement-preserving wrist support
5. cold/recovery wrap
6. topical comfort product

For each class, compare at least 2–3 credible candidates before naming a winner. The prototype's current SKU must be treated as a candidate, not grandfathered as the winner.

## Data moat

The matrix becomes defensible when Keneflex layers proprietary evidence onto public specifications:

**requirements → verified product capabilities → fit → actual use/adherence → outcomes → returns/failures → crossover performance.**

The long-term asset is not a list of “best braces.” It is a growing dataset showing which verified product characteristics work for which consumer requirements, combinations of requirements, activities, bodies, and constraints.
