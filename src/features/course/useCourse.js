import { computed } from "vue";
import { useConfigStore } from "@/features/typing-test/store";
import { useHistoryStore } from "@/features/history/store";
import { courseProgress, lessonById } from "./course";

// The course as the history leaves it (course.js)
export const useCourseProgress = () => {
  const historyStore = useHistoryStore();
  return computed(() => courseProgress(historyStore.results));
};

// The lesson being played: the one picked, or else the next to do
export const useCurrentLesson = () => {
  const configStore = useConfigStore();
  const progress = useCourseProgress();
  return computed(() => lessonById(configStore.lessonId) ?? progress.value.next);
};
