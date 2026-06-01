import type { CreateAddressInput, UserAddress } from "../../addresses/api/addressesApi";
import { AddressForm } from "../../addresses/components/forms/AddressForm";
import { mapAddressToForm } from "../../addresses/utils/mapAddressToForm";
import type { Address } from "../types";
import { SelectableAddressList } from "./SelectableAddressList";

interface DeliveryAddressSectionProps {
    addresses: UserAddress[] | undefined;
    addressesLoading: boolean;
    showForm: boolean;
    editingAddress: UserAddress | null;
    resolvedSelectedId: string | null;
    onSelect: (id: string, address: Address) => void;
    onEdit: (address: UserAddress) => void;
    onDelete: (id: string) => void;
    onSetDefault: (id: string) => void;
    onAddNew: () => void;
    onCancelCreate: () => void;
    onCancelEdit: () => void;
    onCreate: (data: CreateAddressInput) => Promise<unknown>;
    onUpdate: (data: CreateAddressInput) => Promise<unknown>;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
}

export const DeliveryAddressSection = ({
    addresses,
    addressesLoading,
    showForm,
    editingAddress,
    resolvedSelectedId,
    onSelect,
    onEdit,
    onDelete,
    onSetDefault,
    onAddNew,
    onCancelCreate,
    onCancelEdit,
    onCreate,
    onUpdate,
    isCreating,
    isUpdating,
    isDeleting,
}: DeliveryAddressSectionProps) => {
    const hasSavedAddresses = addresses && addresses.length > 0;

    return (
        <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Delivery address</h2>

            {addressesLoading && (
                <p className="text-sm text-zinc-500">Loading addresses…</p>
            )}

            {hasSavedAddresses && !showForm && !editingAddress && (
                <SelectableAddressList
                    addresses={addresses}
                    resolvedSelectedId={resolvedSelectedId}
                    onSelect={onSelect}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onSetDefault={onSetDefault}
                    onAddNew={onAddNew}
                    isDeleting={isDeleting}
                />
            )}

            {showForm && (
                <AddressForm
                    onSubmit={onCreate}
                    onCancel={onCancelCreate}
                    isLoading={isCreating}
                    submitLabel="Save address"
                />
            )}

            {editingAddress && (
                <AddressForm
                    initial={mapAddressToForm(editingAddress)}
                    onSubmit={onUpdate}
                    onCancel={onCancelEdit}
                    isLoading={isUpdating}
                    submitLabel="Update address"
                />
            )}

            {!addressesLoading && !hasSavedAddresses && !showForm && (
                <AddressForm
                    onSubmit={onCreate}
                    onCancel={onCancelCreate}
                    isLoading={isCreating}
                    submitLabel="Save address"
                />
            )}
        </section>
    );
};