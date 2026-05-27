import { Button } from '../../../../../components/button/Button'

const LABEL_OPTIONS = [
    { value: 'HOME', display: 'Home' },
    { value: 'WORK', display: 'Work' },
    { value: 'OTHER', display: 'Other' },
] as const

interface AddressLabelSelectorProps {
    label:
    | 'HOME'
    | 'WORK'
    | 'OTHER'
    | undefined

    onChange: (
        value:
            | 'HOME'
            | 'WORK'
            | 'OTHER'
            | undefined,
    ) => void
}

export const AddressLabelSelector = ({
    label,
    onChange,
}: AddressLabelSelectorProps) => {
    return (
        <div className="flex gap-2">
            {LABEL_OPTIONS.map(
                ({ value, display }) => {
                    const isActive =
                        label === value

                    return (
                        <Button
                            key={value}
                            type="button"
                            variant="selectChip"
                            onClick={() =>
                                onChange(
                                    isActive
                                        ? undefined
                                        : value,
                                )
                            }
                            className={
                                isActive
                                    ? 'bg-zinc-800 text-white border-zinc-800'
                                    : 'bg-white text-zinc-600 border-zinc-300 hover:border-zinc-500'
                            }
                        >
                            {display}
                        </Button>
                    )
                },
            )}
        </div>
    )
}