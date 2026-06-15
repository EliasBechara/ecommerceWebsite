/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PaymentSuccessPage } from "./OrderSucess";

vi.mock("react-router-dom", () => ({
    useParams: () => ({ orderId: "order-1" }),
    Link: ({ to, children }: any) => <a href={to}>{children}</a>,
}));

const useGetOrderByIdQueryMock = vi.fn();

vi.mock("../../order/api/orderApi", () => ({
    useGetOrderByIdQuery: () => useGetOrderByIdQueryMock(),
}));

vi.mock("../../../components/layout/PageLayout", () => ({
    PageLayout: ({ children }: any) => <div>{children}</div>,
}));


const baseOrder = {
    id: "order-1",
    status: "CONFIRMED",
    total: 99.9,
};

describe("PaymentSuccessPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders loading state", () => {
        useGetOrderByIdQueryMock.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        });

        render(<PaymentSuccessPage />);

        expect(screen.getByText("Loading order...")).toBeInTheDocument();
    });

    it("renders error state", () => {
        useGetOrderByIdQueryMock.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        });

        render(<PaymentSuccessPage />);

        expect(screen.getByText("Failed to load order.")).toBeInTheDocument();
    });

    it("renders success content", () => {
        useGetOrderByIdQueryMock.mockReturnValue({
            data: baseOrder,
            isLoading: false,
            isError: false,
        });

        render(<PaymentSuccessPage />);

        expect(screen.getByText("Payment confirmed")).toBeInTheDocument();
        expect(screen.getByText("Thank you for your purchase. Your order has been received and is being processed.")).toBeInTheDocument();

        expect(screen.getByText("#order-1")).toBeInTheDocument();
        expect(screen.getByText("CONFIRMED")).toBeInTheDocument();
        expect(screen.getByText("$99.90")).toBeInTheDocument();
    });

    it("renders navigation links", () => {
        useGetOrderByIdQueryMock.mockReturnValue({
            data: baseOrder,
            isLoading: false,
            isError: false,
        });

        render(<PaymentSuccessPage />);

        const viewOrder = screen.getByText("View order");
        const continueShopping = screen.getByText("Continue shopping");

        expect(viewOrder.closest("a")).toHaveAttribute(
            "href",
            "/orders/order-1"
        );

        expect(continueShopping.closest("a")).toHaveAttribute(
            "href",
            "/"
        );
    });
});