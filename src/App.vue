<template>
  <div class="h-screen flex flex-col">
    <Nav />
    <div class="flex-1 overflow-y-auto">
      <div class="max-w-screen-xl mx-auto">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterView } from "vue-router";
import Nav from "@/components/Layouts/Nav.vue";
</script>

<style scoped></style>
