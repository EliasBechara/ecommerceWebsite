import type {
    FieldErrors,
    RegisterOptions,
    UseFormRegister,
} from 'react-hook-form'

import { FormField } from '../../../../../components/FormField'

import type {
    CreateAddressInput,
} from '../../../api/accountApi'

interface AddressFieldProps {
    name: keyof CreateAddressInput
    label: string
    placeholder: string
    register: UseFormRegister<CreateAddressInput>
    errors: FieldErrors<CreateAddressInput>
    rules?: RegisterOptions<CreateAddressInput>
    containerClass?: string
    maxLength?: number
}

export const AddressField = ({
    name,
    label,
    placeholder,
    register,
    errors,
    rules,
    containerClass,
    maxLength,
}: AddressFieldProps) => {
    return (
        <FormField
            label={label}
            placeholder={placeholder}
            containerClass={containerClass}
            maxLength={maxLength}
            error={errors[name]?.message}
            {...register(name, rules)}
        />
    )
}