
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
    this._readyActionToExecute = [];
    this._targetForAction = [];
    this._actorForAction = [];
    this._actionExecuteIndex = 0;
    this._step = "init";
};

BattleManager.canEscape = function() {
    return this._canEscape;
};

BattleManager.getActorForAction = function() {
    if(!this._actorForAction){
        this._actorForAction = [];
    }
    return this._actorForAction;
};

BattleManager.getTargetForAction = function() {
    if(!this._targetForAction){        
        this._targetForAction = [];
    }
    return this._targetForAction;
};

BattleManager.getReadyActionToExecute = function() {
    if(!this._readyActionToExecute){        
        this._readyActionToExecute = [];
    }
    return this._readyActionToExecute;
};

BattleManager.getReadyActorsToAction = function() {
    if(!this._readyActorsToAction){
        this._readyActorsToAction = [];
    }
    return this._readyActorsToAction;
};


BattleManager.getReadyActorsToInput = function() {
    if(!this._readyActorsToInput){
        this._readyActorsToInput = [];
    }
    return this._readyActorsToInput;
};

BattleManager.isAborting = function() {
    return this._phase === 'aborting';
};


BattleManager.isBattleEnd = function() {
    //A mettre vrai quand les sprites doivent s'adapter à la fin du combat
    return this._step == "finished";;
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
    return this._inputActorsIndex < this.getReadyActorsToInput().length ? this.getReadyActorsToInput()[this._inputActorsIndex] : null;
}

BattleManager.getCurrentActionActor = function() {
    return this._actionInputIndex < this.getReadyActorsToAction().length ? this.getReadyActorsToAction()[this._actionInputIndex] : null;
}

BattleManager.update = function() {
    if (!this.isBusy() && !this.updateEvent()) {
        this.updateAtbTick();
        switch (this._step) {
            case "init":
                if(this.getReadyActorsToInput().length - 1 >= this._inputActorsIndex){
                    this.getCurrentInputActor().makeActions();
                    SceneManager._scene.startActorCommandSelection(this.getCurrentInputActor());
                    this._step = "input";
                } else if (this.getReadyActorsToAction().length - 1 >= this._actionInputIndex) {
                    //Executer un action
                    var actor = this.getCurrentActionActor()
                    var action = null;
                    if(actor.isActor()){
                        action = actor.inputtingAction();
                        actor.useItem(action.item());
                    } else {
                        action = actor.getLastAction();
                    }
                    this._step = "actions";
                    var targets = action.makeTargets();
                    this.getTargetForAction().push(targets);
                    this.getReadyActionToExecute().push(action);
                    this.getActorForAction().push(actor);
                    this._actionInputIndex++;
                    action.applyGlobal();
                    //this.refreshStatus();
                } else if (this.getReadyActionToExecute().length - 1 >= this._actionExecuteIndex){
                    this._step = "actions";
                }
                break;
            case "actions":
                if(this.getReadyActionToExecute().length - 1 >= this._actionExecuteIndex){
                    var subject = this.getActorForAction()[this._actionExecuteIndex]
                    var action = this.getReadyActionToExecute()[this._actionExecuteIndex]
                    subject.setActionState("acting");
                    subject.performAction(action);

                    var targets = this.getTargetForAction()[this._actionExecuteIndex]
                    this._step = 'doAction';
                    subject.useItem(action.item());
                    action.applyGlobal();
                    this._logWindow.startAction(subject, action, targets);
                }
                break;
            case "doAction":
                this.invokeAction();
                var subject = this.getActorForAction()[this._actionExecuteIndex]
                this._logWindow.endAction(subject);
                subject.setActionState("undecided");
                if(subject.isActor()){
                    subject.applyGyo();
                    this._logWindow.displayGyoUse(subject);
                }
                //subject.clearStates();
                this._actionExecuteIndex++;
                subject.decreaseGuard();
                this._step = "init";
                break
            case "input":
                break;  
            case "toClosed":
                this.updateBattleEnd();
                break;  
        } 
    } else {
        if(!this.isBusy() ){
            if(this._step == "finished"){
                this.updateBattleEnd();
            }
        }
    }
};

BattleManager.invokeAction = function() {
    var targets = this.getTargetForAction()[this._actionExecuteIndex]
    var subject = this.getActorForAction()[this._actionExecuteIndex]
    if(subject.isActor()){
        subject = $gameParty.members().find(actor => actor.index() === subject.index());
    } else {
        subject = $gameTroop.members().find(troop => troop.index() === subject.index());
    }
    this._logWindow.push('pushBaseLine');
    this.invokeNormalAction();
    subject.setLastTarget(targets[targets.length - 1]);
    this._logWindow.push('popBaseLine');
    subject.resetAtb()
    this.refreshStatus();
};

BattleManager.invokeNormalAction = function() {
    var action = this.getReadyActionToExecute()[this._actionExecuteIndex]
    var targets = this.getTargetForAction()[this._actionExecuteIndex]
    var subject = this.getActorForAction()[this._actionExecuteIndex]
    for(target of targets) {
        var realTarget = this.applySubstitute(target);
        action.apply(realTarget);
        this._logWindow.displayActionResults(subject, realTarget);
    }
    /*if(action._item._dataClass == "skill" && action._item._itemId == 11){
        subject.useGyo();
        console.log("Gyo used")
    }*/
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
    return target.isDying() && !this.getReadyActionToExecute()[this._actionExecuteIndex].isCertainHit();
};

BattleManager.updateEvent = function() {
    return this.updateEventMain()
};

BattleManager.updateEventMain = function() {
    $gameTroop.updateInterpreter();
    $gameParty.requestMotionRefresh();
    if ($gameTroop.isEventRunning() || this.checkBattleEnd()) {
        return true;
    }
    $gameTroop.setupBattleEvent();
    if ($gameTroop.isEventRunning() || SceneManager.isSceneChanging()) {
        return true;
    }
    return false;
};


BattleManager.checkAbort = function() {
    if ($gameParty.isEmpty() || this.isAborting()) {
        SoundManager.playEscape();
        this._escaped = true;
        this.processAbort();
    }
    return false;
};

BattleManager.checkBattleEnd = function() {
    if (this._step) {
        if(this._step != "toClosed") {
            if (this.checkAbort()) {
                this._step = "toClosed"
                return true;
            } else if ($gameParty.isAllDead()) {
                this.processDefeat();
                this._step = "toClosed"
                return true;
            } else if ($gameTroop.isAllDead()) {
                this.processVictory();
                this._step = "toClosed"
                return true;
            }
        }
    }
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
    this.step = 'finished';
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
