ig.module(
  'game.games.play'
)
.requires(
  'impact.game',
  'impact.input',
  'game.media',
  'game.ui.hud',
  'game.ui.popup-text'
)
.defines(function () {
  var DIRECTION_BINDINGS = [
    { key: ig.KEY.UP_ARROW, action: 'move-up-arrow' },
    { key: ig.KEY.W, action: 'move-up-w' },
    { key: ig.KEY.DOWN_ARROW, action: 'move-down-arrow' },
    { key: ig.KEY.S, action: 'move-down-s' },
    { key: ig.KEY.LEFT_ARROW, action: 'move-left-arrow' },
    { key: ig.KEY.A, action: 'move-left-a' },
    { key: ig.KEY.RIGHT_ARROW, action: 'move-right-arrow' },
    { key: ig.KEY.D, action: 'move-right-d' }
  ];

  function setDocumentState(session, state) {
    document.documentElement.setAttribute(
      'data-screen',
      state.phase === 'playing' || state.phase === 'win-sequence' ? 'play' : state.phase
    );
    document.documentElement.setAttribute('data-phase', state.phase);
    document.documentElement.setAttribute('data-score', String(state.score));
    document.documentElement.setAttribute('data-money', String(state.money));
    document.documentElement.setAttribute('data-high-score', String(session ? session.highScore : 0));
  }

  function activeCoin(state) {
    var index;

    for (index = 0; index < state.entities.coins.length; index++) {
      if (state.entities.coins[index].active) {
        return state.entities.coins[index];
      }
    }

    return null;
  }

  function countActive(collection) {
    return collection.filter(function (item) {
      return item.active;
    }).length;
  }

  function visibleFollowers(state) {
    return state.entities.chaseChain.filter(function (member) {
      return member.role === 'paparazzo' && member.active;
    });
  }

  function mapById(collection) {
    var mapped = {};

    collection.forEach(function (item) {
      mapped[item.id] = item;
    });

    return mapped;
  }

  function alphaFromTimer(timerMs, maxMs, maxAlpha) {
    return Math.max(0, Math.min(maxAlpha, (timerMs / maxMs) * maxAlpha));
  }

  function formatTimerMs(timerMs, sentinel) {
    if (sentinel !== undefined && timerMs >= sentinel) {
      return 'idle';
    }

    return String(Math.max(0, Math.round(timerMs)));
  }

  ig.global.PlayGame = ig.Game.extend({
    clearColor: '#08121f',

    init: function () {
      this.core = window.EscaparazziCore;
      this.context = ig.global.Escaparazzi || {};
      this.debugConfig = this.core.DEBUG_CONFIG || {
        enabled: false,
        renderOverlay: false,
        logEvents: false
      };
      this.media = this.context.media || ig.global.EscaparazziMedia;
      this.audio = this.context.audio || null;
      this.session = this.context.session || null;
      this.hudRenderer = ig.global.EscaparazziHud;
      this.popupTextRenderer = ig.global.EscaparazziPopupText;
      this.rng = this.core.createRng(Date.now());
      this.state = this.core.newGameState({ nowMs: 0, rng: this.rng });
      this.transitioning = false;
      this.photoFlashMs = 0;
      this.crashFlashMs = 0;
      this.shakeMs = 0;
      this.effects = [];
      this.animations = {
        player: this.media.createPlayerAnimation(),
        paparazzi: {},
        traffic: {},
        oppositeTraffic: {},
        taxi: {},
        coins: {}
      };

      this.bindControls();
      this.syncAnimationCache(this.state);

      if (this.audio) {
        this.audio.playMusic('chase');
      }

      if (this.session) {
        this.session.beginRun(this.state);
      }

      setDocumentState(this.session, this.state);
      this.logDebugEvent('screen-enter', {
        screen: 'play',
        phase: this.state.phase
      });
    },

    bindControls: function () {
      DIRECTION_BINDINGS.forEach(function (binding) {
        ig.input.bind(binding.key, binding.action);
      });
    },

    buildInputSnapshot: function () {
      return this.core.createInputSnapshot({
        up: ig.input.state('move-up-arrow') || ig.input.state('move-up-w'),
        down: ig.input.state('move-down-arrow') || ig.input.state('move-down-s'),
        left: ig.input.state('move-left-arrow') || ig.input.state('move-left-a'),
        right: ig.input.state('move-right-arrow') || ig.input.state('move-right-d')
      });
    },

    syncAnimationCache: function (state) {
      var activeIds;
      var self = this;

      state.entities.chaseChain.forEach(function (member) {
        if (member.role === 'paparazzo' && member.active && !self.animations.paparazzi[member.id]) {
          self.animations.paparazzi[member.id] = self.media.createPaparazzoAnimation(member.id);
        }
      });

      state.entities.traffic.forEach(function (vehicle) {
        if (vehicle.active && !self.animations.traffic[vehicle.id]) {
          self.animations.traffic[vehicle.id] = self.media.createTrafficAnimation(vehicle.id, 'forward');
        }
      });

      state.entities.oppositeTraffic.forEach(function (vehicle) {
        if (vehicle.active && !self.animations.oppositeTraffic[vehicle.id]) {
          self.animations.oppositeTraffic[vehicle.id] = self.media.createTrafficAnimation(vehicle.id, 'reverse');
        }
      });

      state.entities.taxiLane.forEach(function (vehicle) {
        if (vehicle.active && !self.animations.taxi[vehicle.id]) {
          self.animations.taxi[vehicle.id] = self.media.createTaxiAnimation();
        }
      });

      state.entities.coins.forEach(function (coin) {
        if (coin.active && !self.animations.coins[coin.id]) {
          self.animations.coins[coin.id] = self.media.createCoinAnimation();
        }
      });

      activeIds = {
        paparazzi: mapById(visibleFollowers(state)),
        traffic: mapById(state.entities.traffic.filter(function (vehicle) { return vehicle.active; })),
        oppositeTraffic: mapById(state.entities.oppositeTraffic.filter(function (vehicle) { return vehicle.active; })),
        taxi: mapById(state.entities.taxiLane.filter(function (vehicle) { return vehicle.active; })),
        coins: mapById(state.entities.coins.filter(function (coin) { return coin.active; }))
      };

      Object.keys(this.animations.paparazzi).forEach(function (id) {
        if (!activeIds.paparazzi[id]) {
          delete self.animations.paparazzi[id];
        }
      });
      Object.keys(this.animations.traffic).forEach(function (id) {
        if (!activeIds.traffic[id]) {
          delete self.animations.traffic[id];
        }
      });
      Object.keys(this.animations.oppositeTraffic).forEach(function (id) {
        if (!activeIds.oppositeTraffic[id]) {
          delete self.animations.oppositeTraffic[id];
        }
      });
      Object.keys(this.animations.taxi).forEach(function (id) {
        if (!activeIds.taxi[id]) {
          delete self.animations.taxi[id];
        }
      });
      Object.keys(this.animations.coins).forEach(function (id) {
        if (!activeIds.coins[id]) {
          delete self.animations.coins[id];
        }
      });
    },

    createPopup: function (x, y, text, color, size, ttlMs) {
      this.effects.push({
        type: 'popup',
        x: x,
        y: y,
        text: text,
        color: color || '#f4f1de',
        size: size || 8,
        ttlMs: ttlMs || 400,
        maxTtlMs: ttlMs || 400
      });
    },

    createExplosionEffect: function (x, y, effectId) {
      this.effects.push({
        type: 'image',
        x: x,
        y: y,
        image: this.media.explosionImageForId(effectId),
        ttlMs: 100,
        maxTtlMs: 100
      });
    },

    createPoofEffect: function (x, y) {
      this.effects.push({
        type: 'animation',
        x: x,
        y: y,
        animation: this.media.createPoofAnimation(),
        ttlMs: 800,
        maxTtlMs: 800
      });
    },

    createMoneyWinEffect: function (x, y) {
      this.effects.push({
        type: 'animation',
        x: x,
        y: y,
        animation: this.media.createMoneyWinAnimation(),
        ttlMs: 250,
        maxTtlMs: 250
      });
    },

    logDebugEvent: function (eventName, details) {
      if (!this.core || typeof this.core.debugLog !== 'function') {
        return;
      }

      this.core.debugLog(eventName, details);
    },

    applyPresentationEvents: function (previousState, nextState) {
      var previousFollowerMap = mapById(visibleFollowers(previousState));
      var nextFollowerMap = mapById(visibleFollowers(nextState));
      var previousVisibleFollowerCount = Object.keys(previousFollowerMap).length;
      var nextVisibleFollowerCount = Object.keys(nextFollowerMap).length;
      var removedFollowerIds = Object.keys(previousFollowerMap).filter(function (id) {
        return !nextFollowerMap[id];
      });
      var previousCoin = activeCoin(previousState);
      var nextCoin = activeCoin(nextState);
      var enteredWinSequence = previousState.phase !== this.core.GAME_PHASE.WIN_SEQUENCE &&
        nextState.phase === this.core.GAME_PHASE.WIN_SEQUENCE;
      var crashAudioPlayed = false;
      var scoreDelta = nextState.score - previousState.score;
      var residualScoreDelta;
      var index;
      var removedFollower;
      var coinCollected = previousCoin &&
        !nextCoin &&
        nextState.timers.cashGrabMs < this.core.GAME_CONFIG.timingMs.cashGrabSentinel &&
        nextState.score > previousState.score;

      if (previousState.phase !== nextState.phase) {
        this.logDebugEvent('phase-change', {
          from: previousState.phase,
          to: nextState.phase,
          score: nextState.score,
          money: nextState.money
        });
      }

      if (!previousCoin && nextCoin) {
        this.logDebugEvent('coin-spawned', {
          id: nextCoin.id,
          x: nextCoin.x,
          y: nextCoin.y,
          timerMs: nextState.timers.moneyzTimerMs
        });
      }

      if (coinCollected) {
        this.logDebugEvent('coin-collected', {
          id: previousCoin.id,
          money: nextState.money,
          score: nextState.score
        });
      } else if (previousCoin && !nextCoin) {
        this.logDebugEvent('coin-expired', {
          id: previousCoin.id,
          timerMs: previousState.timers.moneyzTimerMs
        });
      }

      if (nextVisibleFollowerCount > previousVisibleFollowerCount) {
        this.logDebugEvent('followers-spawned', {
          added: nextVisibleFollowerCount - previousVisibleFollowerCount,
          total: nextVisibleFollowerCount
        });
      }

      if (removedFollowerIds.length > 0) {
        this.logDebugEvent(
          previousState.phase === this.core.GAME_PHASE.WIN_SEQUENCE || enteredWinSequence
            ? 'followers-cashed-out'
            : 'followers-hit-by-traffic',
          {
            removed: removedFollowerIds.length,
            remaining: nextVisibleFollowerCount,
            scoreDelta: scoreDelta
          }
        );
      }

      if (!previousState.flags.playerTouchingTaxi && nextState.flags.playerTouchingTaxi) {
        this.logDebugEvent('taxi-contact-start', {
          money: nextState.money,
          phase: nextState.phase
        });
      } else if (previousState.flags.playerTouchingTaxi && !nextState.flags.playerTouchingTaxi) {
        this.logDebugEvent('taxi-contact-end', {
          money: nextState.money,
          phase: nextState.phase
        });
      }

      if (nextState.photos > previousState.photos) {
        this.logDebugEvent('photo-hit', {
          totalPhotos: nextState.photos,
          totalDamage: nextState.photos + nextState.crashes,
          cooldownMs: nextState.timers.timerPhotoMs
        });
        this.photoFlashMs = 180;
        if (this.audio) {
          this.audio.playEffect('camera');
        }
        this.createPoofEffect(nextState.entities.chaseChain[0].x + 4, nextState.entities.chaseChain[0].y + 4);
      }

      for (index = 0; index < removedFollowerIds.length; index++) {
        removedFollower = previousFollowerMap[removedFollowerIds[index]];

        if (previousState.phase === this.core.GAME_PHASE.WIN_SEQUENCE || enteredWinSequence) {
          this.createMoneyWinEffect(removedFollower.x - 8, removedFollower.y - 8);
          this.createPopup(removedFollower.x, removedFollower.y - 18, '+1000', '#fff6a8', 16, 260);

          if (this.audio) {
            this.audio.playEffect('coin');
          }
        } else {
          this.createExplosionEffect(removedFollower.x, removedFollower.y, removedFollower.id);
          this.createPopup(removedFollower.x, removedFollower.y - 10, '+250', '#97cee3', 8, 360);

          if (this.audio && !crashAudioPlayed) {
            this.audio.playEffect('crash');
            crashAudioPlayed = true;
          }
        }
      }

      if (previousCoin && !nextCoin) {
        if (coinCollected) {
          this.createPopup(
            nextState.entities.chaseChain[0].x,
            nextState.entities.chaseChain[0].y - 12,
            '+500',
            '#55ff8a',
            8,
            360
          );

          if (this.audio) {
            this.audio.playEffect('coin');
          }
        } else {
          this.createPoofEffect(previousCoin.x, previousCoin.y);
        }
      }

      residualScoreDelta = scoreDelta - (removedFollowerIds.length * 250);

      if (enteredWinSequence) {
        residualScoreDelta -= visibleFollowers(previousState).length * 1000;
      }

      if (residualScoreDelta >= 100) {
        this.logDebugEvent('player-crash', {
          scoreDelta: residualScoreDelta,
          totalCrashes: nextState.crashes,
          totalDamage: nextState.photos + nextState.crashes,
          cooldownMs: nextState.timers.timerPhotoMs
        });
        this.crashFlashMs = 180;
        this.shakeMs = 140;
        this.createExplosionEffect(nextState.entities.chaseChain[0].x, nextState.entities.chaseChain[0].y, 'player-crash');
        this.createPopup(
          nextState.entities.chaseChain[0].x,
          nextState.entities.chaseChain[0].y - 12,
          '+' + residualScoreDelta,
          '#f4f1de',
          8,
          320
        );

        if (this.audio && !crashAudioPlayed) {
          this.audio.playEffect('crash');
          crashAudioPlayed = true;
        }
      }

      if (
        previousState.phase === this.core.GAME_PHASE.PLAYING &&
        (nextState.phase === this.core.GAME_PHASE.PAPARAZZED || nextState.phase === this.core.GAME_PHASE.DEADED)
      ) {
        if (this.audio) {
          this.audio.stopMusic();
        }
      }
    },

    drawDebugOverlay: function () {
      var player;
      var coin;

      if (!this.core ||
        typeof this.core.isDebugOverlayEnabled !== 'function' ||
        !this.core.isDebugOverlayEnabled(this.debugConfig) ||
        typeof this.core.renderDebugOverlay !== 'function') {
        return;
      }

      player = this.state.entities.chaseChain[0];
      coin = activeCoin(this.state);

      this.core.renderDebugOverlay({
        context: ig.system.context,
        scale: ig.system.scale,
        drawPos: ig.system.getDrawPos.bind(ig.system),
        x: 8,
        y: 44,
        lines: [
          'phase: ' + this.state.phase,
          'player: ' + player.x + ',' + player.y + ' facing ' + this.state.movement.facing,
          'score/high: ' + this.state.score + ' / ' + (this.session ? this.session.highScore : 0),
          'damage: ' + (this.state.photos + this.state.crashes) + ' (photo ' + this.state.photos + ', crash ' + this.state.crashes + ')',
          'money: ' + this.state.money + ' taxi: ' + (this.state.flags.playerTouchingTaxi ? 'touching' : 'away'),
          'followers: ' + visibleFollowers(this.state).length + ' coin: ' + (coin ? (coin.x + ',' + coin.y) : 'none'),
          'timers: photo ' + formatTimerMs(this.state.timers.timerPhotoMs) + ' papi ' + formatTimerMs(this.state.timers.timerPaparazziMs),
          'coin/cash: ' + formatTimerMs(this.state.timers.moneyzTimerMs) + ' / ' +
            formatTimerMs(this.state.timers.cashGrabMs, this.core.GAME_CONFIG.timingMs.cashGrabSentinel),
          'traffic: f ' + countActive(this.state.entities.traffic) +
            ' r ' + countActive(this.state.entities.oppositeTraffic) +
            ' t ' + countActive(this.state.entities.taxiLane)
        ]
      });
    },

    updateEffects: function () {
      var elapsedMs = ig.system.tick * 1000;

      this.effects = this.effects.filter(function (effect) {
        effect.ttlMs -= elapsedMs;

        if (effect.type === 'popup') {
          effect.y -= (elapsedMs / 1000) * 10;
        }

        if (effect.type === 'animation') {
          effect.animation.update();
        }

        return effect.ttlMs > 0;
      });
    },

    updateAnimations: function () {
      var self = this;

      this.animations.player.flip.x = this.state.movement.facing === 'left';
      this.animations.player.update();

      Object.keys(this.animations.paparazzi).forEach(function (id) {
        self.animations.paparazzi[id].update();
      });
      Object.keys(this.animations.traffic).forEach(function (id) {
        self.animations.traffic[id].update();
      });
      Object.keys(this.animations.oppositeTraffic).forEach(function (id) {
        self.animations.oppositeTraffic[id].update();
      });
      Object.keys(this.animations.taxi).forEach(function (id) {
        self.animations.taxi[id].update();
      });
      Object.keys(this.animations.coins).forEach(function (id) {
        self.animations.coins[id].update();
      });
    },

    handleTransitions: function () {
      if (this.transitioning) {
        return;
      }

      if (this.state.phase === this.core.GAME_PHASE.PAPARAZZED) {
        this.transitioning = true;
        if (this.session) {
          this.session.setActiveScreen('paparazzed');
        }
        ig.system.setGame(ig.global.PaparazzedGame);
        return;
      }

      if (this.state.phase === this.core.GAME_PHASE.DEADED) {
        this.transitioning = true;
        if (this.session) {
          this.session.setActiveScreen('deaded');
        }
        ig.system.setGame(ig.global.DeadedGame);
        return;
      }

      if (this.state.phase === this.core.GAME_PHASE.WINRAR) {
        this.transitioning = true;
        if (this.session) {
          this.session.setActiveScreen('winrar');
        }
        ig.system.setGame(ig.global.WinrarGame);
      }
    },

    update: function () {
      var previousState = this.state;

      this.parent();

      this.state = this.core.tickGame(
        this.state,
        this.buildInputSnapshot(),
        ig.system.tick * 1000,
        this.rng
      );

      this.syncAnimationCache(this.state);
      this.updateAnimations();
      this.updateEffects();
      this.applyPresentationEvents(previousState, this.state);

      this.photoFlashMs = Math.max(0, this.photoFlashMs - (ig.system.tick * 1000));
      this.crashFlashMs = Math.max(0, this.crashFlashMs - (ig.system.tick * 1000));
      this.shakeMs = Math.max(0, this.shakeMs - (ig.system.tick * 1000));

      if (this.session) {
        this.session.setCurrentRun(this.state);
      }

      setDocumentState(this.session, this.state);
      this.handleTransitions();
    },

    drawEffects: function () {
      var ctx = ig.system.context;
      var popupTextRenderer = this.popupTextRenderer;

      this.effects.forEach(function (effect) {
        if (effect.type === 'popup') {
          popupTextRenderer.draw(effect, {
            context: ctx,
            system: ig.system
          });
          return;
        }

        if (effect.type === 'image') {
          ctx.save();
          ctx.globalAlpha = effect.ttlMs / effect.maxTtlMs;
          effect.image.draw(effect.x, effect.y);
          ctx.restore();
          return;
        }

        effect.animation.draw(effect.x, effect.y);
      });
    },

    draw: function () {
      var ctx = ig.system.context;
      var scale = ig.system.scale;
      var shakeX = this.shakeMs > 0 ? Math.round((Math.random() * 4) - 2) : 0;
      var shakeY = this.shakeMs > 0 ? Math.round((Math.random() * 4) - 2) : 0;
      var self = this;

      this.parent();

      ctx.save();
      ctx.translate(shakeX * scale, shakeY * scale);

      this.media.images.background.draw(0, 0);

      this.state.entities.traffic.forEach(function (vehicle) {
        var animation = self.animations.traffic[vehicle.id];

        if (!vehicle.active || !animation) {
          return;
        }

        animation.draw(vehicle.x, vehicle.y);
      });

      this.state.entities.oppositeTraffic.forEach(function (vehicle) {
        var animation = self.animations.oppositeTraffic[vehicle.id];

        if (!vehicle.active || !animation) {
          return;
        }

        animation.draw(vehicle.x, vehicle.y);
      });

      this.state.entities.taxiLane.forEach(function (vehicle) {
        var animation = self.animations.taxi[vehicle.id];

        if (!vehicle.active || !animation) {
          return;
        }

        animation.draw(vehicle.x, vehicle.y);
      });

      this.animations.player.draw(this.state.entities.chaseChain[0].x, this.state.entities.chaseChain[0].y);

      this.state.entities.chaseChain.forEach(function (member) {
        var animation;

        if (member.role !== 'paparazzo' || !member.active) {
          return;
        }

        animation = self.animations.paparazzi[member.id];

        if (animation) {
          animation.draw(member.x, member.y);
        }
      });

      this.state.entities.coins.forEach(function (coin) {
        var animation = self.animations.coins[coin.id];

        if (!coin.active || !animation) {
          return;
        }

        animation.draw(coin.x, coin.y);
      });

      this.drawEffects();
      ctx.restore();

      if (this.crashFlashMs > 0) {
        ctx.save();
        ctx.globalAlpha = alphaFromTimer(this.crashFlashMs, 180, 0.9);
        this.media.images.bloody.draw(0, 0);
        ctx.restore();
      }

      if (this.photoFlashMs > 0) {
        ctx.save();
        ctx.globalAlpha = alphaFromTimer(this.photoFlashMs, 180, 0.75);
        this.media.images.flash.draw(0, 0);
        ctx.restore();
      }

      this.hudRenderer.drawPlayHud({
        context: ctx,
        system: ig.system,
        media: this.media,
        session: this.session,
        state: this.state
      });
      this.drawDebugOverlay();

      ctx.save();
      ctx.globalAlpha = 0.2;
      this.media.images.scanlines.draw(0, 0);
      ctx.restore();
    }
  });
});
