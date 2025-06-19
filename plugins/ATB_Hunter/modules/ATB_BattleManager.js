
//-----------------------------------------------------------------------------
// BattleManager
//
// The static class that manages battle progress.

function BattleManager() {
    throw new Error('This is a static class');
}

BattleManager.setup = function(troopId, canEscape, canLose) {
    this.initMembers();
    this._canEscape = canEscape;
    this._canLose = canLose;
    $gameTroop.setup(troopId);
    $gameScreen.onBattleStart();
    this.makeEscapeRatio();
};

BattleManager.initMembers = function() {
    this._phase = 'init';
    this._canEscape = false;
    this._canLose = false;
    this._battleTest = false;
    this._eventCallback = null;
    this._preemptive = false;
    this._surprise = false;
    this._actionForcedBattler = null;
    this._mapBgm = null;
    this._mapBgs = null;
    this._logWindow = null;
    this._statusWindow = null;
    this._spriteset = null;
    this._escapeRatio = 0;
    this._escaped = false;
    this._rewards = {};
    this._turnForced = false;
    this._readyActorsToInput = [];
    this._inputActorsIndex = 0;
    this._readyActorsToAction = [];
    this._actionInputIndex = 0;
    this._step = "init";
};


BattleManager.isBattleEnd = function() {
    //A mettre vrai quand les sprites doivent s'adapter à la fin du combat
    return false;
};

BattleManager.isEscaped = function() {
    return false;
};

BattleManager.isBattleTest = function() {
    return this._battleTest;
};

BattleManager.setBattleTest = function(battleTest) {
    this._battleTest = battleTest;
};

BattleManager.setEventCallback = function(callback) {
    this._eventCallback = callback;
};

BattleManager.setLogWindow = function(logWindow) {
    this._logWindow = logWindow;
};

BattleManager.setStatusWindow = function(statusWindow) {
    this._statusWindow = statusWindow;
};

BattleManager.setSpriteset = function(spriteset) {
    this._spriteset = spriteset;
};

BattleManager.onEncounter = function() {
    this._preemptive = (Math.random() < this.ratePreemptive());
    this._surprise = (Math.random() < this.rateSurprise() && !this._preemptive);
    
    if (this._preemptive) {
        //Set all gauge to 100 for Party
        $gameParty.members().forEach((actor) => actor.resetAtbMax());
    } else if (this._surprise) {
        //Set all gauge to 100 for Ennermy
        $gameTroop.members().forEach((actor) => actor.resetAtbMax());
    }
};

BattleManager.ratePreemptive = function() {
    return $gameParty.ratePreemptive($gameTroop.agility());
};

BattleManager.rateSurprise = function() {
    return $gameParty.rateSurprise($gameTroop.agility());
};

BattleManager.saveBgmAndBgs = function() {
    this._mapBgm = AudioManager.saveBgm();
    this._mapBgs = AudioManager.saveBgs();
};

BattleManager.playBattleBgm = function() {
    AudioManager.playBgm($gameSystem.battleBgm());
    AudioManager.stopBgs();
};

BattleManager.playVictoryMe = function() {
    AudioManager.playMe($gameSystem.victoryMe());
};

BattleManager.playDefeatMe = function() {
    AudioManager.playMe($gameSystem.defeatMe());
};

BattleManager.replayBgmAndBgs = function() {
    if (this._mapBgm) {
        AudioManager.replayBgm(this._mapBgm);
    } else {
        AudioManager.stopBgm();
    }
    if (this._mapBgs) {
        AudioManager.replayBgs(this._mapBgs);
    }
};

BattleManager.makeEscapeRatio = function() {
    this._escapeRatio = 0.5 * $gameParty.agility() / $gameTroop.agility();
};

BattleManager.isInputting = function() {
    return false;
};


BattleManager.updateAtbTick = function() {
    if ($gameMessage.isBusy()) return;
    this._statusWindow.refresh();
    this.allBattleMembers().forEach(function(battler) {
        if (battler._atb === undefined) {
            battler.initAtb();
        }
        battler.updateAtb();
    });
};

BattleManager.getCurrentInputActor = function() {
    return this._inputActorsIndex < this._readyActorsToInput.length ? this._readyActorsToInput[this._inputActorsIndex] : null;
}

