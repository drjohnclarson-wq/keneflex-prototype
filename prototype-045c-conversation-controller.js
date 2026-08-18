/* Keneflex 0.4.5C — single-owner ConversationController.
   Candidate questions are generated/ranked before rendering. KNOWN != ASKABLE.
   A question turn is atomic: prompt + input/options + callback share one permission decision. */
(function(root){'use strict';
  function Controller(story){this.story=story;this.lastQuestion=null;}
  Controller.prototype.candidates=function(threadId){const s=this.story,t=s.thread(threadId);if(!t)return [{concept:'where',priority:100,prompt:'Where exactly is it bothering you?'}];const c=[];
    function add(concept,priority,prompt,reason){if(!s.known(concept,threadId))c.push({concept,priority,prompt,reason});}
    add('side',95,'Which side is bothering you?','laterality can change the problem thread and fit');
    add('symptoms',90,'What does it feel like?','symptom type can change safety and requirements');
    add('onset',88,'Did this build up, or follow a specific injury?','trauma can change disposition');
    add('duration',72,'About how long has this been going on?','duration changes interpretation');
    add('triggers',68,'What tends to bring it on or make it worse?','mechanism/activity changes requirements');
    if(t.facts.symptoms&&Array.isArray(t.facts.symptoms.value)&&t.facts.symptoms.value.some(x=>x==='numbness'||x==='tingling'))add('sensoryMap',92,'Where exactly do you notice the numbness or tingling?','distribution can materially discriminate nerve patterns');
    add('patterns',58,'When do you tend to notice it most?','timing can discriminate patterns');
    return c.sort((a,b)=>b.priority-a.priority);
  };
  Controller.prototype.next=function(threadId){const q=this.candidates(threadId)[0]||null;this.lastQuestion=q;return q;};
  Controller.prototype.canAsk=function(q,threadId){return !!q&&!this.story.known(q.concept,threadId);};
  Controller.prototype.answer=function(text,source){this.story.add(text,source||'consumer');return this.next();};
  Controller.prototype.atomicTurn=function(q,render){if(!this.canAsk(q))return false;render({concept:q.concept,prompt:q.prompt,reason:q.reason,submit:(answer)=>this.answer(answer)});return true;};
  root.KFXConversationController=Controller;
})(typeof window!=='undefined'?window:globalThis);