/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCart } from "./useCart";
import { useCartSummary } from "./useCartSummary";

vi.mock("./useCart", () => ({
    useCart: vi.fn(),
}));

const mockUseCart = vi.mocked(useCart);

describe("useCartSummary", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const baseState = {
        isLoading: false,
        isGuest: false,
        items: [],
    };

    it("returns items from useCart", () => {
        mockUseCart.mockReturnValue({
            ...baseState,
            items: [{ product: { price: 10 }, quantity: 2 }] as any,
        });

        const { result } = renderHook(() => useCartSummary());

        expect(result.current.items).toHaveLength(1);
    });

    it("calculates totalItems correctly", () => {
        mockUseCart.mockReturnValue({
            ...baseState,
            items: [
                { product: { price: 10 }, quantity: 2 },
                { product: { price: 10 }, quantity: 3 },
            ] as any,
        });

        const { result } = renderHook(() => useCartSummary());

        expect(result.current.totalItems).toBe(5);
    });

    it("calculates totalPrice correctly", () => {
        mockUseCart.mockReturnValue({
            ...baseState,
            items: [
                { product: { price: 10 }, quantity: 2 }, // 20
                { product: { price: 5 }, quantity: 3 },  // 15
            ] as any,
        });

        const { result } = renderHook(() => useCartSummary());

        expect(result.current.totalPrice).toBe(35);
    });

    it("returns isLoading from useCart", () => {
        mockUseCart.mockReturnValue({
            ...baseState,
            isLoading: true,
        });

        const { result } = renderHook(() => useCartSummary());

        expect(result.current.isLoading).toBe(true);
    });

    it("returns isGuest from useCart", () => {
        mockUseCart.mockReturnValue({
            ...baseState,
            isGuest: true,
        });

        const { result } = renderHook(() => useCartSummary());

        expect(result.current.isGuest).toBe(true);
    });

    it("returns zero totals when cart is empty", () => {
        mockUseCart.mockReturnValue(baseState);

        const { result } = renderHook(() => useCartSummary());

        expect(result.current.totalItems).toBe(0);
        expect(result.current.totalPrice).toBe(0);
    });

    it("handles single item correctly", () => {
        mockUseCart.mockReturnValue({
            ...baseState,
            items: [{ product: { price: 50 }, quantity: 1 }] as any,
        });

        const { result } = renderHook(() => useCartSummary());

        expect(result.current.totalItems).toBe(1);
        expect(result.current.totalPrice).toBe(50);
    });

    it("handles multiple items correctly", () => {
        mockUseCart.mockReturnValue({
            ...baseState,
            items: [
                { product: { price: 2 }, quantity: 2 }, // 4
                { product: { price: 3 }, quantity: 3 }, // 9
                { product: { price: 4 }, quantity: 1 }, // 4
            ] as any,
        });

        const { result } = renderHook(() => useCartSummary());

        expect(result.current.totalItems).toBe(6);
        expect(result.current.totalPrice).toBe(17);
    });

    it("updates totals when items change", () => {
        mockUseCart.mockReturnValue({
            ...baseState,
            items: [{ product: { price: 10 }, quantity: 1 }] as any,
        });

        const { result, rerender } = renderHook(() => useCartSummary());

        expect(result.current.totalPrice).toBe(10);

        mockUseCart.mockReturnValue({
            ...baseState,
            items: [{ product: { price: 10 }, quantity: 3 }] as any,
        });

        rerender();

        expect(result.current.totalPrice).toBe(30);
    });

    it("does not mutate items", () => {
        const items = [
            { product: { price: 10 }, quantity: 2 },
        ] as any;

        mockUseCart.mockReturnValue({
            ...baseState,
            items,
        });

        renderHook(() => useCartSummary());

        expect(items).toEqual([
            { product: { price: 10 }, quantity: 2 },
        ]);
    });

    it("handles missing items safely", () => {
        mockUseCart.mockReturnValue({
            ...baseState,
            items: undefined as any,
        });

        const { result } = renderHook(() => useCartSummary());

        expect(result.current.totalItems).toBe(0);
        expect(result.current.totalPrice).toBe(0);
    });
});