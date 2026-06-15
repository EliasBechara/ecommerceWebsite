/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { OrderDetailsPage } from "./OrderDetails";

vi.mock("react-router-dom", () => ({
    useParams: () => ({ orderId: "order-1" }),
}));

const useGetOrderByIdQueryMock = vi.fn();

vi.mock("../api/orderApi", () => ({
    useGetOrderByIdQuery: () => useGetOrderByIdQueryMock(),
}));

vi.mock("../../../components/layout/PageLayout", () => ({
    PageLayout: ({ children }: any) => <div>{children}</div>,
}));


const baseOrder = {
    id: "order-1",
    status: "CONFIRMED",
    total: 50,
    items: [
        {
            id: "item-1",
            product: { name: "Product A" },
            quantity: 2,
            unitPrice: 10,
        },
        {
            id: "item-2",
            product: { name: "Product B" },
            quantity: 1,
            unitPrice: 30,
        },
    ],
};

describe("OrderDetailsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders loading state", () => {
        useGetOrderByIdQueryMock.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        });

        render(<OrderDetailsPage />);

        expect(screen.getByText("Loading order...")).toBeInTheDocument();
    });

    it("renders error state", () => {
        useGetOrderByIdQueryMock.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        });

        render(<OrderDetailsPage />);

        expect(screen.getByText("Failed to load order.")).toBeInTheDocument();
    });

    it("renders order header correctly", () => {
        useGetOrderByIdQueryMock.mockReturnValue({
            data: baseOrder,
            isLoading: false,
            isError: false,
        });

        render(<OrderDetailsPage />);

        expect(screen.getByText(/Order #order-1/)).toBeInTheDocument();
        expect(screen.getByText("Status: CONFIRMED")).toBeInTheDocument();
        expect(screen.getByText("$50.00")).toBeInTheDocument();
    });

    it("renders all order items", () => {
        useGetOrderByIdQueryMock.mockReturnValue({
            data: baseOrder,
            isLoading: false,
            isError: false,
        });

        render(<OrderDetailsPage />);

        expect(screen.getByText("Product A")).toBeInTheDocument();
        expect(screen.getByText("Product B")).toBeInTheDocument();

        expect(screen.getByText("Quantity: 2")).toBeInTheDocument();
        expect(screen.getByText("Quantity: 1")).toBeInTheDocument();
    });

    it("calculates item totals correctly", () => {
        useGetOrderByIdQueryMock.mockReturnValue({
            data: baseOrder,
            isLoading: false,
            isError: false,
        });

        render(<OrderDetailsPage />);

        expect(screen.getByText("$20.00")).toBeInTheDocument(); // 10 * 2
        expect(screen.getByText("$30.00")).toBeInTheDocument(); // 30 * 1
    });
});