
const fogConfigs = {
  1: { name: "Rain1", speedX: 0.2, speedY: -0.8, opacity: 160, restrictedVision: false, restrictedVisionOpacity: 0.93, visionRadius: 150, lightningActivated: true },
  13: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 160, restrictedVision: true, restrictedVisionOpacity: 0.93, visionRadius: 150, lightningActivated: false },
  18: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 230, restrictedVision: true, restrictedVisionOpacity: 0.96, visionRadius: 110, lightningActivated: false },
  19: { name: "Fog1", speedX: 0.7, speedY: 0.5, opacity: 300, restrictedVision: true, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: false },
  24: { name: "Fog1", speedX: 1.2, speedY: -0.8, opacity: 90, restrictedVision: false, restrictedVisionOpacity: 0.98, visionRadius: 80, lightningActivated: true },
};

let lastDisplayX = 0; // Variable pour suivre la dernière position d'affichage
let counterDelayThunder = -1;

// === FLASH ORAGE — Variables globales ===
let lightningFlashFrame = Graphics.frameCount + Math.floor(Math.random() * 1200) + 600;
let flashDuration = 0;
let enable = true;

function scheduleNextFlash() {
  const interval = Math.floor(Math.random() * 1200) + 600; 
  lightningFlashFrame = Graphics.frameCount + interval;
}

function instantFlash() {
  lightningFlashFrame = Graphics.frameCount + 1; // Force le flash instantanément
}

window.instantFlash = instantFlash; // Rendre la fonction accessible globalement

window.switchWeather = function() {
   enable = !enable;
}

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
    this._fogOverlay.visible = enable;
    if (enable) {
      console.log("Updating fog overlay position : "+ (lastDisplayX-$gameMap._displayX));
      this._fogOverlay.origin.x += this._fogOverlay.fogSpeedX+(($gameMap._displayX-lastDisplayX)*50);
      this._fogOverlay.origin.y += this._fogOverlay.fogSpeedY;
    }
  }
  lastDisplayX = $gameMap._displayX;
}

function updateVisionOverlay() {
  const config = fogConfigs[$gameMap.mapId()];
  if (!this._visionOverlay) return;

  this._visionOverlay.visible = enable && config && config.restrictedVision;

  if (!enable || !config || !config.restrictedVision) return;

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
  grad.addColorStop(1, 'rgba(0, 0, 0, ' + config.restrictedVisionOpacity + ')');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, bitmap.width, bitmap.height);
  bitmap._setDirty();
}

// === MAP SETUP ===
const _Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
Scene_Map.prototype.createDisplayObjects = function() {
  _Scene_Map_createDisplayObjects.call(this);
  
  // --- FOG
  this.createFogOverlay();
  this.createVisionOverlay();

  // --- FLASH ORAGE (sous la vision, au-dessus du fog)
  this._lightningFlash = new Sprite(new Bitmap(Graphics.width, Graphics.height));
  this._lightningFlash.bitmap.fillAll('white');
  this._lightningFlash.opacity = 0;
  this._spriteset.addChild(this._lightningFlash); // entre fog et vision
};

Scene_Map.prototype.updateLightningFlash = function() {
  if (!enable) {
    if (this._lightningFlash) this._lightningFlash.opacity = 0;
    return;
  }
  if(!$gameMap){
    return;
  }
  if(!fogConfigs[$gameMap.mapId()]) return;
  if(fogConfigs[$gameMap.mapId()].lightningActivated){
    if(counterDelayThunder >= 0) 
      counterDelayThunder--;

    if(counterDelayThunder == 0){
      AudioManager.playSe({ name: 'Thunder9', volume: 90, pitch: 100, pan: 0 });
    }

    if (Graphics.frameCount >= lightningFlashFrame) {
      this._lightningFlash.opacity = 255;
      flashDuration = 10;
      counterDelayThunder = Math.floor(Math.random() * 120);
      scheduleNextFlash();
    }

    if (flashDuration > 0) {
      flashDuration--;
      if (flashDuration === 0) {
        this._lightningFlash.opacity = 0;
      }
    }
  }
}

// === Met à jour tous les effets visuels (fog + vision + flash) ===
const _Scene_Map_update_Combined = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
  _Scene_Map_update_Combined.call(this);
  if(enable) {
    this.updateFogOverlay();
    this.updateVisionOverlay();
    this.updateLightningFlash();
  }
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
  ///this.updateVisionOverlay();
};

Scene_Map.prototype.createFogOverlay = createFogOverlay;
Scene_Map.prototype.createVisionOverlay = createVisionOverlay;
Scene_Map.prototype.updateFogOverlay = updateFogOverlay;
Scene_Map.prototype.updateVisionOverlay = updateVisionOverlay;

Scene_Battle.prototype.createFogOverlay = createFogOverlay;
Scene_Battle.prototype.createVisionOverlay = createVisionOverlay;
Scene_Battle.prototype.updateFogOverlay = updateFogOverlay;
Scene_Battle.prototype.updateVisionOverlay = updateVisionOverlay;

