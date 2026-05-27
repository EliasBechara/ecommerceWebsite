/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
    FieldValues,
    Path,
    UseFormSetError,
} from 'react-hook-form'

export const handleAddressFormError = <
    T extends FieldValues,
>(
    error: any,
    setError: UseFormSetError<T>,
) => {
    const backendDetails = error?.data?.details

    if (
        backendDetails &&
        typeof backendDetails === 'object'
    ) {
        Object.entries(backendDetails).forEach(
            ([field, messages]) => {
                if (
                    Array.isArray(messages) &&
                    messages.length > 0
                ) {
                    setError(field as Path<T>, {
                        type: 'server',
                        message: String(messages[0]),
                    })
                }
            },
        )

        return
    }

    setError('root' as Path<T>, {
        type: 'server',
        message:
            error?.data?.message ||
            'Something went wrong',
    })
}