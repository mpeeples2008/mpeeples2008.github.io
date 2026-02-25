
(function(){
  // Disabled this wrapper because it duplicates the primary Assistant API
  // and can create fallback bubbles via extra event paths.
  return;
  var preExisting = (window.Assistant && window.Assistant.__original) ? window.Assistant.__original : window.Assistant || null;
  function createEmitter(){ var handlers = Object.create(null); return { on: function(evt, fn){ if (typeof fn !== 'function') return; (handlers[evt] || (handlers[evt]=[])).push(fn); }, off: function(evt, fn){ if (!handlers[evt]) return; if (!fn) { delete handlers[evt]; return; } handlers[evt]=handlers[evt].filter(f=>f!==fn); }, emit: function(evt){ var args = Array.prototype.slice.call(arguments,1); var list = (handlers[evt] || []).slice(); for(var i=0;i<list.length;i++){ try{ list[i].apply(null, args); }catch(e){ console.warn('assistant handler error',e);} } } }; }
  var emitter = createEmitter();
  var inProxyCall = false;
  function assistantEnabledNow(){
    try {
      if (window.assistantMuted) return false;
      if (window.enableAssistant === false) return false;
      if (document.body && document.body.classList.contains('assistant-disabled')) return false;
      if (document.documentElement && document.documentElement.classList.contains('assistant-disabled')) return false;
      return true;
    } catch(e){ return !window.assistantMuted; }
  }
  
  function ensureBubbleRoot(){
    var root = document.getElementById('assistant-bubble-root');
    if (root) return root;
    root = document.createElement('div');
    root.id = 'assistant-bubble-root';
    /* Use fixed positioning and a very high z-index to avoid being clipped by other stacking contexts */
    root.style.position = 'fixed';
    root.style.right = '20px';
    root.style.bottom = '120px';
    root.style.zIndex = '2147483647';
    root.style.pointerEvents = 'none';
    /* prevent accidental clipping */
    root.style.maxWidth = '40vw';
    root.style.display = 'block';
    document.body.appendChild(root);
    try { console.log('[Assistant][module] fallback bubble root created', root); } catch(e){}
    return root;
  }

  
  
  
  
  function showFallbackBubble(text, opts){
    opts = opts || {};
    if (!assistantEnabledNow()) return;
    try {
      // Ensure style exists
      if (!document.getElementById('assistant-fallback-style')) {
        var style = document.createElement('style');
        style.id = 'assistant-fallback-style';
        style.textContent = `
#assistant-bubble-root { position: fixed !important; right: 20px !important; bottom: 120px !important; z-index: 2147483647 !important; pointer-events: none !important; max-width: 40vw !important; display:block !important; }
.assistant-fallback-bubble {
  pointer-events: auto !important;
  max-width: 40vw !important;
  padding: 12px 14px !important;
  background: rgba(255,250,230,0.98) !important;
  color: #0b1220 !important;
  border-radius: 10px !important;
  border: 1px solid rgba(10,10,10,0.06) !important;
  box-shadow: 0 10px 30px rgba(0,0,0,0.25) !important;
  font-size: 14px !important;
  line-height: 1.35 !important;
  opacity: 0 !important;
  transition: opacity 220ms ease !important;
  position: relative !important;
  text-align: left !important;
}
.assistant-fallback-bubble.sticky {
  background: rgba(255,245,230,1) !important;
}
`;
        (document.head||document.documentElement).appendChild(style);
      }
      var root = ensureBubbleRoot();
      // clear existing content
      root.innerHTML = '';
      var b = document.createElement('div');
      b.className = 'assistant-fallback-bubble';
      if (opts.sticky) b.classList.add('sticky');
      b.setAttribute('data-debug','1');
      b.style.opacity = '0';
      b.textContent = (typeof text === 'string') ? text : (text && text.message) || JSON.stringify(text);
      // append root to documentElement to avoid body clipping
      (document.documentElement || document.body).appendChild(root);
      root.appendChild(b);
      try { console.log('[Assistant][module] fallback bubble shown', b); } catch(e){}
      // show
      requestAnimationFrame(function(){ b.style.opacity = '1'; });
      // auto-hide unless sticky
      if (!opts.sticky) {
        setTimeout(function(){
          try {
            b.style.opacity = '0';
            setTimeout(function(){ if (b.parentNode) b.parentNode.removeChild(b); }, 240);
          } catch(e){}
        }, typeof opts.timeout === 'number' ? opts.timeout : 4000);
      } else {
        // if sticky, allow click to dismiss
        b.style.cursor = 'pointer';
        b.addEventListener('click', function(){ try{ b.style.opacity='0'; setTimeout(function(){ if (b.parentNode) b.parentNode.removeChild(b); }, 180); }catch(e){} }, {passive:true});
      }
    } catch(e){ console.warn('showFallbackBubble error', e); }
  }

`;
        (document.head||document.documentElement).appendChild(style);
      }
      var root = ensureBubbleRoot();
      root.innerHTML = '';
      var b = document.createElement('div');
      b.className = 'assistant-fallback-bubble';
      b.setAttribute('data-debug','1');
      /* removed setting opacity 0 */
      b.textContent = (typeof text === 'string') ? text : (text && text.message) || JSON.stringify(text);
      // append to documentElement to avoid body clipping
      (document.documentElement || document.body).appendChild(root);
      root.appendChild(b);
      try { console.log('[Assistant][module] fallback bubble shown (persistent)', b); } catch(e){}
      // show (persistent - no auto-hide)
      requestAnimationFrame(function(){ b.style.opacity = '1'; });
      // expose a close helper on the root for debugging: click to remove
      root.addEventListener('click', function(){ try{ /* removed setting opacity 0 */ setTimeout(function(){ if (b.parentNode) b.parentNode.removeChild(b); }, 180); }catch(e){} }, {passive:true});
    } catch(e){ console.warn('showFallbackBubble error', e); }
  }

  var internal = {
    _inited: false,
    _timers: [],
    init: function(opts){
      if (this._inited) return;
      this._inited = true;
      try {
        console.log('[Assistant][module] init() preExisting=', !!preExisting);
        if (preExisting && typeof preExisting.init === 'function') {
          preExisting.init(opts);
        } else {
          var badge = document.getElementById('assist-badge') || document.querySelector('.assist-badge');
          if (badge) badge.style.display = '';
        }
        // Only use fallback bubbles when there is no pre-existing Assistant.show implementation.
        if (!preExisting || typeof preExisting.show !== 'function') {
          emitter.on('show', function(text, meta){
            try {
              showFallbackBubble(text, (meta && meta.opts) || {});
            } catch(e){ console.warn('fallback show handler error', e); }
          });
        }
      } catch(e){ console.warn('Assistant.init error', e); }
    },
    show: function(){
      if (!assistantEnabledNow()) return;
      var args = arguments;
      try {
        console.log('[Assistant][module] show() called; preExisting=', !!preExisting, 'inProxyCall=', inProxyCall, 'args=', args);
        try { emitter.emit.apply(emitter, ['show'].concat(Array.prototype.slice.call(args))); } catch(e){}
        if (preExisting && typeof preExisting.show === 'function' && !inProxyCall) {
          inProxyCall = true;
          try { preExisting.show.apply(preExisting, args); } catch(e){ console.warn('preExisting.show error', e); }
          inProxyCall = false;
        } else if (preExisting && typeof preExisting.show === 'function' && inProxyCall) {
          console.log('[Assistant][module] show() skipped proxy to avoid recursion');
        }
      } catch(e){ console.warn('Assistant.show error', e); }
    },
    emit: function(){
      if (!assistantEnabledNow()) return;
      var args = Array.prototype.slice.call(arguments);
      try { console.log('[Assistant][module] emit() called; event=', args[0], 'preExisting=', !!preExisting, 'inProxyCall=', inProxyCall, 'args=', args.slice(1)); } catch(e){}
      try { emitter.emit.apply(emitter, args); } catch(e){ console.warn('assistant local emit error', e); }
      try{
        if (preExisting && typeof preExisting.emit === 'function' && !inProxyCall){
          inProxyCall = true;
          try { preExisting.emit.apply(preExisting, args); } catch(e){ console.warn('preExisting.emit error', e); }
          inProxyCall = false;
        } else if (preExisting && typeof preExisting.emit === 'function' && inProxyCall) {
          console.log('[Assistant][module] skipping proxy emit to avoid recursion');
        }
      } catch(e){ console.warn('Assistant.emit proxy error', e); }
    },
    on: function(evt, fn){ emitter.on(evt, fn); },
    off: function(evt, fn){ emitter.off(evt, fn); },
    destroy: function(){
      if (!this._inited) return;
      this._inited = false;
      try {
        console.log('[Assistant][module] destroy() preExisting=', !!preExisting);
        try { if (preExisting && typeof preExisting.clear === 'function') preExisting.clear(); } catch(e){}
        if (preExisting && typeof preExisting.destroy === 'function') {
          preExisting.destroy();
        } else {
          var badge = document.getElementById('assist-badge') || document.querySelector('.assist-badge');
          if (badge) badge.style.display = 'none';
        }
        if (this._timers && this._timers.length) {
          this._timers.forEach(function(t){ try { clearTimeout(t); clearInterval(t); } catch(e){} });
          this._timers = [];
        }
        emitter = createEmitter();
        try { var root=document.getElementById('assistant-bubble-root'); if (root && root.parentNode) root.parentNode.removeChild(root); } catch(e){}
      } catch(e){ console.warn('Assistant.destroy error', e); }
    }
  };
  var api = {
    init: function(){ return internal.init.apply(internal, arguments); },
    show: function(){ return internal.show.apply(internal, arguments); },
    emit: function(){ return internal.emit.apply(internal, arguments); },
    on: function(){ return internal.on.apply(internal, arguments); },
    off: function(){ return internal.off.apply(internal, arguments); },
    destroy: function(){ return internal.destroy.apply(internal, arguments); },
    __original: preExisting
  };
  try { window.Assistant = api; } catch(e){ console.warn('install assistant api failed', e); }
  try {
    var enabledCheck = (typeof window.enableAssistant === 'boolean') ? window.enableAssistant : true;
    if (document.readyState !== 'loading') {
      if (enabledCheck) { api.init(); document.body.classList.remove('assistant-disabled'); }
      else { api.destroy(); document.body.classList.add('assistant-disabled'); }
    }
  } catch(e) { console.warn('assistant immediate init check failed', e); }
  document.addEventListener('DOMContentLoaded', function(){
    try {
      var enabled = (typeof window.enableAssistant === 'boolean') ? window.enableAssistant : true;
      if (enabled) { api.init(); document.body.classList.remove('assistant-disabled'); }
      else { api.destroy(); document.body.classList.add('assistant-disabled'); }
    } catch(e) {}
  });
})();

