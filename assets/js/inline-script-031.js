
// Diagnostic helpers added by assistant patch
window.assistantFaceDiagnostics = (function() {
  return {
    show(expr) {
      const b = document.getElementById('assist-badge');
      if(!b) return null;
      // remove existing expr-* classes
      b.className = b.className.split(' ').filter(c => !c.startsWith('expr-')).join(' ');
      b.classList.add('expr-' + expr);
      return expr;
    },
    list() {
      return Array.from(document.querySelectorAll('#assist-badge .mouth-shape')).map(m => m.className);
    },
    active() {
      const m = Array.from(document.querySelectorAll('#assist-badge .mouth-shape')).find(m => parseFloat(window.getComputedStyle(m).opacity) > 0.1);
      return m;
    }
  };
})();

