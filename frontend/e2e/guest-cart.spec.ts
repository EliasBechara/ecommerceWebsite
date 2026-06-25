import { test, expect } from "@playwright/test";

test("guest user can add a product to the cart and begin checkout", async ({
    page,
}) => {
    // User arrives at the storefront
    await page.goto("http://localhost:5173/");

    const firstProductCard = page.locator("article").first();

    await expect(firstProductCard).toBeVisible();

    // User discovers a product and adds it to their cart
    await firstProductCard.hover();

    await firstProductCard
        .getByRole("button", {
            name: /add to cart/i,
        })
        .click();

    // User opens their cart
    const cartButton = page.getByRole("button", {
        name: /cart/i,
    });

    await cartButton.click();

    // User is able to proceed to checkout
    const checkoutButton = page.getByRole("button", {
        name: /checkout/i,
    });

    await expect(checkoutButton).toBeEnabled();

    // User starts checkout
    await checkoutButton.click();

    // User is redirected to login flow
    await expect(page).toHaveURL(/login/);
});