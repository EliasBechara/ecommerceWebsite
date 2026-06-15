/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SelectableAddressList } from "./SelectableAddressList";

vi.mock("../../addresses/utils/mapAddressToForm", () => ({
    mapAddressToCheckout: (address: any) => ({
        mapped: true,
        id: address.id,
    }),
}));

vi.mock("../../addresses/components/card/AddressCard", () => ({
    AddressCard: () => <div data-testid="address-card" />,
}));

describe("SelectableAddressList", () => {
    const addresses = [
        { id: "1", street: "Street 1" },
        { id: "2", street: "Street 2" },
    ] as any;

    const baseProps = {
        addresses,
        resolvedSelectedId: null,
        onSelect: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        onSetDefault: vi.fn(),
        onAddNew: vi.fn(),
        isDeleting: false,
    };

    it("renders all address cards", () => {
        render(<SelectableAddressList {...baseProps} />);

        expect(screen.getAllByTestId("address-card")).toHaveLength(2);
    });

    it("applies selected style", () => {
        const { container } = render(
            <SelectableAddressList
                {...baseProps}
                resolvedSelectedId="1"
            />
        );

        const wrappers = container.querySelectorAll(
            ".cursor-pointer"
        );

        expect(wrappers[0].className).toContain("ring-zinc-800");
        expect(wrappers[1].className).toContain("ring-transparent");
    });
    it("calls onSelect when clicking an address wrapper", () => {
        const onSelect = vi.fn();

        render(
            <SelectableAddressList
                {...baseProps}
                onSelect={onSelect}
            />
        );

        const wrappers = screen
            .getAllByTestId("address-card")
            .map((c) => c.closest("div") as HTMLElement);

        fireEvent.click(wrappers[0]);

        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect).toHaveBeenCalledWith(
            "1",
            expect.objectContaining({
                mapped: true,
                id: "1",
            })
        );
    });

    it("renders Add new address button", () => {
        render(<SelectableAddressList {...baseProps} />);

        expect(
            screen.getByText("+ Add new address")
        ).toBeInTheDocument();
    });

    it("calls onAddNew", () => {
        const onAddNew = vi.fn();

        render(
            <SelectableAddressList
                {...baseProps}
                onAddNew={onAddNew}
            />
        );

        fireEvent.click(
            screen.getByText("+ Add new address")
        );

        expect(onAddNew).toHaveBeenCalledTimes(1);
    });

    it("handles multiple clicks", () => {
        const onSelect = vi.fn();

        render(
            <SelectableAddressList
                {...baseProps}
                onSelect={onSelect}
            />
        );

        const wrappers = screen
            .getAllByTestId("address-card")
            .map((c) => c.closest("div") as HTMLElement);

        fireEvent.click(wrappers[0]);
        fireEvent.click(wrappers[1]);

        expect(onSelect).toHaveBeenCalledTimes(2);
    });
});