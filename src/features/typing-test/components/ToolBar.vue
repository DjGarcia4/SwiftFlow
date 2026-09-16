<template>
  <div class="bg-paper-white rounded-card p-3 sm:p-4 lg:p-5 border-2 border-faded-gray">
    <!-- Mobile Layout (stacked) -->
    <div class="flex flex-col gap-3 sm:hidden">
      <!-- Content type selection (code is always typed as-is) -->
      <template v-if="configStore.type !== 'code'">
        <div class="flex flex-wrap items-center justify-center gap-2">
          <IconButton
            v-for="contentType in configStore.contentTypes"
            :key="contentType"
            :value="contentType"
            :icon="contentType === 'punctuation' ? 'punctuation' : 'number'"
            :variant="
              configStore.selectedContentTypes === contentType ? 'primary' : 'secondary'
            "
            size="sm"
            :text="`${contentType == 'punctuation' ? 'Puntuación' : 'Números'}`"
            @click="configStore.handleContentTypes(contentType)"
          />
        </div>

        <!-- Divisor -->
        <div class="h-px w-full bg-faded-gray"></div>
      </template>

      <!-- Type selection -->
      <div class="flex flex-wrap items-center justify-center gap-2">
        <IconButton
          v-for="type in configStore.types"
          :key="type"
          :value="type"
          :icon="typeMeta[type].icon"
          :variant="configStore.type === type ? 'primary' : 'secondary'"
          size="sm"
          :text="typeMeta[type].label"
          @click="configStore.handleType(type)"
        />
      </div>

      <!-- Value selection (no limit to pick in zen mode) -->
      <template
        v-if="
          configStore.type === 'time' ||
          configStore.type === 'words' ||
          configStore.type === 'numbers' ||
          configStore.type === 'code'
        "
      >
        <!-- Divisor -->
        <div class="h-px w-full bg-faded-gray"></div>

        <div
          :key="configStore.type"
          class="flex flex-wrap items-center justify-center gap-2 animate-rise [animation-duration:400ms]"
        >
          <template v-if="configStore.type === 'time'">
            <IconButton
              v-for="time in configStore.times"
              :key="time"
              :value="time"
              :variant="configStore.selectedTime === time ? 'primary' : 'secondary'"
              size="sm"
              :text="`${time}s`"
              @click="configStore.handleTime(time)"
            />
          </template>
          <template v-if="configStore.type === 'words' || configStore.type === 'numbers'">
            <IconButton
              v-for="word in configStore.words"
              :key="word"
              :value="word"
              :variant="configStore.selectedWords === word ? 'primary' : 'secondary'"
              size="sm"
              :text="`${word} `"
              @click="configStore.handleWords(word)"
            />
          </template>
          <template v-if="configStore.type === 'code'">
            <IconButton
              :variant="!configStore.selectedCodeLanguage ? 'primary' : 'secondary'"
              size="sm"
              text="Todos"
              @click="configStore.handleCodeLanguage(null)"
            />
            <IconButton
              v-for="language in configStore.languages"
              :key="language"
              :value="language"
              :variant="
                configStore.selectedCodeLanguage === language ? 'primary' : 'secondary'
              "
              size="sm"
              :text="language"
              @click="configStore.handleCodeLanguage(language)"
            />
          </template>
        </div>
      </template>
    </div>

    <!-- Desktop Layout (horizontal, always a single line — scrolls sideways
         on narrow windows instead of wrapping to a second row) -->
    <div
      class="hidden sm:flex flex-nowrap items-center justify-center gap-1.5 lg:gap-3 overflow-x-auto"
    >
      <!-- Type content (code is always typed as-is) -->
      <template v-if="configStore.type !== 'code'">
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <IconButton
            v-for="type in configStore.contentTypes"
            :key="type"
            :value="type"
            :icon="type === 'punctuation' ? 'punctuation' : 'number'"
            :variant="configStore.selectedContentTypes === type ? 'primary' : 'secondary'"
            size="xs"
            :text="`${type == 'punctuation' ? 'Puntuación' : 'Números'}`"
            @click="configStore.handleContentTypes(type)"
          />
        </div>

        <!-- Divisor -->
        <div class="h-4 w-px bg-faded-gray flex-shrink-0"></div>
      </template>
      <!-- Type selection -->
      <div class="flex items-center gap-1.5 flex-shrink-0">
        <IconButton
          v-for="type in configStore.types"
          :key="type"
          :value="type"
          :icon="typeMeta[type].icon"
          :variant="configStore.type === type ? 'primary' : 'secondary'"
          size="xs"
          :text="typeMeta[type].label"
          @click="configStore.handleType(type)"
        />
      </div>

      <!-- Value selection (no limit to pick in zen mode) -->
      <template
        v-if="
          configStore.type === 'time' ||
          configStore.type === 'words' ||
          configStore.type === 'numbers' ||
          configStore.type === 'code'
        "
      >
        <!-- Divisor -->
        <div class="h-4 w-px bg-faded-gray flex-shrink-0"></div>

        <div
          :key="configStore.type"
          class="flex items-center gap-1.5 flex-shrink-0 animate-rise [animation-duration:400ms]"
        >
          <template v-if="configStore.type === 'time'">
            <IconButton
              v-for="time in configStore.times"
              :key="time"
              :value="time"
              :variant="configStore.selectedTime === time ? 'primary' : 'secondary'"
              size="xs"
              :text="`${time}s`"
              @click="configStore.handleTime(time)"
            />
          </template>
          <template v-if="configStore.type === 'words' || configStore.type === 'numbers'">
            <IconButton
              v-for="word in configStore.words"
              :key="word"
              :value="word"
              :variant="configStore.selectedWords === word ? 'primary' : 'secondary'"
              size="xs"
              :text="`${word} `"
              @click="configStore.handleWords(word)"
            />
          </template>
          <template v-if="configStore.type === 'code'">
            <IconButton
              :variant="!configStore.selectedCodeLanguage ? 'primary' : 'secondary'"
              size="xs"
              text="Todos"
              @click="configStore.handleCodeLanguage(null)"
            />
            <IconButton
              v-for="language in configStore.languages"
              :key="language"
              :value="language"
              :variant="
                configStore.selectedCodeLanguage === language ? 'primary' : 'secondary'
              "
              size="xs"
              :text="language"
              @click="configStore.handleCodeLanguage(language)"
            />
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import IconButton from "@/shared/components/IconButton.vue";
import { useConfigStore } from "@/features/typing-test/store";

const configStore = useConfigStore();

// Icon + label for each typing mode
const typeMeta = {
  time: { icon: "clock", label: "Tiempo" },
  words: { icon: "letter", label: "Palabras" },
  numbers: { icon: "number", label: "Números" },
  quote: { icon: "quote", label: "Cita" },
  code: { icon: "code", label: "Código" },
  zen: { icon: "zen", label: "Zen" },
};
</script>

<style scoped></style>
