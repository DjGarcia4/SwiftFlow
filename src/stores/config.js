import { defineStore } from "pinia";
import { ref } from "vue";

export const useConfigStore = defineStore("config", () => {
  const type = ref("time");
  const selectedTime = ref(15);
  const selectedWords = ref(100);

  const types = ref(["time", "words"]);
  const times = ref([15, 30, 60, 120]);
  const words = ref([10, 25, 50, 100]);

  const handleType = (selectedType) => {
    type.value = selectedType;
  };

  const handleTime = (newTime) => {
    selectedTime.value = newTime;
  };

  const handleWords = (newWords) => {
    selectedWords.value = newWords;
  };

  return {
    type,
    selectedTime,
    selectedWords,
    times,
    words,
    types,
    handleType,
    handleTime,
    handleWords,
  };
});
