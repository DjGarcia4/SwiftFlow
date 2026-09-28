import { defineStore } from "pinia";
import { ref, shallowRef, computed, onMounted, onUnmounted } from "vue";
import { t } from "@/shared/i18n";
import { isApple, isEditable } from "@/features/command-palette/keys";

// One key per button, shown next to it: press it and the button is pressed,
// no palette in between. Each button registers its own while it's on
// screen, so the key only does something when there's something to press.
//
// On the typing screen every letter is typing, so there a key takes Alt
// (⌥ on a Mac) -- and the chip beside the button says so. Everywhere else
// (the results, the other pages) the letter alone does it.
//
// A hotkey: { key, run, label?, enabled?, plainOnly?, inPalette? }.
// `key` is one letter. `enabled` says whether it can be pressed now (the
// button is showing). `plainOnly` ones don't take Alt: the page links,
// which have no business being pressed mid-text. The ones with a `label`
// are offered in the palette too, unless `inPalette` is false.

export const altLabel = () => (isApple() ? "⌥" : "Alt ");

export const useHotkeysStore = defineStore("hotkeys", () => {
  // id -> hotkey. Replaced whole on every change, so the chips update; not
  // deep, so each hotkey stays the very object registered (unregistering
  // checks it's still its own)
  const registry = shallowRef(new Map());
  // Letters are typing right now: a key needs Alt to be a hotkey
  const captured = ref(false);

  const register = (id, hotkey) => {
    const next = new Map(registry.value);
    next.set(id, hotkey);
    registry.value = next;
  };

  const unregister = (id, hotkey) => {
    // Only its own: a newer copy of the same button may have taken the id
    if (registry.value.get(id) !== hotkey) return;
    const next = new Map(registry.value);
    next.delete(id);
    registry.value = next;
  };

  const isEnabled = (hotkey) => !hotkey.enabled || hotkey.enabled();

  // What the chip beside a button says, or null when it shouldn't show one
  const comboFor = (id) => {
    const hotkey = registry.value.get(id);
    if (!hotkey || !isEnabled(hotkey)) return null;
    const key = hotkey.key.toUpperCase();
    if (!captured.value) return key;
    return hotkey.plainOnly ? null : `${altLabel()}${key}`;
  };

  // For assistive tech: aria-keyshortcuts wants the keys spelled out
  const ariaFor = (id) => {
    const hotkey = registry.value.get(id);
    if (!hotkey) return undefined;
    const key = hotkey.key.toUpperCase();
    return hotkey.plainOnly ? key : `${key} Alt+${key}`;
  };

  // The hotkeys the palette lists, with the keys to press next to them
  const paletteEntries = computed(() =>
    [...registry.value.entries()]
      .filter(
        ([, hotkey]) => hotkey.label && hotkey.inPalette !== false && isEnabled(hotkey)
      )
      .map(([id, hotkey]) => ({ id, hotkey }))
  );

  // The hotkey a key press is asking for, or null. Alt+letter is matched
  // by the physical key: on a Mac, ⌥ turns the letter into another
  // character (⌥G is ©).
  const match = (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.isComposing) {
      return null;
    }
    let letter = null;
    if (event.altKey) {
      const found = /^Key([A-Z])$/.exec(event.code ?? "");
      letter = found ? found[1].toLowerCase() : null;
    } else if (!captured.value && !isEditable(event.target)) {
      letter = event.key?.length === 1 ? event.key.toLowerCase() : null;
    }
    if (!letter) return null;

    // The newest registration wins: the button most recently put on screen
    const candidates = [...registry.value.values()].reverse();
    return (
      candidates.find(
        (hotkey) =>
          hotkey.key === letter &&
          isEnabled(hotkey) &&
          !(event.altKey && hotkey.plainOnly)
      ) ?? null
    );
  };

  return {
    registry,
    captured,
    register,
    unregister,
    comboFor,
    ariaFor,
    paletteEntries,
    match,
  };
});

// Registers a hotkey for as long as the component using it is mounted
export const useHotkey = (id, hotkey) => {
  const hotkeys = useHotkeysStore();
  const entry = { ...hotkey };
  onMounted(() => hotkeys.register(id, entry));
  onUnmounted(() => hotkeys.unregister(id, entry));
  return {
    combo: computed(() => hotkeys.comboFor(id)),
    aria: computed(() => hotkeys.ariaFor(id)),
  };
};

// The palette's label for a hotkey, resolved now (labels follow the language)
export const hotkeyLabel = (hotkey) =>
  typeof hotkey.label === "function" ? hotkey.label() : t(hotkey.label);
