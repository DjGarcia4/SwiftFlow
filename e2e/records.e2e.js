import { test, expect } from "@playwright/test";

// "Tus récords": every category, a record to race or one to set
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem("seeded")) return;
    localStorage.setItem("seeded", "1");
    const run = (mode, modeValue, wpm, i) => ({
      id: `r${i}`,
      mode,
      modeValue,
      wpm,
      rawWpm: wpm + 4,
      accuracy: 96,
      errors: 2,
      timeElapsed: 30,
      metricsVersion: 3,
      date: new Date(Date.now() - i * 864e5).toISOString(),
    });
    localStorage.setItem(
      "swiftflow_results",
      JSON.stringify([
        run("time", 15, 72, 1),
        run("zen", null, 55, 2),
        run("time", 15, 60, 3),
      ])
    );
  });
  await page.goto("/historial");
});

test("the best of all up top, and each category's record", async ({ page }) => {
  const records = page.locator("#capitulo-records");
  await expect(records.getByText("Tu mejor marca")).toBeVisible();
  await expect(records.getByText("Tenés récord en 2 de")).toBeVisible();
  await expect(
    records.getByRole("button", { name: "Retar tu récord de Tiempo (15 s): 72 wpm" })
  ).toBeVisible();
  await expect(
    records.getByRole("button", { name: "Estrenar Tiempo (60 s)" })
  ).toBeVisible();
});

test("racing a record sets up that category with the pacer at its speed", async ({
  page,
}) => {
  await page
    .locator("#capitulo-records")
    .getByRole("button", { name: /^Retar tu récord de Zen/ })
    .click();
  await expect(page).toHaveURL(/\/$/);
  const config = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("swiftflow_config"))
  );
  expect(config.type).toBe("zen");
  expect(config.pacerWpm).toBe(55);
});

test("a category with no record opens it to set the first", async ({ page }) => {
  await page
    .locator("#capitulo-records")
    .getByRole("button", { name: "Estrenar Palabras (50)" })
    .click();
  await expect(page).toHaveURL(/\/$/);
  const config = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("swiftflow_config"))
  );
  expect(config.type).toBe("words");
  expect(config.selectedWords).toBe(50);
});
