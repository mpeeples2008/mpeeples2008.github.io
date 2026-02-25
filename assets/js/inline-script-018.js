
        (function () {
            function ensureRetroMonitor() {
                try {
                    var badge = document.getElementById('assist-badge');
                    if (!badge) return;
                    // only replace if not already present
                    if (badge.querySelector('.retro-monitor')) return;
                    // set minimal innerHTML to the SVG (use template literal or fetch from loaded string)
                    var svg = `<!-- paste the full SVG markup from above here, without backticks -->`;
                    // For safety, don't overwrite event handlers: append instead of replacing if you want:
                    badge.innerHTML = svg;
                    // ensure the monitor-screen gets scanlines via CSS: add a class to badge
                    badge.classList.add('has-retro-monitor');
                    // if you use existing expression classes, toggle the monitors' mouth shapes via the same CSS rules:
                    // copy your mouth visibility CSS to target .has-retro-monitor .mouth-shape etc.
                } catch (e) { console.warn('retro monitor inject failed', e); }
            }
            if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureRetroMonitor);
            else setTimeout(ensureRetroMonitor, 0);
        })();
    
