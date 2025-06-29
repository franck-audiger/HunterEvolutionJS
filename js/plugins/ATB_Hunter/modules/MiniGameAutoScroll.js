const miniGameAutoScrollConfigs = {
  1: {} // ID des maps où le plugin est actif
};

let activeWaves = [];

const rockList = [
  // Y de 53 à 43 (tes originaux)
  {x: 13, y: 53},
  {x: 9, y: 48},
  {x: 6, y: 47},
  {x: 17, y: 46},
  {x: 18, y: 44},
  {x: 12, y: 43},
  {x: 13, y: 43},
  {x: 6, y: 43},

  // Y = 42 à 40
  {x: 8, y: 42},
  {x: 2, y: 42},
  {x: 15, y: 41},

  // Y = 39 à 37
  {x: 10, y: 39},
  {x: 6, y: 38},
  {x: 17, y: 38},

  // Y = 36 à 34
  {x: 12, y: 36},
  {x: 9, y: 35},
  {x: 3, y: 35},

  // Y = 33 à 31
  {x: 13, y: 33},
  {x: 6, y: 32},
  {x: 15, y: 31},

  // Y = 30 à 28
  {x: 18, y: 30}, 
  {x: 11, y: 30},
  {x: 4, y: 29}, 
  {x: 8, y: 28},

  // Y = 27 à 25
  {x: 14, y: 27},
  {x: 1, y: 27},
  {x: 6, y: 26},
  {x: 17, y: 25},
  {x: 2, y: 25},

  // Y = 24 à 22
  {x: 9, y: 24},
  {x: 12, y: 23},
  {x: 5, y: 22},

  // Y = 21 à 19
  {x: 7, y: 21},
  {x: 13, y: 20},

  // Y = 18 à 16
  {x: 10, y: 18},
  {x: 6, y: 17},
  {x: 4, y: 17},
  {x: 15, y: 16},

  // Y = 15 à 13
  {x: 18, y: 14},
  {x: 11, y: 14},
  {x: 9, y: 13},
  {x: 6, y: 13},

  // Y = 12 à 10
  {x: 13, y: 12},
  {x: 6, y: 11},
  {x: 17, y: 10},
  {x: 3, y: 10},

  // Y = 9 à 7
  {x: 12, y: 9},
  {x: 8, y: 8},
  {x: 1, y: 8},
  {x: 2, y: 7},

  // Y = 6 à 4
  {x: 14, y: 6},
  {x: 6, y: 5},

  //Edges
  
  {x: 0, y: 0},
  {x: 19, y: 0},
  {x: 0, y: 1},
  {x: 19, y: 1},
  {x: 0, y: 2},
  {x: 19, y: 2},
  {x: 0, y: 3},
  {x: 19, y: 3},
  {x: 0, y: 4},
  {x: 19, y: 4},
  {x: 0, y: 5},
  {x: 19, y: 5},
  {x: 0, y: 6},
  {x: 19, y: 6},
  {x: 0, y: 7},
  {x: 19, y: 7},
  {x: 0, y: 8},
  {x: 19, y: 8},
  {x: 0, y: 9},
  {x: 19, y: 9},
  {x: 0, y: 10},
  {x: 19, y: 10},
  {x: 0, y: 11},
  {x: 19, y: 11},
  {x: 0, y: 12},
  {x: 19, y: 12},
  {x: 0, y: 13},
  {x: 19, y: 13},
  {x: 0, y: 14},
  {x: 19, y: 14},
  {x: 0, y: 15},
  {x: 19, y: 15},
  {x: 0, y: 16},
  {x: 19, y: 16},
  {x: 0, y: 17},
  {x: 19, y: 17},
  {x: 0, y: 18},
  {x: 19, y: 18},
  {x: 0, y: 19},
  {x: 19, y: 19},
  {x: 0, y: 20},
  {x: 19, y: 20},
  {x: 0, y: 21},
  {x: 19, y: 21},
  {x: 0, y: 22},
  {x: 19, y: 22},
  {x: 0, y: 23},
  {x: 19, y: 23},
  {x: 0, y: 24},
  {x: 19, y: 24},
  {x: 0, y: 25},
  {x: 19, y: 25},
  {x: 0, y: 26},
  {x: 19, y: 26},
  {x: 0, y: 27},
  {x: 19, y: 27},
  {x: 0, y: 28},
  {x: 19, y: 28},
  {x: 0, y: 29},
  {x: 19, y: 29},
  {x: 0, y: 30},
  {x: 19, y: 30},
  {x: 0, y: 31},
  {x: 19, y: 31},
  {x: 0, y: 32},
  {x: 19, y: 32},
  {x: 0, y: 33},
  {x: 19, y: 33},
  {x: 0, y: 34},
  {x: 19, y: 34},
  {x: 0, y: 35},
  {x: 19, y: 35},
  {x: 0, y: 36},
  {x: 19, y: 36},
  {x: 0, y: 37},
  {x: 19, y: 37},
  {x: 0, y: 38},
  {x: 19, y: 38},
  {x: 0, y: 39},
  {x: 19, y: 39},
  {x: 0, y: 40},
  {x: 19, y: 40},
  {x: 0, y: 41},
  {x: 19, y: 41},
  {x: 0, y: 42},
  {x: 19, y: 42},
  {x: 0, y: 43},
  {x: 19, y: 43},
  {x: 0, y: 44},
  {x: 19, y: 44},
  {x: 0, y: 45},
  {x: 19, y: 45},
  {x: 0, y: 46},
  {x: 19, y: 46},
  {x: 0, y: 47},
  {x: 19, y: 47},
  {x: 0, y: 48},
  {x: 19, y: 48},
  {x: 0, y: 49},
  {x: 19, y: 49},
  {x: 0, y: 50},
  {x: 19, y: 50},
  {x: 0, y: 51},
  {x: 19, y: 51},
  {x: 0, y: 52},
  {x: 19, y: 52},
  {x: 0, y: 53},
  {x: 19, y: 53}
];

