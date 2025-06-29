/*:
 * @plugindesc Active les touches ZQSD pour le déplacement du joueur (support AZERTY) et ajoute la course via Shift ou Caps Lock. [Hunter x Hunter Game]
 * @author GPT
 *
 * @help
 * Ce plugin permet d'utiliser les touches ZQSD (AZERTY) en plus des flèches directionnelles.
 * Maintenir Shift permet de courir.
 * Activer Caps Lock permet de rester en mode course sans maintenir Shift.
 * Aucun paramètre requis.
 */

(function() {
  const alias_update = Input.update;

  // Mapping ZQSD
  Input.keyMapper[90] = 'up';     // Z
  Input.keyMapper[81] = 'left';   // Q
  Input.keyMapper[83] = 'down';   // S
  Input.keyMapper[68] = 'right';  // D

  let capsLockActive = false;

  // Ajout de détection de la touche Caps Lock
  document.addEventListener('keydown', function(event) {
    if (event.getModifierState && event.getModifierState('CapsLock')) {
      capsLockActive = true;
    } else if (event.keyCode === 20) {
      capsLockActive = !capsLockActive;
    }
  });

  document.addEventListener('keyup', function(event) {
    if (event.keyCode === 16 && !capsLockActive) { // Shift relâché
      $gamePlayer._dash = false;
    }
  });

  const _Game_Player_isDashing = Game_Player.prototype.isDashing;
  Game_Player.prototype.isDashing = function() {
    if ($gameMap.isDashDisabled()) return false;
    if (this.canMove()) {
      return Input.isPressed('shift') || capsLockActive;
    } else {
      return false;
    }
  };

  Input.update = function() {
    alias_update.call(this);
  };
})();
