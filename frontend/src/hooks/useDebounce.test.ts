import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("returns initial value immediately", () => {
        const { result } = renderHook(() => useDebounce("gpu", 300));

        expect(result.current).toBe("gpu");
    });

    it("updates value after delay", () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 300),
            {
                initialProps: { value: "g" },
            }
        );

        rerender({ value: "gpu" });

        // still old value before delay
        expect(result.current).toBe("g");

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current).toBe("gpu");
    });

    it("resets timer if value changes quickly", () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 300),
            {
                initialProps: { value: "g" },
            }
        );

        rerender({ value: "gp" });

        act(() => {
            vi.advanceTimersByTime(200);
        });

        // second change before timer completes
        rerender({ value: "gpu" });

        act(() => {
            vi.advanceTimersByTime(200);
        });

        expect(result.current).toBe("g");

        act(() => {
            vi.advanceTimersByTime(100);
        });

        expect(result.current).toBe("gpu");
    });
});