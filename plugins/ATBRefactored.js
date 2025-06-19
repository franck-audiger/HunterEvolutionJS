/*:
 * @plugindesc [Hunter x Hunter] Système de Combat ATB - Prototype de base avec barres visibles au-dessus des battlers
 * @author GPT
 *
 * @help
 * Ce plugin remplace le système de tour par un système ATB basique.
 * Chaque battler a une jauge ATB qui se remplit selon son agilité.
 * Lorsqu'elle atteint 100%, le battler agit (automatiquement ou via input).
 * Une barre jaune s'affiche au-dessus de chaque battler.
 *
 * ⚠ Ce plugin désactive le système de tour par défaut.
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
        let log1 = Math.log(this.level+1) / Math.log(100);
        let log3 = Math.log(this.level+3) / Math.log(100);
        let agilityFactor = ((this.agi/5)*0.1);
        var levelFactor = ((1-log1)*2)*(log3)*3;
        let result = agilityFactor+levelFactor
        return result/4;
    };

    Game_Battler.prototype.onAtbReady = function() {
        this.makeActions();

        if (this.isActor()) {
            BattleManager.queueActorInput(this);
        } else {
            BattleManager._actionBattlers.push(this);
        }
    };

    Game_Battler.prototype.resetAtb = function() {
        this._atb = 0;
        this._atbReady = false;
    };

    // ==== EXTENSION DU SCENE MANAGER ====

    Scene_Battle.prototype.selectNextCommand = function() {
        if(BattleManager.isFightFinish()){
            SceneManager._scene.endCommandSelection()
        }
    };

    Scene_Battle.prototype.selectPreviousCommand = function() {
        if(BattleManager.isFightFinish()){
            SceneManager._scene.endCommandSelection()
        }
    };

    // ==== EXTENSION DU BATTLE MANAGER ====

    BattleManager.selectNextCommand = function() {}
    BattleManager.selectPreviousCommand = function() {}
    BattleManager.makeActionOrders = function() {};
    BattleManager.isFightFinish = function() {
        return this._fightFinish;
    }

    BattleManager.moveSprite = function() {
        const spriteSet = SceneManager._scene._spriteset;
        const sprites = spriteSet._actorSprites.concat(spriteSet._enemySprites);
        sprites.forEach(sprite => {
            if (sprite._battler === this._subject && sprite.startMotion) {
                sprite.startMotion('walk');
            }
        });
    }
    
    BattleManager.updateTurnEnd = function() {
        this._phase = 'start';
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

    BattleManager.queueActorInput = function(actor) {
        if (!this._readyActors.includes(actor)) {
            this._readyActors.push(actor);
        }
    };

    const _BattleManager_initMembers = BattleManager.initMembers;
    BattleManager.initMembers = function() {
        _BattleManager_initMembers.call(this);
        this._readyActors = [];
        this._fightFinish = false;
        this._actorIndex = -1;
    };

    BattleManager.startInput = function() {
        this._phase = 'input';
        this._actorIndex = $gameParty.members().indexOf(this._readyActors.shift());
        this.actor().makeActions();
        this.doWalk();
        if (!$gameParty.canInput()) {
            this.startTurn();
        }
    };

    BattleManager.startTurn = function() {
        this._phase = 'turn';
        this.makeActionOrders();
        $gameParty.requestMotionRefresh();
        this._logWindow.startTurn();
    };

    BattleManager.updateTurn = function() {
        $gameParty.requestMotionRefresh();
        this.processTurn();
    };

    BattleManager.doWalk = function() {
        // === Retour du sprite après l'action ===
        const spriteSet = SceneManager._scene._spriteset;
        const sprites = spriteSet._actorSprites.concat(spriteSet._enemySprites);
        sprites.forEach(sprite => {
            if (sprite._battler === this._subject && sprite.startMotion) {
                sprite.startMotion('walk');
            }
        });
    }

    BattleManager.processTurn = function() {
        var subject = this._subject;
        var action = subject.currentAction();
        if (action) {
            action.prepare();
            if (action.isValid()) {
                console.log("start action")
                this.startAction();
                subject.setActionState("acting")
                this.doWalk();
            }
            subject.removeCurrentAction();
        } else {
            subject.onAllActionsEnd();
            this.refreshStatus();
        }
    };

    BattleManager.endTurn = function() {
        this._phase = 'turnEnd';
        this._preemptive = false;
        this._surprise = false;
        this._subject.onTurnEnd();
        this.refreshStatus();
        this._logWindow.clear();
        this._subject = null;
        if (this.isForcedTurn()) {
            this._turnForced = false;
        }
    };

    
    BattleManager.updateEventMain = function() {
        $gameTroop.updateInterpreter();
        $gameParty.requestMotionRefresh();
        if ($gameTroop.isEventRunning() || this.isFightFinish()) {
            return true;
        }
        $gameTroop.setupBattleEvent();
        if ($gameTroop.isEventRunning() || SceneManager.isSceneChanging()) {
            return true;
        }
        return false;
    };


    BattleManager.checkBattleEnd = function() {
        if (this._phase && !this.isFightFinish()) {
            if (this.checkAbort()) {
                return true;
            } else if ($gameParty.isAllDead()) {
                this.processDefeat();
                return true;
            } else if ($gameTroop.isAllDead()) {
                this.processVictory();
                return true;
            }
        }
        return false;
    };

    BattleManager.update = function() {
        console.log(this._actionBattlers.length)
        if (this._actionBattlers.length == 0){
            this.updateAtbTick();
        }
        if (!this.isBusy() && !this.updateEvent()) {
            if(!this.isFightFinish()){
                let battleEnded = this.checkBattleEnd()
                if(battleEnded){
                    this._fightFinish = true;
                } else {
                    switch (this._phase) {
                    case 'turn':
                        this.updateTurn();
                        break;
                    case 'action':
                        this._chooseAction = false;
                        this.updateAction();
                        this._logWindow.displayAutoAffectedStatus(this._subject);
                        this._logWindow.displayCurrentState(this._subject);
                        this._logWindow.displayRegeneration(this._subject);
                        this.endTurn();
                        this.actor().setActionState("waiting");
                        break;
                    case 'turnEnd':
                        this.updateTurnEnd();
                        break;
                    default:
                        if (this._readyActors.length > 0) {
                            this._chooseAction = true;
                            this.startInput();
                            this.actor().setActionState("inputting");
                            SceneManager._scene._actorCommandWindow.setup(this.actor());
                            SceneManager._scene._actorCommandWindow.select(0);
                            SceneManager._scene._actorCommandWindow.open();
                            SceneManager._scene._actorCommandWindow.activate();
                            this._actionBattlers.push(this.actor())
                            this.actor().resetAtb();
                        } else if (this._actionBattlers.length > 0) {
                            this.startTurn();
                            this._subject = this._actionBattlers.shift();
                        }
                    }
                }
            } else {
                console.log("end")
                this.updateBattleEnd();
            }
        } 
    };

    // ==== SPRITE POUR LA BARRE ATB ====

    const _Spriteset_Battle_createLowerLayer = Spriteset_Battle.prototype.createLowerLayer;
    Spriteset_Battle.prototype.createLowerLayer = function() {
        _Spriteset_Battle_createLowerLayer.call(this);
        this._atbGauges = [];
    };

    const _Spriteset_Battle_update = Spriteset_Battle.prototype.update;
    Spriteset_Battle.prototype.update = function() {
        _Spriteset_Battle_update.call(this);
        this.updateAtbGauges();
    };

    Spriteset_Battle.prototype.updateAtbGauges = function() {
      const allSprites = this._actorSprites.concat(this._enemySprites);
      allSprites.forEach(sprite => {
        const battler = sprite._battler;
        if (!battler || battler._atb === undefined) return;

        if (!sprite._atbGauge) {
          const gauge = new Sprite(new Bitmap(40, 6));
          gauge.x = -20;
          gauge.y = -sprite.height - 10;
          sprite.addChild(gauge);
          sprite._atbGauge = gauge;
        }

        const atbWidth = battler._atb / 100 * 40;
        sprite._atbGauge.bitmap.clear();
        sprite._atbGauge.bitmap.fillRect(0, 0, atbWidth, 6, "#ffff00");

        if (battler.isEnemy()) {
          if (!sprite._hpGauge) {
            const hpGauge = new Sprite(new Bitmap(40, 6));
            hpGauge.x = -20;
            hpGauge.y = -sprite.height - 18;
            sprite.addChild(hpGauge);
            sprite._hpGauge = hpGauge;
          }

          const hpRate = battler.hpRate();
          const hpWidth = hpRate * 40;
          sprite._hpGauge.bitmap.clear();
          sprite._hpGauge.bitmap.fillRect(0, 0, hpWidth, 6, "#ff0000");
        }
      });
    };

})();
