# Keneflex 0.7.0 solution-value acceptance contract

This release changes only how the validated recommendation and packages are presented. Story parsing, safety gates, laterality, sizing, recommendation eligibility, and product selection remain unchanged.

## Required participant behavior

- The result leads with the participant outcome and the value of the personalized Keneflex solution, not “Start with Core.”
- No copy minimizes Recovery or Comfort as unnecessary additions.
- Core, Recovery, and Recovery + Comfort each visibly include the personalized Keneflex care plan.
- Each card shows the product images included at that level and plainly identifies what the next level adds.
- Recovery + Comfort is identified as the most comprehensive package without changing the default Core selection.
- The selected-plan and final-care summaries identify both the product count and the personalized care plan.
- Checkout includes the personalized Keneflex care plan as “Included,” never as a $0 item.

## Bounded verification

Run each complete suite once:

1. Keneflex P0 Regression
2. Participant regression

The release is ready to merge only if both suites pass on the PR head and no clinical engine files changed.
