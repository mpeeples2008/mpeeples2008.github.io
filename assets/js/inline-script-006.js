
        (function () {
            try {
                window.HIGH_SCORE_KEY = window.HIGH_SCORE_KEY || 'goneViral_highScore';

                window.loadHighScore = function () {
                    try {
                        var raw = localStorage.getItem(window.HIGH_SCORE_KEY);
                        window.highScore = Number(raw || 0);
                        console.log('[GoneViral] loadHighScore ->', raw, 'parsed:', window.highScore);
                    } catch (e) {
                        console.warn('[GoneViral] loadHighScore failed', e);
                        window.highScore = window.highScore || 0;
                    }
                    try {
                        var el = document.getElementById('highScoreValue');
                        if (el) el.textContent = String(window.highScore);
                    } catch (e) { }
                    return window.highScore;
                };

                window.saveHighScore = function () {
                    try {
                        var val = Number(window.highScore || 0);
                        localStorage.setItem(window.HIGH_SCORE_KEY, String(val));
                        console.log('[GoneViral] saveHighScore ->', val);
                    } catch (e) {
                        console.warn('[GoneViral] saveHighScore failed', e);
                    }
                };

                // Call load on DOM ready
                document.addEventListener('DOMContentLoaded', function () {
                    try { window.loadHighScore(); } catch (e) { console.warn(e); }


                    // Wrap updateHUD to persist highs if not already saving
                    try {
                        if (typeof window.updateHUD === 'function') {
                            var orig = window.updateHUD;
                            window.updateHUD = function () {
                                try { orig.apply(this, arguments); } catch (e) { console.warn('orig updateHUD failed', e); }
                                try {
                                    // determine saved value
                                    var saved = Number(localStorage.getItem(window.HIGH_SCORE_KEY) || 0);
                                    var current = (typeof totalScore !== 'undefined') ? Number(totalScore) : (typeof window.totalScore !== 'undefined' ? Number(window.totalScore) : null);
                                    if (current !== null && current > saved) {
                                        window.highScore = current;
                                        try { window.saveHighScore(); } catch (e) { console.warn(e); }
                                        var el = document.getElementById('highScoreValue');
                                        if (el) el.textContent = String(window.highScore);
                                        console.log('[GoneViral] updateHUD persisted high ->', window.highScore);
                                    }
                                } catch (e) { console.warn('updateHUD wrapper error', e); }
                            };
                            console.log('[GoneViral] updateHUD wrapped to persist highs');
                        } else {
                            console.log('[GoneViral] updateHUD not found to wrap');
                        }
                    } catch (e) { console.warn(e); }


                    /* AUDIO CONTROLS INTEGRATION - v2
                       This code runs inside the existing DOMContentLoaded closure so it can access local vars
                       like musicAudio, createSfx, sfxCache, playNextMusicTrack, etc., if they exist locally.
                    */
                    (function () {
                        // prefer using local variables if available, otherwise fall back to window-level
                        function getMusicAudio() { try { return (typeof musicAudio !== 'undefined') ? musicAudio : window.musicAudio; } catch (e) { return window.musicAudio; } }
                        function setMusicAudioProps() {
                            try {
                                const ma = getMusicAudio();
                                if (ma) {
                                    ma.volume = (typeof musicVolume !== 'undefined') ? musicVolume : (window.musicVolume || ma.volume || 0.2);
                                    ma.muted = !!(typeof allMuted !== 'undefined' ? allMuted : window.allMuted);
                                }
                            } catch (e) { }
                        }

                        // ensure window-level state exists so UI handlers can update reliably
                        window.musicVolume = (typeof musicVolume !== 'undefined') ? musicVolume : (window.musicVolume || 0.20);
                        window.sfxVolume = (typeof sfxVolume !== 'undefined') ? sfxVolume : (window.sfxVolume || 0.50);
                        window.allMuted = (typeof allMuted !== 'undefined') ? allMuted : (window.allMuted || false);

                        // if local variables exist, keep them in sync via simple helpers
                        function syncLocalFromWindow() {
                            try {
                                if (typeof musicVolume !== 'undefined') musicVolume = window.musicVolume;
                                else window.musicVolume = window.musicVolume;
                            } catch (e) { }
                            try {
                                if (typeof sfxVolume !== 'undefined') sfxVolume = window.sfxVolume;
                                else window.sfxVolume = window.sfxVolume;
                            } catch (e) { }
                            try {
                                if (typeof allMuted !== 'undefined') allMuted = window.allMuted;
                                else window.allMuted = window.allMuted;
                            } catch (e) { }
                        }

                        // Patch createSfx if it exists locally in this closure
                        try {
                            if (typeof createSfx === 'function') {
                                const origCreateSfx = createSfx;
                                createSfx = function (key) {
                                    const a = origCreateSfx(key);
                                    try {
                                        if (a) {
                                            // both local and window sfxVolume considered
                                            const vol = (typeof sfxVolume !== 'undefined') ? sfxVolume : (window.sfxVolume || 0.5);
                                            a.volume = Number(vol);
                                            a.muted = !!(typeof allMuted !== 'undefined' ? allMuted : window.allMuted);
                                            // put into sfxCache if available
                                            try { if (typeof sfxCache !== 'undefined' && sfxCache) sfxCache[key] = a; } catch (e) { }
                                        }
                                    } catch (e) { }
                                    return a;
                                };
                            }
                        } catch (e) { }

                        // Patch playNextMusicTrack if present (so when musicAudio is recreated we set volumes)
                        try {
                            if (typeof playNextMusicTrack === 'function') {
                                const origPlayNext = playNextMusicTrack;
                                playNextMusicTrack = function () {
                                    const res = origPlayNext.apply(this, arguments);
                                    // small timeout to let musicAudio be set by original code
                                    setTimeout(setMusicAudioProps, 30);
                                    return res;
                                };
                            }
                        } catch (e) { }

                        // Monkeypatch Audio constructor to set default volumes on any newly created Audio objects
                        try {
                            (function () {
                                const RealAudio = window.Audio;
                                function PatchedAudio(src) {
                                    const inst = new RealAudio(src);
                                    try {
                                        const vol = (typeof sfxVolume !== 'undefined') ? sfxVolume : (window.sfxVolume || inst.volume || 0.5);
                                        inst.volume = Number(vol);
                                        inst.muted = !!(typeof allMuted !== 'undefined' ? allMuted : window.allMuted);
                                    } catch (e) { }
                                    return inst;
                                }
                                // preserve prototype so instanceof checks still work
                                PatchedAudio.prototype = RealAudio.prototype;
                                /* window.Audio override removed */
                            })();
                        } catch (e) { }

                        // helper to update existing sfx cache objects
                        function updateAllSfxVolumes_local() {
                            try {
                                const cache = (typeof sfxCache !== 'undefined') ? sfxCache : window.sfxCache;
                                if (cache) {
                                    Object.values(cache).forEach(a => {
                                        try {
                                            if (!a) return;
                                            const vol = (typeof sfxVolume !== 'undefined') ? sfxVolume : (window.sfxVolume || a.volume || 0.5);
                                            a.volume = Number(vol);
                                            a.muted = !!(typeof allMuted !== 'undefined' ? allMuted : window.allMuted);
                                        } catch (e) { }
                                    });
                                }
                            } catch (e) { }
                        }

                        // UI wiring (elements already present in DOM)
                        const audioBtn = document.getElementById('audioBtn');
                        const audioPopup = document.getElementById('audioPopup');
                        const audioClose = document.getElementById('audioClose');
                        const musicSlider = document.getElementById('musicVol');
                        const sfxSlider = document.getElementById('sfxVol');
                        const musicVal = document.getElementById('musicVolVal');
                        const sfxVal = document.getElementById('sfxVolVal');
                        const popupMute = document.getElementById('popupMute');

                        function showAudioPopup() {
    // Query local elements safely at invocation time
    var audioPopup = document.getElementById('audioPopup') || document.getElementById('audio-popup');
    var musicSlider = document.getElementById('musicVol');
    var sfxSlider = document.getElementById('sfxVol');
    var musicVal = document.getElementById('musicVolVal') || document.getElementById('musicVolVal');
    var sfxVal = document.getElementById('sfxVolVal') || document.getElementById('sfxVolVal');
    var popupMute = document.getElementById('popupMute');

    if (!audioPopup) return;
    if (musicSlider) musicSlider.value = String(window.musicVolume ?? 0.2);
    if (sfxSlider) sfxSlider.value = String(window.sfxVolume ?? 0.5);
    if (musicVal && musicSlider) {
        try { musicVal.textContent = Math.round((parseFloat(musicSlider.value || 0) * 100)) + '%'; } catch(e){}
    }
    if (sfxVal && sfxSlider) {
        try { sfxVal.textContent = Math.round((parseFloat(sfxSlider.value || 0) * 100)) + '%'; } catch(e){}
    }
    if (popupMute) {
        try { popupMute.textContent = window.allMuted ? 'Unmute' : 'Mute'; } catch(e){}
        try { popupMute.setAttribute('aria-pressed', String(!!window.allMuted)); } catch(e){}
    }
    audioPopup.classList.add('show');
    audioPopup.style.display = '';
    audioPopup.setAttribute('aria-hidden', 'false');
}

                        function hideAudioPopup() {
                            if (!audioPopup) return;
                            audioPopup.classList.remove('show');
                            audioPopup.setAttribute('aria-hidden', 'true');
                        }

                        if (audioBtn) audioBtn.addEventListener('click', (e) => { showAudioPopup(); });

                        if (audioClose) {
                            audioClose.addEventListener('click', (e) => { hideAudioPopup(); });
                            // style audioClose as small ctrl too (if not already)
                            try { audioClose.classList.add('ctrl', 'small-ctrl'); } catch (e) { }
                        }

                        if (musicSlider) musicSlider.addEventListener('input', (e) => {
                            const val = Number(e.target.value);
                            // update both local and window state
                            try { if (typeof musicVolume !== 'undefined') musicVolume = val; } catch (e) { }
                            window.musicVolume = val;
                            if (musicVal) musicVal.textContent = Math.round(val * 100) + '%';
                            // apply to current musicAudio if present
                            try {
                                if (typeof musicAudio !== 'undefined' && musicAudio) {
                                    musicAudio.volume = val;
                                } else if (window.musicAudio) {
                                    window.musicAudio.volume = val;
                                }
                            } catch (e) { }
                        });

                        if (sfxSlider) sfxSlider.addEventListener('input', (e) => {
                            const val = Number(e.target.value);
                            try { if (typeof sfxVolume !== 'undefined') sfxVolume = val; } catch (e) { }
                            window.sfxVolume = val;
                            if (sfxVal) sfxVal.textContent = Math.round(val * 100) + '%';
                            updateAllSfxVolumes_local();
                        });

                        if (popupMute) popupMute.addEventListener('click', () => {
                            const newMuted = !((typeof allMuted !== 'undefined') ? allMuted : window.allMuted);
                            try { if (typeof allMuted !== 'undefined') allMuted = newMuted; } catch (e) { }
                            window.allMuted = newMuted;
                            // update UI text
                            popupMute.textContent = newMuted ? 'Unmute' : 'Mute';
                            popupMute.setAttribute('aria-pressed', String(!!newMuted));
                            // apply to music and sfx
                            try {
                                const ma = getMusicAudio();
                                if (ma) ma.muted = !!newMuted;
                            } catch (e) { }
                            updateAllSfxVolumes_local();
                        });

                        // initial apply once to any existing audio
                        try {
                            syncLocalFromWindow();
                            setMusicAudioProps();
                            updateAllSfxVolumes_local();
                        } catch (e) { }
                    })();
                });
            } catch (e) { console.error('High-score injection failed', e); }
        })();
    
