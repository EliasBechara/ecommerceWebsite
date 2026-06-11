/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSelector } from "react-redux";
import { cartApi } from "../api/cartApi";
import {
    addToCart,
    removeFromCart,
    updateItemQuantity,
} from "../cartSlice";
import { useCartActions } from "./useCartActions";
import { useAppDispatch } from "../../../hooks/useAppDispatch";
import { Category, type Product } from "../../products/productTypes";

vi.mock("react-redux", () => ({
    useSelector: vi.fn(),
}));

vi.mock("../../../hooks/useAppDispatch", () => ({
    useAppDispatch: vi.fn(),
}));


export const createProductMock = (): Product => ({
    id: "p1",
    name: "Keyboard",
    slug: "keyboard",
    description: "mechanical keyboard",
    price: 100,
    category: Category.CPU,
    image: "img.jpg",
    stock: 10,
});

const mockUseSelector = vi.mocked(useSelector);
const mockUseAppDispatch = vi.mocked(useAppDispatch);

describe("useCartActions", () => {
    const dispatchMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAppDispatch.mockReturnValue(dispatchMock);
    });

    const product = createProductMock();


    const setGuest = () => {
        mockUseSelector.mockImplementation((selector) =>
            selector({
                auth: { user: null },
            })
        );
    };

    const setUser = () => {
        mockUseSelector.mockImplementation((selector) =>
            selector({
                auth: { user: { id: "u1" } },
            })
        );
    };

    it("guest add dispatches addToCart", async () => {
        setGuest();

        const { result } = renderHook(() => useCartActions());

        await result.current.add(product as any, 2);

        expect(dispatchMock).toHaveBeenCalledWith(
            addToCart({ product, quantity: 2 })
        );
    });

    it("user add calls RTK endpoint", async () => {
        setUser();

        const unwrap = vi.fn();
        dispatchMock.mockReturnValue({ unwrap });

        const initiateMock = vi.fn().mockReturnValue({ unwrap });

        vi.spyOn(cartApi.endpoints.addItem, "initiate").mockImplementation(
            initiateMock as any
        );

        const { result } = renderHook(() => useCartActions());

        await result.current.add(product as any, 2);

        expect(initiateMock).toHaveBeenCalledWith({
            productId: "p1",
            quantity: 2,
        });

        expect(unwrap).toHaveBeenCalled();
    });

    it("guest remove dispatches removeFromCart", async () => {
        setGuest();

        const { result } = renderHook(() => useCartActions());

        await result.current.remove("p1");

        expect(dispatchMock).toHaveBeenCalledWith(removeFromCart("p1"));
    });

    it("user remove calls RTK endpoint", async () => {
        setUser();

        const unwrap = vi.fn();
        dispatchMock.mockReturnValue({ unwrap });

        const initiateMock = vi.fn().mockReturnValue({ unwrap });

        vi.spyOn(cartApi.endpoints.removeItem, "initiate").mockImplementation(
            initiateMock as any
        );

        const { result } = renderHook(() => useCartActions());

        await result.current.remove("p1");

        expect(initiateMock).toHaveBeenCalledWith("p1");
        expect(unwrap).toHaveBeenCalled();
    });

    it("guest update dispatches updateItemQuantity", async () => {
        setGuest();

        const { result } = renderHook(() => useCartActions());

        await result.current.update("p1", 3);

        expect(dispatchMock).toHaveBeenCalledWith(
            updateItemQuantity({ id: "p1", quantity: 3 })
        );
    });

    it("user update calls RTK endpoint", async () => {
        setUser();

        const unwrap = vi.fn();
        dispatchMock.mockReturnValue({ unwrap });

        const initiateMock = vi.fn().mockReturnValue({ unwrap });

        vi.spyOn(cartApi.endpoints.updateItem, "initiate").mockImplementation(
            initiateMock as any
        );

        const { result } = renderHook(() => useCartActions());

        await result.current.update("p1", 5);

        expect(initiateMock).toHaveBeenCalledWith({
            productId: "p1",
            quantity: 5,
        });

        expect(unwrap).toHaveBeenCalled();
    });

    it("add does not dispatch slice action when user exists", async () => {
        setUser();

        const unwrap = vi.fn();
        dispatchMock.mockReturnValue({ unwrap });

        vi.spyOn(cartApi.endpoints.addItem, "initiate").mockReturnValue({
            unwrap,
        } as any);

        const { result } = renderHook(() => useCartActions());

        await result.current.add(product as any, 1);

        expect(dispatchMock).not.toHaveBeenCalledWith(
            addToCart(expect.anything())
        );
    });

    it("remove does not dispatch slice action when user exists", async () => {
        setUser();

        const unwrap = vi.fn();
        dispatchMock.mockReturnValue({ unwrap });

        vi.spyOn(cartApi.endpoints.removeItem, "initiate").mockReturnValue({
            unwrap,
        } as any);

        const { result } = renderHook(() => useCartActions());

        await result.current.remove("p1");

        expect(dispatchMock).not.toHaveBeenCalledWith(
            removeFromCart("p1")
        );
    });

    it("update does not dispatch slice action when user exists", async () => {
        setUser();

        const unwrap = vi.fn();
        dispatchMock.mockReturnValue({ unwrap });

        vi.spyOn(cartApi.endpoints.updateItem, "initiate").mockReturnValue({
            unwrap,
        } as any);

        const { result } = renderHook(() => useCartActions());

        await result.current.update("p1", 2);

        expect(dispatchMock).not.toHaveBeenCalledWith(
            updateItemQuantity(expect.anything())
        );
    });

    it("all logged-user actions call unwrap", async () => {
        setUser();

        const unwrap = vi.fn();
        dispatchMock.mockReturnValue({ unwrap });

        vi.spyOn(cartApi.endpoints.addItem, "initiate").mockReturnValue({
            unwrap,
        } as any);

        const { result } = renderHook(() => useCartActions());

        await result.current.add(product as any, 1);

        expect(unwrap).toHaveBeenCalled();
    });
});