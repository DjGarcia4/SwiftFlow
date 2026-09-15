import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ButtonCustom from "./ButtonCustom.vue";

describe("ButtonCustom", () => {
  it("renders its text prop", () => {
    const wrapper = mount(ButtonCustom, { props: { text: "Reiniciar" } });
    expect(wrapper.text()).toContain("Reiniciar");
  });

  it("emits click when clicked", async () => {
    const wrapper = mount(ButtonCustom, { props: { text: "Ir" } });
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("click")).toHaveLength(1);
  });

  it("does not emit click when disabled", async () => {
    const wrapper = mount(ButtonCustom, { props: { text: "Ir", disabled: true } });
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("click")).toBeUndefined();
  });

  it("does not emit click while loading", async () => {
    const wrapper = mount(ButtonCustom, { props: { text: "Ir", loading: true } });
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("click")).toBeUndefined();
  });
});
