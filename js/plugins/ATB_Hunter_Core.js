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
      'ATB_Scene.js',
      'ATB_EnemyBars.js',
      'LangText.js',
      'MiniGameAutoScroll.js',
      'FogScreen.js'
    ];
  
    files.forEach(function(file) {
      const script = document.createElement('script');
      script.src = path + file;
      script.async = false;
      document.body.appendChild(script);
    });


  })();