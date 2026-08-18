/* Keneflex 0.4.5B — canonical event-sourced Story State.
   One consumer truth; corrections supersede rather than append stale facts.
   Body-part/problem threads prevent global side/symptom leakage. */
(function(root){'use strict';
  const E=root.KFXStoryEngine;
  function id(){return 'e'+Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
  function CanonicalStory(){this.events=[];this.threads={};this.activeThread=null;this.version=1;}
  CanonicalStory.prototype.add=function(text,source){
    const ev={id:id(),at:Date.now(),source:source||'consumer',text:String(text||''),parsed:E?E.parse(text):null};
    this.events.push(ev);this.rebuild();return ev;
  };
  CanonicalStory.prototype.rebuild=function(){
    const self=this;this.threads={};this.activeThread=null;
    this.events.forEach(ev=>{const f=ev.parsed||{};const regions=(f.regions||[]).filter(r=>r!=='hand'||!(f.regions||[]).some(x=>['wrist','thumb','finger'].includes(x)));const rs=regions.length?regions:['unspecified'];
      rs.forEach(region=>{const key=region;const t=self.threads[key]||(self.threads[key]={id:key,region,side:null,facts:{},evidence:[],providerInstructions:[],uncertainties:[]});
        t.evidence.push(ev.id); if(f.side)t.side=f.side;
        function set(k,v){if(v==null||(Array.isArray(v)&&!v.length))return;t.facts[k]={value:v,status:'known',eventId:ev.id};}
        set('locations',f.locations);set('symptoms',f.symptoms);set('qualities',f.qualities);set('triggers',f.triggers);set('relievers',f.relievers);set('patterns',f.patterns);set('functionEffects',f.functionEffects);set('onset',f.onset);set('duration',f.duration);set('sensoryMap',f.sensoryMap);set('negatives',f.negatives);
        if((f.providerInstructions||[]).length)t.providerInstructions=f.providerInstructions.slice();
        // correction/supersession: latest explicit side wins for this thread.
        if(/\b(?:sorry|actually|correction|i mean)\b/i.test(ev.text)&&f.side)t.side=f.side;
        // latest explicit positive overrides prior negative of same concept; latest explicit negative removes positive.
        (f.negatives||[]).forEach(n=>{if(t.facts.symptoms&&Array.isArray(t.facts.symptoms.value))t.facts.symptoms.value=t.facts.symptoms.value.filter(x=>x!==n);t.facts['negative:'+n]={value:true,status:'known-negative',eventId:ev.id};});
        (f.symptoms||[]).forEach(s=>{delete t.facts['negative:'+s];});
        self.activeThread=key;
      });
    });
  };
  CanonicalStory.prototype.thread=function(id){return this.threads[id||this.activeThread]||null};
  CanonicalStory.prototype.known=function(concept,threadId){const t=this.thread(threadId);if(!t)return false;if(concept==='where')return t.region!=='unspecified'||!!t.facts.locations;if(concept==='side')return !!t.side;if(concept==='provider')return !!t.providerInstructions.length;return !!t.facts[concept];};
  CanonicalStory.prototype.snapshot=function(){return JSON.parse(JSON.stringify({version:this.version,events:this.events.map(e=>({id:e.id,at:e.at,source:e.source,text:e.text})),threads:this.threads,activeThread:this.activeThread}));};
  root.KFXCanonicalStory=CanonicalStory;
})(typeof window!=='undefined'?window:globalThis);