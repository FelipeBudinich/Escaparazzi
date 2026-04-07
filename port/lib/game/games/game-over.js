ig.module(
  'game.games.game-over'
)
.requires(
  'impact.game',
  'impact.input',
  'game.media'
)
.defines(function () {
  function setDocumentState(session, score) {
    document.documentElement.setAttribute('data-screen', 'game-over');
    document.documentElement.setAttribute('data-phase', 'game-over');
    document.documentElement.setAttribute('data-score', String(score));
    document.documentElement.setAttribute('data-high-score', String(session ? session.highScore : 0));
  }

  ig.global.GameOverGame = ig.Game.extend({
    clearColor: '#000000',

    init: function () {
      this.context = ig.global.Escaparazzi || {};
      this.media = this.context.media || ig.global.EscaparazziMedia;
      this.audio = this.context.audio || null;
      this.session = this.context.session || null;
      this.transitioning = false;
      this.keyDownHandler = this.onKeyDown.bind(this);

      if (this.audio) {
        this.audio.stopMusic();
      }

      if (this.session) {
        this.session.setActiveScreen('game-over');
      }

      ig.input.bind(ig.KEY.MOUSE1, 'screen-click');
      window.addEventListener('keydown', this.keyDownHandler, false);

      setDocumentState(this.session, this.session && this.session.currentRun ? this.session.currentRun.score : 0);
    },

    onKeyDown: function (_event) {
      this.startGame();
    },

    startGame: function () {
      if (this.transitioning) {
        return;
      }

      this.transitioning = true;

      if (this.audio) {
        this.audio.playEffect('introClick');
      }

      window.removeEventListener('keydown', this.keyDownHandler, false);
      ig.input.unbind(ig.KEY.MOUSE1);
      ig.system.setGame(ig.global.PlayGame);
    },

    update: function () {
      this.parent();

      if (ig.input.pressed('screen-click')) {
        this.startGame();
      }
    },

    draw: function () {
      var ctx = ig.system.context;
      var score = this.session && this.session.currentRun ? this.session.currentRun.score : 0;

      this.parent();

      this.media.images.gameOver.draw(40, 0);

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f4f1de';
      ctx.font = (8 * ig.system.scale) + 'px monospace';
      ctx.fillText('Score ' + score, ig.system.getDrawPos(160), ig.system.getDrawPos(210));
      ctx.fillText('Press any key or click to restart', ig.system.getDrawPos(160), ig.system.getDrawPos(224));
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.2;
      this.media.images.scanlines.draw(0, 0);
      ctx.restore();
    }
  });
});
