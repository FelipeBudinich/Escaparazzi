ig.module(
  'game.ui.popup-text'
)
.requires(
  'game.ui.text'
)
.defines(function () {
  ig.global.EscaparazziPopupText = {
    draw: function (effect, options) {
      var alpha = effect.maxTtlMs > 0 ? effect.ttlMs / effect.maxTtlMs : 1;

      ig.global.EscaparazziText.drawLabel(effect.text, effect.x, effect.y, {
        alpha: alpha,
        color: effect.color,
        size: effect.size,
        system: options && options.system,
        context: options && options.context
      });
    }
  };
});
