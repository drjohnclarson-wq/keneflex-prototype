
const state={
 story:"",loc:null,timing:null,activity:null,activityLabel:null,symptom:null,
 stability:null,wrist:7,heard:{}
};
const marketing=document.getElementById("marketing");
const app=document.getElementById("app");
const solution=document.getElementById("solution");
const checkout=document.getElementById("checkout");
const screens=[...document.querySelectorAll(".screen")];
const prog=document.getElementById("prog");

const steps={
 describe:10,heard:18,safety:28,provider:36,providerInfo:36,existing:44,keep:44,
 location:54,timing:62,activity:70,symptoms:78,mobility:86,size:94,working:99,stop:28
};

function rail(stage){
 document.querySelectorAll(".railStep").forEach(x=>x.classList.remove("active"));
 const el=document.querySelector(`[data-rail="${stage}"]`);
 if(el)el.classList.add("active");
}
function stageFor(id){
 if(["describe","heard"].includes(id)) return "describe";
 if(["safety","provider","providerInfo","existing","keep","location","timing","activity","symptoms","mobility"].includes(id)) return "narrow";
 if(id==="size") return "fit";
 if(id==="working") return "compare";
 return "describe";
}
function show(id){
 screens.forEach(x=>x.classList.toggle("active",x.id===id));
 if(prog) prog.style.width=(steps[id]||20)+"%";
 rail(stageFor(id));
 if(id==="working") updateDynamicCopy();
 window.scrollTo({top:0,behavior:"smooth"});
}
function start(){
 marketing.style.display="none";
 solution.classList.remove("active");
 checkout.classList.remove("active");
 app.classList.add("active");
 show("describe");
}
document.querySelectorAll("[data-start]").forEach(b=>b.addEventListener("click",start));
document.querySelectorAll("[data-home]").forEach(b=>b.addEventListener("click",()=>{
 app.classList.remove("active");marketing.style.display="block";window.scrollTo(0,0);
}));

document.addEventListener("click",e=>{
 const smart=e.target.closest("[data-smart]");
 if(smart){
   const set=smart.dataset.set;
   if(set){
     const [k,v]=set.split(":");
     state[k]=v;
   }
   show(nextMissing());
   return;
 }
 const go=e.target.closest("[data-go]");
 if(go){
   const set=go.dataset.set;
   if(set){
     const [k,v]=set.split(":");
     state[k]=v;
   }
   show(go.dataset.go);
 }
 const ans=e.target.closest("[data-answer]");
 if(ans){
   const target=document.getElementById(ans.dataset.answer);
   if(target) target.classList.toggle("show");
 }
});

const story=document.getElementById("story");
const storyNext=document.getElementById("storyNext");
const storyQuote=document.getElementById("storyQuote");
story.addEventListener("input",()=>storyNext.disabled=story.value.trim().length<8);

function timingLabel(v){
 return v==="fewdays"?"A few days or less":
        v==="1to2weeks"?"About 1–2 weeks":
        v==="3weeks"?"About 3 weeks":
        v==="monthplus"?"More than a month":"Not clear yet — I’ll ask";
}
function locLabel(v){
 return v==="both"?"Wrist + thumb":v==="wrist"?"Wrist":v==="thumb"?"Thumb":"Not clear yet — I’ll ask";
}
function stabilityLabel(v){
 return v==="flex"?"Preserve useful movement":v==="moderate"?"More stabilization":v==="strong"?"Strong motion limitation":"Not clear yet — I’ll ask";
}
function activityDisplay(){
 return state.activityLabel || (state.activity==="pickleball"?"Pickleball":state.activity==="tennis"?"Tennis":state.activity==="golf"?"Golf":state.activity==="daily"?"Everyday tasks / work":"Not clear yet — I’ll ask");
}
function symptomLabel(v){
 return v==="ache"?"Aching / soreness with use":v==="stiff"?"Stiffness or mild swelling":v==="sharp"?"Sharp with certain movements":"Not clear yet — I’ll ask";
}

function interpretStory(text){
 const t=text.toLowerCase();
 let loc=null,activity=null,activityLabel=null,stability=null,timing=null,symptom=null;

 const hasW=/\bwrist\b/.test(t), hasT=/\bthumb\b/.test(t);
 if(hasW&&hasT)loc="both"; else if(hasW)loc="wrist"; else if(hasT)loc="thumb";

 if(/pickle\s*ball/.test(t)){activity="pickleball";activityLabel="Pickleball";}
 else if(/\btennis\b/.test(t)){activity="tennis";activityLabel="Tennis";}
 else if(/\bgolf\b/.test(t)){activity="golf";activityLabel="Golf";}
 else if(/work|computer|typing|keyboard|daily|everyday/.test(t)){activity="daily";activityLabel="Everyday tasks / work";}

 if(/don.?t want.*restrict|not.*restrict|preserv.*movement|keep.*movement|flexib|keep playing|stay active|keep doing/.test(t))stability="flex";
 else if(/strong.*stabili|rigid|max.*support|limit.*motion/.test(t))stability="strong";
 else if(/moderate.*stabili/.test(t))stability="moderate";

 const n=t.match(/(?:about\s+)?(\d+)\s*(day|days|week|weeks|month|months)/);
 if(n){
   const num=parseInt(n[1],10),unit=n[2];
   if(unit.startsWith("day")&&num<=5)timing="fewdays";
   else if(unit.startsWith("week")&&num<=2)timing="1to2weeks";
   else if(unit.startsWith("week")&&num===3)timing="3weeks";
   else timing="monthplus";
 } else if(/three\s+weeks?/.test(t))timing="3weeks";
 else if(/(?:one|two)\s+weeks?/.test(t))timing="1to2weeks";
 else if(/few\s+days|couple\s+days/.test(t))timing="fewdays";

 if(/ache|aching|sore|soreness|tender/.test(t))symptom="ache";
 else if(/stiff|swelling|swollen/.test(t))symptom="stiff";
 else if(/sharp|catch|pinch/.test(t))symptom="sharp";

 state.loc=loc;state.timing=timing;state.activity=activity;state.activityLabel=activityLabel;
 state.stability=stability;state.symptom=symptom;
 state.heard={loc,timing,activity,stability,symptom};

 document.getElementById("heardArea").textContent=locLabel(loc);
 document.getElementById("heardTiming").textContent=timingLabel(timing);
 document.getElementById("heardActivity").textContent=activityDisplay();
 document.getElementById("heardPriority").textContent=stabilityLabel(stability);
}

