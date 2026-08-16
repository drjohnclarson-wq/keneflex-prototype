# Keneflex Prototype 0.4.3 — Pre-P1 QA & Freeze Gate

Status: STATIC INTEGRATION AUDIT COMPLETE — FINAL BROWSER SMOKE TEST REQUIRED BEFORE P1

Purpose: Protect the six-person validation from technical or thesis-incomplete behavior. This gate distinguishes code/static verification from actual browser interaction; static inspection is not a substitute for clicking the participant path on a real device.

## 1. Primary-path QA — vague consumer language

Start a clean session with exactly: `My hand has been bothering me.`

MUST PASS:
- Keneflex does not infer wrist, thumb, pickleball, timing, or movement priority.
- Area/timing/activity/priority remain unknown until supplied.
- Safety occurs before commerce.
- No product appears before localization and decision-critical facts are gathered.
- `I'm not sure / several areas` is accepted without forcing false precision.
- Activity is supplied by the consumer, not suggested as pickleball.
- Facts already supplied are not asked again.

STATIC STATUS: IMPLEMENTED IN 0.4.3. Browser interaction still required.

## 2. Rich-input reuse QA

Start a clean session with: `My wrist and thumb have been aching for about three weeks when I use them. I want to keep playing pickleball and don't want a brace that restricts me too much.`

MUST PASS: extract and visibly reuse wrist/thumb, ~3 weeks, pickleball, aching/soreness, and movement-preservation priority; skip redundant follow-ups.

STATIC STATUS: IMPLEMENTED. Browser interaction still required.

## 3. Safety-stop QA

At safety screen choose `Yes / I'm not sure`.

MUST PASS: shopping/recommendation stops; no product is pushed; language is calm/plain.

STATIC STATUS: IMPLEMENTED. Browser interaction still required.

## 4. Provider-constraint QA

Choose that a provider gave a specific instruction.

MUST PASS: exact product instructions are not substituted; feature/type instructions constrain eligibility; Keneflex does not frame itself as overriding the provider.

STATIC STATUS: IMPLEMENTED. Browser interaction still required.

## 5. Primary recommendation QA

Standard case: wrist + thumb; ~3 weeks; aching/soreness with use; pickleball; preserve useful movement; 7.0-inch wrist; no provider constraint; no adequate existing support.

MUST PASS:
- Visible decision-work screen precedes recommendation.
- Pattern, activity, fit and tradeoffs visibly affect the answer.
- One primary support wins; no shelf of alternatives.
- Complete solution = primary support + recovery + justified topical + substantial self-care.
- `What I did not add`, rejected alternatives, evidence-confidence boundaries and challenge-the-pick are available.

STATIC STATUS: IMPLEMENTED. Browser interaction still required.

## 6. Solution Tuning — owned recovery item

Choose `I already have a cold pack / home remedy`.

MUST PASS:
- Ownership is evaluated for adequacy rather than assumed adequate.
- If adequate, Polar BUY becomes existing-item KEEP/$0.
- Displayed subtotal: $52.98 → $31.98.
- Checkout excludes Polar purchase and preserves self-care.
- No alternative cold-product shelf appears.

STATIC STATUS: IMPLEMENTED by the 0.4.3 tuning layer/participant patch, including KEEP/$0 representation and recalculation. Browser interaction + checkout persistence still required.

## 7. Solution Tuning — no topical

Choose `I don't want the topical product`.

MUST PASS: topical is treated as optional in this case; Biofreeze purchase disappears; subtotal $52.98 → $40.99; checkout excludes Biofreeze; support + recovery + self-care remain coherent.

STATIC STATUS: IMPLEMENTED. Browser interaction + checkout persistence still required.

## 8. Solution Tuning — budget under $30

Apply `I don't want to spend more than $30.`

MUST PASS:
- Preserve $0 self-care.
- Remove optional topical before compromising primary support.
- Use/verify an adequate owned recovery item where applicable rather than assuming it away.
- A cheaper support may replace the winner only if it clears the same hard requirements.
- If no coherent solution can honestly meet budget, say so rather than fabricate one.
- No Bronze/Silver/Gold tiers or cheaper-product catalog.
- Displayed solution/cart match Keneflex's rebuilt answer.

