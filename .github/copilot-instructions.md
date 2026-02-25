# Copilot Instructions: Gone Viral! Game

## Project Overview
**Gone Viral!** is an interactive virus-popping browser game (GitHub Pages, single-file HTML). Players click viruses to pop them, clear levels, and accumulate scores. The game features dynamic animations, particle effects, audio (SFX + music), and integrates with an external Assistant system for expressions and event notifications.

## Architecture & Key Components

### Monolithic Structure
- **[index.html](index.html)** contains ALL game logic, CSS, and JavaScript (~6700 lines)
  - Inline `<style>` tags (CSS animations for virus "breathe" effect, particle animations, expressions)
  - Multiple `<script>` tags with game logic, music system, and UI handlers
  - Single `<div id="board">` grid serving as game board

### Core Systems

#### 1. **Game State** (Global variables, no class structure)
- `state[]`: Array of virus objects or `null` (size 0-3)
- `clicks`: Remaining actions; max is `MAX_CLICKS` (10 per level)
- `score`, `screens` (level): Persisted to `localStorage`
- `ROWS`, `COLS`: Board dimensions (typically 4x5)
- Conventions: Game resets when clicks run out; level increments when board clears

#### 2. **Audio System: Two Tracks**
- **Music**: `playNextMusicTrack()` plays from `MUSIC_PLAYLIST` array (shuffled each cycle)
  - Stored in `window.musicAudio`; volume controlled by `window.musicVolume` (default 0.20)
  - Music tracks sourced from external GitHub repo (`sound_image_assets`)
- **SFX**: `playSfx(key)` cached via `sfxCache` object
  - Uses `SfxManager` shim for safe audio fallback (handles file:// protocol)
  - Volume: `window.sfxVolume` (default 0.50)
- **Control**: Sliders update `#musicVol`, `#sfxVol`; mute button toggles `window.allMuted`

#### 3. **Rendering Pipeline**
- `render()`: Main game loop called on state changes
  - Clears board, recreates virus DOM elements from `state[]`
  - Each virus → `createVirusContainer(size)` with SVG sprite image
  - Applies CSS class `virus--size-{0-3}` for styling
  - Sprite URLs from `SPRITE_URLS[]` indexed by size
- **Virus Animation**: CSS `@keyframes breathe-*` (duration varies by size)
  - Animation delay randomized per sprite via `DOMContentLoaded` listener and MutationObserver
  - Applies CSS variables `--breathe-duration` dynamically

#### 4. **Particle System** (Antibody animations on pop)
- `PARTICLE_POOL`: Pre-allocated array of particle objects
- **Lifecycle**: `getParticleFromPool()` → `animateParticleTo()` → `releaseParticle()`
- `emitDirectionalParticles()`: Creates 4-8 particles radiating from popped cell
  - Particles animate toward screen edges with randomized overshoot
  - Uses `requestAnimationFrame` for smooth 60fps motion
  - Waits for particle completion before showing level-complete popup

#### 5. **Game Mechanics**
- **Pop Logic**: `popAt(index, tracker)` with cascade detection
  - Removes adjacent null cells (creates empty space)
  - Viruses above fall down (`gravity`)
  - Chain pops increment `tracker.pops`; triggers Assistant event if `pops > 10`
- **Level Flow**: Click cells → emit particles → check for board clear → show level complete → reset board with new viruses
- **Game Over**: Triggered when clicks = 0 and board has viruses; shown via `showGameOverPopup()`

#### 6. **HUD & Meter Updates**
- `updateHUD()`: Syncs `#score`, `#screens` (level), `#clicks` DOM elements
- `updateClicksMeter()`: Visual bar showing remaining clicks
  - Segments in `.meter-segments` animate with `.pop` class
  - Filled segments decrease as clicks consumed
  - Emits Assistant event when clicks ≤ 2

#### 7. **External Integration: window.Assistant**
- Game emits events via `window.Assistant.emit()` (wrapped in try-catch):
  - `'levelComplete'`: After level cleared
  - `'gameOver'`: Game over popup shown
  - `'cascade'`: Chain pop detected (> 10 pops)
  - `'lowClicks'`: Clicks ≤ 2
- **Assistant Badge**: Embedded SVG element `#assistant-badge`
  - Expression classes: `.expr-smile`, `.expr-worried`, `.expr-celebrate` etc.
  - Shows different mouth/eyebrow states based on game events
  - Controlled by CSS (no JS state management for expressions)

## Developer Workflows

### Local Testing
- Open [index.html](index.html) directly in browser (file:// URL works)
- `SfxManager` shim prevents errors from missing audio resources
- Music/SFX preload skipped on file:// to avoid 404s

### Editing Patterns
1. **Add New Mechanic**: Modify `popAt()` or game loop; emit Assistant event if notable
2. **Tweak Difficulty**: Adjust `MAX_CLICKS`, `ROWS`/`COLS`, or virus size generation in `sampleSizeRandom()`
3. **New Audio**: Add track to `MUSIC_PLAYLIST` or SFX key to `SFX_URLS`
4. **Animation Tuning**: Modify CSS `@keyframes breathe-*` durations or particle `animateParticleTo()` duration
5. **Assistant Expressions**: Add `.expr-{name}` CSS rule and trigger via Assistant event listener (external code)

### Common Pitfalls
- **State Mutation**: Directly mutating `state[]` requires calling `render()` afterward
- **Async Music**: `playNextMusicTrack()` returns immediately; music loads asynchronously
- **Particle Cleanup**: Ensure `releaseParticle()` is called on animation completion, else animation frame loop continues
- **Try-Catch Sprawl**: Extensive try-catch blocks (best-effort error handling); failures are silent

## Project-Specific Conventions

### Data & Configuration
- `SPRITE_URLS = [url0, url1, url2, url3]`: Zero-indexed by virus size
- `MUSIC_PLAYLIST = ['track1_url', ...]`: Shuffled on each cycle
- `SFX_URLS = { key: url, ... }`: Lazy-loaded on-demand
- Constants: `ROWS = 4`, `COLS = 5`, `MAX_CLICKS = 10`

### DOM Structure
- Game board: `<div id="board" role="grid">` contains virus elements
- HUD: `.hud` with `.hud-row` sections for level, score, clicks meter
- Popups: `.modal` overlays for game-over, level-complete (show via `display: block`)
- Particles: Created dynamically in `<body>` with `.particle` class, removed on animation end

### Styling Quirks
- Virus colors set via external SVG images, not CSS
- Breathing animation driven by CSS + JS randomization of delay/duration
- Responsive layout: uses viewport-relative units for particle targets
- `.small.meter` class for compact HUD boxes

## Integration Points & External Dependencies

### External Assets
- **Font**: Press Start 2P (WOFF2, preloaded from GitHub)
- **Images**: Virus sprites, petri dish background (from `sound_image_assets` repo)
- **Audio**: Music tracks & SFX (hosted on GitHub, fetched at runtime)

### Assistant Integration
- Expects `window.Assistant` with `.emit(eventName, data)` method
- Game does NOT fail if Assistant unavailable (all calls wrapped in try-catch)
- Events are for UI feedback only; do not depend on Assistant for core mechanics

### localStorage Usage
- Persists `score`, `highScore` (read/write in updateHUD, reset in performGameReset)
- No other persistent state; clicks, level reset per session

## Testing & Validation
- **Manual Testing**: Open in browser, play through several levels, check audio/animations
- **Edge Cases**: Test with clicks = 0, all viruses same size, empty board state
- **Audio Fallback**: Test with audio disabled or on file:// protocol
- **Mobile**: Viewport-relative particles may need adjustment for small screens
