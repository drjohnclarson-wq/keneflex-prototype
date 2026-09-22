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
  const productFallback = (label, color) => 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><rect width="240" height="240" rx="30" fill="#f5f7f4"/><path d="M55 76c0-12 10-22 22-22h86c12 0 22 10 22 22v88c0 12-10 22-22 22H77c-12 0-22-10-22-22z" fill="' + color + '"/><path d="M75 98h90M75 121h90M75 144h65" stroke="white" stroke-width="9" stroke-linecap="round" opacity=".88"/><text x="120" y="214" text-anchor="middle" font-family="Arial" font-size="15" font-weight="700" fill="#143f43">' + label + '</text></svg>');
  const CATALOG = Object.freeze({
    support: Object.freeze({
      combined: { id: 'support', sku: 'NEOG-AIRFLOW-WT', name: 'Neo G Airflow Wrist & Thumb Support', price: 19.99, role: 'Flexible wrist and thumb support', image: 'https://www.neo-g.com/cdn/shop/files/722-13-Box_R_1080x.png?v=1725268865', fallback: productFallback('WRIST + THUMB SUPPORT', '#143f43'), fit: 'sized', sizes: [{ code: 'S', name: 'Small', descriptor: 'Smaller / slender', min: 5.1, max: 6.3 }, { code: 'M', name: 'Medium', descriptor: 'Average', min: 6.3, max: 7.5 }, { code: 'L', name: 'Large', descriptor: 'Larger / broader', min: 7.5, max: 9.1 }], guide: 'Apply it only to clean, intact, dry skin with no gel, cream, or ointment underneath. Confirm that it supports without uncomfortable pressure, altered feeling, color change, or circulation concerns. Do not wear it for prolonged periods such as while sleeping. Follow the label for positioning, wear time, and cleaning.' },
      wrist: { id: 'support', sku: 'BRACEABILITY-11H11', name: 'BraceAbility Volar Wrist Splint', price: 24.99, role: 'Neutral-position wrist support', image: 'https://www.braceability.com/cdn/shop/files/11h11-braceability-volar-wrist-splint.jpg?v=1710426144&width=800', fallback: productFallback('VOLAR WRIST SPLINT', '#143f43'), fit: 'universal', fitLabel: 'Adjustable fit', maxWrist: 9.5, guide: 'Use the adjustable straps to hold the wrist in a comfortable neutral position. The fingers should remain free and the brace should not create pressure, altered feeling, color change, or circulation concerns. Follow the label for use, stay removal, and hand washing.' }
    }),
    recovery: Object.freeze({
      cold: { id: 'cold', sku: 'POLAR-SPW8', name: 'Polar Soft Ice Wrist Wrap', price: 21.00, role: 'Reusable flexible cold recovery', image: 'https://trkmedicalproducts.com/cdn/shop/products/41_999x.jpg?v=1626891716', fallback: productFallback('COLD WRIST WRAP', '#356d85'), guide: 'Use after an aggravating activity or when cold feels helpful. Protect the skin, use only for the label-directed time, and stop for skin changes, excessive numbness, or worsening symptoms.' },
      heat: { id: 'cold', sku: 'POLAR-MHW', name: 'Polar Thera-Temp Moist Heat Wrist & Hand Wrap', price: 22.00, role: 'Reusable moist heat for stiffness or tightness', image: 'https://cdn.shopify.com/s/files/1/0628/5806/8128/files/MHW_Wrist_02_WEB.jpg?v=1783956563', fallback: productFallback('MOIST HEAT WRAP', '#8b4c2f'), guide: 'Use when warmth feels helpful for stiffness or muscle tightness. Check temperature before applying, use only for the label-directed time, and never use while sleeping or on skin with reduced sensation.' }
    }),
    comfort: Object.freeze({
      gel: { id: 'topical', sku: 'BIOFREEZE-GEL-4', name: 'Biofreeze Pain Relief Gel, menthol 4%', price: 11.99, role: 'Temporary topical comfort gel', image: 'https://biofreeze.com/static/a06132b8965c43644a3e10fc5aae7a80/7b187/en-US-bf_retailgeltubegreen.png', fallback: productFallback('PAIN RELIEF GEL', '#356d58'), guide: 'Apply only as directed on intact skin. Wash hands after use unless treating the hands. Do not bandage tightly, use with a heating device, or place the support over the gel.' },
      patch: { id: 'topical', sku: 'BIOFREEZE-PATCH-5', name: 'Biofreeze Pain Relief Patch, menthol 5%', price: 12.99, role: 'Temporary hands-free comfort patch', image: 'https://i5.walmartimages.com/seo/Biofreeze-Pain-Relief-Patches-for-Back-Knee-Muscle-Joint-and-Arthritis-Pain-5ct-Menthol_bfb29817-3153-4ca8-a456-5c7aac5d3b89.3813a49452b958e24da1c6e2e5e1865b.jpeg?odnBg=FFFFFF&odnHeight=424&odnWidth=424', fallback: productFallback('PAIN RELIEF PATCH', '#356d58'), guide: 'Adults and children 12 and older: apply only as directed to clean, dry, intact skin and remove within 8 hours. Do not use more than 3 to 4 times daily, bandage tightly, use with a heating device, or place the support over the patch. For children under 12, consult a physician.' }
    })
  });
  const PRODUCTS = Object.freeze({ support: CATALOG.support.combined, cold: CATALOG.recovery.cold, topical: CATALOG.comfort.gel });

  const model = {
    release: '0.8.0',
    story: Engine.createStore(),
    opening: '',
    turns: [],
    interpretationMode: 'deterministic-fallback',
    stage: 'intro',
    answers: [],
    safetyCleared: false,
    woundAssessment: 'unknown',
    recommendation: null,
    fit: { wristInches: null, supportSize: null, supportSku: null, method: null },
    selection: { support: 'combined', recovery: 'cold', comfort: 'gel' },
    comfortEligible: true,
    cart: {
      support: { disposition: 'BUY' },
      cold: { disposition: 'OPTIONAL' },
      topical: { disposition: 'OPTIONAL' }
    },
    selectedPlan: 'core',
    recommendedPlan: 'core',
    lastAnswered: null,
    questionBudget: 5,
    questionsAsked: 0
  };
  const acknowledgedFamilies = new Set();

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
    return ({ core: 'Support only', recovery: 'Support + recovery', complete: 'Add comfort relief' })[model.selectedPlan] || 'Custom selection';
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

  async function refreshInterpretation(fallbackText) {
    try {
      const response = await fetch('./api/interpret-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turns: model.turns }),
        signal: AbortSignal.timeout(8000)
      });
      if (!response.ok) throw new Error('interpretation unavailable');
      const payload = await response.json();
      if (!payload?.interpretation?.problems?.length) throw new Error('empty interpretation');
      model.story = Engine.mergeInterpretation(model.story, payload.interpretation, model.turns.filter(turn => turn.role === 'user').map(turn => turn.content));
      model.interpretationMode = 'ai';
    } catch (_) {
      Engine.ingest(model.story, fallbackText);
      model.interpretationMode = 'deterministic-fallback';
    }
  }

  function composer(question) {
    let submitting = false;
    const interaction = $('#interaction');
    interaction.innerHTML = '<textarea id="reply" aria-label="Your answer" placeholder="Answer in your own words."></textarea><div class="row"><button id="send" class="primary">Continue →</button></div>';
    const submit = async () => {
      if (submitting) return;
      const value = $('#reply').value.trim();
      if (!value) return;
      submitting = true;
      $('#send').disabled = true;
      addBubble('user', value);
      model.answers.push(value);
      model.turns.push({ role: 'user', content: value });
      const locationUncertain = /\b(?:i\s+)?(?:do not|don't|cannot|can't)\s+(?:know|tell|locate)|\b(?:i\s+)?(?:have\s+)?no idea\b|\bnot sure\b|\bunsure\b/i.test(value);
      const hasLocationDetail = /\b(?:palm|top|back|thumb|knuckle|crease|side|base|joint|finger|inside|outside|near|below|above)\b/i.test(value);
      if (question.concept === 'preciseLocation' && locationUncertain && !hasLocationDetail) {
        interaction.innerHTML = '';
        addBubble('ai', '<p>That is okay. Please describe the closest area you can identify—for example, the palm side, top of the wrist, thumb knuckle, or another spot you can point to.</p>', true);
        composer(question);
        return;
      }
      const fallbackValue = question.concept === 'preciseLocation'
        ? value.replace(/\bback(?:\s+side)?\s+of\s+(?=(?:my|the)\s+(?:wrist|hand|thumb))/ig, 'posterior side of ')
        : value;
      const answeredThread = activeProblem();
      await refreshInterpretation(fallbackValue);
      const restoredThread = storyThreads().find(candidate => candidate.family === answeredThread?.family && (!answeredThread?.side || candidate.side === answeredThread.side));
      if (restoredThread) model.story.active = threadKey(restoredThread);
      const contextualConcept = Engine.questionConcept(question.text) || question.concept;
      Engine.recordContextAnswer(model.story, contextualConcept, value);
      const contextualThread = activeProblem();
      model.lastAnswered = contextualThread && Engine.known(contextualThread, contextualConcept)
        ? { concept: contextualConcept, threadKey: threadKey(contextualThread) }
        : null;
      if (question.concept === 'preciseLocation' && model.interpretationMode !== 'ai') {
        const thread = activeProblem();
        if (thread && !Engine.known(thread, 'preciseLocation')) thread.locations.push(value);
        if (thread) model.story.active = threadKey(thread);
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
    if (stopForNeurologicRisk(thread, $('#interaction'))) return;
    if (Engine.adequate(model.story)) {
      if (!thread || hasUnsupportedRegion()) {
        addBubble('ai', '<p><b>I have enough of the story to understand the concern.</b></p><p>This participant build currently completes product recommendations only for the hand, wrist, and thumb pathway. I will not substitute a hand product for a ' + (thread?.family || 'different') + ' problem.</p>', true);
        $('#interaction').innerHTML = '';
        return;
      }
      safetyGate();
      return;
    }
    if (model.questionsAsked >= model.questionBudget) {
      addBubble('ai', '<p><b>I do not have enough information to make a responsible product selection yet.</b></p><p>Please add the missing detail in a new session or ask a qualified professional for help. I will not keep asking questions without making progress.</p>', true);
      $('#interaction').innerHTML = '';
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
    const family = thread?.family;
    const regional = family && !acknowledgedFamilies.has(family) ? regionalMessage(thread) : '';
    if (family) acknowledgedFamilies.add(family);
    const clarification = (model.story.ai?.clarifications || []).find(item => item.concept === question.concept);
    const clarificationConcept = clarification?.question ? Engine.questionConcept(clarification.question) : null;
    if (clarification?.question && clarificationConcept === question.concept) question = { ...question, text: clarification.question };
    const questionConcept = Engine.questionConcept(question.text) || question.concept;
    if (model.lastAnswered?.concept === questionConcept && model.lastAnswered.threadKey === threadKey(thread)) {
      const next = Engine.nextQuestion(model.story);
      if (next && next.concept !== questionConcept) question = next;
    }
    model.turns.push({ role: 'assistant', content: question.text });
    model.questionsAsked += 1;
    addBubble('ai', (regional ? '<p>' + escapeHtml(regional) + '</p>' : '') + '<p><b>' + escapeHtml(question.text) + '</b></p>', true);
    composer(question);
  }

  function safetyGate() {
    if (model.safetyCleared) return revealRecommendation();
    const interaction = $('#interaction');
    const thread = activeProblem();
    if (stopForNeurologicRisk(thread, interaction)) return;
    const deformityStatus = latestDeformityStatus();
    if (deformityStatus === 'reported') {
      addBubble('ai', '<p><b>Self-care should pause here.</b></p><p>You reported visible deformity or that the area looks crooked, misshapen, or out of place. That can change what is safe, so seek an appropriate in-person medical evaluation before choosing a support or continuing this plan.</p>', true);
      interaction.innerHTML = '';
      return;
    }
    const woundAssessment = latestWoundAssessment();
    model.woundAssessment = woundAssessment;
    if (woundAssessment === 'concerning') {
      addBubble('ai', '<p><b>Self-care should pause here.</b></p><p>You described an open injury with a serious feature such as uncontrolled bleeding, exposed tissue, a bite or puncture, contamination, or signs of infection. Seek appropriate in-person medical care before choosing a product.</p>', true);
      interaction.innerHTML = '';
      return;
    }
    const minorWoundNotice = woundAssessment === 'minor'
      ? '<p><b>A minor scrape does not automatically require medical care.</b> Wash it with soap and water, cover it with a clean bandage, and watch for worsening redness, drainage, swelling, or pain. Do not place a brace or topical pain product directly over unprotected broken skin.</p>'
      : '';
    addBubble('ai', minorWoundNotice + '<p><b>Please read this before continuing.</b></p><p>Keneflex is for minor, non-emergency concerns. Do not continue here if you have:</p><ul><li>an injury with exposed bone, a joint clearly out of place, or bleeding that will not stop;</li><li>a hand or fingers that turned blue, very pale, or cold after an injury; or</li><li>sudden face drooping, trouble speaking, or new weakness affecting one side of the body.</li></ul><p>If your symptoms are getting worse or are not improving with self-care, contact an appropriate healthcare professional.</p>', true);
    interaction.innerHTML = '<div class="options safetyOptions"><button class="opt safetyAck" data-safety="clear">I have read this. None of these apply.</button><button class="opt" data-safety="stop">One of these applies</button></div>';
    $$('[data-safety]', interaction).forEach(button => button.addEventListener('click', () => {
      addBubble('user', button.textContent.trim());
      interaction.innerHTML = '';
      if (button.dataset.safety === 'stop') {
        addBubble('ai', '<p><b>Do not continue with product selection.</b></p><p>Seek appropriate urgent or emergency medical care for the warning sign you recognized.</p>', true);
        return;
      }
      model.safetyCleared = true;
      revealRecommendation();
    }));
  }

  function stopForNeurologicRisk(thread, interaction) {
    const neurologicRisk = neurologicRiskFor(thread);
    if (neurologicRisk === 'urgent') {
      addBubble('ai', '<p><b>Seek urgent medical help now.</b></p><p>Sudden hand or arm numbness or weakness together with face, speech, balance, coordination, or whole-arm changes is not a product-selection situation.</p>', true);
      interaction.innerHTML = '';
      return true;
    }
    return false;
  }

  function neurologicRiskFor(thread) {
    const story = fullStory();
    const hasNeurologicSymptom = (thread?.symptoms || []).some(value => value === 'numbness' || value === 'tingling' || value === 'weakness');
    if (!hasNeurologicSymptom) return 'routine';
    const sudden = /\b(?:sudden(?:ly)?|all at once|just started|within (?:minutes?|hours?))\b/.test(story);
    const broaderChange = /\b(?:face|facial|speech|speaking|slurred|balance|coordination|whole arm|entire arm|one side of (?:my |the )?body)\b/.test(story);
    if (sudden && broaderChange) return 'urgent';
    return 'routine';
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
    // A generic mention of a cut or scrape is not enough to stop product
    // selection. Only explicit serious wound features trigger the hard stop;
    // otherwise treat the area as minor broken skin and apply protection rules.
    return concerning ? 'concerning' : 'minor';
  }

  function fullStory() { return [model.opening, ...model.answers].join(' ').toLowerCase(); }

  function supportProduct() { return CATALOG.support[model.selection.support]; }

  function sizesForMeasurement(product, value) {
    return (product.sizes || []).filter(size => value >= size.min && value <= size.max);
  }

  function setSupportFit(size, method, wristInches = null, confirmed = false) {
    const product = supportProduct();
    if (!size || product.fit !== 'sized') return;
    model.fit.supportSize = size.name;
    model.fit.supportSku = confirmed ? product.sku + '-' + size.code : null;
    model.fit.wristInches = wristInches;
    model.fit.method = method;
    renderSolution();
  }

  function fitPending() {
    return model.cart.support.disposition === 'BUY' && !model.fit.supportSku;
  }

  function selectProducts(thread) {
    const story = fullStory();
    const areas = thread.areas || [];
    const thumbDenied = /\b(?:thumb (?:is|feels) fine|thumb (?:does not|doesn['’]?t) hurt|no thumb (?:pain|problem|symptoms)|not (?:in |at )?(?:my |the )?thumb)\b/.test(story);
    const sensory = thread.sensory || [];
    const medianSensoryPattern = sensory.some(value => value === 'thumb' || value === 'index' || value === 'middle') && !sensory.includes('pinky');
    const combined = areas.includes('wrist') && areas.includes('thumb') && !thumbDenied;
    const thumbLanguage = /\b(?:thumb|base of (?:my |the )?thumb|thumb side)\b/.test(story);
    const wristOnly = areas.includes('wrist') && (thumbDenied || (!areas.includes('thumb') && !thumbLanguage));
    model.selection.support = medianSensoryPattern || wristOnly ? 'wrist' : 'combined';
    model.selection.recovery = /\b(?:heat|warmth|warming|stiff|stiffness|tight|tightness|morning|chronic)\b/.test(story) && !/\b(?:cold|ice|icing|swollen|swelling|after (?:activity|exercise|playing))\b/.test(story) ? 'heat' : 'cold';
    model.selection.comfort = /\b(?:patch|patches|hands[- ]?free|mess[- ]?free)\b/.test(story) ? 'patch' : 'gel';
    model.comfortEligible = model.woundAssessment !== 'minor' && !/\b(?:allerg(?:y|ic)|sensitive skin|no topical|don['’]?t want (?:a )?(?:cream|gel|patch|topical))\b/.test(story);
    const product = CATALOG.support[model.selection.support];
    if (product.fit === 'universal') {
      model.fit.supportSize = product.fitLabel || 'Adjustable';
      model.fit.wristInches = null;
      if (model.fit.supportSku !== product.sku) {
        model.fit.supportSku = product.sku;
        model.fit.method = 'adjustable';
      }
    } else if (!model.fit.supportSku || !model.fit.supportSku.startsWith(product.sku + '-')) {
      model.fit.supportSize = null;
      model.fit.supportSku = null;
      model.fit.wristInches = null;
      model.fit.method = null;
    }
    return { combined, wristOnly };
  }

  function recommendationFor(thread) {
    const neuro = thread.symptoms.some(value => value === 'numbness' || value === 'tingling');
    const sensory = thread.sensory || [];
    const medianSensoryPattern = sensory.some(value => value === 'thumb' || value === 'index' || value === 'middle') && !sensory.includes('pinky');
    const neuroRisk = neurologicRiskFor(thread);
    const neuroEligible = neuro && medianSensoryPattern && neuroRisk === 'routine';
    const needsNeuroReview = neuro && !neuroEligible;
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
      eligible: !neuro || neuroEligible,
      needsNeuroReview,
      supportReason: neuroEligible
        ? 'The gradual numbness or tingling pattern you described involves the thumb, index, or middle-finger side of the hand. A neutral-position wrist support is a closer product match than automatically adding thumb immobilization.'
        : needsNeuroReview
          ? 'The altered-feeling pattern does not match the current neutral-wrist-support pathway closely enough for Keneflex to complete the product choice.'
        : supportReason,
      lead: needsNeuroReview
        ? 'Keneflex found nerve-type symptoms, but the available product pathway does not match them closely enough to complete this purchase decision.'
        : 'A conservative plan built around the location, activity pattern, and safety information you provided.'
    };
  }

  function revealRecommendation() {
    const thread = activeProblem();
    selectProducts(thread);
    model.recommendation = recommendationFor(thread);
    model.cart.support.disposition = model.recommendation.eligible && !model.recommendation.provider ? 'BUY' : 'REVIEW';
    const story = fullStory();
    const wantsOnlySupport = /\b(?:only|just)\s+(?:want|need|looking for)(?:\s+help\s+(?:choosing|finding))?\b[^.!?]{0,45}\b(?:brace|support|splint)\b|\b(?:brace|support|splint)\s+only\b/.test(story);
    const wantsComplete = /\b(?:complete|everything|most comprehensive|full package)\b/.test(story) || /\b(?:want|prefer|looking for|asked for|need)\b[^.!?]{0,45}\b(?:cream|patch|topical|biofreeze|pain (?:relief )?gel)\b/.test(story);
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
    const pendingFit = id === 'support' && fitPending();
    state.textContent = pendingFit ? 'Choose size' : statusText(line.disposition, id);
    state.className = 'planState ' + (pendingFit ? 'pending' : line.disposition === 'BUY' ? 'buy' : line.disposition === 'REMOVE' ? 'remove' : line.disposition === 'OPTIONAL' ? 'optional' : 'keep');
    $('#' + id + 'Price').textContent = line.disposition === 'BUY' ? money(line.price) : line.disposition === 'OPTIONAL' ? '+' + money(line.price) : '$0';
    $('.planName', item).textContent = line.name;
    $('.planRole', item).textContent = id === 'support' ? 'Primary support' : id === 'cold' ? 'Matched recovery' : 'Optional comfort';
    const image = $('img', item);
    if (image) { image.src = line.image; image.alt = line.name; image.dataset.fallback = line.fallback; }
    if (id === 'support' && !model.fit.supportSku) $('.planCopy', item).textContent = 'The available support size is not verified for your measurement, so this item remains under review and cannot be purchased yet.';
    else if (id !== 'support') $('.planCopy', item).textContent = line.role + '. ' + (id === 'topical' ? 'Use only on intact skin and separately from the support.' : 'Follow the product label for timing and skin protection.');
    const removeButton = $('[data-tune="' + id + '"]');
    if (removeButton) removeButton.textContent = 'Remove ' + line.name.replace(/ — .+$/, '');
  }

  function renderFitChooser() {
    $('.fitChooser')?.remove();
    const product = supportProduct();
    const item = $('#supportItem');
    if (!item || model.cart.support.disposition !== 'BUY') return;
    const panel = document.createElement('section');
    panel.className = 'fitChooser';
    if (product.fit === 'universal') {
      panel.innerHTML = '<div class="fitChooserTop"><div><div class="eyebrow">Fit</div><h3>One adjustable adult size</h3></div><span class="fitConfirmed">No size choice</span></div><p>This support uses adjustable straps. BraceAbility lists the adult fit for wrists up to ' + product.maxWrist.toFixed(1) + ' inches.</p><p class="fitSelection"><b>You can continue without measuring.</b> If you already know your wrist is larger than the listed limit, this product may not fit.</p>';
      item.after(panel);
      return;
    }
    const selected = model.fit.supportSize;
    const chart = product.sizes.map(size => '<div class="fitChartRow' + (selected === size.name ? ' selected' : '') + '"><b>' + size.name + '</b><span>' + size.min.toFixed(1) + '–' + size.max.toFixed(1) + ' in</span></div>').join('');
    const choices = product.sizes.map(size => '<button type="button" class="fitChoice' + (selected === size.name ? ' selected' : '') + '" data-fit-size="' + size.code + '" aria-pressed="' + (selected === size.name) + '"><b>' + size.descriptor + '</b><span>Estimate ' + size.name + '</span></button>').join('') + '<button type="button" class="fitChoice" data-fit-unsure><b>Not sure</b><span>Open the size chart</span></button>';
    const confirmation = selected ? '<p class="fitSelection"><b>Starting size: ' + escapeHtml(selected) + '.</b> ' + (model.fit.method === 'measurement' ? 'Based on your ' + model.fit.wristInches.toFixed(1) + '-inch wrist measurement.' : 'Based on the body-build description you selected. You can continue now, or check the exact package chart below if you are unsure or near a boundary.') + '</p>' : '<p class="fitSelection"><b>Choose the description closest to you.</b> We will select a practical starting size. The exact package chart remains available below.</p>';
    const nextStep = model.fit.supportSku ? '<button class="secondary fitNext" type="button">Size set—choose a package below ↓</button>' : '';
    panel.innerHTML = '<div class="fitChooserTop"><div><div class="eyebrow">Choose your fit</div><h3>Which best describes your wrist?</h3></div>' + (selected ? '<span class="fitConfirmed">' + escapeHtml(selected) + '</span>' : '') + '</div><div class="fitChoices">' + choices + '</div>' + confirmation + nextStep + '<details class="fitDetails"><summary>See the exact package size chart or measure</summary><div class="fitDetailsBody"><p><b>Measure around the wrist crease.</b> No soft tape? Wrap a string or strip of paper around the wrist, mark where it meets, then place it against a ruler.</p><div class="fitChart" aria-label="Product package wrist size chart">' + chart + '</div><div class="fitMeasureRow"><label for="fitMeasure">Wrist circumference in inches</label><div><input id="fitMeasure" inputmode="decimal" aria-describedby="fitMeasureError" placeholder="For example, 7.0"><button id="fitMeasureContinue" class="secondary" type="button">Use measurement</button></div><p id="fitMeasureError" class="micro" aria-live="polite"></p></div></div></details><p class="fitFinePrint">Body-build descriptions provide a practical starting size. Compare the exact package ranges if you are unsure, and confirm comfort and fit when the product arrives.</p>';
    item.after(panel);
    $$('[data-fit-size]', panel).forEach(button => button.addEventListener('click', () => {
      const size = product.sizes.find(candidate => candidate.code === button.dataset.fitSize);
      setSupportFit(size, 'self-description', null, true);
    }));
    $('[data-fit-unsure]', panel).addEventListener('click', () => {
      const details = $('.fitDetails', panel);
      details.open = true;
      details.scrollIntoView({ block: 'nearest' });
      $('#fitMeasure', panel).focus();
    });
    $('#fitMeasureContinue', panel).addEventListener('click', () => {
      const value = Number(String($('#fitMeasure', panel).value).replace(/[^0-9.]/g, ''));
      const candidates = Number.isFinite(value) ? sizesForMeasurement(product, value) : [];
      if (!candidates.length) {
        model.fit.supportSize = null;
        model.fit.supportSku = null;
        model.fit.wristInches = value || null;
        model.fit.method = 'measurement';
        renderSolution();
        const nextPanel = $('.fitChooser');
        $('.fitDetails', nextPanel).open = true;
        $('#fitMeasureError', nextPanel).textContent = 'Keneflex cannot confirm a fit from the currently available sizes (5.1 to 9.1 inches). Please recheck the measurement; this support cannot be purchased if it remains outside that range.';
        return;
      }
      if (candidates.length > 1) {
        model.fit.supportSize = null;
        model.fit.supportSku = null;
        model.fit.wristInches = value;
        model.fit.method = 'measurement';
        renderSolution();
        const nextPanel = $('.fitChooser');
        $('.fitDetails', nextPanel).open = true;
        $('#fitMeasureError', nextPanel).textContent = value.toFixed(1) + ' inches appears in two adjacent package ranges (' + candidates.map(candidate => candidate.name).join(' and ') + '). Choose the fit you prefer above, then confirm it against the package chart.';
        return;
      }
      setSupportFit(candidates[0], 'measurement', value, true);
    });
    $('.fitNext', panel)?.addEventListener('click', () => $('.planChooser')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  function renderTierCards() {
    const support = productLine('support');
    const recovery = productLine('cold');
    const comfort = productLine('topical');
    const definitions = [
      { id: 'core', label: 'Support only', title: 'Primary product', products: [support], delta: 'The support Keneflex selected for you' },
      { id: 'recovery', label: 'Support + recovery', title: 'Matched functional support', products: [support, recovery], delta: '<b>+' + money(recovery.price) + ':</b> adds ' + escapeHtml(recovery.role.toLowerCase()) },
      { id: 'complete', label: 'Add comfort relief', title: 'Includes temporary comfort', products: [support, recovery, comfort], delta: '<b>+' + money(comfort.price) + ':</b> adds ' + escapeHtml(comfort.role.toLowerCase()), disabled: !model.comfortEligible }
    ];
    $('.planTiers').innerHTML = definitions.map(tier => {
      const selected = tier.id === model.selectedPlan;
      const recommended = tier.id === model.recommendedPlan;
      const tierTotal = tier.products.reduce((sum, product) => sum + product.price, 0);
      const badge = recommended ? 'Keneflex recommended' : tier.disabled ? 'Not appropriate for this story' : ({ core: 'Primary product', recovery: 'Adds recovery', complete: 'Optional comfort' })[tier.id];
      const visuals = tier.products.map(product => '<span class="tierProduct"><img alt="' + escapeHtml(product.name) + '" src="' + product.image + '" data-fallback="' + product.fallback + '"/><small>' + escapeHtml(product.id === 'support' ? 'Support' : product.id === 'cold' ? 'Recovery' : 'Comfort') + '</small></span>').join('');
      const included = tier.products.map(product => '<span>✓ ' + escapeHtml(product.name.replace(/ — .+$/, '')) + '</span>').join('');
      return '<button class="planTier' + (selected ? ' selected' : '') + (recommended ? ' featured' : '') + '" data-plan="' + tier.id + '" aria-pressed="' + selected + '"' + (tier.disabled ? ' disabled aria-disabled="true"' : '') + '><span class="tierTop"><span class="tierLabel">' + tier.label + '</span><span class="tierBadge' + (recommended ? ' recommendedBadge' : '') + '">' + badge + '</span></span><b>' + tier.title + '</b><div class="tierVisuals">' + visuals + '</div><span class="tierMatchReport"><span aria-hidden="true">+</span><span><b>Your Keneflex Product Match Report</b><small>Why these products fit · sizing · how to use them</small></span></span><strong>' + money(tierTotal) + ' <small>total</small></strong><span class="tierDelta">' + tier.delta + '</span><span class="tierIncludes"><b>Your package includes:</b><span>✓ Keneflex Product Match Report</span>' + included + '</span><span class="tierChoice">' + (selected ? 'Selected' : tier.disabled ? 'Unavailable for this story' : 'Select ' + tier.label) + '</span></button>';
    }).join('');
    $$('[data-plan]', $('.planTiers')).forEach(button => button.addEventListener('click', () => selectPlan(button.dataset.plan)));
    $('.selectionReasons')?.remove();
    const suggestedProducts = lines().filter(product => product.disposition !== 'REMOVE');
    const reasonFor = product => {
      if (product.id === 'support' && model.selection.support === 'combined') return {
        claim: 'Neo G says this flexible support helps support injured, weak, or arthritic wrists and thumbs during everyday, work, or sporting activities.',
        fit: 'You described symptoms involving both your wrist and thumb, so one flexible support covers both areas while preserving useful movement.'
      };
      if (product.id === 'support') return {
        claim: 'BraceAbility says this volar splint holds the wrist and forearm in a resting, neutral position while leaving the fingers free.',
        fit: model.recommendation.neuro
          ? 'You described gradual numbness or tingling on the thumb, index, or middle-finger side of the hand, so a neutral-position wrist support is a closer match than adding thumb restriction.'
          : 'You described a concern centered at the wrist, so this targets the wrist without adding thumb coverage you may not need.'
      };
      if (product.id === 'cold' && model.selection.recovery === 'heat') return {
        claim: 'Polar says this microwaveable wrap provides moist heat intended to soothe muscle tightness, joint discomfort, and stiff joints.',
        fit: 'You described stiffness or tightness, so targeted warmth is a closer recovery match than automatically choosing cold.'
      };
      if (product.id === 'cold') return {
        claim: 'Polar says this reusable wrap delivers targeted hot or cold therapy with a snug, supportive fit. Used cold, it is intended to soothe aches and help reduce swelling.',
        fit: 'You described soreness that worsens with use, so the wrap offers a hands-free way to apply cold to the wrist after an aggravating activity.'
      };
      if (model.selection.comfort === 'patch') return {
        claim: 'Biofreeze says its cooling menthol patch provides temporary relief for minor muscle and joint aches in a hands-free, mess-free format.',
        fit: 'You indicated that you prefer a patch or mess-free option, so this is offered for optional temporary comfort—not as the primary support.'
      };
      return {
        claim: 'Biofreeze says its cooling menthol gel provides fast-acting relief for sore muscles and joints and can be applied to small or large areas.',
        fit: 'This is offered as an optional way to add temporary comfort around the sore area. It does not replace the primary support or recovery product.'
      };
    };
    const roleFor = product => {
      if (product.disposition === 'REVIEW') return 'Confirm before purchase';
      if (product.id === 'support') return 'Primary product';
      if (product.id === 'cold') return product.disposition === 'BUY' ? 'Selected recovery' : 'Optional recovery';
      return product.disposition === 'BUY' ? 'Selected comfort' : 'Optional comfort';
    };
    const details = document.createElement('details');
    details.className = 'selectionReasons';
    details.innerHTML = '<summary>Why Keneflex suggested these products</summary><div class="selectionReasonBody"><p class="selectionReasonLead">Manufacturer descriptions explain what each product is designed to do. Keneflex then connects that role to what you told us. Optional items are labeled clearly.</p>' + (suggestedProducts.length ? suggestedProducts.map(product => { const reason = reasonFor(product); return '<article><img src="' + product.image + '" alt=""><div><span class="selectionReasonRole">' + escapeHtml(roleFor(product)) + '</span><b>' + escapeHtml(product.name.replace(/ — .+$/, '')) + '</b><p><strong>What it is designed to do:</strong> ' + escapeHtml(reason.claim) + '</p><p><strong>Why it fits what you told us:</strong> ' + escapeHtml(reason.fit) + '</p></div></article>'; }).join('') : '<p>No products are currently suggested.</p>') + '</div>';
    $('.planTiers').after(details);
  }

  function renderSolution() {
    const rec = model.recommendation;
    const hasReview = lines().some(line => line.disposition === 'REVIEW');
    $('#solutionView .solHero h1').textContent = hasReview ? 'Review this before buying.' : 'The right product for what you described.';
    $('#solutionLead').textContent = hasReview ? rec.lead : 'Keneflex compares the relevant options and recommends what to buy, what to keep, or when buying something is not the right next step.';
    const wornBrace = wornBraceExplanation();
    $('#confidenceCopy').textContent = rec.needsNeuroReview
      ? 'A product should not be treated as selected until it matches the location and behavior of the nerve-type symptoms.'
      : rec.neuro
        ? 'The selected neutral-position wrist support matches the gradual nerve-type symptom pattern you described. Stop using it if symptoms increase or the fit creates pressure or altered feeling.'
      : wornBrace
        ? wornBrace
        : 'Your recommendation connects the selected products with practical guidance for fit, use, care, and knowing when the choice should be reconsidered.';
    $('#supportItem .planCopy').textContent = rec.supportReason;
    const selectedProduct = supportProduct();
    const comparison = $('.rejects .reject');
    if (comparison) {
      const comparisonImage = $('img', comparison);
      if (comparisonImage) { comparisonImage.src = selectedProduct.image; comparisonImage.alt = selectedProduct.name; }
      $('.rejectName', comparison).textContent = '✓ ' + selectedProduct.name;
      $('.rejectWhy', comparison).textContent = rec.supportReason;
    }
    const fitConfidence = $('.confcard span');
    if (fitConfidence) fitConfidence.textContent = selectedProduct.fit === 'universal'
      ? 'This product has one adjustable adult size, listed for wrists up to ' + selectedProduct.maxWrist.toFixed(1) + ' inches; no size selection is required.'
      : model.fit.supportSku
        ? (model.fit.method === 'measurement' ? 'Your measurement sits within the selected package size range.' : 'Your body-build description was used to select a practical starting size; the exact package chart remains available.')
        : 'Choose an estimated starting size or use the product’s package chart before checkout.';
    const sourceCopy = $('.sourceCopy');
    if (sourceCopy) sourceCopy.textContent = 'Product specifications and sizing come from manufacturer information for ' + selectedProduct.name + '. Recovery-product information comes from Polar Products, and topical ingredient and label warnings come from Biofreeze.';
    const why = $('#whyRows');
    why.innerHTML = [
      ['Location carried forward', rec.locations],
      ['Pattern considered', rec.needsNeuroReview ? 'Nerve-type symptoms requiring product review' : rec.neuro ? 'Gradual nerve-type symptoms matching the neutral-wrist-support pathway' : 'Use-related pain without an identified altered-feeling pattern'],
      ['What changed the product decision', rec.supportReason],
      ...(rec.provider ? [['Provider direction protected', rec.provider + ' Keneflex will not recommend a conflicting use pattern.']] : []),
      ...(model.woundAssessment === 'minor' ? [['Skin protection', 'Clean and cover the minor scrape. Do not place a brace or topical pain product directly over unprotected broken skin.']] : [])
    ].map(([title, copy]) => '<div class="why"><b>' + escapeHtml(title) + '</b><span>' + escapeHtml(copy) + '</span></div>').join('');
    Object.keys(PRODUCTS).forEach(renderLine);
    renderFitChooser();
    renderTierCards();
    $('#total').textContent = money(total());
    $('#planName').textContent = planLabel();
    const summaryCount = lines().filter(line => line.disposition === 'BUY' || line.disposition === 'REVIEW').length;
    $('#selectionCount').textContent = hasReview
      ? summaryCount + (summaryCount === 1 ? ' product awaiting review' : ' products awaiting review') + ' + Product Match Report'
      : summaryCount + (summaryCount === 1 ? ' product' : ' products') + ' + Product Match Report';
    ensureCommerceControls();
  }

  function selectPlan(plan) {
    if (!['core', 'recovery', 'complete'].includes(plan)) return;
    if (plan === 'complete' && !model.comfortEligible) return;
    model.selectedPlan = plan;
    model.cart.cold.disposition = plan === 'core' ? 'OPTIONAL' : 'BUY';
    model.cart.topical.disposition = !model.comfortEligible ? 'REMOVE' : plan === 'complete' ? 'BUY' : 'OPTIONAL';
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
    model.cart.support.disposition = model.recommendation?.eligible && !model.recommendation?.provider ? 'BUY' : 'REVIEW';
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
    buy.disabled = paidLines().length === 0 || hasReview || fitPending();
    buy.textContent = fitPending()
      ? 'Choose your support size to continue'
      : hasReview
      ? 'Review needed before checkout'
      : 'Buy the ' + planLabel() + ' plan — ' + money(total()) + ' total';
    $('#cartPreviewBtn')?.closest('.cartPreview')?.classList.add('hidden');
    let plan = $('#kfxPlanBtn');
    if (!plan) {
      plan = document.createElement('button');
      plan.id = 'kfxPlanBtn';
      plan.className = 'primary kfxPlanBtn';
      plan.textContent = 'View your Product Match Report →';
      plan.addEventListener('click', openPlan);
      totalBlock.appendChild(plan);
    }
  }

  function checkout() {
    if (fitPending() || lines().some(line => line.disposition === 'REVIEW')) return;
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
    overlay.innerHTML = '<section class="kfxCheckout" role="dialog" aria-modal="true"><h2>Review your Keneflex purchase</h2><div class="rowx planIncluded"><span>Keneflex Product Match Report</span><b>Included</b></div>' + woundWarning + combinationWarning + '<div>' +
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
        '<ol class="planChecklist"><li>Use only the products selected for the situation you described.</li><li>Follow the product-specific fit and use guidance in this report.</li><li>Follow the manufacturer label and any professional instructions if they differ.</li><li>Reassess if the product does not fit, creates new symptoms, or is not helping as expected.</li></ol>' +
        (provider ? '<div class="kfxPlanNotice"><b>Provider direction controls.</b> ' + escapeHtml(provider) + ' Keneflex will not substitute a conflicting product or use schedule.</div>' : '')
    });

    if (support) modules.push({
      id: 'support',
      title: 'How to use your support',
      summary: 'The most relevant fit, timing, care, and safety directions for your selection.',
      body: '<p><b>' + escapeHtml(support.name) + '</b> was selected for this product role.</p>' + (model.fit.method === 'self-description' ? '<div class="kfxPlanNotice"><b>Size selected from your description.</b> Confirm the size against the product package chart before ordering if you are unsure or near a size boundary.</div>' : '') + '<div class="planSteps"><div class="planStep"><b>Best use</b><p>' + escapeHtml(support.guide) + '</p></div><div class="planStep"><b>Confirm the fit</b><p>It should feel supportive without creating pressure, numbness, tingling, color change, or circulation concerns.</p></div><div class="planStep"><b>Label controls</b><p>Follow the package for sizing, positioning, cleaning, wear time, and contraindications.</p></div></div><p class="planFinePrint">Keneflex highlights the directions most relevant to your selection. The manufacturer label and any professional instructions remain controlling.</p>'
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
      body: '<div class="planSteps"><div class="planStep"><b>Good fit</b><p>The product performs its intended role without creating new pressure, skin, movement, or circulation problems.</p></div><div class="planStep"><b>Needs adjustment</b><p>Recheck sizing, placement, wear time, and whether you are using it for the situation it was selected for.</p></div><div class="planStep"><b>Not improving</b><p>If symptoms are getting worse or are not improving with self-care, contact an appropriate healthcare professional rather than automatically adding more products.</p></div></div>'
    });

    modules.push({
      id: 'safety',
      title: 'Safety and when to stop',
      summary: 'The warning signs that change the self-care plan.',
      body: (model.woundAssessment === 'minor' ? '<div class="kfxPlanNotice"><b>Protect the scrape.</b> Clean and cover it. Do not place a support or topical pain product directly over unprotected broken skin.</div>' : '') + '<div class="kfxPlanStop"><b>Get urgent help</b> for exposed bone, a joint clearly out of place, bleeding that will not stop, blue/pale/cold fingers after an injury, or sudden face drooping, speech trouble, or one-sided weakness. If symptoms are getting worse or are not improving with self-care, contact an appropriate healthcare professional.</div>'
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
    const purchaseBlocked = hasReview || fitPending();
    overlay.innerHTML = '<div class="kfxPlanPage"><header><div class="logo">KENEFLEX</div><div class="planHeaderActions"><button class="secondary" type="button" data-plan-print>Print Match Report</button><button class="secondary" type="button" data-plan-close>Back to recommendation</button></div></header><main><section class="planHero"><div class="eyebrow">Your Keneflex Product Match Report</div><h1>Why these products fit—and how to use them.</h1><p>See why each item was matched to what you described, confirm fit and sizing, and review the use and safety details that matter most.</p></section><section class="card planAtGlance"><h2>Your report at a glance</h2><p><b>Area:</b> ' + escapeHtml(model.recommendation.locations || 'as described') + '</p><div class="planTopicNav">' + modules.map(module => '<button type="button" data-plan-jump="' + escapeHtml(module.id) + '">' + escapeHtml(module.title) + '</button>').join('') + '</div></section><section class="planModules">' + modules.map(renderPlanModule).join('') + '</section><section class="card finalSelection"><div class="finalSelectionTop"><div><div class="eyebrow">Your selected purchase</div><h2>' + escapeHtml(planLabel()) + '</h2><p>Your Keneflex Product Match Report is included with the products selected for you.</p></div><div class="finalTotal">' + money(total()) + '<small>product total</small></div></div><div class="finalProducts"><div class="planLine planIncluded"><span>Keneflex Product Match Report</span><b>Included</b></div>' + selected.map(line => '<div class="planLine"><span>' + escapeHtml(line.name) + '</span><b>' + (line.disposition === 'BUY' ? money(line.price) : 'Review') + '</b></div>').join('') + '</div><button class="primary kfxFinalBuy"' + (purchaseBlocked ? ' disabled' : '') + '>' + (fitPending() ? 'Choose your support size before checkout' : hasReview ? 'Review needed before checkout' : 'Buy the ' + escapeHtml(planLabel()) + ' plan — ' + money(total()) + ' total') + '</button></section></main></div>';
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
      how: '<h2>How Keneflex works</h2><p>Tell us what is bothering you—or what kind of product you already want. Keneflex asks only what could change the choice or safety decision, compares the relevant options, and recommends what to buy, keep, or skip.</p><p>This test currently covers adults choosing from a limited set of hand, wrist, and thumb products.</p>',
      approach: '<h2>Our approach</h2><p>Product fit, function, safety, limitations, and reasonable non-product options come before a purchase.</p>'
    }[key];
    if (!content) return;
    $('#modalContent').innerHTML = content;
    $('#modal').classList.remove('hidden');
  }

  function applyConsumerCopy() {
    $$('.planTier').forEach(card => {
      const includedGuide = $('.tierIncludes span', card);
      if (includedGuide) includedGuide.textContent = '✓ Keneflex Product Match Report';
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
    document.addEventListener('error', event => {
      const image = event.target;
      if (image?.tagName !== 'IMG' || !image.dataset.fallback || image.dataset.fallbackApplied === 'true') return;
      image.dataset.fallbackApplied = 'true';
      image.src = image.dataset.fallback;
    }, true);
    $('#intro .hero .eyebrow')?.classList.add('hidden');
    applyConsumerCopy();
    const opening = $('#opening');
    const openingButton = $('#openingBtn');
    opening.addEventListener('input', () => { openingButton.disabled = opening.value.trim().length < 3; });
    openingButton.addEventListener('click', async () => {
      model.opening = opening.value.trim();
      model.turns.push({ role: 'user', content: model.opening });
      addBubble('user', model.opening);
      showStage('chat');
      openingButton.disabled = true;
      await refreshInterpretation(model.opening);
      model.questionBudget = Engine.questionBudget(model.story);
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

  root.KeneflexParticipant = Object.freeze({ model, PRODUCTS, CATALOG, total, lines, activeProblem, renderSolution, selectPlan, refreshInterpretation });
  bind();
})(window);
