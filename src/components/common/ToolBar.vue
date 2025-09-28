<template>
  <div
    class="bg-gradient-to-br from-slate-800/40 to-slate-900/60 rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-5 border border-slate-600/30 backdrop-blur-2xl hover:border-gray-500 transition-all duration-300"
  >
    <!-- Mobile Layout (stacked) -->
    <div class="flex flex-col gap-3 sm:hidden">
      <!-- Type selection -->
      <div class="flex items-center justify-center gap-2">
        <IconButton
          v-for="type in configStore.types"
          :value="type"
          :key="type"
          :icon="type === 'time' ? 'clock' : 'letter'"
          :variant="configStore.type === type ? 'primary' : 'secondary'"
          size="sm"
          :text="`${type == 'time' ? 'Tiempo' : 'Palabras'}`"
          @click="configStore.handleType(type)"
        />
      </div>

      <!-- Divisor -->
      <div class="h-px w-full bg-gray-500"></div>

      <!-- Value selection -->
      <div class="flex items-center justify-center gap-2">
        <IconButton
          v-if="configStore.type === 'time'"
          v-for="time in configStore.times"
          :value="time"
          :key="time"
          :variant="configStore.selectedTime === time ? 'primary' : 'secondary'"
          size="sm"
          :text="`${time}s`"
          @click="configStore.handleTime(time)"
        />
        <IconButton
          v-if="configStore.type === 'words'"
          v-for="word in configStore.words"
          :value="word"
          :key="word"
          :variant="
            configStore.selectedWords === word ? 'primary' : 'secondary'
          "
          size="sm"
          :text="`${word} `"
          @click="configStore.handleWords(word)"
        />
      </div>
    </div>

    <!-- Desktop Layout (horizontal) -->
    <div class="hidden sm:flex items-center justify-center gap-2 lg:gap-4">
      <!-- Type selection -->
      <div class="flex items-center gap-2">
        <IconButton
          v-for="type in configStore.types"
          :value="type"
          :key="type"
          :icon="type === 'time' ? 'clock' : 'letter'"
          :variant="configStore.type === type ? 'primary' : 'secondary'"
          size="sm"
          :text="`${type == 'time' ? 'Tiempo' : 'Palabras'}`"
          @click="configStore.handleType(type)"
        />
      </div>

      <!-- Divisor -->
      <div class="h-4 w-px bg-gray-500"></div>

      <!-- Value selection -->
      <div class="flex items-center gap-2">
        <IconButton
          v-if="configStore.type === 'time'"
          v-for="time in configStore.times"
          :value="time"
          :key="time"
          :variant="configStore.selectedTime === time ? 'primary' : 'secondary'"
          size="sm"
          :text="`${time}s`"
          @click="configStore.handleTime(time)"
        />
        <IconButton
          v-if="configStore.type === 'words'"
          v-for="word in configStore.words"
          :value="word"
          :key="word"
          :variant="
            configStore.selectedWords === word ? 'primary' : 'secondary'
          "
          size="sm"
          :text="`${word} `"
          @click="configStore.handleWords(word)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import IconButton from "@/components/common/IconButton.vue";
import { useConfigStore } from "@/stores/config";

const configStore = useConfigStore();
</script>

<style scoped></style>
