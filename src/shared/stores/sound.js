import { defineStore } from "pinia";
import { ref, watch } from "vue";
import {
  loadSoundSettings,
  saveSoundSettings,
} from "@/shared/utils/soundSettingsRepository";

export const useSoundStore = defineStore("sound", () => {
  const saved = loadSoundSettings();

  const soundEnabled = ref(saved.soundEnabled);
  const keystrokeSound = ref(saved.keystrokeSound);
  const errorSound = ref(saved.errorSound);
  const celebrationSound = ref(saved.celebrationSound);

  const settingsByKey = { soundEnabled, keystrokeSound, errorSound, celebrationSound };

  const toggle = (key) => {
    const target = settingsByKey[key];
    if (target) target.value = !target.value;
  };

  watch([soundEnabled, keystrokeSound, errorSound, celebrationSound], () => {
    saveSoundSettings({
      soundEnabled: soundEnabled.value,
      keystrokeSound: keystrokeSound.value,
      errorSound: errorSound.value,
      celebrationSound: celebrationSound.value,
    });
  });

  return {
    soundEnabled,
    keystrokeSound,
    errorSound,
    celebrationSound,
    toggle,
  };
});
