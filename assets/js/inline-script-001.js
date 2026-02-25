
/* Simple, safe SfxManager for local testing and reliability */
window.SfxManager = (function(){
  const S = {
    installed: false,
    volume: 0.6,
    enabled: true,
    // Play a small audio via HTMLAudioElement; swallow errors
    play: function(url){
      if (!this.enabled || !url) return;
      try {
        // Avoid attempting to load file:// resources for local testing
        if (location && location.protocol === 'file:' && url.startsWith('/')) {
          // skip attempting to fetch absolute local paths
          return;
        }
        const a = new Audio(url);
        a.volume = this.volume;
        const p = a.play();
        if (p && typeof p.catch === 'function') p.catch(()=>{});
      } catch(e) {
      }
    },
    preload: function(urls){
      if (!Array.isArray(urls)) return;
      if (location && location.protocol === 'file:') return; // skip preloading on file://
      try {
        urls.forEach(u=>{
          try { fetch(u, {mode:'no-cors'}).catch(()=>{}); } catch(e){}
        });
      } catch(e){}
    },
    install: function(){ this.installed = true; },
    setVolume: function(v){ this.volume = Number(v) || 0.6; },
  };
  return S;
})();

