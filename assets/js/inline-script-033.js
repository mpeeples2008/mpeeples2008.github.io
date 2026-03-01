
(function(){
  function ensureOriginal(){
    if (!window._originalAssistant) {
      // save any existing Assistant API
      window._originalAssistant = window.Assistant || { emit:function(){}, on:function(){}, off:function(){} };
    }
  }

  function clearAssistantVisuals() {
    try {
      var bubbles = Array.from(document.querySelectorAll(
        '.assist-bubble, #assist-bubble, .assistant-bubble, .ai-assistant-bubble, .assistant-fallback-bubble'
      ));
      bubbles.forEach(function(b){
        try {
          b.classList.remove('show');
          b.style.setProperty('display', 'none', 'important');
          b.style.setProperty('visibility', 'hidden', 'important');
          b.style.setProperty('opacity', '0', 'important');
          b.style.setProperty('pointer-events', 'none', 'important');
        } catch(e){}
      });
      var textEl = document.getElementById('assist-text');
      if (textEl) {
        try { textEl.textContent = ''; } catch(e){}
      }
      var fallbackRoot = document.getElementById('assistant-bubble-root');
      if (fallbackRoot) {
        try { fallbackRoot.innerHTML = ''; } catch(e){}
        try { fallbackRoot.remove(); } catch(e){}
      }
      var fallbackBubbles = Array.from(document.querySelectorAll('.assistant-fallback-bubble'));
      fallbackBubbles.forEach(function(b){ try { b.remove(); } catch(e){} });
    } catch(e){}
  }

  function restoreAssistantVisuals() {
    try {
      var bubbles = Array.from(document.querySelectorAll(
        '.assist-bubble, #assist-bubble, .assistant-bubble, .ai-assistant-bubble, .assistant-fallback-bubble'
      ));
      bubbles.forEach(function(b){
        try {
          b.style.removeProperty('display');
          b.style.removeProperty('visibility');
          b.style.removeProperty('opacity');
          b.style.removeProperty('pointer-events');
        } catch(e){}
      });
      var textEl = document.getElementById('assist-text');
      if (textEl && !String(textEl.textContent || '').trim()) {
        try { textEl.textContent = '...'; } catch(e){}
      }
    } catch(e){}
  }
  
function setAssistantEnabled(val) {
  try {
    window.enableAssistant = !!val;
    // hard gate for all assistant message paths
    window.assistantMuted = !window.enableAssistant;
    try { localStorage.setItem('assistantEnabled', window.enableAssistant ? 'true' : 'false'); } catch(e){}
    if (window.enableAssistant) {
      try { if (window.Assistant && typeof window.Assistant.init === 'function') window.Assistant.init(); } catch(e){}
      document.body.classList.remove('assistant-disabled');
      try { document.documentElement.classList.remove('assistant-disabled'); } catch(e){}
      restoreAssistantVisuals();
    } else {
      try { if (window.Assistant && typeof window.Assistant.clear === 'function') window.Assistant.clear(); } catch(e){}
      try { if (window.Assistant && typeof window.Assistant.destroy === 'function') window.Assistant.destroy(); } catch(e){}
      document.body.classList.add('assistant-disabled');
      try { document.documentElement.classList.add('assistant-disabled'); } catch(e){}
      clearAssistantVisuals();
    }
  } catch(e) { console.warn('setAssistantEnabled error', e); }
}

document.addEventListener('DOMContentLoaded', function(){
  try { ensureOriginal(); } catch(e){}
  var cb = document.getElementById('assistantToggle');
  var span = (cb && cb.parentElement) ? cb.parentElement.querySelector('.assistant-toggle-switch') : null;
  var initial = true;
  try { initial = localStorage.getItem('assistantEnabled') !== 'false'; } catch(e){ initial = true; }
  if (cb){
    cb.checked = initial;
    setAssistantEnabled(cb.checked);
    cb.addEventListener('change', function(){ setAssistantEnabled(cb.checked); });
  } else {
    setAssistantEnabled(initial);
  }
  if (span && cb){
    span.addEventListener('click', function(e){ e.preventDefault(); cb.checked = !cb.checked; cb.dispatchEvent(new Event('change')); });
  }
});
})();

