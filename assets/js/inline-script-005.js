
        // Robust cleanup for any persistent game-over popups.
        //
        // This removes all elements with class 'game-over-popup' by playing the same hide animation
        // and removing them on animationend. It also clears the outOfClicksShown guard so future
        // game-overs may appear normally.
        //
        // A single restart-button listener is wired (idempotent) to call this on click.
        (function () {
            function cleanupGameOverPopups() {
                try {
                    var nodes = document.querySelectorAll('.game-over-popup');
                    nodes.forEach(function (el) {
                        try {
                            el.classList.remove('show');
                            el.classList.add('hide');
                            // remove after hide animation (if any); fallback to immediate removal after 420ms
                            var removed = false;
                            var onEnd = function () {
                                if (removed) return;
                                removed = true;
                                try { el.remove(); } catch (e) { }
                            };
                            el.addEventListener('animationend', onEnd, { once: true });
                            // fallback timeout in case animationend doesn't fire
                            setTimeout(onEnd, 600);
                        } catch (e) { }
                    });
                } catch (e) { }
                try { outOfClicksShown = false; } catch (e) { }
            }

            // Wire restart button once to cleanup any popups when clicked.
            function wireRestartCleanup() {
                try {
                    var restartBtn = document.getElementById('restart');
                    if (!restartBtn) return;
                    if (restartBtn._gop_cleanup_wired) return;
                    restartBtn._gop_cleanup_wired = true;
                    restartBtn.addEventListener('click', function () {
                        cleanupGameOverPopups();
                    });
                } catch (e) { }
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', wireRestartCleanup);
            } else {
                wireRestartCleanup();
            }

            // Expose for debugging
            window.cleanupGameOverPopups = cleanupGameOverPopups;
        })();
    
