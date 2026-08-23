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

  async function scenario(name, story, verify) {
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
    await page.click('[data-safety="clear"]');
    await page.fill('#wristMeasure', value);
    await page.click('#fitContinue');
    await page.waitForSelector('#solutionView:not(.hidden)');
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
    assert.equal(initial.total, '$52.98');
    assert(initial.buy.includes('$52.98'));
    assert(initial.text.includes('Medium'));
    assert.equal(initial.scripts.length, 4); // loader + engine + critical invariants + controller
    assert(!initial.observers, 'legacy observer runtime is active');
    assert(!banned.test(initial.text), 'internal language is visible');

    await page.click('[data-tune="topical"]');
    assert.equal(await page.locator('#total').innerText(), '$40.99');
    assert((await page.locator('.kfxBuy').innerText()).includes('$40.99'));

    const popupPromise = page.waitForEvent('popup');
    await page.click('#kfxPlanBtn');
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    assert.equal(await popup.title(), 'Your Keneflex Plan');
    assert((await popup.locator('body').innerText()).includes('Biofreeze') === false);
    await popup.close();

    await page.click('.kfxBuy');
    assert.equal(await page.locator('.kfxCheckout .totalx span:last-child').innerText(), '$40.99');
    assert.equal(await page.locator('.kfxCheckout .rowx').count(), 2);
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
    ['below-medium-boundary', '6.29', false],
    ['medium-lower-boundary', '6.30', true],
    ['medium-lower-interior', '6.49', true],
    ['medium-mid-boundary', '6.50', true],
    ['medium-upper-boundary', '7.50', true]
  ];
  for (const [name, measurement, eligible] of mediumBoundaries) {
    await scenario(name, 'My right wrist hurts for 4 weeks. It built up gradually and typing makes it worse.', async () => {
      await clearSafetyAndMeasure(measurement);
      assert.equal(!(await page.locator('.kfxBuy').isDisabled()), eligible);
      if (eligible) {
        assert((await page.locator('#supportItem .planName').innerText()).includes('Medium'));
      } else {
        assert((await page.locator('#supportState').innerText()).includes('review'));
      }
    });
  }

  await scenario('unsupported-size-hold', 'My right wrist hurts for 4 weeks. It built up gradually and typing makes it worse.', async () => {
    await clearSafetyAndMeasure('8.5');
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
    assert.equal(await page.locator('#total').innerText(), '$52.98');
    assert(!(await page.locator('.kfxBuy').isDisabled()));
    const solution = await page.locator('#solutionView').innerText();
    assert(!solution.includes('What you already own'));
    assert(!solution.includes('movement-preserving support requirement'));
    const popupPromise = page.waitForEvent('popup');
    await page.click('#kfxPlanBtn');
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    assert.equal(await popup.locator('.line').first().locator('b').innerText(), '$19.99');
    await popup.close();
  });

  await scenario('ipad-single-column', 'My right wrist hurts for 4 weeks. It built up gradually and typing makes it worse.', async () => {
    await page.setViewportSize({ width: 834, height: 1112 });
    await clearSafetyAndMeasure();
    const columns = await page.locator('#solutionView .grid').evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ').length);
    assert.equal(columns, 1, 'iPad layout must use one primary reading column');
    await page.setViewportSize({ width: 390, height: 844 });
  });

  await scenario('gradual-does-not-clear-later-injury', 'My right wrist has hurt for four weeks and built up gradually. Yesterday I had a major injury to it. Typing makes it worse.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('major recent injury'));
  });

  await scenario('mixed-owned-products-are-independent', 'I have an old right wrist brace that is stretched out. I have a cold pack that works well. My wrist has hurt for four weeks, built up gradually, and typing makes it worse.', async () => {
    await clearSafetyAndMeasure();
    assert.equal(await page.locator('#supportState').innerText(), 'Recommended');
    assert.equal(await page.locator('#coldState').innerText(), 'Recommended');
    assert.equal(await page.locator('#total').innerText(), '$52.98');
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
    await page.click('.kfxBuy');
    const warning = await page.locator('.kfxSafetyNotice').innerText();
    assert(warning.includes('Do not wear the support over Biofreeze'));
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
    assert.equal(await page.locator('#coldState').innerText(), 'Recommended');
    assert.equal(await page.locator('#total').innerText(), '$52.98');
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
    assert.equal(await page.locator('#coldState').innerText(), 'Recommended');
    assert.equal(await page.locator('#total').innerText(), '$52.98');
  });

  await scenario('later-swelling-overrides-earlier-denial', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. There was no swelling yesterday. Today it is rapidly swelling.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('rapidly increasing swelling'));
  });

  await scenario('owned-cold-does-not-change-plan', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I have a cold pack that works well.', async () => {
    await clearSafetyAndMeasure();
    assert.equal(await page.locator('#coldState').innerText(), 'Recommended');
    const explanation = await page.locator('#whyRows').innerText();
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
    assert(safety.includes('open wound'));
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
    assert(message.includes('open wound or cut'));
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
    assert(message.includes('open wound or cut'));
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

  await scenario('and-clause-positive-symptom-is-not-negated', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I have no numbness and it is rapidly swelling.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('rapidly increasing swelling'));
  });

  await scenario('thumb-wrap-is-owned-support', 'My right wrist and thumb hurt at the base of my thumb for four weeks. It built up gradually and gripping makes it worse. My thumb wrap fits well, is clean and in good condition, still works, and covers both wrist and thumb.', async () => {
    await clearSafetyAndMeasure();
    assert.equal(await page.locator('#supportState').innerText(), 'Recommended');
    assert.equal(await page.locator('#total').innerText(), '$52.98');
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
    assert(safety.includes('open wound'));
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
    assert.equal(await page.locator('#coldState').innerText(), 'Recommended');
    assert.equal(await page.locator('#topicalState').innerText(), 'Recommended');
    assert.equal(await page.locator('#total').innerText(), '$52.98');
  });

  await scenario('uncertain-numbness-remains-in-safety-check', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I am not sure whether my fingers are numb.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('loss of feeling'));
  });

  await scenario('wound-dressing-does-not-deny-cut', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I have no wound dressing on the cut.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('open wound'));
  });

  await scenario('partial-support-assessment-requires-review', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. My wrist brace fits well.', async () => {
    await clearSafetyAndMeasure();
    assert.equal(await page.locator('#supportState').innerText(), 'Recommended');
    assert(!(await page.locator('.kfxBuy').isDisabled()));
  });

  await scenario('ice-wrist-wrap-is-cold-product', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I already have a Polar Soft Ice Wrist Wrap that works well.', async () => {
    await clearSafetyAndMeasure();
    assert.equal(await page.locator('#supportState').innerText(), 'Recommended');
    assert.equal(await page.locator('#coldState').innerText(), 'Recommended');
    assert.equal(await page.locator('#total').innerText(), '$52.98');
  });

  await scenario('consumer-can-remove-each-recommended-item', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse.', async () => {
    await clearSafetyAndMeasure();
    await page.click('[data-tune="support"]');
    assert.equal(await page.locator('#supportState').innerText(), 'Removed by you');
    assert.equal(await page.locator('#total').innerText(), '$32.99');
    await page.click('#resetTune');
    await page.click('[data-tune="cold"]');
    assert.equal(await page.locator('#coldState').innerText(), 'Removed by you');
    assert.equal(await page.locator('#total').innerText(), '$31.98');
  });

  await browser.close();
  console.log(JSON.stringify({ scenarios: 44, failures }, null, 2));
  if (failures.length) process.exit(1);
})();
