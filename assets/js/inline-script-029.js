
(function(){
  function collectUrlsFromCache(cache) {
    const urls = new Set();
    try {
      Object.values(cache).forEach(item => {
        try {
          if (!item) return;
          if (typeof item === 'string' && item.match(/^https?:\/\//)) urls.add(item);
          else if (item instanceof HTMLMediaElement && item.src) urls.add(item.src);
          else if (typeof item === 'object' && item.src && typeof item.src === 'string') urls.add(item.src);
        } catch(e){}
      });
    } catch(e){}
    return Array.from(urls);
  }

  function tryPreloadNow() {
    try {
      if (typeof window.SfxManager !== 'object' || typeof window.SfxManager.preload !== 'function') return false;
      const cache = window.sfxCache || {};
      const urls = collectUrlsFromCache(cache);
      // also scan audio tags
      try {
        document.querySelectorAll('audio').forEach(a=>{ if (a && a.src && a.src.match(/^https?:\/\//)) urls.push(a.src); });
      } catch(e){}
      // dedupe
      const dedup = Array.from(new Set(urls));
      if (dedup.length) {
/* console.info('[SfxManager] (watcher) Preloading sfxCache URLs:', dedup); */
        window.SfxManager.preload(dedup);
        return true;
      }
      return false;
    } catch(e){ console.warn('[SfxManager] watcher preload error', e); return false; }
  }

  // Strategy: immediate attempt, then observe for changes to window.sfxCache (polling) up to a limit.
  if (tryPreloadNow()) return;

  let attempts = 0;
  const maxAttempts = 40; // try for up to ~10 seconds with 250ms interval
  const interval = setInterval(()=> {
    attempts++;
    if (tryPreloadNow()) {
      clearInterval(interval);
    } else if (attempts >= maxAttempts) {
      clearInterval(interval);
      // install a fallback MutationObserver for DOM audio tags (covers cases where sfx are added as <audio> later)
      try {
        const mo = new MutationObserver((muts)=> {
          tryPreloadNow();
        });
        mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
      } catch(e){ console.warn('[SfxManager] watcher: could not install MutationObserver', e); }
    }
  }, 250);

  // Additionally, attempt to detect assignment to window.sfxCache by redefining the property if possible.
  try {
    if (Object.getOwnPropertyDescriptor(window, 'sfxCache') === undefined) {
      let _val = window.sfxCache;
      Object.defineProperty(window, 'sfxCache', {
        configurable: true,
        enumerable: true,
        get() { return _val; },
        set(v) { _val = v; tryPreloadNow(); return _val; }
      });
    }
  } catch(e){ /* ignore if not allowed */ }
})();

