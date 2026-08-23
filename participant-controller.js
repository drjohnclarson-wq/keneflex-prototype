/* Keneflex participant runtime 0.6.5
   One owner for intake, recommendation presentation, plan adjustments, cart, and plan pages. */
(function (root) {
  'use strict';

  const Engine = root.KFX046;
  if (!Engine) throw new Error('Keneflex story engine failed to load.');

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const money = value => '$' + Number(value || 0).toFixed(2);
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const PRODUCTS = Object.freeze({
    support: { id: 'support', name: 'Neo G Airflow Wrist & Thumb Support', price: 19.99 },
    cold: { id: 'cold', name: 'Polar Soft Ice Wrist Wrap', price: 21.00 },
    topical: { id: 'topical', name: 'Biofreeze Pain Relief Gel, menthol 4%', price: 11.99 }
  });

  const model = {
    release: '0.6.5',
    story: Engine.createStore(),
    opening: '',
    stage: 'intro',
    answers: [],
    safetyCleared: false,
    recommendation: null,
    fit: { wristInches: null, supportSize: null, supportSku: null },
    cart: {
      support: { disposition: 'BUY' },
      cold: { disposition: 'BUY' },
      topical: { disposition: 'BUY' }
    }
  };

  function activeProblem() { return Engine.activeThread(model.story); }
  function storyThreads() { return model.story.order.map(key => model.story.threads[key]).filter(Boolean); }
  function threadKey(thread) { return model.story.order.find(key => model.story.threads[key] === thread); }
  function hasUnsupportedRegion() { return storyThreads().some(thread => thread.family !== 'hand'); }
  function productLine(id) {
    const product = PRODUCTS[id];
    const disposition = model.cart[id].disposition;
    const name = id === 'support' && model.fit.supportSize ? product.name + ' — ' + model.fit.supportSize : product.name;
    return { ...product, name, sku: id === 'support' ? model.fit.supportSku : null, disposition, charged: disposition === 'BUY' ? product.price : 0 };
  }
  function lines() { return Object.keys(PRODUCTS).map(productLine); }
  function total() { return lines().reduce((sum, line) => sum + line.charged, 0); }
  function paidLines() { return lines().filter(line => line.disposition === 'BUY'); }

  function showStage(stage) {
    model.stage = stage;
    $('#intro').classList.toggle('hidden', stage !== 'intro');
    $('#chatView').classList.toggle('hidden', stage !== 'chat');
    $('#solutionView').classList.toggle('hidden', stage !== 'solution');
    window.scrollTo(0, 0);
  }

  function addBubble(kind, text, html = false) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble ' + kind;
    if (html) bubble.innerHTML = '<b>Keneflex</b>' + text;
    else bubble.textContent = text;
    $('#conversation').appendChild(bubble);
  }

  function composer(question) {
    const interaction = $('#interaction');
    interaction.innerHTML = '<textarea id="reply" aria-label="Your answer" placeholder="Answer in your own words."></textarea><div class="row"><button id="send" class="primary">Continue →</button></div>';
    const submit = () => {
      const value = $('#reply').value.trim();
      if (!value) return;
      addBubble('user', value);
      model.answers.push(value);
      const locationUncertain = /\b(?:i\s+)?(?:do not|don't|cannot|can't)\s+(?:know|tell|locate)|\b(?:i\s+)?(?:have\s+)?no idea\b|\bnot sure\b|\bunsure\b/i.test(value);
      const hasLocationDetail = /\b(?:palm|top|back|thumb|knuckle|crease|side|base|joint|finger|wrist|hand|inside|outside|near|below|above)\b/i.test(value);
      if (question.concept === 'preciseLocation' && locationUncertain && !hasLocationDetail) {
        interaction.innerHTML = '';
        addBubble('ai', '<p>That is okay. Please describe the closest area you can identify—for example, the palm side, top of the wrist, thumb knuckle, or another spot you can point to.</p>', true);
        composer(question);
        return;
      }
      Engine.ingest(model.story, value);
      if (question.concept === 'preciseLocation') {
        const thread = activeProblem();
        if (thread && !Engine.known(thread, 'preciseLocation')) thread.locations.push(value);
      }
      interaction.innerHTML = '';
      advance();
    };
    $('#send').addEventListener('click', submit);
    $('#reply').addEventListener('keydown', event => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') submit();
    });
    $('#reply').focus();
    $('#prog').style.width = Math.min(82, 24 + model.answers.length * 10) + '%';
    interaction.dataset.concept = question.concept;
  }

  function regionalMessage(thread) {
    if (!thread) return '';
    const region = thread.family === 'hand' ? 'hand, wrist, or thumb' : thread.family;
    return 'I understand this as a ' + region + ' concern. I’ll keep the investigation specific to that area.';
  }

  function advance() {
    let thread = activeProblem();
    if (latestOpenWoundStatus() === 'reported') {
      addBubble('ai', '<p><b>Self-care should pause here.</b></p><p>You reported an open wound or cut. That can change what is safe, so seek an appropriate in-person medical evaluation before choosing a support or continuing this plan.</p>', true);
      $('#interaction').innerHTML = '';
      return;
    }
    if (Engine.adequate(model.story)) {
      if (!thread || hasUnsupportedRegion()) {
        addBubble('ai', '<p><b>I have enough of the story to understand the concern.</b></p><p>This participant build currently completes product recommendations only for the hand, wrist, and thumb pathway. I will not substitute a hand product for a ' + (thread?.family || 'different') + ' problem.</p>', true);
        $('#interaction').innerHTML = '';
        return;
      }
      safetyGate();
      return;
    }
    let question = Engine.nextQuestion(model.story);
    if (!question) {
      const unresolved = storyThreads().find(candidate => !Engine.threadAdequate(candidate));
      if (unresolved) {
        model.story.active = threadKey(unresolved);
        thread = unresolved;
        question = Engine.nextQuestion(model.story);
      }
    }
    if (!question) return advance();
    addBubble('ai', '<p>' + regionalMessage(thread) + '</p><p><b>' + question.text + '</b></p>', true);
    composer(question);
  }

  function safetyGate() {
    if (model.safetyCleared) return revealRecommendation();
    const interaction = $('#interaction');
    const thread = activeProblem();
    const negative = new Set(thread?.negatives || []);
    const unresolved = [];
    const injuryDenied = latestInjuryStatus() === 'denied';
    if (!injuryDenied) unresolved.push('a major recent injury');
    if (latestOpenWoundStatus() !== 'denied') unresolved.push('an open wound');
    if (!negative.has('swelling')) unresolved.push('rapidly increasing swelling');
    if (!negative.has('numbness')) unresolved.push('loss of feeling');
    if (!negative.has('weakness')) unresolved.push('marked new weakness');
    // Deformity is intentionally separate from the ordinary symptom parser.
    unresolved.splice(Math.min(1, unresolved.length), 0, 'visible deformity');
    const list = unresolved.length === 1
      ? unresolved[0]
      : unresolved.slice(0, -1).join(', ') + ', or ' + unresolved[unresolved.length - 1];
    addBubble('ai', '<p><b>One safety check before I build the plan:</b> have you noticed ' + escapeHtml(list) + '?</p>', true);
    interaction.innerHTML = '<div class="options"><button class="opt" data-safety="clear">No</button><button class="opt" data-safety="stop">Yes / I am not sure</button></div>';
    $$('[data-safety]', interaction).forEach(button => button.addEventListener('click', () => {
      addBubble('user', button.textContent.trim());
      interaction.innerHTML = '';
      if (button.dataset.safety === 'stop') {
        addBubble('ai', '<p><b>Self-care should pause here.</b></p><p>Those details can change what is safe. Seek an appropriate in-person medical evaluation before choosing a support or continuing this plan.</p>', true);
        return;
      }
      model.safetyCleared = true;
      fitGate();
    }));
  }

  function latestInjuryStatus() {
    let status = 'unknown';
    const denied = /\bno\s+fall\s+(?:or|and)\s+(?:direct injury|injury|trauma)\b|\b(?:no|without)\s+(?:(?:a|any)\s+)?(?:major (?:recent )?injury|direct injury|injury|trauma)\b|\b(?:have not|haven't)\s+had\s+(?:(?:a|any)\s+)?(?:major (?:recent )?injury|direct injury|injury|trauma)\b|\b(?:did not|didn't)\s+have\s+(?:(?:a|any)\s+)?(?:major (?:recent )?injury|direct injury|injury|trauma)\b/i;
    const reported = /\b(?:fell|had\s+(?:(?:a|the)\s+)?(?:major (?:recent )?injury|direct injury|injury|trauma)|(?:after|following)\s+(?:(?:a|the)\s+)?(?:fall|injury|trauma|(?:sudden )?twist|hit|accident)|sudden twist)\b/i;
    model.story.events.forEach(event => String(event.text || '').split(/[.!?;]/).forEach(clause => {
      const evidence = [];
      const collect = (rx, value) => {
        const global = new RegExp(rx.source, 'ig');
        let match;
        while ((match = global.exec(clause))) evidence.push({ index: match.index, value });
      };
      collect(denied, 'denied');
      collect(reported, 'reported');
      evidence.sort((a, b) => a.index - b.index).forEach(item => { status = item.value; });
    }));
    return status;
  }

  function latestOpenWoundStatus() {
    const activeReports = new Set();
    let deniedSeen = false;
    const cutObject = '(?:(?:on|over|across)\\s+)?(?:(?:my|the|a|an|both|one|two|three|four|five|six|seven|eight|nine|ten|several|multiple|many|\\d+)\\s+|both\\s+of\\s+my\\s+)?(?:(?:left|right)\\s+)?(?:skin|hands?|wrists?|thumbs?|fingers?)';
    const denied = new RegExp('\\b(?:no|without)\\s+(?:(?:a|an|any)\\s+)?(?:open wound(?!\\s+(?:pain|soreness|drainage|care|dressing|cover|bandage))|wound\\b(?!\\s+(?:pain|soreness|drainage|care|dressing|cover|bandage))|open skin(?!\\s+(?:pain|soreness|drainage|care|dressing|cover|bandage))|(?:open )?cut)\\b|\\b(?:do not|don\'t|have not|haven\'t)\\s+have\\s+(?:(?:a|an|any)\\s+)?(?:open wound|wound\\b(?!\\s+(?:dressing|care|cover|bandage))|open skin|(?:open )?cut)\\b|\\b(?:did not|didn\'t|do not|don\'t|have not|haven\'t|never)\\s+cut\\s+' + cutObject, 'i');
    const reported = new RegExp('\\b(?:open wound|open skin|skin is open|(?:(?:a|an|my|open|deep|small|large|fresh|bleeding)\\s+cut)|(?:(?:left|right)\\s+)?(?:hand|wrist|thumb|finger)\\s+cut|cut\\s+' + cutObject + ')\\b', 'i');
    const evidenceKey = item => {
      const body = String(item.text || '').match(/\b(skin|hands?|wrists?|thumbs?|fingers?)\b/i)?.[1]?.toLowerCase();
      const side = String(item.text || '').match(/\b(left|right)\b/i)?.[1]?.toLowerCase();
      return (side ? side + ':' : '') + (body ? body.replace(/s$/, '') : 'unspecified');
    };
    const evidenceSegment = (clause, index) => {
      const before = clause.slice(0, index);
      const boundaries = [...before.matchAll(/,|\b(?:but|however|although|yet|and\s+(?:later|then))\b/ig)];
      const startMatch = boundaries[boundaries.length - 1];
      const start = startMatch ? (startMatch.index || 0) + startMatch[0].length : 0;
      const rest = clause.slice(index);
      const endMatch = rest.match(/,|\b(?:but|however|although|yet|and\s+(?:later|then))\b/i);
      const end = endMatch ? index + (endMatch.index || 0) : clause.length;
      return clause.slice(start, end);
    };
    model.story.events.forEach(event => String(event.text || '').split(/[.!?;]/).forEach(clause => {
      const evidence = [];
      const deniedSpans = [];
      const collect = (rx, value) => {
        const global = new RegExp(rx.source, 'ig');
        let match;
        while ((match = global.exec(clause))) {
          const item = { index: match.index, end: match.index + match[0].length, value, text: match[0], segment: evidenceSegment(clause, match.index) };
          const cutShort = /\bcut\b[^.!?;]{0,120}\bshort\b/i.test(item.segment);
          if (value === 'reported' && (deniedSpans.some(span => item.index >= span.index && item.end <= span.end) || cutShort && /^cut\b/i.test(item.text))) continue;
          evidence.push(item);
          if (value === 'denied') deniedSpans.push(item);
        }
      };
      collect(denied, 'denied');
      collect(reported, 'reported');
      evidence.sort((a, b) => a.index - b.index).forEach(item => {
        const key = evidenceKey(item);
        const nextReport = evidence.find(candidate => candidate.value === 'reported' && candidate.index > item.index);
        const following = clause.slice(item.end, nextReport ? nextReport.index : clause.length);
        const resolved = /^\s*(?:(?:has|is|was)\s+)?(?:fully\s+)?(?:healed|closed|resolved|no longer open)\b/i.test(following) || /(?:,|\bbut\b)\s*it\s+(?:healed|closed|resolved|is\s+no\s+longer\s+open)\b/i.test(following);
        if (item.value === 'reported' && !resolved) activeReports.add(key);
        if (item.value === 'reported' && resolved) deniedSeen = true;
        if (item.value === 'denied') {
          deniedSeen = true;
          activeReports.delete(key);
        }
      });
    }));
    return activeReports.size ? 'reported' : deniedSeen ? 'denied' : 'unknown';
  }

  function fitGate() {
    const interaction = $('#interaction');
    addBubble('ai', '<p><b>One fit detail before I select a support:</b> measure around your wrist at the wrist crease. What is the circumference in inches?</p>', true);
    interaction.innerHTML = '<input id="wristMeasure" inputmode="decimal" aria-label="Wrist circumference in inches" placeholder="For example, 7.0"><div class="row"><button id="fitContinue" class="primary">Continue →</button></div><p id="fitError" class="micro"></p>';
    $('#fitContinue').addEventListener('click', () => {
      const value = Number(String($('#wristMeasure').value).replace(/[^0-9.]/g, ''));
      if (!Number.isFinite(value) || value < 4 || value > 12) {
        $('#fitError').textContent = 'Enter a wrist measurement between 4 and 12 inches.';
        return;
      }
      model.fit.wristInches = value;
      if (value >= 6.3 && value <= 7.5) {
        model.fit.supportSize = 'Medium';
        model.fit.supportSku = 'NEOG-AIRFLOW-WT-M';
      }
      addBubble('user', value.toFixed(1) + ' inches');
      interaction.innerHTML = '';
      revealRecommendation();
    });
  }

  function recommendationFor(thread) {
    const neuro = thread.symptoms.some(value => value === 'numbness' || value === 'tingling');
    const locations = thread.locations.join(', ') || thread.areas.join(', ') || 'hand/wrist area';
    const provider = (thread.provider || []).join(' ');
    const activities = (thread.triggers || []).join(', ');
    const combinedArea = (thread.areas || []).includes('wrist') && (thread.areas || []).includes('thumb');
    const supportReason = combinedArea
      ? 'Because your symptoms involve both the wrist and thumb' + (activities ? ' and are aggravated by ' + activities : '') + ', a flexible combined support covers the required areas without jumping to a rigid immobilizer.'
      : 'The flexible support matches the area and activity pattern you described without jumping to a rigid immobilizer.';
    return {
      region: thread.family,
      neuro,
      locations,
      provider,
      eligible: !neuro,
      supportReason: neuro
        ? 'The altered-feeling pattern needs a separate positioning and nerve-safety requirement. A combined wrist/thumb support is not automatically eligible simply because it covers both areas.'
        : supportReason,
      lead: neuro
        ? 'Keneflex found an altered-feeling pattern as well as pain. The plan must satisfy both requirements before a support can be treated as selected.'
        : 'A conservative plan built around the location, activity pattern, and safety information you provided.'
    };
  }

  function revealRecommendation() {
    const thread = activeProblem();
    model.recommendation = recommendationFor(thread);
    if (!model.recommendation.eligible || !model.fit.supportSku || model.recommendation.provider) model.cart.support.disposition = 'REVIEW';
    renderSolution();
    showStage('solution');
  }

  function statusText(disposition) {
    return { BUY: 'Recommended', REMOVE: 'Removed by you', REVIEW: 'Needs review before buying' }[disposition];
  }

  function renderLine(id) {
    const line = productLine(id);
    const item = $('#' + id + 'Item');
    item.classList.toggle('removed', line.disposition === 'REMOVE');
    item.classList.toggle('kept', line.disposition === 'REVIEW');
    const state = $('#' + id + 'State');
    state.textContent = statusText(line.disposition);
    state.className = 'planState ' + (line.disposition === 'BUY' ? 'buy' : line.disposition === 'REMOVE' ? 'remove' : 'keep');
    $('#' + id + 'Price').textContent = line.disposition === 'BUY' ? money(line.price) : '$0';
    if (id === 'support') {
      $('.planName', item).textContent = line.name;
      if (!model.fit.supportSku) $('.planCopy', item).textContent = 'The available support size is not verified for your measurement, so this item remains under review and cannot be purchased yet.';
    }
  }

  function renderSolution() {
    const rec = model.recommendation;
    $('#solutionLead').textContent = rec.lead;
    $('#confidenceCopy').textContent = rec.neuro
      ? 'A product should not be treated as selected until it satisfies the altered-feeling pattern as well as the pain and activity requirements.'
      : 'You have not described the warning signs that would stop this conservative pathway, and the current product role matches the story you provided.';
    $('#supportItem .planCopy').textContent = rec.supportReason;
    const why = $('#whyRows');
    why.innerHTML = [
      ['Location carried forward', rec.locations],
      ['Pattern considered', rec.neuro ? 'Pain plus altered feeling' : 'Use-related pain without an identified altered-feeling pattern'],
      ['What changed the product decision', rec.supportReason],
      ...(rec.provider ? [['Provider direction protected', rec.provider + ' Keneflex will not recommend a conflicting use pattern.']] : [])
    ].map(([title, copy]) => '<div class="why"><b>' + escapeHtml(title) + '</b><span>' + escapeHtml(copy) + '</span></div>').join('');
    Object.keys(PRODUCTS).forEach(renderLine);
    $('#total').textContent = money(total());
    ensureCommerceControls();
  }

  function setDisposition(id, disposition, message) {
    model.cart[id].disposition = disposition;
    $('#tuneResult').classList.remove('hidden');
    $('#tuneResult').innerHTML = message;
    $('#resetTune').classList.remove('hidden');
    renderSolution();
  }

  function adjust(kind) {
    if (PRODUCTS[kind]) return setDisposition(kind, 'REMOVE', '<b>' + escapeHtml(PRODUCTS[kind].name) + ' removed.</b> Keneflex still recommends it, but it will not be included in your purchase.');
  }

  function resetAdjustments() {
    model.cart.support.disposition = model.recommendation?.eligible && model.fit.supportSku && !model.recommendation?.provider ? 'BUY' : 'REVIEW';
    model.cart.cold.disposition = 'BUY';
    model.cart.topical.disposition = 'BUY';
    $('#tuneResult').classList.add('hidden');
    $('#resetTune').classList.add('hidden');
    renderSolution();
  }

  function ensureCommerceControls() {
    const totalBlock = $('#total').closest('.block');
    let buy = $('.kfxBuy', totalBlock);
    if (!buy) {
      buy = document.createElement('button');
      buy.className = 'primary kfxBuy';
      buy.addEventListener('click', checkout);
      totalBlock.appendChild(buy);
    }
    const hasReview = lines().some(line => line.disposition === 'REVIEW');
    buy.disabled = paidLines().length === 0 || hasReview;
    buy.textContent = hasReview
      ? 'Review needed before checkout'
      : 'Buy selected items — ' + money(total());
    $('#cartPreviewBtn')?.closest('.cartPreview')?.classList.add('hidden');
    let plan = $('#kfxPlanBtn');
    if (!plan) {
      plan = document.createElement('button');
      plan.id = 'kfxPlanBtn';
      plan.className = 'primary kfxPlanBtn';
      plan.textContent = 'View my Keneflex plan →';
      plan.addEventListener('click', openPlan);
      totalBlock.appendChild(plan);
    }
  }

  function checkout() {
    $('.kfxCheckoutOverlay')?.remove();
    const selected = paidLines();
    const overlay = document.createElement('div');
    overlay.className = 'kfxCheckoutOverlay';
    const combinationWarning = model.cart.support.disposition === 'BUY' && model.cart.topical.disposition === 'BUY'
      ? '<div class="kfxSafetyNotice"><b>Use separately.</b> Do not wear the support over Biofreeze, gels, or creams. Apply topical products only as directed, and put the support on clean, dry skin.</div>'
      : '';
    overlay.innerHTML = '<section class="kfxCheckout" role="dialog" aria-modal="true"><h2>Review your selected products</h2>' + combinationWarning + '<div>' +
      selected.map(line => '<div class="rowx"><span>' + line.name + '</span><b>' + money(line.price) + '</b></div>').join('') +
      '</div><div class="totalx"><span>Total</span><span>' + money(total()) + '</span></div><div class="actions"><button class="primary" data-checkout-complete>Continue →</button><button class="secondary" data-checkout-close>Go back</button></div><p class="micro">This test will not place an order or charge you.</p></section>';
    document.body.appendChild(overlay);
    $('[data-checkout-close]', overlay).addEventListener('click', () => overlay.remove());
    $('[data-checkout-complete]', overlay).addEventListener('click', () => {
      $('.kfxCheckout', overlay).innerHTML = '<h2>Purchase choice recorded.</h2><p>No order was placed and you were not charged.</p><button class="secondary" data-checkout-close>Return to my plan</button>';
      $('[data-checkout-close]', overlay).addEventListener('click', () => overlay.remove());
    });
  }

  function openPlan() {
    const thread = activeProblem();
    const win = window.open('', '_blank');
    if (!win) return;
    const selected = lines().filter(line => line.disposition !== 'REMOVE');
    win.document.write('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your Keneflex Plan</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f7f4ee;color:#173f3b;margin:0}.wrap{max-width:820px;margin:auto;padding:18px}.hero,.card{border-radius:22px;padding:22px}.hero{background:#174b46;color:white}.card{background:white;margin-top:14px;border:1px solid #d9e1dc}.line{display:flex;justify-content:space-between;gap:15px;padding:12px 0;border-bottom:1px solid #e2e7e4}.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.step{background:#f2f6f2;padding:13px;border-radius:14px}@media(max-width:650px){.steps{grid-template-columns:1fr}}</style></head><body><main class="wrap"><section class="hero"><h1>Your Keneflex Plan</h1><p>Built from your ' + escapeHtml(thread.family) + ' story. Location: ' + escapeHtml(model.recommendation.locations || 'as described') + '.</p></section><section class="card"><h2>Products and items</h2>' + selected.map(line => '<div class="line"><span>' + escapeHtml(line.name) + '<br><small>' + escapeHtml(statusText(line.disposition)) + '</small></span><b>' + (line.disposition === 'BUY' ? money(line.price) : '$0') + '</b></div>').join('') + '</section><section class="card"><h2>What to do</h2><div class="steps"><div class="step"><b>Reduce repeated aggravation</b><p>Break up or reduce the activity that consistently increases symptoms.</p></div><div class="step"><b>Keep motion comfortable</b><p>Do not force painful end ranges or continue movements that increase altered feeling.</p></div><div class="step"><b>Watch the trend</b><p>Track function, soreness, numbness, tingling, swelling, and activity tolerance.</p></div></div></section><section class="card"><h2>When the plan changes</h2><p>Stop self-care and seek appropriate evaluation for meaningful new weakness, loss of feeling, major swelling, deformity, an open wound, or significant worsening.</p></section></main></body></html>');
    win.document.close();
  }

  function modal(key) {
    const content = {
      how: '<h2>How Keneflex works</h2><p>Tell the story in your own words. Keneflex carries known facts forward, investigates what could change the decision, checks safety, and builds one plan.</p>',
      approach: '<h2>Our approach</h2><p>Product fit, function, safety, limitations, and reasonable non-product options come before a purchase.</p>'
    }[key];
    if (!content) return;
    $('#modalContent').innerHTML = content;
    $('#modal').classList.remove('hidden');
  }

  function applyConsumerCopy() {
    const hero = $('#solutionView .solHero h1');
    if (hero) hero.textContent = 'Here’s what Keneflex recommends.';
    const source = $('#solutionView .detailsBlock details:nth-of-type(3) .detailInside p');
    if (source) source.textContent = 'Product specifications and sizing come from manufacturer information. Keneflex also considers the problem pattern, product function, fit, safety, limitations, and what happens after use.';
    const trust = $('#solutionView .integrity');
    if (trust) trust.innerHTML = '<h2>Why trust this recommendation?</h2><p class="help">Keneflex compares what you described with product function, fit, safety, limitations, and reasonable non-product options before recommending what to buy.</p><p class="micro"><b>How Keneflex makes money:</b> Keneflex may earn money when some recommended products are purchased. That does not determine which product is recommended.</p>';
    const totalHelp = $('#total')?.closest('.block')?.querySelector('.help');
    if (totalHelp) totalHelp.textContent = 'Product total for the items currently selected.';
    const tune = $('#solutionView .tune');
    if (tune) {
      const heading = $('h2', tune);
      const help = $('.help', tune);
      if (heading) heading.textContent = 'Want to change what you buy?';
      if (help) help.textContent = 'Remove any recommended item you do not want included in this purchase. Removing it does not change Keneflex’s recommendation.';
    }
  }

  function bind() {
    document.title = 'Keneflex';
    $('#intro .hero .eyebrow')?.classList.add('hidden');
    applyConsumerCopy();
    const opening = $('#opening');
    const openingButton = $('#openingBtn');
    opening.addEventListener('input', () => { openingButton.disabled = opening.value.trim().length < 3; });
    openingButton.addEventListener('click', () => {
      model.opening = opening.value.trim();
      Engine.ingest(model.story, model.opening);
      addBubble('user', model.opening);
      showStage('chat');
      advance();
    });
    $$('[data-tune]').forEach(button => button.addEventListener('click', () => adjust(button.dataset.tune)));
    $('#resetTune').addEventListener('click', resetAdjustments);
    $$('[data-ask]').forEach(button => button.addEventListener('click', () => $('#' + button.dataset.ask)?.classList.toggle('show')));
    $$('[data-modal]').forEach(button => button.addEventListener('click', () => modal(button.dataset.modal)));
    $('#closeModal').addEventListener('click', () => $('#modal').classList.add('hidden'));
    $('#modal').addEventListener('click', event => { if (event.target === $('#modal')) $('#modal').classList.add('hidden'); });
  }

  root.KeneflexParticipant = Object.freeze({ model, PRODUCTS, total, lines, activeProblem, renderSolution });
  bind();
})(window);
