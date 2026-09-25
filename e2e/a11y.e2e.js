import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  openTest,
  referenceText,
  setUpShortWordsTest,
  typeAll,
  restartHint,
} from "./helpers";

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

// Colors are measured as they are right now: let whatever is fading or
// rising in get there first (the looping ones never end, so not those)
const settle = (page) =>
  page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => {}))
    )
  );

const violationsOn = async (page, { contrast = true } = {}) => {
  await settle(page);
  const builder = new AxeBuilder({ page }).withTags(WCAG);
  if (!contrast) builder.disableRules(["color-contrast"]);
  const { violations } = await builder.analyze();
  return violations.map(
    (v) => `${v.id}: ${v.nodes.map((node) => node.target.join(" ")).join(" | ")}`
  );
};

const finishTest = async (page) => {
  await openTest(page);
  await setUpShortWordsTest(page);
  await typeAll(page);
  await expect(restartHint(page)).toBeVisible();
  // Let the result cards finish rising in
  await page.waitForTimeout(1200);
};

// Every screen, and every dialog on the typing screen
const eachScreen = async (page, check) => {
  await openTest(page);
  await check("test");

  await page.getByRole("button", { name: "Texto", exact: true }).click();
  await check("text menu");
  await page.keyboard.press("Escape");

  // Mid-session: the combo bar filling, and its toast past 25
  const text = await referenceText(page);
  await page.locator("textarea").focus();
  await page.keyboard.type(text.slice(0, 30));
  await check("typing");

  await finishTest(page);
  await check("results");

  await page.getByRole("button", { name: /Dónde te frenaste/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await check("replay");
  await page.keyboard.press("Escape");

  await page.goto("/historial");
  await expect(page.getByRole("heading", { name: "Historial" })).toBeVisible();
  await page.waitForTimeout(1200);
  await check("history");

  await page.goto("/resumen");
  await expect(page.getByText("Tu resumen", { exact: true })).toBeVisible();
  await page.waitForTimeout(900);
  await check("summary");

  await page.goto("/curso");
  await expect(
    page.getByRole("heading", { name: "Aprendé a escribir sin mirar" })
  ).toBeVisible();
  await check("course");

  await page.goto("/sobre");
  await page.waitForTimeout(800);
  await check("landing");
};

test.describe("screen checks", () => {
  test.skip(({ isMobile }) => isMobile, "the same screens, checked once");

  test("nothing but the brand color's contrast stands out", async ({ page }) => {
    const found = {};
    await eachScreen(page, async (name) => {
      const violations = await violationsOn(page, { contrast: false });
      if (violations.length) found[name] = violations;
    });
    expect(found).toEqual({});
  });

  for (const theme of ["light", "dark"]) {
    test(`high contrast passes every check, ${theme}`, async ({ page }) => {
      await page.addInitScript((theme) => {
        localStorage.setItem("swiftflow_contrast", "more");
        localStorage.setItem("swiftflow_theme", theme);
      }, theme);
      const found = {};
      await eachScreen(page, async (name) => {
        const violations = await violationsOn(page);
        if (violations.length) found[name] = violations;
      });
      expect(found).toEqual({});
    });
  }
});

test("high contrast follows the system until it's switched", async ({ page }) => {
  await page.emulateMedia({ contrast: "more" });
  await openTest(page);
  await expect(page.locator("html")).toHaveAttribute("data-contrast", "more");

  await page.getByRole("button", { name: "Texto", exact: true }).click();
  const toggle = page.getByRole("switch", { name: /Alto contraste/ });
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await toggle.click();
  await expect(page.locator("html")).not.toHaveAttribute("data-contrast", "more");

  await openTest(page);
  await expect(page.locator("html")).not.toHaveAttribute("data-contrast", "more");
});

test("a dialog keeps the focus, and gives it back", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard navigation");
  await finishTest(page);

  const opener = page.getByRole("button", { name: /Dónde te frenaste/ });
  await opener.focus();
  // Space presses the focused button instead of starting over
  await page.keyboard.press("Space");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(":focus")).toHaveCount(1);

  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    await expect(dialog.locator(":focus")).toHaveCount(1);
  }
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.locator(":focus")).toHaveCount(1);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
  // Still on the results: Escape and space went to the dialog
  await expect(restartHint(page)).toBeVisible();
});

test("the results are read out", async ({ page }) => {
  await finishTest(page);
  await expect(page.locator("#announcer-polite")).toContainText(
    /Terminaste: \d+ palabras por minuto, \d+ % de precisión, 0 errores\./
  );
});

test("the typing field has a name", async ({ page }) => {
  await openTest(page);
  await expect(page.getByRole("textbox", { name: "Escribí el texto" })).toBeAttached();
});
