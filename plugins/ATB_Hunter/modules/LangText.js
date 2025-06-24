const parameters = PluginManager.parameters('MultiLang');
const defaultLang = parameters['Language'] || 'fr';

window.TextManagerEx = {
_data: {},
_language: defaultLang,

setLanguage(lang) {
    this._language = lang;
    return this.loadTexts();
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

// Chargement au démarrage
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

// Réécriture du système d'échappement de texte
const _Window_Base_convertEscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
Window_Base.prototype.convertEscapeCharacters = function(text) {
    text = _Window_Base_convertEscapeCharacters.call(this, text);
    console.log("text : " + text)
    text = text.replace(/langText\[(.+?)\]/gi, (_, key) => {
        return TextManagerEx.t(key);
    });
    return text;
};