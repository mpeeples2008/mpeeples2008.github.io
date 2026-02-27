

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

        // Difficulty profile (single source of truth for balance tuning)
        // Edit `bands` to tune progression without touching gameplay logic.
        const DIFFICULTY_PROFILE = {
            defaults: {
                baseDensity: 0.60,
                densityGrowth: 0.0,
                sizeMixStart: [0.05, 0.20, 0.35, 0.40],
                sizeMixEven: [0.15, 0.25, 0.30, 0.30],
                sizeMixEnd: [0.32, 0.33, 0.23, 0.12],
                sizeMixLevelsToEven: 6,
                sizeMixLevelsToEnd: 12,
                stormRechargeChainMin: 21, // >20 pops in one chain
                stormNearThreshold: 16,
                specialVirusBaseChance: 0.05,
                specialVirusLevelBonus: 0.003,
                specialVirusMaxChance: 0.20,
                chainClickBonusStartPop: 3,
                chainClickBonusEvery: 2,
                chainScoreStep: 0.5,
                levelScoreScaleStep: 0.1,
                blockerUnlockLevel: 10,
                blockerTickMs: 1650,
                blockerTickJitterMs: 550,
                blockerPostUserTickMs: 700,
                blockerUserBoostWindowMs: 1300,
                blockerThicknessRatio: 0.010
            },
            bands: [
                {
                    minLevel: 1,
                    maxLevel: 3,
                    values: {
                        baseDensity: 0.58
                    }
                },
                {
                    minLevel: 4,
                    maxLevel: 8,
                    values: {
                        baseDensity: 0.60
                    }
                },
                {
                    minLevel: 9,
                    maxLevel: null,
                    values: {
                        baseDensity: 0.62,
                        specialVirusMaxChance: 0.24
                    }
                }
            ]
        };

        // Wrap everything that queries DOM in DOMContentLoaded so elements exist before we attach listeners
        document.addEventListener('DOMContentLoaded', () => {


            // initialize high score HUD
            try { highScoreEl = document.getElementById('highScoreValue'); if (highScoreEl) highScoreEl.textContent = String(highScore); } catch (e) { }
            // Full game script preserved from original with badge/confetti and 8-bit icons added
            const ROWS = 6, COLS = 6, MAX_SIZE = 3, MAX_CLICKS = 20;
            const FEATURE_FLAGS = window.GameFeatureFlags || { rotatingBlocker: true };
            window.GameFeatureFlags = FEATURE_FLAGS;

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
                blocker_move_1: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/evil1.mp3',
                nanostorm: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/nanostorm.mp3',
                blocker_move: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/evil2.mp3',
                achievement: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/achievement.mp3',
                assistant_ai_0: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI1.mp3',
                assistant_ai_1: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI2.mp3',
                assistant_ai_2: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI3.mp3',
                assistant_ai_3: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI4.mp3',
                assistant_ai_4: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI5.mp3',
                assistant_ai_5: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI6.mp3',
                assistant_ai_6: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI7.mp3'
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
            const AUDIO_PREF_MUSIC_ENABLED_KEY = 'goneViral_musicEnabled_v1';
            const AUDIO_PREF_SFX_ENABLED_KEY = 'goneViral_sfxEnabled_v1';
            const SFX_MIN_GAP_MS = {
                pop: 30,
                grow: 70,
                fill: 90,
                assistant_ai_0: 180,
                assistant_ai_1: 180,
                assistant_ai_2: 180,
                assistant_ai_3: 180,
                assistant_ai_4: 180,
                assistant_ai_5: 180,
                assistant_ai_6: 180,
                blocker_move_1: 140,
                nanostorm: 180,
                blocker_move: 140,
                win: 250,
                lose: 250,
                achievement: 220
            };
            const SFX_BURST_WINDOW_MS = 120;
            const SFX_BURST_MAX = 6;
            const SFX_VOLUME_MULTIPLIER = {
                blocker_move_1: 0.62
            };
            const SFX_CRITICAL_KEYS = ['pop', 'grow', 'fill'];
            const SFX_LAZY_KEYS = ['nanostorm', 'blocker_move', 'blocker_move_1', 'win', 'lose', 'achievement', 'assistant_ai_0', 'assistant_ai_1', 'assistant_ai_2', 'assistant_ai_3', 'assistant_ai_4', 'assistant_ai_5', 'assistant_ai_6'];
            const IMAGE_PREFETCH_MAX = 10;
            let audioUserInteracted = false;
            let audioWarmupStarted = false;
            let musicWasPlayingBeforeHide = false;
            const sfxLastPlayAt = Object.create(null);
            const sfxRecentPlays = [];
            const prefetchedImages = new Set();
            const prefetchingImages = new Set();
            let likelyPrefetchQueued = false;
            function loadAudioEnabledPref(key, fallback = true) {
                try {
                    const raw = localStorage.getItem(key);
                    if (raw == null) return !!fallback;
                    return raw !== 'false';
                } catch (e) {
                    return !!fallback;
                }
            }
            function saveAudioEnabledPref(key, val) {
                try { localStorage.setItem(key, val ? 'true' : 'false'); } catch (e) { }
            }
            let musicEnabled = loadAudioEnabledPref(AUDIO_PREF_MUSIC_ENABLED_KEY, true);
            let sfxEnabled = loadAudioEnabledPref(AUDIO_PREF_SFX_ENABLED_KEY, true);
            window.musicEnabled = musicEnabled;
            window.sfxEnabled = sfxEnabled;

            let sfxCache = {};
            window.sfxCache = sfxCache;
            let sfxAudioCtx = null;
            let sfxMasterGain = null;
            const sfxBufferCache = new Map();
            const sfxDecodeInFlight = new Map();
            const sfxActiveSources = new Set();
            const MAX_SFX_VOICES = 8;
            const HAS_WEB_AUDIO = typeof window !== 'undefined' && !!(window.AudioContext || window.webkitAudioContext);
            function createSfx(key) { const url = SFX_URLS[key]; if (!url) return null; try { const a = new Audio(url); a.preload = 'auto'; a.volume = 0.5; a.crossOrigin = 'anonymous'; sfxCache[key] = a; return a; } catch (e) { return null; } }
            function getSfx(key) { return sfxCache[key] || createSfx(key); }
            function ensureSfxAudioContext() {
                if (!HAS_WEB_AUDIO) return null;
                if (sfxAudioCtx) return sfxAudioCtx;
                try {
                    const Ctx = window.AudioContext || window.webkitAudioContext;
                    sfxAudioCtx = new Ctx({ latencyHint: 'interactive' });
                    sfxMasterGain = sfxAudioCtx.createGain();
                    sfxMasterGain.gain.value = 1;
                    sfxMasterGain.connect(sfxAudioCtx.destination);
                    window.sfxAudioContext = sfxAudioCtx;
                } catch (e) {
                    sfxAudioCtx = null;
                    sfxMasterGain = null;
                }
                return sfxAudioCtx;
            }
            function getSfxOutputGain() {
                if (!sfxMasterGain) return null;
                const vol = Math.max(0, Math.min(1, Number(window.sfxVolume ?? 0.5) || 0));
                const enabled = !!sfxEnabled && !window.allMuted;
                return enabled ? vol : 0;
            }
            function syncSfxEngineGain() {
                try {
                    if (!sfxMasterGain || !sfxAudioCtx) return;
                    const target = getSfxOutputGain();
                    const now = sfxAudioCtx.currentTime || 0;
                    sfxMasterGain.gain.cancelScheduledValues(now);
                    sfxMasterGain.gain.setTargetAtTime(target, now, 0.01);
                } catch (e) { }
            }
            async function loadSfxBuffer(key) {
                if (!HAS_WEB_AUDIO) return null;
                const url = SFX_URLS[key];
                if (!url) return null;
                if (sfxBufferCache.has(key)) return sfxBufferCache.get(key);
                if (sfxDecodeInFlight.has(key)) return sfxDecodeInFlight.get(key);
                const ctx = ensureSfxAudioContext();
                if (!ctx) return null;
                const promise = fetch(url, { mode: 'cors', cache: 'force-cache' })
                    .then((res) => res.arrayBuffer())
                    .then((buf) => new Promise((resolve, reject) => {
                        try {
                            ctx.decodeAudioData(buf, resolve, reject);
                        } catch (e) {
                            reject(e);
                        }
                    }))
                    .then((decoded) => {
                        sfxBufferCache.set(key, decoded);
                        return decoded;
                    })
                    .catch(() => null)
                    .finally(() => sfxDecodeInFlight.delete(key));
                sfxDecodeInFlight.set(key, promise);
                return promise;
            }
            function playSfxFromBuffer(buffer, gainMult = 1) {
                try {
                    const ctx = ensureSfxAudioContext();
                    if (!ctx || !buffer || !sfxMasterGain) return false;
                    if (sfxActiveSources.size >= MAX_SFX_VOICES) {
                        const oldest = sfxActiveSources.values().next();
                        if (oldest && oldest.value) {
                            try { oldest.value.stop(); } catch (e) { }
                        }
                    }
                    const src = ctx.createBufferSource();
                    src.buffer = buffer;
                    const voiceGain = ctx.createGain();
                    voiceGain.gain.value = Math.max(0, Math.min(1, Number(gainMult) || 1));
                    src.connect(voiceGain);
                    voiceGain.connect(sfxMasterGain);
                    sfxActiveSources.add(src);
                    src.onended = () => {
                        try { sfxActiveSources.delete(src); } catch (e) { }
                    };
                    src.start(0);
                    return true;
                } catch (e) {
                    return false;
                }
            }
            function preloadSfxKeys(keys) {
                try {
                    (keys || []).forEach((key) => {
                        if (HAS_WEB_AUDIO) {
                            loadSfxBuffer(key).catch(() => { });
                            return;
                        }
                        const a = getSfx(key);
                        if (!a) return;
                        try { a.preload = 'auto'; } catch (e) { }
                        try { a.load(); } catch (e) { }
                    });
                } catch (e) { }
            }
            function startAudioWarmup() {
                if (audioWarmupStarted) return;
                audioWarmupStarted = true;
                if (HAS_WEB_AUDIO) ensureSfxAudioContext();
                preloadSfxKeys(SFX_CRITICAL_KEYS);
                const lazyWarmup = () => preloadSfxKeys(SFX_LAZY_KEYS);
                try {
                    if (typeof window.requestIdleCallback === 'function') {
                        window.requestIdleCallback(lazyWarmup, { timeout: 1500 });
                    } else {
                        setTimeout(lazyWarmup, 900);
                    }
                } catch (e) {
                    setTimeout(lazyWarmup, 900);
                }
            }
            function prefetchImageUrl(url) {
                const u = String(url || '');
                if (!u || prefetchedImages.has(u) || prefetchingImages.has(u)) return;
                if (prefetchedImages.size >= IMAGE_PREFETCH_MAX) return;
                prefetchingImages.add(u);
                try {
                    const img = new Image();
                    img.decoding = 'async';
                    img.loading = 'eager';
                    img.referrerPolicy = 'no-referrer';
                    img.onload = img.onerror = function () {
                        prefetchingImages.delete(u);
                        prefetchedImages.add(u);
                    };
                    img.src = u;
                } catch (e) {
                    prefetchingImages.delete(u);
                }
            }
            function buildLikelyAssetManifest(levelNum = getCurrentLevelNumber()) {
                const level = Math.max(1, Number(levelNum) || 1);
                const images = [];
                const sfx = ['pop', 'grow', 'fill'];
                if (Array.isArray(levelCompleteImages) && levelCompleteImages.length) {
                    const base = ((level - 1) * 2) % levelCompleteImages.length;
                    images.push(levelCompleteImages[base]);
                    images.push(levelCompleteImages[(base + 1) % levelCompleteImages.length]);
                }
                if (PETRI_URL) images.push(PETRI_URL);
                if (typeof PARTICLE_SPRITE !== 'undefined' && PARTICLE_SPRITE) images.push(PARTICLE_SPRITE);
                if (level <= 4) {
                    images.push(SPRITE_URLS[3], SPRITE_URLS[2]);
                } else if (level <= 9) {
                    images.push(SPRITE_URLS[2], SPRITE_URLS[1]);
                } else {
                    images.push(SPRITE_URLS[1], SPRITE_URLS[0]);
                }
                if (level >= 2) sfx.push('assistant_ai_' + (level % 7));
                if (level >= 4) sfx.push('nanostorm');
                if (level >= 10) sfx.push('blocker_move', 'blocker_move_1');
                if ((level % 3) === 0) sfx.push('win');
                if ((level % 4) === 0) sfx.push('lose');
                return {
                    images: Array.from(new Set(images.filter(Boolean))).slice(0, 6),
                    sfxKeys: Array.from(new Set(sfx)).slice(0, 6)
                };
            }
            function prefetchLikelyAssets(levelNum = getCurrentLevelNumber(), reason = 'generic') {
                if (!audioUserInteracted) return;
                const manifest = buildLikelyAssetManifest(levelNum);
                try { preloadSfxKeys(manifest.sfxKeys || []); } catch (e) { }
                try { (manifest.images || []).forEach((u) => prefetchImageUrl(u)); } catch (e) { }
            }
            function queueLikelyAssetPrefetch(levelNum = getCurrentLevelNumber(), reason = 'generic') {
                if (likelyPrefetchQueued) return;
                likelyPrefetchQueued = true;
                const run = () => {
                    likelyPrefetchQueued = false;
                    prefetchLikelyAssets(levelNum, reason);
                };
                try {
                    if (typeof window.requestIdleCallback === 'function') {
                        window.requestIdleCallback(run, { timeout: 1000 });
                    } else {
                        setTimeout(run, 220);
                    }
                } catch (e) {
                    setTimeout(run, 220);
                }
            }
            function canPlaySfxNow(key) {
                const now = Date.now();
                while (sfxRecentPlays.length && (now - sfxRecentPlays[0]) > SFX_BURST_WINDOW_MS) {
                    sfxRecentPlays.shift();
                }
                if (sfxRecentPlays.length >= SFX_BURST_MAX) return false;
                const minGap = SFX_MIN_GAP_MS[key] ?? 60;
                const last = sfxLastPlayAt[key] || 0;
                if ((now - last) < minGap) return false;
                sfxLastPlayAt[key] = now;
                sfxRecentPlays.push(now);
                return true;
            }
            function playSfx(key) {
                if (!sfxEnabled) return;
                try { if (window.allMuted) return; } catch (e) { }
                if (!canPlaySfxNow(key)) return;
                const gainMult = Math.max(0, Number(SFX_VOLUME_MULTIPLIER[key] ?? 1) || 1);
                try {
                    if (HAS_WEB_AUDIO) {
                        const ctx = ensureSfxAudioContext();
                        if (ctx && ctx.state === 'suspended' && audioUserInteracted) {
                            ctx.resume().catch(() => { });
                        }
                        syncSfxEngineGain();
                        const cached = sfxBufferCache.get(key);
                        if (cached && playSfxFromBuffer(cached, gainMult)) return;
                        loadSfxBuffer(key).catch(() => { });
                        const fallback = getSfx(key);
                        if (!fallback) return;
                        fallback.currentTime = 0;
                        fallback.volume = Math.max(0, Math.min(1, (Number(window.sfxVolume) || fallback.volume || 0.5) * gainMult));
                        fallback.muted = !!window.allMuted;
                        const p = fallback.play();
                        if (p && p.catch) p.catch(() => { });
                        return;
                    }
                    const a = getSfx(key);
                    if (!a) return;
                    a.currentTime = 0;
                    a.volume = Math.max(0, Math.min(1, (Number(window.sfxVolume) || a.volume || 0.5) * gainMult));
                    const p = a.play();
                    if (p && p.catch) p.catch(() => { });
                } catch (e) { }
            }
            try {
                window.playSfx = playSfx;
                window.preloadSfxKeys = preloadSfxKeys;
                window.prefetchLikelyAssets = prefetchLikelyAssets;
            } catch (e) { }

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
                    sSlider.addEventListener('input', function () {
                        try { syncSfxEngineGain(); } catch (e) { }
                    }, { passive: true });
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
                    unlockLevel: 4,
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
                window.DifficultyProfile = DIFFICULTY_PROFILE;
                window.getDifficultyForLevel = getDifficultyForLevel;
                window.getCurrentDifficulty = getCurrentDifficulty;
                window.setRotatingBlockerEnabled = function (enabled) {
                    FEATURE_FLAGS.rotatingBlocker = !!enabled;
                    try { scheduleRender(); } catch (e) { }
                    if (!FEATURE_FLAGS.rotatingBlocker) {
                        try { stopRotatingBlockerTicker(); } catch (e) { }
                    } else {
                        try { syncRotatingBlockerUI(); } catch (e) { }
                    }
                    return FEATURE_FLAGS.rotatingBlocker;
                };
                window.setLevel = function (levelNum) {
                    const targetLevel = Math.max(1, Math.floor(Number(levelNum) || 1));
                    screensPassed = targetLevel - 1;
                    try {
                        const levelPopup = document.querySelector('.level-complete');
                        if (levelPopup) levelPopup.remove();
                    } catch (e) { }
                    try {
                        const gameOverPopup = document.querySelector('.game-over-popup');
                        if (gameOverPopup) gameOverPopup.remove();
                    } catch (e) { }
                    try { inputLocked = false; } catch (e) { }
                    try { randomizeBoard(false); } catch (e) { }
                    try { syncRotatingBlockerUI(); } catch (e) { }
                    return { level: targetLevel, blockerActive: isRotatingBlockerActive(targetLevel) };
                };
                window.getLevel = function () {
                    return getCurrentLevelNumber();
                };
            } catch (e) { }
            let blockerOrientationDeg = 0; // only 0 or 90
            let blockerLaneIndex = 2; // boundary between rows/cols (0-based lane index)
            let blockerTickTimer = null;
            let blockerFlashTimeout = null;
            let blockerUserBoostUntil = 0;
            let stormCharges = 1;
            let stormArmed = false;
            let stormHoverIndex = null;
            let stormResolving = false;
            let stormChainPops = 0;
            let stormChainResetTimer = null;
            let stormChargeFlashTimer = null;
            let comboInsurance = 0;
            const COMBO_INSURANCE_CAP = 1;
            const COMBO_INSURANCE_CHAIN_START = 15;
            let mobileStormPressTimer = null;
            let mobileStormHoldActive = false;
            let mobileStormPointerId = null;
            let mobileStormCandidateIndex = null;
            const MOBILE_STORM_HOLD_MS = 120;
            let boardGeneration = 0;
            let gameOverVignetteEl = null;
            let gameOverMusicRestoreTimer = null;
            let gameOverPrevMusicVolume = null;
            let specialTelegraphIndex = null;
            const ACHIEVEMENT_STORAGE_KEY = 'goneViral_achievements_v1';
            const ACHIEVEMENT_SCHEMA_VERSION = 1;
            const ACHIEVEMENT_DEFS = [
                { id: 'run_pop_1000', title: 'Viral Exterminator', description: 'Pop 250 viruses in one run.', stat: 'runPops', target: 250, scope: 'run' },
                { id: 'run_level_5', title: 'Containment I', description: 'Reach level 5 in one run.', stat: 'runLevelReached', target: 5, scope: 'run' },
                { id: 'run_level_10', title: 'Containment II', description: 'Reach level 10 in one run.', stat: 'runLevelReached', target: 10, scope: 'run' },
                { id: 'run_level_15', title: 'Containment III', description: 'Reach level 15 in one run.', stat: 'runLevelReached', target: 15, scope: 'run' },
                { id: 'run_shell_breaker_10', title: 'Shell Breaker', description: 'Break 10 armored shells in one run.', stat: 'runArmoredShellsBroken', target: 10, scope: 'run' },
                { id: 'run_chain_20', title: 'Chain Master', description: 'Reach a 20+ chain in one run.', stat: 'runBestChain', target: 20, scope: 'run' },
                { id: 'run_storm_3', title: 'Storm Caller', description: 'Use Nano Storm 3 times in one run.', stat: 'runNanoStormUses', target: 3, scope: 'run' },
                { id: 'run_clutch_clear', title: 'Clutch Clear', description: 'Clear any level with 1 click left.', stat: 'runClutchClears', target: 1, scope: 'run' },
                { id: 'life_pop_10000', title: 'Pandemic Cleaner', description: 'Pop 2,000 viruses across runs.', stat: 'totalPopsLifetime', target: 2000, scope: 'lifetime' },
                { id: 'life_chain20_x10', title: 'Combo Veteran', description: 'Record 25 chains of 20+ across runs.', stat: 'chain20LifetimeCount', target: 25, scope: 'lifetime' },
                { id: 'life_shells_250', title: 'Armored Nemesis', description: 'Break 100 armored viruses across runs.', stat: 'armoredShellsLifetime', target: 100, scope: 'lifetime' },
                { id: 'life_levels_100', title: 'Long-Term Operator', description: 'Clear 100 levels across runs.', stat: 'levelsClearedLifetime', target: 100, scope: 'lifetime' }
            ];
            let achievementSaveTimer = null;
            let achievementUiQueued = false;
            const achievementToastQueue = [];
            let achievementToastActive = false;
            let runUnlockedAchievementIds = new Set();
            const TUTORIAL_MODE_KEY = 'goneViral_tutorialMode_v1';
            const TUTORIAL_SEEN_KEY = 'goneViral_tutorialSeen_v1';
            const TUTORIAL_MODES = { full: 'full', minimal: 'minimal', off: 'off' };
            let tutorialMode = TUTORIAL_MODES.full;
            let tutorialRunState = { introShownThisRun: false };
            let tutorialGateState = { startPressed: false, briefingAcknowledged: false };

            function createDefaultTutorialSeen() {
                return {
                    firstTap: false,
                    firstChain: false,
                    firstLevelClear: false,
                    firstStormReady: false,
                    firstStormUse: false,
                    firstArmoredSeen: false
                };
            }

            let tutorialSeen = createDefaultTutorialSeen();

            function loadTutorialMode() {
                try {
                    const raw = String(localStorage.getItem(TUTORIAL_MODE_KEY) || '').toLowerCase();
                    if (raw === TUTORIAL_MODES.minimal || raw === TUTORIAL_MODES.off || raw === TUTORIAL_MODES.full) return raw;
                } catch (e) { }
                return TUTORIAL_MODES.full;
            }

            function saveTutorialMode() {
                try { localStorage.setItem(TUTORIAL_MODE_KEY, tutorialMode); } catch (e) { }
            }

            function loadTutorialSeen() {
                const base = createDefaultTutorialSeen();
                try {
                    const raw = localStorage.getItem(TUTORIAL_SEEN_KEY);
                    if (!raw) return base;
                    const parsed = JSON.parse(raw);
                    if (!parsed || typeof parsed !== 'object') return base;
                    Object.keys(base).forEach((k) => { base[k] = !!parsed[k]; });
                    return base;
                } catch (e) {
                    return base;
                }
            }

            function saveTutorialSeen() {
                try { localStorage.setItem(TUTORIAL_SEEN_KEY, JSON.stringify(tutorialSeen)); } catch (e) { }
            }

            function tutorialVoiceEnabled() {
                try {
                    if (tutorialMode === TUTORIAL_MODES.off) return false;
                    if (window.assistantMuted) return false;
                    if (document.body && document.body.classList.contains('assistant-disabled')) return false;
                    return !!(window.Assistant && typeof Assistant.show === 'function');
                } catch (e) {
                    return false;
                }
            }

            function isTutorialGateReady() {
                return !!(tutorialGateState.startPressed && tutorialGateState.briefingAcknowledged);
            }

            function syncTutorialGateFromDom() {
                try {
                    const startBtn = document.getElementById('aiStartBtn');
                    const closeBtn = document.getElementById('startModalClose');
                    if (!startBtn) tutorialGateState.startPressed = true;
                    if (!closeBtn) tutorialGateState.briefingAcknowledged = true;
                } catch (e) { }
            }

            function tutorialSay(text, opts = {}) {
                if (!tutorialVoiceEnabled()) return false;
                try {
                    Assistant.show(String(text || ''), {
                        priority: Number.isFinite(opts.priority) ? opts.priority : 2,
                        sticky: !!opts.sticky
                    });
                    return true;
                } catch (e) {
                    return false;
                }
            }

            function markTutorialSeen(key) {
                if (!key || tutorialSeen[key]) return false;
                tutorialSeen[key] = true;
                saveTutorialSeen();
                return true;
            }

            function maybeShowTutorialIntro(force = false) {
                if (!force && !isTutorialGateReady()) return;
                if (!force) {
                    if (tutorialMode !== TUTORIAL_MODES.full) return;
                    if (tutorialSeen.firstTap) return;
                    if (tutorialRunState.introShownThisRun) return;
                }
                if (tutorialSay('PIXEL tip: tap a virus to grow it. Overgrown viruses pop and can chain into neighbors.', { priority: 3, sticky: true })) {
                    tutorialRunState.introShownThisRun = true;
                }
            }

            function tutorialEvent(key) {
                if (!key || tutorialMode === TUTORIAL_MODES.off) return;
                if (!isTutorialGateReady()) return;
                if (tutorialSeen[key]) return;
                const isMinimal = tutorialMode === TUTORIAL_MODES.minimal;
                let line = '';
                let sticky = false;
                if (key === 'firstTap') {
                    line = 'Great start. Build chains to clear faster and earn extra nano-bots.';
                    sticky = true;
                } else if (key === 'firstChain') {
                    if (isMinimal) return;
                    line = 'Nice chain. Longer chains are the safest way to recover clicks.';
                } else if (key === 'firstLevelClear') {
                    line = 'Level clear. You gain a click between levels, so efficiency matters.';
                } else if (key === 'firstStormReady') {
                    line = 'Nano Storm ready. Tap the battery button, then tap a target virus.';
                    sticky = true;
                } else if (key === 'firstStormUse') {
                    if (isMinimal) return;
                    line = 'Storm used. Save it for crowded clusters or armored pressure turns.';
                } else if (key === 'firstArmoredSeen') {
                    line = 'New threat: armored virus. The shell blocks one growth hit before breaking.';
                    sticky = true;
                } else {
                    return;
                }
                if (tutorialSay(line, { priority: 3, sticky: sticky })) {
                    markTutorialSeen(key);
                }
            }

            function replayTutorialNow() {
                tutorialSeen = createDefaultTutorialSeen();
                saveTutorialSeen();
                tutorialRunState.introShownThisRun = false;
                if (tutorialMode === TUTORIAL_MODES.off) {
                    tutorialMode = TUTORIAL_MODES.minimal;
                    saveTutorialMode();
                }
                syncTutorialControls();
                maybeShowTutorialIntro(true);
            }

            function createDefaultAchievementState() {
                const stats = {};
                for (let i = 0; i < ACHIEVEMENT_DEFS.length; i++) {
                    if ((ACHIEVEMENT_DEFS[i].scope || 'lifetime') === 'run') continue;
                    const statKey = String(ACHIEVEMENT_DEFS[i].stat || '');
                    if (statKey && !Object.prototype.hasOwnProperty.call(stats, statKey)) stats[statKey] = 0;
                }
                return {
                    version: ACHIEVEMENT_SCHEMA_VERSION,
                    stats,
                    unlocked: {}
                };
            }

            function sanitizeAchievementState(raw) {
                const base = createDefaultAchievementState();
                if (!raw || typeof raw !== 'object') return base;
                const rawStats = (raw.stats && typeof raw.stats === 'object') ? raw.stats : {};
                Object.keys(base.stats).forEach((key) => {
                    const n = Number(rawStats[key]);
                    base.stats[key] = (Number.isFinite(n) && n > 0) ? n : 0;
                });
                const rawUnlocked = (raw.unlocked && typeof raw.unlocked === 'object') ? raw.unlocked : {};
                for (let i = 0; i < ACHIEVEMENT_DEFS.length; i++) {
                    const id = ACHIEVEMENT_DEFS[i].id;
                    base.unlocked[id] = !!rawUnlocked[id];
                }
                return base;
            }

            function createDefaultRunAchievementStats() {
                const stats = {};
                for (let i = 0; i < ACHIEVEMENT_DEFS.length; i++) {
                    if ((ACHIEVEMENT_DEFS[i].scope || 'lifetime') !== 'run') continue;
                    const statKey = String(ACHIEVEMENT_DEFS[i].stat || '');
                    if (statKey && !Object.prototype.hasOwnProperty.call(stats, statKey)) stats[statKey] = 0;
                }
                return stats;
            }

            function resetRunAchievementStats(levelNum = 1) {
                runAchievementStats = createDefaultRunAchievementStats();
                if (Object.prototype.hasOwnProperty.call(runAchievementStats, 'runLevelReached')) {
                    runAchievementStats.runLevelReached = Math.max(1, Number(levelNum) || 1);
                }
                runUnlockedAchievementIds = new Set();
                scheduleAchievementsUIRender();
            }

            function loadAchievementState() {
                try {
                    const raw = localStorage.getItem(ACHIEVEMENT_STORAGE_KEY);
                    if (!raw) return createDefaultAchievementState();
                    return sanitizeAchievementState(JSON.parse(raw));
                } catch (e) {
                    return createDefaultAchievementState();
                }
            }

            let achievementState = loadAchievementState();
            let runAchievementStats = createDefaultRunAchievementStats();
            if (Object.prototype.hasOwnProperty.call(runAchievementStats, 'runLevelReached')) {
                runAchievementStats.runLevelReached = 1;
            }
            tutorialMode = loadTutorialMode();
            tutorialSeen = loadTutorialSeen();

            function saveAchievementStateNow() {
                try {
                    localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify({
                        version: ACHIEVEMENT_SCHEMA_VERSION,
                        stats: achievementState.stats,
                        unlocked: achievementState.unlocked
                    }));
                } catch (e) { }
            }

            function scheduleAchievementSave(delayMs = 120) {
                try { if (achievementSaveTimer) clearTimeout(achievementSaveTimer); } catch (e) { }
                achievementSaveTimer = setTimeout(() => {
                    achievementSaveTimer = null;
                    saveAchievementStateNow();
                }, Math.max(0, Number(delayMs) || 0));
            }

            function getAchievementProgress(def) {
                const scope = def.scope || 'lifetime';
                const sourceStats = (scope === 'run') ? runAchievementStats : achievementState.stats;
                const current = Math.max(0, Number(sourceStats[def.stat]) || 0);
                const target = Math.max(1, Number(def.target) || 1);
                const done = current >= target;
                const ratio = Math.max(0, Math.min(1, current / target));
                return { current, target, done, ratio };
            }

            function countUnlockedAchievements() {
                let unlocked = 0;
                for (let i = 0; i < ACHIEVEMENT_DEFS.length; i++) {
                    if (achievementState.unlocked[ACHIEVEMENT_DEFS[i].id]) unlocked++;
                }
                return unlocked;
            }

            function getAchievementDefById(id) {
                const key = String(id || '');
                if (!key) return null;
                for (let i = 0; i < ACHIEVEMENT_DEFS.length; i++) {
                    if (ACHIEVEMENT_DEFS[i].id === key) return ACHIEVEMENT_DEFS[i];
                }
                return null;
            }

            function showNextAchievementToast() {
                if (!achievementToastQueue.length) {
                    achievementToastActive = false;
                    return;
                }
                achievementToastActive = true;
                const payload = achievementToastQueue.shift() || {};
                const title = String(payload.title || 'Achievement Unlocked');
                const description = String(payload.description || '');
                const el = document.createElement('div');
                el.className = 'achievement-unlock-toast';
                el.setAttribute('role', 'status');
                el.setAttribute('aria-live', 'polite');
                el.innerHTML = `
                    <div class="a-head">Achievement Unlocked</div>
                    <div class="a-title">${escapeHtml(title)}</div>
                    <div class="a-desc">${escapeHtml(description)}</div>
                `;
                document.body.appendChild(el);
                try { playSfx('achievement'); } catch (e) { try { playSfx('fill'); } catch (e2) { } }
                requestAnimationFrame(() => {
                    try { el.classList.add('show'); } catch (e) { }
                });
                const close = () => {
                    try { if (el && el.parentNode) el.parentNode.removeChild(el); } catch (e) { }
                    achievementToastActive = false;
                    showNextAchievementToast();
                };
                setTimeout(() => {
                    try {
                        el.classList.remove('show');
                        el.classList.add('hide');
                        setTimeout(close, 260);
                    } catch (e) {
                        close();
                    }
                }, 2000);
            }

            function queueAchievementUnlockFeedback(payload) {
                achievementToastQueue.push(payload || {});
                if (!achievementToastActive) showNextAchievementToast();
            }

            function emitAchievementUnlocked(def, progress) {
                try {
                    window.dispatchEvent(new CustomEvent('goneviral:achievement-unlocked', {
                        detail: {
                            id: def.id,
                            title: def.title,
                            description: def.description,
                            current: progress.current,
                            target: progress.target
                        }
                    }));
                } catch (e) { }
                try { runUnlockedAchievementIds.add(def.id); } catch (e) { }
                queueAchievementUnlockFeedback({
                    id: def.id,
                    title: def.title,
                    description: def.description
                });
            }

            function evaluateAchievements(opts = {}) {
                const emitUnlock = opts.emitUnlock !== false;
                let changed = false;
                for (let i = 0; i < ACHIEVEMENT_DEFS.length; i++) {
                    const def = ACHIEVEMENT_DEFS[i];
                    const progress = getAchievementProgress(def);
                    const prev = !!achievementState.unlocked[def.id];
                    if (!prev && progress.done) {
                        achievementState.unlocked[def.id] = true;
                        changed = true;
                        if (emitUnlock) emitAchievementUnlocked(def, progress);
                    }
                }
                if (changed) scheduleAchievementSave();
                scheduleAchievementsUIRender();
            }

            function ensureAchievementsPanel() {
                const host = document.getElementById('achievementsTabPane') || document.getElementById('audioPopup');
                if (!host) return null;
                let panel = document.getElementById('achievementsPanel');
                if (panel) return panel;
                panel = document.createElement('section');
                panel.id = 'achievementsPanel';
                panel.className = 'achievements-panel';
                panel.innerHTML = `
                    <div class="achievements-head">
                        <div class="achievements-title">Achievements</div>
                        <div id="achievementSummary" class="achievements-summary">0/0</div>
                    </div>
                    <div id="achievementList" class="achievement-list"></div>
                `;
                host.appendChild(panel);
                return panel;
            }

            function renderAchievementsUI() {
                const panel = ensureAchievementsPanel();
                if (!panel) return;
                const list = document.getElementById('achievementList');
                const summary = document.getElementById('achievementSummary');
                if (!list || !summary) return;
                const unlockedCount = countUnlockedAchievements();
                summary.textContent = unlockedCount + '/' + ACHIEVEMENT_DEFS.length + ' unlocked';
                const html = ACHIEVEMENT_DEFS.map((def) => {
                    const p = getAchievementProgress(def);
                    const unlocked = !!achievementState.unlocked[def.id];
                    const done = unlocked || p.done;
                    const shown = done ? p.target : Math.min(p.current, p.target);
                    return `
                        <div class="achievement-item ${done ? 'done' : ''}" data-achievement-id="${def.id}">
                            <div class="achievement-row">
                                <div class="achievement-name">${def.title}</div>
                                <div class="achievement-count">${shown}/${p.target}</div>
                            </div>
                            <div class="achievement-desc">${def.description}</div>
                            <div class="achievement-track"><span style="transform:scaleX(${done ? 1 : p.ratio});"></span></div>
                        </div>
                    `;
                }).join('');
                list.innerHTML = html;
            }

            function scheduleAchievementsUIRender() {
                if (achievementUiQueued) return;
                achievementUiQueued = true;
                const run = () => {
                    achievementUiQueued = false;
                    renderAchievementsUI();
                };
                if (typeof requestAnimationFrame === 'function') requestAnimationFrame(run);
                else setTimeout(run, 0);
            }

            function incrementAchievementStat(statKey, amount = 1, scope = 'lifetime') {
                const key = String(statKey || '');
                if (!key) return;
                const inc = Number(amount);
                if (!Number.isFinite(inc) || inc <= 0) return;
                const stats = (scope === 'run') ? runAchievementStats : achievementState.stats;
                const prev = Math.max(0, Number(stats[key]) || 0);
                stats[key] = prev + inc;
                if (scope !== 'run') scheduleAchievementSave();
                evaluateAchievements();
            }

            function setAchievementBest(statKey, candidate, scope = 'lifetime') {
                const key = String(statKey || '');
                if (!key) return;
                const val = Math.max(0, Number(candidate) || 0);
                const stats = (scope === 'run') ? runAchievementStats : achievementState.stats;
                const prev = Math.max(0, Number(stats[key]) || 0);
                if (val <= prev) return;
                stats[key] = val;
                if (scope !== 'run') scheduleAchievementSave();
                evaluateAchievements();
            }

            try {
                window.AchievementDefs = ACHIEVEMENT_DEFS.slice();
                window.Achievements = {
                    defs: ACHIEVEMENT_DEFS.slice(),
                    getState: function () {
                        return JSON.parse(JSON.stringify({
                            stats: achievementState.stats,
                            lifetimeStats: achievementState.stats,
                            runStats: runAchievementStats,
                            unlocked: achievementState.unlocked
                        }));
                    },
                    add: function (statKey, amount = 1, scope = 'lifetime') {
                        incrementAchievementStat(statKey, amount, scope);
                        return this.getState();
                    },
                    setBest: function (statKey, value, scope = 'lifetime') {
                        setAchievementBest(statKey, value, scope);
                        return this.getState();
                    },
                    reset: function () {
                        achievementState = createDefaultAchievementState();
                        resetRunAchievementStats(getCurrentLevelNumber());
                        evaluateAchievements({ emitUnlock: false });
                        scheduleAchievementSave(0);
                        return this.getState();
                    },
                    resetRun: function () {
                        resetRunAchievementStats(getCurrentLevelNumber());
                        evaluateAchievements({ emitUnlock: false });
                        return this.getState();
                    },
                    render: function () {
                        scheduleAchievementsUIRender();
                    }
                };
                window.resetAchievements = function () {
                    if (window.Achievements && typeof window.Achievements.reset === 'function') {
                        return window.Achievements.reset();
                    }
                    return null;
                };
                window.resetRunAchievements = function () {
                    if (window.Achievements && typeof window.Achievements.resetRun === 'function') {
                        return window.Achievements.resetRun();
                    }
                    return null;
                };
            } catch (e) { }

            // Move DOM element lookups inside DOMContentLoaded
            const boardEl = document.getElementById('board');
            const clicksEl = document.getElementById('clicks');
            const screensEl = document.getElementById('screens');
            const scoreEl = document.getElementById('score');
            const stormBtn = document.getElementById('stormBtn');
            const aiStartBtn = document.getElementById('aiStartBtn');
            const startModalCloseBtn = document.getElementById('startModalClose');
            syncTutorialGateFromDom();
            if (aiStartBtn) {
                aiStartBtn.addEventListener('click', () => {
                    markAudioUserInteracted();
                    tutorialGateState.startPressed = true;
                });
            }
            if (startModalCloseBtn) {
                startModalCloseBtn.addEventListener('click', () => {
                    tutorialGateState.briefingAcknowledged = true;
                    maybeShowTutorialIntro(false);
                });
            }
            try {
                const onFirstInteraction = () => {
                    markAudioUserInteracted();
                    document.removeEventListener('pointerdown', onFirstInteraction, true);
                    document.removeEventListener('keydown', onFirstInteraction, true);
                };
                document.addEventListener('pointerdown', onFirstInteraction, { capture: true, passive: true });
                document.addEventListener('keydown', onFirstInteraction, { capture: true });
                document.addEventListener('visibilitychange', handleVisibilityAudioState, { passive: true });
            } catch (e) { }


            // High-score persistence (localStorage)
            const highScoreKey = 'goneViral_highScore';
            let highScore = Number(localStorage.getItem(highScoreKey) || 0);
            let highScoreEl = null;

            function markAudioUserInteracted() {
                const wasInteracted = audioUserInteracted;
                audioUserInteracted = true;
                if (!wasInteracted) {
                    startAudioWarmup();
                    queueLikelyAssetPrefetch(getCurrentLevelNumber(), 'first-interaction');
                }
                try {
                    if (HAS_WEB_AUDIO) {
                        const ctx = ensureSfxAudioContext();
                        if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => { });
                        syncSfxEngineGain();
                    }
                } catch (e) { }
                if (!wasInteracted && musicEnabled) {
                    try {
                        const hasMusic = !!(musicAudio || window.musicAudio);
                        if (!hasMusic) startBackgroundMusic();
                    } catch (e) { }
                }
            }

            function handleVisibilityAudioState() {
                try {
                    const ma = getActiveMusicAudio();
                    if (document.hidden) {
                        musicWasPlayingBeforeHide = !!(ma && !ma.paused);
                        if (musicWasPlayingBeforeHide && ma) ma.pause();
                        if (sfxAudioCtx && sfxAudioCtx.state === 'running') {
                            sfxAudioCtx.suspend().catch(() => { });
                        }
                        try { stopRotatingBlockerTicker(); } catch (e) { }
                        return;
                    }
                    if (sfxAudioCtx && sfxAudioCtx.state === 'suspended' && audioUserInteracted) {
                        sfxAudioCtx.resume().catch(() => { });
                    }
                    syncSfxEngineGain();
                    try { syncRotatingBlockerUI(); } catch (e) { }
                    if (!musicWasPlayingBeforeHide) return;
                    musicWasPlayingBeforeHide = false;
                    if (!musicEnabled || !!window.allMuted || !audioUserInteracted) return;
                    const resumeTarget = getActiveMusicAudio();
                    if (resumeTarget) {
                        const p = resumeTarget.play();
                        if (p && p.catch) p.catch(() => { });
                    } else {
                        startBackgroundMusic();
                    }
                } catch (e) { }
            }

            function syncAudioSettingsUI() {
                const musicToggle = document.getElementById('musicEnabledToggle');
                const sfxToggle = document.getElementById('sfxEnabledToggle');
                const musicSlider = document.getElementById('musicVol');
                const sfxSlider = document.getElementById('sfxVol');
                if (musicToggle) musicToggle.checked = !!musicEnabled;
                if (sfxToggle) sfxToggle.checked = !!sfxEnabled;
                if (musicSlider) musicSlider.disabled = !musicEnabled;
                if (sfxSlider) sfxSlider.disabled = !sfxEnabled;
            }

            function applyMusicEnabledState(fromUserAction = false) {
                window.musicEnabled = !!musicEnabled;
                saveAudioEnabledPref(AUDIO_PREF_MUSIC_ENABLED_KEY, !!musicEnabled);
                if (!musicEnabled) {
                    musicWasPlayingBeforeHide = false;
                    stopBackgroundMusic();
                } else if (fromUserAction || audioUserInteracted) {
                    startBackgroundMusic();
                }
                syncAudioSettingsUI();
            }

            function applySfxEnabledState() {
                window.sfxEnabled = !!sfxEnabled;
                saveAudioEnabledPref(AUDIO_PREF_SFX_ENABLED_KEY, !!sfxEnabled);
                try {
                    Object.values(sfxCache).forEach((a) => {
                        try { if (a) a.muted = (!sfxEnabled) || !!window.allMuted; } catch (e) { }
                    });
                } catch (e) { }
                try { syncSfxEngineGain(); } catch (e) { }
                try {
                    if (sfxAudioCtx && !sfxEnabled && sfxAudioCtx.state === 'running') {
                        sfxAudioCtx.suspend().catch(() => { });
                    } else if (sfxAudioCtx && sfxEnabled && audioUserInteracted && sfxAudioCtx.state === 'suspended' && !document.hidden) {
                        sfxAudioCtx.resume().catch(() => { });
                    }
                } catch (e) { }
                syncAudioSettingsUI();
            }

            function syncTutorialControls() {
                const modeSelect = document.getElementById('tutorialMode');
                if (modeSelect) modeSelect.value = tutorialMode;
            }

            try {
                window.Tutorial = {
                    getMode: function () { return tutorialMode; },
                    setMode: function (mode) {
                        const m = String(mode || '').toLowerCase();
                        if (!TUTORIAL_MODES[m]) return tutorialMode;
                        tutorialMode = m;
                        saveTutorialMode();
                        syncTutorialControls();
                        return tutorialMode;
                    },
                    replay: function () {
                        replayTutorialNow();
                        return { mode: tutorialMode, seen: Object.assign({}, tutorialSeen) };
                    },
                    resetSeen: function () {
                        tutorialSeen = createDefaultTutorialSeen();
                        saveTutorialSeen();
                        tutorialRunState.introShownThisRun = false;
                        return Object.assign({}, tutorialSeen);
                    },
                    getSeen: function () { return Object.assign({}, tutorialSeen); }
                };
            } catch (e) { }

            function resetProgressWithConfirm() {
                let confirmed = false;
                try {
                    confirmed = window.confirm('Reset high score and all achievements? This cannot be undone.');
                } catch (e) {
                    confirmed = false;
                }
                if (!confirmed) return false;

                try {
                    highScore = 0;
                    if (!highScoreEl) highScoreEl = document.getElementById('highScoreValue');
                    if (highScoreEl) highScoreEl.textContent = '0';
                    try { localStorage.removeItem(highScoreKey); } catch (e) { }
                    try {
                        if (window.Achievements && typeof window.Achievements.reset === 'function') {
                            window.Achievements.reset();
                        }
                    } catch (e) { }
                    scheduleAchievementsUIRender();
                    try { playSfx('click'); } catch (e) { }
                } catch (e) {
                    console.warn('resetProgressWithConfirm failed', e);
                }
                return true;
            }

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

            function getActiveMusicAudio() {
                try {
                    if (typeof musicAudio !== 'undefined' && musicAudio) return musicAudio;
                    if (window.musicAudio) return window.musicAudio;
                } catch (e) { }
                return null;
            }

            function ensureGameOverVignette() {
                try {
                    let el = document.getElementById('game-over-vignette');
                    if (!el) {
                        el = document.createElement('div');
                        el.id = 'game-over-vignette';
                        el.className = 'game-over-vignette';
                        document.body.appendChild(el);
                    }
                    gameOverVignetteEl = el;
                    return el;
                } catch (e) {
                    return null;
                }
            }

            function duckMusicForGameOver(duckRatio = 0.28) {
                const ma = getActiveMusicAudio();
                if (!ma) return;
                try {
                    const currentVol = Math.max(0, Number(ma.volume) || 0);
                    if (gameOverPrevMusicVolume == null) gameOverPrevMusicVolume = currentVol;
                    const base = Math.max(0.02, Number(gameOverPrevMusicVolume) || currentVol);
                    ma.volume = Math.max(0.02, Math.min(1, base * Math.max(0.05, Math.min(1, Number(duckRatio) || 0.28))));
                } catch (e) { }
                try { if (gameOverMusicRestoreTimer) clearTimeout(gameOverMusicRestoreTimer); } catch (e) { }
                gameOverMusicRestoreTimer = null;
            }

            function restoreMusicFromGameOverDuck(clearStored = false) {
                try { if (gameOverMusicRestoreTimer) clearTimeout(gameOverMusicRestoreTimer); } catch (e) { }
                gameOverMusicRestoreTimer = null;
                const ma = getActiveMusicAudio();
                if (ma && gameOverPrevMusicVolume != null) {
                    try { ma.volume = Math.max(0, Math.min(1, Number(gameOverPrevMusicVolume) || ma.volume || 0.2)); } catch (e) { }
                }
                if (clearStored) gameOverPrevMusicVolume = null;
            }

            function triggerGameOverFeedback() {
                try { document.body.classList.add('game-over-fx'); } catch (e) { }
                const v = ensureGameOverVignette();
                if (v) {
                    try {
                        v.classList.remove('show');
                        void v.offsetWidth;
                        v.classList.add('show');
                    } catch (e) { }
                }
                duckMusicForGameOver();
            }

            function clearGameOverFeedback() {
                try { document.body.classList.remove('game-over-fx'); } catch (e) { }
                try {
                    const v = gameOverVignetteEl || document.getElementById('game-over-vignette');
                    if (v) {
                        v.classList.remove('show');
                        setTimeout(() => {
                            try {
                                if (!document.body.classList.contains('game-over-fx') && v.parentNode) v.parentNode.removeChild(v);
                            } catch (e) { }
                        }, 280);
                    }
                } catch (e) { }
                restoreMusicFromGameOverDuck(true);
            }

            // Unified reset used by the Game Over persistent popup and restart wiring
            function performGameReset() {
                try {
                    clearGameOverFeedback();
                    screensPassed = 0;
                    totalScore = 0;
                    randomizeBoard(false);
                    updateHUD();
                    outOfClicksShown = false;
                } catch (e) { console.warn('performGameReset failed', e); }
            }

            function buildGameOverRecapHtml() {
                const levelReached = Math.max(1, Number(runAchievementStats.runLevelReached) || getCurrentLevelNumber());
                const pops = Math.max(0, Number(runAchievementStats.runPops) || 0);
                const bestChain = Math.max(0, Number(runAchievementStats.runBestChain) || 0);
                const storms = Math.max(0, Number(runAchievementStats.runNanoStormUses) || 0);
                const unlockedIds = Array.from(runUnlockedAchievementIds || []);
                const unlockedNames = unlockedIds.map((id) => {
                    const def = getAchievementDefById(id);
                    return def ? def.title : String(id);
                });
                const shownNames = unlockedNames.slice(0, 3);
                const extraCount = Math.max(0, unlockedNames.length - shownNames.length);
                const chips = shownNames.map((name) => `<span>${escapeHtml(name)}</span>`).join('');
                const more = extraCount > 0 ? `<div class="go-recap-more">+${extraCount} more</div>` : '';
                return `
                    <div class="go-recap">
                        <div class="go-recap-title">Run Recap</div>
                        <div class="go-recap-grid">
                            <span>Level</span><b>${levelReached}</b>
                            <span>Score</span><b>${Math.max(0, Number(totalScore) || 0)}</b>
                            <span>Viruses Destroyed</span><b>${pops}</b>
                            <span>Best Chain</span><b>${bestChain}</b>
                            <span>Nano Storm Uses</span><b>${storms}</b>
                        </div>
                        <div class="go-recap-achv">Achievements this run: <b>${unlockedNames.length}</b></div>
                        ${chips ? `<div class="go-recap-list">${chips}</div>` : ''}
                        ${more}
                    </div>
                `;
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
                    triggerGameOverFeedback();
                    // create element
                    const el = document.createElement('div');
                    el.className = 'game-over-popup';
                    el.setAttribute('role', 'alert');
                    el.style.pointerEvents = persistent ? 'auto' : 'none';
                    const recapHtml = buildGameOverRecapHtml();
                    el.innerHTML = `
                                                                                  <div class="go-title">${title}</div>
                                                                                  <div class="go-sub">${subtitle}</div>
                                                                                  ${recapHtml}
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
                            clearGameOverFeedback();
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
                const levelNum = getCurrentLevelNumber();
                const difficulty = getDifficultyForLevel(levelNum);
                const S = ensureLen(Array.isArray(difficulty.sizeMixStart) ? difficulty.sizeMixStart : [0.05, 0.20, 0.35, 0.40]);
                const M = ensureLen(Array.isArray(difficulty.sizeMixEven) ? difficulty.sizeMixEven : [0.15, 0.25, 0.30, 0.30]);
                const E = ensureLen(Array.isArray(difficulty.sizeMixEnd) ? difficulty.sizeMixEnd : [0.32, 0.33, 0.23, 0.12]);
                const levelsToEven = Math.max(0, Math.floor(Number(difficulty.sizeMixLevelsToEven) || 6));
                const levelsToEnd = Math.max(0, Math.floor(Number(difficulty.sizeMixLevelsToEnd) || 12));
                const completed = Math.max(0, Number(screensPassed) || 0);

                let weights;
                if (typeof screensPassed === 'undefined') {
                    // fallback to uniform if screensPassed not yet defined
                    weights = new Array(dims).fill(1 / dims);
                } else if (completed <= levelsToEven) {
                    const t1 = levelsToEven === 0 ? 1 : (completed / levelsToEven);
                    weights = lerpArrays(S, M, t1);
                } else if (completed <= levelsToEven + levelsToEnd) {
                    const local = completed - levelsToEven;
                    const t2 = levelsToEnd === 0 ? 1 : (local / levelsToEnd);
                    weights = lerpArrays(M, E, t2);
                } else {
                    weights = E.slice();
                }

                // Normalize defensively
                const sum = weights.reduce((a, b) => a + b, 0) || 1;
                for (let i = 0; i < weights.length; i++) weights[i] = weights[i] / sum;

                // Update debug HUD with current mix (disabled by default)
                updateSizeMixDebug(weights, levelNum);

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

            function getDifficultyForLevel(levelNum = getCurrentLevelNumber()) {
                const level = Math.max(1, Number(levelNum) || 1);
                const base = Object.assign({}, DIFFICULTY_PROFILE.defaults || {});
                const bands = Array.isArray(DIFFICULTY_PROFILE.bands) ? DIFFICULTY_PROFILE.bands : [];
                for (let i = 0; i < bands.length; i++) {
                    const b = bands[i] || {};
                    const min = Math.max(1, Number(b.minLevel) || 1);
                    const max = (b.maxLevel == null) ? Infinity : Math.max(min, Number(b.maxLevel) || min);
                    if (level >= min && level <= max) Object.assign(base, b.values || {});
                }
                return base;
            }

            function getCurrentDifficulty() {
                return getDifficultyForLevel(getCurrentLevelNumber());
            }

            function getBlockerSettings(levelNum = getCurrentLevelNumber()) {
                const d = getDifficultyForLevel(levelNum);
                return {
                    unlockLevel: Math.max(1, Math.floor(Number(d.blockerUnlockLevel) || 1)),
                    tickMs: Math.max(800, Math.floor(Number(d.blockerTickMs) || 1650)),
                    tickJitterMs: Math.max(0, Math.floor(Number(d.blockerTickJitterMs) || 550)),
                    postUserTickMs: Math.max(320, Math.floor(Number(d.blockerPostUserTickMs) || 700)),
                    userBoostWindowMs: Math.max(250, Math.floor(Number(d.blockerUserBoostWindowMs) || 1300)),
                    thicknessRatio: Math.max(0.004, Math.min(0.04, Number(d.blockerThicknessRatio) || 0.010))
                };
            }

            function nudgeRotatingBlockerAfterUserMove() {
                if (!isRotatingBlockerActive()) return;
                const cfg = getBlockerSettings();
                blockerUserBoostUntil = Date.now() + cfg.userBoostWindowMs;
                scheduleRotatingBlockerTick();
            }

            function isGameOverActiveNow() {
                try {
                    if (outOfClicksShown) return true;
                    if (document.body && document.body.classList.contains('game-over-fx')) return true;
                    if (document.querySelector('.game-over-popup')) return true;
                } catch (e) { }
                return false;
            }

            function playBlockerMoveSfx() {
                try {
                    if (isGameOverActiveNow()) return;
                    playSfx('blocker_move_1');
                } catch (e) { }
            }

            function isRotatingBlockerActive(levelNum = getCurrentLevelNumber()) {
                if (!FEATURE_FLAGS || FEATURE_FLAGS.rotatingBlocker === false) return false;
                const cfg = getBlockerSettings(levelNum);
                return levelNum >= cfg.unlockLevel;
            }

            function getRotatingBlockerSegment() {
                if (!boardEl || !isRotatingBlockerActive()) return null;
                const br = boardEl.getBoundingClientRect();
                if (!br || !br.width || !br.height) return null;
                const cfg = getBlockerSettings();
                const laneCount = Math.max(1, (blockerOrientationDeg === 90 ? COLS : ROWS) - 1);
                const lane = Math.max(0, Math.min(laneCount - 1, blockerLaneIndex));
                let cx = br.left + (br.width / 2);
                let cy = br.top + (br.height / 2);
                if (blockerOrientationDeg === 90) {
                    const cellW = br.width / COLS;
                    cx = br.left + (cellW * (lane + 1));
                } else {
                    const cellH = br.height / ROWS;
                    cy = br.top + (cellH * (lane + 1));
                }
                const lineLen = blockerOrientationDeg === 90 ? br.height : br.width;
                const halfLen = Math.max(20, (lineLen * 0.5) - 2);
                const thickness = Math.max(2, Math.round(Math.min(br.width, br.height) * cfg.thicknessRatio));
                const ang = ((blockerOrientationDeg === 90 ? 90 : 0) * Math.PI) / 180;
                return { cx, cy, ang, halfLen, halfThickness: thickness / 2, thickness };
            }

            function getRotatingBlockerImpact(sx, sy, tx, ty) {
                const seg = getRotatingBlockerSegment();
                if (!seg) return null;
                const dirX = Math.cos(seg.ang);
                const dirY = Math.sin(seg.ang);
                const nX = -dirY;
                const nY = dirX;
                const s1 = ((sx - seg.cx) * nX) + ((sy - seg.cy) * nY);
                const s2 = ((tx - seg.cx) * nX) + ((ty - seg.cy) * nY);
                const band = seg.halfThickness + 1.25;
                if (Math.abs(s1) > band && Math.abs(s2) > band && (s1 * s2) > 0) return null;

                const denom = (s1 - s2);
                let t = 0.5;
                if (Math.abs(denom) > 0.00001) t = Math.max(0, Math.min(1, s1 / denom));
                const ix = sx + ((tx - sx) * t);
                const iy = sy + ((ty - sy) * t);
                const along = ((ix - seg.cx) * dirX) + ((iy - seg.cy) * dirY);
                if (Math.abs(along) > (seg.halfLen + band)) return null;
                return { x: ix, y: iy };
            }

            function advanceRotatingBlockerOverTime() {
                if (!isRotatingBlockerActive()) return;
                const prevOrientation = blockerOrientationDeg;
                const prevLane = blockerLaneIndex;
                const laneCount = Math.max(1, (prevOrientation === 90 ? COLS : ROWS) - 1);
                const tryCount = 10;
                for (let i = 0; i < tryCount; i++) {
                    const nextOrientation = Math.random() < 0.35 ? (prevOrientation === 90 ? 0 : 90) : prevOrientation;
                    const nextLane = Math.floor(Math.random() * laneCount);
                    if (nextOrientation !== prevOrientation || nextLane !== prevLane) {
                        blockerOrientationDeg = nextOrientation;
                        blockerLaneIndex = nextLane;
                        playBlockerMoveSfx();
                        return;
                    }
                }
                blockerLaneIndex = (prevLane + 1) % laneCount;
                if (blockerLaneIndex !== prevLane) {
                    playBlockerMoveSfx();
                }
            }

            function stopRotatingBlockerTicker() {
                if (!blockerTickTimer) return;
                clearTimeout(blockerTickTimer);
                blockerTickTimer = null;
            }

            function scheduleRotatingBlockerTick() {
                stopRotatingBlockerTicker();
                if (!isRotatingBlockerActive()) return;
                const cfg = getBlockerSettings();
                let delay = cfg.tickMs + Math.floor(Math.random() * (cfg.tickJitterMs + 1));
                if (Date.now() < blockerUserBoostUntil) {
                    const fastJitter = Math.max(50, Math.floor(cfg.postUserTickMs * 0.35));
                    const boostedDelay = cfg.postUserTickMs + Math.floor(Math.random() * (fastJitter + 1));
                    delay = Math.min(delay, boostedDelay);
                }
                blockerTickTimer = setTimeout(() => {
                    blockerTickTimer = null;
                    try {
                        if (!document.hidden && isRotatingBlockerActive()) {
                            advanceRotatingBlockerOverTime();
                            syncRotatingBlockerUI();
                        }
                    } catch (e) { }
                    scheduleRotatingBlockerTick();
                }, delay);
            }

            function flashRotatingBlocker() {
                if (!boardEl || !isRotatingBlockerActive()) return;
                const el = document.getElementById('rotatingBlocker');
                if (!el) return;
                el.classList.remove('blocked-hit');
                void el.offsetWidth;
                el.classList.add('blocked-hit');
                clearTimeout(blockerFlashTimeout);
                blockerFlashTimeout = setTimeout(() => {
                    try { el.classList.remove('blocked-hit'); } catch (e) { }
                }, 240);
            }

            function syncRotatingBlockerUI() {
                if (!boardEl) return;
                let el = document.getElementById('rotatingBlocker');
                if (!el) {
                    el = document.createElement('div');
                    el.id = 'rotatingBlocker';
                    el.className = 'rotating-blocker';
                    const emitterLeft = document.createElement('span');
                    emitterLeft.className = 'blocker-emitter e-left';
                    const emitterRight = document.createElement('span');
                    emitterRight.className = 'blocker-emitter e-right';
                    el.appendChild(emitterLeft);
                    el.appendChild(emitterRight);
                }
                if (!isRotatingBlockerActive()) {
                    stopRotatingBlockerTicker();
                    try { el.remove(); } catch (e) { }
                    return;
                }
                scheduleRotatingBlockerTick();
                const br = boardEl.getBoundingClientRect();
                const cfg = getBlockerSettings();
                const lineLen = blockerOrientationDeg === 90 ? br.height : br.width;
                const thick = Math.max(2, Math.round(Math.min(br.width, br.height) * cfg.thicknessRatio));
                const laneCount = Math.max(1, (blockerOrientationDeg === 90 ? COLS : ROWS) - 1);
                const lane = Math.max(0, Math.min(laneCount - 1, blockerLaneIndex));
                const yPx = (br.height / ROWS) * (lane + 1);
                const xPx = (br.width / COLS) * (lane + 1);
                el.style.width = Math.round(lineLen) + 'px';
                el.style.height = thick + 'px';
                el.style.left = blockerOrientationDeg === 90 ? `${Math.round(br.left + xPx)}px` : `${Math.round(br.left + (br.width * 0.5))}px`;
                el.style.top = blockerOrientationDeg === 90 ? `${Math.round(br.top + (br.height * 0.5))}px` : `${Math.round(br.top + yPx)}px`;
                el.style.transform = `translate(-50%, -50%) rotate(${blockerOrientationDeg === 90 ? 90 : 0}deg)`;
                if (!document.body.contains(el)) document.body.appendChild(el);
            }

            function getStormRechargeChainMin(levelNum = getCurrentLevelNumber()) {
                const d = getDifficultyForLevel(levelNum);
                return Math.max(1, Math.floor(Number(d.stormRechargeChainMin) || 21));
            }

            function getStormNearThreshold(levelNum = getCurrentLevelNumber()) {
                const recharge = getStormRechargeChainMin(levelNum);
                const d = getDifficultyForLevel(levelNum);
                const near = Math.max(0, Math.floor(Number(d.stormNearThreshold) || 16));
                return Math.min(Math.max(0, recharge - 1), near);
            }

            function shouldAwardChainClick(popCount, levelNum = getCurrentLevelNumber()) {
                const d = getDifficultyForLevel(levelNum);
                const start = Math.max(1, Math.floor(Number(d.chainClickBonusStartPop) || 3));
                const every = Math.max(1, Math.floor(Number(d.chainClickBonusEvery) || 2));
                const count = Math.max(0, Math.floor(Number(popCount) || 0));
                if (count < start) return false;
                return ((count - start) % every) === 0;
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
                const d = getDifficultyForLevel(level);
                const base = Math.max(0, Math.min(1, Number(d.specialVirusBaseChance) || 0));
                const levelBonus = Math.max(0, Number(d.specialVirusLevelBonus) || 0);
                const maxChance = Math.max(0, Math.min(1, Number(d.specialVirusMaxChance) || 1));
                const unlockFloor = active.reduce((min, def) => {
                    const unlock = Math.max(1, Number(def && def.unlockLevel) || 1);
                    return Math.min(min, unlock);
                }, Infinity);
                const growthLevels = Math.max(0, level - (Number.isFinite(unlockFloor) ? unlockFloor : level));
                const chance = Math.min(maxChance, base + (growthLevels * levelBonus));
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
                    incrementAchievementStat('runArmoredShellsBroken', 1, 'run');
                    incrementAchievementStat('armoredShellsLifetime', 1, 'lifetime');
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
                boardGeneration += 1;
                state.fill(null);
                specialState.fill(null);
                specialMetaState.fill(null);
                if (!preserveClicks) {
                    clicksLeft = 10;
                    stormResolving = false;
                    stormCharges = 1;
                    comboInsurance = 0;
                    setStormArmed(false);
                    resetStormChainIndicator();
                    resetRunAchievementStats(getCurrentLevelNumber());
                    tutorialRunState.introShownThisRun = false;
                }
                const total = ROWS * COLS;
                const levelNum = getCurrentLevelNumber();
                const difficulty = getDifficultyForLevel(levelNum);
                const baseDensity = Math.max(0, Math.min(1, Number(difficulty.baseDensity) || 0.60));
                const densityGrowth = Math.max(0, Number(difficulty.densityGrowth) || 0);
                const target = Math.round(total * Math.min(0.95, baseDensity + screensPassed * densityGrowth));
                const idx = Array.from({ length: total }, (_, i) => i);
                shuffle(idx);
                for (let k = 0; k < target; k++) {
                    const cellIndex = idx[k];
                    state[cellIndex] = sampleSizeRandom();
                    setSpecialForCell(cellIndex, rollSpecialVirusType(levelNum));
                }
                queueLikelyAssetPrefetch(levelNum + 1, 'next-level');
                scheduleRender();
                updateHUD();
                if (!preserveClicks) {
                    setTimeout(() => { maybeShowTutorialIntro(false); }, 280);
                }
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
                specialTelegraphIndex = null;
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
                syncRotatingBlockerUI();
                updateHUD();
                if (!tutorialSeen.firstArmoredSeen) {
                    for (let i = 0; i < specialState.length; i++) {
                        if (specialState[i] === 'armored') {
                            tutorialEvent('firstArmoredSeen');
                            break;
                        }
                    }
                }
                if (stormArmed && Number.isFinite(stormHoverIndex)) applyStormPreview(stormHoverIndex);
                else clearStormPreview();
                const remaining = state.filter(x => x !== null).length;

                if (remaining === 0) {
                    // single, unified "level complete" path
                    if (clicksLeft === 1) incrementAchievementStat('runClutchClears', 1, 'run');
                    clicksLeft = Math.min(MAX_CLICKS, clicksLeft + 1);
                    playSfx('win');
                    screensPassed += 1;
                    incrementAchievementStat('levelsClearedLifetime', 1, 'lifetime');
                    setAchievementBest('runLevelReached', screensPassed + 1, 'run');
                    updateHUD();
                    tutorialEvent('firstLevelClear');

                    try { showLevelComplete({ title: 'LEVEL COMPLETE', duration: 4500 }); } catch (e) { }

                    // wait a moment for the popup/animation, then new board
                    setTimeout(() => randomizeBoard(true), 420);
                }


            }

            // Particle pool
            const PARTICLE_POOL = [];
            // ---------- Sprite-based particle implementation (replacement) ----------
            const PARTICLE_SPRITE = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/antibody.png';
            const GLOW_POOL = [];
            const MAX_GLOW_POOL = IS_MOBILE_COARSE ? 8 : 14;

            function getGlowFromPool() {
                for (let i = 0; i < GLOW_POOL.length; i++) {
                    const g = GLOW_POOL[i];
                    if (!g._inUse) {
                        g._inUse = true;
                        return g;
                    }
                }
                if (GLOW_POOL.length >= MAX_GLOW_POOL) return null;
                const glow = document.createElement('div');
                glow.className = 'glow';
                glow._inUse = true;
                glow._releaseTimeout = null;
                GLOW_POOL.push(glow);
                return glow;
            }

            function releaseGlowToPool(glow) {
                if (!glow) return;
                try {
                    glow._inUse = false;
                    glow.style.animation = 'none';
                    glow.style.opacity = '0';
                } catch (e) { }
            }

            function showPooledGlowAt(x, y) {
                const glow = getGlowFromPool();
                if (!glow) return;
                try {
                    glow.style.left = Math.round(x) + 'px';
                    glow.style.top = Math.round(y) + 'px';
                    glow.style.opacity = '0.95';
                    if (!document.body.contains(glow)) document.body.appendChild(glow);
                    glow.style.animation = 'none';
                    void glow.offsetWidth;
                    glow.style.animation = 'glowPop 520ms ease-out forwards';
                    clearTimeout(glow._releaseTimeout);
                    glow._releaseTimeout = setTimeout(() => releaseGlowToPool(glow), 620);
                } catch (e) {
                    releaseGlowToPool(glow);
                }
            }

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
                const sourceBoardGeneration = boardGeneration;

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
                            const block = getRotatingBlockerImpact(sx + jitterX, sy + jitterY, tx, ty);
                            // duration tuned per direction (slightly varied)
                            const dur = 400 + Math.random() * 600 + dirIdx * 20;
                            if (block) {
                                animateParticleTo(p, sx + jitterX, sy + jitterY, block.x, block.y, Math.max(220, dur * 0.72), () => {
                                    try {
                                        if (sourceBoardGeneration !== boardGeneration) return;
                                        flashRotatingBlocker();
                                    } catch (e) { }
                                });
                            } else {
                                animateParticleTo(p, sx + jitterX, sy + jitterY, tx, ty, dur, () => {
                                    try {
                                        if (sourceBoardGeneration !== boardGeneration) return;
                                        if (!hitTargets.has(next)) {
                                            hitTargets.add(next);
                                            handleClick(next, false, tracker);
                                        }
                                    } catch (e) { }
                                });
                            }
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
                const cellEl = boardEl.querySelector(`[data-index='${index}']`);
                if (!cellEl) return;
                try {
                    const r0 = cellEl.getBoundingClientRect();
                    const gx = r0.left + r0.width / 2;
                    const gy = r0.top + r0.height / 2;
                    showPooledGlowAt(gx, gy);
                } catch (e) { }
                const virus = cellEl.querySelector('.virus');
                if (virus) {
                    let stain = virus.querySelector('.stain');
                    if (!stain) {
                        stain = document.createElement('div');
                        stain.className = 'stain';
                        virus.appendChild(stain);
                    }
                    stain.classList.remove('show');
                    void stain.offsetWidth;
                    stain.classList.add('show');
                }
                emitDirectionalParticles(index, tracker);
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
                        incrementAchievementStat('runPops', 1, 'run');
                        incrementAchievementStat('totalPopsLifetime', 1, 'lifetime');
                        updateStormChainProgress(tracker.pops);

                        // Chain click rewards are profile-driven (start pop + cadence).
                        const difficulty = getCurrentDifficulty();
                        if (shouldAwardChainClick(tracker.pops)) {
                            clicksLeft = Math.min(MAX_CLICKS, clicksLeft + 1);
                            playSfx('fill');
                        }
                        const chainScoreStep = Math.max(0, Number(difficulty.chainScoreStep) || 0.5);
                        const levelScoreScaleStep = Math.max(0, Number(difficulty.levelScoreScaleStep) || 0.1);
                        const chainMultiplier = 1 + (tracker.pops - 1) * chainScoreStep;
                        const earned = Math.round(10 * chainMultiplier * (1 + screensPassed * levelScoreScaleStep));
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
                const rechargeTarget = getStormRechargeChainMin();
                const nearThreshold = getStormNearThreshold();
                const isCharged = stormCharges > 0;
                const insuranceVisualBoost = Math.floor(Math.max(0, Math.min(1, comboInsurance)) * 3);
                const visualCount = isCharged ? rechargeTarget : Math.max(0, count + insuranceVisualBoost);
                const ratio = Math.max(0, Math.min(1, visualCount / rechargeTarget));
                stormBtn.style.setProperty('--storm-combo-ratio', String(ratio));
                stormBtn.dataset.chain = String(Math.min(visualCount, rechargeTarget));
                stormBtn.dataset.insurance = String(Math.round(Math.max(0, Math.min(1, comboInsurance)) * 100));
                stormBtn.classList.toggle('charged', isCharged);
                stormBtn.classList.toggle('combo-tracking', !isCharged && visualCount > 0);
                stormBtn.classList.toggle('combo-near', !isCharged && visualCount >= nearThreshold && visualCount < rechargeTarget);
                stormBtn.classList.toggle('combo-hot', !isCharged && visualCount >= (rechargeTarget - 1));
                stormBtn.classList.toggle('insurance-ready', comboInsurance >= COMBO_INSURANCE_CAP);
                const baseTitle = stormArmed ? 'Nano Storm armed' : (isCharged ? 'Nano Storm ready' : 'Nano Storm charging');
                const chainTitle = (!isCharged && visualCount > 0) ? (' | chain ' + visualCount + '/' + rechargeTarget) : '';
                const insuranceTitle = comboInsurance > 0 ? (' | combo save ' + Math.round(comboInsurance * 100) + '%') : '';
                stormBtn.setAttribute('title', baseTitle + chainTitle + insuranceTitle);
            }

            function addComboInsuranceFromChain(popCount) {
                const count = Math.max(0, Number(popCount) || 0);
                if (count < COMBO_INSURANCE_CHAIN_START) return 0;
                const rechargeTarget = getStormRechargeChainMin();
                if (count >= rechargeTarget) return 0;
                const steps = Math.max(1, rechargeTarget - (COMBO_INSURANCE_CHAIN_START - 1));
                const gained = (count - (COMBO_INSURANCE_CHAIN_START - 1)) / steps;
                if (gained <= 0) return 0;
                const before = comboInsurance;
                comboInsurance = Math.max(0, Math.min(COMBO_INSURANCE_CAP, comboInsurance + gained));
                syncStormChainIndicator();
                return Math.max(0, comboInsurance - before);
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
                const rechargeTarget = getStormRechargeChainMin();
                if (stormCharges >= MAX_STORM_CHARGES) {
                    updateStormUI();
                    return false;
                }
                let effectiveCount = count;
                if (effectiveCount < rechargeTarget && comboInsurance > 0) {
                    const boost = Math.floor(Math.max(0, Math.min(1, comboInsurance)) * 3);
                    if (boost > 0) {
                        effectiveCount += boost;
                        if (effectiveCount >= rechargeTarget) comboInsurance = 0;
                    }
                }
                if (effectiveCount < rechargeTarget) return false;
                const before = stormCharges;
                stormCharges = Math.min(MAX_STORM_CHARGES, stormCharges + 1);
                if (stormCharges > before) {
                    try { playSfx('fill'); } catch (e) { }
                    flashStormChargeGain();
                    updateStormUI();
                    tutorialEvent('firstStormReady');
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
                    clearMobileStormInteraction(true);
                } else if (Number.isFinite(stormHoverIndex)) {
                    applyStormPreview(stormHoverIndex);
                }
                updateStormUI();
            }

            function clearMobileStormInteraction(clearPreview = false) {
                try {
                    if (mobileStormPressTimer) clearTimeout(mobileStormPressTimer);
                } catch (e) { }
                mobileStormPressTimer = null;
                mobileStormHoldActive = false;
                mobileStormPointerId = null;
                mobileStormCandidateIndex = null;
                if (clearPreview) {
                    stormHoverIndex = null;
                    clearStormPreview();
                }
            }

            function beginMobileStormInteraction(index, pointerId) {
                clearMobileStormInteraction(false);
                mobileStormPointerId = pointerId;
                mobileStormCandidateIndex = Number(index);
                mobileStormPressTimer = setTimeout(() => {
                    mobileStormPressTimer = null;
                    if (!stormArmed || stormCharges <= 0 || !Number.isFinite(mobileStormCandidateIndex)) return;
                    mobileStormHoldActive = true;
                    applyStormPreview(mobileStormCandidateIndex);
                    try {
                        if (navigator && typeof navigator.vibrate === 'function') navigator.vibrate(10);
                    } catch (e) { }
                }, MOBILE_STORM_HOLD_MS);
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

            function playStormPrecharge(centerIndex, onReady) {
                if (!boardEl) {
                    try { if (typeof onReady === 'function') onReady(); } catch (e) { }
                    return;
                }
                try {
                    boardEl.classList.remove('storm-precharge');
                    void boardEl.offsetWidth;
                    boardEl.classList.add('storm-precharge');
                } catch (e) { }
                try {
                    const cell = boardEl.querySelector(`[data-index='${centerIndex}']`);
                    if (cell) {
                        const r = cell.getBoundingClientRect();
                        const ring = document.createElement('div');
                        ring.className = 'storm-precharge-ring';
                        ring.style.left = Math.round(r.left + (r.width / 2)) + 'px';
                        ring.style.top = Math.round(r.top + (r.height / 2)) + 'px';
                        document.body.appendChild(ring);
                        setTimeout(() => { try { ring.remove(); } catch (e) { } }, 260);
                    }
                } catch (e) { }
                setTimeout(() => {
                    try { boardEl.classList.remove('storm-precharge'); } catch (e) { }
                    try { if (typeof onReady === 'function') onReady(); } catch (e) { }
                }, 170);
            }

            function clearSpecialTelegraph() {
                if (!boardEl) return;
                try {
                    const prev = boardEl.querySelector('.cell.special-telegraph, .cell.special-telegraph-strong');
                    if (prev) prev.classList.remove('special-telegraph', 'special-telegraph-strong');
                } catch (e) { }
                specialTelegraphIndex = null;
            }

            function applySpecialTelegraph(index, strong = false) {
                if (!boardEl) return false;
                const idx = Number(index);
                if (!Number.isFinite(idx)) return false;
                const typeId = specialState[idx];
                if (!typeId) {
                    if (specialTelegraphIndex === idx) clearSpecialTelegraph();
                    return false;
                }
                const cell = boardEl.querySelector(`[data-index='${idx}']`);
                if (!cell) return false;
                if (specialTelegraphIndex !== idx) clearSpecialTelegraph();
                specialTelegraphIndex = idx;
                cell.classList.add('special-telegraph');
                if (strong) {
                    try {
                        cell.classList.remove('special-telegraph-strong');
                        void cell.offsetWidth;
                        cell.classList.add('special-telegraph-strong');
                        setTimeout(() => {
                            try { cell.classList.remove('special-telegraph-strong'); } catch (e) { }
                        }, 260);
                    } catch (e) { }
                }
                return true;
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
                        setAchievementBest('runBestChain', count, 'run');
                        if (count >= 20) incrementAchievementStat('chain20LifetimeCount', 1, 'lifetime');
                        if (count >= 4) tutorialEvent('firstChain');
                        updateStormChainProgress(count);
                        grantStormChargeFromChain(count);
                        if (count < getStormRechargeChainMin()) addComboInsuranceFromChain(count);
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
                    nudgeRotatingBlockerAfterUserMove();

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
                    tutorialEvent('firstTap');


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
                incrementAchievementStat('runNanoStormUses', 1, 'run');
                tutorialEvent('firstStormUse');
                setStormArmed(false);
                updateHUD();
                const executeStormImpact = () => {
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
                };
                playStormPrecharge(centerIndex, executeStormImpact);
                return true;
            }



            // Safe event wiring: check nodes exist before attaching
            if (boardEl) {
                boardEl.addEventListener('pointerdown', (ev) => {
                    const c = ev.target.closest('.cell');
                    if (!c) return;
                    const i = Number(c.dataset.index);
                    if (Number.isFinite(i)) applySpecialTelegraph(i, true);
                    if (IS_MOBILE_COARSE && stormArmed && stormCharges > 0) {
                        beginMobileStormInteraction(i, ev.pointerId);
                        return;
                    }
                    if (stormArmed && stormCharges > 0) {
                        if (useNanoStorm(i)) return;
                    }
                    handleClick(i, true);
                });
                boardEl.addEventListener('pointermove', (ev) => {
                    const c = ev.target.closest('.cell');
                    if (!c) return;
                    const i = Number(c.dataset.index);
                    if (!Number.isFinite(i)) return;
                    applySpecialTelegraph(i, false);
                    if (stormArmed) {
                        if (IS_MOBILE_COARSE) {
                            if (mobileStormPointerId !== null && ev.pointerId === mobileStormPointerId) {
                                mobileStormCandidateIndex = i;
                                if (mobileStormHoldActive) applyStormPreview(i);
                            }
                        } else {
                            applyStormPreview(i);
                        }
                    }
                });
                boardEl.addEventListener('pointerup', (ev) => {
                    if (!IS_MOBILE_COARSE) return;
                    if (!stormArmed || stormCharges <= 0) {
                        clearMobileStormInteraction(true);
                        return;
                    }
                    if (mobileStormPointerId === null || ev.pointerId !== mobileStormPointerId) return;
                    const c = ev.target.closest('.cell');
                    const upIndex = c ? Number(c.dataset.index) : mobileStormCandidateIndex;
                    const targetIndex = Number.isFinite(upIndex) ? upIndex : mobileStormCandidateIndex;
                    clearMobileStormInteraction(true);
                    if (Number.isFinite(targetIndex)) {
                        useNanoStorm(targetIndex);
                    }
                });
                boardEl.addEventListener('pointercancel', () => {
                    if (!IS_MOBILE_COARSE) return;
                    clearMobileStormInteraction(true);
                });
                boardEl.addEventListener('pointerleave', () => {
                    clearSpecialTelegraph();
                    stormHoverIndex = null;
                    clearStormPreview();
                    if (IS_MOBILE_COARSE) clearMobileStormInteraction(false);
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
            evaluateAchievements({ emitUnlock: false });
            scheduleAchievementsUIRender();
            const audioBtn = document.getElementById('audioBtn');
            const settingsTabBtn = document.getElementById('settingsTabBtn');
            const achievementsTabBtn = document.getElementById('achievementsTabBtn');
            const settingsTabPane = document.getElementById('settingsTabPane');
            const achievementsTabPane = document.getElementById('achievementsTabPane');
            function setSettingsPopupTab(tabName) {
                const showAchievements = String(tabName || '') === 'achievements';
                if (settingsTabPane) settingsTabPane.classList.toggle('active', !showAchievements);
                if (achievementsTabPane) achievementsTabPane.classList.toggle('active', showAchievements);
                if (settingsTabBtn) {
                    settingsTabBtn.classList.toggle('active', !showAchievements);
                    settingsTabBtn.setAttribute('aria-selected', String(!showAchievements));
                }
                if (achievementsTabBtn) {
                    achievementsTabBtn.classList.toggle('active', showAchievements);
                    achievementsTabBtn.setAttribute('aria-selected', String(showAchievements));
                }
                if (achievementsTabPane) achievementsTabPane.setAttribute('aria-hidden', String(!showAchievements));
                if (settingsTabPane) settingsTabPane.setAttribute('aria-hidden', String(showAchievements));
                if (showAchievements) scheduleAchievementsUIRender();
            }
            if (settingsTabBtn) settingsTabBtn.addEventListener('click', () => setSettingsPopupTab('settings'));
            if (achievementsTabBtn) achievementsTabBtn.addEventListener('click', () => setSettingsPopupTab('achievements'));
            setSettingsPopupTab('settings');
            if (audioBtn) {
                audioBtn.addEventListener('click', () => {
                    setSettingsPopupTab('settings');
                    scheduleAchievementsUIRender();
                    syncTutorialControls();
                    syncAudioSettingsUI();
                });
            }
            const musicEnabledToggle = document.getElementById('musicEnabledToggle');
            const sfxEnabledToggle = document.getElementById('sfxEnabledToggle');
            const musicToggleSwitch = document.querySelector('#musicEnabledToggle + .audio-toggle-switch');
            const sfxToggleSwitch = document.querySelector('#sfxEnabledToggle + .audio-toggle-switch');
            if (musicEnabledToggle) {
                musicEnabledToggle.addEventListener('change', () => {
                    markAudioUserInteracted();
                    musicEnabled = !!musicEnabledToggle.checked;
                    applyMusicEnabledState(true);
                });
            }
            if (sfxEnabledToggle) {
                sfxEnabledToggle.addEventListener('change', () => {
                    sfxEnabled = !!sfxEnabledToggle.checked;
                    applySfxEnabledState();
                });
            }
            if (musicToggleSwitch && musicEnabledToggle) {
                musicToggleSwitch.addEventListener('click', (ev) => {
                    try { ev.preventDefault(); } catch (e) { }
                    musicEnabledToggle.checked = !musicEnabledToggle.checked;
                    musicEnabledToggle.dispatchEvent(new Event('change'));
                });
            }
            if (sfxToggleSwitch && sfxEnabledToggle) {
                sfxToggleSwitch.addEventListener('click', (ev) => {
                    try { ev.preventDefault(); } catch (e) { }
                    sfxEnabledToggle.checked = !sfxEnabledToggle.checked;
                    sfxEnabledToggle.dispatchEvent(new Event('change'));
                });
            }
            applyMusicEnabledState(false);
            applySfxEnabledState();
            const tutorialModeSelect = document.getElementById('tutorialMode');
            const replayTutorialBtn = document.getElementById('replayTutorialBtn');
            syncTutorialControls();
            if (tutorialModeSelect) {
                tutorialModeSelect.addEventListener('change', (ev) => {
                    const nextMode = String((ev && ev.target && ev.target.value) || '').toLowerCase();
                    if (!TUTORIAL_MODES[nextMode]) return;
                    tutorialMode = nextMode;
                    saveTutorialMode();
                    syncTutorialControls();
                    if (tutorialMode !== TUTORIAL_MODES.off) maybeShowTutorialIntro(false);
                });
            }
            if (replayTutorialBtn) {
                replayTutorialBtn.addEventListener('click', (ev) => {
                    try { ev.preventDefault(); } catch (e) { }
                    replayTutorialNow();
                });
            }
            const resetProgressBtn = document.getElementById('resetProgressBtn');
            if (resetProgressBtn) {
                resetProgressBtn.addEventListener('click', (ev) => {
                    try { ev.preventDefault(); } catch (e) { }
                    resetProgressWithConfirm();
                });
            }

            const restartBtn = document.getElementById('restart');
            if (restartBtn) { restartBtn.addEventListener('click', () => { screensPassed = 0; totalScore = 0; randomizeBoard(false); }); }
            let startBtn = document.getElementById('startBtn');

            let sfxMuted = false;
            // The mute button lives after the script in the DOM, but DOMContentLoaded guarantees it exists now
            const muteBtn = document.getElementById('mute');
            if (muteBtn) {
                muteBtn.addEventListener('click', () => {
                    sfxMuted = !sfxMuted;
                    try { window.allMuted = !!sfxMuted; } catch (e) { }
                    muteBtn.textContent = sfxMuted ? 'M' : 'M';
                    Object.values(sfxCache).forEach(a => { try { a.muted = sfxMuted; } catch (e) { } });
                    if (typeof musicAudio !== 'undefined' && musicAudio) try { musicAudio.muted = sfxMuted; } catch (e) { }
                    try { syncSfxEngineGain(); } catch (e) { }
                });
            }

            // Practical V1: remove HUD music toggle; audio lives in Settings.
            if (startBtn) {
                startBtn.style.display = 'none';
                startBtn.setAttribute('aria-hidden', 'true');
            }



            // initialize clicks meter (10 segments) and ensure it updates with HUD
            createClicksMeter(10);
            updateClicksMeter(clicksLeft);

            randomizeBoard(false);

        }); // end DOMContentLoaded
    

