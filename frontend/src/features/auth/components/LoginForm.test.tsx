import { render, screen } from "../../../test-utils";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginForm } from "./LoginForm";

const mockNavigate = vi.fn();
const mockUnwrap = vi.fn();
const mockLoginUser = vi.fn(() => ({ unwrap: mockUnwrap }));
const mockUseLoginMutation = vi.fn(() => [mockLoginUser, { isLoading: false }]);

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../api/authApi", () => ({
  authApi: {
    reducerPath: "authApi",
    reducer: (state = {}) => state,
    middleware: () => (next: unknown) => (action: unknown) => next(action),
  },
  useLoginMutation: () => mockUseLoginMutation(),
}));

vi.mock("../utils/handleApiError", () => ({
  handleApiError: vi.fn(),
}));

import { handleApiError } from "../utils/handleApiError";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fillForm = async (email: string, password: string) => {
  await userEvent.type(screen.getByPlaceholderText("you@example.com"), email);
  await userEvent.type(screen.getByPlaceholderText("••••••••"), password);
};

const clickSubmit = () =>
  userEvent.click(screen.getByRole("button", { name: /sign in/i }));

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLoginMutation.mockReturnValue([mockLoginUser, { isLoading: false }]);
    mockUnwrap.mockResolvedValue({});
  });

  describe("Rendering", () => {
    it("renders the main elements", () => {
      render(<LoginForm />);

      expect(screen.getByText("Welcome back")).toBeInTheDocument();
      expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in/i }),
      ).toBeInTheDocument();
      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /register/i }),
      ).toBeInTheDocument();
    });

    it("renders email and password fields", () => {
      render(<LoginForm />);

      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("you@example.com"),
      ).toBeInTheDocument();
      expect(screen.getByText("Password")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    });

    it("initializes inputs as empty", () => {
      render(<LoginForm />);

      expect(screen.getByPlaceholderText("you@example.com")).toHaveValue("");
      expect(screen.getByPlaceholderText("••••••••")).toHaveValue("");
    });
  });

  describe("Validation", () => {
    it("shows error for empty email", async () => {
      render(<LoginForm />);
      await clickSubmit();

      expect(
        await screen.findByText("Enter a valid email address"),
      ).toBeInTheDocument();
    });

    it("shows error for empty password", async () => {
      render(<LoginForm />);
      await clickSubmit();

      expect(
        await screen.findByText("Password must be at least 8 characters"),
      ).toBeInTheDocument();
    });

    it("shows error for invalid email format", async () => {
      render(<LoginForm />);
      await fillForm("not-valid", "validpassword");
      await clickSubmit();

      expect(
        await screen.findByText("Enter a valid email address"),
      ).toBeInTheDocument();
    });

    it("shows error for short password", async () => {
      render(<LoginForm />);
      await fillForm("user@example.com", "short");
      await clickSubmit();

      expect(
        await screen.findByText("Password must be at least 8 characters"),
      ).toBeInTheDocument();
    });

    it("does not call login when form is invalid", async () => {
      render(<LoginForm />);
      await clickSubmit();

      expect(mockLoginUser).not.toHaveBeenCalled();
    });

    it("does not show validation errors before submit", async () => {
      render(<LoginForm />);
      await userEvent.type(
        screen.getByPlaceholderText("you@example.com"),
        "bad",
      );

      expect(
        screen.queryByText("Enter a valid email address"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Submit Behavior", () => {
    it("calls loginUser with correct values", async () => {
      render(<LoginForm />);
      await fillForm("user@example.com", "securepassword");
      await clickSubmit();

      expect(mockLoginUser).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "securepassword",
      });
    });

    it("calls unwrap on the mutation result", async () => {
      render(<LoginForm />);
      await fillForm("user@example.com", "securepassword");
      await clickSubmit();

      expect(mockUnwrap).toHaveBeenCalled();
    });
  });

  describe("Success Flow", () => {
    it("does not call handleApiError on successful login", async () => {
      render(<LoginForm />);
      await fillForm("user@example.com", "securepassword");
      await clickSubmit();

      expect(handleApiError).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("calls handleApiError when login fails", async () => {
      mockUnwrap.mockRejectedValue(new Error("Unauthorized"));

      render(<LoginForm />);
      await fillForm("user@example.com", "securepassword");
      await clickSubmit();

      expect(handleApiError).toHaveBeenCalled();
    });

    it("passes correct arguments to handleApiError", async () => {
      const error = new Error("Unauthorized");
      mockUnwrap.mockRejectedValue(error);

      render(<LoginForm />);
      await fillForm("user@example.com", "securepassword");
      await clickSubmit();

      expect(handleApiError).toHaveBeenCalledWith(
        error,
        expect.any(Function), // form.setError
        "Login failed. Please check your credentials.",
      );
    });

    it("does not navigate on error", async () => {
      mockUnwrap.mockRejectedValue(new Error("Unauthorized"));

      render(<LoginForm />);
      await fillForm("user@example.com", "securepassword");
      await clickSubmit();

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("Loading State", () => {
    it("disables submit button when mutation is loading", () => {
      mockUseLoginMutation.mockReturnValue([
        mockLoginUser,
        { isLoading: true },
      ]);

      render(<LoginForm />);

      expect(
        screen.getByRole("button", { name: /processing/i }),
      ).toBeDisabled();
    });

    it("keeps submit button enabled when idle", () => {
      render(<LoginForm />);

      expect(
        screen.getByRole("button", { name: /sign in/i }),
      ).not.toBeDisabled();
    });
  });

  describe("Footer Navigation", () => {
    it("navigates to /register when register button is clicked", async () => {
      render(<LoginForm />);
      await userEvent.click(screen.getByRole("button", { name: /register/i }));

      expect(mockNavigate).toHaveBeenCalledWith("/register");
    });
  });
});
