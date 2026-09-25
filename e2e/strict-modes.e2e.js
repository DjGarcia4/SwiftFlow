import { test, expect } from "@playwright/test";
import {
  openTest,
  referenceText,
  setUpShortWordsTest,
  openSettings,
  closeSettings,
  isPhone,
  restartHint,
} from "./helpers";

// Picks the demanding modes: on desktop from the bar's chip, on a phone
// from the settings sheet
const pickStrict = async (page, { mode, minAccuracy }) => {
  await openSettings(page);
  if (!isPhone(page))
    await page.getByRole("button", { name: /^Modos exigentes/ }).click();
  if (mode) {
    await page
      .getByRole("group", { name: "Un error…" })
      .locator("visible=true")
      .getByRole("button", { name: new RegExp(mode) })
      .click();
  }
  if (minAccuracy) {
    await page
      .getByRole("radiogroup", { name: "Precisión mínima" })
      .locator("visible=true")
      .getByRole("radio", { name: `${minAccuracy}%` })
      .click();
  }
  if (!isPhone(page)) await page.keyboard.press("Escape");
  await closeSettings(page);
};

// A wrong character for a spot in the text
const wrongFor = (char) => (char === "x" ? "z" : "x");

const historyIsEmpty = async (page) => {
  await page.goto("/historial");
  await expect(page.getByText("Todavía no completaste ningún test.")).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await openTest(page);
  await setUpShortWordsTest(page);
});

test("sudden death ends the run at the first mistake, and it doesn't count", async ({
  page,
}) => {
  await pickStrict(page, { mode: "Muerte súbita" });
  const text = await referenceText(page);
  await page.locator("textarea").focus();
  await page.keyboard.type(text.slice(0, 5));
  await page.keyboard.type(wrongFor(text[5]));

  await expect(
    page.locator(".bg-danger-tint", { hasText: /Muerte súbita: un error y afuera/ })
  ).toBeVisible();
  await expect(restartHint(page)).toBeVisible();
  await historyIsEmpty(page);
});

test("must-correct doesn't let a wrong key in", async ({ page }) => {
  await pickStrict(page, { mode: "Corregir para avanzar" });
  const text = await referenceText(page);
  const field = page.locator("textarea");
  await field.focus();
  await page.keyboard.type(text.slice(0, 3));
  await page.keyboard.type(wrongFor(text[3]));
  await expect(field).toHaveValue(text.slice(0, 3));

  await page.keyboard.type(text.slice(3));
  await expect(restartHint(page)).toBeVisible();
  const accuracy = page.getByText("Precisión", { exact: true }).locator("xpath=..");
  await expect(accuracy).not.toContainText("100%");

  await page.goto("/historial");
  await expect(page.getByText("corregir para avanzar", { exact: true })).toBeVisible();
});

test("a run under the minimum accuracy doesn't count", async ({ page }) => {
  await pickStrict(page, { minAccuracy: 98 });
  const text = await referenceText(page);
  await page.locator("textarea").focus();
  // Three wrong keys, each fixed: the text ends right, the accuracy doesn't
  for (let i = 0; i < 3; i++) {
    await page.keyboard.type(wrongFor(text[0]));
    await page.keyboard.press("Backspace");
  }
  await page.keyboard.type(text);

  await expect(
    page.locator(".bg-danger-tint", { hasText: /por debajo del 98 %/ })
  ).toBeVisible();
  await historyIsEmpty(page);
});

test("a clean run with a minimum accuracy counts, flagged", async ({ page }) => {
  await pickStrict(page, { minAccuracy: 95 });
  const text = await referenceText(page);
  await page.locator("textarea").focus();
  await page.keyboard.type(text);
  await expect(restartHint(page)).toBeVisible();

  await page.goto("/historial");
  await expect(page.getByText("≥95%", { exact: true })).toBeVisible();
});
