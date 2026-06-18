import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../../api/baseQuery";

export interface UserProfile {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
}

export interface UpdateProfileInput {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
}

export const accountApi = createApi({
    reducerPath: "accountApi",
    baseQuery,
    tagTypes: ["Profile"],
    endpoints: (builder) => ({

        getProfile: builder.query<UserProfile, void>({
            query: () => "/users/me",
            providesTags: ["Profile"],
        }),

        updateProfile: builder.mutation<UserProfile, UpdateProfileInput>({
            query: (body) => ({
                url: "/users/me/profile",
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["Profile"],
        }),
    }),
});

export const {
    useGetProfileQuery,
    useUpdateProfileMutation,
} = accountApi;