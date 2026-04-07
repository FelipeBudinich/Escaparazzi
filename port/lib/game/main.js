ig.module(
  'game.main'
)
.requires(
  'impact.game',
  'game.media',
  'game.services.save-store',
  'game.services.audio',
  'game.session',
  'game.loaders.esc-loader',
  'game.games.paparazzed',
  'game.games.deaded',
  'game.games.game-over',
  'game.games.winrar',
  'game.games.play',
  'game.games.intro'
)
.defines(function () {
  var saveStore = new ig.global.EscaparazziSaveStore('Escaparazzi');
  var audio = new ig.global.EscaparazziAudioService();
  var session = new ig.global.EscaparazziSession(saveStore);

  session.load();

  ig.global.Escaparazzi = {
    assetsBase: window.EscaparazziAssetsBase || '/assets',
    audio: audio,
    media: ig.global.EscaparazziMedia,
    saveStore: saveStore,
    session: session
  };

  ig.System.drawMode = ig.System.DRAW.AUTHENTIC;
  ig.System.scaleMode = ig.System.SCALE.CRISP;

  ig.main('#canvas', ig.global.IntroGame, 60, 320, 240, 2, ig.global.EscLoader);
});
