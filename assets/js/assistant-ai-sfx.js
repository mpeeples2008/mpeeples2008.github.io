
        (function () {
            var AI_SFX_URLS = [
                "https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI1.mp3",
                "https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI2.mp3",
                "https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI3.mp3",
                "https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI4.mp3",
                "https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI5.mp3",
                "https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI6.mp3",
                "https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI7.mp3"
            ];
            var AI_SFX_KEYS = AI_SFX_URLS.map(function (_, i) { return 'assistant_ai_' + i; });
            window.AI_SFX_URLS = AI_SFX_URLS.slice();
            window._assistantSfxCache = window._assistantSfxCache || {};

            function preloadAiSfx() {
                try {
                    if (typeof window.preloadSfxKeys === 'function') {
                        window.preloadSfxKeys(AI_SFX_KEYS);
                        return;
                    }
                    for (var i = 0; i < AI_SFX_URLS.length; i++) {
                        var key = 'assistant_ai_' + i;
                        if (!window._assistantSfxCache[key]) {
                            try {
                                var a = new Audio(AI_SFX_URLS[i]);
                                a.preload = 'auto';
                                a.crossOrigin = 'anonymous';
                                var vol = (typeof window.sfxVolume !== 'undefined') ? window.sfxVolume : 0.50;
                                try { a.volume = vol; } catch (e) { }
                                window._assistantSfxCache[key] = a;
                            } catch (e) { }
                        }
                    }
                } catch (e) { console.warn('preloadAiSfx failed', e); }
            }

            function playRandomAiSfx() {
                try {
                    if (window.allMuted || window.assistantMuted) return;
                    if (!AI_SFX_KEYS.length) return;
                    var idx = Math.floor(Math.random() * AI_SFX_KEYS.length);
                    var key = AI_SFX_KEYS[idx];
                    if (typeof window.playSfx === 'function') {
                        window.playSfx(key);
                        return;
                    }
                    var a = window._assistantSfxCache[key];
                    if (!a) return;
                    try { a.currentTime = 0; a.volume = (typeof window.sfxVolume !== 'undefined') ? window.sfxVolume : 0.5; } catch (e) { }
                    var p = a.play();
                    if (p && p.catch) p.catch(function () { });
                } catch (e) { console.warn('playRandomAiSfx failed', e); }
            }

            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                preloadAiSfx();
            } else {
                document.addEventListener('DOMContentLoaded', preloadAiSfx);
            }

            function wrapAssistantShow() {
                try {
                    var target = window._Assistant_internal || window.Assistant;
                    if (!target) return;
                    if (target._sfxPatched) return;
                    var origShow = target.show;
                    if (typeof origShow !== 'function') return;
                    target.show = function (text, opts) {
                        try { playRandomAiSfx(); } catch (e) { }
                        return origShow.apply(this, arguments);
                    };
                    target._sfxPatched = true;
                    // ensure canonical reference points to patched object
                    window._Assistant_internal = target;
                    try { window.Assistant = target; } catch (e) { /* ignore if sealed */ }
                } catch (e) { console.warn('wrapAssistantShow failed', e); }
            }

            // Preserve existing Assistant reference if present
            try {
                if (window._Assistant_internal === undefined && typeof window.Assistant !== 'undefined') {
                    window._Assistant_internal = window.Assistant;
                }
            } catch (e) { }

            // Attempt initial patch if Assistant already exists
            try { wrapAssistantShow(); } catch (e) { }

            // Safely define a property watcher for future assignments without destroying current value
            try {
                Object.defineProperty(window, 'Assistant', {
                    configurable: true,
                    enumerable: true,
                    get: function () { return window._Assistant_internal; },
                    set: function (v) {
                        window._Assistant_internal = v;
                        try { setTimeout(wrapAssistantShow, 50); } catch (e) { }
                    }
                });
            } catch (e) {
                // If defineProperty fails (rare), fallback to polling for Assistant creation
                var _pollInterval = setInterval(function () {
                    if (window._Assistant_internal && window._Assistant_internal.show) { try { wrapAssistantShow(); } catch (e) { } clearInterval(_pollInterval); }
                }, 250);
            }

        })();
    
