# Keneflex P0 War Room — 0.4.5C QA Record

Status: atomic-turn release blocker corrected in code; automated story and release-contract gates installed; final live browser smoke remains required before P0 freeze.

## Defect reproduced from founder screenshot
A rich wrist/thumb/phone-use story produced a visible free-text input with no visible Keneflex question.

Root cause: historical `addAI` wrappers were still allowed to suppress a prompt after the 0.4.5B controller had already decided to render the corresponding response control. This violated atomic-turn integrity.

## Correction
0.4.5C loads after the canonical controller and restores an unsuppressed prompt renderer. Question permission is now owned by the canonical controller before rendering. Structured single-select and multi-select helpers also have a final release owner so a known answer can be auto-carried forward safely, while a known-but-unmappable answer is treated as a real clarification instead of silently returning and dead-ending.

A runtime `KFXReleaseAudit()` invariant is exposed and a MutationObserver marks `document.documentElement.dataset.kfxIntegrity` as `pass` or `fail` based on orphan/empty interaction controls.

## Release tests now enforced
- canonical Story State regression / mutation suite;
- release-integrity loader ordering;
- participant route version/cache bypass;
- raw prompt-render ownership after historical suppressors;
- structured control ownership;
- no duplicate text-ingestion owner introduced by 0.4.5C;
- runtime orphan-control audit present;
- canonical next-question and handoff ownership retained.

The GitHub Actions P0 regression workflow runs both the story regression and the 0.4.5C release-contract regression on pushes to `main` / `prototype-045-clean` and PRs to `main`.

## Final live smoke cases before P0
1. Founder rich wrist/thumb/phone story: an explicit question must appear above every response control; no already-known facts are re-asked.
2. Rich wrist/phone/computer + sensory story: no duplicate location, trigger, timing, duration or sensory-map questions.
3. Rich knee story: accurately understood; no wrist-specific questions; honest prototype-scope stop.
4. Correction case: `left wrist` -> `actually right wrist` supersedes the old side.
5. Negative/positive correction: `no numbness` -> later tingling activates the new information, and reverse correction removes stale neuro truth.
6. Provider instruction remains a hard constraint.
7. Ambiguous occasional dropping gets clarification rather than automatic escalation.
8. Safety screen has no orphan controls or duplicate prompt turns.
9. Hand/wrist/thumb path reaches recommendation, explanation, solution tuning and cart preview.
10. Owned-item / no-topical / budget states mutate visible plan and persist into cart preview.
11. Phone-width scrolling and controls remain usable.
12. Refreshing canonical `test.html` retrieves 0.4.5C rather than an older cached build.

## Freeze rule
P0 remains blocked until the live founder smoke pass is green. If a case fails, fix the owning 0.4.5B/0.4.5C system, rerun automated gates, then rerun only the failed live case plus one adjacent regression. Do not add another historical-style patch chain.
