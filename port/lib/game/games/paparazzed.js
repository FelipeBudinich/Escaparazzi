ig.module(
  'game.games.paparazzed'
)
.requires(
  'impact.game',
  'game.media'
)
.defines(function () {
  function setDocumentState(session, score) {
    document.documentElement.setAttribute('data-screen', 'paparazzed');
    document.documentElement.setAttribute('data-phase', 'paparazzed');
    document.documentElement.setAttribute('data-score', String(score));
    document.documentElement.setAttribute('data-high-score', String(session ? session.highScore : 0));
  }

  ig.global.PaparazzedGame = ig.Game.extend({
    clearColor: '#000000',

    init: function () {
      this.context = ig.global.Escaparazzi || {};
      this.media = this.context.media || ig.global.EscaparazziMedia;
      this.audio = this.context.audio || null;
      this.session = this.context.session || null;
      this.elapsedMs = 0;
      this.durationMs = 1500;

      if (this.audio) {
        this.audio.stopMusic();
        this.audio.playEffect('paparazzed');
        this.audio.playEffect('camera');
      }

      if (this.session) {
        this.session.setActiveScreen('paparazzed');
      }

      setDocumentState(this.session, this.session && this.session.currentRun ? this.session.currentRun.score : 0);
    },

    update: function () {
      this.parent();

      this.elapsedMs += ig.system.tick * 1000;

      if (this.elapsedMs >= this.durationMs) {
        ig.system.setGame(ig.global.GameOverGame);
      }
    },

    draw: function () {
      var ctx = ig.system.context;
      var progress = Math.min(1, this.elapsedMs / this.durationMs);
      var score = this.session && this.session.currentRun ? this.session.currentRun.score : 0;

      this.parent();

      this.media.images.faint.draw(96, 56);

      ctx.save();
      ctx.globalAlpha = Math.max(0, 0.9 - progress);
      this.media.images.flash.draw(0, 0);
      ctx.restore();

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f4f1de';
      ctx.font = (8 * ig.system.scale) + 'px monospace';
      ctx.fillText('Score ' + score, ig.system.getDrawPos(160), ig.system.getDrawPos(204));
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.2;
      this.media.images.scanlines.draw(0, 0);
      ctx.restore();
    }
  });
});
