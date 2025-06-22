//-----------------------------------------------------------------------------
// Enemy Bars
// Adds HP and ATB gauges above enemy sprites.
//-----------------------------------------------------------------------------

var _ATB_SpriteEnemy_initMembers = Sprite_Enemy.prototype.initMembers;
Sprite_Enemy.prototype.initMembers = function() {
    _ATB_SpriteEnemy_initMembers.call(this);
    this.createBattleBars();
};

Sprite_Enemy.prototype.createBattleBars = function() {
    this._hpGaugeBitmap = new Bitmap(80, 6);
    this._hpGaugeSprite = new Sprite(this._hpGaugeBitmap);
    this._hpGaugeSprite.anchor.x = 0.5;
    this._hpGaugeSprite.anchor.y = 1;
    this.addChild(this._hpGaugeSprite);

    this._atbGaugeBitmap = new Bitmap(80, 6);
    this._atbGaugeSprite = new Sprite(this._atbGaugeBitmap);
    this._atbGaugeSprite.anchor.x = 0.5;
    this._atbGaugeSprite.anchor.y = 1;
    this.addChild(this._atbGaugeSprite);
};

var _ATB_SpriteEnemy_update = Sprite_Enemy.prototype.update;
Sprite_Enemy.prototype.update = function() {
    _ATB_SpriteEnemy_update.call(this);
    if (this._enemy) {
        if($gameParty.aliveMembers().filter(member => member.isGyoActive()).length > 0) {
            this.updateBattleBars();
        }
    }
};

Sprite_Enemy.prototype.updateBattleBars = function() {
    var baseWindow = Sprite_Enemy._baseWindow || (Sprite_Enemy._baseWindow = new Window_Base(0,0,0,0));
    var h = this.bitmap ? this.bitmap.height : 0;
    var gaugeHeight = this._hpGaugeBitmap.height;
    this._atbGaugeSprite.y = -h - 4;
    this._hpGaugeSprite.y = this._atbGaugeSprite.y + gaugeHeight + 2;
    this.drawGaugeOnBitmap(this._hpGaugeBitmap, this._enemy.hpRate(),
        baseWindow.hpGaugeColor1(), baseWindow.hpGaugeColor2());
    var atbRate = this._enemy.atb ? this._enemy.atb() / 100 : 0;
    this.drawGaugeOnBitmap(this._atbGaugeBitmap, atbRate,
        baseWindow.textColor(6), baseWindow.textColor(0));
};

Sprite_Enemy.prototype.drawGaugeOnBitmap = function(bitmap, rate, color1, color2) {
    var baseWindow = Sprite_Enemy._baseWindow || (Sprite_Enemy._baseWindow = new Window_Base(0,0,0,0));
    var w = bitmap.width;
    var h = bitmap.height;
    var fillW = Math.floor(w * rate);
    bitmap.clear();
    bitmap.fillRect(0, 0, w, h, baseWindow.gaugeBackColor());
    bitmap.gradientFillRect(0, 0, fillW, h, color1, color2);
};
