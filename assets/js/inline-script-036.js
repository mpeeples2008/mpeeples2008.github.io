
(function(){
  // Disabled: fallback shim was duplicating bubbles and conflicting with primary assistant UI.
  return;
  function tryAttach(){
    try{
      // If showFallbackBubble exists, wrap known APIs to ensure bubble shows
      if (typeof showFallbackBubble !== 'function') return false;
      var patched = false;
      // Patch global Assistant object if present
      var g = window.Assistant || window.assistant || window.AssistantAPI || window.assistantAPI;
      if (g && typeof g.show === 'function' && !g.__showPatched){
        var orig = g.show.bind(g);
        g.show = function(){
          try { showFallbackBubble(arguments[0], arguments[1]||{}); } catch(e){}
          return orig.apply(null, arguments);
        };
        g.__showPatched = true;
        console.log('[AssistantPatch] wrapped global show()');
        patched = true;
      }
      // If there's an emitter-style API with 'on', try to register
      var em = (window.assistantEmitter || (g && g.emitter) || window.emitter);
      if (em && typeof em.on === 'function' && !em.__onPatched){
        try {
          em.on('show', function(t,m){ try { showFallbackBubble(t,m||{}); } catch(e){} });
          em.__onPatched = true;
          console.log('[AssistantPatch] attached to emitter.on(show)');
          patched = true;
        } catch(e){}
      }
      return patched;
    }catch(e){ return false; }
  }
  var tries = 0;
  var id = setInterval(function(){
    var ok = tryAttach();
    tries++;
    if (ok || tries>40) clearInterval(id);
  }, 200);
})();

