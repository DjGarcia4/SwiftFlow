import { test, expect } from "@playwright/test";
import { openTest } from "./helpers";

// The on-screen keyboard is desktop-only: a phone already shows its own
test.skip(({ isMobile }) => isMobile, "no on-screen keyboard on phones");

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("swiftflow_config")) {
      localStorage.setItem("swiftflow_config", JSON.stringify({ showKeyboard: true }));
    }
  });
});

const picker = (page) => page.getByRole("combobox", { name: "Distribución del teclado" });

const keyLabeled = (page, key) => page.locator(`[data-key="${key}"]`);

test("guesses the keyboard from the browser's language", async ({ page }) => {
  await openTest(page);
  await expect(picker(page)).toHaveValue("latam");
  await expect(keyLabeled(page, "¿")).toHaveCount(1);
});

test("a picked keyboard is drawn, and kept after a reload", async ({ page }) => {
  await openTest(page);
  await picker(page).selectOption("es");
  await expect(keyLabeled(page, "ç")).toHaveCount(1);

  await openTest(page);
  await expect(picker(page)).toHaveValue("es");
  await expect(keyLabeled(page, "ç")).toHaveCount(1);

  await picker(page).selectOption("dvorak");
  await expect(keyLabeled(page, "ç")).toHaveCount(0);
  await expect(keyLabeled(page, "altgr")).toHaveCount(0);
});