BattleManager.getCurrentActionActor = function() {
    return this._actionInputIndex < this._readyActorsToAction.length ? this._readyActorsToAction[this._actionInputIndex] : null;
}

BattleManager.update = function() {
    if (!this.isBusy() && !this.updateEvent()) {
        this.updateAtbTick();
        switch (this._step) {
            case "init":
                if(this._readyActorsToInput.length - 1 >= this._inputActorsIndex){
                    SceneManager._scene.startActorCommandSelection(this.getCurrentInputActor());
                    this._step = "input";
                } else if (this._readyActorsToAction.length - 1 >= this._actionInputIndex) {
                    //Executer un action
                    var actor = this.getCurrentActionActor()
                    var action = actor.inputtingAction();
                    actor.useItem(action.item());
                    this._step = "actions";
                    var target = action._targetIndex
                    
                    actor.makeActions();
                    
                    if (!action.needsSelection()) {
                        if(action.isForAll()){
                            action.setTarget($gameTroop.aliveMembers()[0]);
                            action.makeTargets()
                            for(let i = 1; i < action.numTargets(); i++){
                                var newAction = new Game_Action(action)
                                newAction.setTarget($gameTroop.aliveMembers()[i]);
                                newAction.makeTargets()
                                this._actions.push(newAction);
                            }
                        } else {
                            console.log("action.numTargets() : "+ action.numTargets())
                        }
                    } 
                    action.applyGlobal();
                    this.refreshStatus();
                } else {
                    console.log("Nothing to do")
                }
                break;
            case "actions":
                if(this._readyActorsToAction.length - 1 >= this._actionInputIndex){
                    console.log("treat action")
                    let target = $gameTroop.members()[ this.getCurrentActionActor().inputtingAction()._targetIndex];
                    if (target) {
                        this.invokeAction(this.getCurrentActionActor(), target);
                    }
                    this._step = "init";
                }
                break;
            case "input":
                break;  
        }
    }
};

BattleManager.invokeAction = function(subject, target) {
    this._logWindow.push('pushBaseLine');
    if (Math.random() < this.getCurrentActionActor().inputtingAction().itemCnt(target)) {
        this.invokeCounterAttack(subject, target);
    } else if (Math.random() < this.getCurrentActionActor().inputtingAction().itemMrf(target)) {
        this.invokeMagicReflection(subject, target);
    } else {
        this.invokeNormalAction(subject, target);
    }
    subject.setLastTarget(target);
    this._logWindow.push('popBaseLine');
    this.getCurrentActionActor().resetAtb()
    this.refreshStatus();
    this._actionInputIndex++;
};

BattleManager.invokeNormalAction = function(subject, target) {
    var realTarget = this.applySubstitute(target);
    this.getCurrentActionActor().inputtingAction().apply(realTarget);
    this._logWindow.displayActionResults(subject, realTarget);
};

BattleManager.invokeCounterAttack = function(subject, target) {
    var action = new Game_Action(target);
    action.setAttack();
    action.apply(subject);
    this._logWindow.displayCounter(target);
    this._logWindow.displayActionResults(target, subject);
};

BattleManager.invokeMagicReflection = function(subject, target) {
	this.getCurrentActionActor().inputtingAction()._reflectionTarget = target;
    this._logWindow.displayReflection(target);
    this.getCurrentActionActor().inputtingAction().apply(subject);
    this._logWindow.displayActionResults(target, subject);
};

BattleManager.applySubstitute = function(target) {
    if (this.checkSubstitute(target)) {
        var substitute = target.friendsUnit().substituteBattler();
        if (substitute && target !== substitute) {
            this._logWindow.displaySubstitute(substitute, target);
            return substitute;
        }
    }
    return target;
};

BattleManager.checkSubstitute = function(target) {
    return target.isDying() && !this.getCurrentActionActor().inputtingAction().isCertainHit();
};

BattleManager.updateEvent = function() {
   /*  switch (this._phase) {
        case 'start':
        case 'turn':
        case 'turnEnd':
            if (this.isActionForced()) {
                this.processForcedAction();
                return true;
            } else {
                return this.updateEventMain();
            }
    } */
    return false;
};

BattleManager.isBusy = function() {
    return ($gameMessage.isBusy() || this._spriteset.isBusy() ||
            this._logWindow.isBusy());
};

