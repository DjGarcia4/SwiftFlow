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
          configStore.type === 'code' ||
          configStore.type === 'drill'
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
          <template
            v-if="
              configStore.type === 'words' ||
              configStore.type === 'numbers' ||
              configStore.type === 'drill'
            "
          >
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
          configStore.type === 'code' ||
          configStore.type === 'drill'
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
          <template
            v-if="
              configStore.type === 'words' ||
              configStore.type === 'numbers' ||
              configStore.type === 'drill'
            "
          >
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

    <!-- The drill's target keys get a row of their own under the mode bar:
         a whole alphabet has no business inside a single-line toolbar, and
         most of the time there's nothing to choose anyway. -->
    <div
      v-if="configStore.type === 'drill'"
      class="mt-3 pt-3 border-t-2 border-faded-gray flex flex-col items-center gap-2"
    >
      <div class="flex flex-wrap items-center justify-center gap-1.5">
        <span class="text-xs font-bold text-pencil-gray">
          {{ targetKeys.length ? "Entrenando:" : "Todavía no sé qué te cuesta:" }}
        </span>

        <kbd
          v-for="key in targetKeys"
          :key="key"
          class="rounded-md border-2 border-primary/30 bg-primary-tint px-2 py-0.5 font-mono text-sm font-extrabold uppercase text-primary"
          >{{ key }}</kbd
        >
        <span v-if="!targetKeys.length" class="text-xs text-pencil-gray">
          elegí teclas o hacé unos tests primero
        </span>

        <IconButton
          :variant="editingKeys ? 'primary' : 'secondary'"
          size="xs"
          :text="editingKeys ? 'Listo' : 'Cambiar'"
          @click="editingKeys = !editingKeys"
        />
      </div>

      <div v-if="editingKeys" class="flex flex-col items-center gap-1 animate-rise">
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
          Volver a mis teclas más flojas
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import IconButton from "@/shared/components/IconButton.vue";
import { useConfigStore } from "@/features/typing-test/store";
import { useHistoryStore } from "@/features/history/store";
import { resolveDrillKeys } from "@/features/typing-test/utils/drillTargets";

const configStore = useConfigStore();
const historyStore = useHistoryStore();

// Icon + label for each typing mode
const typeMeta = {
  time: { icon: "clock", label: "Tiempo" },
  words: { icon: "letter", label: "Palabras" },
  numbers: { icon: "number", label: "Números" },
  quote: { icon: "quote", label: "Cita" },
  code: { icon: "code", label: "Código" },
  zen: { icon: "zen", label: "Zen" },
  drill: { icon: "target", label: "Entrenar" },
};

// Laid out the way the keyboard is, so picking a key is a glance and not a
// hunt through a 27-letter run-on
const DRILL_ROWS = ["qwertyuiop", "asdfghjklñ", "zxcvbnm"].map((row) => [...row]);

// The picker stays shut until asked for: the default targets are usually
// the right ones.
const editingKeys = ref(false);

// What the drill is actually aiming at right now -- hand-picked if there is
// a pick, otherwise whatever the history says is worth practicing.
const targetKeys = computed(() =>
  resolveDrillKeys(configStore.drillKeys, historyStore.results)
);

// An empty list means "work them out from my history" -- the same keys the
// history panel suggests practicing.
const toggleDrillKey = (key) => {
  const current = configStore.drillKeys;
  configStore.handleDrillKeys(
    current.includes(key) ? current.filter((k) => k !== key) : [...current, key]
  );
};
</script>

<style scoped></style>
