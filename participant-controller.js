/* Keneflex participant runtime 0.8.0
   One owner for intake, recommendation presentation, plan adjustments, cart, and plan pages. */
(function (root) {
  'use strict';

  const Engine = root.KFX046;
  if (!Engine) throw new Error('Keneflex story engine failed to load.');

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const money = value => '$' + Number(value || 0).toFixed(2);
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const placeholder = (label, color) => 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><rect width="240" height="240" rx="30" fill="' + color + '"/><text x="120" y="110" text-anchor="middle" font-family="Arial" font-size="22" font-weight="700" fill="white">' + label + '</text><text x="120" y="142" text-anchor="middle" font-family="Arial" font-size="15" fill="white">PRODUCT</text></svg>');
  const CATALOG = Object.freeze({
    support: Object.freeze({
      combined: { id: 'support', sku: 'NEOG-AIRFLOW-WT', name: 'Neo G Airflow Wrist & Thumb Support', price: 19.99, role: 'Flexible wrist and thumb support', image: 'https://www.neo-g.com/cdn/shop/files/722-13-Box_R_1080x.png?v=1725268865', fit: 'sized', guide: 'Use it for the activity or situation identified in your story. Apply to clean, dry skin; confirm that it supports without pressure, altered feeling, color change, or circulation concerns. Follow the label for positioning, wear time, and cleaning.' },
      wrist: { id: 'support', sku: 'BRACEABILITY-11H11', name: 'BraceAbility Volar Wrist Splint', price: 24.99, role: 'Neutral-position wrist support', image: placeholder('WRIST SPLINT', '#143f43'), fit: 'universal', guide: 'Use the adjustable straps to hold the wrist in a comfortable neutral position. The fingers should remain free and the brace should not create pressure, altered feeling, color change, or circulation concerns. Follow the label for use, stay removal, and hand washing.' }
    }),
    recovery: Object.freeze({
      cold: { id: 'cold', sku: 'POLAR-SPW8', name: 'Polar Soft Ice Wrist Wrap', price: 21.00, role: 'Reusable flexible cold recovery', image: 'https://trkmedicalproducts.com/cdn/shop/products/41_999x.jpg?v=1626891716', guide: 'Use after an aggravating activity or when cold feels helpful. Protect the skin, use only for the label-directed time, and stop for skin changes, excessive numbness, or worsening symptoms.' },
      heat: { id: 'cold', sku: 'POLAR-MHW', name: 'Polar Thera-Temp Moist Heat Wrist & Hand Wrap', price: 22.00, role: 'Reusable moist heat for stiffness or tightness', image: placeholder('MOIST HEAT', '#8b4c2f'), guide: 'Use when warmth feels helpful for stiffness or muscle tightness. Check temperature before applying, use only for the label-directed time, and never use while sleeping or on skin with reduced sensation.' }
    }),
    comfort: Object.freeze({
      gel: { id: 'topical', sku: 'BIOFREEZE-GEL-4', name: 'Biofreeze Pain Relief Gel, menthol 4%', price: 11.99, role: 'Temporary topical comfort gel', image: 'https://biofreeze.com/static/a06132b8965c43644a3e10fc5aae7a80/7b187/en-US-bf_retailgeltubegreen.png', guide: 'Apply only as directed on intact skin. Wash hands after use unless treating the hands. Do not bandage tightly, use with a heating device, or place the support over the gel.' },
      patch: { id: 'topical', sku: 'BIOFREEZE-PATCH-4', name: 'Biofreeze Pain Relief Patch, menthol 4%', price: 12.99, role: 'Temporary hands-free comfort patch', image: placeholder('PAIN PATCH', '#356d58'), guide: 'Apply one patch only as directed to intact skin and remove it within the label-directed time. Do not bandage tightly, use with a heating device, or place the support over the patch.' }
    })
  });
  const PRODUCTS = Object.freeze({ support: CATALOG.support.combined, cold: CATALOG.recovery.cold, topical: CATALOG.comfort.gel });

  const model = {
    release: '0.8.0',
    story: Engine.createStore(),
    opening: '',
    stage: 'intro',
    answers: [],
    safetyCleared: false,
    woundAssessment: 'unknown',
    recommendation: null,
    fit: { wristInches: null, supportSize: null, supportSku: null },
    selection: { support: 'combined', recovery: 'cold', comfort: 'gel' },
    comfortEligible: true,
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
    const product = id === 'support' ? CATALOG.support[model.selection.support] : id === 'cold' ? CATALOG.recovery[model.selection.recovery] : CATALOG.comfort[model.selection.comfort];
    const disposition = model.cart[id].disposition;
    const name = id === 'support' && model.fit.supportSize ? product.name + ' — ' + model.fit.supportSize : product.name;
    return { ...product, name, sku: id === 'support' ? model.fit.supportSku : product.sku, disposition, charged: disposition === 'BUY' ? product.price : 0 };
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
      addBubble('user', value.toFixed(1) + ' inches');
      interaction.innerHTML = '';
      revealRecommendation();
    });
  }

  function fullStory() { return [model.opening, ...model.answers].join(' ').toLowerCase(); }

  function selectProducts(thread) {
    const story = fullStory();
    const areas = thread.areas || [];
    const thumbDenied = /\b(?:thumb (?:is|feels) fine|thumb (?:does not|doesn['’]?t) hurt|no thumb (?:pain|problem|symptoms)|not (?:in |at )?(?:my |the )?thumb)\b/.test(story);
    const combined = areas.includes('wrist') && areas.includes('thumb') && !thumbDenied;
    const thumbLanguage = /\b(?:thumb|base of (?:my |the )?thumb|thumb side)\b/.test(story);
    const wristOnly = areas.includes('wrist') && (thumbDenied || (!areas.includes('thumb') && !thumbLanguage));
    model.selection.support = wristOnly ? 'wrist' : 'combined';
    model.selection.recovery = /\b(?:heat|warmth|warming|stiff|stiffness|tight|tightness|morning|chronic)\b/.test(story) && !/\b(?:cold|ice|icing|swollen|swelling|after (?:activity|exercise|playing))\b/.test(story) ? 'heat' : 'cold';
    model.selection.comfort = /\b(?:patch|patches|hands[- ]?free|mess[- ]?free)\b/.test(story) ? 'patch' : 'gel';
    model.comfortEligible = model.woundAssessment !== 'minor' && !/\b(?:allerg(?:y|ic)|sensitive skin|no topical|don['’]?t want (?:a )?(?:cream|gel|patch|topical))\b/.test(story);
    const product = CATALOG.support[model.selection.support];
    if (product.fit === 'universal' && model.fit.wristInches <= 9.5) {
      model.fit.supportSize = 'Adjustable';
      model.fit.supportSku = product.sku;
    } else if (product.fit === 'sized') {
      if (model.fit.wristInches >= 5.1 && model.fit.wristInches < 6.3) model.fit.supportSize = 'Small';
      else if (model.fit.wristInches >= 6.3 && model.fit.wristInches <= 7.5) model.fit.supportSize = 'Medium';
      else if (model.fit.wristInches > 7.5 && model.fit.wristInches <= 9.1) model.fit.supportSize = 'Large';
      else model.fit.supportSize = null;
      model.fit.supportSku = model.fit.supportSize ? product.sku + '-' + model.fit.supportSize.charAt(0) : null;
    }
    return { combined, wristOnly };
  }

  function recommendationFor(thread) {
    const neuro = thread.symptoms.some(value => value === 'numbness' || value === 'tingling');
    const locationText = thread.locations.join(', ') || thread.areas.join(', ') || 'hand/wrist area';
    const locations = thread.side ? thread.side + ' — ' + locationText : locationText;
    const provider = (thread.provider || []).join(' ');
    const activities = (thread.triggers || []).join(', ');
    const combinedArea = model.selection.support === 'combined' && (thread.areas || []).includes('wrist') && (thread.areas || []).includes('thumb');
    const wristOnly = model.selection.support === 'wrist';
    const supportReason = combinedArea
      ? 'Because your symptoms involve both the wrist and thumb' + (activities ? ' and are aggravated by ' + activities : '') + ', a flexible combined support covers the required areas without jumping to a rigid immobilizer.'
      : wristOnly
        ? 'Your concern is centered at the wrist, so a neutral-position wrist support is a closer match than buying extra thumb coverage.'
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
    selectProducts(thread);
    model.recommendation = recommendationFor(thread);
    model.cart.support.disposition = model.recommendation.eligible && model.fit.supportSku && !model.recommendation.provider ? 'BUY' : 'REVIEW';
    const story = fullStory();
    const wantsOnlySupport = /\b(?:only|just)\s+(?:want|need|looking for)(?:\s+help\s+(?:choosing|finding))?\b[^.!?]{0,45}\b(?:brace|support|splint)\b|\b(?:brace|support|splint)\s+only\b/.test(story);
    const wantsComplete = /\b(?:complete|everything|most comprehensive|full package)\b/.test(story) || /\b(?:cream|patch|topical|biofreeze|pain (?:relief )?gel)\b/.test(story);
    model.recommendedPlan = wantsOnlySupport ? 'core' : wantsComplete && model.comfortEligible ? 'complete' : 'recovery';
    model.selectedPlan = model.recommendedPlan;
    model.cart.cold.disposition = model.selectedPlan === 'core' ? 'OPTIONAL' : 'BUY';
    model.cart.topical.disposition = model.selectedPlan === 'complete' ? 'BUY' : model.comfortEligible ? 'OPTIONAL' : 'REMOVE';
    renderSolution();
    showStage('solution');
  }

  function statusText(disposition, id) {
    if (disposition === 'BUY') return id === 'support' ? 'Recommended' : 'Selected add-on';
    if (disposition === 'REMOVE' && id === 'topical' && !model.comfortEligible) return 'Not available for this story';
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
    $('.planName', item).textContent = line.name;
    $('.planRole', item).textContent = id === 'support' ? 'Primary support' : id === 'cold' ? 'Matched recovery' : 'Optional comfort';
    const image = $('img', item);
    if (image) { image.src = line.image; image.alt = line.name; }
    if (id === 'support' && !model.fit.supportSku) $('.planCopy', item).textContent = 'The available support size is not verified for your measurement, so this item remains under review and cannot be purchased yet.';
    else if (id !== 'support') $('.planCopy', item).textContent = line.role + '. ' + (id === 'topical' ? 'Use only on intact skin and separately from the support.' : 'Follow the product label for timing and skin protection.');
    const removeButton = $('[data-tune="' + id + '"]');
    if (removeButton) removeButton.textContent = 'Remove ' + line.name.replace(/ — .+$/, '');
  }

  function renderTierCards() {
    const support = productLine('support');
    const recovery = productLine('cold');
    const comfort = productLine('topical');
    const definitions = [
      { id: 'core', label: 'Essential', title: 'Support + product guide', products: [support], delta: 'The support Keneflex selected for you' },
      { id: 'recovery', label: 'Recommended', title: 'Support + recovery + product guide', products: [support, recovery], delta: '<b>+' + money(recovery.price) + ':</b> adds ' + escapeHtml(recovery.role.toLowerCase()) },
      { id: 'complete', label: 'Complete', title: 'Support + recovery + comfort + product guide', products: [support, recovery, comfort], delta: '<b>+' + money(comfort.price) + ':</b> adds ' + escapeHtml(comfort.role.toLowerCase()), disabled: !model.comfortEligible }
    ];
    $('.planTiers').innerHTML = definitions.map(tier => {
      const selected = tier.id === model.selectedPlan;
      const recommended = tier.id === model.recommendedPlan;
      const tierTotal = tier.products.reduce((sum, product) => sum + product.price, 0);
      const badge = recommended ? 'Keneflex recommended' : tier.disabled ? 'Not appropriate for this story' : ({ core: 'Personalized foundation', recovery: 'Adds recovery', complete: 'Most comprehensive' })[tier.id];
      const visuals = tier.products.map(product => '<span class="tierProduct"><img alt="' + escapeHtml(product.name) + '" src="' + product.image + '"/><small>' + escapeHtml(product.id === 'support' ? 'Support' : product.id === 'cold' ? 'Recovery' : 'Comfort') + '</small></span>').join('');
      const included = tier.products.map(product => '<span>✓ ' + escapeHtml(product.name.replace(/ — .+$/, '')) + '</span>').join('');
      return '<button class="planTier' + (selected ? ' selected' : '') + (recommended ? ' featured' : '') + '" data-plan="' + tier.id + '" aria-pressed="' + selected + '"' + (tier.disabled ? ' disabled aria-disabled="true"' : '') + '><span class="tierTop"><span class="tierLabel">' + tier.label + '</span><span class="tierBadge' + (recommended ? ' recommendedBadge' : '') + '">' + badge + '</span></span><b>' + tier.title + '</b><div class="tierVisuals">' + visuals + '<span class="tierPlanIcon" aria-hidden="true"><i>K</i><small>Product guide</small></span></div><strong>' + money(tierTotal) + ' <small>total</small></strong><span class="tierDelta">' + tier.delta + '</span><span class="tierIncludes"><b>Your package includes:</b><span>✓ Personalized product guide</span>' + included + '</span><span class="tierChoice">' + (selected ? 'Selected' : tier.disabled ? 'Unavailable for this story' : 'Select ' + tier.label) + '</span></button>';
    }).join('');
    $$('[data-plan]', $('.planTiers')).forEach(button => button.addEventListener('click', () => selectPlan(button.dataset.plan)));
  }

  function renderSolution() {
    const rec = model.recommendation;
    const hasReview = lines().some(line => line.disposition === 'REVIEW');
    $('#solutionView .solHero h1').textContent = hasReview ? 'Review this before buying.' : 'The right product for what you described.';
    $('#solutionLead').textContent = hasReview ? rec.lead : 'Keneflex compares the relevant options and recommends what to buy, what to keep, or when buying something is not the right next step.';
    const wornBrace = wornBraceExplanation();
    $('#confidenceCopy').textContent = rec.neuro
      ? 'A product should not be treated as selected until it satisfies the altered-feeling pattern as well as the pain and activity requirements.'
      : wornBrace
        ? wornBrace
        : 'Your recommendation connects the selected products with practical guidance for fit, use, care, and knowing when the choice should be reconsidered.';
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
    renderTierCards();
    $('#total').textContent = money(total());
    $('#planName').textContent = planLabel();
    const summaryCount = lines().filter(line => line.disposition === 'BUY' || line.disposition === 'REVIEW').length;
    $('#selectionCount').textContent = hasReview
      ? summaryCount + (summaryCount === 1 ? ' product awaiting review' : ' products awaiting review') + ' + personalized product guide'
      : summaryCount + (summaryCount === 1 ? ' product' : ' products') + ' + personalized product guide';
    ensureCommerceControls();
  }

  function selectPlan(plan) {
    if (!['core', 'recovery', 'complete'].includes(plan)) return;
    if (plan === 'complete' && !model.comfortEligible) return;
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
      return setDisposition(kind, 'REMOVE', '<b>' + escapeHtml(productLine(kind).name) + ' removed.</b> It will not be included in your purchase.');
    }
  }

  function resetAdjustments() {
    model.cart.support.disposition = model.recommendation?.eligible && model.fit.supportSku && !model.recommendation?.provider ? 'BUY' : 'REVIEW';
    model.cart.cold.disposition = model.recommendedPlan === 'core' ? 'OPTIONAL' : 'BUY';
    model.cart.topical.disposition = model.recommendedPlan === 'complete' ? 'BUY' : model.comfortEligible ? 'OPTIONAL' : 'REMOVE';
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
      plan.textContent = 'Review my personalized product guide →';
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
      ? '<div class="kfxSafetyNotice"><b>Use separately.</b> Do not wear the support over the selected gel or patch. Apply topical products only as directed, and put the support on clean, dry skin.</div>'
      : '';
    const woundWarning = model.woundAssessment === 'minor'
      ? '<div class="kfxSafetyNotice"><b>Protect the scrape.</b> Clean and cover it. Do not place a brace or topical pain product directly over unprotected broken skin.</div>'
      : '';
    overlay.innerHTML = '<section class="kfxCheckout" role="dialog" aria-modal="true"><h2>Review your Keneflex purchase</h2><div class="rowx planIncluded"><span>Personalized product guide</span><b>Included</b></div>' + woundWarning + combinationWarning + '<div>' +
      selected.map(line => '<div class="rowx"><span>' + line.name + '</span><b>' + money(line.price) + '</b></div>').join('') +
      '</div><div class="totalx"><span>Total</span><span>' + money(total()) + '</span></div><div class="actions"><button class="primary" data-checkout-complete>Continue →</button><button class="secondary" data-checkout-close>Go back</button></div><p class="micro">This test will not place an order or charge you.</p></section>';
    document.body.appendChild(overlay);
    $('[data-checkout-close]', overlay).addEventListener('click', () => overlay.remove());
    $('[data-checkout-complete]', overlay).addEventListener('click', () => {
      $('.kfxCheckout', overlay).innerHTML = '<h2>Purchase choice recorded.</h2><p>No order was placed and you were not charged.</p><button class="secondary" data-checkout-close>Return to my plan</button>';
      $('[data-checkout-close]', overlay).addEventListener('click', () => overlay.remove());
    });
  }

  function planModules(thread, selected) {
    const provider = model.recommendation.provider;
    const support = selected.find(line => line.id === 'support');
    const cold = selected.find(line => line.id === 'cold');
    const topical = selected.find(line => line.id === 'topical');
    const modules = [];

    modules.push({
      id: 'start',
      title: 'Your recommendation',
      summary: 'What Keneflex selected and the role each product is meant to perform.',
      body: '<p><b>Area:</b> ' + escapeHtml(model.recommendation.locations || 'the area you described') + '</p>' +
        '<ol class="planChecklist"><li>Use only the products selected for the situation you described.</li><li>Follow the product-specific fit and use guidance in this guide.</li><li>Follow the manufacturer label and any professional instructions if they differ.</li><li>Reassess if the product does not fit, creates new symptoms, or is not helping as expected.</li></ol>' +
        (provider ? '<div class="kfxPlanNotice"><b>Provider direction controls.</b> ' + escapeHtml(provider) + ' Keneflex will not substitute a conflicting product or use schedule.</div>' : '')
    });

    if (support) modules.push({
      id: 'support',
      title: 'How to use your support',
      summary: 'The most relevant fit, timing, care, and safety directions for your selection.',
      body: '<p><b>' + escapeHtml(support.name) + '</b> was selected for this product role.</p><div class="planSteps"><div class="planStep"><b>Best use</b><p>' + escapeHtml(support.guide) + '</p></div><div class="planStep"><b>Confirm the fit</b><p>It should feel supportive without creating pressure, numbness, tingling, color change, or circulation concerns.</p></div><div class="planStep"><b>Label controls</b><p>Follow the package for positioning, cleaning, wear time, and contraindications.</p></div></div><p class="planFinePrint">Keneflex highlights the directions most relevant to your selection. The manufacturer label and any professional instructions remain controlling.</p>'
    });

    if (cold || topical) modules.push({
      id: 'recovery',
      title: 'How to use your recovery product',
      summary: 'When and how to use the additional product selected for your situation.',
      body: (cold ? '<div class="planComponent"><b>' + escapeHtml(cold.name) + '</b><p>' + escapeHtml(cold.guide) + '</p></div>' : '') +
        (topical ? '<div class="planComponent"><b>' + escapeHtml(topical.name) + '</b><p>' + escapeHtml(topical.guide) + '</p></div>' : '') +
        '<p class="planFinePrint">Only products actually selected and currently offered by Keneflex appear here. Follow each manufacturer label for exact use and warnings.</p>'
    });

    modules.push({
      id: 'followup',
      title: 'Check whether it is working',
      summary: 'How to judge the product fit and when the recommendation should be reconsidered.',
      body: '<div class="planSteps"><div class="planStep"><b>Good fit</b><p>The product performs its intended role without creating new pressure, skin, movement, or circulation problems.</p></div><div class="planStep"><b>Needs adjustment</b><p>Recheck sizing, placement, wear time, and whether you are using it for the situation it was selected for.</p></div><div class="planStep"><b>Not helping</b><p>Reassess the product match rather than automatically adding more products. Professional evaluation may be the better next step.</p></div></div>'
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
    overlay.innerHTML = '<div class="kfxPlanPage"><header><div class="logo">KENEFLEX</div><div class="planHeaderActions"><button class="secondary" type="button" data-plan-print>Print product guide</button><button class="secondary" type="button" data-plan-close>Back to recommendation</button></div></header><main><section class="planHero"><div class="eyebrow">Your personalized Keneflex product guide</div><h1>Use the products selected for you with confidence.</h1><p>See the directions that matter most for your situation, while keeping the manufacturer label and any professional instructions in control.</p></section><section class="card planAtGlance"><h2>Your guide at a glance</h2><p><b>Area:</b> ' + escapeHtml(model.recommendation.locations || 'as described') + '</p><div class="planTopicNav">' + modules.map(module => '<button type="button" data-plan-jump="' + escapeHtml(module.id) + '">' + escapeHtml(module.title) + '</button>').join('') + '</div></section><section class="planModules">' + modules.map(renderPlanModule).join('') + '</section><section class="card finalSelection"><div class="finalSelectionTop"><div><div class="eyebrow">Your selected purchase</div><h2>' + escapeHtml(planLabel()) + '</h2><p>Your personalized product guide is included with the products selected for you.</p></div><div class="finalTotal">' + money(total()) + '<small>product total</small></div></div><div class="finalProducts"><div class="planLine planIncluded"><span>Personalized product guide</span><b>Included</b></div>' + selected.map(line => '<div class="planLine"><span>' + escapeHtml(line.name) + '</span><b>' + (line.disposition === 'BUY' ? money(line.price) : 'Review') + '</b></div>').join('') + '</div><button class="primary kfxFinalBuy"' + (hasReview ? ' disabled' : '') + '>' + (hasReview ? 'Review needed before checkout' : 'Buy the ' + escapeHtml(planLabel()) + ' plan — ' + money(total()) + ' total') + '</button></section></main></div>';
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
      how: '<h2>How Keneflex works</h2><p>Tell us what is bothering you—or what kind of product you already want. Keneflex asks only what could change the choice or safety decision, compares the relevant options, and recommends what to buy, keep, or skip.</p>',
      approach: '<h2>Our approach</h2><p>Product fit, function, safety, limitations, and reasonable non-product options come before a purchase.</p>'
    }[key];
    if (!content) return;
    $('#modalContent').innerHTML = content;
    $('#modal').classList.remove('hidden');
  }

  function applyConsumerCopy() {
    const guideNames = {
      core: 'Support + product guide',
      recovery: 'Support + recovery + product guide',
      complete: 'Support + recovery + comfort + product guide'
    };
    $$('.planTier').forEach(card => {
      const title = $(':scope > b', card);
      const iconLabel = $('.tierPlanIcon small', card);
      const includedGuide = $('.tierIncludes span', card);
      if (title) title.textContent = guideNames[card.dataset.plan];
      if (iconLabel) iconLabel.textContent = 'Product guide';
      if (includedGuide) includedGuide.textContent = '✓ Personalized product guide';
    });
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

  root.KeneflexParticipant = Object.freeze({ model, PRODUCTS, CATALOG, total, lines, activeProblem, renderSolution, selectPlan });
  bind();
})(window);
