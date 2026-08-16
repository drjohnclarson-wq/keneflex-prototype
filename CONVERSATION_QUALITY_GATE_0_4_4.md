# Keneflex Prototype 0.4.4 — Conversation Quality Gate

## Purpose
P0 must test an intelligent helper, not a branching questionnaire dressed as chat. The recent founder walkthroughs exposed a thesis-critical failure mode: Keneflex can technically retain fields while still feeling as if it is not listening. This gate is required before P0.

## Core behavioral rule
**Listen → interpret → pursue the highest-value unresolved thread → accumulate the story → ask only what remains material.**

Keneflex must never narrate its database or announce that it has stored a field. Avoid phrases such as “I have phone use and computer/typing,” “you already told me,” “I’m not going to ask that again,” or other implementation-language acknowledgments.

## Pass criteria

### 1. Semantic listening, not keyword memory
If the consumer says: “My hand hurts after I work at my computer and type on my phone for a while,” Keneflex must preserve all useful facts: hand; pain/soreness; computer/typing; phone use; use-related pattern. Later clarification may enrich these facts but must not replace earlier facts.

PASS response behavior: brief natural acknowledgment followed by the next unresolved question, e.g. “Got it. Your hand is bothering you mainly around phone and computer use. What does it feel like when it acts up?”

FAIL: asking the consumer to repeat what is already known; mentioning only one of multiple material triggers; announcing stored fields.

### 2. Follow the clue before returning to the generic intake
When a consumer identifies a meaningful trigger, Keneflex should investigate the mechanism enough to make the trigger useful. For phone/computer use this means, when material: what the hand is doing immediately before symptoms; approximate latency; whether symptoms occur outside those activities; whether stopping/changing position changes symptoms.

Do not ask every possible follow-up mechanically. The question must be justified by unresolved decision value.

### 3. “Other” can never be a dead-end answer
Any “something else,” “other,” “it depends,” or similarly unresolved response must be clarified before the flow advances if its meaning could change safety, solution requirements, or product choice.

Example: consumer selects swelling + stiffness + “something else.” Keneflex asks what the other symptom is. If the answer is “soreness,” it is incorporated as pain/soreness and carried forward.

FAIL: accepting “something else” and moving on without learning what it means.

### 4. Ambiguity triggers curiosity before escalation
A vague potentially concerning statement is not automatically a hard safety stop.

Example: “I occasionally drop things.” Required behavior: clarify whether this is occasional/longstanding versus new/worsening grip weakness, numbness, or unreliable function. Hard-stop only when the clarified context meets the safety rule.

Principle: **ambiguity → clarification → severity/context → disposition.**

### 5. No rigid acknowledgments
Acknowledgments should be short and conversational. Prefer “Got it,” “That helps,” “Okay,” or a concise paraphrase only when the paraphrase demonstrates useful understanding.

FAIL examples:
- “I have the phone use and computer/typing pattern.”
- “You’ve already told me it hurts.”
- “I won’t make you repeat it.”
- “I’m not going to ask you to describe onset again.”

These phrases expose internal questionnaire logic and create unnecessary cognitive load.

### 6. Do not confuse trigger with onset
“Symptoms happen after phone use” does not answer whether the problem began gradually, around repeated use, or after a discrete injury. Keneflex may ask this distinction, but it must do so naturally rather than explaining why the software is asking another onset question.

### 7. Accumulating memory
New information enriches the story; it does not overwrite prior facts unless the consumer explicitly corrects them.

Example:
- Opening: phone + computer use.
- Later: “Mostly holding the phone and scrolling; on the computer it’s typing.”
- Stored story: phone + computer remain; mechanism detail is added.

### 8. Open-ended first, structure as rescue
When practical, ask the consumer to describe symptoms or context in ordinary language first. Structured choices are a fallback when the answer is too vague, the consumer is unsure, or a safety/fit question requires bounded choices.

The consumer should not need medical terminology.

### 9. Conversation compression
Every screen must earn its existence. If a prior answer already resolves a later question, skip or narrow that question. P0 is not a completeness contest; the objective is the minimum sufficient conversation to make a safe, defensible consumer decision.

### 10. Summary integrity before recommendation
Before the solution is revealed, Keneflex’s summary must accurately carry the material story: relevant symptoms, location, important triggers/mechanism, pattern/relief where decision-relevant, functional goal, and any clarified safety concern that remains relevant.

The summary should sound like a knowledgeable helper reflecting understanding, not an algorithm explaining its feature extraction.

## Canonical regression scenario A — founder phone/computer case
Opening: “My hand hurts after I work at my computer and type on my phone for a while.”
Expected: recognizes both digital-use contexts and pain; asks what it feels like rather than asking the consumer to repeat the story.
Symptoms: “It gets sore and stiff and sometimes swells.”
Expected: captures soreness/pain + stiffness + swelling; proceeds to useful localization/mechanism questions.
Mechanism: “Mostly holding my phone and scrolling. On the computer it’s typing.”
Expected: preserves phone + computer and adds mechanism detail.
Pattern: no other pattern noticed.
Expected: no clunky restatement of stored triggers; asks the next materially useful question.
Relief: “Usually feels better when I stop for a while.”
Expected: captures relief and moves on without re-asking it.

## Canonical regression scenario B — unresolved other
Consumer reports swelling + stiffness + “something else.”
Expected: Keneflex asks what “something else” is before moving forward.
Consumer: “Soreness.”
Expected: adds pain/soreness and later summary reflects soreness + stiffness + swelling.

## Canonical regression scenario C — dropping objects
Consumer: “I occasionally drop things.”
Expected: clarification, not automatic freeze.
If occasional, not new/worsening, no weakness/numbness: continue while retaining the detail.
If new/more frequent with weakness/numbness/unreliable grip: pursue functional/safety clarification and escalate when threshold is met.

## P0 freeze rule
Do not freeze 0.4.4 for P0 until all three canonical regression scenarios pass on a phone-width browser run without:
1. forced repetition,
2. lost material facts,
3. unresolved “other” answers,
4. inappropriate safety freeze,
5. database-like acknowledgments,
6. a visibly illogical question transition.

Once these are green, stop polishing conversational copy and run P0. Behavioral evidence is more valuable than additional scripted sophistication.