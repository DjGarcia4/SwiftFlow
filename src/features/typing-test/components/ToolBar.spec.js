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

    // Every letter at once would swamp the bar, so nothing shows until the
    // picker is opened -- from the sheet's row on a phone...
    const row = wrapper.find("[data-drill-row]");
    const collapsed = row.findAll("button").length;
    await row
      .findAll("button")
      .find((b) => b.text() === "Cambiar")
      .trigger("click");
    expect(row.findAll("button").length - collapsed).toBe(27);

    // ...and from the chip on a desktop, as a popover
    const chip = wrapper.find("[data-drill-chip]");
    expect(chip.findAll("button")).toHaveLength(1);
    await chip.find("button").trigger("click");
    expect(chip.findAll("button")).toHaveLength(1 + 27);
  });

  it("shows the keys it is aiming at once some are picked", () => {
    const store = useConfigStore();
    store.handleType("drill");
    store.handleDrillKeys(["r", "t"]);

    const wrapper = mount(ToolBar);
    const row = wrapper.find("[data-drill-row]");
    expect(row.text()).toContain("Entrenando:");
    expect(row.findAll("kbd").map((k) => k.text())).toEqual(["r", "t"]);
    expect(
      wrapper
        .find("[data-drill-chip]")
        .findAll("kbd")
        .map((k) => k.text())
    ).toEqual(["r", "t"]);
  });

  it("keeps the desktop bar to one line: mode, setting and targets side by side", () => {
    const store = useConfigStore();
    store.handleType("drill");
    const wrapper = mount(ToolBar);

    // The mode and its setting are one strip each, not a button per option
    expect(wrapper.findAll("[role=radiogroup]")).toHaveLength(2);
    expect(wrapper.find("[role=radio][aria-checked=true]").text()).toBe("Entrenar");
  });
});
