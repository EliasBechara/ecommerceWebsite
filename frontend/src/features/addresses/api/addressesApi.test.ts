import { describe, it, expect } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { http, HttpResponse } from "msw";

import { addressesApi, type CreateAddressInput } from "./addressesApi";
import { server } from "../../../tests/server";

const createStore = () =>
    configureStore({
        reducer: {
            [addressesApi.reducerPath]: addressesApi.reducer,
        },
        middleware: (gDM) =>
            gDM().concat(addressesApi.middleware),
    });

describe("addressesApi", () => {
    const address = {
        id: "1",
        label: "HOME" as const,
        recipientName: "John Doe",
        phoneNumber: "999999999",
        street: "Main Street",
        number: "123",
        complement: null,
        district: "Downtown",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
        isDefault: true,
    };

    it("fetches user addresses", async () => {
        server.use(
            http.get("http://localhost/api/users/me/addresses", () => {
                return HttpResponse.json([address]);
            })
        );

        const store = createStore();

        const result = await store.dispatch(
            addressesApi.endpoints.getAddresses.initiate()
        );

        expect(result.data).toEqual([address]);
    });

    it("creates an address", async () => {
        server.use(
            http.post(
                "http://localhost/api/users/me/addresses",
                async ({ request }) => {
                    const body = (await request.json()) as CreateAddressInput;

                    expect(body).toEqual({
                        label: "HOME",
                        recipientName: "John Doe",
                        phoneNumber: "999999999",
                        street: "Main Street",
                        number: "123",
                        district: "Downtown",
                        city: "New York",
                        state: "NY",
                        zipCode: "10001",
                        country: "USA",
                        isDefault: true,
                    });

                    return HttpResponse.json({
                        id: "1",
                        ...body,
                        complement: null,
                    });
                }
            )
        );

        const store = createStore();

        const result = await store.dispatch(
            addressesApi.endpoints.createAddress.initiate({
                label: "HOME",
                recipientName: "John Doe",
                phoneNumber: "999999999",
                street: "Main Street",
                number: "123",
                district: "Downtown",
                city: "New York",
                state: "NY",
                zipCode: "10001",
                country: "USA",
                isDefault: true,
            })
        );

        expect(result.data).toEqual({
            id: "1",
            label: "HOME",
            recipientName: "John Doe",
            phoneNumber: "999999999",
            street: "Main Street",
            number: "123",
            complement: null,
            district: "Downtown",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "USA",
            isDefault: true,
        });
    });

    it("updates an address", async () => {
        server.use(
            http.patch(
                "http://localhost/api/users/me/addresses/1",
                async ({ request }) => {
                    const body = await request.json();

                    expect(body).toEqual({
                        recipientName: "Jane Doe",
                    });

                    return HttpResponse.json({
                        ...address,
                        recipientName: "Jane Doe",
                    });
                }
            )
        );

        const store = createStore();

        const result = await store.dispatch(
            addressesApi.endpoints.updateAddress.initiate({
                addressId: "1",
                data: {
                    recipientName: "Jane Doe",
                },
            })
        );

        expect(result.data?.recipientName).toBe("Jane Doe");
    });

    it("deletes an address", async () => {
        server.use(
            http.delete("http://localhost/api/users/me/addresses/1", () => {
                return new Response(null, {
                    status: 204,
                });
            })
        );

        const store = createStore();

        const result = await store.dispatch(
            addressesApi.endpoints.deleteAddress.initiate("1")
        );
        expect(result.error).toBeUndefined();
    });

    it("returns normalized unauthorized error", async () => {
        server.use(
            http.get("http://localhost/api/users/me/addresses", () =>
                HttpResponse.json(
                    {
                        message: "Unauthorized",
                    },
                    {
                        status: 401,
                    }
                )
            )
        );

        const store = createStore();

        const result = await store.dispatch(
            addressesApi.endpoints.getAddresses.initiate()
        );

        expect(result.error).toEqual({
            status: 401,
            data: {
                message: "Unauthorized",
            },
        });
    });

    it("returns validation errors", async () => {
        server.use(
            http.post("http://localhost/api/users/me/addresses", () =>
                HttpResponse.json(
                    {
                        message: "Validation failed",
                        details: {
                            recipientName: ["Recipient name is required"],
                            street: ["Street is required"],
                        },
                    },
                    {
                        status: 400,
                    }
                )
            )
        );

        const store = createStore();

        const result = await store.dispatch(
            addressesApi.endpoints.createAddress.initiate({
                recipientName: "",
                street: "",
                number: "",
                district: "",
                city: "",
                state: "",
                zipCode: "",
            })
        );

        expect(result.error).toEqual({
            status: 400,
            data: {
                message: "Validation failed",
                details: {
                    recipientName: ["Recipient name is required"],
                    street: ["Street is required"],
                },
            },
        });
    });

    it("normalizes network errors", async () => {
        server.use(
            http.get("http://localhost/api/users/me/addresses", () => {
                return HttpResponse.error();
            })
        );

        const store = createStore();

        const result = await store.dispatch(
            addressesApi.endpoints.getAddresses.initiate()
        );

        expect(result.error).toEqual({
            status: "FETCH_ERROR",
            data: {
                message: "Network error. Please check your connection.",
            },
        });
    });

    it("invalidates the Addresses tag after creating", async () => {
        let requests = 0;

        server.use(
            http.get("http://localhost/api/users/me/addresses", () => {
                requests++;
                return HttpResponse.json([address]);
            }),

            http.post("http://localhost/api/users/me/addresses", () =>
                HttpResponse.json({
                    ...address,
                    id: "2",
                })
            )
        );

        const store = createStore();

        await store.dispatch(
            addressesApi.endpoints.getAddresses.initiate()
        );

        expect(requests).toBe(1);

        await store.dispatch(
            addressesApi.endpoints.createAddress.initiate({
                recipientName: "John Doe",
                street: "Main Street",
                number: "123",
                district: "Downtown",
                city: "New York",
                state: "NY",
                zipCode: "10001",
            })
        );

        expect(requests).toBe(2);
    });
});