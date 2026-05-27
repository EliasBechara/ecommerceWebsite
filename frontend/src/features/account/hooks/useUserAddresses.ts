import { useState } from 'react'

import {
    useGetAddressesQuery,
    useCreateAddressMutation,
    useUpdateAddressMutation,
    useDeleteAddressMutation,
    type UserAddress,
    type CreateAddressInput,
} from '../api/accountApi'

export const useUserAddresses = () => {
    const addressesQuery =
        useGetAddressesQuery()

    const [
        createAddress,
        createState,
    ] = useCreateAddressMutation()

    const [
        updateAddress,
        updateState,
    ] = useUpdateAddressMutation()

    const [
        deleteAddress,
        deleteState,
    ] = useDeleteAddressMutation()

    const [showForm, setShowForm] =
        useState(false)

    const [
        editingAddress,
        setEditingAddress,
    ] = useState<UserAddress | null>(
        null,
    )

    const handleCreate = async (
        data: CreateAddressInput,
    ) => {
        await createAddress(data).unwrap()

        setShowForm(false)
    }

    const handleUpdate = async (
        data: CreateAddressInput,
    ) => {
        if (!editingAddress) {
            return
        }

        await updateAddress({
            addressId: editingAddress.id,
            data,
        }).unwrap()

        setEditingAddress(null)
    }

    const handleDelete = async (
        id: string,
    ) => {
        await deleteAddress(id)
    }

    const handleSetDefault = async (
        id: string,
    ) => {
        await updateAddress({
            addressId: id,
            data: {
                isDefault: true,
            },
        })
    }

    const handleEdit = (
        address: UserAddress,
    ) => {
        setShowForm(false)

        setEditingAddress(address)
    }

    const closeCreateForm = () => {
        setShowForm(false)
    }

    const openCreateForm = () => {
        setEditingAddress(null)

        setShowForm(true)
    }

    const cancelEdit = () => {
        setEditingAddress(null)
    }

    return {
        addresses:
            addressesQuery.data,

        isLoading:
            addressesQuery.isLoading,

        isCreating:
            createState.isLoading,

        isUpdating:
            updateState.isLoading,

        isDeleting:
            deleteState.isLoading,

        showForm,
        editingAddress,

        handleCreate,
        handleUpdate,
        handleDelete,
        handleSetDefault,
        handleEdit,

        openCreateForm,
        closeCreateForm,
        cancelEdit,
    }
}