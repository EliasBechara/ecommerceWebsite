import { describe, it, expect, vi, beforeEach } from "vitest";
import type { BaseQueryApi } from "@reduxjs/toolkit/query/react";

const { mockRawBaseQuery } = vi.hoisted(() => ({
    mockRawBaseQuery: vi.fn(),
}));

vi.mock("@reduxjs/toolkit/query/react", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@reduxjs/toolkit/query/react")>();
    return {
        ...actual,
        fetchBaseQuery: () => mockRawBaseQuery,
    };
});

import { baseQuery } from "./baseQuery";

const mockApi = {} as BaseQueryApi;
const mockExtraOptions = {};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("baseQuery", () => {
    describe("successful responses", () => {
        it("returns the result unchanged when there is no error", async () => {
            const successResult = { data: { id: 1, name: "Test" } };
            mockRawBaseQuery.mockResolvedValue(successResult);

            const result = await baseQuery("/test", mockApi, mockExtraOptions);

            expect(result).toEqual(successResult);
        });

        it("passes through args, api, and extraOptions to the raw query", async () => {
            mockRawBaseQuery.mockResolvedValue({ data: {} });

            await baseQuery("/endpoint", mockApi, mockExtraOptions);

            expect(mockRawBaseQuery).toHaveBeenCalledWith(
                "/endpoint",
                mockApi,
                mockExtraOptions
            );
        });
    });

    describe("error normalization", () => {
        it("normalizes a structured backend error with message and details", async () => {
            mockRawBaseQuery.mockResolvedValue({
                error: {
                    status: 422,
                    data: {
                        message: "Validation failed",
                        details: { email: ["is invalid"] },
                    },
                },
            });

            const result = await baseQuery("/test", mockApi, mockExtraOptions);

            expect(result).toEqual({
                error: {
                    status: 422,
                    data: {
                        message: "Validation failed",
                        details: { email: ["is invalid"] },
                    },
                },
            });
        });

        it("normalizes a structured backend error with message but no details", async () => {
            mockRawBaseQuery.mockResolvedValue({
                error: {
                    status: 400,
                    data: { message: "Bad request" },
                },
            });

            const result = await baseQuery("/test", mockApi, mockExtraOptions);

            expect(result).toEqual({
                error: {
                    status: 400,
                    data: { message: "Bad request" },
                },
            });
        });

        it("does not include details key when details is absent", async () => {
            mockRawBaseQuery.mockResolvedValue({
                error: { status: 400, data: { message: "No details here" } },
            });

            const result = await baseQuery("/test", mockApi, mockExtraOptions) as { error: { data: object } };

            expect(result.error.data).not.toHaveProperty("details");
        });

        it("falls back to generic message when error data has no message field", async () => {
            mockRawBaseQuery.mockResolvedValue({
                error: { status: 500, data: { code: "INTERNAL" } },
            });

            const result = await baseQuery("/test", mockApi, mockExtraOptions) as { error: { data: { message: string } } };

            expect(result.error.data.message).toBe(
                "Oops... Something went wrong, try again later."
            );
        });

        it("falls back to generic message when error data is a string", async () => {
            mockRawBaseQuery.mockResolvedValue({
                error: { status: 500, data: "Internal Server Error" },
            });

            const result = await baseQuery("/test", mockApi, mockExtraOptions) as { error: { data: { message: string } } };

            expect(result.error.data.message).toBe(
                "Oops... Something went wrong, try again later."
            );
        });

        it("falls back to generic message when error data is null", async () => {
            mockRawBaseQuery.mockResolvedValue({
                error: { status: 500, data: null },
            });

            const result = await baseQuery("/test", mockApi, mockExtraOptions) as { error: { data: { message: string } } };

            expect(result.error.data.message).toBe(
                "Oops... Something went wrong, try again later."
            );
        });

        it("falls back to generic message when error data is undefined", async () => {
            mockRawBaseQuery.mockResolvedValue({
                error: { status: 503, data: undefined },
            });

            const result = await baseQuery("/test", mockApi, mockExtraOptions) as { error: { data: { message: string } } };

            expect(result.error.data.message).toBe(
                "Oops... Something went wrong, try again later."
            );
        });

        it("preserves the original status code in the normalized error", async () => {
            mockRawBaseQuery.mockResolvedValue({
                error: { status: 403, data: { message: "Forbidden" } },
            });

            const result = await baseQuery("/test", mockApi, mockExtraOptions) as { error: { status: number } };

            expect(result.error.status).toBe(403);
        });
    });

    describe("FETCH_ERROR handling", () => {
        it("returns the network error message for FETCH_ERROR status", async () => {
            mockRawBaseQuery.mockResolvedValue({
                error: { status: "FETCH_ERROR", data: undefined },
            });

            const result = await baseQuery("/test", mockApi, mockExtraOptions) as { error: { data: { message: string } } };

            expect(result.error.data.message).toBe(
                "Network error. Please check your connection."
            );
        });

        it("overrides any backend message when status is FETCH_ERROR", async () => {
            mockRawBaseQuery.mockResolvedValue({
                error: {
                    status: "FETCH_ERROR",
                    data: { message: "This should be overridden" },
                },
            });

            const result = await baseQuery("/test", mockApi, mockExtraOptions) as { error: { data: { message: string } } };

            expect(result.error.data.message).toBe(
                "Network error. Please check your connection."
            );
        });

        it("preserves FETCH_ERROR as the status string", async () => {
            mockRawBaseQuery.mockResolvedValue({
                error: { status: "FETCH_ERROR", data: undefined },
            });

            const result = await baseQuery("/test", mockApi, mockExtraOptions) as { error: { status: string } };

            expect(result.error.status).toBe("FETCH_ERROR");
        });
    });
});