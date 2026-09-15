// Shared "getting hotter" color ramp: interpolates rgb through named stops,
// clamping outside the range. Gives escalating flame-colored feedback
// (amber -> orange -> red) wherever a streak grows — the live
// character-streak badge during typing, and the daily practice streak.
const lerp = (a, b, t) => a + (b - a) * t;

const interpolateStops = (value, stops) => {
  if (value <= stops[0].at) return stops[0].rgb;
  if (value >= stops[stops.length - 1].at) return stops[stops.length - 1].rgb;

  for (let i = 0; i < stops.length - 1; i++) {
    const from = stops[i];
    const to = stops[i + 1];
    if (value >= from.at && value <= to.at) {
      const t = (value - from.at) / (to.at - from.at);
      return [
        Math.round(lerp(from.rgb[0], to.rgb[0], t)),
        Math.round(lerp(from.rgb[1], to.rgb[1], t)),
        Math.round(lerp(from.rgb[2], to.rgb[2], t)),
      ];
    }
  }

  return stops[stops.length - 1].rgb;
};

// Character-typing streak (during an active session): amber right when the
// badge first appears at 15, ramping to red by an ~80-character streak.
const CHARACTER_STREAK_STOPS = [
  { at: 15, rgb: [245, 158, 11] }, // amber-500
  { at: 40, rgb: [249, 115, 22] }, // orange-500
  { at: 80, rgb: [220, 38, 38] }, // red-600
];

export const getCharacterStreakColorRgb = (streak) =>
  interpolateStops(streak, CHARACTER_STREAK_STOPS);

// Daily practice streak: amber from day one, orange by a week, red by a
// month — a scale sized for days instead of characters.
const DAILY_STREAK_STOPS = [
  { at: 1, rgb: [245, 158, 11] },
  { at: 7, rgb: [249, 115, 22] },
  { at: 30, rgb: [220, 38, 38] },
];

export const getDailyStreakColorRgb = (days) =>
  interpolateStops(days, DAILY_STREAK_STOPS);
