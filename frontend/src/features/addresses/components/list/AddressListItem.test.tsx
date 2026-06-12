import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AddressListItem } from './AddressListItem'
import type {
    CreateAddressInput,
    UserAddress,
} from '../../api/addressesApi'

const mockAddressCard = vi.fn()
const mockAddressForm = vi.fn()

vi.mock('../card/AddressCard', () => ({
    AddressCard: (props: unknown) => {
        mockAddressCard(props)

        return <div data-testid="address-card" />
    },
}))

vi.mock('../forms/AddressForm', () => ({
    AddressForm: (props: unknown) => {
        mockAddressForm(props)

        return <div data-testid="address-form" />
    },
}))

const address: UserAddress = {
    id: 'address-1',
    recipientName: 'John Doe',
    phoneNumber: '11999999999',
    zipCode: '12345-678',
    street: 'Main Street',
    number: '123',
    complement: 'Apartment 10',
    district: 'Downtown',
    city: 'São Paulo',
    state: 'SP',
    country: 'Brazil',
    label: 'HOME',
    isDefault: true,
}

describe('AddressListItem', () => {
    const onUpdate = vi.fn<
        (data: CreateAddressInput) => Promise<void>
    >()

    const onCancelEdit = vi.fn()
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const onSetDefault = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders AddressCard when editingAddress is null', () => {
        render(
            <AddressListItem
                address={address}
                editingAddress={null}
                onUpdate={onUpdate}
                onCancelEdit={onCancelEdit}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
                isUpdating={false}
                isDeleting={false}
            />
        )

        expect(
            screen.getByTestId('address-card')
        ).toBeInTheDocument()

        expect(
            screen.queryByTestId('address-form')
        ).not.toBeInTheDocument()
    })

    it('renders AddressCard when editingAddress id does not match', () => {
        render(
            <AddressListItem
                address={address}
                editingAddress={{
                    ...address,
                    id: 'different-id',
                }}
                onUpdate={onUpdate}
                onCancelEdit={onCancelEdit}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
                isUpdating={false}
                isDeleting={false}
            />
        )

        expect(
            screen.getByTestId('address-card')
        ).toBeInTheDocument()
    })

    it('renders AddressForm when editingAddress id matches', () => {
        render(
            <AddressListItem
                address={address}
                editingAddress={address}
                onUpdate={onUpdate}
                onCancelEdit={onCancelEdit}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
                isUpdating={false}
                isDeleting={false}
            />
        )

        expect(
            screen.getByTestId('address-form')
        ).toBeInTheDocument()

        expect(
            screen.queryByTestId('address-card')
        ).not.toBeInTheDocument()
    })

    it('passes address props correctly to AddressCard', () => {
        render(
            <AddressListItem
                address={address}
                editingAddress={null}
                onUpdate={onUpdate}
                onCancelEdit={onCancelEdit}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
                isUpdating={false}
                isDeleting={true}
            />
        )

        expect(mockAddressCard.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                address,
                onEdit,
                onDelete,
                onSetDefault,
                isDeleting: true,
            })
        )
    })

    it('passes transformed initial values to AddressForm', () => {
        render(
            <AddressListItem
                address={address}
                editingAddress={address}
                onUpdate={onUpdate}
                onCancelEdit={onCancelEdit}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
                isUpdating={false}
                isDeleting={false}
            />
        )

        expect(mockAddressForm.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                initial: {
                    ...address,
                    label: 'HOME',
                    phoneNumber: '11999999999',
                    complement: 'Apartment 10',
                },
            })
        )
    })

    it('passes onUpdate to AddressForm', () => {
        render(
            <AddressListItem
                address={address}
                editingAddress={address}
                onUpdate={onUpdate}
                onCancelEdit={onCancelEdit}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
                isUpdating={false}
                isDeleting={false}
            />
        )

        expect(mockAddressForm.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                onSubmit: onUpdate,
            })
        )
    })

    it('passes onCancelEdit to AddressForm', () => {
        render(
            <AddressListItem
                address={address}
                editingAddress={address}
                onUpdate={onUpdate}
                onCancelEdit={onCancelEdit}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
                isUpdating={false}
                isDeleting={false}
            />
        )

        expect(mockAddressForm.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                onCancel: onCancelEdit,
            })
        )
    })

    it('passes isUpdating as isLoading to AddressForm', () => {
        render(
            <AddressListItem
                address={address}
                editingAddress={address}
                onUpdate={onUpdate}
                onCancelEdit={onCancelEdit}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
                isUpdating={true}
                isDeleting={false}
            />
        )

        expect(mockAddressForm.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                isLoading: true,
            })
        )
    })

    it('passes submitLabel to AddressForm', () => {
        render(
            <AddressListItem
                address={address}
                editingAddress={address}
                onUpdate={onUpdate}
                onCancelEdit={onCancelEdit}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
                isUpdating={false}
                isDeleting={false}
            />
        )

        expect(mockAddressForm.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                submitLabel: 'Update Address',
            })
        )
    })
})