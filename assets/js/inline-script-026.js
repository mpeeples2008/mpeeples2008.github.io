
/* Auto-template guard: if no .cell exists (we removed static cells), create a hidden template cell
   so legacy cloning helpers that expect a DOM template won't error. This is safe: it's hidden
   and only used if code calls querySelector('.cell') before runtime-created cells exist. */
document.addEventListener('DOMContentLoaded', function () {
  try {
    if (!document.querySelector('.cell')) {
      const tmp = document.createElement('div');
      tmp.className = 'cell';
      tmp.style.display = 'none';
      if (typeof createPetriElement === 'function') {
        try { tmp.appendChild(createPetriElement()); } catch (e) { /* ignore */ }
      }
      if (typeof createVirusContainer === 'function') {
        try { tmp.appendChild(createVirusContainer(0)); } catch (e) { /* ignore */ }
      }
      document.body.appendChild(tmp);
      console.info('[GoneViral] Hidden .cell template inserted to support legacy cloning.');
    }
  } catch (err) { console.warn('[GoneViral] template guard failed', err); }
});

