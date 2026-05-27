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
    details?: Record<string, string[]>;
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
    let details: Record<string, string[]> | undefined = undefined;

    // Check if the error data matches our backend structured error format
    if (err.data && typeof err.data === "object") {
      const errorData = err.data as Record<string, unknown>;

      // Extract message if it exists
      if (typeof errorData.message === "string") {
        message = errorData.message;
      }

      // Extract validation details if they exist
      if (errorData.details && typeof errorData.details === "object") {
        details = errorData.details as Record<string, string[]>;
      }
    }

    if (err.status === "FETCH_ERROR") {
      message = "Network error. Please check your connection.";
    }

    return {
      error: {
        status: err.status,
        data: {
          message,
          ...(details && { details })
        },
      },
    };
  }

  return result;
};