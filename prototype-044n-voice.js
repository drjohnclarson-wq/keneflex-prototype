/* Keneflex 0.4.4N — recommendation-page brand voice normalization. */
(function(){
  function normalizeText(root){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(n=>{
      let t=n.nodeValue;
      if(!t||!t.trim())return;
      t=t
        .replace(/you told me/gi,'you told Keneflex')
        .replace(/story you gave me/gi,'information you gave Keneflex')
        .replace(/what I heard/gi,'what Keneflex heard')
        .replace(/what I did/gi,'what Keneflex did')
        .replace(/why I’m/gi,'why Keneflex is')
        .replace(/why I'm/gi,'why Keneflex is')
        .replace(/\bI would\b/g,'Keneflex would')
        .replace(/\bI’d\b/g,'Keneflex would')
        .replace(/\bI'd\b/g,'Keneflex would')
        .replace(/\bI will\b/g,'Keneflex will')
        .replace(/\bI’ll\b/g,'Keneflex will')
        .replace(/\bI'll\b/g,'Keneflex will')
        .replace(/\bmy best recommendation\b/gi,"Keneflex’s best recommendation")
        .replace(/\bmy recommendation\b/gi,"Keneflex’s recommendation");
      n.nodeValue=t;
    });
  }
  function apply(){normalizeText(document.getElementById('solutionView'));}
  if(typeof showSolution==='function'){
    const prior=showSolution;
    showSolution=function(){prior();apply();};
  }
  apply();
})();