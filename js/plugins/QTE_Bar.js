/*:
 * @plugindesc QTE à barre temporelle - Affiche une barre de progression avec zone de réussite entre deux temps donnés - v1.3
 * @author RPG Maker AI
 *
 * @help
 * Script call :
 *   startQTE(duration, minSuccess, maxSuccess, deadzoneStart, variableId, eventName)
 *     - duration        : Durée totale du QTE (en secondes)
 *     - minSuccess      : Début de la fenêtre de réussite (en secondes)
 *     - maxSuccess      : Fin de la fenêtre de réussite (en secondes)
 *     - deadzoneStart   : Début de la zone "fail" (en secondes) avant minSuccess
 *     - variableId      : ID de la variable à modifier (1 si réussite, 0 si échec)
 *     - eventName       : Nom de l'événement auquel ancrer la fenêtre
 */

(function() {
  class Window_QTEBar extends Window_Base {
    initialize(x, y, width, height) {
      super.initialize(x, y, width, height);
      this._duration = 180;
      this._minSuccess = 60;
      this._maxSuccess = 120;
      this._deadzoneStart = 0;
      this._timer = 0;
      this._activeQTE = false;
      this._evtName = null;
    }

    start(duration, minSuccess, maxSuccess, deadzoneStart, variableId, event) {
      this._duration = Math.floor(duration * 60);
      this._minSuccess = Math.floor(minSuccess * 60);
      this._maxSuccess = Math.floor(maxSuccess * 60);
      this._deadzoneStart = Math.floor(deadzoneStart * 60);
      this._timer = 0;
      this._activeQTE = true;
      this._evtName = event;
      this._variableId = variableId;
      this.open();
      this.activate();
    }

    update() {
      super.update();
      if (!this._activeQTE) return;
      this._timer++;
      if (this._timer >= this._duration) {
        this._activeQTE = false;
        this.setResult(false);
        this.close();
      }
      this.refresh();
    }

    setResult(success) {
      if (this._variableId > 0) {
        $gameVariables.setValue(this._variableId, success ? 1 : 0);
      }
    }

    processSuccessAttempt() {
      if (!this._activeQTE) return;
      const t = this._timer;
      let result = null;
      if (t < this._deadzoneStart) {
        return; // Trop tôt, ignoré
      } else if (t >= this._deadzoneStart && t < this._minSuccess) {
        result = false; // Deadzone : échec
      } else if (t >= this._minSuccess && t <= this._maxSuccess) {
        result = true; // Zone de succès
      } else {
        result = false; // Trop tard
      }
      this._activeQTE = false;
      this.setResult(result);
      if (result) {
        this._successCallback && this._successCallback();
      } else {
        this._failCallback && this._failCallback();
      }
      this.close();
    }

    refresh() {
      this.contents.clear();
      const rate = this._timer / this._duration;
      const width = this.contentsWidth();
      const height = this.contentsHeight();
      const barWidth = Math.floor(rate * width);
      const minX = (this._minSuccess / this._duration) * width;
      const maxX = (this._maxSuccess / this._duration) * width;
      const dzStartX = (this._deadzoneStart / this._duration) * width;
      const endX = width;

      // Fond gris
      this.contents.fillRect(0, height / 2 - 5, width, 10, '#444');
      // Zone deadzone (rouge) avant succès
      if (dzStartX < minX) {
        this.contents.fillRect(dzStartX, height / 2 - 5, minX - dzStartX, 10, '#ff5555');
      }
      // Zone succès (vert)
      this.contents.fillRect(minX, height / 2 - 5, maxX - minX, 10, '#66ff66');
      // Zone deadzone après succès (rouge)
      if (maxX < endX) {
        this.contents.fillRect(maxX, height / 2 - 5, endX - maxX, 10, '#ff5555');
      }
      // Barre de progression (bleu)
      this.contents.fillRect(0, height / 2 - 5, barWidth, 10, '#00aaff');
    }
  }

  const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
  Scene_Map.prototype.createAllWindows = function() {
    _Scene_Map_createAllWindows.call(this);
    this._qteBar = null;
  };

  window.startQTE = function(duration, minSuccess, maxSuccess, deadzoneStart, variableId, evtName) {
    const scene = SceneManager._scene;
    const evnt = $gameMap.events().find(ev => ev.event().name === evtName);
    const x = evnt ? evnt.screenX() - 80 : 200;
    const y = evnt ? evnt.screenY() - 60 : 200;
    scene._qteBar = new Window_QTEBar(x, y, 160, 64);
    scene._qteBar.openness = 0;
    scene.addWindow(scene._qteBar);
    scene._qteBar.start(duration, minSuccess, maxSuccess, deadzoneStart, variableId, evtName);
  };

  const _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function() {
    _Scene_Map_update.call(this);
    if (this._qteBar && this._qteBar._activeQTE && Input.isTriggered('ok')) {
      this._qteBar.processSuccessAttempt();
      console.log("QTE Bar: Success attempt processed.");
    }
  };
})();