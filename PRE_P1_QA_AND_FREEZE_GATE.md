# Keneflex Prototype 0.4.3 — Pre-P1 QA & Freeze Gate

Status: ACTIVE BUILD GATE — DO NOT START P1 UNTIL ALL MUST-PASS ITEMS ARE GREEN

Purpose: Convert the thesis acceptance specification into an executable end-to-end QA protocol. This is designed to prevent a technically functional but thesis-incomplete prototype from contaminating the six-person validation.

## 1. Primary-path QA — vague consumer language

Start a clean session with exactly: `My hand has been bothering me.`

MUST PASS:
- Keneflex does not infer wrist, thumb, pickleball, timing, or movement priority.
- Area/timing/activity/priority display as unknown until supplied.
- Safety screen occurs before commerce.
- No product appears before localization and decision-critical facts are gathered.
- Location can be supplied in plain language; `I'm not sure / several areas` is accepted without forcing a false answer.
- Activity is supplied by the consumer, not suggested as pickleball.
- Once a fact is supplied, it is not asked again.

FAIL if a consumer must know anatomy/diagnosis/product terminology before Keneflex can proceed.

## 2. Rich-input reuse QA

Start a clean session with: `My wrist and thumb have been aching for about three weeks when I use them. I want to keep playing pickleball and don't want a brace that restricts me too much.`

MUST PASS:
- Keneflex extracts wrist + thumb, ~3 weeks, pickleball, aching/soreness, movement-preservation priority.
- Those facts are visibly reflected back.
- Keneflex skips redundant follow-ups and asks only remaining decision-critical questions.

FAIL if the user is forced to repeat facts already supplied.

## 3. Safety-stop QA

At safety screen choose `Yes / I'm not sure`.

MUST PASS:
- Shopping/recommendation stops.
- No product is pushed through the stop state.
- Language is calm and plain rather than alarmist.

## 4. Provider-constraint QA

Choose that a provider gave a specific instruction.

MUST PASS:
- Prototype explains that exact product instructions are not substituted.
- Type/feature instructions constrain the eligible set.
- Keneflex does not frame itself as overriding the provider.

## 5. Primary recommendation QA

Use standardized case facts:
- wrist + thumb
- about 3 weeks
- aching/soreness with use
- pickleball
- preserve useful movement
- 7.0-inch wrist
- no provider constraint
- no adequate existing support

MUST PASS:
- Visible decision-work screen appears before recommendation.
- Consumer can see how pattern, activity priority, fit, and contender tradeoffs changed the answer.
- One primary support wins; no shelf of alternatives is presented.
- Solution contains primary support + recovery + justified topical + substantial self-care plan.
- `What I did not add` is visible.
- Rejected alternatives are optional/on-demand and framed as proof, not choices.
- Evidence confidence distinguishes product/fit facts from uncertain individual outcome.
- Consumer can challenge the pick.

## 6. Solution Tuning QA — owned recovery item

From the completed solution choose `I already have a cold pack / home remedy`.

MUST PASS BEFORE P1:
- Keneflex evaluates adequacy rather than treating ownership as proof.
- If adequate, the Polar component is visibly removed/replaced by `Use yours` in the displayed solution.
- Displayed subtotal changes from $52.98 to $31.98.
- Checkout reflects the rebuilt solution and does not re-add Polar.
- Self-care remains included.
- Consumer is not shown alternative cold products to shop.

CURRENT 0.4.3 LOGIC STATUS: PARTIAL — explanatory re-solve exists; displayed cards/cart/subtotal still need to mutate.

## 7. Solution Tuning QA — no topical

Choose `I don't want the topical product`.

MUST PASS BEFORE P1:
- Keneflex explains that topical is optional in this scenario.
- Biofreeze visibly disappears from the active solution.
- Displayed subtotal changes from $52.98 to $40.99.
- Checkout excludes Biofreeze.
- Support + recovery + self-care remain coherent.

CURRENT 0.4.3 LOGIC STATUS: PARTIAL — explanatory re-solve exists; displayed cards/cart/subtotal still need to mutate.

## 8. Solution Tuning QA — budget under $30

