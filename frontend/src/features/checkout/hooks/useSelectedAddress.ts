import { useState, useMemo } from "react";
import { mapAddressToCheckout } from "../../addresses/utils/mapAddressToForm";
import type { Address } from "../types";
import type { UserAddress } from "../../addresses/api/addressesApi";


interface UseSelectedAddressProps {
    addresses: UserAddress[] | undefined;
}

interface UseSelectedAddressReturn {
    selectedAddressId: string | null;
    selectedAddress: Address | null;
    resolvedSelectedId: string | null;
    resolvedAddress: Address | null;
    selectAddress: (id: string, address: Address) => void;
}

export const useSelectedAddress = ({ addresses }: UseSelectedAddressProps): UseSelectedAddressReturn => {
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

    const defaultAddress = useMemo(() => {
        const def = addresses?.find((a) => a.isDefault);
        return def ? mapAddressToCheckout(def) : null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addresses?.length]);

    const defaultAddressId = useMemo(
        () => addresses?.find((a) => a.isDefault)?.id ?? null,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [addresses?.length]
    );

    const resolvedSelectedId = selectedAddressId ?? defaultAddressId;
    const resolvedAddress = selectedAddress ?? defaultAddress;

    const selectAddress = (id: string, address: Address) => {
        setSelectedAddressId(id);
        setSelectedAddress(address);
    };

    return {
        selectedAddressId,
        selectedAddress,
        resolvedSelectedId,
        resolvedAddress,
        selectAddress,
    };
};