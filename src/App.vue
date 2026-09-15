<template>
  <div class="h-screen flex flex-col bg-paper-white">
    <Nav />
    <div class="flex-1 overflow-y-auto">
      <div class="max-w-[1200px] mx-auto w-full">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterView } from "vue-router";
import Nav from "@/shared/layout/Nav.vue";
</script>

<style scoped></style>
