const parameters = PluginManager.parameters('MultiLang');
const defaultLang = parameters['Language'] || 'fr';

window.TextManagerEx = {
  _data: {},
  _language: defaultLang,

  setLanguage(lang) {
    this._language = lang;
    ConfigManager.language = lang;
    ConfigManager.save();
    return this.loadTexts().then(() => {
      // SceneManager.goto(Scene_Map); // ou une scène custom
    });
  },

  loadTexts() {
    const path = `data/lang/texts_${this._language}.json`;
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', path);
      xhr.overrideMimeType('application/json');
      xhr.onload = () => {
        if (xhr.status < 400) {
          this._data = JSON.parse(xhr.responseText);
          resolve();
        } else {
          reject(`Impossible de charger ${path}`);
        }
      };
      xhr.onerror = () => reject(`Erreur réseau sur ${path}`);
      xhr.send();
    });
  },

  t(key) {
    return this._data[key] || `[${key}]`;
  }
};

const availableLanguages = ["fr", "en"];
const languageLabels = {
  "fr": "Français",
  "en": "English"
};

const _Window_Options_addGeneralOptions = Window_Options.prototype.addGeneralOptions;
Window_Options.prototype.addGeneralOptions = function() {
  _Window_Options_addGeneralOptions.call(this);
  this.addCommand("Langue", "language");
};

const _Window_Options_statusText = Window_Options.prototype.statusText;
Window_Options.prototype.statusText = function(index) {
  const symbol = this.commandSymbol(index);
  if (symbol === "language") {
    return `${languageLabels["fr"]}/${languageLabels["en"]}`;
  }
  return _Window_Options_statusText.call(this, index);
};

const _Window_Options_getConfigValue = Window_Options.prototype.getConfigValue;
Window_Options.prototype.getConfigValue = function(symbol) {
  if (symbol === "language") {
    return ConfigManager.language;
  }
  return _Window_Options_getConfigValue.call(this, symbol);
};

const _Window_Options_changeValue = Window_Options.prototype.changeValue;
Window_Options.prototype.changeValue = function(symbol, value) {
  if (symbol === "language") {
    const index = availableLanguages.indexOf(ConfigManager.language);
    const next = availableLanguages[(index + 1) % availableLanguages.length];
    ConfigManager.language = next;
    this.redrawItem(this.findSymbol(symbol));
    SoundManager.playCursor();
    TextManagerEx.setLanguage(next);
    return;
  }
  _Window_Options_changeValue.call(this, symbol, value);
};

const _ConfigManager_makeData = ConfigManager.makeData;
ConfigManager.makeData = function() {
  const config = _ConfigManager_makeData.call(this);
  config.language = this.language || "fr";
  return config;
};

const _ConfigManager_applyData = ConfigManager.applyData;
ConfigManager.applyData = function(config) {
  _ConfigManager_applyData.call(this, config);
  this.language = config.language || "fr";
};

const _Scene_Boot_start = Scene_Boot.prototype.start;
Scene_Boot.prototype.start = function() {
  const originalStart = _Scene_Boot_start.bind(this);
  TextManagerEx.loadTexts().then(() => {
    originalStart();
  }).catch(err => {
    console.error(err);
    originalStart();
  });
};

const _Window_Base_convertEscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
Window_Base.prototype.convertEscapeCharacters = function(text) {
  text = text.replace(/langText\[(.+?)\]/gi, (_, key) => {
    return TextManagerEx.t(key);
  });
  text = _Window_Base_convertEscapeCharacters.call(this, text);
  return text;
};




//-----------------------------------------------------------------------------
// TextManager
//
// The static class that handles terms and messages.

function TextManager() {
    throw new Error('This is a static class');
}

TextManager.basic = function(basicId) {
    return $dataSystem.terms.basic[basicId] || '';
};

TextManager.param = function(paramId) {
    return $dataSystem.terms.params[paramId] || '';
};

TextManager.command = function(commandId) {
    return $dataSystem.terms.commands[commandId] || '';
};

TextManager.message = function(messageId) {
    return $dataSystem.terms.messages[messageId] || '';
};

TextManager.getter = function(method, param) {
    return {
        get: function() {
            return this[method](param).replace(/langText\[(.+?)\]/gi, (_, key) => TextManagerEx.t(key));
        },
        configurable: true
    };
};
Object.defineProperty(TextManager, 'currencyUnit', {
    get: function() { return $dataSystem.currencyUnit; },
    configurable: true
});

