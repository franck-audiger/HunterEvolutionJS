
    // ==== ATB EXTENSIONS POUR GAME_BATTLER ====

    Game_Battler.prototype.initAtb = function() {
        this._atb = 0;
        this._atbReady = false;
    };

    Game_Battler.prototype.updateAtb = function() {
        if (this.isAlive() && !this._atbReady) {
            this._atb += this.atbSpeed();
            if (this._atb >= 100) {
                this._atb = 100;
                this._atbReady = true;
                this.onAtbReady();
            }
        }
    };

    Game_Battler.prototype.atbSpeed = function() {
        var level = this.level !== undefined ? this.level : (this.agi-30)/100; // Utilise l'AGI comme base approximative
        let log1 = Math.log(level+1) / Math.log(100);
        let log3 = Math.log(level+3) / Math.log(100);
        let agilityFactor = ((this.agi/5)*0.1);
        var levelFactor = ((1-log1)*2)*(log3)*3;
        let result = agilityFactor+levelFactor
        return result/4;
    };

    Game_Battler.prototype.onAtbReady = function() {
        console.log("ATB ready for " + this.name());
        if(this.isActor()){
            BattleManager._readyActorsToInput.push(this);
        }
    };

    Game_Battler.prototype.resetAtb = function() {
        this._atb = 0;
        this._atbReady = false;
    };

    Game_Battler.prototype.resetAtbMax = function() {
        this._atb = 100;
        this._atbReady = false;
    };

    Game_Battler.prototype.atb = function() {
        if(this._atb === undefined) {
            this.initAtb();
        }
        return this._atb 
    };

    Game_Actor.prototype.actionTodo = function() {
        return this._actionInputIndex < this.numActions() - 1;
    };


    Game_Actor.prototype.meetsUsableItemConditions = function(item) {
        return Game_BattlerBase.prototype.meetsUsableItemConditions.call(this, item);
    };





    