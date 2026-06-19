import { describe, it, expect, vi } from "vitest";
import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { http, HttpResponse } from "msw";

import { authApi } from "./authApi";
import { cartApi } from "../../cart/api/cartApi";
import authReducer from "../authSlice";
import { server } from "../../../tests/server";
/* 
      This file covers the cross-feature behavior between auth and cart:
    merging a guest cart into the server cart on login, clearing the
    guest cart from localStorage afterward, and invalidating cached cart
    data after register/login.

      Pure authApi request/response/state behavior (no cart involved)
    lives in authApi.test.ts. Keeping that split means only the tests
    that actually need it pay the cost of mocking cartApi internals.
*/

// ─── Cart slice matching the shape cartApi.mergeCart reads ───────
// cartApi.ts does: cart.map(item => ({ productId: item.id, ... }))
// So state.cart.list items must have an `id` field.
interface CartItem { id: string; quantity: number }
interface CartState { list: CartItem[] }

const cartSlice = createSlice({
    name: "cart",
    initialState: { list: [] } as CartState,
    reducers: {
        setList: (state, action: PayloadAction<CartItem[]>) => {
            state.list = action.payload;
        },
    },
});

// ─── Store factory ────────────────────────────────────────────────
const createStore = (cartList: CartItem[] = []) =>
    configureStore({
        reducer: {
            [authApi.reducerPath]: authApi.reducer,
            [cartApi.reducerPath]: cartApi.reducer,
            auth: authReducer,
            cart: cartSlice.reducer,
        },
        middleware: (gDM) =>
            gDM().concat(authApi.middleware, cartApi.middleware),
        preloadedState: {
            cart: { list: cartList },
        },
    });

// ─── Shared fixtures ─────────────────────────────────────────────
const authResponse = { id: "1", email: "john@example.com" };


/* 
      A mock RTK Query thunk returned by cartApi.endpoints.mergeCart.initiate.
    When Redux dispatches a thunk it calls thunk(dispatch, getState) and the
    *return value of that call* is what store.dispatch() hands back — so
    .unwrap() must live on the object the thunk RETURNS, not on the thunk itself.
*/

const mockMergeThunk = () => {
    const dispatchResult = {
        data: { success: true },
        unwrap: () => Promise.resolve({ success: true }),
    };
    const thunk = Object.assign(() => dispatchResult, {
        // also put unwrap on the thunk itself in case RTK calls it there
        unwrap: () => Promise.resolve({ success: true }),
    });
    return thunk as never;
};

// ─── Tests ───────────────────────────────────────────────────────
describe("auth + cart integration", () => {

    describe("login merges the guest cart", () => {
        it("merges the guest cart when cart is non-empty", async () => {

            /*    Mock cartApi.endpoints.mergeCart.initiate because the real
                mergeCart query transformer reads fields (like productId/name/price)
                from the full CartItem shape that our minimal test items don't have.

                 The behaviour under test is that authApi.login CALLS mergeCart —
                not the internals of mergeCart itself.
            */

            const mergeSpy = vi
                .spyOn(cartApi.endpoints.mergeCart, "initiate")
                .mockReturnValue(mockMergeThunk());

            server.use(
                http.post("http://localhost/api/auth/login", () =>
                    HttpResponse.json(authResponse)
                )
            );

            const guestCart = [{ id: "p1", quantity: 2 }];
            const store = createStore(guestCart);

            await store.dispatch(
                authApi.endpoints.login.initiate({
                    email: "john@example.com",
                    password: "secret123",
                })
            );

            await vi.waitFor(() => expect(mergeSpy).toHaveBeenCalledWith(guestCart));
            mergeSpy.mockRestore();
        });

        it("does not call mergeCart when the guest cart is empty", async () => {
            const mergeSpy = vi.spyOn(cartApi.endpoints.mergeCart, "initiate");

            server.use(
                http.post("http://localhost/api/auth/login", () =>
                    HttpResponse.json(authResponse)
                )
            );

            const store = createStore([]);
            await store.dispatch(
                authApi.endpoints.login.initiate({
                    email: "john@example.com",
                    password: "secret123",
                })
            );

            await new Promise((r) => setTimeout(r, 100));
            expect(mergeSpy).not.toHaveBeenCalled();
            mergeSpy.mockRestore();
        });

        it("removes guest_cart from localStorage after merging", async () => {
            localStorage.setItem("guest_cart", JSON.stringify([{ id: "p1", quantity: 1 }]));

            const mergeSpy = vi
                .spyOn(cartApi.endpoints.mergeCart, "initiate")
                .mockReturnValue(mockMergeThunk());

            server.use(
                http.post("http://localhost/api/auth/login", () =>
                    HttpResponse.json(authResponse)
                )
            );

            const store = createStore([{ id: "p1", quantity: 1 }]);
            await store.dispatch(
                authApi.endpoints.login.initiate({
                    email: "john@example.com",
                    password: "secret123",
                })
            );

            await vi.waitFor(() =>
                expect(localStorage.getItem("guest_cart")).toBeNull()
            );
            mergeSpy.mockRestore();
        });
    });

    describe("cache invalidation", () => {
        it("invalidates the Cart tag after successful registration", async () => {
            let cartRequests = 0;

            server.use(
                http.post("http://localhost/api/auth/register", () =>
                    HttpResponse.json(authResponse)
                ),
                http.get("http://localhost/api/cart/me", () => {
                    cartRequests++;
                    return HttpResponse.json({ items: [] });
                })
            );

            const store = createStore();

            // Subscribe to Cart and wait for the first fetch to complete
            await store.dispatch(cartApi.endpoints.getCart.initiate()).unwrap().catch(() => { });
            expect(cartRequests).toBe(1);

            await store.dispatch(
                authApi.endpoints.register.initiate({
                    email: "john@example.com",
                    password: "secret123",
                })
            );

            await vi.waitFor(() => expect(cartRequests).toBeGreaterThan(1));
        });

        it("invalidates the Cart tag after successful login", async () => {
            let cartRequests = 0;

            server.use(
                http.post("http://localhost/api/auth/login", () =>
                    HttpResponse.json(authResponse)
                ),
                http.get("http://localhost/api/cart/me", () => {
                    cartRequests++;
                    return HttpResponse.json({ items: [] });
                })
            );

            const store = createStore([]);

            await store.dispatch(cartApi.endpoints.getCart.initiate()).unwrap().catch(() => { });
            expect(cartRequests).toBe(1);

            await store.dispatch(
                authApi.endpoints.login.initiate({
                    email: "john@example.com",
                    password: "secret123",
                })
            );

            await vi.waitFor(() => expect(cartRequests).toBeGreaterThan(1));
        });
    });
});