<template>
  <div class="p-6 space-y-6">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <ToolBar v-if="!isTyping" />
    </Transition>
    <ParagraphToType />
  </div>
</template>

<script setup>
import { computed } from "vue";
import ParagraphToType from "@/components/ParagraphToType.vue";
import ToolBar from "@/components/common/ToolBar.vue";
import { useConfigStore } from "@/stores/config";

const configStore = useConfigStore();

// Hide ToolBar when user is actively typing (but show when paused)
const isTyping = computed(() => {
  return (
    configStore.userInput.length > 0 &&
    !configStore.isCompleted &&
    !configStore.isPaused
  );
});
</script>

<style scoped></style>
