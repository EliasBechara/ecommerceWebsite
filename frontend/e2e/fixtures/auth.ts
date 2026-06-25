import { test as base, expect, type Page } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

export type AuthenticatedUser = {
  email: string;
  password: string;
};

async function registerAndLogin(page: Page): Promise<AuthenticatedUser> {
  const email = `testuser+${Date.now()}@example.com`;
  const password = "Test1234!";

  // Start from the landing page
  await page.goto(`${BASE_URL}/`);
  const firstProductCard = page.locator("article").first();
  await expect(firstProductCard).toBeVisible();

  // Navigate to login
  await page.getByRole("link", { name: /log in/i }).click();
  await expect(page).toHaveURL(/login/);

  // Navigate to register
  await page.getByRole("button", { name: /register/i }).click();
  await expect(page).toHaveURL(/register/);

  // Fill in the registration form
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel(/confirm password/i).fill(password);
  await page.getByRole("button", { name: /create account/i }).click();

  // Should redirect to login after registration
  await expect(page).toHaveURL(/login/);

  // Log in with the new account
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();

  // Should land on home with authenticated nav
  await expect(page).toHaveURL(`${BASE_URL}/`);
  await expect(page.getByRole("link", { name: "Account", exact: true })).toBeVisible();

  return { email, password };
}

// Extend the base test object with the fixture
export const test = base.extend<{
  authenticatedUser: AuthenticatedUser;
}>({
  authenticatedUser: async ({ page }, use) => {
    const credentials = await registerAndLogin(page);
    await use(credentials);
    // Teardown: nothing required — each test gets a fresh unique user
  },
});

export { expect };