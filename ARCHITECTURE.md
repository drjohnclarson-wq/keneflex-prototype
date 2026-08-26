# Keneflex participant architecture

## Production participant path

`participant-card.html` → `test.html` → `index.html`

The `0.8.0` participant runtime intentionally has three explicit JavaScript files and two domain owners:

1. `prototype-046-conversation-engine.js` — pure story parsing, problem threads, known-fact detection, question selection, and adequacy.
2. `prototype-046b-critical-state.js` — critical engine invariants for corrections, multiple problems, provider instructions, and owned products.
3. `participant-controller.js` — participant flow, safety gate, launch catalog and role-based product selection, personalized Essential/Recommended/Complete plan state, pricing, adjustment, cart, checkout, and the responsive topic-based product guide with selective printing.

`prototype-044.css` preserves the established visual shell. `participant-consolidated.css` contains only styles owned by the consolidated controller.

## State ownership

`window.KeneflexParticipant.model` is the single participant state. Visible totals, cart lines, checkout lines, and the plan page derive from its cart dispositions. DOM text is output, never the source of commerce state.

## AI story interpretation boundary

The participant sends the accumulated consumer/question transcript to `/api/interpret-story`. The server-side AI interpreter converts natural language into the same controlled problem-thread schema used by the browser. It does not diagnose, select products, determine eligibility, or clear safety conditions.

`participant-controller.js` imports those structured facts, then the deterministic conversation, safety, sizing, catalog, package, and checkout rules remain authoritative. Low-confidence facts are omitted and may generate a clarification. Normal linguistic equivalences such as “about a month” do not require separate phrase rules or confirmation.

If the AI endpoint is unavailable, the local deterministic parser continues the journey rather than blocking the consumer. The model call is server-side; no model credential is shipped to the browser.

The stable commerce slots are `support`, `cold` (the recovery role), and `topical` (the comfort role). `model.selection` identifies the actual product assigned to each role. This preserves one cart and checkout path while allowing a story to select wrist-only or combined support, heat or cold, and gel or patch.

The launch scope and retest protocol are maintained in `LAUNCH_PRODUCT_MATRIX.md` and `RETEST_GUIDE.md`.

## Legacy files

Earlier `prototype-044*`, `prototype-045*`, `prototype-047*`, `prototype-048*`, `prototype-050*`, and `prototype-052*` files remain in the repository as historical references. They are not production dependencies and must not be restored to `prototype-044.js`.

`app.js`, `styles.css`, `prototype-043.js`, `prototype-043.css`, `prototype-043-patch.js`, and `solution-tuning-ui.js` belong to the earlier prototype architecture and are also not production dependencies.

## Release invariant

No new participant behavior should be introduced as a load-order patch, global-function replacement, click interceptor, or MutationObserver cleanup. Extend the engine or controller and add a regression test instead.
