// Accessibility helpers: ensure generated action buttons are keyboard reachable and labelled
(function(){
  if (window.__hshsA11y) return; window.__hshsA11y = true;
  function annotateActions(node){
    try{
      (node.querySelectorAll ? node.querySelectorAll('.hshs-generated-actions button') : []).forEach(function(b){
        if (!b) return;
        if (!b.getAttribute('aria-label')){
          // infer label from class
          if (b.classList.contains('like-action')) b.setAttribute('aria-label','Like');
          else if (b.classList.contains('comment-action')) b.setAttribute('aria-label','Comment');
          else if (b.classList.contains('save-action')) b.setAttribute('aria-label','Save');
          else b.setAttribute('aria-label', b.textContent.trim() || 'Action');
        }
        if (b.tagName.toLowerCase() === 'button') b.classList.add('hshs-a11y-btn');
        if (b.getAttribute('role') == null) b.setAttribute('role','button');
        if (b.getAttribute('tabindex') == null) b.setAttribute('tabindex','0');
      });
    }catch(e){}
  }
  // initial run
  annotateActions(document);
  // observe DOM changes to annotate newly added action bars
  try{
    var obs = new MutationObserver(function(records){ records.forEach(function(r){ r.addedNodes.forEach(function(n){ if(n.nodeType===1) annotateActions(n); }); }); });
    obs.observe(document.body, { childList:true, subtree:true });
  }catch(e){}

  // Modal focus helper: when nomination modal opens, focus first focusable control
  function focusModalOnOpen(){
    try{
      document.addEventListener('hshs:modal-open', function(e){
        var modal = document.getElementById('hshsNominationModal');
        if (!modal) return;
        var f = modal.querySelector('select, input, textarea, button, [tabindex]');
        if (f && typeof f.focus === 'function') setTimeout(function(){ try{ f.focus(); }catch(e){} }, 50);
      });
      // emit event when class added
      var mo = new MutationObserver(function(records){ records.forEach(function(r){ if (r.type==='attributes' && r.target.id==='hshsNominationModal' && r.attributeName==='class'){ var m=r.target; if (m.classList.contains('open')) document.dispatchEvent(new Event('hshs:modal-open')); } }); });
      var mnode = document.body; mo.observe(mnode, { subtree:true, childList:true, attributes:true, attributeFilter:['class'] });
    }catch(e){}
  }
  focusModalOnOpen();
})();
