import { isApiError, getApiErrorMessage } from "./apiError";
import { describe, it, expect } from "vitest";

describe("isApiError", () => {
    it("returns true for a valid ApiError object", () => {
        const err = { status: 404, data: { message: "Not found" } };
        expect(isApiError(err)).toBe(true);
    });

    it("returns true when status is 0", () => {
        const err = { status: 0, data: { message: "Bad" } };
        expect(isApiError(err)).toBe(true);
    });

    it("returns false when status is a string", () => {
        const err = { status: "404", data: { message: "Not found" } };
        expect(isApiError(err)).toBe(false);
    });

    it("returns false when status is missing", () => {
        const err = { data: { message: "No status" } };
        expect(isApiError(err)).toBe(false);
    });

    it("returns false for null", () => {
        expect(isApiError(null)).toBe(false);
    });

    it("returns false for a plain string", () => {
        expect(isApiError("error")).toBe(false);
    });

    it("returns false for a number", () => {
        expect(isApiError(42)).toBe(false);
    });

    it("returns false for undefined", () => {
        expect(isApiError(undefined)).toBe(false);
    });

    it("returns false for an empty object", () => {
        expect(isApiError({})).toBe(false);
    });

    it("returns true even if data is missing (only status is checked)", () => {
        const err = { status: 500 };
        expect(isApiError(err)).toBe(true);
    });
});

describe("getApiErrorMessage", () => {
    it("returns the message from a valid ApiError", () => {
        const err = { status: 400, data: { message: "Bad request" } };
        expect(getApiErrorMessage(err)).toBe("Bad request");
    });

    it("returns the fallback for a non-ApiError value", () => {
        expect(getApiErrorMessage("some string")).toBe("Something went wrong.");
    });

    it("returns a custom fallback when provided", () => {
        expect(getApiErrorMessage(null, "Custom fallback")).toBe("Custom fallback");
    });

    it("returns the fallback for an empty object", () => {
        expect(getApiErrorMessage({})).toBe("Something went wrong.");
    });

    it("returns the fallback for undefined", () => {
        expect(getApiErrorMessage(undefined)).toBe("Something went wrong.");
    });

    it("returns the message and ignores the fallback when error is valid", () => {
        const err = { status: 422, data: { message: "Validation failed" } };
        expect(getApiErrorMessage(err, "Ignored fallback")).toBe("Validation failed");
    });

    it("handles ApiError with details field present", () => {
        const err = {
            status: 422,
            data: {
                message: "Unprocessable entity",
                details: { field: ["is required"] },
            },
        };
        expect(getApiErrorMessage(err)).toBe("Unprocessable entity");
    });

    it("returns the fallback when status is a string (invalid ApiError)", () => {
        const err = { status: "500", data: { message: "Server error" } };
        expect(getApiErrorMessage(err)).toBe("Something went wrong.");
    });
});