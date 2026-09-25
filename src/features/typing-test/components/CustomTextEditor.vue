<template>
  <!-- Adding or changing one of your own texts -->
  <div
    class="fixed inset-0 z-[60] flex items-center justify-center bg-night-ink/40 backdrop-blur-sm p-4"
    @click.self="close"
  >
    <form
      ref="dialog"
      class="w-full max-w-2xl rounded-card border-2 border-faded-gray bg-paper-white p-5 sm:p-6 shadow-xl animate-pop-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-text-title"
      @submit.prevent="save"
    >
      <div class="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2
            id="custom-text-title"
            class="font-display text-xl font-extrabold text-charcoal"
          >
            {{ editing ? t("typing.customText.edit") : t("typing.customText.new") }}
          </h2>
          <p class="text-xs font-bold text-pencil-gray">
            {{ t("typing.customText.intro") }}
          </p>
        </div>
        <button
          type="button"
          :aria-label="t('shared.close')"
          class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border-2 border-faded-gray text-pencil-gray transition-[color,background-color,scale] duration-200 ease-spring hover:bg-primary-tint/60 hover:text-primary active:scale-90"
          @click="close"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>

      <label
        class="mb-1 block text-xs font-bold uppercase tracking-wide text-pencil-gray"
        for="custom-text-name"
      >
        {{ t("typing.customText.name") }}
      </label>
      <input
        id="custom-text-name"
        ref="nameInput"
        v-model="name"
        type="text"
        :maxlength="MAX_CUSTOM_NAME_LENGTH"
        :placeholder="t('typing.customText.namePlaceholder')"
        class="mb-4 w-full rounded-xl border-2 border-faded-gray bg-paper-white px-3 py-2 text-sm font-bold text-charcoal outline-none transition-colors focus:border-primary"
      />

      <label
        class="mb-1 block text-xs font-bold uppercase tracking-wide text-pencil-gray"
        for="custom-text-body"
      >
        {{ t("typing.customText.text") }}
      </label>
      <textarea
        id="custom-text-body"
        v-model="text"
        rows="9"
        :maxlength="MAX_CUSTOM_TEXT_LENGTH"
        spellcheck="false"
        class="w-full resize-y rounded-xl border-2 border-faded-gray bg-paper-white px-3 py-2 font-mono text-sm text-charcoal outline-none transition-colors focus:border-primary"
      ></textarea>
      <div class="mt-1 flex justify-between text-[11px] font-bold text-pencil-gray">
        <span>{{ t("typing.customText.words", words) }}</span>
        <span>{{ text.length }}/{{ MAX_CUSTOM_TEXT_LENGTH }}</span>
      </div>

      <p v-if="problem" class="mt-3 text-sm font-bold text-danger" role="alert">
        {{ problem }}
      </p>

      <div class="mt-5 flex flex-wrap items-center justify-between gap-2">
        <button
          v-if="editing"
          type="button"
          class="text-xs font-bold transition-colors duration-200"
          :class="confirmingDelete ? 'text-danger' : 'text-pencil-gray hover:text-danger'"
          @click="remove"
        >
          {{
            confirmingDelete
              ? t("typing.customText.confirmDelete")
              : t("typing.customText.delete")
          }}
        </button>
        <span v-else></span>

        <div class="flex gap-2">
          <ButtonCustom
            :text="t('typing.customText.cancel')"
            variant="secondary"
            size="sm"
            @click="close"
          />
          <ButtonCustom
            :text="t('typing.customText.save')"
            variant="primary"
            size="sm"
            type="submit"
          />
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from "vue";
import { useModalFocus } from "@/shared/composables/useModalFocus";
import { t } from "@/shared/i18n";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import ButtonCustom from "@/shared/components/ButtonCustom.vue";
import { useConfigStore } from "@/features/typing-test/store";
import {
  countWords,
  MAX_CUSTOM_TEXT_LENGTH,
  MAX_CUSTOM_NAME_LENGTH,
} from "@/features/typing-test/content/customTexts";

const configStore = useConfigStore();

const editingId = configStore.customEditor?.id ?? null;
const existing = configStore.customTexts.find((entry) => entry.id === editingId) ?? null;
const editing = Boolean(existing);

const name = ref(existing?.name ?? "");
const text = ref(existing?.text ?? "");
const problem = ref("");
const words = computed(() => countWords(text.value));

const nameInput = ref(null);

const save = () => {
  problem.value =
    configStore.saveCustomText({
      id: existing?.id ?? null,
      name: name.value,
      text: text.value,
    }) ?? "";
};

const close = () => configStore.closeCustomEditor();

// Two steps, like clearing the history: a stray click shouldn't lose a text
const confirmingDelete = ref(false);
let confirmTimeout = null;
const remove = () => {
  if (!confirmingDelete.value) {
    confirmingDelete.value = true;
    confirmTimeout = setTimeout(() => {
      confirmingDelete.value = false;
    }, 3000);
    return;
  }
  configStore.deleteCustomText(existing.id);
};

// Mounted only while open; the name is what's filled in first
const dialog = ref(null);
useModalFocus({ open: true, container: dialog, onClose: close, initialFocus: nameInput });

onUnmounted(() => clearTimeout(confirmTimeout));
</script>
