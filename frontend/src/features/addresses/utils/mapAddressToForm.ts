import type { Address } from "../../checkout/types";
import type { UserAddress, CreateAddressInput } from "../api/addressesApi";

export const mapAddressToForm = (address: UserAddress): CreateAddressInput => ({
    recipientName: address.recipientName,
    phoneNumber: address.phoneNumber ?? undefined,
    label: address.label ?? undefined,
    street: address.street,
    number: address.number,
    complement: address.complement ?? undefined,
    district: address.district,
    city: address.city,
    state: address.state,
    zipCode: address.zipCode,
    country: address.country,
    isDefault: address.isDefault,
});


export const mapAddressToCheckout = (address: UserAddress): Address => ({
    fullName: address.recipientName,
    phone: address.phoneNumber ?? "",
    street: address.street,
    number: address.number,
    city: address.city,
    state: address.state,
    zipCode: address.zipCode,
});