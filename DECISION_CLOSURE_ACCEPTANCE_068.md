# Keneflex 0.6.8 decision-closure acceptance contract

This release is bounded to the wrist/thumb participant pathway. It does not add body parts, products, or roadmap features.

## Release gates

1. Facts explicitly supplied in the story are not asked again. This includes list-style denials of injury, numbness, swelling, weakness, deformity, and wounds.
2. Anatomy and laterality remain visible in the recommendation and saved plan.
3. The first recommendation view identifies one primary product, verified size, personalized reason, core price, and purchase action.
4. The default purchase is the Core support. Recovery and topical comfort are explicit optional steps with their incremental benefit and total.
5. Comparisons, confidence, sources, FAQs, exclusions, and customization remain available through progressive disclosure rather than dominating the default path.
6. The saved plan renders inside the responsive Keneflex shell. It does not use an `about:blank` popup.
7. The existing deterministic safety rules remain authoritative, including provider constraints, altered-feeling review, sizing boundaries, and the severity-based wound pathway.
8. Checkout continues to show topical/support separation and broken-skin warnings when applicable.

## Bounded validation

Run once for the release candidate:

- 50 story subjects
- 155 story mutations
- P0 critical-state assertions
- 500-story sample
- both release contracts
- participant browser scenarios, including the exact pickleball story, plan tiers, laterality, mobile layout, responsive plan, and deformity stop
- legacy P0 browser and release gates

Only a safety-critical or completion-blocking failure reopens this release. Other observations go to the backlog and do not restart review.
