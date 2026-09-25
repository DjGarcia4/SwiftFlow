import { test, expect } from "@playwright/test";
import { openTest, isPhone, setUpShortWordsTest, typeAll, restartHint } from "./helpers";

const textArea = (page) =>
  page.locator("[data-char-index]").first().locator("xpath=../../..");

test("the text's size, font and spacing can be changed, and stay", async ({ page }) => {
  await openTest(page);
  const before = await textArea(page).evaluate((el) => getComputedStyle(el).fontSize);
  expect(before).toBe(isPhone(page) ? "24px" : "30px");

  await page.getByRole("button", { name: "Texto", exact: true }).click();
  const menu = page.getByRole("dialog", { name: "Cómo se ve el texto" });
  await menu.getByRole("radio", { name: "XL" }).click();
  await menu.getByRole("radio", { name: "Amplio" }).click();
  await menu.getByRole("combobox").selectOption("atkinson");

  const expected = isPhone(page) ? "32px" : "44px";
  await expect(textArea(page)).toHaveCSS("font-size", expected);
  await expect(textArea(page)).toHaveCSS("font-family", /Atkinson Hyperlegible/);

  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();

  await openTest(page);
  await expect(textArea(page)).toHaveCSS("font-size", expected);
  await expect(textArea(page)).toHaveCSS("font-family", /Atkinson Hyperlegible/);
});

test("a test can still be typed to the end with big text", async ({ page }) => {
  await openTest(page);
  await page.getByRole("button", { name: "Texto", exact: true }).click();
  await page.getByRole("radio", { name: "XL" }).click();
  await page.getByRole("radio", { name: "Salta" }).click();
  await page.keyboard.press("Escape");

  await setUpShortWordsTest(page);
  await typeAll(page);
  await expect(restartHint(page)).toBeVisible();
});
