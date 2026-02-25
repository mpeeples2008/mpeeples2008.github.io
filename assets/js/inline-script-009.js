
        document.addEventListener('DOMContentLoaded', function () {
            try {
                const audioPopup = document.getElementById('audioPopup');
                const audioBtn = document.getElementById('audioBtn');
                const musicSlider = document.getElementById('musicVol');
                const sfxSlider = document.getElementById('sfxVol');
                const musicVal = document.getElementById('musicVolVal');
                const sfxVal = document.getElementById('sfxVolVal');
                if (!musicSlider && !sfxSlider) return;

                const clamp01 = (v) => Math.max(0, Math.min(1, Number(v) || 0));
                const isMusicElement = (a) => {
                    try {
                        if (!a) return false;
                        if (a.loop) return true;
                        if (a.duration && !isNaN(a.duration) && a.duration > 8) return true;
                        if (a.src && /music|bgm|_music|background|voltaic|robobozo/i.test(a.src)) return true;
                    } catch (e) { }
                    return false;
                };

                function applyMusicVolume(v) {
                    const val = clamp01(v);
                    window.musicVolume = val;
                    if (musicVal) musicVal.textContent = Math.round(val * 100) + '%';
                    try { if (window.musicAudio) window.musicAudio.volume = val; } catch (e) { }
                    try {
                        const aud = document.getElementsByTagName('audio');
                        for (let i = 0; i < aud.length; i++) {
                            if (isMusicElement(aud[i])) aud[i].volume = val;
                        }
                    } catch (e) { }
                }

                function applySfxVolume(v) {
                    const val = clamp01(v);
                    window.sfxVolume = val;
                    if (sfxVal) sfxVal.textContent = Math.round(val * 100) + '%';
                    try {
                        const aud = document.getElementsByTagName('audio');
                        for (let i = 0; i < aud.length; i++) {
                            if (!isMusicElement(aud[i])) aud[i].volume = val;
                        }
                    } catch (e) { }
                    try {
                        if (window.sfxCache) {
                            Object.values(window.sfxCache).forEach(function (a) {
                                try { if (a) a.volume = val; } catch (e) { }
                            });
                        }
                    } catch (e) { }
                }

                function syncSliderUI() {
                    if (musicSlider) {
                        const mv = clamp01(window.musicVolume ?? 0.2);
                        musicSlider.value = String(mv);
                        if (musicVal) musicVal.textContent = Math.round(mv * 100) + '%';
                    }
                    if (sfxSlider) {
                        const sv = clamp01(window.sfxVolume ?? 0.5);
                        sfxSlider.value = String(sv);
                        if (sfxVal) sfxVal.textContent = Math.round(sv * 100) + '%';
                    }
                }

                function bindRange(slider, applyFn) {
                    if (!slider || slider.dataset.mobileBound === '1') return;
                    slider.dataset.mobileBound = '1';
                    slider.style.touchAction = 'none';
                    slider.style.webkitUserSelect = 'none';
                    slider.style.userSelect = 'none';
                    const updateFromSlider = () => applyFn(slider.value);
                    const updateFromClientX = (clientX) => {
                        try {
                            const rect = slider.getBoundingClientRect();
                            if (!rect || !rect.width) return;
                            const min = Number(slider.min || 0);
                            const max = Number(slider.max || 1);
                            const step = Number(slider.step || 0.01);
                            let ratio = (clientX - rect.left) / rect.width;
                            ratio = Math.max(0, Math.min(1, ratio));
                            let value = min + (max - min) * ratio;
                            if (isFinite(step) && step > 0) value = Math.round(value / step) * step;
                            value = Math.max(min, Math.min(max, value));
                            slider.value = String(value);
                            applyFn(slider.value);
                        } catch (e) { }
                    };
                    const updateFromTouch = (ev) => {
                        const t = (ev.touches && ev.touches[0]) || (ev.changedTouches && ev.changedTouches[0]);
                        if (!t) return;
                        updateFromClientX(t.clientX);
                    };
                    ['input', 'change', 'touchend', 'mouseup', 'keyup', 'pointerup'].forEach((evt) => {
                        slider.addEventListener(evt, updateFromSlider, { passive: true });
                    });
                    slider.addEventListener('touchstart', updateFromTouch, { passive: true });
                    slider.addEventListener('touchmove', updateFromTouch, { passive: true });
                    slider.addEventListener('pointerdown', (ev) => updateFromClientX(ev.clientX), { passive: true });
                    slider.addEventListener('pointermove', (ev) => {
                        if (ev.buttons === 1) updateFromClientX(ev.clientX);
                    }, { passive: true });
                }

                bindRange(musicSlider, applyMusicVolume);
                bindRange(sfxSlider, applySfxVolume);

                if (audioPopup && !audioPopup.dataset.mobileSyncBound) {
                    audioPopup.dataset.mobileSyncBound = '1';
                    audioPopup.addEventListener('modal:open', syncSliderUI);
                }
                if (audioBtn && !audioBtn.dataset.mobileSyncBound) {
                    audioBtn.dataset.mobileSyncBound = '1';
                    audioBtn.addEventListener('click', function () { setTimeout(syncSliderUI, 0); }, { passive: true });
                }

                syncSliderUI();
            } catch (e) {
                console.warn('[AudioPatch] mobile slider compatibility failed', e);
            }
        });
    
