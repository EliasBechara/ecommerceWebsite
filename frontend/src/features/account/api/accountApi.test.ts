import { describe, it, expect } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { http, HttpResponse } from "msw";

import { accountApi } from "./accountApi";
import { server } from "../../../tests/server";


const createStore = () =>
    configureStore({
        reducer: {
            [accountApi.reducerPath]: accountApi.reducer,
        },
        middleware: (gDM) =>
            gDM().concat(accountApi.middleware),
    });

describe("accountApi", () => {
    it("fetches the current user profile", async () => {
        const profile = {
            id: "1",
            email: "john@example.com",
            firstName: "John",
            lastName: "Doe",
            phoneNumber: "999999999",
        };

        server.use(
            http.get("http://localhost/api/users/me", () => {
                return HttpResponse.json(profile);
            })
        );

        const store = createStore();

        const result = await store.dispatch(
            accountApi.endpoints.getProfile.initiate()
        );

        expect(result.data).toEqual(profile);
    });

    it("updates the user profile", async () => {
        server.use(
            http.patch("http://localhost/api/users/me/profile", async ({ request }) => {
                const body = (await request.json()) as {
                    firstName: string;
                    lastName: string;
                    phoneNumber?: string;
                };

                expect(body).toEqual({
                    firstName: "Jane",
                    lastName: "Smith",
                    phoneNumber: "123456789",
                });


                return HttpResponse.json({
                    id: "1",
                    email: "john@example.com",
                    ...body,
                });
            })
        );

        const store = createStore();

        const result = await store.dispatch(
            accountApi.endpoints.updateProfile.initiate({
                firstName: "Jane",
                lastName: "Smith",
                phoneNumber: "123456789",
            })
        );

        expect(result.data).toEqual({
            id: "1",
            email: "john@example.com",
            firstName: "Jane",
            lastName: "Smith",
            phoneNumber: "123456789",
        });
    });

    it("returns a normalized unauthorized error", async () => {
        server.use(
            http.get("http://localhost/api/users/me", () =>
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
            accountApi.endpoints.getProfile.initiate()
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
            http.patch("http://localhost/api/users/me/profile", () =>
                HttpResponse.json(
                    {
                        message: "Validation failed",
                        details: {
                            firstName: ["First name is required"],
                            lastName: ["Last name is required"],
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
            accountApi.endpoints.updateProfile.initiate({
                firstName: "",
                lastName: "",
            })
        );

        expect(result.error).toEqual({
            status: 400,
            data: {
                message: "Validation failed",
                details: {
                    firstName: ["First name is required"],
                    lastName: ["Last name is required"],
                },
            },
        });
    });

    it("normalizes network errors", async () => {
        server.use(
            http.get("http://localhost/api/users/me", () => {
                return HttpResponse.error();
            })
        );

        const store = createStore();

        const result = await store.dispatch(
            accountApi.endpoints.getProfile.initiate()
        );

        expect(result.error).toEqual({
            status: "FETCH_ERROR",
            data: {
                message: "Network error. Please check your connection.",
            },
        });
    });

    it("invalidates the Profile tag after updating", async () => {
        let profileRequests = 0;

        server.use(
            http.get("http://localhost/api/users/me", () => {
                profileRequests++;

                return HttpResponse.json({
                    id: "1",
                    email: "john@example.com",
                    firstName: "John",
                    lastName: "Doe",
                    phoneNumber: null,
                });
            }),

            http.patch("http://localhost/api/users/me/profile", () => {
                return HttpResponse.json({
                    id: "1",
                    email: "john@example.com",
                    firstName: "Jane",
                    lastName: "Doe",
                    phoneNumber: null,
                });
            })
        );

        const store = createStore();

        await store.dispatch(
            accountApi.endpoints.getProfile.initiate()
        );

        expect(profileRequests).toBe(1);

        await store.dispatch(
            accountApi.endpoints.updateProfile.initiate({
                firstName: "Jane",
                lastName: "Doe",
            })
        );

        expect(profileRequests).toBe(2);
    });
});