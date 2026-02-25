
        (function () {
            // ensures the badge style is recalculated on orientation/resize — small and safe
            var badge = document.getElementById('assist-badge');
            if (!badge) return;
            function ensureVisibility() {
                try {
                    // on very wide screens, make sure badge is not inadvertently clipped
                    if (window.innerWidth >= 900) {
                        badge.style.willChange = 'transform, right, bottom';
                    } else {
                        badge.style.willChange = '';
                    }
                } catch (e) { console.warn('ensureVisibility:', e); }
            }
            window.addEventListener('resize', ensureVisibility, { passive: true });
            window.addEventListener('orientationchange', ensureVisibility, { passive: true });
            // call once now
            ensureVisibility();
        })();
    

