/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserOrderHistory } from "./UserOrderHistory";

const useGetUserOrdersQueryMock = vi.fn();

vi.mock("../api/orderApi", () => ({
    useGetUserOrdersQuery: () => useGetUserOrdersQueryMock(),
}));

vi.mock("../../account/components/shared/AccountSection", () => ({
    AccountSection: ({ title, children }: any) => (
        <div>
            <h1>{title}</h1>
            {children}
        </div>
    ),
}));

vi.mock("./OrderHistoryCard", () => ({
    OrderHistoryCard: ({ order }: any) => (
        <div data-testid="order-card">{order.id}</div>
    ),
}));

describe("UserOrderHistory", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders loading state", () => {
        useGetUserOrdersQueryMock.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        });

        render(<UserOrderHistory />);

        expect(screen.getByText("Loading orders...")).toBeInTheDocument();
        expect(screen.getByText("Order History")).toBeInTheDocument();
    });

    it("renders error state", () => {
        useGetUserOrdersQueryMock.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        });

        render(<UserOrderHistory />);

        expect(
            screen.getByText("Failed to load orders.")
        ).toBeInTheDocument();
    });

    it("renders empty state when no orders exist", () => {
        useGetUserOrdersQueryMock.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        });

        render(<UserOrderHistory />);

        expect(
            screen.getByText("You haven't placed any orders yet.")
        ).toBeInTheDocument();
    });

    it("renders orders when data exists", () => {
        useGetUserOrdersQueryMock.mockReturnValue({
            data: [
                { id: "order-1" },
                { id: "order-2" },
            ],
            isLoading: false,
            isError: false,
        });

        render(<UserOrderHistory />);

        const cards = screen.getAllByTestId("order-card");
        expect(cards).toHaveLength(2);

        expect(screen.getByText("order-1")).toBeInTheDocument();
        expect(screen.getByText("order-2")).toBeInTheDocument();
    });

    it("wraps content inside AccountSection", () => {
        useGetUserOrdersQueryMock.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        });

        render(<UserOrderHistory />);

        expect(screen.getByText("Order History")).toBeInTheDocument();
    });
});