# Keneflex Hand / Wrist / Thumb Product Matrix — Population v0.1

## Purpose

This document operationalizes `PRODUCT_FUNCTIONAL_CAPABILITY_MATRIX_V0_1.md` for the first MSK proving ground. It is deliberately a **capability screen, not a winner list**. Manufacturer indication language is not treated as proof of function. UNKNOWN remains UNKNOWN until Keneflex verifies the capability from primary documentation, physical inspection/testing, or stronger evidence.

## Decision rule

1. Clinical/reconciliation logic defines the treatment job.
2. Product intelligence verifies whether a SKU can perform that job.
3. Fit, use context, safety, adherence and interaction constraints can disqualify an otherwise capable product.
4. Commercial margin, affiliate status, inventory and Keneflex ownership do not affect clinical/product eligibility.
5. A crossover product passes only when it independently clears every hard requirement of every role it is intended to replace.

## Evidence coding

- **P1 — Primary explicit:** manufacturer explicitly documents the capability/specification.
- **P2 — Primary indirect:** manufacturer design description strongly suggests the capability but does not verify the exact functional requirement.
- **U — Unknown:** insufficient evidence to claim the capability.
- **F — Fail:** documented characteristic conflicts with the requirement.

No P2 or U field may be promoted to a hard-requirement PASS without verification.

---

## Class A — Neutral-wrist night support

### FUTURO Adjustable Night Wrist Sleep Support — candidate A1

**Primary-source findings:** 3M states that cushioning beads promote a neutral hand position during sleep, the product has a removable palmar splint, provides moderate support, is ambidextrous, and is specifically designed for night use. Adjustable sizing. Manufacturer UPC 00051131201606.

| Capability | Status | Notes |
|---|---|---|
| Neutral wrist/hand positioning during sleep | P1 | Explicit manufacturer claim |
| Wrist stabilization | P1 | Palmar splint + moderate support |
| Night suitability | P1 | Purpose-built night support |
| Thumb immobilization | U | Not established; do not infer |
| Finger motion | U | Not sufficiently characterized for gate |
| Activity/dexterity suitability | F/Purpose mismatch | Night-first product; not an activity brace |
| Fit | P1 | Adjustable; exact range must be captured before recommendation |
| Crossover CTS-like + thumb role | **NO PASS** | Thumb-control requirement unverified |

**Current disposition:** Strong candidate for a neutral-wrist night role. Not eligible as a one-device thumb+wrist crossover solution on current evidence.

### ACE Night Wrist Sleep Support — candidate A2

**Primary-source findings:** 3M documents a palmar splint and cushioning beads to promote neutral hand position during sleep; one-size fit range is 5.25–9 inches; ambidextrous.

**Current disposition:** Credible comparator to FUTURO night support. Requires physical/comfort comparison; no basis yet to declare a winner.

---

## Class B — Wrist + thumb activity / thumb-spica support

### Neo G Stabilized Wrist and Thumb Brace REF 996 — candidate B1

**Primary-source findings:** Neo G documents a removable rigid metal splint for wrist/hand stabilization plus a malleable thumb splint for partial thumb immobilization. It is adjustable, universal-size/one-size-fits-most, and marketed for repetitive strain, carpal-tunnel-type symptoms, tendonitis and tenosynovitis.

| Capability | Status | Notes |
|---|---|---|
| Wrist stabilization | P1 | Rigid/removable metal splint |
| Thumb stabilization | P1 | Malleable thumb splint; partial immobilization |
| Neutral wrist at night | U | CTS marketing is not proof of neutral positioning during sleep |
| Day/activity use | P2 | Product construction/use claims support use, but task-specific dexterity must be tested |
| Finger motion | P2 | Likely preserved; must verify physically |
| Thumb motion preserved | F for high-motion requirement | Designed to partially immobilize thumb |
| Fit | P1/P2 | Universal adjustable; actual fit envelope and small/large-hand performance need testing |
| Crossover wrist + thumb stabilization | **PROVISIONAL** | Can only pass when required wrist position, thumb-control level and use schedule are verified compatible |

**Current disposition:** High-priority crossover candidate, but **not yet eligible for a CTS-like neutral-night + thumb role** solely from manufacturer claims.

