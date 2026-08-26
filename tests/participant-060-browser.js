const { chromium } = require('playwright');
const assert = require('assert');

const base = process.env.KFX_BASE_URL || 'http://127.0.0.1:8080/?participant=060&build=e2e';
const banned = /prototype|p0 readiness|production engine|future commerce|commercial firewall|Keneflex should/i;

(async () => {
  // The P0 browser gate installs the Playwright client while using the Chrome
  // already provided by the runner; it does not download Playwright's bundled
  // Chromium. Keep the consolidated suite compatible with that contract.
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const failures = [];
  let scenarioCount = 0;

  async function scenario(name, story, verify) {
    scenarioCount += 1;
    try {
      await page.goto(base + '&scenario=' + encodeURIComponent(name), { waitUntil: 'domcontentloaded' });
      await page.fill('#opening', story);
      await page.click('#openingBtn');
      await page.waitForTimeout(50);
      await verify();
      console.log('PASS', name);
    } catch (error) {
      failures.push({ name, error: error.message });
      console.error('FAIL', name, error.message);
    }
  }

  async function clearSafetyAndMeasure(value = '7.0') {
    if (await page.locator('#interaction[data-concept="preciseLocation"] #reply').count()) {
      await page.fill('#reply', 'It is centered at the base of my thumb and thumb side of my wrist.');
      await page.click('#send');
    }
    if (await page.locator('[data-safety="clear"]').count()) await page.click('[data-safety="clear"]');
    await page.fill('#wristMeasure', value);
    await page.click('#fitContinue');
    await page.waitForSelector('#solutionView:not(.hidden)');
  }

  async function content(selector) {
    return page.locator(selector).evaluate(node => node.textContent.trim());
  }

  await scenario('complete-hand-path', 'My right wrist and thumb hurt at the base of my thumb for 4 weeks. It built up gradually. Phone use makes it worse. I have no numbness or swelling.', async () => {
    await clearSafetyAndMeasure();
    const initial = await page.evaluate(() => ({
      total: document.querySelector('#total').textContent.trim(),
      buy: document.querySelector('.kfxBuy').textContent.trim(),
      scripts: [...document.scripts].map(script => script.src).filter(Boolean),
      observers: !!window.KFX049,
      text: document.querySelector('#solutionView').innerText
    }));
    assert.equal(initial.total, '$40.99');
    assert(initial.buy.includes('$40.99'));
    assert(initial.text.includes('Medium'));
    assert(initial.text.includes('Find the right product for what’s bothering you'));
    assert(!initial.text.includes('Core is enough to start'));
    assert(!initial.text.includes('optional additions'));
    assert.equal(await page.locator('.planTier').count(), 3);
    assert.equal(await page.locator('[data-plan="recovery"]').getAttribute('aria-pressed'), 'true');
    assert((await content('[data-plan="core"]')).includes('$19.99 total'));
    assert((await content('[data-plan="recovery"]')).includes('$40.99 total'));
    assert((await content('[data-plan="recovery"]')).includes('+$21.00: adds reusable cold recovery'));
    assert((await content('[data-plan="complete"]')).includes('$52.98 total'));
    assert((await content('[data-plan="complete"]')).includes('+$11.99: adds temporary topical comfort'));
    assert((await content('[data-plan="complete"]')).includes('Most comprehensive'));
    assert.equal(await page.locator('[data-plan="core"] .tierProduct img').count(), 1);
    assert.equal(await page.locator('[data-plan="recovery"] .tierProduct img').count(), 2);
    assert.equal(await page.locator('[data-plan="complete"] .tierProduct img').count(), 3);
    assert.equal(await page.locator('.tierPlanIcon').count(), 3);
    assert.equal(await page.locator('.tierIncludes span').filter({ hasText: 'Personalized product guide' }).count(), 3);
    assert(await page.evaluate(() => !!(document.querySelector('.planChooser').compareDocumentPosition(document.querySelector('.purchaseBlock')) & Node.DOCUMENT_POSITION_FOLLOWING)), 'purchase action must follow plan cards');
    assert.equal(await content('#planName'), 'Recommended');
    assert.equal(await content('#selectionCount'), '2 products + personalized product guide');
    assert.equal(initial.scripts.length, 4); // loader + engine + critical invariants + controller
    assert(!initial.observers, 'legacy observer runtime is active');
    assert(!banned.test(initial.text), 'internal language is visible');

    await page.click('[data-plan="recovery"]');
    assert.equal(await page.locator('#total').innerText(), '$40.99');
    assert.equal(await content('#planName'), 'Recommended');
    assert.equal(await content('#selectionCount'), '2 products + personalized product guide');
    assert((await page.locator('.kfxBuy').innerText()).includes('$40.99'));

    await page.click('#kfxPlanBtn');
    assert(await page.locator('.kfxPlanOverlay').count());
    assert((await page.locator('.kfxPlanPage').innerText()).includes('Biofreeze') === false);
    assert.equal(await content('.finalSelection h2'), 'Recommended');
    assert((await content('.finalSelection')).includes('$40.99'));
    assert.equal(await page.locator('.finalSelection .planLine').count(), 3);
    assert((await content('.finalSelection .planIncluded')).includes('Personalized product guide'));
    assert((await content('.finalSelection .planIncluded')).includes('Included'));
    assert((await content('.kfxFinalBuy')).includes('$40.99 total'));
    assert(!(await page.locator('.kfxPlanPage').innerText()).includes('Workspace and device setup'));
    assert.equal(await page.locator('[data-plan-print]').count(), 1);
    assert(!(await page.locator('.kfxPlanPage').innerText()).includes('Exercises and stretches'));
    await page.click('[data-plan-close]');

    await page.click('.kfxBuy');
    assert.equal(await page.locator('.kfxCheckout .totalx span:last-child').innerText(), '$40.99');
    assert.equal(await page.locator('.kfxCheckout .rowx:not(.planIncluded)').count(), 2);
    assert((await content('.kfxCheckout .planIncluded')).includes('Personalized product guide'));
    assert((await content('.kfxCheckout .planIncluded')).includes('Included'));
  });

  await scenario('altered-feeling-gate', 'My left wrist and thumb hurt and my thumb and index finger tingle after typing for 3 weeks. It built up gradually.', async () => {
    await clearSafetyAndMeasure();
    assert(await page.locator('.kfxBuy').isDisabled());
    assert((await page.locator('#supportState').innerText()).includes('review'));
    assert((await page.locator('#solutionView').innerText()).includes('altered-feeling pattern'));
  });

  await scenario('regional-firewall', 'My right knee hurts under the kneecap for 3 weeks going downstairs. It built up gradually.', async () => {
    await page.waitForTimeout(50);
    const body = await page.locator('body').innerText();
    assert(body.includes('currently completes product recommendations only for the hand, wrist, and thumb pathway'));
    assert(await page.locator('#solutionView.hidden').count());
  });

  const mediumBoundaries = [
    ['below-medium-boundary', '6.29', 'Small'],
    ['medium-lower-boundary', '6.30', 'Medium'],
    ['medium-lower-interior', '6.49', 'Medium'],
    ['medium-mid-boundary', '6.50', 'Medium'],
    ['medium-upper-boundary', '7.50', 'Medium']
  ];
  for (const [name, measurement, expectedSize] of mediumBoundaries) {
    await scenario(name, 'My right wrist and thumb hurt at the base of my thumb for 4 weeks. It built up gradually and typing makes it worse.', async () => {
      await clearSafetyAndMeasure(measurement);
      assert.equal(await page.locator('.kfxBuy').isDisabled(), false);
      assert((await page.locator('#supportItem .planName').innerText()).includes(expectedSize));
    });
  }

  await scenario('unsupported-size-hold', 'My right wrist and thumb hurt at the base of my thumb for 4 weeks. It built up gradually and typing makes it worse.', async () => {
    await clearSafetyAndMeasure('9.2');
    assert(await page.locator('.kfxBuy').isDisabled());
    assert((await page.locator('#supportState').innerText()).includes('review'));
  });

  await scenario('provider-direction-hold', 'My doctor told me to wear a wrist brace at night. My right wrist hurts for 4 weeks. It built up gradually and typing makes it worse.', async () => {
    await clearSafetyAndMeasure();
    assert(await page.locator('.kfxBuy').isDisabled());
    assert((await page.locator('#supportState').innerText()).includes('review'));
  });

  await scenario('owned-product-hold', 'I already own a wrist brace. My right wrist hurts for 4 weeks. It built up gradually and typing makes it worse.', async () => {
    await clearSafetyAndMeasure();
    assert(!(await page.locator('.kfxBuy').isDisabled()));
    assert.equal(await page.locator('#supportState').innerText(), 'Recommended');
  });

  await scenario('rich-owned-brace-replacement', "My right wrist and thumb have been hurting for about three weeks after playing pickleball. Gripping the paddle and twisting jars make it worse. There was no fall or direct injury. I don't have numbness, major swelling, or weakness. I own an old wrist brace, but it is stretched out and doesn't support my thumb.", async () => {
    assert.equal(await page.locator('#interaction').getAttribute('data-concept'), 'preciseLocation');
    const before = await page.locator('#conversation .bubble.ai').allInnerTexts().then(items => items.join(' '));
    assert(!/which side|how long|make it worse/i.test(before), 'known story facts were asked again');
    await page.fill('#reply', 'It is centered at the base of my thumb and thumb side of my wrist.');
    await page.click('#send');
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(!/major recent injury|swelling|loss of feeling|weakness/i.test(safety), 'known safety negatives were asked again');
    assert(/visible deformity|open wound/i.test(safety));
    await clearSafetyAndMeasure();
    assert.equal(await page.locator('#supportState').innerText(), 'Recommended');
    assert.equal(await page.locator('#supportPrice').innerText(), '$19.99');
    assert.equal(await page.locator('#total').innerText(), '$40.99');
    assert.equal(await page.locator('[data-plan="recovery"]').getAttribute('aria-pressed'), 'true');
    assert((await content('[data-plan="recovery"]')).includes('Keneflex recommended'));
    assert(!(await page.locator('.kfxBuy').isDisabled()));
    const solution = await page.locator('#solutionView').innerText();
    assert(solution.includes('old brace is stretched out'));
    assert(solution.includes('does not support your thumb'));
    assert(!solution.includes('movement-preserving support requirement'));
    await page.click('#kfxPlanBtn');
    assert.equal(await page.locator('.kfxPlanPage .planLine:not(.planIncluded)').first().locator('b').innerText(), '$19.99');
    assert((await page.locator('.kfxPlanPage').innerText()).includes('right —'));
    assert(!(await page.locator('.kfxPlanPage').innerText()).includes('Exercises and stretches'));
    assert((await page.locator('.kfxPlanPage').innerText()).includes('Print this topic'));
    await page.click('[data-plan-close]');
  });

  await scenario('ipad-single-column', 'My right wrist hurts for 4 weeks. It built up gradually and typing makes it worse.', async () => {
    await page.setViewportSize({ width: 834, height: 1112 });
    await clearSafetyAndMeasure();
    const widths = await page.locator('.decisionLayout').evaluate(node => ({ content: node.getBoundingClientRect().width, viewport: window.innerWidth }));
    assert(widths.content <= 760 && widths.content > 600, 'iPad layout must use one centered primary reading column');
    await page.setViewportSize({ width: 390, height: 844 });
  });

  await scenario('gradual-does-not-clear-later-injury', 'My right wrist has hurt for four weeks and built up gradually. Yesterday I had a major injury to it. Typing makes it worse.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('major recent injury'));
  });

  await scenario('mixed-owned-products-are-independent', 'I have an old right wrist brace that is stretched out. I have a cold pack that works well. My wrist has hurt for four weeks, built up gradually, and typing makes it worse.', async () => {
    await clearSafetyAndMeasure();
    assert.equal(await page.locator('#supportState').innerText(), 'Recommended');
    assert.equal(await content('#coldState'), 'Selected add-on');
    assert.equal(await page.locator('#total').innerText(), '$45.99');
  });

  await scenario('wrist-only-brace-cannot-cover-combined-role', 'My right wrist and thumb hurt at the base of my thumb for four weeks. It built up gradually and gripping makes it worse. My wrist brace is in good condition and fits well.', async () => {
    await clearSafetyAndMeasure();
    assert(!(await page.locator('.kfxBuy').isDisabled()));
    assert.equal(await page.locator('#supportState').innerText(), 'Recommended');
  });

  await scenario('phone-explanations-single-column', 'My right wrist hurts for 4 weeks. It built up gradually and typing makes it worse.', async () => {
    await clearSafetyAndMeasure();
    const columns = await page.locator('#whyRows .why').first().evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ').length);
    assert.equal(columns, 1, 'phone explanation rows must use one column');
  });

  await scenario('combination-warning', 'My right wrist hurts for 4 weeks. It built up gradually and typing makes it worse.', async () => {
    await clearSafetyAndMeasure();
    await page.click('[data-plan="complete"]');
    await page.click('.kfxBuy');
    const warning = await page.locator('.kfxSafetyNotice').innerText();
    assert(warning.includes('Do not wear the support over the selected gel or patch'));
    assert(warning.includes('clean, dry skin'));
  });

  await scenario('free-form-precise-location-is-accepted', 'My right wrist and thumb hurt for four weeks. It built up gradually and typing makes it worse.', async () => {
    assert.equal(await page.locator('#interaction').getAttribute('data-concept'), 'preciseLocation');
    await page.fill('#reply', 'On the palm side near the thumb knuckle.');
    await page.click('#send');
    assert.equal(await page.locator('#interaction #reply').count(), 0, 'precise-location question repeated');
    assert(await page.locator('[data-safety="clear"]').count());
  });

  await scenario('unrelated-negation-does-not-deny-fall', 'My right wrist hurts after a fall yesterday. No swelling. Typing makes it worse.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('major recent injury'));
  });

  await scenario('tingling-denial-does-not-deny-numbness', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I have no tingling.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('loss of feeling'));
  });

  await scenario('neighbors-product-is-not-owned', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. My neighbor has a cold pack that works well.', async () => {
    await clearSafetyAndMeasure();
    assert.equal(await content('#coldState'), 'Selected add-on');
    assert.equal(await page.locator('#total').innerText(), '$45.99');
  });

  await scenario('owned-support-cannot-clear-neuro-review', 'My right wrist and thumb hurt at the base of my thumb for four weeks. It built up gradually and typing makes it worse. My thumb and index finger tingle. My wrist and thumb brace is in good condition, fits well, and covers both areas.', async () => {
    await clearSafetyAndMeasure();
    assert.equal(await page.locator('#supportState').innerText(), 'Needs review before buying');
    assert(await page.locator('.kfxBuy').isDisabled());
  });

  await scenario('later-fall-overrides-earlier-denial', 'My right wrist has hurt for four weeks. There was no fall. Yesterday I fell and hurt it. Typing makes it worse.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('major recent injury'));
  });

  await scenario('support-verb-is-not-owned-support', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I have a cold pack that supports my wrist and works well.', async () => {
    await clearSafetyAndMeasure();
    assert.equal(await page.locator('#supportState').innerText(), 'Recommended');
    assert.equal(await content('#coldState'), 'Selected add-on');
    assert.equal(await page.locator('#total').innerText(), '$45.99');
  });

  await scenario('later-swelling-overrides-earlier-denial', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. There was no swelling yesterday. Today it is rapidly swelling.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('rapidly increasing swelling'));
  });

  await scenario('owned-cold-does-not-change-plan', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I have a cold pack that works well.', async () => {
    await clearSafetyAndMeasure();
    assert.equal(await content('#coldState'), 'Selected add-on');
    const explanation = await content('#whyRows');
    assert(!explanation.includes('What you already own'));
  });

  await scenario('conflicting-owned-condition-requires-review', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. My old wrist brace fits well and still works.', async () => {
    await clearSafetyAndMeasure();
    assert.equal(await page.locator('#supportState').innerText(), 'Recommended');
    assert(!(await page.locator('.kfxBuy').isDisabled()));
  });

  await scenario('contrast-stops-symptom-negation', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I have no numbness but it is rapidly swelling.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('rapidly increasing swelling'));
  });

  await scenario('with-clause-positive-symptom-is-not-negated', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I have no numbness with rapidly increasing swelling.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('rapidly increasing swelling'));
  });

  await scenario('with-modifiers-positive-symptom-is-not-negated', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I have no numbness with new rapidly increasing swelling.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('rapidly increasing swelling'));
  });

  await scenario('same-clause-later-injury-wins', 'My right wrist has hurt for four weeks. There was no fall, but yesterday I had a direct injury. Typing makes it worse.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('major recent injury'));
  });

  await scenario('precise-location-nonanswer-stays-unresolved', 'My right wrist and thumb hurt for four weeks. It built up gradually and typing makes it worse.', async () => {
    assert.equal(await page.locator('#interaction').getAttribute('data-concept'), 'preciseLocation');
    await page.fill('#reply', "I don't know.");
    await page.click('#send');
    assert(await page.locator('#interaction[data-concept="preciseLocation"] #reply').count());
    assert.equal(await page.locator('[data-safety="clear"]').count(), 0);
    await page.fill('#reply', 'On the palm side near the thumb knuckle.');
    await page.click('#send');
    assert(await page.locator('[data-safety="clear"]').count());
  });

  await scenario('no-idea-location-stays-unresolved', 'My right wrist and thumb hurt for four weeks. It built up gradually and typing makes it worse.', async () => {
    assert.equal(await page.locator('#interaction').getAttribute('data-concept'), 'preciseLocation');
    await page.fill('#reply', 'I have no idea.');
    await page.click('#send');
    assert(await page.locator('#interaction[data-concept="preciseLocation"] #reply').count());
    assert.equal(await page.locator('[data-safety="clear"]').count(), 0);
  });

  await scenario('uncertainty-with-location-is-accepted', 'My right wrist and thumb hurt for four weeks. It built up gradually and typing makes it worse.', async () => {
    await page.fill('#reply', 'I have no idea what the spot is called, but it is on the palm side near my thumb knuckle.');
    await page.click('#send');
    assert(await page.locator('[data-safety="clear"]').count());
  });

  await scenario('explicit-open-wound-denial-stays-denied', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I have no open wound.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(!safety.includes('open wound'));
  });

  await scenario('wound-pain-denial-does-not-deny-cut', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. My open cut has no wound pain.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('Self-care should pause here'));
    assert(safety.includes('may need professional evaluation'));
  });

  await scenario('cut-back-is-not-a-wound', 'My right wrist hurts for four weeks. It built up gradually and I cut back on typing because of the wrist pain.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('safety check'));
    assert(!safety.includes('You reported an open wound'));
    assert(await page.locator('[data-safety="clear"]').count());
  });

  await scenario('cutting-back-is-not-another-body-region', 'My right wrist hurts for four weeks. It built up gradually and I have been cutting back on typing because of the wrist pain.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('safety check'));
    assert(await page.locator('[data-safety="clear"]').count());
  });

  await scenario('explicit-cut-denial-does-not-stop-intake', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I do not have a cut.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('safety check'));
    assert(!safety.includes('You reported an open wound'));
    assert(!safety.includes('an open wound'));
  });

  await scenario('transitive-cut-report-stops-intake', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. Yesterday I cut my wrist.', async () => {
    const message = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(message.includes('Self-care should pause here'));
    assert(message.includes('may need professional evaluation'));
    assert.equal(await page.locator('[data-safety="clear"]').count(), 0);
  });

  await scenario('make-the-cut-is-not-a-wound', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse after I did not make the cut for the team.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('safety check'));
    assert(!safety.includes('You reported an open wound'));
  });

  await scenario('negated-transitive-cut-does-not-stop', 'My right wrist hurts for four weeks after I fell, but I did not cut my wrist. Typing makes it worse.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(!safety.includes('You reported an open wound'));
    assert(safety.includes('safety check'));
  });

  await scenario('indefinite-transitive-cut-stops-intake', 'My right wrist hurts for four weeks. Typing makes it worse. Yesterday I cut a finger.', async () => {
    const message = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(message.includes('Self-care should pause here'));
    assert(message.includes('may need professional evaluation'));
  });

  await scenario('quantified-plural-cut-stops-intake', 'My right wrist hurts for four weeks. Typing makes it worse. Yesterday I cut two fingers.', async () => {
    const message = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(message.includes('Self-care should pause here'));
  });

  await scenario('cut-short-idiom-is-not-a-wound', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I cut my wrist exercises short because they hurt.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('safety check'));
    assert(!safety.includes('You reported an open wound'));
  });

  await scenario('separate-cut-denial-does-not-erase-report', 'My right wrist hurts for four weeks. Typing makes it worse. I cut a finger, but I did not cut my wrist.', async () => {
    const message = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(message.includes('Self-care should pause here'));
  });

  await scenario('spelled-quantity-cut-stops-intake', 'My right wrist hurts for four weeks. Typing makes it worse. Yesterday I cut four fingers.', async () => {
    const message = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(message.includes('Self-care should pause here'));
  });

  await scenario('therapy-cut-short-is-not-a-wound', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I cut my wrist therapy short because it hurt.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('safety check'));
    assert(!safety.includes('You reported an open wound'));
  });

  await scenario('healed-historical-cut-does-not-stop', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I had a cut on my wrist last year, but it healed.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('safety check'));
    assert(!safety.includes('You reported an open wound'));
  });

  await scenario('exact-cut-correction-retracts-report', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I thought I cut my wrist, but I did not cut my wrist.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('safety check'));
    assert(!safety.includes('You reported an open wound'));
  });

  await scenario('laterality-in-cut-object-stops-intake', 'My right wrist hurts for four weeks. Typing makes it worse. Yesterday I cut my right wrist.', async () => {
    const message = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(message.includes('Self-care should pause here'));
  });

  await scenario('healed-cut-does-not-hide-fresh-cut', 'My right wrist hurts for four weeks. Typing makes it worse. My finger cut healed, but I have a fresh cut on my wrist.', async () => {
    const message = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(message.includes('Self-care should pause here'));
  });

  await scenario('cut-short-does-not-hide-real-cut', 'My right wrist hurts for four weeks. Typing makes it worse. I cut my wrist, but I cut my therapy short.', async () => {
    const message = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(message.includes('Self-care should pause here'));
  });

  await scenario('connected-problems-keep-symptoms-scoped', 'My right wrist tingles but my left knee hurts.', async () => {
    const prompt = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(!prompt.includes('Which fingers or part of the hand feel numb or tingly?'));
  });

  await scenario('opposite-side-denial-preserves-cut', 'My right wrist hurts for four weeks. Typing makes it worse. I cut my right wrist, but I did not cut my left wrist.', async () => {
    const message = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(message.includes('Self-care should pause here'));
  });

  await scenario('unrelated-healed-scrape-does-not-resolve-cut', 'My right wrist hurts for four weeks. Typing makes it worse. I have a fresh wrist cut and an old scrape that healed.', async () => {
    const message = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(message.includes('Self-care should pause here'));
  });

  await scenario('and-later-cut-short-preserves-cut', 'My right wrist hurts for four weeks. Typing makes it worse. I cut my wrist and later cut my therapy short.', async () => {
    const message = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(message.includes('Self-care should pause here'));
  });

  await scenario('posterior-wrist-location-stays-on-hand-thread', 'My right wrist and thumb hurt for four weeks. It built up gradually and typing makes it worse.', async () => {
    await page.fill('#reply', 'It is on the back of my wrist near the thumb.');
    await page.click('#send');
    assert(await page.locator('[data-safety="clear"]').count());
    const summary = await page.evaluate(() => window.KeneflexParticipant.model.story.order.map(key => window.KeneflexParticipant.model.story.threads[key].family));
    assert.deepEqual(summary, ['hand']);
  });

  await scenario('relative-clause-healed-cut-does-not-stop', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I have a wrist cut that has healed.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('safety check'));
    assert(!safety.includes('You reported an open wound'));
  });

  await scenario('precise-location-warning-sign-is-preserved', 'My right wrist and thumb hurt for four weeks. It built up gradually and typing makes it worse.', async () => {
    await page.fill('#reply', 'On the palm side near my thumb, where I have an open cut.');
    await page.click('#send');
    const message = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(message.includes('Self-care should pause here'));
    assert(message.includes('may need professional evaluation'));
    assert.equal(await page.locator('[data-safety="clear"]').count(), 0);
  });

  await scenario('posterior-location-variant-stays-on-hand-thread', 'My right wrist and thumb hurt for four weeks. It built up gradually and typing makes it worse.', async () => {
    await page.fill('#reply', 'It is on the back side of my wrist near the thumb.');
    await page.click('#send');
    assert(await page.locator('[data-safety="clear"]').count());
    const families = await page.evaluate(() => window.KeneflexParticipant.model.story.order.map(key => window.KeneflexParticipant.model.story.threads[key].family));
    assert.deepEqual(families, ['hand']);
  });

  await scenario('generic-location-with-uncertainty-stays-unresolved', 'My right wrist and thumb hurt for four weeks. It built up gradually and typing makes it worse.', async () => {
    await page.fill('#reply', "I'm not sure where on my hand.");
    await page.click('#send');
    assert(await page.locator('#interaction[data-concept="preciseLocation"] #reply').count());
    assert.equal(await page.locator('[data-safety="clear"]').count(), 0);
  });

  await scenario('side-less-connected-problems-keep-symptoms-scoped', 'My wrist hurts but my knee tingles.', async () => {
    const hand = await page.evaluate(() => Object.values(window.KeneflexParticipant.model.story.threads).find(thread => thread.family === 'hand'));
    assert(!hand.symptoms.includes('tingling'));
  });

  await scenario('and-connected-problems-are-split-before-ingest', 'My wrist hurts and my knee tingles.', async () => {
    const hand = await page.evaluate(() => Object.values(window.KeneflexParticipant.model.story.threads).find(thread => thread.family === 'hand'));
    const knee = await page.evaluate(() => Object.values(window.KeneflexParticipant.model.story.threads).find(thread => thread.family === 'knee'));
    assert(!hand.symptoms.includes('tingling'));
    assert(knee.symptoms.includes('tingling'));
  });

  await scenario('just-restarts-symptom-polarity', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I have no numbness, just tingling in my thumb.', async () => {
    const hand = await page.evaluate(() => Object.values(window.KeneflexParticipant.model.story.threads).find(thread => thread.family === 'hand'));
    assert(hand.symptoms.includes('tingling'));
    assert(!hand.negatives.includes('tingling'));
  });

  await scenario('article-led-connected-problem-is-split', 'My wrist hurts but the knee tingles.', async () => {
    const hand = await page.evaluate(() => Object.values(window.KeneflexParticipant.model.story.threads).find(thread => thread.family === 'hand'));
    assert(!hand.symptoms.includes('tingling'));
  });

  await scenario('postnominal-opposite-side-denial-preserves-cut', 'My right wrist hurts for four weeks. Typing makes it worse. I have an open cut on my right wrist, but no cut on my left wrist.', async () => {
    const message = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(message.includes('Self-care should pause here'));
  });

  await scenario('and-clause-positive-symptom-is-not-negated', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I have no numbness and it is rapidly swelling.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('rapidly increasing swelling'));
  });

  await scenario('thumb-wrap-is-owned-support', 'My right wrist and thumb hurt at the base of my thumb for four weeks. It built up gradually and gripping makes it worse. My thumb wrap fits well, is clean and in good condition, still works, and covers both wrist and thumb.', async () => {
    await clearSafetyAndMeasure();
    assert.equal(await page.locator('#supportState').innerText(), 'Recommended');
    assert.equal(await page.locator('#total').innerText(), '$40.99');
  });

  await scenario('location-help-does-not-create-back-problem', 'My right wrist and thumb hurt for four weeks. It built up gradually and typing makes it worse.', async () => {
    await page.fill('#reply', "I don't know.");
    await page.click('#send');
    const help = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(help.includes('top of the wrist'));
    assert(!help.includes('back of the wrist'));
    await page.fill('#reply', 'The top of my wrist near the thumb.');
    await page.click('#send');
    assert(await page.locator('[data-safety="clear"]').count());
    const body = await page.locator('body').innerText();
    assert(!body.includes('different problem area'));
  });

  await scenario('fall-denial-does-not-clear-twist-injury', 'My right wrist hurts for four weeks after a sudden twist without a fall. Typing makes it worse.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('major recent injury'));
  });

  await scenario('burn-denial-does-not-clear-open-wound', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I have no burn.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('deep or gaping wound'));
  });

  await scenario('multi-region-symptoms-stay-with-source-thread', 'My right wrist tingles. My left knee hurts.', async () => {
    const prompt = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(!prompt.includes('Which fingers or part of the hand feel numb or tingly?'));
  });

  await scenario('later-same-clause-symptom-wins', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I had no swelling but now the swelling is rapidly increasing.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('rapidly increasing swelling'));
  });

  await scenario('gel-cold-pack-is-not-topical', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I have a gel cold pack that works well.', async () => {
    await clearSafetyAndMeasure();
    assert.equal(await content('#coldState'), 'Selected add-on');
    assert.equal(await content('#topicalState'), 'Optional add-on');
    assert.equal(await page.locator('#total').innerText(), '$45.99');
  });

  await scenario('uncertain-numbness-remains-in-safety-check', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I am not sure whether my fingers are numb.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('loss of feeling'));
  });

  await scenario('wound-dressing-does-not-deny-cut', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I have no wound dressing on the cut.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('deep or gaping wound'));
  });

  await scenario('partial-support-assessment-requires-review', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. My wrist brace fits well.', async () => {
    await clearSafetyAndMeasure();
    assert.equal(await page.locator('#supportState').innerText(), 'Recommended');
    assert(!(await page.locator('.kfxBuy').isDisabled()));
  });

  await scenario('ice-wrist-wrap-is-cold-product', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I already have a Polar Soft Ice Wrist Wrap that works well.', async () => {
    await clearSafetyAndMeasure();
    assert.equal(await page.locator('#supportState').innerText(), 'Recommended');
    assert.equal(await content('#coldState'), 'Selected add-on');
    assert.equal(await page.locator('#total').innerText(), '$45.99');
  });

  await scenario('consumer-can-remove-each-recommended-item', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse.', async () => {
    await clearSafetyAndMeasure();
    await page.click('[data-plan="complete"]');
    await page.getByText('Customize this purchase', { exact: true }).click();
    await page.click('[data-tune="support"]');
    assert.equal(await page.locator('#supportState').innerText(), 'Removed by you');
    assert.equal(await page.locator('#total').innerText(), '$32.99');
    await page.click('#resetTune');
    await page.click('[data-plan="complete"]');
    await page.click('[data-tune="cold"]');
    assert.equal(await page.locator('#coldState').innerText(), 'Removed by you');
    assert.equal(await page.locator('#total').innerText(), '$36.98');
  });


  await scenario('postnominal-cut-denial-does-not-stop-intake', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I have no cut on my left wrist.', async () => {
    const message = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(!message.includes('Self-care should pause here'));
    assert(message.includes('safety check'));
  });

  await scenario('plural-connected-problems-stay-separated', 'My wrists hurt but my knees tingle.', async () => {
    const state = await page.evaluate(() => {
      const threads = Object.values(window.KeneflexParticipant.model.story.threads);
      const hand = threads.find(thread => thread.family === 'hand');
      const knee = threads.find(thread => thread.family === 'knee');
      return { hand, knee };
    });
    assert(state.hand, 'hand thread missing');
    assert(state.knee, 'knee thread missing');
    assert(state.hand.symptoms.includes('pain'));
    assert(!state.hand.symptoms.includes('tingling'));
    assert(state.knee.symptoms.includes('tingling'));
    assert(!state.knee.symptoms.includes('pain'));
  });


  await scenario('list-style-open-wound-denial-continues', 'My right wrist and thumb have been hurting for about three weeks after playing pickleball. Gripping the paddle and twisting jars make it worse. There was no fall or direct injury. I don’t have numbness, major swelling, weakness, deformity, or an open wound. I own an old wrist brace, but it is stretched out and doesn’t support my thumb.', async () => {
    assert.equal(await page.locator('#interaction').getAttribute('data-concept'), 'preciseLocation');
    assert(!(await page.locator('#conversation .bubble.ai').last().innerText()).includes('Self-care should pause here'));
    await page.fill('#reply', 'At the base of my thumb and along the thumb side of my wrist.');
    await page.click('#send');
    assert.equal(await page.locator('[data-safety="clear"]').count(), 0, 'fully denied warning signs were asked again');
    assert(await page.locator('#wristMeasure').count());
    await page.fill('#wristMeasure', '7');
    await page.click('#fitContinue');
    await page.waitForSelector('#solutionView:not(.hidden)');
    assert.equal(await page.locator('#supportState').innerText(), 'Recommended');
    assert.equal(await page.locator('#supportPrice').innerText(), '$19.99');
    assert.equal(await page.locator('#total').innerText(), '$40.99');
    assert.equal(await page.locator('[data-plan="recovery"]').getAttribute('aria-pressed'), 'true');
    assert((await content('#whyRows')).includes('right —'));
    assert(!(await page.locator('.kfxBuy').isDisabled()));
  });

  await scenario('reported-visible-deformity-pauses-self-care', 'My right wrist hurts and looks visibly deformed after a fall yesterday. Gripping makes it worse.', async () => {
    const message = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(message.includes('Self-care should pause here'));
    assert(message.includes('visible deformity'));
    assert.equal(await page.locator('#wristMeasure').count(), 0);
  });

  await scenario('reported-misshapen-area-pauses-self-care', 'My right wrist hurts after a fall yesterday and the area looks misshapen. Gripping makes it worse.', async () => {
    const message = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(message.includes('Self-care should pause here'));
    assert.equal(await page.locator('#wristMeasure').count(), 0);
  });

  await scenario('reported-odd-angle-pauses-self-care', 'My right wrist hurts after a fall yesterday and it appears to be at an odd angle. Gripping makes it worse.', async () => {
    const message = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(message.includes('Self-care should pause here'));
    assert.equal(await page.locator('#wristMeasure').count(), 0);
  });

  await scenario('explicit-deformed-denial-does-not-stop', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. It does not look deformed.', async () => {
    const message = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(!message.includes('Self-care should pause here'));
  });

  await scenario('minor-superficial-scrape-continues-with-protection', 'My right wrist hurts for four weeks after typing. It built up gradually. There was no fall or direct injury. I have a small superficial scrape on my hand. The bleeding stopped, and I washed and covered it. I do not have numbness, major swelling, weakness, or deformity.', async () => {
    const safety = await page.locator('#conversation').innerText();
    assert(safety.includes('minor scrape does not automatically require medical care'));
    assert(safety.includes('Do not place a brace or topical pain product directly over unprotected broken skin'));
    assert(!safety.includes('Self-care should pause here'));
    if (await page.locator('[data-safety="clear"]').count()) await page.click('[data-safety="clear"]');
    await page.fill('#wristMeasure', '7');
    await page.click('#fitContinue');
    await page.waitForSelector('#solutionView:not(.hidden)');
    const solution = await content('#solutionView');
    assert(solution.includes('Skin protection'));
    assert(solution.includes('Do not place a brace or topical pain product directly over unprotected broken skin'));
    await page.click('.kfxBuy');
    const checkout = await page.locator('.kfxCheckout').innerText();
    assert(checkout.includes('Protect the scrape'));
    assert(checkout.includes('unprotected broken skin'));
  });

  await scenario('deep-gaping-cut-pauses-self-care', 'My right wrist hurts after a fall. I have a deep gaping cut on my wrist that is still bleeding.', async () => {
    const message = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(message.includes('Self-care should pause here'));
    assert(message.includes('may need professional evaluation'));
    assert.equal(await page.locator('[data-safety="clear"]').count(), 0);
  });


  await scenario('affirmative-scrape-after-denial-remains-reported', 'My right wrist hurts for four weeks after typing. It built up gradually. I don’t have numbness or weakness, and I do have a small superficial scrape on my wrist. The bleeding stopped, and I washed and covered it.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('minor scrape does not automatically require medical care'));
    assert(safety.includes('unprotected broken skin'));
    assert(!safety.includes('Self-care should pause here'));
  });

  await scenario('persistent-bleeding-cut-pauses-self-care', 'My right wrist hurts after a fall. I have a small cut that keeps bleeding despite pressure.', async () => {
    const message = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(message.includes('Self-care should pause here'));
    assert(message.includes('may need professional evaluation'));
  });

  await scenario('wrist-only-stiffness-selects-heat', 'I already know I want a wrist brace. My left wrist has been stiff and tight in the morning for four weeks, but my thumb is fine. It built up gradually and typing makes it worse. There was no fall or direct injury, open wound, numbness, swelling, weakness, or deformity.', async () => {
    await clearSafetyAndMeasure('7.0');
    assert((await content('#supportItem .planName')).includes('BraceAbility Volar Wrist Splint'));
    assert((await content('#supportItem .planName')).includes('Adjustable'));
    assert((await content('#coldItem .planName')).includes('Moist Heat'));
    assert.equal(await content('#planName'), 'Recommended');
    assert.equal(await content('#total'), '$46.99');
  });

  await scenario('patch-preference-selects-complete', 'My right wrist and thumb are sore at the base of my thumb after golf for four weeks. It built up gradually. I want a brace and prefer a pain patch instead of cream. There was no fall or direct injury, open wound, numbness, swelling, weakness, or deformity.', async () => {
    await clearSafetyAndMeasure('7.0');
    assert((await content('#topicalItem .planName')).includes('Biofreeze Pain Relief Patch'));
    assert.equal(await content('#planName'), 'Complete');
    assert.equal(await page.locator('[data-plan="complete"]').getAttribute('aria-pressed'), 'true');
    assert.equal(await content('#total'), '$53.98');
  });

  await scenario('known-want-support-only-selects-essential', 'I only want help choosing a wrist support. My right wrist has ached when I type for four weeks, and my thumb does not hurt. It built up gradually. There was no fall or direct injury, open wound, numbness, swelling, weakness, or deformity.', async () => {
    await clearSafetyAndMeasure('7.0');
    assert((await content('#supportItem .planName')).includes('BraceAbility Volar Wrist Splint'));
    assert.equal(await content('#planName'), 'Essential');
    assert.equal(await page.locator('[data-plan="core"]').getAttribute('aria-pressed'), 'true');
    assert.equal(await content('#total'), '$24.99');
  });

  await scenario('minor-scrape-disables-comfort-tier', 'My right wrist and thumb are sore at the base of my thumb after tennis for four weeks. It built up gradually. I have a small superficial scrape on my wrist; the bleeding stopped and I washed and covered it. There was no fall or direct injury, numbness, swelling, weakness, or deformity.', async () => {
    await clearSafetyAndMeasure('7.0');
    assert.equal(await page.locator('[data-plan="complete"]').isDisabled(), true);
    assert.equal(await content('#topicalState'), 'Not available for this story');
    assert.equal(await content('#planName'), 'Recommended');
  });

  await browser.close();
  console.log(JSON.stringify({ scenarios: scenarioCount, failures }, null, 2));
  if (failures.length) process.exit(1);
})();
