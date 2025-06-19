/*:
 * @plugindesc [HUNTERxATB] Base du système ATB avec jauge dans le Window_BattleStatus - v1.1
 * @author ChatGPT
 *
 * @help
 * Ce plugin ajoute une propriété ATB à chaque battler (acteurs et ennemis),
 * et affiche une jauge jaune d'ATB dans la fenêtre de statut en combat.
 * La jauge progresse automatiquement à chaque frame selon l'agilité et le niveau.
 *
 * Prochaines étapes : bloquer les commandes jusqu'à 100 ATB et supprimer le tour par tour.
 */

(function() {
    
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
        BattleManager.readyInput();
        this.makeActions();
        BattleManager.queueActorInput(this);
    };

    Game_Battler.prototype.resetAtb = function() {
        this._atb = 0;
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

    BattleManager.selectNextCommand = function() {
        do {
            if (!this.actor() || !this.actor().selectNextCommand()) {
                this.startTurn();
            }
        } while (this.actor() && !this.actor().canInput());
    };


    BattleManager.queueActorInput = function(actor) {
        if (!this._readyActors.includes(actor)) {
            this._readyActors.push(actor);
        }
    };

    const _BattleManager_initMembers = BattleManager.initMembers;
    BattleManager.initMembers = function() {
        _BattleManager_initMembers.call(this);
        this._readyActors = [];
        this._actorIndex = -1;
    };

    BattleManager.startBattle = function() {
        this._phase = 'init';
        $gameSystem.onBattleStart();
        $gameParty.onBattleStart();
        $gameTroop.onBattleStart();
        this.displayStartMessages();
    };
    
    BattleManager.readyInput = function() {
        this._phase = 'start';
    };
    
    BattleManager.startInput = function() {
        this._phase = 'input';
    };

    BattleManager.update = function() {
        this.updateAtbTick();
        SceneManager._scene._statusWindow.refresh(); // Rafraîchit la fenêtre de statut pour mettre à jour les jauges ATB
        if (!this.isBusy() && !this.updateEvent()) {
            switch (this._phase) {
            case 'start':
                this.startInput();
                break;
            case 'turn':
                this.updateTurn();
                break;
            case 'action':
                this.updateAction();
                break;
            case 'turnEnd':
                this.updateTurnEnd();
                break;
            case 'battleEnd':
                this.updateBattleEnd();
                break;
            }
        }
    };

    BattleManager.updateAtbTick = function() {
        if ($gameMessage.isBusy()) return;
        this.allBattleMembers().forEach(function(battler) {
            if (battler._atb === undefined) {
                battler.initAtb();
            }
            battler.updateAtb();
        });
    };
  
    BattleManager.allBattleMembers = function() {
      return $gameParty.battleMembers().concat($gameTroop.members());
    };

    
    Window_Base.prototype.fittingHeight = function(numLines) {
        return numLines * (this.lineHeight()+2) + this.standardPadding() * 2;
    };
  
    // Extension de Window_BattleStatus pour afficher la jauge ATB
    var _Window_BattleStatus_drawGaugeArea = Window_BattleStatus.prototype.drawGaugeArea;
    Window_BattleStatus.prototype.drawGaugeArea = function(rect, actor) {
        console.log("drawGaugeArea called for actor: " + actor.name());
      _Window_BattleStatus_drawGaugeArea.call(this, rect, actor);
  
      var gaugeX = rect.x + 0;
      var gaugeY = rect.y + rect.height - this.lineHeight();
      var gaugeWidth = rect.width;
  
      this.drawAtbGauge(actor, gaugeX, gaugeY, gaugeWidth);
    };
  
    Window_BattleStatus.prototype.drawAtbGauge = function(actor, x, y, width) {
      var atbRate = actor.atb() / 100;
      console.log("actor.atb() : " + actor.atb())
      this.drawGauge(x, y+5, width, atbRate, this.textColor(6), this.textColor(0));
      //this.drawGauge(x, y, width, atbRate, this.textColor(6), this.textColor(0));
    };




  })();
  