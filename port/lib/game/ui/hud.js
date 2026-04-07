ig.module(
  'game.ui.hud'
)
.requires(
  'game.ui.text'
)
.defines(function () {
  var HUD_POSITIONS = {
    headX: 20,
    headY: 8,
    needX: 220,
    needY: 8,
    scoreX: 20,
    scoreY: 200,
    highScoreX: 20,
    highScoreY: 214,
    winPromptX: 160,
    winPromptY: 224
  };

  ig.global.EscaparazziHud = {
    drawPlayHud: function (options) {
      var media = options.media;
      var session = options.session;
      var state = options.state;
      var highScore = session ? session.highScore : 0;

      media.hudHeadImageForDamage(state.photos + state.crashes).draw(HUD_POSITIONS.headX, HUD_POSITIONS.headY);
      media.hudNeedImageForMoney(state.money).draw(HUD_POSITIONS.needX, HUD_POSITIONS.needY);

      ig.global.EscaparazziText.drawNumber(state.score, HUD_POSITIONS.scoreX, HUD_POSITIONS.scoreY, {
        color: '#f4f1de',
        size: 16,
        system: options.system,
        context: options.context
      });

      ig.global.EscaparazziText.drawNumber(highScore, HUD_POSITIONS.highScoreX, HUD_POSITIONS.highScoreY, {
        color: '#97cee3',
        size: 8,
        system: options.system,
        context: options.context
      });

      if (state.phase === 'win-sequence') {
        ig.global.EscaparazziText.drawCenteredLabel('Taking the cab...', HUD_POSITIONS.winPromptX, HUD_POSITIONS.winPromptY, {
          color: '#fff6a8',
          size: 8,
          system: options.system,
          context: options.context
        });
      }
    }
  };
});
