import { test, expect } from "@playwright/test";

// Twenty sessions, newest first: the ñ got better, the q got worse
const history = () => {
  const day = 24 * 60 * 60 * 1000;
  return Array.from({ length: 20 }, (_, i) => {
    const recent = i < 10;
    return {
      id: `s${i}`,
      date: new Date(Date.now() - i * day).toISOString(),
      metricsVersion: 3,
      mode: "time",
      modeValue: 30,
      wpm: 50,
      accuracy: 95,
      errors: 1,
      timeElapsed: 30,
      keyAttempts: { ñ: 10, q: 10, e: 60 },
      missedKeys: { ñ: recent ? 0 : 2, q: recent ? 2 : 0, e: 1 },
    };
  });
};

test("the history says which keys got better and which got worse", async ({ page }) => {
  await page.addInitScript((results) => {
    if (!localStorage.getItem("swiftflow_results")) {
      localStorage.setItem("swiftflow_results", JSON.stringify(results));
    }
  }, history());
  await page.goto("/historial");

  await expect(page.getByText("Cómo van tus teclas")).toBeVisible();
  await expect(page.getByText("últimas 10 contra las 10 anteriores")).toBeVisible();
  await expect(page.getByText("Mejoraste")).toBeVisible();
  await expect(page.locator("li", { hasText: /^\s*ñ/ })).toContainText(
    /20%\s*→\s*a?\s*0%/
  );
  await expect(page.locator("li", { hasText: /^\s*q/ })).toContainText(
    /0%\s*→\s*a?\s*20%/
  );
});
