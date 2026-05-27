import { useEffect } from 'react'
import type {
    UseFormReset,
} from 'react-hook-form'

import type {
    UpdateProfileInput,
    UserProfile,
} from '../api/accountApi'

export const usePopulateProfileForm = (
    profile: UserProfile | undefined,
    reset: UseFormReset<UpdateProfileInput>,
) => {
    useEffect(() => {
        if (!profile) {
            return
        }

        reset({
            firstName: profile.firstName ?? '',
            lastName: profile.lastName ?? '',
            phoneNumber: profile.phoneNumber ?? '',
        })
    }, [profile, reset])
}