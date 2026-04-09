import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebounce } from "./useDebounce";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe("useDebounce", () => {
  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 500));

    expect(result.current).toBe("hello");
  });

  it("updates the value after the delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 500 },
      },
    );

    rerender({ value: "updated", delay: 500 });

    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe("updated");
  });

  it("does not update before the delay finishes", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "first", delay: 300 },
      },
    );

    rerender({ value: "second", delay: 300 });

    act(() => {
      vi.advanceTimersByTime(299);
    });

    expect(result.current).toBe("first");
  });

  it("resets the timer when the value changes again before completion", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "first", delay: 500 },
      },
    );

    rerender({ value: "second", delay: 500 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    rerender({ value: "third", delay: 500 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("first");

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe("third");
  });

  it("uses the latest delay when delay changes", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "a", delay: 200 },
      },
    );

    rerender({ value: "b", delay: 800 });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(result.current).toBe("b");
  });

  it("cleans up pending timers on unmount", () => {
    const { rerender, unmount } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "before", delay: 500 },
      },
    );

    rerender({ value: "after", delay: 500 });

    unmount();

    expect(() => {
      act(() => {
        vi.advanceTimersByTime(500);
      });
    }).not.toThrow();
  });

  it("supports non-string values", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: { count: 1 }, delay: 300 },
      },
    );

    rerender({ value: { count: 2 }, delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toEqual({ count: 2 });
  });

  it("handles zero delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "old", delay: 0 },
      },
    );

    rerender({ value: "new", delay: 0 });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current).toBe("new");
  });
});
