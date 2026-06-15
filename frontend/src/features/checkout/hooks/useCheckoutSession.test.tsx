import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCheckoutSession } from "./useCheckoutSession";

const navigateMock = vi.fn();

vi.mock("react-router-dom", () => ({
    useNavigate: () => navigateMock,
}));

const useGetSessionQueryMock = vi.fn();

vi.mock("../api/checkoutApi", () => ({
    useGetSessionQuery: (sessionId: string) =>
        useGetSessionQueryMock(sessionId),
}));

describe("useCheckoutSession", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const sessionId = "session-1";

    it("calls useGetSessionQuery with sessionId", () => {
        useGetSessionQueryMock.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: undefined,
        });

        renderHook(() => useCheckoutSession(sessionId));

        expect(useGetSessionQueryMock).toHaveBeenCalledWith(sessionId);
    });

    it("returns session, loading, and error", () => {
        useGetSessionQueryMock.mockReturnValue({
            data: { status: "ACTIVE" },
            isLoading: true,
            error: "error",
        });

        const { result } = renderHook(() =>
            useCheckoutSession(sessionId)
        );

        expect(result.current.session).toEqual({
            status: "ACTIVE",
        });

        expect(result.current.isLoading).toBe(true);
        expect(result.current.error).toBe("error");
    });

    it("navigates to /cart when session is EXPIRED", () => {
        useGetSessionQueryMock.mockReturnValue({
            data: { status: "EXPIRED" },
            isLoading: false,
            error: undefined,
        });

        renderHook(() => useCheckoutSession(sessionId));

        expect(navigateMock).toHaveBeenCalledWith("/cart");
    });

    it("does not navigate when session is not expired", () => {
        useGetSessionQueryMock.mockReturnValue({
            data: { status: "ACTIVE" },
            isLoading: false,
            error: undefined,
        });

        renderHook(() => useCheckoutSession(sessionId));

        expect(navigateMock).not.toHaveBeenCalled();
    });

    it("does not navigate when session is undefined", () => {
        useGetSessionQueryMock.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: undefined,
        });

        renderHook(() => useCheckoutSession(sessionId));

        expect(navigateMock).not.toHaveBeenCalled();
    });
});