Object.defineProperties(TextManager, {
    level           : TextManager.getter('basic', 0),
    levelA          : TextManager.getter('basic', 1),
    hp              : TextManager.getter('basic', 2),
    hpA             : TextManager.getter('basic', 3),
    mp              : TextManager.getter('basic', 4),
    mpA             : TextManager.getter('basic', 5),
    tp              : TextManager.getter('basic', 6),
    tpA             : TextManager.getter('basic', 7),
    exp             : TextManager.getter('basic', 8),
    expA            : TextManager.getter('basic', 9),
    fight           : TextManager.getter('command', 0),
    escape          : TextManager.getter('command', 1),
    attack          : TextManager.getter('command', 2),
    guard           : TextManager.getter('command', 3),
    item            : TextManager.getter('command', 4),
    skill           : TextManager.getter('command', 5),
    equip           : TextManager.getter('command', 6),
    status          : TextManager.getter('command', 7),
    formation       : TextManager.getter('command', 8),
    save            : TextManager.getter('command', 9),
    gameEnd         : TextManager.getter('command', 10),
    options         : TextManager.getter('command', 11),
    weapon          : TextManager.getter('command', 12),
    armor           : TextManager.getter('command', 13),
    keyItem         : TextManager.getter('command', 14),
    equip2          : TextManager.getter('command', 15),
    optimize        : TextManager.getter('command', 16),
    clear           : TextManager.getter('command', 17),
    newGame         : TextManager.getter('command', 18),
    continue_       : TextManager.getter('command', 19),
    toTitle         : TextManager.getter('command', 21),
    cancel          : TextManager.getter('command', 22),
    buy             : TextManager.getter('command', 24),
    sell            : TextManager.getter('command', 25),
    alwaysDash      : TextManager.getter('message', 'alwaysDash'),
    commandRemember : TextManager.getter('message', 'commandRemember'),
    bgmVolume       : TextManager.getter('message', 'bgmVolume'),
    bgsVolume       : TextManager.getter('message', 'bgsVolume'),
    meVolume        : TextManager.getter('message', 'meVolume'),
    seVolume        : TextManager.getter('message', 'seVolume'),
    possession      : TextManager.getter('message', 'possession'),
    expTotal        : TextManager.getter('message', 'expTotal'),
    expNext         : TextManager.getter('message', 'expNext'),
    saveMessage     : TextManager.getter('message', 'saveMessage'),
    loadMessage     : TextManager.getter('message', 'loadMessage'),
    file            : TextManager.getter('message', 'file'),
    partyName       : TextManager.getter('message', 'partyName'),
    emerge          : TextManager.getter('message', 'emerge'),
    preemptive      : TextManager.getter('message', 'preemptive'),
    surprise        : TextManager.getter('message', 'surprise'),
    escapeStart     : TextManager.getter('message', 'escapeStart'),
    escapeFailure   : TextManager.getter('message', 'escapeFailure'),
    victory         : TextManager.getter('message', 'victory'),
    defeat          : TextManager.getter('message', 'defeat'),
    obtainExp       : TextManager.getter('message', 'obtainExp'),
    obtainGold      : TextManager.getter('message', 'obtainGold'),
    obtainItem      : TextManager.getter('message', 'obtainItem'),
    levelUp         : TextManager.getter('message', 'levelUp'),
    obtainSkill     : TextManager.getter('message', 'obtainSkill'),
    useItem         : TextManager.getter('message', 'useItem'),
    criticalToEnemy : TextManager.getter('message', 'criticalToEnemy'),
    criticalToActor : TextManager.getter('message', 'criticalToActor'),
    actorDamage     : TextManager.getter('message', 'actorDamage'),
    actorRecovery   : TextManager.getter('message', 'actorRecovery'),
    actorGain       : TextManager.getter('message', 'actorGain'),
    actorLoss       : TextManager.getter('message', 'actorLoss'),
    actorDrain      : TextManager.getter('message', 'actorDrain'),
    actorNoDamage   : TextManager.getter('message', 'actorNoDamage'),
    actorNoHit      : TextManager.getter('message', 'actorNoHit'),
    enemyDamage     : TextManager.getter('message', 'enemyDamage'),
    enemyRecovery   : TextManager.getter('message', 'enemyRecovery'),
    enemyGain       : TextManager.getter('message', 'enemyGain'),
    enemyLoss       : TextManager.getter('message', 'enemyLoss'),
    enemyDrain      : TextManager.getter('message', 'enemyDrain'),
    enemyNoDamage   : TextManager.getter('message', 'enemyNoDamage'),
    enemyNoHit      : TextManager.getter('message', 'enemyNoHit'),
    evasion         : TextManager.getter('message', 'evasion'),
    magicEvasion    : TextManager.getter('message', 'magicEvasion'),
    magicReflection : TextManager.getter('message', 'magicReflection'),
    counterAttack   : TextManager.getter('message', 'counterAttack'),
    substitute      : TextManager.getter('message', 'substitute'),
    buffAdd         : TextManager.getter('message', 'buffAdd'),
    debuffAdd       : TextManager.getter('message', 'debuffAdd'),
    buffRemove      : TextManager.getter('message', 'buffRemove'),
    actionFailure   : TextManager.getter('message', 'actionFailure'),
});
