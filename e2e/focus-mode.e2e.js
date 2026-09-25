import { test, expect } from "@playwright/test";
import { openTest, setUpShortWordsTest, restartHint } from "./helpers";

const shownText = async (page) =>
  (await page.locator("[data-char-index]").allTextContents()).join("");

test("focus mode shows the word being typed and the next, to the end", async ({
  page,
}) => {
  await openTest(page);
  await setUpShortWordsTest(page);
  const words = (await shownText(page)).split(" ");

  await page.getByRole("button", { name: "Texto", exact: true }).click();
  await page
    .getByRole("radiogroup", { name: "Modo foco" })
    .getByRole("radio", { name: "Sí" })
    .click();
  await page.keyboard.press("Escape");

  await expect.poll(() => shownText(page)).toBe(`${words[0]} ${words[1]}`);

  const field = page.locator("textarea");
  await field.focus();
  await page.keyboard.type(`${words[0]} `);
  await expect.poll(() => shownText(page)).toBe(`${words[1]} ${words[2]}`);

  await page.keyboard.type(words.slice(1).join(" "));
  await expect(restartHint(page)).toBeVisible();

  // Kept after a reload
  await openTest(page);
  expect((await shownText(page)).split(" ")).toHaveLength(2);
});
