import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePayment } from "./usePayment";
import { clearCart } from "../../cart/cartSlice";

const mockNavigate = vi.fn();
const mockDispatch = vi.fn();

const mockCreatePayment = vi.fn();
const mockConfirmPayment = vi.fn();

let mockOrderId: string | undefined = "order-1";

vi.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
    useParams: () => ({ orderId: mockOrderId }),
}));

vi.mock("react-redux", () => ({
    useDispatch: () => mockDispatch,
}));

vi.mock("../../order/api/orderApi", () => ({
    useGetOrderByIdQuery: () => ({
        data: { id: "order-1", total: 100 },
        isLoading: false,
        error: null,
    }),
}));

vi.mock("../api/paymentApi", () => ({
    useCreatePaymentMutation: () => [mockCreatePayment, { isLoading: false }],
    useConfirmPaymentMutation: () => [mockConfirmPayment, { isLoading: false }],
}));


describe("usePayment", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockOrderId = "order-1";
    });

    it("initial state is correct", () => {
        const { result } = renderHook(() => usePayment());

        expect(result.current.selectedMethod).toBe("PIX");
        expect(result.current.isProcessing).toBe(false);
    });

    it("updates selected method", () => {
        const { result } = renderHook(() => usePayment());

        act(() => {
            result.current.setSelectedMethod("BOLETO");
        });

        expect(result.current.selectedMethod).toBe("BOLETO");
    });

    it("executes full payment flow successfully", async () => {

        mockCreatePayment.mockReturnValue({
            unwrap: () =>
                Promise.resolve({
                    id: "payment-1",
                    providerReference: "ref-123",
                }),
        });

        mockConfirmPayment.mockReturnValue({
            unwrap: () => Promise.resolve({}),
        });

        const { result } = renderHook(() => usePayment());

        await act(async () => {
            await result.current.handlePayment();
        });

        expect(mockCreatePayment).toHaveBeenCalledWith({
            orderId: "order-1",
            method: "PIX",
            currency: "BRL",
        });

        expect(mockConfirmPayment).toHaveBeenCalledWith({
            paymentId: "payment-1",
            data: {
                paymentId: "payment-1",
                providerReference: "ref-123",
            },
        });

        expect(mockDispatch).toHaveBeenCalledWith(clearCart());
        expect(mockNavigate).toHaveBeenCalledWith(
            "/orders/success/order-1"
        );
    });

    it("does not proceed if orderId is missing", async () => {
        mockOrderId = undefined;

        const { result } = renderHook(() => usePayment());

        await act(async () => {
            await result.current.handlePayment();
        });

        expect(mockCreatePayment).not.toHaveBeenCalled();
        expect(mockConfirmPayment).not.toHaveBeenCalled();
    });

    it("does not navigate on error", async () => {
        mockCreatePayment.mockReturnValue({
            unwrap: () => Promise.reject(new Error("fail")),
        });

        const { result } = renderHook(() => usePayment());

        await act(async () => {
            await result.current.handlePayment();
        });

        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalledWith(clearCart());
    });
});