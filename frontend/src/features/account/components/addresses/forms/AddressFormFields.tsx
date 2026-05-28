import { useId } from 'react'
import type {
    UseFormReturn,
} from 'react-hook-form'
import { ControlledFormInput } from '../../../../auth/components/ControlledFormInput'
import { ADDRESS_FIELDS } from './addressFieldsConfig'

interface AddressFormFieldsProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: UseFormReturn<any>;
    isLoading: boolean
}

export const AddressFormFields = ({
    form,
    isLoading,
}: AddressFormFieldsProps) => {
    const uid = useId()

    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                {ADDRESS_FIELDS.slice(0, 2).map(
                    (field) => (
                        <ControlledFormInput
                            key={field.name}
                            variant='light'
                            field={field}
                            form={form}
                            isLoading={isLoading}
                            uid={uid}
                        />
                    ),
                )}
            </div>

            <div className="grid grid-cols-3 gap-4">
                {ADDRESS_FIELDS.slice(2, 4).map(
                    (field) => (
                        <div
                            key={field.name}
                            className={
                                field.containerClass
                            }
                        >
                            <ControlledFormInput
                                field={field}
                                variant='light'
                                form={form}
                                isLoading={isLoading}
                                uid={uid}
                            />
                        </div>
                    ),
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                {ADDRESS_FIELDS.slice(4, 6).map(
                    (field) => (
                        <ControlledFormInput
                            key={field.name}
                            field={field}
                            variant='light'
                            form={form}
                            isLoading={isLoading}
                            uid={uid}
                        />
                    ),
                )}
            </div>

            <div className="grid grid-cols-3 gap-4">
                {ADDRESS_FIELDS.slice(6).map(
                    (field) => (
                        <ControlledFormInput
                            key={field.name}
                            field={field}
                            variant='light'
                            form={form}
                            isLoading={isLoading}
                            uid={uid}
                        />
                    ),
                )}
            </div>
        </>
    )
}