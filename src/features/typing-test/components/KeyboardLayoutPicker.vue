<template>
  <!-- Which keyboard you type on: what the drawn keyboards, the fingers and
       the tips are worked out for -->
  <span class="inline-flex items-center text-xs font-bold text-pencil-gray">
    <select
      aria-label="Distribución del teclado"
      :value="configStore.keyboardLayout"
      class="cursor-pointer rounded-lg bg-transparent px-1 py-0.5 font-bold text-pencil-gray hover:text-charcoal focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      :title="layout.note ?? 'Tu teclado'"
      @change="pick($event.target.value)"
    >
      <option v-for="option in KEYBOARD_LAYOUTS" :key="option.id" :value="option.id">
        {{ option.name }}
      </option>
    </select>
  </span>
</template>

<script setup>
import { computed } from "vue";
import { useConfigStore } from "@/features/typing-test/store";
import {
  KEYBOARD_LAYOUTS,
  layoutById,
} from "@/features/typing-test/utils/keyboardLayouts";

const emit = defineEmits(["picked"]);
const configStore = useConfigStore();
const layout = computed(() => layoutById(configStore.keyboardLayout));

const pick = (id) => {
  configStore.setKeyboardLayout(id);
  emit("picked", id);
};
</script>
