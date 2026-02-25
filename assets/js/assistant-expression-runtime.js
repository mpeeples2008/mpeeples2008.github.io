
        (function () {
            // expression mapping for events -> preferred non-neutral face
            const EVENT_TO_EXPR = {
                levelComplete: 'expr-smile',
                gameOver: 'expr-worried',
                cascade: 'expr-talk',
                lowClicks: 'expr-worried'
            };

            // alternate faces to choose from when no specific event mapping exists
            const ALT_FACES = ['expr-talk', 'expr-smile', 'expr-worried'];

            // helper: remove any expr-* classes from badge
            function clearExprClasses(badge) {
                if (!badge) return;
                Array.from(badge.classList).forEach(c => { if (c.startsWith('expr-')) badge.classList.remove(c); });
            }

            // ensure neutral on load
            function ensureNeutralInitial() {
                try {
                    var badge = document.getElementById('assist-badge');
                    if (!badge) return;
                    clearExprClasses(badge);
                    badge.classList.add('expr-neutral');
                } catch (e) { console.warn('ensureNeutralInitial', e); }
            }
            // run early
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', ensureNeutralInitial);
            } else {
                setTimeout(ensureNeutralInitial, 0);
            }

            function attachExpressionHook() {
                try {
                    var target = window._Assistant_internal || window.Assistant;
                    if (!target || !target.show || target._exprHookAttached) return;
                    var orig = target.show;
                    target.show = function (text, opts) {
                        var badge = document.getElementById('assist-badge');
                        var bubble = document.getElementById('assist-bubble');

                        // ensure badge exists and neutral class set as baseline
                        if (badge && !Array.from(badge.classList).some(c => c.startsWith('expr-'))) {
                            badge.classList.add('expr-neutral');
                        }

                        // choose a non-neutral expression
                        var chosenExpr = null;
                        try {
                            if (opts && opts.event && EVENT_TO_EXPR[opts.event]) {
                                chosenExpr = EVENT_TO_EXPR[opts.event];
                            } else {
                                // pick randomly but not neutral
                                chosenExpr = ALT_FACES[Math.floor(Math.random() * ALT_FACES.length)];
                            }
                        } catch (e) { chosenExpr = 'expr-talk'; }

                        // apply chosen expression and speaking class
                        try {
                            if (badge) {
                                clearExprClasses(badge);
                                badge.classList.add(chosenExpr);
                                badge.classList.add('speaking');
                            }
                        } catch (e) { }

                        // call original show
                        var res;
                        try { res = orig.apply(this, arguments); } catch (e) { try { res = orig.call(this, text, opts); } catch (err) { console.warn('orig show failed', err); } }

                        // clear speaking state and return to neutral when bubble hides or after timeout
                        var cleared = false;
                        function clearState() {
                            if (cleared) return; cleared = true;
                            try {
                                if (badge) {
                                    badge.classList.remove('speaking');
                                    clearExprClasses(badge);
                                    badge.classList.add('expr-neutral');
                                }
                            } catch (e) { }
                        }

                        if (bubble) {
                            try {
                                // observe bubble's class attribute; when .show removed -> clear
                                var obs = new MutationObserver(function (muts) {
                                    try {
                                        if (!bubble.classList.contains('show')) { clearState(); obs.disconnect(); }
                                    } catch (e) { }
                                });
                                obs.observe(bubble, { attributes: true, attributeFilter: ['class'] });
                            } catch (e) { }
                        }

                        // fallback timeout: respect opts.duration if provided, else approximate from text length
                        var approx = 900;
                        try {
                            if (opts && opts.duration) approx = Number(opts.duration);
                            else approx = Math.min(4000, 200 + (String(text || '')).length * 45);
                        } catch (e) { }
                        setTimeout(clearState, approx + 300);

                        return res;
                    };

                    target._exprHookAttached = true;
                    try { window._Assistant_internal = target; window.Assistant = target; } catch (e) { }
                } catch (e) {
                    console.warn('attachExpressionHook failed', e);
                }
            }

            // attach now or later when Assistant is defined
            if (window._Assistant_internal || window.Assistant) attachExpressionHook();
            try {
                Object.defineProperty(window, 'Assistant', {
                    configurable: true, enumerable: true,
                    get() { return window._Assistant_internal; },
                    set(v) { window._Assistant_internal = v; setTimeout(attachExpressionHook, 40); }
                });
            } catch (e) {
                // fallback polling
                var _poll = setInterval(function () {
                    if ((window._Assistant_internal || window.Assistant) && !(window._Assistant_internal && window._Assistant_internal._exprHookAttached)) {
                        attachExpressionHook();
                        clearInterval(_poll);
                    }
                }, 200);
            }
        })();


    
