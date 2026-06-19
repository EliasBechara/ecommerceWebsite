import { describe, it, expect, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { http, HttpResponse } from "msw";

import { authApi } from "./authApi";
import authReducer from "../authSlice";
import { server } from "../../../tests/server";

/*
      This file covers authApi in isolation: request/response contracts,
    the auth-state side effects each endpoint triggers (user,
    isAuthenticated, isHydrated), and error normalization.

      Guest-cart merging on login, localStorage cleanup, and Cart tag
    invalidation are a separate cross-feature concern between auth and
    cart — see auth-cart-integration.test.ts for those.
*/


// ─── Store factory ────────────────────────────────────────────────

/*
      authApi's onQueryStarted reads `state.cart.list` to decide whether a
    guest cart needs merging on login. No test in this file exercises
    that path, so `cart` is a trivial always-empty stub — just enough to
    satisfy the state shape without pulling in the real cartApi.
*/

const createStore = () =>
    configureStore({
        reducer: {
            [authApi.reducerPath]: authApi.reducer,
            auth: authReducer,
            cart: (state = { list: [] }) => state,
        },
        middleware: (gDM) => gDM().concat(authApi.middleware),
    });

type TestStore = ReturnType<typeof createStore>;
type TestState = ReturnType<TestStore["getState"]>;

// ─── Shared fixtures ─────────────────────────────────────────────
const authResponse = { id: "1", email: "john@example.com" };

/*
    Wait for a condition to be true by polling redux state. We poll state
    rather than spying on dispatch because RTK Query middleware captures
    the original dispatch reference before a spy can wrap it.
*/

const waitForState = <T>(
    store: TestStore,
    selector: (state: TestState) => T,
    predicate: (value: T) => boolean,
    timeout = 1000
) =>
    vi.waitFor(() => {
        const value = selector(store.getState() as TestState);
        if (!predicate(value)) throw new Error("Condition not yet met");
        return value;
    }, { timeout });

// ─── Tests ───────────────────────────────────────────────────────
describe("authApi", () => {

    // ==================== REGISTER ====================

    describe("register", () => {
        it("sends the correct payload and returns the auth response", async () => {
            server.use(
                http.post("http://localhost/api/auth/register", async ({ request }) => {
                    const body = (await request.json()) as Record<string, string>;
                    expect(body).toEqual({ email: "john@example.com", password: "secret123" });
                    return HttpResponse.json(authResponse);
                })
            );

            const store = createStore();
            const result = await store.dispatch(
                authApi.endpoints.register.initiate({
                    email: "john@example.com",
                    password: "secret123",
                })
            );

            expect(result.data).toEqual(authResponse);
        });

        it("sets user in state after successful registration", async () => {
            server.use(
                http.post("http://localhost/api/auth/register", () =>
                    HttpResponse.json(authResponse)
                )
            );

            const store = createStore();
            await store.dispatch(
                authApi.endpoints.register.initiate({
                    email: "john@example.com",
                    password: "secret123",
                })
            );

            await waitForState(
                store,
                (s) => s.auth.user,
                (user) => user?.id === authResponse.id && user?.email === authResponse.email
            );
        });

        it("sets isAuthenticated after successful registration", async () => {
            server.use(
                http.post("http://localhost/api/auth/register", () =>
                    HttpResponse.json(authResponse)
                )
            );

            const store = createStore();
            await store.dispatch(
                authApi.endpoints.register.initiate({
                    email: "john@example.com",
                    password: "secret123",
                })
            );

            await waitForState(
                store,
                (s) => s.auth.isAuthenticated,
                (v) => v === true
            );
        });

        it("returns a normalized unauthorized error", async () => {
            server.use(
                http.post("http://localhost/api/auth/register", () =>
                    HttpResponse.json({ message: "Unauthorized" }, { status: 401 })
                )
            );

            const store = createStore();
            const result = await store.dispatch(
                authApi.endpoints.register.initiate({
                    email: "john@example.com",
                    password: "secret123",
                })
            );

            expect(result.error).toEqual({
                status: 401,
                data: { message: "Unauthorized" },
            });
        });

        it("returns validation errors on bad input", async () => {
            server.use(
                http.post("http://localhost/api/auth/register", () =>
                    HttpResponse.json(
                        {
                            message: "Validation failed",
                            details: {
                                email: ["Email is required"],
                                password: ["Password must be at least 8 characters"],
                            },
                        },
                        { status: 400 }
                    )
                )
            );

            const store = createStore();
            const result = await store.dispatch(
                authApi.endpoints.register.initiate({ email: "", password: "123" })
            );

            expect(result.error).toEqual({
                status: 400,
                data: {
                    message: "Validation failed",
                    details: {
                        email: ["Email is required"],
                        password: ["Password must be at least 8 characters"],
                    },
                },
            });
        });

        it("normalizes network errors", async () => {
            server.use(
                http.post("http://localhost/api/auth/register", () => HttpResponse.error())
            );

            const store = createStore();
            const result = await store.dispatch(
                authApi.endpoints.register.initiate({
                    email: "john@example.com",
                    password: "secret123",
                })
            );

            expect(result.error).toEqual({
                status: "FETCH_ERROR",
                data: { message: "Network error. Please check your connection." },
            });
        });

        it("does not set user in state when registration fails", async () => {
            server.use(
                http.post("http://localhost/api/auth/register", () =>
                    HttpResponse.json({ message: "Email already taken" }, { status: 409 })
                )
            );

            const store = createStore();
            await store.dispatch(
                authApi.endpoints.register.initiate({
                    email: "john@example.com",
                    password: "secret123",
                })
            );

            expect((store.getState() as TestState).auth.user).toBeNull();
        });
    });

    // ==================== LOGIN ====================

    describe("login", () => {
        it("sends the correct credentials and returns the auth response", async () => {
            server.use(
                http.post("http://localhost/api/auth/login", async ({ request }) => {
                    const body = (await request.json()) as Record<string, string>;
                    expect(body).toEqual({ email: "john@example.com", password: "secret123" });
                    return HttpResponse.json(authResponse);
                })
            );

            const store = createStore();
            const result = await store.dispatch(
                authApi.endpoints.login.initiate({
                    email: "john@example.com",
                    password: "secret123",
                })
            );

            expect(result.data).toEqual(authResponse);
        });

        it("sets user in state after successful login", async () => {
            server.use(
                http.post("http://localhost/api/auth/login", () =>
                    HttpResponse.json(authResponse)
                )
            );

            const store = createStore();
            await store.dispatch(
                authApi.endpoints.login.initiate({
                    email: "john@example.com",
                    password: "secret123",
                })
            );

            await waitForState(
                store,
                (s) => s.auth.user,
                (user) => user?.id === authResponse.id
            );
        });

        it("returns a normalized unauthorized error on wrong credentials", async () => {
            server.use(
                http.post("http://localhost/api/auth/login", () =>
                    HttpResponse.json({ message: "Invalid credentials" }, { status: 401 })
                )
            );

            const store = createStore();
            const result = await store.dispatch(
                authApi.endpoints.login.initiate({
                    email: "john@example.com",
                    password: "wrongpassword",
                })
            );

            expect(result.error).toEqual({
                status: 401,
                data: { message: "Invalid credentials" },
            });
        });

        it("normalizes network errors", async () => {
            server.use(
                http.post("http://localhost/api/auth/login", () => HttpResponse.error())
            );

            const store = createStore();
            const result = await store.dispatch(
                authApi.endpoints.login.initiate({
                    email: "john@example.com",
                    password: "secret123",
                })
            );

            expect(result.error).toEqual({
                status: "FETCH_ERROR",
                data: { message: "Network error. Please check your connection." },
            });
        });
    });

    // ==================== GET ME ====================

    describe("getMe", () => {
        it("fetches the authenticated user and returns the auth response", async () => {
            server.use(
                http.get("http://localhost/api/auth/me", () =>
                    HttpResponse.json(authResponse)
                )
            );

            const store = createStore();
            const result = await store.dispatch(authApi.endpoints.getMe.initiate());

            expect(result.data).toEqual(authResponse);
        });

        it("sets user in state on success", async () => {
            server.use(
                http.get("http://localhost/api/auth/me", () =>
                    HttpResponse.json(authResponse)
                )
            );

            const store = createStore();
            await store.dispatch(authApi.endpoints.getMe.initiate());

            await waitForState(
                store,
                (s) => s.auth.user,
                (user) => user?.id === authResponse.id
            );
        });

        it("sets isHydrated on success", async () => {
            server.use(
                http.get("http://localhost/api/auth/me", () =>
                    HttpResponse.json(authResponse)
                )
            );

            const store = createStore();
            await store.dispatch(authApi.endpoints.getMe.initiate());

            await waitForState(
                store,
                (s) => s.auth.isHydrated,
                (v) => v === true
            );
        });

        it("sets isHydrated even when the request fails with 401", async () => {
            server.use(
                http.get("http://localhost/api/auth/me", () =>
                    HttpResponse.json({ message: "Unauthorized" }, { status: 401 })
                )
            );

            const store = createStore();
            await store.dispatch(authApi.endpoints.getMe.initiate());

            await waitForState(
                store,
                (s) => s.auth.isHydrated,
                (v) => v === true
            );
        });

        it("does not set user in state when the request fails", async () => {
            server.use(
                http.get("http://localhost/api/auth/me", () =>
                    HttpResponse.json({ message: "Unauthorized" }, { status: 401 })
                )
            );

            const store = createStore();
            await store.dispatch(authApi.endpoints.getMe.initiate());

            expect((store.getState() as TestState).auth.user).toBeNull();
        });

        it("sets isHydrated even on a network error", async () => {
            server.use(
                http.get("http://localhost/api/auth/me", () => HttpResponse.error())
            );

            const store = createStore();
            await store.dispatch(authApi.endpoints.getMe.initiate());

            await waitForState(
                store,
                (s) => s.auth.isHydrated,
                (v) => v === true
            );
        });
    });
});