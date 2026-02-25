
(function(){
  // Disabled: debug overlay shim patched showFallbackBubble and produced extra debug bubbles.
  return;
  function debugEnsure(){
    var root = document.getElementById('assistant-bubble-root');
    if (!root){
      root = document.createElement('div');
      root.id = 'assistant-bubble-root';
      document.documentElement.appendChild(root);
    }
    // strong, visible styles
    root.style.position = 'fixed';
    root.style.left = '50%';
    root.style.top = '12%';
    root.style.transform = 'translateX(-50%)';
    root.style.zIndex = '9999999999';
    root.style.pointerEvents = 'auto'; // allow clicks
    root.style.display = 'block';
    return root;
  }

  function debugShow(text, opts){
    try{
      var root = debugEnsure();
      root.innerHTML = '';
      var b = document.createElement('div');
      b.className = 'assistant-fallback-bubble';
      b.style.background = 'rgba(255,0,50,0.95)';
      b.style.color = '#fff';
      b.style.padding = '16px 20px';
      b.style.borderRadius = '12px';
      b.style.fontSize = '18px';
      b.style.boxShadow = '0 18px 50px rgba(0,0,0,0.6)';
      b.style.maxWidth = '70vw';
      b.style.textAlign = 'center';
      b.style.opacity = '1';
      b.textContent = (typeof text === 'string') ? text : (text && text.message) || JSON.stringify(text);
      root.appendChild(b);
      // log computed style & rect
      try {
        var cs = window.getComputedStyle(b);
        console.log('[AssistantDebug] bubble computed style:', {visibility: cs.visibility, display: cs.display, opacity: cs.opacity, zIndex: cs.zIndex});
      } catch(e){ console.warn(e); }
      try {
        var r = b.getBoundingClientRect();
        console.log('[AssistantDebug] bubble rect:', r);
      } catch(e){ console.warn(e); }
      // attach click to remove
      b.addEventListener('click', function(){ if (b.parentNode) b.parentNode.removeChild(b); }, {passive:true});
      return b;
    }catch(e){
      console.warn('debugShow error', e);
    }
  }

  // Expose to window for manual test
  window.__assistant_debug_show = debugShow;
  window.addEventListener('keydown', function(e){
    if (e.key === 'b') debugShow('DEBUG: visible test bubble — press to dismiss');
  });

  // Patch existing showFallbackBubble if present
  if (typeof showFallbackBubble === 'function'){
    var orig = showFallbackBubble;
    window.showFallbackBubble = function(text, opts){
      try{ debugShow(text, opts); }catch(e){}
      try{ return orig(text, opts); }catch(e){}
    };
    console.log('[AssistantDebug] patched showFallbackBubble to also show debug bubble');
  } else {
    // create a small poll to patch later
    var tries = 0;
    var id = setInterval(function(){
      if (typeof showFallbackBubble === 'function'){
        clearInterval(id);
        var orig = showFallbackBubble;
        window.showFallbackBubble = function(text, opts){
          try{ debugShow(text, opts); }catch(e){};
          try{ return orig(text, opts); }catch(e){};
        };
        console.log('[AssistantDebug] patched late showFallbackBubble');
      }
      tries++; if (tries>30) clearInterval(id);
    }, 200);
  }
})();


