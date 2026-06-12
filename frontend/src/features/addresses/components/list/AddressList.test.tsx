import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AddressList } from './AddressList'
import type {
    CreateAddressInput,
    UserAddress,
} from '../../api/addressesApi'

const mockAddressListItem = vi.fn()

vi.mock('./AddressListItem', () => ({
    AddressListItem: (props: unknown) => {
        mockAddressListItem(props)

        return (
            <div data-testid="address-list-item">
                Address List Item
            </div>
        )
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

describe('AddressList', () => {
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

    it('returns null when addresses is empty', () => {
        const { container } = render(
            <AddressList
                addresses={[]}
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

        expect(container.firstChild).toBeNull()
    })

    it('renders one AddressListItem when one address is provided', () => {
        render(
            <AddressList
                addresses={[address]}
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
            screen.getAllByTestId('address-list-item')
        ).toHaveLength(1)
    })

    it('renders multiple AddressListItems when multiple addresses are provided', () => {
        render(
            <AddressList
                addresses={[
                    address,
                    { ...address, id: 'address-2' },
                ]}
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
            screen.getAllByTestId('address-list-item')
        ).toHaveLength(2)
    })

    it('passes all required props to AddressListItem', () => {
        render(
            <AddressList
                addresses={[address]}
                editingAddress={address}
                onUpdate={onUpdate}
                onCancelEdit={onCancelEdit}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
                isUpdating={true}
                isDeleting={true}
            />
        )

        expect(mockAddressListItem).toHaveBeenCalled()

        expect(mockAddressListItem.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                address,
                editingAddress: address,
                onUpdate,
                onCancelEdit,
                onEdit,
                onDelete,
                onSetDefault,
                isUpdating: true,
                isDeleting: true,
            })
        )
    })
})