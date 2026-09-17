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

  it("only asks about target keys in the drill mode", async () => {
    const store = useConfigStore();
    store.handleType("words");
    expect(mount(ToolBar).text()).not.toContain("Cambiar");

    store.handleType("drill");
    expect(mount(ToolBar).text()).toContain("Cambiar");
  });

  it("says so when there is no history to pick target keys from", () => {
    useConfigStore().handleType("drill");

    expect(mount(ToolBar).text()).toContain("Todavía no sé qué te cuesta");
  });

  it("keeps the whole alphabet behind the edit button", async () => {
    const store = useConfigStore();
    store.handleType("drill");
    const wrapper = mount(ToolBar);

    // Every letter at once would swamp a toolbar that has to stay one line,
    // so nothing shows until the picker is opened
    const collapsed = wrapper.findAll("button").length;

    await wrapper
      .findAll("button")
      .find((b) => b.text() === "Cambiar")
      .trigger("click");

    expect(wrapper.findAll("button").length - collapsed).toBe(27);
  });

  it("shows the keys it is aiming at once some are picked", () => {
    const store = useConfigStore();
    store.handleType("drill");
    store.handleDrillKeys(["r", "t"]);

    const wrapper = mount(ToolBar);
    expect(wrapper.text()).toContain("Entrenando:");
    expect(wrapper.findAll("kbd").map((k) => k.text())).toEqual(["r", "t"]);
  });
});
