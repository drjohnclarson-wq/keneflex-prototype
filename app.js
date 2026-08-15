
const state={story:"",loc:null,activity:null,stability:null,wrist:7,heard:{}};
const marketing=document.getElementById("marketing"), app=document.getElementById("app"), solution=document.getElementById("solution"), checkout=document.getElementById("checkout");
const screens=[...document.querySelectorAll(".screen")];
const prog=document.getElementById("prog");
const steps={describe:12,heard:22,safety:32,provider:40,providerInfo:40,existing:48,keep:48,location:60,activity:70,mobility:80,size:90,working:98,stop:32};
function rail(stage){
 document.querySelectorAll(".railStep").forEach(x=>x.classList.remove("active"));
 const el=document.querySelector(`[data-rail="${stage}"]`); if(el)el.classList.add("active");
}
function stageFor(id){if(["describe","heard"].includes(id))return"describe";if(["safety","provider","providerInfo","existing","keep","location","activity","mobility"].includes(id))return"narrow";if(id==="size")return"fit";if(id==="working")return"compare";return"describe"}
function show(id){
 screens.forEach(x=>x.classList.toggle("active",x.id===id));
 if(prog)prog.style.width=(steps[id]||20)+"%";
 rail(stageFor(id));
 window.scrollTo({top:0,behavior:"smooth"});
}
function start(){
 marketing.style.display="none";solution.classList.remove("active");checkout.classList.remove("active");app.classList.add("active");show("describe");
}
document.querySelectorAll("[data-start]").forEach(b=>b.addEventListener("click",start));
document.querySelectorAll("[data-home]").forEach(b=>b.addEventListener("click",()=>{app.classList.remove("active");marketing.style.display="block";window.scrollTo(0,0)}));
document.addEventListener("click",e=>{
 const smart=e.target.closest("[data-smart]"); if(smart){const set=smart.dataset.set;if(set){const [k,v]=set.split(":");state[k]=v}show(nextMissing());return;}
 const go=e.target.closest("[data-go]"); if(go){const set=go.dataset.set;if(set){const [k,v]=set.split(":");state[k]=v}show(go.dataset.go);}
 const ans=e.target.closest("[data-answer]"); if(ans){document.getElementById(ans.dataset.answer).classList.toggle("show");}
});
const story=document.getElementById("story"),storyNext=document.getElementById("storyNext"),storyQuote=document.getElementById("storyQuote");
story.addEventListener("input",()=>storyNext.disabled=story.value.trim().length<8);
function interpretStory(text){
 const t=text.toLowerCase();
 let loc=null, activity=null, stability=null, timing="Not clear yet — I’ll clarify only if needed";
 const hasW=/\bwrist\b/.test(t), hasT=/\bthumb\b/.test(t);
 if(hasW&&hasT)loc="both"; else if(hasW)loc="wrist"; else if(hasT)loc="thumb";
 if(/pickle\s*ball/.test(t))activity="pickleball"; else if(/tennis/.test(t))activity="tennis"; else if(/golf/.test(t))activity="golf"; else if(/work|computer|typing|daily|everyday/.test(t))activity="daily";
 if(/don.?t want.*restrict|not.*restrict|preserv.*movement|keep.*movement|movement|bulky|flexib|keep playing|stay active/.test(t))stability="flex"; else if(/strong.*stabili|rigid|max.*support|limit.*motion/.test(t))stability="strong"; else if(/moderate.*stabili/.test(t))stability="moderate";
 const n=t.match(/(?:about\s+)?(\d+)\s*(day|days|week|weeks|month|months)/); if(n)timing=(t.includes('about ')?'About ':'')+n[1]+' '+n[2];
 else if(/three\s+weeks?/.test(t))timing="About 3 weeks"; else if(/two\s+weeks?/.test(t))timing="About 2 weeks"; else if(/one\s+week/.test(t))timing="About 1 week";
 state.loc=loc; state.activity=activity; state.stability=stability; state.heard={loc,activity,stability,timing};
 document.getElementById('heardArea').textContent=loc==='both'?'Wrist + thumb':loc==='wrist'?'Wrist':loc==='thumb'?'Thumb':'Not clear yet — I’ll ask';
 document.getElementById('heardTiming').textContent=timing;
 document.getElementById('heardActivity').textContent=activity==='pickleball'?'Pickleball':activity==='tennis'?'Tennis':activity==='golf'?'Golf':activity==='daily'?'Everyday tasks / work':'Not clear yet — I’ll ask';
 document.getElementById('heardPriority').textContent=stability==='flex'?'Preserve useful movement':stability==='moderate'?'More stabilization':stability==='strong'?'Strong motion limitation':'Not clear yet — I’ll ask';
}
function nextMissing(){if(!state.loc)return 'location';if(!state.activity)return 'activity';if(!state.stability)return 'mobility';return 'size'}
storyNext.addEventListener("click",()=>{state.story=story.value.trim();storyQuote.textContent="“"+state.story+"”";interpretStory(state.story);show("heard")});
document.getElementById("sizeNext").addEventListener("click",()=>{state.wrist=parseFloat(document.getElementById("wrist").value||7);show("working")});
document.querySelector("[data-solution]").addEventListener("click",()=>{app.classList.remove("active");solution.classList.add("active");rail("solution");window.scrollTo(0,0)});
function openCart(){solution.classList.remove("active");checkout.classList.add("active");window.scrollTo(0,0)}
document.getElementById("cartBtn").addEventListener("click",openCart);
document.getElementById("cartBtnMobile").addEventListener("click",openCart);
document.addEventListener("error",e=>{if(e.target&&e.target.tagName==="IMG"){const img=e.target,p=img.parentElement;const label=img.dataset.fallback;if(label&&p){const bits=label.split('|');p.innerHTML='<div class="fallbackProduct"><b>'+bits[0]+'</b><span>'+(bits[1]||'Product image unavailable')+'</span></div>';}else{img.style.opacity='.12';}}},true);
