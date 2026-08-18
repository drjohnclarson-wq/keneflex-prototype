const { chromium } = require('playwright');
const base=process.env.KFX_BASE_URL||'http://127.0.0.1:8080/?participant=047&build=ci';
const stories=[
  'My right hand has been hurting for about 4 weeks or so. The pain is in my wrist and thumb. It is sore at the base of my thumb and hurts especially when I am working or playing on my cell phone.',
  'My left wrist and thumb tingle in my thumb and index finger for three weeks after typing and scrolling. It built up gradually.',
  'My right knee hurts under the kneecap with sharp pain going downstairs in the morning for three weeks. It built up gradually.',
  'My left ankle has hurt for four days after I rolled it yesterday and it is swollen.',
  'My right shoulder has been sore for five days, no trauma, larger movements and lying on it aggravate it, and resting it helps.',
  'My left elbow hurts for three weeks with gripping and lifting. It built up gradually.',
  'My right heel hurts for three weeks when walking in the morning. It built up gradually.',
  'My neck has been stiff for two weeks, especially in the morning, with no injury.',
  'My lower back has hurt for three weeks after lifting and it built up gradually.',
  'My left hip has hurt for four weeks after walking and there was no injury.'
];
function caseUrl(n){const u=new URL(base);u.searchParams.set('case',String(n));return u.href;}
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});const failures=[];
 for(let i=0;i<stories.length;i++){
  const page=await browser.newPage({viewport:{width:390,height:844}});
  try{
   await page.goto(caseUrl(i+1),{waitUntil:'domcontentloaded',timeout:15000});
   await page.waitForFunction(()=>window.KFX047DReleaseAudit&&document.querySelector('#opening')&&document.querySelector('#openingBtn'),null,{timeout:8000});
   const start=await page.evaluate((story)=>{
     const audit=window.KFX047DReleaseAudit();
     if(!audit.pass)return {audit,started:false};
     const opening=document.querySelector('#opening'),btn=document.querySelector('#openingBtn');
     opening.value=story;opening.dispatchEvent(new Event('input',{bubbles:true}));opening.dispatchEvent(new Event('change',{bubbles:true}));
     const after={disabled:btn.disabled,openingValue:opening.value,buttonRect:btn.getBoundingClientRect().toJSON?btn.getBoundingClientRect().toJSON():{width:btn.getBoundingClientRect().width,height:btn.getBoundingClientRect().height}};
     btn.click();return {audit,after,started:true};
   },stories[i]);
   if(!start.audit||!start.audit.pass)throw new Error('release shell audit failed '+JSON.stringify(start.audit));
   if(!start.started||start.after.disabled)throw new Error('opening interaction did not become enabled '+JSON.stringify(start));
   if(!start.after.buttonRect.width||!start.after.buttonRect.height)throw new Error('opening button has no rendered size');
   await page.waitForSelector('#conversation .bubble.user',{timeout:5000});
   await page.waitForTimeout(250);
   const result=await page.evaluate(()=>{const ais=[...document.querySelectorAll('#conversation .bubble.ai')].map(x=>(x.textContent||'').replace(/\s+/g,' ').trim());const controls=[...document.querySelectorAll('#interaction textarea,#interaction input,#interaction button')];const bubbles=[...document.querySelectorAll('#conversation .bubble')];const last=bubbles[bubbles.length-1];const orphan=controls.length>0&&!(last&&last.classList.contains('ai'));const audit=window.KFX046Audit?window.KFX046Audit():null;return{ais,orphan,audit,integrity:document.documentElement.dataset.kfxIntegrity||null};});
   if(result.orphan)throw new Error('orphan interaction control');if(result.integrity==='fail')throw new Error('release integrity flag failed');if(result.audit&&!result.audit.pass)throw new Error('canonical audit says next question is already known: '+JSON.stringify(result.audit.next));
   if(i===0){const joined=result.ais.join(' | ').toLowerCase();if(joined.includes('which side is bothering'))throw new Error('founder regression re-asked side');if(joined.includes('how long has this been'))throw new Error('founder regression re-asked duration');}
   console.log('PASS browser subject '+(i+1));
  }catch(e){failures.push({subject:i+1,error:e.message,url:page.url()});console.error('FAIL browser subject '+(i+1),e.message,page.url());}
  await page.close();
 }
 await browser.close();console.log(JSON.stringify({subjects:stories.length,failed:failures.length,failures},null,2));if(failures.length)process.exit(1);
})();
