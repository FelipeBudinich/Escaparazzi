ig.module(
  'game.ui.text'
)
.defines(function () {
  function activeSystem(options) {
    return options && options.system ? options.system : ig.system;
  }

  function activeContext(options, system) {
    if (options && options.context) {
      return options.context;
    }

    return system ? system.context : null;
  }

  function drawText(text, x, y, options) {
    var system = activeSystem(options);
    var ctx = activeContext(options, system);
    var scale;

    if (!ctx || !system || text === undefined || text === null) {
      return;
    }

    scale = system.scale || 1;

    ctx.save();
    ctx.globalAlpha = options && options.alpha !== undefined ? options.alpha : 1;
    ctx.textAlign = options && options.align ? options.align : 'left';
    ctx.textBaseline = options && options.baseline ? options.baseline : 'alphabetic';
    ctx.fillStyle = options && options.color ? options.color : '#f4f1de';
    ctx.font = ((options && options.size ? options.size : 8) * scale) + 'px ' +
      (options && options.fontFamily ? options.fontFamily : 'monospace');
    ctx.fillText(String(text), system.getDrawPos(x), system.getDrawPos(y));
    ctx.restore();
  }

  function drawLabel(text, x, y, options) {
    drawText(text, x, y, options);
  }

  function drawCenteredLabel(text, x, y, options) {
    var centeredOptions = Object.assign({}, options, { align: 'center' });

    drawText(text, x, y, centeredOptions);
  }

  function drawNumber(value, x, y, options) {
    drawText(String(value), x, y, options);
  }

  ig.global.EscaparazziText = {
    drawLabel: drawLabel,
    drawCenteredLabel: drawCenteredLabel,
    drawNumber: drawNumber
  };
});
