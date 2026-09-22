import { useConfigStore } from "@/features/typing-test/store";

// Drops whatever is going on and starts a drill aimed at the given keys.
// The typing view reloads its text (and takes the focus back) on its own
// when the mode or the drill keys change.
export const useTrainNow = () => {
  const configStore = useConfigStore();
  return (keys) => {
    configStore.handleDrillKeys(keys);
    if (configStore.type !== "drill") configStore.handleType("drill");
  };
};

// The same, aimed at whole words instead of letters
export const useTrainWords = () => {
  const configStore = useConfigStore();
  return (words) => {
    configStore.handleDrillWords(words);
    if (configStore.type !== "drill") configStore.handleType("drill");
  };
};
