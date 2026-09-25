<template>
  <!-- The lesson being played, in the bar, and the way to the whole course -->
  <RouterLink
    to="/curso"
    class="inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border-2 border-primary/50 bg-primary-tint px-2.5 py-1.5 text-xs font-extrabold text-primary transition-[border-color] duration-200 hover:border-primary"
    :title="t('course.chip.hint', number, LESSONS.length)"
  >
    <AcademicCapIcon class="h-4 w-4" />
    {{ t("course.chip.label", number, title) }}
  </RouterLink>
</template>

<script setup>
import { t } from "@/shared/i18n";
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { AcademicCapIcon } from "@heroicons/vue/24/outline";
import { useConfigStore } from "@/features/typing-test/store";
import { useCurrentLesson } from "@/features/course/useCourse";
import { LESSONS, lessonIndex, lessonTitle } from "@/features/course/course";

const configStore = useConfigStore();
const lesson = useCurrentLesson();
const number = computed(() => lessonIndex(lesson.value.id) + 1);
const title = computed(() => lessonTitle(lesson.value, configStore.keyboardLayout));
</script>
