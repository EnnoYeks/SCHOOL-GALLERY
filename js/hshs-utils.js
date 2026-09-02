// Small utilities used by multiple hshs modules
(function(){
  if (window.HshsUtils) return; 
  window.HshsUtils = {
    escapeHtml: function(s){ return String(s == null ? '' : s)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;'); },
    safeText: function(el, text){ if (!el) return; try { el.textContent = String(text == null ? '' : text); } catch(e){} },
    // ensure an element is focusable
    makeFocusable: function(el){ if(!el) return; if (el.getAttribute('tabindex') == null) el.setAttribute('tabindex','0'); }
  };
})();
