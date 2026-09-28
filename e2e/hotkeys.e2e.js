import { test, expect } from "@playwright/test";
import { openTest, isPhone, setUpShortWordsTest, typeAll, restartHint } from "./helpers";

// The key beside each button: a phone has no keyboard to press it on
test.beforeEach(({ page }) => {
  test.skip(isPhone(page), "keyboard shortcuts");
});

const challengesPill = (page) => page.getByRole("button", { name: /retos de hoy/i });

test("on the test, a button's key takes Alt, and the chip says so", async ({ page }) => {
  await openTest(page);
  const pill = challengesPill(page);
  await expect(pill.locator("[data-key-hint]")).toHaveText(/Alt L|⌥L/);

  // Alt+L opens the challenges without typing anything
  const field = page.locator("textarea");
  await field.focus();
  await page.keyboard.press("Alt+KeyL");
  await expect(pill).toHaveAttribute("aria-expanded", "true");
  await expect(field).toHaveValue("");
  await page.keyboard.press("Alt+KeyL");
  await expect(pill).toHaveAttribute("aria-expanded", "false");

  // A plain L is typing
  await field.focus();
  await page.keyboard.press("l");
  await expect(field).toHaveValue("l");
  await expect(pill).toHaveAttribute("aria-expanded", "false");
});

test("on the results, the letter alone presses the button", async ({ page }) => {
  await openTest(page);
  await setUpShortWordsTest(page);
  await typeAll(page);
  await expect(restartHint(page)).toBeVisible();

  await expect(challengesPill(page).locator("[data-key-hint]")).toHaveText("L");
  await page.keyboard.press("l");
  await expect(challengesPill(page)).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");

  // F: where you slowed down
  await page.keyboard.press("f");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();

  // R: a new text
  await page.keyboard.press("r");
  await expect(restartHint(page)).toBeHidden();
});

test("the palette opens the challenges from another page", async ({ page }) => {
  await page.goto("/historial");
  await page.keyboard.press("Control+k");
  await page.keyboard.type("retos del dia");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/$/);
  await expect(challengesPill(page)).toHaveAttribute("aria-expanded", "true");
});

test("the nav's keys work away from the test", async ({ page }) => {
  await page.goto("/sobre");
  await page.keyboard.press("h");
  await expect(page).toHaveURL(/\/historial$/);
  await page.keyboard.press("o");
  await expect(page).toHaveURL(/\/curso$/);
  await expect(page.getByText("Aprendé a escribir sin mirar")).toBeVisible();
  // S: on with the course
  await page.keyboard.press("s");
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page
      .getByText(/Lección 1/)
      .locator("visible=true")
      .first()
  ).toBeVisible();
});

test("Esc after stopping to think pauses, and only a second Esc ends", async ({
  page,
}) => {
  await openTest(page);
  const field = page.locator("textarea");
  await field.focus();
  await page.keyboard.press("l");
  // Three idle seconds pause the run by themselves
  await page.waitForTimeout(3300);
  await page.keyboard.press("Escape");
  await expect(field).toHaveValue("l");
  await expect(page.getByText(/terminada antes/)).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByText(/terminada antes/)).toBeVisible();
});
