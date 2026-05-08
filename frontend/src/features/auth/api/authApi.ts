import { createApi } from "@reduxjs/toolkit/query/react";
import { setHydrated, setUser } from "../authSlice";
import { baseQuery } from "./baseQuery";
import type { RootState } from "../../../app/store";
import { cartApi } from "../../cart/api/cartApi";

// ─── Response Types ─────────────────────────────────────────────
interface AuthResponse {
  id: string;
  email: string;
}

// ─── API Definition ─────────────────────────────────────────────
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  endpoints: (builder) => ({
    // ====================== REGISTER ======================
    register: builder.mutation<
      AuthResponse,
      { email: string; password: string }
    >({
      query: (newUser) => ({
        url: "/auth/register",
        method: "POST",
        body: newUser,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(
            setUser({
              id: data.id,
              email: data.email,
            })
          );

          dispatch(cartApi.util.invalidateTags(["Cart"]));
        } catch (err) {
          console.error("Registration onQueryStarted error:", err);
        }
      },
    }),

    // ====================== LOGIN ======================
    login: builder.mutation<
      AuthResponse,
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, getState, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(
            setUser({
              id: data.id,
              email: data.email,
            })
          );

          const state = getState() as RootState;
          const cart = state.cart.list;

          if (cart.length > 0) {
            await dispatch(
              cartApi.endpoints.mergeCart.initiate(cart)
            ).unwrap();

            localStorage.removeItem("guest_cart");
          }

          dispatch(cartApi.util.invalidateTags(["Cart"]));
        } catch (err) {
          console.error("Login flow error:", err);
        }
      },
    }),
    // ====================== GET ME ======================
    getMe: builder.query<AuthResponse, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(setUser({
            id: data.id,
            email: data.email,
          }));
        } catch {
          // 
        } finally {
          dispatch(setHydrated());
        }
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetMeQuery,
} = authApi;