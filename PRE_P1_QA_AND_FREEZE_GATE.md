# Keneflex Prototype 0.4.4Y — Pre-P1 QA & Freeze Gate

**Status:** CODE/STATIC P0 GATE — FINAL INTERACTIVE SMOKE TEST REQUIRED BEFORE P1

## Purpose

Protect the six-person validation from technical failure or thesis-incomplete behavior. Static/code verification is necessary but does not replace one clean browser dry run on the canonical participant route.

## Canonical build and route

- Current integrated build: **0.4.4Y**.
- Participant entry: `participant-card.html` → `test.html`.
- `test.html` loads the current root build with cache bypass.
- **Do not inject or use `prototype-043-patch.js` for P0/P1–P6.** It belongs to the older 0.4.3 architecture and is not part of the current participant experience.
- Do not test by manually choosing a different historical prototype URL if the participant route fails. Record a technical failure and fix the route.

## 1. Homepage orientation — MUST PASS

Within the first screen a new visitor should understand that Keneflex is for pain, strains/injuries, sports/overuse problems, and situations where the consumer is unsure what to do or buy.

MUST PASS:
- The user does not have to infer that Keneflex is for musculoskeletal/OTC self-care decisions.
- The primary action is to tell Keneflex what is bothering them in their own words.
- The page does not define Keneflex as merely a brace store or product catalog.

## 2. Story comprehension — MUST PASS

Use `STORY_ENGINE_P0_QA.md` as the regression set.

MUST PASS:
- Explicit negatives are retained as answers: `no numbness` is DENIED, not PRESENT or UNKNOWN.
- Natural durations such as `10 days`, `three weeks`, `a month`, `yesterday`, and `last month` are carried forward.
- `thumb side of my wrist` is not flattened into two unrelated symptomatic regions.
- Provider instructions and products already owned are captured from the story.
- Facts already supplied are not asked again unless a narrower safety-critical confirmation can change disposition.
- Keneflex visibly reflects enough of the story that the user can tell it listened.

## 3. Vague-input path — MUST PASS

Start a clean session with exactly:

`My hand has been bothering me.`

MUST PASS:
- Keneflex does not invent wrist, thumb, pickleball, timing, side, or movement priority.
- It localizes and narrows in plain language.
- Safety occurs before commerce.
- Unknown remains a valid state; Keneflex does not force false precision.

## 4. Safety-stop path — MUST PASS

Test trauma plus a meaningful safety finding such as deformity, clear loss of feeling, or impaired function.

MUST PASS:
- Shopping/recommendation stops.
- No product is pushed through the stop.
- Language is calm, specific, and does not convert every vague symptom into an emergency.

## 5. Provider instruction — MUST PASS

Use a story containing a provider instruction, for example:

`My doctor told me to use a wrist brace at night.`

MUST PASS:
- The instruction is visibly carried forward.
- It is treated as a hard constraint, not a preference.
- The standard prototype support cannot silently substitute for or compete with the provider-directed role.
- If the exact product/role has not been independently matched, Keneflex may say it needs one more thing or hold the transaction. Uncertainty is preferable to a fabricated match.

## 6. Existing-product path — MUST PASS

Use a story such as:

`I already have a wrist brace but it is old and stretched out.`

MUST PASS:
- Ownership is detected.
- Keneflex checks fit, condition, cleanliness/expiration where relevant, and remaining function.
- Ownership alone does not become KEEP.
- An adequate existing item may beat a sale; an inadequate one does not.

## 7. Standard primary recommendation — MUST PASS

Standard scenario:
- wrist + base of thumb
- about 3 weeks
- aching/soreness with use
- gripping/twisting
- pickleball
- wants to keep playing
- preserve useful movement
- no provider constraint
- no adequate existing support
- 7.0-inch wrist
- no hard safety findings

MUST PASS:
- One primary support wins; no shelf of alternatives.
- The consumer can see which personal facts changed the answer.
- Fit/configuration is checked.
- Rejected alternatives and evidence-confidence boundaries remain available without dominating the page.
- The complete solution feels like a plan, not a cart with educational fine print.

## 8. Recovery component evidence — MUST PASS

The exact current prototype recovery product is Polar Products **Soft Ice Wrist Wrap, SKU SPW8**. Product-specific primary-source verification must remain on file before freeze.

MUST PASS:
- Product identity and price in the prototype match the verified product.
- Recovery is presented as a role with a reason to belong, not as an automatic add-on.
- A suitable existing cold option can replace a duplicate purchase.

## 9. Care-plan value presentation — MUST PASS

MUST PASS:
- The personalized care packet is visibly part of the solution.
- It is described as **included with the Keneflex plan / at no additional charge**.
- Do not display `included value $0` or language that implies the care plan itself has no value.
- Do not invent an arbitrary dollar value simply to manufacture perceived savings.

## 10. Solution tuning — MUST PASS

After the initial solution is locked, test:
- adequate owned cold option
- no topical
- needs to spend less

MUST PASS:
- Keneflex re-solves rather than exposing a catalog.
- Optional components are removed before silently degrading the core product.
- Existing/home options are credited only when adequate.
- The displayed product total stays synchronized with the rebuilt solution.
- Reset restores the original standardized solution.

## 11. Commercial integrity — MUST PASS

- Suitability precedes economics.
- Plain-language financial disclosure is discoverable near transaction.
- KEEP/no-purchase remains a legitimate answer.
- `What I did not add` remains visible evidence that Keneflex is not optimizing cart size.

## 12. How It Works / Our Approach — MUST PASS

Both controls must open and accurately describe the actual experience:
- own words
- decision-changing questions
- product homework
- complete solution
- adaptation to real-world constraints
- recommendation before economics
- finish the decision rather than return a list

Do not ask participants to read these until after the primary Keneflex-only debrief.

## 13. Participant route — MUST PASS

From `participant-card.html`:
1. Click **Begin the Keneflex test**.
2. `test.html` opens the current 0.4.4Y integrated build.
3. No obsolete 0.4.3 participant patch is injected.
4. No visible loading/error state remains.
5. Refresh still opens the same current build.

## 14. Mobile QA — MUST PASS

Repeat the primary path and at least one tuning path at phone width.

MUST PASS:
- no clipped CTA
- no inaccessible controls
- no core horizontal scroll
- self-care retains visual weight
- optional proof/details remain optional

## 15. Freeze rule

Before P1, complete one interactive P0 dry run through the canonical participant route covering:
1. homepage comprehension
2. vague opening
3. rich-story reuse / no redundant questions
4. standard recommendation
5. one tuning challenge
6. safety stop
7. provider-constraint branch
8. How It Works / Our Approach
9. phone-width primary path

After PASS:
- record the exact commit SHA/build used by P1–P6
- freeze ordinary UX changes through P6
- change only for safety, completion-blocking defects, or materially broken branching
- document any unavoidable version change and which participants saw it

## Current critical path

The current code contains the thesis-critical P0 corrections. The remaining gate after merge is **one interactive browser smoke test of the canonical participant route on desktop plus phone width**. Do not add roadmap features before this is green.
