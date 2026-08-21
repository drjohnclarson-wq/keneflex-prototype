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

  await scenario('combination-warning', 'My right wrist hurts for 4 weeks. It built up gradually and typing makes it worse.', async () => {
    await clearSafetyAndMeasure();
    await page.click('.kfxBuy');
    const warning = await page.locator('.kfxSafetyNotice').innerText();
    assert(warning.includes('Do not wear the support over Biofreeze'));
    assert(warning.includes('clean, dry skin'));
  });

  await browser.close();
  console.log(JSON.stringify({ scenarios: 12, failures }, null, 2));
  if (failures.length) process.exit(1);
})();
