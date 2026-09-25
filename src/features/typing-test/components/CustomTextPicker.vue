<template>
  <!--
    "Mi texto" in the settings bar: one chip with the text picked, opening
    the whole list. A strip of names -- like the other modes' settings --
    squeezed them into "Hol…" at two and would lose them at twenty.
  -->
  <div ref="root" class="relative flex-shrink-0">
    <button
      v-if="configStore.selectedCustomText"
      type="button"
      class="flex max-w-56 items-center gap-1.5 rounded-xl border-2 px-2.5 py-1 text-xs font-extrabold transition-[background-color,border-color,color] duration-200"
      :class="
        open
          ? 'border-primary bg-primary-tint text-primary'
          : 'border-faded-gray/60 text-charcoal hover:border-primary/50'
      "
      :aria-expanded="open"
      aria-haspopup="listbox"
      :title="configStore.selectedCustomText.name"
      @click="open = !open"
    >
      <DocumentTextIcon class="w-4 h-4 flex-shrink-0 text-primary" />
      <span class="truncate">{{ configStore.selectedCustomText.name }}</span>
      <ChevronDownIcon
        class="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200"
        :class="{ 'rotate-180': open }"
      />
    </button>
    <button
      v-else
      type="button"
      class="flex items-center gap-1 rounded-xl border-2 border-primary/50 px-2.5 py-1 text-xs font-extrabold text-primary transition-[background-color,scale] duration-200 ease-spring hover:bg-primary-tint active:scale-95"
      @click="configStore.openCustomEditor()"
    >
      <PlusIcon class="w-4 h-4" />
      {{ t("typing.customText.add") }}
    </button>

    <Transition
      enter-active-class="transition-[opacity,translate] duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="absolute right-0 top-full z-40 mt-3 w-72 rounded-card border-2 border-faded-gray bg-paper-white p-2 shadow-xl"
      >
        <ul role="listbox" aria-label="Tus textos" class="max-h-72 overflow-y-auto">
          <li
            v-for="entry in configStore.customTexts"
            :key="entry.id"
            role="option"
            :aria-selected="entry.id === configStore.selectedCustomText?.id"
            class="group flex items-center gap-1 rounded-xl transition-colors duration-150"
            :class="
              entry.id === configStore.selectedCustomText?.id
                ? 'bg-primary-tint'
                : 'hover:bg-faded-gray/20'
            "
          >
            <button
              type="button"
              class="min-w-0 flex-1 px-3 py-2 text-left"
              @click="pick(entry.id)"
            >
              <div
                class="truncate text-sm font-extrabold"
                :class="
                  entry.id === configStore.selectedCustomText?.id
                    ? 'text-primary'
                    : 'text-charcoal'
                "
              >
                {{ entry.name }}
              </div>
              <div class="text-[11px] font-bold text-pencil-gray">
                {{ countWords(entry.text) }} palabras
              </div>
            </button>
            <button
              type="button"
              class="mr-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-pencil-gray transition-colors duration-150 hover:bg-paper-white hover:text-primary"
              :aria-label="t('typing.customText.editNamed', entry.name)"
              :title="t('typing.customText.editNamed', entry.name)"
              @click="edit(entry.id)"
            >
              <PencilSquareIcon class="w-4 h-4" />
            </button>
          </li>
        </ul>

        <div class="mt-1 border-t-2 border-faded-gray/60 pt-1">
          <button
            v-if="configStore.customTexts.length < MAX_CUSTOM_TEXTS"
            type="button"
            class="flex w-full items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-extrabold text-primary transition-colors duration-150 hover:bg-primary-tint"
            @click="edit(null)"
          >
            <PlusIcon class="w-4 h-4" />
            {{ t("typing.customText.new") }}
          </button>
          <p v-else class="px-3 py-2 text-xs font-bold text-pencil-gray">
            {{ t("typing.customText.limit", MAX_CUSTOM_TEXTS) }}
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { t } from "@/shared/i18n";
import { ref, onMounted, onUnmounted } from "vue";
import {
  DocumentTextIcon,
  ChevronDownIcon,
  PencilSquareIcon,
  PlusIcon,
} from "@heroicons/vue/24/outline";
import { useConfigStore } from "@/features/typing-test/store";
import { countWords, MAX_CUSTOM_TEXTS } from "@/features/typing-test/content/customTexts";

const configStore = useConfigStore();
const open = ref(false);
const root = ref(null);

const pick = (id) => {
  configStore.selectCustomText(id);
  open.value = false;
};

const edit = (id) => {
  open.value = false;
  configStore.openCustomEditor(id);
};

const handlePointerDown = (event) => {
  if (open.value && !root.value?.contains(event.target)) open.value = false;
};
const handleKeydown = (event) => {
  if (event.key === "Escape") open.value = false;
};

onMounted(() => {
  document.addEventListener("pointerdown", handlePointerDown);
  document.addEventListener("keydown", handleKeydown);
});
onUnmounted(() => {
  document.removeEventListener("pointerdown", handlePointerDown);
  document.removeEventListener("keydown", handleKeydown);
});
</script>
