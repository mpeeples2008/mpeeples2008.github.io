
(function(){
  // Safe single AudioContext, created on first user gesture.
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    return;
  }

  if (!window._sfxManagerInstalled) {
    window._sfxManagerInstalled = true;

    const ctx = new AudioCtx();
    window._gameAudioCtx = ctx;
    const MAX_VOICES = 8; // limit concurrent SFX to avoid mobile overload
    const activeSources = new Set();
    const bufferCache = new Map();
    const pendingFetches = new Map();

    // Resume context on first user gesture (iOS requires this).
    function resumeOnGesture() {
      if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
        ctx.resume().then(()=>console.info('[SfxManager] AudioContext resumed')).catch(()=>{});
      }
      document.removeEventListener('pointerdown', resumeOnGesture);
      document.removeEventListener('touchstart', resumeOnGesture);
    }
    document.addEventListener('pointerdown', resumeOnGesture, { once: true, passive: true });
    document.addEventListener('touchstart', resumeOnGesture, { once: true, passive: true });

    // Utility: fetch + decode audio buffer, with memoization
    async function fetchDecode(url) {
      if (bufferCache.has(url)) return bufferCache.get(url);
      if (pendingFetches.has(url)) return pendingFetches.get(url);
      const p = fetch(url, {mode:'cors'}).then(r => {
        if (!r.ok) throw new Error('fetch failed '+r.status);
        return r.arrayBuffer();
      }).then(ab => ctx.decodeAudioData(ab)).then(buf => {
        bufferCache.set(url, buf);
        pendingFetches.delete(url);
        return buf;
      }).catch(err => { pendingFetches.delete(url); console.warn('[SfxManager] fetchDecode failed', err); throw err; });
      pendingFetches.set(url, p);
      return p;
    }

    // Play a buffer (or Audio element fallback) with pooling and voice limit
    function playBuffer(buf, when=0, volume=1.0, options={}) {
      // If too many voices, stop oldest
      if (activeSources.size >= MAX_VOICES) {
        // stop one arbitrary (oldest) source
        const it = activeSources.values();
        const oldest = it.next().value;
        try { oldest.stop(); } catch(e){}
        activeSources.delete(oldest);
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.value = typeof volume === 'number' ? volume : 1.0;
      src.connect(gain);
      gain.connect(ctx.destination);
      activeSources.add(src);
      src.onended = function() { try { activeSources.delete(src); } catch(e){} };
      try { src.start(when); } catch(e){ console.warn('[SfxManager] start failed', e); }
      return src;
    }

    // Public manager
    /* original SfxManager definition removed */

    // expose
    window.SfxManager = SfxManager;

    // --- Integrate with existing createSfx/playSfx if present ---
    try {
      if (typeof window.createSfx === 'function') {
        const orig = window.createSfx;
        window.createSfx = function(key) {
          try {
            const el = orig.apply(this, arguments);
            try {
              const src = (el && el.src) ? el.src : null;
              if (src) {
                SfxManager.preload([src]);
              }
            } catch(e){}
            return el;
          } catch(e) { return orig.apply(this, arguments); }
        };
      }
    } catch(e){}

    try {
      if (typeof window.playSfx === 'function') {
        const origPlaySfx = window.playSfx;
        window.playSfx = function(keyOrUrl, opts) {
          try {
            const cache = window.sfxCache || {};
            const maybe = cache[keyOrUrl];
            if (maybe instanceof HTMLMediaElement) {
              try { maybe.volume = window.sfxVolume || 0.5; maybe.muted = !!window.allMuted; maybe.play().catch(()=>{}); return maybe; } catch(e){}
            }
            const candidateUrl = (typeof maybe === 'string') ? maybe : (typeof keyOrUrl === 'string' && keyOrUrl.match(/^https?:\/\//) ? keyOrUrl : null);
            if (candidateUrl) {
              SfxManager.play(candidateUrl, opts).catch(()=>{});
              return null;
            }
            try { return origPlaySfx.apply(this, arguments); } catch(e){ console.warn('[SfxManager] orig playSfx failed', e); }
          } catch(e){ console.warn('[SfxManager] playSfx wrapper error', e); }
        };
      } else {
        window.playSfx = function(keyOrUrl, opts) {
          try {
            const cache = window.sfxCache || {};
            const maybe = cache[keyOrUrl];
            if (maybe instanceof HTMLMediaElement) { try { maybe.play().catch(()=>{}); return maybe; } catch(e){} }
            if (typeof keyOrUrl === 'string' && keyOrUrl.match(/^https?:\/\//)) {
              SfxManager.play(keyOrUrl, opts).catch(()=>{});
              return null;
            }
            if (typeof maybe === 'string') { SfxManager.play(maybe, opts).catch(()=>{}); return null; }
            return null;
          } catch(e){ console.warn('[SfxManager] playSfx created fallback error', e); return null; }
        };
      }
    } catch(e){ console.warn('[SfxManager] failed to patch playSfx', e); }

  }
})();

