import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";
import { describe, expect, it, vi } from "vitest";

vi.mock("./Underline", () => ({
    Underline: ({ children }: { children: React.ReactNode }) => (
        <span data-testid="underline">{children}</span>
    ),
}));

describe("Button", () => {
    describe("rendering", () => {
        it("renders children", () => {
            render(<Button>Click me</Button>);
            expect(screen.getByText("Click me")).toBeInTheDocument();
        });

        it("renders a button element", () => {
            render(<Button>Click</Button>);
            expect(screen.getByRole("button")).toBeInTheDocument();
        });
    });

    describe("underline behavior", () => {
        it.each(["text", "sidebar"] as const)(
            "wraps children in Underline for '%s' variant by default",
            (variant) => {
                render(<Button variant={variant}>Label</Button>);
                expect(screen.getByTestId("underline")).toBeInTheDocument();
            }
        );

        it.each(["outline", "icon", "overlay", "addToCartBig", "addToCartSmall", "profileSettings", "selectChip", "actionText", "dangerText"] as const)(
            "does not wrap children in Underline for '%s' variant by default",
            (variant) => {
                render(<Button variant={variant}>Label</Button>);
                expect(screen.queryByTestId("underline")).not.toBeInTheDocument();
            }
        );

        it("forces underline on a non-underline variant when underline={true}", () => {
            render(<Button variant="outline" underline>Label</Button>);
            expect(screen.getByTestId("underline")).toBeInTheDocument();
        });

        it("suppresses underline on a underline variant when underline={false}", () => {
            render(<Button variant="text" underline={false}>Label</Button>);
            expect(screen.queryByTestId("underline")).not.toBeInTheDocument();
        });

        it("defaults to text variant and uses underline when no variant is passed", () => {
            render(<Button>Label</Button>);
            expect(screen.getByTestId("underline")).toBeInTheDocument();
        });
    });

    describe("interactions", () => {
        it("calls onClick when clicked", () => {
            const handleClick = vi.fn();
            render(<Button onClick={handleClick}>Click</Button>);
            fireEvent.click(screen.getByRole("button"));
            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it("does not call onClick when disabled", () => {
            const handleClick = vi.fn();
            render(<Button disabled onClick={handleClick}>Click</Button>);
            fireEvent.click(screen.getByRole("button"));
            expect(handleClick).not.toHaveBeenCalled();
        });

        it("forwards extra html attributes to the button element", () => {
            render(<Button aria-label="close" type="submit">X</Button>);
            const btn = screen.getByRole("button");
            expect(btn).toHaveAttribute("aria-label", "close");
            expect(btn).toHaveAttribute("type", "submit");
        });
    });

    describe("className / variants", () => {
        it("applies a custom className alongside variant classes", () => {
            render(<Button className="custom-class">Label</Button>);
            expect(screen.getByRole("button").className).toContain("custom-class");
        });

        it.each([
            ["text", "relative"],
            ["outline", "border"],
            ["icon", "rounded-full"],
            ["sidebar", "tracking-[1.4px]"],
            ["overlay", "group-hover:opacity-100"],
            ["addToCartBig", "overflow-hidden"],
            ["addToCartSmall", "scale-95"],
            ["profileSettings", "rounded-lg"],
            ["selectChip", "rounded-lg"],
            ["actionText", "text-zinc-500"],
            ["dangerText", "text-red-400"],
        ] as const)(
            "applies a distinctive class for '%s' variant",
            (variant, expectedClass) => {
                render(<Button variant={variant}>Label</Button>);
                expect(screen.getByRole("button").className).toContain(expectedClass);
            }
        );
    });
});