import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import type { PaymentMethod } from "../types";

describe("PaymentMethodSelector", () => {
    const methods: PaymentMethod[] = [
        "CREDIT_CARD",
        "DEBIT_CARD",
        "PIX",
        "BOLETO",
    ];

    it("renders title", () => {
        render(
            <PaymentMethodSelector
                methods={methods}
                selected="PIX"
                onSelect={vi.fn()}
            />
        );

        expect(screen.getByText("Payment Method")).toBeInTheDocument();
    });

    it("renders all payment methods", () => {
        render(
            <PaymentMethodSelector
                methods={methods}
                selected="PIX"
                onSelect={vi.fn()}
            />
        );

        expect(screen.getByText(/CREDIT CARD/i)).toBeInTheDocument();
        expect(screen.getByText(/DEBIT CARD/i)).toBeInTheDocument();
        expect(screen.getByText(/PIX/i)).toBeInTheDocument();
        expect(screen.getByText(/BOLETO/i)).toBeInTheDocument();
    });

    it("highlights selected method", () => {
        render(
            <PaymentMethodSelector
                methods={methods}
                selected="DEBIT_CARD"
                onSelect={vi.fn()}
            />
        );

        const selected = screen.getByText("DEBIT CARD");

        expect(selected.className).toContain("border-black");
        expect(selected.className).toContain("bg-black");
        expect(selected.className).toContain("text-white");
    });

    it("does not highlight non-selected methods", () => {
        render(
            <PaymentMethodSelector
                methods={methods}
                selected="DEBIT_CARD"
                onSelect={vi.fn()}
            />
        );

        const nonSelected = screen.getByText("PIX");

        expect(nonSelected.className).toContain("border-gray-300");
    });

    it("calls onSelect when clicking a method", async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();

        render(
            <PaymentMethodSelector
                methods={methods}
                selected="PIX"
                onSelect={onSelect}
            />
        );

        await user.click(screen.getByText("BOLETO"));

        expect(onSelect).toHaveBeenCalledWith("BOLETO");
    });
});