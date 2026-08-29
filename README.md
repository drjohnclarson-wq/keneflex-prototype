# Keneflex Prototype

Consumer-facing wrist and thumb product-selection prototype.

## Current architecture

The browser sends the accumulated consumer conversation to a server-side structured AI interpreter. Deterministic rules remain authoritative for safety, product eligibility, sizing, package contents, and checkout. If AI interpretation is temporarily unavailable, the deterministic parser provides a fallback instead of blocking the journey.

Production deployments are connected to the `main` branch through Vercel.

## Live retest

https://keneflex-prototype-ai.vercel.app/test.html

## Verification

```bash
npm test
npm run test:quality
npm run test:production
```

- `npm test` runs the source, story, mutation, safety, AI-contract, 500-subject, and release gates.
- `npm run test:quality` runs the sparse consumer-language journeys that reject vague or repeated questions.
- `npm run test:production` checks the deployed JavaScript and sends one synthetic story through the live AI interpretation route. It does not use real consumer data.
