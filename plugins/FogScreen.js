(function() {

  const fogConfigs = {
    13: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 160, restrictedVision: true, visionRadius: 150 },
    18: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 160, restrictedVision: true, visionRadius: 110 },
    19: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 160, restrictedVision: true, visionRadius: 80 },
  };


  function createFogOverlay() {
    const config = fogConfigs[$gameMap.mapId()];
    if (!config) return;

    const bitmap = ImageManager.loadPicture(config.name);
    this._fogOverlay = new TilingSprite(bitmap);
    this._fogOverlay.move(0, 0, Graphics.width, Graphics.height);
    this._fogOverlay.opacity = config.opacity || 128;
    this._fogOverlay.fogSpeedX = config.speedX || 0;
    this._fogOverlay.fogSpeedY = config.speedY || 0;

    this._spriteset.addChild(this._fogOverlay);
  }

  function createVisionOverlay() {
    const config = fogConfigs[$gameMap.mapId()];
    if (!config || !config.restrictedVision) return;

    const width = Graphics.width;
    const height = Graphics.height;

    this._visionBitmap = new Bitmap(width, height);
    this._visionOverlay = new Sprite(this._visionBitmap);
    this._spriteset.addChild(this._visionOverlay);
  }

  function updateFogOverlay() {
    if (this._fogOverlay) {
      this._fogOverlay.origin.x += this._fogOverlay.fogSpeedX;
      this._fogOverlay.origin.y += this._fogOverlay.fogSpeedY;
    }
  }

  function updateVisionOverlay() {
    const config = fogConfigs[$gameMap.mapId()];
    if (!config || !config.restrictedVision || !this._visionOverlay) return;

    const bitmap = this._visionBitmap;
    bitmap.clear();

    let px, py;
    if (this instanceof Scene_Battle) {
      px = Graphics.width / 2;
      py = Graphics.height / 2;
    } else {
      px = $gamePlayer.screenX();
      py = $gamePlayer.screenY() - 16;
    }

    const radius = config.visionRadius || 30;
    const gradientRadius = radius + 90;

    const ctx = bitmap._context;
    const grad = ctx.createRadialGradient(px, py, radius, px, py, gradientRadius);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.98)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, bitmap.width, bitmap.height);
    bitmap._setDirty();
  }

  // === MAP SETUP ===
  const _Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
  Scene_Map.prototype.createDisplayObjects = function() {
    _Scene_Map_createDisplayObjects.call(this);
    this.createFogOverlay();
    this.createVisionOverlay();
  };

  const _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function() {
    _Scene_Map_update.call(this);
    this.updateFogOverlay();
    this.updateVisionOverlay();
  };

  // === BATTLE SETUP ===
  const _Scene_Battle_createDisplayObjects = Scene_Battle.prototype.createDisplayObjects;
  Scene_Battle.prototype.createDisplayObjects = function() {
    _Scene_Battle_createDisplayObjects.call(this);
    this.createFogOverlay();
    this.createVisionOverlay();
  };

  const _Scene_Battle_update = Scene_Battle.prototype.update;
  Scene_Battle.prototype.update = function() {
    _Scene_Battle_update.call(this);
    this.updateFogOverlay();
    this.updateVisionOverlay();
  };

  Scene_Map.prototype.createFogOverlay = createFogOverlay;
  Scene_Map.prototype.createVisionOverlay = createVisionOverlay;
  Scene_Map.prototype.updateFogOverlay = updateFogOverlay;
  Scene_Map.prototype.updateVisionOverlay = updateVisionOverlay;

  Scene_Battle.prototype.createFogOverlay = createFogOverlay;
  Scene_Battle.prototype.createVisionOverlay = createVisionOverlay;
  Scene_Battle.prototype.updateFogOverlay = updateFogOverlay;
  Scene_Battle.prototype.updateVisionOverlay = updateVisionOverlay;

})();
