import { render, screen } from "../../../test-utils";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegisterForm } from "./RegisterForm";

const mockNavigate = vi.fn();
const mockUnwrap = vi.fn();
const mockRegisterUser = vi.fn(() => ({ unwrap: mockUnwrap }));
const mockUseRegisterMutation = vi.fn(() => [
  mockRegisterUser,
  { isLoading: false },
]);

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
  useRegisterMutation: () => mockUseRegisterMutation(),
}));

vi.mock("../utils/handleApiError", () => ({
  handleApiError: vi.fn(),
}));

import { handleApiError } from "../utils/handleApiError";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fillForm = async (
  email: string,
  password: string,
  confirmPassword: string,
) => {
  await userEvent.type(screen.getByPlaceholderText("you@example.com"), email);
  const [passwordInput, confirmInput] =
    screen.getAllByPlaceholderText("••••••••");
  await userEvent.type(passwordInput, password);
  await userEvent.type(confirmInput, confirmPassword);
};

const clickSubmit = async () =>
  userEvent.click(screen.getByRole("button", { name: /create account/i }));

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRegisterMutation.mockReturnValue([
      mockRegisterUser,
      { isLoading: false },
    ]);
    mockUnwrap.mockResolvedValue({});
  });

  describe("Rendering", () => {
    it("renders the main elements", () => {
      render(<RegisterForm />);

      expect(screen.getByText("Create an account")).toBeInTheDocument();
      expect(screen.getByText("Get started for free")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /create account/i }),
      ).toBeInTheDocument();
      expect(screen.getByText("Already have an account?")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in/i }),
      ).toBeInTheDocument();
    });

    it("renders email, password and confirm password fields", () => {
      render(<RegisterForm />);

      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("you@example.com"),
      ).toBeInTheDocument();
      expect(screen.getByText("Password")).toBeInTheDocument();
      expect(screen.getByText("Confirm password")).toBeInTheDocument();
      expect(screen.getAllByPlaceholderText("••••••••")).toHaveLength(2);
    });

    it("initializes all inputs as empty", () => {
      render(<RegisterForm />);

      expect(screen.getByPlaceholderText("you@example.com")).toHaveValue("");
      screen.getAllByPlaceholderText("••••••••").forEach((input) => {
        expect(input).toHaveValue("");
      });
    });
  });

  describe("Validation", () => {
    it("shows error for empty email", async () => {
      render(<RegisterForm />);
      await clickSubmit();

      expect(
        await screen.findByText("Enter a valid email address"),
      ).toBeInTheDocument();
    });

    it("shows error for empty password", async () => {
      render(<RegisterForm />);
      await clickSubmit();

      expect(
        await screen.findByText("Password must be at least 8 characters"),
      ).toBeInTheDocument();
    });

    it("shows error for invalid email", async () => {
      render(<RegisterForm />);
      await userEvent.type(
        screen.getByPlaceholderText("you@example.com"),
        "not-an-email",
      );
      await clickSubmit();

      expect(
        await screen.findByText("Enter a valid email address"),
      ).toBeInTheDocument();
    });

    it("shows error for short password", async () => {
      render(<RegisterForm />);
      const [passwordInput] = screen.getAllByPlaceholderText("••••••••");
      await userEvent.type(passwordInput, "short");
      await clickSubmit();

      expect(
        await screen.findByText("Password must be at least 8 characters"),
      ).toBeInTheDocument();
    });

    it("shows error when passwords do not match", async () => {
      render(<RegisterForm />);
      await fillForm("user@example.com", "securepassword", "differentpassword");
      await clickSubmit();

      expect(
        await screen.findByText("Passwords do not match"),
      ).toBeInTheDocument();
    });

    it("shows error for password exceeding 40 characters", async () => {
      render(<RegisterForm />);
      const [passwordInput] = screen.getAllByPlaceholderText("••••••••");
      await userEvent.type(passwordInput, "a".repeat(41));
      await clickSubmit();

      expect(
        await screen.findByText("Password must be at most 40 characters"),
      ).toBeInTheDocument();
    });

    it("shows error when confirm password is empty", async () => {
      render(<RegisterForm />);
      await clickSubmit();

      expect(
        await screen.findByText("Please confirm your password"),
      ).toBeInTheDocument();
    });

    it("does not submit when form is invalid", async () => {
      render(<RegisterForm />);
      await clickSubmit();

      expect(mockRegisterUser).not.toHaveBeenCalled();
    });
  });

  describe("Submit Behavior", () => {
    it("calls registerUser with email and password (excluding confirmPassword)", async () => {
      render(<RegisterForm />);
      await fillForm("user@example.com", "securepassword", "securepassword");
      await clickSubmit();

      expect(mockRegisterUser).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "securepassword",
      });
    });

    it("calls unwrap on the mutation result", async () => {
      render(<RegisterForm />);
      await fillForm("user@example.com", "securepassword", "securepassword");
      await clickSubmit();

      expect(mockUnwrap).toHaveBeenCalled();
    });
  });

  describe("Success Flow", () => {
    it("navigates to /login after successful registration", async () => {
      render(<RegisterForm />);
      await fillForm("user@example.com", "securepassword", "securepassword");
      await clickSubmit();

      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    it("does not call handleApiError on success", async () => {
      render(<RegisterForm />);
      await fillForm("user@example.com", "securepassword", "securepassword");
      await clickSubmit();

      expect(handleApiError).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("calls handleApiError when registration fails", async () => {
      mockUnwrap.mockRejectedValue(new Error("Network error"));

      render(<RegisterForm />);
      await fillForm("user@example.com", "securepassword", "securepassword");
      await clickSubmit();

      expect(handleApiError).toHaveBeenCalled();
    });

    it("passes correct arguments to handleApiError", async () => {
      const error = new Error("Network error");
      mockUnwrap.mockRejectedValue(error);

      render(<RegisterForm />);
      await fillForm("user@example.com", "securepassword", "securepassword");
      await clickSubmit();

      expect(handleApiError).toHaveBeenCalledWith(
        error,
        expect.any(Function), // form.setError
        "Registration failed. Please try again.",
      );
    });

    it("does not navigate on error", async () => {
      mockUnwrap.mockRejectedValue(new Error("fail"));

      render(<RegisterForm />);
      await fillForm("user@example.com", "securepassword", "securepassword");
      await clickSubmit();

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("Loading State", () => {
    it("disables submit button when loading", () => {
      mockUseRegisterMutation.mockReturnValue([
        mockRegisterUser,
        { isLoading: true },
      ]);

      render(<RegisterForm />);

      expect(
        screen.getByRole("button", { name: /processing/i }),
      ).toBeDisabled();
    });

    it("keeps submit button enabled when idle", () => {
      render(<RegisterForm />);

      expect(
        screen.getByRole("button", { name: /create account/i }),
      ).not.toBeDisabled();
    });
  });

  describe("Footer Navigation", () => {
    it("navigates to /login when Sign in button is clicked", async () => {
      render(<RegisterForm />);
      const signInButton = screen.getByRole("button", { name: /sign in/i });

      await userEvent.click(signInButton);

      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });
});
