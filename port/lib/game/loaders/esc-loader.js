ig.module(
  'game.loaders.esc-loader'
)
.requires(
  'impact.loader'
)
.defines(function () {
  ig.global.EscLoader = ig.Loader.extend({
    draw: function () {
      var ctx = ig.system.context;
      var scale = ig.system.scale;
      var width = 180;
      var height = 12;
      var x = (ig.system.width - width) / 2;
      var y = 142;
      var percent;

      this._drawStatus += (this.status - this._drawStatus) / 5;
      percent = Math.round(this._drawStatus * 100);

      ig.system.clear('#08121f');

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f4f1de';
      ctx.font = (12 * scale) + 'px monospace';
      ctx.fillText('Loading Escaparazzi', ig.system.getDrawPos(160), ig.system.getDrawPos(100));

      ctx.fillStyle = '#97cee3';
      ctx.font = (8 * scale) + 'px monospace';
      ctx.fillText(percent + '%', ig.system.getDrawPos(160), ig.system.getDrawPos(120));

      ctx.fillStyle = '#1d2f45';
      ctx.fillRect(x * scale, y * scale, width * scale, height * scale);

      ctx.fillStyle = '#f4f1de';
      ctx.fillRect((x + 1) * scale, (y + 1) * scale, (width - 2) * scale * this._drawStatus, (height - 2) * scale);
      ctx.restore();
    }
  });
});
