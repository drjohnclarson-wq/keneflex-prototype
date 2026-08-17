/* Keneflex 0.4.4O — keep workspace reimbursement useful without implying occupational causation. */
(function(){
  if(typeof kfxHOpenHomePlan!=='function')return;
  const prior=kfxHOpenHomePlan;
  kfxHOpenHomePlan=function(){
    const originalOpen=window.open;
    let child=null;
    window.open=function(){
      child=originalOpen.apply(window,arguments);
      return child;
    };
    try{ prior(); }
    finally{ window.open=originalOpen; }
    setTimeout(()=>{
      try{
        if(!child || child.closed)return;
        const note=child.document.querySelector('.kfxMEmployer');
        if(!note)return;
        note.innerHTML='<b>Home-workspace equipment may already be covered.</b> Some people have an equipment allowance or reimbursement benefit for approved items such as laptop or monitor risers, keyboards, mice, phone stands, or similar workspace aids. Check the policy or benefit that applies to you.';
      }catch(e){}
    },25);
  };
})();