### BraceAbility Wrist and Thumb Spica Splint — candidate B2

**Primary-source findings:** Manufacturer states that it restricts wrist and thumb motion; uses adjustable aluminum stays supporting the palmar wrist and thumb; leaves fingers free; available in XS/S/M/L and left/right versions; manufacturer states day/night wear.

**Current disposition:** Strong comparator when meaningful wrist + thumb restriction is required. Potential adherence/dexterity cost is a key test variable. Neutral-wrist capability remains U until verified.

---

## Class C — CMC-focused support / movement preservation

### Push ortho Thumb Brace CMC / Push MetaGrip family — candidate C1

**Primary-source findings:** Push states that the brace stabilizes the thumb basal CMC-1 joint while placing the thumb in a functional position and is designed to preserve hand function by restricting only the motion needed for stability. Indications include CMC-1 osteoarthritis and instability.

| Capability | Status | Notes |
|---|---|---|
| CMC-1 stabilization | P1 | Explicit |
| Functional thumb/hand position | P1 | Explicit |
| Movement preservation | P1/P2 | Design objective explicit; task performance still needs testing |
| Wrist stabilization | F / not its job | CMC-focused product |
| Neutral wrist support | F / not its job | Cannot satisfy wrist-neutral role |
| Water use | P1 for Push ortho CMC | Manufacturer says antimicrobial and usable in water |
| Crossover CTS-like wrist + CMC role | **NO as single device** | Does not perform wrist role |

**Current disposition:** High-priority candidate for isolated CMC role where preserving hand function matters. It should not be stretched into a wrist-support job.

### FUTURO Deluxe Thumb Stabilizer — candidate C2

**Primary-source findings:** 3M states moderate support, stability to lower thumb joints, range of motion for remaining fingers, ambidextrous use, and suitability for everyday activities including texting/gaming.

**Current disposition:** Lower-cost functional comparator for thumb stabilization. Exact CMC vs MCP control and degree of thumb-motion restriction require physical verification before matching to a specific hard requirement.

### Mueller Reversible Thumb Stabilizer SKU 62712/62712X — candidate C3

**Primary-source findings:** Mueller states two rigid stays limit thumb MCP motion, full finger movement is preserved, one-size fit range is wrist circumference 5.5–10.5 inches, and intended uses include sore/injured thumbs and osteoarthritis.

**Current disposition:** Useful comparator where MCP/thumb motion limitation is the job. Do not infer CMC-specific control from osteoarthritis marketing.

---

## Class D — Wrist stabilization with finger freedom / daytime comparison

### FUTURO Deluxe Wrist Stabilizer — candidate D1

**Primary-source findings:** 3M states firm wrist support, dorsal stabilizers, adjustable straps, free finger movement, breathable materials for all-day wear, and fit ranges spanning approximately 5.5–9 inches depending on size. It is marketed for carpal-tunnel-type symptoms and repetitive stress.

| Capability | Status | Notes |
|---|---|---|
| Wrist stabilization | P1 | Firm support + stabilizers |
| Finger motion | P1 | Explicit |
| Day use | P1 | All-day wear language |
| Neutral wrist position | U | Must verify actual angle/control; CTS indication is insufficient |
| Thumb stabilization | U/F | No adequate evidence for thumb-control role |
| Night use | F/Purpose mismatch | 3M FAQ says supports are generally daytime unless specifically designated night supports |

**Current disposition:** Strong daytime wrist-stabilization comparator. Not interchangeable with a purpose-built night-neutral brace without verification.

---

## Class E — Cold/recovery role

### Polar Products wrist offerings — status: **PRODUCT-GAP FLAG**

Current Polar wrist/hand catalog search surfaced wrist products designed primarily for **body cooling**, not clearly an injury-focused hot/cold therapy wrap for the hand/wrist role in our current prototype. The Cool58/Kool Max/Cool Comfort wrist products should **not automatically be treated as equivalent to a therapeutic cold-compression/recovery wrap** merely because they cool the wrist.

