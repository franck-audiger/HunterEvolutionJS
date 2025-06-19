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
      return (this.agi / 10) * 0.05; // vitesse ajustée, facteur de ralentissement
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
  
  // ==== EXTENSION DU BATTLE MANAGER ====
  BattleManager.selectNextCommand = function() {
    this.startTurn();
  }

  BattleManager.startTurn = function() {
      this._phase = 'turn';
      $gameTroop.increaseTurn();
      $gameParty.requestMotionRefresh();
      this._logWindow.startTurn();
  };

  const _BattleManager_initMembers = BattleManager.initMembers;
  BattleManager.initMembers = function() {
      _BattleManager_initMembers.call(this);
      this._readyActors = [];
      this._actorIndex = -1;
  };
  
  BattleManager.queueActorInput = function(actor) {
      if (!this._readyActors.includes(actor)) {
          this._readyActors.push(actor);
      }
  };
  
  BattleManager.update = function() {
      this.updateAtbTick();
      if (!this.isBusy() && !this.updateEvent()) {
          if (this._readyActors.length > 0) {
              this._actorIndex = $gameParty.members().indexOf(this._readyActors.shift());
              this._phase = 'input';
              console.log('inputting')
              this.actor().setActionState('inputting');
              //this.updateTargetPosition()
              SceneManager._scene._actorCommandWindow.setup(this.actor());
              SceneManager._scene._actorCommandWindow.select(0);
              SceneManager._scene._actorCommandWindow.open();
              SceneManager._scene._actorCommandWindow.activate();
              this._actionBattlers.push(this.actor())
          } else if (this._actionBattlers.length > 0) {
            console.log('waiting')
            //this.updateTargetPosition()
              this._subject = this._actionBattlers.shift();
              this._subject.setActionState('waiting');
              this._phase = 'turn';
              this.processTurn();
              this._subject.onAllActionsEnd();
              this.refreshStatus();
              this._logWindow.displayAutoAffectedStatus(this._subject);
              this._logWindow.displayCurrentState(this._subject);
              this._logWindow.displayRegeneration(this._subject);
              this._subject.resetAtb();
              this._subject.onTurnEnd();
              this._logWindow.displayAutoAffectedStatus(this._subject);
              this._logWindow.displayRegeneration(this._subject);
              this.actor().setActionState("done");
              
              this._logWindow.endAction(this._subject);
                // === Retour du sprite après l'action ===
              const spriteSet = SceneManager._scene._spriteset;
              const sprites = spriteSet._actorSprites.concat(spriteSet._enemySprites);
              sprites.forEach(sprite => {
                  if (sprite._battler === this._subject && sprite.startMotion) {
                      sprite.startMotion('walk');
                  }
              });
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
  
  BattleManager.startTurn = function() {
      this._phase = 'turn';
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

      // Barre ATB (jaune)
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

      // Barre de vie (rouge) pour les ennemis
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
  