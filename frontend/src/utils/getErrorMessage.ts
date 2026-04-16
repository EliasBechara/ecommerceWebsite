export const getErrorMessage = (error: any): string => {
  if (!error) return "Something went wrong";

  if ("data" in error) {
    const data = error.data as { message?: string };
    return data?.message || "Something went wrong";
  }

  if ("error" in error) {
    return error.error;
  }

  return "Something went wrong";
};
