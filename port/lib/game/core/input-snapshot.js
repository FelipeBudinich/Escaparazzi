(function (root) {
  var EMPTY_INPUT_SNAPSHOT = Object.freeze({
    up: false,
    down: false,
    left: false,
    right: false
  });

  function createInputSnapshot(overrides) {
    var source = overrides || {};

    return {
      up: !!source.up,
      down: !!source.down,
      left: !!source.left,
      right: !!source.right
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      EMPTY_INPUT_SNAPSHOT: EMPTY_INPUT_SNAPSHOT,
      createInputSnapshot: createInputSnapshot
    };
  }

  root.EscaparazziCore = root.EscaparazziCore || {};
  root.EscaparazziCore.EMPTY_INPUT_SNAPSHOT = EMPTY_INPUT_SNAPSHOT;
  root.EscaparazziCore.createInputSnapshot = createInputSnapshot;
}(typeof globalThis !== 'undefined' ? globalThis : this));
