
        document.addEventListener('DOMContentLoaded', function () {
            // Audio control state (tied to UI)
            window.musicVolume = window.musicVolume || 0.20;
            window.sfxVolume = window.sfxVolume || 0.50;
            window.allMuted = window.allMuted || false;

            // helper to update all sfx in sfxCache if present
            function updateAllSfxVolumes() {
                try {
                    if (window.sfxCache && typeof window.sfxCache === 'object') {
                        Object.values(window.sfxCache).forEach(a => {
                            if (!a) return;
                            try {
                                a.volume = Number(window.sfxVolume) || 0;
                                a.muted = !!window.allMuted;
                            } catch (e) { }
                        });
                    }
                } catch (e) { }
            }

            // patch createSfx if present
            if (typeof window.createSfx === 'function') {
                const origCreate = window.createSfx;
                window.createSfx = function (key) {
                    const a = origCreate(key);
                    try {
                        if (a) {
                            a.volume = Number(window.sfxVolume) || a.volume || 0.5;
                            a.muted = !!window.allMuted;
                            if (!window.sfxCache) window.sfxCache = window.sfxCache || {};
                            window.sfxCache[key] = a;
                        }
                    } catch (e) { }
                    return a;
                };
            } else {
                // define a safe fallback createSfx if game doesn't have one
                window.createSfx = window.createSfx || function (key) {
                    return null;
                };
            }

            // patch playNextMusicTrack if it exists to set volume/muted on new musicAudio
            if (typeof window.playNextMusicTrack === 'function') {
                const origPlayNext = window.playNextMusicTrack;
                window.playNextMusicTrack = function () {
                    const res = origPlayNext.apply(this, arguments);
                    try {
                        if (window.musicAudio) {
                            window.musicAudio.volume = Number(window.musicVolume) || window.musicAudio.volume || 0.2;
                            window.musicAudio.muted = !!window.allMuted;
                        }
                    } catch (e) { }
                    return res;
                };
            }

            // UI wiring for popup
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
            if (audioClose) audioClose.addEventListener('click', (e) => { hideAudioPopup(); });

            if (musicSlider) musicSlider.addEventListener('input', (e) => {
                window.musicVolume = Number(e.target.value);
                if (musicVal) musicVal.textContent = Math.round(window.musicVolume * 100) + '%';
                try { if (window.musicAudio) window.musicAudio.volume = window.musicVolume; } catch (e) { }
            });

            if (sfxSlider) sfxSlider.addEventListener('input', (e) => {
                window.sfxVolume = Number(e.target.value);
                if (sfxVal) sfxVal.textContent = Math.round(window.sfxVolume * 100) + '%';
                updateAllSfxVolumes();
            });

            if (popupMute) popupMute.addEventListener('click', () => {
                window.allMuted = !window.allMuted;
                popupMute.textContent = window.allMuted ? 'Unmute' : 'Mute';
                popupMute.setAttribute('aria-pressed', String(!!window.allMuted));
                try { if (window.musicAudio) window.musicAudio.muted = !!window.allMuted; } catch (e) { }
                updateAllSfxVolumes();
            });

            // apply initial volume settings to any pre-existing audio objects
            try {
                if (window.musicAudio) {
                    window.musicAudio.volume = Number(window.musicVolume) || window.musicAudio.volume || 0.2;
                    window.musicAudio.muted = !!window.allMuted;
                    }
                } catch (e) { }
            updateAllSfxVolumes();
        });
    
