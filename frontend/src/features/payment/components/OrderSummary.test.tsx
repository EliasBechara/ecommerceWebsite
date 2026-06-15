import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { OrderSummary } from "./OrderSummary";
import type { Order } from "../../order/types";

const mockOrder: Order = {
    id: "order-1",
    userId: "user-1",
    total: 45.5,
    status: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    address: {
        streetAddress: "Street 1",
        houseNumber: "10",
        city: "SP",
        state: "SP",
        zipCode: "00000-000",
    },
    items: [
        {
            id: "1",
            productId: "p1",
            quantity: 2,
            unitPrice: 10,
            product: {
                id: "p1",
                name: "Product A",
                imageUrl: "img-a.jpg",
                price: 10,
            },
            address: {
                streetAddress: "Street 1",
                houseNumber: "10",
                city: "SP",
                state: "SP",
                zipCode: "00000-000",
            },
        },
        {
            id: "2",
            productId: "p2",
            quantity: 1,
            unitPrice: 25.5,
            product: {
                id: "p2",
                name: "Product B",
                imageUrl: "img-b.jpg",
                price: 25.5,
            },
            address: {
                streetAddress: "Street 1",
                houseNumber: "10",
                city: "SP",
                state: "SP",
                zipCode: "00000-000",
            },
        },
    ],
};

describe("OrderSummary", () => {
    it("renders title", () => {
        render(<OrderSummary order={mockOrder} />);
        expect(screen.getByText("Order Summary")).toBeInTheDocument();
    });

    it("renders all items", () => {
        render(<OrderSummary order={mockOrder} />);

        expect(screen.getByText("Product A")).toBeInTheDocument();
        expect(screen.getByText("Product B")).toBeInTheDocument();
    });

    it("renders quantities correctly", () => {
        render(<OrderSummary order={mockOrder} />);

        expect(screen.getByText("Qty: 2")).toBeInTheDocument();
        expect(screen.getByText("Qty: 1")).toBeInTheDocument();
    });

    it("renders subtotals correctly", () => {
        render(<OrderSummary order={mockOrder} />);

        expect(screen.getByText("R$ 20.00")).toBeInTheDocument();

        expect(screen.getByText("R$ 25.50")).toBeInTheDocument();
    });

    it("renders total correctly", () => {
        render(<OrderSummary order={mockOrder} />);

        expect(screen.getByText("R$ 45.50")).toBeInTheDocument();
    });
});