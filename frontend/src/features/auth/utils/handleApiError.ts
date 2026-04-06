type SetErrorFn = (name: "root", error: { message: string }) => void;

type NormalizedError = {
  data: {
    message: string;
  };
};

export const handleApiError = (
  err: unknown,
  setError: SetErrorFn,
  fallbackMessage: string,
) => {
  const message =
    typeof err === "object" &&
    err !== null &&
    "data" in err &&
    typeof (err as NormalizedError).data?.message === "string"
      ? (err as NormalizedError).data.message
      : fallbackMessage;

  setError("root", { message });
};
