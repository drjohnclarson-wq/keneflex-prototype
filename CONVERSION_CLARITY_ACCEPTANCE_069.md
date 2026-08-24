# Keneflex 0.6.9 conversion-clarity acceptance contract

This release changes only the participant decision and purchase presentation. It does not alter story parsing, safety gates, laterality, sizing, recommendation eligibility, or product selection.

## Required participant behavior

- Core is preselected and clearly identified as the Keneflex recommendation and enough to start.
- Core, Recovery, and Recovery + Comfort are self-contained plan cards with included products and inclusive totals.
- Higher plans show their incremental cost separately from their inclusive total.
- A single selected-plan summary follows the cards and shows plan name, product count, inclusive total, and purchase action.
- The worn-out brace is reflected in the personalized explanation without changing recommendation logic.
- The care-instructions screen repeats the selected plan, included products, inclusive total, and purchase action.
- Customization, comparisons, evidence, sources, questions, and exclusions remain available through progressive disclosure.

## Bounded verification

Run each complete suite once:

1. Keneflex P0 Regression
2. Participant regression

The release is ready to merge only if both suites pass on the PR head and no clinical engine files changed.
