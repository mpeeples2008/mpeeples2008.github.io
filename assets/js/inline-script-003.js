

        // Put this near top of your script (edit paths to your images)
const levelCompleteImages = Array.from({ length: 36 }, (_, i) => {
  const n = String(i + 1).padStart(2, '0');
  return `https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/levelcomplete_${n}.png`;
});
let levelCompleteImageDeck = [];

function shuffleArrayInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function resetLevelCompleteImageDeck() {
  levelCompleteImageDeck = shuffleArrayInPlace(levelCompleteImages.slice());
}

function getNextLevelCompleteImage() {
  if (!Array.isArray(levelCompleteImageDeck) || levelCompleteImageDeck.length === 0) {
    resetLevelCompleteImageDeck();
  }
  return String(levelCompleteImageDeck.shift() || levelCompleteImages[0] || '');
}
const BOSS_LEVEL_IMAGE_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/boss_level.png';
const BOSS_LEVEL10_IMAGE_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/boss_level2.png';
const BOSS_LEVEL15_IMAGE_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/boss_level_3.png';
const BOSS_LEVEL20_IMAGE_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/final_boss_splash.png';
const FINAL_OFFER_IMAGE_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/final_offer.png';
const FINAL_BOSS_THEME_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/Unholy%20Knight.mp3';
const FINAL_OFFER_PRELUDE_FADE_MS = 900;
const FINAL_OFFER_MUSIC_DUCK_MS = 900;
const FINAL_OFFER_MUSIC_DUCK_RATIO = 0.06;
const FINAL_OFFER_GLOBAL_PRELUDE_FADE_IN_MS = 1650;
const FINAL_OFFER_GLOBAL_PRELUDE_FADE_OUT_MS = 950;
const FINAL_OFFER_LEVEL20_SPLASH_Z = 2147483646;
const FINAL_VICTORY_DEFAULT_IMAGE_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/independent_variable.png';
const FINAL_VICTORY_PIXEL_IMAGE_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/system_restored.png';
const FINAL_VICTORY_BROKER_IMAGE_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/hostile_takeover.png';
const FINAL_VICTORY_SOLO_IMAGE_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/independent_variable.png';
const FINAL_CREDITS_THEME_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/Super%20Power%20Cool%20Dude.mp3';
const CONTINUE_OFFER_IMAGE_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/competitive_opportunity.png';
const FINAL_VICTORY_CREDITS = [
  'Containment Restored',
  'Gone Viral!',
  'Created by Matt Peeples',
  'Built with Codex + ChatGPT',
  'Thank you for playing'
];

function getBossLevelIntroImageUrl(levelNum) {
  const lvl = Math.max(1, Math.floor(Number(levelNum) || 1));
  if (lvl === 10) return BOSS_LEVEL10_IMAGE_URL || BOSS_LEVEL_IMAGE_URL;
  if (lvl === 15) return BOSS_LEVEL15_IMAGE_URL || BOSS_LEVEL_IMAGE_URL;
  if (lvl === 20) return BOSS_LEVEL20_IMAGE_URL || BOSS_LEVEL15_IMAGE_URL || BOSS_LEVEL10_IMAGE_URL || BOSS_LEVEL_IMAGE_URL;
  return BOSS_LEVEL_IMAGE_URL;
}


function showLevelComplete(opts = {}) {
  const title = opts.title || 'LEVEL COMPLETE';
  const imgSrc = opts.imageUrl || getNextLevelCompleteImage();
  const onDismiss = (typeof opts.onDismiss === 'function') ? opts.onDismiss : null;
  const emitAssistant = opts.emitAssistant !== false;
  const extraClass = String(opts.className || '').trim();
  const customZIndex = Number(opts.zIndex);
  try { if (window.hideChainBadge) window.hideChainBadge(false); } catch (e) {}

  // remove any previous popup
  const prior = document.querySelector('.level-complete');
  if (prior) try { prior.remove(); } catch (e) {}

  try {
    const el = document.createElement('div');
    el.className = `level-complete level-complete--board${extraClass ? ` ${extraClass}` : ''}`;
    if (Number.isFinite(customZIndex) && customZIndex > 0) {
      el.style.zIndex = String(Math.floor(customZIndex));
    }
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
    if (emitAssistant) {
      try { if (window.Assistant) Assistant.emit && Assistant.emit('levelComplete'); } catch (e) {}
    }

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
      if (onDismiss) {
        try { onDismiss(); } catch (e) {}
      }
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
                blockerUnlockLevel: 15,
                blockerTickMs: 1500,
                blockerTickJitterMs: 550,
                blockerPostUserTickMs: 520,
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
        const ENDURANCE_SIZE_MIX_PROFILE = {
            // Endurance-only: keep density from base profile, but ramp size mix aggressively early.
            // sampleSizeRandom() blends using screensPassed (levels completed):
            //  - level 1..2   : start -> even
            //  - level 3..15  : even  -> end
            //  - level 16..18 : end   -> late
            //  - level 19..22 : late  -> post (more small-virus pressure)
            sizeMixStart: [0.04, 0.17, 0.35, 0.44],
            sizeMixEven: [0.11, 0.24, 0.33, 0.32],
            sizeMixEnd: [0.24, 0.32, 0.28, 0.16],
            sizeMixLate: [0.32, 0.28, 0.28, 0.12],
            sizeMixPost: [0.38, 0.30, 0.22, 0.10],
            // completed=4   -> level 5
            // completed=12  -> level 13
            // completed=17  -> level 18
            // completed=21  -> level 22
            sizeMixLevelsToEven: 4,
            sizeMixLevelsToEnd: 8,
            sizeMixLevelsToLate: 5,
            sizeMixLevelsToPost: 4
        };

        // Wrap everything that queries DOM in DOMContentLoaded so elements exist before we attach listeners
        document.addEventListener('DOMContentLoaded', () => {


            // initialize high score HUD
            try { highScoreEl = document.getElementById('highScoreValue'); if (highScoreEl) highScoreEl.textContent = String(highScore); } catch (e) { }
            // Full game script preserved from original with badge/confetti and 8-bit icons added
            const ROWS = 6, COLS = 6, MAX_SIZE = 3, MAX_CLICKS = 20;
            const FEATURE_FLAGS = window.GameFeatureFlags || { rotatingBlocker: true, miniBoss: true, bossGooShields: true, epicBoss20: true };
            window.GameFeatureFlags = FEATURE_FLAGS;
            if (typeof FEATURE_FLAGS.miniBoss === 'undefined') FEATURE_FLAGS.miniBoss = true;
            if (typeof FEATURE_FLAGS.bossGooShields === 'undefined') FEATURE_FLAGS.bossGooShields = true;
            if (typeof FEATURE_FLAGS.epicBoss20 === 'undefined') FEATURE_FLAGS.epicBoss20 = true;

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
            const VIRUS1_SPRITE_SHEET_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/virus1_clean.png';
            const VIRUS2_SPRITE_SHEET_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/virus_2_animation.png';
            const VIRUS2_SPRITE_CELL_PX = 200;
            const VIRUS2_SPRITE_COLS = 2;
            const VIRUS2_SPRITE_ROWS = 2;
            const VIRUS2_SPRITE_FPS = 5;
            const VIRUS2_SPRITE_FRAME_COUNT = 4;
            const VIRUS3_SPRITE_SHEET_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/virus_3_animation.png';
            const VIRUS3_SPRITE_COLS = 1;
            const VIRUS3_SPRITE_ROWS = 2;
            const VIRUS3_SPRITE_FPS = 3;
            const VIRUS3_SPRITE_FRAME_COUNT = 2;
            const VIRUS4_SPRITE_SHEET_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/virus_4_animated.png';
            const VIRUS4_SPRITE_COLS = 2;
            const VIRUS4_SPRITE_ROWS = 2;
            const VIRUS4_SPRITE_FPS = 6;
            const VIRUS4_SPRITE_FRAME_COUNT = 4;
            const VIRUS_SIZE_SCALES_ANIMATED = [0.56, 0.6, 0.85, 1.05];
            const VIRUS_SIZE_SCALES_SIMPLE = [0.34, 0.6, 0.8, 1.04];
            function getVirusSizeScale(size) {
                const i = Math.max(0, Math.min(3, Number(size) || 0));
                const profile = simpleVirusArtEnabled ? VIRUS_SIZE_SCALES_SIMPLE : VIRUS_SIZE_SCALES_ANIMATED;
                return Number(profile[i]) || 1;
            }
            let virus2SpriteLayout = {
                cols: 1,
                rows: 1,
                frames: 1,
                durationMs: 200
            };
            const virus3SpriteLayout = {
                cols: VIRUS3_SPRITE_COLS,
                rows: VIRUS3_SPRITE_ROWS,
                frames: VIRUS3_SPRITE_FRAME_COUNT,
                durationMs: Math.round((VIRUS3_SPRITE_FRAME_COUNT / Math.max(1, VIRUS3_SPRITE_FPS)) * 1000)
            };
            const virus4SpriteLayout = {
                cols: VIRUS4_SPRITE_COLS,
                rows: VIRUS4_SPRITE_ROWS,
                frames: VIRUS4_SPRITE_FRAME_COUNT,
                durationMs: Math.round((VIRUS4_SPRITE_FRAME_COUNT / Math.max(1, VIRUS4_SPRITE_FPS)) * 1000)
            };
            const MINIBOSS_SPRITE_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/miniboss.png';
            const MINIBOSS_LEVEL10_SPRITE_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/boss2_new.png';
            const MINIBOSS_LEVEL15_SPRITE_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/techy-goblin.png';
            const MINIBOSS_LEVEL20_PHASE1_SPRITE_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/boss.png';
            const MINIBOSS_LEVEL20_PHASE2_SPRITE_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/boss_phase2_alt.png';
            const MINIBOSS_LEVEL20_PHASE3_SPRITE_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/final%20form.png';
            const LEVEL20_BOSS_TALK_SPRITE_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/boss_talk.png';
            const LEVEL20_BOSS_MODAL_SPRITE_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/boss_final_modal.png';
            const LEVEL20_BOSS_PHASESHIFT_TALK_SPRITE_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/final-boss.png';
            const BOSS20_PHASE2_SHATTER_SPRITE_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/shatter.png';
            const NANOBOT_DRAIN_SPRITE_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/nanobot_hover.png';
            const PETRI_URL = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/petri%20dish.png';
            const SFX_URLS = {
                pop: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/pop2.mp3',
                grow: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/grow.mp3',
                fill: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/bubblefill2.mp3',
                win: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/win2.mp3',
                lose: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/lose2.mp3',
                blocker_move_1: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/nano_bot_move.mp3',
                nanostorm: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/nanostorm.mp3',
                blocker_move: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/nano_bot_move.mp3',
                evil1: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/evil_voice_1.mp3',
                evil2: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/evil_voice_2.mp3',
                evil3: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/evil_voice_3.mp3',
                evil4: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/evil_voice_4.mp3',
                evil5: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/boss_voice_5.mp3',
                evil6: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/boss_voice_6.mp3',
                zap: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/zap.mp3',
                boss_level: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/boss_level.mp3',
                level5_boss_hit: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/level5_boss_hit.mp3',
                level5_boss_dies: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/level5_boss_dies.mp3',
                miniboss_laugh: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/miniboss_laugh.mp3',
                miniboss_dies: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/miniboss_dies.mp3',
                goop: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/goop.mp3',
                goop_be_dead: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/goop_be_dead.mp3',
                techno_dead: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/techno_dead.mp3',
                techno_jammer: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/techno_jamming.mp3',
                techno_duplicator: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/techno_duplicator.mp3',
                glass_crack: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/glass_shatter_sound.mp3',
                final_entrance: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/final_entrance.mp3',
                double_deal: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/double_deal.mp3',
                achievement: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/achievement.mp3',
                assistant_ai_0: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI1.mp3',
                assistant_ai_1: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI2.mp3',
                assistant_ai_2: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI3.mp3',
                assistant_ai_3: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI4.mp3',
                assistant_ai_4: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI5.mp3',
                assistant_ai_5: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI6.mp3',
                assistant_ai_6: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI7.mp3'
            };

            // Background music playlist (hard-wired) � will be started on the user's first tap
            const MUSIC_PLAYLIST = [
                'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/Voltaic.mp3',
                'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/Robobozo.mp3',
                'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/Robo-Western.mp3',
                'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/Ouroboros.mp3'
            ];
            let musicOrder = [];
            let musicIndex = 0;
            let musicAudio = null;
            let runStartedByPlayer = false;
            const GAME_MODES = { adventure: 'adventure', endurance: 'endurance', tutorial: 'tutorial' };
            let currentGameMode = GAME_MODES.adventure;
            function setGameMode(nextMode) {
                const raw = String(nextMode || '').toLowerCase();
                const normalized = raw === GAME_MODES.endurance
                    ? GAME_MODES.endurance
                    : (raw === GAME_MODES.tutorial ? GAME_MODES.tutorial : GAME_MODES.adventure);
                currentGameMode = normalized;
                try {
                    if (document.body) document.body.dataset.gameMode = normalized;
                } catch (e) { }
                try { window.currentGameMode = normalized; } catch (e) { }
                try {
                    if (typeof window.syncHighScoreForMode === 'function') {
                        window.syncHighScoreForMode(normalized);
                    }
                } catch (e) { }
                return normalized;
            }
            function isEnduranceMode() {
                return currentGameMode === GAME_MODES.endurance;
            }
            function isTutorialMode() {
                return currentGameMode === GAME_MODES.tutorial;
            }
            function isAdventureMode() {
                return !isEnduranceMode() && !isTutorialMode();
            }
            setGameMode(GAME_MODES.adventure);
            let musicOverrideMode = '';
            let musicOverrideFadeTimer = null;
            let musicWatchdogTimer = null;
            let musicWatchdogLastTime = -1;
            let musicWatchdogLastProgressAt = 0;
            let musicSilenceMs = 2000; // 2 seconds silence between tracks
            const AUDIO_PREF_MUSIC_ENABLED_KEY = 'goneViral_musicEnabled_v1';
            const AUDIO_PREF_SFX_ENABLED_KEY = 'goneViral_sfxEnabled_v1';
            const VISUAL_PREF_SIMPLE_VIRUS_ART_KEY = 'goneViral_simpleVirusArt_v1';
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
                evil1: 140,
                evil2: 140,
                evil3: 140,
                evil4: 140,
                evil5: 140,
                evil6: 140,
                zap: 120,
                boss_level: 350,
                level5_boss_hit: 320,
                level5_boss_dies: 420,
                miniboss_laugh: 300,
                miniboss_dies: 300,
                goop: 320,
                goop_be_dead: 420,
                techno_dead: 380,
                techno_jammer: 320,
                techno_duplicator: 260,
                glass_crack: 500,
                final_entrance: 900,
                double_deal: 500,
                win: 250,
                lose: 250,
                achievement: 220
            };
            const SFX_BURST_WINDOW_MS = 120;
            const SFX_BURST_MAX = 6;
            const SFX_VOLUME_MULTIPLIER = {
                blocker_move_1: 0.62,
                evil1: 0.62,
                evil2: 0.62,
                evil3: 0.62,
                evil4: 0.62,
                evil5: 0.62,
                evil6: 0.62,
                glass_crack: 1.6
            };
            const SFX_CRITICAL_KEYS = ['pop', 'grow', 'fill'];
            const SFX_LAZY_KEYS = ['nanostorm', 'blocker_move', 'blocker_move_1', 'evil1', 'evil2', 'evil3', 'evil4', 'evil5', 'evil6', 'zap', 'boss_level', 'level5_boss_hit', 'level5_boss_dies', 'miniboss_laugh', 'miniboss_dies', 'goop', 'goop_be_dead', 'techno_dead', 'techno_jammer', 'techno_duplicator', 'glass_crack', 'final_entrance', 'double_deal', 'win', 'lose', 'achievement', 'assistant_ai_0', 'assistant_ai_1', 'assistant_ai_2', 'assistant_ai_3', 'assistant_ai_4', 'assistant_ai_5', 'assistant_ai_6'];
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
            let simpleVirusArtEnabled = loadAudioEnabledPref(VISUAL_PREF_SIMPLE_VIRUS_ART_KEY, false);
            window.musicEnabled = musicEnabled;
            window.sfxEnabled = sfxEnabled;
            window.simpleVirusArtEnabled = simpleVirusArtEnabled;

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
                if (MINIBOSS_SPRITE_URL && level >= 5) images.push(MINIBOSS_SPRITE_URL);
                if (MINIBOSS_LEVEL10_SPRITE_URL && level >= 10) images.push(MINIBOSS_LEVEL10_SPRITE_URL);
                if (MINIBOSS_LEVEL15_SPRITE_URL && level >= 15) images.push(MINIBOSS_LEVEL15_SPRITE_URL);
                if (level >= 20) {
                    if (MINIBOSS_LEVEL20_PHASE1_SPRITE_URL) images.push(MINIBOSS_LEVEL20_PHASE1_SPRITE_URL);
                    if (MINIBOSS_LEVEL20_PHASE2_SPRITE_URL) images.push(MINIBOSS_LEVEL20_PHASE2_SPRITE_URL);
                    if (MINIBOSS_LEVEL20_PHASE3_SPRITE_URL) images.push(MINIBOSS_LEVEL20_PHASE3_SPRITE_URL);
                    if (BOSS20_PHASE2_SHATTER_SPRITE_URL) images.push(BOSS20_PHASE2_SHATTER_SPRITE_URL);
                }
                if (VIRUS1_SPRITE_SHEET_URL) images.push(VIRUS1_SPRITE_SHEET_URL);
                if (VIRUS2_SPRITE_SHEET_URL) images.push(VIRUS2_SPRITE_SHEET_URL);
                if (VIRUS3_SPRITE_SHEET_URL) images.push(VIRUS3_SPRITE_SHEET_URL);
                if (VIRUS4_SPRITE_SHEET_URL) images.push(VIRUS4_SPRITE_SHEET_URL);
                if (level <= 4) {
                    images.push(SPRITE_URLS[3], SPRITE_URLS[2]);
                } else if (level <= 9) {
                    images.push(SPRITE_URLS[2], SPRITE_URLS[1]);
                } else {
                    images.push(SPRITE_URLS[1], SPRITE_URLS[0]);
                }
                if (level >= 2) sfx.push('assistant_ai_' + (level % 7));
                if (level >= 4) sfx.push('nanostorm');
                if (level === 5 || level === 10 || level === 15) sfx.push('boss_level');
                if (level >= 5) sfx.push('miniboss_laugh', 'miniboss_dies', 'level5_boss_hit', 'level5_boss_dies');
                if (level >= 10) sfx.push('goop', 'goop_be_dead');
                if (level >= 15) sfx.push('techno_dead', 'techno_jammer', 'techno_duplicator');
                if (level >= 10) sfx.push('blocker_move', 'blocker_move_1', 'zap');
                if (level >= 20) sfx.push('glass_crack');
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
            function buildSpriteSheetKeyframes(name, cols, rows, frames) {
                const c = Math.max(1, Number(cols) || 1);
                const r = Math.max(1, Number(rows) || 1);
                const f = Math.max(1, Number(frames) || 1);
                const out = ['@keyframes ' + name + ' {'];
                for (let i = 0; i < f; i++) {
                    const start = (i / f) * 100;
                    const end = ((i + 1) / f) * 100;
                    const col = i % c;
                    const row = Math.floor(i / c);
                    const x = c > 1 ? (col / (c - 1)) * 100 : 0;
                    const y = r > 1 ? (row / (r - 1)) * 100 : 0;
                    out.push('  ' + start.toFixed(3) + '%, ' + end.toFixed(3) + '% { background-position: ' + x.toFixed(3) + '% ' + y.toFixed(3) + '%; }');
                }
                out.push('}');
                return out.join('\n');
            }
            function initVirus2SpriteAnimation() {
                if (!VIRUS2_SPRITE_SHEET_URL) return;
                const applyLayout = (cols, rows, frames) => {
                    const safeCols = Math.max(1, Number(cols) || 1);
                    const safeRows = Math.max(1, Number(rows) || 1);
                    const safeFrames = Math.max(1, Number(frames) || (safeCols * safeRows));
                    virus2SpriteLayout = {
                        cols: safeCols,
                        rows: safeRows,
                        frames: safeFrames,
                        durationMs: Math.round((safeFrames / Math.max(1, VIRUS2_SPRITE_FPS)) * 1000)
                    };
                    const id = 'virus2-sprite-keyframes';
                    let styleEl = document.getElementById(id);
                    if (!styleEl) {
                        styleEl = document.createElement('style');
                        styleEl.id = id;
                        document.head.appendChild(styleEl);
                    }
                    styleEl.textContent = buildSpriteSheetKeyframes('virus2SpriteFrames', safeCols, safeRows, safeFrames);
                    try { scheduleRender(); } catch (e) { }
                };

                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    const w = Number(img.naturalWidth) || 0;
                    const h = Number(img.naturalHeight) || 0;
                    const autoCols = Math.max(1, Math.floor(w / VIRUS2_SPRITE_CELL_PX));
                    const autoRows = Math.max(1, Math.floor(h / VIRUS2_SPRITE_CELL_PX));
                    const cols = Math.max(1, Number(VIRUS2_SPRITE_COLS) || autoCols);
                    const rows = Math.max(1, Number(VIRUS2_SPRITE_ROWS) || autoRows);
                    const sheetFrames = Math.max(1, cols * rows);
                    const frames = Math.max(1, Math.min(VIRUS2_SPRITE_FRAME_COUNT, sheetFrames));
                    applyLayout(cols, rows, frames);
                };
                img.onerror = () => {
                    applyLayout(1, 1, 1);
                };
                img.src = VIRUS2_SPRITE_SHEET_URL;
            }
            initVirus2SpriteAnimation();
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
                if (level20TalkSfxOnly) {
                    const k = String(key || '');
                    const isPixelTalk = k.indexOf('assistant_ai_') === 0;
                    const isBossTalk = (k === 'evil1' || k === 'evil2' || k === 'evil3' || k === 'evil4' || k === 'evil5' || k === 'evil6');
                    if (!isPixelTalk && !isBossTalk) return;
                }
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
            function startFinalBossTheme(opts = {}) {
                try {
                    if (!musicEnabled || !audioUserInteracted) return false;
                    const fadeInMs = Math.max(0, Math.floor(Number(opts.fadeInMs) || 0));
                    const initialRatio = Math.max(0, Math.min(1, Number(opts.initialVolumeRatio)));
                    musicOverrideMode = 'final-boss';
                    try {
                        if (musicOverrideFadeTimer) {
                            clearInterval(musicOverrideFadeTimer);
                            musicOverrideFadeTimer = null;
                        }
                    } catch (e) { }
                    if (musicAudio) {
                        try { musicAudio.pause(); } catch (e) { }
                        try { musicAudio.src = ''; } catch (e) { }
                        musicAudio = null;
                    }
                    musicAudio = new Audio(FINAL_BOSS_THEME_URL);
                    musicAudio.loop = true;
                    musicAudio.preload = 'auto';
                    musicAudio.crossOrigin = 'anonymous';
                    const targetVol = Math.max(0, Math.min(1, Number(window.musicVolume) || 0.20));
                    const startVol = fadeInMs > 0 ? Math.max(0.001, targetVol * initialRatio) : targetVol;
                    musicAudio.volume = startVol;
                    musicAudio.muted = !!window.allMuted;
                    try { window.musicAudio = musicAudio; } catch (e) { }
                    const p = musicAudio.play();
                    if (p && p.catch) p.catch(() => { });
                    ensureMusicPlaybackWatchdog();
                    if (fadeInMs > 0 && !window.allMuted) {
                        const stepMs = 40;
                        const steps = Math.max(1, Math.ceil(fadeInMs / stepMs));
                        let tick = 0;
                        musicOverrideFadeTimer = setInterval(() => {
                            tick += 1;
                            const t = Math.max(0, Math.min(1, tick / steps));
                            try { musicAudio.volume = Math.max(0.001, startVol + ((targetVol - startVol) * t)); } catch (e) { }
                            if (t >= 1) {
                                try { clearInterval(musicOverrideFadeTimer); } catch (e) { }
                                musicOverrideFadeTimer = null;
                            }
                        }, stepMs);
                    }
                    return true;
                } catch (e) {
                    return false;
                }
            }
            function stopFinalBossTheme(opts = {}) {
                const fadeOutMs = Math.max(0, Math.floor(Number(opts.fadeOutMs) || 0));
                const resumeNormal = opts.resumeNormal !== false;
                const isFinal = (musicOverrideMode === 'final-boss');
                const active = musicAudio || window.musicAudio;
                if (!isFinal && !active) return false;
                musicOverrideMode = '';
                const finalize = () => {
                    try {
                        if (musicOverrideFadeTimer) {
                            clearInterval(musicOverrideFadeTimer);
                            musicOverrideFadeTimer = null;
                        }
                    } catch (e) { }
                    try {
                        const a = musicAudio || window.musicAudio;
                        if (a) {
                            try { a.pause(); } catch (e) { }
                            try { a.currentTime = 0; } catch (e) { }
                            try { a.src = ''; } catch (e) { }
                        }
                    } catch (e) { }
                    musicAudio = null;
                    try { window.musicAudio = null; } catch (e) { }
                    if (resumeNormal && musicEnabled && audioUserInteracted && !window.allMuted) {
                        try { switchMusicForNewRun(); } catch (e) { }
                    }
                };
                if (!active || fadeOutMs <= 0) {
                    finalize();
                    return true;
                }
                const startVol = Math.max(0, Number(active.volume) || Number(window.musicVolume) || 0.20);
                const stepMs = 40;
                const steps = Math.max(1, Math.ceil(fadeOutMs / stepMs));
                let tick = 0;
                try {
                    if (musicOverrideFadeTimer) {
                        clearInterval(musicOverrideFadeTimer);
                        musicOverrideFadeTimer = null;
                    }
                } catch (e) { }
                musicOverrideFadeTimer = setInterval(() => {
                    tick += 1;
                    const t = Math.max(0, Math.min(1, tick / steps));
                    try { active.volume = Math.max(0, startVol * (1 - t)); } catch (e) { }
                    if (t >= 1) finalize();
                }, stepMs);
                return true;
            }
            function switchMusicForNewRun() {
                try {
                    if (!runStartedByPlayer) return;
                    if (!musicEnabled || !audioUserInteracted) return;
                    if (musicOverrideMode === 'final-boss') {
                        stopFinalBossTheme({ fadeOutMs: 0, resumeNormal: false });
                    }
                    if (!Array.isArray(MUSIC_PLAYLIST) || MUSIC_PLAYLIST.length === 0) return;
                    const active = getActiveMusicAudio();
                    const currentSrc = active && active.src ? String(active.src) : '';
                    const candidates = MUSIC_PLAYLIST.filter((u) => String(u || '') !== currentSrc);
                    const pickFrom = candidates.length ? candidates : MUSIC_PLAYLIST.slice();
                    if (!pickFrom.length) return;
                    const picked = pickFrom[Math.floor(Math.random() * pickFrom.length)];
                    const rest = MUSIC_PLAYLIST.filter((u) => String(u || '') !== String(picked || ''));
                    shuffleArray(rest);
                    musicOrder = [picked].concat(rest);
                    musicIndex = 0;
                    playNextMusicTrack();
                    ensureMusicPlaybackWatchdog();
                } catch (e) { }
            }
            function queueNextMusicTrackAfterDelay(delayMs = musicSilenceMs) {
                const wait = Math.max(0, Math.floor(Number(delayMs) || 0));
                setTimeout(() => {
                    try {
                        if (musicOverrideMode === 'final-boss') return;
                        if (!runStartedByPlayer) return;
                        if (!musicEnabled || !audioUserInteracted || !!window.allMuted) return;
                        musicIndex += 1;
                        playNextMusicTrack();
                    } catch (e) { }
                }, wait);
            }
            function playNextMusicTrack() {
                if (musicOverrideMode === 'final-boss') return;
                if (!runStartedByPlayer) return;
                if (!musicEnabled || !audioUserInteracted || !!window.allMuted) return;
                if (musicAudio) {
                    try { musicAudio.pause(); } catch (e) { }
                    try { musicAudio.src = ''; } catch (e) { }
                    musicAudio = null;
                }
                if (musicOrder.length === 0 || musicIndex >= musicOrder.length) prepareMusicOrder();
                const url = musicOrder[musicIndex];
                const track = new Audio(url);
                track.volume = (typeof musicVolume !== 'undefined') ? Number(musicVolume) || 0.20 : (window.musicVolume || 0.20);
                track.preload = 'auto';
                track.crossOrigin = 'anonymous';
                track.muted = !!window.allMuted;
                musicAudio = track;
                try { window.musicAudio = track; } catch (e) { }
                musicWatchdogLastTime = -1;
                musicWatchdogLastProgressAt = Date.now();
                let advanced = false;
                const cleanup = () => {
                    try { track.removeEventListener('ended', onEnded); } catch (e) { }
                    try { track.removeEventListener('error', onError); } catch (e) { }
                    try { track.removeEventListener('stalled', onError); } catch (e) { }
                    try { track.removeEventListener('abort', onError); } catch (e) { }
                };
                const advance = () => {
                    if (advanced) return;
                    advanced = true;
                    cleanup();
                    if (musicAudio !== track) return;
                    queueNextMusicTrackAfterDelay(musicSilenceMs);
                };
                const onEnded = () => advance();
                const onError = () => {
                    if (musicAudio !== track) return;
                    advance();
                };
                track.addEventListener('ended', onEnded);
                track.addEventListener('error', onError);
                track.addEventListener('stalled', onError);
                track.addEventListener('abort', onError);
                const playPromise = track.play();
                if (playPromise && playPromise.catch) {
                    playPromise.catch(() => {
                        if (musicAudio !== track) return;
                        advance();
                    });
                }
                ensureMusicPlaybackWatchdog();
            }
            function nudgeMusicPlaybackHealth(reason = 'watchdog') {
                try {
                    if (!runStartedByPlayer && musicOverrideMode !== 'final-boss') return;
                    if (!musicEnabled || !audioUserInteracted || !!window.allMuted || document.hidden) return;
                    if (isFinalVictoryActive()) return;
                    if (musicOverrideMode !== 'final-boss') {
                        if (finalCreditsMusicAudio && !finalCreditsMusicAudio.paused) return;
                    }
                    const active = getActiveMusicAudio();
                    if (!active) {
                        if (musicOverrideMode === 'final-boss') startFinalBossTheme({ fadeInMs: 320, initialVolumeRatio: 0.1 });
                        else playNextMusicTrack();
                        return;
                    }
                    if (active.ended) {
                        if (musicOverrideMode === 'final-boss') startFinalBossTheme({ fadeInMs: 320, initialVolumeRatio: 0.1 });
                        else queueNextMusicTrackAfterDelay(0);
                        return;
                    }
                    if (active.paused) {
                        const p = active.play();
                        if (p && p.catch) {
                            p.catch(() => {
                                if (musicOverrideMode === 'final-boss') startFinalBossTheme({ fadeInMs: 320, initialVolumeRatio: 0.1 });
                                else queueNextMusicTrackAfterDelay(0);
                            });
                        }
                        return;
                    }
                    const now = Date.now();
                    const ct = Math.max(0, Number(active.currentTime) || 0);
                    const lastCt = Number(musicWatchdogLastTime);
                    const progressedForward = ct > (Number.isFinite(lastCt) ? lastCt : 0) + 0.03;
                    // Looping tracks reset currentTime back to ~0; treat that as healthy progress.
                    const loopWrapped = Number.isFinite(lastCt) && lastCt >= 0.4 && ct + 0.15 < lastCt;
                    if (progressedForward || loopWrapped) {
                        musicWatchdogLastTime = ct;
                        musicWatchdogLastProgressAt = now;
                        return;
                    }
                    if (!musicWatchdogLastProgressAt) musicWatchdogLastProgressAt = now;
                    const stuckMs = now - Number(musicWatchdogLastProgressAt || now);
                    if (stuckMs < 16000) return;
                    if (musicOverrideMode === 'final-boss') {
                        startFinalBossTheme({ fadeInMs: 280, initialVolumeRatio: 0.08 });
                    } else {
                        queueNextMusicTrackAfterDelay(0);
                    }
                    musicWatchdogLastProgressAt = now;
                    musicWatchdogLastTime = -1;
                } catch (e) { }
            }
            function ensureMusicPlaybackWatchdog() {
                if (musicWatchdogTimer) return;
                musicWatchdogTimer = setInterval(() => {
                    nudgeMusicPlaybackHealth('interval');
                }, 3500);
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

            function startBackgroundMusic() {
                try {
                    if (!runStartedByPlayer) return;
                    if (!musicOrder.length) prepareMusicOrder();
                    playNextMusicTrack();
                    ensureMusicPlaybackWatchdog();
                } catch (e) { console.warn('startBackgroundMusic failed', e); }
            }
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
                    musicWatchdogLastTime = -1;
                    musicWatchdogLastProgressAt = 0;
                } catch (e) {
                    // final safety - don't leak exceptions to UI
                    console.warn('stopBackgroundMusic error', e);
                }
            }

            // Game difficulty & state
            let clicksLeft = 10, screensPassed = 0, totalScore = 0;
            let levelAdvancePending = false;
            let outOfClicksShown = false;
            const RUN_CONTINUE_CONFIG = {
                enabled: true,
                maxUsesPerRun: 1,
                disabledAtLevel: 20,
                grantClicks: 10
            };
            let runContinueUses = 0;
            let continueOfferOpen = false;
            let continueOfferPopupEl = null;
            let state = new Array(ROWS * COLS).fill(null);
            let specialState = new Array(ROWS * COLS).fill(null);
            let specialMetaState = new Array(ROWS * COLS).fill(null);
            let inputLocked = false;
            const MAX_STORM_CHARGES = 1;
            const BOSS_GOO_SHIELD_CONFIG = {
                enabled: true,
                level: 10,
                tickMinMs: 3000,
                tickMaxMs: 3000,
                minTargets: 1,
                maxTargets: 1,
                firstSpitDelayMs: 1100,
                freshPulseMs: 650
            };
            const BIOFILM_CONFIG = {
                enabled: true,
                unlockLevel: 10,
                maxHitsPerCell: 2,
                countsByBand: [
                    { minLevel: 10, maxLevel: 14, count: 2 },
                    { minLevel: 15, maxLevel: 19, count: 3 },
                    { minLevel: 20, maxLevel: 999, count: 4 }
                ]
            };
            const TECHNO_GREMLIN_POWER_CONFIG = {
                enabled: true,
                level: 15,
                powerTickMinMs: 3800,
                powerTickMaxMs: 6200,
                firstPowerDelayMs: 1700,
                jamDurationMinMs: 6200,
                jamDurationMaxMs: 8200,
                overclockDurationMinMs: 3800,
                overclockDurationMaxMs: 5600,
                overclockSpeedMult: 1.55
            };
            let bossGooShieldHits = new Array(ROWS * COLS).fill(0);
            let bossGooShieldStyle = new Array(ROWS * COLS).fill(null);
            let bossGooShieldTimer = null;
            let biofilmHits = new Array(ROWS * COLS).fill(0);
            let biofilmUntil = new Array(ROWS * COLS).fill(0);
            let biofilmStyle = new Array(ROWS * COLS).fill(null);
            let biofilmTimer = null;
            let boss20PhaseTimer = null;
            let boss20FinalWindowTimer = null;
            let boss20Phase3TransitionTimer = null;
            let boss20VoiceTimer = null;
            let boss20LaughLastAt = 0;
            let boss20ComboCutoffUntil = 0;
            let boss20ComboCutoffResumeTimer = null;
            let boss20FinalFormOverlayEl = null;
            let boss20FinalShotReticleEl = null;
            let technoGremlinPowerTimer = null;
            let technoGremlinJamUntil = 0;
            let technoGremlinOverclockUntil = 0;
            let technoGremlinJamExpireTimer = null;
            let technoGremlinOverclockExpireTimer = null;
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
                    unlockLevel: 5,
                    spawnWeight: 1.0,
                    hooks: {
                        onBeforeGrow: specialHookArmoredBeforeGrow
                    }
                },
                boss: {
                    id: 'boss',
                    label: 'Mutant Core',
                    badge: 'B',
                    className: 'special-boss',
                    enabled: false,
                    unlockLevel: 999,
                    spawnWeight: 0,
                    hooks: {
                        onBeforeGrow: specialHookBossBeforeGrow
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
                window.setMiniBossEnabled = function (enabled) {
                    FEATURE_FLAGS.miniBoss = !!enabled;
                    try { randomizeBoard(false); } catch (e) { }
                    return FEATURE_FLAGS.miniBoss;
                };
                window.setBossGooShieldsEnabled = function (enabled) {
                    FEATURE_FLAGS.bossGooShields = !!enabled;
                    if (!FEATURE_FLAGS.bossGooShields) {
                        resetBossGooShieldState(true);
                    } else {
                        ensureBossGooShieldTimer();
                    }
                    scheduleRender();
                    return FEATURE_FLAGS.bossGooShields;
                };
                window.BossGooShields = {
                    config: BOSS_GOO_SHIELD_CONFIG,
                    setEnabled: function (enabled) { return window.setBossGooShieldsEnabled(enabled); },
                    trigger: function () { return triggerBossGooShieldSpit('debug'); },
                    clear: function () { resetBossGooShieldState(false); scheduleRender(); return true; },
                    activeCells: function () {
                        const out = [];
                        for (let i = 0; i < bossGooShieldHits.length; i++) {
                            if ((Number(bossGooShieldHits[i]) || 0) > 0 && state[i] !== null) out.push(i);
                        }
                        return out;
                    }
                };
                window.Biofilm = {
                    get config() { return BIOFILM_CONFIG; },
                    state: function () {
                        const out = [];
                        for (let i = 0; i < biofilmHits.length; i++) {
                            if ((Number(biofilmHits[i]) || 0) > 0) {
                                out.push({ index: i, hits: Number(biofilmHits[i]) || 0, until: Number(biofilmUntil[i]) || 0 });
                            }
                        }
                        return out;
                    },
                    seed: function (force = true) {
                        const added = seedBiofilmForBoard(!!force);
                        scheduleRender();
                        return { added };
                    },
                    clear: function () {
                        resetBiofilmState(false);
                        scheduleRender();
                        return true;
                    }
                };
                window.BossPacing = {
                    get profile() { return BOSS_PACING_PROFILE; },
                    get: function (levelNum = getCurrentLevelNumber(), phaseNum = null, desperation = false) {
                        const lvl = Math.max(1, Math.floor(Number(levelNum) || getCurrentLevelNumber()));
                        const ctx = { phase: Number.isFinite(Number(phaseNum)) ? Math.max(1, Math.floor(Number(phaseNum))) : getBossPhaseContext(lvl, null).phase, desperation: !!desperation };
                        return JSON.parse(JSON.stringify(getBossPacingProfile(lvl, ctx)));
                    },
                    ensureFuel: function (levelNum = getCurrentLevelNumber(), force = true) {
                        const lvl = Math.max(1, Math.floor(Number(levelNum) || getCurrentLevelNumber()));
                        const bosses = getBossIndicesForLevel(lvl);
                        const origin = bosses.length ? bosses[0] : null;
                        const added = ensureBossBoardFuel(lvl, origin, { force: !!force });
                        return { level: lvl, added };
                    },
                    fuelState: function (levelNum = getCurrentLevelNumber()) {
                        const lvl = Math.max(1, Math.floor(Number(levelNum) || getCurrentLevelNumber()));
                        let nonBoss = 0;
                        let empties = 0;
                        for (let i = 0; i < state.length; i++) {
                            if (specialState[i] === 'boss') continue;
                            if (state[i] === null) empties++;
                            else nonBoss++;
                        }
                        return { level: lvl, nonBoss, empties, lastFuelAt: Number(bossFuelLastAtByLevel[lvl]) || 0 };
                    }
                };
                window.setLevel = function (levelNum) {
                    try { markRunModified('set-level'); } catch (e) { }
                    const targetLevel = Math.max(1, Math.floor(Number(levelNum) || 1));
                    screensPassed = targetLevel - 1;
                    try { applyVisualPhase(targetLevel); } catch (e) { }
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
                    try {
                        const finalOfferLevel = Math.max(1, Math.floor(Number(FINAL_OFFER_CONFIG && FINAL_OFFER_CONFIG.level) || 20));
                        if (targetLevel === finalOfferLevel && FINAL_OFFER_CONFIG && FINAL_OFFER_CONFIG.enabled !== false) {
                            runPerkState.finalOfferPending = true;
                            runPerkState.finalOfferSeen = false;
                            runPerkState.finalOfferChoice = '';
                            runPerkState.popupOpen = false;
                            try { hideFinalOfferPopup(true); } catch (e) { }
                            setTimeout(() => {
                                try { maybeShowPendingFinalOfferPopup(20); } catch (e) { }
                            }, 0);
                        }
                    } catch (e) { }
                    try { syncRotatingBlockerUI(); } catch (e) { }
                    return { level: targetLevel, blockerActive: isRotatingBlockerActive(targetLevel), miniBossLevel: isMiniBossLevel(targetLevel) };
                };
                window.getLevel = function () {
                    return getCurrentLevelNumber();
                };
                window.setGameMode = function (mode) {
                    const applied = setGameMode(mode);
                    return { mode: applied };
                };
                window.getGameMode = function () {
                    return currentGameMode;
                };
                window.startTutorial = function () {
                    try { startTutorialMode(); } catch (e) { }
                    return { mode: currentGameMode, active: !!tutorialModeState.active, step: Number(tutorialModeState.stepIndex) + 1 };
                };
                window.stopTutorial = function () {
                    try { stopTutorialMode(); } catch (e) { }
                    return { mode: currentGameMode, active: !!tutorialModeState.active };
                };
                window.addClicks = function (amount = 1, allowOverCap = false) {
                    try { markRunModified('add-clicks'); } catch (e) { }
                    const delta = Math.floor(Number(amount) || 0);
                    if (!Number.isFinite(delta) || delta === 0) {
                        return { clicks: clicksLeft, cap: getMaxClicksCap(), changed: 0 };
                    }
                    const before = Number(clicksLeft) || 0;
                    const next = before + delta;
                    clicksLeft = allowOverCap
                        ? Math.max(0, next)
                        : Math.max(0, Math.min(getMaxClicksCap(), next));
                    try { updateHUD(); } catch (e) { }
                    return {
                        clicks: clicksLeft,
                        cap: getMaxClicksCap(),
                        changed: clicksLeft - before,
                        allowOverCap: !!allowOverCap
                    };
                };
                window.RunPerks = {
                    state: function () {
                        return JSON.parse(JSON.stringify(runPerkState));
                    },
                    queue: function (count = 1) {
                        try { markRunModified('perk-queue'); } catch (e) { }
                        const n = Math.max(0, Math.floor(Number(count) || 0));
                        runPerkState.pendingOffers = Math.max(0, Number(runPerkState.pendingOffers) || 0) + n;
                        setTimeout(() => { try { maybeShowPendingRunPerkPopup(); } catch (e) { } }, 0);
                        return { pendingOffers: runPerkState.pendingOffers };
                    },
                    grant: function (perkId) {
                        try { markRunModified('perk-grant'); } catch (e) { }
                        const id = applyRunPerkChoice(perkId);
                        updateHUD();
                        return { granted: id, state: JSON.parse(JSON.stringify(runPerkState)) };
                    },
                    reset: function () {
                        try { markRunModified('perk-reset'); } catch (e) { }
                        resetRunPerkState();
                        updateHUD();
                        return JSON.parse(JSON.stringify(runPerkState));
                    }
                };
                window.FinalOffer = {
                    state: function () {
                        return {
                            enabled: !!(FINAL_OFFER_CONFIG && FINAL_OFFER_CONFIG.enabled !== false),
                            level: Math.max(1, Math.floor(Number(FINAL_OFFER_CONFIG && FINAL_OFFER_CONFIG.level) || 20)),
                            pending: !!(runPerkState && runPerkState.finalOfferPending),
                            seen: !!(runPerkState && runPerkState.finalOfferSeen),
                            choice: String(runPerkState && runPerkState.finalOfferChoice || ''),
                            disableScoreDeals: !!(runPerkState && runPerkState.disableScoreDeals),
                            bossHpScale: Number(runPerkState && runPerkState.finalBossHpScale) || 1
                        };
                    },
                    queueNow: function () {
                        try { markRunModified('final-offer-queue'); } catch (e) { }
                        if (!runPerkState) return false;
                        runPerkState.finalOfferPending = true;
                        setTimeout(() => {
                            try { if (!inputLocked && !stormResolving) showFinalOfferPopup(); } catch (e) { }
                        }, 0);
                        return true;
                    },
                    reset: function () {
                        try { markRunModified('final-offer-reset'); } catch (e) { }
                        if (!runPerkState) return false;
                        runPerkState.finalOfferPending = false;
                        runPerkState.finalOfferSeen = false;
                        runPerkState.finalOfferChoice = '';
                        runPerkState.disableScoreDeals = false;
                        runPerkState.finalBossHpScale = 1;
                        runPerkState.finalBossSlowUntil = 0;
                        try { stopFinalBossTheme({ fadeOutMs: 0, resumeNormal: false }); } catch (e) { }
                        hideFinalOfferPopup(true);
                        updateHUD();
                        return true;
                    }
                };
                window.Boss20 = {
                    state: function () {
                        return JSON.parse(JSON.stringify(boss20State));
                    },
                    triggerPhase1Action: function () {
                        return triggerBoss20Phase1Action('debug');
                    },
                    triggerAction: function () {
                        return triggerBoss20Phase1Action('debug');
                    },
                    triggerRescue: function () {
                        const bosses = getBossIndicesForLevel(20);
                        if (!bosses.length) return false;
                        const idx = bosses[0];
                        const meta = ensureSpecialMeta(idx) || {};
                        meta.phase = Math.max(2, Math.floor(Number(meta.phase) || 2));
                        specialMetaState[idx] = meta;
                        boss20State.phase = meta.phase;
                        return triggerBoss20RescueSequence(idx, meta);
                    },
                    rescue: function () {
                        return this.triggerRescue();
                    },
                    setHP: function (hpValue) {
                        const bosses = getBossIndicesForLevel(20);
                        if (!bosses.length) return null;
                        const idx = bosses[0];
                        const meta = ensureSpecialMeta(idx) || {};
                        const hp = Math.max(0, Number(hpValue) || 0);
                        const maxHp = Math.max(1, Number(meta.maxHp) || hp || 1);
                        meta.hp = Math.min(maxHp, hp);
                        specialMetaState[idx] = meta;
                        boss20State.active = true;
                        boss20State.hp = meta.hp;
                        boss20State.maxHp = maxHp;
                        if (Math.max(1, Math.floor(Number(meta.phase) || Number(boss20State.phase) || 1)) === 2) {
                            const ratio = Math.max(0, Math.min(1, (Number(meta.hp) || 0) / Math.max(1, Number(meta.maxHp) || 1)));
                            if (ratio <= Math.max(0.05, Math.min(0.95, Number(EPIC_BOSS20_PHASE2_DESPERATION_RATIO) || 0.33))) {
                                try { enterBoss20Phase2Desperation(idx, meta); } catch (e) { }
                            }
                        }
                        setMiniBossStateFromMeta(idx, meta);
                        scheduleRender();
                        updateHUD();
                        return { index: idx, hp: meta.hp, maxHp: maxHp, phase: Number(meta.phase) || 1 };
                    },
                    setPhase: function (phaseValue) {
                        const bosses = getBossIndicesForLevel(20);
                        if (!bosses.length) return null;
                        const idx = bosses[0];
                        const meta = ensureSpecialMeta(idx) || {};
                        const ph = Math.max(1, Math.min(3, Math.floor(Number(phaseValue) || 1)));
                        meta.phase = ph;
                        if (ph <= 1) {
                            const hp = getBoss20ScaledHp(EPIC_BOSS20_PHASE1_HP);
                            meta.maxHp = hp;
                            meta.hp = Math.min(hp, Math.max(1, Number(meta.hp) || hp));
                            boss20State.actionCadenceMs = EPIC_BOSS20_PHASE1_ACTION_MS;
                        } else if (ph === 2) {
                            const hp = getBoss20ScaledHp(EPIC_BOSS20_PHASE2_HP);
                            meta.maxHp = hp;
                            meta.hp = Math.min(hp, Math.max(1, Number(meta.hp) || hp));
                            boss20State.actionCadenceMs = EPIC_BOSS20_PHASE2_ACTION_MS;
                        } else {
                            const hp = getBoss20ScaledHp(EPIC_BOSS20_PHASE3_HP);
                            meta.maxHp = hp;
                            meta.hp = Math.min(hp, Math.max(1, Number(meta.hp) || hp));
                            boss20State.actionCadenceMs = EPIC_BOSS20_PHASE3_ACTION_MS;
                        }
                        specialMetaState[idx] = meta;
                        boss20State.active = true;
                        boss20State.phase = ph;
                        boss20State.hp = Math.max(0, Number(meta.hp) || 0);
                        boss20State.maxHp = Math.max(1, Number(meta.maxHp) || 1);
                        boss20State.inCinematic = false;
                        boss20State.inFinalWindow = false;
                        boss20State.finalChargeUntil = 0;
                        boss20State.finalWindowUntil = 0;
                        boss20State.weakPointUntil = 0;
                        boss20State.heroMarkUntil = 0;
                        boss20State.heroMarkCell = idx;
                        boss20State.nextHeroMarkAt = (ph >= 3) ? (Date.now() + 2200) : 0;
                        boss20State.phase3Started = ph >= 3;
                        boss20State.phase2DesperationActive = false;
                        boss20State.phase2DesperationStartedAt = 0;
                        boss20State.phase2RescueQueued = false;
                        boss20State.phase2LastRegenAt = 0;
                        boss20State.phase3LastRegenAt = 0;
                        boss20State.phase3LastClickDrainAt = 0;
                        boss20State.phase2OmegaQueued = false;
                        setMiniBossStateFromMeta(idx, meta);
                        scheduleRender();
                        ensureBoss20PhaseTimer();
                        return JSON.parse(JSON.stringify(boss20State));
                    },
                    triggerPhase3: function () {
                        const bosses = getBossIndicesForLevel(20);
                        if (!bosses.length) return false;
                        const idx = bosses[0];
                        const meta = ensureSpecialMeta(idx) || {};
                        return triggerBoss20PhaseThreeTransition(idx, meta);
                    },
                    triggerFinalWindow: function () {
                        const bosses = getBossIndicesForLevel(20);
                        if (!bosses.length) return false;
                        const idx = bosses[0];
                        const meta = ensureSpecialMeta(idx) || {};
                        meta.phase = Math.max(3, Math.floor(Number(meta.phase) || 3));
                        specialMetaState[idx] = meta;
                        boss20State.phase = meta.phase;
                        return triggerBoss20FinalWindow(idx, meta);
                    },
                    forceRegen: function () {
                        const bosses = getBossIndicesForLevel(20);
                        if (!bosses.length) return 0;
                        const idx = bosses[0];
                        boss20State.phase3LastRegenAt = 0;
                        const healed = maybeApplyBoss20Phase3Regen(idx);
                        scheduleRender();
                        return healed;
                    },
                    setEnabled: function (enabled) {
                        FEATURE_FLAGS.epicBoss20 = !!enabled;
                        if (!FEATURE_FLAGS.epicBoss20) resetBoss20State();
                        try { syncRotatingBlockerUI(); } catch (e) { }
                        return FEATURE_FLAGS.epicBoss20;
                    }
                };
                // Backward-compatible debug aliases for console testing across older builds.
                try {
                    const b20 = window.Boss20 || {};
                    if (typeof b20.triggerPhase3 !== 'function' && typeof b20.setPhase === 'function') {
                        b20.triggerPhase3 = function () { return b20.setPhase(3); };
                    }
                    if (typeof b20.triggerFinalWindow !== 'function') {
                        b20.triggerFinalWindow = function () {
                            if (typeof b20.setPhase === 'function') b20.setPhase(3);
                            if (typeof b20.setHP === 'function') return b20.setHP(2);
                            return false;
                        };
                    }
                    if (typeof b20.trigerFinalWindow !== 'function') {
                        b20.trigerFinalWindow = function () { return b20.triggerFinalWindow(); };
                    }
                    if (typeof b20.triggerFinalWIndow !== 'function') {
                        b20.triggerFinalWIndow = function () { return b20.triggerFinalWindow(); };
                    }
                    window.Boss20 = b20;
                } catch (e) { }
                try {
                    window.Boss20Finale = {
                        trigger: function () { return triggerLevel20FinalVictorySequence(); },
                        clear: function () { clearFinalVictorySequence(true); return true; },
                        state: function () { return JSON.parse(JSON.stringify(finalVictoryState)); }
                    };
                } catch (e) { }
            } catch (e) { }
            let blockerOrientationDeg = 0; // only 0 or 90
            let blockerLaneIndex = 2; // boundary between rows/cols (0-based lane index)
            let blockerTickTimer = null;
            let blockerFlashTimeout = null;
            let blockerUserBoostUntil = 0;
            let boss20BlockerHidden = false;
            let boss20BlockerPaused = false;
            let blockerRetreatUntil = 0;
            let stormCharges = 1;
            let stormArmed = false;
            let stormHoverIndex = null;
            let stormResolving = false;
            let stormChainPops = 0;
            let stormChainResetTimer = null;
            let stormChargeFlashTimer = null;
            const growthTweenByIndex = new Map();
            let comboInsurance = 0;
            const COMBO_INSURANCE_CAP = 1;
            const COMBO_INSURANCE_CHAIN_START = 15;
            const MINI_BOSS_CLICK_BONUS = 6;
            const EPIC_BOSS20_PHASE1_HP = 16;
            const EPIC_BOSS20_PHASE1_ACTION_MS = 3400;
            const EPIC_BOSS20_PHASE2_HP = 30;
            const EPIC_BOSS20_PHASE2_ACTION_MS = 2000;
            const EPIC_BOSS20_PHASE2_DESPERATION_RATIO = 0.33;
            const EPIC_BOSS20_PHASE2_DESPERATION_ACTION_MS = 1200;
            const EPIC_BOSS20_PHASE2_DESPERATION_MIN_CADENCE_MS = 760;
            const EPIC_BOSS20_PHASE2_DESPERATION_RAMP_MS = 9000;
            const EPIC_BOSS20_PHASE2_RESCUE_CLICK_THRESHOLD = 2;
            const EPIC_BOSS20_PHASE2_DESPERATION_HP_FLOOR_RATIO = 0.22;
            const EPIC_BOSS20_PHASE2_DESPERATION_HP_FLOOR_MAX_RATIO = 0.36;
            const EPIC_BOSS20_PHASE2_DESPERATION_REGEN_MIN_MS = 650;
            const EPIC_BOSS20_PHASE2_REPOP_DENSITY = 0.62;
            const EPIC_BOSS20_PHASE2_REPOP_MIN_NON_BOSS = 20;
            const EPIC_BOSS20_PHASE2_REPOP_MAX_NON_BOSS = 24;
            const EPIC_BOSS20_PHASE2_REPOP_SIZE_MIX = [0.12, 0.28, 0.36, 0.24];
            const EPIC_BOSS20_PHASE_SHIFT_MS = 2200;
            const EPIC_BOSS20_PHASE_SHIFT_CLICK_REWARD = 8;
            const EPIC_BOSS20_RESCUE_CLICK_REFILL = 14;
            const EPIC_BOSS20_RESCUE_STORM_REFILL = 1;
            const EPIC_BOSS20_PHASE2_BREAK_FREEZE_MS = 2000;
            const EPIC_BOSS20_PHASE2_BREAK_FLASH_MS = 500;
            const EPIC_BOSS20_PHASE2_BREAK_SHATTER_MS = 440;
            const EPIC_BOSS20_PHASE2_BREAK_SHAKE_MS = 820;
            const EPIC_BOSS20_PHASE2_BREAK_SFX_LEAD_MS = 240;
            const EPIC_BOSS20_PHASE2_POST_SWAP_HOLD_MS = 2000;
            const EPIC_BOSS20_PHASE2_TO_RESCUE_BLACKOUT_MS = 800;
            const EPIC_BOSS20_FINALFORM_PRE_RESCUE_HOLD_MS = 2000;
            const EPIC_BOSS20_PHASE2_TO_PHASE3_HP_RATIO = 0.10;
            const EPIC_BOSS20_RESCUE_CINEMATIC_MS = 1800;
            const EPIC_BOSS20_RESCUE_STALL_MS = 4000;
            const EPIC_BOSS20_PHASE3_HP = 24;
            const EPIC_BOSS20_PHASE3_ACTION_MS = 1800;
            const EPIC_BOSS20_PHASE3_OPENING_MIX = [0.24, 0.34, 0.28, 0.14];
            const EPIC_BOSS20_PHASE3_ENTRY_BURSTS = 4;
            const EPIC_BOSS20_PHASE3_ENTRY_BURST_INTERVAL_MS = 260;
            const EPIC_BOSS20_PHASE3_REGEN_ENABLED = true;
            const EPIC_BOSS20_PHASE3_REGEN_AMOUNT = 2;
            const EPIC_BOSS20_PHASE3_REGEN_MIN_MS = 3000;
            const EPIC_BOSS20_PHASE3_REGEN_CHANCE = 0.35;
            const EPIC_BOSS20_HERO_MARK_EVERY_MS = 7000;
            const EPIC_BOSS20_HERO_MARK_DURATION_MS = 3000;
            const EPIC_BOSS20_HERO_MARK_DAMAGE_MULT = 1.6;
            const EPIC_BOSS20_FINAL_WINDOW_HP = 2;
            const EPIC_BOSS20_PHASE3_PRE_FINAL_HP_FLOOR = 1;
            const EPIC_BOSS20_FINAL_CHARGE_MS = 1200;
            const EPIC_BOSS20_FINAL_WINDOW_MS = 2500;
            const EPIC_BOSS20_FINAL_DAMAGE_MULT = 2;
            const EPIC_BOSS20_PHASE3_SHIFT_MS = 1700;
            const EPIC_BOSS20_COMBO_CUTOFF_ENABLED = true;
            const EPIC_BOSS20_COMBO_CUTOFF_AT = 12;
            const EPIC_BOSS20_COMBO_CUTOFF_LOCK_MS = 240;
            const EPIC_BOSS20_COMBO_CUTOFF_FLASH_MS = 120;
            const EPIC_BOSS20_COMBO_CUTOFF_SFX = 'techno_jammer';
            // Modular boss pacing profile:
            // - `minNonBossViruses`: keep at least this many non-boss viruses alive during boss combat.
            // - `fuelSpawnSizeWeights`: [S1,S2,S3,S4] mix used when replenishing board fuel.
            // - `fuelArmoredChance`: chance replenished viruses start armored.
            // - `fuelCooldownMs`: minimum delay between automatic replenishment pulses.
            // - `spawnSizeWeights` / `armoredChance`: defaults for boss-driven spawn bursts.
            const BOSS_PACING_PROFILE = {
                default: {
                    minNonBossViruses: 0,
                    fuelSpawnSizeWeights: [0.04, 0.24, 0.46, 0.26],
                    fuelArmoredChance: 0.0,
                    fuelCooldownMs: 1500,
                    spawnSizeWeights: null,
                    armoredChance: null
                },
                5: {
                    minNonBossViruses: 12,
                    fuelSpawnSizeWeights: [0.00, 0.16, 0.54, 0.30],
                    fuelArmoredChance: 0.20,
                    fuelCooldownMs: 1700,
                    spawnSizeWeights: [0.00, 0.16, 0.56, 0.28],
                    armoredChance: 1.0
                },
                10: {
                    minNonBossViruses: 14,
                    fuelSpawnSizeWeights: [0.02, 0.24, 0.48, 0.26],
                    fuelArmoredChance: 0.18,
                    fuelCooldownMs: 1500,
                    spawnSizeWeights: [0.00, 0.12, 0.50, 0.38],
                    armoredChance: 0.5
                },
                15: {
                    minNonBossViruses: 15,
                    fuelSpawnSizeWeights: [0.02, 0.22, 0.48, 0.28],
                    fuelArmoredChance: 0.16,
                    fuelCooldownMs: 1400
                },
                20: {
                    phase1: {
                        minNonBossViruses: 16,
                        fuelSpawnSizeWeights: [0.00, 0.10, 0.56, 0.34],
                        fuelArmoredChance: 0.22,
                        fuelCooldownMs: 1200,
                        spawnSizeWeights: [0.00, 0.00, 0.70, 0.30],
                        armoredChance: 1.0
                    },
                    phase2: {
                        minNonBossViruses: 17,
                        fuelSpawnSizeWeights: [0.06, 0.22, 0.40, 0.32],
                        fuelArmoredChance: 0.26,
                        fuelCooldownMs: 1150,
                        spawnSizeWeights: [0.04, 0.22, 0.40, 0.34],
                        armoredChance: 1.0,
                        stormRechargeDelta: 4
                    },
                    phase2Desperation: {
                        minNonBossViruses: 20,
                        fuelSpawnSizeWeights: [0.64, 0.26, 0.08, 0.02],
                        fuelArmoredChance: 0.36,
                        fuelCooldownMs: 760,
                        spawnSizeWeights: [1.00, 0.00, 0.00, 0.00],
                        armoredChance: 1.0
                    },
                    phase3: {
                        minNonBossViruses: 17,
                        fuelSpawnSizeWeights: [0.18, 0.36, 0.30, 0.16],
                        fuelArmoredChance: 0.24,
                        fuelCooldownMs: 920,
                        spawnSizeWeights: [0.18, 0.34, 0.30, 0.18],
                        armoredChance: 1.0,
                        stormRechargeDelta: 5,
                        clickDrainChance: 0.32,
                        clickDrainCooldownMs: 3200,
                        clickDrainAmount: 1,
                        clickDrainMinClicks: 3
                    }
                }
            };
            const BOSS_BREAKPOINT_PROFILE = {
                5: {
                    counts: { b75: 1, b50: 2, b25: 2 },
                    armorOpts: { anyBoardChance: 0.10, offAxisChance: 0.14, spawnSizeWeights: [0, 0.16, 0.56, 0.28] }
                },
                10: {
                    counts: { b75: 1, b50: 2, b25: 2 },
                    armorOpts: { anyBoardChance: 0.20, offAxisChance: 0.24, spawnSizeWeights: [0, 0.12, 0.50, 0.38] }
                },
                15: {
                    counts: { b75: 1, b50: 2, b25: 2 },
                    projection: true
                },
                20: {
                    phase1: {
                        counts: { b75: 1, b50: 2, b25: 2 },
                        armorOpts: { anyBoardChance: 0.16, offAxisChance: 0.20, spawnSizeWeights: [0, 0, 0.70, 0.30] }
                    },
                    phase2: {
                        counts: { b75: 1, b50: 2, b25: 2 },
                        armorOpts: { anyBoardChance: 0.28, offAxisChance: 0.30, spawnSizeWeights: [0, 0, 0.64, 0.36] }
                    },
                    phase2Desperation: {
                        counts: { b75: 1, b50: 2, b25: 2 },
                        armorOpts: { anyBoardChance: 0.60, offAxisChance: 0.54, spawnSizeWeights: [1, 0, 0, 0] }
                    },
                    phase3: {
                        counts: { b75: 1, b50: 2, b25: 2 },
                        armorOpts: { anyBoardChance: 0.50, offAxisChance: 0.46, spawnSizeWeights: [0.12, 0.22, 0.40, 0.26] }
                    }
                }
            };
            let miniBossState = { active: false, index: -1, hp: 0, maxHp: 0 };
            function createDefaultBoss20State() {
                return {
                    active: false,
                    phase: 0,
                    hp: 0,
                    maxHp: 0,
                    actionCadenceMs: 0,
                    actionCounter: 0,
                    rescueUsed: false,
                    inCinematic: false,
                    inFinalWindow: false,
                    weakPointUntil: 0,
                    finalWindowUntil: 0,
                    finalChargeUntil: 0,
                    heroMarkUntil: 0,
                    heroMarkCell: -1,
                    nextHeroMarkAt: 0,
                    heroStallUntil: 0,
                    rescueShieldUntil: 0,
                    phase3Started: false,
                    phase2DesperationActive: false,
                    phase2DesperationStartedAt: 0,
                    phase2RescueQueued: false,
                    phase2LastRegenAt: 0,
                    phase3LastRegenAt: 0,
                    phase3LastClickDrainAt: 0,
                    phase2DrainInProgress: false,
                    phase2OmegaQueued: false,
                    comboCutoffHintShown: false,
                    finalShotActive: false,
                    finalShotTriggered: false,
                    finalShotTarget: -1,
                    finalShotRelease: false,
                    finalFormActive: false,
                    finalFormAnchor: -1,
                    finalFormCells: null
                };
            }

            function getBoss20CoreCells() {
                const r0 = Math.max(0, Math.floor((ROWS / 2) - 1));
                const r1 = Math.min(ROWS - 1, r0 + 1);
                const c0 = Math.max(0, Math.floor((COLS / 2) - 1));
                const c1 = Math.min(COLS - 1, c0 + 1);
                return [r0 * COLS + c0, r0 * COLS + c1, r1 * COLS + c0, r1 * COLS + c1];
            }

            function isBoss20FinalFormCell(index) {
                if (!isEpicBoss20Level()) return false;
                if (!boss20State || !boss20State.finalFormActive) return false;
                const idx = Math.floor(Number(index));
                if (!Number.isFinite(idx)) return false;
                const cells = Array.isArray(boss20State.finalFormCells) && boss20State.finalFormCells.length
                    ? boss20State.finalFormCells
                    : getBoss20CoreCells();
                return cells.indexOf(idx) >= 0;
            }

            function clearBoss20FinalFormOverlay() {
                try {
                    if (boss20FinalFormOverlayEl && boss20FinalFormOverlayEl.parentNode) {
                        boss20FinalFormOverlayEl.parentNode.removeChild(boss20FinalFormOverlayEl);
                    }
                } catch (e) { }
                boss20FinalFormOverlayEl = null;
            }

            function syncBoss20FinalFormOverlay() {
                try {
                    if (!isEpicBoss20Level() || !boss20State || !boss20State.finalFormActive || !boardEl) {
                        clearBoss20FinalFormOverlay();
                        return;
                    }
                    const cells = Array.isArray(boss20State.finalFormCells) && boss20State.finalFormCells.length
                        ? boss20State.finalFormCells.slice(0, 4)
                        : getBoss20CoreCells();
                    if (!cells.length) {
                        clearBoss20FinalFormOverlay();
                        return;
                    }
                    const rects = [];
                    for (let i = 0; i < cells.length; i++) {
                        const cellEl = boardEl.querySelector(`[data-index='${Math.floor(Number(cells[i]))}']`);
                        if (!cellEl) continue;
                        const r = cellEl.getBoundingClientRect();
                        if (r && r.width > 0 && r.height > 0) rects.push(r);
                    }
                    if (!rects.length) {
                        clearBoss20FinalFormOverlay();
                        return;
                    }
                    let minL = rects[0].left;
                    let minT = rects[0].top;
                    let maxR = rects[0].right;
                    let maxB = rects[0].bottom;
                    for (let i = 1; i < rects.length; i++) {
                        minL = Math.min(minL, rects[i].left);
                        minT = Math.min(minT, rects[i].top);
                        maxR = Math.max(maxR, rects[i].right);
                        maxB = Math.max(maxB, rects[i].bottom);
                    }
                    if (!boss20FinalFormOverlayEl) {
                        const el = document.createElement('div');
                        el.className = 'boss20-final-form-overlay';
                        const sheet = document.createElement('div');
                        sheet.className = 'boss20-final-form-sheet';
                        sheet.style.backgroundImage = `url('${MINIBOSS_LEVEL20_PHASE3_SPRITE_URL || MINIBOSS_LEVEL20_PHASE2_SPRITE_URL || MINIBOSS_SPRITE_URL}')`;
                        const hp = document.createElement('div');
                        hp.className = 'boss20-final-form-hp';
                        const hpFill = document.createElement('span');
                        hp.appendChild(hpFill);
                        el.appendChild(sheet);
                        el.appendChild(hp);
                        document.body.appendChild(el);
                        boss20FinalFormOverlayEl = el;
                    }
                    boss20FinalFormOverlayEl.style.left = `${Math.round(minL)}px`;
                    boss20FinalFormOverlayEl.style.top = `${Math.round(minT)}px`;
                    boss20FinalFormOverlayEl.style.width = `${Math.max(1, Math.round(maxR - minL))}px`;
                    boss20FinalFormOverlayEl.style.height = `${Math.max(1, Math.round(maxB - minT))}px`;
                    try {
                        const hpEl = boss20FinalFormOverlayEl.querySelector('.boss20-final-form-hp');
                        const hpFill = hpEl ? hpEl.querySelector('span') : null;
                        const m = specialMetaState[Math.floor(Number(boss20State.finalFormAnchor))] || {};
                        const hpNow = Math.max(0, Number(m.hp) || Number(boss20State.hp) || 0);
                        const hpMax = Math.max(1, Number(m.maxHp) || Number(boss20State.maxHp) || 1);
                        const ratio = Math.max(0, Math.min(1, hpNow / hpMax));
                        if (hpFill) hpFill.style.transform = `scaleX(${ratio})`;
                    } catch (e) { }
                } catch (e) {
                    clearBoss20FinalFormOverlay();
                }
            }

            function mapBoss20FinalFormHitIndex(index) {
                const idx = Math.floor(Number(index));
                if (!Number.isFinite(idx)) return idx;
                if (!isBoss20FinalFormCell(idx)) return idx;
                const anchor = Math.floor(Number(boss20State && boss20State.finalFormAnchor));
                if (!Number.isFinite(anchor) || anchor < 0 || anchor >= state.length) return idx;
                if (specialState[anchor] !== 'boss' || state[anchor] === null) return idx;
                return anchor;
            }

            function clearBoss20FinalShotReticle() {
                try {
                    if (boss20FinalShotReticleEl && boss20FinalShotReticleEl.parentNode) {
                        boss20FinalShotReticleEl.parentNode.removeChild(boss20FinalShotReticleEl);
                    }
                } catch (e) { }
                boss20FinalShotReticleEl = null;
            }

            function syncBoss20FinalShotReticle() {
                try {
                    if (!isEpicBoss20Level() || !boss20State || !boss20State.finalShotActive) {
                        clearBoss20FinalShotReticle();
                        return;
                    }
                    const target = Math.floor(Number(boss20State.finalShotTarget));
                    if (!Number.isFinite(target) || target < 0 || target >= state.length) {
                        clearBoss20FinalShotReticle();
                        return;
                    }
                    if (!boardEl) return;
                    const cell = boardEl.querySelector(`[data-index='${target}']`);
                    if (!cell) return;
                    const r = cell.getBoundingClientRect();
                    if (!r || r.width <= 0 || r.height <= 0) return;
                    if (!boss20FinalShotReticleEl) {
                        const el = document.createElement('div');
                        el.className = 'boss20-final-shot-reticle';
                        document.body.appendChild(el);
                        boss20FinalShotReticleEl = el;
                    }
                    boss20FinalShotReticleEl.style.left = `${Math.round(r.left + (r.width * 0.5))}px`;
                    boss20FinalShotReticleEl.style.top = `${Math.round(r.top + (r.height * 0.5))}px`;
                    boss20FinalShotReticleEl.style.width = `${Math.max(22, Math.round(r.width * 0.72))}px`;
                    boss20FinalShotReticleEl.style.height = `${Math.max(22, Math.round(r.height * 0.72))}px`;
                } catch (e) { }
            }

            function setupBoss20FinalShotBoard(bossIndex) {
                if (!isEpicBoss20Level()) return false;
                const idx = Math.floor(Number(bossIndex));
                if (!Number.isFinite(idx) || idx < 0 || idx >= state.length) return false;
                if (state[idx] === null || specialState[idx] !== 'boss') return false;
                // Ensure no residual cascade particles can accidentally resolve the finale.
                try { clearActiveParticlesImmediate(); } catch (e) { }
                stormResolving = false;
                const coreCells = getBoss20CoreCells();
                const coreSet = new Set(coreCells);
                const layout = [
                    2, 3, 2, 3, 2, 3,
                    3, 2, 3, 2, 3, 2,
                    2, 3, null, null, 3, 2,
                    3, 2, null, null, 2, 3,
                    2, 3, 2, 3, 2, 3,
                    3, 2, 3, 2, 3, 2
                ];
                for (let i = 0; i < state.length; i++) {
                    if (i === idx) continue;
                    if (coreSet.has(i)) {
                        state[i] = null;
                        clearSpecialForCell(i);
                        clearBossGooShieldAt(i);
                        clearBiofilmAt(i);
                        continue;
                    }
                    const v = layout[i];
                    if (v == null) {
                        state[i] = null;
                        clearSpecialForCell(i);
                    } else {
                        state[i] = Math.max(0, Math.min(MAX_SIZE, Math.floor(Number(v) || 0)));
                        clearSpecialForCell(i);
                    }
                    clearBossGooShieldAt(i);
                    clearBiofilmAt(i);
                }
                [4, 11, 24, 29].forEach((c) => {
                    try { applyBiofilmAt(c, { hits: 2 }); } catch (e) { }
                });
                boss20State.finalShotTarget = 32;
                boss20State.finalShotActive = true;
                boss20State.finalShotTriggered = false;
                boss20State.finalShotRelease = false;
                syncBoss20FinalShotReticle();
                return true;
            }

            function triggerBoss20FinalShot(userIndex) {
                if (!isEpicBoss20Level() || !boss20State || !boss20State.finalShotActive) return false;
                const target = Math.floor(Number(boss20State.finalShotTarget));
                const idx = Math.floor(Number(userIndex));
                if (!Number.isFinite(idx) || idx !== target || boss20State.finalShotTriggered) return false;
                boss20State.finalShotTriggered = true;
                boss20State.finalShotRelease = true;
                clearBoss20FinalShotReticle();
                inputLocked = true;
                clicksLeft = Math.max(0, Number(clicksLeft) - 1);
                updateHUD();
                try { playSfx('nanostorm'); } catch (e) { }
                try { handleClick(target, false, null, true); } catch (e) { }
                // Long, circuitous victory route to make the last hit feel epic.
                const scriptedWave = [
                    31, 25, 19, 13, 7, 1,
                    2, 3, 4, 5, 11, 17,
                    23, 29, 35, 34, 33, 32,
                    26, 20, 14, 15, 21, 27,
                    28, 22, 16, 10, 9, 8
                ];
                const waveStartMs = 420;
                const stepMs = 320;
                scriptedWave.forEach((cellIndex, step) => {
                    setTimeout(() => {
                        try {
                            if (state[cellIndex] !== null) handleClick(cellIndex, false, null, true);
                        } catch (e) { }
                    }, waveStartMs + (step * stepMs));
                });
                setTimeout(() => {
                    try {
                        const bosses = getBossIndicesForLevel(20);
                        if (bosses.length) {
                            const bossIdx = bosses[0];
                            const m = ensureSpecialMeta(bossIdx) || {};
                            m.hp = 0;
                            specialMetaState[bossIdx] = m;
                            boss20State.finalShotActive = false;
                            boss20State.finalShotRelease = true;
                            resolveBossDefeat(bossIdx, m, null);
                            return;
                        }
                    } catch (e) { }
                    boss20State.finalShotActive = false;
                    inputLocked = false;
                }, waveStartMs + (scriptedWave.length * stepMs) + 700);
                return true;
            }
            let boss20State = createDefaultBoss20State();
            const bossFuelLastAtByLevel = Object.create(null);
            let mobileStormPressTimer = null;
            let mobileStormHoldActive = false;
            let mobileStormPointerId = null;
            let mobileStormCandidateIndex = null;
            const MOBILE_STORM_HOLD_MS = 120;
            let boardGeneration = 0;
            let runIntegrityState = {
                modified: false,
                announced: false,
                reason: '',
                achievementUnlockedSnapshot: null,
                achievementStatsSnapshot: null,
                highScoreSnapshot: 0
            };
            let gameOverVignetteEl = null;
            let gameOverMusicRestoreTimer = null;
            let gameOverPrevMusicVolume = null;
            let specialTelegraphIndex = null;
            let lastGameOverTipIndex = -1;
            const RUN_PERK_PROFILE = {
                thresholds: [1800, 4200, 7200, 11000, 15500],
                maxPicks: 5
            };
            const FINAL_OFFER_CONFIG = {
                enabled: true,
                level: 20,
                minClicksFloor: 6,
                pixel: {
                    id: 'final_pixel_safe_protocol',
                    source: 'pixel',
                    title: 'Safe Protocol',
                    desc: '+6 clicks now, +1 Nano Storm now, and boss systems run slower at fight start.',
                    cardFrontUrl: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/card_emergency_cells.png'
                },
                broker: {
                    id: 'final_viral_hostile_buyout',
                    source: 'broker',
                    title: 'Hostile Buyout',
                    desc: '+15 clicks, +1 Nano Storm charge, and boss HP -20%; lose 51% of your current points and all future MOD CENTER offers are disabled.',
                    cardFrontUrl: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/card_quickfix.png'
                },
                bossSlowMs: 20000,
                bossHpScale: 0.8,
                scoreKeepRatio: 0.49
            };
            const RUN_PERK_DEFS = {
                emergency_cells: {
                    id: 'emergency_cells',
                    source: 'pixel',
                    title: 'Emergency Cells',
                    desc: '+2 clicks immediately.'
                },
                storm_capacitor: {
                    id: 'storm_capacitor',
                    source: 'pixel',
                    title: 'Storm Capacitor',
                    desc: 'Next Nano Storm charge needs only 16 pops.'
                },
                armor_piercer: {
                    id: 'armor_piercer',
                    source: 'pixel',
                    title: 'Armor Piercer',
                    desc: 'Store 3 shell-piercing hits (saved until used).'
                },
                containment_freeze: {
                    id: 'containment_freeze',
                    source: 'pixel',
                    title: 'Containment Freeze',
                    desc: 'Pause blocker for 4.5 seconds.'
                },
                laser_jammer: {
                    id: 'laser_jammer',
                    source: 'broker',
                    title: 'Laser Jammer',
                    desc: 'Disable blocker beam for 5s, but blocker moves 25% faster for the rest of this run.'
                },
                boss_breaker: {
                    id: 'boss_breaker',
                    source: 'pixel',
                    title: 'Boss Breaker',
                    desc: 'Next 2 boss hits deal +1 damage.'
                },
                overclocked_reserve: {
                    id: 'overclocked_reserve',
                    source: 'pixel',
                    title: 'Overclocked Reserve',
                    desc: '+1 click at the start of the next 2 levels. Can temporarily exceed max clicks.'
                },
                reserve_expansion: {
                    id: 'reserve_expansion',
                    source: 'pixel',
                    title: 'Reserve Expansion',
                    desc: '+2 max clicks this run.'
                },
                storm_tuning: {
                    id: 'storm_tuning',
                    source: 'pixel',
                    title: 'Storm Tuning',
                    desc: 'Nano Storm charge requirement -3 for the rest of the run.'
                },
                broker_quickfix: {
                    id: 'broker_quickfix',
                    source: 'broker',
                    title: 'Quickfix',
                    desc: '+4 clicks now (can temporarily exceed max clicks), but level-clear click bonus -1 for the rest of the run.'
                },
                broker_hotwire: {
                    id: 'broker_hotwire',
                    source: 'broker',
                    title: 'Black-Market Hotwire',
                    desc: '+1 Nano Storm now (instant charge), but next recharge +3 pops.'
                },
                broker_heavy_armor: {
                    id: 'broker_heavy_armor',
                    source: 'broker',
                    title: 'Razor Payload',
                    desc: '+5 Armor Piercer hits, but max clicks -2.'
                },
                broker_risky_cache: {
                    id: 'broker_risky_cache',
                    source: 'broker',
                    title: 'Risky Cache',
                    desc: '+2 clicks at each of the next 2 levels, but score gain -12%.'
                },
                broker_borrowed_time: {
                    id: 'broker_borrowed_time',
                    source: 'broker',
                    title: 'Borrowed Time',
                    desc: '+4 clicks now, but mini-boss kill reward -2 for the rest of this run.'
                },
                broker_dirty_reactor: {
                    id: 'broker_dirty_reactor',
                    source: 'broker',
                    title: 'Dirty Reactor',
                    desc: '+1 Nano Storm now. Future charges only need 18 pops but Nano Storm loses diagonals for the rest of the run.'
                },
                broker_hazard_infusion: {
                    id: 'broker_hazard_infusion',
                    source: 'broker',
                    title: 'Hazard Infusion',
                    desc: '+2 next-level clicks, but special virus spawn chance +5% this run.'
                }
            };
            const BROKER_PICK_ASSISTANT_LINES = [
                'Viral venture accepted. You should not trust that guy, he looks shady.',
                'Deal taken. That trench-coat virus definitely has fake credentials.',
                'I recommend counting your fingers after this transaction.',
                'Viral venture selected. If he says no side effects, assume side effects.'
            ];
            let runPerkPopupEl = null;
            let finalOfferPopupEl = null;
            let finalOfferModalOpen = false;
            let finalOfferSkipPreludeOnce = false;
            let finalOfferPreludeEl = null;
            let finalOfferGlobalPreludeEl = null;
            let finalOfferPreludeActive = false;
            let finalOfferPreludeTimer = null;
            let finalOfferMusicFadeTimer = null;
            let level20TalkCutsceneEl = null;
            let level20TalkSfxOnly = false;
            let finalVictoryOverlayEl = null;
            let finalVictoryExplosionTimer = null;
            let finalVictoryRevealTimer = null;
            let finalVictoryFinalCardTimer = null;
            let finalVictorySummaryTimer = null;
            let finalCreditsMusicAudio = null;
            let finalCreditsMusicRetryArmed = false;
            let finalCreditsMusicRetryHandler = null;
            let finalVictoryState = { inProgress: false, shown: false };
            function createDefaultRunPerkState() {
                return {
                    nextThresholdIndex: 0,
                    pendingOffers: 0,
                    picksCount: 0,
                    lastOfferedRound: {},
                    stormCapacitorCharges: 0,
                    armorPiercerHits: 0,
                    bossBreakerHits: 0,
                    overclockedReservePending: 0,
                    overclockedReserveLevelsPending: 0,
                    blockerFrozenUntil: 0,
                    blockerDisabledUntil: 0,
                    blockerSpeedFactor: 1,
                    clickCapDelta: 0,
                    stormRechargeDelta: 0,
                    hotwireNextRechargePenalty: 0,
                    dirtyReactorFixedRecharge: false,
                    levelClearClicksPenalty: 0,
                    scoreMultiplier: 1,
                    miniBossBonusPenalty: 0,
                    stormNoDiagonals: false,
                    specialVirusChanceDelta: 0,
                    armorPiercerPermanent: false,
                    acceptedDeals: 0,
                    popupOpen: false,
                    disableScoreDeals: false,
                    scorePeak: 0,
                    finalOfferPending: false,
                    finalOfferSeen: false,
                    finalOfferChoice: '',
                    finalEndingAchievementGranted: false,
                    finalBossHpScale: 1,
                    finalBossSlowUntil: 0,
                    continueDealTaken: false,
                    continueDealPenaltyTotal: 0
                };
            }
            let runPerkState = createDefaultRunPerkState();
            const ACHIEVEMENT_STORAGE_KEY = 'goneViral_achievements_v1';
            const ACHIEVEMENT_SCHEMA_VERSION = 1;
            const ACHIEVEMENT_DEFS = [
                { id: 'run_pop_1000', title: 'Viral Exterminator', description: 'Pop 500 viruses in one run (Adventure Mode).', stat: 'runPops', target: 500, scope: 'run' },
                { id: 'run_level_5', title: 'Containment I', description: 'Complete level 5 in one run (Adventure Mode).', stat: 'runLevelReached', target: 6, scope: 'run' },
                { id: 'run_level_10', title: 'Containment II', description: 'Complete level 10 in one run (Adventure Mode).', stat: 'runLevelReached', target: 11, scope: 'run' },
                { id: 'run_level_15', title: 'Containment III', description: 'Complete level 15 in one run (Adventure Mode).', stat: 'runLevelReached', target: 16, scope: 'run' },
                { id: 'run_shell_breaker_10', title: 'Shield Breaker', description: 'Break 50 sheilded viruses in one run (Adventure Mode).', stat: 'runArmoredShellsBroken', target: 50, scope: 'run' },
                { id: 'run_chain_20', title: 'Chain Master', description: 'Record 3 chains of 20+ in one run (Adventure Mode).', stat: 'runChain20Count', target: 3, scope: 'run' },
                { id: 'run_storm_3', title: 'Storm Caller', description: 'Use Nano Storm 5 times in one run (Adventure Mode).', stat: 'runNanoStormUses', target: 5, scope: 'run' },
                { id: 'run_clutch_clear', title: 'Clutch Clear', description: 'Clear any level with 1 click left (Adventure Mode).', stat: 'runClutchClears', target: 1, scope: 'run' },
                { id: 'life_pop_10000', title: 'Pandemic Cleaner', description: 'Pop 5,000 viruses across runs (Adventure Mode).', stat: 'popsLifetime', target: 5000, scope: 'lifetime' },
                { id: 'life_chain20_x10', title: 'Combo Veteran', description: 'Record 25 chains of 20+ across runs (Adventure Mode).', stat: 'chain20LifetimeCount', target: 25, scope: 'lifetime' },
                { id: 'life_shells_250', title: 'Armored Nemesis', description: 'Break 250 armored viruses across runs (Adventure Mode).', stat: 'armoredShellsLifetime', target: 250, scope: 'lifetime' },
                { id: 'life_levels_100', title: 'Long-Term Operator', description: 'Clear 500 levels across runs (Adventure Mode).', stat: 'levelsClearedLifetime', target: 500, scope: 'lifetime' },
                { id: 'endurance_levels_10', title: 'Endurance I', description: 'Clear 10 levels in one run (Endurance Mode).', stat: 'enduranceRunLevelReached', target: 11, scope: 'run' },
                { id: 'endurance_levels_20', title: 'Endurance II', description: 'Clear 20 levels in one run (Endurance Mode).', stat: 'enduranceRunLevelReached', target: 21, scope: 'run' },
                { id: 'endurance_levels_30', title: 'Endurance III', description: 'Clear 30 levels in one run (Endurance Mode).', stat: 'enduranceRunLevelReached', target: 31, scope: 'run' },
                { id: 'endurance_score_25000', title: 'Endurance Score I', description: 'Reach 25,000 score in Endurance Mode.', stat: 'enduranceBestScore', target: 25000, scope: 'lifetime' },
                { id: 'endurance_score_50000', title: 'Endurance Score II', description: 'Reach 50,000 score in Endurance Mode.', stat: 'enduranceBestScore', target: 50000, scope: 'lifetime' },
                { id: 'endurance_score_100000', title: 'Endurance Score III', description: 'Reach 100,000 score in Endurance Mode.', stat: 'enduranceBestScore', target: 100000, scope: 'lifetime' },
                { id: 'ending_hostile_takeover', title: 'HOSTILE TAKEOVER', description: 'Win Adventure Mode with the Hostile Takeover ending.', stat: 'endingHostileTakeoverWins', target: 1, scope: 'lifetime' },
                { id: 'ending_system_restored', title: 'SYSTEM RESTORED', description: 'Win Adventure Mode with the System Restored ending.', stat: 'endingSystemRestoredWins', target: 1, scope: 'lifetime' },
                { id: 'ending_independent_variable', title: 'INDEPENDENT VARIABLE', description: 'Win Adventure Mode with the Independent Variable ending.', stat: 'endingIndependentVariableWins', target: 1, scope: 'lifetime' },
                { id: 'ending_true', title: 'The True Ending', description: 'Win Adventure Mode with Independent Variable without using Continue.', stat: 'endingTrueWins', target: 1, scope: 'lifetime' }
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
                    firstArmoredSeen: false,
                    level5Dynamics: false
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
                return false;
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
                    runStartedByPlayer = !!tutorialGateState.startPressed;
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

            function showLevelDynamicsModal(config, onDone) {
                const done = (typeof onDone === 'function') ? onDone : () => { };
                const modal = document.getElementById('level5DynamicsModal');
                const closeBtn = document.getElementById('level5DynamicsClose');
                const body = document.getElementById('levelDynamicsBody');
                try { hideActiveChainBadge(false); } catch (e) { }
                if (!modal || !closeBtn) {
                    done();
                    return;
                }
                const lines = (config && Array.isArray(config.lines)) ? config.lines : [];
                if (body && lines.length) {
                    try {
                        body.innerHTML = lines.map((line) => escapeHtml(String(line || ''))).join(' <br>\n');
                    } catch (e) { }
                }
                let closed = false;
                const close = () => {
                    if (closed) return;
                    closed = true;
                    try {
                        modal.classList.remove('show');
                        modal.setAttribute('aria-hidden', 'true');
                    } catch (e) { }
                    try { closeBtn.removeEventListener('click', close); } catch (e) { }
                    try { document.removeEventListener('keydown', onKeyDown, true); } catch (e) { }
                    try { document.removeEventListener('pointerdown', onOutsidePointer, true); } catch (e) { }
                    done();
                };
                const onKeyDown = (ev) => {
                    if (ev && ev.key === 'Escape') close();
                };
                const onOutsidePointer = (ev) => {
                    try {
                        if (!modal.classList.contains('show')) return;
                        if (modal.contains(ev.target)) return;
                        close();
                    } catch (e) { }
                };
                try {
                    modal.classList.add('show');
                    modal.setAttribute('aria-hidden', 'false');
                } catch (e) { }
                try { closeBtn.focus(); } catch (e) { }
                closeBtn.addEventListener('click', close);
                document.addEventListener('keydown', onKeyDown, true);
                document.addEventListener('pointerdown', onOutsidePointer, true);
            }

            function getLevelDynamicsBriefing(nextLevelNum) {
                const level = Number(nextLevelNum);
                if (level === 5) {
                    return {
                        lines: [
                            'NEW THREATS DETECTED',
                            'Mutations introducing advanced pathogen behaviors.',
                            'BOSS: This nasty character (he\'s now calling himself the Crimson Nightmare) takes multiple hits to eliminate and can generate new viruses while active.',
                            'ARMORED VIRUSES: Oh, no! The viruses have accessed our shielding technology. Some viruses are shielded; break the shield first before normal growth damage applies.'
                        ]
                    };
                }
                if (level === 10) {
                    return {
                        lines: [
                            'SLUDGE SOVEREIGN ONLINE',
                            'This corrosive mutant coats nearby pathogens in reactive yellow goo. Yuck!',
                            'GOO SHIELDS: Goo coated viruses take an extra hit before normal growth damage applies.',
                            'BIOFILM: Some of the Petri dishes have been covered in a thin layer of biofilm. These cells cannot be tapped until the biofilm is removed.',
                            'WEAK-POINT RULE: direct taps on this boss are only half effective; chain particles hit at full strength.'
                        ]
                    };
                }
                if (level === 15) {
                    return {
                        lines: [
                            'MECHA-GREMLIN BREACH DETECTED',
                            'This hacker virus has seized our rogue nanobots and weaponized the lab defenses.',
                            'JAM ATTACK: Nano Storm can be temporarily disabled.',
                            'DECOYS: hologram copies pop in one hit, and damaging them hurts the real boss.',
                            'HACKED NANOBOTS: laser barriers intercept cascade particles. Watch the beam and time your taps.'
                        ]
                    };
                }
                return null;
            }

            function maybeShowLevelDynamicsIntro(nextLevelNum) {
                const briefing = getLevelDynamicsBriefing(nextLevelNum);
                if (!briefing) {
                    return false;
                }
                try { inputLocked = true; } catch (e) { }
                showLevelDynamicsModal(briefing, () => {
                    try { inputLocked = false; } catch (e) { }
                });
                return true;
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
                if (isModifiedRun()) {
                    scheduleAchievementsUIRender();
                    return;
                }
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

            function buildAchievementsListHtml() {
                return ACHIEVEMENT_DEFS.map((def) => {
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
            }

            function renderAchievementsUI() {
                const panel = ensureAchievementsPanel();
                if (!panel) return;
                const list = document.getElementById('achievementList');
                const summary = document.getElementById('achievementSummary');
                if (!list || !summary) return;
                const unlockedCount = countUnlockedAchievements();
                summary.textContent = unlockedCount + '/' + ACHIEVEMENT_DEFS.length + ' unlocked';
                list.innerHTML = buildAchievementsListHtml();
            }

            function renderStartAchievementsUI() {
                const list = document.getElementById('startAchievementsList');
                const summary = document.getElementById('startAchievementsSummary');
                if (!list || !summary) return;
                const unlockedCount = countUnlockedAchievements();
                summary.textContent = unlockedCount + '/' + ACHIEVEMENT_DEFS.length + ' unlocked';
                list.innerHTML = buildAchievementsListHtml();
            }

            function scheduleAchievementsUIRender() {
                if (achievementUiQueued) return;
                achievementUiQueued = true;
                const run = () => {
                    achievementUiQueued = false;
                    renderAchievementsUI();
                    renderStartAchievementsUI();
                };
                if (typeof requestAnimationFrame === 'function') requestAnimationFrame(run);
                else setTimeout(run, 0);
            }

            function incrementAchievementStat(statKey, amount = 1, scope = 'lifetime', opts = {}) {
                if (isModifiedRun()) return;
                const key = String(statKey || '');
                if (!key) return;
                const inc = Number(amount);
                if (!Number.isFinite(inc) || inc <= 0) return;
                const allowEndurance = !!(opts && opts.allowEndurance);
                if (!isAdventureMode() && !allowEndurance) return;
                const stats = (scope === 'run') ? runAchievementStats : achievementState.stats;
                const prev = Math.max(0, Number(stats[key]) || 0);
                stats[key] = prev + inc;
                if (scope !== 'run') scheduleAchievementSave();
                evaluateAchievements();
            }

            function setAchievementBest(statKey, candidate, scope = 'lifetime', opts = {}) {
                const key = String(statKey || '');
                if (!key) return;
                const val = Math.max(0, Number(candidate) || 0);
                const allowEndurance = !!(opts && opts.allowEndurance);
                if (!isAdventureMode() && !allowEndurance) return;
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
                        try { markRunModified('achievement-add'); } catch (e) { }
                        incrementAchievementStat(statKey, amount, scope);
                        return this.getState();
                    },
                    setBest: function (statKey, value, scope = 'lifetime') {
                        try { markRunModified('achievement-setbest'); } catch (e) { }
                        setAchievementBest(statKey, value, scope);
                        return this.getState();
                    },
                    reset: function () {
                        try { markRunModified('achievement-reset'); } catch (e) { }
                        achievementState = createDefaultAchievementState();
                        resetRunAchievementStats(getCurrentLevelNumber());
                        evaluateAchievements({ emitUnlock: false });
                        scheduleAchievementSave(0);
                        return this.getState();
                    },
                    resetRun: function () {
                        try { markRunModified('achievement-reset-run'); } catch (e) { }
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
            const aiEnduranceBtn = document.getElementById('aiEnduranceBtn');
            const aiTutorialBtn = document.getElementById('aiTutorialBtn');
            const aiLoreBtn = document.getElementById('aiLoreBtn');
            const aiAchievementsBtn = document.getElementById('aiAchievementsBtn');
            const sponsorMarkEl = document.querySelector('.pathodyne-mark-inline');
            const loreModal = document.getElementById('loreModal');
            const loreCloseBtn = document.getElementById('loreCloseBtn');
            const startAchievementsModal = document.getElementById('startAchievementsModal');
            const startAchievementsCloseBtn = document.getElementById('startAchievementsCloseBtn');
            const startModalCloseBtn = document.getElementById('startModalClose');
            function dismissIntroOverlayNow() {
                try {
                    const intro = document.getElementById('aiIntro');
                    if (!intro) return;
                    intro.classList.add('fade-out');
                    intro.style.pointerEvents = 'none';
                    setTimeout(() => {
                        try {
                            intro.style.display = 'none';
                            intro.style.visibility = 'hidden';
                            intro.setAttribute('aria-hidden', 'true');
                        } catch (e) { }
                    }, 650);
                } catch (e) { }
            }
            function forceCleanRunStart(modeName) {
                try {
                    setGameMode(modeName || GAME_MODES.adventure);
                } catch (e) { }
                try {
                    stopTutorialMode(true);
                } catch (e) { }
                try {
                    ['audioPopup', 'helpPopup', 'startModal', 'level5DynamicsModal', 'loreModal'].forEach((id) => {
                        const el = document.getElementById(id);
                        if (!el) return;
                        el.classList.remove('show', 'open');
                        el.style.display = 'none';
                        el.style.visibility = 'hidden';
                        el.style.pointerEvents = 'none';
                        el.setAttribute('aria-hidden', 'true');
                    });
                } catch (e) { }
                try {
                    screensPassed = 0;
                    totalScore = 0;
                    outOfClicksShown = false;
                    continueOfferOpen = false;
                    runContinueUses = 0;
                    runStartedByPlayer = true;
                    inputLocked = false;
                    stormResolving = false;
                    randomizeBoard(false);
                    updateHUD();
                    resetRunIntegrityState();
                } catch (e) { }
            }
            syncTutorialGateFromDom();
            if (aiStartBtn) {
                aiStartBtn.addEventListener('click', () => {
                    setGameMode(GAME_MODES.adventure);
                    runStartedByPlayer = true;
                    tutorialGateState.startPressed = true;
                    dismissIntroOverlayNow();
                    try {
                        inputLocked = false;
                        stormResolving = false;
                    } catch (e) { }
                    markAudioUserInteracted();
                });
            }
            if (aiEnduranceBtn) {
                aiEnduranceBtn.addEventListener('click', () => {
                    tutorialGateState.startPressed = true;
                    tutorialGateState.briefingAcknowledged = true;
                    dismissIntroOverlayNow();
                    forceCleanRunStart(GAME_MODES.endurance);
                    markAudioUserInteracted();
                });
            }
            if (aiTutorialBtn) {
                aiTutorialBtn.addEventListener('click', () => {
                    runStartedByPlayer = true;
                    tutorialGateState.startPressed = true;
                    markAudioUserInteracted();
                    setTimeout(() => {
                        try { startTutorialMode(); } catch (e) { }
                    }, 700);
                });
            }
            if (aiLoreBtn && loreModal) {
                aiLoreBtn.addEventListener('click', () => {
                    try {
                        loreModal.classList.add('show');
                        loreModal.setAttribute('aria-hidden', 'false');
                    } catch (e) { }
                });
            }
            if (aiAchievementsBtn) {
                aiAchievementsBtn.addEventListener('click', () => {
                    try { renderStartAchievementsUI(); } catch (e) { }
                    try {
                        if (startAchievementsModal) {
                            startAchievementsModal.classList.add('show');
                            startAchievementsModal.setAttribute('aria-hidden', 'false');
                        }
                    } catch (e) { }
                });
            }
            if (loreCloseBtn && loreModal) {
                loreCloseBtn.addEventListener('click', () => {
                    try {
                        loreModal.classList.remove('show');
                        loreModal.setAttribute('aria-hidden', 'true');
                    } catch (e) { }
                });
            }
            if (loreModal) {
                loreModal.addEventListener('click', (ev) => {
                    try {
                        if (ev.target !== loreModal) return;
                        loreModal.classList.remove('show');
                        loreModal.setAttribute('aria-hidden', 'true');
                    } catch (e) { }
                });
            }
            if (startAchievementsCloseBtn && startAchievementsModal) {
                startAchievementsCloseBtn.addEventListener('click', () => {
                    try {
                        startAchievementsModal.classList.remove('show');
                        startAchievementsModal.setAttribute('aria-hidden', 'true');
                    } catch (e) { }
                });
            }
            if (startAchievementsModal) {
                startAchievementsModal.addEventListener('click', (ev) => {
                    try {
                        if (ev.target !== startAchievementsModal) return;
                        startAchievementsModal.classList.remove('show');
                        startAchievementsModal.setAttribute('aria-hidden', 'true');
                    } catch (e) { }
                });
            }
            if (sponsorMarkEl) {
                try {
                    sponsorMarkEl.setAttribute('role', 'button');
                    sponsorMarkEl.setAttribute('tabindex', '0');
                    sponsorMarkEl.removeAttribute('aria-hidden');
                } catch (e) { }
                sponsorMarkEl.addEventListener('click', (ev) => {
                    try { ev.preventDefault(); ev.stopPropagation(); } catch (e) { }
                    handleSponsorMarkInfoClick();
                });
                sponsorMarkEl.addEventListener('keydown', (ev) => {
                    try {
                        if (ev.key !== 'Enter' && ev.key !== ' ' && ev.key !== 'Spacebar') return;
                        ev.preventDefault();
                        ev.stopPropagation();
                    } catch (e) { }
                    handleSponsorMarkInfoClick();
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
            const highScoreKeyAdventure = 'goneViral_highScore_adventure';
            const highScoreKeyEndurance = 'goneViral_highScore_endurance';
            function getHighScoreKeyForMode(modeName = currentGameMode) {
                return String(modeName) === GAME_MODES.endurance ? highScoreKeyEndurance : highScoreKeyAdventure;
            }
            function loadHighScoreForMode(modeName = currentGameMode) {
                const key = getHighScoreKeyForMode(modeName);
                let v = 0;
                try { v = Number(localStorage.getItem(key) || 0); } catch (e) { v = 0; }
                if (!Number.isFinite(v) || v < 0) v = 0;
                return Math.max(0, Math.floor(v));
            }
            function saveHighScoreForMode(modeName = currentGameMode, value = highScore) {
                const key = getHighScoreKeyForMode(modeName);
                if (isModifiedRun()) {
                    try { window.HIGH_SCORE_KEY = key; } catch (e) { }
                    return Math.max(0, Math.floor(Number(highScore) || 0));
                }
                const v = Math.max(0, Math.floor(Number(value) || 0));
                try { localStorage.setItem(key, String(v)); } catch (e) { }
                try { window.HIGH_SCORE_KEY = key; } catch (e) { }
                return v;
            }
            function syncHighScoreForMode(modeName = currentGameMode) {
                highScore = loadHighScoreForMode(modeName);
                if (!highScoreEl) try { highScoreEl = document.getElementById('highScoreValue'); } catch (e) { }
                if (highScoreEl) highScoreEl.textContent = String(highScore);
                try { window.highScore = highScore; } catch (e) { }
                try { window.HIGH_SCORE_KEY = getHighScoreKeyForMode(modeName); } catch (e) { }
                return highScore;
            }
            window.syncHighScoreForMode = syncHighScoreForMode;
            let highScore = loadHighScoreForMode(currentGameMode);
            let highScoreEl = null;
            syncHighScoreForMode(currentGameMode);

            function resetRunIntegrityState() {
                try {
                    runIntegrityState.modified = false;
                    runIntegrityState.announced = false;
                    runIntegrityState.reason = '';
                    runIntegrityState.achievementUnlockedSnapshot = Object.assign({}, achievementState && achievementState.unlocked ? achievementState.unlocked : {});
                    runIntegrityState.achievementStatsSnapshot = Object.assign({}, achievementState && achievementState.stats ? achievementState.stats : {});
                    runIntegrityState.highScoreSnapshot = Math.max(0, Number(highScore) || 0);
                    try { window.__goneViralRunModified = false; } catch (e) { }
                } catch (e) { }
            }

            function isModifiedRun() {
                return !!(runIntegrityState && runIntegrityState.modified);
            }

            function markRunModified(reason = 'debug-helper') {
                try {
                    if (!runIntegrityState) return false;
                    if (runIntegrityState.modified) return true;
                    runIntegrityState.modified = true;
                    runIntegrityState.reason = String(reason || 'debug-helper');
                    try { window.__goneViralRunModified = true; } catch (e) { }
                    if (achievementState && achievementState.unlocked && runIntegrityState.achievementUnlockedSnapshot) {
                        achievementState.unlocked = Object.assign({}, runIntegrityState.achievementUnlockedSnapshot);
                    }
                    if (achievementState && achievementState.stats && runIntegrityState.achievementStatsSnapshot) {
                        achievementState.stats = Object.assign({}, runIntegrityState.achievementStatsSnapshot);
                    }
                    runUnlockedAchievementIds = new Set();
                    try { scheduleAchievementSave(0); } catch (e) { }
                    if (Number.isFinite(Number(runIntegrityState.highScoreSnapshot))) {
                        highScore = Math.max(0, Number(runIntegrityState.highScoreSnapshot) || 0);
                        try {
                            const highScoreKey = getHighScoreKeyForMode(currentGameMode);
                            localStorage.setItem(highScoreKey, String(highScore));
                            window.HIGH_SCORE_KEY = highScoreKey;
                        } catch (e) { }
                        if (!highScoreEl) try { highScoreEl = document.getElementById('highScoreValue'); } catch (e) { }
                        if (highScoreEl) highScoreEl.textContent = String(highScore);
                        try { window.highScore = highScore; } catch (e) { }
                    }
                    scheduleAchievementsUIRender();
                    if (!runIntegrityState.announced && window.Assistant && Assistant.show) {
                        runIntegrityState.announced = true;
                        Assistant.show('Unauthorized console tampering detected. I am marking this as a modified run, cheater.', { priority: 2 });
                    }
                    return true;
                } catch (e) {
                    return false;
                }
            }

            resetRunIntegrityState();

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
                        if (!hasMusic && runStartedByPlayer) startBackgroundMusic();
                    } catch (e) { }
                }
                ensureMusicPlaybackWatchdog();
                nudgeMusicPlaybackHealth('user-interaction');
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
                    nudgeMusicPlaybackHealth('visibility');
                } catch (e) { }
            }

            function syncAudioSettingsUI() {
                const musicToggle = document.getElementById('musicEnabledToggle');
                const sfxToggle = document.getElementById('sfxEnabledToggle');
                const simpleVirusArtToggle = document.getElementById('simpleVirusArtToggle');
                const musicSlider = document.getElementById('musicVol');
                const sfxSlider = document.getElementById('sfxVol');
                if (musicToggle) musicToggle.checked = !!musicEnabled;
                if (sfxToggle) sfxToggle.checked = !!sfxEnabled;
                if (simpleVirusArtToggle) simpleVirusArtToggle.checked = !!simpleVirusArtEnabled;
                if (musicSlider) musicSlider.disabled = !musicEnabled;
                if (sfxSlider) sfxSlider.disabled = !sfxEnabled;
            }

            function applyMusicEnabledState(fromUserAction = false) {
                window.musicEnabled = !!musicEnabled;
                saveAudioEnabledPref(AUDIO_PREF_MUSIC_ENABLED_KEY, !!musicEnabled);
                if (!musicEnabled) {
                    musicWasPlayingBeforeHide = false;
                    try { stopFinalBossTheme({ fadeOutMs: 0, resumeNormal: false }); } catch (e) { }
                    stopBackgroundMusic();
                } else if ((fromUserAction || audioUserInteracted) && runStartedByPlayer) {
                    if (musicOverrideMode === 'final-boss') startFinalBossTheme();
                    else startBackgroundMusic();
                    ensureMusicPlaybackWatchdog();
                    nudgeMusicPlaybackHealth('toggle-on');
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

            function applySimpleVirusArtState(fromUserAction = false) {
                window.simpleVirusArtEnabled = !!simpleVirusArtEnabled;
                saveAudioEnabledPref(VISUAL_PREF_SIMPLE_VIRUS_ART_KEY, !!simpleVirusArtEnabled);
                if (fromUserAction) {
                    try { playSfx('click'); } catch (e) { }
                }
                syncAudioSettingsUI();
                scheduleRender();
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
                    try { localStorage.removeItem(highScoreKeyAdventure); } catch (e) { }
                    try { localStorage.removeItem(highScoreKeyEndurance); } catch (e) { }
                    try { window.highScore = 0; } catch (e) { }
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

            function isBlockerTemporarilyFrozen() {
                return !!(runPerkState && Number(runPerkState.blockerFrozenUntil) > Date.now());
            }

            function isBlockerTemporarilyDisabled() {
                return !!(runPerkState && Number(runPerkState.blockerDisabledUntil) > Date.now());
            }

            function getMaxClicksCap() {
                const delta = Math.floor(Number(runPerkState && runPerkState.clickCapDelta) || 0);
                return Math.max(6, MAX_CLICKS + delta);
            }

            function clampClicksToCap() {
                clicksLeft = Math.max(0, Math.min(getMaxClicksCap(), Number(clicksLeft) || 0));
                return clicksLeft;
            }

            function hideRunPerkPopup(immediate = false) {
                try {
                    const el = runPerkPopupEl || document.querySelector('.run-perk-popup');
                    if (!el) {
                        runPerkPopupEl = null;
                        if (runPerkState) runPerkState.popupOpen = false;
                        try { document.body.classList.remove('run-perk-open'); } catch (e) { }
                        return;
                    }
                    const cleanup = () => {
                        try {
                            if (el._rpRevealStartTimer) clearTimeout(el._rpRevealStartTimer);
                            if (el._rpRevealUnlockTimer) clearTimeout(el._rpRevealUnlockTimer);
                        } catch (e) { }
                        try { el.remove(); } catch (e) { }
                        runPerkPopupEl = null;
                        if (runPerkState) runPerkState.popupOpen = false;
                        try { document.body.classList.remove('run-perk-open'); } catch (e) { }
                    };
                    if (immediate) {
                        cleanup();
                        return;
                    }
                    el.classList.remove('show');
                    el.classList.add('hide');
                    el.addEventListener('animationend', cleanup, { once: true });
                } catch (e) { }
            }

            function stopFinalOfferMusicDuck() {
                try {
                    if (finalOfferMusicFadeTimer) {
                        clearInterval(finalOfferMusicFadeTimer);
                        finalOfferMusicFadeTimer = null;
                    }
                } catch (e) { }
            }

            function fadeCurrentMusicForFinalOffer(durationMs = FINAL_OFFER_MUSIC_DUCK_MS, targetRatio = FINAL_OFFER_MUSIC_DUCK_RATIO) {
                stopFinalOfferMusicDuck();
                const ma = getActiveMusicAudio();
                if (!ma || musicOverrideMode === 'final-boss') return;
                const ms = Math.max(120, Math.floor(Number(durationMs) || 0));
                const ratio = Math.max(0, Math.min(1, Number(targetRatio) || 0));
                const fromVol = Math.max(0.001, Number(ma.volume) || Number(window.musicVolume) || 0.2);
                const toVol = Math.max(0.001, fromVol * ratio);
                if (ms <= 0 || Math.abs(fromVol - toVol) < 0.001) {
                    try { ma.volume = toVol; } catch (e) { }
                    return;
                }
                const stepMs = 40;
                const steps = Math.max(1, Math.ceil(ms / stepMs));
                let tick = 0;
                finalOfferMusicFadeTimer = setInterval(() => {
                    tick += 1;
                    const t = Math.max(0, Math.min(1, tick / steps));
                    try { ma.volume = Math.max(0.001, fromVol + ((toVol - fromVol) * t)); } catch (e) { }
                    if (t >= 1) stopFinalOfferMusicDuck();
                }, stepMs);
            }

            function hideFinalOfferPrelude(immediate = false) {
                const el = finalOfferPreludeEl || document.querySelector('.final-offer-prelude.final-offer-prelude-board');
                finalOfferPreludeActive = false;
                if (!el) {
                    finalOfferPreludeEl = null;
                    return;
                }
                const cleanup = () => {
                    try {
                        if (typeof el._foPreludeRemoveViewportListeners === 'function') el._foPreludeRemoveViewportListeners();
                    } catch (e) { }
                    try { el.remove(); } catch (e) { }
                    if (finalOfferPreludeEl === el) finalOfferPreludeEl = null;
                };
                if (immediate) {
                    cleanup();
                    return;
                }
                el.classList.remove('show');
                el.classList.add('hide');
                setTimeout(cleanup, 260);
            }

            function showFinalOfferPrelude(durationMs = FINAL_OFFER_PRELUDE_FADE_MS) {
                hideFinalOfferPrelude(true);
                finalOfferPreludeActive = true;
                const el = document.createElement('div');
                el.className = 'final-offer-prelude final-offer-prelude-board';
                const positionOverBoard = () => {
                    try {
                        const board = document.getElementById('board') || document.querySelector('.board');
                        if (!board) return;
                        const r = board.getBoundingClientRect();
                        el.style.left = Math.round(r.left) + 'px';
                        el.style.top = Math.round(r.top) + 'px';
                        el.style.width = Math.max(120, Math.round(r.width)) + 'px';
                        el.style.height = Math.max(120, Math.round(r.height)) + 'px';
                    } catch (e) { }
                };
                const onViewportChange = () => positionOverBoard();
                positionOverBoard();
                window.addEventListener('resize', onViewportChange);
                window.addEventListener('scroll', onViewportChange, true);
                el._foPreludeRemoveViewportListeners = () => {
                    try { window.removeEventListener('resize', onViewportChange); } catch (e) { }
                    try { window.removeEventListener('scroll', onViewportChange, true); } catch (e) { }
                };
                document.body.appendChild(el);
                finalOfferPreludeEl = el;
                const fadeMs = Math.max(200, Math.floor(Number(durationMs) || FINAL_OFFER_PRELUDE_FADE_MS));
                el.style.setProperty('--fo-prelude-ms', `${fadeMs}ms`);
                requestAnimationFrame(() => {
                    try { el.classList.add('show'); } catch (e) { }
                });
                return fadeMs;
            }

            function hideFinalOfferGlobalPrelude(immediate = false, fadeOutMs = FINAL_OFFER_GLOBAL_PRELUDE_FADE_OUT_MS) {
                const el = finalOfferGlobalPreludeEl || document.querySelector('.final-offer-prelude.final-offer-prelude-global');
                if (!el) {
                    finalOfferGlobalPreludeEl = null;
                    return;
                }
                const cleanup = () => {
                    try { el.remove(); } catch (e) { }
                    if (finalOfferGlobalPreludeEl === el) finalOfferGlobalPreludeEl = null;
                };
                if (immediate) {
                    cleanup();
                    return;
                }
                const ms = Math.max(120, Math.floor(Number(fadeOutMs) || FINAL_OFFER_GLOBAL_PRELUDE_FADE_OUT_MS));
                el.style.setProperty('--fo-prelude-ms', `${ms}ms`);
                el.classList.remove('show');
                el.classList.add('hide');
                setTimeout(cleanup, ms + 40);
            }

            function showFinalOfferGlobalPrelude(durationMs = FINAL_OFFER_GLOBAL_PRELUDE_FADE_IN_MS) {
                hideFinalOfferGlobalPrelude(true);
                const el = document.createElement('div');
                el.className = 'final-offer-prelude final-offer-prelude-global';
                const fadeMs = Math.max(300, Math.floor(Number(durationMs) || FINAL_OFFER_GLOBAL_PRELUDE_FADE_IN_MS));
                el.style.setProperty('--fo-prelude-ms', `${fadeMs}ms`);
                document.body.appendChild(el);
                finalOfferGlobalPreludeEl = el;
                requestAnimationFrame(() => {
                    try { el.classList.add('show'); } catch (e) { }
                });
                return fadeMs;
            }

            function runLevel20FinalApproachSequence(onDone = null) {
                const finish = () => {
                    try {
                        if (typeof onDone === 'function') onDone();
                    } catch (e) { }
                };
                try {
                    const fadeMs = showFinalOfferGlobalPrelude(FINAL_OFFER_GLOBAL_PRELUDE_FADE_IN_MS);
                    fadeCurrentMusicForFinalOffer(Math.max(700, FINAL_OFFER_MUSIC_DUCK_MS + 260), 0.03);
                    setTimeout(() => {
                        try {
                            if (musicOverrideMode !== 'final-boss') {
                                startFinalBossTheme({ fadeInMs: 1200, initialVolumeRatio: 0.01 });
                            }
                        } catch (e) { }
                        finish();
                    }, Math.max(520, fadeMs));
                } catch (e) {
                    try {
                        if (musicOverrideMode !== 'final-boss') {
                            startFinalBossTheme({ fadeInMs: 1200, initialVolumeRatio: 0.01 });
                        }
                    } catch (e2) { }
                    finish();
                }
            }

            function hideLevel20BossTalkCutscene(immediate = false) {
                const el = level20TalkCutsceneEl || document.querySelector('.boss20-talk-modal');
                if (!el) {
                    level20TalkCutsceneEl = null;
                    level20TalkSfxOnly = false;
                    return;
                }
                const cleanup = () => {
                    try { el.remove(); } catch (e) { }
                    if (level20TalkCutsceneEl === el) level20TalkCutsceneEl = null;
                    level20TalkSfxOnly = false;
                };
                if (immediate) {
                    cleanup();
                    return;
                }
                el.classList.remove('show');
                el.classList.add('hide');
                setTimeout(cleanup, 240);
            }

            function showLevel20BossTalkCutscene(onDone = null) {
                hideLevel20BossTalkCutscene(true);
                try {
                    level20TalkSfxOnly = true;
                    const lines = [
                        { who: 'boss', text: 'Attention, tiny operator. The lab is now mine.' },
                        { who: 'pixel', text: 'Incorrect. The operator is not alone, I am still online.' },
                        { who: 'boss', text: 'I will drain every nano bot and leave you with no hope.' },
                        { who: 'pixel', text: 'Bold speech from a mutant in a jar. We have survived everything you have tried so far.' },
                        { who: 'boss', text: 'Then choose wisely and face your consequences..' }
                    ];
                    let i = 0;
                    const bossSfxKeys = ['evil1', 'evil2', 'evil3', 'evil4', 'evil5', 'evil6'];
                    const pickBossSfx = () => bossSfxKeys[Math.floor(Math.random() * bossSfxKeys.length)] || 'evil1';
                    const pickPixelSfx = () => `assistant_ai_${Math.floor(Math.random() * 7)}`;
                    const priorBoss20Cinematic = !!(boss20State && boss20State.inCinematic);
                    try { if (boss20State) boss20State.inCinematic = true; } catch (e) { }
                    try { stopBoss20PhaseTimer(); } catch (e) { }
                    try { inputLocked = true; } catch (e) { }

                    const el = document.createElement('div');
                    el.className = 'boss20-talk-modal';
                    el.innerHTML = `
                        <div class="b20t-backdrop"></div>
                        <div class="b20t-panel">
                            <div class="b20t-cast">
                                <div class="b20t-actor b20t-actor-pixel" data-actor="pixel">
                                    <img src="https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/PC_assistant_sm.png" alt="PIXEL">
                                    <div class="b20t-name">PIXEL</div>
                                </div>
                                <div class="b20t-actor b20t-actor-boss" data-actor="boss">
                                    <img src="${LEVEL20_BOSS_TALK_SPRITE_URL}" alt="Boss Core">
                                    <div class="b20t-name">VIRAXIS PRIME</div>
                                </div>
                            </div>
                            <div class="b20t-dialog-wrap">
                                <div class="b20t-speaker" data-role="speaker">...</div>
                                <div class="b20t-dialog" data-role="line">...</div>
                            </div>
                            <div class="b20t-actions">
                                <button type="button" class="b20t-next">NEXT</button>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(el);
                    level20TalkCutsceneEl = el;
                    el.style.opacity = '1';
                    requestAnimationFrame(() => { try { el.classList.add('show'); } catch (e) { } });

                    const pixelEl = el.querySelector('[data-actor="pixel"]');
                    const bossEl = el.querySelector('[data-actor="boss"]');
                    const speakerEl = el.querySelector('[data-role="speaker"]');
                    const lineEl = el.querySelector('[data-role="line"]');
                    const nextBtn = el.querySelector('.b20t-next');

                    const step = () => {
                        const row = lines[Math.max(0, Math.min(lines.length - 1, i))];
                        const isBoss = row.who === 'boss';
                        if (speakerEl) speakerEl.textContent = isBoss ? 'VIRAXIS PRIME' : 'PIXEL';
                        if (lineEl) lineEl.textContent = row.text;
                        try {
                            if (pixelEl) pixelEl.classList.remove('talking');
                            if (bossEl) bossEl.classList.remove('talking');
                            if (isBoss) {
                                if (bossEl) bossEl.classList.add('talking');
                                playSfx(pickBossSfx());
                            } else {
                                if (pixelEl) pixelEl.classList.add('talking');
                                playSfx(pickPixelSfx());
                            }
                        } catch (e) { }
                        if (nextBtn) nextBtn.textContent = (i >= lines.length - 1) ? 'CONTINUE' : 'NEXT';
                    };

                    const finish = () => {
                        try { if (boss20State) boss20State.inCinematic = priorBoss20Cinematic; } catch (e) { }
                        try { inputLocked = false; } catch (e) { }
                        hideLevel20BossTalkCutscene(false);
                        if (typeof onDone === 'function') {
                            try { onDone(); } catch (e) { }
                        }
                    };
                    if (nextBtn) {
                        nextBtn.addEventListener('click', () => {
                            if (i >= lines.length - 1) {
                                finish();
                                return;
                            }
                            i += 1;
                            step();
                        });
                    }
                    step();
                } catch (e) {
                    if (typeof onDone === 'function') {
                        try { onDone(); } catch (e2) { }
                    }
                }
            }

            function showBoss20PhaseShiftTalkCutscene(onDone = null) {
                hideLevel20BossTalkCutscene(true);
                try {
                    level20TalkSfxOnly = true;
                    const lines = [
                        { who: 'pixel', text: 'Containment at 87%... we are absolutely not doomed. Probably.' },
                        { who: 'boss', text: 'Fool. You have set me free. This lab is now under new management.' },
                        { who: 'pixel', text: 'Operator, distract him a little longer. I have an idea.' }
                    ];
                    let i = 0;
                    const bossSfxKeys = ['evil1', 'evil2', 'evil3', 'evil4', 'evil5', 'evil6'];
                    const pickBossSfx = () => bossSfxKeys[Math.floor(Math.random() * bossSfxKeys.length)] || 'evil1';
                    const pickPixelSfx = () => `assistant_ai_${Math.floor(Math.random() * 7)}`;
                    const priorBoss20Cinematic = !!(boss20State && boss20State.inCinematic);
                    try { if (boss20State) boss20State.inCinematic = true; } catch (e) { }
                    try { stopBoss20PhaseTimer(); } catch (e) { }
                    try { inputLocked = true; } catch (e) { }

                    const el = document.createElement('div');
                    el.className = 'boss20-talk-modal';
                    el.innerHTML = `
                        <div class="b20t-backdrop"></div>
                        <div class="b20t-panel">
                            <div class="b20t-cast">
                                <div class="b20t-actor b20t-actor-pixel" data-actor="pixel">
                                    <img src="https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/PC_assistant_sm.png" alt="PIXEL">
                                    <div class="b20t-name">PIXEL</div>
                                </div>
                                <div class="b20t-actor b20t-actor-boss" data-actor="boss">
                                    <img src="${LEVEL20_BOSS_PHASESHIFT_TALK_SPRITE_URL}" alt="VIRAXIS PRIME">
                                    <div class="b20t-name">VIRAXIS PRIME</div>
                                </div>
                            </div>
                            <div class="b20t-dialog-wrap">
                                <div class="b20t-speaker" data-role="speaker">...</div>
                                <div class="b20t-dialog" data-role="line">...</div>
                            </div>
                            <div class="b20t-actions">
                                <button type="button" class="b20t-next">NEXT</button>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(el);
                    level20TalkCutsceneEl = el;
                    el.style.opacity = '1';
                    requestAnimationFrame(() => { try { el.classList.add('show'); } catch (e) { } });

                    const pixelEl = el.querySelector('[data-actor="pixel"]');
                    const bossEl = el.querySelector('[data-actor="boss"]');
                    const bossImg = bossEl ? bossEl.querySelector('img') : null;
                    if (bossImg) bossImg.style.transform = 'scaleX(-1)';
                    const speakerEl = el.querySelector('[data-role="speaker"]');
                    const lineEl = el.querySelector('[data-role="line"]');
                    const nextBtn = el.querySelector('.b20t-next');

                    const step = () => {
                        const row = lines[Math.max(0, Math.min(lines.length - 1, i))];
                        const isBoss = row.who === 'boss';
                        if (speakerEl) speakerEl.textContent = isBoss ? 'VIRAXIS PRIME' : 'PIXEL';
                        if (lineEl) lineEl.textContent = row.text;
                        try {
                            if (pixelEl) pixelEl.classList.remove('talking');
                            if (bossEl) bossEl.classList.remove('talking');
                            if (isBoss) {
                                if (bossEl) bossEl.classList.add('talking');
                                playSfx(pickBossSfx());
                            } else {
                                if (pixelEl) pixelEl.classList.add('talking');
                                playSfx(pickPixelSfx());
                            }
                        } catch (e) { }
                        if (nextBtn) nextBtn.textContent = (i >= lines.length - 1) ? 'CONTINUE' : 'NEXT';
                    };

                    const finish = () => {
                        try { if (boss20State) boss20State.inCinematic = priorBoss20Cinematic; } catch (e) { }
                        try { inputLocked = false; } catch (e) { }
                        hideLevel20BossTalkCutscene(false);
                        if (typeof onDone === 'function') {
                            try { onDone(); } catch (e) { }
                        }
                    };
                    if (nextBtn) {
                        nextBtn.addEventListener('click', () => {
                            if (i >= lines.length - 1) {
                                finish();
                                return;
                            }
                            i += 1;
                            step();
                        });
                    }
                    step();
                } catch (e) {
                    if (typeof onDone === 'function') {
                        try { onDone(); } catch (e2) { }
                    }
                }
            }

            function showBoss20RescueTalkCutscene(onDone = null) {
                hideLevel20BossTalkCutscene(true);
                try {
                    level20TalkSfxOnly = true;
                    const lines = [
                        { who: 'boss', text: 'Witness my final form. You are finished, and this lab is now mine!' },
                        { who: 'pixel', text: "We're not scared of you VIRAXIS!" },
                        { who: 'boss', text: 'Mock me while you can. I have evolved regeneration capabilities. I am immmortal!' },
                        { who: 'pixel', text: "Operator, this is our opening. I breached the mainframe and overclocked your nano bots. Hit hard, shields won’t hold for long." }
                    ];
                    let i = 0;
                    const bossSfxKeys = ['evil1', 'evil2', 'evil3', 'evil4', 'evil5', 'evil6'];
                    const pickBossSfx = () => bossSfxKeys[Math.floor(Math.random() * bossSfxKeys.length)] || 'evil1';
                    const pickPixelSfx = () => `assistant_ai_${Math.floor(Math.random() * 7)}`;
                    const priorBoss20Cinematic = !!(boss20State && boss20State.inCinematic);
                    try { if (boss20State) boss20State.inCinematic = true; } catch (e) { }
                    try { stopBoss20PhaseTimer(); } catch (e) { }
                    try { inputLocked = true; } catch (e) { }

                    const el = document.createElement('div');
                    el.className = 'boss20-talk-modal';
                    el.innerHTML = `
                        <div class="b20t-backdrop"></div>
                        <div class="b20t-panel">
                            <div class="b20t-cast">
                                <div class="b20t-actor b20t-actor-pixel" data-actor="pixel">
                                    <img src="https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/PC_assistant_sm.png" alt="PIXEL">
                                    <div class="b20t-name">PIXEL</div>
                                </div>
                                <div class="b20t-actor b20t-actor-boss" data-actor="boss">
                                    <img src="${LEVEL20_BOSS_MODAL_SPRITE_URL}" alt="VIRAXIS PRIME">
                                    <div class="b20t-name">VIRAXIS PRIME</div>
                                </div>
                            </div>
                            <div class="b20t-dialog-wrap">
                                <div class="b20t-speaker" data-role="speaker">...</div>
                                <div class="b20t-dialog" data-role="line">...</div>
                            </div>
                            <div class="b20t-actions">
                                <button type="button" class="b20t-next">NEXT</button>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(el);
                    level20TalkCutsceneEl = el;
                    el.style.opacity = '1';
                    requestAnimationFrame(() => { try { el.classList.add('show'); } catch (e) { } });

                    const pixelEl = el.querySelector('[data-actor="pixel"]');
                    const bossEl = el.querySelector('[data-actor="boss"]');
                    const speakerEl = el.querySelector('[data-role="speaker"]');
                    const lineEl = el.querySelector('[data-role="line"]');
                    const nextBtn = el.querySelector('.b20t-next');

                    const step = () => {
                        const row = lines[Math.max(0, Math.min(lines.length - 1, i))];
                        const isBoss = row.who === 'boss';
                        if (speakerEl) speakerEl.textContent = isBoss ? 'VIRAXIS PRIME' : 'PIXEL';
                        if (lineEl) lineEl.textContent = row.text;
                        try {
                            if (pixelEl) pixelEl.classList.remove('talking');
                            if (bossEl) bossEl.classList.remove('talking');
                            if (isBoss) {
                                if (bossEl) bossEl.classList.add('talking');
                                playSfx(pickBossSfx());
                            } else {
                                if (pixelEl) pixelEl.classList.add('talking');
                                playSfx(pickPixelSfx());
                            }
                        } catch (e) { }
                        if (nextBtn) nextBtn.textContent = (i >= lines.length - 1) ? 'CONTINUE' : 'NEXT';
                    };

                    const finish = () => {
                        try { if (boss20State) boss20State.inCinematic = priorBoss20Cinematic; } catch (e) { }
                        try { inputLocked = false; } catch (e) { }
                        hideLevel20BossTalkCutscene(false);
                        if (typeof onDone === 'function') {
                            try { onDone(); } catch (e) { }
                        }
                    };
                    if (nextBtn) {
                        nextBtn.addEventListener('click', () => {
                            if (i >= lines.length - 1) {
                                finish();
                                return;
                            }
                            i += 1;
                            step();
                        });
                    }
                    step();
                } catch (e) {
                    if (typeof onDone === 'function') {
                        try { onDone(); } catch (e2) { }
                    }
                }
            }

            function showBoss20FinalWindowTalkCutscene(onDone = null) {
                hideLevel20BossTalkCutscene(true);
                try {
                    level20TalkSfxOnly = true;
                    const lines = [
                        { who: 'boss', text: "Impossible! VIRAXIS PRIME does not fall to a S.P.A.R.E. operator." },
                        { who: 'pixel', text: 'You are nothing more than a containment failure!' },
                        { who: 'boss', text: "Then you will fail with me!" },
                        { who: 'pixel', text: "Operator, VIRAXIS PRIME is overloading the core. Lock onto the targetting marker. We have one chance to end this." }
                    ];
                    let i = 0;
                    const bossSfxKeys = ['evil1', 'evil2', 'evil3', 'evil4', 'evil5', 'evil6'];
                    const pickBossSfx = () => bossSfxKeys[Math.floor(Math.random() * bossSfxKeys.length)] || 'evil1';
                    const pickPixelSfx = () => `assistant_ai_${Math.floor(Math.random() * 7)}`;
                    const priorBoss20Cinematic = !!(boss20State && boss20State.inCinematic);
                    try { if (boss20State) boss20State.inCinematic = true; } catch (e) { }
                    try { stopBoss20PhaseTimer(); } catch (e) { }
                    try { inputLocked = true; } catch (e) { }

                    const el = document.createElement('div');
                    el.className = 'boss20-talk-modal';
                    el.innerHTML = `
                        <div class="b20t-backdrop"></div>
                        <div class="b20t-panel">
                            <div class="b20t-cast">
                                <div class="b20t-actor b20t-actor-pixel" data-actor="pixel">
                                    <img src="https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/PC_assistant_sm.png" alt="PIXEL">
                                    <div class="b20t-name">PIXEL</div>
                                </div>
                                <div class="b20t-actor b20t-actor-boss" data-actor="boss">
                                    <img src="${LEVEL20_BOSS_MODAL_SPRITE_URL}" alt="VIRAXIS PRIME">
                                    <div class="b20t-name">VIRAXIS PRIME</div>
                                </div>
                            </div>
                            <div class="b20t-dialog-wrap">
                                <div class="b20t-speaker" data-role="speaker">...</div>
                                <div class="b20t-dialog" data-role="line">...</div>
                            </div>
                            <div class="b20t-actions">
                                <button type="button" class="b20t-next">NEXT</button>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(el);
                    level20TalkCutsceneEl = el;
                    el.style.opacity = '1';
                    requestAnimationFrame(() => { try { el.classList.add('show'); } catch (e) { } });

                    const pixelEl = el.querySelector('[data-actor="pixel"]');
                    const bossEl = el.querySelector('[data-actor="boss"]');
                    const speakerEl = el.querySelector('[data-role="speaker"]');
                    const lineEl = el.querySelector('[data-role="line"]');
                    const nextBtn = el.querySelector('.b20t-next');

                    const step = () => {
                        const row = lines[Math.max(0, Math.min(lines.length - 1, i))];
                        const isBoss = row.who === 'boss';
                        if (speakerEl) speakerEl.textContent = isBoss ? 'VIRAXIS PRIME' : 'PIXEL';
                        if (lineEl) lineEl.textContent = row.text;
                        try {
                            if (pixelEl) pixelEl.classList.remove('talking');
                            if (bossEl) bossEl.classList.remove('talking');
                            if (isBoss) {
                                if (bossEl) bossEl.classList.add('talking');
                                playSfx(pickBossSfx());
                            } else {
                                if (pixelEl) pixelEl.classList.add('talking');
                                playSfx(pickPixelSfx());
                            }
                        } catch (e) { }
                        if (nextBtn) nextBtn.textContent = (i >= lines.length - 1) ? 'CONTINUE' : 'NEXT';
                    };

                    const finish = () => {
                        try { if (boss20State) boss20State.inCinematic = priorBoss20Cinematic; } catch (e) { }
                        try { inputLocked = false; } catch (e) { }
                        hideLevel20BossTalkCutscene(false);
                        if (typeof onDone === 'function') {
                            try { onDone(); } catch (e) { }
                        }
                    };
                    if (nextBtn) {
                        nextBtn.addEventListener('click', () => {
                            if (i >= lines.length - 1) {
                                finish();
                                return;
                            }
                            i += 1;
                            step();
                        });
                    }
                    step();
                } catch (e) {
                    if (typeof onDone === 'function') {
                        try { onDone(); } catch (e2) { }
                    }
                }
            }

            function hideFinalOfferPopup(immediate = false, opts = {}) {
                try {
                    try {
                        if (finalOfferPreludeTimer) {
                            clearTimeout(finalOfferPreludeTimer);
                            finalOfferPreludeTimer = null;
                        }
                    } catch (e) { }
                    stopFinalOfferMusicDuck();
                    hideFinalOfferPrelude(immediate);
                    if (opts.keepGlobal !== true) hideFinalOfferGlobalPrelude(immediate);
                    const el = finalOfferPopupEl || document.querySelector('.final-offer-modal');
                    if (!el) {
                        finalOfferPopupEl = null;
                        finalOfferModalOpen = false;
                        if (runPerkState) runPerkState.popupOpen = false;
                        try { document.body.classList.remove('run-perk-open'); } catch (e) { }
                        try { syncRotatingBlockerUI(); } catch (e) { }
                        return;
                    }
                    const cleanup = () => {
                        try {
                            if (el._foRevealUnlockTimer) clearTimeout(el._foRevealUnlockTimer);
                        } catch (e) { }
                        try {
                            if (typeof el._foRemoveViewportListeners === 'function') el._foRemoveViewportListeners();
                        } catch (e) { }
                        try { el.remove(); } catch (e) { }
                        finalOfferPopupEl = null;
                        finalOfferModalOpen = false;
                        if (runPerkState) runPerkState.popupOpen = false;
                        try { document.body.classList.remove('run-perk-open'); } catch (e) { }
                        try { syncRotatingBlockerUI(); } catch (e) { }
                    };
                    if (immediate) {
                        cleanup();
                        return;
                    }
                    el.classList.remove('show');
                    el.classList.add('hide');
                    el.addEventListener('animationend', cleanup, { once: true });
                } catch (e) { }
            }

            function resetRunPerkState() {
                runPerkState = createDefaultRunPerkState();
                finalOfferSkipPreludeOnce = false;
                hideRunPerkPopup(true);
                hideFinalOfferPopup(true);
            }

            function getRunPerkPoolForSource(source, levelNum = getCurrentLevelNumber()) {
                const src = String(source || 'pixel');
                const lvl = Math.max(1, Number(levelNum) || 1);
                if (src === 'broker') {
                    const pool = [];
                    if (lvl >= 5) pool.push('broker_quickfix');
                    if (lvl >= 8) pool.push('broker_hotwire');
                    if (lvl >= 10) pool.push('broker_heavy_armor');
                    if (lvl >= 15) pool.push('laser_jammer');
                    if (lvl >= 12) pool.push('broker_risky_cache');
                    if (lvl >= 10) pool.push('broker_borrowed_time');
                    if (lvl >= 11) pool.push('broker_dirty_reactor');
                    if (lvl >= 12) pool.push('broker_hazard_infusion');
                    return pool;
                }
                const pool = ['emergency_cells', 'storm_capacitor', 'overclocked_reserve'];
                if (lvl >= 5) pool.push('armor_piercer');
                if (lvl >= 6) pool.push('reserve_expansion');
                if (lvl >= 8) pool.push('storm_tuning');
                if (lvl >= 10) pool.push('containment_freeze', 'boss_breaker');
                return pool;
            }

            function isRunPerkRelevant(perkId, levelNum = getCurrentLevelNumber()) {
                const id = String(perkId || '');
                if (id === 'emergency_cells') return true;
                if (id === 'storm_capacitor') return (runPerkState.stormCapacitorCharges <= 0);
                if (id === 'armor_piercer') return true;
                if (id === 'containment_freeze') return isRotatingBlockerActive(levelNum) && !isBlockerTemporarilyDisabled();
                if (id === 'laser_jammer') return isRotatingBlockerActive(levelNum) && !isBlockerTemporarilyDisabled() && (Number(runPerkState.blockerSpeedFactor) || 1) <= 1.01;
                if (id === 'boss_breaker') return true;
                if (id === 'overclocked_reserve') return (runPerkState.overclockedReserveLevelsPending <= 0);
                if (id === 'reserve_expansion') return (Number(runPerkState.clickCapDelta) || 0) < 6;
                if (id === 'storm_tuning') return (Number(runPerkState.stormRechargeDelta) || 0) > -9;
                if (id === 'broker_quickfix') return (Number(runPerkState.levelClearClicksPenalty) || 0) < 3;
                if (id === 'broker_hotwire') return (Number(runPerkState.hotwireNextRechargePenalty) || 0) < 12;
                if (id === 'broker_heavy_armor') return (Number(runPerkState.clickCapDelta) || 0) > -8;
                if (id === 'broker_risky_cache') return (Number(runPerkState.scoreMultiplier) || 1) > 0.66;
                if (id === 'broker_borrowed_time') return (Number(runPerkState.miniBossBonusPenalty) || 0) < 6;
                if (id === 'broker_dirty_reactor') return !runPerkState.stormNoDiagonals;
                if (id === 'broker_hazard_infusion') return (Number(runPerkState.specialVirusChanceDelta) || 0) < 0.20;
                return false;
            }

            function pickRandomPerkId(ids, excluded = new Set()) {
                const list = (Array.isArray(ids) ? ids : []).filter((id) => !excluded.has(id));
                if (!list.length) return null;
                return list[Math.floor(Math.random() * list.length)] || null;
            }

            function pickRunPerkForSource(source, levelNum, round, excluded = new Set()) {
                const pool = getRunPerkPoolForSource(source, levelNum).filter((id) => isRunPerkRelevant(id, levelNum) && !excluded.has(id));
                if (!pool.length) return null;
                const cooled = pool.filter((id) => {
                    const key = `${source}:${id}`;
                    const last = runPerkState.lastOfferedRound[key];
                    if (!Number.isFinite(last)) return true;
                    return (round - last) > 1;
                });
                const sourcePool = cooled.length ? cooled : pool;
                const picked = pickRandomPerkId(sourcePool, new Set());
                if (!picked) return null;
                runPerkState.lastOfferedRound[`${source}:${picked}`] = round;
                return picked;
            }

            function buildRunPerkOfferPair(levelNum = getCurrentLevelNumber()) {
                const round = Math.max(0, Number(runPerkState.picksCount) || 0);
                const brokerOnly = !!(runPerkState && runPerkState.continueDealTaken);
                const picked = [];
                const used = new Set();
                if (brokerOnly) {
                    let brokerA = pickRunPerkForSource('broker', levelNum, round, used);
                    if (!brokerA) brokerA = 'broker_quickfix';
                    if (!RUN_PERK_DEFS[brokerA]) brokerA = 'broker_quickfix';
                    used.add(brokerA);
                    picked.push(brokerA);

                    let brokerB = pickRunPerkForSource('broker', levelNum, round, used);
                    if (!brokerB) {
                        const brokerPool = getRunPerkPoolForSource('broker', levelNum)
                            .filter((id) => id !== brokerA && isRunPerkRelevant(id, levelNum));
                        brokerB = brokerPool[0] || 'broker_hotwire';
                    }
                    if (!RUN_PERK_DEFS[brokerB]) brokerB = 'broker_hotwire';
                    if (brokerB === brokerA) brokerB = 'broker_heavy_armor';
                    if (!RUN_PERK_DEFS[brokerB]) brokerB = 'broker_quickfix';
                    picked.push(brokerB);
                    return picked.map((id) => RUN_PERK_DEFS[id]).filter(Boolean).slice(0, 2);
                }

                let pixelId = pickRunPerkForSource('pixel', levelNum, round, used) || 'emergency_cells';
                if (!isRunPerkRelevant(pixelId, levelNum)) pixelId = 'emergency_cells';
                used.add(pixelId);
                picked.push(pixelId);

                let brokerId = pickRunPerkForSource('broker', levelNum, round, used);
                if (!brokerId) {
                    brokerId = pickRunPerkForSource('pixel', levelNum, round, used);
                }
                if (!brokerId || !RUN_PERK_DEFS[brokerId]) brokerId = 'overclocked_reserve';
                if (!isRunPerkRelevant(brokerId, levelNum)) brokerId = 'emergency_cells';
                if (brokerId === pixelId) {
                    const fallbackPool = getRunPerkPoolForSource('pixel', levelNum)
                        .concat(getRunPerkPoolForSource('broker', levelNum))
                        .filter((id) => id !== pixelId && isRunPerkRelevant(id, levelNum));
                    brokerId = fallbackPool[0] || 'overclocked_reserve';
                }
                picked.push(brokerId);
                return picked.map((id) => RUN_PERK_DEFS[id]).filter(Boolean).slice(0, 2);
            }

            function applyRunPerkChoice(perkId) {
                let id = String(perkId || '');
                let allowOverflowClicks = false;
                if (!RUN_PERK_DEFS[id]) id = 'emergency_cells';
                if (!isRunPerkRelevant(id, getCurrentLevelNumber())) id = 'emergency_cells';
                if (id === 'emergency_cells') {
                    clicksLeft = clicksLeft + 2;
                } else if (id === 'storm_capacitor') {
                    runPerkState.stormCapacitorCharges = Math.max(1, Number(runPerkState.stormCapacitorCharges) || 0);
                } else if (id === 'armor_piercer') {
                    runPerkState.armorPiercerHits = Math.max(0, Number(runPerkState.armorPiercerHits) || 0) + 3;
                } else if (id === 'containment_freeze') {
                    if (isRotatingBlockerActive()) {
                        runPerkState.blockerFrozenUntil = Math.max(Number(runPerkState.blockerFrozenUntil) || 0, Date.now() + 4500);
                        try { syncRotatingBlockerUI(); } catch (e) { }
                        try { scheduleRotatingBlockerTick(); } catch (e) { }
                    } else {
                        clicksLeft = clicksLeft + 2;
                        id = 'emergency_cells';
                    }
                } else if (id === 'laser_jammer') {
                    if (isRotatingBlockerActive()) {
                        runPerkState.blockerDisabledUntil = Math.max(Number(runPerkState.blockerDisabledUntil) || 0, Date.now() + 5000);
                        runPerkState.blockerSpeedFactor = Math.min(1.8, Math.max(1, (Number(runPerkState.blockerSpeedFactor) || 1) * 1.25));
                        runPerkState.acceptedDeals = (Number(runPerkState.acceptedDeals) || 0) + 1;
                        try { syncRotatingBlockerUI(); } catch (e) { }
                        try { scheduleRotatingBlockerTick(); } catch (e) { }
                    }
                } else if (id === 'boss_breaker') {
                    runPerkState.bossBreakerHits = Math.max(0, Number(runPerkState.bossBreakerHits) || 0) + 2;
                } else if (id === 'overclocked_reserve') {
                    runPerkState.overclockedReserveLevelsPending = Math.max(0, Number(runPerkState.overclockedReserveLevelsPending) || 0) + 2;
                } else if (id === 'reserve_expansion') {
                    runPerkState.clickCapDelta = Math.min(6, (Number(runPerkState.clickCapDelta) || 0) + 2);
                } else if (id === 'storm_tuning') {
                    runPerkState.stormRechargeDelta = Math.max(-9, (Number(runPerkState.stormRechargeDelta) || 0) - 3);
                } else if (id === 'broker_quickfix') {
                    clicksLeft = clicksLeft + 4;
                    allowOverflowClicks = true;
                    runPerkState.levelClearClicksPenalty = Math.min(3, (Number(runPerkState.levelClearClicksPenalty) || 0) + 1);
                    runPerkState.acceptedDeals = (Number(runPerkState.acceptedDeals) || 0) + 1;
                } else if (id === 'broker_hotwire') {
                    const beforeStorm = Math.max(0, Number(stormCharges) || 0);
                    stormCharges = Math.min(MAX_STORM_CHARGES, (Number(stormCharges) || 0) + 1);
                    if (stormCharges > beforeStorm) {
                        try { flashStormChargeGain(); } catch (e) { }
                        try { updateStormUI(); } catch (e) { }
                    }
                    runPerkState.hotwireNextRechargePenalty = Math.min(12, (Number(runPerkState.hotwireNextRechargePenalty) || 0) + 3);
                    runPerkState.acceptedDeals = (Number(runPerkState.acceptedDeals) || 0) + 1;
                } else if (id === 'broker_heavy_armor') {
                    runPerkState.armorPiercerHits = Math.max(0, Number(runPerkState.armorPiercerHits) || 0) + 5;
                    runPerkState.clickCapDelta = Math.max(-8, (Number(runPerkState.clickCapDelta) || 0) - 2);
                    runPerkState.acceptedDeals = (Number(runPerkState.acceptedDeals) || 0) + 1;
                } else if (id === 'broker_risky_cache') {
                    runPerkState.overclockedReservePending = Math.max(0, Number(runPerkState.overclockedReservePending) || 0) + 4;
                    const nextMult = (Number(runPerkState.scoreMultiplier) || 1) * 0.88;
                    runPerkState.scoreMultiplier = Math.max(0.65, Math.min(1, nextMult));
                    runPerkState.acceptedDeals = (Number(runPerkState.acceptedDeals) || 0) + 1;
                } else if (id === 'broker_borrowed_time') {
                    clicksLeft = clicksLeft + 4;
                    runPerkState.miniBossBonusPenalty = Math.min(8, (Number(runPerkState.miniBossBonusPenalty) || 0) + 2);
                    runPerkState.acceptedDeals = (Number(runPerkState.acceptedDeals) || 0) + 1;
                } else if (id === 'broker_dirty_reactor') {
                    const beforeStorm = Math.max(0, Number(stormCharges) || 0);
                    stormCharges = Math.min(MAX_STORM_CHARGES, (Number(stormCharges) || 0) + 1);
                    if (stormCharges > beforeStorm) {
                        try { flashStormChargeGain(); } catch (e) { }
                        try { updateStormUI(); } catch (e) { }
                    }
                    runPerkState.dirtyReactorFixedRecharge = true;
                    runPerkState.stormNoDiagonals = true;
                    runPerkState.acceptedDeals = (Number(runPerkState.acceptedDeals) || 0) + 1;
                } else if (id === 'broker_hazard_infusion') {
                    runPerkState.overclockedReservePending = Math.max(2, (Number(runPerkState.overclockedReservePending) || 0) + 2);
                    runPerkState.specialVirusChanceDelta = Math.min(0.20, (Number(runPerkState.specialVirusChanceDelta) || 0) + 0.05);
                    runPerkState.acceptedDeals = (Number(runPerkState.acceptedDeals) || 0) + 1;
                }
                if (allowOverflowClicks) clicksLeft = Math.max(0, Number(clicksLeft) || 0);
                else clampClicksToCap();
                try { playSfx('fill'); } catch (e) { }
                return id;
            }

            function shouldShowFinalOfferForLevel(levelNum) {
                if (isEnduranceMode()) return false;
                const lvl = Math.max(1, Math.floor(Number(levelNum) || getCurrentLevelNumber()));
                if (!FINAL_OFFER_CONFIG || FINAL_OFFER_CONFIG.enabled === false) return false;
                if (lvl !== Math.max(1, Math.floor(Number(FINAL_OFFER_CONFIG.level) || 20))) return false;
                if (!runPerkState || runPerkState.finalOfferSeen) return false;
                return true;
            }

            function applyFinalOfferClickFloor() {
                if (!runPerkState) return;
                const floor = Math.max(0, Math.floor(Number(FINAL_OFFER_CONFIG && FINAL_OFFER_CONFIG.minClicksFloor) || 0));
                if (floor <= 0) return;
                clicksLeft = Math.max(floor, Math.max(0, Number(clicksLeft) || 0));
            }

            function applyFinalOfferChoice(choiceId) {
                const id = String(choiceId || '');
                const pixelId = String(FINAL_OFFER_CONFIG && FINAL_OFFER_CONFIG.pixel && FINAL_OFFER_CONFIG.pixel.id || 'final_pixel_safe_protocol');
                const brokerId = String(FINAL_OFFER_CONFIG && FINAL_OFFER_CONFIG.broker && FINAL_OFFER_CONFIG.broker.id || 'final_viral_hostile_buyout');
                const soloId = 'final_on_my_own';
                if (!runPerkState) return id;
                runPerkState.finalOfferSeen = true;
                runPerkState.finalOfferPending = false;
                runPerkState.finalOfferChoice = id;

                if (id === pixelId) {
                    clicksLeft = Math.max(0, (Number(clicksLeft) || 0) + 6);
                    const beforeStorm = Math.max(0, Number(stormCharges) || 0);
                    stormCharges = Math.min(MAX_STORM_CHARGES, beforeStorm + 1);
                    if (stormCharges > beforeStorm) {
                        try { flashStormChargeGain(); } catch (e) { }
                    }
                    runPerkState.finalBossSlowUntil = Math.max(
                        Number(runPerkState.finalBossSlowUntil) || 0,
                        Date.now() + Math.max(1000, Math.floor(Number(FINAL_OFFER_CONFIG.bossSlowMs) || 20000))
                    );
                } else if (id === brokerId) {
                    clicksLeft = Math.max(0, (Number(clicksLeft) || 0) + 15);
                    stormCharges = Math.min(MAX_STORM_CHARGES, Math.max(1, Number(stormCharges) || 0));
                    try { setStormArmed(false); } catch (e) { }
                    const keep = Math.max(0, Math.min(1, Number(FINAL_OFFER_CONFIG.scoreKeepRatio) || 0.49));
                    totalScore = Math.max(0, Math.floor((Number(totalScore) || 0) * keep));
                    runPerkState.disableScoreDeals = true;
                    runPerkState.pendingOffers = 0;
                    runPerkState.finalBossHpScale = Math.max(
                        0.4,
                        Math.min(Number(runPerkState.finalBossHpScale) || 1, Math.max(0.4, Math.min(1, Number(FINAL_OFFER_CONFIG.bossHpScale) || 0.8)))
                    );
                    runPerkState.acceptedDeals = (Number(runPerkState.acceptedDeals) || 0) + 1;
                } else if (id === soloId) {
                    // Explicitly no perk/deal applied.
                }

                applyFinalOfferClickFloor();
                try { updateStormUI(); } catch (e) { }
                updateHUD();
                return id;
            }

            function canShowFinalOfferPopup() {
                if (!runPerkState || !runPerkState.finalOfferPending || runPerkState.finalOfferSeen) return false;
                if (isFinalVictoryActive()) return false;
                if (inputLocked || stormResolving || outOfClicksShown) return false;
                if (finalOfferPreludeActive || finalOfferModalOpen) return false;
                if (typeof particlesActive === 'function' && particlesActive()) return false;
                try {
                    if (document.querySelector('.level-complete')) return false;
                    if (document.querySelector('.game-over-popup')) return false;
                    if (document.querySelector('.run-perk-popup')) return false;
                    if (document.querySelector('.final-offer-modal')) return false;
                    if (document.querySelector('.final-offer-prelude.final-offer-prelude-board')) return false;
                    const audioPopup = document.getElementById('audioPopup');
                    const helpPopup = document.getElementById('helpPopup');
                    const aboutPopup = document.getElementById('aboutPopup');
                    if (audioPopup && audioPopup.classList.contains('show')) return false;
                    if (helpPopup && helpPopup.classList.contains('show')) return false;
                    if (aboutPopup && aboutPopup.classList.contains('show')) return false;
                } catch (e) { }
                return true;
            }

            function showFinalOfferPopup() {
                if (!canShowFinalOfferPopup()) return false;
                const pixel = Object.assign({}, FINAL_OFFER_CONFIG.pixel || {});
                const broker = Object.assign({}, FINAL_OFFER_CONFIG.broker || {});
                const pair = [pixel, broker].filter((p) => p && p.id);
                if (pair.length < 2) return false;
                const skipPrelude = !!finalOfferSkipPreludeOnce;
                finalOfferSkipPreludeOnce = false;
                try {
                    const keepGlobal = skipPrelude && !!(finalOfferGlobalPreludeEl || document.querySelector('.final-offer-prelude.final-offer-prelude-global'));
                    hideFinalOfferPopup(true, { keepGlobal });
                    try { hideActiveChainBadge(false); } catch (e) { }
                    finalOfferModalOpen = true;
                    finalOfferPreludeActive = !skipPrelude;
                    if (runPerkState) runPerkState.popupOpen = true;
                    inputLocked = true;
                    try { document.body.classList.add('run-perk-open'); } catch (e) { }
                    try { stopRotatingBlockerTicker(); } catch (e) { }
                    const mountFinalOfferModal = () => {
                        const pixelDesc = '+6 clicks, +1 Nano Storm, and boss systems run slower for a short time.';
                        const soloDesc = 'No bonus and no penalty. Enter level 20 with your current resources.';
                        const brokerDesc = '+15 clicks, +1 Nano Storm charge, and boss HP -20%; VV keeps 51% of your points and future MODS are disabled.';
                        const el = document.createElement('div');
                        el.className = 'final-offer-modal';
                        el.setAttribute('role', 'dialog');
                        el.setAttribute('aria-modal', 'true');
                        el.dataset.pickReady = '0';
                        el.classList.add('pick-locked');
                        el.innerHTML = `
                            <div class="fo-art" style="background-image:url('${escapeHtmlAttr(FINAL_OFFER_IMAGE_URL)}');"></div>
                            <div class="fo-shade"></div>
                            <div class="fo-legend">
                                <div class="fo-choice fo-choice-pixel">
                                    <div class="fo-choice-title">PIXEL PERK</div>
                                    <div class="fo-choice-desc">${escapeHtml(pixelDesc)}</div>
                                </div>
                                <div class="fo-choice fo-choice-solo">
                                    <div class="fo-choice-title">ON MY OWN</div>
                                    <div class="fo-choice-desc">${escapeHtml(soloDesc)}</div>
                                </div>
                                <div class="fo-choice fo-choice-broker">
                                    <div class="fo-choice-title">VIRAL VENTURE</div>
                                    <div class="fo-choice-desc">${escapeHtml(brokerDesc)}</div>
                                </div>
                            </div>
                            <div class="fo-actions">
                                <button type="button" class="fo-btn fo-btn-pixel" data-offer="${escapeHtmlAttr(pixel.id)}">PIXEL PERK</button>
                                <button type="button" class="fo-btn fo-btn-solo" data-offer="final_on_my_own">ON MY OWN</button>
                                <button type="button" class="fo-btn fo-btn-broker" data-offer="${escapeHtmlAttr(broker.id)}">VIRAL VENTURE</button>
                            </div>
                        `;
                        const onPick = (ev) => {
                            if (!el || el.dataset.pickReady !== '1') return;
                            const btn = ev.target && ev.target.closest ? ev.target.closest('.fo-btn[data-offer]') : null;
                            if (!btn) return;
                            const chosenId = applyFinalOfferChoice(btn.getAttribute('data-offer'));
                            hideFinalOfferPopup(false);
                            inputLocked = false;
                            try {
                                if (window.Assistant && Assistant.show) {
                                    if (chosenId === broker.id) {
                                        Assistant.show('Viral venture accepted. Big power now, expensive consequences later.', { priority: 2 });
                                    } else if (chosenId === 'final_on_my_own') {
                                        Assistant.show('No deal selected. Respect. You are entering alone.', { priority: 2 });
                                    } else {
                                        Assistant.show('PIXEL perk loaded. Modest boost online for the final fight.', { priority: 2 });
                                    }
                                }
                            } catch (e) { }
                        };
                        el.addEventListener('click', onPick);
                        document.body.appendChild(el);
                        finalOfferPopupEl = el;
                        if (runPerkState) runPerkState.popupOpen = true;
                        const positionOverBoard = () => {
                            try {
                                const board = document.getElementById('board') || document.querySelector('.board');
                                if (!board) return;
                                const r = board.getBoundingClientRect();
                                el.style.left = Math.round(r.left) + 'px';
                                el.style.top = Math.round(r.top) + 'px';
                                el.style.width = Math.max(120, Math.round(r.width)) + 'px';
                                el.style.height = Math.max(120, Math.round(r.height)) + 'px';
                            } catch (e) { }
                        };
                        const onViewportChange = () => positionOverBoard();
                        positionOverBoard();
                        window.addEventListener('resize', onViewportChange);
                        window.addEventListener('scroll', onViewportChange, true);
                        el._foRemoveViewportListeners = () => {
                            try { window.removeEventListener('resize', onViewportChange); } catch (e) { }
                            try { window.removeEventListener('scroll', onViewportChange, true); } catch (e) { }
                        };
                        void el.offsetWidth;
                        el.classList.add('show');
                        if (musicOverrideMode !== 'final-boss') {
                            try { startFinalBossTheme({ fadeInMs: 1000, initialVolumeRatio: 0.03 }); } catch (e) { }
                        }
                        el._foRevealUnlockTimer = setTimeout(() => {
                            try {
                                if (!document.body.contains(el)) return;
                                el.dataset.pickReady = '1';
                                el.classList.remove('pick-locked');
                            } catch (e) { }
                        }, 650);
                        hideFinalOfferPrelude(false);
                        hideFinalOfferGlobalPrelude(false, FINAL_OFFER_GLOBAL_PRELUDE_FADE_OUT_MS);
                    };
                    if (skipPrelude) {
                        mountFinalOfferModal();
                        return true;
                    }
                    const preludeMs = showFinalOfferPrelude(FINAL_OFFER_PRELUDE_FADE_MS);
                    fadeCurrentMusicForFinalOffer(FINAL_OFFER_MUSIC_DUCK_MS, FINAL_OFFER_MUSIC_DUCK_RATIO);
                    try {
                        if (finalOfferPreludeTimer) clearTimeout(finalOfferPreludeTimer);
                    } catch (e) { }
                    finalOfferPreludeTimer = setTimeout(() => {
                        finalOfferPreludeTimer = null;
                        if (!finalOfferModalOpen) return;
                        if (!runPerkState || !runPerkState.finalOfferPending || runPerkState.finalOfferSeen) return;
                        mountFinalOfferModal();
                    }, Math.max(240, Math.floor(Number(preludeMs) || FINAL_OFFER_PRELUDE_FADE_MS)));
                    return true;
                } catch (e) {
                    hideFinalOfferPopup(true);
                    return false;
                }
            }

            function maybeShowPendingFinalOfferPopup(delayMs = 0) {
                const wait = Math.max(0, Number(delayMs) || 0);
                setTimeout(() => {
                    try {
                        if (!runPerkState || !runPerkState.finalOfferPending || runPerkState.finalOfferSeen) return;
                        if (inputLocked || stormResolving) {
                            maybeShowPendingFinalOfferPopup(180);
                            return;
                        }
                        if (!showFinalOfferPopup()) {
                            maybeShowPendingFinalOfferPopup(220);
                        }
                    } catch (e) { }
                }, wait);
            }

            function canShowRunPerkPopup() {
                if (isEnduranceMode()) return false;
                if (!runPerkState || runPerkState.pendingOffers <= 0 || runPerkState.popupOpen) return false;
                if (runPerkState.finalOfferPending) return false;
                if (isFinalVictoryActive()) return false;
                if (inputLocked || stormResolving || outOfClicksShown) return false;
                if (typeof particlesActive === 'function' && particlesActive()) return false;
                try {
                    if (document.querySelector('.level-complete')) return false;
                    if (document.querySelector('.game-over-popup')) return false;
                    const audioPopup = document.getElementById('audioPopup');
                    const helpPopup = document.getElementById('helpPopup');
                    if (audioPopup && audioPopup.classList.contains('show')) return false;
                    if (helpPopup && helpPopup.classList.contains('show')) return false;
                } catch (e) { }
                return true;
            }

            function showRunPerkPopup(offers) {
                const pair = (Array.isArray(offers) ? offers.filter(Boolean) : []).slice(0, 2);
                if (pair.length < 2) return false;
                try {
                    try { hideActiveChainBadge(false); } catch (e) { }
                    const hasViralVenture = pair.some((p) => String((p && p.source) || '') === 'broker');
                    const subTitleText = hasViralVenture
                        ? 'Choose wisely: PIXEL PERKS and VIRAL VENTURES'
                        : 'Choose wisely';
                    const defaultCardBackUrl = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/card_back_test.png';
                    const pixelCardBackUrl = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/card_pixel_back.png';
                    const viralCardBackUrl = 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/card_viral_back.png';
                    const customFrontCardUrlById = {
                        armor_piercer: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/card_armor_piecer.png',
                        boss_breaker: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/card_boss_breaker.png',
                        containment_freeze: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/card_containment_freeze.png',
                        emergency_cells: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/card_emergency_cells.png',
                        laser_jammer: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/card_laser_jammer.png',
                        overclocked_reserve: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/card_overclocked_reserve.png',
                        reserve_expansion: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/card_reserve_expansion.png',
                        storm_capacitor: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/card_storm_capacitor.png',
                        storm_tuning: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/card_storm_tuning.png',
                        broker_quickfix: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/card_quickfix.png',
                        broker_hotwire: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/card_blackmarket_hotwire.png',
                        broker_heavy_armor: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/card_razor_payload.png',
                        broker_risky_cache: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/card_risky_cache.png',
                        broker_borrowed_time: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/card_borrowed_time.png',
                        broker_dirty_reactor: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/card_dirty_reactor.png',
                        broker_hazard_infusion: 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/card_hazard_infusion.png'
                    };
                    const renderDealCard = (offer) => {
                        const source = escapeHtmlAttr(offer && offer.source ? offer.source : 'pixel');
                        const laneLabel = (String(offer && offer.source || '') === 'broker') ? 'VIRAL VENTURE' : 'PIXEL PERK';
                        const laneClass = source === 'broker' ? 'rp-broker' : 'rp-pixel';
                        const cardBackUrl = source === 'broker' ? viralCardBackUrl : pixelCardBackUrl;
                        const safeCardUrl = escapeHtmlAttr(cardBackUrl || defaultCardBackUrl);
                        const cardInlineStyle = `border:3px solid #ffd94a;border-radius:12px;box-shadow:0 0 0 2px #07163a, 0 6px 10px rgba(0,0,0,.42);display:block;position:relative;overflow:hidden;background:#113370;`;
                        const backInlineStyle = `background-image:url('${safeCardUrl}');background-size:cover;background-position:center center;background-repeat:no-repeat;`;
                        const offerId = String((offer && offer.id) || '');
                        const frontCardUrl = customFrontCardUrlById[offerId] || defaultCardBackUrl;
                        const safeFrontCardUrl = escapeHtmlAttr(frontCardUrl);
                        const frontInlineStyle = `background-image:url('${safeFrontCardUrl}');background-size:cover;background-position:center center;background-repeat:no-repeat;`;
                        return `
                            <button type="button" class="rp-item ${laneClass}" data-perk="${escapeHtmlAttr(offer.id)}" data-source="${source}">
                                <span class="rp-source rp-source-${source}">${escapeHtml(laneLabel)}</span>
                                <span class="rp-card-wrap" aria-hidden="true">
                                    <span class="rp-card" style="${cardInlineStyle}">
                                        <span class="rp-card-back-inline" style="${backInlineStyle}"></span>
                                        <span class="rp-card-front-inline has-front-art" style="${frontInlineStyle}">
                                            <span class="rp-card-front-inline-badge">${escapeHtml(laneLabel)}</span>
                                            <span class="rp-card-front-inline-title">${escapeHtml(offer.title)}</span>
                                        </span>
                                    </span>
                                </span>
                                <span class="rp-info">
                                    <span class="rp-item-title">${escapeHtml(offer.title)}</span>
                                    <span class="rp-item-desc">${escapeHtml(offer.desc)}</span>
                                </span>
                            </button>
                        `;
                    };
                    hideRunPerkPopup(true);
                    const el = document.createElement('div');
                    el.className = 'run-perk-popup';
                    el.setAttribute('role', 'dialog');
                    el.setAttribute('aria-modal', 'true');
                    el.dataset.pickReady = '0';
                    el.classList.add('pick-locked');
                    el.innerHTML = `
                        <div class="rp-title">MOD CENTER</div>
                        <div class="rp-sub">${escapeHtml(subTitleText)}</div>
                        <div class="rp-list">
                            ${renderDealCard(pair[0])}
                            ${renderDealCard(pair[1])}
                        </div>
                    `;
                    const onPick = (ev) => {
                        if (!el || el.dataset.pickReady !== '1') return;
                        const btn = ev.target && ev.target.closest ? ev.target.closest('.rp-item[data-perk]') : null;
                        if (!btn) return;
                        const chosenId = applyRunPerkChoice(btn.getAttribute('data-perk'));
                        runPerkState.pendingOffers = Math.max(0, runPerkState.pendingOffers - 1);
                        runPerkState.picksCount = Math.min(RUN_PERK_PROFILE.maxPicks, (Number(runPerkState.picksCount) || 0) + 1);
                        hideRunPerkPopup(false);
                        runPerkState.popupOpen = false;
                        inputLocked = false;
                        updateHUD();
                        try {
                            const def = RUN_PERK_DEFS[chosenId];
                            if (window.Assistant && Assistant.show && def) {
                                if (def.source === 'broker') {
                                    const idx = Math.floor(Math.random() * BROKER_PICK_ASSISTANT_LINES.length);
                                    const line = BROKER_PICK_ASSISTANT_LINES[idx] || 'Viral venture accepted. I distrust this arrangement.';
                                    Assistant.show(`${line} (${def.title})`, { priority: 1 });
                                } else {
                                    Assistant.show(`Perk acquired: ${def.title}.`, { priority: 1 });
                                }
                            }
                        } catch (e) { }
                        setTimeout(() => { try { maybeShowPendingRunPerkPopup(); } catch (e) { } }, 80);
                    };
                    el.addEventListener('click', onPick);
                    document.body.appendChild(el);
                    runPerkPopupEl = el;
                    runPerkState.popupOpen = true;
                    inputLocked = true;
                    try { document.body.classList.add('run-perk-open'); } catch (e) { }
                    void el.offsetWidth;
                    el.classList.add('show');
                    try { playSfx('double_deal'); } catch (e) { }
                    const revealStartDelayMs = 700;
                    const revealUnlockDelayMs = 1700;
                    el._rpRevealStartTimer = setTimeout(() => {
                        try { el.classList.add('cards-reveal'); } catch (e) { }
                    }, revealStartDelayMs);
                    el._rpRevealUnlockTimer = setTimeout(() => {
                        try {
                            if (!document.body.contains(el)) return;
                            el.dataset.pickReady = '1';
                            el.classList.remove('pick-locked');
                        } catch (e) { }
                    }, revealUnlockDelayMs);
                    return true;
                } catch (e) {
                    return false;
                }
            }

            function maybeShowPendingRunPerkPopup() {
                if (!canShowRunPerkPopup()) return false;
                const offers = buildRunPerkOfferPair(getCurrentLevelNumber());
                if (!offers.length) return false;
                return showRunPerkPopup(offers);
            }

            function scheduleRunPerkPopupAttempt(delayMs = 0) {
                const wait = Math.max(0, Number(delayMs) || 0);
                setTimeout(() => {
                    try {
                        if (!inputLocked && !stormResolving) maybeShowPendingRunPerkPopup();
                    } catch (e) { }
                }, wait);
            }

            function queueRunPerkMilestonesFromScore() {
                if (isEnduranceMode()) return;
                if (!runPerkState || runPerkState.picksCount >= RUN_PERK_PROFILE.maxPicks) return;
                if (runPerkState.disableScoreDeals) return;
                runPerkState.scorePeak = Math.max(
                    Math.max(0, Number(runPerkState.scorePeak) || 0),
                    Math.max(0, Number(totalScore) || 0)
                );
                const scoreForMilestones = Math.max(0, Number(runPerkState.scorePeak) || 0);
                const thresholds = Array.isArray(RUN_PERK_PROFILE.thresholds) ? RUN_PERK_PROFILE.thresholds : [];
                while (runPerkState.nextThresholdIndex < thresholds.length) {
                    const nextScore = Number(thresholds[runPerkState.nextThresholdIndex]) || 0;
                    if (scoreForMilestones < nextScore) break;
                    const alreadyQueued = Math.max(0, Number(runPerkState.pendingOffers) || 0);
                    const alreadyPicked = Math.max(0, Number(runPerkState.picksCount) || 0);
                    if ((alreadyQueued + alreadyPicked) >= RUN_PERK_PROFILE.maxPicks) break;
                    runPerkState.pendingOffers += 1;
                    runPerkState.nextThresholdIndex += 1;
                }
            }

            function updateHUD() {

                // ensure high score element is available
                if (!highScoreEl) try { highScoreEl = document.getElementById('highScoreValue'); } catch (e) { }
                if (clicksEl) clicksEl.textContent = clicksLeft; if (screensEl) screensEl.textContent = (screensPassed + 1); if (scoreEl) scoreEl.textContent = totalScore;
                // --- high-score handling ---
                if (typeof highScore !== 'number') highScore = 0;
                if (!isModifiedRun() && totalScore > highScore) {
                    highScore = totalScore;
                    saveHighScoreForMode(currentGameMode, highScore);
                    try { window.highScore = highScore; } catch (e) { }
                    if (highScoreEl) highScoreEl.textContent = String(highScore);
                }
                try {
                    if (isEnduranceMode()) {
                        setAchievementBest('enduranceBestScore', Math.max(0, Number(totalScore) || 0), 'lifetime', { allowEndurance: true });
                    }
                } catch (e) { }
                // Update the floating score box (5 digits, zero-padded)

                const disp = document.getElementById('scoreDisplay');
                if (disp) {
                    const s = String(totalScore).padStart(5, '0').slice(-5);
                    disp.textContent = s;
                }

                // Global click-gain toast near nano-bot meter for any gain source.
                try {
                    const currentClicks = Math.max(0, Math.floor(Number(clicksLeft) || 0));
                    if (typeof window.__lastHudClicksForToast !== 'number' || !Number.isFinite(window.__lastHudClicksForToast)) {
                        window.__lastHudClicksForToast = currentClicks;
                    } else {
                        const gained = currentClicks - window.__lastHudClicksForToast;
                        const likelyFreshRunBaseline = (totalScore <= 0 && screensPassed <= 0 && currentClicks >= 10 && window.__lastHudClicksForToast <= 0);
                        if (gained > 0 && !likelyFreshRunBaseline) {
                            showLevelClearClickToast(gained);
                        }
                        window.__lastHudClicksForToast = currentClicks;
                    }
                } catch (e) { }

                // Always update meter visuals and notify assistant when clicks are low
                try {
                    if (boardEl && boardEl.classList) {
                        boardEl.classList.toggle('low-click-board-warning', clicksLeft <= 3);
                    }
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
                try { updatePerkHudIndicators(); } catch (e) { }
                try { updateHudSponsorMark(); } catch (e) { }
                try { updateStormUI(); } catch (e) { }
                try { queueRunPerkMilestonesFromScore(); } catch (e) { }
                try { maybeShowPendingRunPerkPopup(); } catch (e) { }
            }

            function updatePerkHudIndicators() {
                const wrap = document.getElementById('perkHud');
                if (!wrap) return;
                const state = runPerkState || {};
                const sc = Math.max(0, Number(state.stormCapacitorCharges) || 0);
                const ap = Math.max(0, Number(state.armorPiercerHits) || 0);
                const bb = Math.max(0, Number(state.bossBreakerHits) || 0);
                const apPermanent = !!state.armorPiercerPermanent;
                const stActive = (Number(state.stormRechargeDelta) || 0) < 0;
                const reserveExpansionDelta = Math.max(0, Math.floor(Number(state.clickCapDelta) || 0));
                const overclockedReserveLevels = Math.max(0, Math.floor(Number(state.overclockedReserveLevelsPending) || 0));
                const ventureDownsides = [
                    (Number(state.levelClearClicksPenalty) || 0) > 0,
                    (Number(state.hotwireNextRechargePenalty) || 0) > 0,
                    (Number(state.clickCapDelta) || 0) < 0,
                    (Number(state.scoreMultiplier) || 1) < 0.999,
                    (Number(state.miniBossBonusPenalty) || 0) > 0,
                    !!state.stormNoDiagonals,
                    (Number(state.specialVirusChanceDelta) || 0) > 0,
                    (Number(state.blockerSpeedFactor) || 1) > 1.01
                ];
                const activeVentureDownsideCount = ventureDownsides.reduce((n, on) => n + (on ? 1 : 0), 0);

                const chips = {
                    storm_capacitor: wrap.querySelector('[data-perk-chip="storm_capacitor"]'),
                    armor_piercer: wrap.querySelector('[data-perk-chip="armor_piercer"]'),
                    boss_breaker: wrap.querySelector('[data-perk-chip="boss_breaker"]'),
                    storm_tuning: wrap.querySelector('[data-perk-chip="storm_tuning"]'),
                    reserve_expansion: wrap.querySelector('[data-perk-chip="reserve_expansion"]'),
                    overclocked_reserve: wrap.querySelector('[data-perk-chip="overclocked_reserve"]'),
                    viral_ventures: wrap.querySelector('[data-perk-chip="viral_ventures"]')
                };
                const counts = {
                    storm_capacitor: wrap.querySelector('[data-perk-count="storm_capacitor"]'),
                    armor_piercer: wrap.querySelector('[data-perk-count="armor_piercer"]'),
                    boss_breaker: wrap.querySelector('[data-perk-count="boss_breaker"]'),
                    reserve_expansion: wrap.querySelector('[data-perk-count="reserve_expansion"]'),
                    overclocked_reserve: wrap.querySelector('[data-perk-count="overclocked_reserve"]'),
                    viral_ventures: wrap.querySelector('[data-perk-count="viral_ventures"]')
                };

                const setVisible = (el, on) => {
                    if (!el) return;
                    el.style.display = on ? 'inline-flex' : 'none';
                };

                if (counts.storm_capacitor) counts.storm_capacitor.textContent = String(sc);
                if (counts.armor_piercer) counts.armor_piercer.textContent = apPermanent ? 'INF' : String(ap);
                if (counts.boss_breaker) counts.boss_breaker.textContent = String(bb);

                setVisible(chips.storm_capacitor, sc > 0);
                setVisible(chips.armor_piercer, apPermanent || ap > 0);
                setVisible(chips.boss_breaker, bb > 0);
                setVisible(chips.storm_tuning, stActive);
                setVisible(chips.reserve_expansion, reserveExpansionDelta > 0);
                setVisible(chips.overclocked_reserve, overclockedReserveLevels > 0);
                setVisible(chips.viral_ventures, activeVentureDownsideCount > 0);

                if (chips.storm_capacitor) {
                    chips.storm_capacitor.classList.toggle('pulse', sc > 0);
                    chips.storm_capacitor.title = sc > 0 ? `Storm Capacitor active (${sc})` : 'Storm Capacitor inactive';
                }
                if (chips.armor_piercer) {
                    chips.armor_piercer.classList.toggle('pulse', apPermanent || ap > 0);
                    chips.armor_piercer.classList.toggle('persistent', apPermanent);
                    chips.armor_piercer.title = apPermanent
                        ? 'Armor Piercer active (permanent)'
                        : (ap > 0 ? `Armor Piercer active (${ap})` : 'Armor Piercer inactive');
                }
                if (chips.boss_breaker) {
                    chips.boss_breaker.classList.toggle('pulse', bb > 0);
                    chips.boss_breaker.title = bb > 0 ? `Boss Breaker active (${bb})` : 'Boss Breaker inactive';
                }
                if (chips.storm_tuning) {
                    chips.storm_tuning.classList.toggle('pulse', stActive);
                    chips.storm_tuning.classList.toggle('persistent', stActive);
                    chips.storm_tuning.title = stActive ? 'Storm Tuning active' : 'Storm Tuning inactive';
                }
                if (chips.reserve_expansion) {
                    if (counts.reserve_expansion) counts.reserve_expansion.textContent = `+${reserveExpansionDelta}`;
                    chips.reserve_expansion.classList.toggle('pulse', reserveExpansionDelta > 0);
                    chips.reserve_expansion.classList.toggle('persistent', reserveExpansionDelta > 0);
                    chips.reserve_expansion.title = reserveExpansionDelta > 0
                        ? `Reserve Expansion active (+${reserveExpansionDelta} max clicks)`
                        : 'Reserve Expansion inactive';
                }
                if (chips.overclocked_reserve) {
                    if (counts.overclocked_reserve) counts.overclocked_reserve.textContent = String(overclockedReserveLevels);
                    chips.overclocked_reserve.classList.toggle('pulse', overclockedReserveLevels > 0);
                    chips.overclocked_reserve.classList.toggle('persistent', overclockedReserveLevels > 0);
                    chips.overclocked_reserve.title = overclockedReserveLevels > 0
                        ? `Overclocked Reserve active (${overclockedReserveLevels} level${overclockedReserveLevels === 1 ? '' : 's'} remaining)`
                        : 'Overclocked Reserve inactive';
                }
                if (chips.viral_ventures) {
                    if (counts.viral_ventures) counts.viral_ventures.textContent = String(activeVentureDownsideCount);
                    chips.viral_ventures.classList.toggle('pulse', activeVentureDownsideCount > 0);
                    chips.viral_ventures.title = activeVentureDownsideCount > 0
                        ? `Viral Venture drawbacks active (${activeVentureDownsideCount})`
                        : 'No Viral Venture drawbacks active';
                }

                // Keep strip visible at all times; only chips toggle on/off.
            }

            let levelClearClickToastTimer = null;
            function showLevelClearClickToast(amount = 0) {
                const gain = Math.max(0, Math.floor(Number(amount) || 0));
                if (gain <= 0) return;
                try {
                    const meter = document.getElementById('clicksMeter');
                    if (!meter) return;
                    const existing = document.querySelector('.level-clear-click-toast');
                    if (existing) {
                        try { existing.remove(); } catch (e) { }
                    }
                    if (levelClearClickToastTimer) {
                        clearTimeout(levelClearClickToastTimer);
                        levelClearClickToastTimer = null;
                    }
                    const toast = document.createElement('div');
                    toast.className = 'level-clear-click-toast';
                    toast.textContent = `+${gain}`;
                    document.body.appendChild(toast);
                    const rect = meter.getBoundingClientRect();
                    const left = Math.round(rect.right - 14);
                    const top = Math.round(rect.top - 12);
                    toast.style.left = `${left}px`;
                    toast.style.top = `${top}px`;
                    levelClearClickToastTimer = setTimeout(() => {
                        try { toast.remove(); } catch (e) { }
                        levelClearClickToastTimer = null;
                    }, 950);
                } catch (e) { }
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

            function isFinalVictoryActive() {
                return !!(finalVictoryState && (finalVictoryState.inProgress || finalVictoryState.shown));
            }

            function clearFinalVictoryTimers() {
                try { if (finalVictoryExplosionTimer) clearInterval(finalVictoryExplosionTimer); } catch (e) { }
                try { if (finalVictoryRevealTimer) clearTimeout(finalVictoryRevealTimer); } catch (e) { }
                try { if (finalVictoryFinalCardTimer) clearTimeout(finalVictoryFinalCardTimer); } catch (e) { }
                try { if (finalVictorySummaryTimer) clearTimeout(finalVictorySummaryTimer); } catch (e) { }
                finalVictoryExplosionTimer = null;
                finalVictoryRevealTimer = null;
                finalVictoryFinalCardTimer = null;
                finalVictorySummaryTimer = null;
            }

            function stopFinalCreditsMusic(fadeOutMs = 500) {
                const a = finalCreditsMusicAudio;
                finalCreditsMusicAudio = null;
                clearFinalCreditsMusicRetry();
                if (!a) return;
                const ms = Math.max(0, Math.floor(Number(fadeOutMs) || 0));
                if (ms <= 0) {
                    try { a.pause(); } catch (e) { }
                    try { a.src = ''; } catch (e) { }
                    return;
                }
                const startVol = Math.max(0, Number(a.volume) || 0);
                const startTs = Date.now();
                const timer = setInterval(() => {
                    try {
                        const t = Math.max(0, Math.min(1, (Date.now() - startTs) / ms));
                        a.volume = Math.max(0, startVol * (1 - t));
                        if (t >= 1) {
                            clearInterval(timer);
                            try { a.pause(); } catch (e) { }
                            try { a.src = ''; } catch (e) { }
                        }
                    } catch (e) {
                        clearInterval(timer);
                        try { a.pause(); } catch (e2) { }
                    }
                }, 40);
            }

            function clearFinalCreditsMusicRetry() {
                if (!finalCreditsMusicRetryArmed || !finalCreditsMusicRetryHandler) return;
                try { document.removeEventListener('pointerdown', finalCreditsMusicRetryHandler, true); } catch (e) { }
                try { document.removeEventListener('touchend', finalCreditsMusicRetryHandler, true); } catch (e) { }
                try { document.removeEventListener('keydown', finalCreditsMusicRetryHandler, true); } catch (e) { }
                finalCreditsMusicRetryArmed = false;
                finalCreditsMusicRetryHandler = null;
            }

            function armFinalCreditsMusicRetry() {
                if (finalCreditsMusicRetryArmed) return;
                finalCreditsMusicRetryArmed = true;
                finalCreditsMusicRetryHandler = function () {
                    clearFinalCreditsMusicRetry();
                    try { markAudioUserInteracted(); } catch (e) { }
                    if (!isFinalVictoryActive()) return;
                    setTimeout(() => {
                        try { startFinalCreditsMusic(); } catch (e2) { }
                    }, 0);
                };
                try { document.addEventListener('pointerdown', finalCreditsMusicRetryHandler, { capture: true, passive: true }); } catch (e) { }
                try { document.addEventListener('touchend', finalCreditsMusicRetryHandler, { capture: true, passive: true }); } catch (e) { }
                try { document.addEventListener('keydown', finalCreditsMusicRetryHandler, { capture: true }); } catch (e) { }
            }

            function startFinalCreditsMusic() {
                try {
                    if (!musicEnabled || !audioUserInteracted || !!window.allMuted) return false;
                    stopFinalCreditsMusic(0);
                    const a = new Audio(FINAL_CREDITS_THEME_URL);
                    a.loop = true;
                    a.preload = 'auto';
                    a.crossOrigin = 'anonymous';
                    a.muted = !!window.allMuted;
                    const targetVol = Math.max(0.02, Math.min(1, Number(window.musicVolume) || 0.20));
                    a.volume = 0.001;
                    finalCreditsMusicAudio = a;
                    clearFinalCreditsMusicRetry();
                    const p = a.play();
                    if (p && typeof p.then === 'function' && typeof p.catch === 'function') {
                        p.then(() => {
                            clearFinalCreditsMusicRetry();
                        }).catch(() => {
                            if (finalCreditsMusicAudio === a) armFinalCreditsMusicRetry();
                        });
                    } else {
                        setTimeout(() => {
                            try {
                                if (finalCreditsMusicAudio === a && a.paused) armFinalCreditsMusicRetry();
                            } catch (e) { }
                        }, 140);
                    }
                    const startedAt = Date.now();
                    const ms = 1800;
                    const timer = setInterval(() => {
                        if (finalCreditsMusicAudio !== a) {
                            clearInterval(timer);
                            return;
                        }
                        const t = Math.max(0, Math.min(1, (Date.now() - startedAt) / ms));
                        try { a.volume = Math.max(0.001, targetVol * t); } catch (e) { }
                        if (t >= 1) clearInterval(timer);
                    }, 50);
                    return true;
                } catch (e) {
                    return false;
                }
            }

            function getFinalOfferChoiceId() {
                return String(runPerkState && runPerkState.finalOfferChoice || '');
            }

            function getFinalEndingProfile() {
                const choiceId = getFinalOfferChoiceId();
                if (choiceId === 'final_pixel_safe_protocol') {
                    const tookContinueDeal = !!(runPerkState && runPerkState.continueDealTaken);
                    const continuation = tookContinueDeal
                        ? '\n\nThe Competitive Opportunity clause you signed remains active, unfortunately. Viral Ventures now holds “contingent strategic rights” to select discoveries, including your genome. PIXEL has flagged the language as… creative. Our lawyers will look over it and get back to you.'
                        : '\n\nThankfully you declined the Competitive Opportunity offered by Viral Ventures. No equity was exchanged, no rights were transferred so the lab answers only to itself.';
                    return {
                        key: 'pixel',
                        label: 'PIXEL PERK',
                        imageUrl: FINAL_VICTORY_PIXEL_IMAGE_URL,
                        storyText: 'SYSTEM RESTORED: With your help, PIXEL was able to stabilize core systems and restore lab autonomy. Luckily we were able to keep lab technology out of the hands of the Viral Ventures executives. Now it is time to rebuild.' + continuation
                    };
                }
                if (choiceId === 'final_viral_hostile_buyout') {
                    const tookContinueDeal = !!(runPerkState && runPerkState.continueDealTaken);
                    const continuation = tookContinueDeal
                        ? '\n\nYou accepted a Competitive Opportunity™ from Viral Ventures but you did not read the fine print. Your genome has been successfully acquired. Viral Ventures Enterprises now holds exclusive rights to your biological identity, likeness, and any future mutations thereof. As a valued corporate asset, you are not permitted to leave the facility. Please return to your designated holding cell... I mean designated quarters.'
                        : '\n\nViral Ventures has assumed operational control of the lab and all associated intellectual property. Future research directions will be determined by “market optimization protocols". You remain employed.';
                    return {
                        key: 'broker',
                        label: 'VIRAL VENTURE',
                        imageUrl: FINAL_VICTORY_BROKER_IMAGE_URL,
                        storyText: 'HOSTILE TAKEOVER: You succeeded in restoring containment, but at a cost. By giving 51% of control to the shady Viral Ventures they now own the cleanup rights and all lab technology. The future feels compromised.' + continuation
                    };
                }
                const tookContinueDeal = !!(runPerkState && runPerkState.continueDealTaken);
                const soloContinuation = tookContinueDeal
                    ? '\n\nAs you walk out the door of the lab you run into the Viral Ventures liason. He is holding a copy of the Competitive Opportunity contract you signed. He smiles as he tells you he is sure he can help you develop a payment plan.'
                    : '\n\nAs you walk out the door of the lab and into the sunset, you finally feel free. Where will your journey take you next?';
                return {
                    key: 'solo',
                    label: 'ON MY OWN',
                    imageUrl: FINAL_VICTORY_SOLO_IMAGE_URL || FINAL_VICTORY_DEFAULT_IMAGE_URL,
                    storyText: 'INDEPENDENT VARIABLE: You took no deals, no shortcuts. You held the line alone and wrote your own ending.' + soloContinuation
                };
            }

            function buildFinalVictoryRunSummaryHtml() {
                const levelReached = Math.max(1, Number(runAchievementStats.runLevelReached) || getCurrentLevelNumber());
                const pops = Math.max(0, Number(runAchievementStats.runPops) || 0);
                const bestChain = Math.max(0, Number(runAchievementStats.runBestChain) || 0);
                const storms = Math.max(0, Number(runAchievementStats.runNanoStormUses) || 0);
                const unlockedCount = Array.from(runUnlockedAchievementIds || []).length;
                const ending = getFinalEndingProfile();
                return `
                    <div class="fv-summary">
                        <div class="fv-summary-title">RUN RECAP</div>
                        ${isModifiedRun() ? `<div class="go-recap-more">MODIFIED RUN: achievements and high scores disabled</div>` : ''}
                        <div class="fv-summary-grid">
                            <span>Outcome</span><b>${escapeHtml(ending.label)}</b>
                            <span>Level</span><b>${levelReached}</b>
                            <span>Score</span><b>${Math.max(0, Number(totalScore) || 0)}</b>
                            <span>Viruses Destroyed</span><b>${pops}</b>
                            <span>Best Chain</span><b>${bestChain}</b>
                            <span>Nano Storm Uses</span><b>${storms}</b>
                            <span>Achievements</span><b>${unlockedCount}</b>
                        </div>
                    </div>
                `;
            }

            function buildFinalVictoryCreditsHtml() {
                const creditsLines = Array.isArray(FINAL_VICTORY_CREDITS) ? FINAL_VICTORY_CREDITS : [];
                return creditsLines.map((line) => `<div class="fv-roll-line">${escapeHtml(String(line || ''))}</div>`).join('');
            }

            function showInitialStartScreen() {
                try {
                    const intro = document.getElementById('aiIntro');
                    const introText = document.getElementById('aiIntroText');
                    if (intro) {
                        intro.classList.remove('fade-out');
                        intro.style.display = 'flex';
                        intro.style.visibility = 'visible';
                        intro.style.removeProperty('pointer-events');
                        intro.style.removeProperty('opacity');
                        intro.setAttribute('aria-hidden', 'false');
                    }
                    if (introText) {
                        introText.textContent = 'Containment breach detected.';
                    }
                } catch (e) { }
                try {
                    const startModal = document.getElementById('startModal');
                    if (startModal) {
                        startModal.classList.remove('show', 'open');
                        startModal.style.display = 'none';
                        startModal.setAttribute('aria-hidden', 'true');
                    }
                } catch (e) { }
                try {
                    const levelModal = document.getElementById('level5DynamicsModal');
                    if (levelModal) {
                        levelModal.classList.remove('show', 'open');
                        levelModal.style.display = 'none';
                        levelModal.setAttribute('aria-hidden', 'true');
                    }
                } catch (e) { }
                try {
                    const helpPopup = document.getElementById('helpPopup');
                    if (helpPopup) {
                        helpPopup.classList.remove('show', 'open');
                        helpPopup.style.display = 'none';
                        helpPopup.setAttribute('aria-hidden', 'true');
                    }
                } catch (e) { }
                try {
                    const audioPopup = document.getElementById('audioPopup');
                    if (audioPopup) {
                        audioPopup.classList.remove('show', 'open');
                        audioPopup.style.display = 'none';
                        audioPopup.setAttribute('aria-hidden', 'true');
                    }
                } catch (e) { }
                try {
                    tutorialGateState.startPressed = false;
                    tutorialGateState.briefingAcknowledged = false;
                } catch (e) { }
            }

            function restartToIntroScreen() {
                try {
                    const kids = Array.from(document.body && document.body.children ? document.body.children : []);
                    kids.forEach((el) => {
                        if (!el || el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'LINK') return;
                        try { el.removeAttribute('inert'); } catch (e) { }
                        try { el.removeAttribute('aria-hidden'); } catch (e) { }
                    });
                } catch (e) { }
                try { clearFinalVictorySequence(true); } catch (e) { }
                try { clearGameOverFeedback(); } catch (e) { }
                try { hideContinueOfferPopup(true); } catch (e) { }
                try { hideRunPerkPopup(true); } catch (e) { }
                try { hideFinalOfferPopup(true); } catch (e) { }
                try {
                    const blockers = document.querySelectorAll('.boss20-talk-modal, .boss20-global-blackout, .final-offer-prelude, .level-complete, .continue-offer-popup, .run-perk-popup, .final-offer-modal');
                    blockers.forEach((el) => { try { el.remove(); } catch (e2) { } });
                } catch (e) { }
                try {
                    if (musicOverrideMode === 'final-boss') stopFinalBossTheme({ fadeOutMs: 250, resumeNormal: false });
                } catch (e) { }
                runStartedByPlayer = false;
                stopBackgroundMusic();
                try {
                    screensPassed = 0;
                    totalScore = 0;
                    outOfClicksShown = false;
                    runContinueUses = 0;
                    continueOfferOpen = false;
                    randomizeBoard(false);
                    updateHUD();
                } catch (e) { }
                showInitialStartScreen();
                inputLocked = false;
                try { setGameMode(GAME_MODES.adventure); } catch (e) { }
                try { stopTutorialMode(true); } catch (e) { }
            }

            const tutorialModeState = {
                active: false,
                stepIndex: 0,
                stepDone: false,
                targetIndex: -1,
                overlayEl: null,
                noteEl: null,
                introEl: null,
                introOpen: false,
                stormArrowEl: null,
                stormArrowRaf: 0,
                meterArrowEl: null,
                meterArrowRaf: 0,
                assistantArrowEl: null,
                assistantArrowRaf: 0,
                assistantCueTimers: [],
                modsArrowEl: null,
                modsArrowRaf: 0,
                modsPreviewActive: false,
                modsPreviewBackup: { stormCapacitorCharges: null }
            };

            function clearTutorialTarget() {
                tutorialModeState.targetIndex = -1;
                try {
                    if (!boardEl) return;
                    const cells = boardEl.querySelectorAll('.cell.tutorial-target');
                    cells.forEach((el) => { try { el.classList.remove('tutorial-target'); } catch (e) { } });
                } catch (e) { }
            }

            function setTutorialTarget(index) {
                clearTutorialTarget();
                const idx = Math.floor(Number(index));
                if (!Number.isFinite(idx) || idx < 0 || idx >= (ROWS * COLS)) return;
                tutorialModeState.targetIndex = idx;
                try {
                    if (!boardEl) return;
                    const cell = boardEl.querySelector(`[data-index='${idx}']`);
                    if (cell) cell.classList.add('tutorial-target');
                } catch (e) { }
            }

            function applyTutorialBoard(cells, opts = {}) {
                state.fill(null);
                specialState.fill(null);
                specialMetaState.fill(null);
                resetBoss20State();
                resetBossGooShieldState(true);
                resetBiofilmState(true);
                clearTechnoGremlinPowers(true);
                const list = Array.isArray(cells) ? cells : [];
                for (let i = 0; i < list.length; i++) {
                    const entry = list[i] || {};
                    const idx = Math.floor(Number(entry.index));
                    const size = Math.max(0, Math.min(MAX_SIZE, Math.floor(Number(entry.size) || 0)));
                    if (!Number.isFinite(idx) || idx < 0 || idx >= state.length) continue;
                    state[idx] = size;
                    if (entry.special) setSpecialForCell(idx, String(entry.special));
                    if (entry.meta && typeof entry.meta === 'object') {
                        try { specialMetaState[idx] = Object.assign({}, entry.meta); } catch (e) { }
                    }
                }
                clicksLeft = Math.max(1, Math.floor(Number(opts.clicks) || 10));
                stormCharges = Math.max(0, Math.floor(Number(opts.stormCharges) || 0));
                comboInsurance = 0;
                stormResolving = false;
                setStormArmed(!!opts.stormArmed);
                levelAdvancePending = false;
                inputLocked = false;
                boardGeneration += 1;
                scheduleRender();
                updateHUD();
            }

            function getTutorialSteps() {
                const center = 14;
                const step1Target = center + (COLS * 2);
                const rowLeft = 13;
                const rowRight = 15;
                const up = 8;
                const down = 20;
                return [
                    {
                        title: 'Tutorial 1/9',
                        bodyHtml: 'Your primary job is to manually deploy nano-bots to destroy rogue viruses before they escape the testing lab. You deploy a nanobot by tapping on any petri dish in the lab area that already includes a virus. <br><br> With each tap the virus will grow until it finally bursts. Each tap consumes one nano-bot which is tracked on your nano-bot meter. Exceeding your nano-bot allotment may result in corrective action (and a Game Over screen).',
                        actionLabel: 'Continue',
                        focusNanoMeter: true,
                        setup: () => {
                            applyTutorialBoard([
                                { index: step1Target, size: 0 }
                            ], { clicks: 10, stormCharges: 0 });
                            setTutorialTarget(step1Target);
                        },
                        onBoardTap: (idx, done) => {
                            if (idx !== step1Target) {
                                showTutorialNote('Tap the highlighted virus to grow it until it bursts.');
                                return true;
                            }
                            handleClick(idx, true);
                            setTimeout(() => {
                                if (state[step1Target] === null) done();
                                else showTutorialNote('Keep tapping this virus until it bursts.');
                            }, 260);
                            return true;
                        }
                    },
                    {
                        title: 'Tutorial 2/9',
                        bodyHtml: 'Popping viruses may trigger secondary containment cascades. Pop the highlighted virus and observe as antibody particles deploy up, down, left, and right. Any virus struck will either grow… or pop.<br><br>Extended cascades increase combo multipliers, boost performance scores, and may qualify you for replacement nano-bots.<br><br>Cascading responsibly is encouraged.',
                        actionLabel: 'Continue',
                        setup: () => {
                            const step2Offset = COLS * 2;
                            const step2Center = center + step2Offset;
                            const step2Left = rowLeft + step2Offset;
                            const step2Right = rowRight + step2Offset;
                            const step2Up = up + step2Offset;
                            const step2Down = down + step2Offset;
                            applyTutorialBoard([
                                { index: step2Center, size: MAX_SIZE },
                                { index: step2Left, size: MAX_SIZE },
                                { index: step2Right, size: 2 },
                                { index: step2Up, size: 2 },
                                { index: step2Down, size: 2 },
                                { index: 1 + step2Offset, size: 1 }
                            ], { clicks: 10, stormCharges: 0 });
                            setTutorialTarget(step2Center);
                        },
                        onBoardTap: (idx, done) => {
                            const step2Center = center + (COLS * 2);
                            if (idx !== step2Center) {
                                showTutorialNote('Tap the highlighted virus to trigger a cascade.');
                                return true;
                            }
                            handleClick(idx, true);
                            setTimeout(() => done(), 700);
                            return true;
                        }
                    },
                    {
                        title: 'Tutorial 3/9',
                        bodyHtml: 'You have been granted access to (1) standard issue Nano Storm charge.<br><br>To use, press the highlighted button on your HUD to arm the weapon and then designate a target virus by tapping. The central speciman will receive 2 impacts, each adjacent cell will receive 1 impact. You can gain additional charges using cascades to recharge the battery. I recommend standing back... Figuratively.',
                        actionLabel: 'Continue',
                        focusStormButton: true,
                        setup: () => {
                            const step3Offset = COLS * 2;
                            const step3Center = center + step3Offset;
                            const step3Left = rowLeft + step3Offset;
                            const step3Right = rowRight + step3Offset;
                            const step3Up = up + step3Offset;
                            const step3Down = down + step3Offset;
                            applyTutorialBoard([
                                { index: step3Center, size: MAX_SIZE },
                                { index: step3Left, size: 2 },
                                { index: step3Right, size: 2 },
                                { index: step3Up, size: 2 },
                                { index: step3Down, size: 2 },
                                { index: 7 + step3Offset, size: 1 }
                            ], { clicks: 10, stormCharges: 1, stormArmed: false });
                            setTutorialTarget(step3Center);
                        },
                        onBoardTap: (idx, done) => {
                            const step3Center = center + (COLS * 2);
                            if (!stormArmed) {
                                showTutorialNote('First press the Nano Storm button, then tap the target.');
                                return true;
                            }
                            if (idx !== step3Center) {
                                showTutorialNote('Storm target is the highlighted center cell.');
                                return true;
                            }
                            if (useNanoStorm(step3Center)) {
                                setTimeout(() => done(), 900);
                                return true;
                            }
                            return true;
                        }
                    },
                    {
                        title: 'Tutorial 4/9',
                        body: 'Cascade planning drill: focus on the highlighted virus. Tap it until it bursts, then watch how a well-placed pop can trigger a longer chain reaction through nearby lanes.',
                        actionLabel: 'Continue',
                        setup: () => {
                            const step4Target = 21;
                            applyTutorialBoard([
                                { index: step4Target, size: 2 },
                                { index: 20, size: MAX_SIZE },
                                { index: 22, size: MAX_SIZE },
                                { index: 15, size: MAX_SIZE },
                                { index: 27, size: MAX_SIZE },
                                { index: 14, size: MAX_SIZE },
                                { index: 16, size: MAX_SIZE },
                                { index: 26, size: MAX_SIZE },
                                { index: 28, size: MAX_SIZE },
                                { index: 9, size: 2 },
                                { index: 33, size: 2 }
                            ], { clicks: 8, stormCharges: 0 });
                            setTutorialTarget(step4Target);
                        },
                        onBoardTap: (idx, done) => {
                            const step4Target = 21;
                            if (idx !== step4Target) {
                                showTutorialNote('For this drill, tap the highlighted setup virus only.');
                                return true;
                            }
                            handleClick(idx, true);
                            setTimeout(() => {
                                const remaining = state.filter((x) => x !== null).length;
                                if (state[step4Target] === null && remaining <= 5) {
                                    done();
                                } else if (state[step4Target] !== null) {
                                    showTutorialNote('Keep tapping the highlighted virus until it bursts.');
                                } else {
                                    showTutorialNote('Nice chain. Tap Continue when ready.');
                                    done();
                                }
                            }, 700);
                            return true;
                        }
                    },
                    {
                        title: 'Tutorial 5/9',
                        bodyHtml: 'Not all specimens behave according to standard expectations. Certain viruses may exhibit enhanced durability, adaptive defenses, or inconvenient structural reinforcements.<br><br>Armored virus drill: tap the highlighted virus once to trigger a cascade into the armored target. First impact removes the shell, second impact damages the virus.',
                        actionLabel: 'Continue',
                        setup: () => {
                            const target = 26;
                            const armored = 32;
                            applyTutorialBoard([
                                { index: target, size: MAX_SIZE },
                                { index: 27, size: MAX_SIZE },
                                { index: 33, size: MAX_SIZE },
                                { index: armored, size: 1, special: 'armored' }
                            ], { clicks: 10, stormCharges: 0 });
                            setTutorialTarget(target);
                        },
                        onBoardTap: (idx, done) => {
                            const target = 26;
                            const armored = 32;
                            if (idx !== target) {
                                showTutorialNote('Tap the highlighted setup virus to run the armor drill.');
                                return true;
                            }
                            handleClick(idx, true);
                            const startedAt = Date.now();
                            const evaluateArmoredDrill = () => {
                                const shellGone = specialState[armored] !== 'armored';
                                const damaged = Number(state[armored]) >= 2;
                                if (shellGone && damaged) {
                                    showTutorialNote('Armor removed, then damage applied. Exactly right.');
                                    done();
                                    return;
                                }
                                const elapsed = Date.now() - startedAt;
                                let busy = false;
                                try { busy = typeof particlesActive === 'function' ? !!particlesActive() : false; } catch (e) { }
                                if (busy && elapsed < 2600) {
                                    setTimeout(evaluateArmoredDrill, 120);
                                    return;
                                }
                                showTutorialNote('If needed, retry: first hit breaks shell, second hit damages virus.');
                            };
                            setTimeout(evaluateArmoredDrill, 120);
                            return true;
                        }
                    },
                    {
                        title: 'Tutorial 6/9',
                        bodyHtml: 'Containment bosses are large, persistent threats that require sustained pressure. Tap the highlighted setup virus once and observe the cascade striking the boss multiple times. Note that bosses may develop additional behaviors and we will brief you on those details as they arise.',
                        actionLabel: 'Continue',
                        setup: () => {
                            const target = 21;
                            const boss = 28;
                            applyTutorialBoard([
                                { index: target, size: MAX_SIZE },
                                { index: 22, size: MAX_SIZE },
                                { index: 27, size: MAX_SIZE },
                                { index: boss, size: 2, special: 'boss', meta: { isBoss: true, hp: 4, maxHp: 4, bossLevel: 5, phase: 0 } },
                                { index: 16, size: 2 },
                                { index: 33, size: 2 }
                            ], { clicks: 10, stormCharges: 0 });
                            setTutorialTarget(target);
                        },
                        onBoardTap: (idx, done) => {
                            const target = 21;
                            const boss = 28;
                            if (idx !== target) {
                                showTutorialNote('Tap the highlighted setup virus to begin the boss cascade drill.');
                                return true;
                            }
                            handleClick(idx, true);
                            const startedAt = Date.now();
                            const evaluateBossDrill = () => {
                                const meta = specialMetaState[boss] || null;
                                const hp = Number(meta && meta.hp);
                                const maxHp = Number(meta && meta.maxHp);
                                if (Number.isFinite(hp) && Number.isFinite(maxHp) && hp <= Math.max(1, maxHp - 2)) {
                                    showTutorialNote('Confirmed: boss took multiple hits and remains active.');
                                    done();
                                    return;
                                }
                                const elapsed = Date.now() - startedAt;
                                let busy = false;
                                try { busy = typeof particlesActive === 'function' ? !!particlesActive() : false; } catch (e) { }
                                if (busy && elapsed < 2800) {
                                    setTimeout(evaluateBossDrill, 120);
                                    return;
                                }
                                showTutorialNote('If needed, retry this step to watch multi-hit boss damage.');
                            };
                            setTimeout(evaluateBossDrill, 140);
                            return true;
                        }
                    },
                    {
                        title: 'Tutorial 7/9',
                        bodyHtml: 'To assist you in your duties as a new S.P.A.R.E. recruit, we have given you remote access to PIXEL—the lab\'s deeply overqualified AI assistant—through your HUD. PIXEL’s training data includes advanced containment theory, nano-scale combat modeling, and an extensive archive of mid-century “cinematic science fiction.”<br><br>Watch PIXEL for hints, warnings, and updates when conditions change. The sarcasm is optional. The information is not.',
                        actionLabel: 'Continue',
                        focusAssistant: true,
                        setup: () => {
                            clearTutorialTarget();
                            playTutorialAssistantIntroCue();
                        }
                    },
                    {
                        title: 'Tutorial 8/9',
                        bodyHtml: '<img class="tutorial-inline-card tutorial-inline-card-float" src="https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/card_storm_capacitor.png" alt="Example Storm Capacitor card">As you progress, you will receive temporary run modifiers called <b>PIXEL PERKS</b>. These are usually practical boosts and are tracked in the <b>MODS</b> bar.<br><br>The MODS bar will show what is active and, when relevant, remaining uses or charges.<br><br>Operational warning: We have seen attempts at infiltration from our competitors. If you are offered a MOD chip from <b>VIRAL VENTURES</b>, assume there is a catch.',
                        actionLabel: 'Continue',
                        focusModsBar: true,
                        setup: () => {
                            clearTutorialTarget();
                        }
                    },
                    {
                        title: 'Tutorial 9/9',
                        bodyHtml: 'Final route briefing:<br><br><b>Adventure Mode</b> is the full campaign operation: story progression, special enemies, bosses, perks, ventures, and end states.<br><br><b>Endurance Mode</b> is a controlled danger-room simulation: no campaign story beats, no bosses, and no final objective. The system keeps escalating pressure while you chase higher level and score records.<br><br>Choose Adventure for narrative containment duty. Choose Endurance for pure stress testing.',
                        actionLabel: 'Finish Tutorial',
                        setup: () => {
                            clearTutorialTarget();
                        },
                        completeEndsTutorial: true
                    }
                ];
            }

            function removeTutorialStormArrow() {
                if (tutorialModeState.stormArrowRaf) {
                    try { cancelAnimationFrame(tutorialModeState.stormArrowRaf); } catch (e) { }
                    tutorialModeState.stormArrowRaf = 0;
                }
                const arrow = tutorialModeState.stormArrowEl;
                tutorialModeState.stormArrowEl = null;
                if (arrow && arrow.parentNode) {
                    try { arrow.parentNode.removeChild(arrow); } catch (e) { }
                }
            }

            function updateTutorialStormArrowPosition() {
                if (!tutorialModeState.active || !tutorialModeState.stormArrowEl || !stormBtn) return;
                let r = null;
                try { r = stormBtn.getBoundingClientRect(); } catch (e) { }
                if (!r || !Number.isFinite(r.left)) return;
                const arrow = tutorialModeState.stormArrowEl;
                arrow.style.left = `${Math.round(r.left + (r.width / 2))}px`;
                arrow.style.top = `${Math.round(r.top - 14)}px`;
                tutorialModeState.stormArrowRaf = requestAnimationFrame(updateTutorialStormArrowPosition);
            }

            function ensureTutorialStormArrow() {
                if (!tutorialModeState.active || !stormBtn) return;
                if (tutorialModeState.stormArrowEl && tutorialModeState.stormArrowEl.isConnected) {
                    if (!tutorialModeState.stormArrowRaf) {
                        tutorialModeState.stormArrowRaf = requestAnimationFrame(updateTutorialStormArrowPosition);
                    }
                    return;
                }
                const arrow = document.createElement('div');
                arrow.className = 'tutorial-storm-arrow';
                arrow.textContent = '▼';
                arrow.setAttribute('aria-hidden', 'true');
                document.body.appendChild(arrow);
                tutorialModeState.stormArrowEl = arrow;
                tutorialModeState.stormArrowRaf = requestAnimationFrame(updateTutorialStormArrowPosition);
            }

            function setTutorialStormFocus(active) {
                try {
                    if (!stormBtn) return;
                    stormBtn.classList.toggle('tutorial-focus', !!active);
                    if (active) ensureTutorialStormArrow();
                    else removeTutorialStormArrow();
                } catch (e) { }
            }

            function removeTutorialMeterArrow() {
                if (tutorialModeState.meterArrowRaf) {
                    try { cancelAnimationFrame(tutorialModeState.meterArrowRaf); } catch (e) { }
                    tutorialModeState.meterArrowRaf = 0;
                }
                const arrow = tutorialModeState.meterArrowEl;
                tutorialModeState.meterArrowEl = null;
                if (arrow && arrow.parentNode) {
                    try { arrow.parentNode.removeChild(arrow); } catch (e) { }
                }
            }

            function updateTutorialMeterArrowPosition() {
                if (!tutorialModeState.active || !tutorialModeState.meterArrowEl) return;
                const meter = document.getElementById('clicksMeter');
                if (!meter) return;
                let r = null;
                try { r = meter.getBoundingClientRect(); } catch (e) { }
                if (!r || !Number.isFinite(r.left)) return;
                const arrow = tutorialModeState.meterArrowEl;
                arrow.style.left = `${Math.round(r.left + (r.width / 2))}px`;
                arrow.style.top = `${Math.round(r.top - 18)}px`;
                tutorialModeState.meterArrowRaf = requestAnimationFrame(updateTutorialMeterArrowPosition);
            }

            function ensureTutorialMeterArrow() {
                if (!tutorialModeState.active) return;
                const meter = document.getElementById('clicksMeter');
                if (!meter) return;
                if (tutorialModeState.meterArrowEl && tutorialModeState.meterArrowEl.isConnected) {
                    if (!tutorialModeState.meterArrowRaf) {
                        tutorialModeState.meterArrowRaf = requestAnimationFrame(updateTutorialMeterArrowPosition);
                    }
                    return;
                }
                const arrow = document.createElement('div');
                arrow.className = 'tutorial-meter-arrow';
                arrow.textContent = '▼';
                arrow.setAttribute('aria-hidden', 'true');
                document.body.appendChild(arrow);
                tutorialModeState.meterArrowEl = arrow;
                tutorialModeState.meterArrowRaf = requestAnimationFrame(updateTutorialMeterArrowPosition);
            }

            function setTutorialMeterFocus(active) {
                if (active) ensureTutorialMeterArrow();
                else removeTutorialMeterArrow();
            }

            function getVisibleAssistantBadge() {
                try {
                    const all = Array.from(document.querySelectorAll('#assist-badge'));
                    for (let i = 0; i < all.length; i++) {
                        const el = all[i];
                        if (!el || !el.getBoundingClientRect) continue;
                        const inIntro = !!(el.closest && el.closest('#aiIntro'));
                        if (inIntro) continue;
                        const r = el.getBoundingClientRect();
                        if (r && r.width > 0 && r.height > 0) return el;
                    }
                    return all.length ? all[0] : null;
                } catch (e) {
                    return document.getElementById('assist-badge');
                }
            }

            function removeTutorialAssistantArrow() {
                if (tutorialModeState.assistantArrowRaf) {
                    try { cancelAnimationFrame(tutorialModeState.assistantArrowRaf); } catch (e) { }
                    tutorialModeState.assistantArrowRaf = 0;
                }
                const arrow = tutorialModeState.assistantArrowEl;
                tutorialModeState.assistantArrowEl = null;
                if (arrow && arrow.parentNode) {
                    try { arrow.parentNode.removeChild(arrow); } catch (e) { }
                }
            }

            function updateTutorialAssistantArrowPosition() {
                if (!tutorialModeState.active || !tutorialModeState.assistantArrowEl) return;
                const badge = getVisibleAssistantBadge();
                if (!badge) return;
                let r = null;
                try { r = badge.getBoundingClientRect(); } catch (e) { }
                if (!r || !Number.isFinite(r.left)) return;
                const arrow = tutorialModeState.assistantArrowEl;
                arrow.style.left = `${Math.round(r.left + (r.width / 2))}px`;
                arrow.style.top = `${Math.round(r.top - 18)}px`;
                tutorialModeState.assistantArrowRaf = requestAnimationFrame(updateTutorialAssistantArrowPosition);
            }

            function ensureTutorialAssistantArrow() {
                if (!tutorialModeState.active) return;
                const badge = getVisibleAssistantBadge();
                if (!badge) return;
                if (tutorialModeState.assistantArrowEl && tutorialModeState.assistantArrowEl.isConnected) {
                    if (!tutorialModeState.assistantArrowRaf) {
                        tutorialModeState.assistantArrowRaf = requestAnimationFrame(updateTutorialAssistantArrowPosition);
                    }
                    return;
                }
                const arrow = document.createElement('div');
                arrow.className = 'tutorial-assistant-arrow';
                arrow.textContent = '▼';
                arrow.setAttribute('aria-hidden', 'true');
                document.body.appendChild(arrow);
                tutorialModeState.assistantArrowEl = arrow;
                tutorialModeState.assistantArrowRaf = requestAnimationFrame(updateTutorialAssistantArrowPosition);
            }

            function setTutorialAssistantFocus(active) {
                if (active) ensureTutorialAssistantArrow();
                else removeTutorialAssistantArrow();
            }

            function removeTutorialModsArrow() {
                if (tutorialModeState.modsArrowRaf) {
                    try { cancelAnimationFrame(tutorialModeState.modsArrowRaf); } catch (e) { }
                    tutorialModeState.modsArrowRaf = 0;
                }
                const arrow = tutorialModeState.modsArrowEl;
                tutorialModeState.modsArrowEl = null;
                if (arrow && arrow.parentNode) {
                    try { arrow.parentNode.removeChild(arrow); } catch (e) { }
                }
            }

            function updateTutorialModsArrowPosition() {
                if (!tutorialModeState.active || !tutorialModeState.modsArrowEl) return;
                const mods = document.getElementById('perkHud');
                if (!mods) return;
                let r = null;
                try { r = mods.getBoundingClientRect(); } catch (e) { }
                if (!r || !Number.isFinite(r.left)) return;
                const arrow = tutorialModeState.modsArrowEl;
                arrow.style.left = `${Math.round(r.left + (r.width / 2))}px`;
                arrow.style.top = `${Math.round(r.top - 18)}px`;
                tutorialModeState.modsArrowRaf = requestAnimationFrame(updateTutorialModsArrowPosition);
            }

            function ensureTutorialModsArrow() {
                if (!tutorialModeState.active) return;
                const mods = document.getElementById('perkHud');
                if (!mods) return;
                if (tutorialModeState.modsArrowEl && tutorialModeState.modsArrowEl.isConnected) {
                    if (!tutorialModeState.modsArrowRaf) {
                        tutorialModeState.modsArrowRaf = requestAnimationFrame(updateTutorialModsArrowPosition);
                    }
                    return;
                }
                const arrow = document.createElement('div');
                arrow.className = 'tutorial-mods-arrow';
                arrow.textContent = '▼';
                arrow.setAttribute('aria-hidden', 'true');
                document.body.appendChild(arrow);
                tutorialModeState.modsArrowEl = arrow;
                tutorialModeState.modsArrowRaf = requestAnimationFrame(updateTutorialModsArrowPosition);
            }

            function setTutorialModsFocus(active) {
                if (active) ensureTutorialModsArrow();
                else removeTutorialModsArrow();
            }

            function applyTutorialModsPreview(active) {
                try {
                    if (!runPerkState) return;
                    if (active) {
                        if (!tutorialModeState.modsPreviewActive) {
                            tutorialModeState.modsPreviewBackup.stormCapacitorCharges = Number(runPerkState.stormCapacitorCharges) || 0;
                            tutorialModeState.modsPreviewActive = true;
                        }
                        runPerkState.stormCapacitorCharges = Math.max(1, Number(runPerkState.stormCapacitorCharges) || 0);
                    } else if (tutorialModeState.modsPreviewActive) {
                        runPerkState.stormCapacitorCharges = Math.max(0, Number(tutorialModeState.modsPreviewBackup.stormCapacitorCharges) || 0);
                        tutorialModeState.modsPreviewActive = false;
                        tutorialModeState.modsPreviewBackup.stormCapacitorCharges = null;
                    }
                    try { updatePerkHudIndicators(); } catch (e2) { }
                } catch (e) { }
            }

            function clearTutorialAssistantCueTimers() {
                try {
                    const timers = Array.isArray(tutorialModeState.assistantCueTimers) ? tutorialModeState.assistantCueTimers : [];
                    while (timers.length) {
                        const t = timers.pop();
                        try { clearTimeout(t); } catch (e) { }
                    }
                } catch (e) { }
            }

            function playTutorialAssistantIntroCue() {
                clearTutorialAssistantCueTimers();
                const lines = [
                    "Hey. He is talking about me.",
                    "I am PIXEL. I do alerts, tactical hints, and occasional emotional support sarcasm.",
                    "If something weird appears, read my messages before you panic-click."
                ];
                for (let i = 0; i < lines.length; i++) {
                    const t = setTimeout(() => {
                        try {
                            if (!tutorialModeState.active) return;
                            if (window.Assistant && Assistant.show) {
                                Assistant.show(lines[i], { priority: 2 });
                            }
                        } catch (e) { }
                    }, i * 1600);
                    tutorialModeState.assistantCueTimers.push(t);
                }
            }

            function ensureTutorialOverlay() {
                if (tutorialModeState.overlayEl && tutorialModeState.overlayEl.isConnected) return tutorialModeState.overlayEl;
                const wrap = document.createElement('div');
                wrap.className = 'tutorial-overlay';
                wrap.innerHTML = `
                    <div class="tutorial-head">
                        <span id="tutorialTitle">Tutorial</span>
                        <span id="tutorialProgress">1/1</span>
                    </div>
                    <div id="tutorialBody" class="tutorial-body"></div>
                    <div id="tutorialNote" class="tutorial-body" style="margin-top:-2px; min-height:18px; color:#ffd38e;"></div>
                    <div class="tutorial-actions">
                        <button id="tutorialExitBtn" type="button" class="tutorial-btn secondary">Exit</button>
                        <button id="tutorialPrevBtn" type="button" class="tutorial-btn secondary">Prev</button>
                        <button id="tutorialNextBtn" type="button" class="tutorial-btn">Next</button>
                    </div>
                `;
                document.body.appendChild(wrap);
                tutorialModeState.overlayEl = wrap;
                tutorialModeState.noteEl = wrap.querySelector('#tutorialNote');
                const exitBtn = wrap.querySelector('#tutorialExitBtn');
                const prevBtn = wrap.querySelector('#tutorialPrevBtn');
                const nextBtn = wrap.querySelector('#tutorialNextBtn');
                if (exitBtn) {
                    exitBtn.addEventListener('click', () => {
                        stopTutorialMode(true);
                        restartToIntroScreen();
                    });
                }
                if (prevBtn) {
                    prevBtn.addEventListener('click', () => {
                        retreatTutorialStep();
                    });
                }
                if (nextBtn) {
                    nextBtn.addEventListener('click', () => {
                        advanceTutorialStep();
                    });
                }
                return wrap;
            }

            function closeTutorialPrelude() {
                tutorialModeState.introOpen = false;
                const el = tutorialModeState.introEl;
                tutorialModeState.introEl = null;
                if (el && el.parentNode) {
                    try { el.parentNode.removeChild(el); } catch (e) { }
                }
            }

            function showTutorialPrelude() {
                closeTutorialPrelude();
                tutorialModeState.introOpen = true;
                const wrap = document.createElement('div');
                wrap.className = 'tutorial-prelude-overlay';
                wrap.innerHTML = `
                    <div class="tutorial-prelude-card" role="dialog" aria-modal="true" aria-label="Tutorial Introduction">
                        <h3 class="tutorial-prelude-title">TRAINING BRIEFING</h3>
                        <div class="tutorial-prelude-layout">
                            <div class="tutorial-prelude-body">
                                <p>Welcome, new recruit, to Pathodyne Industries — a leading innovator in experimental viral research and automated lab intelligence.</p>
                                <p>You have been entrusted with the containment of several highly volatile, mildly sentient bio-experiments.</p>
                                <p>While these organisms may exhibit aggressive behavior, glowing eyes, or signs of strategic thinking, you are reminded that they remain company property.</p>
                                <p>In this tutorial, you will learn the basics of your new position as a trainee in the Speciman Processing and Active Response Execution team. We value your contributions and look forward to inducting you as a full member of the S.P.A.R.E. unit.</p>
                            </div>
                            <img class="tutorial-prelude-assistant" src="https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/PC_assistant_sm.png" alt="PIXEL Assistant">
                        </div>
                        <div class="tutorial-prelude-actions">
                            <button id="tutorialPreludeExit" type="button" class="tutorial-btn secondary">Exit</button>
                            <button id="tutorialPreludeNext" type="button" class="tutorial-btn">Next</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(wrap);
                tutorialModeState.introEl = wrap;
                const exitBtn = wrap.querySelector('#tutorialPreludeExit');
                const nextBtn = wrap.querySelector('#tutorialPreludeNext');
                if (exitBtn) {
                    exitBtn.addEventListener('click', () => {
                        closeTutorialPrelude();
                        stopTutorialMode(true);
                        restartToIntroScreen();
                    });
                }
                if (nextBtn) {
                    nextBtn.addEventListener('click', () => {
                        closeTutorialPrelude();
                        renderTutorialStep();
                    });
                }
            }

            function showTutorialNote(message) {
                if (!tutorialModeState.active) return;
                const note = tutorialModeState.noteEl;
                if (!note) return;
                note.textContent = String(message || '');
                setTimeout(() => {
                    if (!tutorialModeState.active || tutorialModeState.noteEl !== note) return;
                    if (note.textContent === String(message || '')) note.textContent = '';
                }, 1600);
            }

            function renderTutorialStep() {
                if (!tutorialModeState.active) return;
                const steps = getTutorialSteps();
                const stepIndex = Math.max(0, Math.min(steps.length - 1, tutorialModeState.stepIndex));
                const step = steps[stepIndex];
                const overlay = ensureTutorialOverlay();
                const title = overlay.querySelector('#tutorialTitle');
                const progress = overlay.querySelector('#tutorialProgress');
                const body = overlay.querySelector('#tutorialBody');
                const prevBtn = overlay.querySelector('#tutorialPrevBtn');
                const nextBtn = overlay.querySelector('#tutorialNextBtn');
                if (title) title.textContent = step.title || 'Tutorial';
                if (progress) progress.textContent = `${stepIndex + 1}/${steps.length}`;
                if (body) {
                    if (typeof step.bodyHtml === 'string' && step.bodyHtml) body.innerHTML = step.bodyHtml;
                    else body.textContent = step.body || '';
                }
                if (tutorialModeState.noteEl) tutorialModeState.noteEl.textContent = '';
                clearTutorialAssistantCueTimers();
                tutorialModeState.stepDone = false;
                setTutorialStormFocus(!!step.focusStormButton);
                setTutorialMeterFocus(!!step.focusNanoMeter);
                setTutorialAssistantFocus(!!step.focusAssistant);
                setTutorialModsFocus(!!step.focusModsBar);
                applyTutorialModsPreview(!!step.focusModsBar);
                if (prevBtn) {
                    prevBtn.disabled = false;
                    prevBtn.style.display = '';
                }
                if (nextBtn) {
                    const isLast = stepIndex >= (steps.length - 1);
                    nextBtn.textContent = isLast ? 'Finish' : 'Next';
                    nextBtn.disabled = !!step.onBoardTap;
                }
                if (typeof step.setup === 'function') {
                    try { step.setup(); } catch (e) { }
                }
            }

            function markTutorialStepDone() {
                if (!tutorialModeState.active) return;
                tutorialModeState.stepDone = true;
                const overlay = tutorialModeState.overlayEl;
                const nextBtn = overlay ? overlay.querySelector('#tutorialNextBtn') : null;
                if (nextBtn) nextBtn.disabled = false;
            }

            function advanceTutorialStep() {
                if (!tutorialModeState.active) return;
                const steps = getTutorialSteps();
                const current = steps[tutorialModeState.stepIndex] || null;
                if (current && current.onBoardTap && !tutorialModeState.stepDone) return;
                if (current && current.completeEndsTutorial) {
                    stopTutorialMode(true);
                    restartToIntroScreen();
                    return;
                }
                tutorialModeState.stepIndex = Math.min(steps.length - 1, tutorialModeState.stepIndex + 1);
                renderTutorialStep();
            }

            function retreatTutorialStep() {
                if (!tutorialModeState.active) return;
                if (tutorialModeState.introOpen) return;
                if (tutorialModeState.stepIndex <= 0) {
                    showTutorialPrelude();
                    return;
                }
                const steps = getTutorialSteps();
                tutorialModeState.stepIndex = Math.max(0, Math.min(steps.length - 1, tutorialModeState.stepIndex - 1));
                renderTutorialStep();
            }

            function handleTutorialBoardTap(index) {
                if (!tutorialModeState.active) return false;
                if (tutorialModeState.introOpen) return true;
                const steps = getTutorialSteps();
                const step = steps[tutorialModeState.stepIndex] || null;
                if (!step) return true;
                if (typeof step.onBoardTap === 'function') {
                    const handled = !!step.onBoardTap(index, () => markTutorialStepDone());
                    return handled;
                }
                return true;
            }

            function startTutorialMode() {
                try {
                    clearFinalVictorySequence(true);
                    clearGameOverFeedback();
                    hideContinueOfferPopup(true);
                    hideRunPerkPopup(true);
                    hideFinalOfferPopup(true);
                    stopBoss20PhaseTimer();
                    stopBossGooShieldTimer();
                    stopRotatingBlockerTicker();
                    clearTechnoGremlinPowers(true);
                    clearActiveParticlesImmediate();
                    clearSpecialTelegraph();
                    clearStormPreview();
                    setBoss20BoardFreeze(false);
                } catch (e) { }
                finalOfferPreludeActive = false;
                finalOfferModalOpen = false;
                continueOfferOpen = false;
                levelAdvancePending = false;
                outOfClicksShown = false;
                runContinueUses = 0;
                screensPassed = 1;
                totalScore = 0;
                runStartedByPlayer = true;
                setGameMode(GAME_MODES.tutorial);
                tutorialModeState.active = true;
                tutorialModeState.stepIndex = 0;
                tutorialModeState.stepDone = false;
                tutorialModeState.introOpen = false;
                ensureTutorialOverlay();
                showTutorialPrelude();
                inputLocked = false;
                updateHUD();
            }

            function stopTutorialMode(silent = false) {
                tutorialModeState.active = false;
                tutorialModeState.stepDone = false;
                clearTutorialTarget();
                setTutorialStormFocus(false);
                removeTutorialStormArrow();
                setTutorialMeterFocus(false);
                removeTutorialMeterArrow();
                setTutorialAssistantFocus(false);
                removeTutorialAssistantArrow();
                clearTutorialAssistantCueTimers();
                setTutorialModsFocus(false);
                removeTutorialModsArrow();
                applyTutorialModsPreview(false);
                closeTutorialPrelude();
                const overlay = tutorialModeState.overlayEl;
                tutorialModeState.overlayEl = null;
                tutorialModeState.noteEl = null;
                if (overlay && overlay.parentNode) {
                    try { overlay.parentNode.removeChild(overlay); } catch (e) { }
                }
                if (!silent) setGameMode(GAME_MODES.adventure);
            }

            function clearFinalVictorySequence(unlockInput = false) {
                clearFinalVictoryTimers();
                stopFinalCreditsMusic(220);
                try {
                    const fx = document.querySelectorAll('.final-victory-explosion');
                    if (fx && fx.length) {
                        fx.forEach((el) => {
                            try { el.remove(); } catch (e2) { }
                        });
                    }
                } catch (e) { }
                try {
                    if (finalVictoryOverlayEl && finalVictoryOverlayEl.parentNode) {
                        finalVictoryOverlayEl.parentNode.removeChild(finalVictoryOverlayEl);
                    }
                } catch (e) { }
                finalVictoryOverlayEl = null;
                finalVictoryState = { inProgress: false, shown: false };
                if (unlockInput) inputLocked = false;
            }

            function ensureFinalVictoryOverlay() {
                if (finalVictoryOverlayEl && finalVictoryOverlayEl.isConnected) return finalVictoryOverlayEl;
                const el = document.createElement('div');
                el.className = 'final-victory-overlay';
                document.body.appendChild(el);
                finalVictoryOverlayEl = el;
                return el;
            }

            function spawnFinalVictoryExplosion(x, y, strong = false) {
                try {
                    const host = ensureFinalVictoryOverlay();
                    if (!host) return;
                    const fx = document.createElement('div');
                    fx.className = 'storm-electricity';
                    fx.style.left = Math.round(x) + 'px';
                    fx.style.top = Math.round(y) + 'px';
                    const fxSize = Math.round((strong ? 170 : 130) + Math.random() * (strong ? 90 : 56));
                    fx.style.width = fxSize + 'px';
                    fx.style.height = fxSize + 'px';
                    fx.style.opacity = strong ? '0.72' : '0.6';
                    fx.style.zIndex = '6';
                    host.appendChild(fx);
                    setTimeout(() => { try { fx.remove(); } catch (e) { } }, strong ? 760 : 620);
                } catch (e) { }
            }

            function spawnRandomFinalVictoryExplosion() {
                try {
                    const board = document.getElementById('board') || boardEl;
                    let x = Math.round(window.innerWidth * (0.2 + Math.random() * 0.6));
                    let y = Math.round(window.innerHeight * (0.16 + Math.random() * 0.68));
                    if (board && Math.random() < 0.72) {
                        const r = board.getBoundingClientRect();
                        x = Math.round(r.left + (Math.random() * r.width));
                        y = Math.round(r.top + (Math.random() * r.height));
                    }
                    spawnFinalVictoryExplosion(x, y, Math.random() < 0.22);
                } catch (e) { }
            }

            function fadeOutMusicForFinalVictory() {
                stopFinalCreditsMusic(0);
                try {
                    if (musicOverrideMode === 'final-boss') {
                        stopFinalBossTheme({ fadeOutMs: 1400, resumeNormal: false });
                        return;
                    }
                } catch (e) { }
                const ma = getActiveMusicAudio();
                if (!ma) return;
                const startVol = Math.max(0, Number(ma.volume) || 0.2);
                const startedAt = Date.now();
                const ms = 1600;
                const t = setInterval(() => {
                    try {
                        const k = Math.max(0, Math.min(1, (Date.now() - startedAt) / ms));
                        ma.volume = Math.max(0, startVol * (1 - k));
                        if (k >= 1) {
                            clearInterval(t);
                            try { ma.pause(); } catch (e) { }
                        }
                    } catch (e) {
                        clearInterval(t);
                    }
                }, 50);
            }

            function playLevel20BossDeathSequenceSfx() {
                const delays = [0, 420, 840];
                for (let i = 0; i < delays.length; i++) {
                    const delay = delays[i];
                    setTimeout(() => {
                        if (!isFinalVictoryActive()) return;
                        try { playSfx('miniboss_dies'); } catch (e) { }
                    }, delay);
                }
            }

            function showFinalVictoryModal() {
                const host = ensureFinalVictoryOverlay();
                if (!host) return false;
                finalVictoryState.inProgress = false;
                finalVictoryState.shown = true;
                host.classList.add('show-win');
                const ending = getFinalEndingProfile();
                const endingColor = (ending.key === 'broker') ? '#9dff7d' : '#ffd166';
                const typedStoryText = String(ending.storyText || '');
                try {
                    if (runPerkState && !runPerkState.finalEndingAchievementGranted) {
                        if (ending.key === 'broker') {
                            incrementAchievementStat('endingHostileTakeoverWins', 1, 'lifetime');
                        } else if (ending.key === 'pixel') {
                            incrementAchievementStat('endingSystemRestoredWins', 1, 'lifetime');
                        } else if (ending.key === 'solo') {
                            incrementAchievementStat('endingIndependentVariableWins', 1, 'lifetime');
                            if (!(runPerkState && runPerkState.continueDealTaken)) {
                                incrementAchievementStat('endingTrueWins', 1, 'lifetime');
                            }
                        }
                        runPerkState.finalEndingAchievementGranted = true;
                    }
                } catch (e) { }

                const mountSplash = () => {
                    host.innerHTML = `
                        <div class="final-victory-modal" role="dialog" aria-modal="true" aria-label="Victory">
                            <div class="fv-title">PATHOGEN SUPPRESSED</div>
                            <div class="fv-image-wrap">
                                <img src="${escapeHtmlAttr(ending.imageUrl || FINAL_VICTORY_DEFAULT_IMAGE_URL || '')}" alt="Victory" onerror="this.style.display='none';" />
                            </div>
                            <div class="fv-final-card">MISSION COMPLETE</div>
                            <div class="fv-actions">
                                <button type="button" class="fv-restart-btn">START NEW RUN</button>
                            </div>
                        </div>
                    `;
                    const restartBtn = host.querySelector('.fv-restart-btn');
                    if (restartBtn) {
                        restartBtn.addEventListener('click', () => {
                            try { clearFinalVictorySequence(false); } catch (e) { }
                            showFinalRunStatsPopup({
                                title: 'RUN COMPLETE',
                                subtitle: 'Pathogen Suppressed',
                                onContinue: () => {
                                    restartToIntroScreen();
                                }
                            });
                        }, { once: true });
                    }
                    startFinalCreditsMusic();
                    finalVictoryFinalCardTimer = setTimeout(() => {
                        try { host.classList.add('show-final-card'); } catch (e) { }
                    }, 35000);
                };

                host.innerHTML = `
                    <div class="fv-typed-stage" role="dialog" aria-modal="true" aria-label="Epilogue">
                        <div class="fv-typed-title">EPILOGUE</div>
                        <div class="fv-typed-body" style="color:${escapeHtmlAttr(endingColor)};"></div>
                        <div class="fv-typed-hint">Click to continue</div>
                    </div>
                `;
                const typedBody = host.querySelector('.fv-typed-body');
                const typedHint = host.querySelector('.fv-typed-hint');
                const chars = Array.from(typedStoryText);
                let i = 0;
                let typingDone = false;
                const typeTick = () => {
                    if (!typedBody) return;
                    if (i >= chars.length) {
                        typingDone = true;
                        if (typedHint) typedHint.classList.add('show');
                        return;
                    }
                    typedBody.textContent += chars[i++];
                    setTimeout(typeTick, 18);
                };
                typeTick();

                const onProceed = (ev) => {
                    try { ev.preventDefault(); } catch (e) { }
                    if (!typingDone) return;
                    host.removeEventListener('click', onProceed);
                    host.removeEventListener('touchstart', onProceed);
                    host.removeEventListener('keydown', onKeyProceed);
                    mountSplash();
                };
                const onKeyProceed = (ev) => {
                    if (!typingDone) return;
                    if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') onProceed(ev);
                };
                host.addEventListener('click', onProceed);
                host.addEventListener('touchstart', onProceed, { passive: false });
                host.addEventListener('keydown', onKeyProceed);
                host.setAttribute('tabindex', '0');
                try { host.focus(); } catch (e) { }
                return true;
            }

            function triggerLevel20FinalVictorySequence(defeatedBossIndex = -1, tracker = null) {
                if (isFinalVictoryActive()) return false;
                finalVictoryState.inProgress = true;
                finalVictoryState.shown = false;
                inputLocked = true;
                stormResolving = false;
                try { hideRunPerkPopup(true); } catch (e) { }
                try { hideFinalOfferPopup(true); } catch (e) { }
                try {
                    const levelPopup = document.querySelector('.level-complete');
                    if (levelPopup) levelPopup.remove();
                } catch (e) { }
                try {
                    const gameOver = document.querySelector('.game-over-popup');
                    if (gameOver) gameOver.remove();
                } catch (e) { }
                try { stopBossGooShieldTimer(); } catch (e) { }
                try { stopBoss20PhaseTimer(); } catch (e) { }
                try { clearTechnoGremlinPowers(true); } catch (e) { }
                try { stopRotatingBlockerTicker(); } catch (e) { }
                playLevel20BossDeathSequenceSfx();
                fadeOutMusicForFinalVictory();

                const host = ensureFinalVictoryOverlay();
                if (host) {
                    host.classList.remove('show-win', 'show-final-card', 'show-summary');
                    host.innerHTML = '';
                    requestAnimationFrame(() => {
                        try { host.classList.add('fading'); } catch (e) { }
                    });
                }

                const remaining = [];
                for (let i = 0; i < state.length; i++) {
                    if (state[i] !== null) remaining.push(i);
                }
                shuffle(remaining);
                let elapsed = 160;
                for (let i = 0; i < remaining.length; i++) {
                    const idx = remaining[i];
                    setTimeout(() => {
                        try {
                            if (state[idx] === null) return;
                            playMiniBossBurstEffect(idx, Math.random() < 0.34);
                            popAt(idx, tracker);
                            state[idx] = null;
                            clearSpecialForCell(idx);
                            if (Math.random() < 0.52) spawnRandomFinalVictoryExplosion();
                            scheduleRender();
                        } catch (e) { }
                    }, elapsed);
                    elapsed += 42 + Math.floor(Math.random() * 58);
                }
                if (Number.isFinite(defeatedBossIndex) && defeatedBossIndex >= 0) {
                    const c = getBoardCellCenter(defeatedBossIndex);
                    if (c) spawnFinalVictoryExplosion(c.x, c.y, true);
                }
                spawnRandomFinalVictoryExplosion();
                finalVictoryExplosionTimer = setInterval(() => {
                    if (!isFinalVictoryActive()) return;
                    spawnRandomFinalVictoryExplosion();
                }, 250);
                finalVictoryRevealTimer = setTimeout(() => {
                    clearFinalVictoryTimers();
                    showFinalVictoryModal();
                }, Math.max(5200, elapsed + 3000));
                scheduleRender();
                updateHUD();
                return true;
            }

            // Unified reset used by the Game Over persistent popup and restart wiring
            function performGameReset() {
                try {
                    const fromGameOver = !!outOfClicksShown || !!(document.body && document.body.classList.contains('game-over-fx')) || !!document.querySelector('.game-over-popup');
                    const fromFinalVictory = isFinalVictoryActive() || !!document.querySelector('.final-victory-overlay');
                    clearFinalVictorySequence(true);
                    clearGameOverFeedback();
                    hideContinueOfferPopup(true);
                    try { hideRunPerkPopup(true); } catch (e) { }
                    try { hideFinalOfferPopup(true); } catch (e) { }
                    try { stopBoss20PhaseTimer(); } catch (e) { }
                    try { stopBossGooShieldTimer(); } catch (e) { }
                    try { stopRotatingBlockerTicker(); } catch (e) { }
                    try { clearTechnoGremlinPowers(true); } catch (e) { }
                    try { clearActiveParticlesImmediate(); } catch (e) { }
                    finalOfferPreludeActive = false;
                    finalOfferModalOpen = false;
                    levelAdvancePending = false;
                    screensPassed = 0;
                    totalScore = 0;
                    randomizeBoard(false);
                    stormResolving = false;
                    inputLocked = false;
                    updateHUD();
                    resetRunIntegrityState();
                    outOfClicksShown = false;
                    runContinueUses = 0;
                    continueOfferOpen = false;
                    if (fromGameOver || fromFinalVictory) {
                        try { switchMusicForNewRun(); } catch (e) { }
                        try { if (fromGameOver && window.Assistant && Assistant.emit) Assistant.emit('postGameWelcome'); } catch (e) { }
                    }
                } catch (e) { console.warn('performGameReset failed', e); }
            }

            function forcePostRestartInteractivity() {
                try {
                    const popupSelectors = [
                        '.level-complete',
                        '.game-over-popup',
                        '.continue-offer-popup',
                        '.run-perk-popup',
                        '.final-offer-modal',
                        '.final-offer-prelude',
                        '.boss20-talk-modal'
                    ];
                    popupSelectors.forEach((sel) => {
                        const nodes = document.querySelectorAll(sel);
                        nodes.forEach((el) => {
                            try { el.remove(); } catch (e) { }
                        });
                    });
                } catch (e) { }
                try {
                    ['audioPopup', 'helpPopup', 'startModal', 'level5DynamicsModal', 'aiIntro'].forEach((id) => {
                        const el = document.getElementById(id);
                        if (!el) return;
                        try { el.classList.remove('show', 'open'); } catch (e) { }
                        try { el.style.display = 'none'; } catch (e) { }
                        try { el.style.visibility = 'hidden'; } catch (e) { }
                        try { el.style.pointerEvents = 'none'; } catch (e) { }
                        try { el.setAttribute('aria-hidden', 'true'); } catch (e) { }
                    });
                } catch (e) { }
                try { clearActiveParticlesImmediate(); } catch (e) { }
                try { clearSpecialTelegraph(); } catch (e) { }
                try { clearStormPreview(); } catch (e) { }
                try { setBoss20BoardFreeze(false); } catch (e) { }
                try {
                    if (boss20State) {
                        boss20State.inCinematic = false;
                        boss20State.inFinalWindow = false;
                    }
                } catch (e) { }
                finalOfferPreludeActive = false;
                finalOfferModalOpen = false;
                continueOfferOpen = false;
                outOfClicksShown = false;
                levelAdvancePending = false;
                stormResolving = false;
                inputLocked = false;
                try { updateHUD(); } catch (e) { }
                try { scheduleRender(); } catch (e) { }
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
                const modifiedNote = isModifiedRun() ? `<div class="go-recap-more">MODIFIED RUN: achievements and high scores disabled</div>` : '';
                const tips = [
                    'Prioritize chain setup over single pops.',
                    'Clear armored viruses early so they do not stall cascades.',
                    'Use Nano Storm on dense clusters, not isolated targets.',
                    'Pop near center to open more chain directions.',
                    'When clicks are low, play for guaranteed clears over risky setups.',
                    'Watch blocker lanes before committing high-value pops.'
                ];
                let tipIndex = Math.floor(Math.random() * tips.length);
                if (tips.length > 1 && tipIndex === lastGameOverTipIndex) {
                    tipIndex = (tipIndex + 1 + Math.floor(Math.random() * (tips.length - 1))) % tips.length;
                }
                lastGameOverTipIndex = tipIndex;
                const tipLine = tips[tipIndex] || tips[0];
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
                        ${modifiedNote}
                        <div class="go-tip"><b>PIXEL tip:</b> ${escapeHtml(tipLine)}</div>
                    </div>
                `;
            }

            function showFinalRunStatsPopup(opts = {}) {
                const title = opts.title || 'RUN COMPLETE';
                const subtitle = opts.subtitle || 'Performance Summary';
                const onContinue = (typeof opts.onContinue === 'function') ? opts.onContinue : () => { };
                try {
                    const existing = document.querySelector('.final-run-stats-popup');
                    if (existing) {
                        try { existing.remove(); } catch (e) { }
                    }
                    const el = document.createElement('div');
                    el.className = 'final-run-stats-popup';
                    el.setAttribute('role', 'dialog');
                    el.setAttribute('aria-modal', 'true');
                    el.style.pointerEvents = 'auto';
                    const recapHtml = buildGameOverRecapHtml();
                    el.innerHTML = `
                        <div class="go-title">${escapeHtml(String(title || 'RUN COMPLETE'))}</div>
                        <div class="go-sub">${escapeHtml(String(subtitle || 'Performance Summary'))}</div>
                        ${recapHtml}
                        <div class="go-actions"><button type="button" class="go-restart-btn" aria-label="Continue">CONTINUE</button></div>
                    `;
                    document.body.appendChild(el);
                    void el.offsetWidth;
                    el.classList.add('show');
                    const continueBtn = el.querySelector('.go-restart-btn');
                    if (continueBtn) {
                        continueBtn.addEventListener('click', (ev) => {
                            try { ev.preventDefault(); ev.stopPropagation(); } catch (e) { }
                            try {
                                el.classList.remove('show');
                                el.classList.add('hide');
                                el.addEventListener('animationend', () => {
                                    try { el.remove(); } catch (e2) { }
                                    try { onContinue(); } catch (e3) { }
                                }, { once: true });
                            } catch (e) {
                                try { el.remove(); } catch (e2) { }
                                try { onContinue(); } catch (e3) { }
                            }
                        }, { once: true });
                    }
                    return true;
                } catch (e) {
                    try { onContinue(); } catch (e2) { }
                    return false;
                }
            }


            // ---------- Level complete popup helper ----------
            

            // ---------- Game Over popup helper ----------

            function getRunContinueClickGrant() {
                return Math.max(1, Math.floor(Number(RUN_CONTINUE_CONFIG && RUN_CONTINUE_CONFIG.grantClicks) || 10));
            }

            function updateHudSponsorMark() {
                try {
                    const mark = document.querySelector('.pathodyne-mark-inline');
                    if (!mark) return;
                    const isViral = !!(runPerkState && runPerkState.continueDealTaken);
                    mark.classList.toggle('is-viral', isViral);
                    const label = isViral ? 'Viral Ventures Contract Active' : 'Pathodyne Mark';
                    mark.setAttribute('title', label);
                    mark.setAttribute('aria-label', label);
                } catch (e) { }
            }

            let sponsorMarkHintTs = 0;
            function handleSponsorMarkInfoClick() {
                try {
                    const now = Date.now();
                    if ((now - sponsorMarkHintTs) < 700) return;
                    sponsorMarkHintTs = now;
                    const isViral = !!(runPerkState && runPerkState.continueDealTaken);
                    const linesPathodyne = [
                        'That mark is Pathodyne corporate branding. They stamp everything, including us.',
                        'Pathodyne logo detected. Officially reassuring. Unofficially unsettling.',
                        'Corporate watermark online: Pathodyne. Legal says this counts as comfort.'
                    ];
                    const linesViral = [
                        'That is the Viral Ventures mark. Translation: they own a piece of this run now.',
                        'Viral Ventures contract active. I strongly recommend never signing things in glowing green.',
                        'Sponsor update: Viral Ventures. Their accounting team is scarier than the pathogens.'
                    ];
                    const pool = isViral ? linesViral : linesPathodyne;
                    const line = pool[Math.floor(Math.random() * pool.length)] || pool[0] || '';
                    if (line && window.Assistant && Assistant.show) {
                        Assistant.show(line, { priority: 1 });
                    }
                } catch (e) { }
            }

            function showContinueScorePenaltyFx(penaltyPoints, percent = 25) {
                const pts = Math.max(0, Math.floor(Number(penaltyPoints) || 0));
                if (pts <= 0) return;
                try {
                    const scoreTarget = document.getElementById('score') || document.getElementById('scoreDisplay');
                    if (!scoreTarget) return;
                    const r = scoreTarget.getBoundingClientRect();
                    const toast = document.createElement('div');
                    toast.className = 'score-penalty-toast';
                    toast.textContent = `-${percent}% SCORE  (-${pts})`;
                    toast.style.left = Math.round(r.left + (r.width / 2)) + 'px';
                    toast.style.top = Math.round(Math.max(8, r.top - 8)) + 'px';
                    document.body.appendChild(toast);
                    requestAnimationFrame(() => { try { toast.classList.add('show'); } catch (e) { } });
                    setTimeout(() => { try { toast.classList.remove('show'); } catch (e) { } }, 900);
                    setTimeout(() => { try { toast.remove(); } catch (e) { } }, 1300);
                } catch (e) { }
            }

            function applyRunContinueScorePenalty(percent = 25, durationMs = 850) {
                const pct = Math.max(0, Math.min(95, Number(percent) || 0));
                const before = Math.max(0, Math.floor(Number(totalScore) || 0));
                const penalty = Math.max(0, Math.floor(before * (pct / 100)));
                const after = Math.max(0, before - penalty);
                if (penalty <= 0) return { before, after, penalty, percent: pct };
                const start = Date.now();
                const duration = Math.max(120, Math.floor(Number(durationMs) || 850));
                const animate = () => {
                    const t = Math.max(0, Math.min(1, (Date.now() - start) / duration));
                    const eased = 1 - Math.pow(1 - t, 2);
                    totalScore = Math.max(after, Math.floor(before - (penalty * eased)));
                    updateHUD();
                    if (t < 1) requestAnimationFrame(animate);
                    else {
                        totalScore = after;
                        updateHUD();
                    }
                };
                requestAnimationFrame(animate);
                showContinueScorePenaltyFx(penalty, pct);
                return { before, after, penalty, percent: pct };
            }

            function canOfferRunContinue(levelNum = getCurrentLevelNumber()) {
                if (!(RUN_CONTINUE_CONFIG && RUN_CONTINUE_CONFIG.enabled)) return false;
                const lvl = Math.max(1, Math.floor(Number(levelNum) || 1));
                const cutoff = Math.max(1, Math.floor(Number(RUN_CONTINUE_CONFIG.disabledAtLevel) || 20));
                if (lvl >= cutoff) return false;
                if (continueOfferOpen) return false;
                const maxUses = Math.max(0, Math.floor(Number(RUN_CONTINUE_CONFIG.maxUsesPerRun) || 1));
                if (runContinueUses >= maxUses) return false;
                return true;
            }

            function evaluateRunContinueRequirement(levelNum = getCurrentLevelNumber()) {
                // Placeholder for future continue tasks/challenges.
                // Return `{ ok: false, reason: '...' }` to block continue until task completion.
                return { ok: true, reason: '' };
            }

            function hideContinueOfferPopup(immediate = false) {
                const el = continueOfferPopupEl || document.querySelector('.continue-offer-popup');
                if (!el) {
                    continueOfferPopupEl = null;
                    continueOfferOpen = false;
                    return;
                }
                const cleanup = () => {
                    try { el.remove(); } catch (e) { }
                    if (continueOfferPopupEl === el) continueOfferPopupEl = null;
                    continueOfferOpen = false;
                };
                if (immediate) {
                    cleanup();
                    return;
                }
                try {
                    el.classList.remove('show');
                    el.classList.add('hide');
                    el.addEventListener('animationend', cleanup, { once: true });
                } catch (e) {
                    cleanup();
                }
            }

            function showContinueOfferPopup(opts = {}) {
                try {
                    const levelNum = Math.max(1, Math.floor(Number(opts.level) || getCurrentLevelNumber()));
                    if (!canOfferRunContinue(levelNum)) return false;
                    hideContinueOfferPopup(true);
                    continueOfferOpen = true;
                    inputLocked = true;
                    const el = document.createElement('div');
                    el.className = 'continue-offer-popup';
                    el.setAttribute('role', 'alertdialog');
                    el.innerHTML = `
                        <div class="co-art" style="background-image:url('${escapeHtmlAttr(CONTINUE_OFFER_IMAGE_URL)}');"></div>
                        <div class="co-message">I'll give you +${getRunContinueClickGrant()} nano bots to continue this level. All it will cost you is 25% of your points</div>
                        <div class="co-status" aria-live="polite"></div>
                        <div class="co-actions">
                            <button type="button" class="co-continue-btn">CONTINUE</button>
                            <button type="button" class="co-giveup-btn">GAME OVER</button>
                        </div>
                    `;
                    document.body.appendChild(el);
                    continueOfferPopupEl = el;
                    void el.offsetWidth;
                    el.classList.add('show');
                    const statusEl = el.querySelector('.co-status');
                    const continueBtn = el.querySelector('.co-continue-btn');
                    const giveUpBtn = el.querySelector('.co-giveup-btn');
                    const closeWith = (fn, delayMs = 180) => {
                        hideContinueOfferPopup(false);
                        setTimeout(() => {
                            try { if (typeof fn === 'function') fn(); } catch (e) { }
                        }, Math.max(0, Math.floor(Number(delayMs) || 0)));
                    };
                    if (continueBtn) {
                        continueBtn.addEventListener('click', () => {
                            const gate = evaluateRunContinueRequirement(levelNum) || {};
                            if (!gate.ok) {
                                if (statusEl) statusEl.textContent = String(gate.reason || 'Continue requirements not met.');
                                return;
                            }
                            runContinueUses = Math.max(0, Number(runContinueUses) || 0) + 1;
                            const before = Math.max(0, Number(clicksLeft) || 0);
                            clicksLeft = Math.min(getMaxClicksCap(), before + getRunContinueClickGrant());
                            const applied = Math.max(0, clicksLeft - before);
                            const penaltyResult = applyRunContinueScorePenalty(25, 900);
                            if (runPerkState) {
                                runPerkState.continueDealTaken = true;
                                runPerkState.continueDealPenaltyTotal = Math.max(0, Number(runPerkState.continueDealPenaltyTotal) || 0) + Math.max(0, Number(penaltyResult && penaltyResult.penalty) || 0);
                            }
                            updateHudSponsorMark();
                            outOfClicksShown = false;
                            inputLocked = false;
                            try { playSfx('fill'); } catch (e) { }
                            if (statusEl) {
                                const lost = Math.max(0, Number(penaltyResult && penaltyResult.penalty) || 0);
                                statusEl.textContent = lost > 0
                                    ? `VIRAL VENTURES CLAIMS ${lost} POINTS.`
                                    : 'VIRAL VENTURES CLAIMS THEIR SHARE.';
                            }
                            updateHUD();
                            closeWith(() => {
                                try { scheduleRender(); } catch (e) { }
                                if (typeof opts.onContinue === 'function') opts.onContinue({ level: levelNum, grant: applied });
                            }, 980);
                        }, { once: true });
                    }
                    if (giveUpBtn) {
                        giveUpBtn.addEventListener('click', () => {
                            closeWith(() => {
                                if (typeof opts.onDecline === 'function') opts.onDecline({ level: levelNum });
                            });
                        }, { once: true });
                    }
                    return true;
                } catch (e) {
                    continueOfferOpen = false;
                    inputLocked = false;
                    return false;
                }
            }

            function showGameOverPopup(opts = {}) {
                // opts: { title, subtitle, duration (ms), persistent (bool) }
                const title = opts.title || 'GAME OVER';
                const subtitle = opts.subtitle || 'Try Again';
                const duration = (typeof opts.duration === 'number') ? opts.duration : 1800;
                const persistent = !!opts.persistent;
                try { hideActiveChainBadge(false); } catch (e) { }

                try {
                    triggerGameOverFeedback();
                    // create element
                    const el = document.createElement('div');
                    el.className = 'game-over-popup';
                    el.setAttribute('role', persistent ? 'alertdialog' : 'alert');
                    el.style.pointerEvents = persistent ? 'auto' : 'none';
                    const recapHtml = buildGameOverRecapHtml();
                    const actionHtml = persistent
                        ? `<div class="go-actions"><button type="button" class="go-restart-btn" aria-label="Try again">TRY AGAIN</button></div>`
                        : '';
                    el.innerHTML = `
                                                                                  <div class="go-title">${title}</div>
                                                                                  <div class="go-sub">${subtitle}</div>
                                                                                  ${recapHtml}
                                                                                  ${actionHtml}
                                                                                `;
                    document.body.appendChild(el);
                    if (!persistent) {
                        // Non-persistent flavor can still dismiss on tap/click.
                        try {
                            el.style.cursor = 'pointer';
                            el.title = 'Click to continue';
                            el.addEventListener('click', function restartFromPopup(ev) {
                                try {
                                    if (typeof performGameReset === 'function') performGameReset();
                                    try { if (el && el.parentNode) el.parentNode.removeChild(el); } catch (e) { }
                                } catch (e) { console.warn('restart click handler failed', e); }
                            }, { once: true });
                        } catch (e) { console.warn('could not attach restart click handler', e); }
                    }

                    void el.offsetWidth;
                    el.classList.add('show');
                    try { if (window.Assistant) Assistant.emit && Assistant.emit('gameOver', { title: title, subtitle: subtitle }); } catch (e) { }


                    if (persistent) {
                        const popupRestartBtn = el.querySelector('.go-restart-btn');
                        const cleanup = () => {
                            try {
                                if (el) {
                                    el.classList.remove('show');
                                    el.classList.add('hide');
                                    el.addEventListener('animationend', () => { try { el.remove(); } catch (e) { } }, { once: true });
                                }
                            } catch (e) { }
                        };
                        if (popupRestartBtn) {
                            popupRestartBtn.addEventListener('click', function onPopupRestartClick(e) {
                                e.preventDefault();
                                e.stopPropagation();
                                cleanup();
                                try { outOfClicksShown = false; } catch (e) { }
                                if (typeof performGameReset === 'function') {
                                    try { performGameReset(); } catch (e) { }
                                }
                            }, { once: true });
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
            function updateClicksMeter(clicks) { const container = document.querySelector('.meter-segments'); if (!container) return; const segs = Array.from(container.children); const segCount = segs.length || 10; const cap = Math.max(1, getMaxClicksCap()); const toFill = Math.round((Math.max(0, clicks) / cap) * segCount); segs.forEach((el, i) => { const should = i < toFill; if (should && !el.classList.contains('filled')) { el.classList.add('filled'); el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); } else if (!should && el.classList.contains('filled')) { el.classList.remove('filled'); el.classList.remove('pop'); } }); }

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
            function sampleSizeRandom(levelOverride = null, completedOverride = null) {
                const dims = MAX_SIZE + 1;
                // helper to ensure arrays are the right length
                function ensureLen(arr) {
                    const out = arr.slice(0, dims);
                    while (out.length < dims) out.push(0);
                    return out;
                }
                const rawLevel = (levelOverride == null) ? getCurrentLevelNumber() : Math.max(1, Number(levelOverride) || getCurrentLevelNumber());
                const levelNum = Math.min(10, rawLevel);
                const difficulty = getDifficultyForLevel(levelNum);
                const S = ensureLen(Array.isArray(difficulty.sizeMixStart) ? difficulty.sizeMixStart : [0.05, 0.20, 0.35, 0.40]);
                const M = ensureLen(Array.isArray(difficulty.sizeMixEven) ? difficulty.sizeMixEven : [0.15, 0.25, 0.30, 0.30]);
                const E = ensureLen(Array.isArray(difficulty.sizeMixEnd) ? difficulty.sizeMixEnd : [0.32, 0.33, 0.23, 0.12]);
                const L = ensureLen(Array.isArray(difficulty.sizeMixLate) ? difficulty.sizeMixLate : E);
                const P = ensureLen(Array.isArray(difficulty.sizeMixPost) ? difficulty.sizeMixPost : L);
                const levelsToEven = Math.max(0, Math.floor(Number(difficulty.sizeMixLevelsToEven) || 6));
                const levelsToEnd = Math.max(0, Math.floor(Number(difficulty.sizeMixLevelsToEnd) || 12));
                const levelsToLate = Math.max(0, Math.floor(Number(difficulty.sizeMixLevelsToLate) || 0));
                const levelsToPost = Math.max(0, Math.floor(Number(difficulty.sizeMixLevelsToPost) || 0));
                const rawCompleted = (completedOverride == null) ? Math.max(0, Number(screensPassed) || 0) : Math.max(0, Number(completedOverride) || 0);
                const completed = rawCompleted;

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
                } else if (completed <= levelsToEven + levelsToEnd + levelsToLate) {
                    const local = completed - (levelsToEven + levelsToEnd);
                    const t3 = levelsToLate === 0 ? 1 : (local / levelsToLate);
                    weights = lerpArrays(E, L, t3);
                } else if (completed <= levelsToEven + levelsToEnd + levelsToLate + levelsToPost) {
                    const local = completed - (levelsToEven + levelsToEnd + levelsToLate);
                    const t4 = levelsToPost === 0 ? 1 : (local / levelsToPost);
                    weights = lerpArrays(L, P, t4);
                } else {
                    weights = P.slice();
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

            function getBossSpriteProfileForLevel(levelNum, phaseNum = 0) {
                const lvl = Math.max(1, Math.floor(Number(levelNum) || 1));
                const phase = Math.max(1, Math.min(3, Math.floor(Number(phaseNum) || 1)));
                if (lvl === 10) {
                    return {
                        url: MINIBOSS_LEVEL10_SPRITE_URL || MINIBOSS_SPRITE_URL,
                        sheetClass: 'boss-sprite-sheet--grid9',
                        containerClass: 'special-boss-grid9'
                    };
                }
                if (lvl === 15) {
                    return {
                        url: MINIBOSS_LEVEL15_SPRITE_URL || MINIBOSS_SPRITE_URL,
                        sheetClass: 'boss-sprite-sheet--grid9',
                        containerClass: 'special-boss-grid9'
                    };
                }
                if (lvl === 20) {
                    const phaseSpriteMap = {
                        1: MINIBOSS_LEVEL20_PHASE1_SPRITE_URL,
                        2: MINIBOSS_LEVEL20_PHASE2_SPRITE_URL,
                        3: MINIBOSS_LEVEL20_PHASE3_SPRITE_URL
                    };
                    return {
                        url: phaseSpriteMap[phase] || MINIBOSS_LEVEL20_PHASE1_SPRITE_URL || MINIBOSS_SPRITE_URL,
                        sheetClass: 'boss-sprite-sheet--grid6',
                        containerClass: ''
                    };
                }
                return {
                    url: MINIBOSS_SPRITE_URL,
                    sheetClass: '',
                    containerClass: ''
                };
            }

            function getMiniBossSpriteUrlForLevel(levelNum, phaseNum = 0) {
                const profile = getBossSpriteProfileForLevel(levelNum, phaseNum) || {};
                return profile.url || MINIBOSS_SPRITE_URL;
            }

            function getVisualPhaseForLevel(levelNum = getCurrentLevelNumber()) {
                const lvl = Math.max(1, Number(levelNum) || 1);
                if (lvl >= 11) return 3;
                if (lvl >= 6) return 2;
                return 1;
            }

            function getLevelClearBonusClicks(levelNum) {
                if (isEnduranceMode()) return 0;
                const lvl = Math.max(1, Number(levelNum) || 1);
                const phase = getVisualPhaseForLevel(lvl);
                let base = 0;
                if (lvl >= 16) base = 3;
                else if (phase >= 3) base = 2;
                else if (phase >= 2) base = 1;
                // Mid-late bridge smoothing: extra +1 clicks only for levels 16-19.
                if (lvl >= 16 && lvl <= 19) base += 1;
                const penalty = Math.max(0, Math.floor(Number(runPerkState && runPerkState.levelClearClicksPenalty) || 0));
                return Math.max(0, base - penalty);
            }

            let labBgFrontEl = null;
            let labBgBackEl = null;
            let labBgActivePhase = null;
            let labBgUseFront = true;

            function getPhaseBackgroundStyle(phaseNum) {
                const phase = Math.max(1, Math.min(3, Math.floor(Number(phaseNum) || 1)));
                if (phase === 2) {
                    return "linear-gradient(rgba(20, 8, 20, 0.56), rgba(20, 8, 20, 0.56)), var(--lab-bg-stage2)";
                }
                if (phase === 3) {
                    return "linear-gradient(rgba(26, 8, 8, 0.64), rgba(26, 8, 8, 0.64)), var(--lab-bg-stage3)";
                }
                return "linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), var(--lab-bg-stage1)";
            }

            function ensurePhaseBackgroundLayers() {
                if (labBgFrontEl && labBgBackEl) return;
                const body = document.body;
                if (!body) return;
                let front = document.getElementById('labBgLayerA');
                let back = document.getElementById('labBgLayerB');
                if (!front) {
                    front = document.createElement('div');
                    front.id = 'labBgLayerA';
                    front.className = 'lab-bg-layer show';
                }
                if (!back) {
                    back = document.createElement('div');
                    back.id = 'labBgLayerB';
                    back.className = 'lab-bg-layer';
                }
                if (!front.parentNode) body.prepend(front);
                if (!back.parentNode) body.prepend(back);
                labBgFrontEl = front;
                labBgBackEl = back;
            }

            function setPhaseBackground(phaseNum, immediate = false) {
                ensurePhaseBackgroundLayers();
                if (!labBgFrontEl || !labBgBackEl) return;
                const phase = Math.max(1, Math.min(3, Math.floor(Number(phaseNum) || 1)));
                const nextBg = getPhaseBackgroundStyle(phase);
                if (labBgActivePhase === null || immediate) {
                    labBgFrontEl.style.backgroundImage = nextBg;
                    labBgFrontEl.style.backgroundPosition = 'center center';
                    labBgFrontEl.style.backgroundSize = 'cover';
                    labBgFrontEl.style.backgroundRepeat = 'no-repeat';
                    labBgFrontEl.classList.add('show');
                    labBgBackEl.classList.remove('show');
                    labBgUseFront = true;
                    labBgActivePhase = phase;
                    return;
                }
                if (labBgActivePhase === phase) return;
                const incoming = labBgUseFront ? labBgBackEl : labBgFrontEl;
                const outgoing = labBgUseFront ? labBgFrontEl : labBgBackEl;
                incoming.style.backgroundImage = nextBg;
                incoming.style.backgroundPosition = 'center center';
                incoming.style.backgroundSize = 'cover';
                incoming.style.backgroundRepeat = 'no-repeat';
                incoming.classList.add('show');
                outgoing.classList.remove('show');
                labBgUseFront = !labBgUseFront;
                labBgActivePhase = phase;
            }

            function applyVisualPhase(levelNum = getCurrentLevelNumber()) {
                try {
                    const body = document.body;
                    if (!body) return 1;
                    const phase = getVisualPhaseForLevel(levelNum);
                    body.classList.remove('phase-1', 'phase-2', 'phase-3');
                    body.classList.add('phase-' + phase);
                    body.dataset.visualPhase = String(phase);
                    setPhaseBackground(phase);
                    return phase;
                } catch (e) {
                    return 1;
                }
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
                if (isEnduranceMode()) {
                    base.sizeMixStart = Array.isArray(ENDURANCE_SIZE_MIX_PROFILE.sizeMixStart) ? ENDURANCE_SIZE_MIX_PROFILE.sizeMixStart.slice() : base.sizeMixStart;
                    base.sizeMixEven = Array.isArray(ENDURANCE_SIZE_MIX_PROFILE.sizeMixEven) ? ENDURANCE_SIZE_MIX_PROFILE.sizeMixEven.slice() : base.sizeMixEven;
                    base.sizeMixEnd = Array.isArray(ENDURANCE_SIZE_MIX_PROFILE.sizeMixEnd) ? ENDURANCE_SIZE_MIX_PROFILE.sizeMixEnd.slice() : base.sizeMixEnd;
                    base.sizeMixLevelsToEven = Math.max(1, Math.floor(Number(ENDURANCE_SIZE_MIX_PROFILE.sizeMixLevelsToEven) || base.sizeMixLevelsToEven || 8));
                    base.sizeMixLevelsToEnd = Math.max(base.sizeMixLevelsToEven, Math.floor(Number(ENDURANCE_SIZE_MIX_PROFILE.sizeMixLevelsToEnd) || base.sizeMixLevelsToEnd || 20));
                }
                return base;
            }

            function getCurrentDifficulty() {
                return getDifficultyForLevel(getCurrentLevelNumber());
            }

            // Spawn pacing can differ from displayed level to tune feel.
            // Level 10 resets to level-5 spawn profile, then advances one profile step every 2 levels.
            function getSpawnProfileLevel(levelNum = getCurrentLevelNumber()) {
                const lvl = Math.max(1, Number(levelNum) || 1);
                if (isEnduranceMode()) {
                    // Endless mode starts from level-1 profile and ramps gradually.
                    return Math.max(1, Math.min(10, 1 + Math.floor((lvl - 1) / 3)));
                }
                if (lvl >= 16 && lvl <= 19) return 6;
                if (lvl < 10) return Math.min(10, lvl);
                const remapped = 5 + Math.floor((lvl - 10) / 2);
                return Math.max(1, Math.min(10, remapped));
            }

            function getEnduranceDensityForLevel(levelNum = getCurrentLevelNumber()) {
                const lvl = Math.max(1, Math.floor(Number(levelNum) || 1));
                const start = 0.58;
                const end = 0.62;
                const t = Math.max(0, Math.min(1, (lvl - 1) / 19)); // level 1 -> 0, level 20+ -> 1
                return start + ((end - start) * t);
            }

            function getBlockerSettings(levelNum = getCurrentLevelNumber()) {
                const d = getDifficultyForLevel(levelNum);
                const lvl = Math.max(1, Number(levelNum) || 1);
                const runSpeed = Math.max(1, Number(runPerkState && runPerkState.blockerSpeedFactor) || 1);
                const gremlinSpeed = isTechnoGremlinOverclockActive(levelNum)
                    ? Math.max(1, Number(TECHNO_GREMLIN_POWER_CONFIG.overclockSpeedMult) || 1.55)
                    : 1;
                const speedFactor = Math.max(1, runSpeed * gremlinSpeed);
                // Ease 16-19: slightly slower blocker cycle before final level.
                const lateBridgeTickMult = (lvl >= 16 && lvl <= 19) ? 1.18 : 1;
                return {
                    unlockLevel: Math.max(1, Math.floor(Number(d.blockerUnlockLevel) || 1)),
                    tickMs: Math.max(650, Math.floor(((Number(d.blockerTickMs) || 1500) * lateBridgeTickMult) / speedFactor)),
                    tickJitterMs: Math.max(0, Math.floor(Number(d.blockerTickJitterMs) || 550)),
                    postUserTickMs: Math.max(220, Math.floor((Number(d.blockerPostUserTickMs) || 520) / speedFactor)),
                    userBoostWindowMs: Math.max(250, Math.floor(Number(d.blockerUserBoostWindowMs) || 1300)),
                    thicknessRatio: Math.max(0.004, Math.min(0.04, Number(d.blockerThicknessRatio) || 0.010))
                };
            }

            function nudgeRotatingBlockerAfterUserMove() {
                if (!isRotatingBlockerActive()) return;
                if (isBlockerTemporarilyFrozen() || isBlockerTemporarilyDisabled()) {
                    scheduleRotatingBlockerTick();
                    return;
                }
                const cfg = getBlockerSettings();
                blockerUserBoostUntil = Date.now() + cfg.userBoostWindowMs;
                scheduleRotatingBlockerTick();
            }

            function moveBlockerAfterResolution() {
                if (!isRotatingBlockerActive()) return;
                if (isBlockerTemporarilyFrozen() || isBlockerTemporarilyDisabled()) {
                    try { scheduleRotatingBlockerTick(); } catch (e) { }
                    return;
                }
                try {
                    advanceRotatingBlockerOverTime();
                    syncRotatingBlockerUI();
                } catch (e) { }
                try {
                    const cfg = getBlockerSettings();
                    blockerUserBoostUntil = Date.now() + Math.max(220, Math.floor(cfg.userBoostWindowMs * 0.5));
                    scheduleRotatingBlockerTick();
                } catch (e) { }
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
                if (isEnduranceMode()) return false;
                if (!FEATURE_FLAGS || FEATURE_FLAGS.rotatingBlocker === false) return false;
                if (Date.now() < Number(blockerRetreatUntil || 0)) return false;
                if (isEpicBoss20Level(levelNum)) return false;
                const cfg = getBlockerSettings(levelNum);
                return levelNum >= cfg.unlockLevel;
            }

            function playBlockerRetreatSequence(onDone = null, opts = null) {
                try {
                    const options = opts || {};
                    const preLaunchMs = Math.max(200, Math.floor(Number(options.preLaunchMs) || 1000));
                    const launchMs = Math.max(300, Math.floor(Number(options.launchMs) || 980));
                    const postPauseMs = Math.max(0, Math.floor(Number(options.postPauseMs) || 0));
                    blockerRetreatUntil = Date.now() + preLaunchMs + launchMs + postPauseMs + 420;
                    stopRotatingBlockerTicker();
                    const el = document.getElementById('rotatingBlocker');
                    if (!el) {
                        if (typeof onDone === 'function') {
                            if (postPauseMs > 0) setTimeout(() => { try { onDone(); } catch (e) { } }, postPauseMs);
                            else onDone();
                        }
                        return;
                    }
                    el.classList.add('retreating');
                    setTimeout(() => {
                        try {
                            const emitters = el.querySelectorAll('.blocker-emitter');
                            emitters.forEach((em) => {
                                const midX = Math.round((-62 + (Math.random() * 124))); // vw
                                const midY = Math.round((-18 + (Math.random() * 16)));  // vh
                                const endDir = Math.random() < 0.5 ? -1 : 1;
                                const endX = endDir * Math.round(86 + (Math.random() * 34)); // vw
                                const endY = -Math.round(20 + (Math.random() * 24)); // vh
                                em.style.setProperty('--retreat-mid-x', `${midX}vw`);
                                em.style.setProperty('--retreat-mid-y', `${midY}vh`);
                                em.style.setProperty('--retreat-end-x', `${endX}vw`);
                                em.style.setProperty('--retreat-end-y', `${endY}vh`);
                            });
                        } catch (e) { }
                        el.classList.add('retreat-launch');
                        try { playBlockerMoveSfx(); } catch (e) { }
                        setTimeout(() => { try { playBlockerMoveSfx(); } catch (e) { } }, Math.max(180, Math.floor(launchMs * 0.35)));
                        setTimeout(() => {
                            try { el.remove(); } catch (e) { }
                            try { syncRotatingBlockerUI(); } catch (e) { }
                            if (typeof onDone === 'function') {
                                if (postPauseMs > 0) setTimeout(() => { try { onDone(); } catch (e) { } }, postPauseMs);
                                else onDone();
                            }
                        }, launchMs);
                    }, preLaunchMs);
                } catch (e) {
                    if (typeof onDone === 'function') onDone();
                }
            }

            function getRotatingBlockerSegment() {
                if (!boardEl || !isRotatingBlockerActive()) return null;
                if (isBlockerTemporarilyDisabled()) return null;
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
                if (finalOfferModalOpen) return;
                if (boss20BlockerPaused && isEpicBoss20Level()) return;
                if (isBlockerTemporarilyFrozen() || isBlockerTemporarilyDisabled()) return;
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
                if (finalOfferModalOpen) return;
                const cfg = getBlockerSettings();
                let delay = cfg.tickMs + Math.floor(Math.random() * (cfg.tickJitterMs + 1));
                if (isBlockerTemporarilyDisabled()) {
                    const restoreIn = Math.max(80, Number(runPerkState.blockerDisabledUntil) - Date.now());
                    delay = Math.max(delay, Math.floor(restoreIn + 40));
                }
                if (isBlockerTemporarilyFrozen()) {
                    const thawIn = Math.max(80, Number(runPerkState.blockerFrozenUntil) - Date.now());
                    delay = Math.max(delay, Math.floor(thawIn + 40));
                }
                if (!isBlockerTemporarilyFrozen() && !isBlockerTemporarilyDisabled() && Date.now() < blockerUserBoostUntil) {
                    const fastJitter = Math.max(50, Math.floor(cfg.postUserTickMs * 0.35));
                    const boostedDelay = cfg.postUserTickMs + Math.floor(Math.random() * (fastJitter + 1));
                    delay = Math.min(delay, boostedDelay);
                }
                blockerTickTimer = setTimeout(() => {
                    blockerTickTimer = null;
                    try {
                        if (!document.hidden && isRotatingBlockerActive()) {
                            if (!isBlockerTemporarilyDisabled()) advanceRotatingBlockerOverTime();
                            syncRotatingBlockerUI();
                        }
                    } catch (e) { }
                    scheduleRotatingBlockerTick();
                }, delay);
            }

            function flashRotatingBlocker() {
                if (!boardEl || !isRotatingBlockerActive()) return;
                if (isBlockerTemporarilyDisabled()) return;
                const el = document.getElementById('rotatingBlocker');
                if (!el) return;
                el.classList.remove('blocked-hit');
                void el.offsetWidth;
                el.classList.add('blocked-hit');
                try { playSfx('zap'); } catch (e) { }
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
                if (isBlockerTemporarilyDisabled()) {
                    try { el.remove(); } catch (e) { }
                    scheduleRotatingBlockerTick();
                    return;
                }
                if (!finalOfferModalOpen) scheduleRotatingBlockerTick();
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
                el.classList.toggle('frozen', isBlockerTemporarilyFrozen());
                el.classList.toggle('overclocked', isTechnoGremlinOverclockActive());
                if (!document.body.contains(el)) document.body.appendChild(el);
            }

            function getStormRechargeChainMin(levelNum = getCurrentLevelNumber()) {
                const d = getDifficultyForLevel(levelNum);
                let base = Math.max(1, Math.floor(Number(d.stormRechargeChainMin) || 21));
                try {
                    if (isEpicBoss20Level() && boss20State && boss20State.active) {
                        const phase = Math.max(1, Math.floor(Number(boss20State.phase) || 1));
                        if (phase >= 2) {
                            const pacing = getBossPacingProfile(20, {
                                phase,
                                desperation: phase === 2 && isBoss20Phase2DesperationActive()
                            });
                            base += Math.max(0, Math.floor(Number(pacing && pacing.stormRechargeDelta) || 0));
                        }
                    }
                } catch (e) { }
                base += Math.floor(Number(runPerkState && runPerkState.stormRechargeDelta) || 0);
                if (runPerkState && runPerkState.dirtyReactorFixedRecharge) {
                    base = 18;
                }
                base += Math.max(0, Math.floor(Number(runPerkState && runPerkState.hotwireNextRechargePenalty) || 0));
                base = Math.max(10, Math.min(42, base));
                if ((Number(runPerkState.stormCapacitorCharges) || 0) > 0) return Math.min(base, 16);
                return base;
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
                if (isEnduranceMode() && typeId) {
                    specialState[index] = null;
                    specialMetaState[index] = null;
                    return;
                }
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
                if (isEnduranceMode()) return null;
                const active = getActiveSpecialTypes(levelNum);
                if (!active.length) return null;
                const level = Math.max(1, Number(levelNum) || 1);
                const d = getDifficultyForLevel(level);
                const base = Math.max(0, Math.min(1, Number(d.specialVirusBaseChance) || 0));
                const levelBonus = Math.max(0, Number(d.specialVirusLevelBonus) || 0);
                const maxChance = Math.max(0, Math.min(1, Number(d.specialVirusMaxChance) || 1));
                const perkChanceDelta = Math.max(0, Number(runPerkState && runPerkState.specialVirusChanceDelta) || 0);
                const unlockFloor = active.reduce((min, def) => {
                    const unlock = Math.max(1, Number(def && def.unlockLevel) || 1);
                    return Math.min(min, unlock);
                }, Infinity);
                const growthLevels = Math.max(0, level - (Number.isFinite(unlockFloor) ? unlockFloor : level));
                const chance = Math.min(1, Math.min(maxChance, base + (growthLevels * levelBonus)) + perkChanceDelta);
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
                const spawnCrackStage = (delayMs, cls, ttlMs) => {
                    setTimeout(() => {
                        try {
                            const cell = boardEl.querySelector(`[data-index='${index}']`);
                            if (!cell) return;
                            const r = cell.getBoundingClientRect();
                            const crack = document.createElement('div');
                            crack.className = `shield-crack-fx ${cls}`;
                            crack.style.left = Math.round(r.left + (r.width / 2)) + 'px';
                            crack.style.top = Math.round(r.top + (r.height / 2)) + 'px';
                            crack.style.width = Math.round(r.width * 0.92) + 'px';
                            crack.style.height = Math.round(r.height * 0.92) + 'px';
                            document.body.appendChild(crack);
                            setTimeout(() => { try { crack.remove(); } catch (e) { } }, ttlMs);
                        } catch (e) { }
                    }, delayMs);
                };
                applyFlash();
                try { requestAnimationFrame(applyFlash); } catch (e) { }
                spawnCrackStage(0, 'stage-1', 190);
                spawnCrackStage(58, 'stage-2', 280);
            }

            function playShieldBreakEffect(index) {
                if (!Number.isFinite(index) || !boardEl) return;
                try {
                    const cell = boardEl.querySelector(`[data-index='${index}']`);
                    if (!cell) return;
                    const r = cell.getBoundingClientRect();
                    cell.classList.remove('shield-residue');
                    void cell.offsetWidth;
                    cell.classList.add('shield-residue');
                    setTimeout(() => { try { cell.classList.remove('shield-residue'); } catch (e) { } }, 320);
                    const burst = document.createElement('div');
                    burst.className = 'shield-break-burst';
                    burst.style.left = Math.round(r.left + (r.width / 2)) + 'px';
                    burst.style.top = Math.round(r.top + (r.height / 2)) + 'px';
                    document.body.appendChild(burst);
                    const shardCount = 8;
                    for (let i = 0; i < shardCount; i++) {
                        const shard = document.createElement('div');
                        shard.className = 'shield-shard';
                        const angle = ((Math.PI * 2) * i / shardCount) + ((Math.random() - 0.5) * 0.34);
                        const travel = (14 + (Math.random() * 18));
                        const tx = Math.cos(angle) * travel;
                        const ty = Math.sin(angle) * travel;
                        const rot = Math.round((Math.random() - 0.5) * 220);
                        shard.style.left = Math.round(r.left + (r.width / 2)) + 'px';
                        shard.style.top = Math.round(r.top + (r.height / 2)) + 'px';
                        shard.style.setProperty('--tx', `${tx}px`);
                        shard.style.setProperty('--ty', `${ty}px`);
                        shard.style.setProperty('--rot', `${rot}deg`);
                        shard.style.animationDelay = `${Math.round(Math.random() * 32)}ms`;
                        document.body.appendChild(shard);
                        setTimeout(() => { try { shard.remove(); } catch (e) { } }, 360);
                    }
                    setTimeout(() => { try { burst.remove(); } catch (e) { } }, 430);
                } catch (e) { }
            }

            function playMiniBossBurstEffect(index, strong = false) {
                if (!Number.isFinite(index) || !boardEl) return;
                try {
                    const cell = boardEl.querySelector(`[data-index='${index}']`);
                    if (!cell) return;
                    const r = cell.getBoundingClientRect();
                    const burst = document.createElement('div');
                    burst.className = strong ? 'miniboss-burst miniboss-burst-strong' : 'miniboss-burst miniboss-burst-faint';
                    burst.style.left = Math.round(r.left + (r.width / 2)) + 'px';
                    burst.style.top = Math.round(r.top + (r.height / 2)) + 'px';
                    document.body.appendChild(burst);
                    setTimeout(() => { try { burst.remove(); } catch (e) { } }, strong ? 520 : 380);
                } catch (e) { }
            }

            // Boss-spawned viruses should appear with the same purple burst feel as normal pops.
            // Visual-only: glow + stain pulse, no emitted particles and no gameplay side effects.
            function playVirusSpawnBurstEffect(index, attempt = 0) {
                const idx = Math.floor(Number(index));
                if (!Number.isFinite(idx) || idx < 0 || idx >= (ROWS * COLS) || !boardEl) return;
                const run = () => {
                    try {
                        const cell = boardEl.querySelector(`[data-index='${idx}']`);
                        if (!cell) {
                            if (attempt < 2) setTimeout(() => playVirusSpawnBurstEffect(idx, attempt + 1), 34);
                            return;
                        }
                        const virus = cell.querySelector('.virus');
                        if (!virus) {
                            if (attempt < 2) setTimeout(() => playVirusSpawnBurstEffect(idx, attempt + 1), 34);
                            return;
                        }
                        const r = cell.getBoundingClientRect();
                        const cx = r.left + (r.width / 2);
                        const cy = r.top + (r.height / 2);
                        showPooledGlowAt(cx, cy);
                        let stain = virus.querySelector('.stain');
                        if (!stain) {
                            stain = document.createElement('div');
                            stain.className = 'stain';
                            virus.appendChild(stain);
                        }
                        stain.classList.remove('show');
                        void stain.offsetWidth;
                        stain.classList.add('show');
                    } catch (e) { }
                };
                try { requestAnimationFrame(run); } catch (e) { run(); }
            }

            function getBoardCellCenter(index) {
                if (!boardEl || !Number.isFinite(index)) return null;
                try {
                    const cell = boardEl.querySelector(`[data-index='${index}']`);
                    if (!cell) return null;
                    const r = cell.getBoundingClientRect();
                    return {
                        x: r.left + (r.width * 0.5),
                        y: r.top + (r.height * 0.5)
                    };
                } catch (e) {
                    return null;
                }
            }

            function playBossSummonPulse(index, tone = 'red') {
                const p = getBoardCellCenter(index);
                if (!p) return;
                try {
                    const fx = document.createElement('div');
                    fx.className = 'boss-summon-pulse';
                    if (String(tone || '').toLowerCase() === 'blue') fx.classList.add('is-blue');
                    fx.style.left = Math.round(p.x) + 'px';
                    fx.style.top = Math.round(p.y) + 'px';
                    document.body.appendChild(fx);
                    setTimeout(() => { try { fx.remove(); } catch (e) { } }, 300);
                } catch (e) { }
            }

            function playBossSummonTravelFx(fromIndex, toIndex, tone = 'red') {
                const a = getBoardCellCenter(fromIndex);
                const b = getBoardCellCenter(toIndex);
                if (!a || !b) return;
                try {
                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const dist = Math.max(12, Math.hypot(dx, dy));
                    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                    const thread = document.createElement('div');
                    thread.className = 'boss-summon-thread';
                    if (String(tone || '').toLowerCase() === 'blue') thread.classList.add('is-blue');
                    thread.style.left = Math.round(a.x) + 'px';
                    thread.style.top = Math.round(a.y) + 'px';
                    thread.style.width = Math.round(dist) + 'px';
                    thread.style.transform = `translateY(-50%) rotate(${angle}deg)`;
                    document.body.appendChild(thread);
                    setTimeout(() => { try { thread.remove(); } catch (e) { } }, 260);

                    const orb = document.createElement('div');
                    orb.className = 'boss-summon-orb';
                    if (String(tone || '').toLowerCase() === 'blue') orb.classList.add('is-blue');
                    orb.style.left = Math.round(a.x) + 'px';
                    orb.style.top = Math.round(a.y) + 'px';
                    document.body.appendChild(orb);
                    const arcY = -Math.max(8, Math.min(28, dist * 0.13));
                    if (typeof orb.animate === 'function') {
                        const a1 = orb.animate([
                            { transform: 'translate(-50%, -50%) scale(0.56)', opacity: 0.2, offset: 0 },
                            { transform: `translate(${Math.round(dx * 0.54)}px, ${Math.round((dy * 0.54) + arcY)}px) translate(-50%, -50%) scale(1.12)`, opacity: 0.95, offset: 0.62 },
                            { transform: `translate(${Math.round(dx)}px, ${Math.round(dy)}px) translate(-50%, -50%) scale(0.72)`, opacity: 0.9, offset: 1 }
                        ], {
                            duration: 230,
                            easing: 'cubic-bezier(0.22, 0.78, 0.18, 1)',
                            fill: 'forwards'
                        });
                        a1.onfinish = () => { try { orb.remove(); } catch (e) { } };
                        a1.oncancel = () => { try { orb.remove(); } catch (e) { } };
                    } else {
                        setTimeout(() => { try { orb.remove(); } catch (e) { } }, 240);
                    }
                } catch (e) { }
            }

            function playBossSpawnStamp(index, tone = 'red') {
                const p = getBoardCellCenter(index);
                if (!p) return;
                try {
                    const fx = document.createElement('div');
                    fx.className = 'boss-spawn-stamp';
                    if (String(tone || '').toLowerCase() === 'blue') fx.classList.add('is-blue');
                    fx.style.left = Math.round(p.x) + 'px';
                    fx.style.top = Math.round(p.y) + 'px';
                    document.body.appendChild(fx);
                    setTimeout(() => { try { fx.remove(); } catch (e) { } }, 290);
                } catch (e) { }
            }

            function playProjectionPopEffect(index) {
                if (!Number.isFinite(index) || !boardEl) return;
                try {
                    const cell = boardEl.querySelector(`[data-index='${index}']`);
                    if (!cell) return;
                    const r = cell.getBoundingClientRect();
                    const cx = Math.round(r.left + (r.width / 2));
                    const cy = Math.round(r.top + (r.height / 2));

                    const burst = document.createElement('div');
                    burst.className = 'projection-pop-burst';
                    burst.style.left = cx + 'px';
                    burst.style.top = cy + 'px';
                    document.body.appendChild(burst);
                    setTimeout(() => { try { burst.remove(); } catch (e) { } }, 340);

                    const orbCount = 7;
                    for (let i = 0; i < orbCount; i++) {
                        const orb = document.createElement('div');
                        orb.className = 'projection-pop-orb';
                        const angle = ((Math.PI * 2) * i / orbCount) + ((Math.random() - 0.5) * 0.4);
                        const dist = 12 + (Math.random() * 18);
                        orb.style.left = cx + 'px';
                        orb.style.top = cy + 'px';
                        orb.style.setProperty('--tx', `${Math.round(Math.cos(angle) * dist)}px`);
                        orb.style.setProperty('--ty', `${Math.round(Math.sin(angle) * dist)}px`);
                        orb.style.animationDelay = `${Math.round(Math.random() * 50)}ms`;
                        document.body.appendChild(orb);
                        setTimeout(() => { try { orb.remove(); } catch (e) { } }, 420);
                    }
                } catch (e) { }
            }

            function playBossGooShieldProjectile(fromIndex, toIndex, onArrive = null) {
                if (!boardEl || !Number.isFinite(fromIndex) || !Number.isFinite(toIndex)) {
                    try { if (typeof onArrive === 'function') onArrive(); } catch (e) { }
                    return;
                }
                try {
                    const fromCell = boardEl.querySelector(`[data-index='${fromIndex}']`);
                    const toCell = boardEl.querySelector(`[data-index='${toIndex}']`);
                    if (!fromCell || !toCell) {
                        if (typeof onArrive === 'function') onArrive();
                        return;
                    }
                    const fr = fromCell.getBoundingClientRect();
                    const tr = toCell.getBoundingClientRect();
                    const sx = fr.left + (fr.width * 0.5);
                    const sy = fr.top + (fr.height * 0.5);
                    const tx = tr.left + (tr.width * 0.5);
                    const ty = tr.top + (tr.height * 0.5);
                    const rawDx = tx - sx;
                    const rawDy = ty - sy;
                    const dist = Math.max(1, Math.hypot(rawDx, rawDy));
                    const ux = rawDx / dist;
                    const uy = rawDy / dist;
                    const muzzleDist = Math.max(10, Math.min(24, fr.width * 0.22));
                    const startX = sx + (ux * muzzleDist);
                    const startY = sy + (uy * muzzleDist) - 2;
                    const dx = tx - startX;
                    const dy = ty - startY;
                    const arcY = -Math.max(18, Math.min(72, (Math.abs(dx) * 0.08) + (Math.abs(dy) * 0.1)));
                    const swayX = Math.max(-12, Math.min(12, (Math.random() - 0.5) * 20));
                    const spinA = Math.round(-24 + (Math.random() * 48));
                    const spinB = spinA + Math.round(90 + (Math.random() * 80));
                    const spinC = spinB + Math.round(80 + (Math.random() * 60));
                    try {
                        const muzzle = document.createElement('div');
                        muzzle.className = 'boss-goo-muzzle-fx';
                        muzzle.style.left = Math.round(startX - (ux * 8)) + 'px';
                        muzzle.style.top = Math.round(startY - (uy * 8)) + 'px';
                        muzzle.style.setProperty('--spit-ang', `${Math.round(Math.atan2(uy, ux) * (180 / Math.PI))}deg`);
                        document.body.appendChild(muzzle);
                        setTimeout(() => { try { muzzle.remove(); } catch (e) { } }, 240);
                    } catch (e) { }
                    const fx = document.createElement('div');
                    fx.className = 'boss-goo-spit-fx';
                    fx.style.left = Math.round(startX) + 'px';
                    fx.style.top = Math.round(startY) + 'px';
                    fx.style.setProperty('--goo-rot', `${Math.round(-18 + (Math.random() * 36))}deg`);
                    document.body.appendChild(fx);
                    let finished = false;
                    const finish = () => {
                        if (finished) return;
                        finished = true;
                        try { fx.remove(); } catch (e) { }
                        try {
                            const splat = document.createElement('div');
                            splat.className = 'boss-goo-impact-fx';
                            splat.style.left = Math.round(tx) + 'px';
                            splat.style.top = Math.round(ty) + 'px';
                            document.body.appendChild(splat);
                            setTimeout(() => { try { splat.remove(); } catch (e) { } }, 260);
                        } catch (e) { }
                        try { if (typeof onArrive === 'function') onArrive(); } catch (e) { }
                    };
                    const duration = 450 + Math.round(Math.random() * 120);
                    if (typeof fx.animate === 'function') {
                        const a = fx.animate([
                            { transform: `translate(-50%, -50%) scale(0.38, 0.82) rotate(${spinA}deg)`, opacity: 0.08, offset: 0 },
                            { transform: `translate(${Math.round((ux * 30) + (swayX * 0.15))}px, ${Math.round((uy * 30) - 6)}px) translate(-50%, -50%) scale(1.26, 0.62) rotate(${spinA + 36}deg)`, opacity: 1, offset: 0.18 },
                            { transform: `translate(${Math.round((dx * 0.36) + swayX)}px, ${Math.round((dy * 0.34) + (arcY * 0.86))}px) translate(-50%, -50%) scale(1.08, 0.8) rotate(${spinB}deg)`, opacity: 1, offset: 0.44 },
                            { transform: `translate(${Math.round((dx * 0.74) - (swayX * 0.25))}px, ${Math.round((dy * 0.72) + (arcY * 0.24))}px) translate(-50%, -50%) scale(0.9, 1.14) rotate(${spinC}deg)`, opacity: 0.98, offset: 0.8 },
                            { transform: `translate(${Math.round(dx)}px, ${Math.round(dy)}px) translate(-50%, -50%) scale(0.82, 0.92) rotate(${spinC + 36}deg)`, opacity: 0.95, offset: 1 }
                        ], {
                            duration,
                            easing: 'cubic-bezier(0.22, 0.78, 0.2, 1)',
                            fill: 'forwards'
                        });
                        a.onfinish = finish;
                        a.oncancel = finish;
                    } else {
                        setTimeout(finish, duration);
                    }
                } catch (e) {
                    try { if (typeof onArrive === 'function') onArrive(); } catch (x) { }
                }
            }

            function specialHookArmoredBeforeGrow(ctx) {
                if (!ctx || !Number.isFinite(ctx.index)) return null;
                const meta = ensureSpecialMeta(ctx.index);
                const remaining = Math.max(0, Number(meta && meta.shieldHitsRemaining) || 0);
                if (remaining <= 0) return null;
                const permanentPiercer = !!(runPerkState && runPerkState.armorPiercerPermanent);
                if (permanentPiercer || (Number(runPerkState.armorPiercerHits) || 0) > 0) {
                    if (!permanentPiercer) {
                        runPerkState.armorPiercerHits = Math.max(0, Number(runPerkState.armorPiercerHits) - 1);
                    }
                    playShieldBreakEffect(ctx.index);
                    try { playSfx('zap'); } catch (e) { }
                    clearSpecialForCell(ctx.index);
                    incrementAchievementStat('runArmoredShellsBroken', 1, 'run');
                    incrementAchievementStat('armoredShellsLifetime', 1, 'lifetime');
                    return null;
                }
                meta.shieldHitsRemaining = remaining - 1;
                playShieldBlockFlash(ctx.index);
                try { playSfx('grow'); } catch (e) { }
                if (meta.shieldHitsRemaining <= 0) {
                    playShieldBreakEffect(ctx.index);
                    try { playSfx('zap'); } catch (e) { }
                    clearSpecialForCell(ctx.index);
                    incrementAchievementStat('runArmoredShellsBroken', 1, 'run');
                    incrementAchievementStat('armoredShellsLifetime', 1, 'lifetime');
                }
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

            function isEpicBoss20Level(levelNum = getCurrentLevelNumber()) {
                const lvl = Math.max(1, Number(levelNum) || 1);
                return !!(FEATURE_FLAGS && FEATURE_FLAGS.epicBoss20 !== false && lvl === 20);
            }

            function resetBoss20State() {
                if (boss20PhaseTimer) {
                    clearTimeout(boss20PhaseTimer);
                    boss20PhaseTimer = null;
                }
                stopBoss20VoiceTimer();
                if (boss20FinalWindowTimer) {
                    clearTimeout(boss20FinalWindowTimer);
                    boss20FinalWindowTimer = null;
                }
                if (boss20Phase3TransitionTimer) {
                    clearTimeout(boss20Phase3TransitionTimer);
                    boss20Phase3TransitionTimer = null;
                }
                try {
                    const fxA = document.querySelector('.boss20-phase-shift');
                    if (fxA) fxA.remove();
                } catch (e) { }
                try {
                    const fxB = document.querySelector('.boss20-rescue');
                    if (fxB) fxB.remove();
                } catch (e) { }
                try {
                    const fxC = document.querySelector('.boss20-final-charge');
                    if (fxC) fxC.remove();
                } catch (e) { }
                try {
                    const fxD = document.querySelectorAll('.boss20-hero-mark');
                    if (fxD && fxD.length) {
                        fxD.forEach((el) => {
                            try { el.remove(); } catch (e2) { }
                        });
                    }
                } catch (e) { }
                clearBoss20FinalFormOverlay();
                clearBoss20FinalShotReticle();
                boss20State = createDefaultBoss20State();
                boss20LaughLastAt = 0;
                boss20ComboCutoffUntil = 0;
                if (boss20ComboCutoffResumeTimer) {
                    clearTimeout(boss20ComboCutoffResumeTimer);
                    boss20ComboCutoffResumeTimer = null;
                }
                try {
                    if (boardEl && boardEl.classList) {
                        boardEl.classList.remove('boss20-combo-cutoff-flash', 'boss20-combo-cutoff-shake');
                    }
                } catch (e) { }
                boss20BlockerHidden = false;
                boss20BlockerPaused = false;
                return boss20State;
            }

            function getBoss20ScaledHp(baseHp) {
                const raw = Math.max(1, Math.floor(Number(baseHp) || 1));
                const scale = Math.max(0.4, Math.min(1, Number(runPerkState && runPerkState.finalBossHpScale) || 1));
                return Math.max(1, Math.round(raw * scale));
            }

            function bootstrapBoss20PhaseOne() {
                const bosses = getBossIndicesForLevel(20);
                if (!bosses.length) {
                    resetBoss20State();
                    return boss20State;
                }
                const idx = bosses[0];
                const meta = specialMetaState[idx] || {};
                const hp = Math.max(1, Math.floor(Number(meta.hp) || Number(meta.maxHp) || getBoss20ScaledHp(EPIC_BOSS20_PHASE1_HP)));
                const maxHp = Math.max(hp, Math.floor(Number(meta.maxHp) || hp));
                meta.phase = 1;
                meta.hp = hp;
                meta.maxHp = maxHp;
                specialMetaState[idx] = meta;
                boss20State = {
                    active: true,
                    phase: 1,
                    hp,
                    maxHp,
                    actionCadenceMs: EPIC_BOSS20_PHASE1_ACTION_MS,
                    actionCounter: 0,
                    rescueUsed: false,
                    inCinematic: false,
                    inFinalWindow: false,
                    weakPointUntil: 0,
                    finalWindowUntil: 0,
                    finalChargeUntil: 0,
                    heroMarkUntil: 0,
                    heroMarkCell: idx,
                    nextHeroMarkAt: 0,
                    heroStallUntil: 0,
                    rescueShieldUntil: 0,
                    phase3Started: false,
                    phase2DesperationActive: false,
                    phase2DesperationStartedAt: 0,
                    phase2RescueQueued: false,
                    phase2LastRegenAt: 0
                };
                return boss20State;
            }

            function isMiniBossLevel(levelNum = getCurrentLevelNumber()) {
                if (isEnduranceMode()) return false;
                const lvl = Math.max(1, Number(levelNum) || 1);
                return !!(FEATURE_FLAGS && FEATURE_FLAGS.miniBoss !== false && lvl >= 5 && (lvl % 5) === 0);
            }

            function getMiniBossCountForLevel(levelNum = getCurrentLevelNumber()) {
                return 1;
            }

            function getMiniBossHpForLevel(levelNum = getCurrentLevelNumber()) {
                const lvl = Math.max(1, Number(levelNum) || 1);
                if (isEpicBoss20Level(lvl)) {
                    return getBoss20ScaledHp(EPIC_BOSS20_PHASE1_HP);
                }
                const tier = Math.max(1, Math.floor(lvl / 5));
                let hp = 5 + tier;
                if (lvl >= Math.max(1, Math.floor(Number(FINAL_OFFER_CONFIG && FINAL_OFFER_CONFIG.level) || 20))) {
                    const scale = Math.max(0.4, Math.min(1, Number(runPerkState && runPerkState.finalBossHpScale) || 1));
                    hp = Math.max(1, Math.round(hp * scale));
                }
                return hp;
            }

            function isBossGooShieldEnabled() {
                return !!(FEATURE_FLAGS && FEATURE_FLAGS.bossGooShields !== false && BOSS_GOO_SHIELD_CONFIG && BOSS_GOO_SHIELD_CONFIG.enabled !== false);
            }

            function isBossGooShieldLevel(levelNum = getCurrentLevelNumber()) {
                const lvl = Math.max(1, Math.floor(Number(levelNum) || 1));
                return isBossGooShieldEnabled() && lvl === Math.max(1, Math.floor(Number(BOSS_GOO_SHIELD_CONFIG.level) || 10));
            }

            function getBossIndicesForLevel(levelNum = getCurrentLevelNumber()) {
                const lvl = Math.max(1, Math.floor(Number(levelNum) || 1));
                const out = [];
                for (let i = 0; i < specialState.length; i++) {
                    if (specialState[i] !== 'boss') continue;
                    const meta = specialMetaState[i] || {};
                    if (meta.isProjection) continue;
                    const bossLvl = Math.max(1, Math.floor(Number(meta.bossLevel) || lvl));
                    const hp = Math.max(0, Number(meta.hp) || 0);
                    if (bossLvl === lvl && hp > 0) out.push(i);
                }
                return out;
            }

            function hasActiveBossForLevel(levelNum = getCurrentLevelNumber()) {
                return getBossIndicesForLevel(levelNum).length > 0;
            }

            function clamp01(v) {
                return Math.max(0, Math.min(1, Number(v) || 0));
            }

            function getBossPhaseContext(levelNum = getCurrentLevelNumber(), originIndex = null) {
                const lvl = Math.max(1, Math.floor(Number(levelNum) || 1));
                let phase = 1;
                let desperation = false;
                if (lvl === 20) {
                    phase = Math.max(1, Math.floor(Number(boss20State && boss20State.phase) || 1));
                    if (Number.isFinite(originIndex)) {
                        const meta = specialMetaState[Math.floor(Number(originIndex))] || {};
                        if (Number.isFinite(Number(meta.phase))) {
                            phase = Math.max(1, Math.floor(Number(meta.phase) || 1));
                        }
                    }
                    desperation = (phase === 2) && isBoss20Phase2DesperationActive();
                }
                return { phase, desperation };
            }

            function getBossPacingProfile(levelNum = getCurrentLevelNumber(), context = null) {
                const lvl = Math.max(1, Math.floor(Number(levelNum) || 1));
                const ctx = context || getBossPhaseContext(lvl, null);
                const profile = Object.assign({}, BOSS_PACING_PROFILE.default || {});
                const levelCfg = BOSS_PACING_PROFILE[lvl];
                if (!levelCfg) return profile;
                if (lvl === 20 && levelCfg && typeof levelCfg === 'object') {
                    let phaseCfg = null;
                    if (Math.max(1, Math.floor(Number(ctx.phase) || 1)) >= 3) {
                        phaseCfg = levelCfg.phase3;
                    } else if (Math.max(1, Math.floor(Number(ctx.phase) || 1)) === 2) {
                        phaseCfg = ctx.desperation ? levelCfg.phase2Desperation : levelCfg.phase2;
                    } else {
                        phaseCfg = levelCfg.phase1;
                    }
                    if (phaseCfg && typeof phaseCfg === 'object') Object.assign(profile, phaseCfg);
                    return profile;
                }
                if (typeof levelCfg === 'object') Object.assign(profile, levelCfg);
                return profile;
            }

            function sampleSizeFromWeights(weights, fallback = 2) {
                const fb = Math.max(0, Math.min(MAX_SIZE, Math.floor(Number(fallback) || 0)));
                if (!Array.isArray(weights) || weights.length < 4) return fb;
                const normalized = [0, 1, 2, 3].map((i) => Math.max(0, Number(weights[i]) || 0));
                const total = normalized.reduce((acc, n) => acc + n, 0);
                if (total <= 0) return fb;
                let roll = Math.random() * total;
                for (let i = 0; i < 4; i++) {
                    roll -= normalized[i];
                    if (roll <= 0) return i;
                }
                return fb;
            }

            function ensureBossBoardFuel(levelNum = getCurrentLevelNumber(), originIndex = null, opts = null) {
                const options = opts || {};
                const lvl = Math.max(1, Math.floor(Number(levelNum) || 1));
                if (!isMiniBossLevel(lvl)) return 0;
                if (!options.allowWhenBlocked && isBlockingPopupOpen()) return 0;
                const phaseContext = options.phaseContext || getBossPhaseContext(lvl, originIndex);
                const pacing = getBossPacingProfile(lvl, phaseContext);
                const targetMin = Math.max(0, Math.floor(Number(options.minNonBossViruses) || Number(pacing.minNonBossViruses) || 0));
                if (targetMin <= 0) return 0;
                const cooldownMs = Math.max(0, Math.floor(Number(options.cooldownMs) || Number(pacing.fuelCooldownMs) || 0));
                const now = Date.now();
                if (!options.force && cooldownMs > 0) {
                    const prev = Math.max(0, Number(bossFuelLastAtByLevel[lvl]) || 0);
                    if ((now - prev) < cooldownMs) return 0;
                }
                const empties = [];
                let nonBossOccupied = 0;
                for (let i = 0; i < state.length; i++) {
                    if (isBoss20FinalFormCell(i)) continue;
                    if (specialState[i] === 'boss') continue;
                    if (state[i] === null && !hasBiofilmAt(i)) empties.push(i);
                    else nonBossOccupied++;
                }
                if (nonBossOccupied >= targetMin || !empties.length) return 0;
                const addCount = Math.max(0, Math.min(empties.length, targetMin - nonBossOccupied));
                if (addCount <= 0) return 0;
                const sizeWeights = Array.isArray(options.fuelSpawnSizeWeights) ? options.fuelSpawnSizeWeights : (Array.isArray(pacing.fuelSpawnSizeWeights) ? pacing.fuelSpawnSizeWeights : pacing.spawnSizeWeights);
                const armoredChance = clamp01(Number.isFinite(Number(options.fuelArmoredChance)) ? Number(options.fuelArmoredChance) : Number(pacing.fuelArmoredChance));
                shuffle(empties);
                let spawned = 0;
                const spawnedIndices = [];
                for (let i = 0; i < addCount; i++) {
                    const idx = empties[i];
                    if (!Number.isFinite(idx) || idx < 0 || idx >= state.length) continue;
                    if (isBoss20FinalFormCell(idx)) continue;
                    if (state[idx] !== null || specialState[idx] === 'boss' || hasBiofilmAt(idx)) continue;
                    state[idx] = sampleSizeFromWeights(sizeWeights, 2);
                    if (Math.random() < armoredChance) setSpecialForCell(idx, 'armored');
                    else clearSpecialForCell(idx);
                    spawned++;
                    spawnedIndices.push(idx);
                }
                if (spawned > 0) {
                    bossFuelLastAtByLevel[lvl] = now;
                    scheduleRender();
                    for (let i = 0; i < spawnedIndices.length; i++) {
                        playVirusSpawnBurstEffect(spawnedIndices[i]);
                    }
                }
                return spawned;
            }

            function isTechnoGremlinPowerLevel(levelNum = getCurrentLevelNumber()) {
                const lvl = Math.max(1, Math.floor(Number(levelNum) || 1));
                return !!(TECHNO_GREMLIN_POWER_CONFIG && TECHNO_GREMLIN_POWER_CONFIG.enabled !== false && lvl === Math.max(1, Math.floor(Number(TECHNO_GREMLIN_POWER_CONFIG.level) || 15)));
            }

            function stopTechnoGremlinPowerTimer() {
                if (!technoGremlinPowerTimer) return;
                clearTimeout(technoGremlinPowerTimer);
                technoGremlinPowerTimer = null;
            }

            function clearTechnoGremlinExpireTimer(kind) {
                if (kind === 'jam') {
                    if (!technoGremlinJamExpireTimer) return;
                    clearTimeout(technoGremlinJamExpireTimer);
                    technoGremlinJamExpireTimer = null;
                    return;
                }
                if (kind === 'overclock') {
                    if (!technoGremlinOverclockExpireTimer) return;
                    clearTimeout(technoGremlinOverclockExpireTimer);
                    technoGremlinOverclockExpireTimer = null;
                }
            }

            function scheduleTechnoGremlinExpire(kind) {
                const now = Date.now();
                if (kind === 'jam') {
                    clearTechnoGremlinExpireTimer('jam');
                    const delay = Math.max(40, Number(technoGremlinJamUntil) - now);
                    technoGremlinJamExpireTimer = setTimeout(() => {
                        technoGremlinJamExpireTimer = null;
                        if (Date.now() < Number(technoGremlinJamUntil) - 20) {
                            scheduleTechnoGremlinExpire('jam');
                            return;
                        }
                        technoGremlinJamUntil = 0;
                        try { updateHUD(); } catch (e) { }
                        ensureTechnoGremlinPowerTimer();
                    }, delay);
                    return;
                }
                if (kind === 'overclock') {
                    clearTechnoGremlinExpireTimer('overclock');
                    const delay = Math.max(40, Number(technoGremlinOverclockUntil) - now);
                    technoGremlinOverclockExpireTimer = setTimeout(() => {
                        technoGremlinOverclockExpireTimer = null;
                        if (Date.now() < Number(technoGremlinOverclockUntil) - 20) {
                            scheduleTechnoGremlinExpire('overclock');
                            return;
                        }
                        technoGremlinOverclockUntil = 0;
                        try { syncRotatingBlockerUI(); } catch (e) { }
                        try { scheduleRotatingBlockerTick(); } catch (e) { }
                        try { updateHUD(); } catch (e) { }
                        ensureTechnoGremlinPowerTimer();
                    }, delay);
                }
            }

            function clearTechnoGremlinPowers(stopTimer = true) {
                technoGremlinJamUntil = 0;
                technoGremlinOverclockUntil = 0;
                clearTechnoGremlinExpireTimer('jam');
                clearTechnoGremlinExpireTimer('overclock');
                if (stopTimer) stopTechnoGremlinPowerTimer();
                try { syncRotatingBlockerUI(); } catch (e) { }
                try { updateHUD(); } catch (e) { }
            }

            function hasActiveTechnoGremlinBoss(levelNum = getCurrentLevelNumber()) {
                if (!isTechnoGremlinPowerLevel(levelNum)) return false;
                const target = Math.max(1, Math.floor(Number(TECHNO_GREMLIN_POWER_CONFIG.level) || 15));
                return hasActiveBossForLevel(target);
            }

            function isTechnoGremlinJamActive(levelNum = getCurrentLevelNumber()) {
                if (!isTechnoGremlinPowerLevel(levelNum)) return false;
                return Date.now() < Number(technoGremlinJamUntil);
            }

            function isTechnoGremlinOverclockActive(levelNum = getCurrentLevelNumber()) {
                if (!isTechnoGremlinPowerLevel(levelNum)) return false;
                return Date.now() < Number(technoGremlinOverclockUntil);
            }

            function activateTechnoGremlinPower(kind = 'jam') {
                if (!hasActiveTechnoGremlinBoss()) return null;
                const now = Date.now();
                if (kind === 'jam') {
                    const minMs = Math.max(1200, Math.floor(Number(TECHNO_GREMLIN_POWER_CONFIG.jamDurationMinMs) || 6200));
                    const maxMs = Math.max(minMs, Math.floor(Number(TECHNO_GREMLIN_POWER_CONFIG.jamDurationMaxMs) || 8200));
                    const dur = minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
                    technoGremlinJamUntil = Math.max(Number(technoGremlinJamUntil) || 0, now + dur);
                    scheduleTechnoGremlinExpire('jam');
                    try { setStormArmed(false); } catch (e) { }
                    try { playSfx('techno_jammer'); } catch (e) { }
                    try { updateHUD(); } catch (e) { }
                    return 'jam';
                }
                if (kind === 'overclock') {
                    const minMs = Math.max(1200, Math.floor(Number(TECHNO_GREMLIN_POWER_CONFIG.overclockDurationMinMs) || 3800));
                    const maxMs = Math.max(minMs, Math.floor(Number(TECHNO_GREMLIN_POWER_CONFIG.overclockDurationMaxMs) || 5600));
                    const dur = minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
                    technoGremlinOverclockUntil = Math.max(Number(technoGremlinOverclockUntil) || 0, now + dur);
                    scheduleTechnoGremlinExpire('overclock');
                    try { playSfx('blocker_move_1'); } catch (e) { }
                    try { syncRotatingBlockerUI(); } catch (e) { }
                    try { scheduleRotatingBlockerTick(); } catch (e) { }
                    try { updateHUD(); } catch (e) { }
                    return 'overclock';
                }
                return null;
            }

            function triggerTechnoGremlinPower(reason = 'timer') {
                if (!hasActiveTechnoGremlinBoss()) return null;
                if (isBlockingPopupOpen()) return null;
                const jamActive = isTechnoGremlinJamActive();
                const overclockActive = isTechnoGremlinOverclockActive();
                let choice = null;
                if (jamActive && overclockActive) return null;
                if (jamActive) choice = 'overclock';
                else if (overclockActive) choice = 'jam';
                else choice = Math.random() < 0.58 ? 'jam' : 'overclock';
                const result = activateTechnoGremlinPower(choice);
                if (result) {
                    const lvl = Math.max(1, Math.floor(Number(TECHNO_GREMLIN_POWER_CONFIG.level) || 15));
                    const bosses = getBossIndicesForLevel(lvl);
                    if (bosses.length) ensureBossBoardFuel(lvl, bosses[0]);
                }
                return result;
            }

            function ensureTechnoGremlinPowerTimer() {
                if (!hasActiveTechnoGremlinBoss()) {
                    stopTechnoGremlinPowerTimer();
                    return;
                }
                if (technoGremlinPowerTimer) return;
                if (isBlockingPopupOpen()) {
                    technoGremlinPowerTimer = setTimeout(() => {
                        technoGremlinPowerTimer = null;
                        ensureTechnoGremlinPowerTimer();
                    }, 420);
                    return;
                }
                const minMs = Math.max(650, Math.floor(Number(TECHNO_GREMLIN_POWER_CONFIG.powerTickMinMs) || 3800));
                const maxMs = Math.max(minMs, Math.floor(Number(TECHNO_GREMLIN_POWER_CONFIG.powerTickMaxMs) || 6200));
                const delay = minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
                const sourceBoardGeneration = boardGeneration;
                technoGremlinPowerTimer = setTimeout(() => {
                    technoGremlinPowerTimer = null;
                    if (sourceBoardGeneration !== boardGeneration) {
                        ensureTechnoGremlinPowerTimer();
                        return;
                    }
                    if (hasActiveTechnoGremlinBoss()) {
                        triggerTechnoGremlinPower('timer');
                    }
                    ensureTechnoGremlinPowerTimer();
                }, delay);
            }

            function stopBoss20PhaseTimer() {
                if (!boss20PhaseTimer) return;
                clearTimeout(boss20PhaseTimer);
                boss20PhaseTimer = null;
            }

            function stopBoss20VoiceTimer() {
                if (!boss20VoiceTimer) return;
                clearTimeout(boss20VoiceTimer);
                boss20VoiceTimer = null;
            }

            function shouldRunBoss20VoiceTimer() {
                if (!isEpicBoss20Level()) return false;
                if (!boss20State || !boss20State.active) return false;
                if (!boss20State.rescueUsed) return false;
                if (!hasActiveBoss20Combat()) return false;
                if (boss20State.inCinematic) return false;
                if (isBlockingPopupOpen() || finalOfferModalOpen) return false;
                return true;
            }

            function ensureBoss20VoiceTimer() {
                if (!shouldRunBoss20VoiceTimer()) {
                    stopBoss20VoiceTimer();
                    return;
                }
                if (boss20VoiceTimer) return;
                const minMs = 2400;
                const maxMs = 4200;
                const delay = minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
                const sourceBoardGeneration = boardGeneration;
                boss20VoiceTimer = setTimeout(() => {
                    boss20VoiceTimer = null;
                    if (sourceBoardGeneration !== boardGeneration) {
                        ensureBoss20VoiceTimer();
                        return;
                    }
                    if (shouldRunBoss20VoiceTimer()) {
                        const bossSfxKeys = ['evil1', 'evil2', 'evil3', 'evil4', 'evil5', 'evil6'];
                        const pick = bossSfxKeys[Math.floor(Math.random() * bossSfxKeys.length)] || 'evil1';
                        try { playSfx(pick); } catch (e) { }
                    }
                    ensureBoss20VoiceTimer();
                }, delay);
            }

            function hasActiveBoss20Combat() {
                if (!isEpicBoss20Level()) return false;
                if (!boss20State || !boss20State.active) return false;
                if (Number(boss20State.phase) < 1) return false;
                if (boss20State.finalShotActive) return false;
                if (boss20State.inCinematic) return false;
                return hasActiveBossForLevel(20);
            }

            function playBoss20LaughThrottled(minIntervalMs = 2600) {
                if (!isEpicBoss20Level() || !boss20State) return false;
                const phase = Math.max(1, Math.floor(Number(boss20State.phase) || 1));
                if (phase > 2) return false;
                if (boss20State.rescueUsed) return false;
                const now = Date.now();
                const minMs = Math.max(300, Math.floor(Number(minIntervalMs) || 2600));
                if ((now - Number(boss20LaughLastAt || 0)) < minMs) return false;
                boss20LaughLastAt = now;
                try { playSfx('miniboss_laugh'); } catch (e) { }
                return true;
            }

            function maybeApplyBoss20Phase3Regen(originIndex) {
                if (!EPIC_BOSS20_PHASE3_REGEN_ENABLED) return 0;
                if (!isEpicBoss20Level() || !boss20State || !boss20State.active) return 0;
                const phaseNow = Math.max(1, Math.floor(Number(boss20State.phase) || 1));
                const inBigForm = !!boss20State.finalFormActive;
                if (phaseNow < 3 && !inBigForm) return 0;
                if (boss20State.inCinematic || boss20State.inFinalWindow) return 0;
                if (boss20State.finalShotActive || boss20State.finalShotTriggered || boss20State.finalShotRelease) return 0;
                const idx = Math.floor(Number(originIndex));
                if (!Number.isFinite(idx) || idx < 0 || idx >= state.length) return 0;
                if (state[idx] === null || specialState[idx] !== 'boss') return 0;

                const now = Date.now();
                const minMs = Math.max(400, Math.floor(Number(EPIC_BOSS20_PHASE3_REGEN_MIN_MS) || 2600));
                if ((now - Number(boss20State.phase3LastRegenAt || 0)) < minMs) return 0;
                if (Math.random() >= Math.max(0, Math.min(1, Number(EPIC_BOSS20_PHASE3_REGEN_CHANCE) || 0.55))) return 0;

                const meta = ensureSpecialMeta(idx) || {};
                const hpNow = Math.max(0, Number(meta.hp) || Number(boss20State.hp) || 0);
                const maxHp = Math.max(1, Number(meta.maxHp) || Number(boss20State.maxHp) || 1);
                if (hpNow >= maxHp) return 0;

                const amt = Math.max(1, Math.floor(Number(EPIC_BOSS20_PHASE3_REGEN_AMOUNT) || 1));
                const nextHp = Math.max(0, Math.min(maxHp, hpNow + amt));
                if (nextHp <= hpNow) return 0;

                meta.hp = nextHp;
                meta.maxHp = maxHp;
                specialMetaState[idx] = meta;
                boss20State.hp = nextHp;
                boss20State.maxHp = maxHp;
                boss20State.phase3LastRegenAt = now;
                setMiniBossStateFromMeta(idx, meta);
                try { showBoss20HpGainFx(idx, nextHp - hpNow); } catch (e) { }
                try { playSfx('fill'); } catch (e) { }
                try { playBossSummonPulse(idx, 'blue'); } catch (e) { }
                scheduleRender();
                return (nextHp - hpNow);
            }

            function maybeApplyBoss20Phase3ClickDrain(originIndex) {
                if (!isEpicBoss20Level() || !boss20State || !boss20State.active) return 0;
                const phaseNow = Math.max(1, Math.floor(Number(boss20State.phase) || 1));
                const inBigForm = !!boss20State.finalFormActive;
                if (phaseNow < 3 && !inBigForm) return 0;
                if (boss20State.inCinematic || boss20State.inFinalWindow) return 0;
                if (boss20State.finalShotActive || boss20State.finalShotTriggered || boss20State.finalShotRelease) return 0;
                const pacing = getBossPacingProfile(20, { phase: Math.max(3, phaseNow) });
                const chance = Math.max(0, Math.min(1, Number(pacing && pacing.clickDrainChance) || 0));
                if (chance <= 0) return 0;
                const minClicks = Math.max(1, Math.floor(Number(pacing && pacing.clickDrainMinClicks) || 3));
                const amount = Math.max(1, Math.floor(Number(pacing && pacing.clickDrainAmount) || 1));
                if ((Number(clicksLeft) || 0) < minClicks) return 0;
                const now = Date.now();
                const cooldownMs = Math.max(800, Math.floor(Number(pacing && pacing.clickDrainCooldownMs) || 3200));
                if ((now - Number(boss20State.phase3LastClickDrainAt || 0)) < cooldownMs) return 0;
                if (Math.random() >= chance) return 0;
                const idx = Math.floor(Number(originIndex));
                if (!Number.isFinite(idx) || idx < 0 || idx >= state.length) return 0;
                const before = Math.max(0, Math.floor(Number(clicksLeft) || 0));
                const next = Math.max(0, before - amount);
                if (next >= before) return 0;
                clicksLeft = next;
                boss20State.phase3LastClickDrainAt = now;
                try { playSfx('grow'); } catch (e) { }
                try { playBossSummonPulse(idx, 'blue'); } catch (e) { }
                try { updateHUD(); } catch (e) { }
                return before - next;
            }

            function showBoss20HpGainFx(index, amount = 0) {
                const idx = Math.floor(Number(index));
                const gain = Math.max(1, Math.floor(Number(amount) || 0));
                if (!Number.isFinite(idx) || idx < 0 || idx >= state.length || gain <= 0) return;
                if (!boardEl || !boardEl.querySelector) return;
                const cell = boardEl.querySelector(`[data-index='${idx}']`);
                if (!cell) return;
                const r = cell.getBoundingClientRect();
                const fx = document.createElement('div');
                fx.className = 'boss20-hp-gain-fx';
                fx.textContent = `+${gain} HP`;
                fx.style.left = Math.round(r.left + (r.width * 0.5)) + 'px';
                fx.style.top = Math.round(r.top + (r.height * 0.34)) + 'px';
                document.body.appendChild(fx);
                setTimeout(() => {
                    try { fx.remove(); } catch (e) { }
                }, 760);
            }

            function isBoss20WeakPointActive() {
                if (!isEpicBoss20Level()) return false;
                return Date.now() < Number(boss20State && boss20State.weakPointUntil);
            }

            function isBoss20FinalWindowActive() {
                if (!isEpicBoss20Level()) return false;
                if (!boss20State || !boss20State.inFinalWindow) return false;
                return Date.now() < Number(boss20State.finalWindowUntil);
            }

            function isBoss20Phase2DesperationActive() {
                if (!isEpicBoss20Level()) return false;
                if (!boss20State || !boss20State.active) return false;
                if (Math.max(1, Math.floor(Number(boss20State.phase) || 1)) !== 2) return false;
                if (boss20State.rescueUsed) return false;
                return !!boss20State.phase2DesperationActive;
            }

            function getBoss20Phase2DesperationRamp() {
                if (!isBoss20Phase2DesperationActive()) return 0;
                const startAt = Math.max(0, Number(boss20State.phase2DesperationStartedAt) || 0);
                if (startAt <= 0) return 0;
                const elapsed = Math.max(0, Date.now() - startAt);
                const rampMs = Math.max(2000, Math.floor(Number(EPIC_BOSS20_PHASE2_DESPERATION_RAMP_MS) || 9000));
                return Math.max(0, Math.min(1, elapsed / rampMs));
            }

            function sampleBoss20Phase2Size(levelOverride = null, completedOverride = null) {
                if (!Array.isArray(EPIC_BOSS20_PHASE2_REPOP_SIZE_MIX) || !EPIC_BOSS20_PHASE2_REPOP_SIZE_MIX.length) {
                    return sampleSizeRandom(levelOverride, completedOverride);
                }
                const mix = EPIC_BOSS20_PHASE2_REPOP_SIZE_MIX;
                const total = Math.max(0.0001, mix.reduce((acc, n) => acc + Math.max(0, Number(n) || 0), 0));
                let roll = Math.random() * total;
                for (let i = 0; i < 4; i++) {
                    roll -= Math.max(0, Number(mix[i]) || 0);
                    if (roll <= 0) return i;
                }
                return 3;
            }

            function isBoardCompletelyFilled() {
                for (let i = 0; i < state.length; i++) {
                    if (state[i] === null) return false;
                }
                return true;
            }

            function maybeTriggerBoss20Phase2RescueByClicks() {
                if (!isBoss20Phase2DesperationActive()) return false;
                if (boss20State.inCinematic || boss20State.rescueUsed) return false;
                const clickThreshold = Math.max(0, Number(EPIC_BOSS20_PHASE2_RESCUE_CLICK_THRESHOLD) || 2);
                const lowClicks = (Number(clicksLeft) || 0) <= clickThreshold;
                const fullBoard = isBoardCompletelyFilled();
                if (!lowClicks && !fullBoard) return false;
                const bosses = getBossIndicesForLevel(20);
                if (!bosses.length) return false;
                const idx = bosses[0];
                const meta = ensureSpecialMeta(idx) || {};
                if (!meta.isBoss || meta.isProjection) return false;
                meta.phase = 2;
                specialMetaState[idx] = meta;
                if (fullBoard && !lowClicks) {
                    if (boss20State.phase2DrainInProgress) return true;
                    if (inputLocked || stormResolving || (typeof particlesActive === 'function' && particlesActive())) {
                        boss20State.phase2RescueQueued = true;
                        return false;
                    }
                    boss20State.phase2RescueQueued = false;
                    boss20State.phase2DrainInProgress = true;
                    inputLocked = true;
                    try { stopBoss20PhaseTimer(); } catch (e) { }
                    try { setBoss20BoardFreeze(true); } catch (e) { }
                    const seqGen = boardGeneration;
                    playBoss20NanoBotDrainSequence(idx, 0).then(() => {
                        boss20State.phase2DrainInProgress = false;
                        if (seqGen !== boardGeneration || !isEpicBoss20Level()) {
                            try { setBoss20BoardFreeze(false); } catch (e) { }
                            inputLocked = false;
                            return;
                        }
                        setTimeout(() => {
                            if (seqGen !== boardGeneration || !isEpicBoss20Level()) {
                                try { setBoss20BoardFreeze(false); } catch (e) { }
                                inputLocked = false;
                                return;
                            }
                            try { setBoss20BoardFreeze(false); } catch (e) { }
                            const m = ensureSpecialMeta(idx) || {};
                            const started = !!triggerBoss20RescueSequence(idx, m);
                            if (!started) inputLocked = false;
                        }, 2000);
                    }).catch(() => {
                        boss20State.phase2DrainInProgress = false;
                        try { setBoss20BoardFreeze(false); } catch (e) { }
                        inputLocked = false;
                    });
                    return true;
                }
                if (inputLocked) {
                    boss20State.phase2RescueQueued = true;
                    return false;
                }
                boss20State.phase2RescueQueued = false;
                return !!triggerBoss20RescueSequence(idx, meta);
            }

            function enterBoss20Phase2Desperation(index, meta) {
                if (!isEpicBoss20Level()) return false;
                if (!meta || !meta.isBoss || meta.isProjection) return false;
                if ((Number(meta.phase) || 0) !== 2) return false;
                if (boss20State.rescueUsed) return false;
                const idx = Math.floor(Number(index));
                if (!Number.isFinite(idx) || idx < 0 || idx >= state.length) return false;
                if (boss20State.phase2DesperationActive) return true;
                boss20State.phase2DesperationActive = true;
                boss20State.phase2DesperationStartedAt = Date.now();
                boss20State.phase2RescueQueued = false;
                boss20State.phase2LastRegenAt = 0;
                boss20State.actionCadenceMs = Math.max(900, Math.min(Number(boss20State.actionCadenceMs) || EPIC_BOSS20_PHASE2_ACTION_MS, Number(EPIC_BOSS20_PHASE2_DESPERATION_ACTION_MS) || 1200));
                try { playBossSummonPulse(idx); } catch (e) { }
                try {
                    const spike = spawnBossArmorPulse(2 + (Math.random() < 0.65 ? 1 : 0), idx, { anyBoardChance: 0.72, offAxisChance: 0.42, spawnSize: 0 });
                    if (spike <= 0) applyBoss20ArmorThreat(idx, 1, { minState: 0 });
                } catch (e) { }
                try {
                    if (window.Assistant && Assistant.show) {
                        Assistant.show('Hold on, I am going to try something.', { priority: 2 });
                    }
                } catch (e) { }
                stopBoss20PhaseTimer();
                ensureBoss20PhaseTimer();
                scheduleRender();
                return true;
            }

            function applyBoss20ArmorThreat(originIndex, maxCount = 1, opts = null) {
                const count = Math.max(1, Math.floor(Number(maxCount) || 1));
                const minState = Math.max(0, Math.min(MAX_SIZE, Math.floor(Number(opts && opts.minState) || 1)));
                const pool = [];
                for (let i = 0; i < state.length; i++) {
                    if (state[i] === null) continue;
                    if (specialState[i] === 'boss') continue;
                    if (specialState[i] === 'armored') continue;
                    if ((Number(state[i]) || 0) < minState) continue;
                    pool.push(i);
                }
                if (!pool.length) return 0;
                shuffle(pool);
                const n = Math.max(0, Math.min(count, pool.length));
                for (let i = 0; i < n; i++) {
                    const pick = pool[i];
                    setSpecialForCell(pick, 'armored');
                    playBossSummonTravelFx(originIndex, pick);
                    playBossSpawnStamp(pick);
                }
                playBossSummonPulse(originIndex);
                const suppressSpawnVoice = (isEpicBoss20Level() && boss20State && boss20State.rescueUsed);
                if (!suppressSpawnVoice) {
                    if (!playBoss20LaughThrottled(2800)) {
                        try { playSfx('miniboss_laugh'); } catch (e) { }
                    }
                }
                scheduleRender();
                return n;
            }

            function triggerBoss20Phase1Action(reason = 'timer') {
                if (!hasActiveBoss20Combat()) return 0;
                if (isBlockingPopupOpen()) return 0;
                if (Date.now() < Number(boss20State.heroStallUntil) || isBoss20RescueShieldActive()) return 0;
                const bosses = getBossIndicesForLevel(20);
                if (!bosses.length) return 0;
                const origin = bosses[0];
                const phase = Math.max(1, Math.floor(Number(boss20State.phase) || 1));
                let acted = 0;
                if (phase === 1) {
                    // Phase 1 pacing: mostly larger adds (S3/S4), never smallest S1.
                    const phase1SpawnSize = (Math.random() < 0.68) ? Math.max(0, MAX_SIZE - 1) : MAX_SIZE;
                    acted = spawnBossArmorPulse(1, origin, { spawnSize: phase1SpawnSize });
                    if (acted <= 0) acted = spawnBossArmorPulse(1, origin, { anyBoardChance: 1, spawnSize: phase1SpawnSize });
                } else if (phase === 2) {
                    if (isBoss20Phase2DesperationActive()) {
                        const ramp = getBoss20Phase2DesperationRamp();
                        const basePulse = 3 + (Math.random() < (0.45 + (ramp * 0.35)) ? 1 : 0);
                        const heavyPulse = 4 + (Math.random() < (0.22 + (ramp * 0.48)) ? 1 : 0);
                        const modeRoll = Math.random();
                        const heavyChance = 0.16 + (ramp * 0.42);
                        const mixedChance = 0.38 + (ramp * 0.28);
                        if (modeRoll < heavyChance) {
                            acted = spawnBossArmorPulse(heavyPulse, origin, {
                                anyBoardChance: 0.90 + (ramp * 0.10),
                                offAxisChance: 0.58 + (ramp * 0.22),
                                spawnSize: 0
                            }) + applyBoss20ArmorThreat(origin, 1 + (ramp > 0.6 ? 1 : 0), { minState: 0 });
                        } else if (modeRoll < (heavyChance + mixedChance)) {
                            acted = spawnBossArmorPulse(basePulse, origin, {
                                anyBoardChance: 0.80 + (ramp * 0.18),
                                offAxisChance: 0.52 + (ramp * 0.20),
                                spawnSize: 0
                            }) + applyBoss20ArmorThreat(origin, 1, { minState: 0 });
                        } else {
                            acted = spawnBossArmorPulse(basePulse, origin, {
                                anyBoardChance: 0.70 + (ramp * 0.20),
                                offAxisChance: 0.46 + (ramp * 0.20),
                                spawnSize: 0
                            });
                        }
                        if (acted <= 0) acted = spawnBossArmorPulse(3 + (ramp > 0.5 ? 1 : 0), origin, {
                            anyBoardChance: 1.0,
                            offAxisChance: 0.66 + (ramp * 0.16),
                            spawnSize: 0
                        });
                    } else {
                        const pulseCount = (Math.random() < 0.55) ? 2 : 1;
                        acted = spawnBossArmorPulse(pulseCount, origin, { anyBoardChance: 0.78, offAxisChance: 0.72 });
                        if (acted <= 0) acted = applyBoss20ArmorThreat(origin, 2);
                    }
                } else {
                    maybeActivateBoss20HeroMark(origin);
                    const modeRoll = Math.random();
                    if (modeRoll < 0.34) {
                        acted = spawnBossArmorPulse(3, origin, { anyBoardChance: 0.92, offAxisChance: 0.58 });
                    } else if (modeRoll < 0.67) {
                        acted = spawnBossArmorPulse(2, origin, { anyBoardChance: 0.90, offAxisChance: 0.54 }) + applyBoss20ArmorThreat(origin, 1);
                    } else {
                        acted = spawnBossArmorPulse(3, origin, { anyBoardChance: 0.96, offAxisChance: 0.64 }) + applyBoss20ArmorThreat(origin, 1);
                    }
                    if (acted <= 0) acted = spawnBossArmorPulse(2, origin, { anyBoardChance: 1.0, offAxisChance: 0.72 });
                }
                const fueled = ensureBossBoardFuel(20, origin, {
                    phaseContext: { phase, desperation: (phase === 2) && isBoss20Phase2DesperationActive() }
                });
                if (fueled > 0) acted += fueled;
                if (phase >= 3 || (boss20State && boss20State.finalFormActive)) {
                    const healed = maybeApplyBoss20Phase3Regen(origin);
                    if (healed > 0) acted += 1;
                    const drained = maybeApplyBoss20Phase3ClickDrain(origin);
                    if (drained > 0) acted += 1;
                }
                if (acted > 0) {
                    boss20State.actionCounter = Math.max(0, Number(boss20State.actionCounter) || 0) + 1;
                }
                return acted;
            }

            function ensureBoss20PhaseTimer() {
                if (!hasActiveBoss20Combat()) {
                    stopBoss20PhaseTimer();
                    stopBoss20VoiceTimer();
                    return;
                }
                ensureBoss20VoiceTimer();
                if (boss20PhaseTimer) return;
                if (isBlockingPopupOpen() || finalOfferModalOpen) {
                    boss20PhaseTimer = setTimeout(() => {
                        boss20PhaseTimer = null;
                        ensureBoss20PhaseTimer();
                    }, 260);
                    return;
                }
                const stallLeft = Math.max(0, Number(boss20State.heroStallUntil) - Date.now());
                if (stallLeft > 0) {
                    boss20PhaseTimer = setTimeout(() => {
                        boss20PhaseTimer = null;
                        ensureBoss20PhaseTimer();
                    }, Math.max(120, Math.min(900, Math.floor(stallLeft + 40))));
                    return;
                }
                if (boss20State.phase2RescueQueued && !inputLocked) {
                    if (maybeTriggerBoss20Phase2RescueByClicks()) return;
                }
                const sourceBoardGeneration = boardGeneration;
                const phase = Math.max(1, Math.floor(Number(boss20State.phase) || 1));
                const defaultCadence = (phase <= 1)
                    ? EPIC_BOSS20_PHASE1_ACTION_MS
                    : ((phase === 2) ? EPIC_BOSS20_PHASE2_ACTION_MS : EPIC_BOSS20_PHASE3_ACTION_MS);
                let cadence = Math.max(1200, Math.floor(Number(boss20State.actionCadenceMs) || defaultCadence));
                if (phase === 2 && isBoss20Phase2DesperationActive()) {
                    const ramp = getBoss20Phase2DesperationRamp();
                    const targetCap = Math.floor((Number(EPIC_BOSS20_PHASE2_DESPERATION_ACTION_MS) || 1200) - (280 * ramp));
                    const minCadence = Math.max(640, Math.floor(Number(EPIC_BOSS20_PHASE2_DESPERATION_MIN_CADENCE_MS) || 760));
                    cadence = Math.max(minCadence, Math.min(cadence, Math.max(minCadence, targetCap)));
                }
                if (Date.now() < Number(runPerkState && runPerkState.finalBossSlowUntil)) {
                    cadence = Math.max(1200, Math.floor(cadence * 1.28));
                }
                boss20PhaseTimer = setTimeout(() => {
                    boss20PhaseTimer = null;
                    if (sourceBoardGeneration !== boardGeneration) {
                        ensureBoss20PhaseTimer();
                        return;
                    }
                    if (hasActiveBoss20Combat()) {
                        triggerBoss20Phase1Action('timer');
                    }
                    ensureBoss20PhaseTimer();
                }, cadence);
            }

            function setBoss20BoardFreeze(active) {
                try {
                    const body = document.body;
                    if (!body) return;
                    if (active) body.classList.add('boss20-board-frozen');
                    else body.classList.remove('boss20-board-frozen');
                } catch (e) { }
            }

            function showBoss20Phase2WhiteFlash() {
                try {
                    const flash = document.createElement('div');
                    flash.className = 'boss20-white-flash';
                    flash.style.setProperty('--boss20-flash-ms', `${Math.max(20, Math.floor(Number(EPIC_BOSS20_PHASE2_BREAK_FLASH_MS) || 50))}ms`);
                    document.body.appendChild(flash);
                    setTimeout(() => { try { flash.remove(); } catch (e) { } }, Math.max(120, Math.floor(Number(EPIC_BOSS20_PHASE2_BREAK_FLASH_MS) || 50) + 120));
                } catch (e) { }
            }

            function spawnBoss20DrainBotFx(layer, sx, sy, tx, ty, durationMs = 420) {
                try {
                    if (!layer) return;
                    const bot = document.createElement('div');
                    bot.className = 'boss20-drain-bot';
                    if (NANOBOT_DRAIN_SPRITE_URL) bot.style.backgroundImage = `url('${NANOBOT_DRAIN_SPRITE_URL}')`;
                    bot.style.left = `${Math.round(sx)}px`;
                    bot.style.top = `${Math.round(sy)}px`;
                    bot.style.setProperty('--dx', `${Math.round(tx - sx)}px`);
                    bot.style.setProperty('--dy', `${Math.round(ty - sy)}px`);
                    bot.style.setProperty('--dur', `${Math.max(220, Math.floor(Number(durationMs) || 420))}ms`);
                    layer.appendChild(bot);
                    setTimeout(() => { try { bot.remove(); } catch (e) { } }, Math.max(300, Math.floor(Number(durationMs) || 420) + 120));
                } catch (e) { }
            }

            function playBoss20NanoBotDrainSequence(bossIndex, targetClicks = 0) {
                return new Promise((resolve) => {
                    try {
                        const idx = Math.floor(Number(bossIndex));
                        if (!Number.isFinite(idx) || idx < 0 || idx >= state.length) { resolve(false); return; }
                        const startClicks = Math.max(0, Math.floor(Number(clicksLeft) || 0));
                        const endClicks = Math.max(0, Math.min(startClicks, Math.floor(Number(targetClicks) || 0)));
                        if (startClicks <= endClicks) { resolve(true); return; }
                        const meter = document.getElementById('clicksMeter');
                        const bossCenter = getBoardCellCenter(idx);
                        if (!meter || !bossCenter) {
                            clicksLeft = endClicks;
                            try { updateHUD(); } catch (e) { }
                            resolve(true);
                            return;
                        }
                        const meterRect = meter.getBoundingClientRect();
                        const sxBase = meterRect.left + Math.min(18, meterRect.width * 0.24);
                        const syBase = meterRect.top + (meterRect.height * 0.52);
                        const txBase = Number(bossCenter.x) || (window.innerWidth * 0.5);
                        const tyBase = Number(bossCenter.y) || (window.innerHeight * 0.5);

                        const layer = document.createElement('div');
                        layer.className = 'boss20-drain-layer';
                        const beam = document.createElement('div');
                        beam.className = 'boss20-drain-beam';
                        const dx = txBase - sxBase;
                        const dy = tyBase - syBase;
                        const dist = Math.max(16, Math.sqrt((dx * dx) + (dy * dy)));
                        const ang = Math.atan2(dy, dx) * (180 / Math.PI);
                        beam.style.left = `${Math.round(sxBase)}px`;
                        beam.style.top = `${Math.round(syBase)}px`;
                        beam.style.width = `${Math.round(dist)}px`;
                        beam.style.transform = `translate(0, -50%) rotate(${ang}deg)`;
                        layer.appendChild(beam);
                        document.body.appendChild(layer);

                        try { playSfx('miniboss_laugh'); } catch (e) { }
                        setTimeout(() => { try { playSfx('miniboss_laugh'); } catch (e) { } }, 780);
                        setTimeout(() => { try { playSfx('miniboss_laugh'); } catch (e) { } }, 1580);

                        const steps = Math.max(1, startClicks - endClicks);
                        const leadInMs = 2000;
                        const drainTotalMs = Math.max(1800, Math.min(3200, Math.floor(2200 + (steps * 35))));
                        const stepMs = Math.max(120, Math.floor(drainTotalMs / steps));
                        let leftToDrain = steps;
                        const step = () => {
                            if (leftToDrain <= 0) {
                                setTimeout(() => {
                                    try { layer.remove(); } catch (e) { }
                                    resolve(true);
                                }, 120);
                                return;
                            }
                            clicksLeft = Math.max(endClicks, Math.max(0, Number(clicksLeft) - 1));
                            try { updateHUD(); } catch (e) { }
                            const sx = sxBase + ((Math.random() - 0.5) * 20);
                            const sy = syBase + ((Math.random() - 0.5) * 14);
                            const tx = txBase + ((Math.random() - 0.5) * 16);
                            const ty = tyBase + ((Math.random() - 0.5) * 16);
                            spawnBoss20DrainBotFx(layer, sx, sy, tx, ty, Math.max(520, Math.floor(stepMs * 1.4) + Math.floor(Math.random() * 180)));
                            leftToDrain -= 1;
                            setTimeout(step, stepMs);
                        };
                        setTimeout(step, leadInMs);
                    } catch (e) {
                        resolve(false);
                    }
                });
            }

            function spawnBoss20Phase2ShatterFx(index) {
                if (!Number.isFinite(index) || !boardEl) return;
                try {
                    const cell = boardEl.querySelector(`[data-index='${Math.floor(Number(index))}']`);
                    if (!cell) return;
                    const r = cell.getBoundingClientRect();
                    const cx = Math.round(r.left + (r.width * 0.5));
                    const cy = Math.round(r.top + (r.height * 0.5));
                    const spriteSize = Math.round(Math.max(r.width, r.height) * 0.78);
                    const shatter = document.createElement('div');
                    shatter.className = 'boss20-shatter-sprite';
                    shatter.style.left = cx + 'px';
                    shatter.style.top = cy + 'px';
                    shatter.style.width = spriteSize + 'px';
                    shatter.style.height = spriteSize + 'px';
                    if (BOSS20_PHASE2_SHATTER_SPRITE_URL) {
                        shatter.style.backgroundImage = `url('${BOSS20_PHASE2_SHATTER_SPRITE_URL}')`;
                    }
                    document.body.appendChild(shatter);

                    const shardCount = 16;
                    for (let i = 0; i < shardCount; i++) {
                        const shard = document.createElement('div');
                        shard.className = 'boss20-shatter-shard';
                        const angle = ((Math.PI * 2) * i / shardCount) + ((Math.random() - 0.5) * 0.36);
                        const dist = 24 + (Math.random() * 62);
                        const tx = Math.round(Math.cos(angle) * dist);
                        const ty = Math.round(Math.sin(angle) * dist);
                        const rot = Math.round((Math.random() - 0.5) * 320);
                        shard.style.left = cx + 'px';
                        shard.style.top = cy + 'px';
                        shard.style.setProperty('--tx', `${tx}px`);
                        shard.style.setProperty('--ty', `${ty}px`);
                        shard.style.setProperty('--rot', `${rot}deg`);
                        shard.style.animationDelay = `${Math.round(Math.random() * 48)}ms`;
                        document.body.appendChild(shard);
                        setTimeout(() => { try { shard.remove(); } catch (e) { } }, 540);
                    }
                    setTimeout(() => { try { shatter.remove(); } catch (e) { } }, 620);
                } catch (e) { }
            }

            function playBoss20Phase2SwapShake(index, durationMs = EPIC_BOSS20_PHASE2_BREAK_SHAKE_MS) {
                if (!Number.isFinite(index) || !boardEl) return;
                try {
                    const cell = boardEl.querySelector(`[data-index='${Math.floor(Number(index))}']`);
                    if (!cell) return;
                    cell.classList.remove('boss20-phase2-transform');
                    void cell.offsetWidth;
                    cell.classList.add('boss20-phase2-transform');
                    setTimeout(() => {
                        try { cell.classList.remove('boss20-phase2-transform'); } catch (e) { }
                    }, Math.max(320, Math.floor(Number(durationMs) || 820)));
                } catch (e) { }
            }

            function runBoss20Phase2BreakSequence(index, sourceBoardGeneration = boardGeneration) {
                return new Promise((resolve) => {
                    const freezeMs = Math.max(200, Math.floor(Number(EPIC_BOSS20_PHASE2_BREAK_FREEZE_MS) || 2000));
                    const shatterMs = Math.max(240, Math.floor(Number(EPIC_BOSS20_PHASE2_BREAK_SHATTER_MS) || 560));
                    const sfxLeadMs = Math.max(0, Math.floor(Number(EPIC_BOSS20_PHASE2_BREAK_SFX_LEAD_MS) || 0));
                    const sfxDelay = Math.max(0, freezeMs - sfxLeadMs);
                    boss20BlockerPaused = true;
                    setBoss20BoardFreeze(true);
                    setTimeout(() => {
                        if (sourceBoardGeneration !== boardGeneration) return;
                        try { playSfx('glass_crack'); } catch (e) { }
                    }, sfxDelay);
                    setTimeout(() => {
                        if (sourceBoardGeneration !== boardGeneration) {
                            setBoss20BoardFreeze(false);
                            resolve(false);
                            return;
                        }
                        boss20BlockerHidden = true;
                        boss20BlockerPaused = false;
                        try { syncRotatingBlockerUI(); } catch (e) { }
                        showBoss20Phase2WhiteFlash();
                        spawnBoss20Phase2ShatterFx(index);
                        setTimeout(() => {
                            setBoss20BoardFreeze(false);
                            resolve(true);
                        }, shatterMs);
                    }, freezeMs);
                });
            }

            function showBoss20PhaseShiftOverlay() {
                try {
                    const prior = document.querySelector('.boss20-phase-shift');
                    if (prior) prior.remove();
                } catch (e) { }
                try {
                    const board = document.getElementById('board') || document.querySelector('.board');
                    if (!board) return null;
                    const r = board.getBoundingClientRect();
                    const el = document.createElement('div');
                    el.className = 'boss20-phase-shift';
                    el.innerHTML = '<div class="boss20-phase-shift__title">CORE REBOOT</div><div class="boss20-phase-shift__sub">THREAT ESCALATING...</div><div class="boss20-phase-shift__hint">CLICK TO CONTINUE</div>';
                    el.style.left = Math.round(r.left) + 'px';
                    el.style.top = Math.round(r.top) + 'px';
                    el.style.width = Math.max(120, Math.round(r.width)) + 'px';
                    el.style.height = Math.max(120, Math.round(r.height)) + 'px';
                    document.body.appendChild(el);
                    return el;
                } catch (e) {
                    return null;
                }
            }

            function showBoss20RescueOverlay() {
                try {
                    const prior = document.querySelector('.boss20-rescue');
                    if (prior) prior.remove();
                } catch (e) { }
                try {
                    const board = document.getElementById('board') || document.querySelector('.board');
                    if (!board) return null;
                    const r = board.getBoundingClientRect();
                    const el = document.createElement('div');
                    el.className = 'boss20-rescue';
                    el.innerHTML = '<div class="boss20-rescue__title">ALLIED NANOBOT INTERVENTION</div><div class="boss20-rescue__sub">CORE STABILIZED. CHARGES RESTORED.</div><div class="boss20-rescue__hint">CLICK TO CONTINUE</div>';
                    el.style.left = Math.round(r.left) + 'px';
                    el.style.top = Math.round(r.top) + 'px';
                    el.style.width = Math.max(120, Math.round(r.width)) + 'px';
                    el.style.height = Math.max(120, Math.round(r.height)) + 'px';
                    document.body.appendChild(el);
                    return el;
                } catch (e) {
                    return null;
                }
            }

            function showBoss20PhaseThreeOverlay() {
                try {
                    const prior = document.querySelector('.boss20-phase-shift');
                    if (prior) prior.remove();
                } catch (e) { }
                try {
                    const board = document.getElementById('board') || document.querySelector('.board');
                    if (!board) return null;
                    const r = board.getBoundingClientRect();
                    const el = document.createElement('div');
                    el.className = 'boss20-phase-shift';
                    el.innerHTML = '<div class="boss20-phase-shift__title">PHASE 3: OMEGA CORE</div><div class="boss20-phase-shift__sub">HERO MARKERS ONLINE. TARGET WEAK-POINTS.</div><div class="boss20-phase-shift__hint">CLICK TO CONTINUE</div>';
                    el.style.left = Math.round(r.left) + 'px';
                    el.style.top = Math.round(r.top) + 'px';
                    el.style.width = Math.max(120, Math.round(r.width)) + 'px';
                    el.style.height = Math.max(120, Math.round(r.height)) + 'px';
                    document.body.appendChild(el);
                    return el;
                } catch (e) {
                    return null;
                }
            }

            function waitForBoss20CinematicAcknowledge(overlayEl) {
                return new Promise((resolve) => {
                    if (!overlayEl) {
                        resolve();
                        return;
                    }
                    let done = false;
                    const armAt = Date.now() + 420;
                    const finish = () => {
                        if (done) return;
                        done = true;
                        try { overlayEl.removeEventListener('click', onClick); } catch (e) { }
                        try { overlayEl.removeEventListener('touchstart', onClick); } catch (e) { }
                        try { overlayEl.removeEventListener('touchend', onClick); } catch (e) { }
                        try { document.removeEventListener('keydown', onKeyDown, true); } catch (e) { }
                        resolve();
                    };
                    const onClick = (ev) => {
                        if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();
                        if (ev && typeof ev.stopPropagation === 'function') ev.stopPropagation();
                        if (Date.now() < armAt) return;
                        finish();
                    };
                    const onKeyDown = (ev) => {
                        if (Date.now() < armAt) return;
                        const key = String((ev && ev.key) || '');
                        if (key === 'Enter' || key === ' ' || key === 'Spacebar' || key === 'Escape') finish();
                    };
                    try {
                        overlayEl.style.pointerEvents = 'auto';
                        overlayEl.style.cursor = 'pointer';
                        overlayEl.setAttribute('tabindex', '0');
                        overlayEl.setAttribute('role', 'button');
                        overlayEl.setAttribute('aria-label', 'Continue');
                        overlayEl.addEventListener('click', onClick);
                        overlayEl.addEventListener('touchstart', onClick, { passive: false });
                        overlayEl.addEventListener('touchend', onClick, { passive: false });
                        document.addEventListener('keydown', onKeyDown, true);
                        overlayEl.focus();
                    } catch (e) {
                        finish();
                    }
                });
            }

            function showBoss20FinalChargeOverlay() {
                try {
                    const prior = document.querySelector('.boss20-final-charge');
                    if (prior) prior.remove();
                } catch (e) { }
                try {
                    const board = document.getElementById('board') || document.querySelector('.board');
                    if (!board) return null;
                    const r = board.getBoundingClientRect();
                    const el = document.createElement('div');
                    el.className = 'boss20-final-charge';
                    el.innerHTML = '<div class="boss20-final-charge__title">CORE OVERLOAD</div><div class="boss20-final-charge__sub">WEAK-POINT WINDOW OPENING...</div><div class="boss20-final-charge__hint">CLICK TO CONTINUE</div>';
                    el.style.left = Math.round(r.left) + 'px';
                    el.style.top = Math.round(r.top) + 'px';
                    el.style.width = Math.max(120, Math.round(r.width)) + 'px';
                    el.style.height = Math.max(120, Math.round(r.height)) + 'px';
                    document.body.appendChild(el);
                    return el;
                } catch (e) {
                    return null;
                }
            }

            function showBoss20HeroMarkFx(index) {
                const p = getBoardCellCenter(index);
                if (!p) return;
                try {
                    const fx = document.createElement('div');
                    fx.className = 'boss20-hero-mark';
                    fx.style.left = Math.round(p.x) + 'px';
                    fx.style.top = Math.round(p.y) + 'px';
                    document.body.appendChild(fx);
                    setTimeout(() => { try { fx.remove(); } catch (e) { } }, 820);
                } catch (e) { }
            }

            function showBoss20FinalBurstFx(index) {
                try {
                    const board = document.getElementById('board') || document.querySelector('.board');
                    if (!board) return;
                    const r = board.getBoundingClientRect();
                    const fx = document.createElement('div');
                    fx.className = 'boss20-final-burst';
                    fx.style.left = Math.round(r.left) + 'px';
                    fx.style.top = Math.round(r.top) + 'px';
                    fx.style.width = Math.max(120, Math.round(r.width)) + 'px';
                    fx.style.height = Math.max(120, Math.round(r.height)) + 'px';
                    document.body.appendChild(fx);
                    setTimeout(() => { try { fx.remove(); } catch (e) { } }, 980);
                } catch (e) { }
                try {
                    playMiniBossBurstEffect(index, true);
                    setTimeout(() => { try { playMiniBossBurstEffect(index, true); } catch (e) { } }, 160);
                    setTimeout(() => { try { playMiniBossBurstEffect(index, true); } catch (e) { } }, 320);
                } catch (e) { }
            }

            function maybeActivateBoss20HeroMark(originIndex = null, force = false) {
                if (!hasActiveBoss20Combat()) return false;
                if (Math.max(1, Math.floor(Number(boss20State.phase) || 1)) < 3) return false;
                if (boss20State.inCinematic || isBoss20FinalWindowActive()) return false;
                const now = Date.now();
                if (!force && now < Number(boss20State.nextHeroMarkAt)) return false;
                const bosses = getBossIndicesForLevel(20);
                if (!bosses.length) return false;
                const idx = Number.isFinite(originIndex) ? Math.floor(Number(originIndex)) : bosses[0];
                boss20State.heroMarkCell = idx;
                boss20State.heroMarkUntil = now + Math.max(1000, EPIC_BOSS20_HERO_MARK_DURATION_MS);
                boss20State.weakPointUntil = Math.max(Number(boss20State.weakPointUntil) || 0, boss20State.heroMarkUntil);
                boss20State.nextHeroMarkAt = now + Math.max(1800, EPIC_BOSS20_HERO_MARK_EVERY_MS + Math.floor(Math.random() * 1200));
                showBoss20HeroMarkFx(idx);
                try { playSfx('zap'); } catch (e) { }
                scheduleRender();
                setTimeout(() => {
                    try {
                        if (!isEpicBoss20Level()) return;
                        if (Date.now() >= Number(boss20State.weakPointUntil) - 20) scheduleRender();
                    } catch (e) { }
                }, Math.max(180, Number(boss20State.heroMarkUntil) - now + 36));
                return true;
            }

            function triggerBoss20FinalWindow(index, meta) {
                if (!isEpicBoss20Level()) return false;
                if (!meta || !meta.isBoss || meta.isProjection) return false;
                if (Math.max(1, Math.floor(Number(meta.phase) || 1)) < 3) return false;
                if (boss20State && (boss20State.finalShotActive || boss20State.finalShotTriggered || boss20State.finalShotRelease)) return false;
                if (boss20State.inFinalWindow || boss20State.inCinematic) return false;
                const idx = Math.floor(Number(index));
                if (!Number.isFinite(idx) || idx < 0 || idx >= state.length) return false;
                boss20State.inFinalWindow = false;
                boss20State.inCinematic = true;
                boss20State.finalChargeUntil = Date.now() + Math.max(600, EPIC_BOSS20_FINAL_CHARGE_MS);
                boss20State.finalWindowUntil = 0;
                stopBoss20PhaseTimer();
                inputLocked = true;
                const sourceBoardGeneration = boardGeneration;
                try { playSfx('boss_level'); } catch (e) { }
                try { playBossSummonPulse(idx, 'blue'); } catch (e) { }
                if (boss20FinalWindowTimer) {
                    clearTimeout(boss20FinalWindowTimer);
                    boss20FinalWindowTimer = null;
                }
                showBoss20FinalWindowTalkCutscene(() => {
                    if (sourceBoardGeneration !== boardGeneration) {
                        boss20State.inCinematic = false;
                        inputLocked = false;
                        return;
                    }
                    if (state[idx] === null || specialState[idx] !== 'boss') {
                        boss20State.inCinematic = false;
                        inputLocked = false;
                        return;
                    }
                    boss20State.inFinalWindow = false;
                    boss20State.finalChargeUntil = 0;
                    boss20State.finalWindowUntil = 0;
                    boss20State.inCinematic = false;
                    if (boss20FinalWindowTimer) {
                        clearTimeout(boss20FinalWindowTimer);
                        boss20FinalWindowTimer = null;
                    }
                    const setupOk = setupBoss20FinalShotBoard(idx);
                    if (setupOk) {
                        try {
                            if (window.Assistant && Assistant.show) {
                                Assistant.show('Target lock acquired. Hit the marked virus to trigger the final cascade.', { priority: 2 });
                            }
                        } catch (e) { }
                    }
                    inputLocked = false;
                    scheduleRender();
                });
                return true;
            }

            function isBoss20RescueShieldActive() {
                if (!isEpicBoss20Level()) return false;
                return Date.now() < Number(boss20State && boss20State.rescueShieldUntil);
            }

            function runBoss20RescueBlackoutAndFinalForm(index, meta, sourceBoardGeneration = boardGeneration) {
                return new Promise((resolve) => {
                    try {
                        const idx = Math.floor(Number(index));
                        if (!Number.isFinite(idx) || idx < 0 || idx >= state.length) {
                            resolve(false);
                            return;
                        }
                        const overlay = document.createElement('div');
                        overlay.className = 'boss20-global-blackout';
                        const fadeMs = Math.max(200, Math.floor(Number(EPIC_BOSS20_PHASE2_TO_RESCUE_BLACKOUT_MS) || 1500));
                        overlay.style.setProperty('--boss20-blackout-ms', `${fadeMs}ms`);
                        document.body.appendChild(overlay);
                        setBoss20BoardFreeze(true);
                        requestAnimationFrame(() => {
                            try { overlay.classList.add('show'); } catch (e) { }
                        });
                        setTimeout(() => {
                            if (sourceBoardGeneration !== boardGeneration) {
                                try { overlay.remove(); } catch (e) { }
                                setBoss20BoardFreeze(false);
                                resolve(false);
                                return;
                            }
                            const coreCells = getBoss20CoreCells();
                            const anchor = coreCells[0];
                            for (let i = 0; i < coreCells.length; i++) {
                                const cellIndex = coreCells[i];
                                state[cellIndex] = null;
                                clearSpecialForCell(cellIndex);
                                clearBossGooShieldAt(cellIndex);
                                clearBiofilmAt(cellIndex);
                            }
                            state[anchor] = 3;
                            specialState[anchor] = 'boss';
                            const bossMeta = Object.assign({}, meta || ensureSpecialMeta(idx) || {});
                            bossMeta.isBoss = true;
                            bossMeta.bossLevel = 20;
                            bossMeta.isFinalForm = true;
                            if (!Number.isFinite(Number(bossMeta.phase)) || Number(bossMeta.phase) < 2) bossMeta.phase = 2;
                            if (!Number.isFinite(Number(bossMeta.hp)) || Number(bossMeta.hp) <= 0) bossMeta.hp = Math.max(1, Number(boss20State.hp) || 1);
                            if (!Number.isFinite(Number(bossMeta.maxHp)) || Number(bossMeta.maxHp) <= 0) bossMeta.maxHp = Math.max(1, Number(boss20State.maxHp) || Number(bossMeta.hp) || 1);
                            specialMetaState[anchor] = bossMeta;
                            boss20State.active = true;
                            boss20State.phase = Math.max(2, Math.floor(Number(bossMeta.phase) || 2));
                            boss20State.hp = Math.max(0, Number(bossMeta.hp) || 0);
                            boss20State.maxHp = Math.max(1, Number(bossMeta.maxHp) || 1);
                            boss20State.phase2OmegaQueued = false;
                            boss20State.finalFormActive = true;
                            boss20State.finalFormAnchor = anchor;
                            boss20State.finalFormCells = coreCells.slice();
                            try { setMiniBossStateFromMeta(anchor, bossMeta); } catch (e) { }
                            try { overlay.remove(); } catch (e) { }
                            setBoss20BoardFreeze(false);
                            try { render(); } catch (e) { scheduleRender(); }
                            try { playSfx('final_entrance'); } catch (e) { }
                            setTimeout(() => {
                                try {
                                    const bossTalkKeys = ['evil1', 'evil2', 'evil3', 'evil4', 'evil5', 'evil6'];
                                    const pick = bossTalkKeys[Math.floor(Math.random() * bossTalkKeys.length)] || 'evil1';
                                    playSfx(pick);
                                } catch (e) { }
                            }, 360);
                            resolve(true);
                        }, fadeMs);
                    } catch (e) {
                        setBoss20BoardFreeze(false);
                        resolve(false);
                    }
                });
            }

            function triggerBoss20RescueSequence(index, meta) {
                if (!isEpicBoss20Level()) return false;
                if (!meta || !meta.isBoss) return false;
                if ((Number(meta.phase) || 1) < 2) return false;
                if (boss20State.rescueUsed) return false;
                if (boss20State.inCinematic) return false;
                const idx = Math.floor(Number(index));
                if (!Number.isFinite(idx) || idx < 0 || idx >= state.length) return false;
                boss20State.rescueUsed = true;
                boss20State.inCinematic = true;
                boss20State.phase2DesperationActive = false;
                boss20State.phase2DesperationStartedAt = 0;
                boss20State.phase2RescueQueued = false;
                boss20State.phase2DrainInProgress = false;
                boss20State.phase2LastRegenAt = 0;
                boss20State.phase3LastClickDrainAt = 0;
                boss20State.phase2OmegaQueued = false;
                boss20State.rescueShieldUntil = Date.now() + Math.max(1200, EPIC_BOSS20_RESCUE_CINEMATIC_MS + 500);
                stopBoss20PhaseTimer();
                inputLocked = true;
                clicksLeft = 0;
                updateHUD();
                const sourceBoardGeneration = boardGeneration;
                runBoss20RescueBlackoutAndFinalForm(idx, meta, sourceBoardGeneration).then(() => {
                    const holdMs = Math.max(0, Math.floor(Number(EPIC_BOSS20_FINALFORM_PRE_RESCUE_HOLD_MS) || 2000));
                    setTimeout(() => {
                    if (sourceBoardGeneration !== boardGeneration) {
                        boss20State.inCinematic = false;
                        inputLocked = false;
                        return;
                    }
                    const activeBossIndices = getBossIndicesForLevel(20);
                    const bossIndex = activeBossIndices.length ? activeBossIndices[0] : idx;
                    showBoss20RescueTalkCutscene(() => {
                    if (sourceBoardGeneration !== boardGeneration) {
                        boss20State.inCinematic = false;
                        inputLocked = false;
                        return;
                    }
                    if (state[bossIndex] === null || specialState[bossIndex] !== 'boss') {
                        boss20State.inCinematic = false;
                        inputLocked = false;
                        return;
                    }
                    clicksLeft = Math.min(getMaxClicksCap(), Math.max(0, Number(EPIC_BOSS20_RESCUE_CLICK_REFILL) || 14));
                    stormCharges = Math.max(0, Math.min(MAX_STORM_CHARGES, Math.floor(Number(EPIC_BOSS20_RESCUE_STORM_REFILL) || 1)));
                    try { setStormArmed(false); } catch (e) { }
                    try { flashStormChargeGain(); } catch (e) { }
                    try { runPerkState.armorPiercerPermanent = true; } catch (e) { }
                    try {
                        const bossMetaAfterRescue = ensureSpecialMeta(bossIndex) || {};
                        const maxHpAfterRescue = Math.max(1, Number(bossMetaAfterRescue.maxHp) || Number(boss20State.maxHp) || getBoss20ScaledHp(EPIC_BOSS20_PHASE2_HP));
                        bossMetaAfterRescue.hp = maxHpAfterRescue;
                        bossMetaAfterRescue.maxHp = maxHpAfterRescue;
                        specialMetaState[bossIndex] = bossMetaAfterRescue;
                        boss20State.hp = maxHpAfterRescue;
                        boss20State.maxHp = maxHpAfterRescue;
                        setMiniBossStateFromMeta(bossIndex, bossMetaAfterRescue);
                    } catch (e) { }
                    try { populateBoss20PostRescueBoard(bossIndex); } catch (e) { }
                    boss20State.inCinematic = false;
                    boss20State.heroStallUntil = Date.now() + Math.max(700, Math.floor(EPIC_BOSS20_RESCUE_STALL_MS * 0.35));
                    boss20State.rescueShieldUntil = Math.max(Number(boss20State.rescueShieldUntil) || 0, Date.now() + 220);
                    boss20State.phase2OmegaQueued = false;
                    inputLocked = false;
                    try {
                        if (window.Assistant && Assistant.show) {
                            Assistant.show('Armor breaker protocol now active! Go get him!', { priority: 2 });
                        }
                    } catch (e) { }
                    scheduleRender();
                    updateHUD();
                    ensureBoss20PhaseTimer();
                    });
                    }, holdMs);
                }).catch(() => {
                    boss20State.inCinematic = false;
                    inputLocked = false;
                });
                return true;
            }

            function triggerBoss20PhaseThreeTransition(index, meta) {
                if (!isEpicBoss20Level()) return false;
                if (!meta || !meta.isBoss || meta.isProjection) return false;
                if ((Number(meta.phase) || 1) >= 3) return false;
                if (boss20State.inCinematic) return false;
                const idx = Math.floor(Number(index));
                if (!Number.isFinite(idx) || idx < 0 || idx >= state.length) return false;
                boss20State.inCinematic = true;
                stopBoss20PhaseTimer();
                inputLocked = true;
                const sourceBoardGeneration = boardGeneration;
                const overlay = showBoss20PhaseThreeOverlay();
                try { playMiniBossBurstEffect(idx, true); } catch (e) { }
                try { playSfx('boss_level'); } catch (e) { }
                let phase3Spawned = 0;
                if (state[idx] !== null && specialState[idx] === 'boss') {
                    const phase3Hp = getBoss20ScaledHp(EPIC_BOSS20_PHASE3_HP);
                    meta.phase = 3;
                    meta.hp = phase3Hp;
                    meta.maxHp = phase3Hp;
                    meta.breaks = { b75: false, b50: false, b25: false };
                    specialMetaState[idx] = meta;
                    boss20State.active = true;
                    boss20State.phase = 3;
                    boss20State.hp = phase3Hp;
                    boss20State.maxHp = phase3Hp;
                    boss20State.actionCadenceMs = EPIC_BOSS20_PHASE3_ACTION_MS;
                    boss20State.actionCounter = 0;
                    boss20State.inFinalWindow = false;
                    boss20State.finalWindowUntil = 0;
                    boss20State.finalChargeUntil = 0;
                    boss20State.heroMarkCell = idx;
                    boss20State.heroMarkUntil = 0;
                    boss20State.weakPointUntil = 0;
                    boss20State.nextHeroMarkAt = Date.now() + Math.max(1200, Math.floor(EPIC_BOSS20_HERO_MARK_EVERY_MS * 0.5));
                    boss20State.phase3Started = true;
                    boss20State.phase2DesperationActive = false;
                    boss20State.phase2DesperationStartedAt = 0;
                    boss20State.phase2RescueQueued = false;
                    boss20State.phase2LastRegenAt = 0;
                    boss20State.phase3LastRegenAt = 0;
                    boss20State.phase3LastClickDrainAt = 0;
                    boss20State.phase2OmegaQueued = false;
                    phase3Spawned = populateBoss20Phase3Board(idx);
                    setMiniBossStateFromMeta(idx, meta);
                }
                try { render(); } catch (e) { scheduleRender(); }
                scheduleRender();
                waitForBoss20CinematicAcknowledge(overlay).then(() => {
                    try { if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); } catch (e) { }
                    if (sourceBoardGeneration !== boardGeneration) {
                        boss20State.inCinematic = false;
                        inputLocked = false;
                        return;
                    }
                    if (state[idx] === null || specialState[idx] !== 'boss') {
                        boss20State.inCinematic = false;
                        inputLocked = false;
                        return;
                    }
                    boss20State.inCinematic = false;
                    inputLocked = false;
                    const surgeMsg = phase3Spawned > 0 ? ` Surge detected: ${phase3Spawned} hostiles restored.` : '';
                    Assistant.show('Strike the weak-points.' + surgeMsg, { priority: 2 });
                    queueBoss20Phase3EntryPressure(idx);
                    scheduleRender();
                    ensureBoss20PhaseTimer();
                });
                return true;
            }

            function triggerBoss20FalseVictoryTransition(index, meta, tracker = null) {
                if (!isEpicBoss20Level()) return false;
                if (!meta || !meta.isBoss) return false;
                if ((Number(boss20State.phase) || 1) !== 1) return false;
                if (boss20State.inCinematic) return true;
                const idx = Math.floor(Number(index));
                if (!Number.isFinite(idx) || idx < 0 || idx >= state.length) return false;
                boss20State.inCinematic = true;
                // Keep phase-1 boss visibly at 1 HP until the break sequence starts.
                meta.phase = 1;
                meta.hp = 1;
                meta.maxHp = Math.max(1, Number(meta.maxHp) || getBoss20ScaledHp(EPIC_BOSS20_PHASE1_HP));
                specialMetaState[idx] = meta;
                boss20State.active = true;
                boss20State.phase = 1;
                boss20State.hp = 1;
                boss20State.maxHp = Math.max(1, Number(meta.maxHp) || 1);
                try { setMiniBossStateFromMeta(idx, meta); } catch (e) { }
                try { scheduleRender(); } catch (e) { }
                stopBoss20PhaseTimer();
                inputLocked = true;
                const sourceBoardGeneration = boardGeneration;
                const abortTransition = () => {
                    setBoss20BoardFreeze(false);
                    boss20State.inCinematic = false;
                    inputLocked = false;
                };
                const startPhaseBreak = () => runBoss20Phase2BreakSequence(idx, sourceBoardGeneration).then((ok) => {
                    if (!ok || sourceBoardGeneration !== boardGeneration) {
                        abortTransition();
                        return;
                    }
                    let phase2Spawned = 0;
                    if (state[idx] !== null && specialState[idx] === 'boss') {
                        const phase2Hp = getBoss20ScaledHp(EPIC_BOSS20_PHASE2_HP);
                        meta.phase = 2;
                        meta.hp = phase2Hp;
                        meta.maxHp = phase2Hp;
                        meta.breaks = { b75: false, b50: false, b25: false };
                        specialMetaState[idx] = meta;
                        boss20State.active = true;
                        boss20State.phase = 2;
                        boss20State.hp = phase2Hp;
                        boss20State.maxHp = phase2Hp;
                        boss20State.actionCadenceMs = EPIC_BOSS20_PHASE2_ACTION_MS;
                        boss20State.actionCounter = 0;
                        boss20State.inFinalWindow = false;
                        boss20State.finalWindowUntil = 0;
                        boss20State.finalChargeUntil = 0;
                        boss20State.weakPointUntil = 0;
                        boss20State.heroMarkUntil = 0;
                        boss20State.heroMarkCell = idx;
                        boss20State.nextHeroMarkAt = 0;
                        boss20State.phase3Started = false;
                        boss20State.phase2DesperationActive = false;
                        boss20State.phase2DesperationStartedAt = 0;
                        boss20State.phase2RescueQueued = false;
                        boss20State.phase2LastRegenAt = 0;
                        boss20State.phase2OmegaQueued = false;
                        phase2Spawned = populateBoss20Phase2Board(idx);
                        clicksLeft = Math.min(getMaxClicksCap(), Math.max(0, Number(clicksLeft) || 0) + Math.max(0, Number(EPIC_BOSS20_PHASE_SHIFT_CLICK_REWARD) || 0));
                        setMiniBossStateFromMeta(idx, meta);
                    }
                    try { render(); } catch (e) { scheduleRender(); }
                    playBoss20Phase2SwapShake(idx, EPIC_BOSS20_PHASE2_BREAK_SHAKE_MS);
                    try { playMiniBossBurstEffect(idx, true); } catch (e) { }
                    setTimeout(() => { try { playMiniBossBurstEffect(idx, true); } catch (e) { } }, 260);
                    scheduleRender();
                    updateHUD();
                    const holdMs = Math.max(0, Math.floor(Number(EPIC_BOSS20_PHASE2_POST_SWAP_HOLD_MS) || 2000));
                    setTimeout(() => {
                        if (sourceBoardGeneration !== boardGeneration) {
                            abortTransition();
                            return;
                        }
                        if (state[idx] === null || specialState[idx] !== 'boss') {
                            abortTransition();
                            return;
                        }
                        try { playSfx('boss_level'); } catch (e) { }
                        showBoss20PhaseShiftTalkCutscene(() => {
                            if (sourceBoardGeneration !== boardGeneration) {
                                abortTransition();
                                return;
                            }
                            if (state[idx] === null || specialState[idx] !== 'boss') {
                                abortTransition();
                                return;
                            }
                            boss20State.inCinematic = false;
                            inputLocked = false;
                            const filledMsg = phase2Spawned > 0 ? ` System surge: ${phase2Spawned} hostiles re-seeded.` : '';
                            Assistant.show('Viraxis PRime has reconstituted into a stronger form. Emergency nanobot refill requested.' + filledMsg, { priority: 2 });
                            scheduleRender();
                            updateHUD();
                            ensureBoss20PhaseTimer();
                        });
                    }, holdMs);
                }).catch(() => {
                    abortTransition();
                });

                const waitForCascadeIdle = (cb) => {
                    const startAt = Date.now();
                    const maxWaitMs = 3200;
                    const tick = () => {
                        try {
                            const busy = !!(stormResolving || (typeof particlesActive === 'function' && particlesActive()));
                            if (!busy || (Date.now() - startAt) >= maxWaitMs) {
                                cb();
                                return;
                            }
                        } catch (e) {
                            cb();
                            return;
                        }
                        requestAnimationFrame(tick);
                    };
                    tick();
                };
                waitForCascadeIdle(startPhaseBreak);
                return true;
            }

            function populateBoss20Phase2Board(bossIndex) {
                if (!isEpicBoss20Level()) return 0;
                const idx = Math.floor(Number(bossIndex));
                if (!Number.isFinite(idx) || idx < 0 || idx >= state.length) return 0;
                if (state[idx] === null || specialState[idx] !== 'boss') return 0;
                const total = ROWS * COLS;
                const boardSlots = [];
                for (let i = 0; i < state.length; i++) {
                    if (i === idx) continue;
                    boardSlots.push(i);
                    if (specialState[i] && specialState[i] !== 'boss') {
                        clearSpecialForCell(i);
                    }
                }
                if (!boardSlots.length) return 0;
                const density = Math.max(0.45, Math.min(0.98, Number(EPIC_BOSS20_PHASE2_REPOP_DENSITY) || 0.90));
                const byDensity = Math.round(total * density) - 1; // minus boss cell
                const minNonBoss = Math.max(1, Math.floor(Number(EPIC_BOSS20_PHASE2_REPOP_MIN_NON_BOSS) || 29));
                const maxNonBoss = Math.max(minNonBoss, Math.floor(Number(EPIC_BOSS20_PHASE2_REPOP_MAX_NON_BOSS) || 33));
                const phase2SpawnProfileLevel = getSpawnProfileLevel(19);
                const phase2SpawnProfileCompleted = Math.max(0, Math.min(9, phase2SpawnProfileLevel - 1));
                const targetNonBoss = Math.max(minNonBoss, Math.min(Math.min(maxNonBoss, boardSlots.length), Math.max(minNonBoss, byDensity)));
                shuffle(boardSlots);
                let spawned = 0;
                for (let i = 0; i < boardSlots.length; i++) {
                    const cellIndex = boardSlots[i];
                    if (i < targetNonBoss) {
                        state[cellIndex] = sampleBoss20Phase2Size(phase2SpawnProfileLevel, phase2SpawnProfileCompleted);
                        spawned++;
                    } else {
                        state[cellIndex] = null;
                    }
                    clearSpecialForCell(cellIndex);
                }
                return spawned;
            }

            function populateBoss20PostRescueBoard(bossIndex) {
                if (!isEpicBoss20Level()) return 0;
                const idx = Math.floor(Number(bossIndex));
                if (!Number.isFinite(idx) || idx < 0 || idx >= state.length) return 0;
                if (state[idx] === null || specialState[idx] !== 'boss') return 0;
                const coreSet = new Set(getBoss20CoreCells());
                const boardSlots = [];
                for (let i = 0; i < state.length; i++) {
                    if (i === idx) continue;
                    if (coreSet.has(i)) {
                        state[i] = null;
                        clearSpecialForCell(i);
                        clearBossGooShieldAt(i);
                        clearBiofilmAt(i);
                        continue;
                    }
                    boardSlots.push(i);
                    clearSpecialForCell(i);
                }
                if (!boardSlots.length) return 0;
                const spawnProfileLevel = getSpawnProfileLevel(18);
                const spawnProfileCompleted = Math.max(0, Math.min(9, spawnProfileLevel - 1));
                const difficulty = getDifficultyForLevel(spawnProfileLevel);
                const baseDensity = Math.max(0, Math.min(1, Number(difficulty.baseDensity) || 0.60));
                const densityGrowth = Math.max(0, Number(difficulty.densityGrowth) || 0);
                const density = Math.max(0.52, Math.min(0.74, baseDensity + (spawnProfileCompleted * densityGrowth)));
                const targetOccupied = Math.round((ROWS * COLS) * density);
                const targetNonBoss = Math.max(18, Math.min(Math.min(24, boardSlots.length), Math.max(18, targetOccupied - 1)));
                shuffle(boardSlots);
                let spawned = 0;
                for (let i = 0; i < boardSlots.length; i++) {
                    const cellIndex = boardSlots[i];
                    if (i < targetNonBoss) {
                        state[cellIndex] = sampleSizeRandom(spawnProfileLevel, spawnProfileCompleted);
                        setSpecialForCell(cellIndex, rollSpecialVirusType(18));
                        spawned++;
                    } else {
                        state[cellIndex] = null;
                        clearSpecialForCell(cellIndex);
                    }
                }
                return spawned;
            }

            function populateBoss20Phase3Board(bossIndex) {
                if (!isEpicBoss20Level()) return 0;
                const idx = Math.floor(Number(bossIndex));
                if (!Number.isFinite(idx) || idx < 0 || idx >= state.length) return 0;
                if (state[idx] === null || specialState[idx] !== 'boss') return 0;
                const openingMix = Array.isArray(EPIC_BOSS20_PHASE3_OPENING_MIX) && EPIC_BOSS20_PHASE3_OPENING_MIX.length >= 4
                    ? EPIC_BOSS20_PHASE3_OPENING_MIX
                    : [0.24, 0.34, 0.28, 0.14];
                const sampleOpeningSize = () => {
                    const total = openingMix.reduce((a, b) => a + Math.max(0, Number(b) || 0), 0) || 1;
                    let roll = Math.random() * total;
                    for (let i = 0; i < 4; i++) {
                        roll -= Math.max(0, Number(openingMix[i]) || 0);
                        if (roll <= 0) return i;
                    }
                    return 2;
                };
                const total = ROWS * COLS;
                const spawnProfileLevel = Math.max(1, getSpawnProfileLevel(15));
                const spawnProfileCompleted = Math.max(0, Math.min(9, spawnProfileLevel - 1));
                const difficulty = getDifficultyForLevel(spawnProfileLevel);
                const baseDensity = Math.max(0, Math.min(1, Number(difficulty.baseDensity) || 0.60));
                const densityGrowth = Math.max(0, Number(difficulty.densityGrowth) || 0);
                const density = Math.min(0.98, baseDensity + (spawnProfileCompleted * densityGrowth) + 0.18);
                const targetOccupied = Math.max(30, Math.min(total - 1, Math.round(total * density)));
                const targetNonBoss = Math.max(28, targetOccupied - 1);

                let occupiedNonBoss = 0;
                const empties = [];
                for (let i = 0; i < state.length; i++) {
                    if (i === idx) continue;
                    if (isBoss20FinalFormCell(i)) continue;
                    if (state[i] === null) {
                        empties.push(i);
                        continue;
                    }
                    occupiedNonBoss++;
                    if (specialState[i] && specialState[i] !== 'boss') {
                        clearSpecialForCell(i);
                    }
                }
                if (occupiedNonBoss >= targetNonBoss || !empties.length) return 0;
                shuffle(empties);
                const addCount = Math.max(0, Math.min(empties.length, targetNonBoss - occupiedNonBoss));
                for (let k = 0; k < addCount; k++) {
                    const cellIndex = empties[k];
                    state[cellIndex] = sampleOpeningSize();
                    clearSpecialForCell(cellIndex);
                }
                return addCount;
            }

            function queueBoss20Phase3EntryPressure(originIndex) {
                const idx = Math.floor(Number(originIndex));
                if (!Number.isFinite(idx) || idx < 0 || idx >= state.length) return;
                const sourceBoardGeneration = boardGeneration;
                const pulses = Math.max(1, Math.floor(Number(EPIC_BOSS20_PHASE3_ENTRY_BURSTS) || 4));
                const gapMs = Math.max(120, Math.floor(Number(EPIC_BOSS20_PHASE3_ENTRY_BURST_INTERVAL_MS) || 260));
                for (let i = 0; i < pulses; i++) {
                    setTimeout(() => {
                        try {
                            if (sourceBoardGeneration !== boardGeneration) return;
                            if (!hasActiveBoss20Combat()) return;
                            if (Math.max(1, Math.floor(Number(boss20State.phase) || 1)) < 3) return;
                            if (boss20State.inCinematic || isBlockingPopupOpen()) return;
                            const burstCount = 2 + (Math.random() < 0.6 ? 1 : 0);
                            let spawned = spawnBossArmorPulse(burstCount, idx, { anyBoardChance: 0.95, offAxisChance: 0.52 });
                            if (spawned <= 0) spawned = applyBoss20ArmorThreat(idx, 1);
                            if (spawned > 0) scheduleRender();
                        } catch (e) { }
                    }, 140 + (i * gapMs));
                }
            }

            function isBiofilmEnabled(levelNum = getCurrentLevelNumber()) {
                if (isEnduranceMode()) return false;
                const lvl = Math.max(1, Math.floor(Number(levelNum) || 1));
                return !!(BIOFILM_CONFIG && BIOFILM_CONFIG.enabled !== false && lvl >= Math.max(1, Math.floor(Number(BIOFILM_CONFIG.unlockLevel) || 10)));
            }

            function stopBiofilmTimer() {
                if (!biofilmTimer) return;
                clearTimeout(biofilmTimer);
                biofilmTimer = null;
            }

            function resetBiofilmState(stopTimer = true) {
                for (let i = 0; i < biofilmHits.length; i++) biofilmHits[i] = 0;
                for (let i = 0; i < biofilmUntil.length; i++) biofilmUntil[i] = 0;
                for (let i = 0; i < biofilmStyle.length; i++) biofilmStyle[i] = null;
                if (stopTimer) stopBiofilmTimer();
            }

            function clearBiofilmAt(index) {
                const i = Math.floor(Number(index));
                if (!Number.isFinite(i) || i < 0 || i >= biofilmHits.length) return false;
                if ((Number(biofilmHits[i]) || 0) <= 0) return false;
                biofilmHits[i] = 0;
                biofilmUntil[i] = 0;
                biofilmStyle[i] = null;
                return true;
            }

            function hasBiofilmAt(index) {
                const i = Math.floor(Number(index));
                if (!Number.isFinite(i) || i < 0 || i >= biofilmHits.length) return false;
                if ((Number(biofilmHits[i]) || 0) <= 0) return false;
                return true;
            }

            function makeBiofilmStyle() {
                return {
                    radius: '50%',
                    scale: (0.95 + (Math.random() * 0.10)).toFixed(2),
                    sizePct: `${Math.round(60 + (Math.random() * 12))}%`,
                    sheenX: `${Math.round(32 + (Math.random() * 22))}%`,
                    sheenY: `${Math.round(24 + (Math.random() * 18))}%`,
                    wobbleMs: `${Math.round(1200 + (Math.random() * 420))}ms`,
                    wobbleDelay: `${Math.round(-500 + (Math.random() * 500))}ms`,
                    appliedAt: Date.now()
                };
            }

            function applyBiofilmAt(index, opts = null) {
                const i = Math.floor(Number(index));
                if (!Number.isFinite(i) || i < 0 || i >= state.length) return false;
                if (isBoss20FinalFormCell(i)) return false;
                if (state[i] !== null) return false;
                if (specialState[i] === 'boss') return false;
                const options = opts || {};
                biofilmHits[i] = Math.max(1, Math.floor(Number(options.hits) || Number(BIOFILM_CONFIG.maxHitsPerCell) || 1));
                biofilmUntil[i] = Number.MAX_SAFE_INTEGER;
                biofilmStyle[i] = makeBiofilmStyle();
                return true;
            }

            function consumeBiofilmHit(index) {
                const i = Math.floor(Number(index));
                if (!Number.isFinite(i) || i < 0 || i >= state.length) return false;
                if (!hasBiofilmAt(i)) return false;
                biofilmHits[i] = Math.max(0, Number(biofilmHits[i]) - 1);
                if (biofilmHits[i] <= 0) {
                    biofilmUntil[i] = 0;
                    biofilmStyle[i] = null;
                }
                return true;
            }

            function pruneBiofilmCells() {
                let changed = false;
                for (let i = 0; i < biofilmHits.length; i++) {
                    const hasHits = (Number(biofilmHits[i]) || 0) > 0;
                    if (!hasHits) continue;
                    if ((Number(biofilmHits[i]) || 0) <= 0) {
                        biofilmHits[i] = 0;
                        biofilmUntil[i] = 0;
                        biofilmStyle[i] = null;
                        changed = true;
                    }
                }
                return changed;
            }

            function getBiofilmTargetCount(levelNum = getCurrentLevelNumber()) {
                const lvl = Math.max(1, Math.floor(Number(levelNum) || 1));
                const bands = (BIOFILM_CONFIG && Array.isArray(BIOFILM_CONFIG.countsByBand)) ? BIOFILM_CONFIG.countsByBand : [];
                for (let i = 0; i < bands.length; i++) {
                    const b = bands[i] || {};
                    const min = Math.max(1, Math.floor(Number(b.minLevel) || 1));
                    const max = Math.max(min, Math.floor(Number(b.maxLevel) || 999));
                    if (lvl >= min && lvl <= max) return Math.max(0, Math.floor(Number(b.count) || 0));
                }
                return 0;
            }

            function seedBiofilmForBoard(force = false, levelNum = getCurrentLevelNumber()) {
                if (!isBiofilmEnabled(levelNum)) return 0;
                if (!force) return 0;
                const target = Math.max(0, getBiofilmTargetCount(levelNum));
                let active = 0;
                const candidates = [];
                for (let i = 0; i < state.length; i++) {
                    if (hasBiofilmAt(i)) {
                        active++;
                        continue;
                    }
                    if (state[i] === null && specialState[i] !== 'boss') candidates.push(i);
                }
                if (active >= target || !candidates.length) return 0;
                shuffle(candidates);
                const need = Math.max(0, Math.min(candidates.length, target - active));
                let added = 0;
                for (let i = 0; i < need; i++) {
                    if (applyBiofilmAt(candidates[i])) added++;
                }
                return added;
            }

            function playBiofilmAbsorbFx(index) {
                if (!Number.isFinite(index) || !boardEl) return;
                try {
                    const cell = boardEl.querySelector(`[data-index='${Math.floor(Number(index))}']`);
                    if (!cell) return;
                    cell.classList.remove('biofilm-hit');
                    void cell.offsetWidth;
                    cell.classList.add('biofilm-hit');
                    setTimeout(() => { try { cell.classList.remove('biofilm-hit'); } catch (e) { } }, 300);
                    const r = cell.getBoundingClientRect();
                    const fx = document.createElement('div');
                    fx.className = 'biofilm-absorb-fx';
                    fx.style.left = Math.round(r.left + (r.width * 0.5)) + 'px';
                    fx.style.top = Math.round(r.top + (r.height * 0.5)) + 'px';
                    document.body.appendChild(fx);
                    setTimeout(() => { try { fx.remove(); } catch (e) { } }, 360);
                } catch (e) { }
            }

            function ensureBiofilmTimer() {
                stopBiofilmTimer();
            }

            function stopBossGooShieldTimer() {
                if (!bossGooShieldTimer) return;
                clearTimeout(bossGooShieldTimer);
                bossGooShieldTimer = null;
            }

            function resetBossGooShieldState(stopTimer = true) {
                for (let i = 0; i < bossGooShieldHits.length; i++) bossGooShieldHits[i] = 0;
                for (let i = 0; i < bossGooShieldStyle.length; i++) bossGooShieldStyle[i] = null;
                if (stopTimer) stopBossGooShieldTimer();
            }

            function clearBossGooShieldAt(index) {
                const i = Math.floor(Number(index));
                if (!Number.isFinite(i) || i < 0 || i >= bossGooShieldHits.length) return false;
                if ((Number(bossGooShieldHits[i]) || 0) <= 0) return false;
                bossGooShieldHits[i] = 0;
                bossGooShieldStyle[i] = null;
                return true;
            }

            function hasBossGooShield(index) {
                const i = Math.floor(Number(index));
                if (!Number.isFinite(i) || i < 0 || i >= bossGooShieldHits.length) return false;
                if (state[i] === null) return false;
                return (Number(bossGooShieldHits[i]) || 0) > 0;
            }

            function makeBossGooShieldStyle() {
                const pct = () => `${Math.round(28 + (Math.random() * 44))}%`;
                const rot = `${Math.round(-18 + (Math.random() * 36))}deg`;
                const scale = (0.9 + (Math.random() * 0.3)).toFixed(2);
                const ox = `${Math.round(-6 + (Math.random() * 12))}%`;
                const oy = `${Math.round(-6 + (Math.random() * 12))}%`;
                const shineX = `${Math.round(24 + (Math.random() * 40))}%`;
                const shineY = `${Math.round(18 + (Math.random() * 34))}%`;
                const radius = `${pct()} ${pct()} ${pct()} ${pct()} / ${pct()} ${pct()} ${pct()} ${pct()}`;
                return {
                    radius,
                    rot,
                    scale,
                    ox,
                    oy,
                    shineX,
                    shineY,
                    appliedAt: Date.now()
                };
            }

            function applyBossGooShieldAt(index) {
                const i = Math.floor(Number(index));
                if (!Number.isFinite(i) || i < 0 || i >= state.length) return false;
                if (state[i] === null) return false;
                if (specialState[i] === 'boss') return false;
                bossGooShieldHits[i] = 1;
                bossGooShieldStyle[i] = makeBossGooShieldStyle();
                return true;
            }

            function consumeBossGooShieldHit(index) {
                const i = Math.floor(Number(index));
                if (!Number.isFinite(i) || i < 0 || i >= state.length) return false;
                if ((Number(bossGooShieldHits[i]) || 0) <= 0) return false;
                bossGooShieldHits[i] = Math.max(0, Number(bossGooShieldHits[i]) - 1);
                if (bossGooShieldHits[i] <= 0) {
                    bossGooShieldStyle[i] = null;
                }
                return true;
            }

            function pruneBossGooShields() {
                let changed = false;
                for (let i = 0; i < bossGooShieldHits.length; i++) {
                    if ((Number(bossGooShieldHits[i]) || 0) <= 0) continue;
                    if (state[i] === null) {
                        bossGooShieldHits[i] = 0;
                        bossGooShieldStyle[i] = null;
                        changed = true;
                    }
                }
                return changed;
            }

            function triggerBossGooShieldSpit(reason = 'timer') {
                if (!isBossGooShieldLevel()) return 0;
                if (isBlockingPopupOpen()) return 0;
                const bosses = getBossIndicesForLevel(BOSS_GOO_SHIELD_CONFIG.level);
                if (!bosses.length) return 0;
                const preferred = [];
                const fallback = [];
                for (let i = 0; i < state.length; i++) {
                    if (state[i] === null) continue;
                    if (specialState[i] === 'boss') continue;
                    if ((Number(bossGooShieldHits[i]) || 0) > 0) fallback.push(i);
                    else preferred.push(i);
                }
                const pool = preferred.length ? preferred : fallback;
                if (!pool.length) return 0;
                const sourceBoardGeneration = boardGeneration;
                const bossIndex = bosses[Math.floor(Math.random() * bosses.length)];
                const bossMeta = specialMetaState[bossIndex] || {};
                const bossLevel = Math.max(1, Math.floor(Number(bossMeta.bossLevel) || getCurrentLevelNumber()));
                const targetIndex = pool[Math.floor(Math.random() * pool.length)];
                const applyAtImpact = () => {
                    if (sourceBoardGeneration !== boardGeneration) return;
                    if (isBlockingPopupOpen()) return;
                    if (applyBossGooShieldAt(targetIndex)) {
                        try { playSfx(bossLevel === 10 ? 'goop' : 'miniboss_laugh'); } catch (e) { }
                        try { ensureBossBoardFuel(bossLevel, bossIndex); } catch (e) { }
                        scheduleRender();
                    }
                };
                playBossGooShieldProjectile(bossIndex, targetIndex, applyAtImpact);
                return 1;
            }

            function ensureBossGooShieldTimer() {
                if (!isBossGooShieldLevel() || !hasActiveBossForLevel(BOSS_GOO_SHIELD_CONFIG.level)) {
                    stopBossGooShieldTimer();
                    return;
                }
                if (bossGooShieldTimer) return;
                if (isBlockingPopupOpen()) {
                    bossGooShieldTimer = setTimeout(() => {
                        bossGooShieldTimer = null;
                        ensureBossGooShieldTimer();
                    }, 420);
                    return;
                }
                const minMs = Math.max(350, Math.floor(Number(BOSS_GOO_SHIELD_CONFIG.tickMinMs) || 2100));
                const maxMs = Math.max(minMs, Math.floor(Number(BOSS_GOO_SHIELD_CONFIG.tickMaxMs) || 3400));
                const delay = minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
                const sourceBoardGeneration = boardGeneration;
                bossGooShieldTimer = setTimeout(() => {
                    bossGooShieldTimer = null;
                    if (sourceBoardGeneration !== boardGeneration) {
                        ensureBossGooShieldTimer();
                        return;
                    }
                    if (isBossGooShieldLevel() && hasActiveBossForLevel(BOSS_GOO_SHIELD_CONFIG.level)) {
                        triggerBossGooShieldSpit('timer');
                    }
                    ensureBossGooShieldTimer();
                }, delay);
            }

            function setMiniBossStateFromMeta(index, meta) {
                const hp = Math.max(0, Number(meta && meta.hp) || 0);
                const maxHp = Math.max(1, Number(meta && meta.maxHp) || hp || 1);
                miniBossState = { active: hp > 0, index: Number(index), hp, maxHp };
            }

            function clearMiniBossState() {
                miniBossState = { active: false, index: -1, hp: 0, maxHp: 0 };
            }

            function syncMiniBossStateFromBoard() {
                for (let i = 0; i < specialState.length; i++) {
                    if (specialState[i] !== 'boss') continue;
                    const meta = specialMetaState[i] || {};
                    if (meta.isProjection) continue;
                    const hp = Math.max(0, Number(meta.hp) || 0);
                    const maxHp = Math.max(1, Number(meta.maxHp) || hp || 1);
                    if (hp > 0) {
                        miniBossState = { active: true, index: i, hp, maxHp };
                        return miniBossState;
                    }
                }
                clearMiniBossState();
                return miniBossState;
            }

            function getLineSpawnCandidates(originIndex, dr, dc) {
                const out = [];
                if (!Number.isFinite(originIndex)) return out;
                let r = Math.floor(Number(originIndex) / COLS);
                let c = Number(originIndex) % COLS;
                while (true) {
                    r += dr;
                    c += dc;
                    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) break;
                    const idx = r * COLS + c;
                    if (isBoss20FinalFormCell(idx)) continue;
                    if (state[idx] === null && !hasBiofilmAt(idx)) out.push(idx);
                }
                return out;
            }

            function spawnBossArmorPulse(count = 2, originIndex = null, opts = null) {
                const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                const offAxisChance = Math.max(0, Math.min(1, Number(opts && opts.offAxisChance) || 0));
                const anyBoardChance = Math.max(0, Math.min(1, Number(opts && opts.anyBoardChance) || 0));
                const spawnSizeRaw = Number(opts && opts.spawnSize);
                const spawnSize = Number.isFinite(spawnSizeRaw) ? Math.max(0, Math.min(MAX_SIZE, Math.floor(spawnSizeRaw))) : MAX_SIZE;
                let spawnSizeWeights = Array.isArray(opts && opts.spawnSizeWeights) ? opts.spawnSizeWeights.slice(0, 4) : null;
                const pickSpawnSize = () => {
                    if (!spawnSizeWeights || spawnSizeWeights.length < 4) return spawnSize;
                    const weights = spawnSizeWeights.map((w) => Math.max(0, Number(w) || 0));
                    const total = weights.reduce((acc, n) => acc + n, 0);
                    if (total <= 0) return spawnSize;
                    let roll = Math.random() * total;
                    for (let i = 0; i < 4; i++) {
                        roll -= weights[i];
                        if (roll <= 0) return Math.max(0, Math.min(MAX_SIZE, i));
                    }
                    return spawnSize;
                };
                let candidates = [];
                let bossLevel = getCurrentLevelNumber();
                let originRow = -1;
                let originCol = -1;
                if (Number.isFinite(originIndex)) {
                    const bossMeta = specialMetaState[Math.floor(Number(originIndex))] || {};
                    bossLevel = Math.max(1, Math.floor(Number(bossMeta.bossLevel) || bossLevel));
                    originRow = Math.floor(Number(originIndex) / COLS);
                    originCol = Number(originIndex) % COLS;
                }
                const phaseContext = getBossPhaseContext(bossLevel, originIndex);
                const pacingProfile = getBossPacingProfile(bossLevel, phaseContext);
                if (!spawnSizeWeights && Array.isArray(pacingProfile.spawnSizeWeights)) {
                    spawnSizeWeights = pacingProfile.spawnSizeWeights.slice(0, 4);
                }
                const armoredChanceFromOpts = Number(opts && opts.armoredChance);
                const armoredChance = clamp01(
                    Number.isFinite(armoredChanceFromOpts)
                        ? armoredChanceFromOpts
                        : (Number.isFinite(Number(pacingProfile.armoredChance)) ? Number(pacingProfile.armoredChance) : (bossLevel === 10 ? 0.5 : 1))
                );
                const useLevel5SummonFx = (bossLevel === 5 && Number.isFinite(originIndex));
                const anyCandidates = [];
                for (let i = 0; i < state.length; i++) {
                    if (isBoss20FinalFormCell(i)) continue;
                    if (state[i] === null && !hasBiofilmAt(i)) anyCandidates.push(i);
                }
                if (!anyCandidates.length) return 0;
                let offAxisCandidates = [];
                if (Number.isFinite(originIndex)) {
                    offAxisCandidates = anyCandidates.filter((i) => {
                        const row = Math.floor(i / COLS);
                        const col = i % COLS;
                        return row !== originRow && col !== originCol;
                    });
                }
                if (Number.isFinite(originIndex)) {
                    const order = dirs.slice();
                    shuffle(order);
                    for (let i = 0; i < order.length; i++) {
                        const [dr, dc] = order[i];
                        const line = getLineSpawnCandidates(originIndex, dr, dc);
                        if (line.length) {
                            candidates = line;
                            break;
                        }
                    }
                }
                if (!candidates.length) {
                    candidates = anyCandidates.slice();
                }
                shuffle(candidates);
                shuffle(anyCandidates);
                shuffle(offAxisCandidates);
                const used = new Set();
                const takeFrom = (pool) => {
                    while (pool && pool.length) {
                        const pick = pool.pop();
                        if (!Number.isFinite(pick)) continue;
                        if (used.has(pick)) continue;
                        if (isBoss20FinalFormCell(pick)) continue;
                        if (state[pick] !== null || hasBiofilmAt(pick)) continue;
                        used.add(pick);
                        return pick;
                    }
                    return null;
                };
                const n = Math.max(0, Math.min(anyCandidates.length, Math.floor(Number(count) || 0)));
                if (n > 0 && useLevel5SummonFx) {
                    playBossSummonPulse(originIndex);
                }
                let spawned = 0;
                for (let k = 0; k < n; k++) {
                    const useAny = anyBoardChance > 0 && anyCandidates.length > 0 && Math.random() < anyBoardChance;
                    const useOffAxis = offAxisChance > 0 && offAxisCandidates.length > 0 && Math.random() < offAxisChance;
                    let idx = useAny ? takeFrom(anyCandidates) : null;
                    if (idx === null && useOffAxis) idx = takeFrom(offAxisCandidates);
                    if (idx === null) idx = takeFrom(candidates);
                    if (idx === null && !useOffAxis) idx = takeFrom(offAxisCandidates);
                    if (idx === null) idx = takeFrom(anyCandidates);
                    if (idx === null) break;
                    state[idx] = pickSpawnSize();
                    const shouldArmored = Math.random() < armoredChance;
                    if (shouldArmored) setSpecialForCell(idx, 'armored');
                    else clearSpecialForCell(idx);
                    if (useLevel5SummonFx) {
                        playBossSummonTravelFx(originIndex, idx);
                        playBossSpawnStamp(idx);
                    }
                    playVirusSpawnBurstEffect(idx);
                    spawned++;
                }
                // Keep a minimum amount of board fuel during boss encounters.
                const fueled = ensureBossBoardFuel(bossLevel, originIndex, {
                    phaseContext,
                    fuelSpawnSizeWeights: pacingProfile.fuelSpawnSizeWeights,
                    fuelArmoredChance: pacingProfile.fuelArmoredChance
                });
                if (spawned > 0) {
                    const suppressSpawnVoice = (bossLevel === 20 && isEpicBoss20Level() && boss20State && boss20State.rescueUsed);
                    if (!suppressSpawnVoice) {
                        if (bossLevel === 5) {
                            try { playSfx('level5_boss_hit'); } catch (e) { }
                        } else if (bossLevel === 10) {
                            try { playSfx('goop'); } catch (e) { }
                        } else if (!playBoss20LaughThrottled(2800)) {
                            try { playSfx('miniboss_laugh'); } catch (e) { }
                        }
                    }
                    scheduleRender();
                }
                return spawned + Math.max(0, Number(fueled) || 0);
            }

            function spawnBossProjectionPulse(count = 2, originIndex = null) {
                let bossLevel = getCurrentLevelNumber();
                if (Number.isFinite(originIndex)) {
                    const bossMeta = specialMetaState[Math.floor(Number(originIndex))] || {};
                    bossLevel = Math.max(1, Math.floor(Number(bossMeta.bossLevel) || bossLevel));
                }
                const summonTone = bossLevel === 15 ? 'blue' : 'red';
                const candidates = [];
                if (Number.isFinite(originIndex)) {
                    const origin = Math.floor(Number(originIndex));
                    const originRow = Math.floor(origin / COLS);
                    const originCol = origin % COLS;
                    for (let i = 0; i < state.length; i++) {
                        if (isBoss20FinalFormCell(i)) continue;
                        if (state[i] !== null) continue;
                        if (hasBiofilmAt(i)) continue;
                        const row = Math.floor(i / COLS);
                        const col = i % COLS;
                        if (row === originRow || col === originCol) candidates.push(i);
                    }
                }
                if (!candidates.length) {
                    for (let i = 0; i < state.length; i++) {
                        if (isBoss20FinalFormCell(i)) continue;
                        if (state[i] === null && !hasBiofilmAt(i)) candidates.push(i);
                    }
                }
                if (!candidates.length) return 0;
                shuffle(candidates);
                const n = Math.max(0, Math.min(candidates.length, Math.floor(Number(count) || 0)));
                if (n > 0 && Number.isFinite(originIndex)) {
                    playBossSummonPulse(originIndex, summonTone);
                }
                for (let k = 0; k < n; k++) {
                    const idx = candidates[k];
                    state[idx] = 3;
                    specialState[idx] = 'boss';
                    specialMetaState[idx] = {
                        isBoss: true,
                        isProjection: true,
                        hp: 1,
                        maxHp: 1,
                        bossLevel: Math.max(1, Math.floor(Number(bossLevel) || 15)),
                        breaks: null
                    };
                    if (Number.isFinite(originIndex)) {
                        playBossSummonTravelFx(originIndex, idx, summonTone);
                        playBossSpawnStamp(idx, summonTone);
                    } else {
                        playMiniBossBurstEffect(idx, false);
                    }
                }
                if (n > 0) {
                    try { playSfx(bossLevel === 15 ? 'techno_duplicator' : 'fill'); } catch (e) { }
                    scheduleRender();
                }
                return n;
            }

            function getBossBreakpointConfig(meta) {
                const bossLevel = Math.max(1, Math.floor(Number(meta && meta.bossLevel) || getCurrentLevelNumber()));
                if (bossLevel === 20) {
                    const phase = Math.max(1, Math.floor(Number(meta && meta.phase) || Number(boss20State && boss20State.phase) || 1));
                    if (phase >= 3) return BOSS_BREAKPOINT_PROFILE[20].phase3 || null;
                    if (phase === 2) {
                        if (isBoss20Phase2DesperationActive()) return BOSS_BREAKPOINT_PROFILE[20].phase2Desperation || BOSS_BREAKPOINT_PROFILE[20].phase2 || null;
                        return BOSS_BREAKPOINT_PROFILE[20].phase2 || null;
                    }
                    return BOSS_BREAKPOINT_PROFILE[20].phase1 || null;
                }
                return BOSS_BREAKPOINT_PROFILE[bossLevel] || null;
            }

            function maybeTriggerBossBreakpoint(meta, originIndex = null) {
                if (!meta || !meta.maxHp) return;
                if (!meta.breaks) meta.breaks = { b75: false, b50: false, b25: false };
                const bossLevel = Math.max(1, Math.floor(Number(meta.bossLevel) || getCurrentLevelNumber()));
                const cfg = getBossBreakpointConfig(meta) || {};
                const counts = (cfg && cfg.counts) || {};
                const count75 = Math.max(0, Math.floor(Number(counts.b75) || 1));
                const count50 = Math.max(0, Math.floor(Number(counts.b50) || 2));
                const count25 = Math.max(0, Math.floor(Number(counts.b25) || 2));
                const armorOpts = (cfg && cfg.armorOpts) ? Object.assign({}, cfg.armorOpts) : null;
                const useProjection = !!(cfg && cfg.projection) || bossLevel === 15;
                const spawnFn = useProjection
                    ? (count, fromIdx) => spawnBossProjectionPulse(count, fromIdx)
                    : (count, fromIdx) => spawnBossArmorPulse(count, fromIdx, armorOpts);
                const ratio = Math.max(0, Math.min(1, (Number(meta.hp) || 0) / Math.max(1, Number(meta.maxHp) || 1)));
                if (!meta.breaks.b75 && ratio <= 0.75) { meta.breaks.b75 = true; if (count75 > 0) spawnFn(count75, originIndex); }
                if (!meta.breaks.b50 && ratio <= 0.50) { meta.breaks.b50 = true; if (count50 > 0) spawnFn(count50, originIndex); }
                if (!meta.breaks.b25 && ratio <= 0.25) { meta.breaks.b25 = true; if (count25 > 0) spawnFn(count25, originIndex); }
            }

            function popBossProjectionsForLevel(levelNum, tracker = null, skipIndex = -1) {
                const lvl = Math.max(1, Math.floor(Number(levelNum) || 1));
                const skip = Math.floor(Number(skipIndex));
                let removed = 0;
                for (let i = 0; i < specialState.length; i++) {
                    if (i === skip) continue;
                    if (specialState[i] !== 'boss') continue;
                    const m = specialMetaState[i] || {};
                    if (!m.isProjection) continue;
                    const pLevel = Math.max(1, Math.floor(Number(m.bossLevel) || lvl));
                    if (pLevel !== lvl) continue;
                    try { popAt(i, tracker, { projectionFx: true }); } catch (e) { }
                    state[i] = null;
                    clearSpecialForCell(i);
                    removed++;
                }
                return removed;
            }

            function resolveBossDefeat(index, meta, tracker = null) {
                const idx = Math.floor(Number(index));
                if (!Number.isFinite(idx) || idx < 0 || idx >= state.length) return false;
                const m = meta || specialMetaState[idx] || {};
                const bossLevel = Math.max(1, Math.floor(Number(m.bossLevel) || getCurrentLevelNumber()));
                const isEpic20 = (bossLevel === 20 && isEpicBoss20Level());
                const bossPhase = Math.max(1, Math.floor(Number(m.phase) || Number(boss20State && boss20State.phase) || 1));
                const shouldTriggerFinale = isEpic20 && bossPhase >= 3;
                playMiniBossBurstEffect(idx, true);
                if (isEpic20) {
                    try { showBoss20FinalBurstFx(idx); } catch (e) { }
                }
                try { popAt(idx, tracker); } catch (e) { }
                state[idx] = null;
                clearSpecialForCell(idx);
                if (bossLevel === 15) {
                    popBossProjectionsForLevel(15, tracker, idx);
                }
                if (bossLevel === 20) {
                    stopBoss20PhaseTimer();
                    resetBoss20State();
                }
                syncMiniBossStateFromBoard();
                if (shouldTriggerFinale) {
                    triggerLevel20FinalVictorySequence(idx, tracker);
                    return true;
                }
                const bossBonusPenalty = Math.max(0, Number(runPerkState && runPerkState.miniBossBonusPenalty) || 0);
                const bossBonus = Math.max(0, MINI_BOSS_CLICK_BONUS - bossBonusPenalty);
                clicksLeft = Math.min(getMaxClicksCap(), clicksLeft + bossBonus);
                updateHUD();
                try {
                    if (bossLevel === 15) playSfx('techno_dead');
                    else if (bossLevel === 10) playSfx('goop_be_dead');
                    else if (bossLevel === 5) playSfx('level5_boss_dies');
                    else if (isEpic20) playSfx('boss_level');
                    else playSfx('miniboss_dies');
                } catch (e) { }
                return true;
            }

            function applyProjectionDamageToBoss(levelNum, damage = 0.5, tracker = null) {
                const lvl = Math.max(1, Math.floor(Number(levelNum) || 1));
                const dmg = Math.max(0, Number(damage) || 0);
                if (dmg <= 0) return false;
                const bosses = getBossIndicesForLevel(lvl);
                if (!bosses.length) return false;
                const bossIdx = bosses[0];
                const bossMeta = ensureSpecialMeta(bossIdx) || {};
                if (!bossMeta.isBoss || bossMeta.isProjection) return false;
                const hpNow = Math.max(0, Number(bossMeta.hp) || Number(bossMeta.maxHp) || 0);
                if (hpNow <= 0) return false;
                bossMeta.hp = Math.max(0, hpNow - dmg);
                if (bossMeta.hp <= 0) {
                    resolveBossDefeat(bossIdx, bossMeta, tracker);
                    return true;
                }
                setMiniBossStateFromMeta(bossIdx, bossMeta);
                maybeTriggerBossBreakpoint(bossMeta, bossIdx);
                try { playSfx('fill'); } catch (e) { }
                return true;
            }

            function specialHookBossBeforeGrow(ctx) {
                if (!ctx || !Number.isFinite(ctx.index)) return null;
                const idx = Number(ctx.index);
                const meta = ensureSpecialMeta(idx) || {};
                if (!meta.isBoss) return null;
                const isProjection = !!meta.isProjection;
                const bossLevel = Math.max(1, Math.floor(Number(meta.bossLevel) || getCurrentLevelNumber()));
                if (bossLevel === 20 && isEpicBoss20Level() && !!ctx.isUser) {
                    // Level 20 boss entities are immune to direct clicks; damage must come from cascades/other effects.
                    try { playSfx('zap'); } catch (e) { }
                    scheduleRender();
                    return { cancelGrowth: true };
                }
                if (!isProjection && bossLevel === 20 && isEpicBoss20Level() && !Number.isFinite(Number(meta.phase))) {
                    meta.phase = Math.max(1, Math.floor(Number(boss20State && boss20State.phase) || 1));
                }
                if (!isProjection && bossLevel === 20 && isEpicBoss20Level() && boss20State.inCinematic && (Number(meta.phase) || 1) <= 1) {
                    meta.phase = 1;
                    meta.hp = 1;
                    meta.maxHp = Math.max(1, Number(meta.maxHp) || getBoss20ScaledHp(EPIC_BOSS20_PHASE1_HP));
                    specialMetaState[idx] = meta;
                    boss20State.hp = 1;
                    boss20State.maxHp = Math.max(1, Number(meta.maxHp) || 1);
                    try { setMiniBossStateFromMeta(idx, meta); } catch (e) { }
                    scheduleRender();
                    return { cancelGrowth: true };
                }
                const hpNow = Math.max(0, Number(meta.hp) || Number(meta.maxHp) || 1);
                let extraDamage = 0;
                if ((Number(runPerkState.bossBreakerHits) || 0) > 0) {
                    extraDamage = 1;
                    runPerkState.bossBreakerHits = Math.max(0, Number(runPerkState.bossBreakerHits) - 1);
                }
                const totalBaseDamage = 1 + extraDamage;
                const directClickPenalty = (bossLevel === 10 && !!ctx.isUser) ? 0.5 : 1;
                let boss20DamageMult = 1;
                if (!isProjection && bossLevel === 20 && isEpicBoss20Level()) {
                    if (isBoss20WeakPointActive()) boss20DamageMult *= Math.max(1, Number(EPIC_BOSS20_HERO_MARK_DAMAGE_MULT) || 1.6);
                    if (isBoss20FinalWindowActive()) boss20DamageMult *= Math.max(1, Number(EPIC_BOSS20_FINAL_DAMAGE_MULT) || 2);
                }
                const appliedDamage = totalBaseDamage * directClickPenalty * boss20DamageMult;
                meta.hp = Math.max(0, hpNow - appliedDamage);
                if (!isProjection && bossLevel === 20 && isEpicBoss20Level()) {
                    if (!Number.isFinite(Number(meta.phase))) meta.phase = Math.max(1, Math.floor(Number(boss20State.phase) || 1));
                    boss20State.active = true;
                    boss20State.hp = Math.max(0, Number(meta.hp) || 0);
                    boss20State.maxHp = Math.max(1, Number(meta.maxHp) || Number(meta.hp) || 1);
                    if ((Number(meta.phase) || 0) >= 1) {
                        boss20State.phase = Math.max(1, Math.floor(Number(meta.phase) || 1));
                    }
                    const ratio = Math.max(0, Math.min(1, (Number(meta.hp) || 0) / Math.max(1, Number(meta.maxHp) || 1)));
                    if (boss20State.phase === 2 && !boss20State.rescueUsed) {
                        if (ratio <= Math.max(0.05, Math.min(0.95, Number(EPIC_BOSS20_PHASE2_DESPERATION_RATIO) || 0.33))) {
                            enterBoss20Phase2Desperation(idx, meta);
                        }
                        if (isBoss20Phase2DesperationActive()) {
                            const ramp = getBoss20Phase2DesperationRamp();
                            const maxHp = Math.max(1, Number(meta.maxHp) || Number(boss20State.maxHp) || 1);
                            const baseFloorRatio = Math.max(0.08, Math.min(0.7, Number(EPIC_BOSS20_PHASE2_DESPERATION_HP_FLOOR_RATIO) || 0.22));
                            const maxFloorRatio = Math.max(baseFloorRatio, Math.min(0.8, Number(EPIC_BOSS20_PHASE2_DESPERATION_HP_FLOOR_MAX_RATIO) || 0.36));
                            const floorRatio = baseFloorRatio + ((maxFloorRatio - baseFloorRatio) * ramp);
                            const floorHp = Math.max(1, Math.ceil(maxHp * floorRatio));
                            const before = Math.max(0, Number(meta.hp) || 0);
                            if (before < floorHp) {
                                meta.hp = floorHp;
                                boss20State.hp = floorHp;
                                const now = Date.now();
                                const minGap = Math.max(250, Number(EPIC_BOSS20_PHASE2_DESPERATION_REGEN_MIN_MS) || 650);
                                if (now - Number(boss20State.phase2LastRegenAt || 0) >= minGap) {
                                    boss20State.phase2LastRegenAt = now;
                                    try { playSfx('fill'); } catch (e) { }
                                    try { playBossSummonPulse(idx); } catch (e) { }
                                }
                            }
                            setMiniBossStateFromMeta(idx, meta);
                            scheduleRender();
                            if (maybeTriggerBoss20Phase2RescueByClicks()) {
                                return { cancelGrowth: true };
                            }
                        }
                    }
                    if (boss20State.phase === 2 && boss20State.rescueUsed) {
                        const maxHp2 = Math.max(1, Number(meta.maxHp) || Number(boss20State.maxHp) || 1);
                        const omegaFloorHp = Math.max(1, Math.ceil(maxHp2 * Math.max(0.02, Math.min(0.9, Number(EPIC_BOSS20_PHASE2_TO_PHASE3_HP_RATIO) || 0.10))));
                        if (Number(meta.hp) <= omegaFloorHp) {
                            meta.hp = omegaFloorHp;
                            boss20State.hp = omegaFloorHp;
                            setMiniBossStateFromMeta(idx, meta);
                            scheduleRender();
                            if (!boss20State.phase2OmegaQueued && !boss20State.inCinematic) {
                                boss20State.phase2OmegaQueued = true;
                                inputLocked = true;
                                setTimeout(() => {
                                    try {
                                        if (!isEpicBoss20Level()) return;
                                        if (state[idx] === null || specialState[idx] !== 'boss') {
                                            boss20State.phase2OmegaQueued = false;
                                            inputLocked = false;
                                            return;
                                        }
                                        const m2 = ensureSpecialMeta(idx) || meta || {};
                                        // Skip Omega popup but silently promote to final stage so finale logic remains intact.
                                        m2.phase = Math.max(3, Math.floor(Number(m2.phase) || 3));
                                        specialMetaState[idx] = m2;
                                        boss20State.phase = Math.max(3, Math.floor(Number(m2.phase) || 3));
                                        const started = !!triggerBoss20FinalWindow(idx, m2);
                                        if (!started) {
                                            boss20State.phase2OmegaQueued = false;
                                            inputLocked = false;
                                        }
                                    } catch (e) {
                                        boss20State.phase2OmegaQueued = false;
                                        inputLocked = false;
                                    }
                                }, 120);
                            }
                            return { cancelGrowth: true };
                        }
                    }
                    if (boss20State.phase >= 3 || boss20State.finalFormActive) {
                        try {
                            const healed = maybeApplyBoss20Phase3Regen(idx);
                            if (healed > 0) {
                                const refreshedMeta = specialMetaState[idx] || meta;
                                meta.hp = Math.max(0, Number(refreshedMeta.hp) || Number(meta.hp) || 0);
                                meta.maxHp = Math.max(1, Number(refreshedMeta.maxHp) || Number(meta.maxHp) || 1);
                                boss20State.hp = Math.max(0, Number(meta.hp) || 0);
                                boss20State.maxHp = Math.max(1, Number(meta.maxHp) || 1);
                            }
                        } catch (e) { }
                    }
                    if (
                        boss20State.phase >= 3
                        && !boss20State.inFinalWindow
                        && !boss20State.finalShotActive
                        && !boss20State.finalShotTriggered
                        && !boss20State.finalShotRelease
                        && Number(meta.hp) <= Math.max(1, Number(EPIC_BOSS20_FINAL_WINDOW_HP) || 2)
                    ) {
                        const triggerHp = Math.max(1, Number(EPIC_BOSS20_FINAL_WINDOW_HP) || 2);
                        const holdHp = Math.max(1, Math.min(triggerHp, Math.floor(Number(EPIC_BOSS20_PHASE3_PRE_FINAL_HP_FLOOR) || 1)));
                        meta.hp = holdHp;
                        boss20State.hp = Math.max(1, Number(meta.hp) || 1);
                        setMiniBossStateFromMeta(idx, meta);
                        scheduleRender();
                        triggerBoss20FinalWindow(idx, meta);
                        return { cancelGrowth: true };
                    }
                }
                if (meta.hp <= 0) {
                    if (!isProjection) {
                        if (bossLevel === 20 && isEpicBoss20Level() && (Number(meta.phase) || 1) === 1) {
                            triggerBoss20FalseVictoryTransition(idx, meta, ctx.tracker);
                        } else {
                            resolveBossDefeat(idx, meta, ctx.tracker);
                        }
                    } else {
                        try { popAt(idx, ctx.tracker, { projectionFx: true }); } catch (e) { }
                        if (Array.isArray(ctx.state)) ctx.state[idx] = null;
                        clearSpecialForCell(idx);
                        if (bossLevel === 15) {
                            applyProjectionDamageToBoss(15, 0.5, ctx.tracker);
                        }
                        try { playSfx('zap'); } catch (e) { }
                    }
                } else {
                    if (!isProjection) {
                        setMiniBossStateFromMeta(idx, meta);
                        maybeTriggerBossBreakpoint(meta, idx);
                    }
                    try { playSfx('fill'); } catch (e) { }
                }
                scheduleRender();
                return { cancelGrowth: true };
            }

            function placeMiniBossForLevel(levelNum, preferredEmptyList = null) {
                if (!isMiniBossLevel(levelNum)) {
                    clearMiniBossState();
                    resetBoss20State();
                    return false;
                }
                const empties = Array.isArray(preferredEmptyList) ? preferredEmptyList.filter((i) => state[i] === null) : [];
                const isEpic20 = isEpicBoss20Level(levelNum);
                let candidate = empties.length ? empties.slice() : Array.from({ length: state.length }, (_, i) => i);
                if (isEpic20) {
                    // Force level 20 boss spawn into one of the four center-most petri dishes.
                    const centerRows = [Math.floor((ROWS - 1) / 2), Math.ceil((ROWS - 1) / 2)];
                    const centerCols = [Math.floor((COLS - 1) / 2), Math.ceil((COLS - 1) / 2)];
                    const centerSet = new Set();
                    for (let r = 0; r < centerRows.length; r++) {
                        for (let c = 0; c < centerCols.length; c++) {
                            centerSet.add((centerRows[r] * COLS) + centerCols[c]);
                        }
                    }
                    candidate = Array.from(centerSet).filter((i) => i >= 0 && i < state.length);
                }
                shuffle(candidate);
                const bossCount = Math.max(1, Math.floor(getMiniBossCountForLevel(levelNum)));
                const spawnCount = Math.max(1, Math.min(bossCount, candidate.length));
                const hp = getMiniBossHpForLevel(levelNum);
                for (let i = 0; i < spawnCount; i++) {
                    const bossIndex = candidate[i];
                    state[bossIndex] = 3;
                    specialState[bossIndex] = 'boss';
                    specialMetaState[bossIndex] = {
                        isBoss: true,
                        hp,
                        maxHp: hp,
                        bossLevel: Math.max(1, Math.floor(Number(levelNum) || 1)),
                        phase: isEpic20 ? 1 : 0,
                        breaks: { b75: false, b50: false, b25: false }
                    };
                }
                if (spawnCount > 0) {
                    try { ensureBossBoardFuel(levelNum, candidate[0], { force: true }); } catch (e) { }
                }
                syncMiniBossStateFromBoard();
                if (isEpic20) {
                    bootstrapBoss20PhaseOne();
                    ensureBoss20PhaseTimer();
                } else {
                    resetBoss20State();
                }
                return spawnCount > 0;
            }

            function ensureLevel5HasArmored() {
                const levelNum = getCurrentLevelNumber();
                if (levelNum !== 5) return;
                let hasArmored = false;
                for (let i = 0; i < specialState.length; i++) {
                    if (specialState[i] === 'armored') {
                        hasArmored = true;
                        break;
                    }
                }
                if (hasArmored) return;
                const candidates = [];
                const preferred = [];
                for (let i = 0; i < state.length; i++) {
                    if (state[i] === null) continue;
                    if (specialState[i] === 'boss') continue;
                    candidates.push(i);
                    if ((Number(state[i]) || 0) >= 1) preferred.push(i);
                }
                if (!candidates.length) return;
                const pool = preferred.length ? preferred : candidates;
                const pick = pool[Math.floor(Math.random() * pool.length)];
                if ((Number(state[pick]) || 0) < 1) state[pick] = 1;
                setSpecialForCell(pick, 'armored');
            }

            function normalizeTinyArmoredForBossOpen(levelNum) {
                const lvl = Math.max(1, Math.floor(Number(levelNum) || getCurrentLevelNumber()));
                const onLevel5 = lvl === 5;
                const onLevel20Phase1 = isEpicBoss20Level(lvl) && Math.max(1, Math.floor(Number(boss20State && boss20State.phase) || 1)) <= 1;
                if (!onLevel5 && !onLevel20Phase1) return 0;
                let changed = 0;
                for (let i = 0; i < state.length; i++) {
                    if (state[i] === null) continue;
                    if (specialState[i] !== 'armored') continue;
                    if ((Number(state[i]) || 0) < 1) {
                        state[i] = 1;
                        changed++;
                    }
                }
                return changed;
            }

            function enforceEarlyAdventureSize1Cap(levelNum, maxCount = 2) {
                const lvl = Math.max(1, Math.floor(Number(levelNum) || getCurrentLevelNumber()));
                if (!isAdventureMode() || lvl > 3) return 0;
                const cap = Math.max(0, Math.floor(Number(maxCount) || 0));
                const smallIdx = [];
                for (let i = 0; i < state.length; i++) {
                    if (state[i] === 0) smallIdx.push(i);
                }
                if (smallIdx.length <= cap) return 0;
                shuffle(smallIdx);
                let changed = 0;
                for (let i = cap; i < smallIdx.length; i++) {
                    const idx = smallIdx[i];
                    // Promote excess size-1 viruses to size-2 for smoother early-board starts.
                    state[idx] = 1;
                    changed++;
                }
                return changed;
            }


            function randomizeBoard(preserveClicks = false) {
                levelAdvancePending = false;
                boardGeneration += 1;
                try { setBoss20BoardFreeze(false); } catch (e) { }
                try { Object.keys(bossFuelLastAtByLevel).forEach((k) => { delete bossFuelLastAtByLevel[k]; }); } catch (e) { }
                clearFinalVictorySequence(false);
                state.fill(null);
                specialState.fill(null);
                specialMetaState.fill(null);
                resetBoss20State();
                resetBossGooShieldState(true);
                resetBiofilmState(true);
                clearTechnoGremlinPowers(true);
                if (!preserveClicks) {
                    resetRunPerkState();
                    clicksLeft = 10;
                    stormResolving = false;
                    stormCharges = 1;
                    comboInsurance = 0;
                    try { resetLevelCompleteImageDeck(); } catch (e) { }
                    setStormArmed(false);
                    resetStormChainIndicator();
                    resetRunAchievementStats(getCurrentLevelNumber());
                    tutorialRunState.introShownThisRun = false;
                }
                const total = ROWS * COLS;
                const levelNum = getCurrentLevelNumber();
                if (isEpicBoss20Level(levelNum)) {
                    try { stopRotatingBlockerTicker(); } catch (e) { }
                }
                applyVisualPhase(levelNum);
                const spawnProfileLevel = getSpawnProfileLevel(levelNum);
                const spawnProfileCompleted = Math.max(0, Math.min(9, spawnProfileLevel - 1));
                const difficulty = getDifficultyForLevel(spawnProfileLevel);
                const baseDensity = isEnduranceMode()
                    ? Math.max(0, Math.min(1, Number(getEnduranceDensityForLevel(levelNum)) || 0.60))
                    : Math.max(0, Math.min(1, Number(difficulty.baseDensity) || 0.60));
                const densityGrowth = isEnduranceMode()
                    ? 0
                    : Math.max(0, Number(difficulty.densityGrowth) || 0);
                const isBossLevelNow = isMiniBossLevel(levelNum);
                const density = Math.min(0.95, baseDensity + Math.max(0, Number(spawnProfileCompleted) || 0) * densityGrowth);
                let target = Math.round(total * density);
                if (isBossLevelNow) {
                    // Fixed boss-opening occupancy for level 5/10/15/20:
                    // 20/36 total occupied = 19 normal cells + 1 boss cell.
                    if (levelNum === 5 || levelNum === 10 || levelNum === 15 || levelNum === 20) target = 19;
                    else target = Math.max(8, Math.round(target * 0.78));
                }
                const idx = Array.from({ length: total }, (_, i) => i);
                shuffle(idx);
                for (let k = 0; k < target; k++) {
                    const cellIndex = idx[k];
                    state[cellIndex] = sampleSizeRandom(spawnProfileLevel, spawnProfileCompleted);
                    setSpecialForCell(cellIndex, rollSpecialVirusType(levelNum));
                }
                enforceEarlyAdventureSize1Cap(levelNum, 2);
                if (isBossLevelNow) {
                    placeMiniBossForLevel(levelNum, idx.slice(target));
                } else {
                    clearMiniBossState();
                }
                if (isBossGooShieldLevel(levelNum) && hasActiveBossForLevel(levelNum)) {
                    const sourceBoardGeneration = boardGeneration;
                    const firstDelay = Math.max(120, Math.floor(Number(BOSS_GOO_SHIELD_CONFIG.firstSpitDelayMs) || 850));
                    setTimeout(() => {
                        try {
                            if (sourceBoardGeneration !== boardGeneration) return;
                            triggerBossGooShieldSpit('first');
                        } catch (e) { }
                    }, firstDelay);
                }
                ensureBossGooShieldTimer();
                if (isTechnoGremlinPowerLevel(levelNum) && hasActiveTechnoGremlinBoss(levelNum)) {
                    const sourceBoardGeneration = boardGeneration;
                    const firstDelay = Math.max(220, Math.floor(Number(TECHNO_GREMLIN_POWER_CONFIG.firstPowerDelayMs) || 1700));
                    setTimeout(() => {
                        try {
                            if (sourceBoardGeneration !== boardGeneration) return;
                            triggerTechnoGremlinPower('first');
                        } catch (e) { }
                    }, firstDelay);
                }
                ensureTechnoGremlinPowerTimer();
                ensureBoss20PhaseTimer();
                ensureLevel5HasArmored();
                normalizeTinyArmoredForBossOpen(levelNum);
                try { seedBiofilmForBoard(true, levelNum); } catch (e) { }
                ensureBiofilmTimer();
                queueLikelyAssetPrefetch(levelNum + 1, 'next-level');
                if (preserveClicks && (Number(runPerkState.overclockedReservePending) || 0) > 0) {
                    const reservePending = Math.max(0, Number(runPerkState.overclockedReservePending) || 0);
                    // Reserve clicks can temporarily overflow cap; cap itself is unchanged.
                    const reserveGrant = Math.max(1, Math.min(2, reservePending));
                    clicksLeft = Math.max(0, (Number(clicksLeft) || 0) + reserveGrant);
                    runPerkState.overclockedReservePending = Math.max(0, reservePending - reserveGrant);
                }
                if (preserveClicks && (Number(runPerkState.overclockedReserveLevelsPending) || 0) > 0) {
                    clicksLeft = Math.max(0, (Number(clicksLeft) || 0) + 1);
                    runPerkState.overclockedReserveLevelsPending = Math.max(0, Number(runPerkState.overclockedReserveLevelsPending) - 1);
                }
                scheduleRender();
                updateHUD();
                if (!preserveClicks) {
                    setTimeout(() => { maybeShowTutorialIntro(false); }, 280);
                }
            }

            function findNextBubble(index, dr, dc) {
                let r = Math.floor(index / COLS), c = index % COLS;
                while (true) {
                    r += dr;
                    c += dc;
                    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null;
                    const i = r * COLS + c;
                    if (isBoss20FinalFormCell(i)) return i;
                    if (state[i] !== null) return i;
                }
            }
            function findNextBiofilm(index, dr, dc) {
                let r = Math.floor(index / COLS), c = index % COLS;
                while (true) {
                    r += dr; c += dc;
                    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null;
                    const i = r * COLS + c;
                    if (hasBiofilmAt(i)) return i;
                }
            }

            function createPetriElement() { const pet = document.createElement('div'); pet.className = 'petri'; if (PETRI_URL) { const img = document.createElement('img'); img.src = PETRI_URL; img.alt = 'petri'; pet.appendChild(img); } return pet; }

            function queueGrowthTween(index, fromSize, toSize) {
                const i = Number(index);
                if (!Number.isFinite(i)) return;
                const from = Math.max(0, Math.min(3, Number(fromSize) || 0));
                const to = Math.max(0, Math.min(3, Number(toSize) || 0));
                if (to <= from) return;
                const fromScale = getVirusSizeScale(from);
                const toScale = getVirusSizeScale(to);
                if (toScale <= 0) return;
                growthTweenByIndex.set(i, {
                    ratio: Math.max(0.7, Math.min(0.98, fromScale / toScale)),
                    from,
                    to
                });
            }

            function createVirusContainer(size, specialType = null, cellIndex = -1, tweenCfg = null) {
                const container = document.createElement('div');
                container.className = 'virus virus--size-' + size;
                if (tweenCfg && Number.isFinite(tweenCfg.ratio)) {
                    container.classList.add('grow-tween');
                    container.style.setProperty('--grow-from', String(tweenCfg.ratio));
                    setTimeout(() => {
                        try { container.classList.remove('grow-tween'); } catch (e) { }
                    }, 380);
                }
                const def = getSpecialTypeDef(specialType);
                if (def) {
                    container.classList.add('special-virus');
                    if (def.className) container.classList.add(def.className);
                    container.dataset.specialType = String(def.id);
                }
                const sprite = document.createElement('div');
                sprite.className = 'face-sprite';
                const appendSpriteVisual = (target, spriteSize) => {
                    const clampedSize = Math.max(0, Math.min(3, Number(spriteSize) || 0));
                    if (simpleVirusArtEnabled) {
                        const img = document.createElement('img');
                        img.className = 'face-img';
                        img.src = SPRITE_URLS[clampedSize];
                        img.alt = 'virus';
                        img.style.transform = 'scale(' + getVirusSizeScale(clampedSize) + ')';
                        img.style.transformOrigin = 'center center';
                        target.appendChild(img);
                        return;
                    }
                    if (clampedSize === 0) {
                        const sheet = document.createElement('div');
                        sheet.className = 'virus1-sprite-sheet';
                        sheet.style.backgroundImage = `url('${VIRUS1_SPRITE_SHEET_URL}')`;
                        sheet.style.transform = 'scale(' + getVirusSizeScale(0) + ')';
                        sheet.style.transformOrigin = 'center center';
                        sheet.setAttribute('aria-hidden', 'true');
                        target.appendChild(sheet);
                    } else if (clampedSize === 1 && VIRUS2_SPRITE_SHEET_URL) {
                        const sheet = document.createElement('div');
                        sheet.className = 'virus2-sprite-sheet';
                        sheet.style.backgroundImage = `url('${VIRUS2_SPRITE_SHEET_URL}')`;
                        sheet.style.setProperty('--virus2-cols', String(virus2SpriteLayout.cols || 1));
                        sheet.style.setProperty('--virus2-rows', String(virus2SpriteLayout.rows || 1));
                        sheet.style.setProperty('--virus2-duration-ms', String(virus2SpriteLayout.durationMs || 200));
                        sheet.style.setProperty('--virus2-scale', String(getVirusSizeScale(1)));
                        sheet.setAttribute('aria-hidden', 'true');
                        target.appendChild(sheet);
                    } else if (clampedSize === 2 && VIRUS3_SPRITE_SHEET_URL) {
                        const sheet = document.createElement('div');
                        sheet.className = 'virus3-sprite-sheet';
                        sheet.style.backgroundImage = `url('${VIRUS3_SPRITE_SHEET_URL}')`;
                        sheet.style.setProperty('--virus3-cols', String(virus3SpriteLayout.cols || 1));
                        sheet.style.setProperty('--virus3-rows', String(virus3SpriteLayout.rows || 2));
                        sheet.style.setProperty('--virus3-duration-ms', String(virus3SpriteLayout.durationMs || 333));
                        sheet.style.setProperty('--virus3-scale', String(getVirusSizeScale(2)));
                        sheet.setAttribute('aria-hidden', 'true');
                        target.appendChild(sheet);
                    } else if (clampedSize === 3 && VIRUS4_SPRITE_SHEET_URL) {
                        const sheet = document.createElement('div');
                        sheet.className = 'virus4-sprite-sheet';
                        sheet.style.backgroundImage = `url('${VIRUS4_SPRITE_SHEET_URL}')`;
                        sheet.style.setProperty('--virus4-cols', String(virus4SpriteLayout.cols || 2));
                        sheet.style.setProperty('--virus4-rows', String(virus4SpriteLayout.rows || 2));
                        sheet.style.setProperty('--virus4-duration-ms', String(virus4SpriteLayout.durationMs || 667));
                        sheet.style.setProperty('--virus4-scale', String(getVirusSizeScale(3)));
                        sheet.setAttribute('aria-hidden', 'true');
                        target.appendChild(sheet);
                    } else {
                        const img = document.createElement('img');
                        img.className = 'face-img';
                        img.src = SPRITE_URLS[clampedSize];
                        img.alt = 'virus';
                        img.style.transform = 'scale(' + getVirusSizeScale(clampedSize) + ')';
                        img.style.transformOrigin = 'center center';
                        target.appendChild(img);
                    }
                };
                if (specialType === 'boss') {
                    const meta = (Number.isFinite(cellIndex) && cellIndex >= 0) ? (specialMetaState[cellIndex] || {}) : {};
                    const isProjection = !!meta.isProjection;
                    const bossLevel = Math.floor(Number(meta.bossLevel) || 0);
                    const bossPhase = (bossLevel === 20) ? Math.floor(Number(meta.phase) || 0) : 0;
                    const isFinalForm = !!meta.isFinalForm;
                    const bossSpriteProfile = isFinalForm
                        ? { url: MINIBOSS_LEVEL20_PHASE3_SPRITE_URL || MINIBOSS_LEVEL20_PHASE2_SPRITE_URL || MINIBOSS_SPRITE_URL, sheetClass: 'boss-sprite-sheet--grid16', containerClass: 'special-boss-level20-finalform' }
                        : getBossSpriteProfileForLevel(bossLevel, bossPhase);
                    const bossSpriteUrl = (bossSpriteProfile && bossSpriteProfile.url) || MINIBOSS_SPRITE_URL;
                    if (isProjection) container.classList.add('special-boss-projection');
                    if (bossLevel === 10) container.classList.add('special-boss-level10');
                    if (bossLevel === 15) container.classList.add('special-boss-level15');
                    if (bossLevel === 20) container.classList.add('special-boss-level20');
                    if (bossLevel === 20 && bossPhase >= 2) container.classList.add('special-boss-level20-phase2');
                    if (bossLevel === 20 && bossPhase >= 3) container.classList.add('special-boss-level20-phase3');
                    if (bossLevel === 20 && isFinalForm) container.classList.add('special-boss-level20-finalform');
                    if (bossSpriteProfile && bossSpriteProfile.containerClass) container.classList.add(bossSpriteProfile.containerClass);
                    if (!isProjection && bossLevel === 20) {
                        const now = Date.now();
                        if (Number(cellIndex) === Number(boss20State.heroMarkCell) && now < Number(boss20State.weakPointUntil)) {
                            container.classList.add('special-boss-level20-weak');
                        }
                        if (boss20State.inFinalWindow && now < Number(boss20State.finalWindowUntil)) {
                            container.classList.add('special-boss-level20-final-window');
                        }
                    }
                    const bossSheet = document.createElement('div');
                    bossSheet.className = 'boss-sprite-sheet';
                    if (bossSpriteProfile && bossSpriteProfile.sheetClass) bossSheet.classList.add(bossSpriteProfile.sheetClass);
                    bossSheet.style.backgroundImage = `url('${bossSpriteUrl || MINIBOSS_SPRITE_URL}')`;
                    bossSheet.setAttribute('aria-hidden', 'true');
                    sprite.appendChild(bossSheet);
                } else {
                    if (tweenCfg && Number.isFinite(tweenCfg.from) && tweenCfg.from >= 0 && tweenCfg.from !== size) {
                        const prevSprite = document.createElement('div');
                        prevSprite.className = 'face-sprite face-sprite--prev';
                        appendSpriteVisual(prevSprite, Math.max(0, Math.min(3, Number(tweenCfg.from) || 0)));
                        container.appendChild(prevSprite);
                        sprite.classList.add('face-sprite--next');
                    }
                    appendSpriteVisual(sprite, Math.max(0, Math.min(3, Number(size) || 0)));
                }
                container.appendChild(sprite);
                if (tweenCfg && Number.isFinite(tweenCfg.ratio)) {
                    const growthRing = document.createElement('div');
                    growthRing.className = 'growth-ring';
                    growthRing.setAttribute('aria-hidden', 'true');
                    container.appendChild(growthRing);
                }
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
                if (specialType === 'boss' && Number.isFinite(cellIndex) && cellIndex >= 0) {
                    const meta = specialMetaState[cellIndex] || {};
                    if (meta.isProjection) return container;
                    const hp = Math.max(0, Number(meta.hp) || 0);
                    const maxHp = Math.max(1, Number(meta.maxHp) || hp || 1);
                    const ratio = Math.max(0, Math.min(1, hp / maxHp));
                    const miniHp = document.createElement('div');
                    miniHp.className = 'boss-mini-hp';
                    const fill = document.createElement('span');
                    fill.style.transform = `scaleX(${ratio})`;
                    miniHp.appendChild(fill);
                    container.appendChild(miniHp);
                }
                return container;
            }

            function render() {
                specialTelegraphIndex = null;
                const nowTs = Date.now();
                pruneBossGooShields();
                pruneBiofilmCells();
                boardEl.innerHTML = ''; for (let i = 0; i < ROWS * COLS; i++) {
                    const val = state[i];
                    const specialType = specialState[i];
                    const specialDef = getSpecialTypeDef(specialType);
                    const gridCell = document.createElement('div');
                    gridCell.className = 'cell';
                    gridCell.dataset.index = i; // petri underlay
                    if (isTutorialMode() && tutorialModeState.active && Number(i) === Number(tutorialModeState.targetIndex)) {
                        gridCell.classList.add('tutorial-target');
                    }
                    if (isBoss20FinalFormCell(i)) gridCell.classList.add('boss20-core-zone');
                    if (Number(i) === Number(boss20State && boss20State.finalFormAnchor)) gridCell.classList.add('boss20-core-anchor');
                    if (specialDef) {
                        gridCell.classList.add('has-special');
                        if (specialDef.className) gridCell.classList.add(specialDef.className);
                    }
                    const pet = createPetriElement(); gridCell.appendChild(pet);
                    if (hasBiofilmAt(i)) {
                        gridCell.classList.add('has-biofilm');
                        const bio = document.createElement('div');
                        bio.className = 'biofilm-overlay';
                        const bst = biofilmStyle[i] || {};
                        if (bst.radius) bio.style.borderRadius = bst.radius;
                        if (bst.rot) bio.style.setProperty('--b-rot', bst.rot);
                        if (bst.scale) bio.style.setProperty('--b-scale', String(bst.scale));
                        if (bst.widthPct) bio.style.setProperty('--b-w', bst.widthPct);
                        if (bst.heightPct) bio.style.setProperty('--b-h', bst.heightPct);
                        if (bst.sizePct) bio.style.setProperty('--b-size', bst.sizePct);
                        if (bst.ox) bio.style.setProperty('--b-ox', bst.ox);
                        if (bst.oy) bio.style.setProperty('--b-oy', bst.oy);
                        if (bst.sheenX) bio.style.setProperty('--b-sheen-x', bst.sheenX);
                        if (bst.sheenY) bio.style.setProperty('--b-sheen-y', bst.sheenY);
                        if (bst.wobbleMs) bio.style.setProperty('--b-wobble-ms', bst.wobbleMs);
                        if (bst.wobbleDelay) bio.style.setProperty('--b-wobble-delay', bst.wobbleDelay);
                        gridCell.appendChild(bio);
                    }
                    if (hasBossGooShield(i)) {
                        const goo = document.createElement('div');
                        goo.className = 'goo-shield-overlay';
                        const st = bossGooShieldStyle[i] || {};
                        if (st.radius) goo.style.borderRadius = st.radius;
                        if (st.rot) goo.style.setProperty('--g-rot', st.rot);
                        if (st.scale) goo.style.setProperty('--g-scale', String(st.scale));
                        if (st.ox) goo.style.setProperty('--g-ox', st.ox);
                        if (st.oy) goo.style.setProperty('--g-oy', st.oy);
                        if (st.shineX) goo.style.setProperty('--g-shine-x', st.shineX);
                        if (st.shineY) goo.style.setProperty('--g-shine-y', st.shineY);
                        const freshWindow = Math.max(120, Math.floor(Number(BOSS_GOO_SHIELD_CONFIG.freshPulseMs) || 650));
                        if ((Number(st.appliedAt) || 0) > 0 && (nowTs - Number(st.appliedAt)) <= freshWindow) {
                            goo.classList.add('fresh');
                        }
                        gridCell.appendChild(goo);
                    }
                    if (val !== null) {
                        let tweenCfg = null;
                        const pending = growthTweenByIndex.get(i);
                        if (pending && Number(pending.to) === Number(val)) {
                            tweenCfg = pending;
                        }
                        growthTweenByIndex.delete(i);
                        const container = createVirusContainer(val, specialType, i, tweenCfg);
                        gridCell.appendChild(container);
                    }
                    boardEl.appendChild(gridCell);
                }
                syncBoss20FinalFormOverlay();
                syncBoss20FinalShotReticle();
                ensureBossGooShieldTimer();
                ensureBiofilmTimer();
                ensureTechnoGremlinPowerTimer();
                ensureBoss20PhaseTimer();
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
                    if (isTutorialMode() && tutorialModeState.active) {
                        levelAdvancePending = false;
                        return;
                    }
                    if (levelAdvancePending) return;
                    levelAdvancePending = true;
                    if (isFinalVictoryActive()) {
                        levelAdvancePending = false;
                        return;
                    }
                    // single, unified "level complete" path
                    if (clicksLeft === 1) incrementAchievementStat('runClutchClears', 1, 'run');
                    const clearedLevelNum = getCurrentLevelNumber();
                    const clearBonusClicks = getLevelClearBonusClicks(clearedLevelNum);
                    const clicksBeforeClearReward = Math.max(0, Number(clicksLeft) || 0);
                    const clearRewardClicks = Math.max(0, 1 + (Number(clearBonusClicks) || 0));
                    clicksLeft = Math.min(getMaxClicksCap(), clicksBeforeClearReward + clearRewardClicks);
                    playSfx('win');
                    screensPassed += 1;
                    if (isEnduranceMode()) {
                        const nextLevelNumEndurance = screensPassed + 1;
                        setAchievementBest('enduranceRunLevelReached', nextLevelNumEndurance, 'run', { allowEndurance: true });
                    } else {
                        incrementAchievementStat('levelsClearedLifetime', 1, 'lifetime');
                    }
                    const nextLevelNum = screensPassed + 1;
                    setAchievementBest('runLevelReached', nextLevelNum, 'run');
                    updateHUD();
                    tutorialEvent('firstLevelClear');

                    const showFinalOfferNow = shouldShowFinalOfferForLevel(nextLevelNum);
                    const isBossIntroLevel = isMiniBossLevel(nextLevelNum) && (nextLevelNum === 5 || nextLevelNum === 10 || nextLevelNum === 15);
                    if (showFinalOfferNow) {
                        runPerkState.finalOfferPending = true;
                        const openPendingFinalOffer = () => {
                            inputLocked = false;
                            maybeShowPendingFinalOfferPopup(40);
                        };
                        const beginLevel20BossIntro = () => {
                            inputLocked = true;
                            runLevel20FinalApproachSequence(() => {
                                // Build the level 20 board only after the full-screen blackout is in place.
                                randomizeBoard(true);
                                applyFinalOfferClickFloor();
                                updateHUD();
                                try {
                                    showLevelComplete({
                                        title: `BOSS LEVEL ${nextLevelNum}`,
                                        imageUrl: getBossLevelIntroImageUrl(nextLevelNum),
                                        emitAssistant: false,
                                        zIndex: FINAL_OFFER_LEVEL20_SPLASH_Z,
                                        onDismiss: () => {
                                            finalOfferSkipPreludeOnce = true;
                                            showLevel20BossTalkCutscene(() => {
                                                openPendingFinalOffer();
                                            });
                                        }
                                    });
                                } catch (e) {
                                    finalOfferSkipPreludeOnce = true;
                                    showLevel20BossTalkCutscene(() => {
                                        openPendingFinalOffer();
                                    });
                                }
                            });
                        };
                        try {
                            const showPostClearPopup = () => {
                                showLevelComplete({
                                    title: `LEVEL ${clearedLevelNum} COMPLETE`,
                                    onDismiss: () => {
                                        if (nextLevelNum === 20) {
                                            beginLevel20BossIntro();
                                            return;
                                        }
                                        randomizeBoard(true);
                                        applyFinalOfferClickFloor();
                                        updateHUD();
                                        openPendingFinalOffer();
                                    }
                                });
                            };
                            if (nextLevelNum === 20) {
                                playBlockerRetreatSequence(() => {
                                    showPostClearPopup();
                                }, { preLaunchMs: 1000, launchMs: 980, postPauseMs: 2000 });
                            } else {
                                showPostClearPopup();
                            }
                        } catch (e) {
                            if (nextLevelNum === 20) {
                                playBlockerRetreatSequence(() => {
                                    beginLevel20BossIntro();
                                }, { preLaunchMs: 1000, launchMs: 980, postPauseMs: 2000 });
                                return;
                            }
                            randomizeBoard(true);
                            applyFinalOfferClickFloor();
                            updateHUD();
                            openPendingFinalOffer();
                        }
                    } else if (isBossIntroLevel) {
                        try { playSfx('boss_level'); } catch (e) { }
                        try {
                            showLevelComplete({
                                title: `BOSS LEVEL ${nextLevelNum}`,
                                imageUrl: getBossLevelIntroImageUrl(nextLevelNum),
                                emitAssistant: false,
                                onDismiss: () => {
                                    randomizeBoard(true);
                                    maybeShowLevelDynamicsIntro(nextLevelNum);
                                }
                            });
                        } catch (e) {
                            randomizeBoard(true);
                            maybeShowLevelDynamicsIntro(nextLevelNum);
                        }
                    } else {
                        try {
                            showLevelComplete({
                                title: 'LEVEL COMPLETE',
                                onDismiss: () => randomizeBoard(true)
                            });
                        } catch (e) {
                            randomizeBoard(true);
                        }
                    }
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
                        const randExtra = (Math.random() - 0.5) * 120; // �60� jitter
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
                    // find closest virus and closest biofilm in this direction
                    const nextVirus = findNextBubble(cellIndex, dr, dc);
                    const nextBiofilm = findNextBiofilm(cellIndex, dr, dc);
                    const originRow = Math.floor(cellIndex / COLS);
                    const originCol = cellIndex % COLS;
                    const distTo = (idx) => {
                        if (!Number.isFinite(idx)) return Number.POSITIVE_INFINITY;
                        const rr = Math.floor(idx / COLS);
                        const cc = idx % COLS;
                        return Math.abs(rr - originRow) + Math.abs(cc - originCol);
                    };
                    const useBiofilm = Number.isFinite(nextBiofilm) && (distTo(nextBiofilm) <= distTo(nextVirus));
                    const next = useBiofilm ? nextBiofilm : nextVirus;

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
                                        if (useBiofilm && hasBiofilmAt(next)) {
                                            consumeBiofilmHit(next);
                                            playBiofilmAbsorbFx(next);
                                            try { playSfx('zap'); } catch (e) { }
                                            scheduleRender();
                                            return;
                                        }
                                        const hitIndex = mapBoss20FinalFormHitIndex(next);
                                        if (!hitTargets.has(hitIndex)) {
                                            hitTargets.add(hitIndex);
                                            handleClick(hitIndex, false, tracker);
                                        }
                                    } catch (e) { }
                                });
                            }
                        } else {
                            // no element found, send particle off-screen based on fallback direction
                            const tx = sx + ox * (window.innerWidth * 0.8) + (Math.random() - 0.5) * 80;
                            const ty = sy + oy * (window.innerHeight * 0.8) + (Math.random() - 0.5) * 80;
                            const block = getRotatingBlockerImpact(sx + jitterX, sy + jitterY, tx, ty);
                            const dur = 700 + Math.random() * 260;
                            if (block) {
                                animateParticleTo(p, sx + jitterX, sy + jitterY, block.x, block.y, Math.max(220, dur * 0.72), () => {
                                    try {
                                        if (sourceBoardGeneration !== boardGeneration) return;
                                        flashRotatingBlocker();
                                    } catch (e) { }
                                });
                            } else {
                                animateParticleTo(p, sx + jitterX, sy + jitterY, tx, ty, dur, null);
                            }
                        }
                    } else {
                        // no target in that direction: send particle outwards visually
                        const tx = sx + ox * (window.innerWidth * 0.8) + (Math.random() - 0.5) * 80;
                        const ty = sy + oy * (window.innerHeight * 0.8) + (Math.random() - 0.5) * 80;
                        const block = getRotatingBlockerImpact(sx + jitterX, sy + jitterY, tx, ty);
                        const dur = 700 + Math.random() * 260;
                        if (block) {
                            animateParticleTo(p, sx + jitterX, sy + jitterY, block.x, block.y, Math.max(220, dur * 0.72), () => {
                                try {
                                    if (sourceBoardGeneration !== boardGeneration) return;
                                    flashRotatingBlocker();
                                } catch (e) { }
                            });
                        } else {
                            animateParticleTo(p, sx + jitterX, sy + jitterY, tx, ty, dur, null);
                        }
                    }
                });

            }


            function popAt(index, tracker, opts = null) {
                const options = opts || {};
                const useProjectionFx = !!options.projectionFx;
                const cellEl = boardEl.querySelector(`[data-index='${index}']`);
                if (!cellEl) return;
                if (!useProjectionFx) {
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
                } else {
                    playProjectionPopEffect(index);
                }
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
                        if ((tracker.pops || 0) >= Math.max(1, Number(EPIC_BOSS20_COMBO_CUTOFF_AT) || 12)) {
                            triggerBoss20ComboCutoff(tracker);
                        }

                        // Chain click rewards are profile-driven (start pop + cadence).
                        const difficulty = getCurrentDifficulty();
                        if (shouldAwardChainClick(tracker.pops)) {
                            clicksLeft = Math.min(getMaxClicksCap(), clicksLeft + 1);
                            playSfx('fill');
                        }
                        const chainScoreStep = Math.max(0, Number(difficulty.chainScoreStep) || 0.5);
                        const levelScoreScaleStep = Math.max(0, Number(difficulty.levelScoreScaleStep) || 0.1);
                        const chainMultiplier = 1 + (tracker.pops - 1) * chainScoreStep;
                        const runScoreMult = Math.max(0.65, Math.min(1, Number(runPerkState && runPerkState.scoreMultiplier) || 1));
                        const earned = Math.round(10 * chainMultiplier * (1 + screensPassed * levelScoreScaleStep) * runScoreMult);
                        totalScore += earned;
                        updateHUD();
                        try { if (window.Assistant && (tracker.pops || 0) > 10) Assistant.emit && Assistant.emit('cascade', { pops: tracker.pops }); } catch (e) { }

                    }
                }

            }

            // ----- Cleaned out-of-clicks handling (previously corrupted) -----
            function triggerRunFailureGameOver(levelNow = getCurrentLevelNumber()) {
                outOfClicksShown = true;
                continueOfferOpen = false;
                try { hideContinueOfferPopup(true); } catch (e) { }
                try { hideRunPerkPopup(true); } catch (e) { }
                try { hideFinalOfferPopup(true); } catch (e) { }
                try { runPerkState.popupOpen = false; } catch (e) { }
                try { stopBossGooShieldTimer(); } catch (e) { }
                try { stopBiofilmTimer(); } catch (e) { }
                try { resetBoss20State(); } catch (e) { }
                try { clearTechnoGremlinPowers(true); } catch (e) { }
                if (levelNow === Math.max(1, Math.floor(Number(FINAL_OFFER_CONFIG && FINAL_OFFER_CONFIG.level) || 20)) && musicOverrideMode === 'final-boss') {
                    try { stopFinalBossTheme({ fadeOutMs: 700, resumeNormal: true }); } catch (e) { }
                }
                try { playSfx('lose'); } catch (e) { }
                // Show persistent popup - will remain until the player clicks try again/restart.
                showGameOverPopup({ title: 'GAME OVER', subtitle: 'Containment failed', persistent: true });
            }

            function checkOutOfClicks() {
                if (isFinalVictoryActive()) return;
                if (clicksLeft <= 0 && isBoss20RescueShieldActive()) {
                    return;
                }
                if (clicksLeft <= 0 && continueOfferOpen) {
                    return;
                }
                if (clicksLeft <= 0 && !outOfClicksShown) {
                    const levelNow = getCurrentLevelNumber();
                    if (canOfferRunContinue(levelNow)) {
                        const shown = showContinueOfferPopup({
                            level: levelNow,
                            onDecline: () => triggerRunFailureGameOver(levelNow)
                        });
                        if (shown) return;
                    }
                    triggerRunFailureGameOver(levelNow);
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
                const jammed = isTechnoGremlinJamActive();
                const insuranceVisualBoost = Math.floor(Math.max(0, Math.min(1, comboInsurance)) * 3);
                const visualCount = isCharged ? rechargeTarget : Math.max(0, count + insuranceVisualBoost);
                const isFillingActive = !isCharged && count > 0;
                const ratio = Math.max(0, Math.min(1, visualCount / rechargeTarget));
                stormBtn.style.setProperty('--storm-combo-ratio', String(ratio));
                stormBtn.dataset.chain = String(Math.min(visualCount, rechargeTarget));
                stormBtn.dataset.insurance = String(Math.round(Math.max(0, Math.min(1, comboInsurance)) * 100));
                stormBtn.classList.toggle('charged', isCharged);
                stormBtn.classList.toggle('combo-tracking', isFillingActive);
                stormBtn.classList.toggle('combo-near', isFillingActive && visualCount >= nearThreshold && visualCount < rechargeTarget);
                stormBtn.classList.toggle('combo-hot', isFillingActive && visualCount >= (rechargeTarget - 1));
                stormBtn.classList.toggle('storm-idle', !isCharged && !isFillingActive);
                stormBtn.classList.toggle('insurance-ready', comboInsurance >= COMBO_INSURANCE_CAP);
                stormBtn.classList.toggle('jammed', jammed);
                const jamLeft = Math.max(0, Number(technoGremlinJamUntil) - Date.now());
                const jamTitle = jammed ? (' | jam ' + (jamLeft / 1000).toFixed(1) + 's') : '';
                const baseTitle = jammed
                    ? (isCharged ? 'Nano Storm ready (jammed)' : 'Nano Storm jammed')
                    : (stormArmed ? 'Nano Storm armed' : (isCharged ? 'Nano Storm ready' : 'Nano Storm charging'));
                const chainTitle = (!isCharged && visualCount > 0) ? (' | chain ' + visualCount + '/' + rechargeTarget) : '';
                const insuranceTitle = comboInsurance > 0 ? (' | combo save ' + Math.round(comboInsurance * 100) + '%') : '';
                stormBtn.setAttribute('title', baseTitle + chainTitle + insuranceTitle + jamTitle);
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
                if (isTechnoGremlinJamActive()) {
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
                    if ((Number(runPerkState.stormCapacitorCharges) || 0) > 0) {
                        runPerkState.stormCapacitorCharges = Math.max(0, Number(runPerkState.stormCapacitorCharges) - 1);
                    }
                    if ((Number(runPerkState.hotwireNextRechargePenalty) || 0) > 0) {
                        runPerkState.hotwireNextRechargePenalty = 0;
                    }
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
                try { document.body.classList.toggle('storm-armed-mode', !!stormArmed && stormCharges > 0); } catch (e) { }
                const jammed = isTechnoGremlinJamActive();
                if (jammed && stormArmed) {
                    stormArmed = false;
                    stormHoverIndex = null;
                    clearStormPreview();
                    clearMobileStormInteraction(true);
                    try { document.body.classList.remove('storm-armed-mode'); } catch (e) { }
                }
                stormBtn.classList.remove('ready', 'armed', 'empty', 'charged');
                if (stormCharges <= 0) stormBtn.classList.add('empty');
                else if (stormArmed) stormBtn.classList.add('armed');
                else stormBtn.classList.add('ready');
                stormBtn.classList.toggle('jammed', jammed);
                try {
                    const jamLabel = stormBtn.querySelector('.storm-armed-label');
                    if (jamLabel) jamLabel.textContent = jammed ? 'JAMMED' : 'ARMED';
                } catch (e) { }
                stormBtn.disabled = (stormCharges <= 0) || jammed;
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
                const includeDiagonals = !(runPerkState && runPerkState.stormNoDiagonals);
                cardinal.forEach(([dr, dc]) => {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) out.push(nr * COLS + nc);
                });
                if (includeDiagonals) {
                    diagonal.forEach(([dr, dc]) => {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) out.push(nr * COLS + nc);
                    });
                }
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
                const jammed = isTechnoGremlinJamActive();
                stormArmed = !!val && stormCharges > 0 && !jammed;
                try { document.body.classList.toggle('storm-armed-mode', !!stormArmed && stormCharges > 0); } catch (e) { }
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
                        try {
                            const fx = document.createElement('div');
                            fx.className = 'storm-electricity';
                            fx.style.left = cx + 'px';
                            fx.style.top = cy + 'px';
                            const fxSize = Math.max(96, Math.round(Math.max(r.width, r.height) * 2.9));
                            fx.style.width = fxSize + 'px';
                            fx.style.height = fxSize + 'px';
                            document.body.appendChild(fx);
                            setTimeout(() => { try { fx.remove(); } catch (e) { } }, 540);
                        } catch (e) { }
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
                if (typeId === 'armored' || typeId === 'boss') {
                    if (specialTelegraphIndex === idx) clearSpecialTelegraph();
                    return false;
                }
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

            function canBoss20ComboCutoff() {
                if (!EPIC_BOSS20_COMBO_CUTOFF_ENABLED) return false;
                if (!isEpicBoss20Level()) return false;
                if (!boss20State || !boss20State.active) return false;
                if (boss20State.inCinematic) return false;
                if (boss20State.inFinalWindow) return false;
                if (boss20State.finalShotActive || boss20State.finalShotTriggered || boss20State.finalShotRelease) return false;
                return true;
            }

            function clearActiveParticlesImmediate() {
                try {
                    for (let i = 0; i < PARTICLE_POOL.length; i++) {
                        const p = PARTICLE_POOL[i];
                        if (!p) continue;
                        try { if (p._releaseTimeout) clearTimeout(p._releaseTimeout); } catch (e) { }
                        try { p._releaseTimeout = null; } catch (e) { }
                        try { p.classList.remove('animate'); } catch (e) { }
                        try { releaseParticle(p); } catch (e) { }
                    }
                } catch (e) { }
                try {
                    const active = document.querySelectorAll('.particle.animate');
                    active.forEach((p) => {
                        try { p.classList.remove('animate'); } catch (e2) { }
                    });
                } catch (e) { }
            }

            function applyBoss20ComboCutoffFx() {
                if (!boardEl) return;
                try {
                    boardEl.classList.remove('boss20-combo-cutoff-flash', 'boss20-combo-cutoff-shake');
                    void boardEl.offsetWidth;
                    boardEl.classList.add('boss20-combo-cutoff-flash');
                    boardEl.classList.add('boss20-combo-cutoff-shake');
                    setTimeout(() => {
                        try { boardEl.classList.remove('boss20-combo-cutoff-flash'); } catch (e) { }
                    }, Math.max(70, Math.floor(Number(EPIC_BOSS20_COMBO_CUTOFF_FLASH_MS) || 120)));
                    setTimeout(() => {
                        try { boardEl.classList.remove('boss20-combo-cutoff-shake'); } catch (e) { }
                    }, Math.max(120, Math.floor(Number(EPIC_BOSS20_COMBO_CUTOFF_LOCK_MS) || 240)));
                } catch (e) { }
            }

            function scheduleBoss20ComboCutoffResume() {
                try {
                    if (boss20ComboCutoffResumeTimer) clearTimeout(boss20ComboCutoffResumeTimer);
                } catch (e) { }
                const delay = Math.max(80, Math.floor(Number(EPIC_BOSS20_COMBO_CUTOFF_LOCK_MS) || 240));
                boss20ComboCutoffResumeTimer = setTimeout(() => {
                    boss20ComboCutoffResumeTimer = null;
                    if (Date.now() < Number(boss20ComboCutoffUntil || 0)) return;
                    if (isEpicBoss20Level() && boss20State && boss20State.inCinematic) {
                        inputLocked = true;
                        return;
                    }
                    if (!stormResolving) inputLocked = false;
                    if (clicksLeft <= 0) checkOutOfClicks();
                }, delay + 12);
            }

            function triggerBoss20ComboCutoff(tracker = null) {
                if (!canBoss20ComboCutoff()) return false;
                if (tracker && tracker.comboCutoffTriggered) return false;
                const now = Date.now();
                if (now < Number(boss20ComboCutoffUntil || 0)) return false;
                boss20ComboCutoffUntil = now + Math.max(80, Math.floor(Number(EPIC_BOSS20_COMBO_CUTOFF_LOCK_MS) || 240));
                if (tracker) tracker.comboCutoffTriggered = true;
                clearActiveParticlesImmediate();
                stormResolving = false;
                inputLocked = true;
                applyBoss20ComboCutoffFx();
                try { playSfx(EPIC_BOSS20_COMBO_CUTOFF_SFX || 'techno_jammer'); } catch (e) { }
                try {
                    if (boss20State && !boss20State.comboCutoffHintShown && window.Assistant && Assistant.show) {
                        boss20State.comboCutoffHintShown = true;
                        Assistant.show('Viraxis just force-cut the cascade. He can shut down overlong chain reactions, so do not rely on one endless combo.', { priority: 2 });
                    }
                } catch (e) { }
                scheduleBoss20ComboCutoffResume();
                return true;
            }

            function waitForParticlesThenShow(tracker, cb) { const check = () => { if (!particlesActive()) { try { cb(); } catch (e) { } } else { requestAnimationFrame(check); } }; requestAnimationFrame(check); }

            /* ---------- Retro 8-bit SVG icons ---------- */
            function getRetroIconSVG(name) {
                // Normalize to one visual style: use the 12-pop icon (GREAT tier / pixel-star) for all badges.
                name = 'pixel-star';
                if (name === 'pixel-star') {
                    return `<svg width="34" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="10" r="7" fill="#ffcf68"/><circle cx="12" cy="10" r="5.2" fill="#ffe19a"/><path d="M12 5.4l1.5 3.1 3.4.5-2.4 2.4.6 3.4-3.1-1.6-3.1 1.6.6-3.4L7.1 9l3.4-.5z" fill="#ff9e3d"/><rect x="7.2" y="16.3" width="3.2" height="6" rx="0.8" fill="#ffb24a"/><rect x="13.6" y="16.3" width="3.2" height="6" rx="0.8" fill="#ffb24a"/></svg>`;
                }
                if (name === 'spark') {
                    return `<svg width="34" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="8.2" fill="#ffe295"/><path d="M13.6 3.4l1 4.2 4.1 1.3-3.1 3.1.7 4.4-4.2-2.1-4.2 2.1.7-4.4-3.1-3.1 4.1-1.3 1-4.2z" fill="#ffbe4f"/><path d="M12.4 6.6l-2.8 5.2h2.5l-1 5.6 4.1-6.8h-2.6l1.3-4z" fill="#ff7f3f"/></svg>`;
                }
                if (name === 'starburst') {
                    return `<svg width="34" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 2l2.2 4.8 5.2-1.4-1.5 5.1 5.1 1.5-4.2 3.3 3.3 4.2-5.1.9.9 5.1-4.6-2.4-4.6 2.4.9-5.1-5.1-.9 3.3-4.2L1 12l5.1-1.5-1.5-5.1 5.2 1.4z" fill="#ffd46a"/><circle cx="12" cy="12" r="3.3" fill="#ff9642"/></svg>`;
                }
                if (name === 'explosion') {
                    return `<svg width="34" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 2.2l2.2 4.2 4.8-1.8-1 5 5 .8-3.7 3.5 3.7 3.5-5 .8 1 5-4.8-1.8-2.2 4.2-2.2-4.2-4.8 1.8 1-5-5-.8 3.7-3.5L1 10.4l5-.8-1-5 4.8 1.8z" fill="#ff8d46"/><circle cx="12" cy="12" r="3.7" fill="#ffd26b"/></svg>`;
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

            var activeChainBadgeEl = null;
            var chainBadgeHideTimer = null;
            var chainBadgeRemoveTimer = null;

            function isElementVisiblyOpen(el) {
                if (!el) return false;
                try {
                    if (el.classList && el.classList.contains('hide')) return false;
                    const ariaHidden = el.getAttribute ? el.getAttribute('aria-hidden') : null;
                    if (ariaHidden === 'true') return false;
                    if (el.classList && (el.classList.contains('show') || el.classList.contains('open'))) return true;
                    const style = window.getComputedStyle ? window.getComputedStyle(el) : null;
                    if (style) {
                        if (style.display === 'none' || style.visibility === 'hidden') return false;
                        if (Number(style.opacity) === 0) return false;
                    }
                    return !!(el.offsetWidth || el.offsetHeight || (el.getClientRects && el.getClientRects().length));
                } catch (e) {
                    return false;
                }
            }

            function isBlockingPopupOpen() {
                try {
                    const modalIds = ['audioPopup', 'helpPopup', 'startModal', 'level5DynamicsModal', 'aiIntro'];
                    for (let i = 0; i < modalIds.length; i++) {
                        if (isElementVisiblyOpen(document.getElementById(modalIds[i]))) return true;
                    }
                    const modalSelectors = ['.level-complete', '.game-over-popup', '.continue-offer-popup', '.run-perk-popup', '.final-offer-modal', '.final-victory-overlay'];
                    for (let i = 0; i < modalSelectors.length; i++) {
                        if (isElementVisiblyOpen(document.querySelector(modalSelectors[i]))) return true;
                    }
                } catch (e) { }
                return false;
            }

            function clearChainBadgeTimers() {
                if (chainBadgeHideTimer) {
                    clearTimeout(chainBadgeHideTimer);
                    chainBadgeHideTimer = null;
                }
                if (chainBadgeRemoveTimer) {
                    clearTimeout(chainBadgeRemoveTimer);
                    chainBadgeRemoveTimer = null;
                }
            }

            function cleanupChainBadgeInstance(badgeEl) {
                if (!badgeEl) return;
                try {
                    if (typeof badgeEl._chainLaneCleanup === 'function') badgeEl._chainLaneCleanup();
                } catch (e) { }
                try { badgeEl._chainLaneCleanup = null; } catch (e) { }
            }

            function hideActiveChainBadge(immediate = false) {
                clearChainBadgeTimers();
                const badge = activeChainBadgeEl || document.querySelector('.chain-badge');
                if (!badge) {
                    activeChainBadgeEl = null;
                    return;
                }
                cleanupChainBadgeInstance(badge);
                if (immediate) {
                    try { badge.remove(); } catch (e) { }
                    if (activeChainBadgeEl === badge) activeChainBadgeEl = null;
                    return;
                }
                try {
                    badge.classList.remove('show');
                    badge.classList.add('hide');
                } catch (e) { }
                chainBadgeRemoveTimer = setTimeout(() => {
                    try { badge.remove(); } catch (e) { }
                    if (activeChainBadgeEl === badge) activeChainBadgeEl = null;
                    chainBadgeRemoveTimer = null;
                }, 380);
            }

            function placeChainBadgeInLane(badgeEl) {
                if (!badgeEl) return;
                let cx = Math.round(window.innerWidth / 2);
                let cy = 64;
                try {
                    const boardRect = boardEl && boardEl.getBoundingClientRect ? boardEl.getBoundingClientRect() : null;
                    if (boardRect && Number.isFinite(boardRect.width) && boardRect.width > 0) {
                        cx = Math.round(boardRect.left + (boardRect.width / 2));
                        cy = Math.round(Math.max(10, boardRect.top + 14));
                    }
                } catch (e) { }
                const rect = badgeEl.getBoundingClientRect();
                const halfW = Math.ceil((rect.width || 0) / 2);
                const minX = Math.max(12 + halfW, 24);
                const maxX = Math.max(minX, Math.round(window.innerWidth - 12 - halfW));
                if (cx < minX) cx = minX;
                if (cx > maxX) cx = maxX;
                const minY = 8;
                const maxY = Math.max(minY, Math.round(window.innerHeight - 40));
                if (cy < minY) cy = minY;
                if (cy > maxY) cy = maxY;
                badgeEl.style.left = cx + 'px';
                badgeEl.style.top = cy + 'px';
                badgeEl.style.transform = 'translateX(-50%) translateY(0) scale(0.95)';
            }

            try {
                window.hideChainBadge = function (immediate = false) {
                    hideActiveChainBadge(!!immediate);
                };
            } catch (e) { }


            /* ---------- showChainBadge with retro icon + confetti ---------- */

            function showChainBadge(tracker) {
                if (!tracker) return;
                // Decide badge AFTER particles settle so we use final tracker.pops
                waitForParticlesThenShow(tracker, () => {
                    try {
                        const count = tracker.pops || 0;
                        setAchievementBest('runBestChain', count, 'run');
                        if (count >= 20) {
                            incrementAchievementStat('runChain20Count', 1, 'run');
                            incrementAchievementStat('chain20LifetimeCount', 1, 'lifetime');
                        }
                        if (count >= 4) tutorialEvent('firstChain');
                        updateStormChainProgress(count);
                        grantStormChargeFromChain(count);
                        if (count < getStormRechargeChainMin()) addComboInsuranceFromChain(count);
                        scheduleStormChainReset();
                        const rule = BADGE_RULES.find(r => count >= r.min);
                        if (!rule) return;
                        if (isBlockingPopupOpen()) {
                            hideActiveChainBadge(true);
                            return;
                        }

                        hideActiveChainBadge(true);

                        const badge = document.createElement('div');
                        badge.className = 'chain-badge ' + rule.className;
                        const iconSVG = getRetroIconSVG(rule.icon) || '';
                        badge.innerHTML = `
                                                                                <div class="cb-icon">${iconSVG}</div>
                                                                                <div style="display:flex;flex-direction:column;line-height:1;">
                                                                                  <div style="font-size:14px;opacity:0.95">${rule.title}</div>
                                                                                  <div style="font-size:12px;opacity:0.85">x${count} pops</div>
                                                                                </div>`;

                        document.body.appendChild(badge);
                        activeChainBadgeEl = badge;
                        placeChainBadgeInLane(badge);
                        const onLaneViewportChange = () => {
                            if (activeChainBadgeEl === badge) placeChainBadgeInLane(badge);
                        };
                        window.addEventListener('resize', onLaneViewportChange);
                        window.addEventListener('scroll', onLaneViewportChange, true);
                        badge._chainLaneCleanup = () => {
                            try { window.removeEventListener('resize', onLaneViewportChange); } catch (e) { }
                            try { window.removeEventListener('scroll', onLaneViewportChange, true); } catch (e) { }
                        };
                        requestAnimationFrame(() => {
                            if (activeChainBadgeEl !== badge || isBlockingPopupOpen()) {
                                hideActiveChainBadge(true);
                                return;
                            }
                            badge.classList.add('show');
                        });
                        try { const rect = badge.getBoundingClientRect(); const cx = rect.left + rect.width / 2; const cy = rect.top + rect.height / 2; void (cx, cy, rule.className); } catch (e) { }
                        if (rule.scoreBonus) totalScore += rule.scoreBonus;
                        if (rule.extraClicks) { clicksLeft = Math.min(getMaxClicksCap(), clicksLeft + rule.extraClicks); playSfx('fill'); }
                        updateHUD();
                        chainBadgeHideTimer = setTimeout(() => {
                            if (activeChainBadgeEl !== badge) return;
                            hideActiveChainBadge(false);
                        }, 2100);
                    } catch (e) { console.warn('showChainBadge error', e); }
                });
            }
            try {
                window.previewBadge = function (pops = 8) {
                    const n = Math.max(0, Math.floor(Number(pops) || 0));
                    const tracker = {
                        pops: n,
                        positions: [],
                        finalized: true,
                        poppedSet: new Set(),
                        hitSet: new Set()
                    };
                    showChainBadge(tracker);
                    return n;
                };
            } catch (e) { }

            // ----- Core interaction -----
            // ----- Core interaction -----
            function handleClick(index, isUser = false, tracker = null, suppressFinalize = false) {
                if (isUser) {
                    if (!isTutorialMode() && isBlockingPopupOpen()) return;
                    if (isEpicBoss20Level() && boss20State && boss20State.finalShotActive) {
                        if (triggerBoss20FinalShot(index)) return;
                        Assistant.show('PIXEL targeting lock: follow the reticle. One precise hit should do.', { priority: 2 });
                        syncBoss20FinalShotReticle();
                        return;
                    }
                    // block clicks if game is locked or already out of clicks
                    if (inputLocked || stormResolving || clicksLeft <= 0) return;
                    try {
                        if (typeof particlesActive === 'function' && particlesActive()) return;
                    } catch (e) { }

                    // lock input for the duration of this chain
                    inputLocked = true;

                    clicksLeft--;
                    updateHUD();
                    maybeTriggerBoss20Phase2RescueByClicks();

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
                    if (hasBiofilmAt(index)) {
                        clearBiofilmAt(index);
                        playBiofilmAbsorbFx(index);
                        try { playSfx('zap'); } catch (e) { }
                        scheduleRender();
                    }
                    if (suppressFinalize || stormResolving) return;
                    // unlock since nothing actually happened
                    inputLocked = false;
                    if (isUser && maybeTriggerBoss20Phase2RescueByClicks()) return;
                    scheduleRunPerkPopupAttempt(0);
                    // If we just consumed the last click and there are no particles, check game over now
                    // Use requestAnimationFrame so DOM updates settle first
                    requestAnimationFrame(() => {
                        if (!particlesActive() && clicksLeft <= 0) checkOutOfClicks();
                    });
                    return;
                }

                if (consumeBossGooShieldHit(index)) {
                    try { playSfx('grow'); } catch (e) { }
                    scheduleRender();
                    if (suppressFinalize || stormResolving) return;
                    inputLocked = false;
                    if (isUser && maybeTriggerBoss20Phase2RescueByClicks()) return;
                    scheduleRunPerkPopupAttempt(0);
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
                    if (isUser && maybeTriggerBoss20Phase2RescueByClicks()) return;
                    scheduleRunPerkPopupAttempt(0);
                    requestAnimationFrame(() => {
                        if (!particlesActive() && clicksLeft <= 0) checkOutOfClicks();
                    });
                    return;
                }
                playSfx('grow');
                const prevSize = Number(state[index]);
                state[index] += 1;
                invokeSpecialHook(specialType, 'onAfterGrow', {
                    index,
                    isUser,
                    state,
                    specialState,
                    specialMetaState,
                    tracker
                });
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
                    queueGrowthTween(index, prevSize, state[index]);
                    // Immediate paint so players see the size change without waiting for the RAF queue
                    try { render(); } catch (e) { scheduleRender(); }
                    scheduleRender();
                    if (suppressFinalize || stormResolving) return;
                    inputLocked = false;
                    if (isUser && maybeTriggerBoss20Phase2RescueByClicks()) return;
                    scheduleRunPerkPopupAttempt(0);
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
                    if (isUser) {
                        try { moveBlockerAfterResolution(); } catch (e) { }
                    }
                    // Keep input locked while level-20 boss cinematics/transitions are active.
                    if (isEpicBoss20Level() && boss20State && boss20State.inCinematic) {
                        inputLocked = true;
                        return;
                    }
                    if (Date.now() < Number(boss20ComboCutoffUntil || 0)) {
                        inputLocked = true;
                        scheduleBoss20ComboCutoffResume();
                        return;
                    }
                    inputLocked = false; // allow next click
                    if (isUser && maybeTriggerBoss20Phase2RescueByClicks()) return;
                    scheduleRunPerkPopupAttempt(0);
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
                        if (isUser && maybeTriggerBoss20Phase2RescueByClicks()) return;
                        scheduleRunPerkPopupAttempt(0);
                        if (clicksLeft <= 0) checkOutOfClicks();
                    }
                }
            }

            function useNanoStorm(centerIndex) {
                if (inputLocked || clicksLeft <= 0 || stormCharges <= 0 || isTechnoGremlinJamActive()) return false;
                const targets = getStormTargets(centerIndex);
                if (!targets.length) return false;
                const center = Number(centerIndex);
                inputLocked = true;
                stormResolving = true;
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
                        try { moveBlockerAfterResolution(); } catch (e) { }
                        stormResolving = false;
                        inputLocked = false;
                        scheduleRunPerkPopupAttempt(0);
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
                    if (isTutorialMode() && tutorialModeState.active) {
                        handleTutorialBoardTap(i);
                        return;
                    }
                    try {
                        if (isBlockingPopupOpen() || inputLocked || stormResolving || (typeof particlesActive === 'function' && particlesActive())) return;
                    } catch (e) { }
                    if (isEpicBoss20Level() && boss20State && boss20State.finalShotActive) {
                        handleClick(i, true);
                        return;
                    }
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
                    if (stormCharges <= 0 || isTechnoGremlinJamActive()) return;
                    setStormArmed(!stormArmed);
                });
            }
            updateStormUI();
            evaluateAchievements({ emitUnlock: false });
            scheduleAchievementsUIRender();
            const audioBtn = document.getElementById('audioBtn');
            const helpBtn = document.getElementById('helpBtn');
            const settingsTabBtn = document.getElementById('settingsTabBtn');
            const achievementsTabBtn = document.getElementById('achievementsTabBtn');
            const aboutTabBtn = document.getElementById('aboutTabBtn');
            const settingsTabPane = document.getElementById('settingsTabPane');
            const achievementsTabPane = document.getElementById('achievementsTabPane');
            const aboutTabPane = document.getElementById('aboutTabPane');
            const devClicksPanel = document.getElementById('devClicksPanel');
            const devAdd1Btn = document.getElementById('devAdd1Btn');
            const devAdd5Btn = document.getElementById('devAdd5Btn');
            const devClicksStatus = document.getElementById('devClicksStatus');
            const testLevelInput = document.getElementById('testLevelInput');
            const applyTestLevelBtn = document.getElementById('applyTestLevelBtn');
            const testClicksInput = document.getElementById('testClicksInput');
            const applyTestClicksBtn = document.getElementById('applyTestClicksBtn');
            const testClicksOverCap = document.getElementById('testClicksOverCap');
            const settingsTestStatus = document.getElementById('settingsTestStatus');
            let devClicksUnlocked = false;
            let devUnlockTapCount = 0;
            let devUnlockTapTimer = null;
            function setSettingsTestStatus(message, isError) {
                if (!settingsTestStatus) return;
                settingsTestStatus.textContent = String(message || '');
                settingsTestStatus.style.color = isError ? '#ffd0d0' : '#cfe4ff';
            }
            function setDevClicksStatus(message, isError) {
                if (!devClicksStatus) return;
                devClicksStatus.textContent = String(message || '');
                devClicksStatus.style.color = isError ? '#ffd0d0' : '#ffe9b0';
            }
            function setDevClicksPanelVisible(visible) {
                if (!devClicksPanel) return;
                const on = !!visible;
                devClicksPanel.hidden = !on;
                devClicksPanel.setAttribute('aria-hidden', String(!on));
                devClicksPanel.classList.toggle('show', on);
            }
            function unlockDevClicksPanel() {
                if (devClicksUnlocked) return;
                devClicksUnlocked = true;
                setDevClicksPanelVisible(true);
                setDevClicksStatus('Testing clicks unlocked', false);
            }
            function registerDevUnlockTap() {
                if (!IS_MOBILE_COARSE || devClicksUnlocked) return;
                try { if (devUnlockTapTimer) clearTimeout(devUnlockTapTimer); } catch (e) { }
                devUnlockTapCount += 1;
                devUnlockTapTimer = setTimeout(() => {
                    devUnlockTapTimer = null;
                    devUnlockTapCount = 0;
                }, 1600);
                if (devUnlockTapCount >= 7) {
                    devUnlockTapCount = 0;
                    try { if (devUnlockTapTimer) clearTimeout(devUnlockTapTimer); } catch (e) { }
                    devUnlockTapTimer = null;
                    unlockDevClicksPanel();
                }
            }
            function addDevClicks(amount) {
                const amt = Math.max(1, Math.floor(Number(amount) || 0));
                try {
                    let result = null;
                    if (typeof window.addClicks === 'function') {
                        result = window.addClicks(amt, true) || null;
                    } else {
                        const before = Number(clicksLeft) || 0;
                        clicksLeft = Math.max(0, before + amt);
                        updateHUD();
                        result = { clicks: clicksLeft, cap: getMaxClicksCap(), changed: clicksLeft - before };
                    }
                    const nowClicks = Number(result && result.clicks);
                    if (Number.isFinite(nowClicks)) setDevClicksStatus(`Clicks: ${nowClicks}`, false);
                    else setDevClicksStatus(`Added +${amt} clicks`, false);
                } catch (e) {
                    setDevClicksStatus('Click add failed', true);
                }
            }
            function syncSettingsTestInputs() {
                if (testLevelInput) {
                    let currentLevel = 1;
                    try {
                        if (typeof window.getLevel === 'function') currentLevel = Number(window.getLevel()) || 1;
                        else currentLevel = getCurrentLevelNumber();
                    } catch (e) { }
                    testLevelInput.value = String(Math.max(1, Math.floor(Number(currentLevel) || 1)));
                }
                if (testClicksInput) testClicksInput.value = '5';
                setSettingsTestStatus('', false);
            }
            function setSettingsPopupTab(tabName) {
                const normalized = String(tabName || '').toLowerCase();
                const tab = normalized === 'achievements' || normalized === 'about' ? normalized : 'settings';
                const showSettings = tab === 'settings';
                const showAchievements = tab === 'achievements';
                const showAbout = tab === 'about';
                if (settingsTabPane) settingsTabPane.classList.toggle('active', showSettings);
                if (achievementsTabPane) achievementsTabPane.classList.toggle('active', showAchievements);
                if (aboutTabPane) aboutTabPane.classList.toggle('active', showAbout);
                if (settingsTabBtn) {
                    settingsTabBtn.classList.toggle('active', showSettings);
                    settingsTabBtn.setAttribute('aria-selected', String(showSettings));
                }
                if (achievementsTabBtn) {
                    achievementsTabBtn.classList.toggle('active', showAchievements);
                    achievementsTabBtn.setAttribute('aria-selected', String(showAchievements));
                }
                if (aboutTabBtn) {
                    aboutTabBtn.classList.toggle('active', showAbout);
                    aboutTabBtn.setAttribute('aria-selected', String(showAbout));
                }
                if (settingsTabPane) settingsTabPane.setAttribute('aria-hidden', String(!showSettings));
                if (achievementsTabPane) achievementsTabPane.setAttribute('aria-hidden', String(!showAchievements));
                if (aboutTabPane) aboutTabPane.setAttribute('aria-hidden', String(!showAbout));
                if (showAchievements) scheduleAchievementsUIRender();
            }
            try { window.setSettingsPopupTab = setSettingsPopupTab; } catch (e) { }
            if (settingsTabBtn) settingsTabBtn.addEventListener('click', () => {
                setSettingsPopupTab('settings');
                registerDevUnlockTap();
            });
            if (achievementsTabBtn) achievementsTabBtn.addEventListener('click', () => setSettingsPopupTab('achievements'));
            if (aboutTabBtn) aboutTabBtn.addEventListener('click', () => setSettingsPopupTab('about'));
            setSettingsPopupTab('settings');
            setDevClicksPanelVisible(false);
            setDevClicksStatus('', false);
            if (devAdd1Btn) devAdd1Btn.addEventListener('click', (ev) => {
                try { ev.preventDefault(); } catch (e) { }
                addDevClicks(1);
            });
            if (devAdd5Btn) devAdd5Btn.addEventListener('click', (ev) => {
                try { ev.preventDefault(); } catch (e) { }
                addDevClicks(5);
            });
            if (audioBtn) {
                audioBtn.addEventListener('click', () => {
                    try { hideActiveChainBadge(false); } catch (e) { }
                    setSettingsPopupTab('settings');
                    scheduleAchievementsUIRender();
                    syncAudioSettingsUI();
                    syncSettingsTestInputs();
                });
            }
            if (helpBtn) {
                helpBtn.addEventListener('click', () => {
                    try { hideActiveChainBadge(false); } catch (e) { }
                });
            }
            const musicEnabledToggle = document.getElementById('musicEnabledToggle');
            const sfxEnabledToggle = document.getElementById('sfxEnabledToggle');
            const simpleVirusArtToggle = document.getElementById('simpleVirusArtToggle');
            const musicToggleSwitch = document.querySelector('#musicEnabledToggle + .audio-toggle-switch');
            const sfxToggleSwitch = document.querySelector('#sfxEnabledToggle + .audio-toggle-switch');
            const simpleVirusArtToggleSwitch = document.querySelector('#simpleVirusArtToggle + .audio-toggle-switch');
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
            if (simpleVirusArtToggle) {
                simpleVirusArtToggle.addEventListener('change', () => {
                    simpleVirusArtEnabled = !!simpleVirusArtToggle.checked;
                    applySimpleVirusArtState(true);
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
            if (simpleVirusArtToggleSwitch && simpleVirusArtToggle) {
                simpleVirusArtToggleSwitch.addEventListener('click', (ev) => {
                    try { ev.preventDefault(); } catch (e) { }
                    simpleVirusArtToggle.checked = !simpleVirusArtToggle.checked;
                    simpleVirusArtToggle.dispatchEvent(new Event('change'));
                });
            }
            applyMusicEnabledState(false);
            applySfxEnabledState();
            applySimpleVirusArtState(false);
            const mainMenuBtn = document.getElementById('mainMenuBtn');
            if (mainMenuBtn) {
                mainMenuBtn.addEventListener('click', (ev) => {
                    try { ev.preventDefault(); } catch (e) { }
                    try {
                        if (typeof window.hideModal === 'function') window.hideModal('audioPopup');
                        else {
                            const audioPopup = document.getElementById('audioPopup');
                            if (audioPopup) {
                                audioPopup.classList.remove('show', 'open');
                                audioPopup.style.display = 'none';
                                audioPopup.setAttribute('aria-hidden', 'true');
                            }
                        }
                    } catch (e) { }
                    requestAnimationFrame(() => {
                        try { restartToIntroScreen(); } catch (e) { }
                    });
                });
            }
            const resetProgressBtn = document.getElementById('resetProgressBtn');
            if (resetProgressBtn) {
                resetProgressBtn.addEventListener('click', (ev) => {
                    try { ev.preventDefault(); } catch (e) { }
                    resetProgressWithConfirm();
                });
            }
            const restartRunBtn = document.getElementById('restartRunBtn');
            if (restartRunBtn) {
                restartRunBtn.addEventListener('click', (ev) => {
                    try { ev.preventDefault(); } catch (e) { }
                    const ok = window.confirm('Restart current run? Progress this run will be lost.');
                    if (!ok) return;
                    try { performGameReset(); } catch (e) { }
                    try {
                        const audioPopup = document.getElementById('audioPopup');
                        if (audioPopup) {
                            audioPopup.classList.remove('show', 'open');
                            audioPopup.style.display = 'none';
                            audioPopup.style.visibility = 'hidden';
                            audioPopup.style.pointerEvents = 'none';
                            audioPopup.setAttribute('aria-hidden', 'true');
                        }
                    } catch (e) { }
                    setTimeout(() => {
                        try { forcePostRestartInteractivity(); } catch (e) { }
                        requestAnimationFrame(() => {
                            try { forcePostRestartInteractivity(); } catch (e2) { }
                        });
                    }, 0);
                });
            }
            if (applyTestLevelBtn) {
                applyTestLevelBtn.addEventListener('click', (ev) => {
                    try { ev.preventDefault(); } catch (e) { }
                    const requested = Math.max(1, Math.floor(Number(testLevelInput && testLevelInput.value) || 1));
                    if (testLevelInput) testLevelInput.value = String(requested);
                    try {
                        if (typeof window.setLevel === 'function') {
                            const result = window.setLevel(requested) || {};
                            const actual = Math.max(1, Math.floor(Number(result.level) || requested));
                            if (testLevelInput) testLevelInput.value = String(actual);
                            setSettingsTestStatus(`Level set to ${actual}.`, false);
                        } else {
                            screensPassed = requested - 1;
                            randomizeBoard(false);
                            updateHUD();
                            setSettingsTestStatus(`Level set to ${requested}.`, false);
                        }
                    } catch (e) {
                        setSettingsTestStatus('Level change failed.', true);
                    }
                });
            }
            if (applyTestClicksBtn) {
                applyTestClicksBtn.addEventListener('click', (ev) => {
                    try { ev.preventDefault(); } catch (e) { }
                    const amount = Math.max(1, Math.floor(Number(testClicksInput && testClicksInput.value) || 0));
                    if (!Number.isFinite(amount) || amount <= 0) {
                        setSettingsTestStatus('Enter a valid click amount.', true);
                        return;
                    }
                    const allowOverCap = !!(testClicksOverCap && testClicksOverCap.checked);
                    try {
                        let result = null;
                        if (typeof window.addClicks === 'function') {
                            result = window.addClicks(amount, allowOverCap) || null;
                        } else {
                            const before = Number(clicksLeft) || 0;
                            const next = before + amount;
                            clicksLeft = allowOverCap
                                ? Math.max(0, next)
                                : Math.max(0, Math.min(getMaxClicksCap(), next));
                            updateHUD();
                            result = { clicks: clicksLeft, cap: getMaxClicksCap(), changed: clicksLeft - before };
                        }
                        if (result && Number.isFinite(Number(result.clicks))) {
                            const cap = Number(result.cap) || getMaxClicksCap();
                            setSettingsTestStatus(`Clicks: ${Number(result.clicks)} / ${cap}`, false);
                        } else {
                            setSettingsTestStatus('Clicks added.', false);
                        }
                    } catch (e) {
                        setSettingsTestStatus('Click update failed.', true);
                    }
                });
            }

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
    
