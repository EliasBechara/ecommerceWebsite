import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { OrderSummary } from "./OrderSummary";

describe("OrderSummary", () => {
    const baseProps = {
        summary: {
            itemsTotal: 100,
            shippingCost: 10,
            total: 110,
        },
        summaryLoading: false,
        confirming: false,
        updatingAddress: false,
        onSubmit: vi.fn(),
    };

    it("renders title", () => {
        render(<OrderSummary {...baseProps} />);
        expect(screen.getByText("Order summary")).toBeInTheDocument();
    });

    it("shows loading state", () => {
        render(
            <OrderSummary {...baseProps} summaryLoading={true} />
        );

        expect(screen.getByText("Calculating...")).toBeInTheDocument();
    });

    it("renders summary values correctly", () => {
        render(<OrderSummary {...baseProps} />);

        expect(screen.getByText("$100.00")).toBeInTheDocument();
        expect(screen.getByText("$10.00")).toBeInTheDocument();
        expect(screen.getByText("$110.00")).toBeInTheDocument();
    });

    it("shows Free when shipping cost is 0", () => {
        render(
            <OrderSummary
                {...baseProps}
                summary={{
                    itemsTotal: 50,
                    shippingCost: 0,
                    total: 50,
                }}
            />
        );

        expect(screen.getByText("Free")).toBeInTheDocument();
    });

    it("falls back to 0 when summary is undefined", () => {
        render(
            <OrderSummary
                {...baseProps}
                summary={undefined}
            />
        );

        const values = screen.getAllByText("$0.00");
        expect(values.length).toBeGreaterThan(0);
    });

    it("calls onSubmit when clicking button", () => {
        const onSubmit = vi.fn();

        render(
            <OrderSummary {...baseProps} onSubmit={onSubmit} />
        );

        fireEvent.click(screen.getByRole("button"));

        expect(onSubmit).toHaveBeenCalled();
    });

    it("disables button when confirming", () => {
        render(
            <OrderSummary {...baseProps} confirming={true} />
        );

        expect(screen.getByRole("button")).toBeDisabled();
        expect(
            screen.getByText("Placing order...")
        ).toBeInTheDocument();
    });

    it("disables button when updating address", () => {
        render(
            <OrderSummary
                {...baseProps}
                updatingAddress={true}
            />
        );

        expect(screen.getByRole("button")).toBeDisabled();
    });

    it("shows default button text when not confirming", () => {
        render(<OrderSummary {...baseProps} />);

        expect(
            screen.getByText("Place order")
        ).toBeInTheDocument();
    });

    it("loading overrides summary display", () => {
        render(
            <OrderSummary
                {...baseProps}
                summaryLoading={true}
            />
        );

        expect(screen.queryByText("$100.00")).not.toBeInTheDocument();
        expect(screen.getByText("Calculating...")).toBeInTheDocument();
    });
});