
(function(){
  function gatherSfxUrls() {
    const urls = new Set();
    try {
      const cache = window.sfxCache || {};
      Object.values(cache).forEach(item => {
        try {
          if (!item) return;
          if (typeof item === 'string' && item.match(/^https?:\/\//)) {
            urls.add(item);
          } else if (item instanceof HTMLMediaElement && item.src) {
            urls.add(item.src);
          } else if (typeof item === 'object' && item.src && typeof item.src === 'string') {
            urls.add(item.src);
          }
        } catch(e){}
      });
      // also scan DOM for audio tags with src
      try {
        const audios = document.querySelectorAll('audio');
        audios.forEach(a => { if (a && a.src && a.src.match(/^https?:\/\//)) urls.add(a.src); });
      } catch(e){}
    } catch(e){}
    return Array.from(urls);
  }

  function tryPreload() {
    try {
      if (!window.SfxManager || typeof window.SfxManager.preload !== 'function') {
        // retry after short delay (SfxManager may be installed after our script)
        setTimeout(tryPreload, 150);
        return;
      }
      const list = gatherSfxUrls();
      if (list && list.length) {
        try {
          window.SfxManager.preload(list);
        } catch(e) { console.warn('[SfxManager] preload failed', e); }
      } else {
      }
    } catch(e){ console.warn('[SfxManager] tryPreload error', e); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryPreload);
  } else {
    tryPreload();
  }
})();

