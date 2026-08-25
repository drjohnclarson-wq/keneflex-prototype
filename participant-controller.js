/* Keneflex participant runtime 0.7.1
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
    release: '0.7.1',
    story: Engine.createStore(),
    opening: '',
    stage: 'intro',
    answers: [],
    safetyCleared: false,
    woundAssessment: 'unknown',
    recommendation: null,
    fit: { wristInches: null, supportSize: null, supportSku: null },
    cart: {
      support: { disposition: 'BUY' },
      cold: { disposition: 'OPTIONAL' },
      topical: { disposition: 'OPTIONAL' }
    },
    selectedPlan: 'core',
    recommendedPlan: 'core'
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
  function planLabel() {
    return ({ core: 'Essential', recovery: 'Recommended', complete: 'Complete' })[model.selectedPlan] || 'Custom selection';
  }
  function wornBraceExplanation() {
    const story = [model.opening, ...model.answers].join(' ').toLowerCase();
    if (!/\b(?:brace|support|wrap)\b/.test(story) || !/\b(?:old|worn|stretched|worn out)\b/.test(story)) return '';
    if (/doesn['’]?t support (?:my |the )?thumb|does not support (?:my |the )?thumb/.test(story)) {
      return 'Your old brace is stretched out and does not support your thumb. Keneflex replaces it with one flexible support made for both the wrist and thumb.';
    }
    return 'You described an old or worn brace. Keneflex replaces it with one flexible support made for both the wrist and thumb.';
  }

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
      const hasLocationDetail = /\b(?:palm|top|back|thumb|knuckle|crease|side|base|joint|finger|inside|outside|near|below|above)\b/i.test(value);
      if (question.concept === 'preciseLocation' && locationUncertain && !hasLocationDetail) {
        interaction.innerHTML = '';
        addBubble('ai', '<p>That is okay. Please describe the closest area you can identify—for example, the palm side, top of the wrist, thumb knuckle, or another spot you can point to.</p>', true);
        composer(question);
        return;
      }
      if (question.concept === 'preciseLocation') {
        const thread = activeProblem();
        const parsedValue = value.replace(/\bback(?:\s+side)?\s+of\s+(?=(?:my|the)\s+(?:wrist|hand|thumb))/ig, 'posterior side of ');
        Engine.ingest(model.story, parsedValue);
        if (thread && !Engine.known(thread, 'preciseLocation')) thread.locations.push(value);
        if (thread) model.story.active = threadKey(thread);
      } else {
        Engine.ingest(model.story, value);
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
    return 'I understand this as a ' + region + ' concern. I’ll keep the next questions specific to that area.';
  }

  function advance() {
    let thread = activeProblem();
    const woundAssessment = latestWoundAssessment();
    model.woundAssessment = woundAssessment;
    if (woundAssessment === 'concerning') {
      addBubble('ai', '<p><b>Self-care should pause here.</b></p><p>You described a wound that may need professional evaluation—for example, one that is deep or gaping, will not stop bleeding, is a puncture or bite, is dirty or contaminated, contains debris, or shows signs of infection. Address that before choosing a support or continuing this plan.</p>', true);
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
    const deformityStatus = latestDeformityStatus();
    if (deformityStatus === 'reported') {
      addBubble('ai', '<p><b>Self-care should pause here.</b></p><p>You reported visible deformity or that the area looks crooked, misshapen, or out of place. That can change what is safe, so seek an appropriate in-person medical evaluation before choosing a support or continuing this plan.</p>', true);
      interaction.innerHTML = '';
      return;
    }
    const injuryDenied = latestInjuryStatus() === 'denied';
    const woundAssessment = latestWoundAssessment();
    model.woundAssessment = woundAssessment;
    if (!injuryDenied) unresolved.push('a major recent injury');
    if (woundAssessment === 'unknown') unresolved.push('a deep or gaping wound, bleeding that will not stop, a puncture, bite, or dirty wound, or signs of infection');
    if (!negative.has('swelling')) unresolved.push('rapidly increasing swelling');
    if (!negative.has('numbness')) unresolved.push('loss of feeling');
    if (!negative.has('weakness')) unresolved.push('marked new weakness');
    if (deformityStatus === 'unknown') unresolved.splice(Math.min(1, unresolved.length), 0, 'visible deformity');
    const list = unresolved.length === 1
      ? unresolved[0]
      : unresolved.slice(0, -1).join(', ') + ', or ' + unresolved[unresolved.length - 1];
    const minorWoundNotice = woundAssessment === 'minor'
      ? '<p><b>A minor scrape does not automatically require medical care.</b> Wash it with soap and water, cover it with a clean bandage, and watch for worsening redness, drainage, swelling, or pain. Do not place a brace or topical pain product directly over unprotected broken skin.</p>'
      : '';
    if (!unresolved.length) {
      if (minorWoundNotice) addBubble('ai', minorWoundNotice, true);
      model.safetyCleared = true;
      fitGate();
      return;
    }
    addBubble('ai', minorWoundNotice + '<p><b>One safety check before I build the plan:</b> have you noticed ' + escapeHtml(list) + '?</p>', true);
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

  function latestDeformityStatus() {
    let status = 'unknown';
    const denied = /\b(?:no|without)\b[^.!?;]{0,180}\b(?:visible )?(?:deformity|crookedness)\b|\b(?:do not|don't|have not|haven't|did not|didn't)\s+have\b[^.!?;]{0,180}\b(?:visible )?(?:deformity|crookedness)\b|\b(?:do not|don't|does not|doesn't|did not|didn't)\s+(?:look|appear|seem)\s+(?:visibly |obviously )?(?:deformed|crooked|misshapen|bent|out of place|at an (?:odd|unusual) angle)\b/i;
    const reported = /\b(?:visible |obvious |new )?(?:deformity|crookedness)\b|\b(?:looks?|appears?|seems?|is|was|became)\s+(?:to be\s+)?(?:visibly |obviously |newly )?(?:deformed|crooked|misshapen|bent|out of place|at an (?:odd|unusual) angle)\b|\b(?:a |an )?(?:visibly |obviously |newly )?(?:deformed|crooked|misshapen)\s+(?:wrist|thumb|hand|finger|joint|area)\b/i;
    model.story.events.forEach(event => String(event.text || '').replace(/[’‘]/g, "'").split(/[.!?;]/).forEach(clause => {
      if (denied.test(clause)) status = 'denied';
      else if (reported.test(clause)) status = 'reported';
    }));
    return status;
  }

  function latestInjuryStatus() {
    let status = 'unknown';
    const denied = /\bno\s+fall\s+(?:or|and)\s+(?:direct injury|injury|trauma)\b|\b(?:no|without)\s+(?:(?:a|any)\s+)?(?:major (?:recent )?injury|direct injury|injury|trauma)\b|\b(?:have not|haven't)\s+had\s+(?:(?:a|any)\s+)?(?:major (?:recent )?injury|direct injury|injury|trauma)\b|\b(?:did not|didn't)\s+have\s+(?:(?:a|any)\s+)?(?:major (?:recent )?injury|direct injury|injury|trauma)\b/i;
    const reported = /\b(?:fell|had\s+(?:(?:a|the)\s+)?(?:major (?:recent )?injury|direct injury|injury|trauma)|(?:after|following)\s+(?:(?:a|the)\s+)?(?:fall|injury|trauma|(?:sudden )?twist|hit|accident)|sudden twist)\b/i;
    model.story.events.forEach(event => String(event.text || '').replace(/[’‘]/g, "'").split(/[.!?;]/).forEach(clause => {
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
    const denied = new RegExp('\\b(?:no|without)\\s+(?:(?:a|an|any)\\s+)?(?:open wound(?!\\s+(?:pain|soreness|drainage|care|dressing|cover|bandage))|wound\\b(?!\\s+(?:pain|soreness|drainage|care|dressing|cover|bandage))|open skin(?!\\s+(?:pain|soreness|drainage|care|dressing|cover|bandage))|(?:open )?cut(?:\\s+' + cutObject + ')?)\\b|\\b(?:do not|don\'t|have not|haven\'t)\\s+have\\s+(?:(?:a|an|any)\\s+)?(?:open wound|wound\\b(?!\\s+(?:dressing|care|cover|bandage))|open skin|(?:open )?cut(?:\\s+' + cutObject + ')?)\\b|\\b(?:did not|didn\'t|do not|don\'t|have not|haven\'t|never)\\s+cut\\s+' + cutObject, 'i');
    const listDenied = /\b(?:do not|don't|does not|doesn't|did not|didn't|have not|haven't|has not|hasn't)\s+have\b(?:(?!\b(?:(?:but|however|although|yet)|(?:and|or)\s+(?:(?:i|we)\s+)?(?:do\s+)?have)\b)[^.!?;]){0,220}\b(?:open wound|open skin|(?:open )?cut|scrape|abrasion)\b/i;
    const reported = new RegExp('\\b(?:open wound|open skin|skin is open|(?:(?:a|an|my|open|deep|small|large|fresh|bleeding)\\s+cut)|(?:(?:(?:minor|small|superficial|shallow)\\s+)+)?(?:scrape|abrasion)|skinned\\s+(?:my\\s+)?(?:hand|wrist|thumb|finger|knee|elbow)|(?:(?:left|right)\\s+)?(?:hand|wrist|thumb|finger)\\s+cut|cut\\s+' + cutObject + ')\\b', 'i');
    const evidenceKey = item => {
      const source = String(item.segment || item.text || '');
      const body = source.match(/\b(skin|hands?|wrists?|thumbs?|fingers?)\b/i)?.[1]?.toLowerCase();
      const side = source.match(/\b(left|right)\b/i)?.[1]?.toLowerCase();
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
    model.story.events.forEach(event => String(event.text || '').replace(/[’‘]/g, "'").split(/[.!?;]/).forEach(clause => {
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
      collect(listDenied, 'denied');
      collect(reported, 'reported');
      evidence.sort((a, b) => a.index - b.index).forEach(item => {
        const key = evidenceKey(item);
        const nextReport = evidence.find(candidate => candidate.value === 'reported' && candidate.index > item.index);
        const following = clause.slice(item.end, nextReport ? nextReport.index : clause.length);
        const resolved = /^\s*(?:that\s+)?(?:(?:has|is|was)\s+)?(?:fully\s+)?(?:healed|closed|resolved|no longer open)\b/i.test(following) || /(?:,|\bbut\b)\s*it\s+(?:healed|closed|resolved|is\s+no\s+longer\s+open)\b/i.test(following);
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

  function latestWoundAssessment() {
    const status = latestOpenWoundStatus();
    if (status !== 'reported') return status;
    const text = model.story.events.map(event => String(event.text || '').replace(/[’‘]/g, "'")).join(' ');
    const concerning = /\b(?:deep|gaping|puncture|punctured|bite|bitten|dirty|contaminated|embedded|foreign (?:body|object)|exposed (?:bone|tendon)|pus|drainage|red streaks?|spreading redness|uncontrolled bleeding|severe bleeding|persistent bleeding|keeps? bleeding|continues? (?:to bleed|bleeding)|bleeding (?:continues?|persists?|will not|won't|cannot|can't) stop?|still bleeding|fever)\b/i.test(text);
    const minor = /\b(?:(?:(?:minor|small|superficial|shallow)\s+)+(?:scrape|abrasion|cut)|skinned\s+(?:my\s+)?(?:hand|wrist|thumb|finger|knee|elbow))\b/i.test(text);
    return concerning ? 'concerning' : minor ? 'minor' : 'concerning';
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
    const locationText = thread.locations.join(', ') || thread.areas.join(', ') || 'hand/wrist area';
    const locations = thread.side ? thread.side + ' — ' + locationText : locationText;
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
    const story = [model.opening, ...model.answers].join(' ').toLowerCase();
    model.recommendedPlan = model.recommendation.eligible && /\b(?:pickleball|tennis|golf|paddle|racquet|racket)\b/.test(story) ? 'recovery' : 'core';
    model.selectedPlan = model.recommendedPlan;
    model.cart.cold.disposition = model.selectedPlan === 'recovery' ? 'BUY' : 'OPTIONAL';
    model.cart.topical.disposition = 'OPTIONAL';
    renderSolution();
    showStage('solution');
  }

  function statusText(disposition, id) {
    if (disposition === 'BUY') return id === 'support' ? 'Recommended' : 'Selected add-on';
    return { OPTIONAL: 'Optional add-on', REMOVE: 'Removed by you', REVIEW: 'Needs review before buying' }[disposition];
  }

  function renderLine(id) {
    const line = productLine(id);
    const item = $('#' + id + 'Item');
    item.classList.toggle('removed', line.disposition === 'REMOVE');
    item.classList.toggle('kept', line.disposition === 'REVIEW');
    item.classList.toggle('optional', line.disposition === 'OPTIONAL');
    const state = $('#' + id + 'State');
    state.textContent = statusText(line.disposition, id);
    state.className = 'planState ' + (line.disposition === 'BUY' ? 'buy' : line.disposition === 'REMOVE' ? 'remove' : line.disposition === 'OPTIONAL' ? 'optional' : 'keep');
    $('#' + id + 'Price').textContent = line.disposition === 'BUY' ? money(line.price) : line.disposition === 'OPTIONAL' ? '+' + money(line.price) : '$0';
    if (id === 'support') {
      $('.planName', item).textContent = line.name;
      if (!model.fit.supportSku) $('.planCopy', item).textContent = 'The available support size is not verified for your measurement, so this item remains under review and cannot be purchased yet.';
    }
  }

  function renderSolution() {
    const rec = model.recommendation;
    const hasReview = lines().some(line => line.disposition === 'REVIEW');
    $('#solutionView .solHero h1').textContent = hasReview ? 'Review this before buying.' : 'Built to help you get back to what you do.';
    $('#solutionLead').textContent = hasReview ? rec.lead : 'Keneflex evaluates the options and turns your story into one connected plan—with clear guidance for what to use, what to do, and what to watch.';
    const wornBrace = wornBraceExplanation();
    $('#confidenceCopy').textContent = rec.neuro
      ? 'A product should not be treated as selected until it satisfies the altered-feeling pattern as well as the pain and activity requirements.'
      : wornBrace
        ? wornBrace
        : 'Your plan connects the support Keneflex selected with practical steps for activity, recovery, and knowing when the plan should change.';
    $('#supportItem .planCopy').textContent = rec.supportReason;
    const why = $('#whyRows');
    why.innerHTML = [
      ['Location carried forward', rec.locations],
      ['Pattern considered', rec.neuro ? 'Pain plus altered feeling' : 'Use-related pain without an identified altered-feeling pattern'],
      ['What changed the product decision', rec.supportReason],
      ...(rec.provider ? [['Provider direction protected', rec.provider + ' Keneflex will not recommend a conflicting use pattern.']] : []),
      ...(model.woundAssessment === 'minor' ? [['Skin protection', 'Clean and cover the minor scrape. Do not place a brace or topical pain product directly over unprotected broken skin.']] : [])
    ].map(([title, copy]) => '<div class="why"><b>' + escapeHtml(title) + '</b><span>' + escapeHtml(copy) + '</span></div>').join('');
    Object.keys(PRODUCTS).forEach(renderLine);
    $('#total').textContent = money(total());
    $('#planName').textContent = planLabel();
    const summaryCount = lines().filter(line => line.disposition === 'BUY' || line.disposition === 'REVIEW').length;
    $('#selectionCount').textContent = hasReview
      ? summaryCount + (summaryCount === 1 ? ' product awaiting review' : ' products awaiting review') + ' + Personalized Keneflex Plan'
      : summaryCount + (summaryCount === 1 ? ' product' : ' products') + ' + Personalized Keneflex Plan';
    $$('[data-plan]').forEach(button => {
      const selected = button.dataset.plan === model.selectedPlan;
      const recommended = button.dataset.plan === model.recommendedPlan;
      button.classList.toggle('selected', selected);
      button.classList.toggle('featured', recommended);
      button.setAttribute('aria-pressed', String(selected));
      const badge = $('.tierBadge', button);
      if (badge) {
        badge.textContent = recommended ? 'Keneflex recommended' : ({ core: 'Personalized foundation', recovery: 'Adds recovery', complete: 'Most comprehensive' })[button.dataset.plan];
        badge.classList.toggle('recommendedBadge', recommended);
      }
      const choice = $('.tierChoice', button);
      if (choice) choice.textContent = selected ? 'Selected' : 'Select ' + ({ core: 'Essential', recovery: 'Recommended', complete: 'Complete' })[button.dataset.plan];
    });
    ensureCommerceControls();
  }

  function selectPlan(plan) {
    if (!['core', 'recovery', 'complete'].includes(plan)) return;
    model.selectedPlan = plan;
    model.cart.cold.disposition = plan === 'core' ? 'OPTIONAL' : 'BUY';
    model.cart.topical.disposition = plan === 'complete' ? 'BUY' : 'OPTIONAL';
    $('#tuneResult').classList.add('hidden');
    $('#resetTune').classList.add('hidden');
    renderSolution();
  }

  function setDisposition(id, disposition, message) {
    model.cart[id].disposition = disposition;
    $('#tuneResult').classList.remove('hidden');
    $('#tuneResult').innerHTML = message;
    $('#resetTune').classList.remove('hidden');
    renderSolution();
  }

  function adjust(kind) {
    if (PRODUCTS[kind]) {
      model.selectedPlan = 'custom';
      return setDisposition(kind, 'REMOVE', '<b>' + escapeHtml(PRODUCTS[kind].name) + ' removed.</b> It will not be included in your purchase.');
    }
  }

  function resetAdjustments() {
    model.cart.support.disposition = model.recommendation?.eligible && model.fit.supportSku && !model.recommendation?.provider ? 'BUY' : 'REVIEW';
    model.cart.cold.disposition = model.recommendedPlan === 'recovery' ? 'BUY' : 'OPTIONAL';
    model.cart.topical.disposition = 'OPTIONAL';
    model.selectedPlan = model.recommendedPlan;
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
      : 'Buy the ' + planLabel() + ' plan — ' + money(total()) + ' total';
    $('#cartPreviewBtn')?.closest('.cartPreview')?.classList.add('hidden');
    let plan = $('#kfxPlanBtn');
    if (!plan) {
      plan = document.createElement('button');
      plan.id = 'kfxPlanBtn';
      plan.className = 'primary kfxPlanBtn';
      plan.textContent = 'Review my complete Keneflex Plan →';
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
    const woundWarning = model.woundAssessment === 'minor'
      ? '<div class="kfxSafetyNotice"><b>Protect the scrape.</b> Clean and cover it. Do not place a brace or topical pain product directly over unprotected broken skin.</div>'
      : '';
    overlay.innerHTML = '<section class="kfxCheckout" role="dialog" aria-modal="true"><h2>Review your Keneflex plan</h2><div class="rowx planIncluded"><span>Personalized Keneflex Plan</span><b>Included</b></div>' + woundWarning + combinationWarning + '<div>' +
      selected.map(line => '<div class="rowx"><span>' + line.name + '</span><b>' + money(line.price) + '</b></div>').join('') +
      '</div><div class="totalx"><span>Total</span><span>' + money(total()) + '</span></div><div class="actions"><button class="primary" data-checkout-complete>Continue →</button><button class="secondary" data-checkout-close>Go back</button></div><p class="micro">This test will not place an order or charge you.</p></section>';
    document.body.appendChild(overlay);
    $('[data-checkout-close]', overlay).addEventListener('click', () => overlay.remove());
    $('[data-checkout-complete]', overlay).addEventListener('click', () => {
      $('.kfxCheckout', overlay).innerHTML = '<h2>Purchase choice recorded.</h2><p>No order was placed and you were not charged.</p><button class="secondary" data-checkout-close>Return to my plan</button>';
      $('[data-checkout-close]', overlay).addEventListener('click', () => overlay.remove());
    });
  }

  function fullStoryText() {
    return [model.opening, ...model.answers].join(' ').toLowerCase();
  }

  function planModules(thread, selected) {
    const story = fullStoryText();
    const digital = /\b(?:typing|computer|keyboard|mouse|laptop|desktop|phone|texting|scrolling)\b/.test(story);
    const sport = /\b(?:pickleball|tennis|golf|paddle|racquet|racket|gripping|twisting)\b/.test(story);
    const provider = model.recommendation.provider;
    const support = selected.find(line => line.id === 'support');
    const cold = selected.find(line => line.id === 'cold');
    const topical = selected.find(line => line.id === 'topical');
    const modules = [];

    modules.push({
      id: 'start',
      title: 'Your starting plan',
      summary: 'The coordinated first steps and what each part is meant to do.',
      body: '<p><b>Area:</b> ' + escapeHtml(model.recommendation.locations || 'the area you described') + '</p>' +
        '<ol class="planChecklist"><li>Reduce the activity or position that repeatedly aggravates the area.</li><li>Use only the support or recovery components selected for this story.</li><li>Use the movement guidance below without forcing symptoms.</li><li>Track whether function and activity tolerance improve.</li></ol>' +
        (provider ? '<div class="kfxPlanNotice"><b>Provider direction controls.</b> ' + escapeHtml(provider) + ' Keneflex will not substitute a conflicting product or use schedule.</div>' : '')
    });

    modules.push({
      id: 'movement',
      title: model.recommendation.neuro ? 'Exercises and stretches — review needed' : 'Exercises and stretches',
      summary: model.recommendation.neuro ? 'Generic exercise guidance is withheld because altered feeling can change what fits.' : 'Comfortable movements selected for this wrist and thumb pattern.',
      body: model.recommendation.neuro
        ? '<div class="kfxPlanNotice"><b>Do not add a generic nerve-glide or aggressive stretch.</b> The altered-feeling pattern needs review before Keneflex selects a specific exercise sequence.</div>'
        : '<div class="movementGrid"><article><b>Relax and open the hand</b><p>After gripping or sustained device use, soften the grip, open the fingers comfortably, then relax. Repeat 5 times without forcing a stretch.</p></article><article><b>Comfortable thumb motion</b><p>Move the thumb toward each fingertip through a comfortable range. Complete 3 slow rounds. Stop before a painful end range.</p></article><article><b>Gentle wrist reset</b><p>With the forearm supported, return the wrist toward a relaxed, straight position. Hold 5 seconds and repeat 5 times.</p></article></div><div class="kfxPlanStop"><b>Stop the movement</b> if it meaningfully increases pain, numbness, tingling, weakness, swelling, or symptoms that do not settle after stopping.</div>'
    });

    if (support) modules.push({
      id: 'support',
      title: 'How to use your support',
      summary: 'Fit, timing, skin checks, and the job this support is meant to perform.',
      body: '<p><b>' + escapeHtml(support.name) + '</b> was selected to support the required area while preserving useful movement.</p><div class="planSteps"><div class="planStep"><b>Use it for the selected role</b><p>Use it during the aggravating activity or context identified in your plan—not automatically all day and all night.</p></div><div class="planStep"><b>Check the fit</b><p>It should not create new pressure, numbness, tingling, color change, or circulation concerns.</p></div><div class="planStep"><b>Keep products separate</b><p>Use the support on clean, dry skin. Do not place it over topical gel or unprotected broken skin.</p></div></div><p class="planFinePrint">The exact product label and any professional instructions remain controlling for wear time, cleaning, contraindications, and product-specific use.</p>'
    });

    if (cold || topical) modules.push({
      id: 'recovery',
      title: 'Recovery and comfort',
      summary: 'How the recovery components selected for this story fit into the plan.',
      body: (cold ? '<div class="planComponent"><b>Reusable cold recovery</b><p>Use after an aggravating activity when cold feels helpful, following the product directions and protecting the skin.</p></div>' : '') +
        (topical ? '<div class="planComponent"><b>Temporary topical comfort</b><p>Use only as directed on intact skin. Do not apply beneath the support.</p></div>' : '') +
        '<p class="planFinePrint">Recovery is not a fixed Keneflex bundle. Depending on the story, a plan may instead use heat, TENS, another recovery method, something already owned, or no recovery product.</p>'
    });

    modules.push({
      id: 'activity',
      title: 'Activity modifications',
      summary: 'No-cost changes intended to reduce the provoking load without unnecessarily stopping everything.',
      body: sport
        ? '<div class="planSteps"><div class="planStep"><b>Reduce provoking volume</b><p>Temporarily shorten sessions or add recovery time rather than repeatedly pushing through increasing symptoms.</p></div><div class="planStep"><b>Reduce grip and twist load</b><p>Avoid squeezing harder than the task requires. Pause when gripping or twisting clearly escalates symptoms.</p></div><div class="planStep"><b>Return by response</b><p>Increase activity only when function and next-day symptoms are stable or improving.</p></div></div>'
        : '<div class="planSteps"><div class="planStep"><b>Break up repetition</b><p>Use shorter work periods and change position before symptoms build.</p></div><div class="planStep"><b>Reduce unnecessary force</b><p>Keep grip and wrist effort as light as the task allows.</p></div><div class="planStep"><b>Return by response</b><p>Increase activity only when function and next-day symptoms are stable or improving.</p></div></div>'
    });

    if (digital) modules.push({
      id: 'ergonomics',
      title: 'Workspace and device setup',
      summary: 'Relevant positioning and workload changes based on the device use you described.',
      body: '<div class="planSteps"><div class="planStep"><b>Bring the task closer</b><p>Position the keyboard, mouse, or phone so the forearm can stay supported and the wrist does not have to reach or bend continuously.</p></div><div class="planStep"><b>Reduce sustained holding</b><p>Prop the phone or alternate hands when prolonged holding or thumb reach contributes to symptoms.</p></div><div class="planStep"><b>Change the input load</b><p>Use shortcuts, voice input, or brief task rotation when repeated clicking, scrolling, or typing is a clear trigger.</p></div></div><p class="planFinePrint">Keneflex should recommend purchasable ergonomic equipment only after matching the specific device, hand size, workspace, and provoking motion—not by automatically adding generic accessories.</p>'
    });

    modules.push({
      id: 'followup',
      title: 'Progress and reassessment',
      summary: 'What improvement, partial improvement, or failure means.',
      body: '<div class="planSteps"><div class="planStep"><b>Improving</b><p>Function, activity tolerance, and symptom recovery trend in the right direction. Continue and gradually progress.</p></div><div class="planStep"><b>Partly improving</b><p>Identify which part helped and which trigger or requirement remains unresolved before adding more products.</p></div><div class="planStep"><b>Not improving</b><p>Reassess the story, fit, product role, and whether professional evaluation is now the better next step.</p></div></div>'
    });

    modules.push({
      id: 'safety',
      title: 'Safety and when to stop',
      summary: 'The warning signs that change the self-care plan.',
      body: (model.woundAssessment === 'minor' ? '<div class="kfxPlanNotice"><b>Protect the scrape.</b> Clean and cover it. Do not place a support or topical pain product directly over unprotected broken skin.</div>' : '') + '<div class="kfxPlanStop"><b>Pause self-care and seek appropriate evaluation</b> for meaningful new weakness, loss of feeling, major or rapidly increasing swelling, deformity, a concerning wound, or significant worsening.</div>'
    });
    return modules;
  }

  function renderPlanModule(module, index) {
    return '<details class="planModule" data-plan-module="' + escapeHtml(module.id) + '"' + (index === 0 ? ' open' : '') + '><summary><span><b>' + escapeHtml(module.title) + '</b><small>' + escapeHtml(module.summary) + '</small></span><i aria-hidden="true">+</i></summary><div class="planModuleBody">' + module.body + '<button class="secondary printTopic" type="button" data-print-module="' + escapeHtml(module.id) + '">Print this topic</button></div></details>';
  }

  function printPlan(overlay, moduleId) {
    overlay.dataset.printModule = moduleId || 'all';
    const clean = () => { delete overlay.dataset.printModule; };
    window.addEventListener('afterprint', clean, { once: true });
    window.print();
  }

  function openPlan() {
    const thread = activeProblem();
    $('.kfxPlanOverlay')?.remove();
    const selected = lines().filter(line => line.disposition === 'BUY' || line.disposition === 'REVIEW');
    const modules = planModules(thread, selected);
    const overlay = document.createElement('div');
    overlay.className = 'kfxPlanOverlay';
    const hasReview = selected.some(line => line.disposition === 'REVIEW');
    overlay.innerHTML = '<div class="kfxPlanPage"><header><div class="logo">KENEFLEX</div><div class="planHeaderActions"><button class="secondary" type="button" data-plan-print>Print complete plan</button><button class="secondary" type="button" data-plan-close>Back to recommendation</button></div></header><main><section class="planHero"><div class="eyebrow">Your personalized Keneflex Plan</div><h1>One plan. Open only what you need.</h1><p>Review or print the complete plan, or use one relevant topic at a time so the guidance stays manageable.</p></section><section class="card planAtGlance"><h2>Your plan at a glance</h2><p><b>Area:</b> ' + escapeHtml(model.recommendation.locations || 'as described') + '</p><div class="planTopicNav">' + modules.map(module => '<button type="button" data-plan-jump="' + escapeHtml(module.id) + '">' + escapeHtml(module.title) + '</button>').join('') + '</div></section><section class="planModules">' + modules.map(renderPlanModule).join('') + '</section><section class="card finalSelection"><div class="finalSelectionTop"><div><div class="eyebrow">Your selected purchase</div><h2>' + escapeHtml(planLabel()) + '</h2><p>Your Keneflex Plan is included. Product totals do not assign a $0 value to the plan.</p></div><div class="finalTotal">' + money(total()) + '<small>product total</small></div></div><div class="finalProducts"><div class="planLine planIncluded"><span>Personalized Keneflex Plan</span><b>Included</b></div>' + selected.map(line => '<div class="planLine"><span>' + escapeHtml(line.name) + '</span><b>' + (line.disposition === 'BUY' ? money(line.price) : 'Review') + '</b></div>').join('') + '</div><button class="primary kfxFinalBuy"' + (hasReview ? ' disabled' : '') + '>' + (hasReview ? 'Review needed before checkout' : 'Buy the ' + escapeHtml(planLabel()) + ' plan — ' + money(total()) + ' total') + '</button></section></main></div>';
    document.body.appendChild(overlay);
    $('[data-plan-close]', overlay).addEventListener('click', () => overlay.remove());
    $('[data-plan-print]', overlay).addEventListener('click', () => printPlan(overlay, 'all'));
    $$('[data-print-module]', overlay).forEach(button => button.addEventListener('click', () => printPlan(overlay, button.dataset.printModule)));
    $$('[data-plan-jump]', overlay).forEach(button => button.addEventListener('click', () => {
      const target = $('[data-plan-module="' + button.dataset.planJump + '"]', overlay);
      if (target) { target.open = true; target.scrollIntoView({ block: 'start' }); }
    }));
    $('.kfxFinalBuy', overlay)?.addEventListener('click', checkout);
    overlay.scrollTo(0, 0);
  }

  function modal(key) {
    const content = {
      how: '<h2>How Keneflex works</h2><p>Tell the story in your own words. Keneflex carries known facts forward, asks only what could change the decision, checks safety, evaluates the options, and builds one connected plan.</p>',
      approach: '<h2>Our approach</h2><p>Product fit, function, safety, limitations, and reasonable non-product options come before a purchase.</p>'
    }[key];
    if (!content) return;
    $('#modalContent').innerHTML = content;
    $('#modal').classList.remove('hidden');
  }

  function applyConsumerCopy() {
    const trust = $('#solutionView .integrity');
    if (trust) trust.innerHTML = '<h2>Why trust this recommendation?</h2><p class="help">Keneflex compares what you described with product function, fit, safety, limitations, and reasonable non-product options before recommending what to buy.</p><p class="micro"><b>How Keneflex makes money:</b> Keneflex may earn money when some recommended products are purchased. That does not determine which product is recommended.</p>';
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
    $('#planPreviewBtn')?.addEventListener('click', openPlan);
    $$('[data-tune]').forEach(button => button.addEventListener('click', () => adjust(button.dataset.tune)));
    $$('[data-plan]').forEach(button => button.addEventListener('click', () => selectPlan(button.dataset.plan)));
    $('#resetTune').addEventListener('click', resetAdjustments);
    $$('[data-ask]').forEach(button => button.addEventListener('click', () => $('#' + button.dataset.ask)?.classList.toggle('show')));
    $$('[data-modal]').forEach(button => button.addEventListener('click', () => modal(button.dataset.modal)));
    $('#closeModal').addEventListener('click', () => $('#modal').classList.add('hidden'));
    $('#modal').addEventListener('click', event => { if (event.target === $('#modal')) $('#modal').classList.add('hidden'); });
  }

  root.KeneflexParticipant = Object.freeze({ model, PRODUCTS, total, lines, activeProblem, renderSolution, selectPlan });
  bind();
})(window);
