
        (function () {
            // defaults
            window.musicVolume = (typeof window.musicVolume === 'number') ? window.musicVolume : 0.20;
            window.sfxVolume = (typeof window.sfxVolume === 'number') ? window.sfxVolume : 0.50;
            window.allMuted = (typeof window.allMuted === 'boolean') ? window.allMuted : false;

            // Helper to apply volumes to one audio element
            function applyVolumesToElement(a) {
                try {
                    if (!a) return;
                    // Determine if element is music: prefer loop flag, otherwise use duration heuristic (>8s)
                    var isMusic = !!a.loop;
                    // If duration known and >8s treat as music
                    try {
                        if (!isMusic && a.duration && !isNaN(a.duration) && a.duration > 8) isMusic = true;
                    } catch (e) { }
                    var vol = isMusic ? window.musicVolume : window.sfxVolume;
                    // Apply
                    if (typeof vol === 'number') a.volume = Number(vol);
                    a.muted = !!window.allMuted;
                } catch (e) { }
            }

            // Apply to all existing <audio> elements
            function applyToAllExisting() {
                try {
                    var audios = document.getElementsByTagName('audio');
                    for (var i = 0; i < audios.length; i++) applyVolumesToElement(audios[i]);
                } catch (e) { }
                // also attempt to apply to any cached sfxCache if present
                try {
                    var cache = window.sfxCache || {};
                    Object.values(cache).forEach(function (a) { applyVolumesToElement(a); });
                } catch (e) { }
            }

            // Observe additions of audio elements to DOM (in case game inserts them)
            try {
                var mo = new MutationObserver(function (muts) {
                    muts.forEach(function (m) {
                        if (m.addedNodes && m.addedNodes.length) {
                            m.addedNodes.forEach(function (n) {
                                try {
                                    if (n && n.tagName && n.tagName.toLowerCase() === 'audio') {
                                        // small timeout for attributes to settle
                                        setTimeout(function () { applyVolumesToElement(n); }, 10);
                                    } else if (n && n.querySelectorAll) {
                                        var found = n.querySelectorAll('audio');
                                        for (var i = 0; i < found.length; i++) setTimeout((function (el) { return function () { applyVolumesToElement(el); }; })(found[i]), 10);
                                    }
                                } catch (e) { }
                            });
                        }
                    });
                });
                mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
            } catch (e) { }

            // Monkeypatch Audio constructor so new instances get correct volume/muted and have play patched
            try {
                /* audio monkeypatch removed */
            } catch (e) { }

            // Patch HTMLMediaElement.prototype.play to set volumes just-in-time
            try {
                var proto = HTMLMediaElement && HTMLMediaElement.prototype;
                if (proto && !proto.__volumePatchedByChatGPT_v3) {
                    var origPlay = proto.play;
                    proto.play = function () {
                        try {
                            // Determine music vs sfx: loop flag high priority; else heuristic by duration or src filename containing 'music' or 'bg'
                            var el = this;
                            var isMusic = !!el.loop;
                            try {
                                if (!isMusic && el.duration && !isNaN(el.duration) && el.duration > 8) isMusic = true;
                            } catch (e) { }
                            try {
                                if (!isMusic && el.src && (el.src.match(/music|bgm|_music|background/i))) isMusic = true;
                            } catch (e) { }
                            var vol = isMusic ? window.musicVolume : window.sfxVolume;
                            if (typeof vol === 'number') el.volume = Number(vol);
                            el.muted = !!window.allMuted;
                        } catch (e) { }
                        return origPlay.apply(this, arguments);
                    };
                    proto.__volumePatchedByChatGPT_v3 = true;
                }
            } catch (e) { }

            // UI wiring: sliders and mute button
            function setupUIHandlers() {
                try {
                    var musicSlider = document.getElementById('musicVol');
                    var sfxSlider = document.getElementById('sfxVol');
                    var musicVal = document.getElementById('musicVolVal');
                    var sfxVal = document.getElementById('sfxVolVal');
                    var popupMute = document.getElementById('popupMute');
                    var audioClose = document.getElementById('audioClose');

                    if (musicSlider) {
                        musicSlider.value = String(window.musicVolume || 0.2);
                        musicVal && (musicVal.textContent = Math.round((window.musicVolume || 0.2) * 100) + '%');
                        musicSlider.addEventListener('input', function (e) {
                            window.musicVolume = Number(e.target.value);
                            musicVal && (musicVal.textContent = Math.round(window.musicVolume * 100) + '%');
                            // apply to any existing audio elements that look like music
                            try {
                                var aud = document.getElementsByTagName('audio');
                                for (var i = 0; i < aud.length; i++) {
                                    var a = aud[i];
                                    if (a.loop || (a.duration && !isNaN(a.duration) && a.duration > 8) || (a.src && a.src.match(/music|bgm|_music|background/i))) {
                                        a.volume = window.musicVolume;
                                    }
                                }
                                // also set on window.musicAudio if exists
                                if (window.musicAudio) try { window.musicAudio.volume = window.musicVolume; } catch (e) { }
                            } catch (e) { }
                        });
                    }
                    if (sfxSlider) {
                        sfxSlider.value = String(window.sfxVolume || 0.5);
                        sfxVal && (sfxVal.textContent = Math.round((window.sfxVolume || 0.5) * 100) + '%');
                        sfxSlider.addEventListener('input', function (e) {
                            window.sfxVolume = Number(e.target.value);
                            sfxVal && (sfxVal.textContent = Math.round(window.sfxVolume * 100) + '%');
                            // apply to short audio elements
                            try {
                                var aud = document.getElementsByTagName('audio');
                                for (var i = 0; i < aud.length; i++) {
                                    var a = aud[i];
                                    if (!a.loop && (!(a.duration && !isNaN(a.duration) && a.duration > 8)) && !(a.src && a.src.match(/music|bgm|_music|background/i))) {
                                        a.volume = window.sfxVolume;
                                    }
                                }
                                // apply to sfxCache if any
                                if (window.sfxCache) {
                                    Object.values(window.sfxCache).forEach(function (a) { try { if (a) a.volume = window.sfxVolume; } catch (e) { } });
                                }
                            } catch (e) { }
                        });
                    }
                    if (popupMute) {
                        // ensure styled like other HUD buttons - class already changed earlier, but enforce
                        try { popupMute.classList.add('ctrl', 'small-ctrl'); } catch (e) { }
                        popupMute.addEventListener('click', function () {
                            window.allMuted = !window.allMuted;
                            popupMute.setAttribute('aria-pressed', String(!!window.allMuted));
                            popupMute.textContent = window.allMuted ? 'Unmute' : 'Mute';
                            // apply to all
                            try {
                                var aud = document.getElementsByTagName('audio');
                                for (var i = 0; i < aud.length; i++) { try { aud[i].muted = !!window.allMuted; } catch (e) { } }
                                if (window.musicAudio) try { window.musicAudio.muted = !!window.allMuted; } catch (e) { }
                                if (window.sfxCache) Object.values(window.sfxCache).forEach(function (a) { try { if (a) a.muted = !!window.allMuted; } catch (e) { } });
                            } catch (e) { }
                        });
                    }
                    if (audioClose) {
                        try { audioClose.classList.add('ctrl', 'small-ctrl'); } catch (e) { }
                    }
                } catch (e) { }
            }

            // Run setup now and also once DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function () { setupUIHandlers(); applyToAllExisting(); });
            } else {
                setupUIHandlers();
                applyToAllExisting();
            }

            // Expose a manual apply function for troubleshooting
            window.__applyAudioControlsNow = function () { applyToAllExisting(); };

        })();
    