let messagesConfig = {
  80 : {
    actorName : "Capitaine", 
    actorIndex : 0, 
    text : "langText[Mer.Evnt.dialogue1]", 
    duration : 300
  },
  75 : {
    actorName : "Capitaine", 
    actorIndex : 6, 
    text : "langText[Mer.Evnt.dialogue2]", 
    duration : 300
  },
  70 : {
    actorName : "Capitaine", 
    actorIndex : 5, 
    text : "langText[Mer.Evnt.dialogue3]", 
    duration : 300
  },
  62 : {
    actorName : "Capitaine", 
    actorIndex : 2, 
    text : "langText[Mer.Evnt.dialogue4]", 
    duration : 300
  },
  53 : {
    actorName : "Capitaine", 
    actorIndex : 2, 
    text : "langText[Mer.Evnt.dialogue5]", 
    duration : 300
  },
  43 : {
    actorName : "Capitaine", 
    actorIndex : 4, 
    text : "langText[Mer.Evnt.dialogue6]", 
    duration : 300
  },
  32 : {
    actorName : "Capitaine", 
    actorIndex : 0, 
    text : "langText[Mer.Evnt.dialogue7]", 
    duration : 300
  },
  22 : {
    actorName : "Capitaine", 
    actorIndex : 2, 
    text : "langText[Mer.Evnt.dialogue8]", 
    duration : 300
  },
  15 : {
    actorName : "Capitaine", 
    actorIndex : 3, 
    text : "langText[Mer.Evnt.dialogue9]", 
    duration : 300
  },
  10 : {
    actorName : "Capitaine", 
    actorIndex : 0, 
    text : "langText[Mer.Evnt.dialogue10]", 
    duration : 300
  }
}
const MESSAGE_HEIGHT = 168;
function Sprite_CustomMessage() {
  Sprite.call(this);
  this._duration = 0;
  this._text = '';
  this._faceName = '';
  this._faceIndex = 0;

  this._container = new Sprite();
  this._container.bitmap = new Bitmap(Graphics.width, MESSAGE_HEIGHT);
  this.addChild(this._container);

  this.visible = false;
}

Sprite_CustomMessage.prototype = Object.create(Sprite.prototype);
Sprite_CustomMessage.prototype.constructor = Sprite_CustomMessage;

Sprite_CustomMessage.prototype.setMessage = function(faceName, faceIndex, text, duration) {
  this._faceName = faceName;
  this._faceIndex = faceIndex;
  this._text = text;
  this._duration = duration;
  this.visible = true;
  this.refresh();
};

