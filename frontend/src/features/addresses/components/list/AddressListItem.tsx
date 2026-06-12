import type { UserAddress, CreateAddressInput } from '../../api/addressesApi'
import { AddressCard } from '../card/AddressCard'
import { AddressForm } from '../forms/AddressForm'

interface AddressListItemProps {
    address: UserAddress
    editingAddress: UserAddress | null

    onUpdate: (
        data: CreateAddressInput,
    ) => Promise<void>
    onCancelEdit: () => void

    onEdit: (address: UserAddress) => void
    onDelete: (id: string) => void
    onSetDefault: (id: string) => void

    isUpdating: boolean
    isDeleting: boolean
}

export const AddressListItem = ({
    address,
    editingAddress,

    onUpdate,
    onCancelEdit,

    onEdit,
    onDelete,
    onSetDefault,

    isUpdating,
    isDeleting,
}: AddressListItemProps) => {
    const isEditing =
        editingAddress?.id === address.id

    if (isEditing) {
        return (
            <AddressForm
                initial={{
                    ...address,

                    label:
                        address.label ??
                        undefined,

                    phoneNumber:
                        address.phoneNumber ??
                        undefined,

                    complement:
                        address.complement ??
                        undefined,
                }}
                onSubmit={onUpdate}
                onCancel={onCancelEdit}
                isLoading={isUpdating}
                submitLabel="Update Address"
            />
        )
    }

    return (
        <AddressCard
            address={address}
            onEdit={onEdit}
            onDelete={onDelete}
            onSetDefault={onSetDefault}
            isDeleting={isDeleting}
        />
    )
}