import { test, expect } from "@playwright/test";
import {
  openTest,
  referenceText,
  setUpShortWordsTest,
  typeAll,
  openSettings,
  closeSettings,
  choose,
  expectChosen,
} from "./helpers";

test.beforeEach(async ({ page }) => {
  await openTest(page);
});

test("a words test typed to the end shows the results", async ({ page }) => {
  await setUpShortWordsTest(page);
  await typeAll(page);

  await expect(page.getByText("WPM", { exact: true })).toBeVisible();
  await expect(page.getByText("Precisión", { exact: true })).toBeVisible();
  await expect(page.getByText("para empezar de nuevo")).toBeVisible();
});

test("a clean run is 100% accurate with no mistakes", async ({ page }) => {
  await setUpShortWordsTest(page);
  await typeAll(page);

  const card = (label) =>
    page.getByText(label, { exact: true }).locator("xpath=..").first();
  await expect(card("Precisión")).toContainText("100%");
  await expect(card("Errores")).toContainText("0");
});

test("space after the results starts a fresh text", async ({ page }) => {
  await setUpShortWordsTest(page);
  const first = await typeAll(page);
  await expect(page.getByText("para empezar de nuevo")).toBeVisible();

  // Space only restarts once the results have settled
  await expect(async () => {
    await page.keyboard.press("Space");
    await expect(page.locator("[data-char-index]").first()).toBeVisible({
      timeout: 500,
    });
  }).toPass();
  expect(await referenceText(page)).not.toBe(first);
});

test("the chosen mode and length survive a reload", async ({ page }) => {
  await openSettings(page);
  await choose(page, "Modo", "Palabras");
  await choose(page, "Cantidad", "25");
  await closeSettings(page);

  await openTest(page);
  await openSettings(page);
  await expectChosen(page, "Modo", "Palabras");
  await expectChosen(page, "Cantidad", "25");
});

test("every mode has something to type", async ({ page }) => {
  for (const mode of ["Tiempo", "Palabras", "Números", "Cita", "Código", "Zen"]) {
    await openSettings(page);
    await choose(page, "Modo", mode);
    await closeSettings(page);
    if (mode === "Zen") {
      // Zen starts empty: whatever you type is the text
      await expect(page.locator("textarea")).toBeEnabled();
    } else {
      expect((await referenceText(page)).length).toBeGreaterThan(0);
    }
  }
});
