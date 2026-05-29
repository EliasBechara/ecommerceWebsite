import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../auth/api/baseQuery";

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

export const addressesApi = createApi({
    reducerPath: "addressesApi",
    baseQuery,
    tagTypes: ["Addresses"],
    endpoints: (builder) => ({
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
    useGetAddressesQuery,
    useCreateAddressMutation,
    useUpdateAddressMutation,
    useDeleteAddressMutation,
} = addressesApi;