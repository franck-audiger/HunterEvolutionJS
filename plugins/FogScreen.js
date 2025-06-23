(function() {

  const fogConfigs = {
    13: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 160, restrictedVision: true, visionRadius: 150 },
    18: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 160, restrictedVision: true, visionRadius: 110 },
    19: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 160, restrictedVision: true, visionRadius: 80 },
  };

  // === POUR LA MAP ===
  const _Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
  Scene_Map.prototype.createDisplayObjects = function() {
    _Scene_Map_createDisplayObjects.call(this);
    this.createFogOverlay();
    this.createVisionOverlay();
  };

  Scene_Map.prototype.createFogOverlay = function() {
    const config = fogConfigs[$gameMap.mapId()];
    if (!config) return;

    const bitmap = ImageManager.loadPicture(config.name);
    this._fogOverlay = new TilingSprite(bitmap);
    this._fogOverlay.move(0, 0, Graphics.width, Graphics.height);
    this._fogOverlay.opacity = config.opacity || 128;
    this._fogOverlay.fogSpeedX = config.speedX || 0;
    this._fogOverlay.fogSpeedY = config.speedY || 0;

    this._spriteset.addChild(this._fogOverlay);
  };

  Scene_Map.prototype.createVisionOverlay = function() {
    const config = fogConfigs[$gameMap.mapId()];
    if (!config || !config.restrictedVision) return;

    const width = Graphics.width;
    const height = Graphics.height;

    this._visionBitmap = new Bitmap(width, height);
    this._visionOverlay = new Sprite(this._visionBitmap);
    this._spriteset.addChild(this._visionOverlay);
  };

  const _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function() {
    _Scene_Map_update.call(this);
    this.updateFogOverlay();
    this.updateVisionOverlay();
  };

  Scene_Map.prototype.updateFogOverlay = function() {
    if (this._fogOverlay) {
      this._fogOverlay.origin.x += this._fogOverlay.fogSpeedX;
      this._fogOverlay.origin.y += this._fogOverlay.fogSpeedY;
    }
  };

  Scene_Map.prototype.updateVisionOverlay = function() {
    const config = fogConfigs[$gameMap.mapId()];
    if (!config || !config.restrictedVision || !this._visionOverlay) return;

    const bitmap = this._visionBitmap;
    bitmap.clear();

    const px = $gamePlayer.screenX();
    const py = $gamePlayer.screenY() - 16;
    const radius = config.visionRadius || 30;
    const gradientRadius = radius + 90;

    const ctx = bitmap._context;
    const grad = ctx.createRadialGradient(px, py, radius, px, py, gradientRadius);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.98)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, bitmap.width, bitmap.height);
    bitmap._setDirty();
  };


})();
