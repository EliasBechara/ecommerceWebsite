interface ApiError {
  status: number;
  data?: {
    message?: string;
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
