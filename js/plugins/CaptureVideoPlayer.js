/*:
 * @plugindesc Lecture vidéo personnalisée après délai - CaptureMaster - v1.1
 * @author RPG Maker AI
 *
 * @help
 * Ce plugin joue une vidéo (CaptureMaster.webm) après un délai de 1200ms.
 * À placer dans le dossier /js/plugins/ et à activer dans le gestionnaire de plugins.
 *
 * Assurez-vous que la vidéo "CaptureMaster.webm" se trouve dans le dossier /movies/.
 *
 * Utilisez la commande :
 *    Script... > CaptureVideoPlayer.play();
 */

var CaptureVideoPlayer = CaptureVideoPlayer || {};

CaptureVideoPlayer.play = function() {
  setTimeout(() => {
    const videoName = 'CaptureMaster'; // Placez cette vidéo dans /movies/

    const onVideoEnd = () => {
      if (Graphics._video) {
        Graphics._video.removeEventListener('ended', onVideoEnd);
        Graphics._video = null;
      }
      Graphics._videoLoaded = false;
      Graphics._playVideo = false;

      // Retour à la carte
      SceneManager.goto(Scene_Map);
    };

    // Vérifie si aucune autre vidéo n'est en cours
    if (!Graphics._playVideo && !Graphics._video) {
      Graphics.playVideo(videoName);
      if (Graphics._video) {
        Graphics._video.addEventListener('ended', onVideoEnd);
      }
    }
  }, 1200); // Délai plus long pour éviter les conflits de chargement
};