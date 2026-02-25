
(function(){
  // ensure AI_SFX_URLS exists or fallback
  var SFX = (typeof AI_SFX_URLS !== 'undefined' && Array.isArray(AI_SFX_URLS) && AI_SFX_URLS.length) ? AI_SFX_URLS.slice() : (window.AI_SFX_URLS && Array.isArray(window.AI_SFX_URLS) ? window.AI_SFX_URLS.slice() : [
    "https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI1.mp3",
    "https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI2.mp3",
    "https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI3.mp3"
  ]);

  // simple cache to avoid re-creating Audio objects too often
  window._assistantSfxCache = window._assistantSfxCache || {};

  function getRandomSfxUrl() {
    if (!SFX || !SFX.length) return null;
    return SFX[Math.floor(Math.random()*SFX.length)];
  }

  // create or reuse audio element for a given url
  function createSfx(url) {
    if (!url) return null;
    window._assistantSfxCache = window._assistantSfxCache || {};
    try {
      if (window._assistantSfxCache[url]) {
        var a = window._assistantSfxCache[url].cloneNode(); // clone so overlapping plays allowed
        a.volume = (typeof window.sfxVolume === 'number') ? window.sfxVolume : (window.sfxVolume || 0.5);
        a.muted = !!window.allMuted;
        return a;
      } else {
        var aa = new Audio(url);
        aa.preload = 'auto';
        aa.volume = (typeof window.sfxVolume === 'number') ? window.sfxVolume : (window.sfxVolume || 0.5);
        aa.muted = !!window.allMuted;
        // cache base element but we'll clone for playbacks to allow overlap
        window._assistantSfxCache[url] = aa;
        var clone = aa.cloneNode();
        return clone;
      }
    } catch (e) { console.warn('createSfx failed', e); return null; }
  }

  // CSS for jitter keyframes - add to head if not present
  var jitterCssId = 'startModal-jitter-css';
  if (!document.getElementById(jitterCssId)) {
    var css = document.createElement('style');
    css.id = jitterCssId;
    css.textContent = "\n@keyframes modalJitterX { 0% { transform: translateX(0) } 25% { transform: translateX(-6px) rotate(-1deg)} 50% { transform: translateX(6px) rotate(1deg)} 75% { transform: translateX(-3px) rotate(-0.6deg)} 100% { transform: translateX(0) rotate(0)} }\n#startModal .modal-img.jitter { animation: modalJitterX 360ms ease-in-out; }\n";
    document.head.appendChild(css);
  }

  var jitterInterval = null;
  var isModalShown = false;

  function startJitterLoop() {
    if (jitterInterval) return;
    // immediately trigger one jitter, then set interval with slight randomness
    triggerJitterAndSfx();
    jitterInterval = setInterval(function(){
      triggerJitterAndSfx();
    }, 4000 + Math.floor(Math.random()*3000)); // every 2.5s to 4.5s approx
  }

  function stopJitterLoop() {
    if (jitterInterval) { clearInterval(jitterInterval); jitterInterval = null; }
    // ensure remove class if left on
    var img = document.querySelector('#startModal .modal-img');
    if (img) img.classList.remove('jitter');
  }

  function triggerJitterAndSfx() {
    var img = document.querySelector('#startModal .modal-img');
    if (!img) return;
    // add jitter class (animation is 360ms); remove after animationend
    try {
      img.classList.remove('jitter');
      // force reflow to restart animation
      void img.offsetWidth;
      img.classList.add('jitter');
      // remove after animation completes to allow re-adding later
      img.addEventListener('animationend', function _onend(){ img.classList.remove('jitter'); img.removeEventListener('animationend', _onend); });
    } catch (e) { console.warn('jitter failed', e); }

    // play random sfx if not muted
    try {
      if (window.allMuted) return;
      var url = getRandomSfxUrl();
      if (!url) return;
      var s = createSfx(url);
      if (!s) return;
      // Slight random pitch variation for variety if supported
      try { s.playbackRate = 0.95 + Math.random()*0.12; } catch (e) {}
      // Ensure latest volume applied
      try { s.volume = (typeof window.sfxVolume === 'number') ? window.sfxVolume : (window.sfxVolume || 0.5); } catch (e) {}
      s.play().catch(function(err){ /* ignore play errors (autoplay restrictions) */ });
    } catch (e) { console.warn('play sfx failed', e); }
  }

  // Hook into modal show/hide - observe classList changes on #startModal to start/stop jitter
  function observeModal() {
    var modal = document.getElementById('startModal');
    if (!modal) return;
    // Start when .show present; stop otherwise
    var mo = new MutationObserver(function(muts){
      muts.forEach(function(m){
        if (m.attributeName === 'class') {
          var has = modal.classList.contains('show');
          if (has && !isModalShown) { isModalShown = true; startJitterLoop(); }
          else if (!has && isModalShown) { isModalShown = false; stopJitterLoop(); }
        }
      });
    });
    mo.observe(modal, { attributes: true, attributeFilter: ['class'] });
    // if modal already visible at load, start
    if (modal.classList.contains('show')) { isModalShown = true; startJitterLoop(); }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observeModal);
  else setTimeout(observeModal, 0);

  // Also stop when page is hidden to avoid audio playing in background
  document.addEventListener('visibilitychange', function(){ if (document.hidden) stopJitterLoop(); });

})();

