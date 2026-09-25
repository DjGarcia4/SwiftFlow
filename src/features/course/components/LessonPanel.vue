<template>
  <!-- Above the text while a lesson is on: what it teaches, its goal, and a
       tip -- two lines, so the text keeps its room -->
  <div
    class="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-0.5 text-center"
  >
    <div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-sm">
      <span class="text-xs font-extrabold uppercase tracking-wide text-primary">
        {{ t("course.panel.of", number, LESSONS.length) }}
      </span>
      <span class="font-display font-extrabold text-charcoal">{{ title }}</span>
      <kbd
        v-for="key in keys"
        :key="key"
        class="rounded-md border-2 border-primary/40 bg-primary-tint px-1.5 font-mono text-xs font-extrabold text-primary"
        >{{ key }}</kbd
      >
      <span class="text-xs font-bold text-pencil-gray">
        {{ t("course.panel.goal", lesson.goalWpm, PASS_ACCURACY) }}
        <RouterLink to="/curso" class="text-primary underline underline-offset-2">{{
          t("course.panel.seeCourse")
        }}</RouterLink>
      </span>
    </div>
    <p class="text-xs font-bold text-pencil-gray">{{ lesson.tip }}</p>
  </div>
</template>

<script setup>
import { t } from "@/shared/i18n";
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useConfigStore } from "@/features/typing-test/store";
import { useCurrentLesson } from "@/features/course/useCourse";
import {
  LESSONS,
  PASS_ACCURACY,
  lessonIndex,
  lessonKeys,
  lessonTitle,
} from "@/features/course/course";

const configStore = useConfigStore();
const lesson = useCurrentLesson();
const number = computed(() => lessonIndex(lesson.value.id) + 1);
const title = computed(() => lessonTitle(lesson.value, configStore.keyboardLayout));
// The keys themselves, when that's what the lesson is about and the title
// doesn't already spell them out
const keys = computed(() =>
  lesson.value.review
    ? []
    : lessonKeys(lesson.value, configStore.keyboardLayout).filter(
        (key) => !/\p{L}/u.test(key)
      )
);
</script>
