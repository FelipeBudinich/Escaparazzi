const test = require('node:test');
const assert = require('node:assert/strict');

const { newGameState } = require('../lib/game/core/game-state');
const { tickGame, spawnMoreCars } = require('../lib/game/core/tick');

function createState(overrides) {
  const state = newGameState({
    nowMs: 0,
    rng: {
      nextInt(min) {
        return min;
      }
    }
  });

  return Object.assign(state, overrides || {});
}

function createNoJitterRng() {
  return {
    nextInt(min, max) {
      if (min <= 0 && max >= 0) {
        return 0;
      }

      return 0;
    },
    nextFloat() {
      return 0;
    }
  };
}

function createSequenceRng(intValues, floatValues) {
  const ints = intValues ? intValues.slice(0) : [];
  const floats = floatValues ? floatValues.slice(0) : [];

  return {
    nextInt(min, max) {
      if (!ints.length) {
        if (min <= 0 && max >= 0) {
          return 0;
        }

        return min;
      }

      return ints.shift();
    },
    nextFloat() {
      if (!floats.length) {
        return 0;
      }

      return floats.shift();
    }
  };
}

function createMappedRng(mapping, floatValues) {
  const floats = floatValues ? floatValues.slice(0) : [];

  return {
    nextInt(min, max) {
      const key = `${min}:${max}`;

      if (Object.prototype.hasOwnProperty.call(mapping, key)) {
        return mapping[key];
      }

      if (min <= 0 && max >= 0) {
        return 0;
      }

      return min;
    },
    nextFloat() {
      if (!floats.length) {
        return 0;
      }

      return floats.shift();
    }
  };
}

test('movement uses discrete 16px steps', () => {
  const state = createState();

  state.entities.chaseChain[0].x = 64;
  state.entities.chaseChain[0].y = 64;
  state.movement.nextMoveAtMs = 0;

  const nextState = tickGame(state, {}, 1, createNoJitterRng());

  assert.equal(nextState.entities.chaseChain[0].x, 64);
  assert.equal(nextState.entities.chaseChain[0].y, 48);
});

test('wrap-around works on all four edges', async (t) => {
  await t.test('left edge wraps to the far right tile', () => {
    const state = createState();
    state.entities.chaseChain[0].x = 0;
    state.entities.chaseChain[0].y = 64;
    state.movement.facing = 'left';
    state.movement.nextMoveAtMs = 0;

    const nextState = tickGame(state, {}, 1, createNoJitterRng());
    assert.equal(nextState.entities.chaseChain[0].x, 304);
  });

  await t.test('right edge wraps to x=0', () => {
    const state = createState();
    state.entities.chaseChain[0].x = 304;
    state.entities.chaseChain[0].y = 64;
    state.movement.facing = 'right';
    state.movement.nextMoveAtMs = 0;

    const nextState = tickGame(state, {}, 1, createNoJitterRng());
    assert.equal(nextState.entities.chaseChain[0].x, 0);
  });

  await t.test('top edge wraps to the bottom tile', () => {
    const state = createState();
    state.entities.chaseChain[0].x = 64;
    state.entities.chaseChain[0].y = 0;
    state.movement.facing = 'up';
    state.movement.nextMoveAtMs = 0;

    const nextState = tickGame(state, {}, 1, createNoJitterRng());
    assert.equal(nextState.entities.chaseChain[0].y, 224);
  });

  await t.test('bottom edge wraps to y=0', () => {
    const state = createState();
    state.entities.chaseChain[0].x = 64;
    state.entities.chaseChain[0].y = 224;
    state.movement.facing = 'down';
    state.movement.nextMoveAtMs = 0;

    const nextState = tickGame(state, {}, 1, createNoJitterRng());
    assert.equal(nextState.entities.chaseChain[0].y, 0);
  });
});

test('reverse turns are ignored', () => {
  const state = createState();

  state.entities.chaseChain[0].x = 64;
  state.entities.chaseChain[0].y = 64;
  state.movement.facing = 'left';
  state.movement.nextMoveAtMs = 0;

  const nextState = tickGame(state, { right: true }, 1, createNoJitterRng());

  assert.equal(nextState.movement.facing, 'left');
  assert.equal(nextState.entities.chaseChain[0].x, 48);
});

test('movement stops once the input timeout has expired', () => {
  const state = createState();

  state.entities.chaseChain[0].x = 64;
  state.entities.chaseChain[0].y = 64;
  state.movement.nextMoveAtMs = 0;
  state.movement.inputTimerMs = 50;

  const nextState = tickGame(state, {}, 1, createNoJitterRng());

  assert.equal(nextState.entities.chaseChain[0].x, 64);
  assert.equal(nextState.entities.chaseChain[0].y, 64);
});

