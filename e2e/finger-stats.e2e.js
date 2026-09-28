import { test, expect } from "@playwright/test";

// "Tus dedos": each finger's misses and speed, and the one lagging behind
// straight into practice
test("the history shows each finger, and sends the weak one to practice", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (localStorage.getItem("seeded")) return;
    localStorage.setItem("seeded", "1");
    localStorage.setItem("swiftflow_config", JSON.stringify({ keyboardLayout: "latam" }));
    const letters = [..."qwertyuiopasdfghjklñzxcvbnm"];
    const results = Array.from({ length: 12 }, (_, i) => ({
      mode: "time",
      modeValue: 30,
      wpm: 50,
      rawWpm: 55,
      accuracy: 95,
      errors: 3,
      timeElapsed: 30,
      metricsVersion: 3,
      insightsVersion: 1,
      date: new Date(Date.now() - i * 36e5).toISOString(),
      keyAttempts: Object.fromEntries(letters.map((k) => [k, 12])),
      missedKeys: { q: 3, a: 2, z: 2 },
    }));
    localStorage.setItem("swiftflow_results", JSON.stringify(results));
  });
  await page.goto("/historial");

  await expect(page.getByRole("heading", { name: "Tus dedos", level: 2 })).toBeVisible();
  await expect(
    page.getByRole("img", { name: /^meñique izquierdo\. 19% de error/ })
  ).toBeVisible();
  await page.getByRole("button", { name: "Practicar el meñique izquierdo" }).click();

  await expect(page).toHaveURL(/\/$/);
  const config = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("swiftflow_config"))
  );
  expect(config.type).toBe("fingers");
  expect(config.fingers).toEqual(["left-pinky"]);
});