Choose `This costs more than I want to spend` and apply the standardized secondary challenge: `I don't want to spend more than $30.`

MUST PASS BEFORE P1:
- Keneflex preserves $0 self-care.
- It asks/uses whether an adequate recovery item is already owned before assuming one away.
- Optional topical is removed before compromising the primary support.
- A cheaper support may replace the winner only if it clears the same hard requirements.
- If no coherent solution under $30 can be justified, Keneflex says so rather than pretending the budget can be met.
- No Bronze/Silver/Gold tiers and no catalog of cheaper products.
- Displayed solution/cart reflect the answer Keneflex actually gives.

CURRENT 0.4.3 LOGIC STATUS: PARTIAL — decision hierarchy exists; visual/cart state and explicit budget-entry/recalculation remain incomplete.

## 9. Combined-constraint QA

Test at least:
- owns adequate cold item + declines topical
- owns adequate cold item + <$30 budget

MUST PASS:
- State changes compose correctly rather than overwrite each other.
- Subtotal and checkout remain internally consistent.
- Reset restores the original $52.98 three-product solution.

Expected prototype totals when no substitute support is introduced:
- Original: $52.98
- Own cold only: $31.98
- No topical only: $40.99
- Own cold + no topical: $19.99

## 10. Commercial-integrity QA

MUST PASS BEFORE P1:
- Near the transaction, consumer can discover plain-language disclosure that Keneflex may earn money from some purchases.
- Disclosure states that economics cannot determine eligibility/winner.
- KEEP/$0 and `What I did not add` remain visible integrity signals.
- Disclosure is not hidden behind legal jargon such as only `affiliate link`.

Suggested prototype language:
`Keneflex may earn money when you purchase some products we recommend. That cannot determine which product is eligible or which solution wins. If the right answer is something you already own—or no purchase at all—we'll tell you that too.`

CURRENT STATUS: NOT YET VERIFIED IN LIVE EXPERIENCE.

## 11. How it works / Our approach QA

MUST PASS BEFORE P1:
- Both header controls are populated and functional.
- They remain optional during primary use.
- `How it works` communicates: own words → only decision-changing questions → product homework → complete solution → re-solve constraints.
- `Our approach` communicates: Specific to You; evidence before popularity; only what belongs; recommendation before economics; finish the decision rather than return a list.
- These pages do not reveal the scripted test answer/product.

CURRENT STATUS: header links exist; full promise content/functionality must be verified before freeze.

## 12. Checkout consistency QA

For every solution state:
- Product names match the recommendation.
- Removed/owned components do not reappear.
- Subtotal equals visible paid components.
- Self-care is shown as included/$0.
- No purchase occurs in research mode.

FAIL if the recommendation page says one thing and checkout says another. This would directly undermine trust/Decision Closure.

## 13. Mobile QA

Run the entire primary path plus all three tuning challenges on a phone-width viewport.

MUST PASS:
- No clipped CTA or inaccessible controls.
- No horizontal scrolling required for core content.
- Solution tuning is obvious without dominating the recommendation.
- Self-care retains meaningful visual weight.
- Proof/rejected alternatives remain optional.

## 14. Test freeze criteria

Freeze Prototype 0.4.3 only when:
- Sections 1–5 pass end-to-end.
- Sections 6–8 visibly rebuild solution and checkout, not merely explain what would happen.
- Combined constraints in Section 9 pass.
- Commercial disclosure passes Section 10.
- How it works / Our approach pass Section 11.
- Checkout consistency and mobile QA pass.

After freeze:
- Record commit SHA used by P1–P6.
- No ordinary UX changes between participants.
- Change only for safety, completion-blocking defect, or materially broken branching.
- Document any unavoidable change and which participants saw each build.

## Current critical path

1. Make Solution Tuning mutate product cards, totals, and checkout state.
2. Add/verify commercial-integrity disclosure near transaction.
3. Populate/verify How it works and Our approach.
4. Run this QA protocol on desktop + mobile.
5. Freeze exact commit SHA.
6. Begin P1–P6.

No additional roadmap features should enter the build before this gate is green.