/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSelector, useDispatch } from "react-redux";

import { useHydrateCart } from "./useHydrateCart";
import { setCart } from "../cartSlice";
import { setHydrated } from "../../auth/authSlice";
import { loadCartFromStorage } from "../utils/saveToLocalStorage";

// -------------------- mocks --------------------

vi.mock("react-redux", () => ({
    useSelector: vi.fn(),
    useDispatch: vi.fn(),
}));

vi.mock("../utils/saveToLocalStorage", () => ({
    loadCartFromStorage: vi.fn(),
}));

vi.mock("../cartSlice", () => ({
    setCart: vi.fn((payload) => ({ type: "setCart", payload })),
}));

vi.mock("../../auth/authSlice", () => ({
    setHydrated: vi.fn(() => ({ type: "setHydrated" })),
}));

// -------------------- setup --------------------

const mockDispatch = vi.fn();
const mockUseSelector = vi.mocked(useSelector);
const mockLoadCart = vi.mocked(loadCartFromStorage);

describe("useHydrateCart", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useDispatch as unknown as any).mockReturnValue(mockDispatch);
    });

    const setState = (user: any, authHydrated: boolean) => {
        mockUseSelector.mockImplementation((selector: any) =>
            selector({
                auth: {
                    user,
                    isHydrated: authHydrated,
                },
            })
        );
    };

    it("does nothing if auth is not hydrated", () => {
        setState(null, false);

        renderHook(() => useHydrateCart());

        expect(mockDispatch).not.toHaveBeenCalled();
        expect(mockLoadCart).not.toHaveBeenCalled();
    });

    it("dispatches setHydrated when user exists", () => {
        setState({ id: "1" }, true);

        renderHook(() => useHydrateCart());

        expect(mockDispatch).toHaveBeenCalledWith(setHydrated());
    });

    it("hydrates cart from storage when guest has items", () => {
        setState(null, true);

        mockLoadCart.mockReturnValue([
            {
                product: {
                    id: "p1",
                    name: "Keyboard",
                    slug: "keyboard",
                    description: "desc",
                    price: 100,
                    category: "CPU",
                    image: "img.jpg",
                    stock: 10,
                },
                quantity: 2,
            },
        ]);

        renderHook(() => useHydrateCart());

        expect(mockDispatch).toHaveBeenCalledWith(
            setCart([
                expect.objectContaining({
                    quantity: 2,
                }),
            ])
        );

        expect(mockDispatch).toHaveBeenCalledWith(setHydrated());
    });

    it("does not set cart if storage is empty", () => {
        setState(null, true);
        mockLoadCart.mockReturnValue([]);

        renderHook(() => useHydrateCart());

        expect(mockDispatch).toHaveBeenCalledWith(setHydrated());
        expect(mockDispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({ type: "setCart" })
        );
    });

    it("handles undefined storage safely", () => {
        setState(null, true);
        mockLoadCart.mockReturnValue(undefined as any);

        renderHook(() => useHydrateCart());

        expect(mockDispatch).toHaveBeenCalledWith(setHydrated());
    });

    it("handles null storage safely", () => {
        setState(null, true);
        mockLoadCart.mockReturnValue(null as any);

        renderHook(() => useHydrateCart());

        expect(mockDispatch).toHaveBeenCalledWith(setHydrated());
    });

    it("calls storage only for guest users", () => {
        setState(null, true);
        mockLoadCart.mockReturnValue([]);

        renderHook(() => useHydrateCart());

        expect(mockLoadCart).toHaveBeenCalled();
    });

    it("does not call storage when user exists", () => {
        setState({ id: "1" }, true);

        renderHook(() => useHydrateCart());

        expect(mockLoadCart).not.toHaveBeenCalled();
    });

    it("always dispatches setHydrated when auth is ready", () => {
        setState(null, true);

        renderHook(() => useHydrateCart());

        expect(mockDispatch).toHaveBeenCalledWith(setHydrated());
    });

    it("runs full guest hydration flow", () => {
        setState(null, true);

        mockLoadCart.mockReturnValue([
            {
                product: {
                    id: "p1",
                    name: "Keyboard",
                    slug: "keyboard",
                    description: "desc",
                    price: 100,
                    category: "CPU",
                    image: "img.jpg",
                    stock: 10,
                },
                quantity: 1,
            },
        ]);

        renderHook(() => useHydrateCart());

        expect(mockDispatch).toHaveBeenCalledWith(setCart(expect.any(Array)));
        expect(mockDispatch).toHaveBeenCalledWith(setHydrated());
    });
});