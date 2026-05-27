import type { UpdateProfileInput } from '../api/accountApi'

export const buildProfilePayload = (
    data: UpdateProfileInput,
): UpdateProfileInput => ({
    firstName: data.firstName,
    lastName: data.lastName,

    ...(data.phoneNumber
        ? { phoneNumber: data.phoneNumber }
        : {}),
})