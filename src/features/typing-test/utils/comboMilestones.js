// Motivational "you're on fire" pushes while typing: which combo lengths
// earn one, when to fire it, and what it says.

export const COMBO_MILESTONES = [25, 50, 100, 150, 200, 300, 400, 500, 750, 1000];

// Early milestones are easy to reach over and over (every time a combo
// restarts), so they only celebrate once per session to avoid spam. From
// here on, every run that gets there has genuinely earned it again.
const REPEATABLE_FROM = 100;

// Returns the milestone just reached, or null. Only a single new correct
// character counts (streak going up by exactly one): fixing a typo with
// backspace makes the streak jump straight back to where it was, and
// re-celebrating a combo you already had would feel off.
export const detectComboMilestone = (previousStreak, streak, celebratedOnce) => {
  if (streak !== previousStreak + 1) return null;
  if (!COMBO_MILESTONES.includes(streak)) return null;
  if (streak < REPEATABLE_FROM && celebratedOnce.has(streak)) return null;
  return streak;
};

const MESSAGES = [
  { from: 25, texts: ["¡Buen ritmo!", "¡Así se hace!", "¡Arrancaste con todo!"] },
  { from: 50, texts: ["¡Estás on fire!", "¡Qué manos!", "¡Seguí así!"] },
  { from: 100, texts: ["¡Imparable!", "¡Cien sin fallar!", "¡No hay quien te pare!"] },
  { from: 150, texts: ["¡Modo bestia!", "¡Estás en la zona!", "¡Qué precisión!"] },
  { from: 200, texts: ["¡Sos una máquina!", "¡Nivel leyenda!", "¡Increíble!"] },
  { from: 300, texts: ["¡Esto es otro nivel!", "¡Dedos de acero!", "¡Brutal!"] },
  { from: 500, texts: ["¡Inhumano!", "¡Estás volando!", "¡Histórico!"] },
  { from: 1000, texts: ["¡Dios del teclado!", "¡Mil sin un error!"] },
];

export const pickComboMessage = (milestone, random = Math.random) => {
  const tier = [...MESSAGES].reverse().find((m) => milestone >= m.from) ?? MESSAGES[0];
  return tier.texts[Math.floor(random() * tier.texts.length)];
};
