export interface ApiError {
  status: number | string;
  data: {
    message: string;
    details?: Record<string, string[]>;
  };
}

export function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof (err as ApiError).status === "number"
  );
}

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong."
): string => {
  if (isApiError(error)) {
    return error.data.message;
  }

  return fallback;
};
