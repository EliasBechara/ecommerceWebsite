import {
    useGetProfileQuery,
    useUpdateProfileMutation,
} from '../../api/accountApi';
import { buildProfilePayload } from '../../utils/buildProfilePayload';
import { ProfileDetailsForm } from './ProfileDetailsForm';
import { AccountSection } from '../shared/AccountSection';

export const ProfileDetails = () => {
    const { data: profileData, isLoading: isQueryLoading } = useGetProfileQuery();
    const [updateProfile, updateState] = useUpdateProfileMutation();

    if (isQueryLoading) {
        return (
            <AccountSection title="Profile Details">
                <p className="text-sm text-muted-foreground">Loading profile…</p>
            </AccountSection>
        );
    }

    return (
        <ProfileDetailsForm
            profileData={profileData}
            onSubmit={(data) => {
                // Convert null to undefined so it satisfies UpdateProfileInput strict types
                const normalizedData = {
                    ...data,
                    phoneNumber: data.phoneNumber === null ? undefined : data.phoneNumber,
                };

                return updateProfile(buildProfilePayload(normalizedData)).unwrap();
            }}
            updateState={updateState}
        />
    );
};