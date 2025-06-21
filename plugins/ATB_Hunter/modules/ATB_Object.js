// ==== ATB EXTENSIONS POUR OBJECT ====

Game_Battler.prototype.performActionStart = function(action) {};

Game_Battler.prototype.performActionEnd = function() {};

Game_Battler.prototype.isGuardWaiting = function() {
    return this.isGuard();
};

Game_Battler.prototype.onTurnEnd = function() {
    this.clearResult();
    this.regenerateAll();
    this.removeStatesAuto(2);
};

_Game_Battler_initMembers = Game_Battler.prototype.initMembers
Game_Battler.prototype.initMembers = function() {
    _Game_Battler_initMembers.call(this);
    this._guardCounter = 0;
};

Game_Battler.prototype.isGuard = function() {
    return this._guardCounter > 0;
}

Game_Battler.prototype.setGuard = function() {
    this._guardCounter = 3;
}

Game_Battler.prototype.decreaseGuard = function() {
    this._guardCounter--;
}

Game_Actor.prototype.makeAutoBattleActions = function() {
    for (var i = 0; i < this.numActions(); i++) {
        var list = this.makeActionList();
        var maxValue = Number.MIN_VALUE;
        for (var j = 0; j < list.length; j++) {
            var value = list[j].evaluate();
            if (value > maxValue) {
                maxValue = value;
                this.setAction(i, list[j]);
            }
        }
    }
};

Game_Actor.prototype.makeConfusionActions = function() {
    for (var i = 0; i < this.numActions(); i++) {
        this.action(i).setConfusion();
    }
};

Game_Actor.prototype.makeActions = function() {
    Game_Battler.prototype.makeActions.call(this);
    if (this.isAutoBattle()) {
        this.makeAutoBattleActions();
    } else if (this.isConfused()) {
        this.makeConfusionActions();
    }
};





Game_Enemy.prototype.makeActions = function() {
    Game_Battler.prototype.makeActions.call(this);
    if (this.numActions() > 0) {
        var actionList = this.enemy().actions.filter(function(a) {
            return this.isActionValid(a);
        }, this);
        if (actionList.length > 0) {
            this.selectAllActions(actionList);
        }
    }
};

Game_Enemy.prototype.getLastAction = function() {
    if(this.numActions() === 0) {
        return null;
    } else {
        return this.action(this.numActions() - 1);
    }
}

