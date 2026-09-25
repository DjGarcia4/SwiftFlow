import { test, expect } from "@playwright/test";
import { referenceText, restartHint } from "./helpers";

test("a lesson from the course is started, passed, and opens the next", async ({
  page,
}) => {
  await page.goto("/curso");
  await expect(
    page.getByRole("heading", { name: "Aprendé a escribir sin mirar" })
  ).toBeVisible();
  await expect(page.getByText("0 de 24 lecciones")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /^Lección 2:.*Bloqueada/ })
  ).toBeDisabled();

  await page.getByRole("button", { name: /Empezar: lección 1/ }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText("Lección 1 de 24")).toBeVisible();

  const text = await referenceText(page);
  expect(text).toMatch(/^[fj ]+$/);
  await page.locator("textarea").focus();
  await page.keyboard.type(text);
  await expect(restartHint(page)).toBeVisible();
  await expect(page.getByText("¡Perfecto!")).toBeVisible();

  await page.getByRole("button", { name: /Siguiente lección/ }).click();
  await expect(page.getByText("Lección 2 de 24")).toBeVisible();
  expect(await referenceText(page)).toMatch(/^[fjdk ]+$/);

  await page.goto("/curso");
  await expect(page.getByText("1 de 24 lecciones")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /^Lección 1:.*3 de 3 estrellas/ })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /^Lección 2:.*Sin hacer/ })
  ).toBeEnabled();
});

test("a first-timer is invited to the course, until they say no", async ({ page }) => {
  await page.goto("/");
  const invite = page.getByText("¿Recién empezás?");
  await expect(invite).toBeVisible();
  await page.getByRole("button", { name: "No, gracias" }).click();
  await expect(invite).toBeHidden();
  await page.reload();
  await expect(page.locator("[data-char-index]").first()).toBeVisible();
  await expect(invite).toBeHidden();
});
