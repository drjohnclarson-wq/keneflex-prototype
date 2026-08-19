# Keneflex participant architecture

## Production participant path

`participant-card.html` → `test.html` → `index.html`

The `0.6.0` participant runtime intentionally has three explicit JavaScript files and two domain owners:

1. `prototype-046-conversation-engine.js` — pure story parsing, problem threads, known-fact detection, question selection, and adequacy.
2. `prototype-046b-critical-state.js` — critical engine invariants for corrections, multiple problems, provider instructions, and owned products.
3. `participant-controller.js` — participant flow, safety gate, recommendation presentation, plan state, BUY/KEEP/REMOVE/REVIEW dispositions, pricing, adjustment, cart, checkout, and plan page.

`prototype-044.css` preserves the established visual shell. `participant-consolidated.css` contains only styles owned by the consolidated controller.

## State ownership

`window.KeneflexParticipant.model` is the single participant state. Visible totals, cart lines, checkout lines, and the plan page derive from its cart dispositions. DOM text is output, never the source of commerce state.

## Legacy files

Earlier `prototype-044*`, `prototype-045*`, `prototype-047*`, `prototype-048*`, `prototype-050*`, and `prototype-052*` files remain in the repository as historical references. They are not production dependencies and must not be restored to `prototype-044.js`.

`app.js`, `styles.css`, `prototype-043.js`, `prototype-043.css`, `prototype-043-patch.js`, and `solution-tuning-ui.js` belong to the earlier prototype architecture and are also not production dependencies.

## Release invariant

No new participant behavior should be introduced as a load-order patch, global-function replacement, click interceptor, or MutationObserver cleanup. Extend the engine or controller and add a regression test instead.
