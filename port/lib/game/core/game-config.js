(function (root) {
  function deepFreeze(value) {
    var key;

    if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
      return value;
    }

    Object.freeze(value);

    for (key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        deepFreeze(value[key]);
      }
    }

    return value;
  }

  var GAME_CONFIG = deepFreeze({
    resolution: {
      width: 320,
      height: 240,
      scale: 2,
      tileSize: 16
    },
    timingMs: {
      popStarSpeed: 150,
      initialMoveDelay: 300,
      timerPhoto: 0,
      timerPaparazzi: 4000,
      timerPaparazziRecurring: 1000,
      moneyzTimer: 11000,
      cashGrabSentinel: 9999000,
      cashGrabCollectDelay: 300,
      winnarTimer: 200,
      winSequenceStep: 100,
      explodeTimer: 100,
      inputTimer: 15000,
      inputStopThreshold: 100
    },
    damageCooldownMs: {
      minimum: 100,
      range: 400
    },
    scoreValues: {
      crash: 100,
      paparazzo: 250,
      moneyPickup: 500,
      winFollowerBonus: 1000
    },
    thresholds: {
      fatalDamageTotal: 9,
      taxiSpawnMoneyRequired: 4,
      taxiUsableMoneyRequired: 5
    },
    entitySizes: {
      chainWidth: 16,
      chainHeight: 16,
      vehicleWidth: 32,
      vehicleHeight: 16,
      coinWidth: 8,
      coinHeight: 8
    },
    traffic: {
      pushApartDistance: 6,
      forwardJitter: 8,
      reverseJitter: 8,
      taxiJitter: 4,
      wrapYMin: 32,
      wrapYMax: 224,
      activeSpawnYMin: 60,
      activeSpawnYMax: 180,
      forwardSpawnXMin: -10,
      forwardSpawnXMax: 0,
      reverseSpawnXMin: 310,
      reverseSpawnXMax: 320,
      maxLaneMembers: 4
    },
    initialCounts: {
      chaseChainTotal: 6,
      chaseSpacerTotal: 2,
      chaseVisiblePaparazziTotal: 3,
      trafficTotal: 2,
      trafficActiveTotal: 1,
      oppositeTrafficTotal: 1,
      oppositeTrafficActiveTotal: 0,
      taxiTotal: 1,
      taxiActiveTotal: 0,
      coinsTotal: 0,
      explosionsTotal: 0,
      poofsTotal: 0
    },
    spawnRanges: {
      playerSpawnXMin: 32,
      playerSpawnXMax: 272,
      playerSpawnY: 240,
      activeTrafficSpawnX: 10,
      activeTrafficSpawnYMin: 60,
      activeTrafficSpawnYMax: 80,
      emptyVehicleSpawnX: 0,
      emptyVehicleSpawnY: 0
    }
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      GAME_CONFIG: GAME_CONFIG
    };
  }

  root.EscaparazziCore = root.EscaparazziCore || {};
  root.EscaparazziCore.GAME_CONFIG = GAME_CONFIG;
}(typeof globalThis !== 'undefined' ? globalThis : this));
