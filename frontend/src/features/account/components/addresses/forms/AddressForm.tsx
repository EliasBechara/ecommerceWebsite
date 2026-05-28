/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    useForm,
    useWatch,
} from 'react-hook-form'
import { Button } from '../../../../../components/button/Button'
import {
    type CreateAddressInput,
} from '../../../api/accountApi'
import { AddressFormFields } from './AddressFormFields'
import { AddressLabelSelector } from './AddressLabelSelector'
import { handleAddressFormError } from '../../../utils/handleAddressFormError'

const emptyForm =
    (): CreateAddressInput => ({
        recipientName: '',
        phoneNumber: '',
        label: undefined,
        street: '',
        number: '',
        complement: '',
        district: '',
        city: '',
        state: '',
        zipCode: '',
        isDefault: false,
    })

interface AddressFormProps {
    initial?: CreateAddressInput
    onSubmit: (
        data: CreateAddressInput,
    ) => Promise<unknown>
    onCancel: () => void
    isLoading: boolean
    submitLabel: string
}

export const AddressForm = ({
    initial,
    onSubmit,
    onCancel,
    isLoading,
    submitLabel,
}: AddressFormProps) => {
    const form =
        useForm<CreateAddressInput>({
            defaultValues:
                initial ?? emptyForm(),
        })

    const {
        register,
        handleSubmit,
        setError,
        setValue,
        control,
        formState: { errors },
    } = form

    const label = useWatch({
        control,
        name: 'label',
    })

    const onFormSubmit = async (
        data: CreateAddressInput,
    ) => {
        try {
            await onSubmit(data)
        } catch (error: any) {
            console.log(error)

            handleAddressFormError(
                error,
                setError,
            )
        }
    }

    return (
        <form
            onSubmit={handleSubmit(
                onFormSubmit,
            )}
            className="flex flex-col gap-4 border border-zinc-700 rounded-xl p-4 bg-[#d2d2ca8c]"
        >
            <AddressLabelSelector
                label={label}
                onChange={(value) =>
                    setValue(
                        'label',
                        value,
                    )
                }
            />

            <AddressFormFields
                form={form}
                isLoading={isLoading}
            />

            <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                <input
                    type="checkbox"
                    className="rounded border-zinc-300"
                    {...register(
                        'isDefault',
                    )}
                />

                Set as default address
            </label>

            {errors.root && (
                <p className="text-sm text-red-500">
                    {errors.root.message}
                </p>
            )}

            <div className="flex gap-3">
                <Button
                    type="submit"
                    variant="profileSettings"
                    disabled={isLoading}
                >
                    {isLoading
                        ? 'Saving...'
                        : submitLabel}
                </Button>

                <Button
                    type="button"
                    variant="text"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
            </div>
        </form>
    )
}