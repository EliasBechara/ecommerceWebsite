import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import { AddressCard } from './AddressCard'
import type { UserAddress } from '../../api/addressesApi'

const mockAddressCardActions = vi.fn()

vi.mock('./AddressCardActions', () => ({
    AddressCardActions: (props: unknown) => {
        mockAddressCardActions(props)

        return <div data-testid="address-card-actions" />
    },
}))

const baseAddress: UserAddress = {
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

describe('AddressCard', () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const onSetDefault = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders all address information', () => {
        render(
            <AddressCard
                address={baseAddress}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
                isDeleting={false}
            />
        )

        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(
            screen.getByText('Main Street, 123, Apartment 10')
        ).toBeInTheDocument()

        expect(
            screen.getByText('Downtown — São Paulo, SP')
        ).toBeInTheDocument()

        expect(screen.getByText('12345-678')).toBeInTheDocument()
        expect(screen.getByText('11999999999')).toBeInTheDocument()
        expect(screen.getByText('HOME')).toBeInTheDocument()
    })

    it('renders complement when provided', () => {
        render(
            <AddressCard
                address={baseAddress}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
                isDeleting={false}
            />
        )

        expect(
            screen.getByText('Main Street, 123, Apartment 10')
        ).toBeInTheDocument()
    })

    it('does not render complement when not provided', () => {
        const address: UserAddress = {
            ...baseAddress,
            complement: null,
        }

        render(
            <AddressCard
                address={address}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
                isDeleting={false}
            />
        )

        expect(
            screen.getByText('Main Street, 123')
        ).toBeInTheDocument()

        expect(
            screen.queryByText(/Apartment 10/)
        ).not.toBeInTheDocument()
    })

    it('renders phone number when provided', () => {
        render(
            <AddressCard
                address={baseAddress}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
                isDeleting={false}
            />
        )

        expect(screen.getByText('11999999999')).toBeInTheDocument()
    })

    it('does not render phone number when not provided', () => {
        const address: UserAddress = {
            ...baseAddress,
            phoneNumber: null,
        }

        render(
            <AddressCard
                address={address}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
                isDeleting={false}
            />
        )

        expect(
            screen.queryByText('11999999999')
        ).not.toBeInTheDocument()
    })

    it('renders label when provided', () => {
        render(
            <AddressCard
                address={baseAddress}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
                isDeleting={false}
            />
        )

        expect(screen.getByText('HOME')).toBeInTheDocument()
    })

    it('does not render label when not provided', () => {
        const address: UserAddress = {
            ...baseAddress,
            label: null,
        }

        render(
            <AddressCard
                address={address}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
                isDeleting={false}
            />
        )

        expect(screen.queryByText('HOME')).not.toBeInTheDocument()
    })

    it('renders default badge when address is default', () => {
        render(
            <AddressCard
                address={baseAddress}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
                isDeleting={false}
            />
        )

        expect(screen.getByText('Default')).toBeInTheDocument()
    })

    it('does not render default badge when address is not default', () => {
        const address: UserAddress = {
            ...baseAddress,
            isDefault: false,
        }

        render(
            <AddressCard
                address={address}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
                isDeleting={false}
            />
        )

        expect(
            screen.queryByText('Default')
        ).not.toBeInTheDocument()
    })

    it('applies default styling when address is default', () => {
        const { container } = render(
            <AddressCard
                address={baseAddress}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
                isDeleting={false}
            />
        )

        const card = container.firstChild

        expect(card).toHaveClass(
            'border-zinc-800',
            'bg-zinc-200/60'
        )
    })

    it('applies non-default styling when address is not default', () => {
        const address: UserAddress = {
            ...baseAddress,
            isDefault: false,
        }

        const { container } = render(
            <AddressCard
                address={address}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
                isDeleting={false}
            />
        )

        const card = container.firstChild

        expect(card).toHaveClass(
            'border-zinc-300',
            'bg-transparent'
        )
    })

    it('renders AddressCardActions', () => {
        render(
            <AddressCard
                address={baseAddress}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
                isDeleting={false}
            />
        )

        expect(
            screen.getByTestId('address-card-actions')
        ).toBeInTheDocument()
    })

    it('passes correct props to AddressCardActions', () => {
        render(
            <AddressCard
                address={baseAddress}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
                isDeleting={true}
            />
        )

        expect(mockAddressCardActions).toHaveBeenCalled()

        expect(mockAddressCardActions.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                address: baseAddress,
                onEdit,
                onDelete,
                onSetDefault,
                isDeleting: true,
            })
        )
    })
})