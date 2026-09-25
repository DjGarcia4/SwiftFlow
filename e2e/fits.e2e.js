import { test, expect } from "@playwright/test";

// The typing screen is for typing: whatever is up on it (a lesson's panel,
// the dictation's, the on-screen keyboard), it all fits in a laptop window
// with nothing to scroll and nothing cut off at the bottom.
test.use({ viewport: { width: 1280, height: 720 } });
test.skip(({ isMobile }) => isMobile, "a laptop window");

const SETUPS = {
  "words with the keyboard": { type: "words", showKeyboard: true },
  lesson: { type: "lesson" },
  "dictation with the keyboard": { type: "dictation", showKeyboard: true },
  drill: { type: "drill" },
};

for (const [name, config] of Object.entries(SETUPS)) {
  test(`${name} fits a 1280×720 window`, async ({ page }) => {
    await page.addInitScript((config) => {
      localStorage.setItem("swiftflow_config", JSON.stringify(config));
      window.SpeechSynthesisUtterance = class {};
      Object.defineProperty(window, "speechSynthesis", {
        value: {
          getVoices: () => [{ lang: "es-AR", name: "Voz" }],
          speak() {},
          cancel() {},
          addEventListener() {},
        },
      });
    }, config);
    await page.goto("/");
    await expect(page.locator("[data-char-index]").first()).toBeVisible();

    const restart = page.getByRole("button", { name: "Reiniciar" });
    const box = await restart.boundingBox();
    expect(box.y + box.height).toBeLessThanOrEqual(720);
    const scrolls = await page.evaluate(() =>
      [...document.querySelectorAll("*")].some(
        (el) =>
          el.scrollHeight > el.clientHeight + 1 &&
          ["auto", "scroll"].includes(getComputedStyle(el).overflowY) &&
          !el.closest("[role='radiogroup']")
      )
    );
    expect(scrolls).toBe(false);
  });
}