**Disposition:** Keep Polar as a supplier relationship, but the exact prototype recovery SKU must be re-verified against the intended job: anatomical coverage, cold-pack temperature/duration, compression/retention, skin barrier, reusability, and whether it can safely coexist with the selected brace/topical schedule. If the currently displayed prototype Polar product cannot clear those requirements, replace it rather than preserve the supplier.

This is a meaningful product-intelligence finding: supplier preference must not create a phantom capability.

---

## Class F — Topical comfort role

### Biofreeze Pain Relief Gel — candidate F1

**Primary-source findings:** Biofreeze's current label directions state adults/children age 2+ apply a thin film no more than 3–4 times daily. Warnings include external use only, avoid wounds/damaged or irritated skin, **do not bandage tightly**, and **do not use with a heating pad/device**; stop/use professional guidance conditions are also specified.

| Capability | Status | Notes |
|---|---|---|
| Temporary topical comfort role | P1 | Labeled topical analgesic role |
| Use beneath tight brace/compression | **F / interaction warning** | Label says do not bandage tightly |
| Combine with heat | **F** | Label warning |
| Broken/irritated skin | **F** | Label warning |
| Core treatment role | **NO** | Comfort layer only; cannot substitute for support/recovery/load-management job |

**Current disposition:** Eligible only as an optional comfort component when interaction and skin checks pass. The prototype must never imply that applying Biofreeze under a tightly fitted brace is routine.

---

# Cross-class findings that change recommendation logic

## 1. “Wrist brace” is not a functional class

The primary-source review already demonstrates materially different jobs inside that label: purpose-built neutral night positioning, firm daytime wrist stabilization, wrist+thumb immobilization, CMC-specific stabilization, and thumb MCP limitation. Keneflex must classify by function, not retail taxonomy.

## 2. Manufacturer condition claims are insufficient for crossover

Neo G and FUTURO products may be marketed for carpal-tunnel-type symptoms, but that does not establish the exact neutral-wrist control required by a Keneflex treatment specification. The matrix therefore preserves UNKNOWN rather than converting a condition label into a functional PASS.

## 3. One brace all day and all night is not automatically simpler/better

3M explicitly distinguishes its night wrist product from its generally daytime supports. A two-device day/night strategy may be more appropriate than forcing one crossover SKU to cover incompatible use contexts. Keneflex simplicity means the **minimum sufficient plan**, not necessarily the minimum SKU count.

## 4. Recovery SKU needs re-verification

The current Polar wrist catalog evidence does not yet prove the exact therapeutic recovery job assumed by the prototype. This should be resolved before the product recommendation is treated as researched rather than illustrative.

## 5. Topical + brace is a real interaction gate

Biofreeze's label warning against tight bandaging means the product-interaction engine must consider brace compression/timing. The safest consumer design may be sequential use rather than concurrent use, depending on the brace and label interpretation. Final commercial instructions require label/legal/clinical review.

---

# Next verification sprint — bounded before P0/P1 expansion

Do not expand categories yet. For the hand/wrist/thumb proving ground:

1. **Physically verify** neutral-wrist angle/control, thumb-control level, dexterity, comfort, don/doff burden, migration, heat/moisture and sleep tolerance for A1/A2/B1/B2/C1/C2/C3/D1.
2. Record exact **fit envelopes** and edge cases; one-size-fits-most is not a fit PASS.
3. Resolve the **Polar recovery SKU** or replace it with a candidate whose therapeutic hot/cold function is documented.
4. Create simple role-specific bench tests: neutral-wrist retention, thumb excursion/control, grip/dexterity interference, brace migration after 30 minutes of representative activity, and overnight comfort proxy testing.
5. Only after functional verification, compare consumer reviews/returns, price, availability, shipping, wholesale/affiliate economics and supplier reliability.
6. Preserve at least two qualified candidates per important role so Keneflex can learn outcomes and avoid supplier dependence.

## Commercial rule

Economics can break a tie between clinically/functionally equivalent products; economics cannot make an inferior or unverified product eligible.

## Status

**Matrix population v0.1 complete. No final product winners declared.** The most important newly exposed gap is the recovery/cold SKU: current primary-source evidence does not yet validate the Polar wrist products surfaced as the therapeutic recovery role assumed in the prototype.