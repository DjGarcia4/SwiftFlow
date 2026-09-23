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

// A short burst of filtered noise: the "click" a tone alone can't make,
// for the keyboard-like sounds below.
const playNoise = ({ duration, volume, frequency, q = 1, delay = 0 }) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = frequency;
  filter.Q.value = q;
  const gain = ctx.createGain();
  const startTime = ctx.currentTime + delay;
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(startTime);
  source.stop(startTime + duration + 0.02);
};

// Keystroke sounds, one per id in rewards.js. All short and quiet: they
// play on every correct key, so they have to stay out of the way at speed.
const KEYSTROKE_SOUNDS = {
  // A soft tick, the one everyone starts with
  soft: () => playTone({ frequency: 950, duration: 0.03, type: "sine", volume: 0.05 }),
  // A switch clicking and the key bottoming out
  mechanical: () => {
    playNoise({ duration: 0.018, volume: 0.09, frequency: 3200, q: 0.8 });
    playTone({
      frequency: 140,
      duration: 0.035,
      type: "triangle",
      volume: 0.06,
      delay: 0.004,
    });
  },
  // A sharp strike with a metallic ring
  typewriter: () => {
    playNoise({ duration: 0.025, volume: 0.1, frequency: 2200, q: 2 });
    playTone({
      frequency: 1800,
      duration: 0.04,
      type: "square",
      volume: 0.015,
      delay: 0.005,
    });
  },
  // A drop of water: a pitch falling fast
  bubble: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    oscillator.frequency.setValueAtTime(900, now);
    oscillator.frequency.exponentialRampToValueAtTime(380, now + 0.06);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.09);
  },
  // A knock on wood: low, round and short
  wood: () => {
    playTone({ frequency: 420, duration: 0.045, type: "triangle", volume: 0.08 });
    playNoise({ duration: 0.012, volume: 0.04, frequency: 1200, q: 1.5 });
  },
};

export const playKeystrokeSound = (variant = "soft") => {
  (KEYSTROKE_SOUNDS[variant] ?? KEYSTROKE_SOUNDS.soft)();
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
