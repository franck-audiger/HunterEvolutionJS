/*:
 * @plugindesc [HUNTERxATB] Plugin central ATB en fichiers séparés - v1.0
 * @author Franck Audiger
 *
 * @help Ce fichier est le cœur du système ATB. Il charge les modules.
 */

// Charge les modules (ordre important)
(function() {
    const path = 'js/plugins/ATB_Hunter/modules/';
    const files = [
      'ATB_GameBattler.js',
      'ATB_BattleManager.js',
      'ATB_Windows.js',
      'ATB_Object.js',
      'ATB_Scene.js'
    ];
  
    files.forEach(function(file) {
      const script = document.createElement('script');
      script.src = path + file;
      script.async = false;
      document.body.appendChild(script);
    });

  
    // Extension de Window_BattleStatus pour afficher la jauge ATB
    var _Window_BattleStatus_drawGaugeArea = Window_BattleStatus.prototype.drawGaugeArea;
    Window_BattleStatus.prototype.drawGaugeArea = function(rect, actor) {
      _Window_BattleStatus_drawGaugeArea.call(this, rect, actor);
  
      var gaugeX = rect.x + 0;
      var gaugeY = rect.y + rect.height - this.lineHeight();
      var gaugeWidth = rect.width;
  
      this.drawAtbGauge(actor, gaugeX, gaugeY, gaugeWidth);
    };
  
    Window_BattleStatus.prototype.drawAtbGauge = function(actor, x, y, width) {
      var atbRate = actor.atb() / 100;
      this.drawGauge(x, y+5, width, atbRate, this.textColor(6), this.textColor(0));
    };

  })();