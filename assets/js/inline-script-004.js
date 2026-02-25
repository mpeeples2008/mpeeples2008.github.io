
        // Update the small high-score HUD element from localStorage
        function updateHighScoreHUD() {
            try {
                const el = document.getElementById('highScoreValue');
                if (!el) return;
                // getHighScore() should exist from the high-score helpers (if present)
                var hs = 0;
                if (typeof getHighScore === 'function') {
                    hs = getHighScore();
                } else {
                    try { hs = Number(localStorage.getItem('goneviral_highscore_v1') || localStorage.getItem('mygame_highscore_v1') || 0); } catch (e) { hs = 0; }
                }
                el.textContent = Number(hs || 0).toLocaleString();
            } catch (e) {
                console.warn('updateHighScoreHUD error', e);
            }
        }

        // Call once on DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', updateHighScoreHUD);
        } else {
            updateHighScoreHUD();
        }

        // Optional: expose for console
        window.updateHighScoreHUD = updateHighScoreHUD;
    
