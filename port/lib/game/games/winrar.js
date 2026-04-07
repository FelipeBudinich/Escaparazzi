ig.module(
  'game.games.winrar'
)
.requires(
  'impact.game',
  'impact.input',
  'game.media'
)
.defines(function () {
  function setDocumentState(session, score) {
    document.documentElement.setAttribute('data-screen', 'winrar');
    document.documentElement.setAttribute('data-phase', 'winrar');
    document.documentElement.setAttribute('data-score', String(score));
    document.documentElement.setAttribute('data-high-score', String(session ? session.highScore : 0));
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

  ig.global.WinrarGame = ig.Game.extend({
    clearColor: '#000000',

    init: function () {
      this.context = ig.global.Escaparazzi || {};
      this.media = this.context.media || ig.global.EscaparazziMedia;
      this.audio = this.context.audio || null;
      this.session = this.context.session || null;
      this.saveData = this.session ? this.session.completeWin(this.session.currentRun) : {
        highScore: 0,
        achievements: []
      };
      this.transitioning = false;
      this.resetFlashTimerMs = 0;
      this.keyState = {};
      this.keyDownHandler = this.onKeyDown.bind(this);
      this.keyUpHandler = this.onKeyUp.bind(this);

      if (this.audio) {
        this.audio.stopMusic();
        this.audio.playEffect('win');
      }

      ig.input.bind(ig.KEY.MOUSE1, 'screen-click');
      window.addEventListener('keydown', this.keyDownHandler, false);
      window.addEventListener('keyup', this.keyUpHandler, false);

      setDocumentState(this.session, this.session && this.session.currentRun ? this.session.currentRun.score : 0);
    },

    detachHandlers: function () {
      window.removeEventListener('keydown', this.keyDownHandler, false);
      window.removeEventListener('keyup', this.keyUpHandler, false);
      ig.input.unbind(ig.KEY.MOUSE1);
    },

    returnToIntro: function () {
      if (this.transitioning) {
        return;
      }

      this.transitioning = true;
      this.detachHandlers();
      ig.system.setGame(ig.global.IntroGame);
    },

    resetSave: function () {
      if (!this.session) {
        return;
      }

      this.saveData = this.session.resetSave();
      this.resetFlashTimerMs = 1200;
      setDocumentState(this.session, this.session.currentRun ? this.session.currentRun.score : 0);
    },

    onKeyDown: function (event) {
      var code = getKeyCode(event);

      if (!code) {
        return;
      }

      this.keyState[code] = true;

      if (this.keyState[ig.KEY.R] && this.keyState[ig.KEY.E]) {
        this.resetSave();
        event.preventDefault();
        return;
      }

      if (!this.keyState[ig.KEY.R] && !this.keyState[ig.KEY.E]) {
        this.returnToIntro();
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

    update: function () {
      this.parent();

      if (this.resetFlashTimerMs > 0) {
        this.resetFlashTimerMs -= ig.system.tick * 1000;
      }

      if (ig.input.pressed('screen-click')) {
        this.returnToIntro();
      }
    },

    draw: function () {
      var ctx = ig.system.context;
      var score = this.session && this.session.currentRun ? this.session.currentRun.score : 0;

      this.parent();

      this.media.images.win.draw(40, 0);

      if (this.resetFlashTimerMs > 0) {
        ctx.save();
        ctx.globalAlpha = Math.min(0.8, this.resetFlashTimerMs / 1200);
        this.media.images.flash.draw(0, 0);
        ctx.restore();
      }

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f4f1de';
      ctx.font = (16 * ig.system.scale) + 'px monospace';
      ctx.fillText('Current Score ' + score, ig.system.getDrawPos(160), ig.system.getDrawPos(58));
      ctx.fillStyle = '#fff6a8';
      ctx.fillText('Highest Score ' + this.saveData.highScore, ig.system.getDrawPos(160), ig.system.getDrawPos(148));
      ctx.font = (8 * ig.system.scale) + 'px monospace';
      ctx.fillStyle = '#97cee3';
      ctx.fillText('Press any key or click for Intro', ig.system.getDrawPos(160), ig.system.getDrawPos(210));
      ctx.fillText('Press R+E to reset highscores', ig.system.getDrawPos(160), ig.system.getDrawPos(222));

      if (this.resetFlashTimerMs > 0) {
        ctx.fillStyle = '#f4f1de';
        ctx.fillText('High scores reset', ig.system.getDrawPos(160), ig.system.getDrawPos(198));
      }

      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.2;
      this.media.images.scanlines.draw(0, 0);
      ctx.restore();
    }
  });
});
