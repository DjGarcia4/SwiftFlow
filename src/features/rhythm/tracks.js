// The songs of "Ritmo", written here as data and played by synth.js: no
// audio files, nothing anyone else holds the rights to. Each one is a loop
// of four chords with its drums, bass and an arpeggio on top, at its own
// tempo -- from a slow night walk to a sprint.
//
// Patterns are 16 steps a bar (sixteenth notes): "x" plays, "." rests. In
// the bass, "x" is the chord's root, "o" the octave above and "5" its fifth.
// The arpeggio's digits are which note of the chord (0, 1, 2) to play.

// Bars before the first letter lands: one to hear the beat, one more while
// the first notes fall into view
export const INTRO_BARS = 2;
// One bar after the last letter, to land the song
export const OUTRO_BARS = 1;
export const BEATS_PER_BAR = 4;

export const TRACKS = [
  {
    id: "calma",
    bpm: 84,
    bars: 20,
    chords: [
      [57, 60, 64], // Am
      [57, 60, 65], // F
      [55, 60, 64], // C
      [55, 59, 62], // G
    ],
    bass: [45, 41, 48, 43],
    kick: "x.........x.....",
    snare: "....x.......x...",
    hat: "x.x.x.x.x.x.x.x.",
    bassPattern: "x.......x...5...",
    arp: "0...1...2...1...",
  },
  {
    id: "pulso",
    bpm: 104,
    bars: 26,
    chords: [
      [57, 62, 65], // Dm
      [58, 62, 65], // Bb
      [57, 60, 65], // F
      [55, 60, 64], // C
    ],
    bass: [38, 46, 41, 48],
    kick: "x.....x...x.....",
    snare: "....x.......x..x",
    hat: "x.xxx.x.x.xxx.x.",
    bassPattern: "x..x..o...x.5..o",
    arp: "0.1.2.1.0.1.2.1.",
  },
  {
    id: "neon",
    bpm: 124,
    bars: 32,
    chords: [
      [59, 64, 67], // Em
      [60, 64, 67], // C
      [59, 62, 67], // G
      [57, 62, 66], // D
    ],
    bass: [40, 48, 43, 50],
    kick: "x...x...x...x...",
    snare: "....x.......x...",
    hat: "..x...x...x...x.",
    bassPattern: "x.o.x.o.x.o.x.o.",
    arp: "0120120120120120",
  },
  {
    id: "turbo",
    bpm: 148,
    bars: 40,
    chords: [
      [60, 63, 67], // Cm
      [60, 63, 68], // Ab
      [58, 63, 67], // Eb
      [58, 62, 65], // Bb
    ],
    bass: [36, 44, 39, 46],
    kick: "x.........x.x...",
    snare: "....x.......x...",
    hat: "xxxxxxxxxxxxxxxx",
    bassPattern: "x.x...x.x.o...5.",
    arp: "0.2.1.2.0.2.1.2.",
  },
];

export const TRACK_IDS = TRACKS.map((track) => track.id);

export const isTrackId = (id) => TRACK_IDS.includes(id);

export const trackById = (id) => TRACKS.find((track) => track.id === id) ?? TRACKS[0];

// When things happen in a track, in milliseconds from its first beat
export const trackTimeline = (track) => {
  const beatMs = 60000 / track.bpm;
  const firstBeat = INTRO_BARS * BEATS_PER_BAR;
  const playBeats = track.bars * BEATS_PER_BAR;
  const totalBeats = (INTRO_BARS + track.bars + OUTRO_BARS) * BEATS_PER_BAR;
  return {
    beatMs,
    firstBeat,
    playBeats,
    totalBeats,
    // Where the letters start and stop landing
    playStartMs: firstBeat * beatMs,
    playEndMs: (firstBeat + playBeats) * beatMs,
    durationMs: totalBeats * beatMs,
  };
};
