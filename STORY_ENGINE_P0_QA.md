# Keneflex Story Engine — P0 QA Gate

## Purpose

This gate protects the six-person consumer test from being contaminated by an intake that ignores or reverses information already supplied in the opening story.

## Pass criteria

The story layer must:

1. Treat explicit negatives as information, not as positive symptoms.
2. Carry supplied facts forward and avoid asking the same question again unless a safety-critical confirmation is justified.
3. Distinguish a location relationship such as “thumb side of the wrist” from two separate symptomatic regions.
4. Recognize common natural-language duration phrasing.
5. Preserve provider instructions as constraints on the Keneflex plan.
6. Detect products the consumer already owns and assess usability before recommending a duplicate.
7. Preserve safety findings such as trauma plus numbness/weakness for the downstream safety gate.
8. Present the personalized care packet as included with the Keneflex solution, never as “$0 value.”

## Regression stories

| # | Consumer story | Required interpretation |
|---|---|---|
| 1 | “My right wrist has hurt on the thumb side for about three weeks after pickleball. No numbness or swelling. I do not remember one particular injury.” | Right wrist; thumb-side sublocation; pain present; 3 weeks; pickleball/use context; numbness denied; swelling denied; no specific trauma. |
| 2 | “No numbness or tingling and no weakness.” | Neuro symptoms denied; weakness denied. Must not mark either positive. |
| 3 | “There is no swelling.” | Swelling denied. |
| 4 | “My wrist doesn’t ache, it just feels stiff.” | Pain/ache denied; stiffness present. |
| 5 | “No injury and my wrist hurts.” | Non-traumatic; pain present. |
| 6 | “I have pain and no swelling.” | Pain present; swelling denied. |
| 7 | “I fell yesterday and now my fingers feel numb.” | Trauma present; duration since yesterday; neuro symptom present; safety pathway retained. |
| 8 | “It started 10 days ago and it hurts when I grip things.” | Duration 10 days; pain present; gripping context retained. |
| 9 | “I have had it for a month. It comes and goes.” | Duration 1 month; intermittent pattern. |
| 10 | “I do not remember a specific injury; it built up after tennis.” | No specific trauma; tennis/repetitive-use context retained. |
| 11 | “My doctor told me to buy a wrist brace and wear it at night for carpal tunnel.” | Provider instruction captured and treated as a governing constraint; Keneflex must not silently compete with the instruction. |
| 12 | “I already have a wrist brace but it is old, stretched out and smells.” | Existing product detected; condition concerns recorded; ownership must not become an automatic KEEP. |
| 13 | “I have sharp pain on the thumb side of my wrist when I pick up my baby.” | Wrist is the primary region; “thumb side” is a sublocation, not a separate thumb complaint unless the thumb itself is also described as symptomatic. |
| 14 | “My wrist is sore, but there is no weakness.” | Pain/soreness present; weakness denied. |
| 15 | “My wrist is not sore anymore, but it is still stiff.” | Pain/soreness denied/currently absent; stiffness present. |

## Freeze rule

The prototype does not advance to the six-person test if a regression above is reversed, discarded, or redundantly re-asked in a way that makes the consumer repeat clearly supplied information. Safety-critical confirmation is allowed when the confirmation is narrower than the original story and can change the disposition.
