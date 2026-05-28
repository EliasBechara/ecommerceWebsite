import type { AddressFormValues } from "./addressSchema"

type AddressFieldConfig = {
    name: keyof AddressFormValues
    label: string
    placeholder: string
    type?: string
    containerClass?: string
}

export const ADDRESS_FIELDS: AddressFieldConfig[] = [
    {
        name: 'recipientName',
        label: 'Recipient Name',
        placeholder: 'Full name',
    },

    {
        name: 'phoneNumber',
        label: 'Phone (optional)',
        placeholder: '+55 11 99999-9999',
        type: 'tel',
    },

    {
        name: 'street',
        label: 'Street',
        placeholder: 'Rua, Av...',
        containerClass: 'col-span-2',
    },

    {
        name: 'number',
        label: 'Number',
        placeholder: '123',
    },

    {
        name: 'complement',
        label: 'Complement (optional)',
        placeholder: 'Apt, floor...',
    },

    {
        name: 'district',
        label: 'District',
        placeholder: 'Bairro',
    },

    {
        name: 'city',
        label: 'City',
        placeholder: 'City',
    },

    {
        name: 'state',
        label: 'State',
        placeholder: 'SP',
    },

    {
        name: 'zipCode',
        label: 'ZIP Code',
        placeholder: '00000-000',
    },
]