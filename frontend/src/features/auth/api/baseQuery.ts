import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

type NormalizedError = {
  status: number | string;
  data: {
    message: string;
  };
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/api",
  credentials: "include",
});

export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  NormalizedError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    const err = result.error as FetchBaseQueryError;

    let message = "Oops... Something went wrong, try again later.";

    if (
      err.data &&
      typeof err.data === "object" &&
      "message" in err.data &&
      typeof (err.data as { message?: unknown }).message === "string"
    ) {
      message = (err.data as { message: string }).message;
    }

    if (err.status === "FETCH_ERROR") {
      message = "Network error. Please check your connection.";
    }

    return {
      error: {
        status: err.status,
        data: { message },
      },
    };
  }

  return result;
};
