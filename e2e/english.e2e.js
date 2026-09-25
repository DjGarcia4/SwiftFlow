import { test, expect } from "@playwright/test";
import { setUpShortWordsTest, typeAll } from "./helpers";

// The interface in English: a browser in English gets it on its own, and
// anyone can switch from the sound and language menu
test.describe("in English", () => {
  test.use({ locale: "en-US" });

  test("the typing screen and its results speak English", async ({ page, isMobile }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("textbox", { name: "Type the text" })).toBeAttached();

    if (!isMobile) {
      await expect(
        page
          .getByRole("radiogroup", { name: "Mode" })
          .getByRole("radio", { name: "Words" })
      ).toBeVisible();
    }
    await expect(page.getByRole("button", { name: "Restart" })).toBeAttached();

    // The helpers speak Spanish: switch back just for setting up, then on
    await page.evaluate(() => localStorage.setItem("swiftflow_locale", "es"));
    await page.reload();
    await setUpShortWordsTest(page);
    await page.evaluate(() => localStorage.setItem("swiftflow_locale", "en"));
    await page.reload();
    await typeAll(page);

    await expect(page.getByText("Accuracy", { exact: true })).toBeVisible();
    await expect(page.getByText("Press SPACE to start again")).toBeVisible();
    await expect(page.locator("#announcer-polite")).toContainText(
      /Done: \d+ words per minute/
    );
  });
});

test("the language can be switched from the menu, and stays", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await page.getByRole("button", { name: /Sonido e idioma/ }).click();
  await page.getByRole("radio", { name: "English" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("textbox", { name: "Type the text" })).toBeAttached();

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: /Sound and language/ }).click();
  await page.getByRole("radio", { name: "Español" }).click();
  await expect(page.getByRole("textbox", { name: "Escribí el texto" })).toBeAttached();
});
