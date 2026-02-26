

        // Put this near top of your script (edit paths to your images)
const levelCompleteImages = [
  'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/poster01.png',
  'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/poster02.png',
  'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/poster03.png',
  'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/poster04.png',
  'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/poster05.png',
  'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/poster06.png',
  'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/poster07.png',
  'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/poster08.png',
  'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/poster09.png',
  'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/poster13.png',
  'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/poster14.png',
  'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/poster15.png',
  'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/poster16.png',
  'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/poster17.png',
    'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/poster20.png',
    'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/poster21.png',
    'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/poster22.png',
    'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/poster26.png',
    'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/poster27.png',
    'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/poster28.png',
    'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/poster32.png',
    'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/poster33.png',
    'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/poster34.png',
    'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/poster35.png',
    'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/poster36.png',
    'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/poster38.png'
];


function showLevelComplete(opts = {}) {
  const title = opts.title || 'LEVEL COMPLETE';
  const imgSrc = opts.imageUrl || levelCompleteImages[Math.floor(Math.random() * levelCompleteImages.length)] || '';

  // remove any previous popup
  const prior = document.querySelector('.level-complete');
  if (prior) try { prior.remove(); } catch (e) {}

  try {
    const el = document.createElement('div');
    el.className = 'level-complete level-complete--board';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML = `
      <div class="lc-title">${title}</div>
      <div class="lc-image"><img src="${imgSrc}" alt="" /></div>
      <div class="lc-hint">Click to continue</div>
    `;
    document.body.appendChild(el);

    const positionOverBoard = () => {
      try {
        const board = document.getElementById('board') || document.querySelector('.board');
        if (!board) return;
        const r = board.getBoundingClientRect();
        const w = Math.max(120, Math.round(r.width));
        const h = Math.max(120, Math.round(r.height));
        el.style.left = Math.round(r.left) + 'px';
        el.style.top = Math.round(r.top) + 'px';
        el.style.width = w + 'px';
        el.style.height = h + 'px';
      } catch (e) { }
    };
    const onViewportChange = () => positionOverBoard();
    positionOverBoard();
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);

    // show popup
    void el.offsetWidth;
    el.classList.add('show');
    try { if (window.Assistant) Assistant.emit && Assistant.emit('levelComplete'); } catch (e) {}

    // make persistent until user click or keypress
    el.style.pointerEvents = 'auto';
    el.tabIndex = 0;
    el.style.cursor = 'pointer';

    const dismiss = () => {
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('scroll', onViewportChange, true);
      el.classList.remove('show');
      el.classList.add('hide');
      el.addEventListener('animationend', () => { try { el.remove(); } catch (e) {} }, { once: true });
      document.removeEventListener('keydown', keyHandler);
    };

    const keyHandler = (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') {
        dismiss();
      }
    };

    el.addEventListener('click', dismiss, { once: true });
    document.addEventListener('keydown', keyHandler);

  } catch (e) {
    console.warn('showLevelComplete error', e);
  }
}


