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

test.describe("the history in English", () => {
  test.use({ locale: "en-US" });

  test("speaks English, down to the tips and achievements", async ({ page }) => {
    await page.addInitScript(() => {
      const day = 24 * 60 * 60 * 1000;
      const results = Array.from({ length: 12 }, (_, i) => ({
        id: `s${i}`,
        date: new Date(Date.now() - i * day).toISOString(),
        metricsVersion: 3,
        mode: "time",
        modeValue: 30,
        wpm: 50 + (i % 4),
        accuracy: 90,
        errors: 3,
        timeElapsed: 30,
        keyAttempts: { a: 80, e: 80, r: 60, t: 60, s: 40 },
        missedKeys: { a: 2, e: 2, r: 14, t: 2, s: 1 },
      }));
      localStorage.setItem("swiftflow_results", JSON.stringify(results));
    });
    await page.goto("/historial");
    await expect(page.getByRole("heading", { name: "History" })).toBeVisible();
    await expect(page.getByText("Most missed keys")).toBeVisible();
    await expect(page.getByText("What to improve")).toBeVisible();
    await expect(page.getByText(/^Practice R/)).toBeVisible();
    await expect(page.getByText(/^Achievements \(\d+\/\d+\)/)).toBeVisible();
    await expect(page.getByText("First step")).toBeVisible();
    await expect(page.getByText("Activity", { exact: true })).toBeVisible();
    await expect(page.getByText("30s").first()).toBeVisible();
  });
});
