const test = require('node:test');
const assert = require('node:assert/strict');

const { EscaparazziSession } = require('../lib/game/session');

function createSaveStore() {
  return {
    saveCalls: 0,
    data: {
      highScore: 0,
      achievements: new Array(16).fill(0)
    },
    createDefaultData() {
      return {
        highScore: 0,
        achievements: new Array(16).fill(0)
      };
    },
    load() {
      return {
        highScore: this.data.highScore,
        achievements: this.data.achievements.slice(0)
      };
    },
    save(data) {
      this.saveCalls += 1;
      this.data = {
        highScore: data.highScore,
        achievements: data.achievements.slice(0)
      };
      return this.load();
    },
    reset() {
      this.data = this.createDefaultData();
      return this.load();
    }
  };
}

test('high score updates only on the win path and persists from winrar timing', () => {
  const saveStore = createSaveStore();
  const session = new EscaparazziSession(saveStore);

  session.load();
  session.beginRun({ score: 0 });
  session.setCurrentRun({ score: 900 });

  assert.equal(session.highScore, 0);
  assert.equal(saveStore.saveCalls, 0);

  session.completeWin({ score: 900 });

  assert.equal(session.highScore, 900);
  assert.equal(saveStore.saveCalls, 1);

  session.beginRun({ score: 0 });
  session.setCurrentRun({ score: 400 });

  assert.equal(session.highScore, 900);
  assert.equal(saveStore.saveCalls, 1);
});