test('follower chain keeps the spacer lag and visible trail ordering', () => {
  const state = createState();
  const chain = state.entities.chaseChain;

  state.entities.traffic = [state.entities.traffic[0]];
  state.entities.oppositeTraffic = [state.entities.oppositeTraffic[0]];
  chain[0].x = 64;
  chain[0].y = 64;
  chain[1].x = 48;
  chain[1].y = 64;
  chain[2].x = 32;
  chain[2].y = 64;
  chain[3].x = 16;
  chain[3].y = 64;
  chain[4].x = 0;
  chain[4].y = 64;
  chain[5].x = -16;
  chain[5].y = 64;

  state.movement.facing = 'right';
  state.movement.nextMoveAtMs = 0;

  const nextState = tickGame(state, { right: true }, 1, createNoJitterRng());

  assert.deepEqual(
    nextState.entities.chaseChain.map((member) => [member.x, member.y]),
    [
      [80, 64],
      [64, 64],
      [48, 64],
      [32, 64],
      [16, 64],
      [0, 64]
    ]
  );
});

test('photo and crash damage share the same cooldown while crash score still applies', () => {
  const state = createState();
  const chain = state.entities.chaseChain;

  state.entities.traffic = [
    state.entities.traffic[0],
    Object.assign({}, state.entities.traffic[1], { x: 48, y: 64, active: true })
  ];
  state.entities.oppositeTraffic = [state.entities.oppositeTraffic[0]];
  state.movement.nextMoveAtMs = 0;
  state.movement.inputTimerMs = 50;
  state.timers.timerPhotoMs = -1;

  chain[0].x = 64;
  chain[0].y = 64;
  chain[1].x = 48;
  chain[1].y = 64;
  chain[2].x = 64;
  chain[2].y = 64;
  chain[3].x = 0;
  chain[3].y = 0;

  const nextState = tickGame(state, {}, 1, createMappedRng({
    '-8:8': 0,
    '-4:4': 0,
    '-1:1': 1,
    '-10:0': -10,
    '60:180': 60
  }, [0]));

  assert.equal(nextState.photos, 1);
  assert.equal(nextState.crashes, 0);
  assert.equal(nextState.score, 100);
  assert.equal(nextState.phase, 'playing');
  assert.equal(nextState.timers.timerPhotoMs, 100);
});

test('the 9th crash causes the deaded fail state', () => {
  const state = createState();

  state.photos = 4;
  state.crashes = 4;
  state.entities.traffic = [
    state.entities.traffic[0],
    Object.assign({}, state.entities.traffic[1], { x: 48, y: 64, active: true })
  ];
  state.entities.oppositeTraffic = [state.entities.oppositeTraffic[0]];
  state.entities.chaseChain[0].x = 64;
  state.entities.chaseChain[0].y = 64;
  state.movement.nextMoveAtMs = 0;
  state.movement.inputTimerMs = 50;
  state.timers.timerPhotoMs = -1;

  const nextState = tickGame(state, {}, 1, createMappedRng({
    '-8:8': 0,
    '-4:4': 0,
    '-1:1': 1,
    '-10:0': -10,
    '60:180': 60
  }, [0]));

  assert.equal(nextState.crashes, 5);
  assert.equal(nextState.phase, 'deaded');
});

test('the 9th photo causes the paparazzed fail state', () => {
  const state = createState();
  const chain = state.entities.chaseChain;

  state.photos = 8;
  state.entities.traffic = [state.entities.traffic[0]];
  state.entities.oppositeTraffic = [state.entities.oppositeTraffic[0]];
  state.movement.nextMoveAtMs = 0;
  state.movement.inputTimerMs = 50;
  state.timers.timerPhotoMs = -1;

  chain[0].x = 64;
  chain[0].y = 64;
  chain[2].x = 64;
  chain[2].y = 64;

  const nextState = tickGame(state, {}, 1, createNoJitterRng());

  assert.equal(nextState.photos, 9);
  assert.equal(nextState.phase, 'paparazzed');
});

