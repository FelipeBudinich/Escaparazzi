(function (root) {
  function scaledPos(drawPos, value, scale) {
    if (typeof drawPos === 'function') {
      return drawPos(value);
    }

    return Math.round(value * scale);
  }

  function renderDebugOverlay(options) {
    var ctx = options && options.context;
    var lines = options && options.lines ? options.lines.filter(Boolean).map(String) : [];
    var scale = options && options.scale ? options.scale : 1;
    var drawPos = options && options.drawPos;
    var x = options && options.x !== undefined ? options.x : 8;
    var y = options && options.y !== undefined ? options.y : 8;
    var fontSize = options && options.fontSize ? options.fontSize : 8;
    var padding = options && options.padding ? options.padding : 4;
    var lineHeight = options && options.lineHeight ? options.lineHeight : fontSize + 2;
    var maxWidth = 0;

    if (!ctx || lines.length === 0) {
      return;
    }

    ctx.save();
    ctx.font = (fontSize * scale) + 'px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    lines.forEach(function (line) {
      maxWidth = Math.max(maxWidth, ctx.measureText(line).width);
    });

    ctx.fillStyle = 'rgba(8, 18, 31, 0.88)';
    ctx.fillRect(
      scaledPos(drawPos, x - padding, scale),
      scaledPos(drawPos, y - padding, scale),
      maxWidth + ((padding * 2) * scale),
      (lines.length * lineHeight * scale) + ((padding * 2) * scale)
    );

    ctx.strokeStyle = 'rgba(151, 206, 227, 0.55)';
    ctx.lineWidth = Math.max(1, scale);
    ctx.strokeRect(
      scaledPos(drawPos, x - padding, scale),
      scaledPos(drawPos, y - padding, scale),
      maxWidth + ((padding * 2) * scale),
      (lines.length * lineHeight * scale) + ((padding * 2) * scale)
    );

    ctx.fillStyle = '#f4f1de';
    lines.forEach(function (line, index) {
      ctx.fillText(
        line,
        scaledPos(drawPos, x, scale),
        scaledPos(drawPos, y + (index * lineHeight), scale)
      );
    });
    ctx.restore();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      renderDebugOverlay: renderDebugOverlay
    };
  }

  root.EscaparazziCore = root.EscaparazziCore || {};
  root.EscaparazziCore.renderDebugOverlay = renderDebugOverlay;
}(typeof globalThis !== 'undefined' ? globalThis : this));
