import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import IconButton from "./IconButton.vue";

describe("IconButton", () => {
  it("renders its text prop", () => {
    const wrapper = mount(IconButton, { props: { text: "Pausar" } });
    expect(wrapper.text()).toContain("Pausar");
  });

  it("emits click when clicked", async () => {
    const wrapper = mount(IconButton, { props: { text: "Pausar", icon: "pause" } });
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("click")).toHaveLength(1);
  });

  it("renders a tooltip when provided", () => {
    const wrapper = mount(IconButton, {
      props: { text: "Pausar", tooltip: "Pausar sesión" },
    });
    expect(wrapper.text()).toContain("Pausar sesión");
  });

  it("does not render a tooltip container when none is provided", () => {
    const wrapper = mount(IconButton, { props: { text: "Pausar" } });
    expect(wrapper.find(".group").exists()).toBe(false);
  });
});
