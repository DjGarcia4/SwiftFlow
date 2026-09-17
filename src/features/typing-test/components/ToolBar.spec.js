import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { setActivePinia, createPinia } from "pinia";
import ToolBar from "./ToolBar.vue";
import { useConfigStore } from "@/features/typing-test/store";

// The mode buttons look their icon and label up in a plain map with no
// fallback, so a mode added to the store and forgotten here takes the whole
// toolbar down. Cheap to guard, hard to notice otherwise.
describe("ToolBar", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it("renders every mode without blowing up", () => {
    const store = useConfigStore();
    for (const type of store.types) {
      store.handleType(type);
      const wrapper = mount(ToolBar);
      expect(wrapper.text()).toContain("Entrenar");
    }
  });

  it("shows the key picker in the drill mode only", () => {
    const store = useConfigStore();
    store.handleType("words");
    expect(mount(ToolBar).text()).not.toContain("Tus teclas flojas");

    store.handleType("drill");
    const wrapper = mount(ToolBar);
    expect(wrapper.text()).toContain("Tus teclas flojas");

    store.handleDrillKeys(["r"]);
    expect(mount(ToolBar).text()).toContain("Teclas:");
  });
});
