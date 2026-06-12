import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AddressCardActions } from './AddressCardActions'
import type { UserAddress } from '../../api/addressesApi'

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
    isDefault: false,
}

describe('AddressCardActions', () => {
    it('renders Edit button', () => {
        render(
            <AddressCardActions
                address={baseAddress}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onSetDefault={vi.fn()}
                isDeleting={false}
            />
        )

        expect(
            screen.getByRole('button', { name: /edit/i })
        ).toBeInTheDocument()
    })

    it('renders Remove button', () => {
        render(
            <AddressCardActions
                address={baseAddress}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onSetDefault={vi.fn()}
                isDeleting={false}
            />
        )

        expect(
            screen.getByRole('button', { name: /remove/i })
        ).toBeInTheDocument()
    })

    it('renders Set default button when address is not default', () => {
        render(
            <AddressCardActions
                address={baseAddress}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onSetDefault={vi.fn()}
                isDeleting={false}
            />
        )

        expect(
            screen.getByRole('button', { name: /set default/i })
        ).toBeInTheDocument()
    })

    it('does not render Set default button when address is default', () => {
        render(
            <AddressCardActions
                address={{
                    ...baseAddress,
                    isDefault: true,
                }}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onSetDefault={vi.fn()}
                isDeleting={false}
            />
        )

        expect(
            screen.queryByRole('button', { name: /set default/i })
        ).not.toBeInTheDocument()
    })

    it('calls onEdit with address when Edit is clicked', async () => {
        const user = userEvent.setup()
        const onEdit = vi.fn()

        render(
            <AddressCardActions
                address={baseAddress}
                onEdit={onEdit}
                onDelete={vi.fn()}
                onSetDefault={vi.fn()}
                isDeleting={false}
            />
        )

        await user.click(
            screen.getByRole('button', { name: /edit/i })
        )

        expect(onEdit).toHaveBeenCalledWith(baseAddress)
    })

    it('calls onDelete with address id when Remove is clicked', async () => {
        const user = userEvent.setup()
        const onDelete = vi.fn()

        render(
            <AddressCardActions
                address={baseAddress}
                onEdit={vi.fn()}
                onDelete={onDelete}
                onSetDefault={vi.fn()}
                isDeleting={false}
            />
        )

        await user.click(
            screen.getByRole('button', { name: /remove/i })
        )

        expect(onDelete).toHaveBeenCalledWith(baseAddress.id)
    })

    it('calls onSetDefault with address id when Set default is clicked', async () => {
        const user = userEvent.setup()
        const onSetDefault = vi.fn()

        render(
            <AddressCardActions
                address={baseAddress}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onSetDefault={onSetDefault}
                isDeleting={false}
            />
        )

        await user.click(
            screen.getByRole('button', { name: /set default/i })
        )

        expect(onSetDefault).toHaveBeenCalledWith(baseAddress.id)
    })

    it('Remove button is enabled when isDeleting is false', () => {
        render(
            <AddressCardActions
                address={baseAddress}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onSetDefault={vi.fn()}
                isDeleting={false}
            />
        )

        expect(
            screen.getByRole('button', { name: /remove/i })
        ).not.toBeDisabled()
    })

    it('Remove button is disabled when isDeleting is true', () => {
        render(
            <AddressCardActions
                address={baseAddress}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                onSetDefault={vi.fn()}
                isDeleting={true}
            />
        )

        expect(
            screen.getByRole('button', { name: /remove/i })
        ).toBeDisabled()
    })
})