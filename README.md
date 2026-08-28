# Keneflex Prototype

Consumer-facing wrist and thumb product-selection prototype.

## Current architecture

The browser sends the accumulated consumer conversation to a server-side structured AI interpreter. Deterministic rules remain authoritative for safety, product eligibility, sizing, package contents, and checkout. If AI interpretation is temporarily unavailable, the deterministic parser provides a fallback instead of blocking the journey.

Production deployments are connected to the `main` branch through Vercel.
