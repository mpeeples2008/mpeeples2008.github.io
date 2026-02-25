
        document.addEventListener('DOMContentLoaded', function () {
            try {
                const helpBtn = document.getElementById('helpBtn');
                const helpPopup = document.getElementById('helpPopup');
                const helpClose = document.getElementById('helpClose');

                function showHelp() {
                    if (!helpPopup) return;
                    helpPopup.classList.add('show');
                    helpPopup.setAttribute('aria-hidden', 'false');
                }
                function hideHelp() {
                    if (!helpPopup) return;
                    helpPopup.classList.remove('show');
                    helpPopup.setAttribute('aria-hidden', 'true');
                }

                if (helpBtn) helpBtn.addEventListener('click', function (e) { showHelp(); });
                if (helpClose) helpClose.addEventListener('click', function (e) { hideHelp(); });

                // close on Escape
                document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hideHelp(); });
                // click outside to close (optional): if click occurs outside popup while shown
                document.addEventListener('click', function (e) {
                    if (!helpPopup) return;
                    if (!helpPopup.classList.contains('show')) return;
                    // if click target is inside popup, do nothing
                    if (helpPopup.contains(e.target)) return;
                    // if click target is the help button, do nothing (it toggles separately)
                    if (helpBtn && helpBtn.contains(e.target)) return;
                    hideHelp();
                });

            } catch (e) { console.warn('help popup wiring failed', e); }
        });
    
