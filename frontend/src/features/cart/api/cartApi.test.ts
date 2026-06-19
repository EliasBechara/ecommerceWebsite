/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { http, HttpResponse } from "msw";

import { cartApi } from "./cartApi";
import { server } from "../../../tests/server";

const createStore = () =>
    configureStore({
        reducer: {
            [cartApi.reducerPath]: cartApi.reducer,
        },
        middleware: (gDM) => gDM().concat(cartApi.middleware),
    });

describe("cartApi", () => {
    // ==================== GET CART ====================

    describe("getCart", () => {
        it("fetches the authenticated user's cart", async () => {
            const response = {
                items: [
                    {
                        product: { id: "1", name: "Keyboard" },
                        quantity: 2,
                    },
                ],
            };

            server.use(
                http.get("http://localhost/api/cart/me", () =>
                    HttpResponse.json(response)
                )
            );

            const store = createStore();

            const result = await store.dispatch(
                cartApi.endpoints.getCart.initiate()
            );

            expect(result.data).toEqual(response);
        });

        it("returns a normalized unauthorized error", async () => {
            server.use(
                http.get("http://localhost/api/cart/me", () =>
                    HttpResponse.json(
                        { message: "Unauthorized" },
                        { status: 401 }
                    )
                )
            );

            const store = createStore();

            const result = await store.dispatch(
                cartApi.endpoints.getCart.initiate()
            );

            expect(result.error).toEqual({
                status: 401,
                data: {
                    message: "Unauthorized",
                },
            });
        });
        it("returns an empty cart", async () => {
            server.use(
                http.get("http://localhost/api/cart/me", () =>
                    HttpResponse.json({ items: [] })
                )
            );

            const store = createStore();

            const result = await store.dispatch(
                cartApi.endpoints.getCart.initiate()
            );

            expect(result.data).toEqual({ items: [] });
        });

        it("normalizes network errors", async () => {
            server.use(
                http.get("http://localhost/api/cart/me", () =>
                    HttpResponse.error()
                )
            );

            const store = createStore();

            const result = await store.dispatch(
                cartApi.endpoints.getCart.initiate()
            );

            expect(result.error).toEqual({
                status: "FETCH_ERROR",
                data: {
                    message: "Network error. Please check your connection.",
                },
            });
        });
    });

    // ==================== MERGE CART ====================

    describe("mergeCart", () => {
        it("sends the correct payload", async () => {
            server.use(
                http.post(
                    "http://localhost/api/cart/merge",
                    async ({ request }) => {
                        expect(await request.json()).toEqual({
                            items: [
                                {
                                    productId: "1",
                                    quantity: 3,
                                },
                            ],
                        });

                        return HttpResponse.json({});
                    }
                )
            );

            const store = createStore();

            await store.dispatch(
                cartApi.endpoints.mergeCart.initiate([
                    {
                        quantity: 3,
                        product: { id: "1" },
                    } as any,
                ])
            );
        });
        it("returns a normalized validation error", async () => {
            server.use(
                http.post("http://localhost/api/cart/merge", () =>
                    HttpResponse.json(
                        { message: "Validation failed" },
                        { status: 400 }
                    )
                )
            );

            const store = createStore();

            const result = await store.dispatch(
                cartApi.endpoints.mergeCart.initiate([])
            );

            expect(result.error).toEqual({
                status: 400,
                data: {
                    message: "Validation failed",
                },
            });
        });

        it("normalizes network errors", async () => {
            server.use(
                http.post("http://localhost/api/cart/merge", () =>
                    HttpResponse.error()
                )
            );

            const store = createStore();

            const result = await store.dispatch(
                cartApi.endpoints.mergeCart.initiate([])
            );

            expect(result.error).toEqual({
                status: "FETCH_ERROR",
                data: {
                    message: "Network error. Please check your connection.",
                },
            });
        });
    });

    // ==================== ADD ITEM ====================

    describe("addItem", () => {
        it("sends the correct payload", async () => {
            server.use(
                http.post(
                    "http://localhost/api/cart/items/add",
                    async ({ request }) => {
                        expect(await request.json()).toEqual({
                            productId: "1",
                            quantity: 5,
                        });

                        return HttpResponse.json({});
                    }
                )
            );

            const store = createStore();

            await store.dispatch(
                cartApi.endpoints.addItem.initiate({
                    productId: "1",
                    quantity: 5,
                })
            );
        });

        it("returns a normalized 404 error", async () => {
            server.use(
                http.post("http://localhost/api/cart/items/add", () =>
                    HttpResponse.json(
                        { message: "Product not found" },
                        { status: 404 }
                    )
                )
            );

            const store = createStore();

            const result = await store.dispatch(
                cartApi.endpoints.addItem.initiate({
                    productId: "999",
                    quantity: 1,
                })
            );

            expect(result.error).toEqual({
                status: 404,
                data: {
                    message: "Product not found",
                },
            });
        });

        it("normalizes network errors", async () => {
            server.use(
                http.post("http://localhost/api/cart/items/add", () =>
                    HttpResponse.error()
                )
            );

            const store = createStore();

            const result = await store.dispatch(
                cartApi.endpoints.addItem.initiate({
                    productId: "1",
                    quantity: 1,
                })
            );

            expect(result.error).toEqual({
                status: "FETCH_ERROR",
                data: {
                    message: "Network error. Please check your connection.",
                },
            });
        });
    });

    // ==================== UPDATE ITEM ====================

    describe("updateItem", () => {
        it("sends the correct payload", async () => {
            server.use(
                http.patch(
                    "http://localhost/api/cart/items/update/1",
                    async ({ request }) => {
                        expect(await request.json()).toEqual({
                            quantity: 8,
                        });

                        return HttpResponse.json({});
                    }
                )
            );

            const store = createStore();

            await store.dispatch(
                cartApi.endpoints.updateItem.initiate({
                    productId: "1",
                    quantity: 8,
                })
            );
        });
        it("returns a normalized 404 error", async () => {
            server.use(
                http.patch("http://localhost/api/cart/items/update/1", () =>
                    HttpResponse.json(
                        { message: "Item not found" },
                        { status: 404 }
                    )
                )
            );

            const store = createStore();

            const result = await store.dispatch(
                cartApi.endpoints.updateItem.initiate({
                    productId: "1",
                    quantity: 10,
                })
            );

            expect(result.error).toEqual({
                status: 404,
                data: {
                    message: "Item not found",
                },
            });
        });

        it("normalizes network errors", async () => {
            server.use(
                http.patch("http://localhost/api/cart/items/update/1", () =>
                    HttpResponse.error()
                )
            );

            const store = createStore();

            const result = await store.dispatch(
                cartApi.endpoints.updateItem.initiate({
                    productId: "1",
                    quantity: 5,
                })
            );

            expect(result.error).toEqual({
                status: "FETCH_ERROR",
                data: {
                    message: "Network error. Please check your connection.",
                },
            });
        });
    });

    // ==================== REMOVE ITEM ====================

    describe("removeItem", () => {
        it("calls the correct endpoint", async () => {
            server.use(
                http.delete(
                    "http://localhost/api/cart/items/delete/1",
                    () => HttpResponse.json({})
                )
            );

            const store = createStore();

            const result = await store.dispatch(
                cartApi.endpoints.removeItem.initiate("1")
            );

            expect(result.error).toBeUndefined();
        });
        it("returns a normalized 404 error", async () => {
            server.use(
                http.delete("http://localhost/api/cart/items/delete/1", () =>
                    HttpResponse.json(
                        { message: "Item not found" },
                        { status: 404 }
                    )
                )
            );

            const store = createStore();

            const result = await store.dispatch(
                cartApi.endpoints.removeItem.initiate("1")
            );

            expect(result.error).toEqual({
                status: 404,
                data: {
                    message: "Item not found",
                },
            });
        });

        it("normalizes network errors", async () => {
            server.use(
                http.delete("http://localhost/api/cart/items/delete/1", () =>
                    HttpResponse.error()
                )
            );

            const store = createStore();

            const result = await store.dispatch(
                cartApi.endpoints.removeItem.initiate("1")
            );

            expect(result.error).toEqual({
                status: "FETCH_ERROR",
                data: {
                    message: "Network error. Please check your connection.",
                },
            });
        });
    });




});