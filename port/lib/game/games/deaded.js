ig.module(
  'game.games.deaded'
)
.requires(
  'impact.game',
  'game.media'
)
.defines(function () {
  function setDocumentState(session, score) {
    document.documentElement.setAttribute('data-screen', 'deaded');
    document.documentElement.setAttribute('data-phase', 'deaded');
    document.documentElement.setAttribute('data-score', String(score));
    document.documentElement.setAttribute('data-high-score', String(session ? session.highScore : 0));
  }

  ig.global.DeadedGame = ig.Game.extend({
    clearColor: '#000000',

    init: function () {
      this.core = window.EscaparazziCore || {};
      this.context = ig.global.Escaparazzi || {};
      this.debugConfig = this.core.DEBUG_CONFIG || {
        enabled: false,
        renderOverlay: false,
        logEvents: false
      };
      this.media = this.context.media || ig.global.EscaparazziMedia;
      this.audio = this.context.audio || null;
      this.session = this.context.session || null;
      this.elapsedMs = 0;
      this.durationMs = 1200;

      if (this.audio) {
        this.audio.stopMusic();
        this.audio.playEffect('deaded');
        this.audio.playEffect('crash');
      }

      if (this.session) {
        this.session.setActiveScreen('deaded');
      }

      setDocumentState(this.session, this.session && this.session.currentRun ? this.session.currentRun.score : 0);

      if (typeof this.core.debugLog === 'function') {
        this.core.debugLog('screen-enter', {
          screen: 'deaded',
          score: this.session && this.session.currentRun ? this.session.currentRun.score : 0
        });
      }
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

      this.media.images.dead.draw(96, 56);

      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - progress);
      this.media.images.bloody.draw(0, 0);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.2;
      this.media.images.scanlines.draw(0, 0);
      ctx.restore();

      if (
        this.core &&
        typeof this.core.isDebugOverlayEnabled === 'function' &&
        this.core.isDebugOverlayEnabled(this.debugConfig) &&
        typeof this.core.renderDebugOverlay === 'function'
      ) {
        this.core.renderDebugOverlay({
          context: ctx,
          scale: ig.system.scale,
          drawPos: ig.system.getDrawPos.bind(ig.system),
          lines: [
            'screen: deaded',
            'score: ' + score,
            'elapsed: ' + Math.round(this.elapsedMs) + '/' + this.durationMs
          ]
        });
      }
    }
  });
});
