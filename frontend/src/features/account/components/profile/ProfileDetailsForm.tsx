import type {
    UseFormReturn,
} from 'react-hook-form'

import { Button } from '../../../../components/button/Button'
import { FormField } from '../../../../components/FormField'

import type {
    UpdateProfileInput,
} from '../../api/accountApi'

import { FormSection } from '../shared/FormSection'
import { ProfileUpdateStatus } from './ProfileUpdateStatus'

interface ProfileDetailsFormProps {
    form: UseFormReturn<UpdateProfileInput>

    onSubmit: (
        data: UpdateProfileInput,
    ) => Promise<void>

    updateState: {
        isLoading: boolean
        isSuccess: boolean
        isError: boolean
    }
}

export const ProfileDetailsForm = ({
    form,
    onSubmit,
    updateState,
}: ProfileDetailsFormProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
    } = form

    return (
        <FormSection
            title="Profile Details"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
        >
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    label="First Name"
                    placeholder="First name"
                    error={errors.firstName?.message}
                    {...register('firstName', {
                        required:
                            'First name is required',
                    })}
                />

                <FormField
                    label="Last Name"
                    placeholder="Last name"
                    error={errors.lastName?.message}
                    {...register('lastName', {
                        required:
                            'Last name is required',
                    })}
                />

                <FormField
                    label="Phone Number"
                    placeholder="Phone number"
                    error={errors.phoneNumber?.message}
                    {...register('phoneNumber')}
                />
            </div>

            <ProfileUpdateStatus
                isSuccess={updateState.isSuccess}
                isError={updateState.isError}
            />

            <Button
                type="submit"
                variant="profileSettings"
                disabled={
                    updateState.isLoading ||
                    !isDirty
                }
            >
                {updateState.isLoading
                    ? 'Saving…'
                    : 'Save Changes'}
            </Button>
        </FormSection>
    )
}