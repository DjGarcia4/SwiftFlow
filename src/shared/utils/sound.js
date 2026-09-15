// Short sound effects synthesized with the Web Audio API — no audio files
// or dependencies needed, same "hand-rolled instead of a library" approach
// as the SVG charts and the canvas share card elsewhere in this app.
//
// Not unit tested: jsdom doesn't implement AudioContext/oscillators, the
// same DOM-API tradeoff already made for canvas drawing and scroll/caret
// positioning in this codebase.
let audioContext = null;

const getAudioContext = () => {
  if (typeof window === "undefined") return null;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }
  // Browsers suspend the context until a user gesture — typing/clicking
  // already provides one, this just makes sure playback actually resumes.
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
};

const playTone = ({ frequency, duration, type = "sine", volume = 0.12, delay = 0 }) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;

  const startTime = ctx.currentTime + delay;
  // Quick fade in/out avoids the audible "click" a hard start/stop would make.
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
};

// A soft, quiet tick — plays on every correct keystroke, so it has to stay
// unobtrusive at typing speed.
export const playKeystrokeSound = () => {
  playTone({ frequency: 950, duration: 0.03, type: "sine", volume: 0.05 });
};

// A lower, slightly longer buzz for a typo.
export const playErrorSound = () => {
  playTone({ frequency: 220, duration: 0.12, type: "square", volume: 0.08 });
};

// A quick ascending three-note arpeggio (C5-E5-G5) for breaking a record or
// unlocking an achievement.
export const playCelebrationSound = () => {
  playTone({ frequency: 523.25, duration: 0.12, volume: 0.12 });
  playTone({ frequency: 659.25, duration: 0.12, volume: 0.12, delay: 0.09 });
  playTone({ frequency: 783.99, duration: 0.18, volume: 0.14, delay: 0.18 });
};
