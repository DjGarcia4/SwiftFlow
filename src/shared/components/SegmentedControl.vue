<template>
  <!--
    One choice out of a few, drawn as a single strip with the chosen option
    filled -- lighter than a row of separate bordered buttons, and it reads
    as one setting rather than many.
  -->
  <div
    role="radiogroup"
    :aria-label="label"
    class="inline-flex flex-shrink-0 items-center gap-0.5 rounded-xl bg-faded-gray/25 p-1"
  >
    <button
      v-for="option in options"
      :key="String(option.value)"
      type="button"
      role="radio"
      :aria-checked="option.value === modelValue"
      :aria-label="option.label"
      :title="compactLabels && option.icon ? option.label : undefined"
      class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-extrabold whitespace-nowrap transition-[background-color,color,box-shadow,scale] duration-200 ease-spring active:scale-95"
      :class="
        option.value === modelValue
          ? 'bg-primary text-white shadow-sm shadow-primary/30'
          : 'text-pencil-gray hover:bg-paper-white hover:text-charcoal'
      "
      @click="emit('select', option.value)"
    >
      <template v-if="option.icon">
        <span
          v-if="typeof option.icon === 'string'"
          class="flex w-4 h-4 items-center justify-center text-sm font-extrabold"
          >{{ option.icon }}</span
        >
        <component :is="option.icon" v-else class="w-4 h-4 flex-shrink-0" />
      </template>
      <span :class="{ 'hidden lg:inline': compactLabels && option.icon }">{{
        option.label
      }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  // [{ value, label, icon? }] -- icon is a component, or a short string
  // drawn as a glyph
  options: { type: Array, required: true },
  modelValue: { type: [String, Number, null], default: null },
  // What the group is, for screen readers
  label: { type: String, default: "" },
  // Below lg, options with an icon show only the icon (label as tooltip)
  compactLabels: { type: Boolean, default: false },
});

const emit = defineEmits(["select"]);
</script>
