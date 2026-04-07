ig.module(
  'game.ui.intro-overlay'
)
.requires(
  'game.ui.text'
)
.defines(function () {
  var OVERLAY_POSITIONS = {
    highScoreX: 160,
    highScoreY: 206,
    startPromptX: 160,
    startPromptY: 218,
    resetPromptX: 160,
    resetPromptY: 230
  };

  ig.global.EscaparazziIntroOverlay = {
    draw: function (options) {
      var highScore = options.highScore || 0;
      var resetFlashTimerMs = options.resetFlashTimerMs || 0;

      ig.global.EscaparazziText.drawCenteredLabel('High Score ' + highScore, OVERLAY_POSITIONS.highScoreX, OVERLAY_POSITIONS.highScoreY, {
        color: '#f4f1de',
        size: 8,
        system: options.system,
        context: options.context
      });

      ig.global.EscaparazziText.drawCenteredLabel('Click Play or press any key', OVERLAY_POSITIONS.startPromptX, OVERLAY_POSITIONS.startPromptY, {
        color: '#fff6a8',
        size: 8,
        system: options.system,
        context: options.context
      });

      ig.global.EscaparazziText.drawCenteredLabel(
        resetFlashTimerMs > 0 ? 'High scores reset' : 'Press R+E to reset highscores',
        OVERLAY_POSITIONS.resetPromptX,
        OVERLAY_POSITIONS.resetPromptY,
        {
          color: resetFlashTimerMs > 0 ? '#f4f1de' : '#97cee3',
          size: 8,
          system: options.system,
          context: options.context
        }
      );
    }
  };
});
