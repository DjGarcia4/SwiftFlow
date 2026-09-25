import { test, expect } from "@playwright/test";
import { setUpShortWordsTest, typeAll, referenceText, restartHint } from "./helpers";

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
  await page
    .getByRole("radiogroup", { name: "Idioma" })
    .getByRole("radio", { name: "English" })
    .click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("textbox", { name: "Type the text" })).toBeAttached();

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: /Sound and language/ }).click();
  await page
    .getByRole("radiogroup", { name: "Language" })
    .getByRole("radio", { name: "Español" })
    .click();
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

test.describe("the course and the summary in English", () => {
  test.use({ locale: "en-US" });

  test("the course speaks English, and so does the tab", async ({ page }) => {
    await page.goto("/curso");
    await expect(page).toHaveTitle("Course from scratch · SwiftFlow");
    await expect(
      page.getByRole("heading", { name: "Learn to type without looking" })
    ).toBeVisible();
    await expect(page.getByText("0 of 24 lessons")).toBeVisible();
    await expect(page.getByRole("button", { name: /^Lesson 2:.*Locked/ })).toBeDisabled();
    await page.getByRole("button", { name: /Start: lesson 1/ }).click();
    await expect(page.getByText("Lesson 1 of 24")).toBeVisible();
  });

  test("the summary speaks English", async ({ page }) => {
    await page.addInitScript(() => {
      const day = 24 * 60 * 60 * 1000;
      const results = Array.from({ length: 5 }, (_, i) => ({
        id: `s${i}`,
        date: new Date(Date.now() - i * day).toISOString(),
        metricsVersion: 3,
        mode: "time",
        modeValue: 30,
        wpm: 50 + i,
        accuracy: 95,
        errors: 1,
        timeElapsed: 30,
      }));
      localStorage.setItem("swiftflow_results", JSON.stringify(results));
    });
    await page.goto("/resumen");
    await expect(page).toHaveTitle("Your summary · SwiftFlow");
    await expect(page.getByRole("heading", { name: /^Your \w+ \d{4}$/ })).toBeVisible();
    await expect(page.getByText("Average speed")).toBeVisible();
    await expect(page.getByRole("button", { name: "Share my summary" })).toBeVisible();
  });
});

test.describe("the landing in English", () => {
  test.use({ locale: "en-US" });

  test("tells what SwiftFlow is, and what's new, in English", async ({ page }) => {
    await page.goto("/sobre");
    await expect(page).toHaveTitle("What is SwiftFlow · SwiftFlow");
    await expect(page.getByText("SwiftFlow in English")).toBeVisible();
    await expect(page.getByText("Qué es SwiftFlow")).toHaveCount(0);
  });
});

test("the texts can be practiced in English with the app in Spanish", async ({
  page,
}) => {
  await page.goto("/");
  await setUpShortWordsTest(page);
  await page.getByRole("button", { name: /Sonido e idioma/ }).click();
  await page
    .getByRole("radiogroup", { name: "Textos para practicar" })
    .getByRole("radio", { name: "English" })
    .click();
  await page.keyboard.press("Escape");
  // The app stays in Spanish; the text doesn't
  await expect(page.getByRole("textbox", { name: "Escribí el texto" })).toBeAttached();
  await expect.poll(async () => (await referenceText(page)).split(" ").length).toBe(10);
  const text = await referenceText(page);
  expect(text).not.toMatch(/[ñáéíóú¿¡]/);

  await page.reload();
  expect(await referenceText(page)).not.toMatch(/[ñáéíóú¿¡]/);
  await typeAll(page);
  await expect(restartHint(page)).toBeVisible();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("swiftflow_results"))
  );
  expect(saved[0].textLanguage).toBe("en");
});
