import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// A week, one session a day, at a steady speed but for one off day
const week = () =>
  [60, 62, 59, 61, 48, 60, 61].map((wpm, daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(12, 0, 0, 0);
    return {
      id: `d${daysAgo}`,
      date: date.toISOString(),
      metricsVersion: 3,
      mode: "time",
      modeValue: 30,
      wpm,
      accuracy: 96,
      errors: 1,
      timeElapsed: 30,
    };
  });

test.beforeEach(async ({ page }) => {
  await page.addInitScript((results) => {
    if (!localStorage.getItem("swiftflow_results")) {
      localStorage.setItem("swiftflow_results", JSON.stringify(results));
    }
  }, week());
  await page.goto("/historial");
});

test("the history says how steady the days are", async ({ page }) => {
  await expect(page.getByText("Qué tan parejo sos")).toBeVisible();
  await expect(page.getByText("de un día al otro · 30s")).toBeVisible();
  await expect(page.getByText(/Tus días van de 48 a 62 wpm/)).toBeVisible();

  // Each day tells its own numbers, by pointer or by keyboard
  const offDay = page.getByRole("button", { name: /48 wpm en 1 partida/ });
  await offDay.focus();
  await expect(
    page.locator("div[aria-hidden='true']", { hasText: "48 wpm en 1 partida" })
  ).toBeVisible();
});

test("the card passes the accessibility checks", async ({ page, isMobile }) => {
  test.skip(isMobile, "checked once");
  await expect(page.getByText("Qué tan parejo sos")).toBeVisible();
  await page.waitForTimeout(1500);
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .include("section, main, body")
    .disableRules(["color-contrast"])
    .analyze();
  expect(
    violations.map(
      (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`
    )
  ).toEqual([]);
});
