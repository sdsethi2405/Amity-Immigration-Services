import { expect, test } from "@playwright/test";

test.describe("public smoke", () => {
  test("contact form page loads", async ({ page }) => {
    await page.goto("/contact");
    await expect(
      page.getByRole("heading", { name: /thank you for your enquiry/i }).or(
        page.getByLabel("Name"),
      ),
    ).toBeVisible();
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByRole("button", { name: /send enquiry/i })).toBeVisible();
  });

  test("admin login page loads", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(
      page.getByRole("heading", { name: /sign in|admin|amity/i }).or(
        page.getByLabel("Username"),
      ),
    ).toBeVisible();
    await expect(page.getByLabel("Username")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("honeypot field present and hidden", async ({ page }) => {
    await page.goto("/contact");
    const honeypot = page.locator('input[name="website"]');
    await expect(honeypot).toHaveCount(1);
    await expect(honeypot).toBeHidden();
  });
});
