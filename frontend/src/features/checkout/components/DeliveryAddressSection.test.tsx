/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DeliveryAddressSection } from "./DeliveryAddressSection";

vi.mock("../../addresses/components/forms/AddressForm", () => ({
    AddressForm: ({ onSubmit, onCancel, submitLabel }: any) => (
        <div>
            <p>{submitLabel}</p>
            <button onClick={() => onSubmit({} as any)}>submit</button>
            <button onClick={onCancel}>cancel</button>
        </div>
    ),
}));

vi.mock("./SelectableAddressList", () => ({
    SelectableAddressList: ({ addresses, onSelect }: any) => (
        <div>
            <p>address-list</p>
            {addresses.map((a: any) => (
                <button key={a.id} onClick={() => onSelect(a.id, a)}>
                    select-{a.id}
                </button>
            ))}
        </div>
    ),
}));

describe("DeliveryAddressSection", () => {
    const baseProps = {
        addresses: [
            {
                id: "1",
                street: "Street 1",
                city: "City",
            },
        ] as any,
        addressesLoading: false,
        showForm: false,
        editingAddress: null,
        resolvedSelectedId: null,
        onSelect: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        onSetDefault: vi.fn(),
        onAddNew: vi.fn(),
        onCancelCreate: vi.fn(),
        onCancelEdit: vi.fn(),
        onCreate: vi.fn(),
        onUpdate: vi.fn(),
        isCreating: false,
        isUpdating: false,
        isDeleting: false,
    };

    it("renders title", () => {
        render(<DeliveryAddressSection {...baseProps} />);
        expect(screen.getByText("Delivery address")).toBeInTheDocument();
    });

    it("shows loading state", () => {
        render(
            <DeliveryAddressSection {...baseProps} addressesLoading={true} />
        );

        expect(screen.getByText("Loading addresses…")).toBeInTheDocument();
    });

    it("renders SelectableAddressList when addresses exist and not editing", () => {
        render(<DeliveryAddressSection {...baseProps} />);

        expect(screen.getByText("address-list")).toBeInTheDocument();
    });

    it("calls onSelect when selecting an address", () => {
        const onSelect = vi.fn();

        render(
            <DeliveryAddressSection
                {...baseProps}
                onSelect={onSelect}
            />
        );

        fireEvent.click(screen.getByText("select-1"));

        expect(onSelect).toHaveBeenCalled();
    });

    it("renders create form when showForm is true", () => {
        render(
            <DeliveryAddressSection
                {...baseProps}
                showForm={true}
                addresses={[]}
            />
        );

        expect(screen.getByText("Save address")).toBeInTheDocument();
    });

    it("renders edit form when editingAddress is present", () => {
        render(
            <DeliveryAddressSection
                {...baseProps}
                editingAddress={{ id: "1" } as any}
            />
        );

        expect(screen.getByText("Update address")).toBeInTheDocument();
    });

    it("falls back to create form when no addresses exist", () => {
        render(
            <DeliveryAddressSection
                {...baseProps}
                addresses={[]}
            />
        );

        expect(screen.getByText("Save address")).toBeInTheDocument();
    });

    it("prioritizes loading over everything", () => {
        render(
            <DeliveryAddressSection
                {...baseProps}
                addressesLoading={true}
                showForm={true}
                editingAddress={{ id: "1" } as any}
            />
        );

        expect(screen.getByText("Loading addresses…")).toBeInTheDocument();
    });

    it("calls onCreate when submitting create form", () => {
        const onCreate = vi.fn();

        render(
            <DeliveryAddressSection
                {...baseProps}
                showForm={true}
                addresses={[]}
                onCreate={onCreate}
            />
        );

        fireEvent.click(screen.getByText("submit"));

        expect(onCreate).toHaveBeenCalled();
    });

    it("calls onUpdate when submitting edit form", () => {
        const onUpdate = vi.fn();

        render(
            <DeliveryAddressSection
                {...baseProps}
                editingAddress={{ id: "1" } as any}
                onUpdate={onUpdate}
            />
        );

        fireEvent.click(screen.getByText("submit"));

        expect(onUpdate).toHaveBeenCalled();
    });

    it("calls cancel handlers", () => {
        const onCancelCreate = vi.fn();

        render(
            <DeliveryAddressSection
                {...baseProps}
                showForm={true}
                addresses={[]}
                onCancelCreate={onCancelCreate}
            />
        );

        fireEvent.click(screen.getByText("cancel"));

        expect(onCancelCreate).toHaveBeenCalled();
    });
});