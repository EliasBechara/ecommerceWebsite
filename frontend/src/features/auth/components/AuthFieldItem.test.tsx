import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { AuthFieldItem } from "./AuthFieldItem";

function renderAuthFieldItem(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any,
  defaultValues = {},
  isLoading = false,
) {
  const Wrapper = () => {
    const form = useForm({ defaultValues });
    return (
      <AuthFieldItem
        field={field}
        form={form}
        isLoading={isLoading}
        uid="test-uid"
      />
    );
  };
  return render(<Wrapper />);
}

function renderAuthFieldItemWithError(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any,
  isLoading = false,
) {
  const Wrapper = () => {
    const form = useForm({ defaultValues: { [field.name]: "" } });

    form.setError(field.name, {
      type: "required",
      message: "This field is required",
    });

    return (
      <AuthFieldItem
        field={field}
        form={form}
        isLoading={isLoading}
        uid="test-uid"
      />
    );
  };

  return render(<Wrapper />);
}

const emailField = {
  name: "email",
  label: "Email Address",
  placeholder: "you@example.com",
  type: "email",
};

const passwordField = {
  name: "password",
  label: "Password",
  type: "password",
};

describe("AuthFieldItem – label / id wiring", () => {
  it("label htmlFor matches the input id (uid + field.name)", () => {
    renderAuthFieldItem(emailField);

    const input = screen.getByLabelText(/email address/i);
    expect(input).toHaveAttribute("id", "test-uid-email");
  });

  it("generates the input id correctly from uid and field.name", () => {
    renderAuthFieldItem(emailField);

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("id", "test-uid-email");
  });
});

describe("AuthFieldItem – aria-describedby", () => {
  it("omits aria-describedby when there is no error", () => {
    renderAuthFieldItem(emailField);

    const input = screen.getByRole("textbox");
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  it("sets aria-describedby to the error element id when an error exists", async () => {
    renderAuthFieldItemWithError(emailField);

    const input = await screen.findByRole("textbox", {
      description: /required/i,
    });
    expect(input).toHaveAttribute("aria-describedby", "test-uid-email-error");
  });
});

describe("AuthFieldItem – input type", () => {
  it("defaults input type to 'text' when field.type is omitted", () => {
    const fieldWithoutType = { name: "username", label: "Username" };
    renderAuthFieldItem(fieldWithoutType);

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("type", "text");
  });
});

describe("AuthFieldItem – autoComplete", () => {
  it("passes autoComplete prop through when provided", () => {
    const field = { ...emailField, autoComplete: "email" };
    renderAuthFieldItem(field);

    expect(screen.getByRole("textbox")).toHaveAttribute(
      "autocomplete",
      "email",
    );
  });

  it("does not set autocomplete attribute when autoComplete is omitted", () => {
    renderAuthFieldItem(emailField);

    const input = screen.getByRole("textbox");
    expect(input.getAttribute("autocomplete")).toBeFalsy();
  });
});

describe("AuthFieldItem – styling", () => {
  it("applies normal border/ring classes when there is no error", () => {
    renderAuthFieldItem(emailField);

    const input = screen.getByRole("textbox");
    expect(input.className).toMatch(/border-zinc-700/);
    expect(input.className).toMatch(/focus:border-zinc-500/);
    expect(input.className).not.toMatch(/border-red-500/);
  });

  it("applies error border/ring classes when the field has a validation error", async () => {
    renderAuthFieldItemWithError(emailField);

    const input = await screen.findByRole("textbox", {
      description: /required/i,
    });
    expect(input.className).toMatch(/border-red-500/);
    expect(input.className).toMatch(/focus:border-red-400/);
    expect(input.className).not.toMatch(/border-zinc-700/);
  });
});

describe("AuthFieldItem – aria-invalid", () => {
  it("sets aria-invalid='false' when there is no error", () => {
    renderAuthFieldItem(emailField);

    expect(screen.getByRole("textbox")).toHaveAttribute(
      "aria-invalid",
      "false",
    );
  });

  it("sets aria-invalid='true' when the field has a validation error", async () => {
    renderAuthFieldItemWithError(emailField);

    const input = await screen.findByRole("textbox", {
      description: /required/i,
    });
    expect(input).toHaveAttribute("aria-invalid", "true");
  });
});

describe("AuthFieldItem – DebouncedError", () => {
  it("renders the DebouncedError container with the correct error id", async () => {
    renderAuthFieldItemWithError(emailField);

    const errorRegion = await screen.findByRole("alert");
    expect(errorRegion).toHaveAttribute("id", "test-uid-email-error");
  });
});

describe("AuthFieldItem – PasswordToggle disabled state", () => {
  it("passes disabled=true to PasswordToggle when isLoading is true", () => {
    renderAuthFieldItem(passwordField, {}, true);

    const toggleButton = screen.getByRole("button", { name: /show password/i });
    expect(toggleButton).toBeDisabled();
  });

  it("does not disable PasswordToggle when isLoading is false", () => {
    renderAuthFieldItem(passwordField, {}, false);

    const toggleButton = screen.getByRole("button", { name: /show password/i });
    expect(toggleButton).not.toBeDisabled();
  });
});
