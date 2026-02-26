
        (function () {
            // helper show/hide functions
            function showStartModal() {
                const m = document.getElementById('startModal');
                if (!m) return;
                m.classList.add('show');
                m.setAttribute('aria-hidden', 'false');
                // focus the close button for keyboard users
                const btn = document.getElementById('startModalClose');
                if (btn) btn.focus();
            }
            function hideStartModal() {
                const m = document.getElementById('startModal');
                if (!m) return;
                m.classList.remove('show');
                m.setAttribute('aria-hidden', 'true');
            }

            function showHowToPopup() {
                const helpPopup = document.getElementById('helpPopup');
                if (!helpPopup) return;
                helpPopup.classList.add('show');
                helpPopup.setAttribute('aria-hidden', 'false');
            }

            // wire close button + escape
            document.addEventListener('DOMContentLoaded', function () {
                const close = document.getElementById('startModalClose');
                const howTo = document.getElementById('startModalHowTo');
                if (close) close.addEventListener('click', hideStartModal);
                if (howTo) {
                    howTo.addEventListener('click', function (e) {
                        try { e.preventDefault(); e.stopPropagation(); } catch (err) { }
                        hideStartModal();
                        setTimeout(showHowToPopup, 0);
                    });
                }
                document.addEventListener('keydown', function (e) {
                    if (e.key === 'Escape') hideStartModal();
                });
                // also close if clicking outside modal (optional):
                document.addEventListener('click', function (e) {
                    const m = document.getElementById('startModal');
                    if (!m || !m.classList.contains('show')) return;
                    if (m.contains(e.target)) return; // click inside -> ignore
                    hideStartModal();
                });
            });

            // integrate with existing Start button behavior:
            window.addEventListener('load', function () {
                try {
                    const startBtn = document.getElementById('aiStartBtn') || document.getElementById('startBtn') || document.querySelector('button#aiStartBtn, button.start, #startBtn');
                    const intro = document.getElementById('aiIntro') || document.getElementById('intro');
                    if (startBtn) {
                        // add an additional listener to show the modal after the intro fades
                        startBtn.addEventListener('click', function () {
                            try {
                                // show modal after intro fade completes (about 650ms)
                                setTimeout(function () { showStartModal(); }, 650);
                            } catch (e) { console.warn('startModal show failed', e); }
                        });
                    }
                } catch (e) { console.warn('start modal wiring failed', e); }
            });
        })();
    
