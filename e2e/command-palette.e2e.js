import { test, expect } from "@playwright/test";
import { openTest, isPhone, expectChosen, typeAll, restartHint } from "./helpers";

// A keyboard to press the keys on: a phone has none
test.beforeEach(({ page }) => {
  test.skip(isPhone(page), "keyboard shortcuts");
});

const palette = (page) => page.getByTestId("command-palette");

const runCommand = async (page, query) => {
  await page.keyboard.press("Control+k");
  await expect(palette(page)).toBeVisible();
  await page.keyboard.type(query);
  await page.keyboard.press("Enter");
  await expect(palette(page)).toBeHidden();
};

test("changes the test from the keyboard, and back to typing", async ({ page }) => {
  await openTest(page);

  await runCommand(page, "30");
  await expectChosen(page, "Modo", "Tiempo");
  await expectChosen(page, "Duración", "30s");

  await runCommand(page, "pal 50");
  await expectChosen(page, "Modo", "Palabras");
  await expectChosen(page, "Cantidad", "50");

  // Focus is back on the text: typing starts the run
  await expect(page.locator("textarea")).toBeFocused();
  await page.keyboard.type("x");
  await expect(page.locator("textarea")).toHaveValue("x");
});

test("Esc closes it, and the arrows pick", async ({ page }) => {
  await openTest(page);
  await page.keyboard.press("Control+k");
  await page.keyboard.type("tiempo");
  await page.keyboard.press("ArrowDown");
  await expect(palette(page).getByRole("option", { selected: true })).toContainText(
    "30 s"
  );
  await page.keyboard.press("Escape");
  await expect(palette(page)).toBeHidden();
  await expectChosen(page, "Duración", "15s");
});

test("Tab starts over mid-run", async ({ page }) => {
  await openTest(page);
  const field = page.locator("textarea");
  await field.focus();
  await page.keyboard.type("ab");
  await expect(field).not.toHaveValue("");
  await page.keyboard.press("Tab");
  await expect(field).toHaveValue("");
  await expect(field).toBeFocused();
});

test("a run set up and played on the keyboard alone earns its achievement", async ({
  page,
}) => {
  await openTest(page);
  await runCommand(page, "palabras 10");
  const punctuation = page
    .getByRole("button", { name: /Puntuación/ })
    .locator("visible=true")
    .first();
  if ((await punctuation.getAttribute("aria-pressed")) === "true") {
    await runCommand(page, "puntuacion");
  }
  await expect(punctuation).toHaveAttribute("aria-pressed", "false");

  await typeAll(page);
  await expect(restartHint(page)).toBeVisible();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("swiftflow_results") ?? "[]")
  );
  expect(saved[0].keyboard).toBe(true);

  // Touching the mouse after that: the next run isn't keyboard-only
  await page.mouse.click(5, 300);
  // Space starts over only once the results have had a second to be seen
  await page.waitForTimeout(1100);
  await page.keyboard.press(" ");
  await typeAll(page);
  await expect(restartHint(page)).toBeVisible();
  const again = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("swiftflow_results") ?? "[]")
  );
  expect(again).toHaveLength(2);
  expect(again[0].keyboard).toBeUndefined();
});

test("? lists the shortcuts away from the test", async ({ page }) => {
  await page.goto("/historial");
  await expect(page.locator(".z-\\[200\\]")).toHaveCount(0);
  await page.keyboard.press("?");
  await expect(palette(page).getByText("Atajos de teclado")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(palette(page)).toBeHidden();
});
