import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CheckoutItems } from "./CheckoutItems";

describe("CheckoutItems", () => {
    const items = [
        {
            productId: "1",
            product: { name: "RTX 5090" },
            quantity: 2,
            unitPrice: 1000,
            subtotal: 2000,
        },
        {
            productId: "2",
            product: { name: "I5 14600K" },
            quantity: 1,
            unitPrice: 250,
            subtotal: 250,
        },
    ];

    it("renders the section title", () => {
        render(<CheckoutItems items={items} />);

        expect(
            screen.getByRole("heading", {
                name: /your items/i,
            }),
        ).toBeInTheDocument();
    });

    it("renders all products", () => {
        render(<CheckoutItems items={items} />);

        expect(
            screen.getByText("RTX 5090"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("I5 14600K"),
        ).toBeInTheDocument();
    });

    it("renders the quantity for each product", () => {
        render(<CheckoutItems items={items} />);

        expect(
            screen.getByText("Quantity: 2"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("Quantity: 1"),
        ).toBeInTheDocument();
    });

    it("renders the calculated price for each product", () => {
        render(<CheckoutItems items={items} />);

        expect(
            screen.getByText("$2000.00"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("$250.00"),
        ).toBeInTheDocument();
    });

    it("renders the correct number of products", () => {
        render(<CheckoutItems items={items} />);

        expect(
            screen.getByText("RTX 5090"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("I5 14600K"),
        ).toBeInTheDocument();

        expect(
            screen.getAllByText(/Quantity:/),
        ).toHaveLength(2);
    });

    it("renders each product with its own quantity and price", () => {
        render(<CheckoutItems items={items} />);

        const rtxItem = screen
            .getByText("RTX 5090")
            .closest("div");

        const cpuItem = screen
            .getByText("I5 14600K")
            .closest("div");

        expect(rtxItem).not.toBeNull();
        expect(cpuItem).not.toBeNull();

        expect(
            within(rtxItem!).getByText(
                "Quantity: 2",
            ),
        ).toBeInTheDocument();

        expect(
            within(cpuItem!).getByText(
                "Quantity: 1",
            ),
        ).toBeInTheDocument();
    });

    it("renders no products when items is empty", () => {
        render(<CheckoutItems items={[]} />);

        expect(
            screen.getByRole("heading", {
                name: /your items/i,
            }),
        ).toBeInTheDocument();

        expect(
            screen.queryByText(/Quantity:/),
        ).not.toBeInTheDocument();
    });
});