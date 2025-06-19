/*:
 * @plugindesc Affiche un panneau directionnel sous forme de fenêtre de type dialogue semi-transparente et bloque le mouvement jusqu'à validation. [Hunter x Hunter Game]
 * @author GPT
 *
 * @help
 * Utiliser la commande plugin suivante :
 *   ShowDirectionPanel
 *
 * Cela affiche l'image "PanneauIleBaleine" centrée dans une fenêtre occupant 80% de l'écran.
 * Le joueur ne peut pas bouger pendant l'affichage.
 * Appuyer sur une touche d'action ou cliquer ferme le panneau et libère le joueur.
 */

(function() {
  var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'ShowDirectionPanel') {
      SceneManager._scene.showDirectionPanel();
    }
  };

  Scene_Map.prototype.showDirectionPanel = function() {
    if (this._directionPanelWindow) return;
    $gamePlayer._directionPanelActive = true;

    const width = Graphics.boxWidth * 0.8;
    const height = Graphics.boxHeight * 0.8;
    const x = (Graphics.boxWidth - width) / 2;
    const y = (Graphics.boxHeight - height) / 2;

    const panelWindow = new Window_Base(x, y, width, height);
    panelWindow.opacity = 192;
    panelWindow.contentsOpacity = 255;
    panelWindow.setBackgroundType(2);

    const sprite = new Sprite(ImageManager.loadPicture('PanneauIleBaleine'));
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;

    sprite.bitmap.addLoadListener(function() {
      const maxW = width - panelWindow.padding * 2;
      const maxH = height - panelWindow.padding * 2;
      const scaleX = maxW / sprite.bitmap.width;
      const scaleY = maxH / sprite.bitmap.height;
      const scale = Math.min(scaleX, scaleY, 1);

      sprite.scale.x = scale;
      sprite.scale.y = scale;

      sprite.x = width / 2;
      sprite.y = height / 2;
    });

    panelWindow.addChild(sprite);
    this.addChild(panelWindow);
    this._directionPanelWindow = panelWindow;
  };

  const alias_updateScene = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function() {
    alias_updateScene.call(this);

    if (this._directionPanelWindow && ($gamePlayer._directionPanelActive)) {
      if (TouchInput.isTriggered() || Input.isTriggered('ok')) {
        this.removeChild(this._directionPanelWindow);
        this._directionPanelWindow = null;
        $gamePlayer._directionPanelActive = false;
      }
    }
  };

  const alias_canMove = Game_Player.prototype.canMove;
  Game_Player.prototype.canMove = function() {
    if (this._directionPanelActive) return false;
    return alias_canMove.call(this);
  };
})();