Sprite_CustomMessage.prototype.refresh = function() {
  const bmp = this._container.bitmap;
  bmp.clear();

  const padding = 12;
  const faceWidth = 144;
  const faceHeight = 144;
  const height = bmp.height;

  // Fond
  bmp.fillRect(0, 0, Graphics.width, height, 'rgba(0, 0, 0, 180)');

  // Dessin de la face
  const faceBmp = ImageManager.loadFace(this._faceName);
  const pw = Window_Base._faceWidth;
  const ph = Window_Base._faceHeight;
  const sx = (this._faceIndex % 4) * pw;
  const sy = Math.floor(this._faceIndex / 4) * ph;
  const faceY = (height - ph) / 2;

  faceBmp.addLoadListener(() => {
    bmp.blt(faceBmp, sx, sy, pw, ph, padding, faceY);
  });

  // Texte multi-ligne
  const textX = faceWidth + padding * 2;
  const textWidth = Graphics.width - textX - padding;
  const lineHeight = 28;
  bmp.fontSize = 20;
  bmp.textColor = '#FFFFFF';

  // Divise les lignes
  const lines = this._text.split(/\r?\n/);
  const totalHeight = lines.length * lineHeight;
  const startY = Math.max(padding, (height - totalHeight) / 2);

  for (let i = 0; i < lines.length; i++) {
    const y = startY + i * lineHeight;
    bmp.drawText(lines[i], textX, y, textWidth, lineHeight, 'left');
  }
};

Sprite_CustomMessage.prototype.update = function() {
  Sprite.prototype.update.call(this);
  if (this.visible && this._duration > 0) {
    this._duration--;
    if (this._duration <= 0) {
      this.visible = false;
      this._container.bitmap.clear();
    }
  }
};

let messagesShown = {}; 

let timerGameOver = -1;

// === GESTION DES MESSAGES CUSTOM ===
let customMessageTimer = 0;
let customMessageActive = false;


function showCustomAutoMessage(scene, faceName, faceIndex, text, durationFrames = 240) {
  const spr = scene._customMessageSprite;
  if (!spr) return;


  text = text.replace(/langText\[(.+?)\]/gi, (_, key) => {
    return TextManagerEx.t(key);
  });
  console.log(`📝 Sprite Msg : "${text}" avec ${faceName} (index ${faceIndex})`);
  spr.setMessage(faceName, faceIndex, text, durationFrames);
}

function checkMessagesToShow(playerY) {
  if(messagesConfig[playerY] && !messagesShown[playerY]) {
    const config = messagesConfig[playerY];
    if (!messagesShown[playerY]) {
      console.log(config.actorName);
      showCustomAutoMessage(SceneManager._scene, config.actorName, config.actorIndex, config.text, config.duration);
      messagesShown[playerY] = true;
    }
  }
}

function isControlDisabled() {
  if(!$gameMap){
    return false;
  }
  return miniGameAutoScrollConfigs[$gameMap.mapId()];
}

// === Désactivation des contrôles ===
const _Game_Player_canMove = Game_Player.prototype.canMove;
Game_Player.prototype.canMove = function () {
  if (isControlDisabled()) return false;
  return _Game_Player_canMove.call(this);
};

const _Game_Temp_setDestination = Game_Temp.prototype.setDestination;
Game_Temp.prototype.setDestination = function(x, y) {
  if (isControlDisabled()) return;
  _Game_Temp_setDestination.call(this, x, y);
};

// === Initialisation du joueur ===
const _Game_Player_initialize = Game_Player.prototype.initialize;
Game_Player.prototype.initialize = function() {
  _Game_Player_initialize.call(this);
  this._directionBar = 0;
  this._directionOffsetX = 0;
  this._defaultX = this._x;
  this._lastOffsetTileX = this._x;
};

// === Barre directionnelle ===
Game_Player.prototype.updateDirectionBar = function() {
  if (this._directionBar === undefined) this._directionBar = 0;
  if (this._directionOffsetX === undefined) this._directionOffsetX = 0;
  if (this._defaultX === 0) this._defaultX = this._x;
  if (this._lastOffsetTileX === undefined) this._lastOffsetTileX = this._x;

  const rightHeld = Input.isPressed('right');
  const leftHeld = Input.isPressed('left');

  if (rightHeld && !leftHeld) {
    this._directionBar = Math.min(this._directionBar + 2, 150);
  } else if (leftHeld && !rightHeld) {
    this._directionBar = Math.max(this._directionBar - 2, -150);
  } else {
    if (this._directionBar > 0) this._directionBar -= 1;
    else if (this._directionBar < 0) this._directionBar += 1;
  }

  this._directionOffsetX += this._directionBar / 150;

  const tileSize = $gameMap.tileWidth();
  const threshold = tileSize / 2;

  while (this._directionOffsetX >= threshold) {
    this._x += 1;
    this._realX = this._x;
    this._directionOffsetX -= tileSize;
  }

  while (this._directionOffsetX <= -threshold) {
    this._x -= 1;
    this._realX = this._x;
    this._directionOffsetX += tileSize;
  }
};

