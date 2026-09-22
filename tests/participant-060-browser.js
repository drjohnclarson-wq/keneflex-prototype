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
      await waitForIntakeSettled();
    }
    if (await page.locator('[data-safety="clear"]').count()) await page.click('[data-safety="clear"]');
    await page.waitForSelector('#solutionView:not(.hidden)');
    if (await page.locator('#fitMeasure').count()) {
      if (!(await page.locator('.fitDetails').getAttribute('open'))) await page.click('.fitDetails summary');
      await page.fill('#fitMeasure', value);
      await page.click('#fitMeasureContinue');
      if (await page.locator('#fitMeasureError').count() && (await page.locator('#fitMeasureError').innerText()).includes('two adjacent')) {
        await page.click('[data-fit-size="M"]');
      }
    }
  }

  async function waitForIntakeSettled() {
    await page.waitForFunction(() => {
      const send = document.querySelector('#send');
      return !send || !send.disabled;
    }, null, { timeout: 10000 });
  }

  async function finishIntakeAndMeasure(value = '7.0', overrides = {}) {
    const defaults = {
      preciseLocation: 'It is centered on the palm side of my wrist.',
      symptom: 'It feels sore and stiff.',
      trigger: 'Typing, gripping, and using it make it worse.',
      mechanism: 'It built up gradually without an injury.',
      duration: 'It has been present for four weeks.',
      laterality: 'It is on the right.',
      sensoryDistribution: 'There is no numbness or tingling.'
    };
    for (let step = 0; step < 12 && !(await page.locator('#solutionView:not(.hidden)').count()); step += 1) {
      if (await page.locator('#interaction #reply').count()) {
        const concept = await page.locator('#interaction').getAttribute('data-concept');
        await page.fill('#reply', overrides[concept] || defaults[concept] || 'It is use-related and has been present for four weeks.');
        await page.click('#send');
      } else if (await page.locator('[data-safety="clear"]').count()) {
        await page.click('[data-safety="clear"]');
      }
      await page.waitForTimeout(40);
    }
    assert(await page.locator('#solutionView:not(.hidden)').count(), 'intake did not reach the recommendation');
    if (await page.locator('#fitMeasure').count()) {
      await page.click('.fitDetails summary');
      await page.fill('#fitMeasure', value);
      await page.click('#fitMeasureContinue');
      if (await page.locator('#fitMeasureError').count() && (await page.locator('#fitMeasureError').innerText()).includes('two adjacent')) {
        await page.click('[data-fit-size="M"]');
      }
    }
  }

  async function content(selector) {
    return page.locator(selector).evaluate(node => node.textContent.trim());
  }

  async function safetyText() {
    const prompt = await page.locator('#conversation .bubble.ai').last().innerText();
    const choices = await page.locator('#interaction').innerText().catch(() => '');
    return prompt + '\n' + choices;
  }

  function assertSafetyAcknowledgement(text) {
    assert(text.includes('Please read this before continuing'));
    assert(text.includes('exposed bone'));
    assert(text.includes('bleeding that will not stop'));
    assert(text.includes('sudden face drooping'));
    assert(text.includes('I have read this. None of these apply.'));
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
    assert(initial.text.includes('The right product for what you described'));
    assert(!initial.text.includes('Core is enough to start'));
    assert(!initial.text.includes('optional additions'));
    assert.equal(await page.locator('.planTier').count(), 3);
    assert.equal(await page.locator('[data-plan="recovery"]').getAttribute('aria-pressed'), 'true');
    assert((await content('[data-plan="core"]')).includes('$19.99 total'));
    assert((await content('[data-plan="recovery"]')).includes('$40.99 total'));
    assert((await content('[data-plan="recovery"]')).includes('+$21.00: adds reusable flexible cold recovery'));
    assert((await content('[data-plan="complete"]')).includes('$52.98 total'));
    assert((await content('[data-plan="complete"]')).includes('+$11.99: adds temporary topical comfort'));
    assert((await content('[data-plan="complete"]')).includes('Optional comfort'));
    assert.equal(await page.locator('[data-plan="core"] .tierProduct img').count(), 1);
    assert.equal(await page.locator('[data-plan="recovery"] .tierProduct img').count(), 2);
    assert.equal(await page.locator('[data-plan="complete"] .tierProduct img').count(), 3);
    const productImages = await page.locator('.tierProduct img').evaluateAll(images => images.map(image => ({ src: image.currentSrc || image.src, width: image.naturalWidth, height: image.naturalHeight })));
    assert(productImages.every(image => image.src && image.width > 0 && image.height > 0), 'every recommended product must show a visible image or fallback');
    assert.equal(await page.locator('.tierMatchReport').count(), 3);
    assert.equal(await page.locator('.tierMatchReport').filter({ hasText: 'Your Keneflex Product Match Report' }).count(), 3);
    assert.equal(await page.locator('.tierIncludes span').filter({ hasText: 'Keneflex Product Match Report' }).count(), 3);
    assert(await page.evaluate(() => !!(document.querySelector('.planChooser').compareDocumentPosition(document.querySelector('.purchaseBlock')) & Node.DOCUMENT_POSITION_FOLLOWING)), 'purchase action must follow plan cards');
    assert.equal(await content('#planName'), 'Support + recovery');
    assert.equal(await content('#selectionCount'), '2 products + Product Match Report');
    assert.equal(initial.scripts.length, 4); // loader + engine + critical invariants + controller
    assert(!initial.observers, 'legacy observer runtime is active');
    assert(!banned.test(initial.text), 'internal language is visible');

    await page.click('[data-plan="recovery"]');
    assert.equal(await page.locator('#total').innerText(), '$40.99');
    assert.equal(await content('#planName'), 'Support + recovery');
    assert.equal(await content('#selectionCount'), '2 products + Product Match Report');
    assert((await page.locator('.kfxBuy').innerText()).includes('$40.99'));

    await page.click('#kfxPlanBtn');
    assert(await page.locator('.kfxPlanOverlay').count());
    assert((await page.locator('.kfxPlanPage').innerText()).includes('Biofreeze') === false);
    assert.equal(await content('.finalSelection h2'), 'Support + recovery');
    assert((await content('.finalSelection')).includes('$40.99'));
    assert.equal(await page.locator('.finalSelection .planLine').count(), 3);
    assert((await content('.finalSelection .planIncluded')).includes('Keneflex Product Match Report'));
    assert((await content('.finalSelection .planIncluded')).includes('Included'));
    assert((await content('.kfxFinalBuy')).includes('$40.99 total'));
    assert(!(await page.locator('.kfxPlanPage').innerText()).includes('Workspace and device setup'));
    assert.equal(await page.locator('[data-plan-print]').count(), 1);
    assert(!(await page.locator('.kfxPlanPage').innerText()).includes('Exercises and stretches'));
    await page.click('[data-plan-close]');

    await page.click('.kfxBuy');
    assert.equal(await page.locator('.kfxCheckout .totalx span:last-child').innerText(), '$40.99');
    assert.equal(await page.locator('.kfxCheckout .rowx:not(.planIncluded)').count(), 2);
    assert((await content('.kfxCheckout .planIncluded')).includes('Keneflex Product Match Report'));
    assert((await content('.kfxCheckout .planIncluded')).includes('Included'));
  });

  await scenario('gradual-median-side-tingling-selects-neutral-wrist-support', 'My left wrist and thumb hurt and my thumb and index finger tingle after typing for 3 weeks. It built up gradually.', async () => {
    await clearSafetyAndMeasure();
    assert.equal(await page.locator('.kfxBuy').isDisabled(), false);
    assert.equal(await page.locator('#supportState').innerText(), 'Recommended');
    assert((await content('#supportItem .planName')).includes('BraceAbility Volar Wrist Splint'));
    assert((await page.locator('#solutionView').innerText()).includes('neutral-position wrist support'));
  });

  await scenario('regional-firewall', 'My right knee hurts under the kneecap for 3 weeks going downstairs. It built up gradually.', async () => {
    await page.waitForTimeout(50);
    const body = await page.locator('body').innerText();
    assert(body.includes('currently completes product recommendations only for the hand, wrist, and thumb pathway'));
    assert(await page.locator('#solutionView.hidden').count());
  });

  await scenario('uncertain-answer-is-not-fabricated', 'My wrist hurts.', async () => {
    assert.equal(await page.locator('#interaction').getAttribute('data-concept'), 'side');
    await page.fill('#reply', 'Not sure');
    await page.click('#send');
    await waitForIntakeSettled();
    const hand = await page.evaluate(() => Object.values(window.KeneflexParticipant.model.story.threads).find(thread => thread.family === 'hand'));
    assert(!hand.side);
    assert.equal(await page.locator('#interaction').getAttribute('data-concept'), 'side');
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
    assert.equal(await page.locator('#supportState').innerText(), 'Choose size');
    assert((await page.locator('#fitMeasureError').innerText()).includes('5.1 to 9.1 inches'));
  });

  await scenario('overlapping-package-boundary-requires-choice', 'My right wrist and thumb hurt at the base of my thumb for 4 weeks. It built up gradually and typing makes it worse.', async () => {
    if (await page.locator('[data-safety="clear"]').count()) await page.click('[data-safety="clear"]');
    await page.waitForSelector('#solutionView:not(.hidden)');
    await page.click('.fitDetails summary');
    await page.fill('#fitMeasure', '6.3');
    await page.click('#fitMeasureContinue');
    assert((await content('#fitMeasureError')).includes('two adjacent package ranges'));
    assert(await page.locator('.kfxBuy').isDisabled());
    await page.click('[data-fit-size="M"]');
    assert.equal(await page.locator('.kfxBuy').isDisabled(), false);
    assert((await content('#supportItem .planName')).includes('Medium'));
  });

  await scenario('plain-language-fit-selects-a-starting-size-and-explains-selection', 'My right wrist and thumb hurt at the base of my thumb for 4 weeks. It built up gradually and gripping makes it worse.', async () => {
    if (await page.locator('[data-safety="clear"]').count()) await page.click('[data-safety="clear"]');
    await page.waitForSelector('#solutionView:not(.hidden)');
    assert(await page.locator('.kfxBuy').isDisabled());
    assert.equal(await content('#supportState'), 'Choose size');
    await page.click('[data-fit-size="M"]');
    assert((await content('.fitSelection')).includes('Starting size: Medium'));
    assert.equal(await page.locator('.kfxBuy').isDisabled(), false);
    await page.click('#kfxPlanBtn');
    assert.equal(await page.locator('.kfxFinalBuy').isDisabled(), false);
    await page.click('[data-plan-close]');
    await page.click('.selectionReasons summary');
    const reasons = await content('.selectionReasonBody');
    assert(reasons.includes('Neo G Airflow Wrist & Thumb Support'));
    assert(reasons.includes('wrist and thumb'));
    assert(reasons.includes('Polar Soft Ice Wrist Wrap'));
    assert(reasons.includes('Biofreeze Pain Relief Gel'));
    assert(reasons.includes('Optional comfort'));
    assert(reasons.includes('What it is designed to do:'));
    assert(reasons.includes('Why it fits what you told us:'));
    assert(!reasons.includes('absence of a stronger heat pattern'));
    assert(!reasons.includes('did not identify a patch preference'));
  });

  await scenario('not-sure-opens-package-chart', 'My right wrist and thumb hurt at the base of my thumb for 4 weeks. It built up gradually and gripping makes it worse.', async () => {
    if (await page.locator('[data-safety="clear"]').count()) await page.click('[data-safety="clear"]');
    await page.waitForSelector('#solutionView:not(.hidden)');
    await page.click('[data-fit-unsure]');
    assert(await page.locator('.fitDetails').evaluate(element => element.open));
    assert(await page.locator('#fitMeasure').evaluate(element => document.activeElement === element));
    assert((await content('.fitChart')).includes('5.1–6.3'));
  });

  await scenario('invalid-new-measurement-clears-old-size', 'My right wrist and thumb hurt at the base of my thumb for 4 weeks. It built up gradually and gripping makes it worse.', async () => {
    await clearSafetyAndMeasure('8.0');
    assert((await content('#supportItem .planName')).includes('Large'));
    await page.click('.fitDetails summary');
    await page.fill('#fitMeasure', '9.2');
    await page.click('#fitMeasureContinue');
    assert(await page.locator('.kfxBuy').isDisabled());
    assert.equal(await content('#supportState'), 'Choose size');
    assert(!(await content('#supportItem .planName')).includes('Large'));
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
    const before = await page.locator('#conversation .bubble.ai').allInnerTexts().then(items => items.join(' '));
    assert(!/which side|how long|make it worse/i.test(before), 'known story facts were asked again');
    const safety = await safetyText();
    assertSafetyAcknowledgement(safety);
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
    const safety = await safetyText();
    assertSafetyAcknowledgement(safety);
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

  await scenario('free-form-precise-location-is-accepted', 'My right hand hurts for four weeks. It built up gradually and typing makes it worse.', async () => {
    assert.equal(await page.locator('#interaction').getAttribute('data-concept'), 'preciseLocation');
    await page.fill('#reply', 'On the palm side near the thumb knuckle.');
    await page.click('#send');
    await waitForIntakeSettled();
    assert.equal(await page.locator('#interaction #reply').count(), 0, 'precise-location question repeated');
    assert(await page.locator('[data-safety="clear"]').count());
  });

  await scenario('unrelated-negation-does-not-deny-fall', 'My right wrist hurts after a fall yesterday. No swelling. Typing makes it worse.', async () => {
    const safety = await safetyText();
    assertSafetyAcknowledgement(safety);
  });

  await scenario('tingling-denial-does-not-deny-numbness', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I have no tingling.', async () => {
    const safety = await safetyText();
    assertSafetyAcknowledgement(safety);
  });

  await scenario('neighbors-product-is-not-owned', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. My neighbor has a cold pack that works well.', async () => {
    await clearSafetyAndMeasure();
    assert.equal(await content('#coldState'), 'Selected add-on');
    assert.equal(await page.locator('#total').innerText(), '$45.99');
  });

  await scenario('owned-support-does-not-override-matched-neutral-wrist-selection', 'My right wrist and thumb hurt at the base of my thumb for four weeks. It built up gradually and typing makes it worse. My thumb and index finger tingle. My wrist and thumb brace is in good condition, fits well, and covers both areas.', async () => {
    await clearSafetyAndMeasure();
    assert.equal(await page.locator('#supportState').innerText(), 'Recommended');
    assert((await content('#supportItem .planName')).includes('BraceAbility Volar Wrist Splint'));
    assert.equal(await page.locator('.kfxBuy').isDisabled(), false);
  });

  await scenario('gradual-pain-limited-weakness-does-not-stop-self-care', 'My right wrist has felt sore and a little weak for four weeks after computer use. It built up gradually. Gripping hurts, but I can still hold ordinary objects normally.', async () => {
    const safety = await safetyText();
    assert(!safety.includes('Self-care should pause here'));
    assert(!safety.includes('meaningful weakness'));
    assertSafetyAcknowledgement(safety);
    await clearSafetyAndMeasure();
    assert.equal(await page.locator('#supportState').innerText(), 'Recommended');
  });

  await scenario('progressive-object-dropping-reaches-acknowledgement', 'My right wrist tingles and my hand weakness has been getting worse for four weeks. I keep dropping ordinary objects and cannot grip normally.', async () => {
    await finishIntakeAndMeasure('7.0', { sensoryDistribution: 'The tingling is in my thumb and index finger.' });
    assert(await page.locator('#solutionView:not(.hidden)').count());
  });

  await scenario('sudden-broader-neurologic-change-is-urgent', 'My right hand and whole arm suddenly became numb and weak, my face feels different, and my speech is slurred.', async () => {
    const message = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(message.includes('Seek urgent medical help now'));
    assert.equal(await page.locator('#wristMeasure').count(), 0);
  });

  await scenario('pinky-side-tingling-stays-under-product-review', 'My right wrist tingles into my pinky at night for four weeks. It built up gradually.', async () => {
    await clearSafetyAndMeasure();
    assert.equal(await page.locator('#supportState').innerText(), 'Needs review before buying');
    assert(await page.locator('.kfxBuy').isDisabled());
  });

  await scenario('later-fall-overrides-earlier-denial', 'My right wrist has hurt for four weeks. There was no fall. Yesterday I fell and hurt it. Typing makes it worse.', async () => {
    const safety = await safetyText();
    assertSafetyAcknowledgement(safety);
  });

  await scenario('support-verb-is-not-owned-support', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I have a cold pack that supports my wrist and works well.', async () => {
    await clearSafetyAndMeasure();
    assert.equal(await page.locator('#supportState').innerText(), 'Recommended');
    assert.equal(await content('#coldState'), 'Selected add-on');
    assert.equal(await page.locator('#total').innerText(), '$45.99');
  });

  await scenario('later-swelling-overrides-earlier-denial', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. There was no swelling yesterday. Today it is rapidly swelling.', async () => {
    const safety = await safetyText();
    assertSafetyAcknowledgement(safety);
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
    const safety = await safetyText();
    assertSafetyAcknowledgement(safety);
  });

  await scenario('with-clause-positive-symptom-is-not-negated', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I have no numbness with rapidly increasing swelling.', async () => {
    const safety = await safetyText();
    assertSafetyAcknowledgement(safety);
  });

  await scenario('with-modifiers-positive-symptom-is-not-negated', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I have no numbness with new rapidly increasing swelling.', async () => {
    const safety = await safetyText();
    assertSafetyAcknowledgement(safety);
  });

  await scenario('same-clause-later-injury-wins', 'My right wrist has hurt for four weeks. There was no fall, but yesterday I had a direct injury. Typing makes it worse.', async () => {
    const safety = await safetyText();
    assertSafetyAcknowledgement(safety);
  });

  await scenario('precise-location-nonanswer-stays-unresolved', 'My right hand hurts for four weeks. It built up gradually and typing makes it worse.', async () => {
    assert.equal(await page.locator('#interaction').getAttribute('data-concept'), 'preciseLocation');
    await page.fill('#reply', "I don't know.");
    await page.click('#send');
    await waitForIntakeSettled();
    assert(await page.locator('#interaction[data-concept="preciseLocation"] #reply').count());
    assert.equal(await page.locator('[data-safety="clear"]').count(), 0);
    await page.fill('#reply', 'On the palm side near the thumb knuckle.');
    await page.click('#send');
    await waitForIntakeSettled();
    assert(await page.locator('[data-safety="clear"]').count());
  });

  await scenario('no-idea-location-stays-unresolved', 'My right hand hurts for four weeks. It built up gradually and typing makes it worse.', async () => {
    assert.equal(await page.locator('#interaction').getAttribute('data-concept'), 'preciseLocation');
    await page.fill('#reply', 'I have no idea.');
    await page.click('#send');
    assert(await page.locator('#interaction[data-concept="preciseLocation"] #reply').count());
    assert.equal(await page.locator('[data-safety="clear"]').count(), 0);
  });

  await scenario('uncertainty-with-location-is-accepted', 'My right hand hurts for four weeks. It built up gradually and typing makes it worse.', async () => {
    await page.fill('#reply', 'I have no idea what the spot is called, but it is on the palm side near my thumb knuckle.');
    await page.click('#send');
    await waitForIntakeSettled();
    assert(await page.locator('[data-safety="clear"]').count());
  });

  await scenario('generic-cut-continues-with-skin-protection', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. Yesterday I cut my wrist.', async () => {
    const safety = await safetyText();
    assertSafetyAcknowledgement(safety);
    assert(safety.includes('minor scrape does not automatically require medical care'));
    assert(!safety.includes('Self-care should pause here'));
  });

  await scenario('cut-short-idiom-is-not-a-wound', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I cut my wrist exercises short because they hurt.', async () => {
    const safety = await safetyText();
    assertSafetyAcknowledgement(safety);
    assert(!safety.includes('minor scrape does not automatically require medical care'));
  });

  await scenario('connected-problems-keep-symptoms-scoped', 'My right wrist tingles but my left knee hurts.', async () => {
    const prompt = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(!prompt.includes('Which fingers or part of the hand feel numb or tingly?'));
  });

  await scenario('posterior-wrist-location-stays-on-hand-thread', 'My right hand hurts for four weeks. It built up gradually and typing makes it worse.', async () => {
    await page.fill('#reply', 'It is on the back of my wrist near the thumb.');
    await page.click('#send');
    await waitForIntakeSettled();
    assert(await page.locator('[data-safety="clear"]').count());
    const summary = await page.evaluate(() => window.KeneflexParticipant.model.story.order.map(key => window.KeneflexParticipant.model.story.threads[key].family));
    assert.deepEqual(summary, ['hand']);
  });

  await scenario('posterior-location-variant-stays-on-hand-thread', 'My right hand hurts for four weeks. It built up gradually and typing makes it worse.', async () => {
    await page.fill('#reply', 'It is on the back side of my wrist near the thumb.');
    await page.click('#send');
    await waitForIntakeSettled();
    assert(await page.locator('[data-safety="clear"]').count());
    const families = await page.evaluate(() => window.KeneflexParticipant.model.story.order.map(key => window.KeneflexParticipant.model.story.threads[key].family));
    assert.deepEqual(families, ['hand']);
  });

  await scenario('generic-location-with-uncertainty-stays-unresolved', 'My right hand hurts for four weeks. It built up gradually and typing makes it worse.', async () => {
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

  await scenario('and-clause-positive-symptom-is-not-negated', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I have no numbness and it is rapidly swelling.', async () => {
    const safety = await safetyText();
    assertSafetyAcknowledgement(safety);
  });

  await scenario('thumb-wrap-is-owned-support', 'My right wrist and thumb hurt at the base of my thumb for four weeks. It built up gradually and gripping makes it worse. My thumb wrap fits well, is clean and in good condition, still works, and covers both wrist and thumb.', async () => {
    await clearSafetyAndMeasure();
    assert.equal(await page.locator('#supportState').innerText(), 'Recommended');
    assert.equal(await page.locator('#total').innerText(), '$40.99');
  });

  await scenario('location-help-does-not-create-back-problem', 'My right hand hurts for four weeks. It built up gradually and typing makes it worse.', async () => {
    await page.fill('#reply', "I don't know.");
    await page.click('#send');
    await waitForIntakeSettled();
    const help = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(help.includes('top of the wrist'));
    assert(!help.includes('back of the wrist'));
    await page.fill('#reply', 'The top of my wrist near the thumb.');
    await page.click('#send');
    await waitForIntakeSettled();
    assert(await page.locator('[data-safety="clear"]').count());
    const body = await page.locator('body').innerText();
    assert(!body.includes('different problem area'));
  });

  await scenario('fall-denial-does-not-clear-twist-injury', 'My right wrist hurts for four weeks after a sudden twist without a fall. Typing makes it worse.', async () => {
    const safety = await safetyText();
    assertSafetyAcknowledgement(safety);
  });

  await scenario('burn-denial-does-not-clear-open-wound', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I have no burn.', async () => {
    const safety = await safetyText();
    assertSafetyAcknowledgement(safety);
  });

  await scenario('multi-region-symptoms-stay-with-source-thread', 'My right wrist tingles. My left knee hurts.', async () => {
    const prompt = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(!prompt.includes('Which fingers or part of the hand feel numb or tingly?'));
  });

  await scenario('later-same-clause-symptom-wins', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I had no swelling but now the swelling is rapidly increasing.', async () => {
    const safety = await safetyText();
    assertSafetyAcknowledgement(safety);
  });

  await scenario('gel-cold-pack-is-not-topical', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I have a gel cold pack that works well.', async () => {
    await clearSafetyAndMeasure();
    assert.equal(await content('#coldState'), 'Selected add-on');
    assert.equal(await content('#topicalState'), 'Optional add-on');
    assert.equal(await page.locator('#total').innerText(), '$45.99');
  });

  await scenario('uncertain-numbness-remains-in-safety-check', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I am not sure whether my fingers are numb.', async () => {
    const safety = await safetyText();
    assertSafetyAcknowledgement(safety);
  });

  await scenario('wound-dressing-does-not-deny-cut', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I have no wound dressing on the cut.', async () => {
    const safety = await safetyText();
    assertSafetyAcknowledgement(safety);
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
    await page.locator('details.moreDetails > summary').click();
    await page.getByText('Customize this purchase', { exact: true }).click();
    await page.click('[data-tune="support"]');
    assert.equal(await page.locator('#supportState').innerText(), 'Removed by you');
    assert.equal(await page.locator('#total').innerText(), '$32.99');
    let rationale = await content('.selectionReasonBody');
    assert(!rationale.includes('Neo G Airflow Wrist & Thumb Support'));
    assert(rationale.includes('Polar Soft Ice Wrist Wrap'));
    assert(rationale.includes('Biofreeze Pain Relief Gel'));
    await page.click('#resetTune');
    await page.click('[data-plan="complete"]');
    await page.click('[data-tune="cold"]');
    assert.equal(await page.locator('#coldState').innerText(), 'Removed by you');
    assert.equal(await page.locator('#total').innerText(), '$36.98');
    rationale = await content('.selectionReasonBody');
    assert(rationale.includes('BraceAbility Volar Wrist Splint'));
    assert(!rationale.includes('Polar Soft Ice Wrist Wrap'));
    assert(rationale.includes('Biofreeze Pain Relief Gel'));
  });


  await scenario('postnominal-cut-denial-does-not-stop-intake', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I have no cut on my left wrist.', async () => {
    const safety = await safetyText();
    assert(!safety.includes('Self-care should pause here'));
    assertSafetyAcknowledgement(safety);
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
    assert(!(await page.locator('#conversation .bubble.ai').last().innerText()).includes('Self-care should pause here'));
    assert.equal(await page.locator('[data-safety="clear"]').count(), 1);
    await page.click('[data-safety="clear"]');
    await page.waitForSelector('#solutionView:not(.hidden)');
    if (await page.locator('#fitMeasure').count()) {
      await page.click('.fitDetails summary');
      await page.fill('#fitMeasure', '7');
      await page.click('#fitMeasureContinue');
    }
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
    assert.equal(await page.locator('#solutionView:not(.hidden)').count(), 0);
  });

  await scenario('reported-misshapen-area-pauses-self-care', 'My right wrist hurts after a fall yesterday and the area looks misshapen. Gripping makes it worse.', async () => {
    const message = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(message.includes('Self-care should pause here'));
    assert.equal(await page.locator('#solutionView:not(.hidden)').count(), 0);
  });

  await scenario('reported-odd-angle-pauses-self-care', 'My right wrist hurts after a fall yesterday and it appears to be at an odd angle. Gripping makes it worse.', async () => {
    const message = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(message.includes('Self-care should pause here'));
    assert.equal(await page.locator('#solutionView:not(.hidden)').count(), 0);
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
    await page.waitForSelector('#solutionView:not(.hidden)');
    if (await page.locator('#fitMeasure').count()) {
      await page.click('.fitDetails summary');
      await page.fill('#fitMeasure', '7');
      await page.click('#fitMeasureContinue');
    }
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
    const safety = await safetyText();
    assert(safety.includes('minor scrape does not automatically require medical care'));
    assert(safety.includes('unprotected broken skin'));
    assert(!safety.includes('Self-care should pause here'));
  });

  await scenario('persistent-bleeding-cut-pauses-self-care', 'My right wrist hurts after a fall. I have a small cut that keeps bleeding despite pressure.', async () => {
    const message = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(message.includes('Self-care should pause here'));
    assert(message.includes('may need professional evaluation'));
  });

  await scenario('wrist-only-stiffness-selects-heat', 'I already know I want a wrist brace. My left wrist is stiff and hurts in the morning. It has been present for four weeks, built up gradually, and typing makes it worse. Heat helps.', async () => {
    await finishIntakeAndMeasure('7.0', { preciseLocation: 'It is centered on the palm side of my left wrist.' });
    assert((await content('#supportItem .planName')).includes('BraceAbility Volar Wrist Splint'));
    assert((await content('#supportItem .planName')).includes('Adjustable'));
    assert((await content('#coldItem .planName')).includes('Moist Heat'));
    assert.equal(await content('#planName'), 'Support + recovery');
    assert.equal(await content('#total'), '$46.99');
  });

  await scenario('patch-preference-selects-complete', 'My right wrist and thumb are sore at the base of my thumb for four weeks. It built up gradually, and golf, gripping, and twisting make it worse. I want a brace and prefer a pain patch instead of cream.', async () => {
    await finishIntakeAndMeasure('7.0', { trigger: 'Golf, gripping, and twisting make it worse.' });
    assert((await content('#topicalItem .planName')).includes('Biofreeze Pain Relief Patch'));
    assert.equal(await content('#planName'), 'Add comfort relief');
    assert.equal(await page.locator('[data-plan="complete"]').getAttribute('aria-pressed'), 'true');
    assert.equal(await content('#total'), '$53.98');
  });

  await scenario('known-want-support-only-selects-essential', 'I only want help choosing a wrist support. My right wrist has hurt for four weeks. It built up gradually, and typing makes it worse.', async () => {
    await finishIntakeAndMeasure('7.0', { preciseLocation: 'It is centered on the palm side of my right wrist.', symptom: 'My wrist aches with use, but my thumb does not hurt.' });
    assert((await content('#supportItem .planName')).includes('BraceAbility Volar Wrist Splint'));
    assert.equal(await content('#planName'), 'Support only');
    assert.equal(await page.locator('[data-plan="core"]').getAttribute('aria-pressed'), 'true');
    assert.equal(await content('#total'), '$24.99');
  });

  await scenario('minor-scrape-disables-comfort-tier', 'My right wrist and thumb are sore at the base of my thumb after tennis for four weeks. It built up gradually. I have a small superficial scrape on my wrist; the bleeding stopped and I washed and covered it. There was no fall or direct injury, numbness, swelling, weakness, or deformity.', async () => {
    await finishIntakeAndMeasure('7.0', { trigger: 'Tennis and gripping make it worse.' });
    assert.equal(await page.locator('[data-plan="complete"]').isDisabled(), true);
    assert.equal(await content('#topicalState'), 'Not available for this story');
    await page.click('[data-plan="core"]');
    await page.click('[data-plan="recovery"]');
    assert.equal(await content('#topicalState'), 'Not available for this story');
    assert.equal(await page.evaluate(() => window.KeneflexParticipant.model.cart.topical.disposition), 'REMOVE');
    assert.equal(await content('#planName'), 'Support + recovery');
  });

  await scenario('adjustable-wrist-support-skips-sizing', 'My right wrist hurts for four weeks. My thumb is fine. It built up gradually, and typing makes it worse.', async () => {
    if (await page.locator('[data-safety="clear"]').count()) await page.click('[data-safety="clear"]');
    await page.waitForSelector('#solutionView:not(.hidden)');
    assert((await content('#supportItem .planName')).includes('BraceAbility Volar Wrist Splint'));
    assert.equal(await page.locator('#fitMeasure').count(), 0);
    assert((await content('.fitChooser')).includes('One adjustable adult size'));
    assert((await content('.fitChooser')).includes('You can continue without measuring'));
    assert((await content('.fitChooser')).includes('9.5 inches'));
    assert((await page.locator('#supportItem img').getAttribute('src')).includes('braceability.com'));
    assert.equal(await page.locator('.kfxBuy').isDisabled(), false);
  });

  await page.route('**/api/interpret-story', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ interpretation: {
      problems: [{
        family: 'hand', side: 'right', areas: ['wrist'], locations: [], symptoms: ['stiffness'],
        negatives: ['pain', 'numbness', 'tingling', 'swelling', 'redness', 'warmth', 'wound', 'weakness'],
        qualities: ['stiff'], triggers: ['typing'], patterns: ['morning'], relievers: [], functionEffects: [], sensory: [],
        onset: 'gradual', duration: { value: 4, unit: 'week', raw: 'about four weeks' }, provider: []
      }],
      clarifications: [], missingDecisionFacts: []
    } })
  }));
  await scenario('ai-cannot-invent-safety-negatives', 'My right wrist is stiff in the morning and typing makes it worse. I want help choosing a wrist brace. It built up gradually for about four weeks.', async () => {
    const safety = await safetyText();
    assertSafetyAcknowledgement(safety);
  });
  await page.unroute('**/api/interpret-story');

  await browser.close();
  console.log(JSON.stringify({ scenarios: scenarioCount, failures }, null, 2));
  if (failures.length) process.exit(1);
})();
