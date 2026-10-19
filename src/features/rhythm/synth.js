// Plays a track from tracks.js with the Web Audio API, and keeps the clock
// the whole game runs on. Notes are scheduled a little ahead on the audio
// context's own clock (the usual lookahead scheduler), so they land exactly
// on the beat whatever the page is doing; the game asks now() where in the
// song it is, on that same clock.
//
// Not unit tested, like sound.js: jsdom has no AudioContext. Without one
// (an old browser, a test) the clock still runs, silently, on
// performance.now().

import { getAudioContext } from "@/shared/utils/sound";
import { BEATS_PER_BAR, INTRO_BARS, trackTimeline } from "./tracks";

const STEPS_PER_BEAT = 4;
const LOOKAHEAD_S = 0.15;
const TICK_MS = 25;

const frequencyOf = (midi) => 440 * 2 ** ((midi - 69) / 12);

const noiseBuffers = new WeakMap();
const noiseFor = (ctx) => {
  if (!noiseBuffers.has(ctx)) {
    const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffers.set(ctx, buffer);
  }
  return noiseBuffers.get(ctx);
};

// The instruments, each one a few nodes into `out` at time `t`
const instruments = (ctx, out) => {
  const envelope = (t, peak, decay, attack = 0.004) => {
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(peak, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    gain.connect(out);
    return gain;
  };
  const tone = (t, { type, frequency, peak, decay, attack, filter }) => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, t);
    let into = envelope(t, peak, decay, attack);
    if (filter) {
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = filter;
      lowpass.connect(into);
      into = lowpass;
    }
    osc.connect(into);
    osc.start(t);
    osc.stop(t + (attack ?? 0.004) + decay + 0.05);
    return osc;
  };
  const noise = (t, { type, frequency, q = 0.8, peak, decay }) => {
    const source = ctx.createBufferSource();
    source.buffer = noiseFor(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = q;
    source.connect(filter);
    filter.connect(envelope(t, peak, decay, 0.002));
    source.start(t, Math.random() * 0.5);
    source.stop(t + decay + 0.05);
  };

  return {
    kick: (t) => {
      const osc = tone(t, { type: "sine", frequency: 150, peak: 0.85, decay: 0.28 });
      osc.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    },
    snare: (t) => {
      noise(t, { type: "bandpass", frequency: 1900, q: 0.6, peak: 0.32, decay: 0.16 });
      tone(t, { type: "triangle", frequency: 190, peak: 0.18, decay: 0.08 });
    },
    hat: (t, accent) =>
      noise(t, {
        type: "highpass",
        frequency: 7500,
        peak: accent ? 0.09 : 0.05,
        decay: accent ? 0.05 : 0.03,
      }),
    bass: (t, midi, length) =>
      tone(t, {
        type: "sawtooth",
        frequency: frequencyOf(midi),
        peak: 0.2,
        decay: length,
        filter: 520,
      }),
    pad: (t, chord, length) => {
      for (const midi of chord) {
        tone(t, {
          type: "triangle",
          frequency: frequencyOf(midi),
          peak: 0.035,
          attack: 0.08,
          decay: length,
          filter: 1400,
        });
      }
    },
    arp: (t, midi) =>
      tone(t, {
        type: "square",
        frequency: frequencyOf(midi + 12),
        peak: 0.025,
        decay: 0.12,
        filter: 2600,
      }),
    // A letter typed on time: a bright pluck from the chord playing
    pluck: (t, midi, bright) =>
      tone(t, {
        type: "triangle",
        frequency: frequencyOf(midi + (bright ? 24 : 12)),
        peak: 0.13,
        decay: 0.3,
      }),
    // A letter missed: a dull thud
    thud: (t) => {
      const osc = tone(t, { type: "sine", frequency: 110, peak: 0.25, decay: 0.12 });
      osc.frequency.exponentialRampToValueAtTime(55, t + 0.1);
    },
    click: (t, accent) =>
      tone(t, {
        type: "sine",
        frequency: accent ? 1760 : 1320,
        peak: 0.25,
        decay: 0.05,
      }),
  };
};

// The silent stand-in: a clock and nothing else
const silentPlayer = (track) => {
  const { durationMs } = trackTimeline(track);
  let startedAt = null;
  return {
    start: (delayMs = 0) => {
      startedAt = performance.now() + delayMs;
    },
    now: () => (startedAt === null ? -Infinity : performance.now() - startedAt),
    hit: () => {},
    miss: () => {},
    stop: () => {
      startedAt = null;
    },
    durationMs,
    audible: false,
  };
};

