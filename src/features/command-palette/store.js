import { defineStore } from "pinia";
import { ref } from "vue";

// The command palette (Ctrl/⌘+K): whether it's open and on which list, the
// commands used last, and two things the typing screen listens for -- a
// request to start over, and whether the run was set up without the mouse.

const RECENT_KEY = "swiftflow_palette_recent";
const MAX_RECENT = 5;

const loadRecent = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((id) => typeof id === "string").slice(0, MAX_RECENT)
      : [];
  } catch {
    return [];
  }
};

const saveRecent = (ids) => {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(ids));
  } catch {
    // Storage blocked: they're remembered for this visit only
  }
};

export const usePaletteStore = defineStore("commandPalette", () => {
  const isOpen = ref(false);
  // "commands", or "shortcuts" for the list of keys
  const view = ref("commands");
  const recent = ref(loadRecent());

  // Bumped to ask the typing screen for a fresh text
  const restartRequests = ref(0);

  // Asked to show the day's challenges -- maybe from another page, so it
  // waits until the test (where they live) is there to take it
  const challengesRequested = ref(false);

  // True from a command run until the mouse (or a finger) touches the page:
  // a run finished meanwhile was set up and played on the keyboard alone
  const keyboardOnly = ref(false);

  const open = (which = "commands") => {
    view.value = which;
    isOpen.value = true;
  };

  const close = () => {
    isOpen.value = false;
  };

  const toggle = () => {
    if (isOpen.value && view.value === "commands") close();
    else open("commands");
  };

  const remember = (id) => {
    recent.value = [id, ...recent.value.filter((other) => other !== id)].slice(
      0,
      MAX_RECENT
    );
    saveRecent(recent.value);
  };

  // Commands that stay open (the list of keys) switch the view instead
  const run = (command) => {
    remember(command.id);
    keyboardOnly.value = true;
    if (command.keepOpen) {
      command.run();
      return;
    }
    close();
    command.run();
  };

  const requestRestart = () => {
    restartRequests.value++;
  };

  const requestChallenges = () => {
    challengesRequested.value = true;
  };

  const takeChallengesRequest = () => {
    const requested = challengesRequested.value;
    challengesRequested.value = false;
    return requested;
  };

  const touchedWithPointer = () => {
    keyboardOnly.value = false;
  };

  return {
    isOpen,
    view,
    recent,
    restartRequests,
    keyboardOnly,
    open,
    close,
    toggle,
    run,
    requestRestart,
    challengesRequested,
    requestChallenges,
    takeChallengesRequest,
    touchedWithPointer,
  };
});
