import { Button } from '../../../components/button/Button'

import { useUserAddresses } from '../hooks/useUserAddresses'

import { AddressForm } from './forms/AddressForm'

import { AddressList } from './list/AddressList'

export const UserAddresses = () => {
    const {
        addresses,
        isLoading,

        isCreating,
        isUpdating,
        isDeleting,

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
    } = useUserAddresses()

    return (
        <div className="flex flex-col gap-4 max-w-xl">
            <h2 className="text-xl font-bold mb-2 text-zinc-900">
                Saved Addresses
            </h2>

            {isLoading && (
                <p className="text-sm text-zinc-500">
                    Loading addresses...
                </p>
            )}

            <AddressList
                addresses={addresses ?? []}
                editingAddress={editingAddress}
                onUpdate={handleUpdate}
                onCancelEdit={cancelEdit}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
                isUpdating={isUpdating}
                isDeleting={isDeleting}
            />

            {showForm ? (
                <AddressForm
                    onSubmit={handleCreate}
                    onCancel={closeCreateForm}
                    isLoading={isCreating}
                    submitLabel="Save Address"
                />
            ) : (
                !editingAddress && (
                    <Button
                        type="button"
                        variant="profileSettings"
                        onClick={openCreateForm}
                    >
                        + Add New Address
                    </Button>
                )
            )}
        </div>
    )
}