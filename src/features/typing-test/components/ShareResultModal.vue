<template>
  <Transition
    enter-active-class="transition-all duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="open"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-night-ink/40 p-4"
      @click.self="$emit('close')"
    >
      <Transition
        appear
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-4 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-4 scale-95"
      >
        <div
          v-if="open"
          class="w-full max-w-sm bg-paper-white rounded-card border-2 border-faded-gray p-4 sm:p-6"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-bold text-charcoal">Compartir resultado</span>
            <IconButton
              icon="close"
              variant="secondary"
              size="xs"
              tooltip="Cerrar"
              @click="$emit('close')"
            />
          </div>

          <img
            v-if="imageUrl"
            :src="imageUrl"
            alt="Vista previa del resultado a compartir"
            class="w-full rounded-xl border-2 border-faded-gray mb-4"
          />

          <div class="flex gap-2 justify-center">
            <ButtonCustom
              text="Descargar"
              variant="secondary"
              @click="$emit('download')"
            />
            <ButtonCustom
              v-if="canNativeShare"
              text="Compartir"
              variant="primary"
              @click="$emit('share')"
            />
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import IconButton from "@/shared/components/IconButton.vue";
import ButtonCustom from "@/shared/components/ButtonCustom.vue";

defineProps({
  open: { type: Boolean, default: false },
  imageUrl: { type: String, default: null },
  canNativeShare: { type: Boolean, default: false },
});

defineEmits(["close", "download", "share"]);
</script>