// === Décalage visuel horizontal ===
const _Game_CharacterBase_screenX = Game_CharacterBase.prototype.screenX;
Game_CharacterBase.prototype.screenX = function() {
  const base = _Game_CharacterBase_screenX.call(this);
  if (this === $gamePlayer && isControlDisabled()) {
    return base + $gamePlayer._directionOffsetX;
  }
  return base;
};

// === Vie du mini-jeu ===
let miniGameLives = 3;
let miniGameHitCooldown = 0;


// === Affichage des cœurs ===
const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
Scene_Map.prototype.createAllWindows = function() {
  _Scene_Map_createAllWindows.call(this);
  if (isControlDisabled()) {
    this.createMiniGameHUD();
  }


};

Scene_Map.prototype.createMiniGameHUD = function() {
  this._miniGameHearts = new Sprite();
  this._miniGameHearts.bitmap = new Bitmap(150, 48);
  this._miniGameHearts.x = 0;
  this._miniGameHearts.y = 0;
  this.addChild(this._miniGameHearts);
  this.refreshMiniGameHUD();
};

Scene_Map.prototype.refreshMiniGameHUD = function() {
  if (!this._miniGameHearts) return;
  const bmp = this._miniGameHearts.bitmap;
  bmp.clear();

  for (let i = 0; i < 3; i++) {
    const x = i * 48;
    const iconIndex = i < miniGameLives ? 323 : 324;
    const pw = 32, ph = 32;
    const sx = (iconIndex % 16) * pw;
    const sy = Math.floor(iconIndex / 16) * ph;
    const iconSet = ImageManager.loadSystem('IconSet');
    iconSet.addLoadListener(() => {
      bmp.blt(iconSet, sx, sy, pw, ph, x, 0);
    });
  }
};

Game_Player.prototype.setOpacity = function(value) {
  this._opacity = value;
};
// === Mise à jour du flash d'orage ===
// === Crée tous les éléments visuels (message) ===
const _Scene_Map_createDisplayObjects_Combined = Scene_Map.prototype.createDisplayObjects;
Scene_Map.prototype.createDisplayObjects = function() {
  _Scene_Map_createDisplayObjects_Combined.call(this);

  this._customMessageSprite = new Sprite_CustomMessage();
  this._customMessageSprite.y = Graphics.height - MESSAGE_HEIGHT;
  this.addChild(this._customMessageSprite);
};


