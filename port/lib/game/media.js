ig.module(
  'game.media'
)
.requires(
  'impact.image',
  'impact.animation'
)
.defines(function () {
  var assetsBase = window.EscaparazziAssetsBase || '/assets';

  function image(path) {
    return new ig.Image(assetsBase + path);
  }

  function sheet(path, width, height) {
    return new ig.AnimationSheet(assetsBase + path, width, height);
  }

  function hashIndex(id, length) {
    var hash = 0;
    var index;
    var normalized = String(id || '');

    for (index = 0; index < normalized.length; index++) {
      hash = ((hash << 5) - hash) + normalized.charCodeAt(index);
      hash |= 0;
    }

    return Math.abs(hash) % length;
  }

  function createAnimation(animationSheet, frameTime, sequence, stop) {
    return new ig.Animation(animationSheet, frameTime, sequence, stop);
  }

  var media = {
    images: {
      background: image('/gfx/background.png'),
      intro: image('/gfx/intro.png'),
      gameOver: image('/gfx/game_over.png'),
      win: image('/gfx/winscreen.png'),
      dead: image('/gfx/dead.png'),
      faint: image('/gfx/faint.png'),
      scanlines: image('/gfx/noise_01.png'),
      bloody: image('/gfx/bloody_screen.png'),
      flash: image('/gfx/flash_screen.png'),
      hudNeed: [
        image('/gfx/hud/need_00.png'),
        image('/gfx/hud/need_01.png'),
        image('/gfx/hud/need_02.png'),
        image('/gfx/hud/need_03.png'),
        image('/gfx/hud/need_04.png'),
        image('/gfx/hud/need_05.png')
      ],
      hudHead: [
        image('/gfx/hud/head_00.png'),
        image('/gfx/hud/head_01.png'),
        image('/gfx/hud/head_02.png'),
        image('/gfx/hud/head_03.png'),
        image('/gfx/hud/head_04.png'),
        image('/gfx/hud/head_05.png'),
        image('/gfx/hud/head_06.png'),
        image('/gfx/hud/head_07.png'),
        image('/gfx/hud/head_08.png')
      ],
      explosions: [
        image('/gfx/explode_01.png'),
        image('/gfx/explode_02.png'),
        image('/gfx/explode_03.png'),
        image('/gfx/explode_04.png')
      ]
    },
    sheets: {
      player: sheet('/gfx/star.png', 16, 16),
      paparazzi: [
        sheet('/gfx/paparazzo_01.png', 16, 16),
        sheet('/gfx/paparazzo_02.png', 16, 16),
        sheet('/gfx/paparazzo_03.png', 16, 16),
        sheet('/gfx/paparazzo_04.png', 16, 16),
        sheet('/gfx/paparazzo_05.png', 16, 16)
      ],
      forwardCars: [
        sheet('/gfx/auto_01.png', 32, 16),
        sheet('/gfx/auto_02.png', 32, 16),
        sheet('/gfx/auto_03.png', 32, 16),
        sheet('/gfx/auto_04.png', 32, 16)
      ],
      reverseCars: [
        sheet('/gfx/autoB_01.png', 32, 16),
        sheet('/gfx/autoB_02.png', 32, 16),
        sheet('/gfx/autoB_03.png', 32, 16),
        sheet('/gfx/autoB_04.png', 32, 16)
      ],
      taxi: sheet('/gfx/taxi.png', 32, 16),
      coin: sheet('/gfx/moneyz.png', 8, 8),
      moneyWin: sheet('/gfx/moneyz_win.png', 32, 32),
      poof: sheet('/gfx/moneyz_poof.png', 8, 8)
    },

    hudNeedImageForMoney: function (money) {
      var clamped = Math.max(0, Math.min(5, money));
      return this.images.hudNeed[5 - clamped];
    },

    hudHeadImageForDamage: function (damage) {
      return this.images.hudHead[Math.max(0, Math.min(8, damage))];
    },

    explosionImageForId: function (id) {
      return this.images.explosions[hashIndex(id, this.images.explosions.length)];
    },

    createPlayerAnimation: function () {
      return createAnimation(this.sheets.player, 1 / 12, [0, 1, 2, 3, 4, 5], false);
    },

    createPaparazzoAnimation: function (id) {
      return createAnimation(
        this.sheets.paparazzi[hashIndex(id, this.sheets.paparazzi.length)],
        1 / 12,
        [0, 1, 2, 3, 4, 5],
        false
      );
    },

    createTrafficAnimation: function (id, lane) {
      var sheets = lane === 'reverse' ? this.sheets.reverseCars : this.sheets.forwardCars;

      return createAnimation(
        sheets[hashIndex(id, sheets.length)],
        1 / 12,
        [0, 1],
        false
      );
    },

    createTaxiAnimation: function () {
      return createAnimation(this.sheets.taxi, 1 / 12, [0, 1], false);
    },

    createCoinAnimation: function () {
      return createAnimation(this.sheets.coin, 1 / 5, [0, 1], false);
    },

    createMoneyWinAnimation: function () {
      return createAnimation(this.sheets.moneyWin, 1 / 5, [0, 1], true);
    },

    createPoofAnimation: function () {
      return createAnimation(this.sheets.poof, 1 / 5, [0, 1, 2, 3], true);
    }
  };

  ig.global.EscaparazziMedia = media;
});
