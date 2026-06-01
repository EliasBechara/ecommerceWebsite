import { Button } from "../../../components/button/Button";
import type { UserAddress } from "../../addresses/api/addressesApi";
import { AddressCard } from "../../addresses/components/card/AddressCard";
import { mapAddressToCheckout } from "../../addresses/utils/mapAddressToForm";
import type { Address } from "../types";

interface SelectableAddressListProps {
    addresses: UserAddress[];
    resolvedSelectedId: string | null;
    onSelect: (id: string, address: Address) => void;
    onEdit: (address: UserAddress) => void;
    onDelete: (id: string) => void;
    onSetDefault: (id: string) => void;
    onAddNew: () => void;
    isDeleting: boolean;
}

export const SelectableAddressList = ({
    addresses,
    resolvedSelectedId,
    onSelect,
    onEdit,
    onDelete,
    onSetDefault,
    onAddNew,
    isDeleting,
}: SelectableAddressListProps) => {
    return (
        <div className="flex flex-col gap-3">
            {addresses.map((address) => (
                <div
                    key={address.id}
                    className={`cursor-pointer rounded-xl ring-2 transition-all ${resolvedSelectedId === address.id ? "ring-zinc-800" : "ring-transparent"
                        }`}
                    onClick={() => onSelect(address.id, mapAddressToCheckout(address))}
                >
                    <AddressCard
                        address={address}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onSetDefault={onSetDefault}
                        isDeleting={isDeleting}
                    />
                </div>
            ))}
            <Button type="button" variant="text" onClick={onAddNew}>
                + Add new address
            </Button>
        </div>
    );
};