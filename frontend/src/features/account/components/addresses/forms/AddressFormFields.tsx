import type {
    FieldErrors,
    UseFormRegister,
} from 'react-hook-form'

import type {
    CreateAddressInput,
} from '../../../api/accountApi'

import { AddressField } from './AddressField'

interface AddressFormFieldsProps {
    register: UseFormRegister<CreateAddressInput>
    errors: FieldErrors<CreateAddressInput>
}

const required =
    (message: string) => ({
        required: message,
    })

export const AddressFormFields = ({
    register,
    errors,
}: AddressFormFieldsProps) => {
    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <AddressField
                    name="recipientName"
                    label="Recipient Name"
                    placeholder="Full name"
                    register={register}
                    errors={errors}
                    rules={required(
                        'Recipient name is required',
                    )}
                />

                <AddressField
                    name="phoneNumber"
                    label="Phone (optional)"
                    placeholder="+55 11 99999-9999"
                    register={register}
                    errors={errors}
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <AddressField
                    containerClass="col-span-2"
                    name="street"
                    label="Street"
                    placeholder="Rua, Av..."
                    register={register}
                    errors={errors}
                    rules={required(
                        'Street is required',
                    )}
                />

                <AddressField
                    name="number"
                    label="Number"
                    placeholder="123"
                    register={register}
                    errors={errors}
                    rules={required(
                        'Number is required',
                    )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <AddressField
                    name="complement"
                    label="Complement (optional)"
                    placeholder="Apt, floor..."
                    register={register}
                    errors={errors}
                />

                <AddressField
                    name="district"
                    label="District"
                    placeholder="Bairro"
                    register={register}
                    errors={errors}
                    rules={required(
                        'District is required',
                    )}
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <AddressField
                    name="city"
                    label="City"
                    placeholder="City"
                    register={register}
                    errors={errors}
                    rules={required(
                        'City is required',
                    )}
                />

                <AddressField
                    name="state"
                    label="State"
                    placeholder="SP"
                    maxLength={2}
                    register={register}
                    errors={errors}
                    rules={{
                        ...required(
                            'State is required',
                        ),

                        onChange: (e) => {
                            e.target.value =
                                e.target.value.toUpperCase()
                        },
                    }}
                />

                <AddressField
                    name="zipCode"
                    label="ZIP Code"
                    placeholder="00000-000"
                    register={register}
                    errors={errors}
                    rules={required(
                        'ZIP code is required',
                    )}
                />
            </div>
        </>
    )
}