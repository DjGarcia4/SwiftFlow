<template>
  <!-- How the lesson went: passed or not, the stars, and where to go next -->
  <div class="mx-auto flex max-w-xl flex-col items-center gap-2 text-center">
    <div
      class="flex items-center gap-1"
      :aria-label="t('course.result.stars', grade.stars)"
    >
      <StarIcon
        v-for="star in 3"
        :key="star"
        class="h-7 w-7 animate-pop-in"
        :class="star <= grade.stars ? 'text-primary' : 'text-faded-gray'"
        :style="{ animationDelay: `${star * 120}ms` }"
      />
    </div>
    <p class="font-display text-lg font-extrabold text-charcoal">
      {{ headline }}
    </p>
    <p class="text-sm font-bold text-pencil-gray">{{ detail }}</p>
    <div class="mt-1 flex flex-wrap justify-center gap-2">
      <button
        v-if="grade.passed && nextLesson"
        type="button"
        class="inline-flex items-center gap-2 rounded-xl border-b-4 border-primary-dark bg-primary px-4 py-2 text-sm font-extrabold text-white transition-[background-color,scale] duration-200 ease-spring hover:bg-primary-dark active:scale-95"
        @click="configStore.startLesson(nextLesson.id)"
      >
        {{ t("course.result.next") }}
        <ArrowRightIcon class="h-4 w-4" />
      </button>
      <RouterLink
        to="/curso"
        class="inline-flex items-center gap-2 rounded-xl border-2 border-faded-gray px-4 py-2 text-sm font-extrabold text-charcoal transition-[border-color] duration-200 hover:border-primary/50"
      >
        <AcademicCapIcon class="h-4 w-4" />
        {{ t("course.result.seeCourse") }}
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { t } from "@/shared/i18n";
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { ArrowRightIcon, AcademicCapIcon } from "@heroicons/vue/24/outline";
import { StarIcon } from "@heroicons/vue/24/solid";
import { useConfigStore } from "@/features/typing-test/store";
import { useCurrentLesson } from "@/features/course/useCourse";
import {
  LESSONS,
  PASS_ACCURACY,
  gradeLesson,
  lessonIndex,
} from "@/features/course/course";

const configStore = useConfigStore();
const lesson = useCurrentLesson();

const grade = computed(() =>
  gradeLesson(lesson.value, { wpm: configStore.wpm, accuracy: configStore.accuracy })
);
const nextLesson = computed(() => LESSONS[lessonIndex(lesson.value.id) + 1] ?? null);

const headline = computed(() => {
  if (!grade.value.passed) return t("course.result.notYet");
  if (!nextLesson.value) return t("course.result.courseDone");
  return t("course.result.passed")[grade.value.stars - 1];
});

const detail = computed(() => {
  const { goalWpm } = lesson.value;
  if (configStore.accuracy < PASS_ACCURACY) {
    return t("course.result.needAccuracy", PASS_ACCURACY);
  }
  if (configStore.wpm < goalWpm) {
    return t("course.result.needSpeed", goalWpm);
  }
  if (grade.value.stars < 3) {
    return t("course.result.forThree");
  }
  return t("course.result.three");
});
</script>