// A player for `track`. start() begins it a moment later; now() is the
// time in the song, in ms, as it's heard (the output's latency taken off).
// `pattern: false` plays only a click on every beat, for the calibration.
export const createPlayer = (track, { volume = 1, pattern = true } = {}) => {
  const ctx = getAudioContext();
  if (!ctx) return silentPlayer(track);

  const timeline = trackTimeline(track);
  const stepS = timeline.beatMs / 1000 / STEPS_PER_BEAT;
  const totalSteps = timeline.totalBeats * STEPS_PER_BEAT;
  const stepsPerBar = BEATS_PER_BAR * STEPS_PER_BEAT;
  const lastBar = timeline.totalBeats / BEATS_PER_BAR - 1;

  const master = ctx.createGain();
  master.gain.value = 0.7 * volume;
  const compressor = ctx.createDynamicsCompressor();
  master.connect(compressor);
  compressor.connect(ctx.destination);
  const play = instruments(ctx, master);

  let startAt = null;
  let nextStep = 0;
  let timer = null;

  const at = (pattern, step) => pattern[step % stepsPerBar] === "x";

  const scheduleStep = (step, t) => {
    const bar = Math.floor(step / stepsPerBar);
    const inBar = step % stepsPerBar;
    const chord = bar % track.chords.length;

    if (!pattern) {
      if (inBar % STEPS_PER_BEAT === 0) play.click(t, inBar === 0);
      return;
    }

    // The last bar: one chord and one kick to land on, then quiet
    if (bar === lastBar) {
      if (inBar === 0) {
        play.kick(t);
        play.pad(t, track.chords[0], timeline.beatMs / 250);
        play.bass(t, track.bass[0], timeline.beatMs / 400);
      }
      return;
    }
    // The first bar: just the beat, to count in on
    if (bar < INTRO_BARS - 1) {
      if (inBar % STEPS_PER_BEAT === 0) play.kick(t);
      if (at(track.hat, step)) play.hat(t, false);
      return;
    }

    if (at(track.kick, step)) play.kick(t);
    if (at(track.snare, step)) play.snare(t);
    if (at(track.hat, step)) play.hat(t, inBar % STEPS_PER_BEAT === 2);
    if (inBar === 0) play.pad(t, track.chords[chord], stepS * stepsPerBar * 0.95);
    const bassNote = track.bassPattern[inBar];
    if (bassNote !== ".") {
      const root = track.bass[chord];
      const midi = bassNote === "o" ? root + 12 : bassNote === "5" ? root + 7 : root;
      play.bass(t, midi, stepS * 1.8);
    }
    const arpNote = track.arp[inBar];
    if (arpNote !== "." && bar >= INTRO_BARS) {
      play.arp(t, track.chords[chord][Number(arpNote)]);
    }
  };

  const tick = () => {
    const horizon = ctx.currentTime + LOOKAHEAD_S;
    while (nextStep < totalSteps && startAt + nextStep * stepS < horizon) {
      scheduleStep(nextStep, startAt + nextStep * stepS);
      nextStep++;
    }
    if (nextStep >= totalSteps) {
      clearInterval(timer);
      timer = null;
    }
  };

  // What's heard lags what's scheduled by the output's latency
  const latency = () => ctx.outputLatency || ctx.baseLatency || 0;

  const chordAt = (ms) =>
    track.chords[
      Math.floor(ms / (timeline.beatMs * BEATS_PER_BAR)) % track.chords.length
    ];

  return {
    start: (delayMs = 120) => {
      if (ctx.state === "suspended") ctx.resume();
      startAt = ctx.currentTime + delayMs / 1000;
      nextStep = 0;
      tick();
      timer = setInterval(tick, TICK_MS);
    },
    now: () => {
      if (startAt === null) return -Infinity;
      // What's being heard right now, smoothed between the audio clock's
      // own updates; the plain clock less the latency where there's no
      // timestamp to go by
      const stamp = ctx.getOutputTimestamp?.();
      if (stamp?.performanceTime > 0) {
        const heard =
          stamp.contextTime + (performance.now() - stamp.performanceTime) / 1000;
        return (heard - startAt) * 1000;
      }
      return (ctx.currentTime - startAt - latency()) * 1000;
    },
    // `which`: the letter's place in its word, to walk up the chord
    hit: (ms, which = 0, bright = false) => {
      if (startAt === null) return;
      const chord = chordAt(Math.max(0, ms));
      play.pluck(ctx.currentTime, chord[which % chord.length], bright);
    },
    miss: () => {
      if (startAt !== null) play.thud(ctx.currentTime);
    },
    stop: () => {
      clearInterval(timer);
      timer = null;
      startAt = null;
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0.0001, now + 0.15);
      setTimeout(() => master.disconnect(), 300);
    },
    durationMs: timeline.durationMs,
    audible: true,
  };
};
