import { useForm } from 'react-hook-form'
import {
    useGetProfileQuery,
    useUpdateProfileMutation,
    type UpdateProfileInput,
} from '../../api/accountApi'
import { usePopulateProfileForm } from '../../hooks/usePopulateProfileForm'
import { buildProfilePayload } from '../../utils/buildProfilePayload'
import { ProfileDetailsForm } from './ProfileDetailsForm'
import { AccountSection } from '../shared/AccountSection'

export const ProfileDetails = () => {
    const profileQuery = useGetProfileQuery()

    const [updateProfile, updateState] =
        useUpdateProfileMutation()

    const form = useForm<UpdateProfileInput>()

    usePopulateProfileForm(
        profileQuery.data,
        form.reset,
    )

    const onSubmit = async (
        data: UpdateProfileInput,
    ) => {
        await updateProfile(
            buildProfilePayload(data),
        )
    }

    if (profileQuery.isLoading) {
        return (
            <AccountSection title="Profile Details">
                <p className="text-sm text-muted-foreground">
                    Loading profile…
                </p>
            </AccountSection>
        )
    }

    return (
        <ProfileDetailsForm
            form={form}
            onSubmit={onSubmit}
            updateState={updateState}
        />
    )
}