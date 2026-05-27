import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../auth/api/baseQuery";

export interface UserProfile {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
}

export interface UserAddress {
    id: string;
    label: "HOME" | "WORK" | "OTHER" | null;
    recipientName: string;
    phoneNumber: string | null;
    street: string;
    number: string;
    complement: string | null;
    district: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
}

export interface UpdateProfileInput {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
}

export interface CreateAddressInput {
    label?: "HOME" | "WORK" | "OTHER";
    recipientName: string;
    phoneNumber?: string;
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
    isDefault?: boolean;
}

export type UpdateAddressInput = Partial<CreateAddressInput>;

export const accountApi = createApi({
    reducerPath: "accountApi",
    baseQuery,
    tagTypes: ["Profile", "Addresses"],
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
        getAddresses: builder.query<UserAddress[], void>({
            query: () => "/users/me/addresses",
            providesTags: ["Addresses"],
        }),
        createAddress: builder.mutation<UserAddress, CreateAddressInput>({
            query: (body) => ({
                url: "/users/me/addresses",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Addresses"],
        }),
        updateAddress: builder.mutation<
            UserAddress,
            { addressId: string; data: UpdateAddressInput }
        >({
            query: ({ addressId, data }) => ({
                url: `/users/me/addresses/${addressId}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Addresses"],
        }),
        deleteAddress: builder.mutation<void, string>({
            query: (addressId) => ({
                url: `/users/me/addresses/${addressId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Addresses"],
        }),
    }),
});

export const {
    useGetProfileQuery,
    useUpdateProfileMutation,
    useGetAddressesQuery,
    useCreateAddressMutation,
    useUpdateAddressMutation,
    useDeleteAddressMutation,
} = accountApi;