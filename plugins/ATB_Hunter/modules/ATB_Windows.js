Window_Base.prototype.fittingHeight = function(numLines) {
    return numLines * (this.lineHeight()+2) + this.standardPadding() * 2;
};

const lineIncreaseForIcons = 0;

// Increase the height of each battle status row so icons fit correctly.
var _BS_lineHeight = Window_Base.prototype.lineHeight;
Window_BattleStatus.prototype.lineHeight = function() {
    return _BS_lineHeight.call(this) + lineIncreaseForIcons;
};

// Increase the height of each battle status row so icons fit correctly.
var _PC_lineHeight = Window_PartyCommand.prototype.lineHeight;
Window_PartyCommand.prototype.lineHeight = function() {
    return _PC_lineHeight.call(this) + lineIncreaseForIcons;
};

// Increase the height of each battle status row so icons fit correctly.
var _AC_lineHeight = Window_ActorCommand.prototype.lineHeight;
Window_ActorCommand.prototype.lineHeight = function() {
    return _PC_lineHeight.call(this) + lineIncreaseForIcons;
};


Window_BattleStatus.prototype.initialize = function() {
    var width = this.windowWidth();
    var height = this.windowHeight();
    var x = 0;
    var y = 0;
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this.refresh();
    this.openness = 0;
};

Window_BattleStatus.prototype.windowWidth = function() {
    return Graphics.boxWidth;
};


var _ATB_drawBasicArea = Window_BattleStatus.prototype.drawBasicArea;
Window_BattleStatus.prototype.drawBasicArea = function(rect, actor) {
    _ATB_drawBasicArea.call(this, rect, actor);
    this.drawActorGuardCount(actor, rect.x, rect.y);
};

Window_BattleStatus.prototype.drawActorGuardCount = function(actor, x, y) {
    var guard = actor.guardRatio ? actor.guardRatio() : 0;
    if (guard > 0) {
        this.contents.fontSize -= 8;
        var nameWidth = this.textWidth(actor.name());
        var baseX = x + nameWidth + 16;
        var baseY = (y - this.lineHeight() / 4)+10;
        var iconIndex = 322; // Icon at grid position (0,11)
        this.drawIcon(iconIndex, baseX, baseY);
        const prevFontSize = this.contents.fontSize;
        this.contents.fontSize = 16;
        this.drawText(guard, baseX+12, baseY-2, 48);
        this.contents.fontSize = prevFontSize;
        this.resetFontSettings();
    }
};


Window_BattleStatus.prototype.drawAtbGauge = function(actor, x, y, width) {
    var atbRate = actor.atb() / 100;
    this.drawGauge(x, y+5, width, atbRate, this.textColor(6), this.textColor(0));
};



Window_BattleStatus.prototype.drawGaugeArea = function(rect, actor) {
    if ($dataSystem.optDisplayTp) {
        this.drawGaugeAreaWithTp(rect, actor);
    } else {
        this.drawGaugeAreaWithoutTp(rect, actor);
    }
    var gaugeX = rect.x + 0;
    var gaugeY = rect.y + rect.height - this.lineHeight();
    var gaugeWidth = rect.width;

    this.drawAtbGauge(actor, gaugeX, gaugeY, gaugeWidth);
};

Window_BattleStatus.prototype.drawAtbGauge = function(actor, x, y, width) {
    var atbRate = actor.atb() / 100;
    this.drawGauge(x, y+5, width, atbRate, this.textColor(6), this.textColor(0));
};



Window_BattleLog.prototype.displayGyoUse = function(subject) {
    this.push('addText', "Gyo consomme du Nen pour " + subject.name() + "!");
};


Window_BattleLog.prototype.displayGuardFinished = function(subject) {
    this.push('addText', "La garde de  "+ subject.name() + " est fini !");
};

Window_BattleLog.prototype.displayGuardDecrease = function(subject) {
    this.push('addText', "La garde de  "+ subject.name() + " faibli !");
};

Window_BattleLog.prototype.displayGuardRemain = function(subject) {
    this.push('addText', subject.name() + " conserve sa garde !");
};


