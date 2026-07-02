import { render, screen } from "@testing-library/react";
import { LoadingOverlay } from "./LoadingOverlay";
import { describe, expect, it } from "vitest";

describe("LoadingOverlay", () => {
    it("renders with the default message", () => {
        render(<LoadingOverlay />);
        expect(screen.getByText("Loading…")).toBeInTheDocument();
    });

    it("renders with a custom message", () => {
        render(<LoadingOverlay message="Fetching data..." />);
        expect(screen.getByText("Fetching data...")).toBeInTheDocument();
        expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
    });

    it("renders the spinner svg", () => {
        const { container } = render(<LoadingOverlay />);
        const svg = container.querySelector("svg");
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveClass("animate-spin");
    });

    it("renders a full-screen overlay container", () => {
        const { container } = render(<LoadingOverlay />);
        const overlay = container.firstChild as HTMLElement;
        expect(overlay).toHaveClass("fixed");
        expect(overlay).toHaveClass("inset-0");
        expect(overlay).toHaveClass("z-50");
    });
});