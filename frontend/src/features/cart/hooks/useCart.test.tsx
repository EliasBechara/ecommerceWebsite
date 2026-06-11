/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSelector } from "react-redux";
import { useGetCartQuery } from "../api/cartApi";
import { useCart } from "./useCart";

vi.mock("react-redux", () => ({
    useSelector: vi.fn(),
}));

vi.mock("../api/cartApi", () => ({
    useGetCartQuery: vi.fn(),
}));

const mockUseSelector = vi.mocked(useSelector);
const mockUseGetCartQuery = vi.mocked(useGetCartQuery);

const baseQuery = {
    data: undefined,
    isLoading: false,
    refetch: vi.fn(),
};

describe("useCart", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockUseGetCartQuery.mockReturnValue(baseQuery as any);
    });

    it("returns guest cart when user is null", () => {
        mockUseSelector.mockImplementation((selector) =>
            selector({
                auth: { user: null },
                cart: { list: [{ id: "1" }] },
            })
        );

        const { result } = renderHook(() => useCart());

        expect(result.current.isGuest).toBe(true);
        expect(result.current.items).toEqual([{ id: "1" }]);
    });

    it("returns server cart when user exists", () => {
        mockUseSelector.mockImplementation((selector) =>
            selector({
                auth: { user: { id: "user-1" } },
                cart: { list: [] },
            })
        );

        mockUseGetCartQuery.mockReturnValue({
            ...baseQuery,
            data: { items: [{ id: "server-item" }] },
        } as any);

        const { result } = renderHook(() => useCart());

        expect(result.current.items).toEqual([{ id: "server-item" }]);
    });

    it("falls back to empty array when server cart is undefined", () => {
        mockUseSelector.mockImplementation((selector) =>
            selector({
                auth: { user: { id: "user-1" } },
                cart: { list: [] },
            })
        );

        mockUseGetCartQuery.mockReturnValue({
            ...baseQuery,
            data: undefined,
        } as any);

        const { result } = renderHook(() => useCart());

        expect(result.current.items).toEqual([]);
    });

    it("skips query when user is not logged in", () => {
        mockUseSelector.mockImplementation((selector) =>
            selector({
                auth: { user: null },
                cart: { list: [] },
            })
        );

        renderHook(() => useCart());

        expect(mockUseGetCartQuery).toHaveBeenCalledWith(undefined, {
            skip: true,
        });
    });

    it("calls query when user exists", () => {
        mockUseSelector.mockImplementation((selector) =>
            selector({
                auth: { user: { id: "user-1" } },
                cart: { list: [] },
            })
        );

        renderHook(() => useCart());

        expect(mockUseGetCartQuery).toHaveBeenCalledWith(undefined, {
            skip: false,
        });
    });

    it("sets isLoading false for guest users", () => {
        mockUseSelector.mockImplementation((selector) =>
            selector({
                auth: { user: null },
                cart: { list: [] },
            })
        );

        const { result } = renderHook(() => useCart());

        expect(result.current.isLoading).toBe(false);
    });

    it("returns RTK loading state for logged users", () => {
        mockUseSelector.mockImplementation((selector) =>
            selector({
                auth: { user: { id: "1" } },
                cart: { list: [] },
            })
        );

        mockUseGetCartQuery.mockReturnValue({
            ...baseQuery,
            isLoading: true,
        } as any);

        const { result } = renderHook(() => useCart());

        expect(result.current.isLoading).toBe(true);
    });

    it("sets isGuest correctly when user exists", () => {
        mockUseSelector.mockImplementation((selector) =>
            selector({
                auth: { user: { id: "1" } },
                cart: { list: [] },
            })
        );

        const { result } = renderHook(() => useCart());

        expect(result.current.isGuest).toBe(false);
    });

    it("merges guest cart correctly when user is null", () => {
        mockUseSelector.mockImplementation((selector) =>
            selector({
                auth: { user: null },
                cart: { list: [{ id: "guest-1" }, { id: "guest-2" }] },
            })
        );

        const { result } = renderHook(() => useCart());

        expect(result.current.items).toHaveLength(2);
    });

    it("returns empty array if guest cart is undefined", () => {
        mockUseSelector.mockImplementation((selector) =>
            selector({
                auth: { user: null },
                cart: { list: undefined },
            })
        );

        const { result } = renderHook(() => useCart());

        expect(result.current.items).toEqual([]);
    });
});