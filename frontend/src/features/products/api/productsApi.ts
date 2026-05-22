import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Product } from "../productTypes";

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:5000/api" }),
  endpoints: (builder) => ({
    getProductsByCategory: builder.query<Product[], { category: string; sort: string }>({
      query: ({ category, sort }) => `/products/category/${category}?sort=${sort}`,
    }),

    getProductBySlug: builder.query<Product, string>({
      query: (slug) => `/products/${slug}`,
    }),

    searchProduct: builder.query<Product[], string>({
      query: (arg) => ({
        url: '/products/search',
        params: { q: arg }
      }),
    }),
  }),
});

export const { useGetProductsByCategoryQuery, useGetProductBySlugQuery, useLazySearchProductQuery } =
  productsApi;
