
// Diagnostic helpers added by assistant patch
window.assistantFaceDiagnostics = (function() {
  return {
    show(expr) {
      const b = document.getElementById('assist-badge');
      if(!b) return console.warn('assist-badge not found');
      // remove existing expr-* classes
      b.className = b.className.split(' ').filter(c => !c.startsWith('expr-')).join(' ');
      b.classList.add('expr-' + expr);
      console.log('Set assist-badge to expr-' + expr);
      // log which mouth is visible (computed)
      setTimeout(()=> {
        const mouths = Array.from(document.querySelectorAll('#assist-badge .mouth-shape'));
        mouths.forEach(m => console.log(m.className, 'computed opacity:', window.getComputedStyle(m).opacity));
      }, 50);
    },
    list() {
      return Array.from(document.querySelectorAll('#assist-badge .mouth-shape')).map(m => m.className);
    },
    active() {
      const m = Array.from(document.querySelectorAll('#assist-badge .mouth-shape')).find(m => parseFloat(window.getComputedStyle(m).opacity) > 0.1);
      console.log('Active mouth:', m ? m.className : 'none');
      return m;
    }
  };
})();
console.info('[AssistantPatch] assistantFaceDiagnostics available. Use assistantFaceDiagnostics.show("neutral"), .show("worried"), etc.');

