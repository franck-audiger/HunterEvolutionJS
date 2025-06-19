/*:
 * @plugindesc QTE Plugin - Reflex sequence with anticipation delay, configurable input phase - v1.8
 *
 * @author RPG Maker AI
 *
 * @param Success Switch ID
 * @type switch
 * @desc Switch to activate on QTE success
 * @default 10
 *
 * @param QTE Window X
 * @type number
 * @desc X position of the QTE window
 * @default 200
 *
 * @param QTE Window Y
 * @type number
 * @desc Y position of the QTE window
 * @default 200
 *
 * @param Prep Phase Duration
 * @type number
 * @desc Number of frames for preparation phase
 * @default 180
 *
 * @param Input Duration
 * @type number
 * @desc Number of frames for input phase duration
 * @default 30
 *
 * @param Delta between wrong input
 * @type number
 * @desc Number of frames between two input to be considered as an error
 * @default 150
 */

(function() {
  const parameters = PluginManager.parameters("QTE_LakeMaster");

  const prepDuration  = Number(parameters['Prep Phase Duration'] || 180);
  const inputDuration = Number(parameters['Input Duration']    || 30);
  const successSwitch = Number(parameters['Success Switch ID']  || 10);
  const qteWindowX    = Number(parameters['QTE Window X']       || 200);
  const qteWindowY    = Number(parameters['QTE Window Y']       || 200);
  const deltaToFail   = Number(parameters['Delta between wrong input'] || 150);

  // --- Window QTE ---
  class QTE_Window extends Window_Base {
    initialize() {
      super.initialize(qteWindowX, qteWindowY, 340, 180);
      this.resetState();
      this.deactivate();
      this.openness = 0;
      this._cooldownTimer    = deltaToFail;
    }

    resetState() {
      this._sequence         = [];
      this._pointer          = 0;
      this._successes        = this._successes || 0;
      this._failures         = this._failures || 0;
      this._active           = false;
      this._phase            = 'idle';
      this._currentLetter    = '...';
      this._barMax           = 1;
      this._barValue         = 0;
      this._barColor         = 'rgba(0,255,136,0.5)';
      this._barAlpha         = 0.5;
    }

    start() {
      const prevSuc = this._successes;
      const prevFail= this._failures;
      this.resetState();
      this._successes = prevSuc;
      this._failures  = prevFail;

      this._sequence = this._generateSequence();
      this._pointer  = 0;
      this._active   = true;
      this._phase    = 'prep';
      this._barMax   = prepDuration;
      this._barValue = 0;
      this._barColor = 'rgba(0,255,136,0.5)';
      this._barAlpha = 0.5;
      this._letterRevealTime = Math.floor(prepDuration * (0.4 + Math.random() * 0.4));
      this._letterRevealed   = false;

      this.refresh();
      this.activate();
      this.open();
    }

    _generateSequence() {
      const used = ['x','z','c','v','b','q','w','a','s','d','enter','escape','arrowup','arrowdown','arrowleft','arrowright'];
      const all  = 'abcdefghijklmnopqrstuvwxyz'.split('');
      const ok   = all.filter(k => !used.includes(k));
      return Array.from({length:5}, () => ok[Math.floor(Math.random()*ok.length)]);
    }

    update() {
	  console.log(this._cooldownTimer)
      super.update();
      if (!this._active) return;
      this._cooldownTimer++;

      switch (this._phase) {
        case 'prep':
          this._barValue = Math.min(this._barValue + 1, this._barMax);
          if (!this._letterRevealed && this._barValue >= this._barMax - (this._barMax - this._letterRevealTime)) {
            this._prepareForLetter();
            this._letterRevealed = true;
          }
          if (this._barValue >= this._barMax) {
            this._startInputPhase();
          }
          break;
        case 'input':
          this._barValue = Math.max(this._barValue - 1, 0);
          if (this._barValue <= 0) {
            this._failInput();
          }
          break;
      }

      this.refresh();
    }

    _prepareForLetter() {
      AudioManager.playSe({name:'Bell3', pan:0, pitch:80, volume:90});
      this._currentLetter = this._sequence[this._pointer];
      this.refresh();
    }

    _startInputPhase() {
      this._phase    = 'input';
      this._barMax   = inputDuration;
      this._barValue = inputDuration;
      this._barColor = '#009933';
      this._barAlpha = 1.0;
      this.refresh();
    }

    _failInput() {
      this._cooldownTimer = 0;
      this._failures++;
      this._phase         = 'idle';
      this._currentLetter = '...';
      AudioManager.playSe({name:'water-splash-Fail', pan:0, pitch:100, volume:90});
      this.refresh();
      this._fail();
    }

    _fail() {
      this._pointer   = Math.max(0, this._pointer - 1);
      this._successes = 0;
      if (this._failures >= 3) {
        this._active = false;
        this.close();
        $gameMessage.add("Échec !");
        setTimeout(() => SceneManager.goto(Scene_Gameover), 1000);
      } else {
        setTimeout(() => this.start(), 300);
      }
    }

    onInput(letter) {
	  console.log("     : " + this._cooldownTimer + " : " + deltaToFail)
      if (!this._active || !this._letterRevealed) return;
      if (letter === this._sequence[this._pointer]) {
        this._pointer++;
        this._successes++;
        if (this._successes >= 5) {
          this._success();
        } else {
          this.start();
        }
      } else if (this._cooldownTimer >= deltaToFail) {
        this._failInput();
      }
    }

    _success() {
      this._active = false;
      $gameSwitches.setValue(successSwitch, true);
      this.close();
    }

    refresh() {
      this.contents.clear();
      this.drawText('Appuie sur: ' + this._currentLetter.toUpperCase(), 0, 0, 300, 'center');
      this._drawProgressBoxes();
      if (this._phase === 'prep') {
        this.drawText('Prépare-toi !', 0, 70, 300, 'center');
      }
      if (this._phase !== 'idle') {
        const w = (this._barValue / this._barMax) * 300;
        this.contents.paintOpacity = this._barAlpha * 255;
        this.contents.fillRect(10, 100, Math.max(0, Math.min(w, 300)), 10, this._barColor);
        this.contents.paintOpacity = 255;
      }
    }

    _drawProgressBoxes() {
      const total = 8, boxW = 30, sp = 5, xo = 10;
      for (let i = 0; i < total; i++) {
        const x = xo + i * (boxW + sp);
        let  col = '#444444';
        if (i < 3 && this._failures > (2 - i)) col = '#ff0000';
        if (i >= 3 && (i - 3) < this._successes) col = '#00ff00';
        this.contents.fillRect(x, 40, boxW, 10, col);
      }
    }
  }

  const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
  Scene_Map.prototype.createAllWindows = function() {
    _Scene_Map_createAllWindows.call(this);
    this._qteWindow = new QTE_Window();
    this.addWindow(this._qteWindow);
  };

  const _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function() {
    if (this._qteWindow && this._qteWindow._active) Input.clear();
    _Scene_Map_update.call(this);
  };

  Scene_Map.prototype.startQTE = function() {
    this._qteWindow.start();
  };

  document.addEventListener("keydown", event => {
    const scene = SceneManager._scene;
    if (!scene || !scene._qteWindow || !scene._qteWindow._active || !scene._qteWindow._letterRevealed) return;
    const key = event.key.toLowerCase();
    event.preventDefault();
    scene._qteWindow.onInput(key);
  });

})();