// small helpers to avoid injecting raw HTML unsafely (useful if title or url come from outside)
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[s]));
}
function escapeHtmlAttr(str) {
  return String(str).replace(/"/g, '&quot;').replace(/&/g, '&amp;');
}

        // Difficulty tuning: base density and growth per screen (fraction 0..1)
        const BASE_DENSITY = 0.60;       // fraction of cells initially filled (0..1)
        const DENSITY_GROWTH = 0.0;   // fraction added each screenPassed;   // fraction added each screenPassed

        // Wrap everything that queries DOM in DOMContentLoaded so elements exist before we attach listeners
        document.addEventListener('DOMContentLoaded', () => {


            // initialize high score HUD
            try { highScoreEl = document.getElementById('highScoreValue'); if (highScoreEl) highScoreEl.textContent = String(highScore); } catch (e) { }
            // Full game script preserved from original with badge/confetti and 8-bit icons added
            const ROWS = 6, COLS = 6, MAX_SIZE = 3, MAX_CLICKS = 20;

            // ---------- Render scheduling (prevents redundant reflows) ----------
            const IS_MOBILE_COARSE = !!((window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
            let renderQueued = false;
            function scheduleRender() {
                if (renderQueued) return;
                renderQueued = true;
                const flushRender = () => {
                    try { render(); } catch (e) { console.warn('render failed', e); }
                    renderQueued = false;
                };
                // On mobile, align render with the display refresh for smoother scrolling/battery.
                if (IS_MOBILE_COARSE && typeof requestAnimationFrame === 'function') requestAnimationFrame(flushRender);
                else setTimeout(flushRender, 0);
            }


            const SPRITE_URLS = [
                'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/Test_pixel.png',
                'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/virus2.png',
                'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/virus3.png',
                'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/virus4.png'
            ];
            const PETRI_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/petri%20dish.png';
            const SFX_URLS = {
                pop: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/pop2.mp3',
                grow: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/grow.mp3',
                fill: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/bubblefill2.mp3',
                win: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/win2.mp3',
                lose: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/lose2.mp3',
                nanostorm: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/nanostorm.mp3'
            };

            // Background music playlist (hard-wired) — will be started on the user's first tap
            const MUSIC_PLAYLIST = [
                'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/Voltaic.mp3',
                'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/Robobozo.mp3'
            ];
            let musicOrder = [];
            let musicIndex = 0;
            let musicAudio = null;
            let musicSilenceMs = 2000; // 2 seconds silence between tracks
            let musicEnabled = true;

            let sfxCache = {};
            function createSfx(key) { const url = SFX_URLS[key]; if (!url) return null; try { const a = new Audio(url); a.preload = 'auto'; a.volume = 0.5; a.crossOrigin = 'anonymous'; sfxCache[key] = a; return a; } catch (e) { return null; } }
            function getSfx(key) { return sfxCache[key] || createSfx(key); }
            function playSfx(key) { try { const a = getSfx(key); if (!a) return; a.currentTime = 0; const p = a.play(); if (p && p.catch) p.catch(() => { }); } catch (e) { } }

            function shuffleArray(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]]; } }
            function prepareMusicOrder() { musicOrder = MUSIC_PLAYLIST.slice(); shuffleArray(musicOrder); musicIndex = 0; }
            function playNextMusicTrack() {
                if (!musicEnabled) return; if (musicAudio) { try { musicAudio.pause(); musicAudio.src = ''; } catch (e) { } musicAudio = null; }
                if (musicOrder.length === 0) prepareMusicOrder(); const url = musicOrder[musicIndex % musicOrder.length]; musicAudio = new Audio(url); musicAudio.volume = 0.20; musicAudio.preload = 'auto'; musicAudio.crossOrigin = 'anonymous';
                const onEnded = () => { // schedule next after silence
                    musicAudio.removeEventListener('ended', onEnded);
                    setTimeout(() => { musicIndex = (musicIndex + 1) % musicOrder.length; playNextMusicTrack(); }, musicSilenceMs);
                };
                musicAudio.addEventListener('ended', onEnded);
                const playPromise = musicAudio.play(); if (playPromise && playPromise.catch) { playPromise.catch(() => { /* ignore */ }); }
            }
            // ---- audio settings hookup inserted by ChatGPT v4 ----
            try {
                // expose musicVolume and allMuted into local scope if not present
                if (typeof musicVolume === 'undefined') var musicVolume = (window.musicVolume !== undefined) ? window.musicVolume : 0.20;
                if (typeof allMuted === 'undefined') var allMuted = (window.allMuted !== undefined) ? window.allMuted : false;
                window.musicVolume = window.musicVolume || musicVolume;
                window.allMuted = window.allMuted || allMuted;

                // wrap playNextMusicTrack so newly created musicAudio picks up volume/mute
                try {
                    // ensure newly-created musicAudio is usable from both local and window scope
                    const _origPlayNext = playNextMusicTrack;
                    playNextMusicTrack = function () {
                        const res = _origPlayNext.apply(this, arguments);
                        try {
                            // if a musicAudio variable was created/assigned by playNextMusicTrack, normalize it:
                            if (typeof musicAudio !== 'undefined' && musicAudio) {
                                // keep volume/mute in sync with UI variables
                                musicAudio.volume = (typeof musicVolume !== 'undefined') ? musicVolume : (window.musicVolume || musicAudio.volume || 0.20);
                                musicAudio.muted = !!(typeof allMuted !== 'undefined' ? allMuted : window.allMuted);
                                // expose to window so other handlers (startBtn, etc.) can see the same instance
                                try { window.musicAudio = musicAudio; } catch (e) { /* best-effort */ }
                            } else if (window.musicAudio) {
                                // if playNextMusicTrack assigned to window.musicAudio instead, ensure its props are set likewise
                                try {
                                    window.musicAudio.volume = (typeof musicVolume !== 'undefined') ? musicVolume : (window.musicVolume || window.musicAudio.volume || 0.20);
                                    window.musicAudio.muted = !!(typeof allMuted !== 'undefined' ? allMuted : window.allMuted);
                                } catch (e) { }
                            }
                        } catch (e) { /* ignore errors */ }
                        return res;
                    };

                } catch (e) { }

                // wire UI sliders directly to local musicAudio and to local vars
                const mSlider = document.getElementById('musicVol');
                const sSlider = document.getElementById('sfxVol');
                const mVal = document.getElementById('musicVolVal');
                const sVal = document.getElementById('sfxVolVal');
                const popupMute = document.getElementById('popupMute');

                if (mSlider) {
                    // initialize slider
                    mSlider.value = String((typeof musicAudio !== 'undefined' && musicAudio && musicAudio.volume !== undefined) ? musicAudio.volume : (window.musicVolume || 0.20));
                    if (mVal) mVal.textContent = Math.round(Number(mSlider.value) * 100) + '%';
                    mSlider.addEventListener('input', function (e) {
                        var v = Number(e.target.value);
                        try { musicVolume = v; } catch (e) { }
                        window.musicVolume = v;
                        if (typeof musicAudio !== 'undefined' && musicAudio) {
                            try { musicAudio.volume = v; } catch (e) { }
                        }
                    });
                }

                if (sSlider) {
                    sSlider.value = String(window.sfxVolume || 0.50);
                    if (sVal) sVal.textContent = Math.round(Number(sSlider.value) * 100) + '%';
                }

                if (popupMute) {
                    // make popup mute call the page's existing mute button if present
                    popupMute.addEventListener('click', function () {
                        try {
                            var mainMute = document.getElementById('mute');
                            if (mainMute && typeof mainMute.click === 'function') {
                                mainMute.click();
                            } else {
                                // fallback: toggle local variables and apply
                                var nm = !((typeof allMuted !== 'undefined') ? allMuted : window.allMuted);
                                try { allMuted = nm; } catch (e) { }
                                window.allMuted = nm;
                                if (typeof musicAudio !== 'undefined' && musicAudio) try { musicAudio.muted = !!nm; } catch (e) { }
                                // also mute sfx cache
                                try { if (typeof sfxCache !== 'undefined' && sfxCache) Object.values(sfxCache).forEach(function (a) { if (a) a.muted = !!nm; }); } catch (e) { }
                            }
                        } catch (e) { }
                    });
                }

            } catch (e) { }
            // ---- end inserted block ----

            function startBackgroundMusic() { try { if (!musicOrder.length) prepareMusicOrder(); playNextMusicTrack(); } catch (e) { console.warn('startBackgroundMusic failed', e); } }
            function stopBackgroundMusic() {
                try {
                    // stop and clear any local reference
                    if (typeof musicAudio !== 'undefined' && musicAudio) {
                        try { musicAudio.pause(); } catch (e) { }
                        try { musicAudio.currentTime = 0; } catch (e) { }
                        musicAudio = null;
                    }
                    // also stop/clear any window-level audio reference (covers other code paths)
                    if (window.musicAudio) {
                        try { window.musicAudio.pause(); } catch (e) { }
                        try { window.musicAudio.currentTime = 0; } catch (e) { }
                        try { window.musicAudio = null; } catch (e) { /* ignore */ }
                    }
                } catch (e) {
                    // final safety - don't leak exceptions to UI
                    console.warn('stopBackgroundMusic error', e);
                }
            }

            // Game difficulty & state
            let clicksLeft = 10, screensPassed = 0, totalScore = 0;
            let outOfClicksShown = false;
            let state = new Array(ROWS * COLS).fill(null);
            let specialState = new Array(ROWS * COLS).fill(null);
            let specialMetaState = new Array(ROWS * COLS).fill(null);
            let inputLocked = false;
            const MAX_STORM_CHARGES = 1;
            const STORM_RECHARGE_CHAIN_MIN = 21; // must exceed 20 in one chain
            const STORM_NEAR_THRESHOLD = 16;
            const SPECIAL_VIRUS_SETTINGS = {
                baseChance: 0.22,
                levelBonus: 0.01,
                maxChance: 0.42
            };
            // Modular special-virus registry:
            // - set `unlockLevel` per type to gate by progression
            // - tune `spawnWeight` to bias frequency among unlocked types
            // - add behavior in `hooks` (onBeforeGrow/onAfterGrow/onPop/onAfterPop)
            const SPECIAL_VIRUS_TYPES = {
                armored: {
                    id: 'armored',
                    label: 'Armored',
                    badge: 'A',
                    className: 'special-armored',
                    enabled: true,
                    unlockLevel: 1,
                    spawnWeight: 1.0,
                    hooks: {
                        onBeforeGrow: specialHookArmoredBeforeGrow
                    }
                },
                splitter: {
                    id: 'splitter',
                    label: 'Splitter',
                    badge: 'S',
                    className: 'special-splitter',
                    enabled: false,
                    unlockLevel: 1,
                    spawnWeight: 1.0,
                    hooks: {
                        onAfterPop: specialHookSplitterAfterPop
                    }
                },
                frozen: {
                    id: 'frozen',
                    label: 'Frozen',
                    badge: 'F',
                    className: 'special-frozen',
                    enabled: false,
                    unlockLevel: 1,
                    spawnWeight: 1.0,
                    hooks: {
                        onBeforeGrow: specialHookFrozenBeforeGrow
                    }
                },
                unstable: {
                    id: 'unstable',
                    label: 'Unstable',
                    badge: '!',
                    className: 'special-unstable',
                    enabled: false,
                    unlockLevel: 1,
                    spawnWeight: 1.0,
                    hooks: {
                        getMaxStableSize: specialHookUnstableMaxStableSize
                    }
                }
            };
            try {
                window.SpecialVirusConfig = SPECIAL_VIRUS_TYPES;
                window.SpecialVirusSettings = SPECIAL_VIRUS_SETTINGS;
            } catch (e) { }
            let stormCharges = 1;
            let stormArmed = false;
            let stormHoverIndex = null;
            let stormResolving = false;
            let stormChainPops = 0;
            let stormChainResetTimer = null;
            let stormChargeFlashTimer = null;

            // Move DOM element lookups inside DOMContentLoaded
            const boardEl = document.getElementById('board');
            const clicksEl = document.getElementById('clicks');
            const screensEl = document.getElementById('screens');
            const scoreEl = document.getElementById('score');
            const stormBtn = document.getElementById('stormBtn');


            // High-score persistence (localStorage)
            const highScoreKey = 'goneViral_highScore';
            let highScore = Number(localStorage.getItem(highScoreKey) || 0);
            let highScoreEl = null;

            function updateHUD() {

                // ensure high score element is available
                if (!highScoreEl) try { highScoreEl = document.getElementById('highScoreValue'); } catch (e) { }
                if (clicksEl) clicksEl.textContent = clicksLeft; if (screensEl) screensEl.textContent = (screensPassed + 1); if (scoreEl) scoreEl.textContent = totalScore;
                // --- high-score handling ---
                if (typeof highScore !== 'number') highScore = 0;
                if (totalScore > highScore) {
                    highScore = totalScore;
                    try { localStorage.setItem(highScoreKey, String(highScore)); } catch (e) { }
                    if (highScoreEl) highScoreEl.textContent = String(highScore);
                }
                // Update the floating score box (5 digits, zero-padded)

                const disp = document.getElementById('scoreDisplay');
                if (disp) {
                    const s = String(totalScore).padStart(5, '0').slice(-5);
                    disp.textContent = s;
                }

                // Always update meter visuals and notify assistant when clicks are low
                try {
                    const meter = document.getElementById('clicksMeter');
                    if (meter) {

                        if (meter) {
                            if (clicksLeft <= 2) {
                                if (!meter.classList.contains('low-warning')) {
                                    meter.classList.add('low-warning');
                                    // restart animation by forcing reflow
                                    void meter.offsetWidth;
                                }
                            } else {
                                meter.classList.remove('low-warning');
                            }
                        }

                    }

                    // Assistant low-click guard: trigger once when clicks drop to <=2
                    if (typeof window._assistantLowShown === 'undefined') window._assistantLowShown = false;
                    if (clicksLeft <= 2 && !window._assistantLowShown) {
                        try { if (window.Assistant && Assistant.emit) Assistant.emit('lowClicks', { clicksLeft }); } catch (e) { }
                        window._assistantLowShown = true;
                    }
                    if (clicksLeft > 2 && window._assistantLowShown) {
                        window._assistantLowShown = false;
                    }
                } catch (e) {
                    console.warn('low-clicks HUD update failed', e);
                }

                // update pixel meter visualization (10 segments)
                try { updateClicksMeter(clicksLeft); } catch (e) { }
                try { updateStormUI(); } catch (e) { }
            }

            // Unified reset used by the Game Over persistent popup and restart wiring
            function performGameReset() {
                try {
                    screensPassed = 0;
                    totalScore = 0;
                    randomizeBoard(false);
                    updateHUD();
                    outOfClicksShown = false;
                } catch (e) { console.warn('performGameReset failed', e); }
            }


            // ---------- Level complete popup helper ----------
            

            // ---------- Game Over popup helper ----------

            function showGameOverPopup(opts = {}) {
                // opts: { title, subtitle, duration (ms), persistent (bool) }
                const title = opts.title || 'GAME OVER';
                const subtitle = opts.subtitle || 'Try Again';
                const duration = (typeof opts.duration === 'number') ? opts.duration : 1800;
                const persistent = !!opts.persistent;

                try {
                    // create element
                    const el = document.createElement('div');
                    el.className = 'game-over-popup';
                    el.setAttribute('role', 'alert');
                    el.style.pointerEvents = persistent ? 'auto' : 'none';
                    el.innerHTML = `
                                                                                  <div class="go-title">${title}</div>
                                                                                  <div class="go-sub">${subtitle}</div>
                                                                                `;
                    document.body.appendChild(el);
                    // Make Game Over popup clickable to restart (Option A)
                    try {
                        el.style.cursor = 'pointer';
                        el.title = 'Click to restart';
                        el.addEventListener('click', function restartFromPopup(ev) {
                            try {
                                // reset game state
                                if (typeof performGameReset === 'function') performGameReset();
                                // remove popup element if still present
                                try { if (el && el.parentNode) el.parentNode.removeChild(el); } catch (e) { }
                                // notify assistant (optional)
                                try { if (window.Assistant && Assistant.emit) Assistant.emit('levelComplete', { title: 'Restarted after Game Over' }); } catch (e) { }
                            } catch (e) { console.warn('restart click handler failed', e); }
                        }, { once: true });
                    } catch (e) { console.warn('could not attach restart click handler', e); }

                    void el.offsetWidth;
                    el.classList.add('show');
                    try { if (window.Assistant) Assistant.emit && Assistant.emit('gameOver', { title: title, subtitle: subtitle }); } catch (e) { }


                    if (persistent) {
                        // leave it on screen until user clicks the existing #restart button
                        // ensure restart button exists and wire a one-time handler
                        const restartBtn = document.getElementById('restart');
                        const cleanup = () => {
                            try {
                                if (el) {
                                    el.classList.remove('show');
                                    el.classList.add('hide');
                                    el.addEventListener('animationend', () => { try { el.remove(); } catch (e) { } }, { once: true });
                                }
                            } catch (e) { }
                        };
                        if (restartBtn) {
                            // avoid double-wiring
                            if (!restartBtn._gop_wired) {
                                restartBtn._gop_wired = true;
                                restartBtn.addEventListener('click', function onRestartFromGOP(e) {
                                    // cleanup popup and perform reset
                                    cleanup();
                                    try {
                                        // clear the outOfClicksShown guard so future gameovers can show
                                        outOfClicksShown = false;
                                    } catch (e) { }
                                    // call a unified reset if present
                                    if (typeof performGameReset === 'function') {
                                        try { performGameReset(); } catch (e) { }
                                    } else {
                                        try {
                                            screensPassed = 0;
                                            totalScore = 0;
                                            randomizeBoard(false);
                                            updateHUD();
                                        } catch (e) { }
                                    }
                                    // remove this handler flag (keep listener but it's idempotent)
                                });
                            }
                        } else {
                            // If no restart button, leave the popup until manually removed
                            console.warn('showGameOverPopup: persistent requested but #restart button not found.');
                        }
                        return;
                    }

                    // non-persistent: Hide and cleanup after delay
                    setTimeout(() => {
                        try {
                            el.classList.remove('show');
                            el.classList.add('hide');
                            el.addEventListener('animationend', () => el.remove(), { once: true });
                        } catch (e) { }
                    }, duration);
                } catch (e) {
                    console.warn('showGameOverPopup error', e);
                }
            }



            // Create and update meter functions
            function createClicksMeter(segmentsCount = 10) { const container = document.querySelector('.meter-segments'); if (!container) return; container.innerHTML = ''; for (let i = 0; i < segmentsCount; i++) { const s = document.createElement('div'); s.className = 'seg'; s.dataset.idx = i; container.appendChild(s); } }
            function updateClicksMeter(clicks) { const container = document.querySelector('.meter-segments'); if (!container) return; const segs = Array.from(container.children); const segCount = segs.length || 10; const toFill = Math.round((clicks / MAX_CLICKS) * segCount); segs.forEach((el, i) => { const should = i < toFill; if (should && !el.classList.contains('filled')) { el.classList.add('filled'); el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); } else if (!should && el.classList.contains('filled')) { el.classList.remove('filled'); el.classList.remove('pop'); } }); }

            function shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]]; } }

            // ---------- Level-adaptive size-mix (two-phase) ----------
            // Start / middle / end mixes. Arrays should sum to 1 but code will normalize defensively.
            const SIZE_MIX_START = [0.10, 0.25, 0.30, 0.35]; // early levels: favor large (size 3)
            const SIZE_MIX_EVEN = [0.25, 0.25, 0.25, 0.25]; // middle: even distribution
            const SIZE_MIX_END = [0.35, 0.30, 0.25, 0.10]; // late: favor small (size 0)

            // Levels controlling the interpolation durations
            const LEVELS_TO_EVEN = 5;   // START -> EVEN over these many levels
            const LEVELS_TO_END = 12;  // EVEN -> END over these many levels (after the above)

            // Helper: linear interpolation between two arrays
            function lerpArrays(a, b, t) {
                const out = new Array(Math.max(a.length, b.length));
                for (let i = 0; i < out.length; i++) {
                    const ai = (i < a.length) ? a[i] : 0;
                    const bi = (i < b.length) ? b[i] : 0;
                    out[i] = ai + (bi - ai) * t;
                }
                return out;
            }

            // Debug HUD: create an overlay element to show the current interpolated mix
            function ensureSizeMixDebugElement() {
                let el = document.getElementById('sizeMixDebug');
                if (!el) {
                    el = document.createElement('div');
                    el.id = 'sizeMixDebug';
                    el.style.position = 'fixed';
                    el.style.right = '12px';
                    el.style.top = '12px';
                    el.style.zIndex = 99999;
                    el.style.background = 'rgba(0,0,0,0.65)';
                    el.style.color = '#ffd166';
                    el.style.padding = '8px 10px';
                    el.style.fontFamily = 'monospace';
                    el.style.fontSize = '12px';
                    el.style.borderRadius = '8px';
                    el.style.pointerEvents = 'none';
                    document.body.appendChild(el);
                }
                return el;
            }
            const SHOW_SIZE_MIX_DEBUG = !!window.DEBUG_SIZE_MIX;
            function updateSizeMixDebug(weights, levelNum) {
                if (!SHOW_SIZE_MIX_DEBUG) return;
                const el = ensureSizeMixDebugElement();
                if (!el) return;
                const pct = weights.map((w, i) => `s${i}:${Math.round(w * 100)}%`).join(' ');
                el.textContent = `L${levelNum} ${pct}`;
            }

            // Weighted sampler that adapts based on screensPassed (levels completed)
            function sampleSizeRandom() {
                const dims = MAX_SIZE + 1;
                // helper to ensure arrays are the right length
                function ensureLen(arr) {
                    const out = arr.slice(0, dims);
                    while (out.length < dims) out.push(0);
                    return out;
                }
                const S = ensureLen(SIZE_MIX_START);
                const M = ensureLen(SIZE_MIX_EVEN);
                const E = ensureLen(SIZE_MIX_END);

                let weights;
                if (typeof screensPassed === 'undefined') {
                    // fallback to uniform if screensPassed not yet defined
                    weights = new Array(dims).fill(1 / dims);
                } else if (screensPassed <= LEVELS_TO_EVEN) {
                    const t1 = LEVELS_TO_EVEN === 0 ? 1 : (screensPassed / LEVELS_TO_EVEN);
                    weights = lerpArrays(S, M, t1);
                } else if (screensPassed <= LEVELS_TO_EVEN + LEVELS_TO_END) {
                    const local = screensPassed - LEVELS_TO_EVEN;
                    const t2 = LEVELS_TO_END === 0 ? 1 : (local / LEVELS_TO_END);
                    weights = lerpArrays(M, E, t2);
                } else {
                    weights = E.slice();
                }

                // Normalize defensively
                const sum = weights.reduce((a, b) => a + b, 0) || 1;
                for (let i = 0; i < weights.length; i++) weights[i] = weights[i] / sum;

                // Update debug HUD with current mix (disabled by default)
                updateSizeMixDebug(weights, (screensPassed || 0) + 1);

                // Weighted sample by cumulative weights
                let r = Math.random();
                for (let i = 0; i < weights.length; i++) {
                    if (r < weights[i]) return i;
                    r -= weights[i];
                }
                return weights.length - 1;
            }

            function getCurrentLevelNumber() {
                return Math.max(1, (Number(screensPassed) || 0) + 1);
            }

            function getSpecialTypeDef(typeId) {
                if (!typeId) return null;
                return SPECIAL_VIRUS_TYPES[typeId] || null;
            }

            function createInitialSpecialMeta(typeId) {
                if (typeId === 'armored' || typeId === 'frozen') return { shieldHitsRemaining: 1 };
                return {};
            }

            function setSpecialForCell(index, typeId) {
                if (!Number.isFinite(index) || index < 0 || index >= state.length) return;
                specialState[index] = typeId || null;
                specialMetaState[index] = typeId ? createInitialSpecialMeta(typeId) : null;
            }

            function clearSpecialForCell(index) {
                if (!Number.isFinite(index) || index < 0 || index >= state.length) return;
                specialState[index] = null;
                specialMetaState[index] = null;
            }

            function ensureSpecialMeta(index) {
                if (!Number.isFinite(index) || index < 0 || index >= state.length) return null;
                if (!specialMetaState[index]) specialMetaState[index] = {};
                return specialMetaState[index];
            }

            function getActiveSpecialTypes(levelNum = getCurrentLevelNumber()) {
                const level = Math.max(1, Number(levelNum) || 1);
                return Object.values(SPECIAL_VIRUS_TYPES).filter((def) => {
                    if (!def || !def.id) return false;
                    if (def.enabled === false) return false;
                    return level >= Math.max(1, Number(def.unlockLevel) || 1);
                });
            }

            function rollSpecialVirusType(levelNum = getCurrentLevelNumber()) {
                const active = getActiveSpecialTypes(levelNum);
                if (!active.length) return null;
                const level = Math.max(1, Number(levelNum) || 1);
                const base = Math.max(0, Math.min(1, Number(SPECIAL_VIRUS_SETTINGS.baseChance) || 0));
                const levelBonus = Math.max(0, Number(SPECIAL_VIRUS_SETTINGS.levelBonus) || 0);
                const maxChance = Math.max(0, Math.min(1, Number(SPECIAL_VIRUS_SETTINGS.maxChance) || 1));
                const chance = Math.min(maxChance, base + ((level - 1) * levelBonus));
                if (Math.random() > chance) return null;
                const totalWeight = active.reduce((sum, def) => sum + Math.max(0, Number(def.spawnWeight) || 0), 0);
                if (totalWeight <= 0) return null;
                let pick = Math.random() * totalWeight;
                for (let i = 0; i < active.length; i++) {
                    pick -= Math.max(0, Number(active[i].spawnWeight) || 0);
                    if (pick <= 0) return active[i].id;
                }
                return active[active.length - 1].id;
            }

            function invokeSpecialHook(typeId, hookName, payload) {
                const def = getSpecialTypeDef(typeId);
                if (!def || !def.hooks) return null;
                const hook = def.hooks[hookName];
                if (typeof hook !== 'function') return null;
                try {
                    return hook(payload);
                } catch (e) {
                    console.warn('special hook failed', typeId, hookName, e);
                    return null;
                }
            }

            function getNeighborIndices(index, includeDiagonals = true) {
                const out = [];
                const row = Math.floor(index / COLS);
                const col = index % COLS;
                const deltas = includeDiagonals
                    ? [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]]
                    : [[-1, 0], [1, 0], [0, -1], [0, 1]];
                for (let i = 0; i < deltas.length; i++) {
                    const nr = row + deltas[i][0];
                    const nc = col + deltas[i][1];
                    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
                    out.push((nr * COLS) + nc);
                }
                return out;
            }

            function spawnVirusesNear(index, count = 1) {
                const targetCount = Math.max(0, Number(count) || 0);
                if (targetCount <= 0) return 0;
                const candidates = getNeighborIndices(index, true).filter((i) => state[i] === null);
                if (!candidates.length) return 0;
                shuffle(candidates);
                let spawned = 0;
                for (let i = 0; i < candidates.length && spawned < targetCount; i++) {
                    const id = candidates[i];
                    state[id] = 0;
                    clearSpecialForCell(id);
                    spawned++;
                }
                return spawned;
            }

            function playShieldBlockFlash(index) {
                if (!Number.isFinite(index) || !boardEl) return;
                const applyFlash = () => {
                    try {
                        const cell = boardEl.querySelector(`[data-index='${index}']`);
                        if (!cell) return;
                        cell.classList.remove('shield-block');
                        void cell.offsetWidth;
                        cell.classList.add('shield-block');
                        const v = cell.querySelector('.virus.special-armored');
                        if (v) {
                            v.classList.remove('shield-hit');
                            void v.offsetWidth;
                            v.classList.add('shield-hit');
                            setTimeout(() => { try { v.classList.remove('shield-hit'); } catch (e) { } }, 240);
                        }
                        setTimeout(() => { try { cell.classList.remove('shield-block'); } catch (e) { } }, 240);
                    } catch (e) { }
                };
                applyFlash();
                try { requestAnimationFrame(applyFlash); } catch (e) { }
            }

            function playShieldBreakEffect(index) {
                if (!Number.isFinite(index) || !boardEl) return;
                try {
                    const cell = boardEl.querySelector(`[data-index='${index}']`);
                    if (!cell) return;
                    const r = cell.getBoundingClientRect();
                    const burst = document.createElement('div');
                    burst.className = 'shield-break-burst';
                    burst.style.left = Math.round(r.left + (r.width / 2)) + 'px';
                    burst.style.top = Math.round(r.top + (r.height / 2)) + 'px';
                    document.body.appendChild(burst);
                    setTimeout(() => { try { burst.remove(); } catch (e) { } }, 430);
                } catch (e) { }
            }

            function specialHookArmoredBeforeGrow(ctx) {
                if (!ctx || !Number.isFinite(ctx.index)) return null;
                const meta = ensureSpecialMeta(ctx.index);
                const remaining = Math.max(0, Number(meta && meta.shieldHitsRemaining) || 0);
                if (remaining <= 0) return null;
                meta.shieldHitsRemaining = remaining - 1;
                playShieldBlockFlash(ctx.index);
                if (meta.shieldHitsRemaining <= 0) {
                    playShieldBreakEffect(ctx.index);
                    clearSpecialForCell(ctx.index);
                }
                try { playSfx('fill'); } catch (e) { }
                return { cancelGrowth: true };
            }

            function specialHookFrozenBeforeGrow(ctx) {
                if (!ctx || !Number.isFinite(ctx.index)) return null;
                const meta = ensureSpecialMeta(ctx.index);
                const remaining = Math.max(0, Number(meta && meta.shieldHitsRemaining) || 0);
                if (remaining <= 0) return null;
                meta.shieldHitsRemaining = remaining - 1;
                if (Array.isArray(ctx.state) && ctx.state[ctx.index] !== null) {
                    ctx.state[ctx.index] = Math.max(0, Number(ctx.state[ctx.index]) - 1);
                }
                if (meta.shieldHitsRemaining <= 0) clearSpecialForCell(ctx.index);
                try { playSfx('fill'); } catch (e) { }
                return { cancelGrowth: true };
            }

            function specialHookSplitterAfterPop(ctx) {
                if (!ctx || !Number.isFinite(ctx.index)) return null;
                spawnVirusesNear(ctx.index, 2);
                return null;
            }

            function specialHookUnstableMaxStableSize(ctx) {
                const maxDefault = (ctx && Number.isFinite(ctx.maxDefault)) ? Number(ctx.maxDefault) : MAX_SIZE;
                return Math.max(0, maxDefault - 1);
            }


            function randomizeBoard(preserveClicks = false) {
                state.fill(null);
                specialState.fill(null);
                specialMetaState.fill(null);
                if (!preserveClicks) {
                    clicksLeft = 10;
                    stormResolving = false;
                    stormCharges = 1;
                    setStormArmed(false);
                    resetStormChainIndicator();
                }
                const total = ROWS * COLS;
                const levelNum = getCurrentLevelNumber();
                const target = Math.round(total * Math.min(0.95, BASE_DENSITY + screensPassed * DENSITY_GROWTH));
                const idx = Array.from({ length: total }, (_, i) => i);
                shuffle(idx);
                for (let k = 0; k < target; k++) {
                    const cellIndex = idx[k];
                    state[cellIndex] = sampleSizeRandom();
                    setSpecialForCell(cellIndex, rollSpecialVirusType(levelNum));
                }
                scheduleRender();
                updateHUD();
            }

            function findNextBubble(index, dr, dc) { let r = Math.floor(index / COLS), c = index % COLS; while (true) { r += dr; c += dc; if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null; const i = r * COLS + c; if (state[i] !== null) return i; } }

            function createPetriElement() { const pet = document.createElement('div'); pet.className = 'petri'; if (PETRI_URL) { const img = document.createElement('img'); img.src = PETRI_URL; img.alt = 'petri'; pet.appendChild(img); } return pet; }

            function createVirusContainer(size, specialType = null) {
                const container = document.createElement('div');
                container.className = 'virus virus--size-' + size;
                const def = getSpecialTypeDef(specialType);
                if (def) {
                    container.classList.add('special-virus');
                    if (def.className) container.classList.add(def.className);
                    container.dataset.specialType = String(def.id);
                }
                const sprite = document.createElement('div');
                sprite.className = 'face-sprite';
                const img = document.createElement('img');
                img.className = 'face-img';
                img.src = SPRITE_URLS[Math.max(0, Math.min(3, size))];
                img.alt = 'virus';
                const sizeScales = [0.4, 0.6, 0.8, 1.0];
                img.style.transform = 'scale(' + sizeScales[Math.max(0, Math.min(3, size))] + ')';
                img.style.transformOrigin = 'center center';
                sprite.appendChild(img);
                container.appendChild(sprite);
                if (def) {
                    const marker = document.createElement('div');
                    marker.className = 'special-badge';
                    marker.textContent = def.badge || '?';
                    marker.setAttribute('aria-hidden', 'true');
                    marker.title = def.label || def.id;
                    container.appendChild(marker);
                }
                const stain = document.createElement('div');
                stain.className = 'stain';
                container.appendChild(stain);
                return container;
            }

            function render() {
                boardEl.innerHTML = ''; for (let i = 0; i < ROWS * COLS; i++) {
                    const val = state[i];
                    const specialType = specialState[i];
                    const specialDef = getSpecialTypeDef(specialType);
                    const gridCell = document.createElement('div');
                    gridCell.className = 'cell';
                    gridCell.dataset.index = i; // petri underlay
                    if (specialDef) {
                        gridCell.classList.add('has-special');
                        if (specialDef.className) gridCell.classList.add(specialDef.className);
                    }
                    const pet = createPetriElement(); gridCell.appendChild(pet);
                    if (val !== null) { const container = createVirusContainer(val, specialType); gridCell.appendChild(container); }
                    boardEl.appendChild(gridCell);
                }
                updateHUD();
                if (stormArmed && Number.isFinite(stormHoverIndex)) applyStormPreview(stormHoverIndex);
                else clearStormPreview();
                const remaining = state.filter(x => x !== null).length;

                if (remaining === 0) {
                    // single, unified "level complete" path
                    clicksLeft = Math.min(MAX_CLICKS, clicksLeft + 1);
                    playSfx('win');
                    screensPassed += 1;
                    updateHUD();

                    try { showLevelComplete({ title: 'LEVEL COMPLETE', duration: 4500 }); } catch (e) { }

                    // wait a moment for the popup/animation, then new board
                    setTimeout(() => randomizeBoard(true), 420);
                }


            }

            // Particle pool
            const PARTICLE_POOL = [];
            // ---------- Sprite-based particle implementation (replacement) ----------
            const PARTICLE_SPRITE = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/antibody.png';

            // Create a pooled particle element (an <img> inside a .particle wrapper)
            function makeAntibodyParticle(sizeVariant = 'normal', rotationDeg = 0) {
                const wrapper = document.createElement('div');
                wrapper.className = 'particle';
                if (sizeVariant === 'small') wrapper.classList.add('small');
                else if (sizeVariant === 'large') wrapper.classList.add('large');

                // create img child for the sprite
                const img = document.createElement('img');
                img.src = PARTICLE_SPRITE;
                img.alt = '';
                img.draggable = false;
                wrapper.appendChild(img);

                // runtime flags
                wrapper._inUse = false;
                wrapper._releaseTimeout = null;

                // safety: transitionend cleanup (so we can release when transform finishes)
                wrapper.addEventListener('transitionend', (ev) => {
                    // We only care about transform/opacity transitions finishing
                    if (!wrapper._inUse) return;
                    if (ev.propertyName === 'transform' || ev.propertyName === 'opacity') {
                        // nothing here by default; release is handled by animateParticleTo's timeout
                    }
                });

                return wrapper;
            }

            function getParticleFromPool(sizeVariant = 'normal', rotationDeg = 0) {
                for (let i = 0; i < PARTICLE_POOL.length; i++) {
                    const p = PARTICLE_POOL[i];
                    if (!p._inUse) {
                        p._inUse = true;
                        p.classList.remove('small', 'large');
                        if (sizeVariant === 'small') p.classList.add('small');
                        else if (sizeVariant === 'large') p.classList.add('large');
                        p.style.transition = ''; // reset transition
                        p.style.opacity = '1';
                        p.style.willChange = 'transform, opacity';

                        // --- assign randomized start rotation and optional flip ---
                        const randExtra = (Math.random() - 0.5) * 120; // ±60° jitter
                        const startRot = (rotationDeg + randExtra + 36000) % 360; // normalize
                        p._rotStart = startRot;

                        // sometimes flip the sprite horizontally (~20%)
                        p._flip = (Math.random() < 0.20) ? -1 : 1;

                        // apply the starting transform (centered positioning is preserved)
                        p.style.transform = `translate3d(0px, 0px, 0) translate(-50%,-50%) scale(0.9) rotate(${startRot}deg) scaleX(${p._flip})`;

                        return p;
                    }
                }

                // create new element if pool exhausted
                const np = makeAntibodyParticle(sizeVariant, rotationDeg);
                np._inUse = true;
                // apply same randomized rotation/flip for new node
                const randExtra = (Math.random() - 0.5) * 120;
                const startRot = (rotationDeg + randExtra + 36000) % 360;
                np._rotStart = startRot;
                np._flip = (Math.random() < 0.20) ? -1 : 1;
                np.style.transform = `translate3d(0px, 0px, 0) translate(-50%,-50%) scale(0.9) rotate(${startRot}deg) scaleX(${np._flip})`;

                PARTICLE_POOL.push(np);
                return np;
            }


            function releaseParticle(p) {
                try {
                    p._inUse = false;
                    // clear will-change so the compositor can drop the layer
                    p.style.willChange = 'auto';
                    // reset transition so it doesn't animate accidentally when reused
                    p.style.transition = '';
                    // set invisible
                    p.style.opacity = '0';
                    // optional: remove from DOM to reduce nodes if your pool grows huge
                    // if(document.body.contains(p)) p.remove();
                } catch (e) { /* ignore */ }
            }

            function animateParticleTo(pel, sx, sy, tx, ty, duration, onArrival) {
                // Ensure appended to DOM
                if (!document.body.contains(pel)) document.body.appendChild(pel);

                // compute integer deltas for crisp translation
                const dx = Math.round(tx - sx);
                const dy = Math.round(ty - sy);

                // Place at start coords instantly (no transition)
                pel.style.transition = 'none';
                pel.style.left = sx + 'px';
                pel.style.top = sy + 'px';

                // ensure starting transform honors stored rotation/flip if present
                const startRot = (typeof pel._rotStart === 'number') ? pel._rotStart : (Math.random() * 360);
                const flip = (typeof pel._flip === 'number') ? pel._flip : 1;
                pel.style.transform = `translate3d(0px, 0px, 0) translate(-50%,-50%) scale(0.9) rotate(${startRot}deg) scaleX(${flip})`;

                // flush styles
                void pel.offsetWidth;

                // RANDOMIZE spin: large variance gives distinctive motion
                const maxSpin = 720; // change down to 180 for milder spin
                const spinVariance = (Math.random() - 0.5) * (maxSpin * 2); // -maxSpin..+maxSpin
                const endRot = startRot + spinVariance;

                // small random scale variance for organic look
                const scale = 1 + (Math.random() * 0.08);

                // clamp duration
                const dur = Math.max(300, Math.min(600, Math.round(duration)));

                // apply transitions (transform for travel+rotation, opacity for fade)
                pel.style.transition = `transform ${dur}ms cubic-bezier(.2,.8,.2,1), opacity ${Math.max(80, Math.min(dur, 900))}ms linear`;

                // Target transform: translate by dx,dy and rotate to endRot; keep flip via scaleX
                pel.style.transform = `translate3d(${dx}px, ${dy}px, 0) translate(-50%,-50%) scale(${scale}) rotate(${endRot}deg) scaleX(${flip})`;

                // Fade & shrink: start fade at ~60% of travel and shrink at same time
                const fadeDelay = Math.max(20, dur * 0.6);
                const fadeTimeout = setTimeout(() => {
                    try {
                        pel.style.opacity = '0';
                        // shrink a bit as it fades out
                        const currentTransform = pel.style.transform || '';
                        if (!currentTransform.includes('scale(')) {
                            pel.style.transform += ' scale(0.7)';
                        } else {
                            // append a quick transform transition for shrink
                            pel.style.transition = pel.style.transition + ', transform 180ms ease-in';
                            pel.style.transform = currentTransform.replace(/scale\([^)]*\)/, 'scale(0.7)');
                        }
                    } catch (e) { }
                }, fadeDelay);

                // Cleanup and callback after travel ends (dur + small buffer)
                clearTimeout(pel._releaseTimeout);
                pel._releaseTimeout = setTimeout(() => {
                    try { if (onArrival) onArrival(); } catch (e) { }
                    clearTimeout(fadeTimeout);
                    // ensure invisible and release back to pool
                    pel.style.opacity = '0';
                    releaseParticle(pel);
                }, dur + 40);
            }



            function emitDirectionalParticles(cellIndex, tracker) {
                const originCell = boardEl.querySelector(`[data-index='${cellIndex}']`);
                if (!originCell) return;

                // conservative cap to prevent accidental floods on low-end devices
                const MAX_ACTIVE_PARTICLES = IS_MOBILE_COARSE ? 12 : 20;
                const activeCount = PARTICLE_POOL.filter(p => p && p._inUse).length;
                if (activeCount >= MAX_ACTIVE_PARTICLES) return;

                const r = originCell.getBoundingClientRect();
                const sx = r.left + r.width / 2;
                const sy = r.top + r.height / 2;

                // directions: dr, dc, ox, oy (ox/oy used as fallback travel direction)
                const dirs = [
                    [-1, 0, 0, -1], // up
                    [1, 0, 0, 1],   // down
                    [0, -1, -1, 0], // left
                    [0, 1, 1, 0]    // right
                ];

                // For narrow screens we still only spawn 1 per direction; this reduces visual noise
                // but retains the single directional particle behavior requested.
                const perDirection = 1;

                const hitTargets = new Set();

                dirs.forEach((d, dirIdx) => {
                    const [dr, dc, ox, oy] = d;
                    // find the closest bubble in this direction (if any)
                    const next = findNextBubble(cellIndex, dr, dc);

                    // spawn exactly one particle for this direction (if below cap)
                    if (activeCount + 1 > MAX_ACTIVE_PARTICLES) return;

                    // random rotation for each particle
                    const rot = Math.floor(Math.random() * 360);

                    // Always request 'small' size; getParticleFromPool supports (sizeVariant, rotationDeg)
                    const p = getParticleFromPool('small', rot);
                    if (!p) return;

                    // small jitter so particles don't all start in exactly the same pixel
                    const jitterX = (Math.random() - 0.5) * 8;
                    const jitterY = (Math.random() - 0.5) * 8;
                    p.style.left = (sx + jitterX) + 'px';
                    p.style.top = (sy + jitterY) + 'px';
                    p.style.opacity = '1';

                    // ensure it's in the DOM
                    if (!document.body.contains(p)) document.body.appendChild(p);

                    if (next !== null) {
                        // target exists: aim roughly at the center of the target cell
                        const targetEl = boardEl.querySelector(`[data-index='${next}']`);
                        if (targetEl) {
                            const tr = targetEl.getBoundingClientRect();
                            const tx = tr.left + tr.width / 2 + (Math.random() - 0.5) * 12;
                            const ty = tr.top + tr.height / 2 + (Math.random() - 0.5) * 12;
                            // duration tuned per direction (slightly varied)
                            const dur = 400 + Math.random() * 600 + dirIdx * 20;
                            animateParticleTo(p, sx + jitterX, sy + jitterY, tx, ty, dur, () => {
                                try {
                                    if (!hitTargets.has(next)) {
                                        hitTargets.add(next);
                                        handleClick(next, false, tracker);
                                    }
                                } catch (e) { }
                            });
                        } else {
                            // no element found, send particle off-screen based on fallback direction
                            const tx = sx + ox * (window.innerWidth * 0.8) + (Math.random() - 0.5) * 80;
                            const ty = sy + oy * (window.innerHeight * 0.8) + (Math.random() - 0.5) * 80;
                            const dur = 700 + Math.random() * 260;
                            animateParticleTo(p, sx + jitterX, sy + jitterY, tx, ty, dur, null);
                        }
                    } else {
                        // no target in that direction: send particle outwards visually
                        const tx = sx + ox * (window.innerWidth * 0.8) + (Math.random() - 0.5) * 80;
                        const ty = sy + oy * (window.innerHeight * 0.8) + (Math.random() - 0.5) * 80;
                        const dur = 700 + Math.random() * 260;
                        animateParticleTo(p, sx + jitterX, sy + jitterY, tx, ty, dur, null);
                    }
                });

            }


            function popAt(index, tracker) {
                const cellEl = boardEl.querySelector(`[data-index='${index}']`); if (!cellEl) return; try { const r0 = cellEl.getBoundingClientRect(); const gx = r0.left + r0.width / 2; const gy = r0.top + r0.height / 2; const glow = document.createElement('div'); glow.className = 'glow'; glow.style.left = gx + 'px'; glow.style.top = gy + 'px'; document.body.appendChild(glow); glow.style.animation = 'glowPop 520ms ease-out forwards'; setTimeout(() => { try { glow.remove(); } catch (e) { } }, 600); } catch (e) { } const virus = cellEl.querySelector('.virus'); if (virus) { let stain = virus.querySelector('.stain'); if (!stain) { stain = document.createElement('div'); stain.className = 'stain'; virus.appendChild(stain); } stain.classList.remove('show'); void stain.offsetWidth; stain.classList.add('show'); } emitDirectionalParticles(index, tracker);
                // record position for chain centroid (for responsive badge placement)
                // make sure we only count each index once per chain
                if (tracker) {
                    try {
                        if (!Array.isArray(tracker.positions)) tracker.positions = [];
                        // record positions for badge placement (keep duplicates too for centroid)
                        tracker.positions.push(index);
                    } catch (e) { /* ignore */ }

                    // Deduplicate pops so each index only increments the chain once
                    if (!tracker.poppedSet) tracker.poppedSet = new Set();
                    if (!tracker.poppedSet.has(index)) {
                        tracker.poppedSet.add(index);
                        tracker.pops = (tracker.pops || 0) + 1;
                        updateStormChainProgress(tracker.pops);

                        // Only award an extra click on every *odd* pop after the second one (3rd, 5th, 7th.)
                        if (tracker.pops > 2 && (tracker.pops % 2) === 1) {
                            clicksLeft = Math.min(MAX_CLICKS, clicksLeft + 1);
                            playSfx('fill');
                        }
                        const chainMultiplier = 1 + (tracker.pops - 1) * 0.5;
                        const earned = Math.round(10 * chainMultiplier * (1 + screensPassed * 0.1));
                        totalScore += earned;
                        updateHUD();
                        try { if (window.Assistant && (tracker.pops || 0) > 10) Assistant.emit && Assistant.emit('cascade', { pops: tracker.pops }); } catch (e) { }

                    }
                }

            }

            // ----- Cleaned out-of-clicks handling (previously corrupted) -----
            function checkOutOfClicks() {
                if (clicksLeft <= 0 && !outOfClicksShown) {
                    outOfClicksShown = true;
                    try { playSfx('lose'); } catch (e) { }

                    // Show persistent popup — will remain until the player clicks the existing restart button
                    showGameOverPopup({ title: 'GAME OVER', subtitle: 'click to try again', persistent: true });
                    // wait a bit longer than popup animation
                }
            }


            // ----- Badge rules & display -----
            const BADGE_RULES = [
                { min: 22, title: 'INCREDIBLE', icon: 'explosion', scoreBonus: 200, extraClicks: 3, className: 'incredible' },
                { min: 18, title: 'STUPENDOUS', icon: 'starburst', scoreBonus: 120, extraClicks: 2, className: 'stupendous' },
                { min: 14, title: 'AMAZING', icon: 'spark', scoreBonus: 70, extraClicks: 2, className: 'amazing' },
                { min: 10, title: 'GREAT', icon: 'pixel-star', scoreBonus: 30, extraClicks: 1, className: 'great' },
            ];

            function syncStormChainIndicator() {
                if (!stormBtn) return;
                const count = Math.max(0, Number(stormChainPops) || 0);
                const isCharged = stormCharges > 0;
                const visualCount = isCharged ? STORM_RECHARGE_CHAIN_MIN : count;
                const ratio = Math.max(0, Math.min(1, visualCount / STORM_RECHARGE_CHAIN_MIN));
                stormBtn.style.setProperty('--storm-combo-ratio', String(ratio));
                stormBtn.dataset.chain = String(Math.min(visualCount, STORM_RECHARGE_CHAIN_MIN));
                stormBtn.classList.toggle('charged', isCharged);
                stormBtn.classList.toggle('combo-tracking', !isCharged && visualCount > 0);
                stormBtn.classList.toggle('combo-near', !isCharged && visualCount >= STORM_NEAR_THRESHOLD && visualCount < STORM_RECHARGE_CHAIN_MIN);
                stormBtn.classList.toggle('combo-hot', !isCharged && visualCount >= (STORM_RECHARGE_CHAIN_MIN - 1));
                const baseTitle = stormArmed ? 'Nano Storm armed' : (isCharged ? 'Nano Storm ready' : 'Nano Storm charging');
                const chainTitle = (!isCharged && visualCount > 0) ? (' | chain ' + visualCount + '/' + STORM_RECHARGE_CHAIN_MIN) : '';
                stormBtn.setAttribute('title', baseTitle + chainTitle);
            }

            function flashStormChargeGain() {
                if (!stormBtn) return;
                stormBtn.classList.remove('charge-gained');
                void stormBtn.offsetWidth;
                stormBtn.classList.add('charge-gained');
                try { if (stormChargeFlashTimer) clearTimeout(stormChargeFlashTimer); } catch (e) { }
                stormChargeFlashTimer = setTimeout(() => {
                    stormChargeFlashTimer = null;
                    try { stormBtn.classList.remove('charge-gained'); } catch (e) { }
                }, 520);
            }

            function updateStormChainProgress(popCount) {
                stormChainPops = Math.max(0, Number(popCount) || 0);
                syncStormChainIndicator();
            }

            function scheduleStormChainReset(delayMs = 700) {
                try { if (stormChainResetTimer) clearTimeout(stormChainResetTimer); } catch (e) { }
                stormChainResetTimer = setTimeout(() => {
                    stormChainResetTimer = null;
                    stormChainPops = 0;
                    syncStormChainIndicator();
                }, Math.max(0, Number(delayMs) || 0));
            }

            function resetStormChainIndicator() {
                try { if (stormChainResetTimer) clearTimeout(stormChainResetTimer); } catch (e) { }
                stormChainResetTimer = null;
                stormChainPops = 0;
                syncStormChainIndicator();
            }

            function grantStormChargeFromChain(popCount) {
                const count = Math.max(0, Number(popCount) || 0);
                if (count <= 20) return false;
                const before = stormCharges;
                stormCharges = Math.min(MAX_STORM_CHARGES, stormCharges + 1);
                if (stormCharges > before) {
                    try { playSfx('fill'); } catch (e) { }
                    flashStormChargeGain();
                    updateStormUI();
                    return true;
                }
                updateStormUI();
                return false;
            }

            function updateStormUI() {
                if (!stormBtn) return;
                if (stormCharges <= 0 && stormArmed) stormArmed = false;
                stormBtn.classList.remove('ready', 'armed', 'empty', 'charged');
                if (stormCharges <= 0) stormBtn.classList.add('empty');
                else if (stormArmed) stormBtn.classList.add('armed');
                else stormBtn.classList.add('ready');
                stormBtn.disabled = stormCharges <= 0;
                stormBtn.setAttribute('aria-pressed', String(!!stormArmed));
                syncStormChainIndicator();
            }

            function getStormTargets(centerIndex) {
                const idx = Number(centerIndex);
                if (!Number.isFinite(idx)) return [];
                const r = Math.floor(idx / COLS);
                const c = idx % COLS;
                const out = [idx];
                const cardinal = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                const diagonal = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
                cardinal.forEach(([dr, dc]) => {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) out.push(nr * COLS + nc);
                });
                diagonal.forEach(([dr, dc]) => {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) out.push(nr * COLS + nc);
                });
                return out;
            }

            function clearStormPreview() {
                if (!boardEl || !boardEl.querySelectorAll) return;
                const marked = boardEl.querySelectorAll('.storm-preview-center, .storm-preview-neighbor, .storm-preview-diagonal');
                marked.forEach((el) => {
                    try {
                        el.classList.remove('storm-preview-center');
                        el.classList.remove('storm-preview-neighbor');
                        el.classList.remove('storm-preview-diagonal');
                    } catch (e) { }
                });
            }

            function applyStormPreview(centerIndex) {
                if (!stormArmed || !boardEl) return;
                stormHoverIndex = Number(centerIndex);
                clearStormPreview();
                const ids = getStormTargets(stormHoverIndex);
                const centerRow = Math.floor(stormHoverIndex / COLS);
                const centerCol = stormHoverIndex % COLS;
                ids.forEach((id, i) => {
                    const cell = boardEl.querySelector(`[data-index='${id}']`);
                    if (!cell) return;
                    if (i === 0) {
                        cell.classList.add('storm-preview-center');
                        return;
                    }
                    const row = Math.floor(id / COLS);
                    const col = id % COLS;
                    const isDiagonal = Math.abs(row - centerRow) === 1 && Math.abs(col - centerCol) === 1;
                    cell.classList.add(isDiagonal ? 'storm-preview-diagonal' : 'storm-preview-neighbor');
                });
            }

            function setStormArmed(val) {
                stormArmed = !!val && stormCharges > 0;
                if (!stormArmed) {
                    stormHoverIndex = null;
                    clearStormPreview();
                } else if (Number.isFinite(stormHoverIndex)) {
                    applyStormPreview(stormHoverIndex);
                }
                updateStormUI();
            }

            function playStormBurst(centerIndex, targets) {
                if (!boardEl) return;
                const centerCell = boardEl.querySelector(`[data-index='${centerIndex}']`);
                if (centerCell) {
                    try {
                        const r = centerCell.getBoundingClientRect();
                        const cx = Math.round(r.left + (r.width / 2));
                        const cy = Math.round(r.top + (r.height / 2));
                        const addRing = (cls, delayMs = 0) => {
                            setTimeout(() => {
                                try {
                                    const ring = document.createElement('div');
                                    ring.className = 'storm-ring ' + cls;
                                    ring.style.left = cx + 'px';
                                    ring.style.top = cy + 'px';
                                    document.body.appendChild(ring);
                                    setTimeout(() => { try { ring.remove(); } catch (e) { } }, 420);
                                } catch (e) { }
                            }, delayMs);
                        };
                        addRing('storm-ring-inner', 0);
                        addRing('storm-ring-outer', 60);
                    } catch (e) { }
                }
                const centerRow = Math.floor(centerIndex / COLS);
                const centerCol = centerIndex % COLS;
                targets.forEach((id, i) => {
                    const cell = boardEl.querySelector(`[data-index='${id}']`);
                    if (!cell) return;
                    const row = Math.floor(id / COLS);
                    const col = id % COLS;
                    const isCenter = i === 0;
                    const isDiagonal = !isCenter && Math.abs(row - centerRow) === 1 && Math.abs(col - centerCol) === 1;
                    const hitCls = isCenter ? 'storm-hit-center' : (isDiagonal ? 'storm-hit-diagonal' : 'storm-hit-neighbor');
                    const afterCls = isCenter ? 'storm-afterglow-center' : (isDiagonal ? 'storm-afterglow-diagonal' : 'storm-afterglow-neighbor');
                    cell.classList.remove('storm-hit-center', 'storm-hit-neighbor', 'storm-hit-diagonal');
                    cell.classList.remove('storm-afterglow-center', 'storm-afterglow-neighbor', 'storm-afterglow-diagonal');
                    void cell.offsetWidth;
                    cell.classList.add(hitCls);
                    setTimeout(() => {
                        try {
                            cell.classList.remove(hitCls);
                            cell.classList.add(afterCls);
                            setTimeout(() => {
                                try { cell.classList.remove(afterCls); } catch (e) { }
                            }, 440);
                        } catch (e) { }
                    }, 200);
                });
            }

            function particlesActive() { try { if (PARTICLE_POOL.some(p => p && p._inUse)) return true; if (document.querySelectorAll && document.querySelectorAll('.particle.animate').length > 0) return true; } catch (e) { } return false; }

            function waitForParticlesThenShow(tracker, cb) { const check = () => { if (!particlesActive()) { try { cb(); } catch (e) { } } else { requestAnimationFrame(check); } }; requestAnimationFrame(check); }

            /* ---------- Retro 8-bit SVG icons ---------- */
            function getRetroIconSVG(name) {
                if (name === 'pixel-star') {
                    return `<svg width="36" height="28" viewBox="0 0 16 12" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect x="7" y="0" width="2" height="2" fill="#ffd166"/><rect x="7" y="2" width="2" height="2" fill="#ffb84d"/><rect x="5" y="2" width="6" height="2" fill="#ffd166"/><rect x="4" y="4" width="8" height="2" fill="#ffb84d"/><rect x="3" y="6" width="10" height="2" fill="#ffd166"/><rect x="5" y="8" width="6" height="2" fill="#ffb84d"/></svg>`;
                }
                if (name === 'spark') {
                    return `<svg width="36" height="28" viewBox="0 0 16 12" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect x="7" y="0" width="2" height="2" fill="#ffe07a"/><rect x="6" y="2" width="4" height="1" fill="#ffd166"/><rect x="4" y="3" width="8" height="1" fill="#ffd166"/><rect x="7" y="4" width="2" height="2" fill="#ffd166"/><rect x="2" y="6" width="12" height="1" fill="#ffb84d"/><rect x="7" y="10" width="2" height="2" fill="#ffe07a"/><rect x="7" y="0" width="2" height="2" fill="#ffe07a"/><rect x="6" y="8" width="4" height="1" fill="#ffd166"/><rect x="4" y="7" width="8" height="1" fill="#ffd166"/><rect x="7" y="9" width="2" height="2" fill="#ffd166"/><rect x="2" y="6" width="12" height="1" fill="#ffb84d"/><rect x="4" y="5" width="8" height="1" fill="#ffd166"/><rect x="5" y="4" width="6" height="1" fill="#ffb84d"/><rect x="4" y="9" width="8" height="1" fill="#ffb84d"/></svg>`;
                }
                if (name === 'starburst') {
                    return `<svg width="36" height="28" viewBox="0 0 16 12" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect x="7" y="0" width="2" height="2" fill="#fff2a6"/><rect x="6" y="2" width="4" height="1" fill="#ffd166"/><rect x="4" y="3" width="8" height="1" fill="#ffd166"/><rect x="7" y="4" width="2" height="2" fill="#ffd166"/><rect x="0" y="5" width="16" height="1" fill="#ffb84d"/><rect x="5" y="6" width="6" height="1" fill="#ffd166"/></svg>`;
                }
                if (name === 'explosion') {
                    return `<svg width="36" height="28" viewBox="0 0 16 12" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect x="7" y="0" width="2" height="2" fill="#ffdf6d"/><rect x="5" y="2" width="6" height="1" fill="#ffd166"/><rect x="3" y="3" width="10" height="1" fill="#ffb84d"/><rect x="2" y="4" width="12" height="1" fill="#ff6f3f"/><rect x="4" y="5" width="8" height="2" fill="#ffb84d"/><rect x="6" y="7" width="4" height="1" fill="#ffd166"/></svg>`;
                }
                return '';
            }

            /* ---------- CONFETTI DISABLED (kept as no-op so badges still work) ---------- */
            /* Keep a placeholder pool (harmless) */
            const CONFETTI_POOL = [];
            /* createConfettiPiece / getConfettiPiece / releaseConfettiPiece
             replaced with no-ops to avoid creating DOM nodes or animations */
            function makeConfettiPiece() {
  /* confetti disabled - no-op */
  return;
}
            function getConfettiPiece() {
  /* confetti disabled - no-op */
  return;
}
            function releaseConfettiPiece(p) {
  /* confetti disabled - no-op */
  return;
}

            /* emitConfettiAt is replaced with a safe no-op. showChainBadge still calls it,
               but nothing will be created or animated. */
            function emitConfettiAt(x, y, tier) {
  /* confetti disabled - no-op */
  return;
}


            /* ---------- showChainBadge with retro icon + confetti ---------- */

            function showChainBadge(tracker) {
                if (!tracker) return;
                // Decide badge AFTER particles settle so we use final tracker.pops
                waitForParticlesThenShow(tracker, () => {
                    try {
                        const count = tracker.pops || 0;
                        console.log('[Badge] final tracker.pops =', count);
                        updateStormChainProgress(count);
                        grantStormChargeFromChain(count);
                        scheduleStormChainReset();
                        const rule = BADGE_RULES.find(r => count >= r.min);
                        if (!rule) return;

                        const badge = document.createElement('div');
                        badge.className = 'chain-badge ' + rule.className;
                        const iconSVG = getRetroIconSVG(rule.icon) || '';
                        badge.innerHTML = `
                                                                                <div class="cb-icon">${iconSVG}</div>
                                                                                <div style="display:flex;flex-direction:column;line-height:1;">
                                                                                  <div style="font-size:14px;opacity:0.95">${rule.title}</div>
                                                                                  <div style="font-size:12px;opacity:0.85">x${count} pops</div>
                                                                                </div>`;

                        const placeBadge = () => {
                            let cx = window.innerWidth / 2;
                            let cy = window.innerHeight * 0.12;
                            try {
                                if (Array.isArray(tracker.positions) && tracker.positions.length) {
                                    const centers = tracker.positions.map(i => {
                                        const el = boardEl.querySelector(`[data-index='${i}']`);
                                        if (!el) return null;
                                        const r = el.getBoundingClientRect();
                                        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
                                    }).filter(Boolean);
                                    if (centers.length) { cx = centers.reduce((s, p) => s + p.x, 0) / centers.length; cy = centers.reduce((s, p) => s + p.y, 0) / centers.length - 60; }
                                }
                            } catch (e) { }
                            if (cy < 60) cy = 60; if (cx < 40) cx = 40; if (cx > window.innerWidth - 40) cx = window.innerWidth - 40;
                            badge.style.left = cx + 'px'; badge.style.top = cy + 'px'; badge.style.transform = 'translateX(-50%) translateY(-6px) scale(0.85)';
                            return { cx, cy };
                        };

                        document.body.appendChild(badge);
                        const pos = placeBadge();
                        requestAnimationFrame(() => badge.classList.add('show'));
                        try { const rect = badge.getBoundingClientRect(); const cx = pos.cx || (rect.left + rect.width / 2); const cy = pos.cy || (rect.top + rect.height / 2); void(cx, cy, rule.className); } catch (e) { }
                        if (rule.scoreBonus) totalScore += rule.scoreBonus;
                        if (rule.extraClicks) { clicksLeft = Math.min(MAX_CLICKS, clicksLeft + rule.extraClicks); playSfx('fill'); }
                        updateHUD();
                        setTimeout(() => { badge.classList.remove('show'); badge.classList.add('hide'); setTimeout(() => { try { badge.remove(); } catch (e) { } }, 420); }, 2100);
                    } catch (e) { console.warn('showChainBadge error', e); }
                });
            }

            // ----- Core interaction -----
            // ----- Core interaction -----
            function handleClick(index, isUser = false, tracker = null, suppressFinalize = false) {
                if (isUser) {
                    // block clicks if game is locked or already out of clicks
                    if (inputLocked || clicksLeft <= 0) return;

                    // lock input for the duration of this chain
                    inputLocked = true;

                    clicksLeft--;
                    updateHUD();

                    // start a tracker for this chain (add sets to deduplicate hits within the chain)
                    tracker = {
                        pops: 0,
                        positions: [],
                        finalized: false,
                        // set of indices already popped during this chain (prevents double counting)
                        poppedSet: new Set(),
                        // (optional) set used by emitters to check whether a target was already hit
                        hitSet: new Set()
                    };
                    resetStormChainIndicator();


                    // show badge after short delay (existing behavior)
                    setTimeout(() => {
                        if (tracker) {
                            tracker.finalized = true;
                            showChainBadge(tracker);
                        }
                    }, 2200);
                }

                // handle empty cell (no virus)
                if (state[index] === null) {
                    if (isUser) {
                        state[index] = 0;
                        clearSpecialForCell(index);
                        scheduleRender();
                    }
                    if (suppressFinalize || stormResolving) return;
                    // unlock since nothing actually happened
                    inputLocked = false;
                    // If we just consumed the last click and there are no particles, check game over now
                    // Use requestAnimationFrame so DOM updates settle first
                    requestAnimationFrame(() => {
                        if (!particlesActive() && clicksLeft <= 0) checkOutOfClicks();
                    });
                    return;
                }

                const specialType = specialState[index];
                const beforeGrowResult = invokeSpecialHook(specialType, 'onBeforeGrow', {
                    index,
                    isUser,
                    state,
                    specialState,
                    specialMetaState,
                    tracker
                });
                if (beforeGrowResult && beforeGrowResult.cancelGrowth) {
                    scheduleRender();
                    if (suppressFinalize || stormResolving) return;
                    inputLocked = false;
                    requestAnimationFrame(() => {
                        if (!particlesActive() && clicksLeft <= 0) checkOutOfClicks();
                    });
                    return;
                }
                playSfx('grow');
                state[index] += 1;
                invokeSpecialHook(specialType, 'onAfterGrow', {
                    index,
                    isUser,
                    state,
                    specialState,
                    specialMetaState,
                    tracker
                });
                // Immediate paint so players see the size change without waiting for the RAF queue
                try { render(); } catch (e) { scheduleRender(); }


                let maxStableSize = MAX_SIZE;
                const currentTypeAfterGrow = specialState[index];
                const maxStableOverride = invokeSpecialHook(currentTypeAfterGrow, 'getMaxStableSize', {
                    index,
                    isUser,
                    state,
                    specialState,
                    specialMetaState,
                    tracker,
                    maxDefault: MAX_SIZE
                });
                if (Number.isFinite(maxStableOverride)) {
                    maxStableSize = Math.max(0, Math.floor(Number(maxStableOverride)));
                }

                if (state[index] <= maxStableSize) {
                    scheduleRender();
                    if (suppressFinalize || stormResolving) return;
                    inputLocked = false;
                    // same immediate check as above
                    requestAnimationFrame(() => {
                        if (!particlesActive() && clicksLeft <= 0) checkOutOfClicks();
                    });
                    return;
                }

                // Pop event
                playSfx('pop');
                const specialTypeOnPop = specialState[index] || specialType;
                invokeSpecialHook(specialTypeOnPop, 'onPop', {
                    index,
                    isUser,
                    state,
                    specialState,
                    specialMetaState,
                    tracker
                });
                popAt(index, tracker);
                state[index] = null;
                clearSpecialForCell(index);
                invokeSpecialHook(specialTypeOnPop, 'onAfterPop', {
                    index,
                    isUser,
                    state,
                    specialState,
                    specialMetaState,
                    tracker
                });
                scheduleRender();
                // single scheduled render; don't call render() directly here to avoid double-running level-complete
                scheduleRender();
                if (suppressFinalize || stormResolving) return;


                // Define common callback for after chain/particle resolution
                const afterChain = () => {
                    inputLocked = false; // allow next click
                    if (clicksLeft <= 0) checkOutOfClicks();
                };

                // If there is no tracker or no particles currently active, run callback immediately (next frame)
                try {
                    // If tracker is falsy or there are no particles to wait for, call immediately
                    if (!tracker || !particlesActive()) {
                        requestAnimationFrame(afterChain);
                    } else {
                        // Otherwise wait until particles/animations finish
                        waitForParticlesThenShow(tracker, afterChain);
                    }
                } catch (e) {
                    // In case helper functions are missing, fall back to immediate unlock + check
                    if (!stormResolving) {
                        inputLocked = false;
                        if (clicksLeft <= 0) checkOutOfClicks();
                    }
                }
            }

            function useNanoStorm(centerIndex) {
                if (inputLocked || clicksLeft <= 0 || stormCharges <= 0) return false;
                const targets = getStormTargets(centerIndex);
                if (!targets.length) return false;
                const center = Number(centerIndex);
                inputLocked = true;
                stormResolving = true;
                clicksLeft--;
                stormCharges = Math.max(0, stormCharges - 1);
                setStormArmed(false);
                updateHUD();
                try { playSfx('nanostorm'); } catch (e) { }
                playStormBurst(centerIndex, targets);
                const tracker = {
                    pops: 0,
                    positions: [],
                    finalized: false,
                    poppedSet: new Set(),
                    hitSet: new Set()
                };
                resetStormChainIndicator();
                // Center gets two hits; if the first hit pops it, the second hit does nothing on empty.
                try { handleClick(center, false, tracker, true); } catch (e) { }
                try { handleClick(center, false, tracker, true); } catch (e) { }
                for (let i = 0; i < targets.length; i++) {
                    if (targets[i] === center) continue;
                    try { handleClick(targets[i], false, tracker, true); } catch (e) { }
                }
                setTimeout(() => {
                    try {
                        tracker.finalized = true;
                        showChainBadge(tracker);
                    } catch (e) { }
                }, 2200);
                const afterStorm = () => {
                    stormResolving = false;
                    inputLocked = false;
                    if (clicksLeft <= 0) checkOutOfClicks();
                };
                try {
                    if (!particlesActive()) requestAnimationFrame(afterStorm);
                    else waitForParticlesThenShow(tracker, afterStorm);
                } catch (e) {
                    afterStorm();
                }
                return true;
            }



            // Safe event wiring: check nodes exist before attaching
            if (boardEl) {
                boardEl.addEventListener('pointerdown', (ev) => {
                    const c = ev.target.closest('.cell');
                    if (!c) return;
                    const i = Number(c.dataset.index);
                    if (stormArmed && stormCharges > 0) {
                        if (useNanoStorm(i)) return;
                    }
                    handleClick(i, true);
                });
                boardEl.addEventListener('pointermove', (ev) => {
                    if (!stormArmed) return;
                    const c = ev.target.closest('.cell');
                    if (!c) return;
                    const i = Number(c.dataset.index);
                    if (Number.isFinite(i)) applyStormPreview(i);
                });
                boardEl.addEventListener('pointerleave', () => {
                    stormHoverIndex = null;
                    clearStormPreview();
                });
            }
            if (stormBtn) {
                stormBtn.addEventListener('click', (ev) => {
                    ev.preventDefault();
                    if (stormCharges <= 0) return;
                    setStormArmed(!stormArmed);
                });
            }
            updateStormUI();

            const restartBtn = document.getElementById('restart');
            if (restartBtn) { restartBtn.addEventListener('click', () => { screensPassed = 0; totalScore = 0; randomizeBoard(false); }); }
            let startBtn = document.getElementById('startBtn');

            let sfxMuted = false;
            // The mute button lives after the script in the DOM, but DOMContentLoaded guarantees it exists now
            const muteBtn = document.getElementById('mute');
            if (muteBtn) { muteBtn.addEventListener('click', () => { sfxMuted = !sfxMuted; muteBtn.textContent = sfxMuted ? 'M' : 'M'; Object.values(sfxCache).forEach(a => { try { a.muted = sfxMuted; } catch (e) { } }); if (typeof musicAudio !== 'undefined' && musicAudio) try { musicAudio.muted = sfxMuted; } catch (e) { } }); }

            // --- START BUTTON: keep SVG intact and toggle state via class instead of overwriting content ---
            function setStartBtnPlaying(isPlaying) {
                try {
                    // prefer boolean
                    isPlaying = !!isPlaying;
                    // ensure startBtn exists
                    if (!startBtn) startBtn = document.getElementById('startBtn');
                    if (!startBtn) return;
                    // Toggle a class for styling; do not change innerHTML so SVG stays
                    startBtn.classList.toggle('playing', isPlaying);
                    // Keep an accessible label
                    startBtn.setAttribute('aria-pressed', String(isPlaying));
                    startBtn.setAttribute('title', isPlaying ? 'Stop music' : 'Start music');
                } catch (e) { /* ignore */ }
            }

            // initial state: prefer to show SVG, not text
            try {
                setStartBtnPlaying(!!(typeof musicAudio !== 'undefined' && musicAudio && !musicAudio.paused));
            } catch (e) { setStartBtnPlaying(false); }

            if (startBtn) {
                startBtn.addEventListener('click', async () => {
                    // Ensure SFX are primed (same as before)
                    Object.keys(SFX_URLS).forEach(k => { try { createSfx(k); } catch (e) { } });

                // helper: get the one canonical music audio instance (either local musicAudio or window.musicAudio)
                function _getMusicAudio() {
                    try {
                        if (typeof musicAudio !== 'undefined' && musicAudio) return musicAudio;
                        if (window.musicAudio) return window.musicAudio;
                        return null;
                    } catch (e) { return (window.musicAudio || null); }
                }

                const ma = _getMusicAudio();

                // If music is playing -> stop it
                if (ma && !ma.paused) {
                    try {
                        stopBackgroundMusic(); // will pause & clear both refs
                    } catch (e) { /* ignore */ }
                    setStartBtnPlaying(false);
                    return;
                }

                // Otherwise start music
                try {
                    startBackgroundMusic();
                    // set state to playing after a short delay; we check again for the canonical audio
                    setTimeout(() => {
                        const nowMa = _getMusicAudio();
                        setStartBtnPlaying(!!(nowMa && !nowMa.paused));
                    }, 60);
                } catch (e) {
                    console.warn('startBackgroundMusic failed', e);
                    setStartBtnPlaying(false);
                }
                });
            }



            // initialize clicks meter (10 segments) and ensure it updates with HUD
            createClicksMeter(10);
            updateClicksMeter(clicksLeft);

            randomizeBoard(false);

        }); // end DOMContentLoaded
    

