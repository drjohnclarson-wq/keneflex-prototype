# Keneflex P0 Multidisciplinary Advisor Review

This is the mandatory qualitative release gate applied after automated regression and before founder P0 review. It uses the project’s established advisor/specialist lenses; it is not represented as outside human clinical or legal sign-off.

## Consumer behavior / decision closure
PASS CONDITIONS
- Consumer can state what Keneflex recommends without reconstructing it.
- Product total is visible at the purchase decision.
- Primary purchase CTA repeats that total and is visually dominant.
- Secondary content does not compete with the purchase decision.
- Consumer may subtract optional purchases without causing Keneflex to invent a budget-driven recommendation.
- Reasons for the recommendation are available before purchase, but do not overwhelm the default journey.

## UX / product design
PASS CONDITIONS
- One primary job per screen/state.
- No duplicate concept hierarchy such as multiple competing “complete plan” headings.
- No orphan controls or dead ends.
- Clear progression from story → recommendation → total/action → plan/details → cart.
- Phone and desktop both preserve hierarchy and actionability.

## Brand / premium visual design
PASS CONDITIONS
- No homemade diagram treatment presented as finished premium imagery.
- Stock/product imagery is sharp, relevant, consistently cropped, and visually subordinate to the decision hierarchy.
- Instructional imagery must match the instruction; decorative imagery cannot imply a movement or treatment that was not recommended.
- Spacing, typography and card hierarchy feel like one product rather than stacked generations of prototype layers.

## Clinical / conservative-care safety
PASS CONDITIONS
- No recommendation is fabricated for an unsupported body region.
- Red flags and meaningful functional change alter disposition appropriately.
- Provider instructions are hard constraints.
- Existing items must pass fit/function/condition/safety requirements before KEEP.
- General movement imagery/copy must not imply a specific prescribed exercise when the system has not actually selected one.
- Safety information follows the currently selected solution.

## Product intelligence
PASS CONDITIONS
- Recommendation is based on product function/fit rather than popularity or price targeting.
- UNKNOWN capability never appears to the consumer as verified.
- Consumer-facing product roles use plain language.
- Removing an optional item never silently substitutes a less appropriate product.

## Commerce / conversion
PASS CONDITIONS
- Every purchasable item has a price.
- Selected-item prices mathematically reconcile with the displayed total.
- Total updates when selected purchases change.
- Buy CTA updates with the same total.
- Cart review carries the exact selected items and total forward.
- Final checkout-intent control is obvious.
- Research build truthfully states that a real transaction is not processed.

## Consumer-language / content
HARD FAIL PHRASES OR CONCEPTS
- prototype / P0 readiness
- production engine/system/brain
- product-intelligence note
- support role / second role / role being completed
- commercial firewall
- research preview
- Keneflex should...
- re-solve around a budget
- internal implementation/future-development instructions

PASS CONDITIONS
- Questions use facts already provided to become more specific.
- No generic “What are you noticing there?” when symptoms are already known.
- No fact is re-asked without an explicit need for clarification.
- Uncertainty is translated into a useful consumer action rather than internal methodology.

## Skeptical substitute / “Why Keneflex?”
PASS CONDITIONS
- Experience performs meaningful investigation and narrowing rather than returning a catalog.
- Recommendation includes person-specific reasoning, investigated product fit, complete next actions and transaction follow-through.
- Consumer is not sent back to Google/Amazon/ChatGPT to redo product selection.

## Release decision
P0 candidate may be presented to the founder only when:
1. 500-subject story gate is green.
2. 500 recommendation-to-final-cart browser gate is green.
3. Legacy regression and critical safety/provider/owned-item gates are green.
4. Phone + desktop full-page visual/language gates are green.
5. This multidisciplinary review has no open Critical or High issue.
6. Any change made after review reruns the complete affected critical journey.

Current disposition: PENDING automated release run and final qualitative walkthrough.