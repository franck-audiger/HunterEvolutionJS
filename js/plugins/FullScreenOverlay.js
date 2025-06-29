/*:
 * @plugindesc Affiche une image en plein écran (sans déformation), sous les messages. Utilise showFullscreenOverlay('NomImage') / hideFullscreenOverlay().
 * @author ChatGPT
 */

(function() {
  let _fullscreenOverlaySprite = null;

  // Fonction globale : affiche une image plein écran sans déformation
  window.showFullscreenOverlay = function(imageName) {
    const scene = SceneManager._scene;
    if (!scene || !scene._spriteset) return;

    // Supprime précédente
    if (_fullscreenOverlaySprite) {
      scene._spriteset.removeChild(_fullscreenOverlaySprite);
      _fullscreenOverlaySprite = null;
    }

    const bitmap = ImageManager.loadPicture(imageName);
    const sprite = new Sprite(bitmap);

    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
    sprite.x = Graphics.width / 2;
    sprite.y = Graphics.height / 2;
    sprite.z = 255;

    // Redimensionner en préservant le ratio
    sprite.update = function() {
      if (!this.bitmap || this.bitmap.width === 0 || this.bitmap.height === 0) return;

      const sw = Graphics.width;
      const sh = Graphics.height;
      const bw = this.bitmap.width;
      const bh = this.bitmap.height;

      const scale = Math.min(sw / bw, sh / bh);
      this.scale.x = this.scale.y = scale;

      this.x = Graphics.width / 2;
      this.y = Graphics.height / 2;
    };

    _fullscreenOverlaySprite = sprite;
    scene._spriteset.addChild(sprite);
  };

  // Fonction globale : retire l’image de superposition
  window.hideFullscreenOverlay = function() {
    const scene = SceneManager._scene;
    if (!scene || !_fullscreenOverlaySprite) return;

    scene._spriteset.removeChild(_fullscreenOverlaySprite);
    _fullscreenOverlaySprite = null;
  };

  // Mise à jour pour suivre les dimensions écran
  const _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function() {
    _Scene_Map_update.call(this);
    if (_fullscreenOverlaySprite && _fullscreenOverlaySprite.update) {
      _fullscreenOverlaySprite.update();
    }
  };

  const _Scene_Battle_update = Scene_Battle.prototype.update;
  Scene_Battle.prototype.update = function() {
    _Scene_Battle_update.call(this);
    if (_fullscreenOverlaySprite && _fullscreenOverlaySprite.update) {
      _fullscreenOverlaySprite.update();
    }
  };

})();