STATIC STATUS: DECISION HIERARCHY AND REBUILD LOGIC IMPLEMENTED. Browser interaction required to verify the exact <$30 branch and cart state.

## 9. Combined constraints

Test at least:
- adequate owned cold + declines topical
- adequate owned cold + <$30 budget

Expected totals without a substitute support:
- Original: $52.98
- Own cold only: $31.98
- No topical only: $40.99
- Own cold + no topical: $19.99

MUST PASS: state changes compose rather than overwrite; checkout/subtotal stay consistent; reset restores original state.

STATIC STATUS: COMPONENT/substitution state is designed to compose. Browser verification required.

## 10. Commercial integrity

MUST PASS:
- Near transaction, plain-language disclosure says Keneflex may earn money from some purchases.
- Economics cannot determine eligibility/winner.
- KEEP/$0 and `What I did not add` remain visible integrity signals.
- Disclosure is not buried in affiliate jargon.

STATIC STATUS: IMPLEMENTED in 0.4.3. Browser placement/visibility still required.

## 11. How it works / Our approach

MUST PASS:
- Both header controls are populated and functional.
- Optional during primary use.
- `How it works`: own words → decision-changing questions → product homework → complete solution → re-solve constraints.
- `Our approach`: Specific to You; evidence before popularity; only what belongs; recommendation before economics; finish the decision rather than return a list.
- Neither reveals the scripted test answer/product.

STATIC STATUS: CONTENT IMPLEMENTED in 0.4.3. Browser control behavior still required.

## 12. Participant entry route

The participant card intentionally launches `test.html`, not the raw root page. `test.html` loads the current root prototype with cache bypass and injects the participant-specific 0.4.3 patch. This is the canonical P1–P6 route.

MUST PASS:
- Participant card opens normally.
- `Begin the Keneflex test` launches `test.html`.
- `test.html` resolves to the current 0.4.3 experience rather than a stale cached build.
- No visible loading/error state remains.

STATIC STATUS: ROUTE VERIFIED IN REPOSITORY. Browser launch required.

## 13. Checkout consistency

For every solution state: product names match; owned/removed components do not reappear as purchases; subtotal equals visible paid components; self-care remains included/$0; no actual purchase occurs in research mode.

STATIC STATUS: REBUILD FUNCTIONS PRESENT. Browser checkout verification required.

## 14. Mobile QA

Run the primary path plus all three tuning challenges at phone width.

MUST PASS: no clipped CTA/inaccessible controls; no core horizontal scroll; tuning obvious without dominating; self-care retains weight; proof/rejected alternatives remain optional.

STATUS: NOT VERIFIED. Requires a real/mobile browser or equivalent interactive browser environment.

## 15. Freeze criteria

Freeze only after one final interactive smoke test passes:
1. Participant card → test launch.
2. Vague input → localization → safety → activity/timing/fit → visible reasoning → complete solution.
3. Owned-cold challenge → KEEP/$0 → $31.98 → checkout persists.
4. Reset/new session.
5. No-topical challenge → $40.99 → checkout persists.
6. Reset/new session.
7. <$30 challenge → coherent $19.99 primary-support/self-care solution where the scripted assumptions justify removal of optional components → checkout persists.
8. Safety-stop branch.
9. Provider-instruction branch.
10. How it works / Our approach controls.
11. Repeat primary + one tuning path on phone width.

After PASS:
- Record the exact commit SHA/build used by P1–P6.
- Freeze ordinary UX changes through P6.
- Change only for safety, completion-blocking defects, or materially broken branching.
- Document any unavoidable version change and which participants saw it.

## Current critical path

The thesis-critical implementation is now present. The only remaining pre-P1 gate is **interactive browser smoke testing of the canonical participant route, state mutation/checkout persistence, and mobile behavior**. Do not add roadmap features before this is green.
