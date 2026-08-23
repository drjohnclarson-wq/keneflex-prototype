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
    assert(await page.locator('.kfxBuy').isDisabled());
    assert((await page.locator('#supportState').innerText()).includes('review'));
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
    assert(solution.includes('already inadequate'));
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
    assert.equal(await page.locator('#coldState').innerText(), 'Use yours');
    assert.equal(await page.locator('#total').innerText(), '$31.98');
  });

  await scenario('wrist-only-brace-cannot-cover-combined-role', 'My right wrist and thumb hurt at the base of my thumb for four weeks. It built up gradually and gripping makes it worse. My wrist brace is in good condition and fits well.', async () => {
    await clearSafetyAndMeasure();
    assert(await page.locator('.kfxBuy').isDisabled());
    assert((await page.locator('#supportState').innerText()).includes('review'));
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
    assert.equal(await page.locator('#coldState').innerText(), 'Use yours');
    assert.equal(await page.locator('#total').innerText(), '$31.98');
  });

  await scenario('later-swelling-overrides-earlier-denial', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. There was no swelling yesterday. Today it is rapidly swelling.', async () => {
    const safety = await page.locator('#conversation .bubble.ai').last().innerText();
    assert(safety.includes('rapidly increasing swelling'));
  });

  await scenario('owned-cold-explanation-matches-plan', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. I have a cold pack that works well.', async () => {
    await clearSafetyAndMeasure();
    assert.equal(await page.locator('#coldState').innerText(), 'Use yours');
    const explanation = await page.locator('#whyRows').innerText();
    assert(explanation.includes('cold pack appears usable'));
    assert(explanation.includes('plan uses yours'));
  });

  await scenario('conflicting-owned-condition-requires-review', 'My right wrist hurts for four weeks. It built up gradually and typing makes it worse. My old wrist brace fits well and still works.', async () => {
    await clearSafetyAndMeasure();
    assert.equal(await page.locator('#supportState').innerText(), 'Needs review before buying');
    assert(await page.locator('.kfxBuy').isDisabled());
  });

  await browser.close();
  console.log(JSON.stringify({ scenarios: 28, failures }, null, 2));
  if (failures.length) process.exit(1);
})();
