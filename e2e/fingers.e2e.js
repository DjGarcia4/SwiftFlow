import { test, expect } from "@playwright/test";
import { referenceText, isPhone, openSettings, closeSettings } from "./helpers";

// "Dedos": the text comes from the chosen fingers' letters only
const openFingersMode = async (page, fingers) => {
  await page.addInitScript((fingers) => {
    localStorage.setItem(
      "swiftflow_config",
      JSON.stringify({
        type: "fingers",
        selectedWords: 25,
        keyboardLayout: "latam",
        fingers,
      })
    );
  }, fingers);
  await page.goto("/");
  await expect(page.locator("[data-char-index]").first()).toBeVisible();
  await expect(page.locator(".z-\\[200\\]")).toHaveCount(0);
};

const onlyLetters = (text, letters) =>
  [...text].every((char) => char === " " || letters.includes(char));

test("types only the chosen fingers' letters", async ({ page }) => {
  await openFingersMode(page, ["left-index"]);
  expect(onlyLetters(await referenceText(page), "rtfgvb")).toBe(true);
});

test("picking fingers on the hands changes the text", async ({ page }) => {
  await openFingersMode(page, ["left-index"]);
  await openSettings(page);
  if (!isPhone(page)) {
    await page.getByRole("button", { name: /Elegir los dedos/ }).click();
  }
  const pinky = page
    .getByRole("button", { name: /^meñique izquierdo/ })
    .locator("visible=true");
  await pinky.click();
  await expect(pinky).toHaveAttribute("aria-pressed", "true");
  // The index finger off: the pinky alone
  await page
    .getByRole("button", { name: /^índice izquierdo/ })
    .locator("visible=true")
    .click();
  await closeSettings(page);
  await expect.poll(async () => onlyLetters(await referenceText(page), "qaz")).toBe(true);
});

test("a whole hand is one tap", async ({ page }) => {
  await openFingersMode(page, ["left-index"]);
  await openSettings(page);
  if (!isPhone(page)) {
    await page.getByRole("button", { name: /Elegir los dedos/ }).click();
  }
  await page
    .getByRole("button", { name: "Mano derecha", exact: true })
    .locator("visible=true")
    .click();
  await closeSettings(page);
  await expect
    .poll(async () => onlyLetters(await referenceText(page), "yuhjnmiklopñ"))
    .toBe(true);
});
