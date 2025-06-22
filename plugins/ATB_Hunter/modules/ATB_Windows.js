Window_Base.prototype.fittingHeight = function(numLines) {
    return numLines * (this.lineHeight()+2) + this.standardPadding() * 2;
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
    this.displayAffectedStatus(subject);
};