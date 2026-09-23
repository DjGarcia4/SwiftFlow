import { describe, it, expect, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import router from "@/router";
import AboutView from "./AboutView.vue";
import { revealDirective } from "@/shared/directives/reveal";
import { tiltDirective } from "@/shared/directives/tilt";

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
      global: {
        plugins: [router],
        directives: { reveal: revealDirective, tilt: tiltDirective },
      },
    });
    await flushPromises();
    expect(wrapper.find("a[href='/']").text()).toContain("Empezar a escribir");
    // Every section made it onto the page
    for (const heading of [
      "Un test de velocidad que además te entrena",
      "No te dice solo cuánto. Te dice por qué.",
      "Cada partida te lleva a algún lado",
      "Tres pasos, y de nuevo",
      "Tu primera partida tarda 15 segundos",
    ]) {
      expect(wrapper.text()).toContain(heading);
    }

    await router.push("/sobre");
    document.body.dispatchEvent(
      new KeyboardEvent("keydown", { key: " ", bubbles: true })
    );
    await flushPromises();
    expect(router.currentRoute.value.path).toBe("/");
  });
});
