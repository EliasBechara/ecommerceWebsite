import { test, expect } from "./fixtures/auth";
import { defaultAddress, fillAddressForm } from "./fixtures/fillAddressForm";

test("A logged in user goes to through the whole flow of buying a product", async ({ page, authenticatedUser }) => {

    // ── 1. DISCOVER A PRODUCT ────────────────────────────────────────────────
    const firstProductCard = page.locator("article").first();
    await expect(firstProductCard).toBeVisible();

    await firstProductCard.hover();
    await firstProductCard
        .getByRole("button", { name: /add to cart/i })
        .click();

    // ── 2. OPEN CART AND PROCEED TO CHECKOUT ─────────────────────────────────
    await page.getByTestId('cart-button').click();

    const checkoutButton = page.getByRole("button", { name: /checkout/i });
    await expect(checkoutButton).toBeEnabled();
    await checkoutButton.click();

    // ── 3. FILL SHIPPING ADDRESS FORM ────────────────────────────────────────
    await fillAddressForm(page);

    // Or with custom data:
    await fillAddressForm(page, {
        ...defaultAddress,
        recipientName: "Jane Smith",
        complement: "",
    });

    await page.getByTestId('submit-adress-form').click();

    // Confirm address was saved (edit button appears)
    await expect(page.getByTestId("edit-address-button").first()).toBeVisible();

    // ── 4. PLACE THE ORDER ───────────────────────────────────────────────────
    await page.getByTestId('place-order-button').click();

    // Should redirect to payment page
    await expect(page).toHaveURL(/\/payment\/[a-f0-9-]+$/);
    await expect(page.getByTestId("payment-page-title")).toBeVisible();

    // ── 5. COMPLETE PAYMENT ──────────────────────────────────────────────────
    await page.getByTestId('payNowButton').click();

    // Should redirect to order success page
    await expect(page).toHaveURL(/\/orders\/success\/[a-f0-9-]+$/);
    await expect(page.getByTestId("payment-success-title")).toBeVisible();

    // ── 6. VIEW ORDER DETAILS ────────────────────────────────────────────────
    await page.getByTestId('view-order-button').click();

    // URL should match /orders/:orderId
    await expect(page).toHaveURL(/\/orders\/[a-f0-9-]+$/);

    // Order header: ID and status
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: /status/i })).toBeVisible();

    // Order summary: total amount
    await expect(page.locator('p').filter({ hasText: /total/i })).toBeVisible();

    // Items section: header + at least one item with quantity
    await expect(page.getByRole('heading', { level: 2, name: /items/i })).toBeVisible();
    const firstItem = page.locator('div').filter({ hasText: /quantity/i }).first();
    await expect(firstItem).toBeVisible();
});