import { test, expect } from "@playwright/test";
import { isPhone } from "./helpers";

// The history in chapters, with a guide that marks where you are
const seed = () => {
  if (localStorage.getItem("seeded")) return;
  localStorage.setItem("seeded", "1");
  const letters = [..."qwertyuiopasdfghjklñzxcvbnm"];
  const now = Date.now();
  const run = (i, missed) => ({
    id: "r" + i,
    mode: i % 3 ? "time" : "words",
    modeValue: i % 3 ? 30 : 25,
    wpm: 50 + (i % 9),
    rawWpm: 58,
    accuracy: 94 + (i % 5),
    errors: 3,
    timeElapsed: 30,
    metricsVersion: 3,
    insightsVersion: 1,
    date: new Date(now - i * 36e6).toISOString(),
    keyAttempts: Object.fromEntries(letters.map((k) => [k, 12])),
    missedKeys: missed,
    keyTiming: Object.fromEntries(
      letters.map((k) => [k, [("ik".includes(k) ? 230 : 150) * 12, 12]])
    ),
  });
  localStorage.setItem(
    "swiftflow_results",
    JSON.stringify([
      ...Array.from({ length: 20 }, (_, i) => run(i, { q: 2, a: 2, z: 1, w: 1, e: 1 })),
      ...Array.from({ length: 20 }, (_, i) => run(i + 20, { q: 4, a: 4, z: 3, w: 1 })),
    ])
  );
};

test("the history goes by chapters, and the guide follows along", async ({ page }) => {
  await page.addInitScript(seed);
  await page.goto("/historial");
  const guide = page.getByRole("navigation", { name: "En esta página" });
  const chapter = (name) => guide.getByRole("link", { name }).locator("visible=true");

  await expect(chapter(/Tu nivel/)).toHaveAttribute("aria-current", "location");
  await chapter(/Tus dedos/).click();
  await expect(chapter(/Tus dedos/)).toHaveAttribute("aria-current", "location");
  await expect(
    page.getByRole("heading", { name: "Tus dedos", level: 2 })
  ).toBeInViewport();

  // The number keys, where there's a keyboard
  if (!isPhone(page)) {
    await page.keyboard.press("9");
    await expect(
      page.getByRole("heading", { name: "Tus partidas", level: 2 })
    ).toBeInViewport();
    await page.keyboard.press("2");
    await expect(page.getByRole("heading", { name: "Hoy", level: 2 })).toBeInViewport();
    await expect(chapter(/Hoy/)).toHaveAttribute("aria-current", "location");
  }
  // The page itself never scrolls: only the app's box does
  expect(await page.evaluate(() => document.documentElement.scrollTop)).toBe(0);
});