// === Mise à jour à chaque frame ===
const _Game_Player_update_MiniGame = Game_Player.prototype.update;
Game_Player.prototype.update = function(sceneActive) {
  _Game_Player_update_MiniGame.call(this, sceneActive);

  if (isControlDisabled()) {
    this.updateDirectionBar();

    activeWaves = activeWaves.filter(event => {
      const eventY = event._y;
      const isVisible = eventY <= $gamePlayer._y + 10;

      if (!isVisible) {
        const sprite = SceneManager._scene._spriteset._characterSprites.find(s => s._character === event);
        if (sprite) {
          SceneManager._scene._spriteset._tilemap.removeChild(sprite);
        }
        delete $gameMap._events[event._eventId];
        return false;
      }

      return true;
    });

    spawnRandomWaveEvent(this._x, this._y);
    if (miniGameHitCooldown > 0) {
      miniGameHitCooldown--;
    }
    if (miniGameHitCooldown > 0) {
      this.setOpacity((Graphics.frameCount % 8 < 4) ? 100 : 255);
    } else {
      this.setOpacity(255);
    }

    const hittingRock = rockList.some(rock => rock.x === this._x && rock.y === this._y);
    if (hittingRock && miniGameHitCooldown === 0 && miniGameLives > 0) {
      miniGameLives--;
      miniGameHitCooldown = 120;
      SoundManager.playActorDamage();
      const scene = SceneManager._scene;
      if (scene.refreshMiniGameHUD) scene.refreshMiniGameHUD();
      console.log("💥 Touché un rocher ! Vies restantes : " + miniGameLives);
    }

    const tileW = $gameMap.tileWidth();
    const tileH = $gameMap.tileHeight();
    const playerOffsetY = 0.3;

    const playerRealX = $gamePlayer._x + $gamePlayer._directionOffsetX / tileW;
    const playerPixelX = playerRealX * tileW + tileW / 2;
    const playerPixelY = ($gamePlayer._realY + playerOffsetY) * tileH + tileH / 2;

    const hitboxHalfWidth = tileW * 0.4;
    const hitboxHalfHeight = tileH * 0.3;

    const hittingWave = activeWaves.some(wave => {
      const wavePixelX = wave._x * tileW + tileW / 2;
      const wavePixelY = wave._realY * tileH + tileH / 2;

      const dx = Math.abs(wavePixelX - playerPixelX);
      const dy = Math.abs(wavePixelY - playerPixelY);
      return dx < hitboxHalfWidth && dy < hitboxHalfHeight;
    });

    if (hittingWave && miniGameHitCooldown === 0 && miniGameLives > 0) {
      miniGameLives--;
      miniGameHitCooldown = 120;
      AudioManager.playSe({name:'water-splash-Fail', pan:0, pitch:100, volume:90});
      const scene = SceneManager._scene;
      if (scene.refreshMiniGameHUD) scene.refreshMiniGameHUD();
      console.log("🌊 Touché par une vague ! Vies restantes : " + miniGameLives);
    }

    if(timerGameOver === 0){
      timerGameOver = -1
      // Transition propre
      SceneManager._scene.fadeOutAll();

      // Stop audio
      AudioManager.stopBgm();
      AudioManager.stopBgs();
      AudioManager.stopMe();
      AudioManager.stopSe();

      // Réinitialise la partie comme un vrai "Game Over"
      DataManager.setupNewGame();
      miniGameLives = 3;
      miniGameHitCooldown = 0;
      SceneManager.goto(Scene_Gameover);
      
    } else if(timerGameOver > 0){
      console.log("timerGameOver decrease ");
      timerGameOver -= 1;
    }

    if (miniGameLives === 0 && timerGameOver < 0) {
      timerGameOver = 60;
    }

    const tileWidth = $gameMap.tileWidth();
    const screenWidthInTiles = Graphics.width / tileWidth;

    const realPlayerX = this._x + (this._directionOffsetX / tileWidth);
    const targetX = realPlayerX - screenWidthInTiles / 2;

    const maxX = $gameMap.width() - screenWidthInTiles;
    const clampedTargetX = Math.max(0, Math.min(targetX, maxX));

    const cameraSpeed = 0.2;
    lastDisplayX = $gameMap._displayX;
    $gameMap._displayX += (clampedTargetX - $gameMap._displayX) * cameraSpeed;

    checkMessagesToShow(this._y);
  }

  Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
  };
};


function spawnRandomWaveEvent(playerX, playerY) {
  if(playerY > 60) return;

  const mapId = $gameMap.mapId();
  const eventNames = ["Wave1", "Wave2", "Wave3", "Wave4"];
  const chosenName = eventNames[Math.floor(Math.random() * eventNames.length)];

  const modelEvent = $dataMap.events.find(e => e && e.name === chosenName);
  if (!modelEvent) {
    console.error("Modèle d'événement non trouvé :", chosenName);
    return;
  }

  const xMin = Math.max(1, playerX - 5);
  const xMax = Math.min(18, playerX + 5);
  const possibleX = [];

  for (let x = xMin; x <= xMax; x++) {
    const blocked = activeWaves.some(e => e._x === x && e._y <= playerY + 5);
    if (!blocked) possibleX.push(x);
  }

  if (possibleX.length === 0) return;

  const finalX = possibleX[Math.floor(Math.random() * possibleX.length)];
  const finalY = playerY - 10;

  const newEvent = JSON.parse(JSON.stringify(modelEvent));
  const newEventId = $dataMap.events.length;

  newEvent.x = finalX;
  newEvent.y = finalY;

  $dataMap.events[newEventId] = newEvent;
  const gameEvent = new Game_Event(mapId, newEventId);
  gameEvent._x = finalX;
  gameEvent._y = finalY;
  $gameMap._events[newEventId] = gameEvent;

  activeWaves.push(gameEvent);

  const scene = SceneManager._scene;
  if (scene && scene._spriteset && scene._spriteset._characterSprites) {
    const sprite = new Sprite_Character(gameEvent);
    scene._spriteset._tilemap.addChild(sprite);
    scene._spriteset._characterSprites.push(sprite);
  }

  console.log(`🌊 Vague générée : "${chosenName}" en (${finalX}, ${finalY})`);
}