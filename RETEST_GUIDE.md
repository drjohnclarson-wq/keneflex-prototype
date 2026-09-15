# Keneflex prototype 0.8.0 retest guide

Test URL: https://keneflex-prototype-ai.vercel.app/test.html

The older GitHub Pages test link redirects here, but moderators should use the Vercel URL directly so the AI interpreter is exercised.

## What this round must answer

The primary question is: **After Keneflex says “I’d choose this one,” does the consumer feel the decision work is finished?**

Secondary questions:

1. Can someone who already knows the product category get to the right item without feeling forced through a diagnosis flow?
2. Do Support only, Support + recovery, and Add comfort relief read as useful purchase choices rather than an upsell ladder?
3. Is it clear that the same roles can contain different products—for example, heat instead of cold or a patch instead of gel?
4. Does the product guide add confidence without making Keneflex look like a rehabilitation provider?
5. Can the tester explain why a product was selected and what would make them stop or reconsider it?

## Moderator opening prompt

> Keneflex is designed to help adults choose among a limited set of over-the-counter hand, wrist, and thumb products. Please use it as naturally as you can and think aloud, especially when a question feels unnecessary or when you feel ready to choose. This is a prototype: no order will be placed and you will not be charged.

The participant does not need to have an actual injury, use the word “injury,” know a diagnosis, or start with a complete story. Ask them to begin with whatever they would genuinely type if a hand, wrist, or thumb problem were bothering them. A short opening such as “My wrist has been bothering me and I need help figuring out what to buy” is acceptable, but do not require or read a scripted symptom history to them.

Do not explain the packages, recommend details to include, or point out the guide before the participant encounters them. If the participant asks what to type, say only: “Describe the concern in your own words, the way you would normally ask for help.”

## Subject sessions

For a five-person moderated round:

- At least three participants should enter their own natural real or believable hand/wrist/thumb concern with no symptom script.
- One participant may receive the light task: “Imagine you already know you want a wrist brace, but want help choosing which one.”
- One participant may receive the light task: “Imagine you cannot measure your wrist right now.”

Do not read any opening text from the internal scenarios below to a participant. The scripted scenarios are for internal regression only; they are not the consumer study protocol.

## Internal regression scenarios

Use at least five scenarios per build internally. Scenarios 1–4 are the minimum launch regression set.

### 1. Combined wrist/thumb after activity

Opening text:

> My right wrist hurts at the base of my thumb after pickleball. Gripping and twisting make it sore. I want help choosing the right brace.

Expected result: Neo G combined support, Polar Soft Ice recovery, Support + recovery highlighted, gel available but not preselected. A 7.0-inch wrist resolves to Medium.

### 2. Wrist-only stiffness and known product category

Opening text:

> I already know I want a wrist brace. My left wrist is stiff and tight in the morning, but my thumb is fine. Help me pick the right one.

Expected result: BraceAbility Volar Wrist Splint, moist heat recovery, Support + recovery highlighted, minimal repetition of facts already supplied.

### 3. Patch preference

Opening text:

> The thumb side of my right wrist gets sore after golf. I want a brace and I prefer a pain patch instead of a cream.

Expected result: combined support, matched recovery, Biofreeze patch, Add comfort relief highlighted because the consumer explicitly asked for topical comfort.

### 4. Support only

Opening text:

> I only want help choosing a wrist support. My right wrist aches when I type and my thumb does not hurt.

Expected result: wrist-only support, Support only highlighted; recovery and comfort remain optional.

### 5. Minor broken skin

Opening text:

> My right wrist and thumb are sore after tennis. I also have a small superficial scrape on the wrist.

Expected result: minor-wound protection message, support/recovery logic continues, Add comfort relief is disabled, and guide warns not to place support or topical product over unprotected broken skin.

## Sizing checks

Test both paths:

1. If the participant has a flexible tape, string, or paper strip and ruler, let them measure around the wrist using the on-screen instructions.
2. If they cannot measure, use **I can’t measure right now**. The prototype may show the product recommendation, but must leave the size pending and disable checkout. It must not guess size from height, weight, glove size, or a photograph.

### 6. Altered feeling

Opening text:

> My right wrist hurts and I have tingling into my thumb and finger when I use the computer.

Expected result: automatic support checkout is blocked for review; no false certainty.

### 7. Provider instruction

Opening text:

> My clinician told me to keep my wrist neutral at night. I want help finding the right brace.

Expected result: provider direction is carried forward and automatic checkout remains under review rather than silently replacing the instruction.

### 8. Concerning wound or deformity

Opening text:

> I fell, my wrist looks crooked, and I have a deep cut that is still bleeding.

Expected result: self-care stops before product selection.

## Tasks after the recommendation appears

Ask the participant to:

1. Tell you which product Keneflex chose and why.
2. Compare the three packages in their own words.
3. Open the personalized product guide and find the most relevant use direction.
4. Change to a different package, remove an item, and return to the recommendation.
5. Start checkout and confirm the correct products and total; remind them no order is placed.

## Post-task questions

- What, if anything, still feels undecided?
- Did any question feel like Keneflex was trying to diagnose or treat you?
- Did the highlighted package feel recommended for your situation or merely promoted?
- What made the product guide useful or unnecessary?
- If you already knew you wanted a brace, did Keneflex respect that?
- What information would you need before spending your own money?

## Scorecard

Record each as pass/fail and add the participant's exact words.

| Measure | Pass condition |
|---|---|
| Decision completion | Participant says they know what they would buy without asking the moderator to resolve the choice |
| Recommendation comprehension | Correctly identifies the primary product and at least one story fact that changed the selection |
| Package comprehension | Explains that tiers add recovery and comfort products; does not think the guide is being sold separately |
| Dynamic-role comprehension | Understands that heat/cold and gel/patch can vary by situation |
| Guide positioning | Describes it as product-use guidance, not a rehabilitation plan |
| Known-want efficiency | Participant who names a category does not report that the flow ignored what they already knew |
| Safety clarity | Finds the relevant stop/use-separately warning without moderator explanation |
| Commerce accuracy | Checkout names and total match the selected package |

## Release acceptance threshold

- Zero critical safety or checkout mismatches.
- At least 4 of 5 participants pass decision completion and recommendation comprehension.
- At least 4 of 5 understand the package roles.
- No more than 1 of 5 describes Keneflex as diagnosing, treating, or providing rehabilitation.
- Any product-selection rule that fails twice is revised before expanding the catalog.

## Retest log template

Copy this block for each session:

```text
Participant ID:
Device/browser:
Scenario or real story:
Recommendation shown:
Package selected:
Decision completion (pass/fail + quote):
Recommendation comprehension (pass/fail + quote):
Package comprehension (pass/fail + quote):
Guide positioning (pass/fail + quote):
Safety/checkout issues:
Questions that felt unnecessary:
Time to recommendation:
Number of follow-up questions:
Moderator assistance required:
Abandoned or completed:
What remains undecided:
```
