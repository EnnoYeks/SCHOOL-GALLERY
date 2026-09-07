(function(){
  'use strict';
  if (window.__hshsMessagesUi) return;
  var base = (location.pathname.indexOf('/index/') !== -1) ? '../' : '';
  var v = '260908pk7';
  Promise.all([0,1,2].map(function(i){
    return fetch(base + 'js/hshs-messages-ui.c' + i + '.js?v=' + v).then(function(r){
      if (!r.ok) throw new Error('chunk ' + i + ' ' + r.status);
      return r.text();
    });
  })).then(function(parts){
    var code = parts.join('');
    if (code.indexOf('HshsMessagesUi') === -1 && code.indexOf('__hshsMessagesUi') === -1) {
      console.error('messages-ui chunks invalid');
      return;
    }
    var s = document.createElement('script');
    s.textContent = code;
    document.head.appendChild(s);
  }).catch(function(e){ console.error('messages-ui', e); });
})();
