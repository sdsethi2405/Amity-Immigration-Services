import { expect, test } from "@playwright/test";

test.describe("public smoke", () => {
  test("contact form page loads", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByRole("button", { name: /send enquiry/i })).toBeVisible();
  });

  test("admin login page loads", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(
      page.getByRole("heading", { name: "Admin Login" }),
    ).toBeVisible();
    await expect(page.getByLabel("Username")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("honeypot field present and hidden", async ({ page }) => {
    await page.goto("/contact");
    const honeypot = page.locator('form input[name="website"]');
    await expect(honeypot.first()).toBeAttached();
    const count = await honeypot.count();
    expect(count).toBeGreaterThanOrEqual(1);
    for (let index = 0; index < count; index += 1) {
      await expect(honeypot.nth(index)).toBeHidden();
    }
  });
});