test('traffic wrap behavior matches the forward and reverse lane rules', async (t) => {
  await t.test('forward traffic wraps to x=-32 with a new lane y', () => {
    const state = createState();

    state.entities.traffic = [
      state.entities.traffic[0],
      Object.assign({}, state.entities.traffic[1], { x: 320, y: 80, active: true })
    ];
    state.entities.oppositeTraffic = [state.entities.oppositeTraffic[0]];
    state.movement.nextMoveAtMs = 0;
    state.movement.inputTimerMs = 50;

    const nextState = tickGame(state, {}, 1, createMappedRng({
      '-8:8': 0,
      '-4:4': 0,
      '32:224': 32
    }, [0]));

    assert.equal(nextState.entities.traffic[1].x, -32);
    assert.equal(nextState.entities.traffic[1].y, 32);
  });

  await t.test('reverse traffic wraps to x=320 with a new lane y', () => {
    const state = createState();

    state.entities.traffic = [state.entities.traffic[0]];
    state.entities.oppositeTraffic = [
      state.entities.oppositeTraffic[0],
      {
        id: 'opposite-traffic-99',
        lane: 'reverse',
        x: -32,
        y: 96,
        width: 32,
        height: 16,
        active: true,
        sentinel: false
      }
    ];
    state.movement.nextMoveAtMs = 0;
    state.movement.inputTimerMs = 50;

    const nextState = tickGame(state, {}, 1, createMappedRng({
      '-8:8': 0,
      '-4:4': 0,
      '32:224': 32
    }, [0]));

    assert.equal(nextState.entities.oppositeTraffic[1].x, 320);
    assert.equal(nextState.entities.oppositeTraffic[1].y, 32);
  });
});

test('spawnMoreCars keeps the reverse-lane bias from rand(-1, 1)', () => {
  const reverseFromZero = createState();
  const reverseFromNegative = createState();
  const forwardFromPositive = createState();

  spawnMoreCars(reverseFromZero, createSequenceRng([0, 320, 60], []));
  spawnMoreCars(reverseFromNegative, createSequenceRng([-1, 320, 60], []));
  spawnMoreCars(forwardFromPositive, createSequenceRng([1, -10, 60], []));

  assert.equal(reverseFromZero.entities.oppositeTraffic.length, 2);
  assert.equal(reverseFromNegative.entities.oppositeTraffic.length, 2);
  assert.equal(forwardFromPositive.entities.traffic.length, 3);
});

test('only one active coin can exist even when multiple followers die in the same step', () => {
  const state = createState();
  const chain = state.entities.chaseChain;

  chain[0].x = 0;
  chain[0].y = 0;
  chain[1].x = 16;
  chain[1].y = 0;
  chain[2].x = 64;
  chain[2].y = 64;
  chain[3].x = 96;
  chain[3].y = 64;
  chain[4].x = 128;
  chain[4].y = 64;
  chain[5].x = 144;
  chain[5].y = 64;

  state.entities.traffic = [
    state.entities.traffic[0],
    Object.assign({}, state.entities.traffic[1], { id: 'traffic-01', x: 64, y: 64, active: true }),
    { id: 'traffic-02', lane: 'forward', x: 96, y: 64, width: 32, height: 16, active: true, sentinel: false }
  ];
  state.entities.oppositeTraffic = [state.entities.oppositeTraffic[0]];
  state.movement.nextMoveAtMs = 0;
  state.movement.inputTimerMs = 50;

  const nextState = tickGame(state, {}, 1, createMappedRng({
    '-8:8': 0,
    '-4:4': 0,
    '-10:0': -10,
    '60:180': 60
  }, [0]));

  assert.equal(nextState.score, 500);
  assert.equal(nextState.entities.coins.filter((coin) => coin.active).length, 1);
});

test('money increments only after the delayed cash-in timer elapses', () => {
  const state = createState();

  state.entities.chaseChain[0].x = 64;
  state.entities.chaseChain[0].y = 64;
  state.entities.traffic = [state.entities.traffic[0]];
  state.entities.oppositeTraffic = [state.entities.oppositeTraffic[0]];
  state.entities.coins = [
    {
      id: 'coin-99',
      x: 64,
      y: 64,
      width: 8,
      height: 8,
      active: true
    }
  ];
  state.movement.nextMoveAtMs = 0;
  state.movement.inputTimerMs = 50;

  const collectedState = tickGame(state, {}, 1, createNoJitterRng());
  const waitingState = tickGame(collectedState, {}, 299, createNoJitterRng());
  const cashedInState = tickGame(waitingState, {}, 2, createNoJitterRng());

  assert.equal(collectedState.score, 500);
  assert.equal(collectedState.money, 0);
  assert.equal(waitingState.money, 0);
  assert.equal(cashedInState.money, 1);
});

