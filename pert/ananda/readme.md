Ananda Prefab Documentation

Pert_ui.js prefab
AnimationManager
Manages intricate visual feedback sequences. The constructor accepts a reference to the SoundManager and initializes arrays containing randomized success and failure messages.
AnimationManager.playCriticalPathAnimation(correctTasks) Orchestrates the "win" state sequence. This method iterates through the completed tasks to highlight the critical path nodes, triggers the success notification popup, and initiates the confetti particle engine.
AnimationManager.triggerError() Orchestrates the "lose" state sequence. This method activates the notification popup in error mode, featuring the Dragon animation.
AnimationManager.triggerPopup(isSuccess) Controls the visibility and content of the DOM overlay. It toggles CSS classes to apply green (success) or red (error) styling, randomly selects an appropriate message, and dynamically injects the HTML for either the Dragon GIF (for errors) or the Party Emoji (for success). The overlay automatically dismisses after a six-second duration.
AnimationManager.playSuccessConfetti() Generates the particle effects for success feedback. It programmatically creates 50 div elements with randomized colors, initial positions, and animation delays. These elements are appended to the document body and are subsequently removed upon the completion of their animation cycle.
SoundManager
Manages the audio context and asset loading. The constructor pre-loads Audio objects for both background music and sound effects (SFX). It also attaches a one-time document listener to circumvent browser autoplay policy restrictions, thereby unlocking audio playback.
SoundManager.toggleMute() Toggles the internal mute state. It pauses or resumes the looping background music track and returns a string suitable for updating the associated user interface button.
SoundManager.playSound(soundName) Plays one-shot sound effects (e.g., click, success_chime, error). This method utilizes .cloneNode(true) to facilitate rapid, overlapping playback of the same audio file without prematurely truncating previous instances.
main.js Prefabs 
UIController.constructor (Audio Additions)
Initializes instances of both the SoundManager and AnimationManager. It locates the audio-btn element within the Document Object Model (DOM) and attaches a click event listener configured to invoke soundManager.toggleMute().
UIController.onCheckClick (Feedback Logic)
Represents extensions to the core task checking routine. It evaluates the allCorrect boolean flag.
If true: It calls animationManager.playCriticalPathAnimation and soundManager.playSound('success_chime').
If false: It calls animationManager.triggerError() and soundManager.playSound('error').


