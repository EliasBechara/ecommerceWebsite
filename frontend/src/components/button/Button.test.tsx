/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";
import { vi } from "vitest";

vi.mock("./Underline", () => ({
    Underline: ({ children }: any) => (
        <span data-testid="underline">{children}</span>
    ),
}));

describe("Button", () => {
    it("renders children", () => {
        render(<Button>Click me</Button>);

        expect(screen.getByText("Click me")).toBeInTheDocument();
    });

    it("uses underline by default for text variant", () => {
        render(<Button variant="text">Text Btn</Button>);

        expect(screen.getByTestId("underline")).toBeInTheDocument();
    });

    it("uses underline by default for sidebar variant", () => {
        render(<Button variant="sidebar">Sidebar Btn</Button>);

        expect(screen.getByTestId("underline")).toBeInTheDocument();
    });

    it("does NOT use underline for other variants by default", () => {
        render(<Button variant="outline">Outline Btn</Button>);

        expect(screen.queryByTestId("underline")).not.toBeInTheDocument();
    });

    it("respects underline={true}", () => {
        render(
            <Button variant="outline" underline={true}>
                Force Underline
            </Button>
        );

        expect(screen.getByTestId("underline")).toBeInTheDocument();
    });

    it("respects underline={false}", () => {
        render(
            <Button variant="text" underline={false}>
                No Underline
            </Button>
        );

        expect(screen.queryByTestId("underline")).not.toBeInTheDocument();
    });

    it("calls onClick when clicked", () => {
        const handleClick = vi.fn();

        render(<Button onClick={handleClick}>Click</Button>);

        fireEvent.click(screen.getByRole("button"));

        expect(handleClick).toHaveBeenCalled();
    });

    it("applies correct variant class", () => {
        render(<Button variant="outline">Outline</Button>);

        const btn = screen.getByRole("button");

        expect(btn.className).toContain("border");
    });
});