<template>
  <!-- A key to press inside an open menu, written on its option. Only where
       there's a keyboard: a phone has none. -->
  <kbd
    aria-hidden="true"
    data-key-cap
    class="hidden pointer-fine:inline-flex min-w-[1.15rem] items-center justify-center rounded-md border px-1 py-px font-mono text-[10px] font-bold leading-none"
    :class="
      onPrimary
        ? 'border-white/40 bg-white/15 text-white'
        : 'border-faded-gray bg-paper-white text-pencil-gray'
    "
    ><slot
  /></kbd>
</template>

<script setup>
defineProps({
  // On a filled (chosen) option the key goes light
  onPrimary: { type: Boolean, default: false },
});
</script>
