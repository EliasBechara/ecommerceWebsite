/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { http, HttpResponse } from "msw";

import { productsApi } from "./productsApi";
import { server } from "../../../tests/server";
import type { Product } from "../productTypes";

const createStore = () =>
    configureStore({
        reducer: {
            [productsApi.reducerPath]: productsApi.reducer,
        },
        middleware: (gDM) => gDM().concat(productsApi.middleware),
    });

describe("productsApi", () => {
    const baseUrl = "http://localhost:5000/api/products";

    // ==================== GET PRODUCTS BY CATEGORY ====================
    describe("getProductsByCategory", () => {
        it("fetches products filtering by category and applying sort parameters", async () => {
            const mockResponse: Product[] = [
                { id: "1", name: "Mechanical Keyboard", price: 150 } as any,
            ];

            server.use(
                http.get(`${baseUrl}/category/electronics`, ({ request }) => {
                    const url = new URL(request.url);
                    // Verify that the query parameter was attached properly
                    expect(url.searchParams.get("sort")).toBe("price_asc");

                    return HttpResponse.json(mockResponse);
                })
            );

            const store = createStore();
            const result = await store.dispatch(
                productsApi.endpoints.getProductsByCategory.initiate({
                    category: "electronics",
                    sort: "price_asc",
                })
            );

            expect(result.data).toEqual(mockResponse);
        });
    });

    // ==================== GET PRODUCT BY SLUG ====================
    describe("getProductBySlug", () => {
        it("fetches a single product using its URL slug identifier", async () => {
            const mockResponse: Product = { id: "1", name: "Screwdriver", slug: "heavy-duty-screwdriver" } as any;

            server.use(
                http.get(`${baseUrl}/heavy-duty-screwdriver`, () => HttpResponse.json(mockResponse))
            );

            const store = createStore();
            const result = await store.dispatch(
                productsApi.endpoints.getProductBySlug.initiate("heavy-duty-screwdriver")
            );

            expect(result.data).toEqual(mockResponse);
        });

        it("handles 404 resource errors cleanly when a slug doesn't exist", async () => {
            server.use(
                http.get(`${baseUrl}/non-existent-item`, () =>
                    HttpResponse.json({ message: "Product not found" }, { status: 404 })
                )
            );

            const store = createStore();
            const result = await store.dispatch(
                productsApi.endpoints.getProductBySlug.initiate("non-existent-item")
            );

            expect(result.error).toEqual({
                status: 404,
                data: { message: "Product not found" },
            });
        });
    });

    // ==================== SEARCH PRODUCT ====================
    describe("searchProduct", () => {
        it("executes a search query passing the argument as a URL search parameter", async () => {
            const mockResponse: Product[] = [
                { id: "2", name: "Brass Screws" } as any,
            ];

            server.use(
                http.get(`${baseUrl}/search`, ({ request }) => {
                    const url = new URL(request.url);
                    expect(url.searchParams.get("q")).toBe("screws");

                    return HttpResponse.json(mockResponse);
                })
            );

            const store = createStore();
            const result = await store.dispatch(
                productsApi.endpoints.searchProduct.initiate("screws")
            );

            expect(result.data).toEqual(mockResponse);
        });
    });
});