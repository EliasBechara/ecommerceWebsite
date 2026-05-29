

import type { UserAddress } from '../../api/addressesApi'
import { AddressCardActions } from './AddressCardActions'

interface AddressCardProps {
    address: UserAddress
    onEdit: (address: UserAddress) => void
    onDelete: (id: string) => void
    onSetDefault: (id: string) => void
    isDeleting: boolean
}

export const AddressCard = ({
    address,
    onEdit,
    onDelete,
    onSetDefault,
    isDeleting,
}: AddressCardProps) => {
    const containerClass = address.isDefault
        ? 'border-zinc-800 bg-zinc-200/60'
        : 'border-zinc-300 bg-transparent'

    const fullStreet = `${address.street}, ${address.number}${address.complement
        ? `, ${address.complement}`
        : ''
        }`

    const cityLine = `${address.district} — ${address.city}, ${address.state}`

    return (
        <div
            className={`relative border rounded-xl p-4 flex flex-col gap-1 transition-colors ${containerClass}`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    {address.label && (
                        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            {address.label}
                        </span>
                    )}

                    {address.isDefault && (
                        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-800 bg-zinc-200 px-2 py-0.5 rounded-full">
                            Default
                        </span>
                    )}
                </div>

                <AddressCardActions
                    address={address}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onSetDefault={onSetDefault}
                    isDeleting={isDeleting}
                />
            </div>

            <p className="font-medium text-zinc-900 text-sm">
                {address.recipientName}
            </p>

            <p className="text-sm text-zinc-700">
                {fullStreet}
            </p>

            <p className="text-sm text-zinc-700">
                {cityLine}
            </p>

            <p className="text-sm text-zinc-700">
                {address.zipCode}
            </p>

            {address.phoneNumber && (
                <p className="text-sm text-zinc-700 mt-1">
                    {address.phoneNumber}
                </p>
            )}
        </div>
    )
}