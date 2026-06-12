import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { UserAddresses } from './UserAddresses'

const mockUseUserAddresses = vi.fn()
const mockAddressList = vi.fn()
const mockAddressForm = vi.fn()

vi.mock('../hooks/useUserAddresses', () => ({
    useUserAddresses: () => mockUseUserAddresses(),
}))

vi.mock('./list/AddressList', () => ({
    AddressList: (props: unknown) => {
        mockAddressList(props)

        return <div data-testid="address-list" />
    },
}))

vi.mock('./forms/AddressForm', () => ({
    AddressForm: (props: unknown) => {
        mockAddressForm(props)

        return <div data-testid="address-form" />
    },
}))

describe('UserAddresses', () => {
    const defaultHookResult = {
        addresses: [],
        isLoading: false,

        isCreating: false,
        isUpdating: false,
        isDeleting: false,

        showForm: false,
        editingAddress: null,

        handleCreate: vi.fn(),
        handleUpdate: vi.fn(),
        handleDelete: vi.fn(),
        handleSetDefault: vi.fn(),
        handleEdit: vi.fn(),

        openCreateForm: vi.fn(),
        closeCreateForm: vi.fn(),
        cancelEdit: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks()
        mockUseUserAddresses.mockReturnValue(defaultHookResult)
    })

    it('renders heading', () => {
        render(<UserAddresses />)

        expect(
            screen.getByRole('heading', {
                name: /saved addresses/i,
            })
        ).toBeInTheDocument()
    })

    it('renders loading message when loading', () => {
        mockUseUserAddresses.mockReturnValue({
            ...defaultHookResult,
            isLoading: true,
        })

        render(<UserAddresses />)

        expect(
            screen.getByText('Loading addresses...')
        ).toBeInTheDocument()
    })

    it('hides loading message when not loading', () => {
        render(<UserAddresses />)

        expect(
            screen.queryByText('Loading addresses...')
        ).not.toBeInTheDocument()
    })

    it('renders AddressList with correct props', () => {
        const addresses = [
            {
                id: '1',
                recipientName: 'John',
                phoneNumber: null,
                zipCode: '123',
                street: 'Main',
                number: '1',
                complement: null,
                district: 'Center',
                city: 'São Paulo',
                state: 'SP',
                country: 'Brazil',
                label: 'HOME',
                isDefault: true,
            },
        ]

        const editingAddress = addresses[0]

        mockUseUserAddresses.mockReturnValue({
            ...defaultHookResult,
            addresses,
            editingAddress,
            isUpdating: true,
            isDeleting: true,
        })

        render(<UserAddresses />)

        expect(mockAddressList).toHaveBeenCalled()

        expect(mockAddressList.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                addresses,
                editingAddress,
                onUpdate: defaultHookResult.handleUpdate,
                onCancelEdit: defaultHookResult.cancelEdit,
                onEdit: defaultHookResult.handleEdit,
                onDelete: defaultHookResult.handleDelete,
                onSetDefault:
                    defaultHookResult.handleSetDefault,
                isUpdating: true,
                isDeleting: true,
            })
        )
    })

    it('renders AddressForm when showForm is true', () => {
        mockUseUserAddresses.mockReturnValue({
            ...defaultHookResult,
            showForm: true,
        })

        render(<UserAddresses />)

        expect(
            screen.getByTestId('address-form')
        ).toBeInTheDocument()

        expect(
            screen.queryByRole('button', {
                name: /\+ add new address/i,
            })
        ).not.toBeInTheDocument()
    })

    it('passes correct props to AddressForm', () => {
        mockUseUserAddresses.mockReturnValue({
            ...defaultHookResult,
            showForm: true,
            isCreating: true,
        })

        render(<UserAddresses />)

        expect(mockAddressForm).toHaveBeenCalled()

        expect(mockAddressForm.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                onSubmit: defaultHookResult.handleCreate,
                onCancel: defaultHookResult.closeCreateForm,
                isLoading: true,
                submitLabel: 'Save Address',
            })
        )
    })

    it('renders Add New Address button when allowed', () => {
        render(<UserAddresses />)

        expect(
            screen.getByRole('button', {
                name: /\+ add new address/i,
            })
        ).toBeInTheDocument()
    })

    it('clicking Add New Address calls openCreateForm', async () => {
        const user = userEvent.setup()

        render(<UserAddresses />)

        await user.click(
            screen.getByRole('button', {
                name: /\+ add new address/i,
            })
        )

        expect(
            defaultHookResult.openCreateForm
        ).toHaveBeenCalledOnce()
    })

    it('hides Add New Address button when showForm is true', () => {
        mockUseUserAddresses.mockReturnValue({
            ...defaultHookResult,
            showForm: true,
        })

        render(<UserAddresses />)

        expect(
            screen.queryByRole('button', {
                name: /\+ add new address/i,
            })
        ).not.toBeInTheDocument()
    })

    it('hides Add New Address button when editingAddress exists', () => {
        mockUseUserAddresses.mockReturnValue({
            ...defaultHookResult,
            editingAddress: {
                id: '1',
                recipientName: 'John',
                phoneNumber: null,
                zipCode: '123',
                street: 'Main',
                number: '1',
                complement: null,
                district: 'Center',
                city: 'São Paulo',
                state: 'SP',
                country: 'Brazil',
                label: 'HOME',
                isDefault: true,
            },
        })

        render(<UserAddresses />)

        expect(
            screen.queryByRole('button', {
                name: /\+ add new address/i,
            })
        ).not.toBeInTheDocument()
    })
})