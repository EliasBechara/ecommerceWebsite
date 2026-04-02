import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setUser } from "../authSlice";

// ─── Response Types ───────────────────────────────────────────────────────────
interface AuthResponse {
  id: string;
  email: string;
}

// ─── API Definition ───────────────────────────────────────────────────────────
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
  }),
  endpoints: (builder) => ({
    // ====================== REGISTER ======================
    register: builder.mutation<
      AuthResponse,
      {
        email: string;
        password: string;
      }
    >({
      query: (newUser) => ({
        url: "/register",
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
            }),
          );
        } catch (err) {
          console.error("Registration onQueryStarted error:", err);
        }
      },
    }),

    // ====================== LOGIN ======================
    login: builder.mutation<
      AuthResponse,
      {
        email: string;
        password: string;
      }
    >({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setUser({
              id: data.id,
              email: data.email,
            }),
          );
        } catch (err) {
          console.error("Login onQueryStarted error:", err);
        }
      },
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation } = authApi;
