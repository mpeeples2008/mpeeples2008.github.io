
        /**
         * Flick eyebrows briefly (for emphasis). Non-destructive.
         * Usage: flickBrows(120); // flick for 120ms
         */
        function flickBrows(durationMs) {
            try {
                var badge = document.getElementById('assist-badge');
                if (!badge) return;
                // add a throwaway class that triggers CSS animation (define .brow-flick if needed)
                badge.classList.add('brow-flick');
                setTimeout(function () { badge.classList.remove('brow-flick'); }, durationMs || 160);
            } catch (e) { console.warn('flickBrows', e); }
        }
    