BattleManager.startBattle = function() {
    this._phase = 'start';
    $gameSystem.onBattleStart();
    $gameParty.onBattleStart();
    $gameTroop.onBattleStart();
    this.displayStartMessages();
};

BattleManager.displayStartMessages = function() {
    $gameTroop.enemyNames().forEach(function(name) {
        $gameMessage.add(TextManager.emerge.format(name));
    });
    if (this._preemptive) {
        $gameMessage.add(TextManager.preemptive.format($gameParty.name()));
    } else if (this._surprise) {
        $gameMessage.add(TextManager.surprise.format($gameParty.name()));
    }
};

BattleManager.refreshStatus = function() {
    this._statusWindow.refresh();
};

BattleManager.allBattleMembers = function() {
    return $gameParty.members().concat($gameTroop.members());
};

BattleManager.processVictory = function() {
    $gameParty.removeBattleStates();
    $gameParty.performVictory();
    this.playVictoryMe();
    this.replayBgmAndBgs();
    this.makeRewards();
    this.displayVictoryMessage();
    this.displayRewards();
    this.gainRewards();
    this.endBattle(0);
};

BattleManager.processDefeat = function() {
    this.displayDefeatMessage();
    this.playDefeatMe();
    if (this._canLose) {
        this.replayBgmAndBgs();
    } else {
        AudioManager.stopBgm();
    }
    this.endBattle(2);
};

BattleManager.endBattle = function(result) {
    this._phase = 'battleEnd';
    if (this._eventCallback) {
        this._eventCallback(result);
    }
    if (result === 0) {
        $gameSystem.onBattleWin();
    } else if (this._escaped) {
        $gameSystem.onBattleEscape();
    }
};

BattleManager.updateBattleEnd = function() {
    if (this.isBattleTest()) {
        AudioManager.stopBgm();
        SceneManager.exit();
    } else if (!this._escaped && $gameParty.isAllDead()) {
        if (this._canLose) {
            $gameParty.reviveBattleMembers();
            SceneManager.pop();
        } else {
            SceneManager.goto(Scene_Gameover);
        }
    } else {
        SceneManager.pop();
    }
    this._phase = null;
};

BattleManager.makeRewards = function() {
    this._rewards = {};
    this._rewards.gold = $gameTroop.goldTotal();
    this._rewards.exp = $gameTroop.expTotal();
    this._rewards.items = $gameTroop.makeDropItems();
};

BattleManager.displayVictoryMessage = function() {
    $gameMessage.add(TextManager.victory.format($gameParty.name()));
};

BattleManager.displayDefeatMessage = function() {
    $gameMessage.add(TextManager.defeat.format($gameParty.name()));
};

BattleManager.displayEscapeSuccessMessage = function() {
    $gameMessage.add(TextManager.escapeStart.format($gameParty.name()));
};

BattleManager.displayEscapeFailureMessage = function() {
    $gameMessage.add(TextManager.escapeStart.format($gameParty.name()));
    $gameMessage.add('\\.' + TextManager.escapeFailure);
};

BattleManager.displayRewards = function() {
    this.displayExp();
    this.displayGold();
    this.displayDropItems();
};

BattleManager.displayExp = function() {
    var exp = this._rewards.exp;
    if (exp > 0) {
        var text = TextManager.obtainExp.format(exp, TextManager.exp);
        $gameMessage.add('\\.' + text);
    }
};

BattleManager.displayGold = function() {
    var gold = this._rewards.gold;
    if (gold > 0) {
        $gameMessage.add('\\.' + TextManager.obtainGold.format(gold));
    }
};

BattleManager.displayDropItems = function() {
    var items = this._rewards.items;
    if (items.length > 0) {
        $gameMessage.newPage();
        items.forEach(function(item) {
            $gameMessage.add(TextManager.obtainItem.format(item.name));
        });
    }
};

BattleManager.gainRewards = function() {
    this.gainExp();
    this.gainGold();
    this.gainDropItems();
};

BattleManager.gainExp = function() {
    var exp = this._rewards.exp;
    $gameParty.allMembers().forEach(function(actor) {
        actor.gainExp(exp);
    });
};

BattleManager.gainGold = function() {
    $gameParty.gainGold(this._rewards.gold);
};

BattleManager.gainDropItems = function() {
    var items = this._rewards.items;
    items.forEach(function(item) {
        $gameParty.gainItem(item, 1);
    });
};
