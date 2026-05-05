import { render, screen } from "@testing-library/react";
import { Underline } from "./Underline";

describe("Underline", () => {
    it("renders children", () => {
        render(<Underline>Text</Underline>);

        expect(screen.getByText("Text")).toBeInTheDocument();
    });

    it("renders underline element", () => {
        const { container } = render(<Underline>Text</Underline>);

        const spans = container.querySelectorAll("span");

        expect(spans.length).toBe(2);
    });

    it("wraps children inside parent span", () => {
        const { container } = render(<Underline>Text</Underline>);

        const parent = container.firstChild as HTMLElement;

        expect(parent.tagName).toBe("SPAN");
        expect(parent).toContainElement(screen.getByText("Text"));
    });
});