/* [Ananda] Manages background music, sound effects, and mute logic */
class SoundManager {
        constructor() {
            this.isMuted = false;
            //this.hasStarted = false;
            // Background Music
            this.bgMusic = new Audio('/Pert/Pert-Diagram-test/pert/ananda/background.mp3');
            this.bgMusic.loop = true;
            this.bgMusic.volume = 0.3;
    
            // Sound Effects
this.clickSound = new Audio('/Pert/Pert-Diagram-test/pert/ananda/click.mp3');
this.successSound = new Audio('/Pert/Pert-Diagram-test/pert/ananda/success.mp3');

            //document.addEventListener('click', () => this.tryAutoStart(), { once: true });
            document.addEventListener('click', () => {
                if (!this.isMuted && this.bgMusic.paused) {
                    this.bgMusic.play().catch(e => console.log("Autoplay blocked"));
                }
            }, { once: true });
        }
     //   tryAutoStart() {
       //     if (!this.hasStarted && !this.isMuted) {
         //       this.bgMusic.play().then(() => {
           //         this.hasStarted = true;
             //   }).catch(e => console.log("Waiting for interaction..."));
            //}
        //}
       toggleMute() {
            this.isMuted = !this.isMuted;
            if (this.isMuted) {
                this.bgMusic.pause();
                return "🔇 Off";
            } else {
               // this.bgMusic.play() .catch(e => console.log("Interaction required"));
               // this.hasStarted = true;
               this.bgMusic.play().catch(e => console.log("Playback failed", e));
                return "🔊 On";
            }
        }
        playSound(soundName) {
            if (this.isMuted) return;
            console.log(`Playing sound: ${soundName}`);
            // Force the sound to reset so it can play rapidly
            let sound = null;
            if (soundName === 'click') sound = this.clickSound;
            else if (soundName === 'success_chime') sound = this.successSound;
            
            if (sound) {
                // Reset time to 0 so it can play again immediately
                sound.currentTime = 0;
                sound.play().catch(e => console.log("SFX Error", e));
        }
     //   playSound(soundName) {
    //
      //      console.log(`%cSOUND: Playing '${soundName}'`, 'color: blue; font-weight: bold;');
        //}
        }
    } 