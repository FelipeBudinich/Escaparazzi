(function (root) {
  var GAME_PHASE = Object.freeze({
    PLAYING: 'playing',
    WIN_SEQUENCE: 'win-sequence',
    WINRAR: 'winrar',
    PAPARAZZED: 'paparazzed',
    DEADED: 'deaded'
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      GAME_PHASE: GAME_PHASE
    };
  }

  root.EscaparazziCore = root.EscaparazziCore || {};
  root.EscaparazziCore.GAME_PHASE = GAME_PHASE;
}(typeof globalThis !== 'undefined' ? globalThis : this));
