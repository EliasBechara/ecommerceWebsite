/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
    saveCartToStorage,
    loadCartFromStorage,
    clearCartStorage,
} from "./saveToLocalStorage";
import type { CartItemType } from "../cartSlice";

// -------------------- mock localStorage --------------------

const storage: Record<string, string> = {};

beforeEach(() => {
    vi.clearAllMocks();

    Object.keys(storage).forEach((key) => delete storage[key]);

    vi.stubGlobal("localStorage", {
        getItem: vi.fn((key: string) => storage[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
            storage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
            delete storage[key];
        }),
    } as any);
});

// -------------------- helpers --------------------

const mockCart: CartItemType[] = [
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
];

// -------------------- tests --------------------

describe("cart storage", () => {
    it("saves cart to localStorage", () => {
        saveCartToStorage(mockCart);

        expect(localStorage.setItem).toHaveBeenCalledWith(
            "guest_cart",
            JSON.stringify(mockCart)
        );
    });

    it("overwrites previous cart", () => {
        saveCartToStorage(mockCart);
        saveCartToStorage([]);

        expect(localStorage.setItem).toHaveBeenCalledWith(
            "guest_cart",
            JSON.stringify([])
        );
    });

    it("loads cart from storage", () => {
        localStorage.setItem("guest_cart", JSON.stringify(mockCart));

        const result = loadCartFromStorage();

        expect(result).toEqual(mockCart);
    });

    it("returns empty array when no data exists", () => {
        const result = loadCartFromStorage();

        expect(result).toEqual([]);
    });

    it("handles malformed JSON safely", () => {
        localStorage.setItem("guest_cart", "invalid-json");

        const result = loadCartFromStorage();

        expect(result).toEqual([]);
    });

    it("handles corrupted storage values", () => {
        localStorage.setItem("guest_cart", "undefined");

        const result = loadCartFromStorage();

        expect(result).toEqual([]);
    });

    it("returns empty array when key is missing", () => {
        const result = loadCartFromStorage();

        expect(result).toEqual([]);
    });

    it("clears cart from storage", () => {
        saveCartToStorage(mockCart);

        clearCartStorage();

        expect(localStorage.removeItem).toHaveBeenCalledWith("guest_cart");
    });

    it("ensures cart is removed after clear", () => {
        saveCartToStorage(mockCart);
        clearCartStorage();

        const result = loadCartFromStorage();

        expect(result).toEqual([]);
    });

    it("full lifecycle: save → load → clear", () => {
        saveCartToStorage(mockCart);

        expect(loadCartFromStorage()).toEqual(mockCart);

        clearCartStorage();

        expect(loadCartFromStorage()).toEqual([]);
    });
});