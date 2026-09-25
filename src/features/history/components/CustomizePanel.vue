<template>
  <!--
    What levels unlock, and picking from it: a color for the whole app, a
    caret and a keystroke sound. Locked ones show what they'd be, and the
    level that earns them.
  -->
  <div class="space-y-5">
    <p v-if="upcoming" class="text-xs font-bold text-pencil-gray">
      {{ t("history.customize.nextUnlock") }}
      <span class="text-charcoal">{{
        t("history.customize.level", upcoming.level)
      }}</span>
      · {{ KIND_NAMES[upcoming.kind] }} {{ upcoming.label.toLowerCase() }}
    </p>

    <section v-for="kind in REWARD_KINDS" :key="kind">
      <div class="mb-2 text-xs font-bold uppercase tracking-wide text-pencil-gray">
        {{ KIND_NAMES[kind] }}
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="reward in rewardsOfKind(kind)"
          :key="reward.id"
          type="button"
          class="relative flex min-w-20 flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-2 transition-[border-color,background-color,scale] duration-200 ease-spring"
          :class="optionClass(reward)"
          :aria-pressed="customization[kind] === reward.id"
          :title="
            unlocked(reward)
              ? reward.label
              : t('history.customize.unlocksAt', reward.level)
          "
          @click="pick(reward)"
        >
          <!-- Accent: its color -->
          <span
            v-if="kind === 'accent'"
            class="h-6 w-6 rounded-full border-2 border-paper-white shadow"
            :style="{ backgroundColor: ACCENT_SWATCHES[reward.id] }"
          ></span>

          <!-- Caret: a word with that caret on it -->
          <span
            v-else-if="kind === 'caret'"
            class="relative font-mono text-sm font-bold text-charcoal"
            >ab<span class="relative inline-block"
              >c<span class="absolute" :class="CARET_PREVIEW[reward.id]"></span></span
          ></span>

          <!-- Sound: plays it, locked or not -- a taste of what's coming -->
          <SpeakerWaveIcon v-else class="h-5 w-5 text-primary" />

          <span class="text-[11px] font-bold text-charcoal">{{ reward.label }}</span>

          <span
            v-if="!unlocked(reward)"
            class="absolute -right-1.5 -top-1.5 flex items-center gap-0.5 rounded-full bg-charcoal px-1.5 py-0.5 text-[9px] font-extrabold text-paper-white"
          >
            <LockClosedIcon class="h-2.5 w-2.5" />
            {{ reward.level }}
          </span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { t } from "@/shared/i18n";
import { computed } from "vue";
import { LockClosedIcon, SpeakerWaveIcon } from "@heroicons/vue/24/outline";
import { useCustomizationStore } from "@/shared/stores/customization";
import {
  REWARD_KINDS,
  KIND_NAMES,
  rewardsOfKind,
  isUnlocked,
  nextReward,
  ACCENT_SWATCHES,
} from "@/features/history/utils/rewards";
import { playKeystrokeSound } from "@/shared/utils/sound";

const customization = useCustomizationStore();

// A small version of each caret, placed on the preview's last letter
const CARET_PREVIEW = {
  bar: "-left-0.5 top-0.5 bottom-0.5 w-0.5 rounded-full bg-primary",
  block: "inset-0 rounded-sm bg-primary/35",
  underline: "left-0 right-0 bottom-0 h-0.5 rounded-full bg-primary",
  glow: "-left-0.5 top-0.5 bottom-0.5 w-0.5 rounded-full bg-primary shadow-[0_0_6px_1px_var(--color-primary)]",
  rainbow:
    "-left-0.5 top-0.5 bottom-0.5 w-0.5 rounded-full bg-gradient-to-b from-rose-500 via-sky-500 to-violet-500",
};

const unlocked = (reward) => isUnlocked(reward, customization.level);
const upcoming = computed(() => nextReward(customization.level));

const optionClass = (reward) => {
  if (customization[reward.kind] === reward.id) return "border-primary bg-primary-tint";
  if (!unlocked(reward)) return "border-dashed border-faded-gray opacity-60";
  return "border-faded-gray hover:border-primary/50 hover:scale-105";
};

const pick = (reward) => {
  if (reward.kind === "sound") playKeystrokeSound(reward.id);
  if (unlocked(reward)) customization.choose(reward.kind, reward.id);
};
</script>
