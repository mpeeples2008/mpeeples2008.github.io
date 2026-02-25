
(function(){
  // Safety initialization to reattach hooks and ensure required DOM nodes exist.
  const ensure = (id, tag='div', cls='', hidden=true) => {
    if (document.getElementById(id)) return document.getElementById(id);
    const el = document.createElement(tag);
    el.id = id;
    if (cls) el.className = cls;
    if (hidden) el.style.display = 'none';
    document.body.appendChild(el);
    return el;
  };

  // Common IDs expected by game scripts - create hidden placeholders if missing
  const expectedIds = ['hud', 'score', 'highscore', 'board', 'side-panel', 'game-hud', 'controls'];
  expectedIds.forEach(id => ensure(id));

  // Guard wrapper for updateHUD if it's called before DOM ready or missing elements
  if (typeof window.updateHUD === 'function') {
    const origUpdate = window.updateHUD;
    window.updateHUD = function(...args) {
      try {
        origUpdate.apply(this, args);
      } catch(e) {
        console.warn('[GoneViral] updateHUD wrapper caught error:', e);
      }
    };
  } else {
    // provide a no-op to avoid errors
    window.updateHUD = function(){ console.warn('[GoneViral] updateHUD not defined; noop called.'); };
  }

  // Guard wrapper for loadHighScore
  if (typeof window.loadHighScore === 'function') {
    const origLoad = window.loadHighScore;
    window.loadHighScore = function(...args) {
      try {
        return origLoad.apply(this, args);
      } catch(e) {
        console.warn('[GoneViral] loadHighScore wrapper caught error:', e);
        return null;
      }
    };
  } else {
    window.loadHighScore = function(){ console.warn('[GoneViral] loadHighScore missing; noop.'); return null; };
  }

  // Reattach pointer handlers to existing cell elements if functions exist
  function reattachCellHandlers() {
    const cells = document.querySelectorAll('.cell');
    if (!cells || cells.length === 0) return;
    cells.forEach(cell => {
      // avoid duplicating listeners: we'll set a data attribute
      if (cell.dataset.reattached === '1') return;
      cell.dataset.reattached = '1';
      cell.tabIndex = cell.tabIndex || 0;
      cell.addEventListener('pointerdown', (ev) => {
        const idx = cell.dataset.index !== undefined ? Number(cell.dataset.index) : null;
        if (typeof window.handleCellPointer === 'function') {
          try { window.handleCellPointer(idx, ev); } catch(e){ console.warn('handleCellPointer error', e); }
        } else if (typeof window.handleClick === 'function') {
          try { window.handleClick(idx); } catch(e){ console.warn('handleClick error', e); }
        }
      });
      cell.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          const idx = cell.dataset.index !== undefined ? Number(cell.dataset.index) : null;
          if (typeof window.handleClick === 'function') window.handleClick(idx);
        }
      });
    });
  }

  // Run after DOMContentLoaded in case file executed late
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', reattachCellHandlers);
  } else {
    reattachCellHandlers();
  }

  // Expose a small diagnostic function to console for troubleshooting
  window.__goneViral_diag = function(){
    return {
      cells: document.querySelectorAll('.cell').length,
      hud: !!document.getElementById('hud'),
      score: !!document.getElementById('score'),
      highscore: !!document.getElementById('highscore'),
      board: !!document.getElementById('board'),
      functions: {
        updateHUD: typeof window.updateHUD,
        loadHighScore: typeof window.loadHighScore,
        handleClick: typeof window.handleClick,
        handleCellPointer: typeof window.handleCellPointer
      }
    };
  };
})();

