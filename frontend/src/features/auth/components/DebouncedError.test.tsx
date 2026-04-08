/* eslint-disable react-hooks/immutability */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { DebouncedError } from "./DebouncedError";

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock("../hooks/useDebounce", () => ({
  useDebounce: vi.fn((value: unknown) => value),
}));

import { useDebounce } from "../hooks/useDebounce";
const mockUseDebounce = vi.mocked(useDebounce);

// ─── Helpers ─────────────────────────────────────────────────────────────────

type EmailFormValues = { email: string };

function renderEmailForm(defaultEmail = "") {
  const api = {
    triggerValidation: (() => Promise.resolve(false)) as () => Promise<boolean>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setValue: (_val: string) => {},
  };

  function Wrapper() {
    const form = useForm<EmailFormValues>({
      defaultValues: { email: defaultEmail },
      mode: "onChange",
    });

    const triggerRef = useRef(() => form.trigger("email"));
    const setValueRef = useRef((val: string) =>
      form.setValue("email", val, { shouldValidate: true }),
    );

    api.triggerValidation = () => triggerRef.current();
    api.setValue = (val) => setValueRef.current(val);

    return (
      <>
        <input
          {...form.register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email address",
            },
          })}
          data-testid="email-input"
        />
        <DebouncedError form={form} name="email" errorId="email-error" />
      </>
    );
  }

  render(<Wrapper />);
  return api;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("DebouncedError", () => {
  beforeEach(() => {
    mockUseDebounce.mockImplementation((value) => value);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ── Visibility ──────────────────────────────────────────────────────────────

  describe("visibility", () => {
    it("renders nothing when there is no error", () => {
      renderEmailForm();
      expect(screen.queryByRole("alert")).toBeNull();
    });

    it("renders the error message when a validation error exists and value is settled", async () => {
      const { triggerValidation } = renderEmailForm("bad-email");

      await act(async () => {
        await triggerValidation();
      });

      const alert = screen.getByRole("alert");
      expect(alert).toBeTruthy();
      expect(alert.textContent).toBe("Invalid email address");
    });

    it("hides the error while the value is still debouncing (value !== debouncedValue)", async () => {
      mockUseDebounce.mockImplementation(() => "");

      const { triggerValidation } = renderEmailForm("bad-email");

      await act(async () => {
        await triggerValidation();
      });

      expect(screen.queryByRole("alert")).toBeNull();
    });

    it("shows the error once the debounced value catches up", async () => {
      mockUseDebounce
        .mockImplementationOnce(() => "")
        .mockImplementation((value) => value);

      const { setValue } = renderEmailForm();

      await act(async () => {
        setValue("bad-email");
      });

      const alert = await screen.findByRole("alert");
      expect(alert).toBeTruthy();
    });

    it("renders nothing after the field is corrected to a valid value", async () => {
      const { setValue } = renderEmailForm("bad-email");

      await act(async () => {
        setValue("bad-email");
      });

      await act(async () => {
        setValue("valid@example.com");
      });

      expect(screen.queryByRole("alert")).toBeNull();
    });
  });

  // ── Accessibility ───────────────────────────────────────────────────────────

  describe("accessibility", () => {
    it("applies role='alert' to the error span", async () => {
      const { triggerValidation } = renderEmailForm("bad-email");

      await act(async () => {
        await triggerValidation();
      });

      expect(screen.getByRole("alert").getAttribute("role")).toBe("alert");
    });

    it("sets the errorId as the id attribute on the error span", async () => {
      const { triggerValidation } = renderEmailForm("bad-email");

      await act(async () => {
        await triggerValidation();
      });

      expect(screen.getByRole("alert").getAttribute("id")).toBe("email-error");
    });
  });

  // ── Error messages ──────────────────────────────────────────────────────────

  describe("error messages", () => {
    it("displays 'Email is required' when the field is empty", async () => {
      const { triggerValidation } = renderEmailForm("");

      await act(async () => {
        await triggerValidation();
      });

      expect(screen.getByRole("alert").textContent).toBe("Email is required");
    });

    it("displays 'Invalid email address' for a malformed email", async () => {
      const { triggerValidation } = renderEmailForm("not-an-email");

      await act(async () => {
        await triggerValidation();
      });

      expect(screen.getByRole("alert").textContent).toBe(
        "Invalid email address",
      );
    });
  });

  // ── Debounce integration ────────────────────────────────────────────────────

  describe("debounce integration", () => {
    it("calls useDebounce with the current field value and 600 ms delay", async () => {
      const { setValue } = renderEmailForm();

      await act(async () => {
        setValue("typing@");
      });

      expect(mockUseDebounce).toHaveBeenCalledWith("typing@", 600);
    });

    it("suppresses the error span while value !== debouncedValue", async () => {
      mockUseDebounce.mockImplementation(() => "old-value");

      const { triggerValidation } = renderEmailForm("new-bad-value");

      await act(async () => {
        await triggerValidation();
      });

      expect(screen.queryByRole("alert")).toBeNull();
    });
  });
});
