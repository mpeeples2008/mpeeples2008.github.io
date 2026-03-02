
        (function () {
            // expression mapping for events -> preferred non-neutral face
            const EVENT_TO_EXPR = {
                levelComplete: 'expr-smile',
                gameOver: 'expr-worried',
                cascade: 'expr-talk',
                lowClicks: 'expr-worried',
                postGameWelcome: 'expr-talk'
            };

            // fallback faces for non-event speech; weighted toward talk so random shifts are less frequent
            const ALT_FACES = ['expr-talk', 'expr-talk', 'expr-talk', 'expr-smile', 'expr-worried'];
            let idleTimer = null;

            function getAssistantBadge() {
                try {
                    var badges = Array.from(document.querySelectorAll('#assist-badge'));
                    if (!badges.length) return null;
                    var withFace = badges.filter(function (b) { return !!(b && b.querySelector && b.querySelector('.retro-monitor')); });
                    var pool = withFace.length ? withFace : badges;
                    for (var i = 0; i < pool.length; i++) {
                        var b = pool[i];
                        if (!b || !b.isConnected) continue;
                        var r = b.getBoundingClientRect ? b.getBoundingClientRect() : null;
                        if (r && r.width > 8 && r.height > 8) return b;
                    }
                    return pool[0] || null;
                } catch (e) {
                    return document.getElementById('assist-badge');
                }
            }

            function getAssistantBubble() {
                try {
                    var bubbles = Array.from(document.querySelectorAll('#assist-bubble, .assist-bubble'));
                    if (!bubbles.length) return null;
                    for (var i = 0; i < bubbles.length; i++) {
                        var b = bubbles[i];
                        if (!b || !b.isConnected) continue;
                        var r = b.getBoundingClientRect ? b.getBoundingClientRect() : null;
                        if (r && r.width > 20 && r.height > 10) return b;
                    }
                    return bubbles[0] || null;
                } catch (e) {
                    return document.getElementById('assist-bubble');
                }
            }

            // helper: remove any expr-* classes from badge
            function clearExprClasses(badge) {
                if (!badge) return;
                Array.from(badge.classList).forEach(c => { if (c.startsWith('expr-')) badge.classList.remove(c); });
            }

            function clearIdleClasses(badge) {
                if (!badge) return;
                try {
                    badge.classList.remove('brow-flick', 'idle-brow-left', 'idle-brow-right', 'idle-mouth-smirk', 'idle-mouth-pout');
                } catch (e) { }
            }

            function isIdleEligible(badge, bubble) {
                try {
                    if (!badge) return false;
                    if (window.assistantMuted) return false;
                    if (document.body && document.body.classList.contains('assistant-disabled')) return false;
                    if (badge.classList.contains('speaking')) return false;
                    if (bubble && bubble.classList && bubble.classList.contains('show')) return false;
                    return true;
                } catch (e) {
                    return false;
                }
            }

            function triggerIdleMicroExpression() {
                const badge = getAssistantBadge();
                const bubble = getAssistantBubble();
                if (!isIdleEligible(badge, bubble)) return;
                clearIdleClasses(badge);
                void badge.offsetWidth;
                const roll = Math.random();
                if (roll < 0.46) badge.classList.add('idle-brow-left');
                else if (roll < 0.92) badge.classList.add('idle-brow-right');
                else badge.classList.add('brow-flick');
                // occasional subtle mouth micro-expression while idle
                const mouthRoll = Math.random();
                if (mouthRoll < 0.24) badge.classList.add('idle-mouth-smirk');
                else if (mouthRoll < 0.42) badge.classList.add('idle-mouth-pout');
                setTimeout(() => clearIdleClasses(badge), 300);
            }

            function scheduleIdleMicroExpression() {
                try { if (idleTimer) clearTimeout(idleTimer); } catch (e) { }
                const nextDelay = 3500 + Math.floor(Math.random() * 5500);
                idleTimer = setTimeout(() => {
                    idleTimer = null;
                    try { triggerIdleMicroExpression(); } catch (e) { }
                    scheduleIdleMicroExpression();
                }, nextDelay);
            }

            try {
                window.assistantIdleDiagnostics = {
                    poke: function () { try { triggerIdleMicroExpression(); } catch (e) { } },
                    restart: function () { try { scheduleIdleMicroExpression(); } catch (e) { } }
                };
            } catch (e) { }

            // ensure neutral on load
            function ensureNeutralInitial() {
                try {
                    var badge = getAssistantBadge();
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
                        var badge = getAssistantBadge();
                        var bubble = getAssistantBubble();

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
                                clearIdleClasses(badge);
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
                    scheduleIdleMicroExpression();
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


    
