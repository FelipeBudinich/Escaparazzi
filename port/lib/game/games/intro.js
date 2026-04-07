ig.module(
  'game.games.intro'
)
.requires(
  'impact.game',
  'impact.input',
  'game.media'
)
.defines(function () {
  var PLAY_HITBOX = {x: 55, y: 175, width: 85, height: 34};

  function setDocumentState(screenName, highScore) {
    document.documentElement.setAttribute('data-screen', screenName);
    document.documentElement.setAttribute('data-high-score', String(highScore));
  }

  function isInsideRect(point, rect) {
    return point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height;
  }

  function getKeyCode(event) {
    var key = event.key ? String(event.key).toUpperCase() : '';

    if (event.keyCode || event.which) {
      return event.keyCode || event.which;
    }

    if (key === 'R') {
      return ig.KEY.R;
    }

    if (key === 'E') {
      return ig.KEY.E;
    }

    if (key.length === 1 && key >= 'A' && key <= 'Z') {
      return key.charCodeAt(0);
    }

    return 0;
  }

  ig.global.IntroGame = ig.Game.extend({
    clearColor: '#000000',
    playHitbox: PLAY_HITBOX,
    resetFlashTimerMs: 0,
    keyState: null,
    keyDownHandler: null,
    keyUpHandler: null,
    transitioning: false,

    init: function () {
      this.context = ig.global.Escaparazzi || {};
      this.media = this.context.media || ig.global.EscaparazziMedia;
      this.audio = this.context.audio || null;
      this.session = this.context.session || null;
      this.saveData = this.session ? this.session.getSaveData() : {
        highScore: 0,
        achievements: []
      };
      this.keyState = {};

      if (this.audio) {
        this.audio.stopMusic();
      }

      if (this.session) {
        this.session.setActiveScreen('intro');
      }

      ig.input.bind(ig.KEY.MOUSE1, 'intro-click');
      this.attachKeyboardHandlers();
      setDocumentState('intro', this.saveData.highScore);

      if (window.EscaparazziBootState && window.EscaparazziBootState.markReady) {
        window.EscaparazziBootState.markReady();
      }
    },

    attachKeyboardHandlers: function () {
      this.keyDownHandler = this.onKeyDown.bind(this);
      this.keyUpHandler = this.onKeyUp.bind(this);

      window.addEventListener('keydown', this.keyDownHandler, false);
      window.addEventListener('keyup', this.keyUpHandler, false);
    },

    detachInputHandlers: function () {
      if (this.keyDownHandler) {
        window.removeEventListener('keydown', this.keyDownHandler, false);
        this.keyDownHandler = null;
      }

      if (this.keyUpHandler) {
        window.removeEventListener('keyup', this.keyUpHandler, false);
        this.keyUpHandler = null;
      }

      ig.input.unbind(ig.KEY.MOUSE1);
    },

    onKeyDown: function (event) {
      var code = getKeyCode(event);

      if (!code) {
        return;
      }

      if (event.repeat && this.keyState[code]) {
        return;
      }

      this.keyState[code] = true;

      if (this.keyState[ig.KEY.R] && this.keyState[ig.KEY.E]) {
        this.resetSave();
        event.preventDefault();
        return;
      }

      if (!this.keyState[ig.KEY.R] && !this.keyState[ig.KEY.E]) {
        this.startNextScreen();
        event.preventDefault();
      }
    },

    onKeyUp: function (event) {
      var code = getKeyCode(event);

      if (!code) {
        return;
      }

      delete this.keyState[code];
    },

    resetSave: function () {
      if (!this.session) {
        return;
      }

      this.saveData = this.session.resetSave();
      this.resetFlashTimerMs = 1200;
      setDocumentState('intro', this.saveData.highScore);
    },

    startNextScreen: function () {
      if (this.transitioning) {
        return;
      }

      this.transitioning = true;
      this.detachInputHandlers();
      ig.system.setGame(ig.global.PlayGame);
    },

    update: function () {
      this.parent();

      if (this.resetFlashTimerMs > 0) {
        this.resetFlashTimerMs -= ig.system.tick * 1000;
      }

      if (ig.input.pressed('intro-click') && isInsideRect(ig.input.mouse, this.playHitbox)) {
        this.startNextScreen();
      }
    },

    draw: function () {
      var ctx = ig.system.context;
      var scale = ig.system.scale;

      this.parent();

      this.media.images.intro.draw(40, 0);

      ctx.save();
      ctx.globalAlpha = 0.2;
      this.media.images.scanlines.draw(0, 0);
      ctx.restore();

      if (this.resetFlashTimerMs > 0) {
        ctx.save();
        ctx.globalAlpha = Math.min(0.8, this.resetFlashTimerMs / 1200);
        this.media.images.flash.draw(0, 0);
        ctx.restore();
      }

      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = (8 * scale) + 'px monospace';
      ctx.fillStyle = '#f4f1de';
      ctx.fillText('High Score ' + this.saveData.highScore, ig.system.getDrawPos(160), ig.system.getDrawPos(206));
      ctx.fillStyle = '#fff6a8';
      ctx.fillText('Click Play or press any key', ig.system.getDrawPos(160), ig.system.getDrawPos(218));
      ctx.fillStyle = '#97cee3';
      ctx.fillText(
        this.resetFlashTimerMs > 0 ? 'High scores reset' : 'Press R+E to reset highscores',
        ig.system.getDrawPos(160),
        ig.system.getDrawPos(230)
      );
      ctx.restore();

      // TODO: Restore the charity button hit area and external-link behavior once the full intro menu pass begins.
    }
  });
});
