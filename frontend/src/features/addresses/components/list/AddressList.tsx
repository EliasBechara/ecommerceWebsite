import type { UserAddress, CreateAddressInput } from '../../api/addressesApi'
import { AddressListItem } from './AddressListItem'

interface AddressListProps {
    addresses: UserAddress[]

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

export const AddressList = ({
    addresses,

    editingAddress,

    onUpdate,
    onCancelEdit,

    onEdit,
    onDelete,
    onSetDefault,

    isUpdating,
    isDeleting,
}: AddressListProps) => {
    if (addresses.length === 0) {
        return null
    }

    return (
        <div className="flex flex-col gap-3">
            {addresses.map((address) => (
                <AddressListItem
                    key={address.id}
                    address={address}
                    editingAddress={
                        editingAddress
                    }
                    onUpdate={
                        onUpdate
                    }
                    onCancelEdit={
                        onCancelEdit
                    }
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onSetDefault={
                        onSetDefault
                    }
                    isUpdating={
                        isUpdating
                    }
                    isDeleting={
                        isDeleting
                    }
                />
            ))}
        </div>
    )
}