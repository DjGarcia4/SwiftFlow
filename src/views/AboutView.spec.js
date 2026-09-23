import { describe, it, expect, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import router from "@/router";
import AboutView from "./AboutView.vue";
import { revealDirective } from "@/shared/directives/reveal";

describe("the landing", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    window.matchMedia = () => ({ matches: false });
  });

  it("lives at /sobre and names itself in the tab", async () => {
    await router.push("/sobre");
    expect(router.currentRoute.value.name).toBe("about");
    expect(document.title).toBe("Qué es SwiftFlow · SwiftFlow");

    await router.push("/");
    expect(document.title).toBe("SwiftFlow");
  });

  it("sends people to the typing test", async () => {
    const wrapper = mount(AboutView, {
      global: { plugins: [router], directives: { reveal: revealDirective } },
    });
    await flushPromises();
    expect(wrapper.find("a[href='/']").text()).toContain("Empezar a escribir");

    await router.push("/sobre");
    document.body.dispatchEvent(
      new KeyboardEvent("keydown", { key: " ", bubbles: true })
    );
    await flushPromises();
    expect(router.currentRoute.value.path).toBe("/");
  });
});
