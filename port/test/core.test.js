const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { GAME_CONFIG } = require('../lib/game/core/game-config');
const {
  DEBUG_CONFIG,
  createDebugConfig,
  isDebugOverlayEnabled,
  isDebugLoggingEnabled
} = require('../lib/game/core/debug-config');
const { GAME_PHASE } = require('../lib/game/core/game-phase');
const { EMPTY_INPUT_SNAPSHOT, createInputSnapshot } = require('../lib/game/core/input-snapshot');
const { createRng, randomIntInclusive } = require('../lib/game/core/rng');
const { newGameState } = require('../lib/game/core/game-state');
const { tickGame } = require('../lib/game/core/tick');

test('GAME_CONFIG preserves the frozen AS3 startup values', () => {
  assert.equal(GAME_CONFIG.resolution.width, 320);
  assert.equal(GAME_CONFIG.resolution.height, 240);
  assert.equal(GAME_CONFIG.resolution.scale, 2);
  assert.equal(GAME_CONFIG.timingMs.popStarSpeed, 150);
  assert.equal(GAME_CONFIG.timingMs.initialMoveDelay, 300);
  assert.equal(GAME_CONFIG.timingMs.timerPaparazzi, 4000);
  assert.equal(GAME_CONFIG.timingMs.moneyzTimer, 11000);
  assert.equal(GAME_CONFIG.timingMs.cashGrabSentinel, 9999000);
  assert.equal(GAME_CONFIG.timingMs.winnarTimer, 200);
  assert.equal(GAME_CONFIG.timingMs.explodeTimer, 100);
  assert.equal(GAME_CONFIG.initialCounts.chaseChainTotal, 6);
  assert.equal(GAME_CONFIG.initialCounts.trafficTotal, 2);
  assert.equal(GAME_CONFIG.initialCounts.oppositeTrafficTotal, 1);
  assert.equal(GAME_CONFIG.initialCounts.taxiTotal, 1);
});

test('debug config defaults stay off while a single enabled flag turns overlay and logs on', () => {
  const enabledConfig = createDebugConfig({ enabled: true });
  const overlayOnlyConfig = createDebugConfig({ renderOverlay: true });

  assert.equal(DEBUG_CONFIG.enabled, false);
  assert.equal(isDebugOverlayEnabled(DEBUG_CONFIG), false);
  assert.equal(isDebugLoggingEnabled(DEBUG_CONFIG), false);

  assert.equal(enabledConfig.enabled, true);
  assert.equal(isDebugOverlayEnabled(enabledConfig), true);
  assert.equal(isDebugLoggingEnabled(enabledConfig), true);

  assert.equal(overlayOnlyConfig.enabled, false);
  assert.equal(isDebugOverlayEnabled(overlayOnlyConfig), true);
  assert.equal(isDebugLoggingEnabled(overlayOnlyConfig), false);
});

test('randomIntInclusive matches util.rand inclusive bounds', () => {
  assert.equal(randomIntInclusive(() => 0, 1, 5), 1);
  assert.equal(randomIntInclusive(() => 0.999999999, 1, 5), 5);
});

test('newGameState freezes the initial gameplay state without browser APIs', () => {
  const rng = {
    calls: 0,
    nextInt(min, max) {
      this.calls += 1;
      return this.calls === 1 ? min : max;
    }
  };
  const state = newGameState({ nowMs: 0, rng });

  assert.equal(state.phase, GAME_PHASE.PLAYING);
  assert.equal(state.score, 0);
  assert.equal(state.money, 0);
  assert.equal(state.photos, 0);
  assert.equal(state.crashes, 0);
  assert.equal(state.movement.popStarSpeedMs, 150);
  assert.equal(state.movement.nextMoveAtMs, 300);
  assert.equal(state.timers.timerPaparazziMs, 4000);
  assert.equal(state.timers.moneyzTimerMs, 11000);
  assert.equal(state.timers.cashGrabMs, 9999000);
  assert.equal(state.timers.winnarTimerMs, 200);
  assert.equal(state.timers.explodeTimerMs, 100);
  assert.equal(state.entities.chaseChain.length, 6);
  assert.equal(state.entities.traffic.length, 2);
  assert.equal(state.entities.oppositeTraffic.length, 1);
  assert.equal(state.entities.taxiLane.length, 1);
  assert.equal(state.entities.chaseChain[0].x, 32);
  assert.equal(state.entities.chaseChain[0].y, 240);
  assert.equal(state.entities.traffic[1].y, 80);
  assert.equal(state.entities.traffic[0].sentinel, true);
  assert.equal(state.entities.taxiLane[0].sentinel, true);
});

test('tickGame advances time in milliseconds with normalized input snapshots', () => {
  const state = newGameState({ nowMs: 25, rng: createRng(7) });
  const nextState = tickGame(state, { left: true }, 16);

  assert.equal(nextState.nowMs, 41);
  assert.equal(nextState.tickCount, 1);
  assert.equal(nextState.lastTickMs, 16);
  assert.deepEqual(nextState.input, {
    up: false,
    down: false,
    left: true,
    right: false
  });
  assert.equal(state.nowMs, 25);
});

test('input snapshot defaults stay framework-light', () => {
  assert.deepEqual(EMPTY_INPUT_SNAPSHOT, {
    up: false,
    down: false,
    left: false,
    right: false
  });
  assert.deepEqual(createInputSnapshot({ up: 1, right: true }), {
    up: true,
    down: false,
    left: false,
    right: true
  });
});

test('core modules do not import ig', () => {
  const coreDir = path.join(__dirname, '../lib/game/core');
  const files = fs.readdirSync(coreDir).filter((name) => name.endsWith('.js'));

  files.forEach((fileName) => {
    const contents = fs.readFileSync(path.join(coreDir, fileName), 'utf8');
    assert.doesNotMatch(contents, /\big\./, fileName + ' should not reference ig');
  });
});
