import { describe, it, expect, vi } from "vitest";
import { handleApiError } from "./handleApiError";

describe("handleApiError", () => {
    it("calls setError with the message from a normalized error", () => {
        const setError = vi.fn();
        handleApiError({ data: { message: "Email taken" } }, setError, "Fallback");
        expect(setError).toHaveBeenCalledWith("root", { message: "Email taken" });
    });

    it("calls setError with the fallback when error is not a normalized error", () => {
        const setError = vi.fn();
        handleApiError(new Error("raw"), setError, "Something went wrong.");
        expect(setError).toHaveBeenCalledWith("root", { message: "Something went wrong." });
    });

    it("calls setError with the fallback when error is null", () => {
        const setError = vi.fn();
        handleApiError(null, setError, "Something went wrong.");
        expect(setError).toHaveBeenCalledWith("root", { message: "Something went wrong." });
    });
});