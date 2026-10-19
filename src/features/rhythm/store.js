import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { isTrackId, TRACK_IDS } from "./tracks";
import { isDifficultyId } from "./chart";

// What "Ritmo" remembers between visits: the song, the difficulty and the
// calibration. Its runs go to the history like any other.
const STORAGE_KEY = "swiftflow_rhythm_v1";

// The calibration can't go past this, either way: beyond it something
// other than latency is wrong
export const MAX_OFFSET_MS = 250;

const clampOffset = (ms) =>
  Math.max(-MAX_OFFSET_MS, Math.min(MAX_OFFSET_MS, Math.round(Number(ms) || 0)));

export const sanitizeRhythmSettings = (raw) => {
  const saved = raw && typeof raw === "object" ? raw : {};
  return {
    track: isTrackId(saved.track) ? saved.track : TRACK_IDS[0],
    difficulty: isDifficultyId(saved.difficulty) ? saved.difficulty : "normal",
    offset: clampOffset(saved.offset),
  };
};

const load = () => {
  try {
    return sanitizeRhythmSettings(JSON.parse(localStorage.getItem(STORAGE_KEY)));
  } catch {
    return sanitizeRhythmSettings(null);
  }
};

export const useRhythmStore = defineStore("rhythm", () => {
  const saved = load();
  const track = ref(saved.track);
  const difficulty = ref(saved.difficulty);
  // Added to every press: positive when your presses register late, so
  // they're moved earlier to meet the beat
  const offset = ref(saved.offset);

  watch([track, difficulty, offset], () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          track: track.value,
          difficulty: difficulty.value,
          offset: offset.value,
        })
      );
    } catch {
      // Storage blocked: remembered for this visit only
    }
  });

  const setTrack = (id) => {
    if (isTrackId(id)) track.value = id;
  };
  const setDifficulty = (id) => {
    if (isDifficultyId(id)) difficulty.value = id;
  };
  const setOffset = (ms) => {
    offset.value = clampOffset(ms);
  };

  return { track, difficulty, offset, setTrack, setDifficulty, setOffset };
});
