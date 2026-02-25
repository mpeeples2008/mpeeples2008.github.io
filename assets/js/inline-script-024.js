
(function(){
  function safeQueryBoard() {
    return document.getElementById('board') || document.querySelector('.board') || document.querySelector('[role="grid"]') || document.querySelector('.board-wrap') || document.querySelector('.board-container');
  }

  function isInteger(n){ return Number.isInteger(n); }

  function getColsFromCSS(board) {
    try {
      const cs = getComputedStyle(board);
      // look for --cols or --board-size like "6x6"
      const colsVar = cs.getPropertyValue('--cols') || cs.getPropertyValue('--board-cols') || cs.getPropertyValue('--board-size');
      if (colsVar) {
        const m = colsVar.trim().match(/(\d+)\s*x\s*(\d+)/i);
        if (m) return parseInt(m[1],10);
        const n = parseInt(colsVar,10);
        if (isInteger(n)) return n;
      }
      // fallback: check grid-template-columns count
      const gtc = cs.getPropertyValue('grid-template-columns') || cs.getPropertyValue('grid-template');
      if (gtc) {
        // count occurrences of ' ' or 'repeat' pattern
        const parts = gtc.split(/\s+/).filter(Boolean);
        return parts.length || null;
      }
    } catch(e){}
    return null;
  }

  function attachHandlersToCell(cell) {
    if (!cell) return;
    if (cell.dataset.reattachedClone === '1') return;
    cell.dataset.reattachedClone = '1';
    cell.tabIndex = cell.tabIndex || 0;
    cell.addEventListener('pointerdown', function(ev){
      const idx = cell.dataset.index !== undefined ? Number(cell.dataset.index) : null;
      if (typeof window.handleCellPointer === 'function') {
        try { window.handleCellPointer(idx, ev); } catch(e){ console.warn('handleCellPointer error', e); }
      } else if (typeof window.handleClick === 'function') {
        try { window.handleClick(idx); } catch(e){ console.warn('handleClick error', e); }
      }
    });
    cell.addEventListener('keydown', function(ev){
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        const idx = cell.dataset.index !== undefined ? Number(cell.dataset.index) : null;
        if (typeof window.handleClick === 'function') window.handleClick(idx);
      }
    });
  }

  
function generateClonedBoard() {
  const rows = (typeof ROWS !== 'undefined') ? ROWS : 10;
  const cols = (typeof COLS !== 'undefined') ? COLS : 10;
  const board = document.querySelector('#board');
  if (!board) return;
  // Remove any previous generated container
  const prev = board.querySelector('.board-generated');
  if (prev) prev.remove();
  const container = document.createElement('div');
  container.className = 'board-generated';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.setAttribute('role', 'gridcell');
      // attach petri underlay and virus container using existing factory functions if present
      try {
        if (typeof createPetriElement === 'function') {
          const petri = createPetriElement();
          if (petri) cell.appendChild(petri);
        }
      } catch (e) { /* ignore */ }
      try {
        if (typeof createVirusContainer === 'function') {
          const virus = createVirusContainer(0);
          if (virus) cell.appendChild(virus);
        }
      } catch (e) { /* ignore */ }
      container.appendChild(cell);
    }
  }
  board.appendChild(container);
}


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', generateClonedBoard);
  } else {
    generateClonedBoard();
  }

  // Expose for debug
  window.__goneViral_generateClonedBoard = generateClonedBoard;
})();

