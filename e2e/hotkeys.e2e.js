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

  // Keys still in flight as it ends go nowhere, and the chips wait too
  await page.keyboard.press("f");
  await page.keyboard.press(" ");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.locator("[data-key-hint]").first()).toBeHidden();

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

test("the settings bar from the keyboard: mode, count, the mode's chip, options", async ({
  page,
}) => {
  await openTest(page);
  const field = page.locator("textarea");
  await field.focus();

  // ⌥M opens the modes, the arrows and Enter pick one
  await page.keyboard.press("Alt+KeyM");
  const menu = page.getByRole("radiogroup", { name: "Modo" });
  await expect(menu).toBeVisible();
  await menu.getByRole("radio", { name: "Dedos" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-mode-button]")).toHaveAccessibleName(
    "Modo: Dedos. Cambiar de modo"
  );

  // ⌥3: the third count, 50
  await page.keyboard.press("Alt+Digit3");
  await expect(
    page.getByRole("radiogroup", { name: "Cantidad" }).getByRole("radio", { name: "50" })
  ).toHaveAttribute("aria-checked", "true");

  // ⌥J: the fingers
  await page.keyboard.press("Alt+KeyJ");
  await expect(
    page.getByRole("button", { name: "Mano derecha", exact: true })
  ).toBeVisible();
  await page.keyboard.press("Escape");

  // ⌥W: the options, focus on the first one
  await page.keyboard.press("Alt+KeyW");
  await expect(page.getByRole("button", { name: /^Sin red/ })).toBeVisible();

  // None of it typed a thing
  await expect(field).toHaveValue("");
});

test("inside each menu, one key per option", async ({ page }) => {
  await openTest(page);
  const field = page.locator("textarea");
  await field.focus();

  // The modes: F for Dedos
  await page.keyboard.press("Alt+KeyM");
  await page.keyboard.press("f");
  await expect(page.locator("[data-mode-button]")).toHaveAccessibleName(
    "Modo: Dedos. Cambiar de modo"
  );

  // The fingers: 5 for the pinkies, then S (where the left ring finger
  // rests) adds that one
  await page.keyboard.press("Alt+KeyJ");
  await page.keyboard.press("5");
  await page.keyboard.press("s");
  const pressed = (name) =>
    page.getByRole("button", { name: new RegExp(`^${name}`) }).locator("visible=true");
  await expect(pressed("meñique izquierdo")).toHaveAttribute("aria-pressed", "true");
  await expect(pressed("anular izquierdo")).toHaveAttribute("aria-pressed", "true");
  await expect(pressed("índice izquierdo")).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press("Escape");

  // The options: S for "sin red", 9 for 90% at least
  await page.keyboard.press("Alt+KeyW");
  await page.keyboard.press("s");
  await page.keyboard.press("9");
  const config = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("swiftflow_config"))
  );
  expect(config.blindMode).toBe(true);
  expect(config.minAccuracy).toBe(90);
  expect(config.fingers).toEqual(["left-pinky", "left-ring", "right-pinky"]);

  // Not a letter of it reached the text
  await expect(field).toHaveValue("");
});

test("the challenges' play buttons are numbered", async ({ page }) => {
  await openTest(page);
  await page.locator("textarea").focus();
  await page.keyboard.press("Alt+KeyL");
  const weekly = page.getByRole("button", { name: /Jugar|Mejorar/ }).last();
  const key = await weekly.getAttribute("data-play-key");
  await expect(weekly.locator("[data-key-cap]")).toHaveText(key);
  await page.keyboard.press(key);
  await expect(page.locator("[data-mode-button]")).toHaveAccessibleName(
    "Modo: Semanal. Cambiar de modo"
  );
  await expect(page.locator("textarea")).toHaveValue("");
});

test("paused: P picks it back up, and in zen the finish button says Esc", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("swiftflow_config", JSON.stringify({ type: "zen" }))
  );
  await openTest(page);
  const field = page.locator("textarea");
  await field.focus();
  await page.keyboard.type("ab");
  await page.keyboard.press("Escape");

  const finish = page.getByRole("button", { name: "Terminar" });
  await expect(finish).toHaveAttribute("aria-keyshortcuts", "Escape");
  await page.keyboard.press("Alt+KeyP");
  // Going again: the buttons step aside while typing
  await expect(page.getByRole("button", { name: "Continuar" })).toBeHidden();
  await expect(field).toHaveValue("ab");
});
