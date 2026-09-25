import { reactive } from "vue";
import { locale } from "@/shared/i18n";

// Things a screen reader should say that only ever show up visually: the
// results, a toast, the coach. LiveAnnouncer.vue renders the two regions
// these fill; `assertive` interrupts, `polite` waits its turn.
//
// Each message is added as its own line rather than replacing the last, so
// two that arrive together (the results, then a toast) are both read. A
// line is taken out again once it's surely been read.
export const announcements = reactive({ polite: [], assertive: [] });

const KEEP_MS = 10_000;
let nextId = 0;

export const announce = (message, { assertive = false } = {}) => {
  if (!message) return;
  const lines = announcements[assertive ? "assertive" : "polite"];
  const line = { id: nextId++, text: message };
  // Added on the next frame: a region that's just appeared, or a line
  // identical to one just taken out, is otherwise easy to miss
  requestAnimationFrame(() => lines.push(line));
  setTimeout(() => {
    const index = lines.indexOf(line);
    if (index !== -1) lines.splice(index, 1);
  }, KEEP_MS);
};

// "¡Logro desbloqueado!", "Veloz", "30 wpm" -> "¡Logro desbloqueado! Veloz.
// 30 wpm." -- a period only where the piece doesn't already end a sentence
export const sentences = (pieces) =>
  pieces
    .filter(Boolean)
    .map((piece) => (/[.!?…]$/.test(piece) ? piece : `${piece}.`))
    .join(" ");

// "64,5" in Spanish, "64.5" in English: read out the way each says it
export const spokenNumber = (value, decimals = 0) => {
  const fixed = Number(value).toFixed(decimals);
  return locale.value === "es" ? fixed.replace(".", ",") : fixed;
};
