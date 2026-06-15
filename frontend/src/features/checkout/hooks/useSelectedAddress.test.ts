/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSelectedAddress } from "./useSelectedAddress";

/**
 * Mock mapAddressToCheckout
 */
vi.mock("../../addresses/utils/mapAddressToForm", () => ({
    mapAddressToCheckout: (address: any) => ({
        mapped: true,
        id: address.id,
    }),
}));

describe("useSelectedAddress", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const addresses = [
        { id: "1", isDefault: true },
        { id: "2", isDefault: false },
    ] as any;

    it("initializes with null selected values", () => {
        const { result } = renderHook(() =>
            useSelectedAddress({ addresses })
        );

        expect(result.current.selectedAddressId).toBeNull();
        expect(result.current.selectedAddress).toBeNull();
    });

    it("resolves default selected id from default address", () => {
        const { result } = renderHook(() =>
            useSelectedAddress({ addresses })
        );

        expect(result.current.resolvedSelectedId).toBe("1");
    });

    it("resolves default address correctly", () => {
        const { result } = renderHook(() =>
            useSelectedAddress({ addresses })
        );

        expect(result.current.resolvedAddress).toEqual({
            mapped: true,
            id: "1",
        });
    });

    it("returns null resolved values when no default exists", () => {
        const { result } = renderHook(() =>
            useSelectedAddress({
                addresses: [
                    { id: "1", isDefault: false },
                ] as any,
            })
        );

        expect(result.current.resolvedSelectedId).toBeNull();
        expect(result.current.resolvedAddress).toBeNull();
    });

    it("updates selected address when selectAddress is called", () => {
        const { result } = renderHook(() =>
            useSelectedAddress({ addresses })
        );

        act(() => {
            result.current.selectAddress("2", {
                mapped: true,
                id: "2",
            } as any);
        });

        expect(result.current.selectedAddressId).toBe("2");
        expect(result.current.selectedAddress).toEqual({
            mapped: true,
            id: "2",
        });
    });

    it("prioritizes selected address over default", () => {
        const { result } = renderHook(() =>
            useSelectedAddress({ addresses })
        );

        act(() => {
            result.current.selectAddress("2", {
                mapped: true,
                id: "2",
            } as any);
        });

        expect(result.current.resolvedSelectedId).toBe("2");
        expect(result.current.resolvedAddress).toEqual({
            mapped: true,
            id: "2",
        });
    });

    it("handles undefined addresses safely", () => {
        const { result } = renderHook(() =>
            useSelectedAddress({ addresses: undefined })
        );

        expect(result.current.resolvedSelectedId).toBeNull();
        expect(result.current.resolvedAddress).toBeNull();
    });

    it("uses mapAddressToCheckout for default address", () => {
        const { result } = renderHook(() =>
            useSelectedAddress({ addresses })
        );

        expect(result.current.resolvedAddress).toEqual({
            mapped: true,
            id: "1",
        });
    });
});