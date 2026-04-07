(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  }

  if (root.ig && root.ig.module) {
    root.ig.module(
      'game.session'
    )
    .requires(
      'game.services.save-store'
    )
    .defines(function () {
      root.ig.global.EscaparazziSession = factory(root.ig.global.EscaparazziSaveStore).EscaparazziSession;
    });
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function (DefaultSaveStoreClass) {
  function cloneSaveData(data) {
    return {
      highScore: data.highScore,
      achievements: data.achievements.slice(0)
    };
  }

  function EscaparazziSession(saveStore) {
    this.saveStore = saveStore || (DefaultSaveStoreClass ? new DefaultSaveStoreClass() : null);
    this.currentScore = 0;
    this.highScore = 0;
    this.achievements = [];
    this.activeScreen = 'boot';
    this.currentRun = null;
  }

  EscaparazziSession.prototype.getSaveData = function () {
    return cloneSaveData({
      highScore: this.highScore,
      achievements: this.achievements
    });
  };

  EscaparazziSession.prototype.applyPersistedData = function (data) {
    var normalized = this.saveStore.createDefaultData();

    normalized.highScore = data.highScore;
    normalized.achievements = data.achievements.slice(0);

    this.highScore = normalized.highScore;
    this.achievements = normalized.achievements.slice(0);
  };

  EscaparazziSession.prototype.load = function () {
    this.applyPersistedData(this.saveStore.load());
    this.currentScore = 0;
    return this.getSaveData();
  };

  EscaparazziSession.prototype.resetSave = function () {
    var data = this.saveStore.reset();

    this.applyPersistedData(data);
    return this.getSaveData();
  };

  EscaparazziSession.prototype.beginRun = function (runState) {
    this.currentRun = runState || null;
    this.currentScore = runState ? runState.score : 0;
    this.activeScreen = 'play';
  };

  EscaparazziSession.prototype.setActiveScreen = function (screenName) {
    this.activeScreen = screenName;
  };

  EscaparazziSession.prototype.setCurrentRun = function (runState) {
    this.currentRun = runState || null;
    this.currentScore = runState ? runState.score : 0;
    this.activeScreen = 'play';
  };

  EscaparazziSession.prototype.completeWin = function (runState) {
    var score;
    var savedData;

    this.currentRun = runState || this.currentRun;
    score = this.currentRun ? this.currentRun.score : 0;
    this.currentScore = score;

    if (score > this.highScore) {
      this.highScore = score;
    }

    savedData = this.saveStore.save({
      highScore: this.highScore,
      achievements: this.achievements
    });
    this.applyPersistedData(savedData);
    this.currentScore = score;
    this.activeScreen = 'winrar';

    return this.getSaveData();
  };

  return {
    EscaparazziSession: EscaparazziSession
  };
}));
