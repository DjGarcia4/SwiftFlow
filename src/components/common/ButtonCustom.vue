<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    @click="handleClick"
    :type="type"
  >
    <slot name="icon" v-if="$slots.icon" class="mr-2">
      <!-- Icon slot -->
    </slot>
    <span v-if="loading" class="mr-2">
      <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
          fill="none"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </span>
    <slot>{{ text }}</slot>
  </button>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  text: {
    type: String,
    default: "",
  },
  variant: {
    type: String,
    default: "primary",
    validator: (value) => ["primary", "secondary"].includes(value),
  },
  size: {
    type: String,
    default: "md",
    validator: (value) => ["xs", "sm", "md", "lg", "xl"].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: "button",
    validator: (value) => ["button", "submit", "reset"].includes(value),
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["click"]);

const buttonClasses = computed(() => {
  const baseClasses = [
    "inline-flex",
    "items-center",
    "justify-center",
    "font-extrabold",
    "uppercase",
    "tracking-[0.04em]",
    "rounded-xl",
    "border-2",
    "border-b-[6px]",
    "transition-[transform,background-color,color,border-color,filter]",
    "duration-100",
    "ease-out",
    "focus-visible:outline",
    "focus-visible:outline-2",
    "focus-visible:outline-offset-2",
    "focus-visible:outline-primary",
    "disabled:opacity-40",
    "disabled:cursor-not-allowed",
    "disabled:hover:brightness-100",
    "disabled:active:translate-y-0",
    "disabled:active:border-b-[6px]",
    "cursor-pointer",
    "gap-2",
    "hover:brightness-105",
    "active:translate-y-[4px]",
    "active:border-b-2",
  ];

  const sizeClasses = {
    xs: "px-3.5 py-2 text-xs",
    sm: "px-5 py-2.5 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-4 py-2.5 text-sm sm:px-7 sm:py-4 sm:text-base",
    xl: "px-9 py-5 text-base",
  };

  const variantClasses = {
    primary: [
      "bg-primary",
      "text-white",
      "border-primary-dark",
    ],
    secondary: [
      "bg-paper-white",
      "text-primary",
      "border-faded-gray",
      "hover:bg-primary-tint/50",
    ],
  };

  if (props.fullWidth) {
    baseClasses.push("w-full");
  }

  return [
    ...baseClasses,
    sizeClasses[props.size],
    ...variantClasses[props.variant],
  ].join(" ");
});

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit("click", event);
  }
};
</script>
