import type { UseFormReset } from 'react-hook-form';
import type { UserProfile } from '../api/accountApi';
import { useEffect, useRef } from 'react';

export const usePopulateProfileForm = (
    profile: UserProfile | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reset: UseFormReset<any>,
) => {
    const hasPopulated = useRef(false);

    useEffect(() => {
        if (!profile || hasPopulated.current) {
            return;
        }

        reset({
            firstName: profile.firstName ?? '',
            lastName: profile.lastName ?? '',
            phoneNumber: profile.phoneNumber ?? '',
        });

        hasPopulated.current = true;
    }, [profile, reset]);
};