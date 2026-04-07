ig.module(
  'game.services.save-store'
)
.defines(function () {
  var DEFAULT_STORAGE_KEY = 'Escaparazzi';
  var ACHIEVEMENT_SLOTS = 16;

  function createAchievements() {
    var achievements = [];
    var i;

    for (i = 0; i < ACHIEVEMENT_SLOTS; i++) {
      achievements.push(0);
    }

    return achievements;
  }

  function cloneSaveData(data) {
    return {
      highScore: data.highScore,
      achievements: data.achievements.slice(0)
    };
  }

  function normalizeSaveData(data) {
    var normalized = {
      highScore: 0,
      achievements: createAchievements()
    };
    var i;

    if (!data || typeof data !== 'object') {
      return normalized;
    }

    normalized.highScore = parseInt(data.highScore, 10) || 0;

    if (data.achievements && data.achievements.length) {
      for (i = 0; i < ACHIEVEMENT_SLOTS; i++) {
        normalized.achievements[i] = parseInt(data.achievements[i], 10) || 0;
      }
    }

    return normalized;
  }

  function parseLegacySave(raw) {
    var values = String(raw || '').split(',');

    return normalizeSaveData({
      highScore: values[0],
      achievements: values[1] ? values[1].split(':') : []
    });
  }

  ig.global.EscaparazziSaveStore = ig.Class.extend({
    storageKey: DEFAULT_STORAGE_KEY,
    memoryValue: null,

    init: function (storageKey) {
      this.storageKey = storageKey || DEFAULT_STORAGE_KEY;
    },

    createDefaultData: function () {
      return normalizeSaveData();
    },

    load: function () {
      var raw = this.readRaw();

      if (!raw) {
        return this.createDefaultData();
      }

      try {
        return normalizeSaveData(JSON.parse(raw));
      } catch (_error) {
        return parseLegacySave(raw);
      }
    },

    save: function (data) {
      var normalized = normalizeSaveData(data);

      this.writeRaw(JSON.stringify(normalized));
      return cloneSaveData(normalized);
    },

    reset: function () {
      return this.save(this.createDefaultData());
    },

    readRaw: function () {
      try {
        return window.localStorage.getItem(this.storageKey);
      } catch (_error) {
        return this.memoryValue;
      }
    },

    writeRaw: function (value) {
      this.memoryValue = value;

      try {
        window.localStorage.setItem(this.storageKey, value);
      } catch (_error) {}
    }
  });
});
