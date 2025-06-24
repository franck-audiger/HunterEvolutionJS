Window_Base.prototype.fittingHeight = function(numLines) {
    return numLines * (this.lineHeight()+2) + this.standardPadding() * 2;
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
        var baseX = x + nameWidth + 4;
        var baseY = y - this.lineHeight() / 4;
        var iconIndex = 11; // Icon at grid position (0,11)
        this.drawIcon(iconIndex, baseX, baseY);
        this.drawText(guard, baseX + Window_Base._iconWidth, baseY, 48);
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


