(function (root) {
  var coreScope = root.EscaparazziCore || (root.EscaparazziCore = {});
  var configModule = typeof module !== 'undefined' && module.exports
    ? require('./game-config')
    : coreScope;
  var phaseModule = typeof module !== 'undefined' && module.exports
    ? require('./game-phase')
    : coreScope;
  var rngModule = typeof module !== 'undefined' && module.exports
    ? require('./rng')
    : coreScope;
  var GAME_CONFIG = configModule.GAME_CONFIG;
  var GAME_PHASE = phaseModule.GAME_PHASE;
  var randomIntInclusive = rngModule.randomIntInclusive;

  function resolveRandomInt(rng, min, max) {
    if (rng && typeof rng.nextInt === 'function') {
      return rng.nextInt(min, max);
    }

    if (rng && typeof rng.int === 'function') {
      return rng.int(min, max);
    }

    if (rng && typeof rng.nextFloat === 'function') {
      return randomIntInclusive(rng.nextFloat.bind(rng), min, max);
    }

    if (rng && typeof rng.random === 'function') {
      return randomIntInclusive(rng.random.bind(rng), min, max);
    }

    return randomIntInclusive(Math.random, min, max);
  }

  function createChainMember(id, role, x, y, active, solid) {
    return {
      id: id,
      role: role,
      x: x,
      y: y,
      width: GAME_CONFIG.entitySizes.chainWidth,
      height: GAME_CONFIG.entitySizes.chainHeight,
      active: active,
      solid: solid
    };
  }

  function createVehicle(id, lane, x, y, active, sentinel) {
    return {
      id: id,
      lane: lane,
      x: x,
      y: y,
      width: GAME_CONFIG.entitySizes.vehicleWidth,
      height: GAME_CONFIG.entitySizes.vehicleHeight,
      active: active,
      sentinel: sentinel
    };
  }

  function createCoin(id, x, y, active) {
    return {
      id: id,
      x: x,
      y: y,
      width: GAME_CONFIG.entitySizes.coinWidth,
      height: GAME_CONFIG.entitySizes.coinHeight,
      active: active
    };
  }

  function cloneCollection(collection) {
    return collection.map(function (item) {
      return Object.assign({}, item);
    });
  }

  function cloneGameState(state) {
    return {
      phase: state.phase,
      nowMs: state.nowMs,
      tickCount: state.tickCount,
      lastTickMs: state.lastTickMs,
      score: state.score,
      money: state.money,
      photos: state.photos,
      crashes: state.crashes,
      counters: Object.assign({}, state.counters),
      input: state.input ? Object.assign({}, state.input) : null,
      flags: Object.assign({}, state.flags),
      movement: Object.assign({}, state.movement),
      timers: Object.assign({}, state.timers),
      entities: {
        chaseChain: cloneCollection(state.entities.chaseChain),
        traffic: cloneCollection(state.entities.traffic),
        oppositeTraffic: cloneCollection(state.entities.oppositeTraffic),
        taxiLane: cloneCollection(state.entities.taxiLane),
        coins: cloneCollection(state.entities.coins),
        explosions: cloneCollection(state.entities.explosions),
        poofs: cloneCollection(state.entities.poofs)
      }
    };
  }

  function newGameState(options) {
    var settings = options || {};
    var nowMs = Number.isFinite(settings.nowMs) ? settings.nowMs : 0;
    var playerX = resolveRandomInt(
      settings.rng,
      GAME_CONFIG.spawnRanges.playerSpawnXMin,
      GAME_CONFIG.spawnRanges.playerSpawnXMax
    );
    var activeTrafficY = resolveRandomInt(
      settings.rng,
      GAME_CONFIG.spawnRanges.activeTrafficSpawnYMin,
      GAME_CONFIG.spawnRanges.activeTrafficSpawnYMax
    );

    return {
      phase: GAME_PHASE.PLAYING,
      nowMs: nowMs,
      tickCount: 0,
      lastTickMs: 0,
      score: 0,
      money: 0,
      photos: 0,
      crashes: 0,
      counters: {
        paparazzo: 4,
        traffic: 2,
        oppositeTraffic: 1,
        taxi: 1,
        coin: 1
      },
      flags: {
        addFollower: false,
        countedPoints: false,
        winnar: false,
        playerTouchingTaxi: false
      },
      movement: {
        facing: 'up',
        popStarSpeedMs: GAME_CONFIG.timingMs.popStarSpeed,
        nextMoveAtMs: nowMs + GAME_CONFIG.timingMs.initialMoveDelay,
        inputTimerMs: GAME_CONFIG.timingMs.inputTimer
      },
      timers: {
        timerPhotoMs: GAME_CONFIG.timingMs.timerPhoto,
        timerPaparazziMs: GAME_CONFIG.timingMs.timerPaparazzi,
        moneyzTimerMs: GAME_CONFIG.timingMs.moneyzTimer,
        cashGrabMs: GAME_CONFIG.timingMs.cashGrabSentinel,
        winnarTimerMs: GAME_CONFIG.timingMs.winnarTimer,
        explodeTimerMs: GAME_CONFIG.timingMs.explodeTimer
      },
      entities: {
        chaseChain: [
          createChainMember(
            'player',
            'player',
            playerX,
            GAME_CONFIG.spawnRanges.playerSpawnY,
            true,
            true
          ),
          createChainMember('space-01', 'spacer', 0, GAME_CONFIG.spawnRanges.playerSpawnY, false, false),
          createChainMember('space-02', 'spacer', 0, GAME_CONFIG.spawnRanges.playerSpawnY, false, false),
          createChainMember('paparazzo-01', 'paparazzo', 0, GAME_CONFIG.spawnRanges.playerSpawnY, true, true),
          createChainMember('paparazzo-02', 'paparazzo', 0, GAME_CONFIG.spawnRanges.playerSpawnY, true, true),
          createChainMember('paparazzo-03', 'paparazzo', 0, GAME_CONFIG.spawnRanges.playerSpawnY, true, true)
        ],
        traffic: [
          createVehicle(
            'traffic-empty',
            'forward',
            GAME_CONFIG.spawnRanges.emptyVehicleSpawnX,
            GAME_CONFIG.spawnRanges.emptyVehicleSpawnY,
            false,
            true
          ),
          createVehicle(
            'traffic-01',
            'forward',
            GAME_CONFIG.spawnRanges.activeTrafficSpawnX,
            activeTrafficY,
            true,
            false
          )
        ],
        oppositeTraffic: [
          createVehicle(
            'opposite-traffic-empty',
            'reverse',
            GAME_CONFIG.spawnRanges.emptyVehicleSpawnX,
            GAME_CONFIG.spawnRanges.emptyVehicleSpawnY,
            false,
            true
          )
        ],
        taxiLane: [
          createVehicle(
            'taxi-empty',
            'taxi',
            GAME_CONFIG.spawnRanges.emptyVehicleSpawnX,
            GAME_CONFIG.spawnRanges.emptyVehicleSpawnY,
            false,
            true
          )
        ],
        coins: [
          createCoin(
            'coin-empty',
            GAME_CONFIG.spawnRanges.emptyVehicleSpawnX,
            GAME_CONFIG.spawnRanges.emptyVehicleSpawnY,
            false
          )
        ],
        explosions: [],
        poofs: []
      }
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      cloneGameState: cloneGameState,
      newGameState: newGameState
    };
  }

  coreScope.cloneGameState = cloneGameState;
  coreScope.newGameState = newGameState;
}(typeof globalThis !== 'undefined' ? globalThis : this));