function nextMissing(){
 if(!state.loc)return "location";
 if(!state.timing)return "timing";
 if(!state.activity)return "activity";
 if(!state.symptom)return "symptoms";
 if(!state.stability)return "mobility";
 return "size";
}

storyNext.addEventListener("click",()=>{
 state.story=story.value.trim();
 storyQuote.textContent="“"+state.story+"”";
 interpretStory(state.story);
 show("heard");
});

const activityText=document.getElementById("activityText");
const activityNext=document.getElementById("activityNext");
if(activityText&&activityNext){
 activityText.addEventListener("input",()=>activityNext.disabled=activityText.value.trim().length<2);
 activityNext.addEventListener("click",()=>{
   const val=activityText.value.trim();
   const low=val.toLowerCase();
   state.activityLabel=val;
   if(/pickle\s*ball/.test(low))state.activity="pickleball";
   else if(/tennis/.test(low))state.activity="tennis";
   else if(/golf/.test(low))state.activity="golf";
   else if(/work|typing|computer|keyboard/.test(low))state.activity="daily";
   else state.activity="other";
   show(nextMissing());
 });
}

const sizeNext=document.getElementById("sizeNext");
sizeNext.addEventListener("click",()=>{
 state.wrist=parseFloat(document.getElementById("wrist").value||7);
 show("working");
});

function updateDynamicCopy(){
 const activity=activityDisplay()==="Not clear yet — I’ll ask"?"your activity":activityDisplay();
 const pattern=`${locLabel(state.loc)} • ${timingLabel(state.timing)} • ${symptomLabel(state.symptom)}`;
 const workPattern=document.getElementById("workPattern");
 const workActivity=document.getElementById("workActivity");
 const workFit=document.getElementById("workFit");
 const thinking=document.getElementById("thinkingSummary");
 if(workPattern)workPattern.textContent=`${pattern}. That supports a conservative support-and-recovery path while keeping reassessment triggers visible.`;
 if(workActivity)workActivity.textContent=`You want to keep doing ${activity}, and ${stabilityLabel(state.stability).toLowerCase()}. That weighs against unnecessary rigid restriction.`;
 if(workFit)workFit.textContent=`${state.wrist.toFixed(1)} inches is checked against manufacturer sizing; Neo G Medium covers 6.3–7.5 inches.`;
 if(thinking)thinking.textContent=`Help you keep doing ${activity}, reduce unnecessary restriction, manage after-activity comfort, and give you a clear self-care/reassessment plan.`;

 const sp=document.getElementById("solutionPattern");
 const spr=document.getElementById("solutionPriority");
 const sf=document.getElementById("solutionFit");
 if(sp)sp.textContent=`${locLabel(state.loc)} • ${timingLabel(state.timing)}`;
 if(spr)spr.textContent=`${activity} • ${stabilityLabel(state.stability).toLowerCase()}`;
 if(sf)sf.textContent=`${state.wrist.toFixed(1)}-inch wrist`;
 document.querySelectorAll(".activityName").forEach(el=>el.textContent=activity);
}

const showSolution=document.querySelector("[data-solution]");
showSolution.addEventListener("click",()=>{
 updateDynamicCopy();
 app.classList.remove("active");
 solution.classList.add("active");
 rail("solution");
 window.scrollTo(0,0);
});

function openCart(){
 solution.classList.remove("active");
 checkout.classList.add("active");
 window.scrollTo(0,0);
}
const cartBtn=document.getElementById("cartBtn");
if(cartBtn)cartBtn.addEventListener("click",openCart);
const cartBtnMobile=document.getElementById("cartBtnMobile");
if(cartBtnMobile)cartBtnMobile.addEventListener("click",openCart);

document.addEventListener("error",e=>{
 if(e.target&&e.target.tagName==="IMG"){
   const img=e.target,p=img.parentElement,label=img.dataset.fallback;
   if(label&&p){
     const bits=label.split("|");
     p.innerHTML='<div class="fallbackProduct"><b>'+bits[0]+'</b><span>'+(bits[1]||"Product image unavailable")+'</span></div>';
   } else img.style.opacity=".12";
 }
},true);
