/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { OrderHistoryCard } from "./OrderHistoryCard";

vi.mock("react-router-dom", () => ({
    Link: ({ to, children }: any) => (
        <a href={to} data-testid="order-link">
            {children}
        </a>
    ),
}));

describe("OrderHistoryCard", () => {
    const baseOrder = {
        id: "1234567890abcdef",
        status: "PENDING",
        items: [{ id: "1" }, { id: "2" }],
        total: 42.5,
    } as any;

    it("renders order link with correct href", () => {
        render(<OrderHistoryCard order={baseOrder} />);

        expect(screen.getByTestId("order-link")).toHaveAttribute(
            "href",
            "/orders/1234567890abcdef"
        );
    });

    it("renders shortened order id", () => {
        render(<OrderHistoryCard order={baseOrder} />);

        expect(
            screen.getByText(/Order #12345678/i)
        ).toBeInTheDocument();
    });

    it("renders order status", () => {
        render(<OrderHistoryCard order={baseOrder} />);

        expect(screen.getByText("PENDING")).toBeInTheDocument();
    });

    it("renders correct number of items", () => {
        render(<OrderHistoryCard order={baseOrder} />);

        expect(screen.getByText("2 item(s)")).toBeInTheDocument();
    });

    it("renders formatted total", () => {
        render(<OrderHistoryCard order={baseOrder} />);

        expect(screen.getByText("$42.50")).toBeInTheDocument();
    });

    it("handles single item correctly", () => {
        render(
            <OrderHistoryCard
                order={{
                    ...baseOrder,
                    items: [{ id: "1" }],
                }}
            />
        );

        expect(screen.getByText("1 item(s)")).toBeInTheDocument();
    });

    it("handles zero items correctly", () => {
        render(
            <OrderHistoryCard
                order={{
                    ...baseOrder,
                    items: [],
                }}
            />
        );

        expect(screen.getByText("0 item(s)")).toBeInTheDocument();
    });
});