test('taxi spawning waits for the money threshold', () => {
  const belowThreshold = createState();
  const atThreshold = createState();

  belowThreshold.money = 3;
  belowThreshold.entities.traffic = [belowThreshold.entities.traffic[0]];
  belowThreshold.entities.oppositeTraffic = [belowThreshold.entities.oppositeTraffic[0]];
  belowThreshold.movement.nextMoveAtMs = 0;
  belowThreshold.movement.inputTimerMs = 50;

  atThreshold.money = 4;
  atThreshold.entities.traffic = [atThreshold.entities.traffic[0]];
  atThreshold.entities.oppositeTraffic = [atThreshold.entities.oppositeTraffic[0]];
  atThreshold.movement.nextMoveAtMs = 0;
  atThreshold.movement.inputTimerMs = 50;

  const noTaxiYet = tickGame(belowThreshold, {}, 1, createMappedRng({
    '-8:8': 0,
    '-4:4': 0,
    '32:96': 48
  }, [0]));
  const taxiSpawned = tickGame(atThreshold, {}, 1, createMappedRng({
    '-8:8': 0,
    '-4:4': 0,
    '32:96': 48
  }, [0]));

  assert.equal(noTaxiYet.entities.taxiLane.filter((vehicle) => vehicle.active).length, 0);
  assert.equal(taxiSpawned.entities.taxiLane.filter((vehicle) => vehicle.active).length, 1);
});

test('taxi only starts the win path once the usable threshold is reached', () => {
  const belowThreshold = createState();
  const atThreshold = createState();

  belowThreshold.money = 4;
  belowThreshold.entities.traffic = [belowThreshold.entities.traffic[0]];
  belowThreshold.entities.oppositeTraffic = [belowThreshold.entities.oppositeTraffic[0]];
  belowThreshold.entities.taxiLane = [
    belowThreshold.entities.taxiLane[0],
    { id: 'taxi-01', lane: 'taxi', x: 48, y: 64, width: 32, height: 16, active: true, sentinel: false }
  ];
  belowThreshold.entities.chaseChain[0].x = 64;
  belowThreshold.entities.chaseChain[0].y = 64;
  belowThreshold.movement.nextMoveAtMs = 0;
  belowThreshold.movement.inputTimerMs = 50;

  atThreshold.money = 5;
  atThreshold.entities.traffic = [atThreshold.entities.traffic[0]];
  atThreshold.entities.oppositeTraffic = [atThreshold.entities.oppositeTraffic[0]];
  atThreshold.entities.taxiLane = [
    atThreshold.entities.taxiLane[0],
    { id: 'taxi-01', lane: 'taxi', x: 48, y: 64, width: 32, height: 16, active: true, sentinel: false }
  ];
  atThreshold.entities.chaseChain[0].x = 64;
  atThreshold.entities.chaseChain[0].y = 64;
  atThreshold.movement.nextMoveAtMs = 0;
  atThreshold.movement.inputTimerMs = 50;

  const stillPlaying = tickGame(belowThreshold, {}, 1, createNoJitterRng());
  const winSequence = tickGame(atThreshold, {}, 1, createNoJitterRng());

  assert.equal(stillPlaying.phase, 'playing');
  assert.equal(winSequence.phase, 'win-sequence');
  assert.equal(winSequence.score, 3000);
});

test('the win sequence drains visible followers before reaching winrar', () => {
  const state = createState();

  state.money = 5;
  state.entities.traffic = [state.entities.traffic[0]];
  state.entities.oppositeTraffic = [state.entities.oppositeTraffic[0]];
  state.entities.taxiLane = [
    state.entities.taxiLane[0],
    { id: 'taxi-01', lane: 'taxi', x: 48, y: 64, width: 32, height: 16, active: true, sentinel: false }
  ];
  state.entities.chaseChain[0].x = 64;
  state.entities.chaseChain[0].y = 64;
  state.movement.nextMoveAtMs = 0;
  state.movement.inputTimerMs = 50;

  const enteredWin = tickGame(state, {}, 1, createNoJitterRng());
  const drainOne = tickGame(enteredWin, {}, 200, createNoJitterRng());
  const drainTwo = tickGame(drainOne, {}, 100, createNoJitterRng());
  const drainThree = tickGame(drainTwo, {}, 100, createNoJitterRng());
  const finished = tickGame(drainThree, {}, 100, createNoJitterRng());

  assert.equal(enteredWin.phase, 'win-sequence');
  assert.equal(drainOne.entities.chaseChain.filter((member) => member.role === 'paparazzo').length, 2);
  assert.equal(drainTwo.entities.chaseChain.filter((member) => member.role === 'paparazzo').length, 1);
  assert.equal(drainThree.entities.chaseChain.filter((member) => member.role === 'paparazzo').length, 0);
  assert.equal(finished.phase, 'winrar');
});
