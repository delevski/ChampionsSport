import { test, expect } from "@playwright/test";

test("login page loads in Hebrew RTL", async ({ page }) => {
  await page.goto("http://localhost:3000/he/login");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByText("ChampionsSport")).toBeVisible();
  await expect(page.getByText("התחברות")).toBeVisible();
});
