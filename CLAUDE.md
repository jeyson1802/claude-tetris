# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Classic Tetris implemented in vanilla JavaScript with HTML5 Canvas and CSS. No dependencies, no build step, no package.json — just three files: `index.html`, `style.css`, `game.js`.

## Running the game

Open `index.html` directly in a browser, or serve it locally:

```bash
python3 -m http.server 8000
# or
npx serve .
```

There is no build, lint, or test tooling in this repo — changes are verified by opening `index.html` in a browser and playing.

## Architecture

All game logic lives in `game.js` (~300 lines, single file, no modules). Key pieces:

- **Board model**: `board` is a `ROWS × COLS` matrix (20×10) where each cell is `0` (empty) or a color index `1–7` identifying the piece that occupies it.
- **Pieces**: `PIECES` defines the 7 tetrominoes as square matrices of color indices. Rotation (`rotateCW`) is a transpose + row-reverse, not a lookup table of rotation states.
- **Wall kicks** (`tryRotate`): after rotating, tries offsets `[0, -1, 1, -2, 2]` columns until a non-colliding position is found, otherwise the rotation is discarded.
- **Collision** (`collide`): the single source of truth for whether a shape at a given offset is valid — used by movement, rotation, ghost piece, and spawn-collision (game over) checks alike.
- **Game loop** (`loop`): driven by `requestAnimationFrame`, accumulates elapsed time in `dropAccum` and advances the piece one row once `dropInterval` is exceeded.
- **Locking** (`lockPiece`): merges the current piece into `board`, clears completed lines, then spawns the next piece.
- **Line clears** (`clearLines`): scans bottom-to-top, splicing out full rows and unshifting empty rows at the top; re-checks the same row index after a splice (`r++` inside the loop).
- **Scoring/leveling**: `LINE_SCORES = [0, 100, 300, 500, 800]` multiplied by `level`; hard drop adds 2 points per row dropped, soft drop 1 point per row. Level increases every 10 lines cleared; `dropInterval = max(100, 1000 - (level-1)*90)`.
- **Ghost piece** (`ghostY`): projects the current piece straight down until collision, drawn at `globalAlpha = 0.2`.
- **Rendering**: two canvases — `#board` (main play field) and `#next-canvas` (next-piece preview) — both drawn cell-by-cell via `drawBlock`. There is no diffing; `draw()` fully redraws every frame.
- **State**: all game state (`board`, `current`, `next`, `score`, `lines`, `level`, `paused`, `gameOver`, timing accumulators) is module-level mutable state, reset in `init()`. There is no state management framework.

Tunable constants at the top of `game.js`: `COLS`, `ROWS`, `BLOCK` (cell size in px), `COLORS`, `LINE_SCORES`, initial `dropInterval`. If `COLS`/`ROWS`/`BLOCK` change, the `#board` canvas `width`/`height` in `index.html` must be updated to match (`COLS × BLOCK`, `ROWS × BLOCK`).

## Language note

The README and in-code comments/UI strings (e.g. overlay text) are in Spanish. Match that convention for user-facing text.
