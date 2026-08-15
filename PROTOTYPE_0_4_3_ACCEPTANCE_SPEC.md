# Keneflex Prototype 0.4.3 — Thesis Acceptance Specification

Status: PRE-P1 BUILD GATE

Purpose: Freeze the minimum consumer-visible behaviors required to test whether Keneflex can finish an OTC decision rather than merely recommend products. This is thesis-complete, not feature-complete.

## Core acceptance rule

A consumer may arrive vague, imprecise, budget-constrained, already owning part of the solution, or unwilling to use one component. Keneflex must continue carrying the decision burden and return one coherent solution. It must not require the consumer to diagnose themselves or reopen shopping.

## A. Vague-problem resolution — MUST PASS

Primary test opening may be as little as: `My hand hurts` or `My hand has been bothering me.`

Keneflex must:
- Treat ambiguity as normal rather than infer wrist + thumb.
- Localize the problem in plain language before product matching.
- Allow `I'm not sure / several areas` rather than force false precision.
- Prefer a simple visual/tap localization model in the production design; prototype may use plain-language regions if needed.
- Ask only missing questions that can change safety, product type, product choice, size/configuration, self-care, or whether to buy.
- Never introduce pickleball or another activity before the consumer supplies it.
- Reuse facts already supplied instead of asking them again.

Fail condition: the consumer must know or guess clinical/anatomical terminology before Keneflex can help.

## B. Safety and provider constraints — MUST PASS

- Safety can stop commerce.
- Provider-specific product/use instructions are hard constraints.
- Keneflex does not compete with an exact provider instruction.
- Uncertainty is a valid state: `I need one more thing` or `I don't have enough confidence to recommend this yet.`

Fail condition: the interface forces a product answer when the available information does not justify one.

## C. Visible decision work — MUST PASS

Before asking for a sale, the consumer can see enough to understand:
- Which of their facts changed the solution.
- Why the primary product won for this person/use case.
- That serious alternatives were considered and ruled out for reasons.
- That fit/configuration is verified rather than assumed.
- What Keneflex knows with confidence vs. what it cannot promise.

Rule: minimum sufficient explanation, not maximum explanation.

Fail condition: the answer appears preloaded, generic, or based primarily on popularity/star ratings.

## D. Complete solution / online “Fat Box” — MUST PASS

The result is a coherent plan, not a product shelf. For the primary wrist scenario it may include:
- Primary support.
- Recovery component.
- Topical comfort component when the reported pattern gives it a reason to belong.
- Self-care/recovery plan with meaningful visual weight.
- Explicit `what I did not add` rationale.

Rule: more products are not automatically better. Every component must have a job.

Fail condition: the self-care plan feels like fine print attached to a three-item cart.

## E. Solution Tuning — MUST PASS BEFORE P1

The default is `Here is the complete solution I'd choose for you.` The consumer may then state a real-world constraint without being returned to shopping.

Supported constraint intents:
1. `I already have something like this.`
2. `I use a home remedy / something else for this.`
3. `I don't want this item.`
4. `This costs more than I want to spend.`

Keneflex must RE-SOLVE, not expose a catalog.

### Existing item/remedy
Evaluate whether the owned item can perform the role. Ownership alone is not adequacy. Relevant checks may include type, fit, condition, wear, hygiene/expiration, remaining function, and compatibility.

If adequate: `Use yours. You don't need to buy mine.` Remove the commercial item while preserving the solution role.

If inadequate: explain the specific gap and preserve the recommended component.

### Declined component
Classify components by necessity to the coherent solution. If a comfort/optional component is declined and the plan remains coherent, remove it and explicitly say so. If removal creates a meaningful gap, explain the gap and re-solve if an adequate substitute exists.

### Budget constraint
Price optimizes only among adequate options.

Order of operations:
1. Preserve $0 self-care.
2. Credit adequate owned/home-remedy components.
3. Remove optional/nonessential components.
4. Consider a lower-cost substitute only if it clears the same hard requirements.
5. If no cheaper adequate substitute exists, say so rather than downgrade quality silently.

Never show Bronze/Silver/Gold tiers. Never imply spending more produces a better health outcome.

Fail condition: `edit cart` becomes the consumer's responsibility for deciding what is medically/functionally expendable.

## F. Commercial integrity — MUST PASS

- Suitability is determined before affiliate/private-label/inventory economics.
- Consumer can discover a plain-language financial disclosure near transaction.
- KEEP/$0 and `what I did not add` demonstrate that no-purchase is a legitimate Keneflex answer.

Suggested prototype disclosure:
`Keneflex may earn money when you purchase some products we recommend. That cannot determine which product is eligible or which solution wins. If the right answer is something you already own—or no purchase at all—we'll tell you that too.`

Fail condition: commercial economics can change suitability/ranking.

## G. “How it works” and “Our approach” — MUST BE POPULATED

These remain optional before/during the primary journey so they do not teach subjects the thesis.

### How it works
1. Tell us what's bothering you — in your own words.
2. We figure out what matters — only questions that can change the decision.
3. We do the product homework — product architecture, fit, evidence, success/failure patterns and limitations.
4. We build the solution — products + self-care + what not to add; an adequate thing you own may beat a sale.
5. Change the constraints — already own it, don't want it, home remedy, need to spend less; Keneflex rebuilds the solution without making you shop again.

### Our approach
- Specific to you.
- Evidence before popularity.
- Only what belongs.
- Recommendation before economics.
- Our job is to finish the decision, not give you another list to research.

After the primary Keneflex-only debrief, participants review these pages and answer: `Now that you've read how Keneflex says it works, where did the actual experience live up to that promise, and where did it not?`

## H. Primary six-person test — FREEZE RULE

All six participants complete the same standardized Personalized BUY scenario. They receive persona facts but should start naturally; suggested opening is intentionally vague: `My hand has been bothering me.` They answer follow-ups using the scenario facts.

Do not teach them which facts matter. Do not mention the intended products.

Primary metrics:
- Decision Closure: CLOSED / CONFIRMATION / REOPENED.
- Specific to You.
- Decision Work Removed — participant's spontaneous description.
- Solution vs product-recommendation perception.
- Research escape destination/reason.
- Commercial trust.
- Spontaneous category description: `What is Keneflex?`

Only after Keneflex-only answers are locked should the strong ChatGPT comparison be introduced.

## I. Secondary constraint challenge — AFTER PRIMARY DEBRIEF

Use two participants per challenge:
- Owned item: `You already own a reusable cold pack that works well.`
- Budget: `You don't want to spend more than $30.`
- Preference: `You don't like using topical pain-relief products.`

Core observation: Does Keneflex continue making the decision, or does the participant feel returned to shopping?

Ask: `After changing the solution, did it still feel like Keneflex was making the decision for you, or did you feel like you were shopping again?`

Do not mix secondary challenge outcomes into the primary Decision Closure score.

## J. Explicitly OUT OF SCOPE for this test

Do not delay P1 for:
- Membership.
- Fat Box physical sampling economics.
- Wearable integrations.
- Household history.
- Local delivery/Instacart/pharmacy fulfillment.
- Private-label products.
- Broad OTC expansion beyond the test wedge.
- Gamification/avatar sophistication.

These may matter later but do not improve the current thesis test enough to justify added complexity.

## Build gate

Prototype 0.4.3 is ready to freeze only when A–G are demonstrably present and the primary path plus all three Solution Tuning challenges complete without technical failure. After freeze, no ordinary UX changes between P1 and P6; change only for safety, completion-blocking technical defects, or materially broken branching, and document any unavoidable change.