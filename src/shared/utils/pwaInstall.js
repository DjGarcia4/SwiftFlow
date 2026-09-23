import { ref } from "vue";

// Installing SwiftFlow as an app from a button of our own. The browser
// offers it once, early, with a `beforeinstallprompt` event -- which has
// to be caught as the page loads (listenForInstall, from main.js) and kept
// for whenever the button is pressed. Browsers that don't fire it (Safari,
// Firefox) simply never show the button.

export const installPrompt = ref(null);

export const isInstalled = ref(
  typeof window !== "undefined" &&
    (window.matchMedia?.("(display-mode: standalone)").matches ||
      window.navigator?.standalone === true)
);

export const listenForInstall = () => {
  window.addEventListener("beforeinstallprompt", (event) => {
    // Ours to offer, from a button, rather than the browser's own bar
    event.preventDefault();
    installPrompt.value = event;
  });
  window.addEventListener("appinstalled", () => {
    installPrompt.value = null;
    isInstalled.value = true;
  });
};

// Shows the browser's install dialog; true if it was accepted. The event
// can only be used once, so it's dropped either way.
export const promptInstall = async () => {
  const event = installPrompt.value;
  if (!event) return false;
  installPrompt.value = null;
  event.prompt();
  const { outcome } = await event.userChoice;
  return outcome === "accepted";
};
