ig.module(
  'game.services.audio'
)
.defines(function () {
  var assetsBase = window.EscaparazziAssetsBase || '/assets';
  var EFFECT_VARIANTS = {
    camera: [
      assetsBase + '/snd/camara_01.mp3',
      assetsBase + '/snd/camara_02.mp3',
      assetsBase + '/snd/camara_03.mp3',
      assetsBase + '/snd/camara_04.mp3',
      assetsBase + '/snd/camara_05.mp3'
    ],
    coin: [
      assetsBase + '/snd/moneyz/moneyz_01.mp3',
      assetsBase + '/snd/moneyz/moneyz_02.mp3',
      assetsBase + '/snd/moneyz/moneyz_03.mp3',
      assetsBase + '/snd/moneyz/moneyz_04.mp3',
      assetsBase + '/snd/moneyz/moneyz_05.mp3'
    ],
    crash: [
      assetsBase + '/snd/car/car_01.mp3',
      assetsBase + '/snd/car/car_02.mp3',
      assetsBase + '/snd/car/car_03.mp3',
      assetsBase + '/snd/car/car_04.mp3',
      assetsBase + '/snd/car/car_05.mp3'
    ],
    introClick: [
      assetsBase + '/snd/intro_click.mp3'
    ],
    paparazzed: [
      assetsBase + '/snd/paparazzed.mp3'
    ],
    deaded: [
      assetsBase + '/snd/deaded.mp3'
    ],
    win: [
      assetsBase + '/snd/win.mp3'
    ]
  };
  var MUSIC_TRACKS = {
    chase: assetsBase + '/snd/chase.mp3'
  };

  function safePlay(audioNode) {
    var result;

    if (!audioNode) {
      return false;
    }

    try {
      result = audioNode.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }

      return true;
    } catch (_error) {
      return false;
    }
  }

  function createAudioNode(path, loop) {
    var audioNode;

    if (typeof window.Audio !== 'function') {
      return null;
    }

    try {
      audioNode = new Audio(path);
      audioNode.preload = 'auto';
      audioNode.loop = !!loop;
      audioNode.load();
      return audioNode;
    } catch (_error) {
      return null;
    }
  }

  ig.global.EscaparazziAudioService = ig.Class.extend({
    effectPools: null,
    musicTracks: null,
    currentMusicName: null,
    currentMusicNode: null,
    effectVolume: 0.75,
    musicVolume: 0.5,

    init: function () {
      this.effectPools = {};
      this.musicTracks = {};
    },

    getEffectPool: function (name) {
      var variants;
      var entries;
      var index;

      if (this.effectPools[name]) {
        return this.effectPools[name];
      }

      variants = EFFECT_VARIANTS[name] || [];
      entries = [];

      for (index = 0; index < variants.length; index++) {
        entries.push({
          index: 0,
          nodes: [
            createAudioNode(variants[index], false),
            createAudioNode(variants[index], false)
          ].filter(Boolean)
        });
      }

      this.effectPools[name] = entries;
      return entries;
    },

    getMusicTrack: function (name) {
      var trackPath = MUSIC_TRACKS[name];

      if (!trackPath) {
        return null;
      }

      if (!this.musicTracks[name]) {
        this.musicTracks[name] = createAudioNode(trackPath, true);
      }

      return this.musicTracks[name];
    },

    playEffect: function (name) {
      var pool = this.getEffectPool(name);
      var variant;
      var node;

      if (!pool.length) {
        return false;
      }

      variant = pool[Math.floor(Math.random() * pool.length)];

      if (!variant.nodes.length) {
        return false;
      }

      node = variant.nodes[variant.index % variant.nodes.length];
      variant.index += 1;

      try {
        node.pause();
        node.currentTime = 0;
      } catch (_error) {}

      node.volume = this.effectVolume;
      return safePlay(node);
    },

    playMusic: function (name) {
      var track = this.getMusicTrack(name);

      if (!track) {
        return false;
      }

      if (this.currentMusicNode && this.currentMusicNode !== track) {
        this.stopMusic();
      }

      this.currentMusicName = name;
      this.currentMusicNode = track;
      this.currentMusicNode.volume = this.musicVolume;
      return safePlay(this.currentMusicNode);
    },

    stopMusic: function () {
      if (!this.currentMusicNode) {
        return;
      }

      try {
        this.currentMusicNode.pause();
        this.currentMusicNode.currentTime = 0;
      } catch (_error) {}

      this.currentMusicNode = null;
      this.currentMusicName = null;
    }
  });
});
