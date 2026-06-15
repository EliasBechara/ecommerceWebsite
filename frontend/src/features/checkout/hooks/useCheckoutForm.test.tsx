import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCheckoutForm } from "./useCheckoutForm";

/**
 * Mock react-router
 */
const navigateMock = vi.fn();

vi.mock("react-router-dom", () => ({
    useNavigate: () => navigateMock,
}));

/**
 * Mock RTK Query mutations
 */
const updateAddressMock = vi.fn();
const confirmCheckoutMock = vi.fn();

vi.mock("../api/checkoutApi", () => ({
    useUpdateAddressMutation: () => [
        updateAddressMock,
        { isLoading: false },
    ],
    useConfirmCheckoutMutation: () => [
        confirmCheckoutMock,
        { isLoading: false },
    ],
}));

describe("useCheckoutForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const sessionId = "session-1";

    it("returns handlers and loading states", () => {
        const { result } = renderHook(() =>
            useCheckoutForm(sessionId)
        );

        expect(result.current.onSubmit).toBeDefined();
        expect(result.current.updatingAddress).toBe(false);
        expect(result.current.confirming).toBe(false);
    });

    it("calls updateAddress then confirmCheckout", async () => {
        updateAddressMock.mockReturnValue({
            unwrap: () => Promise.resolve(),
        });

        confirmCheckoutMock.mockReturnValue({
            unwrap: () =>
                Promise.resolve({
                    order: { id: "order-123" },
                }),
        });

        const { result } = renderHook(() =>
            useCheckoutForm(sessionId)
        );

        await act(async () => {
            await result.current.onSubmit("address-1");
        });

        expect(updateAddressMock).toHaveBeenCalledWith({
            sessionId,
            addressId: "address-1",
        });

        expect(confirmCheckoutMock).toHaveBeenCalledWith(
            sessionId
        );

        expect(navigateMock).toHaveBeenCalledWith(
            "/payment/order-123"
        );
    });

    it("does not call confirmCheckout if updateAddress fails", async () => {
        updateAddressMock.mockReturnValue({
            unwrap: () => Promise.reject("error"),
        });

        const { result } = renderHook(() =>
            useCheckoutForm(sessionId)
        );

        await act(async () => {
            await result.current.onSubmit("address-1");
        });

        expect(confirmCheckoutMock).not.toHaveBeenCalled();
        expect(navigateMock).not.toHaveBeenCalled();
    });

    it("does not navigate if confirmCheckout fails", async () => {
        updateAddressMock.mockReturnValue({
            unwrap: () => Promise.resolve(),
        });

        confirmCheckoutMock.mockReturnValue({
            unwrap: () => Promise.reject("error"),
        });

        const { result } = renderHook(() =>
            useCheckoutForm(sessionId)
        );

        await act(async () => {
            await result.current.onSubmit("address-1");
        });

        expect(navigateMock).not.toHaveBeenCalled();
    });

    it("calls onSubmit multiple times safely", async () => {
        updateAddressMock.mockReturnValue({
            unwrap: () => Promise.resolve(),
        });

        confirmCheckoutMock.mockReturnValue({
            unwrap: () =>
                Promise.resolve({
                    order: { id: "order-123" },
                }),
        });

        const { result } = renderHook(() =>
            useCheckoutForm(sessionId)
        );

        await act(async () => {
            await result.current.onSubmit("address-1");
            await result.current.onSubmit("address-2");
        });

        expect(updateAddressMock).toHaveBeenCalledTimes(2);
        expect(confirmCheckoutMock).toHaveBeenCalledTimes(2);
    });
});