interface ProfileUpdateStatusProps {
    isSuccess: boolean
    isError: boolean
}

export const ProfileUpdateStatus = ({
    isSuccess,
    isError,
}: ProfileUpdateStatusProps) => {
    if (isSuccess) {
        return (
            <p className="text-sm text-green-600 mt-2">
                Profile updated successfully.
            </p>
        )
    }

    if (isError) {
        return (
            <p className="text-sm text-red-500 mt-2">
                Failed to update profile. Please try again.
            </p>
        )
    }

    return null
}