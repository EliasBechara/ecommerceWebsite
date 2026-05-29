
import { Button } from '../../../../components/button/Button'
import type { UserAddress } from '../../api/addressesApi'


interface AddressCardActionsProps {
    address: UserAddress
    onEdit: (address: UserAddress) => void
    onDelete: (id: string) => void
    onSetDefault: (id: string) => void
    isDeleting: boolean
}

export const AddressCardActions = ({
    address,
    onEdit,
    onDelete,
    onSetDefault,
    isDeleting,
}: AddressCardActionsProps) => {
    return (
        <div className="flex gap-2">
            {!address.isDefault && (
                <Button
                    type="button"
                    variant="actionText"
                    onClick={() =>
                        onSetDefault(address.id)
                    }
                >
                    Set default
                </Button>
            )}

            <Button
                type="button"
                variant="actionText"
                onClick={() => onEdit(address)}
            >
                Edit
            </Button>

            <Button
                type="button"
                variant="dangerText"
                onClick={() =>
                    onDelete(address.id)
                }
                disabled={isDeleting}
            >
                Remove
            </Button>
        </div>
    )
}