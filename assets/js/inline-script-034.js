
(function(){
  // Utility: find focusable elements
  function focusableElements(container) {
    if (!container) return [];
    return Array.from(container.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'))
      .filter(function(el){ return el.offsetParent !== null || getComputedStyle(el).visibility !== 'hidden'; });
  }

  // Inert management: set inert/aria-hidden on everything except modal
  function setInertForModal(modal, inert) {
    if (!modal) return;
    var bodyChildren = Array.from(document.body.children);
    bodyChildren.forEach(function(el){
      if (el === modal) return;
      // skip scripts/styles/our injected manager
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'LINK') return;
      try {
        if (inert) el.setAttribute('inert','');
        else el.removeAttribute('inert');
      } catch(e) {
        if (inert) el.setAttribute('aria-hidden','true');
        else el.removeAttribute('aria-hidden');
      }
    });
    if (inert) {
      try {
        var focusable = focusableElements(modal)[0];
        if (focusable) focusable.focus();
      } catch(e){}
    }
  }

  // Show modal by id
  window.showModal = function(id) {
    try {
      var modal = document.getElementById(id);
      if (!modal) return;
      modal.classList.add('open');
      // Some legacy popups (like audioPopup) use `.show` for visibility.
      modal.classList.add('show');
      modal.style.display = '';
      modal.style.visibility = 'visible';
      modal.style.pointerEvents = 'auto';
      modal.removeAttribute('aria-hidden');
      setInertForModal(modal, true);
      // dispatch event
      modal.dispatchEvent(new CustomEvent('modal:open', {bubbles:true}));
    } catch(e) { console.error('showModal error', e); }
  };

  // Hide modal by id
  window.hideModal = function(id) {
    try {
      var modal = document.getElementById(id);
      if (!modal) return;
      try {
        var active = document.activeElement;
        if (active && modal.contains(active)) {
          var fallback = document.getElementById('audioBtn')
            || document.getElementById('helpBtn')
            || document.getElementById('startBtn')
            || document.body;
          if (fallback && fallback !== active && typeof fallback.focus === 'function') {
            fallback.focus();
          } else if (active && typeof active.blur === 'function') {
            active.blur();
          }
        }
      } catch(e) {}
      modal.classList.remove('open');
      modal.classList.remove('show');
      // try to hide visually but don't remove from DOM
      modal.style.display = 'none';
      modal.style.visibility = 'hidden';
      modal.style.pointerEvents = 'none';
      modal.setAttribute('aria-hidden','true');
      setInertForModal(modal, false);
      modal.dispatchEvent(new CustomEvent('modal:close', {bubbles:true}));
    } catch(e) { console.error('hideModal error', e); }
  };

  // Toggle
  window.toggleModal = function(id) {
    var modal = document.getElementById(id);
    if (!modal) return;
    if (modal.classList.contains('open')) window.hideModal(id); else window.showModal(id);
  };

  // Close handlers for elements with data-modal-close or buttons with class 'btn' inside modals
  document.addEventListener('click', function(e){
    var el = e.target;
    // data-modal-open
    var openAttr = el.closest('[data-modal-open]');
    if (openAttr) {
      var target = openAttr.getAttribute('data-modal-open');
      if (target) { e.preventDefault(); window.showModal(target); return; }
    }
    // data-modal-close
    var closeAttr = el.closest('[data-modal-close]');
    if (closeAttr) {
      var target = closeAttr.getAttribute('data-modal-close');
      if (target) { e.preventDefault(); window.hideModal(target); return; }
    }
    // elements with data-modal-target to toggle
    var toggleAttr = el.closest('[data-modal-toggle]');
    if (toggleAttr) {
      var target = toggleAttr.getAttribute('data-modal-toggle');
      if (target) { e.preventDefault(); window.toggleModal(target); return; }
    }
    // fallback: buttons with id audioClose, startModalClose, gameOverClose etc.
    if (el.id === 'audioClose') { window.hideModal('audioPopup'); return; }
    if (el.id === 'startModalClose') { window.hideModal('startModal'); return; }
    if (el.id === 'gameOverClose') { window.hideModal('gameOverPopup'); return; }
  });

  // Close on Escape
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' || e.key === 'Esc') {
      // close topmost open modal
      var open = document.querySelector('.open');
      if (open) {
        var id = open.id;
        if (id) window.hideModal(id);
      }
    }
  });

  // On DOM ready: wire known triggers
  document.addEventListener('DOMContentLoaded', function(){
    // This project controls intro/tutorial/start flow elsewhere; do not auto-open startModal here.
    try {
      var start = document.getElementById('startModal');
      if (start) {
        start.classList.remove('open', 'show');
        start.style.display = 'none';
        start.style.visibility = 'hidden';
        start.style.pointerEvents = 'none';
        start.setAttribute('aria-hidden', 'true');
      }
    } catch(e){}
    // Clear stale inert locks so first-load interactions always work.
    try {
      Array.from(document.body.children || []).forEach(function(el){
        try { el.removeAttribute('inert'); } catch(e) {}
      });
    } catch(e) {}
    // ensure audioPopup hidden by default unless opened
    var audio = document.getElementById('audioPopup') || document.getElementById('audio-popup');
    if (audio) {
      audio.style.display = 'none';
      audio.setAttribute('aria-hidden','true');
    }
    // ensure gameOverPopup hidden
    var gp = document.getElementById('gameOverPopup');
    if (gp) { gp.style.display = 'none'; gp.setAttribute('aria-hidden','true'); }
  });

})();

