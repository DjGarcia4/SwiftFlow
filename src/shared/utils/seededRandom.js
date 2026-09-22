// A Math.random stand-in that gives the same sequence for the same seed:
// for anything that has to come out identical on every device, like the
// day's challenges or the week's shared text.

// FNV-1a: tiny, and spreads similar strings (consecutive dates, say) far
// enough apart that their sequences don't come out alike.
export const hashString = (text) => {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

// mulberry32
export const seededRandom = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Shorthand: a generator seeded from a string
export const randomFrom = (text) => seededRandom(hashString(text));
