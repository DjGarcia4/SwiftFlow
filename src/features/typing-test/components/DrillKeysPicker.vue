<template>
  <!-- Picking the drill's target keys, laid out the way the keyboard is -->
  <div class="flex flex-col items-center gap-1">
    <div v-for="(row, rowIndex) in DRILL_ROWS" :key="rowIndex" class="flex gap-1">
      <IconButton
        v-for="key in row"
        :key="key"
        :value="key"
        :variant="configStore.drillKeys.includes(key) ? 'primary' : 'secondary'"
        size="xs"
        :text="key.toUpperCase()"
        @click="toggleDrillKey(key)"
      />
    </div>
    <button
      v-if="configStore.drillKeys.length"
      type="button"
      class="mt-1 text-xs font-bold text-pencil-gray underline underline-offset-2 transition-colors duration-200 hover:text-primary"
      @click="configStore.handleDrillKeys([])"
    >
      {{ t("typing.drillKeys.backToWeakest") }}
    </button>
  </div>
</template>

<script setup>
import { t } from "@/shared/i18n";
import IconButton from "@/shared/components/IconButton.vue";
import { useConfigStore } from "@/features/typing-test/store";

const configStore = useConfigStore();

// Laid out the way the keyboard is, so picking a key is a glance and not a
// hunt through a 27-letter run-on
const DRILL_ROWS = ["qwertyuiop", "asdfghjklñ", "zxcvbnm"].map((row) => [...row]);

// An empty list means "work them out from my history" -- the same keys the
// history panel suggests practicing.
const toggleDrillKey = (key) => {
  const current = configStore.drillKeys;
  configStore.handleDrillKeys(
    current.includes(key) ? current.filter((k) => k !== key) : [...current, key]
  );
};
</script>
