import { test, expect } from "@playwright/test";
import { openTest, openSettings, closeSettings, choose } from "./helpers";

test.beforeEach(async ({ page }) => {
  await openTest(page);
  await openSettings(page);
  await choose(page, "Modo", "Ritmo");
  await closeSettings(page);
});

test("rhythm opens on its start screen, with songs and levels to pick", async ({
  page,
}) => {
  await expect(page.getByText("Escribí al compás")).toBeVisible();
  await page.locator("[data-rhythm-track=neon]").click();
  await expect(page.locator("[data-rhythm-track=neon]")).toHaveAttribute(
    "aria-checked",
    "true"
  );
  await page.locator("[data-rhythm-difficulty-level=hard]").click();
  await expect(page.locator("[data-rhythm-difficulty-level=hard]")).toHaveAttribute(
    "aria-checked",
    "true"
  );
  // The pick is remembered
  await page.reload();
  await expect(page.locator("[data-rhythm-track=neon]")).toHaveAttribute(
    "aria-checked",
    "true"
  );
});

test("a run starts, and Esc leaves it without saving", async ({ page }) => {
  await page.locator("[data-rhythm-start]").click();
  await expect(page.getByText("Esc para salir · Tab para reiniciar")).toBeVisible();
  await expect(page.locator("[data-rhythm-intro]")).toBeHidden();
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-rhythm-intro]")).toBeVisible();
});
