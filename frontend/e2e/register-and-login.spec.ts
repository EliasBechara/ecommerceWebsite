import { test, expect } from "@playwright/test";

test("user enters landing page and goes to register and login flow", async ({
    page,
}) => {
    // User arrives at the storefront
    await page.goto("http://localhost:5173/");
    const firstProductCard = page.locator("article").first();
    await expect(firstProductCard).toBeVisible();

    // User clicks Log in
    await page.getByRole("link", { name: /log in/i }).click();
    await expect(page).toHaveURL(/login/);

    // User navigates to register from the login
    await page.getByRole("button", { name: /register/i }).click();
    await expect(page).toHaveURL(/register/);

    // User fills in the registration form
    const testEmail = `testuser+${Date.now()}@example.com`;
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByLabel("Password", { exact: true }).fill("Test1234!");
    await page.getByLabel(/confirm password/i).fill("Test1234!");
    await page.getByRole("button", { name: /create account/i }).click();

    // User is redirected to login after registration
    await expect(page).toHaveURL(/login/);

    // User logs in with the newly created account
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByLabel(/password/i).fill("Test1234!");
    await page.getByRole("button", { name: /sign in/i }).click();

    // User is redirected to home and navbar reflects authenticated state
    await expect(page).toHaveURL("http://localhost:5173/");
    await expect(page.getByRole("link", { name: /account/i })).toBeVisible();
});