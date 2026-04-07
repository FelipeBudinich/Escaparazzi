(function (root) {
  function randomIntInclusive(randomSource, min, max) {
    if (typeof randomSource !== 'function') {
      throw new TypeError('randomSource must be a function');
    }

    if (!Number.isInteger(min) || !Number.isInteger(max)) {
      throw new TypeError('min and max must be integers');
    }

    if (max < min) {
      throw new RangeError('max must be greater than or equal to min');
    }

    return Math.floor(randomSource() * (max - min + 1)) + min;
  }

  function createRng(seed) {
    var state = (seed === undefined ? 1 : seed) >>> 0;

    if (state === 0) {
      state = 1;
    }

    return {
      nextFloat: function () {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 4294967296;
      },
      nextInt: function (min, max) {
        return randomIntInclusive(this.nextFloat.bind(this), min, max);
      },
      getState: function () {
        return state;
      }
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      createRng: createRng,
      randomIntInclusive: randomIntInclusive
    };
  }

  root.EscaparazziCore = root.EscaparazziCore || {};
  root.EscaparazziCore.createRng = createRng;
  root.EscaparazziCore.randomIntInclusive = randomIntInclusive;
}(typeof globalThis !== 'undefined' ? globalThis : this));
