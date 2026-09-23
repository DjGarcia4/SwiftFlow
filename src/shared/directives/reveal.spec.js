import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { revealDirective, resetRevealObserver } from "./reveal";

// A stand-in IntersectionObserver the test drives by hand
let observed;
let trigger;
class FakeObserver {
  constructor(callback) {
    observed = [];
    trigger = (el) => callback([{ target: el, isIntersecting: true }]);
  }
  observe(el) {
    observed.push(el);
  }
  unobserve(el) {
    observed = observed.filter((o) => o !== el);
  }
  disconnect() {}
}

const render = (template) =>
  mount({ template }, { global: { directives: { reveal: revealDirective } } });

describe("v-reveal", () => {
  beforeEach(() => {
    resetRevealObserver();
    globalThis.IntersectionObserver = FakeObserver;
    window.matchMedia = () => ({ matches: false });
  });

  afterEach(() => {
    delete globalThis.IntersectionObserver;
  });

  it("stays hidden until scrolled to, then reveals once", () => {
    const wrapper = render(`<section v-reveal>hola</section>`);
    const el = wrapper.element;
    expect(el.classList.contains("reveal-fade-up")).toBe(true);
    expect(el.classList.contains("is-revealed")).toBe(false);

    trigger(el);
    expect(el.classList.contains("is-revealed")).toBe(true);
    expect(observed).not.toContain(el);
  });

  it("takes a variant and a delay", () => {
    const el = render(`<div v-reveal="{ variant: 'zoom', delay: 150 }"></div>`).element;
    expect(el.classList.contains("reveal-zoom")).toBe(true);
    expect(el.style.transitionDelay).toBe("150ms");
  });

  it("falls back to fade-up for an unknown variant", () => {
    const el = render(`<div v-reveal="'wobble'"></div>`).element;
    expect(el.classList.contains("reveal-fade-up")).toBe(true);
  });

  it("staggers the children, capped", () => {
    const wrapper = render(
      `<ul v-reveal.stagger="{ step: 200 }"><li></li><li></li><li></li><li></li><li></li></ul>`
    );
    const delays = [...wrapper.element.children].map((li) => li.style.transitionDelay);
    expect(delays).toEqual(["", "200ms", "400ms", "600ms", "600ms"]);

    trigger(wrapper.element);
    expect(
      [...wrapper.element.children].every((li) => li.classList.contains("is-revealed"))
    ).toBe(true);
  });

  it("shows everything straight away with reduced motion", () => {
    window.matchMedia = () => ({ matches: true });
    const el = render(`<div v-reveal></div>`).element;
    expect(el.classList.contains("is-revealed")).toBe(true);
  });

  it("shows everything straight away without IntersectionObserver", () => {
    delete globalThis.IntersectionObserver;
    resetRevealObserver();
    const el = render(`<div v-reveal></div>`).element;
    expect(el.classList.contains("is-revealed")).toBe(true);
  });
});
