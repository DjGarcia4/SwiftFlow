import { t } from "@/shared/i18n";

// What levels unlock: an accent color for the whole app, a caret style,
// and a keystroke sound. Each kind has a default everyone starts with.
// Pure data -- the stores and components turn the ids into colors, styles
// and sounds.
//
// No green or red accent: those already mean "right" and "wrong" all over
// the app.

export const REWARDS = [
  { id: "orange", kind: "accent", level: 1 },
  { id: "bar", kind: "caret", level: 1 },
  { id: "soft", kind: "sound", level: 1 },

  { id: "sky", kind: "accent", level: 3 },
  { id: "block", kind: "caret", level: 4 },
  { id: "mechanical", kind: "sound", level: 5 },
  { id: "violet", kind: "accent", level: 7 },
  { id: "underline", kind: "caret", level: 8 },
  { id: "typewriter", kind: "sound", level: 10 },
  { id: "rose", kind: "accent", level: 12 },
  { id: "glow", kind: "caret", level: 14 },
  { id: "bubble", kind: "sound", level: 16 },
  { id: "indigo", kind: "accent", level: 20 },
  { id: "wood", kind: "sound", level: 25 },
  { id: "amber", kind: "accent", level: 30 },
  { id: "fuchsia", kind: "accent", level: 40 },
  { id: "rainbow", kind: "caret", level: 50 },
];

// Named in the current language
for (const reward of REWARDS) {
  Object.defineProperty(reward, "label", {
    get: () => t(`history.rewards.labels.${reward.id}`),
    enumerable: true,
  });
}

export const REWARD_KINDS = ["accent", "caret", "sound"];

// Each accent's light-mode 500, for swatches (style.css has the full set,
// for both modes)
export const ACCENT_SWATCHES = {
  orange: "#f97316",
  sky: "#0ea5e9",
  violet: "#8b5cf6",
  rose: "#f43f5e",
  indigo: "#6366f1",
  amber: "#f59e0b",
  fuchsia: "#d946ef",
};

export const KIND_NAMES = {
  get accent() {
    return t("history.rewards.kinds.accent");
  },
  get caret() {
    return t("history.rewards.kinds.caret");
  },
  get sound() {
    return t("history.rewards.kinds.sound");
  },
};

export const DEFAULT_REWARDS = { accent: "orange", caret: "bar", sound: "soft" };

export const rewardsOfKind = (kind) => REWARDS.filter((reward) => reward.kind === kind);

export const isUnlocked = (reward, level) => level >= reward.level;

// What a chosen id actually gives at this level: itself if it's a real,
// unlocked reward of that kind, otherwise the default -- a history cleared
// back to level 1 shouldn't leave a level-40 color on.
export const effectiveReward = (kind, id, level) => {
  const reward = REWARDS.find((r) => r.kind === kind && r.id === id);
  return reward && isUnlocked(reward, level) ? reward.id : DEFAULT_REWARDS[kind];
};

// What reaching `to` from `from` unlocked, for the level-up toast
export const rewardsUnlockedBetween = (from, to) =>
  REWARDS.filter((reward) => reward.level > from && reward.level <= to);

// The next thing still to earn, for "a qué apuntar"
export const nextReward = (level) =>
  REWARDS.find((reward) => reward.level > level) ?? null;
