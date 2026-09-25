import { test, expect } from "@playwright/test";

test("the landing loads and the sentence there can be typed", async ({ page }) => {
  await page.goto("/sobre");
  const tryIt = page.locator("#probalo");
  await tryIt.scrollIntoViewIfNeeded();

  const sentence = (await tryIt.locator("p.font-mono span").allTextContents()).join("");
  expect(sentence.length).toBeGreaterThan(0);

  await tryIt.getByLabel("Escribí la frase").focus();
  await page.keyboard.type(sentence);

  await expect(tryIt.getByRole("link", { name: /Seguí en SwiftFlow/ })).toBeVisible();
  await expect(tryIt.getByRole("button", { name: /Otra frase/ })).toBeVisible();
});

test("unknown links land on the test", async ({ page }) => {
  await page.goto("/no-existe");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("[data-char-index]").first()).toBeVisible();
});
