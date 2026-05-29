import { render, screen, fireEvent } from "@testing-library/react";
import { PasswordToggle } from "./PasswordToggle";
import { afterEach, describe, it, expect } from "vitest";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function addInput(id: string, type = "password"): HTMLInputElement {
  const input = document.createElement("input");
  input.id = id;
  input.type = type;
  document.body.appendChild(input);
  return input;
}

afterEach(() => {
  document.body.innerHTML = "";
});

// ─── Core Render ───────────────────────────────────────────────────────────────────

describe("Core Render", () => {
  it("renders a button", () => {
    render(<PasswordToggle fieldId="pw" disabled={false} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it('button has initial accessible label "Show password"', () => {
    render(<PasswordToggle fieldId="pw" disabled={false} />);
    expect(
      screen.getByRole("button", { name: "Show password" }),
    ).toBeInTheDocument();
  });

  it("initial icon shown is EyeIcon (visible = false state)", () => {
    render(<PasswordToggle fieldId="pw" disabled={false} />);
    // EyeIcon renders when visible=false; EyeOffIcon renders when visible=true.
    expect(
      document.querySelector("[data-testid='eye-icon']"),
    ).toBeInTheDocument();
    expect(
      document.querySelector("[data-testid='eye-off-icon']"),
    ).not.toBeInTheDocument();
  });
});

// ─── Toggle Behavior ───────────────────────────────────────────────────────────────────

describe("Toggle Behavior", () => {
  it("clicking button changes target input type from password → text", () => {
    const input = addInput("pw", "password");
    render(<PasswordToggle fieldId="pw" disabled={false} />);

    fireEvent.click(screen.getByRole("button"));

    expect(input.type).toBe("text");
  });

  it('after first click, accessible label changes to "Hide password"', () => {
    addInput("pw");
    render(<PasswordToggle fieldId="pw" disabled={false} />);

    fireEvent.click(screen.getByRole("button"));

    expect(
      screen.getByRole("button", { name: "Hide password" }),
    ).toBeInTheDocument();
  });

  it("after first click, displayed icon switches to EyeOffIcon", () => {
    addInput("pw");
    render(<PasswordToggle fieldId="pw" disabled={false} />);

    fireEvent.click(screen.getByRole("button"));

    expect(
      document.querySelector("[data-testid='eye-off-icon']"),
    ).toBeInTheDocument();
    expect(
      document.querySelector("[data-testid='eye-icon']"),
    ).not.toBeInTheDocument();
  });

  it("clicking again changes input type from text → password", () => {
    const input = addInput("pw", "password");
    render(<PasswordToggle fieldId="pw" disabled={false} />);
    const button = screen.getByRole("button");

    fireEvent.click(button);
    fireEvent.click(button);

    expect(input.type).toBe("password");
  });

  it('after second click, accessible label returns to "Show password"', () => {
    addInput("pw");
    render(<PasswordToggle fieldId="pw" disabled={false} />);
    const button = screen.getByRole("button");

    fireEvent.click(button);
    fireEvent.click(button);

    expect(
      screen.getByRole("button", { name: "Show password" }),
    ).toBeInTheDocument();
  });

  it("after second click, icon switches back to EyeIcon", () => {
    addInput("pw");
    render(<PasswordToggle fieldId="pw" disabled={false} />);
    const button = screen.getByRole("button");

    fireEvent.click(button);
    fireEvent.click(button);

    expect(
      document.querySelector("[data-testid='eye-icon']"),
    ).toBeInTheDocument();
    expect(
      document.querySelector("[data-testid='eye-off-icon']"),
    ).not.toBeInTheDocument();
  });
});

// ─── Disabled Behavior ───────────────────────────────────────────────────────────────────

describe("Disabled Behavior", () => {
  it("button is disabled when disabled=true", () => {
    render(<PasswordToggle fieldId="pw" disabled={true} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("clicking disabled button does not change input type", () => {
    const input = addInput("pw", "password");
    render(<PasswordToggle fieldId="pw" disabled={true} />);

    fireEvent.click(screen.getByRole("button"));

    expect(input.type).toBe("password");
  });

  it("clicking disabled button does not change label/icon/state", () => {
    addInput("pw");
    render(<PasswordToggle fieldId="pw" disabled={true} />);

    fireEvent.click(screen.getByRole("button"));

    expect(
      screen.getByRole("button", { name: "Show password" }),
    ).toBeInTheDocument();
    expect(
      document.querySelector("[data-testid='eye-icon']"),
    ).toBeInTheDocument();
    expect(
      document.querySelector("[data-testid='eye-off-icon']"),
    ).not.toBeInTheDocument();
  });
});

// ─── Edge Cases ───────────────────────────────────────────────────────────────────

describe("Edge Cases", () => {
  it("if no element exists with matching fieldId, clicking does not throw", () => {
    render(<PasswordToggle fieldId="nonexistent" disabled={false} />);
    expect(() => fireEvent.click(screen.getByRole("button"))).not.toThrow();
  });

  it("if no element exists with matching fieldId, visible state does not change", () => {
    render(<PasswordToggle fieldId="nonexistent" disabled={false} />);

    fireEvent.click(screen.getByRole("button"));

    expect(
      screen.getByRole("button", { name: "Show password" }),
    ).toBeInTheDocument();
    expect(
      document.querySelector("[data-testid='eye-icon']"),
    ).toBeInTheDocument();
  });

  it(
    "if target element exists but is already type=text, toggle still follows " +
      "component logic consistently on click sequence",
    () => {
      const input = addInput("pw", "text");
      render(<PasswordToggle fieldId="pw" disabled={false} />);
      const button = screen.getByRole("button");

      fireEvent.click(button);
      expect(input.type).toBe("text");
      expect(
        screen.getByRole("button", { name: "Hide password" }),
      ).toBeInTheDocument();

      fireEvent.click(button);
      expect(input.type).toBe("password");
      expect(
        screen.getByRole("button", { name: "Show password" }),
      ).toBeInTheDocument();
    },
  );
});
