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

// Props
const props = defineProps({
  // Button text
  text: {
    type: String,
    default: "",
  },
  // Button variants
  variant: {
    type: String,
    default: "primary",
    validator: (value) =>
      ["primary", "secondary", "outline", "ghost", "danger"].includes(value),
  },
  // Button sizes
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg", "xl"].includes(value),
  },
  // Button states
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  // Button type
  type: {
    type: String,
    default: "button",
    validator: (value) => ["button", "submit", "reset"].includes(value),
  },
  // Full width
  fullWidth: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(["click"]);

// Computed classes
const buttonClasses = computed(() => {
  const baseClasses = [
    "inline-flex",
    "items-center",
    "justify-center",
    "font-semibold",
    "rounded-xl",
    "transition-all",
    "duration-200",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
    "disabled:opacity-50",
    "disabled:cursor-not-allowed",
    "backdrop-blur-sm",
    "cursor-pointer",
    "gap-2",
    "py-1 px-2",
  ];

  // Size classes
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-4 text-lg",
    xl: "px-8 py-4 text-xl",
  };

  // Variant classes
  const variantClasses = {
    primary: [
      "bg-gradient-to-r",
      "from-emerald-600",
      "to-emerald-600",
      "hover:from-emerald-700",
      "hover:to-emerald-700",
      "active:from-emerald-800",
      "active:to-emerald-800",
      "text-white",
      "border",
      "border-emerald-500",
      "focus:ring-emerald-500",
      "shadow-lg",
      "hover:shadow-xl",
      "transform",
      "hover:scale-105",
    ],
    secondary: [
      "bg-gradient-to-r",
      "from-gray-700",
      "to-gray-600",
      "hover:from-gray-600",
      "hover:to-gray-500",
      "active:from-gray-800",
      "active:to-gray-700",
      "text-white",
      "border",
      "border-gray-500",
      "focus:ring-gray-400",
      "shadow-md",
      "hover:shadow-lg",
    ],
    outline: [
      "bg-transparent",
      "hover:bg-white/10",
      "active:bg-white/20",
      "text-white",
      "border",
      "border-white/30",
      "focus:ring-white/50",
    ],
    ghost: [
      "bg-transparent",
      "hover:bg-white/10",
      "active:bg-white/20",
      "text-white",
      "border",
      "border-transparent",
      "focus:ring-white/50",
    ],
    danger: [
      "bg-red-600",
      "hover:bg-red-700",
      "active:bg-red-800",
      "text-white",
      "border",
      "border-red-600",
      "focus:ring-red-500",
    ],
  };

  // Full width
  if (props.fullWidth) {
    baseClasses.push("w-full");
  }

  return [
    ...baseClasses,
    ...sizeClasses[props.size],
    ...variantClasses[props.variant],
  ].join(" ");
});

// Methods
const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit("click", event);
  }
};
</script>

<style scoped>
/* Custom animations for the button */
button {
  position: relative;
  overflow: hidden;
}

button::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s;
}

button:hover::before {
  left: 100%;
}

/* Loading state animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
