<template>
  <Nav />
  <div class="max-w-screen-xl mt-10 md:mt-20 mx-auto">
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from "vue-router";
import Nav from "@/components/Layouts/Nav.vue";
</script>

<style scoped></style>
