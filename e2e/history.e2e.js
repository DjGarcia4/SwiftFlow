import { test, expect } from "@playwright/test";
import { openTest, setUpShortWordsTest, typeAll, restartHint } from "./helpers";

test("a finished test is in the history, and still is after a reload", async ({
  page,
}) => {
  await page.goto("/historial");
  await expect(page.getByText("Todavía no completaste ningún test.")).toBeVisible();

  await openTest(page);
  await setUpShortWordsTest(page);
  await typeAll(page);
  await expect(restartHint(page)).toBeVisible();

  await page.goto("/historial");
  await expect(page.getByRole("heading", { name: "Historial" })).toBeVisible();
  await expect(page.getByText("Todavía no completaste ningún test.")).toHaveCount(0);

  await page.reload();
  await expect(page.getByText("Todavía no completaste ningún test.")).toHaveCount(0);
});
