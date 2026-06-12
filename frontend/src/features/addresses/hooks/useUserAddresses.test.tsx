import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useUserAddresses } from './useUserAddresses'
import type {
    CreateAddressInput,
    UserAddress,
} from '../api/addressesApi'

const mockUseGetAddressesQuery = vi.fn()

const mockCreateAddress = vi.fn()
const mockUpdateAddress = vi.fn()
const mockDeleteAddress = vi.fn()

const mockCreateState = {
    isLoading: false,
}

const mockUpdateState = {
    isLoading: false,
}

const mockDeleteState = {
    isLoading: false,
}

vi.mock('../api/addressesApi', () => ({
    useGetAddressesQuery: () =>
        mockUseGetAddressesQuery(),

    useCreateAddressMutation: () => [
        mockCreateAddress,
        mockCreateState,
    ],

    useUpdateAddressMutation: () => [
        mockUpdateAddress,
        mockUpdateState,
    ],

    useDeleteAddressMutation: () => [
        mockDeleteAddress,
        mockDeleteState,
    ],
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

const createInput: CreateAddressInput = {
    recipientName: 'John Doe',
    street: 'Main Street',
    number: '123',
    district: 'Downtown',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '12345-678',
}

describe('useUserAddresses', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        mockUseGetAddressesQuery.mockReturnValue({
            data: [address],
            isLoading: false,
        })

        mockCreateAddress.mockReturnValue({
            unwrap: vi.fn().mockResolvedValue(undefined),
        })

        mockUpdateAddress.mockReturnValue({
            unwrap: vi.fn().mockResolvedValue(undefined),
        })

        mockDeleteAddress.mockResolvedValue(undefined)
    })

    it('returns addresses from query', () => {
        const { result } = renderHook(() =>
            useUserAddresses()
        )

        expect(result.current.addresses).toEqual([
            address,
        ])
    })

    it('returns isLoading from query', () => {
        mockUseGetAddressesQuery.mockReturnValue({
            data: [],
            isLoading: true,
        })

        const { result } = renderHook(() =>
            useUserAddresses()
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('initializes showForm as false', () => {
        const { result } = renderHook(() =>
            useUserAddresses()
        )

        expect(result.current.showForm).toBe(false)
    })

    it('initializes editingAddress as null', () => {
        const { result } = renderHook(() =>
            useUserAddresses()
        )

        expect(
            result.current.editingAddress
        ).toBeNull()
    })

    it('handleCreate calls createAddress', async () => {
        const { result } = renderHook(() =>
            useUserAddresses()
        )

        await act(async () => {
            await result.current.handleCreate(
                createInput
            )
        })

        expect(mockCreateAddress).toHaveBeenCalledWith(
            createInput
        )
    })

    it('handleCreate closes form', async () => {
        const { result } = renderHook(() =>
            useUserAddresses()
        )

        act(() => {
            result.current.openCreateForm()
        })

        expect(result.current.showForm).toBe(true)

        await act(async () => {
            await result.current.handleCreate(
                createInput
            )
        })

        expect(result.current.showForm).toBe(false)
    })

    it('handleUpdate returns early without editingAddress', async () => {
        const { result } = renderHook(() =>
            useUserAddresses()
        )

        await act(async () => {
            await result.current.handleUpdate(
                createInput
            )
        })

        expect(
            mockUpdateAddress
        ).not.toHaveBeenCalled()
    })

    it('handleUpdate calls updateAddress correctly', async () => {
        const { result } = renderHook(() =>
            useUserAddresses()
        )

        act(() => {
            result.current.handleEdit(address)
        })

        await act(async () => {
            await result.current.handleUpdate(
                createInput
            )
        })

        expect(mockUpdateAddress).toHaveBeenCalledWith({
            addressId: address.id,
            data: createInput,
        })
    })

    it('handleUpdate clears editingAddress', async () => {
        const { result } = renderHook(() =>
            useUserAddresses()
        )

        act(() => {
            result.current.handleEdit(address)
        })

        expect(
            result.current.editingAddress
        ).toEqual(address)

        await act(async () => {
            await result.current.handleUpdate(
                createInput
            )
        })

        expect(
            result.current.editingAddress
        ).toBeNull()
    })

    it('handleDelete calls deleteAddress', async () => {
        const { result } = renderHook(() =>
            useUserAddresses()
        )

        await act(async () => {
            await result.current.handleDelete(
                address.id
            )
        })

        expect(mockDeleteAddress).toHaveBeenCalledWith(
            address.id
        )
    })

    it('handleSetDefault calls updateAddress with isDefault true', async () => {
        const { result } = renderHook(() =>
            useUserAddresses()
        )

        await act(async () => {
            await result.current.handleSetDefault(
                address.id
            )
        })

        expect(mockUpdateAddress).toHaveBeenCalledWith({
            addressId: address.id,
            data: {
                isDefault: true,
            },
        })
    })

    it('handleEdit updates editingAddress and hides form', () => {
        const { result } = renderHook(() =>
            useUserAddresses()
        )

        act(() => {
            result.current.openCreateForm()
        })

        expect(result.current.showForm).toBe(true)

        act(() => {
            result.current.handleEdit(address)
        })

        expect(result.current.showForm).toBe(false)

        expect(
            result.current.editingAddress
        ).toEqual(address)
    })

    it('openCreateForm clears editingAddress and shows form', () => {
        const { result } = renderHook(() =>
            useUserAddresses()
        )

        act(() => {
            result.current.handleEdit(address)
        })

        act(() => {
            result.current.openCreateForm()
        })

        expect(
            result.current.editingAddress
        ).toBeNull()

        expect(result.current.showForm).toBe(true)
    })

    it('closeCreateForm hides form', () => {
        const { result } = renderHook(() =>
            useUserAddresses()
        )

        act(() => {
            result.current.openCreateForm()
        })

        expect(result.current.showForm).toBe(true)

        act(() => {
            result.current.closeCreateForm()
        })

        expect(result.current.showForm).toBe(false)
    })

    it('cancelEdit clears editingAddress', () => {
        const { result } = renderHook(() =>
            useUserAddresses()
        )

        act(() => {
            result.current.handleEdit(address)
        })

        expect(
            result.current.editingAddress
        ).toEqual(address)

        act(() => {
            result.current.cancelEdit()
        })

        expect(
            result.current.editingAddress
        ).toBeNull()
    })
})