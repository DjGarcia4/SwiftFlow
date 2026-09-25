import { test, expect } from "@playwright/test";

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

// Four sessions this month, faster than last month's two
const history = () => {
  const now = new Date();
  const at = (monthsBack, day, wpm) => ({
    id: `s${monthsBack}-${day}`,
    date: new Date(now.getFullYear(), now.getMonth() - monthsBack, day, 12).toISOString(),
    metricsVersion: 3,
    mode: "time",
    modeValue: 30,
    wpm,
    accuracy: 96,
    errors: 1,
    timeElapsed: 30,
  });
  return [
    at(0, 1, 60),
    at(0, 1, 62),
    at(0, 2, 64),
    at(0, 3, 58),
    at(1, 10, 50),
    at(1, 11, 52),
  ];
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((results) => {
    if (!localStorage.getItem("swiftflow_results")) {
      localStorage.setItem("swiftflow_results", JSON.stringify(results));
    }
  }, history());
});

test("the month's summary tells the story, and can be shared", async ({ page }) => {
  const now = new Date();
  await page.goto("/historial");
  await page
    .getByRole("link", { name: new RegExp(`Tu resumen de ${MONTHS[now.getMonth()]}`) })
    .click();

  await expect(
    page.getByRole("heading", {
      name: `Tu ${MONTHS[now.getMonth()]} de ${now.getFullYear()}`,
    })
  ).toBeVisible();
  await expect(page.getByText("partidas", { exact: true })).toBeVisible();
  await expect(page.getByText("Récord", { exact: true })).toBeVisible();
  await expect(page.getByText(/más rápido que el período anterior/)).toBeVisible();
  await expect(page.getByText("Tu modo favorito")).toBeVisible();

  await page.getByRole("button", { name: /Compartir mi resumen/ }).click();
  const dialog = page.getByRole("dialog", { name: "Compartir resumen" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("img")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("the summary switches to the whole year", async ({ page }) => {
  const now = new Date();
  await page.goto("/resumen");
  await page.getByLabel("Período").selectOption(`${now.getFullYear()}`);
  await expect(page).toHaveURL(new RegExp(`periodo=${now.getFullYear()}$`));
  await expect(
    page.getByRole("heading", { name: `Tu ${now.getFullYear()}` })
  ).toBeVisible();
});
