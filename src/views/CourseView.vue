<template>
  <!--
    The course from zero: how far along it is, the keyboard with what's been
    learned on it, and every lesson by stage. Opening a lesson starts it on
    the typing screen.
  -->
  <div class="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
    <header class="mb-6 animate-rise">
      <p class="text-xs font-extrabold uppercase tracking-widest text-primary">
        {{ t("course.page.kicker") }}
      </p>
      <h1 class="mt-1 font-display text-2xl font-extrabold text-charcoal sm:text-3xl">
        {{ t("course.page.title") }}
      </h1>
      <p class="mt-2 text-sm font-bold text-pencil-gray">
        {{ t("course.page.intro", PASS_ACCURACY) }}
      </p>
    </header>

    <!-- Where it stands -->
    <section
      class="mb-6 rounded-card border-2 border-faded-gray bg-paper-white p-4 sm:p-5 animate-rise [animation-delay:80ms]"
    >
      <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div class="font-display text-xl font-extrabold text-charcoal">
            {{ t("course.page.lessonsDone", progress.passedCount, progress.total) }}
          </div>
          <div class="text-xs font-bold text-pencil-gray">
            {{ t("course.page.starsDone", totalStars, progress.total * 3) }}
          </div>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border-b-4 border-primary-dark bg-primary px-4 py-2 text-sm font-extrabold text-white transition-[background-color,scale] duration-200 ease-spring hover:bg-primary-dark active:scale-95"
          @click="start(progress.next)"
        >
          {{
            t(
              progress.passedCount ? "course.page.continue" : "course.page.start",
              lessonIndex(progress.next.id) + 1
            )
          }}
          <ArrowRightIcon class="h-4 w-4" />
        </button>
      </div>
      <div
        class="h-2.5 overflow-hidden rounded-full bg-faded-gray/40"
        role="progressbar"
        :aria-valuenow="progress.passedCount"
        aria-valuemin="0"
        :aria-valuemax="progress.total"
        :aria-label="t('course.page.passedLessons')"
      >
        <div
          class="h-full rounded-full bg-primary transition-[width] duration-700 ease-smooth"
          :style="{ width: `${(progress.passedCount / progress.total) * 100}%` }"
        ></div>
      </div>

      <!-- The keyboard: learned keys, and the next lesson's -->
      <div class="mt-5 hidden justify-center sm:flex">
        <KeyboardLayout compact :key-class="keyClass" />
      </div>
      <div
        class="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-bold text-pencil-gray"
      >
        <span class="hidden items-center gap-1.5 sm:inline-flex"
          ><span class="h-2.5 w-2.5 rounded-sm bg-success"></span>
          {{ t("course.page.learned") }}</span
        >
        <span class="hidden items-center gap-1.5 sm:inline-flex"
          ><span class="h-2.5 w-2.5 rounded-sm bg-primary"></span>
          {{ t("course.page.nextLesson") }}</span
        >
        <span class="inline-flex items-center gap-1.5">
          {{ t("course.page.forYourKeyboard") }}
          <KeyboardLayoutPicker />
        </span>
      </div>
    </section>

    <!-- Every lesson, by stage -->
    <section
      v-for="(stage, stageIndex) in STAGES"
      :key="stage.id"
      class="mb-6 animate-rise"
      :style="{ animationDelay: `${160 + stageIndex * 80}ms` }"
    >
      <h2 class="mb-2 font-display text-lg font-extrabold text-charcoal">
        {{ stage.title }}
      </h2>
      <ol class="grid gap-2 sm:grid-cols-2">
        <li v-for="lesson in lessonsOf(stage.id)" :key="lesson.id">
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-[border-color,background-color] duration-200"
            :class="
              !progress.unlocked[lesson.id]
                ? 'cursor-not-allowed border-faded-gray/60 opacity-60'
                : lesson.id === progress.next.id
                  ? 'border-primary bg-primary-tint/50 hover:bg-primary-tint'
                  : 'border-faded-gray hover:border-primary/50'
            "
            :disabled="!progress.unlocked[lesson.id]"
            :aria-label="
              t(
                'course.page.lessonAria',
                lessonIndex(lesson.id) + 1,
                lessonTitle(lesson, configStore.keyboardLayout),
                describe(lesson)
              )
            "
            @click="start(lesson)"
          >
            <span
              class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-black"
              :class="
                progress.stars[lesson.id]
                  ? 'bg-success text-white'
                  : 'bg-faded-gray/30 text-pencil-gray'
              "
            >
              <LockClosedIcon v-if="!progress.unlocked[lesson.id]" class="h-4 w-4" />
              <template v-else>{{ lessonIndex(lesson.id) + 1 }}</template>
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-extrabold text-charcoal">
                {{ lessonTitle(lesson, configStore.keyboardLayout) }}
              </span>
              <span class="block text-xs font-bold text-pencil-gray">
                {{ lesson.goalWpm }} wpm
              </span>
            </span>
            <span class="flex flex-shrink-0" aria-hidden="true">
              <StarIcon
                v-for="star in 3"
                :key="star"
                class="h-4 w-4"
                :class="
                  star <= progress.stars[lesson.id] ? 'text-primary' : 'text-faded-gray'
                "
              />
            </span>
          </button>
        </li>
      </ol>
    </section>
  </div>
</template>

<script setup>
import { t } from "@/shared/i18n";
import { computed } from "vue";
import { useRouter } from "vue-router";
import { ArrowRightIcon, LockClosedIcon } from "@heroicons/vue/24/outline";
import { StarIcon } from "@heroicons/vue/24/solid";
import KeyboardLayout from "@/features/typing-test/components/KeyboardLayout.vue";
import KeyboardLayoutPicker from "@/features/typing-test/components/KeyboardLayoutPicker.vue";
import { useConfigStore } from "@/features/typing-test/store";
import { useCourseProgress } from "@/features/course/useCourse";
import {
  STAGES,
  LESSONS,
  PASS_ACCURACY,
  lessonIndex,
  lessonKeys,
  lessonTitle,
} from "@/features/course/course";

const router = useRouter();
const configStore = useConfigStore();
const progress = useCourseProgress();

const lessonsOf = (stageId) => LESSONS.filter((lesson) => lesson.stage === stageId);

const totalStars = computed(() =>
  Object.values(progress.value.stars).reduce((sum, stars) => sum + stars, 0)
);

const describe = (lesson) => {
  if (!progress.value.unlocked[lesson.id]) return t("course.page.locked");
  const stars = progress.value.stars[lesson.id];
  return stars ? t("course.result.stars", stars) : t("course.page.notDone");
};

// Keys from lessons already passed, and the ones the next lesson brings
const learned = computed(
  () =>
    new Set(
      LESSONS.filter((lesson) => progress.value.stars[lesson.id] > 0).flatMap((lesson) =>
        lessonKeys(lesson, configStore.keyboardLayout)
      )
    )
);
const upcoming = computed(
  () => new Set(lessonKeys(progress.value.next, configStore.keyboardLayout))
);
// The space bar is the thumbs' from the very first lesson
const keyClass = (key) => {
  if (upcoming.value.has(key)) return "border-primary bg-primary text-white";
  if (learned.value.has(key) || key === " ") {
    return "border-success/50 bg-success-tint text-success-dark";
  }
  return "border-faded-gray/50 text-pencil-gray";
};

const start = (lesson) => {
  configStore.startLesson(lesson.id);
  router.push("/");
};
</script>
