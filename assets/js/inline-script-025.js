
/* Particle Pooling System (non-destructive)
   - Provides window.ParticlePool for manual use
   - Auto-overrides common global particle factory names (if present):
     spawnParticle, createParticle, emitParticle, addParticle
   - New API:
     const p = ParticlePool.get(x,y,opts); // returns an element
     ParticlePool.release(elem);
   - Works by reusing .particle nodes and resetting inline styles.
*/
(function(){
  class ParticlePoolClass {
    constructor(containerSelector='body', maxSize=200) {
      this.pool = [];
      this.inUse = new Set();
      this.container = document.querySelector(containerSelector) || document.body;
      this.maxSize = maxSize;
    }
    _createNew() {
      const el = document.createElement('div');
      el.className = 'particle';
      // minimal default styles to keep visuals; user CSS will override
      el.style.position = 'absolute';
      el.style.pointerEvents = 'none';
      el.style.willChange = 'transform, opacity';
      el.style.display = 'none';
      this.container.appendChild(el);
      return el;
    }
    get(x=0,y=0, opts={}) {
      let el = null;
      if (this.pool.length > 0) {
        el = this.pool.pop();
      } else {
        // create if pool empty and under maxSize
        el = this._createNew();
      }
      this.inUse.add(el);
      el.style.display = '';
      // reset styles
      el.style.opacity = (opts.opacity!==undefined?opts.opacity:1);
      el.style.transform = `translate(${x}px, ${y}px)`;
      el.style.left = '0px';
      el.style.top = '0px';
      // custom attrs
      if (opts.className) el.className = 'particle ' + opts.className;
      if (opts.html) el.innerHTML = opts.html;
      // attach a marker so release is easy
      el.dataset._pooled = '1';
      return el;
    }
    release(el) {
      if (!el) return;
      try {
        // guard: ignore if not pooled
        if (!el.dataset || el.dataset._pooled !== '1') {
          // if it wasn't from the pool, remove it to avoid leaks
          if (el.parentNode) el.parentNode.removeChild(el);
          return;
        }
        // cleanup
        el.style.display = 'none';
        el.style.opacity = '';
        el.style.transform = '';
        el.innerHTML = '';
        el.className = 'particle';
        delete el.dataset._pooled;
        this.inUse.delete(el);
        if (this.pool.length < this.maxSize) {
          this.pool.push(el);
        } else {
          // container has enough cached nodes; remove excess
          if (el.parentNode) el.parentNode.removeChild(el);
        }
      } catch(e){
        console.warn('[ParticlePool] release error', e);
      }
    }
    // convenience: run a simple particle animation then release automatically
    animateOnce(x,y,opts={}, duration=600) {
      const el = this.get(x,y,opts);
      // allow caller to customize via returned element
      if (opts.beforeStart && typeof opts.beforeStart === 'function') {
        try { opts.beforeStart(el); } catch(e){ console.warn(e); }
      }
      // start animation using CSS transitions if possible
      requestAnimationFrame(() => {
        el.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
        if (opts.to) {
          el.style.transform = `translate(${opts.to.x}px, ${opts.to.y}px)`;
        } else {
          el.style.transform = `translate(${x}px, ${y-40}px)`;
        }
        el.style.opacity = '0';
      });
      // release after duration + small buffer
      setTimeout(() => {
        el.style.transition = '';
        this.release(el);
        if (opts.onComplete && typeof opts.onComplete === 'function') {
          try { opts.onComplete(el); } catch(e){ console.warn(e); }
        }
      }, duration + 40);
      return el;
    }
  }

  // expose a global pool instance bound to the main game container if present
  const gameContainerCandidates = ['#board', '.board', '.game', '#game', 'main', 'body'];
  let containerSel = 'body';
  for (const s of gameContainerCandidates) {
    if (document.querySelector(s)) {
      containerSel = s;
      break;
    }
  }
  const ParticlePool = new ParticlePoolClass(containerSel, 400);
  window.ParticlePool = ParticlePool;

  // Helper to auto-wrap/override common particle factory functions to use the pool.
  function tryOverride(fnName) {
    try {
      const orig = window[fnName];
      if (typeof orig !== 'function') return false;
      // create a wrapper that calls orig (if it returns an element) else uses pool animate
      window['__orig_' + fnName] = orig;
      window[fnName] = function(...args) {
        try {
          // try to run original; if it returns an element, ensure it's pooled
          const result = orig.apply(this, args);
          if (result && result instanceof Element) {
            // if it created a DOM node, don't double-manage; but mark it pooled for release convenience
            try { result.dataset._pooled = '1'; } catch(e){}
            return result;
          }
        } catch(e) {
          // original failed; fallback to pool
          console.warn('[ParticlePool] original', fnName, 'failed, using pooled fallback', e);
        }
        // fallback logic: attempt to interpret common arg patterns:
        // spawnParticle(x,y, opts) or spawnParticle({x,y}, opts)
        let x=0,y=0, opts={};
        if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
          const a = args[0];
          x = a.x||a.left||0;
          y = a.y||a.top||0;
          opts = a.opts||a;
        } else {
          x = Number(args[0]) || 0;
          y = Number(args[1]) || 0;
          opts = args[2]||{};
        }
        if (opts && opts.animateOnce) {
          return ParticlePool.animateOnce(x,y,opts, opts.duration || 800);
        } else {
          return ParticlePool.get(x,y,opts);
        }
      };
      console.info('[ParticlePool] overridden', fnName);
      return true;
    } catch(e) {
      console.warn('[ParticlePool] cannot override', fnName, e);
      return false;
    }
  }

  const candidates = ['spawnParticle','createParticle','emitParticle','addParticle','makeParticle'];
  // try to override after DOM ready
  function overrideIfReady() {
    candidates.forEach(tryOverride);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', overrideIfReady);
  } else {
    overrideIfReady();
  }

  // expose a small inspector
  window.__ParticlePool_info = function() {
    return {
      poolSize: ParticlePool.pool.length,
      inUse: ParticlePool.inUse.size,
      container: ParticlePool.container && (ParticlePool.container.tagName || ParticlePool.container.id || ParticlePool.container.className)
    };
  };

})();

