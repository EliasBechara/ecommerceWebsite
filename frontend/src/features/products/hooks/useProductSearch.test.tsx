/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useProductSearch } from "./useProductSearch";

let mockData: any = [];
let mockIsFetching = false;

const triggerMock = vi.fn();

vi.mock("../api/productsApi", () => ({
    useLazySearchProductQuery: () => [
        triggerMock,
        { data: mockData, isFetching: mockIsFetching },
    ],
}));

vi.mock("../../../hooks/useDebounce", () => ({
    useDebounce: (val: string) => val, // instant debounce
}));

describe("useProductSearch", () => {
    beforeEach(() => {
        triggerMock.mockClear();
        mockData = [];
        mockIsFetching = false;
    });

    it("updates query when handleChange is called", async () => {
        const { result } = renderHook(() => useProductSearch());

        act(() => {
            result.current.handleChange("gpu");
        });

        await waitFor(() => {
            expect(result.current.query).toBe("gpu");
        });
    });

    it("calls trigger when query length >= 2", async () => {
        const { result } = renderHook(() => useProductSearch());

        act(() => {
            result.current.handleChange("gpu");
        });

        await waitFor(() => {
            expect(triggerMock).toHaveBeenCalledWith("gpu");
        });
    });

    it("does not call trigger when query length < 2", async () => {
        const { result } = renderHook(() => useProductSearch());

        act(() => {
            result.current.handleChange("g");
        });

        await waitFor(() => {
            expect(triggerMock).not.toHaveBeenCalled();
        });
    });

    it("normalizes single product response into array", async () => {
        mockData = { slug: "1", name: "GPU" };

        const { result } = renderHook(() => useProductSearch());

        await waitFor(() => {
            expect(result.current.results).toEqual([
                { slug: "1", name: "GPU" },
            ]);
        });
    });

    it("keeps array response as array", async () => {
        mockData = [{ slug: "1" }, { slug: "2" }];

        const { result } = renderHook(() => useProductSearch());

        await waitFor(() => {
            expect(result.current.results).toEqual([
                { slug: "1" },
                { slug: "2" },
            ]);
        });
    });

    it("sets showResults correctly", async () => {
        const { result } = renderHook(() => useProductSearch());

        act(() => {
            result.current.handleChange("g");
        });

        await waitFor(() => {
            expect(result.current.showResults).toBe(false);
        });

        act(() => {
            result.current.handleChange("gpu");
        });

        await waitFor(() => {
            expect(result.current.showResults).toBe(true);
        });
    });
});