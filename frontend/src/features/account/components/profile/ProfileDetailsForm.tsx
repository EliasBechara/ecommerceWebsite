/* eslint-disable @typescript-eslint/no-explicit-any */
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../../components/button/Button';
import { FormSection } from '../shared/FormSection';
import { ProfileUpdateStatus } from './ProfileUpdateStatus';
import type { UserProfile } from '../../api/accountApi';
import { ControlledFormInput } from '../../../auth/components/ControlledFormInput';
import { usePopulateProfileForm } from '../../hooks/usePopulateProfileForm';


// ─── Profile Schema ────────────────────────────────────────────────────────────
const profileSchema = z.object({
    firstName: z
        .string()
        .trim()
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name cannot exceed 50 characters'),

    lastName: z
        .string()
        .trim()
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name cannot exceed 50 characters'),

    phoneNumber: z
        .string()
        .trim()
        .nullish() // Explicitly allows null or undefined safely
        .or(z.literal('')) // Explicitly allows empty strings from HTML inputs
        .refine(
            (val) => {
                // If it's falsy (undefined, null, or empty string), it passes cleanly
                if (!val) return true;
                // Otherwise, validate the strict format
                return /^\+55\s\d{2}\s\d{5}-\d{4}$/.test(val);
            },
            {
                message: 'Use format: +55 11 99999-9999',
            }
        )
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// ─── Fields config ────────────────────────────────────────────────────────────

const PROFILE_FIELDS = [
    {
        name: 'firstName',
        label: 'First Name',
        placeholder: 'First name',
    },
    {
        name: 'lastName',
        label: 'Last Name',
        placeholder: 'Last name',
    },
    {
        name: 'phoneNumber',
        label: 'Phone Number',
        placeholder: 'Phone number',
        type: 'tel',
    },
];

interface ProfileDetailsFormProps {
    profileData?: UserProfile;
    onSubmit: (data: ProfileFormValues) => Promise<unknown>;
    updateState: {
        isLoading: boolean;
        isSuccess: boolean;
        isError: boolean;
    };
}

export const ProfileDetailsForm = ({
    profileData,
    onSubmit,
    updateState,
}: ProfileDetailsFormProps) => {
    const uid = useId();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: profileData?.firstName ?? '',
            lastName: profileData?.lastName ?? '',
            phoneNumber: profileData?.phoneNumber ?? '',
        },
        mode: 'onChange',
    });

    const {
        handleSubmit,
        reset,
        formState: { isDirty },
    } = form;

    usePopulateProfileForm(profileData, reset as any);

    return (
        <FormSection
            title="Profile Details"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
        >
            <div className="grid grid-cols-2 gap-4">
                {PROFILE_FIELDS.map((field) => (
                    <ControlledFormInput<ProfileFormValues>
                        key={field.name}
                        field={field}
                        form={form}
                        isLoading={updateState.isLoading}
                        uid={uid}
                    />
                ))}
            </div>

            <ProfileUpdateStatus
                isSuccess={updateState.isSuccess}
                isError={updateState.isError}
            />

            <Button
                type="submit"
                variant="profileSettings"
                disabled={updateState.isLoading || !isDirty}
                className="mt-4"
            >
                {updateState.isLoading ? 'Saving…' : 'Save Changes'}
            </Button>
        </FormSection>
    );
};