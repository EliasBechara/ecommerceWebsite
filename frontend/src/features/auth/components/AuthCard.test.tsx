import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AuthCard from "./AuthCard";
import { useEffect } from "react";

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock("../../../components/icons/Spinner", () => ({
  Spinner: () => <svg data-testid="spinner" />,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────
type FormValues = { email: string; password: string };

const DEFAULT_FIELDS = [
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "you@example.com",
  },
  { name: "password", label: "Password", type: "password" },
];

function Wrapper({
  fields = DEFAULT_FIELDS,
  title = "Sign in",
  subtitle,
  submitLabel,
  footerText,
  footerActionLabel,
  onSubmit = vi.fn(),
  onFooterAction,
  isLoading = false,
  rootError,
}: {
  fields?: typeof DEFAULT_FIELDS;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  footerText?: string;
  footerActionLabel?: string;
  onSubmit?: (values: FormValues) => void;
  onFooterAction?: () => void;
  isLoading?: boolean;
  rootError?: string;
}) {
  const form = useForm<FormValues>({
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (rootError) {
      form.setError("root", { type: "manual", message: rootError });
    } else {
      form.clearErrors("root");
    }
  }, [rootError, form]);

  return (
    <AuthCard
      title={title}
      subtitle={subtitle}
      fields={fields}
      submitLabel={submitLabel}
      footerText={footerText}
      footerActionLabel={footerActionLabel}
      form={form}
      onSubmit={onSubmit}
      onFooterAction={onFooterAction}
      isLoading={isLoading}
    />
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("AuthCard", () => {
  describe("Rendering / Structure", () => {
    it("renders the title", () => {
      render(<Wrapper title="Welcome back" />);
      expect(
        screen.getByRole("heading", { name: "Welcome back" }),
      ).toBeInTheDocument();
    });

    it("renders subtitle when provided", () => {
      render(<Wrapper subtitle="Please log in to continue" />);
      expect(screen.getByText("Please log in to continue")).toBeInTheDocument();
    });

    it("does not render subtitle when omitted", () => {
      render(<Wrapper />);
      expect(screen.queryByText(/please log in/i)).not.toBeInTheDocument();
    });

    it("renders an input for each field", () => {
      render(<Wrapper fields={DEFAULT_FIELDS} />);
      DEFAULT_FIELDS.forEach((field) => {
        expect(screen.getByLabelText(field.label)).toBeInTheDocument();
      });
    });

    it("renders submit button with correct label", () => {
      render(<Wrapper submitLabel="Log in" />);
      expect(
        screen.getByRole("button", { name: "Log in" }),
      ).toBeInTheDocument();
    });

    it("renders footer when footer props are given", () => {
      render(<Wrapper footerText="New here?" footerActionLabel="Sign up" />);
      expect(screen.getByText(/new here/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Sign up" }),
      ).toBeInTheDocument();
    });

    it("does not render footer when props are missing", () => {
      render(<Wrapper submitLabel="Submit" />);

      expect(screen.getAllByRole("button")).toHaveLength(2);
      expect(
        screen.getByRole("button", { name: "Submit" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /sign up|register|log in/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    it("calls onSubmit with form values", async () => {
      const onSubmit = vi.fn();
      render(<Wrapper onSubmit={onSubmit} submitLabel="Submit" />);

      fireEvent.click(screen.getByRole("button", { name: "Submit" }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ email: "", password: "" }),
          expect.anything(),
        );
      });
    });

    it("does not call onSubmit if validation fails", async () => {
      const onSubmit = vi.fn();

      function StrictWrapper() {
        const form = useForm<{ email: string }>({
          defaultValues: { email: "" },
        });

        return (
          <AuthCard
            fields={[{ name: "email", label: "Email", type: "email" }]}
            form={form}
            onSubmit={onSubmit}
            submitLabel="Submit"
          />
        );
      }

      render(<StrictWrapper />);

      fireEvent.click(screen.getByRole("button", { name: "Submit" }));

      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe("Loading State", () => {
    it("disables submit button and shows spinner when loading", () => {
      render(<Wrapper isLoading submitLabel="Log in" />);

      expect(
        screen.getByRole("button", { name: /processing/i }),
      ).toBeDisabled();
      expect(screen.getByTestId("spinner")).toBeInTheDocument();
      expect(screen.queryByText("Log in")).not.toBeInTheDocument();
    });

    it("hides spinner when not loading", () => {
      render(<Wrapper isLoading={false} />);
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    });
  });

  describe("Footer Action", () => {
    it("calls onFooterAction when footer button is clicked", () => {
      const onFooterAction = vi.fn();

      render(
        <Wrapper
          footerText="Already have an account?"
          footerActionLabel="Sign in"
          onFooterAction={onFooterAction}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
      expect(onFooterAction).toHaveBeenCalledTimes(1);
    });

    it("renders footer button even if only action label is provided", () => {
      render(<Wrapper footerActionLabel="Sign up" />);
      expect(
        screen.getByRole("button", { name: "Sign up" }),
      ).toBeInTheDocument();
    });
  });

  describe("Prop Forwarding", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("allows typing into fields", async () => {
      render(<Wrapper fields={DEFAULT_FIELDS} />);
      const emailInput = screen.getByLabelText("Email");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      expect(emailInput).toHaveValue("test@example.com");
    });

    it("disables all inputs when isLoading = true", () => {
      render(<Wrapper fields={DEFAULT_FIELDS} isLoading />);

      screen.getAllByRole("textbox").forEach((input) => {
        expect(input).toBeDisabled();
      });
    });

    it("forwards placeholder and type correctly", () => {
      render(<Wrapper fields={DEFAULT_FIELDS} />);

      expect(
        screen.getByPlaceholderText("you@example.com"),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toHaveAttribute(
        "type",
        "password",
      );
      expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    });

    it("generates consistent ids for fields", () => {
      render(<Wrapper fields={DEFAULT_FIELDS} />);

      DEFAULT_FIELDS.forEach((field) => {
        const input = screen.getByLabelText(field.label);
        expect(input.id).toBeTruthy();
        expect(input.id).toContain(field.name);
      });
    });
  });
});
