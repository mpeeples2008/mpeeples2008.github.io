
(function(){
  function setInertForModal(modal, inert) {
    if (!modal) return;
    var bodyChildren = Array.from(document.body.children);
    bodyChildren.forEach(function(el){
      if (el === modal) return;
      // don't inert script/style elements
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'LINK') return;
      try {
        if (inert) el.setAttribute('inert','');
        else el.removeAttribute('inert');
      } catch(e) {
        // some browsers may not support inert; fallback to aria-hidden
        if (inert) el.setAttribute('aria-hidden','true');
        else el.removeAttribute('aria-hidden');
      }
    });
    // ensure focus is inside modal when opening
    if (inert) {
      try {
        var focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable) focusable.focus();
      } catch(e){}
    }
  }

  function observeModal(id) {
    var modal = document.getElementById(id);
    if (!modal) return;
    var prevVisible = null;
    var check = function(){
      var visible = (modal.offsetParent !== null) || (getComputedStyle(modal).display !== 'none' && !modal.classList.contains('hidden'));
      if (visible === prevVisible) return;
      prevVisible = visible;
      setInertForModal(modal, visible);
    };
    // initial check after DOM ready
    setTimeout(check, 50);
    // observe attribute changes
    var mo = new MutationObserver(check);
    mo.observe(modal, { attributes: true, attributeFilter: ['style','class','aria-hidden'] });
    // also check on window resize and focus changes
    window.addEventListener('resize', check);
    document.addEventListener('focusin', check);
  }

  document.addEventListener('DOMContentLoaded', function(){
    observeModal('startModal');
    observeModal('gameOverPopup');
    observeModal('level-complete');
  });
})();

