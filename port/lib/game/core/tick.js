(function (root) {
  var coreScope = root.EscaparazziCore || (root.EscaparazziCore = {});
  var gameStateModule = typeof module !== 'undefined' && module.exports
    ? require('./game-state')
    : coreScope;
  var configModule = typeof module !== 'undefined' && module.exports
    ? require('./game-config')
    : coreScope;
  var phaseModule = typeof module !== 'undefined' && module.exports
    ? require('./game-phase')
    : coreScope;
  var rngModule = typeof module !== 'undefined' && module.exports
    ? require('./rng')
    : coreScope;
  var inputModule = typeof module !== 'undefined' && module.exports
    ? require('./input-snapshot')
    : coreScope;
  var GAME_CONFIG = configModule.GAME_CONFIG;
  var GAME_PHASE = phaseModule.GAME_PHASE;
  var randomIntInclusive = rngModule.randomIntInclusive;
  var cloneGameState = gameStateModule.cloneGameState;
  var createInputSnapshot = inputModule.createInputSnapshot;

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

  function resolveRandomFloat(rng) {
    if (rng && typeof rng.nextFloat === 'function') {
      return rng.nextFloat();
    }

    if (rng && typeof rng.random === 'function') {
      return rng.random();
    }

    return Math.random();
  }

  function hasDirectionalInput(input) {
    return input.up || input.down || input.left || input.right;
  }

  function updateFacing(movement, input) {
    if (input.up && movement.facing !== 'down') {
      return 'up';
    }

    if (input.down && movement.facing !== 'up') {
      return 'down';
    }

    if (input.left && movement.facing !== 'right') {
      return 'left';
    }

    if (input.right && movement.facing !== 'left') {
      return 'right';
    }

    return movement.facing;
  }

  function jitter(rng) {
    return resolveRandomInt(rng, -4, 4);
  }

  function trafficJitter(rng, magnitude) {
    return resolveRandomInt(rng, -magnitude, magnitude);
  }

  function intersectsAabb(a, b) {
    return a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y;
  }

  function activeMembers(collection) {
    return collection.filter(function (member) {
      return member.active;
    });
  }

  function activeCoin(state) {
    return activeMembers(state.entities.coins)[0] || null;
  }

  function visibleFollowers(state) {
    return state.entities.chaseChain.filter(function (member) {
      return member.role === 'paparazzo' && member.active;
    });
  }

  function createVehicle(state, lane, x, y, active, sentinel) {
    var counterKey = lane === 'forward' ? 'traffic' : lane === 'reverse' ? 'oppositeTraffic' : 'taxi';
    var idPrefix = lane === 'forward' ? 'traffic' : lane === 'reverse' ? 'opposite-traffic' : 'taxi';
    var id = idPrefix + '-' + String(state.counters[counterKey]).padStart(2, '0');

    state.counters[counterKey] += 1;

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

  function createCoin(state, x, y) {
    var id = 'coin-' + String(state.counters.coin).padStart(2, '0');

    state.counters.coin += 1;

    return {
      id: id,
      x: x,
      y: y,
      width: GAME_CONFIG.entitySizes.coinWidth,
      height: GAME_CONFIG.entitySizes.coinHeight,
      active: true
    };
  }

  function createInactiveCoin() {
    return {
      id: 'coin-empty',
      x: 0,
      y: 0,
      width: GAME_CONFIG.entitySizes.coinWidth,
      height: GAME_CONFIG.entitySizes.coinHeight,
      active: false
    };
  }

  function createPaparazzo(state, x, y) {
    var id = 'paparazzo-' + String(state.counters.paparazzo).padStart(2, '0');

    state.counters.paparazzo += 1;

    return {
      id: id,
      role: 'paparazzo',
      x: x,
      y: y,
      width: GAME_CONFIG.entitySizes.chainWidth,
      height: GAME_CONFIG.entitySizes.chainHeight,
      active: true,
      solid: true
    };
  }

  function coinLifetimeMs(state) {
    return (10 - state.money) * 1000;
  }

  function resetCoinTimer(state) {
    state.timers.moneyzTimerMs = coinLifetimeMs(state);
  }

  function ensureCoinPlaceholder(state) {
    if (state.entities.coins.length === 0) {
      state.entities.coins.push(createInactiveCoin());
    }
  }

  function removeCoinById(state, coinId) {
    state.entities.coins = state.entities.coins.filter(function (coin) {
      return coin.id !== coinId;
    });
    ensureCoinPlaceholder(state);
  }

  function spawnCoin(state, x, y) {
    if (activeCoin(state)) {
      return;
    }

    state.entities.coins = [createCoin(state, x, y)];
    resetCoinTimer(state);
  }

  function removeChaseMemberById(state, memberId) {
    state.entities.chaseChain = state.entities.chaseChain.filter(function (member) {
      return member.id !== memberId;
    });
  }

  function clampVehicleY(vehicle) {
    if (vehicle.y > GAME_CONFIG.resolution.height) {
      vehicle.y = 16;
    }

    if (vehicle.y < 0) {
      vehicle.y = 224;
    }
  }

  function moveForwardTraffic(state, rng) {
    activeMembers(state.entities.traffic).forEach(function (vehicle) {
      vehicle.x += GAME_CONFIG.resolution.tileSize;
      vehicle.y += trafficJitter(rng, GAME_CONFIG.traffic.forwardJitter);

      if (vehicle.x > GAME_CONFIG.resolution.width) {
        vehicle.x = -GAME_CONFIG.entitySizes.vehicleWidth;
        vehicle.y = resolveRandomInt(
          rng,
          GAME_CONFIG.traffic.wrapYMin,
          GAME_CONFIG.traffic.wrapYMax
        );
      }

      clampVehicleY(vehicle);
    });
  }

  function moveTaxiLane(state, rng) {
    activeMembers(state.entities.taxiLane).forEach(function (vehicle) {
      vehicle.x += GAME_CONFIG.resolution.tileSize;
      vehicle.y += trafficJitter(rng, GAME_CONFIG.traffic.taxiJitter);

      if (vehicle.x > GAME_CONFIG.resolution.width) {
        vehicle.x = -GAME_CONFIG.entitySizes.vehicleWidth;
      }

      clampVehicleY(vehicle);
    });
  }

  function moveReverseTraffic(state, rng) {
    activeMembers(state.entities.oppositeTraffic).forEach(function (vehicle) {
      vehicle.x -= GAME_CONFIG.resolution.tileSize;
      vehicle.y += trafficJitter(rng, GAME_CONFIG.traffic.reverseJitter);

      if (vehicle.x < -GAME_CONFIG.entitySizes.vehicleWidth) {
        vehicle.x = GAME_CONFIG.resolution.width;
        vehicle.y = resolveRandomInt(
          rng,
          GAME_CONFIG.traffic.wrapYMin,
          GAME_CONFIG.traffic.wrapYMax
        );
      }

      clampVehicleY(vehicle);
    });
  }

  function createDamageCooldownMs(rng) {
    return GAME_CONFIG.damageCooldownMs.minimum +
      (GAME_CONFIG.damageCooldownMs.range * resolveRandomFloat(rng));
  }

  function totalDamage(state) {
    return state.photos + state.crashes;
  }

  function isFatalDamage(state) {
    return totalDamage(state) >= GAME_CONFIG.thresholds.fatalDamageTotal;
  }

  function applyPhotoDamage(state, rng) {
    if (state.timers.timerPhotoMs < 0) {
      state.photos += 1;
      state.timers.timerPhotoMs = createDamageCooldownMs(rng);
    }

    if (isFatalDamage(state)) {
      state.phase = GAME_PHASE.PAPARAZZED;
    }
  }

  function removeForwardTrafficById(state, vehicleId) {
    state.entities.traffic = state.entities.traffic.filter(function (vehicle) {
      return vehicle.id !== vehicleId;
    });
  }

  function removeReverseTrafficById(state, vehicleId) {
    state.entities.oppositeTraffic = state.entities.oppositeTraffic.filter(function (vehicle) {
      return vehicle.id !== vehicleId;
    });
  }

  function spawnForwardVehicle(state, rng) {
    if (state.entities.traffic.length >= GAME_CONFIG.traffic.maxLaneMembers + 1) {
      return;
    }

    state.entities.traffic.push(
      createVehicle(
        state,
        'forward',
        resolveRandomInt(rng, GAME_CONFIG.traffic.forwardSpawnXMin, GAME_CONFIG.traffic.forwardSpawnXMax),
        resolveRandomInt(rng, GAME_CONFIG.traffic.activeSpawnYMin, GAME_CONFIG.traffic.activeSpawnYMax),
        true,
        false
      )
    );
  }

  function spawnReverseVehicle(state, rng) {
    if (state.entities.oppositeTraffic.length >= GAME_CONFIG.traffic.maxLaneMembers + 1) {
      return;
    }

    state.entities.oppositeTraffic.push(
      createVehicle(
        state,
        'reverse',
        resolveRandomInt(rng, GAME_CONFIG.traffic.reverseSpawnXMin, GAME_CONFIG.traffic.reverseSpawnXMax),
        resolveRandomInt(rng, GAME_CONFIG.traffic.activeSpawnYMin, GAME_CONFIG.traffic.activeSpawnYMax),
        true,
        false
      )
    );
  }

  function spawnTaxi(state, rng) {
    if (activeMembers(state.entities.taxiLane).length > 0) {
      return;
    }

    state.entities.taxiLane.push(
      createVehicle(
        state,
        'taxi',
        0,
        resolveRandomInt(rng, 32, 96),
        true,
        false
      )
    );
  }

  function spawnMoreCars(state, rng) {
    var direction = resolveRandomInt(rng, -1, 1);

    if (direction > 0) {
      spawnForwardVehicle(state, rng);
    } else {
      spawnReverseVehicle(state, rng);
    }
  }

  function applyCrash(state, vehicle, lane, rng) {
    state.score += GAME_CONFIG.scoreValues.crash;

    if (state.timers.timerPhotoMs < 0) {
      state.crashes += 1;
      state.timers.timerPhotoMs = createDamageCooldownMs(rng);
    }

    if (isFatalDamage(state)) {
      state.phase = GAME_PHASE.DEADED;
    }

    if (lane === 'forward') {
      removeForwardTrafficById(state, vehicle.id);
    } else {
      removeForwardTrafficById(state, vehicle.id);
    }

    spawnMoreCars(state, rng);
  }

  function resolvePlayerTrafficCollisions(state, rng) {
    var player = state.entities.chaseChain[0];
    var forwardVehicles = activeMembers(state.entities.traffic);
    var reverseVehicles = activeMembers(state.entities.oppositeTraffic);
    var index;

    for (index = 0; index < forwardVehicles.length; index++) {
      if (intersectsAabb(player, forwardVehicles[index])) {
        applyCrash(state, forwardVehicles[index], 'forward', rng);
        if (state.phase !== GAME_PHASE.PLAYING) {
          return;
        }
      }
    }

    for (index = 0; index < reverseVehicles.length; index++) {
      if (intersectsAabb(player, reverseVehicles[index])) {
        applyCrash(state, reverseVehicles[index], 'reverse', rng);
        if (state.phase !== GAME_PHASE.PLAYING) {
          return;
        }
      }
    }
  }

  function followerTrafficCollision(state, member, vehicle, lane, rng) {
    state.score += GAME_CONFIG.scoreValues.paparazzo;
    removeChaseMemberById(state, member.id);

    if (lane === 'forward') {
      removeForwardTrafficById(state, vehicle.id);
      spawnForwardVehicle(state, rng);
    } else {
      removeReverseTrafficById(state, vehicle.id);
      spawnReverseVehicle(state, rng);
    }

    spawnCoin(state, member.x, member.y);
  }

  function pushApart(forwardVehicle, reverseVehicle) {
    var distance = GAME_CONFIG.traffic.pushApartDistance;

    if (forwardVehicle.x >= reverseVehicle.x) {
      reverseVehicle.x -= distance;
      forwardVehicle.x += distance;
    } else {
      forwardVehicle.x -= distance;
      reverseVehicle.x += distance;
    }

    if (forwardVehicle.y >= reverseVehicle.y) {
      reverseVehicle.y -= distance;
      forwardVehicle.y += distance;
    } else {
      forwardVehicle.y -= distance;
      reverseVehicle.y += distance;
    }
  }

  function resolveTrafficPushApart(state) {
    activeMembers(state.entities.traffic).forEach(function (forwardVehicle) {
      activeMembers(state.entities.oppositeTraffic).forEach(function (reverseVehicle) {
        if (intersectsAabb(forwardVehicle, reverseVehicle)) {
          pushApart(forwardVehicle, reverseVehicle);
        }
      });
    });
  }

  function resolveFollowerTrafficCollisions(state, rng) {
    var followers = visibleFollowers(state);
    var followerIndex;
    var vehicleIndex;
    var forwardVehicles;
    var reverseVehicles;

    for (followerIndex = 0; followerIndex < followers.length; followerIndex++) {
      forwardVehicles = activeMembers(state.entities.traffic);

      for (vehicleIndex = 0; vehicleIndex < forwardVehicles.length; vehicleIndex++) {
        if (intersectsAabb(followers[followerIndex], forwardVehicles[vehicleIndex])) {
          followerTrafficCollision(state, followers[followerIndex], forwardVehicles[vehicleIndex], 'forward', rng);
          break;
        }
      }
    }

    followers = visibleFollowers(state);

    for (followerIndex = 0; followerIndex < followers.length; followerIndex++) {
      reverseVehicles = activeMembers(state.entities.oppositeTraffic);

      for (vehicleIndex = 0; vehicleIndex < reverseVehicles.length; vehicleIndex++) {
        if (intersectsAabb(followers[followerIndex], reverseVehicles[vehicleIndex])) {
          followerTrafficCollision(state, followers[followerIndex], reverseVehicles[vehicleIndex], 'reverse', rng);
          break;
        }
      }
    }
  }

  function resolvePlayerPhotoCollisions(state, rng) {
    var player = state.entities.chaseChain[0];

    state.entities.chaseChain.forEach(function (member) {
      if (state.phase !== GAME_PHASE.PLAYING) {
        return;
      }

      if (member.role === 'paparazzo' && member.active && intersectsAabb(player, member)) {
        applyPhotoDamage(state, rng);
      }
    });
  }

  function resolveTaxiContact(state) {
    var player = state.entities.chaseChain[0];

    state.flags.playerTouchingTaxi = activeMembers(state.entities.taxiLane).some(function (vehicle) {
      return intersectsAabb(player, vehicle);
    });
  }

  function resolveCoinCollection(state) {
    var player = state.entities.chaseChain[0];
    var coin = activeCoin(state);

    if (!coin || !intersectsAabb(player, coin)) {
      return;
    }

    state.score += GAME_CONFIG.scoreValues.moneyPickup;
    removeCoinById(state, coin.id);
    state.timers.cashGrabMs = GAME_CONFIG.timingMs.cashGrabCollectDelay;
    resetCoinTimer(state);
  }

  function maybeSpawnTaxi(state, rng) {
    if (state.money >= GAME_CONFIG.thresholds.taxiSpawnMoneyRequired) {
      spawnTaxi(state, rng);
    }
  }

  function maybeAccelerateForMoney(state) {
    if (state.movement.popStarSpeedMs > 140 && state.money > 1 && state.money <= 2) {
      state.movement.popStarSpeedMs -= 1;
    } else if (state.movement.popStarSpeedMs > 110 && state.money > 2 && state.money <= 3) {
      state.movement.popStarSpeedMs -= 2;
    } else if (state.movement.popStarSpeedMs > 100 && state.money > 3 && state.money <= 4) {
      state.movement.popStarSpeedMs -= 3;
    } else if (state.movement.popStarSpeedMs > 90 && state.money > 4 && state.money <= 5) {
      state.movement.popStarSpeedMs -= 4;
    }
  }

  function maybeQueueFollowerGrowth(state) {
    if (state.timers.timerPaparazziMs < 0) {
      state.flags.addFollower = true;
      state.timers.timerPaparazziMs = GAME_CONFIG.timingMs.timerPaparazziRecurring;
      maybeAccelerateForMoney(state);
    }
  }

  function followerSpawnCount(state, rng) {
    var roll = resolveRandomInt(rng, 1, Math.max(1, state.money));

    switch (roll) {
      case 1:
        return 1;
      case 2:
        return 1;
      case 3:
        return 2;
      case 4:
        return 3;
      case 5:
        return 4;
      case 6:
        return 5;
      default:
        return 0;
    }
  }

  function spawnFollowers(state, x, y, rng) {
    var count = followerSpawnCount(state, rng);
    var index;

    for (index = 0; index < count; index++) {
      state.entities.chaseChain.push(createPaparazzo(state, x, y));
    }

    state.flags.addFollower = false;
  }

  function beginWinSequence(state) {
    var followerCount;

    if (!state.flags.playerTouchingTaxi) {
      return;
    }

    if (state.money < GAME_CONFIG.thresholds.taxiUsableMoneyRequired) {
      return;
    }

    state.phase = GAME_PHASE.WIN_SEQUENCE;
    state.flags.winnar = true;

    if (!state.flags.countedPoints) {
      followerCount = visibleFollowers(state).length;
      state.score += followerCount * GAME_CONFIG.scoreValues.winFollowerBonus;
      state.flags.countedPoints = true;
    }
  }

  function updateCoinLifecycle(state, elapsedMs) {
    var coin = activeCoin(state);

    if (coin) {
      state.timers.moneyzTimerMs -= elapsedMs;

      if (state.timers.moneyzTimerMs <= 0) {
        removeCoinById(state, coin.id);
        resetCoinTimer(state);
      }

      return;
    }

    resetCoinTimer(state);
  }

  function updateCashGrab(state, elapsedMs) {
    if (state.timers.cashGrabMs >= GAME_CONFIG.timingMs.cashGrabSentinel) {
      return;
    }

    state.timers.cashGrabMs -= elapsedMs;

    if (state.timers.cashGrabMs <= 0) {
      state.money += 1;
      state.timers.cashGrabMs = GAME_CONFIG.timingMs.cashGrabSentinel;
    }
  }

  function updateWinSequence(state, elapsedMs) {
    var followers;

    state.timers.winnarTimerMs -= elapsedMs;

    if (state.timers.winnarTimerMs > 0) {
      return;
    }

    followers = visibleFollowers(state);

    if (followers.length > 0) {
      removeChaseMemberById(state, followers[followers.length - 1].id);
      state.timers.winnarTimerMs = GAME_CONFIG.timingMs.winSequenceStep;
      return;
    }

    state.phase = GAME_PHASE.WINRAR;
  }

  function movePlayer(state) {
    var player = state.entities.chaseChain[0];
    var stepSize = GAME_CONFIG.resolution.tileSize;
    var width = GAME_CONFIG.resolution.width;
    var height = GAME_CONFIG.resolution.height;
    var stopThreshold = GAME_CONFIG.timingMs.inputStopThreshold;

    switch (state.movement.facing) {
      case 'left':
        if (player.x <= 0) {
          player.x = width - stepSize;
        } else if (state.movement.inputTimerMs > stopThreshold) {
          player.x -= stepSize;
        }
        break;
      case 'right':
        if (player.x >= width - stepSize) {
          player.x = 0;
        } else if (state.movement.inputTimerMs > stopThreshold) {
          player.x += stepSize;
        }
        break;
      case 'up':
        if (player.y <= 0) {
          player.y = height - stepSize;
        } else if (state.movement.inputTimerMs > stopThreshold) {
          player.y -= stepSize;
        }
        break;
      case 'down':
        if (player.y >= height - stepSize) {
          player.y = 0;
        } else if (state.movement.inputTimerMs > stopThreshold) {
          player.y += stepSize;
        }
        break;
      default:
        break;
    }
  }

  function updateFollowerChain(state, previousPositions, rng) {
    var chaseChain = state.entities.chaseChain;
    var index;

    for (index = chaseChain.length - 1; index > 0; index--) {
      chaseChain[index].x = previousPositions[index - 1].x + jitter(rng);
      chaseChain[index].y = previousPositions[index - 1].y + jitter(rng);
    }
  }

  function stepMovement(state, rng) {
    var previousPositions = state.entities.chaseChain.map(function (member) {
      return { x: member.x, y: member.y };
    });

    movePlayer(state);
    updateFollowerChain(state, previousPositions, rng);

    if (state.flags.addFollower) {
      spawnFollowers(state, previousPositions[0].x, previousPositions[0].y, rng);
      spawnMoreCars(state, rng);
    }

    maybeSpawnTaxi(state, rng);
    moveForwardTraffic(state, rng);
    moveReverseTraffic(state, rng);
    moveTaxiLane(state, rng);
    resolvePlayerPhotoCollisions(state, rng);

    if (state.phase !== GAME_PHASE.PLAYING) {
      return;
    }

    resolvePlayerTrafficCollisions(state, rng);

    if (state.phase !== GAME_PHASE.PLAYING) {
      return;
    }

    resolveTrafficPushApart(state);
    resolveFollowerTrafficCollisions(state, rng);
    resolveCoinCollection(state);
    resolveTaxiContact(state);
    beginWinSequence(state);
  }

  function tickGame(state, inputSnapshot, elapsedMs, rng) {
    var nextState;
    var input;

    if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
      throw new RangeError('elapsedMs must be a finite number greater than or equal to zero');
    }

    nextState = cloneGameState(state);
    input = createInputSnapshot(inputSnapshot);

    nextState.nowMs += elapsedMs;
    nextState.tickCount += 1;
    nextState.lastTickMs = elapsedMs;
    nextState.input = input;

    if (
      nextState.phase === GAME_PHASE.PAPARAZZED ||
      nextState.phase === GAME_PHASE.DEADED ||
      nextState.phase === GAME_PHASE.WINRAR
    ) {
      return nextState;
    }

    nextState.timers.timerPhotoMs -= elapsedMs;
    nextState.timers.timerPaparazziMs -= elapsedMs;
    updateCoinLifecycle(nextState, elapsedMs);
    updateCashGrab(nextState, elapsedMs);

    if (nextState.phase === GAME_PHASE.WIN_SEQUENCE) {
      updateWinSequence(nextState, elapsedMs);
      return nextState;
    }

    nextState.movement.inputTimerMs = Math.max(0, nextState.movement.inputTimerMs - elapsedMs);
    nextState.movement.facing = updateFacing(nextState.movement, input);

    if (hasDirectionalInput(input)) {
      nextState.movement.inputTimerMs = GAME_CONFIG.timingMs.inputTimer;
    }

    maybeQueueFollowerGrowth(nextState);

    while (nextState.phase === GAME_PHASE.PLAYING && nextState.nowMs > nextState.movement.nextMoveAtMs) {
      stepMovement(nextState, rng);
      nextState.movement.nextMoveAtMs += nextState.movement.popStarSpeedMs;
    }

    return nextState;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      spawnMoreCars: spawnMoreCars,
      tickGame: tickGame
    };
  }

  coreScope.spawnMoreCars = spawnMoreCars;
  coreScope.tickGame = tickGame;
}(typeof globalThis !== 'undefined' ? globalThis : this));
